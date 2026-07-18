import express from 'express';
import { Notification } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get list of notifications for the authenticated user/provider
// GET /api/notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.id,
      userType: req.user.role
    }).sort({ timestamp: -1 });

    const parsedNotifications = notifications.map(notif => ({
      id: notif.id,
      title: notif.title,
      body: notif.body,
      timestamp: notif.timestamp,
      isRead: notif.isRead,
      routeType: notif.routeType,
      routeId: notif.routeId
    }));

    return res.status(200).json({
      status: 'success',
      data: parsedNotifications
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error retrieving notifications.' });
  }
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
