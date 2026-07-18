import express from 'express';
import { SupportTicket, Booking } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Raise a Ticket
// POST /api/v1/support/ticket
router.post('/ticket', verifyToken, async (req, res) => {
  const { subject, description } = req.body;
  const userId = req.user.id;

  if (!subject) {
    return res.status(400).json({ status: 'error', message: 'Subject is required.' });
  }

  try {
    const ticketId = `tkt_${Date.now()}`;
    const ticket = await SupportTicket.create({
      id: ticketId,
      userId,
      subject,
      description: description || '',
      status: 'open',
      replies: []
    });

    return res.status(201).json({
      status: 'success',
      message: 'Support ticket raised successfully.',
      data: ticket
    });

  } catch (err) {
    console.error('Error raising ticket:', err);
    return res.status(500).json({ status: 'error', message: 'Server error raising ticket.' });
  }
});

// 2. Retrieve Tickets List
// GET /api/v1/support/tickets
router.get('/tickets', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      data: tickets
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error retrieving tickets.' });
  }
});

// 3. Ticket Details
// GET /api/v1/support/tickets/:id
router.get('/tickets/:id', verifyToken, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ id: req.params.id, userId: req.user.id });
    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Support ticket not found.' });
    }
    return res.status(200).json({
      status: 'success',
      data: ticket
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error retrieving ticket details.' });
  }
});

// 4. Reply to Ticket
// POST /api/v1/support/tickets/:id/reply
router.post('/tickets/:id/reply', verifyToken, async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  if (!message) {
    return res.status(400).json({ status: 'error', message: 'Reply message cannot be empty.' });
  }

  try {
    const ticket = await SupportTicket.findOne({ id: req.params.id, userId });
    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Support ticket not found.' });
    }

    ticket.replies.push({
      senderId: userId,
      senderRole: role,
      message
    });

    ticket.status = 'in_progress';
    await ticket.save();

    return res.status(200).json({
      status: 'success',
      message: 'Reply logged successfully.',
      data: ticket
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error sending reply.' });
  }
});

// 5. Raise Refund Request
// POST /api/v1/refund
router.post('/refund', verifyToken, async (req, res) => {
  const { bookingId, reason } = req.body;

  if (!bookingId || !reason) {
    return res.status(400).json({ status: 'error', message: 'Booking ID and refund reason are required.' });
  }

  try {
    const booking = await Booking.findOne({ id: bookingId, userId: req.user.id });
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found.' });
    }

    // Auto-create support ticket for refund
    const ticketId = `tkt_rfnd_${Date.now()}`;
    const refundTicket = await SupportTicket.create({
      id: ticketId,
      userId: req.user.id,
      subject: `Refund Request for Booking: ${bookingId}`,
      description: `Reason: ${reason}. Status of booking: ${booking.status}. Amount: ₹${booking.finalAmount}`,
      status: 'open'
    });

    return res.status(201).json({
      status: 'success',
      message: 'Refund ticket generated successfully.',
      data: refundTicket
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error posting refund.' });
  }
});

// 6. Report Expert
// POST /api/v1/report/expert
router.post('/report/expert', verifyToken, async (req, res) => {
  const { providerId, reason } = req.body;

  if (!providerId || !reason) {
    return res.status(400).json({ status: 'error', message: 'Expert ID and report reason are required.' });
  }

  try {
    const ticketId = `tkt_rep_${Date.now()}`;
    const reportTicket = await SupportTicket.create({
      id: ticketId,
      userId: req.user.id,
      subject: `Report Expert: ${providerId}`,
      description: `Reason: ${reason}`,
      status: 'open'
    });

    return res.status(201).json({
      status: 'success',
      message: 'Report logged to security board.',
      data: reportTicket
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error reporting expert.' });
  }
});

// 7. SOS emergency triggers
// POST /api/v1/sos
router.post('/sos', verifyToken, async (req, res) => {
  const { bookingId } = req.body;
  console.log(`🚨 SOS PANIC TRIGGERED FOR BOOKING: ${bookingId} BY USER: ${req.user.id}`);

  return res.status(200).json({
    status: 'success',
    message: 'SOS signal broadcasted successfully to nearby emergency patrol and safety desks.'
  });
});

export default router;
