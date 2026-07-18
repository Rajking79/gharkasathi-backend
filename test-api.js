// Native global fetch is used (Node 18+)
const BASE_URL = 'http://127.0.0.1:8080/api/v1';

// Colors for console logging
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;

const runTests = async () => {
  console.log(cyan('=== GHAR KA SATHI API INTEGRATION TEST ===\n'));

  let userToken = '';
  let providerToken = '';
  let testBookingId = '';

  try {
    // 1. Healthcheck
    console.log(yellow('Testing Healthcheck...'));
    const healthRes = await fetch('http://127.0.0.1:8080/health');
    const healthData = await healthRes.json();
    if (healthRes.ok && healthData.status === 'success') {
      console.log(green('✓ Healthcheck passed!\n'));
    } else {
      throw new Error(`Healthcheck failed: ${JSON.stringify(healthData)}`);
    }

    // 2. Fetch Categories Catalog
    console.log(yellow('Testing Fetch Categories Catalog...'));
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    if (catRes.ok && catData.status === 'success' && catData.data.length > 0) {
      console.log(green(`✓ Categories catalog retrieved! Found ${catData.data.length} categories.`));
      console.log(`  First Category: ${catData.data[0].name} with ${catData.data[0].subServices.length} sub-services.\n`);
    } else {
      throw new Error(`Fetch categories failed: ${JSON.stringify(catData)}`);
    }

    // 2b. Input Validation Check (422 Error)
    console.log(yellow('Testing Input Validation Rules (422 Unprocessable Entity)...'));
    const invalidPhoneRes = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '123' })
    });
    const invalidPhoneData = await invalidPhoneRes.json();
    if (invalidPhoneRes.status === 422 && invalidPhoneData.status === 'error') {
      console.log(green('✓ Input validation caught invalid phone number and returned HTTP 422 Unprocessable Entity!\n'));
    } else {
      throw new Error(`Validation check failed: expected 422 error, got ${invalidPhoneRes.status}`);
    }

    // 3. Request User OTP
    console.log(yellow('Testing Send OTP (Customer)...'));
    const otpUserRes = await fetch(`${BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9000000001' })
    });
    const otpUserData = await otpUserRes.json();
    if (otpUserRes.ok && otpUserData.otp === '123456') {
      console.log(green('✓ User OTP send simulated successfully.\n'));
    } else {
      throw new Error(`User OTP send failed: ${JSON.stringify(otpUserData)}`);
    }

    // 4. Verify OTP (Customer)
    console.log(yellow('Testing Verify OTP (Customer)...'));
    const verifyUserRes = await fetch(`${BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9000000001',
        code: '123456',
        role: 'user'
      })
    });
    const verifyUserData = await verifyUserRes.json();
    if (verifyUserRes.ok && verifyUserData.status === 'success') {
      userToken = verifyUserData.data.token;
      console.log(green('✓ User OTP verified and JWT Token created!'));
      console.log(`  User Token: ${userToken.substring(0, 24)}...\n`);
    } else {
      throw new Error(`User verification failed: ${JSON.stringify(verifyUserData)}`);
    }

    // 5. Verify OTP (Provider - Rajesh Kumar)
    console.log(yellow('Testing Verify OTP (Provider - Rajesh Kumar)...'));
    const verifyProviderRes = await fetch(`${BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9876543210',
        code: '123456',
        role: 'provider'
      })
    });
    const verifyProviderData = await verifyProviderRes.json();
    if (verifyProviderRes.ok && verifyProviderData.status === 'success') {
      providerToken = verifyProviderData.data.token;
      console.log(green('✓ Provider OTP verified and JWT Token created!'));
      console.log(`  Provider Token: ${providerToken.substring(0, 24)}...\n`);
    } else {
      throw new Error(`Provider verification failed: ${JSON.stringify(verifyProviderData)}`);
    }

    // 6. Complete Profile (Customer)
    console.log(yellow('Testing Complete User Profile...'));
    const completeProfileRes = await fetch(`${BASE_URL}/auth/profile/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'johndoe@example.com',
        gender: 'Male',
        dob: '1990-05-15',
        address: 'H.No 124, Sector 15, Gurugram',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122003',
        profilePicture: 'https://randomuser.me/api/portraits/men/82.jpg'
      })
    });
    const completeProfileData = await completeProfileRes.json();
    if (completeProfileRes.ok && completeProfileData.status === 'success') {
      console.log(green('✓ Customer profile completed successfully. Address added to ledger!\n'));
    } else {
      throw new Error(`Complete profile failed: ${JSON.stringify(completeProfileData)}`);
    }

    // 7. Create a Booking (Customer booking a Plumber)
    console.log(yellow('Testing Create Booking...'));
    const createBookingRes = await fetch(`${BASE_URL}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        categoryId: 'cat_plumber',
        subServiceId: 'sub_pl_leak',
        dateTime: new Date().toISOString(),
        timeSlot: '10:00 AM - 12:00 PM',
        address: 'Flat 402, Sunshine Heights, Sector 45, Gurugram',
        problemDescription: 'Bathroom kitchen tap is leaking constantly and flooding floor.',
        hasVoiceNote: false,
        paymentMethod: 'UPI',
        jobPhotos: ['https://example.com/leak1.jpg']
      })
    });
    const createBookingData = await createBookingRes.json();
    if (createBookingRes.ok && createBookingData.status === 'success') {
      testBookingId = createBookingData.data.id;
      console.log(green(`✓ Booking created successfully! Booking ID: ${testBookingId}`));
      console.log(`  Calculated Final Amount: ₹${createBookingData.data.finalAmount}`);
      console.log(`  Security Code for expert arrival: ${createBookingData.data.otp}\n`);
    } else {
      throw new Error(`Create booking failed: ${JSON.stringify(createBookingData)}`);
    }

    // 8. Retrieve Customer Booking List
    console.log(yellow('Testing Retrieve Customer Bookings List...'));
    const userBookingsRes = await fetch(`${BASE_URL}/bookings/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const userBookingsData = await userBookingsRes.json();
    if (userBookingsRes.ok && userBookingsData.data.length > 0) {
      console.log(green(`✓ Retrieved ${userBookingsData.data.length} bookings for user.\n`));
    } else {
      throw new Error(`User bookings retrieval failed: ${JSON.stringify(userBookingsData)}`);
    }

    // 9. Expert Start Service with OTP
    console.log(yellow('Testing Verify OTP code to Start Service (Expert Rajesh Kumar)...'));
    const startRes = await fetch(`${BASE_URL}/bookings/${testBookingId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({ otp: createBookingData.data.otp })
    });
    const startData = await startRes.json();
    if (startRes.ok && startData.status === 'success') {
      console.log(green('✓ Arrival Security Code match successful. Job status set to "started"!\n'));
    } else {
      throw new Error(`Job start OTP verify failed: ${JSON.stringify(startData)}`);
    }

    // 10. Expert requests Extra Work cost approval
    console.log(yellow('Testing Request Extra Work (Expert)...'));
    const extraWorkRes = await fetch(`${BASE_URL}/bookings/${testBookingId}/extra-work`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({ cost: 150.0, reason: 'Required replacing tap spindle and internal rubber seal.' })
    });
    const extraWorkData = await extraWorkRes.json();
    if (extraWorkRes.ok && extraWorkData.status === 'success') {
      console.log(green('✓ Extra work requested successfully.\n'));
    } else {
      throw new Error(`Extra work request failed: ${JSON.stringify(extraWorkData)}`);
    }

    // 11. Customer Approves Extra Work
    console.log(yellow('Testing Approve Extra Work (Customer)...'));
    const approveExtraRes = await fetch(`${BASE_URL}/bookings/${testBookingId}/extra-work/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const approveExtraData = await approveExtraRes.json();
    if (approveExtraRes.ok && approveExtraData.status === 'success') {
      console.log(green('✓ Extra work approved. Invoice amount updated dynamically!\n'));
    } else {
      throw new Error(`Extra work approval failed: ${JSON.stringify(approveExtraData)}`);
    }

    // 12. Expert marks Job Completed
    console.log(yellow('Testing Mark Job Completed (Expert)...'));
    const completeRes = await fetch(`${BASE_URL}/bookings/${testBookingId}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    const completeData = await completeRes.json();
    if (completeRes.ok && completeData.status === 'success') {
      console.log(green('✓ Job completion logged successfully.\n'));
    } else {
      throw new Error(`Job completion failed: ${JSON.stringify(completeData)}`);
    }

    // 13. Customer Pays Invoice
    console.log(yellow('Testing Payment processing & Wallet Commission split...'));
    const payRes = await fetch(`${BASE_URL}/bookings/${testBookingId}/pay`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ paymentMethod: 'UPI' })
    });
    const payData = await payRes.json();
    if (payRes.ok && payData.status === 'success') {
      console.log(green('✓ Payment complete!'));
      console.log(`  Expert Earnings (after 15% Platform commission): ₹${payData.data.providerEarnings}`);
      console.log(`  Platform commission: ₹${payData.data.platformCommission}\n`);
    } else {
      throw new Error(`Payment processing failed: ${JSON.stringify(payData)}`);
    }

    // 14. Customer Leaves Review
    console.log(yellow('Testing Customer Rating & Reviews...'));
    const reviewRes = await fetch(`${BASE_URL}/bookings/${testBookingId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ rating: 5, comment: 'Rajesh did a brilliant job! Clean work and highly recommended.' })
    });
    const reviewData = await reviewRes.json();
    if (reviewRes.ok && reviewData.status === 'success') {
      console.log(green('✓ Expert feedback and rating registered!\n'));
    } else {
      throw new Error(`Review submission failed: ${JSON.stringify(reviewData)}`);
    }

    // 15. Check Wallet balance (Expert)
    console.log(yellow('Testing Wallet balance and transaction history (Expert)...'));
    const walletRes = await fetch(`${BASE_URL}/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    const walletData = await walletRes.json();
    if (walletRes.ok && walletData.status === 'success') {
      console.log(green(`✓ Wallet retrieved! Current Balance: ₹${walletData.data.walletBalance}`));
      console.log(`  Transactions count: ${walletData.data.transactions.length}`);
      console.log(`  Last Transaction: ${walletData.data.transactions[0].description} (${walletData.data.transactions[0].amount})\n`);
    } else {
      throw new Error(`Wallet retrieval failed: ${JSON.stringify(walletData)}`);
    }

    console.log(green('🎉 ALL API ENDPOINT INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉'));

  } catch (err) {
    console.error(red('\n❌ TEST SUITE FAILED WITH ERROR:'));
    console.error(red(err.message));
    process.exit(1);
  }
};

runTests();
