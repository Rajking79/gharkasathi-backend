import express from 'express';
import { Referral, Reward } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate a random referral code
const generateReferralCode = (userId) => {
  const cleanId = userId.replace('usr_', '').substring(0, 4).toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `SATHI${cleanId}${randNum}`;
};

// 1. Get Referral Details
// GET /api/v1/referral
router.get('/referral', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    let referralObj = await Referral.findOne({ userId });
    if (!referralObj) {
      const code = generateReferralCode(userId);
      referralObj = await Referral.create({
        id: `ref_${Date.now()}`,
        userId,
        referralCode: code,
        referredUsersCount: 0,
        referredUsers: [],
        totalRewardsEarned: 0.0
      });
    }

    return res.status(200).json({
      status: 'success',
      data: referralObj
    });

  } catch (err) {
    console.error('Error loading referral:', err);
    return res.status(500).json({ status: 'error', message: 'Server error retrieving referral details.' });
  }
});

// 2. Get Referral History
// GET /api/v1/referral/history
router.get('/referral/history', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const referralObj = await Referral.findOne({ userId });
    return res.status(200).json({
      status: 'success',
      data: referralObj ? referralObj.referredUsers : []
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error loading referral history.' });
  }
});

// 3. Get Reward Balance
// GET /api/v1/rewards
router.get('/rewards', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    let rewardObj = await Reward.findOne({ userId });
    if (!rewardObj) {
      rewardObj = await Reward.create({
        id: `rwd_${Date.now()}`,
        userId,
        pointsBalance: 100, // Welcome gift points
        history: [{
          points: 100,
          type: 'credit',
          description: 'Welcome reward points credited successfully.'
        }]
      });
    }

    return res.status(200).json({
      status: 'success',
      data: rewardObj
    });

  } catch (err) {
    console.error('Error loading rewards:', err);
    return res.status(500).json({ status: 'error', message: 'Server error retrieving reward points.' });
  }
});

// 4. Get Reward History
// GET /api/v1/rewards/history
router.get('/rewards/history', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const rewardObj = await Reward.findOne({ userId });
    return res.status(200).json({
      status: 'success',
      data: rewardObj ? rewardObj.history : []
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error loading rewards history.' });
  }
});

export default router;
