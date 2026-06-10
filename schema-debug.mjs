#!/usr/bin/env node
/**
 * Debug the exact Supabase error for Service and StaffMember inserts
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

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
  // Create a test user and salon first
  const testEmail = `schema-debug-${Date.now()}@test-planity.com`;
  
  const { data: authData } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: { firstName: 'Schema', lastName: 'Debug', role: 'PRO_OWNER' },
  });
  
  const userId = authData.user.id;
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash('TestPassword123!', 12);
  
  await supabaseAdmin.from('User').insert({
    id: userId, email: testEmail, firstName: 'Schema', lastName: 'Debug',
    name: 'Schema Debug', passwordHash, role: 'PRO_OWNER', locale: 'FR', isActive: true,
    updatedAt: new Date().toISOString(),
  });
  
  const salonId = randomUUID();
  await supabaseAdmin.from('Salon').insert({
    id: salonId, name: 'Schema Debug Salon', slug: `schema-debug-${Date.now()}`,
    category: 'COIFFURE', address: '123 Debug', city: 'Casablanca',
    phone: '+212****0000', ownerId: userId, isActive: true,
  });
  
  console.log('Test setup done. userId:', userId, 'salonId:', salonId);
  
  // Test 1: Service insert WITHOUT slug
  console.log('\n=== Test 1: Service insert WITHOUT slug ===');
  const { data: svc1, error: err1 } = await supabaseAdmin
    .from('Service')
    .insert({
      id: randomUUID(),
      salonId,
      name: 'Test Service',
      price: 50,
      duration: 30,
      isOnlineBookable: true,
      isActive: true,
      bufferTime: 0,
      order: 0,
    })
    .select()
    .single();
  
  if (err1) {
    console.log('ERROR:', JSON.stringify(err1, null, 2));
  } else {
    console.log('SUCCESS:', svc1.id);
    await supabaseAdmin.from('Service').delete().eq('id', svc1.id);
  }
  
  // Test 2: Service insert WITH slug
  console.log('\n=== Test 2: Service insert WITH slug ===');
  const { data: svc2, error: err2 } = await supabaseAdmin
    .from('Service')
    .insert({
      id: randomUUID(),
      salonId,
      name: 'Test Service 2',
      slug: 'test-service-2',
      price: 50,
      duration: 30,
      isOnlineBookable: true,
      isActive: true,
      bufferTime: 0,
      order: 0,
    })
    .select()
    .single();
  
  if (err2) {
    console.log('ERROR:', JSON.stringify(err2, null, 2));
  } else {
    console.log('SUCCESS:', svc2.id);
    await supabaseAdmin.from('Service').delete().eq('id', svc2.id);
  }
  
  // Test 3: StaffMember insert
  console.log('\n=== Test 3: StaffMember insert (basic) ===');
  const { data: staff1, error: err3 } = await supabaseAdmin
    .from('StaffMember')
    .insert({
      id: randomUUID(),
      salonId,
      displayName: 'Test Staff',
      color: '#3B82F6',
      isActive: true,
      order: 0,
    })
    .select()
    .single();
  
  if (err3) {
    console.log('ERROR:', JSON.stringify(err3, null, 2));
  } else {
    console.log('SUCCESS:', staff1.id);
    await supabaseAdmin.from('StaffMember').delete().eq('id', staff1.id);
  }
  
  // Cleanup
  await supabaseAdmin.from('Salon').delete().eq('id', salonId);
  await supabaseAdmin.from('User').delete().eq('id', userId);
  await supabaseAdmin.auth.admin.deleteUser(userId);
  console.log('\nCleanup done');
}

main().catch(console.error);
