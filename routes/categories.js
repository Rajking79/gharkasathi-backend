import express from 'express';
import { Category } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const defaultCategories = [
  {
    id: 'cat_plumber',
    name: 'Plumber',
    description: 'Fix leakages, pipe blockages, taps, and sanitary fittings.',
    iconName: 'plumbing_rounded',
    subServices: [
      { id: 'sub_pl_leak', name: 'Leakage Repair', basePrice: 249, description: 'Fixing dripping taps, pipeline leaks and drainage drips.' },
      { id: 'sub_pl_tap', name: 'Tap/Mixer Installation', basePrice: 199, description: 'Replacing or installing new bathroom and kitchen fittings.' },
      { id: 'sub_pl_block', name: 'Drain Unclogging', basePrice: 349, description: 'Clearing clogged sinks, bathroom drains and sewer lines.' }
    ]
  },
  {
    id: 'cat_electrician',
    name: 'Electrician',
    description: 'Complete wiring, switch repairs, appliances, and fan installations.',
    iconName: 'electric_bolt_rounded',
    subServices: [
      { id: 'sub_el_wiring', name: 'Short Circuit Repair', basePrice: 299, description: 'Diagnosing power outages, trip issues and wiring faults.' },
      { id: 'sub_el_fan', name: 'Ceiling Fan Installation', basePrice: 149, description: 'Mounting, wiring, and testing ceiling fans.' },
      { id: 'sub_el_switch', name: 'Switchboard Repair', basePrice: 99, description: 'Fixing sparks, socket defects and installing new switch boards.' }
    ]
  },
  {
    id: 'cat_carpenter',
    name: 'Carpenter',
    description: 'Furniture assembly, lock repair, and custom woodwork adjustments.',
    iconName: 'construction_rounded',
    subServices: [
      { id: 'sub_cp_door', name: 'Door & Lock Repair', basePrice: 199, description: 'Fixing door alignment, squeaking hinges, and lock replacements.' }
    ]
  }
];

// 1. Category List
// GET /api/v1/categories
router.get('/', async (req, res) => {
  try {
    let categories = await Category.find().maxTimeMS(3000);
    if (!categories || categories.length === 0) {
      categories = defaultCategories;
    }
    return res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (err) {
    return res.status(200).json({
      status: 'success',
      data: defaultCategories
    });
  }
});

// 2. Category Details
// GET /api/v1/categories/:id
router.get('/:id', async (req, res) => {
  try {
    let category = await Category.findOne({ id: req.params.id }).maxTimeMS(3000);
    if (!category) {
      category = defaultCategories.find(c => c.id === req.params.id) || defaultCategories[0];
    }
    return res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (err) {
    const category = defaultCategories.find(c => c.id === req.params.id) || defaultCategories[0];
    return res.status(200).json({
      status: 'success',
      data: category
    });
  }
});

// 3. Services by Category
// GET /api/v1/categories/:id/services
router.get('/:id/services', async (req, res) => {
  try {
    let category = await Category.findOne({ id: req.params.id }).maxTimeMS(3000);
    if (!category) {
      category = defaultCategories.find(c => c.id === req.params.id) || defaultCategories[0];
    }
    return res.status(200).json({
      status: 'success',
      data: category.subServices
    });
  } catch (err) {
    const category = defaultCategories.find(c => c.id === req.params.id) || defaultCategories[0];
    return res.status(200).json({
      status: 'success',
      data: category.subServices
    });
  }
});

// 4. Detailed Service Specs
// GET /api/v1/categories/service/details/:id
router.get('/service/details/:id', async (req, res) => {
  const serviceId = req.params.id;
  return res.status(200).json({
    status: 'success',
    data: {
      id: serviceId,
      name: 'Leakage & Pipe Repair',
      price: 249.0,
      duration: '45 Mins',
      description: 'Complete inspection and repairing of tap leaks, flush tanks, and drainage pipelines.',
      included: ['Inspection & Diagnosis', 'Minor Grouting & Sealing', '30-Day Service Warranty'],
      excluded: ['Spare Parts & Materials', 'Major Wall Chipping'],
      faqs: [
        { q: 'Are spare parts included?', a: 'Spare parts are charged separately based on actual MRP.' },
        { q: 'Is warranty provided?', a: 'Yes, 30 days post-service warranty is covered by Ghar Ka Sathi.' }
      ]
    }
  });
});

// 5. Dynamic Estimate Billing Calculation
// POST /api/v1/categories/service/estimate
router.post('/service/estimate', (req, res) => {
  const { serviceCharge = 300, coupon } = req.body;
  const visiting = 50;
  const platform = 15;

  let discount = 0;
  if (coupon === 'SAVE50') discount = 50;
  if (coupon === 'SGSAVE30') discount = Math.round(serviceCharge * 0.3);

  const taxable = serviceCharge - discount;
  const gst = Math.round(taxable * 0.18);
  const total = Math.max(0, taxable + visiting + platform + gst);

  return res.status(200).json({
    status: 'success',
    data: {
      serviceCharge,
      visiting,
      gst,
      platform,
      discount,
      total
    }
  });
});

export default router;
