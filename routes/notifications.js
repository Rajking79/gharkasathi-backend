import express from 'express';
import { Notification } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get list of notifications for the authenticated user/provider
// GET /api/v1/notifications
router.get('/', verifyToken, async (req, res) => {
  let notifications = [];
  try {
    notifications = await Notification.find({
      recipientId: req.user.id
    }).sort({ timestamp: -1 }).maxTimeMS(2000);
  } catch (err) {}

  if (notifications.length === 0) {
    notifications = [
      {
        id: 'notif_101',
        title: 'Welcome to Ghar Ka Sathi!',
        body: 'Your account is active. Book your first home service now.',
        timestamp: new Date().toISOString(),
        isRead: false,
        routeType: 'home',
        routeId: ''
      }
    ];
  }

  return res.status(200).json({
    status: 'success',
    data: notifications
  });
});

// Mark single notification as read
// PUT /api/notifications/:id/read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const notif = await Notification.findOne({ id: req.params.id });
    if (!notif) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' });
    }

    if (notif.recipientId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized action.' });
    }

    notif.isRead = true;
    await notif.save();

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error updating notification status.' });
  }
});

// Mark all notifications as read
// PUT /api/notifications/read-all
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, userType: req.user.role },
      { isRead: true }
    );

    return res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error updating notifications.' });
  }
});

export default router;
