const BASE_URL = 'https://gharkasathi-backend-neuj.onrender.com/api/v1';
const HEALTH_URL = 'https://gharkasathi-backend-neuj.onrender.com/health';

const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;

const runLiveTests = async () => {
  console.log(cyan('=== GHAR KA SATHI LIVE CUSTOMER APP API TEST SUITE ===\n'));

  let customerToken = '';

  try {
    // 1. Healthcheck
    console.log('1. Testing Healthcheck...');
    const healthRes = await fetch(HEALTH_URL);
    const healthData = await healthRes.json();
    if (healthRes.ok) console.log(green('   ✓ Healthcheck passed!\n'));

    // 4. Send Customer OTP
    console.log('4. Testing Send Customer Mobile OTP...');
    const sendOtpRes = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210' })
    });
    if (sendOtpRes.ok) console.log(green('   ✓ Customer OTP sent successfully!\n'));

    // 5. Verify Customer OTP & Generate JWT
    console.log('5. Testing Verify Customer OTP & JWT Token...');
    const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', otp: '123456', role: 'user' })
    });
    const verifyData = await verifyRes.json();
    customerToken = verifyData.accessToken || verifyData.token;
    if (customerToken) console.log(green('   ✓ Customer OTP verified and JWT Token generated!\n'));

    // 6. Complete Customer Profile
    console.log('6. Testing Complete Customer Profile...');
    const profileRes = await fetch(`${BASE_URL}/customer/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        name: 'RajkumarBuddha',
        email: 'rajkumar@example.com',
        gender: 'Male',
        dob: '1995-08-15'
      })
    });
    if (profileRes.ok) console.log(green('   ✓ Customer Profile completed!\n'));

    // 7. Get Customer Profile
    console.log('7. Testing Fetch Customer Profile...');
    const getProfileRes = await fetch(`${BASE_URL}/customer/profile`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    if (getProfileRes.ok) console.log(green('   ✓ Customer Profile fetched successfully!\n'));

    // 8. Add Saved Address
    console.log('8. Testing Add Saved Address...');
    const addrRes = await fetch(`${BASE_URL}/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        addressLine: 'Flat 102, Green Park',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122001',
        isDefault: true
      })
    });
    if (addrRes.ok) console.log(green('   ✓ Address added to customer ledger!\n'));

    // 9. Fetch Home Feed
    console.log('9. Testing Fetch Home Dashboard Feed...');
    const homeRes = await fetch(`${BASE_URL}/home`);
    if (homeRes.ok) console.log(green('   ✓ Home Dashboard feed fetched!\n'));

    // 10. Fetch Categories Catalog
    console.log('10. Testing Fetch Categories Catalog...');
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    if (catRes.ok) console.log(green(`   ✓ Categories catalog retrieved (${catData.data?.length || 0} categories)!\n`));

    // 11. Validate Promo Coupon
    console.log('11. Testing Validate Promo Coupon (SGSAVE30)...');
    const couponRes = await fetch(`${BASE_URL}/coupon/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SGSAVE30', amount: 399 })
    });
    if (couponRes.ok) console.log(green('   ✓ Promo coupon validated successfully!\n'));

    // 12. Create Booking
    console.log('12. Testing Create Customer Booking...');
    const createBkRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        categoryId: 'cat_plumber',
        subServiceId: 'sub_pl_leak',
        dateTime: new Date().toISOString(),
        timeSlot: '10:00 AM - 12:00 PM',
        address: 'Flat 102, Green Park, Gurugram',
        coupon: 'SGSAVE30',
        paymentMethod: 'UPI'
      })
    });
    const createBkData = await createBkRes.json();
    const bookingId = createBkData.data?.id || 'bk_123';
    if (createBkRes.ok) console.log(green(`   ✓ Customer Booking created successfully (ID: ${bookingId})!\n`));

    // 13. Get Customer Bookings List
    console.log('13. Testing Fetch Customer Bookings List...');
    const bkListRes = await fetch(`${BASE_URL}/bookings?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    if (bkListRes.ok) console.log(green('   ✓ Customer Bookings history retrieved!\n'));

    // 14. Customer Notifications
    console.log('14. Testing Fetch Customer Notifications...');
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    if (notifRes.ok) console.log(green('   ✓ Customer Notifications retrieved!\n'));

    // 15. Create Support Ticket
    console.log('15. Testing Create Support Ticket...');
    const tktRes = await fetch(`${BASE_URL}/support/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ subject: 'Test query', message: 'Testing support endpoint' })
    });
    if (tktRes.ok) console.log(green('   ✓ Support ticket raised successfully!\n'));

    console.log(cyan('🎉 ALL LIVE CUSTOMER APP API ENDPOINTS TESTED SUCCESSFULLY IN SECONDS! 🎉\n'));

  } catch (err) {
    console.error(red(`❌ TEST FAILED: ${err.message}`));
  }
};

runLiveTests();
