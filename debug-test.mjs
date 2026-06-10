#!/usr/bin/env node
/**
 * Debug script - directly try to insert into Service and StaffMember to see the real error
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

// Load .env
const envContent = readFileSync('/home/nadir/projects/Planity.ma/.env', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
}

const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Check what columns Service table has by trying different inserts
  console.log('=== Testing Service insert with bufferTime ===');
  const { data: d1, error: e1 } = await supabaseAdmin
    .from('Service')
    .insert({
      id: randomUUID(),
      salonId: '00000000-0000-0000-0000-000000000000',
      name: 'test',
      price: 50,
      duration: 30,
      bufferTime: 0,
      isOnlineBookable: true,
      isActive: true,
      order: 0,
    })
    .select()
    .single();
  
  if (e1) {
    console.log('Error with bufferTime:', JSON.stringify(e1, null, 2));
  } else {
    console.log('Success with bufferTime:', d1);
    // Clean up
    await supabaseAdmin.from('Service').delete().eq('id', d1.id);
  }
  
  console.log('\n=== Testing Service insert WITHOUT bufferTime ===');
  const { data: d2, error: e2 } = await supabaseAdmin
    .from('Service')
    .insert({
      id: randomUUID(),
      salonId: '00000000-0000-0000-0000-000000000000',
      name: 'test',
      price: 50,
      duration: 30,
      isOnlineBookable: true,
      isActive: true,
      order: 0,
    })
    .select()
    .single();
  
  if (e2) {
    console.log('Error without bufferTime:', JSON.stringify(e2, null, 2));
  } else {
    console.log('Success without bufferTime:', d2);
    await supabaseAdmin.from('Service').delete().eq('id', d2.id);
  }

  // Check StaffMember table
  console.log('\n=== Testing StaffMember insert ===');
  const { data: d3, error: e3 } = await supabaseAdmin
    .from('StaffMember')
    .insert({
      id: randomUUID(),
      salonId: '00000000-0000-0000-0000-000000000000',
      displayName: 'test',
      color: '#3B82F6',
      isActive: true,
      order: 0,
    })
    .select()
    .single();
  
  if (e3) {
    console.log('StaffMember error:', JSON.stringify(e3, null, 2));
  } else {
    console.log('StaffMember success:', d3);
    await supabaseAdmin.from('StaffMember').delete().eq('id', d3.id);
  }

  // Check Booking table columns
  console.log('\n=== Testing Booking insert (to find required columns) ===');
  const { data: d4, error: e4 } = await supabaseAdmin
    .from('Booking')
    .insert({
      id: randomUUID(),
      salonId: '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      status: 'CONFIRMED',
      totalPrice: 50,
    })
    .select()
    .single();
  
  if (e4) {
    console.log('Booking error:', JSON.stringify(e4, null, 2));
  } else {
    console.log('Booking success:', d4);
    await supabaseAdmin.from('Booking').delete().eq('id', d4.id);
  }

  // Now let's do a full end-to-end test via the API to see the actual 500 error
  console.log('\n=== Testing POST /api/v1/pro/services via API ===');
  
  // Register and login first
  const testEmail = `debug-test-${Date.now()}@test-planity.com`;
  
  const regResp = await fetch('https://planity-ma.vercel.app/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Debug',
      lastName: 'Test',
      email: testEmail,
      password: 'TestPassword123!',
      role: 'PRO_OWNER',
    }),
  });
  
  const regData = await regResp.json();
  const testUserId = regData.user?.id;
  console.log('Registered:', testUserId);
  
  // Get cookies from registration response
  const setCookies = regResp.headers.getSetCookie?.() || [];
  let cookieStr = setCookies.map(c => c.split(';')[0]).join('; ');
  
  // Also login to get fresh cookies
  const loginResp = await fetch('https://planity-ma.vercel.app/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'TestPassword123!' }),
  });
  
  const loginData = await loginResp.json();
  const loginCookies = loginResp.headers.getSetCookie?.() || [];
  cookieStr = loginCookies.map(c => c.split(';')[0]).join('; ');
  console.log('Logged in, cookies:', cookieStr.length, 'chars');
  
  // Create a salon
  const testSalonId = randomUUID();
  const { error: salonErr } = await supabaseAdmin
    .from('Salon')
    .insert({
      id: testSalonId,
      name: 'Debug Test Salon',
      slug: `debug-test-${Date.now()}`,
      category: 'COIFFURE',
      address: '123 Debug Street',
      city: 'Casablanca',
      phone: '+212600000000',
      ownerId: testUserId,
      isActive: true,
    });
  
  if (salonErr) {
    console.log('Salon creation error:', salonErr.message);
  } else {
    console.log('Salon created:', testSalonId);
  }
  
  // Now try POST /api/v1/pro/services
  const svcResp = await fetch('https://planity-ma.vercel.app/api/v1/pro/services', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieStr,
      'Authorization': `Bearer ${loginData.session?.access_token}`,
    },
    body: JSON.stringify({
      name: 'Test Service Debug',
      price: 50,
      duration: 30,
      description: 'Debug test service',
    }),
  });
  
  const svcData = await svcResp.json();
  console.log('\nPOST /api/v1/pro/services response:', svcResp.status, JSON.stringify(svcData, null, 2));
  
  // Now try POST /api/v1/pro/staff
  const staffResp = await fetch('https://planity-ma.vercel.app/api/v1/pro/staff', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieStr,
      'Authorization': `Bearer ${loginData.session?.access_token}`,
    },
    body: JSON.stringify({
      displayName: 'Test Staff Debug',
      title: 'Barber',
      color: '#10B981',
    }),
  });
  
  const staffData = await staffResp.json();
  console.log('\nPOST /api/v1/pro/staff response:', staffResp.status, JSON.stringify(staffData, null, 2));
  
  // Cleanup
  if (testUserId) {
    await supabaseAdmin.auth.admin.deleteUser(testUserId).catch(() => {});
    await supabaseAdmin.from('User').delete().eq('id', testUserId).catch(() => {});
  }
}

main().catch(console.error);
