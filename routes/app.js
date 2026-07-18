import express from 'express';

const router = express.Router();

// 1. Check App Version
// GET /api/v1/app/version
router.get('/version', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      latestVersion: '1.2.0',
      minimumVersion: '1.0.5',
      forceUpdate: false,
      maintenance: false
    }
  });
});

// 2. Maintenance check
// GET /api/v1/app/maintenance
router.get('/maintenance', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      maintenance: false,
      message: 'System is fully operational.'
    }
  });
});

// 3. App configuration
// GET /api/v1/app/config
router.get('/config', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      gstPercentage: 18,
      platformFee: 15.0,
      visitingCharge: 50.0,
      maxBookingRadiusKm: 15,
      supportedLanguages: ['en', 'hi'],
      walletEnabled: true,
      referralEnabled: true,
      cancellationCharges: 50.0,
      sosEnabled: true
    }
  });
});

export default router;
