/**
 * E2E test script for booking API
 * Reads env vars directly from .env file, creates test data via Supabase REST API,
 * then logs in and tests the booking CRUD flow.
 */
import fs from 'fs';
import https from 'https';
import http from 'http';

// Parse .env file
const envContent = fs.readFileSync('/home/nadir/projects/Planity.ma/.env', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([A-Z_]+)="?(.+?)"?$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
}

const SUPABASE_URL = envVars.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY = envVars.SUPABASE_ANON_KEY || '';
const BASE_URL = 'http://localhost:3456';

function makeRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };
    
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function supabaseRequest(table, method, data, queryParams = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${queryParams}`;
  const options = {
    method: method,
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : (method === 'PATCH' ? 'return=representation' : ''),
    },
  };
  
  return makeRequest(url, options, data);
}

async function apiRequest(path, method, body, cookies = '') {
  const url = `${BASE_URL}${path}`;
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookies ? { 'Cookie': cookies } : {}),
    },
  };
  return makeRequest(url, options, body);
}

function extractCookies(response) {
  const setCookies = response.headers['set-cookie'] || [];
  return setCookies.map(c => c.split(';')[0]).join('; ');
}

async function run() {
  const results = [];
  const log = (test, status, detail) => {
    const entry = { test, status, detail };
    results.push(entry);
    console.log(`[${status}] ${test}: ${detail}`);
  };

  // ============================================
  // STEP 0: Verify Supabase connectivity
  // ============================================
  console.log('\n=== STEP 0: Verify Supabase connectivity ===');
  
  const testUserEmail = `e2e_test_${Date.now()}@example.com`;
  const testUserPassword = 'Test123!';
  
  // Create a test user via Supabase Auth Admin API
  console.log('Creating test user via Supabase Auth...');
  
  // Sign up user via Supabase Auth
  const signupRes = await makeRequest(
    `${SUPABASE_URL}/auth/v1/signup`,
    {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify({ email: testUserEmail, password: testUserPassword })
  );
  
  console.log('Signup response status:', signupRes.status);
  let signupData;
  try { signupData = JSON.parse(signupRes.body); } catch(e) { signupData = signupRes.body; }
  
  let testUserId;
  if (signupRes.status === 200 || signupRes.status === 201) {
    testUserId = signupData.user?.id;
    console.log('Created user ID:', testUserId);
  } else {
    console.log('Signup response:', JSON.stringify(signupData).substring(0, 300));
  }

  // If signup didn't work, try admin create
  if (!testUserId) {
    console.log('Trying admin user creation...');
    const adminCreateRes = await makeRequest(
      `${SUPABASE_URL}/auth/v1/admin/users`,
      {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
      },
      JSON.stringify({ 
        email: testUserEmail, 
        password: testUserPassword,
        email_confirm: true,
      })
    );
    console.log('Admin create status:', adminCreateRes.status);
    try {
      const adminData = JSON.parse(adminCreateRes.body);
      testUserId = adminData.id || adminData.user?.id;
      console.log('Admin created user ID:', testUserId);
    } catch(e) {
      console.log('Admin create response:', adminCreateRes.body.substring(0, 300));
    }
  }

  // Create/update User row in public schema
  if (testUserId) {
    console.log('Creating User profile row...');
    const userUpsert = await supabaseRequest('User', 'POST', [
      {
        id: testUserId,
        email: testUserEmail,
        name: 'E2E Test User',
        firstName: 'E2E',
        lastName: 'Test',
        role: 'CONSUMER',
        locale: 'FR',
        passwordHash: '$2a$12$LQv3c1yqBo9SkvXS7QTJPOoZdyGZ0bOmFkFSJj5fR3SjG5OJBjMi',
      }
    ], '');
    console.log('User upsert status:', userUpsert.status);
  }

  // Create owner user
  const ownerEmail = `e2e_owner_${Date.now()}@example.com`;
  const ownerPassword = 'Owner123!';
  let ownerId;

  console.log('Creating owner user...');
  const ownerSignupRes = await makeRequest(
    `${SUPABASE_URL}/auth/v1/admin/users`,
    {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify({ 
      email: ownerEmail, 
      password: ownerPassword,
      email_confirm: true,
    })
  );
  
  try {
    const ownerData = JSON.parse(ownerSignupRes.body);
    ownerId = ownerData.id || ownerData.user?.id;
    console.log('Owner user ID:', ownerId);
  } catch(e) {
    console.log('Owner signup response:', ownerSignupRes.body.substring(0, 300));
  }

  if (ownerId) {
    await supabaseRequest('User', 'POST', [
      {
        id: ownerId,
        email: ownerEmail,
        name: 'E2E Test Owner',
        firstName: 'E2E',
        lastName: 'Owner',
        role: 'PRO_OWNER',
        locale: 'FR',
        passwordHash: '$2a$12$LQv3c1yqBo9SkvXS7QTJPOoZdyGZ0bOmFkFSJj5fR3SjG5OJBjMi',
      }
    ], '');
  }

  // Create a salon
  console.log('Creating test salon...');
  const salonRes = await supabaseRequest('Salon', 'POST', [
    {
      name: 'E2E Test Salon',
      slug: `e2e-test-salon-${Date.now()}`,
      description: 'Salon de test E2E',
      category: 'COIFFEUR',
      address: '123 Rue de Test',
      city: 'Casablanca',
      postalCode: '20000',
      phone: '+212666000000',
      email: `salon@test-${Date.now()}.ma`,
      isActive: true,
      isVerified: true,
      ownerId: ownerId,
    }
  ], '');
  
  let salonId;
  try {
    const salonData = JSON.parse(salonRes.body);
    salonId = Array.isArray(salonData) ? salonData[0]?.id : salonData.id;
    console.log('Salon ID:', salonId);
  } catch(e) {
    console.log('Salon creation response:', salonRes.body.substring(0, 300));
  }

  // Create services
  const serviceIds = [];
  if (salonId) {
    console.log('Creating test services...');
    const services = [
      { name: 'Coupe femme', price: 150, duration: 45, bufferTime: 15, salonId, order: 0 },
      { name: 'Coupe homme', price: 80, duration: 30, bufferTime: 10, salonId, order: 1 },
    ];
    
    for (const svc of services) {
      const svcRes = await supabaseRequest('Service', 'POST', [svc], '');
      try {
        const svcData = JSON.parse(svcRes.body);
        const svcId = Array.isArray(svcData) ? svcData[0]?.id : svcData.id;
        if (svcId) serviceIds.push({ id: svcId, ...svc });
      } catch(e) {
        console.log('Service creation error:', svcRes.body.substring(0, 200));
      }
    }
    console.log('Created services:', serviceIds.map(s => s.id));
  }

  // Create staff member
  let staffId;
  if (salonId) {
    console.log('Creating test staff...');
    const staffRes = await supabaseRequest('StaffMember', 'POST', [
      {
        salonId: salonId,
        displayName: 'E2E Test Staff',
        isActive: true,
        order: 0,
      }
    ], '');
    try {
      const staffData = JSON.parse(staffRes.body);
      staffId = Array.isArray(staffData) ? staffData[0]?.id : staffData.id;
      console.log('Staff ID:', staffId);
    } catch(e) {
      console.log('Staff creation error:', staffRes.body.substring(0, 200));
    }

    // Assign staff to services
    if (staffId) {
      for (const svc of serviceIds) {
        await supabaseRequest('StaffService', 'POST', [
          { staffId: staffId, serviceId: svc.id }
        ], '');
      }
    }
  }

  // ============================================
  // STEP 1: Login to get auth cookies
  // ============================================
  console.log('\n=== STEP 1: Login ===');
  
  const loginRes = await apiRequest('/api/v1/auth/login', 'POST', {
    email: testUserEmail,
    password: testUserPassword,
  });
  
  const loginCookies = extractCookies(loginRes);
  console.log('Login status:', loginRes.status);
  log('Login', loginRes.status === 200 ? 'PASS' : 'FAIL', 
    `Status: ${loginRes.status}, Cookies present: ${!!loginCookies}`);
  
  if (loginRes.status !== 200) {
    console.log('Login response:', loginRes.body.substring(0, 500));
    // Try to continue anyway
  }
  
  const authCookies = loginCookies;

  // ============================================
  // STEP 2: Create a booking (POST)
  // ============================================
  console.log('\n=== STEP 2: Create Booking (POST /api/v1/bookings) ===');
  
  // Future date: 7 days from now
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const dateStr = futureDate.toISOString().split('T')[0];
  const timeStr = '10:00';
  
  const createBookingBody = {
    salonId: salonId,
    services: serviceIds.map(s => ({ serviceId: s.id, staffId: staffId })),
    date: dateStr,
    time: timeStr,
    notes: 'E2E test booking',
  };
  
  const createRes = await apiRequest('/api/v1/bookings', 'POST', createBookingBody, authCookies);
  console.log('Create booking status:', createRes.status);
  
  let bookingId;
  let createdBooking;
  try {
    createdBooking = JSON.parse(createRes.body);
    bookingId = createdBooking?.booking?.id;
    console.log('Created booking ID:', bookingId);
    console.log('Created booking status:', createdBooking?.booking?.status);
  } catch(e) {
    console.log('Create booking response:', createRes.body.substring(0, 500));
  }
  
  log('Create Booking', 
    createRes.status === 201 ? 'PASS' : (createRes.status === 200 ? 'PASS' : 'FAIL'),
    `Status: ${createRes.status}, Booking ID: ${bookingId || 'N/A'}, Response: ${createRes.body.substring(0, 200)}`);

  // ============================================
  // STEP 3: Reschedule booking (PUT)
  // ============================================
  console.log('\n=== STEP 3: Reschedule Booking (PUT /api/v1/bookings/:id) ===');
  
  if (bookingId) {
    // Reschedule to 8 days from now, same duration
    const newStartTime = new Date(futureDate);
    newStartTime.setDate(newStartTime.getDate() + 1);
    newStartTime.setHours(11, 0, 0, 0);
    const newEndTime = new Date(newStartTime.getTime() + 75 * 60000); // duration = 45+30=75min
    
    const rescheduleBody = {
      startTime: newStartTime.toISOString(),
      endTime: newEndTime.toISOString(),
    };
    
    console.log('Rescheduling to:', newStartTime.toISOString(), '-', newEndTime.toISOString());
    
    const rescheduleRes = await apiRequest(`/api/v1/bookings/${bookingId}`, 'PUT', rescheduleBody, authCookies);
    console.log('Reschedule status:', rescheduleRes.status);
    
    let rescheduleData;
    try {
      rescheduleData = JSON.parse(rescheduleRes.body);
      console.log('Rescheduled booking status:', rescheduleData?.booking?.status);
    } catch(e) {
      console.log('Reschedule response:', rescheduleRes.body.substring(0, 500));
    }
    
    log('Reschedule Booking',
      rescheduleRes.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${rescheduleRes.status}, Response: ${rescheduleRes.body.substring(0, 200)}`);
  } else {
    log('Reschedule Booking', 'SKIP', 'No booking ID available');
  }

  // ============================================
  // STEP 4: Cancel booking (PATCH)
  // ============================================
  console.log('\n=== STEP 4: Cancel Booking (PATCH /api/v1/bookings/:id) ===');
  
  if (bookingId) {
    const cancelBody = {
      cancellationReason: 'E2E test cancellation',
    };
    
    const cancelRes = await apiRequest(`/api/v1/bookings/${bookingId}`, 'PATCH', cancelBody, authCookies);
    console.log('Cancel status:', cancelRes.status);
    
    let cancelData;
    try {
      cancelData = JSON.parse(cancelRes.body);
      console.log('Cancelled booking status:', cancelData?.booking?.status);
    } catch(e) {
      console.log('Cancel response:', cancelRes.body.substring(0, 500));
    }
    
    log('Cancel Booking',
      cancelRes.status === 200 ? 'PASS' : 'FAIL',
      `Status: ${cancelRes.status}, Response: ${cancelRes.body.substring(0, 200)}`);
  } else {
    log('Cancel Booking', 'SKIP', 'No booking ID available');
  }

  // ============================================
  // STEP 5: Edge case - Invalid staffId
  // ============================================
  console.log('\n=== STEP 5: Edge case - Invalid staffId ===');
  
  const invalidStaffBody = {
    salonId: salonId,
    services: [{ serviceId: serviceIds[0]?.id, staffId: '00000000-0000-0000-0000-000000000000' }],
    date: dateStr,
    time: '14:00',
  };
  
  const invalidStaffRes = await apiRequest('/api/v1/bookings', 'POST', invalidStaffBody, authCookies);
  console.log('Invalid staffId status:', invalidStaffRes.status);
  
  log('Edge Case: Invalid staffId',
    invalidStaffRes.status === 400 ? 'PASS' : 'FAIL',
    `Expected 400, got ${invalidStaffRes.status}. Response: ${invalidStaffRes.body.substring(0, 200)}`);

  // ============================================
  // STEP 6: Edge case - Booking for past date
  // ============================================
  console.log('\n=== STEP 6: Edge case - Booking for past date ===');
  
  const pastDate = '2020-01-01';
  const pastBookingBody = {
    salonId: salonId,
    services: serviceIds.map(s => ({ serviceId: s.id, staffId: staffId })),
    date: pastDate,
    time: '10:00',
  };
  
  const pastBookingRes = await apiRequest('/api/v1/bookings', 'POST', pastBookingBody, authCookies);
  console.log('Past date booking status:', pastBookingRes.status);
  
  // Note: The API doesn't seem to validate past dates from the code, so it might still create the booking
  log('Edge Case: Past date booking',
    pastBookingRes.status === 400 || pastBookingRes.status === 201 || pastBookingRes.status === 200 ? 'INFO' : 'FAIL',
    `Status: ${pastBookingRes.status}. Response: ${pastBookingRes.body.substring(0, 200)}. (API may not validate past dates)`);

  // ============================================
  // STEP 7: Edge case - Double-booking conflict
  // ============================================
  console.log('\n=== STEP 7: Edge case - Double-booking conflict ===');
  
  // Create first booking
  const conflictDate1 = new Date();
  conflictDate1.setDate(conflictDate1.getDate() + 5);
  const conflictDateStr = conflictDate1.toISOString().split('T')[0];
  
  const booking1Body = {
    salonId: salonId,
    services: [{ serviceId: serviceIds[0]?.id, staffId: staffId }],
    date: conflictDateStr,
    time: '10:00',
  };
  
  const booking1Res = await apiRequest('/api/v1/bookings', 'POST', booking1Body, authCookies);
  console.log('First booking status:', booking1Res.status);
  let booking1Id;
  try {
    booking1Id = JSON.parse(booking1Res.body)?.booking?.id;
  } catch(e) {}
  
  // Try to create second booking at same time with same staff
  const booking2Body = {
    salonId: salonId,
    services: [{ serviceId: serviceIds[1]?.id || serviceIds[0]?.id, staffId: staffId }],
    date: conflictDateStr,
    time: '10:00',
  };
  
  const booking2Res = await apiRequest('/api/v1/bookings', 'POST', booking2Body, authCookies);
  console.log('Double-booking status:', booking2Res.status);
  
  log('Edge Case: Double-booking conflict',
    booking2Res.status === 409 ? 'PASS' : (booking2Res.status === 201 || booking2Res.status === 200 ? 'FAIL' : 'INFO'),
    `Expected 409 conflict, got ${booking2Res.status}. Response: ${booking2Res.body.substring(0, 200)}`);

  // ============================================
  // STEP 8: Unauthenticated access
  // ============================================
  console.log('\n=== STEP 8: Edge case - Unauthenticated access ===');
  
  const unauthRes = await apiRequest('/api/v1/bookings', 'GET', null, '');
  console.log('Unauth GET status:', unauthRes.status);
  
  log('Edge Case: Unauthenticated GET',
    unauthRes.status === 401 ? 'PASS' : 'FAIL',
    `Expected 401, got ${unauthRes.status}. Response: ${unauthRes.body.substring(0, 200)}`);
  
  // ============================================
  // STEP 9: Cancel already-cancelled booking
  // ============================================
  console.log('\n=== STEP 9: Edge case - Cancel already-cancelled booking ===');
  
  if (bookingId) {
    const reCancelRes = await apiRequest(`/api/v1/bookings/${bookingId}`, 'PATCH', {
      cancellationReason: 'Second cancellation attempt',
    }, authCookies);
    console.log('Re-cancel status:', reCancelRes.status);
    
    log('Edge Case: Cancel already-cancelled booking',
      reCancelRes.status === 400 ? 'PASS' : 'FAIL',
      `Expected 400, got ${reCancelRes.status}. Response: ${reCancelRes.body.substring(0, 200)}`);
  } else {
    log('Edge Case: Cancel already-cancelled booking', 'SKIP', 'No booking ID available');
  }

  // ============================================
  // STEP 10: Reschedule a cancelled booking  
  // ============================================
  console.log('\n=== STEP 10: Edge case - Reschedule cancelled booking ===');
  
  if (bookingId) {
    const newStart = new Date(futureDate);
    newStart.setDate(newStart.getDate() + 2);
    newStart.setHours(12, 0, 0, 0);
    const newEnd = new Date(newStart.getTime() + 75 * 60000);
    
    const rescheduleCancelledRes = await apiRequest(`/api/v1/bookings/${bookingId}`, 'PUT', {
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
    }, authCookies);
    console.log('Reschedule cancelled booking status:', rescheduleCancelledRes.status);
    
    log('Edge Case: Reschedule cancelled booking',
      rescheduleCancelledRes.status === 400 ? 'PASS' : 'FAIL',
      `Expected 400, got ${rescheduleCancelledRes.status}. Response: ${rescheduleCancelledRes.body.substring(0, 200)}`);
  } else {
    log('Edge Case: Reschedule cancelled booking', 'SKIP', 'No booking ID available');
  }

  // ============================================
  // STEP 11: Missing required fields
  // ============================================
  console.log('\n=== STEP 11: Edge case - Missing required fields ===');
  
  const missingFieldsRes = await apiRequest('/api/v1/bookings', 'POST', {
    salonId: salonId,
    // Missing services, date, time
  }, authCookies);
  
  log('Edge Case: Missing required fields',
    missingFieldsRes.status === 400 ? 'PASS' : 'FAIL',
    `Expected 400, got ${missingFieldsRes.status}. Response: ${missingFieldsRes.body.substring(0, 200)}`);

  // ============================================
  // STEP 12: Non-existent booking ID
  // ============================================
  console.log('\n=== STEP 12: Edge case - Non-existent booking ID ===');
  
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const fakeRescheduleRes = await apiRequest(`/api/v1/bookings/${fakeId}`, 'PUT', {
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
  }, authCookies);
  
  log('Edge Case: Non-existent booking reschedule',
    fakeRescheduleRes.status === 404 || fakeRescheduleRes.status === 400 ? 'PASS' : 'FAIL',
    `Expected 404 or 400, got ${fakeRescheduleRes.status}. Response: ${fakeRescheduleRes.body.substring(0, 200)}`);
  
  const fakeCancelRes = await apiRequest(`/api/v1/bookings/${fakeId}`, 'PATCH', {
    cancellationReason: 'test',
  }, authCookies);
  
  log('Edge Case: Non-existent booking cancel',
    fakeCancelRes.status === 404 ? 'PASS' : 'FAIL',
    `Expected 404, got ${fakeCancelRes.status}. Response: ${fakeCancelRes.body.substring(0, 200)}`);

  // ============================================
  // Cleanup: Delete test data
  // ============================================
  console.log('\n=== Cleanup: Removing test data ===');
  
  // Delete test bookings
  if (booking1Id) {
    await supabaseRequest('BookingItem', 'DELETE', null, `?bookingId=eq.${booking1Id}`);
    await supabaseRequest('Booking', 'DELETE', null, `?id=eq.${booking1Id}`);
  }
  
  // Clean up in reverse order
  if (staffId) await supabaseRequest('StaffMember', 'DELETE', null, `?id=eq.${staffId}`);
  for (const svc of serviceIds) {
    await supabaseRequest('StaffService', 'DELETE', null, `?serviceId=eq.${svc.id}`);
    await supabaseRequest('Service', 'DELETE', null, `?id=eq.${svc.id}`);
  }
  if (salonId) await supabaseRequest('Salon', 'DELETE', null, `?id=eq.${salonId}`);
  if (ownerId) {
    await supabaseRequest('User', 'DELETE', null, `?id=eq.${ownerId}`);
    // Delete from auth
    await makeRequest(
      `${SUPABASE_URL}/auth/v1/admin/users/${ownerId}`,
      { method: 'DELETE', headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` } },
      null
    );
  }
  if (testUserId) {
    await supabaseRequest('User', 'DELETE', null, `?id=eq.${testUserId}`);
    await makeRequest(
      `${SUPABASE_URL}/auth/v1/admin/users/${testUserId}`,
      { method: 'DELETE', headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` } },
      null
    );
  }
  console.log('Cleanup complete.');

  // ============================================
  // Output results as JSON for report generation
  // ============================================
  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
}

run().catch(err => {
  console.error('E2E test error:', err);
  process.exit(1);
});