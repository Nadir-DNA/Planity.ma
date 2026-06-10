#!/usr/bin/env node
/**
 * Comprehensive API test for Planity.ma PRO_OWNER features
 * Tests: register, login, create test data, then test all PRO endpoints
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env
const envContent = readFileSync('/home/nadir/projects/Planity.ma/.env', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
}

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE_URL = 'https://planity-ma.vercel.app';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TEST_EMAIL = `test-pro-${Date.now()}@test-planity.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = { firstName: 'TestPro', lastName: 'Owner' };

let userId = null;
let salonId = null;
let accessToken = null;
let refreshToken = null;
let cookies = '';
let staffId = null;
let serviceId = null;

const results = [];

function log(test, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const msg = `${icon} [${status}] ${test}${detail ? ': ' + detail : ''}`;
  console.log(msg);
  results.push({ test, status, detail });
}

async function apiCall(method, path, body = null, extraHeaders = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (cookies) {
    headers['Cookie'] = cookies;
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const opts = { method, headers };
  if (body && method !== 'GET') {
    opts.body = JSON.stringify(body);
  }
  
  const resp = await fetch(url, opts);
  
  // Capture set-cookie headers
  const setCookies = resp.headers.getSetCookie?.() || [];
  for (const sc of setCookies) {
    const parts = sc.split(';')[0];
    const [name, ...vals] = parts.split('=');
    const val = vals.join('=');
    // Update or add cookie
    const cookiePairs = cookies ? cookies.split('; ').filter(c => !c.startsWith(name + '=')) : [];
    cookiePairs.push(`${name}=${val}`);
    cookies = cookiePairs.join('; ');
  }
  
  let data = null;
  try {
    data = await resp.json();
  } catch {}
  
  return { status: resp.status, data, headers: resp.headers };
}

// ============================================================
// STEP 1: Register a PRO_OWNER user
// ============================================================
async function step1_register() {
  console.log('\n📝 STEP 1: Register PRO_OWNER user');
  const resp = await apiCall('POST', '/api/v1/auth/register', {
    firstName: TEST_NAME.firstName,
    lastName: TEST_NAME.lastName,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    phone: '+212600000001',
    role: 'PRO_OWNER',
  });
  
  if (resp.status === 201 || resp.status === 200) {
    userId = resp.data?.user?.id;
    log('Register PRO_OWNER', 'PASS', `userId=${userId}`);
  } else {
    log('Register PRO_OWNER', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    return false;
  }
  return true;
}

// ============================================================
// STEP 2: Login to get session cookies
// ============================================================
async function step2_login() {
  console.log('\n🔐 STEP 2: Login');
  cookies = ''; // reset cookies for login
  const resp = await apiCall('POST', '/api/v1/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  
  if (resp.status === 200 && resp.data?.user) {
    userId = resp.data.user.id;
    accessToken = resp.data?.session?.access_token;
    refreshToken = resp.data?.session?.refresh_token;
    log('Login', 'PASS', `userId=${userId}, cookies=${cookies.length} chars, token=${accessToken ? 'yes' : 'no'}`);
  } else {
    log('Login', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    return false;
  }
  return true;
}

// ============================================================
// STEP 3: Create test data in Supabase (Salon, Staff, Services)
// ============================================================
async function step3_createTestData() {
  console.log('\n🏗️ STEP 3: Create test data in Supabase');
  
  // Generate unique IDs
  const { randomUUID } = await import('crypto');
  
  // Create Salon
  const testSalonId = randomUUID();
  const { data: salon, error: salonError } = await supabaseAdmin
    .from('Salon')
    .insert({
      id: testSalonId,
      name: 'Test Salon Pro',
      slug: `test-salon-pro-${Date.now()}`,
      category: 'COIFFURE',
      address: '123 Test Street',
      city: 'Casablanca',
      postalCode: '20000',
      phone: '+212600000002',
      email: 'salon@test-planity.com',
      description: 'Test salon for API testing',
      ownerId: userId,
      isActive: true,
    })
    .select('*')
    .single();
  
  if (salonError) {
    log('Create Salon', 'FAIL', salonError.message);
    return false;
  }
  salonId = salon.id;
  log('Create Salon', 'PASS', `salonId=${salonId}`);
  
  // Create Staff Member
  const testStaffId = randomUUID();
  const { data: staff, error: staffError } = await supabaseAdmin
    .from('StaffMember')
    .insert({
      id: testStaffId,
      salonId,
      displayName: 'Staff Test',
      title: 'Stylist',
      color: '#3B82F6',
      isActive: true,
      order: 0,
    })
    .select('*')
    .single();
  
  if (staffError) {
    log('Create Staff', 'FAIL', staffError.message);
    return false;
  }
  staffId = staff.id;
  log('Create Staff', 'PASS', `staffId=${staffId}`);
  
  // Create Staff Schedule
  const { error: schedError } = await supabaseAdmin
    .from('StaffSchedule')
    .insert([
      { id: randomUUID(), staffId, dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isWorking: true },
      { id: randomUUID(), staffId, dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isWorking: true },
      { id: randomUUID(), staffId, dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isWorking: true },
      { id: randomUUID(), staffId, dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isWorking: true },
      { id: randomUUID(), staffId, dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isWorking: true },
    ]);
  
  if (schedError) {
    log('Create StaffSchedule', 'WARN', schedError.message);
  } else {
    log('Create StaffSchedule', 'PASS');
  }
  
  // Create Service
  const testServiceId = randomUUID();
  const { data: service, error: svcError } = await supabaseAdmin
    .from('Service')
    .insert({
      id: testServiceId,
      salonId,
      name: 'Coupe Homme',
      price: 50,
      duration: 30,
      description: 'Standard haircut',
      isActive: true,
      isOnlineBookable: true,
      order: 0,
    })
    .select('*')
    .single();
  
  if (svcError) {
    log('Create Service', 'FAIL', svcError.message);
    return false;
  }
  serviceId = service.id;
  log('Create Service', 'PASS', `serviceId=${serviceId}`);
  
  // Create StaffService link
  const { error: linkError } = await supabaseAdmin
    .from('StaffService')
    .insert({ id: randomUUID(), staffId, serviceId });
  
  if (linkError) {
    log('Create StaffService link', 'WARN', linkError.message);
  } else {
    log('Create StaffService link', 'PASS');
  }
  
  // Create a test booking
  const { randomUUID: uuid2 } = await import('crypto');
  const testBookingId = randomUUID();
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const endTime = new Date(tomorrow);
  endTime.setMinutes(endTime.getMinutes() + 30);
  
  const { data: booking, error: bookError } = await supabaseAdmin
    .from('Booking')
    .insert({
      id: testBookingId,
      salonId,
      userId,
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      status: 'CONFIRMED',
      totalPrice: 50,
      notes: 'Test booking',
    })
    .select('*')
    .single();
  
  if (bookError) {
    log('Create Booking', 'WARN', bookError.message);
  } else {
    log('Create Booking', 'PASS', `bookingId=${booking.id}`);
    
    // Create BookingItem
    const { error: itemError } = await supabaseAdmin
      .from('BookingItem')
      .insert({
        id: randomUUID(),
        bookingId: booking.id,
        serviceId,
        staffId,
        price: 50,
        duration: 30,
      });
    
    if (itemError) {
      log('Create BookingItem', 'WARN', itemError.message);
    } else {
      log('Create BookingItem', 'PASS');
    }
  }
  
  return true;
}

// ============================================================
// STEP 4: Test API endpoints
// ============================================================
async function step4_testEndpoints() {
  console.log('\n🧪 STEP 4: Test PRO API Endpoints');
  
  // Test 4a: GET /api/v1/pro/services
  {
    const resp = await apiCall('GET', '/api/v1/pro/services');
    if (resp.status === 200 && Array.isArray(resp.data?.services)) {
      log('GET /api/v1/pro/services', 'PASS', `${resp.data.services.length} services returned`);
    } else {
      log('GET /api/v1/pro/services', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    }
  }
  
  // Test 4b: POST /api/v1/pro/services (create new service)
  {
    const resp = await apiCall('POST', '/api/v1/pro/services', {
      name: 'Nouveau Service Test',
      price: 80,
      duration: 45,
      description: 'Service created via API test',
      isOnlineBookable: true,
      isActive: true,
    });
    if (resp.status === 201 && resp.data?.service) {
      log('POST /api/v1/pro/services', 'PASS', `created service id=${resp.data.service.id}`);
    } else {
      log('POST /api/v1/pro/services', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    }
  }
  
  // Test 4c: GET /api/v1/pro/staff
  {
    const resp = await apiCall('GET', '/api/v1/pro/staff');
    if (resp.status === 200 && Array.isArray(resp.data?.staff)) {
      log('GET /api/v1/pro/staff', 'PASS', `${resp.data.staff.length} staff returned`);
    } else {
      log('GET /api/v1/pro/staff', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    }
  }
  
  // Test 4d: POST /api/v1/pro/staff (add team member)
  {
    const resp = await apiCall('POST', '/api/v1/pro/staff', {
      displayName: 'Nouveau Membre Test',
      title: 'Barber',
      color: '#10B981',
      isActive: true,
      schedules: [
        { dayOfWeek: 0, startTime: '10:00', endTime: '19:00', isWorking: true },
        { dayOfWeek: 1, startTime: '10:00', endTime: '19:00', isWorking: true },
      ],
    });
    if (resp.status === 201 && resp.data?.staff) {
      log('POST /api/v1/pro/staff', 'PASS', `created staff id=${resp.data.staff.id}`);
    } else {
      log('POST /api/v1/pro/staff', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    }
  }
  
  // Test 4e: GET /api/v1/pro/stats
  {
    const resp = await apiCall('GET', '/api/v1/pro/stats');
    if (resp.status === 200 && resp.data?.totalBookings !== undefined) {
      log('GET /api/v1/pro/stats', 'PASS', `stats=${JSON.stringify(resp.data)}`);
    } else {
      log('GET /api/v1/pro/stats', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    }
  }
  
  // Test 4f: GET /api/v1/pro/bookings
  {
    const resp = await apiCall('GET', '/api/v1/pro/bookings');
    if (resp.status === 200 && Array.isArray(resp.data?.bookings)) {
      log('GET /api/v1/pro/bookings', 'PASS', `${resp.data.bookings.length} bookings returned`);
    } else {
      log('GET /api/v1/pro/bookings', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    }
  }
}

// ============================================================
// STEP 5: Test with Bearer token (alternative auth)
// ============================================================
async function step5_testBearerToken() {
  console.log('\n🔑 STEP 5: Test with Bearer token auth');
  
  // Reset cookies, use token only
  const savedCookies = cookies;
  cookies = '';
  
  const headers = { 'Authorization': `Bearer ${accessToken}` };
  
  {
    const resp = await apiCall('GET', '/api/v1/pro/services', null, headers);
    if (resp.status === 200) {
      log('GET services (Bearer)', 'PASS');
    } else {
      log('GET services (Bearer)', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    }
  }
  
  {
    const resp = await apiCall('GET', '/api/v1/pro/stats', null, headers);
    if (resp.status === 200) {
      log('GET stats (Bearer)', 'PASS');
    } else {
      log('GET stats (Bearer)', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
    }
  }
  
  // Restore cookies
  cookies = savedCookies;
}

// ============================================================
// STEP 6: Verify session endpoint
// ============================================================
async function step6_testSession() {
  console.log('\n🔄 STEP 6: Test session endpoint');
  
  const resp = await apiCall('GET', '/api/v1/auth/session');
  if (resp.status === 200 && resp.data?.user) {
    log('GET /api/v1/auth/session', 'PASS', `user=${resp.data.user.email}, role=${resp.data.user.role}`);
  } else {
    log('GET /api/v1/auth/session', 'FAIL', `status=${resp.status} body=${JSON.stringify(resp.data)}`);
  }
}

// ============================================================
// CLEANUP
// ============================================================
async function cleanup() {
  console.log('\n🧹 CLEANUP: Deleting test data');
  
  if (userId) {
    // Delete from Supabase Auth
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      log('Cleanup: Delete auth user', 'PASS');
    } catch (e) {
      log('Cleanup: Delete auth user', 'WARN', e.message);
    }
    
    // Delete from User table (cascade should handle salon etc)
    try {
      const { error } = await supabaseAdmin.from('User').delete().eq('id', userId);
      if (error) throw error;
      log('Cleanup: Delete User row', 'PASS');
    } catch (e) {
      log('Cleanup: Delete User row', 'WARN', e.message);
    }
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🚀 Planity.ma API Comprehensive Test');
  console.log(`📧 Test email: ${TEST_EMAIL}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(60));
  
  try {
    if (!await step1_register()) { await cleanup(); printSummary(); return; }
    if (!await step2_login()) { await cleanup(); printSummary(); return; }
    if (!await step3_createTestData()) { await cleanup(); printSummary(); return; }
    await step4_testEndpoints();
    await step5_testBearerToken();
    await step6_testSession();
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  } finally {
    await cleanup();
    printSummary();
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Warnings: ${warned}`);
  console.log(`📝 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILURES:');
    for (const r of results.filter(r => r.status === 'FAIL')) {
      console.log(`  - ${r.test}: ${r.detail}`);
    }
  }
}

main();
