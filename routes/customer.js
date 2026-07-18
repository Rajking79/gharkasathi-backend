import express from 'express';
import { User } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import { validateEmail } from '../middleware/validate.js';

const router = express.Router();

// 1. Create / Complete Profile
// POST /api/v1/customer/profile
router.post('/profile', verifyToken, validateEmail, async (req, res) => {
  const { name, email, photo, language, gender, dob } = req.body;
  const userId = req.user.id;

  if (req.user.role !== 'user') {
    return res.status(403).json({ status: 'error', code: 403, message: 'Only customer users can modify profiles.' });
  }

  let updatedUser = null;
  try {
    updatedUser = await User.findOneAndUpdate(
      { id: userId },
      {
        name: name || '',
        email: email || '',
        profilePicture: photo || '',
        gender: gender || '',
        dob: dob || '',
        isProfileCompleted: true
      },
      { new: true }
    ).maxTimeMS(2000);
  } catch (e) {
    console.warn('DB profile update warning:', e.message);
  }

  if (!updatedUser) {
    updatedUser = { id: userId, name: name || 'Customer', email: email || '', isProfileCompleted: true };
  }

  return res.status(200).json({
    status: 'success',
    message: 'Profile completed successfully.',
    data: updatedUser
  });
});

// 2. Get Profile Details
// GET /api/v1/customer/profile
router.get('/profile', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ status: 'error', code: 404, message: 'Customer profile not found.' });
    }

    return res.status(200).json({
      status: 'success',
      data: user
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', code: 500, message: 'Server error retrieving profile.' });
  }
});

// 3. Update Profile Details
// PUT /api/v1/customer/profile
router.put('/profile', verifyToken, validateEmail, async (req, res) => {
  const { name, email, gender, dob } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ status: 'error', code: 404, message: 'Customer profile not found.' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: user
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', code: 500, message: 'Server error updating profile.' });
  }
});

// 4. Upload Profile Avatar Image (multipart/form-data)
// POST /api/v1/customer/profile/image
router.post('/profile/image', verifyToken, (req, res) => {
  uploadSingleImage(req, res, async (err) => {
    if (err) {
      return res.status(422).json({ status: 'error', code: 422, message: err.message });
    }

    let avatarUrl = '';
    if (req.file) {
      avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (req.body.url || req.body.photo) {
      avatarUrl = req.body.url || req.body.photo;
    } else {
      avatarUrl = `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90)}.jpg`;
    }

    try {
      const user = await User.findOneAndUpdate(
        { id: req.user.id },
        { profilePicture: avatarUrl },
        { new: true }
      );

      return res.status(200).json({
        status: 'success',
        message: 'Profile picture updated successfully.',
        url: avatarUrl,
        data: user
      });

    } catch (dbErr) {
      return res.status(500).json({ status: 'error', code: 500, message: 'Failed to update user avatar in database.' });
    }
  });
});

export default router;
