import express from 'express';

const router = express.Router();

// 1. Privacy Policy
// GET /privacy-policy
router.get('/privacy-policy', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      title: 'Privacy Policy',
      lastUpdated: 'July 2026',
      content: 'Ghar Ka Sathi values your privacy. We collect your location, phone number, and address history to match you with verified local service experts and process bookings.'
    }
  });
});

// 2. Terms of Service
// GET /terms
router.get('/terms', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      title: 'Terms of Service',
      lastUpdated: 'July 2026',
      content: 'By using Ghar Ka Sathi app, you agree to our booking terms, platform service fee, cancellation charges, and dispute settlement guidelines.'
    }
  });
});

// 3. FAQ
// GET /faq
router.get('/faq', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: [
      { q: 'How do I cancel my booking?', a: 'You can cancel any booking before the expert arrival. A cancellation charge of ₹50 may apply.' },
      { q: 'Are experts background checked?', a: 'Yes! All experts are 100% KYC verified and background checked.' },
      { q: 'What is platform fee?', a: 'Platform fee is a small charge of ₹15 applied to each booking to keep the service operational.' }
    ]
  });
});

// 4. About Us
// GET /about
router.get('/about', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      title: 'About Ghar Ka Sathi',
      description: 'Ghar Ka Sathi is an on-demand service ecosystem designed to connect verified plumbing, electrical, and domestic technicians with household customers in real-time.'
    }
  });
});

// 5. Contact Us
// GET /contact
router.get('/contact', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      supportPhone: '+91-9876543210',
      supportEmail: 'support@gharkasathi.com',
      address: 'Sector 45, Sunshine Heights, Noida, India'
    }
  });
});

export default router;
