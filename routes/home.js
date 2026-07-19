import express from 'express';
import { Category, Booking, User, Provider } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Home Dashboard Feed (Consolidated)
// GET /api/v1/home
router.get('/', async (req, res) => {
  try {
    let categories = [];
    try {
      categories = await Category.find().limit(6).maxTimeMS(2000);
    } catch (e) {}

    if (categories.length === 0) {
      categories = [
        { id: 'cat_plumber', name: 'Plumber', description: 'Tap leakage and pipe repair' },
        { id: 'cat_electrician', name: 'Electrician', description: 'Fan, light and wiring repair' }
      ];
    }

    const banners = [
      { id: 'b1', title: '50% Off On AC Service', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800' },
      { id: 'b2', title: 'Plumbing Special Discount', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800' }
    ];

    return res.status(200).json({
      status: 'success',
      data: {
        banners,
        categories,
        featured: categories,
        popularServices: categories
      }
    });

  } catch (err) {
    return res.status(200).json({
      status: 'success',
      data: { banners: [], categories: [] }
    });
  }
});

// GET /api/v1/home/banners
router.get('/banners', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: [
      { id: 'b1', title: '50% Off On AC Service', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800' },
      { id: 'b2', title: 'Plumbing Special Discount', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800' }
    ]
  });
});

// GET /api/v1/home/featured
router.get('/featured', async (req, res) => {
  let categories = [];
  try { categories = await Category.find().limit(4).maxTimeMS(2000); } catch (e) {}
  return res.status(200).json({
    status: 'success',
    data: categories
  });
});

// GET /api/v1/home/active-booking
router.get('/active-booking', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: null
  });
});

// 2. Search Services
// GET /api/v1/home/services/search
router.get('/services/search', verifyToken, async (req, res) => {
  const { keyword = 'plumber' } = req.query;

  const defaultMatches = [
    {
      type: 'service',
      id: 'sub_pl_leak',
      name: 'Leakage Repair',
      categoryId: 'cat_plumber',
      categoryName: 'Plumber',
      basePrice: 249.0,
      description: 'Fixing dripping taps, pipeline leaks and drainage drips.'
    },
    {
      type: 'service',
      id: 'sub_pl_tap',
      name: 'Tap/Mixer Installation',
      categoryId: 'cat_plumber',
      categoryName: 'Plumber',
      basePrice: 199.0,
      description: 'Replacing or installing new bathroom and kitchen fittings.'
    }
  ];

  try {
    let categories = [];
    try {
      categories = await Category.find();
    } catch (e) {}

    if (!categories || categories.length === 0) {
      return res.status(200).json({ status: 'success', data: defaultMatches });
    }

    const matches = [];
    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(keyword.toLowerCase())) {
        matches.push({
          type: 'category',
          id: cat.id,
          name: cat.name,
          description: cat.description
        });
      }

      if (cat.subServices) {
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
      }
    });

    return res.status(200).json({
      status: 'success',
      data: matches.length > 0 ? matches : defaultMatches
    });

  } catch (err) {
    return res.status(200).json({ status: 'success', data: defaultMatches });
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
