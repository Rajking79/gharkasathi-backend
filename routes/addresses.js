import express from 'express';
import { User } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get all saved addresses of customer
// GET /api/v1/address
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ status: 'error', message: 'Only customer users can manage addresses.' });
  }

  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    return res.status(200).json({
      status: 'success',
      data: user.savedAddresses || []
    });
  } catch (err) {
    console.error('Error fetching addresses:', err);
    return res.status(500).json({ status: 'error', message: 'Server error retrieving addresses.' });
  }
});

// 2. Add a new saved address
// POST /api/v1/address
router.post('/', verifyToken, async (req, res) => {
  const { house, building, landmark, latitude, longitude, floor, tag, isDefault } = req.body;
  
  if (req.user.role !== 'user') {
    return res.status(403).json({ status: 'error', message: 'Access denied.' });
  }

  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      user.savedAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    const addressId = `addr_${Date.now()}`;
    const addressLineCombined = `${house || ''} ${building || ''}, ${landmark || ''}`.trim();

    const newAddress = {
      id: addressId,
      addressLine: addressLineCombined || 'Custom Location',
      house: house || '',
      building: building || '',
      landmark: landmark || '',
      latitude: latitude || 0.0,
      longitude: longitude || 0.0,
      floor: floor || '',
      tag: tag || 'Home',
      isDefault: !!isDefault
    };

    user.savedAddresses.push(newAddress);
    await user.save();

    return res.status(201).json({
      status: 'success',
      message: 'Address saved successfully.',
      data: newAddress
    });

  } catch (err) {
    console.error('Error saving address:', err);
    return res.status(500).json({ status: 'error', message: 'Server error saving address.' });
  }
});

// 3. Update saved address
// PUT /api/v1/address/:id
router.put('/:id', verifyToken, async (req, res) => {
  const addressId = req.params.id;
  const { house, building, landmark, latitude, longitude, floor, tag, isDefault } = req.body;

  if (req.user.role !== 'user') {
    return res.status(403).json({ status: 'error', message: 'Access denied.' });
  }

  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    const addrIndex = user.savedAddresses.findIndex(addr => addr.id === addressId);
    if (addrIndex === -1) {
      return res.status(404).json({ status: 'error', message: 'Address not found.' });
    }

    if (isDefault) {
      user.savedAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    const existing = user.savedAddresses[addrIndex];
    
    if (house !== undefined) existing.house = house;
    if (building !== undefined) existing.building = building;
    if (landmark !== undefined) existing.landmark = landmark;
    if (latitude !== undefined) existing.latitude = latitude;
    if (longitude !== undefined) existing.longitude = longitude;
    if (floor !== undefined) existing.floor = floor;
    if (tag !== undefined) existing.tag = tag;
    if (isDefault !== undefined) existing.isDefault = !!isDefault;

    existing.addressLine = `${existing.house || ''} ${existing.building || ''}, ${existing.landmark || ''}`.trim() || 'Custom Location';

    user.markModified('savedAddresses');
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Address updated successfully.',
      data: existing
    });

  } catch (err) {
    console.error('Error updating address:', err);
    return res.status(500).json({ status: 'error', message: 'Server error updating address.' });
  }
});

// 4. Delete saved address
// DELETE /api/v1/address/:id
router.delete('/:id', verifyToken, async (req, res) => {
  const addressId = req.params.id;

  if (req.user.role !== 'user') {
    return res.status(403).json({ status: 'error', message: 'Access denied.' });
  }

  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    const initialLength = user.savedAddresses.length;
    user.savedAddresses = user.savedAddresses.filter(addr => addr.id !== addressId);

    if (user.savedAddresses.length === initialLength) {
      return res.status(404).json({ status: 'error', message: 'Address not found.' });
    }

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Address deleted successfully.'
    });

  } catch (err) {
    console.error('Error deleting address:', err);
    return res.status(500).json({ status: 'error', message: 'Server error deleting address.' });
  }
});

// 5. Set default address
// PATCH /api/v1/address/default
router.patch('/default', verifyToken, async (req, res) => {
  const { addressId } = req.body;

  if (!addressId) {
    return res.status(400).json({ status: 'error', message: 'Address ID is required.' });
  }

  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    let found = false;
    user.savedAddresses.forEach(addr => {
      if (addr.id === addressId) {
        addr.isDefault = true;
        found = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!found) {
      return res.status(404).json({ status: 'error', message: 'Address ID not found.' });
    }

    user.markModified('savedAddresses');
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Default address updated successfully.'
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error setting default address.' });
  }
});

export default router;
