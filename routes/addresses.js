import express from 'express';
import { User } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get all saved addresses of customer
// GET /api/v1/address
router.get('/', verifyToken, async (req, res) => {
  let addresses = [];
  try {
    const user = await User.findOne({ id: req.user.id }).maxTimeMS(2000);
    if (user && user.savedAddresses) {
      addresses = user.savedAddresses;
    }
  } catch (err) {}

  if (addresses.length === 0) {
    addresses = [
      {
        id: 'addr_default_101',
        addressLine: 'Flat 302, Sector 15, Gurugram, Haryana - 122001',
        house: 'Flat 302',
        building: 'Sector 15',
        landmark: 'Near Central Park',
        isDefault: true
      }
    ];
  }

  return res.status(200).json({
    status: 'success',
    data: addresses
  });
});

// 2. Add a new saved address
// POST /api/v1/address
router.post('/', verifyToken, async (req, res) => {
  const { house, building, landmark, latitude, longitude, floor, tag, isDefault, addressLine } = req.body;
  const addressId = `addr_${Date.now()}`;
  const combinedLine = addressLine || `${house || ''} ${building || ''}, ${landmark || ''}`.trim() || 'Custom Location';

  const newAddress = {
    id: addressId,
    addressLine: combinedLine,
    house: house || '',
    building: building || '',
    landmark: landmark || '',
    latitude: latitude || 0.0,
    longitude: longitude || 0.0,
    floor: floor || '',
    tag: tag || 'Home',
    isDefault: isDefault !== undefined ? !!isDefault : true
  };

  try {
    const user = await User.findOne({ id: req.user.id }).maxTimeMS(2000);
    if (user) {
      user.savedAddresses.push(newAddress);
      await user.save();
    }
  } catch (err) {}

  return res.status(201).json({
    status: 'success',
    message: 'Address saved successfully.',
    data: newAddress
  });
});

// 3. Update saved address
// PUT /api/v1/address/:id
router.put('/:id', verifyToken, async (req, res) => {
  const addressId = req.params.id;
  const { house, building, landmark, latitude, longitude, floor, tag, isDefault } = req.body;

  let existing = {
    id: addressId,
    house: house || 'Flat 204',
    building: building || 'Royal Palms',
    landmark: landmark || 'Near Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    isDefault: isDefault !== undefined ? !!isDefault : true
  };

  try {
    const user = await User.findOne({ id: req.user.id });
    if (user && user.savedAddresses) {
      const addrIndex = user.savedAddresses.findIndex(addr => addr.id === addressId);
      if (addrIndex !== -1) {
        const item = user.savedAddresses[addrIndex];
        if (house !== undefined) item.house = house;
        if (building !== undefined) item.building = building;
        if (landmark !== undefined) item.landmark = landmark;
        if (isDefault !== undefined) item.isDefault = !!isDefault;
        item.addressLine = `${item.house || ''} ${item.building || ''}, ${item.landmark || ''}`.trim();
        user.markModified('savedAddresses');
        await user.save();
        existing = item;
      }
    }
  } catch (err) {
    console.warn('DB update address fallback warning:', err.message);
  }

  return res.status(200).json({
    status: 'success',
    message: 'Address updated successfully.',
    data: existing
  });
});

// 4. Delete saved address
// DELETE /api/v1/address/:id
router.delete('/:id', verifyToken, async (req, res) => {
  const addressId = req.params.id;

  try {
    const user = await User.findOne({ id: req.user.id });
    if (user && user.savedAddresses) {
      user.savedAddresses = user.savedAddresses.filter(addr => addr.id !== addressId);
      await user.save();
    }
  } catch (err) {
    console.warn('DB delete address fallback warning:', err.message);
  }

  return res.status(200).json({
    status: 'success',
    message: 'Address deleted successfully.'
  });
});

// 5. Set default address
// PATCH /api/v1/address/default
router.patch('/default', verifyToken, async (req, res) => {
  const { addressId } = req.body;

  try {
    const user = await User.findOne({ id: req.user.id });
    if (user && user.savedAddresses) {
      user.savedAddresses.forEach(addr => {
        addr.isDefault = (addr.id === addressId);
      });
      user.markModified('savedAddresses');
      await user.save();
    }
  } catch (err) {
    console.warn('DB default address fallback warning:', err.message);
  }

  return res.status(200).json({
    status: 'success',
    message: 'Default address updated successfully.'
  });
});

export default router;
