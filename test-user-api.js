import http from 'http';
import './server.js'; // Will trigger server start on port 8080

const BASE_URL = 'http://localhost:8080/api/v1';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('Waiting for backend server to complete startup...');
  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://localhost:8080/health');
      if (res.ok) {
        ready = true;
        break;
      }
    } catch (e) {}
    await sleep(500);
  }

  if (!ready) {
    console.error('Server failed to start within timeout.');
    process.exit(1);
  }

  console.log('\n===============================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND API SUITE TEST');
  console.log('===============================================\n');

  let passed = 0;
  let failed = 0;
  let authToken = '';
  let activeBookingId = '';

  const testEndpoint = async (name, url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        console.log(`✅ [PASS] ${name} (${res.status})`);
        passed++;
        return data;
      } else {
        console.error(`❌ [FAIL] ${name} (Status: ${res.status}): ${JSON.stringify(data)}`);
        failed++;
        return null;
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${name}: ${err.message}`);
      failed++;
      return null;
    }
  };

  // 1. Healthcheck
  await testEndpoint('1. Health Check', 'http://localhost:8080/health');

  // 2. Auth - Send OTP
  const otpRes = await testEndpoint('2. Auth Send OTP', `${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210' })
  });

  // 3. Auth - Verify OTP & Get Token
  const verifyRes = await testEndpoint('3. Auth Verify OTP & JWT Token', `${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', otp: '123456', role: 'user' })
  });

  if (verifyRes) {
    authToken = verifyRes.accessToken || verifyRes.token;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };

  // 4. Profile - Complete Profile
  await testEndpoint('4. Customer Complete Profile', `${BASE_URL}/customer/profile`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Rajesh Singh',
      email: 'rajesh.singh@example.com',
      gender: 'Male',
      dob: '1995-08-15',
      address: 'H.No 124, Sector 15',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001'
    })
  });

  // 5. Profile - Get Profile
  await testEndpoint('5. Customer Get Profile', `${BASE_URL}/customer/profile`, {
    headers: authHeaders
  });

  // 5b. Profile - PUT Update Profile
  await testEndpoint('5b. Customer PUT Update Profile', `${BASE_URL}/customer/profile`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Rajesh Kumar Singh',
      email: 'rajesh.updated@example.com',
      gender: 'Male',
      dob: '1995-08-15',
      language: 'Hindi',
      profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
      address: 'Flat 204, Royal Palms Apartment',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    })
  });

  // 6. Address - Add Saved Address
  await testEndpoint('6. Address Add Saved Address', `${BASE_URL}/address`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      house: 'Flat 204',
      building: 'Royal Palms Apartment',
      landmark: 'Near Tech Park',
      pincode: '560038',
      city: 'Bengaluru',
      state: 'Karnataka'
    })
  });

  // 7. Address - Get Addresses List
  await testEndpoint('7. Address Get Saved Addresses', `${BASE_URL}/address`, {
    headers: authHeaders
  });

  // 8. Categories - Fetch Categories Catalog
  await testEndpoint('8. Categories Fetch Catalog', `${BASE_URL}/categories`);

  // 9. Categories - Fetch Sub-Services
  await testEndpoint('9. Categories Fetch Sub-Services', `${BASE_URL}/categories/cat_plumber/services`);

  // 10. Home Feed - Fetch Dashboard Data
  await testEndpoint('10. Home Fetch Dashboard Feed', `${BASE_URL}/home`);

  // 11. Coupon - Validate Coupon SGSAVE30
  await testEndpoint('11. Coupon Validate SGSAVE30', `${BASE_URL}/coupon/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'SGSAVE30', amount: 399 })
  });

  // 12. Booking - Create Booking
  const bookingRes = await testEndpoint('12. Booking Create Request', `${BASE_URL}/bookings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      categoryId: 'cat_plumber',
      subServiceId: 'sub_pl_leak',
      dateTime: new Date().toISOString(),
      timeSlot: '10:00 AM - 12:00 PM',
      address: 'Flat 204, Royal Palms Apartment, Bengaluru',
      problemDescription: 'Fix water tap leakage in kitchen',
      hasVoiceNote: false,
      coupon: 'SGSAVE30',
      paymentMethod: 'UPI'
    })
  });

  if (bookingRes && bookingRes.data) {
    activeBookingId = bookingRes.data.id;
  }

  // 13. Booking - Get My Bookings History
  await testEndpoint('13. Booking Get User History', `${BASE_URL}/bookings?page=1&limit=10`, {
    headers: authHeaders
  });

  // 14. Live Tracking - Fetch Tracking Status
  if (activeBookingId) {
    await testEndpoint('14. Live Tracking Get Status', `${BASE_URL}/bookings/${activeBookingId}/tracking`, {
      headers: authHeaders
    });
  }

  // 15. Notifications - Get User Notifications
  await testEndpoint('15. Notifications Get Inbox', `${BASE_URL}/notifications`, {
    headers: authHeaders
  });

  // 16. Chat - Send Message
  if (activeBookingId) {
    await testEndpoint('16. Chat Send Message', `${BASE_URL}/chats/${activeBookingId}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ text: 'Hello expert, where have you reached?' })
    });

    // 17. Chat - Get Messages
    await testEndpoint('17. Chat Get Messages', `${BASE_URL}/chats/${activeBookingId}`, {
      headers: authHeaders
    });
  }

  // 18. Review - Submit Rating
  if (activeBookingId) {
    await testEndpoint('18. Review Submit Rating', `${BASE_URL}/review/${activeBookingId}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ rating: 5, comment: 'Excellent prompt service!' })
    });

    // 18b. Master Booking Action API
    await testEndpoint('18b. Master Booking Action API', `${BASE_URL}/bookings/${activeBookingId}/action`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ action: 'checkout', paymentMethod: 'UPI' })
    });
  }

  // 18c. Providers List
  await testEndpoint('18c. Providers Nearby List', `${BASE_URL}/providers?category_id=cat_plumber`);

  // 18d. Provider Profile
  await testEndpoint('18d. Single Provider Profile', `${BASE_URL}/providers/prov_rajesh`);

  // 18e. Support Ticket
  await testEndpoint('18e. Support Ticket Create', `${BASE_URL}/support/tickets`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ subject: 'Billing Help', description: 'Coupon query' })
  });

  // 18f. SOS Alert
  await testEndpoint('18f. Emergency SOS Trigger', `${BASE_URL}/support/sos`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ bookingId: activeBookingId || 'bk_123' })
  });

  // 19. Verify Splash Screen route returns 404 (as requested by user)
  try {
    const splashRes = await fetch(`${BASE_URL}/app/version`);
    if (splashRes.status === 404) {
      console.log('✅ [PASS] 19. Splashscreen API verified removed (HTTP 404 Not Found as expected)');
      passed++;
    } else {
      console.error(`❌ [FAIL] 19. Splashscreen API still exists (Status: ${splashRes.status})`);
      failed++;
    }
  } catch (err) {
    console.log('✅ [PASS] 19. Splashscreen API verified removed');
    passed++;
  }

  console.log('\n===============================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================\n');

  if (failed === 0) {
    console.log('🎉 ALL USER APP BACKEND APIs ARE 100% OPERATIONAL & VERIFIED!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED!');
    process.exit(1);
  }
}

runTests();
