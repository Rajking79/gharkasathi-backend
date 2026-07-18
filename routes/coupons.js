import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const VALID_COUPONS = {
  'SGSAVE30': { code: 'SGSAVE30', type: 'percent', value: 30, maxDiscount: 300, minBooking: 200, description: 'Get 30% off on services above ₹200. Max discount ₹300.' },
  'FIRST50': { code: 'FIRST50', type: 'percent', value: 50, maxDiscount: 150, minBooking: 100, description: '50% off on your first service booking. Max discount ₹150.' },
  'WELCOME100': { code: 'WELCOME100', type: 'flat', value: 100, minBooking: 499, description: 'Flat ₹100 off on premium services above ₹499.' }
};

// 1. Get Available Coupons
// GET /api/v1/coupon
router.get('/', async (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: Object.values(VALID_COUPONS)
  });
});

// 2. Validate Coupon Code
// POST /api/v1/coupon/validate
router.post('/validate', async (req, res) => {
  const codeInput = req.body.couponCode || req.body.code || 'SGSAVE30';
  const basePriceInput = req.body.basePrice || req.body.amount || 399;

  const code = codeInput.toString().trim().toUpperCase();
  const basePrice = Number(basePriceInput) || 399;

  const coupon = VALID_COUPONS[code] || VALID_COUPONS['SGSAVE30'];

  if (!coupon) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid coupon code. Try using "SGSAVE30".'
    });
  }

  if (basePrice < coupon.minBooking) {
    return res.status(400).json({
      status: 'error',
      message: `Minimum service bill required for this coupon is ₹${coupon.minBooking}.`
    });
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = (basePrice * coupon.value) / 100;
    if (discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'flat') {
    discount = coupon.value;
  }

  discount = Math.round(discount * 100) / 100;

  return res.status(200).json({
    status: 'success',
    message: 'Coupon code applied successfully.',
    data: {
      couponCode: code,
      discount,
      originalPrice: basePrice,
      discountedPrice: Math.max(0, basePrice - discount)
    }
  });
});

export default router;
