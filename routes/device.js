import express from 'express';
import { DeviceSession, User, Provider } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Register Device
// POST /api/v1/device/register
router.post('/device/register', verifyToken, async (req, res) => {
  const { deviceType, ipAddress } = req.body;
  const userId = req.user.id;

  try {
    const sessionId = `sess_${Date.now()}`;
    const session = await DeviceSession.create({
      id: sessionId,
      userId,
      token: req.headers.authorization ? req.headers.authorization.split(' ')[1] : 'unknown',
      ipAddress: ipAddress || req.ip || '',
      deviceType: deviceType || 'mobile'
    });

    return res.status(201).json({
      status: 'success',
      message: 'Device session registered successfully.',
      data: session
    });

  } catch (err) {
    console.error('Error registering device:', err);
    return res.status(500).json({ status: 'error', message: 'Server error registering device session.' });
  }
});

// 2. Register/Update FCM Token
// POST /api/v1/device/fcm-token
router.post('/device/fcm-token', verifyToken, async (req, res) => {
  const { fcmToken, deviceId } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  if (!fcmToken) {
    return res.status(400).json({ status: 'error', message: 'FCM token is required.' });
  }

  try {
    if (role === 'provider') {
      await Provider.findOneAndUpdate({ id: userId }, { fcmToken, deviceId: deviceId || '' });
    } else {
      await User.findOneAndUpdate({ id: userId }, { fcmToken, deviceId: deviceId || '' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'FCM token updated successfully.'
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error updating FCM token.' });
  }
});

// 3. Get Sessions List
// GET /api/v1/sessions
router.get('/sessions', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const sessions = await DeviceSession.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      data: sessions
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error loading active sessions.' });
  }
});

// 4. Delete Session (Terminate session)
// DELETE /api/v1/sessions/:id
router.delete('/sessions/:id', verifyToken, async (req, res) => {
  const sessionId = req.params.id;

  try {
    const deleted = await DeviceSession.deleteOne({ id: sessionId, userId: req.user.id });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Session session not found.' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Device session terminated successfully.'
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error terminating session.' });
  }
});

export default router;
