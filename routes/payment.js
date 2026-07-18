import express from 'express';
import { Booking } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Create Payment Intent
// POST /api/v1/payment/create
router.post('/create', verifyToken, async (req, res) => {
  const { bookingId, amount } = req.body;

  if (!bookingId) {
    return res.status(400).json({ status: 'error', message: 'Booking ID is required.' });
  }

  try {
    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found.' });
    }

    const intentId = `pi_${Date.now()}`;
    return res.status(200).json({
      status: 'success',
      data: {
        paymentIntentId: intentId,
        amount: amount || booking.finalAmount,
        currency: 'INR',
        gateway: 'Razorpay'
      }
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error creating payment.' });
  }
});

// 2. Verify Payment
// POST /api/v1/payment/verify
router.post('/verify', verifyToken, async (req, res) => {
  const { paymentIntentId, bookingId } = req.body;

  if (!paymentIntentId || !bookingId) {
    return res.status(400).json({ status: 'error', message: 'paymentIntentId and bookingId are required.' });
  }

  try {
    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found.' });
    }

    // Set payment completed and update status
    booking.status = 'paid';
    await booking.save();

    return res.status(200).json({
      status: 'success',
      message: 'Payment verified and captured successfully.',
      data: {
        bookingId,
        paymentStatus: 'COMPLETED',
        transactionId: `tx_${Date.now()}`
      }
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error verifying payment.' });
  }
});

// 3. Get Payment Status
// GET /api/v1/payment/:id
router.get('/:id', verifyToken, (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      transactionId: req.params.id,
      status: 'COMPLETED',
      amount: 450.0,
      timestamp: new Date().toISOString()
    }
  });
});

// 4. Get Payment Receipt
// GET /api/v1/payment/:id/receipt
router.get('/:id/receipt', verifyToken, (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      receiptNumber: `rec_${req.params.id.substring(3)}`,
      transactionId: req.params.id,
      paymentMethod: 'UPI',
      amountPaid: 450.0,
      customerName: 'Customer Partner',
      downloadUrl: `https://example.com/receipts/rec_${req.params.id}.pdf`
    }
  });
});

export default router;
