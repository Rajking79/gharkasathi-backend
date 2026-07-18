import express from 'express';
import { Category, Booking, User, Provider } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Home Dashboard Feed (Consolidated)
// GET /api/v1/home
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    // 1. Fetch Categories
    const categories = await Category.find().limit(6);

    // 2. Fetch Recent Booking
    const recentBooking = await Booking.findOne({ userId }).sort({ createdAt: -1 });

    // 3. Fetch Wallet Balance
    let walletBalance = 0;
    if (role === 'provider') {
      const provider = await Provider.findOne({ id: userId });
      walletBalance = provider ? provider.walletBalance : 0;
    }

    // 4. Fetch Recommended Services (Static SubServices mock/derived from categories)
    const recommendedServices = [];
    categories.forEach(cat => {
      if (cat.subServices && cat.subServices.length > 0) {
        recommendedServices.push({
          categoryId: cat.id,
          categoryName: cat.name,
          ...cat.subServices[0].toObject()
        });
      }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        categories,
        walletBalance,
        recentBooking,
        recommended: recommendedServices.slice(0, 4),
        popularServices: recommendedServices.slice(1, 5),
        notificationsCount: 0 // Mocked/Dynamic placeholder
      }
    });

  } catch (err) {
    console.error('Error fetching home dashboard:', err);
    return res.status(500).json({ status: 'error', message: 'Server error loading home feed.' });
  }
});

// 2. Search Services
// GET /api/v1/services/search
router.get('/services/search', verifyToken, async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ status: 'error', message: 'Keyword query parameter is required.' });
  }

  try {
    const categories = await Category.find();
    const matches = [];

    // Search within categories name and nested subServices name
    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(keyword.toLowerCase())) {
        matches.push({
          type: 'category',
          id: cat.id,
          name: cat.name,
          description: cat.description
        });
      }

      cat.subServices.forEach(sub => {
        if (sub.name.toLowerCase().includes(keyword.toLowerCase()) || 
            sub.description.toLowerCase().includes(keyword.toLowerCase())) {
          matches.push({
            type: 'service',
            id: sub.id,
            name: sub.name,
            categoryId: cat.id,
            categoryName: cat.name,
            basePrice: sub.basePrice,
            description: sub.description
          });
        }
      });
    });

    return res.status(200).json({
      status: 'success',
      data: matches
    });

  } catch (err) {
    console.error('Error searching services:', err);
    return res.status(500).json({ status: 'error', message: 'Server error running search.' });
  }
});

// 3. Popular Services
// GET /api/v1/services/popular
router.get('/services/popular', verifyToken, async (req, res) => {
  try {
    const categories = await Category.find();
    const popular = [];
    categories.forEach(cat => {
      if (cat.subServices && cat.subServices.length > 0) {
        popular.push({
          id: cat.subServices[0].id,
          name: cat.subServices[0].name,
          categoryId: cat.id,
          categoryName: cat.name,
          basePrice: cat.subServices[0].basePrice
        });
      }
    });

    return res.status(200).json({
      status: 'success',
      data: popular.slice(0, 5)
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error loading popular services.' });
  }
});

// 4. Recommended Services
// GET /api/v1/services/recommended
router.get('/services/recommended', verifyToken, async (req, res) => {
  try {
    const categories = await Category.find();
    const recommended = [];
    categories.forEach(cat => {
      if (cat.subServices && cat.subServices.length > 1) {
        recommended.push({
          id: cat.subServices[1].id,
          name: cat.subServices[1].name,
          categoryId: cat.id,
          categoryName: cat.name,
          basePrice: cat.subServices[1].basePrice
        });
      }
    });

    return res.status(200).json({
      status: 'success',
      data: recommended.slice(0, 5)
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error loading recommended services.' });
  }
});

export default router;
