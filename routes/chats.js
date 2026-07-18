import express from 'express';
import { Booking, ChatMessage, Notification } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get booking chat history
// GET /api/bookings/:bookingId/messages
router.get('/:bookingId/messages', verifyToken, async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    // Verify participant permission
    if (req.user.id !== booking.userId && req.user.id !== booking.providerId) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized access to chat.' });
    }

    const messages = await ChatMessage.find({ bookingId }).sort({ timestamp: 1 });

    const parsedMessages = messages.map(msg => ({
      id: msg.id,
      text: msg.text,
      senderType: msg.senderType,
      timestamp: msg.timestamp,
      imageUrl: msg.imageUrl
    }));

    return res.status(200).json({
      status: 'success',
      data: parsedMessages
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error retrieving messages.' });
  }
});

// Send message to booking chat
// POST /api/bookings/:bookingId/messages
router.post('/:bookingId/messages', verifyToken, async (req, res) => {
  const { bookingId } = req.params;
  const { text, imageUrl } = req.body;

  if (!text && !imageUrl) {
    return res.status(400).json({ status: 'error', message: 'Message text or image is required.' });
  }

  try {
    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    // Verify participant permission
    if (req.user.id !== booking.userId && req.user.id !== booking.providerId) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized access to chat.' });
    }

    const messageId = `msg_${Date.now()}`;
    const timestampStr = new Date().toISOString();

    const newMsg = await ChatMessage.create({
      id: messageId,
      bookingId,
      senderId: req.user.id,
      senderType: req.user.role,
      text: text || '',
      imageUrl: imageUrl || null,
      timestamp: timestampStr
    });

    // Notify recipient
    const recipientId = req.user.role === 'user' ? booking.providerId : booking.userId;
    const recipientType = req.user.role === 'user' ? 'provider' : 'user';
    const senderName = req.user.role === 'user' ? 'Client' : 'Expert Partner';

    await Notification.create({
      id: `notif_${Date.now()}`,
      userType: recipientType,
      recipientId,
      title: `New message from ${senderName}`,
      body: text || 'Sent an image',
      routeType: 'chat',
      routeId: bookingId
    });

    return res.status(201).json({
      status: 'success',
      data: {
        id: messageId,
        text: newMsg.text,
        senderType: newMsg.senderType,
        timestamp: newMsg.timestamp,
        imageUrl: newMsg.imageUrl
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error sending message.' });
  }
});

export default router;
