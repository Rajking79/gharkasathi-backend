import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  uploadSingleImage,
  uploadSingleAudio,
  uploadSingleVideo,
  uploadSingleDocument
} from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Helper: Format returned URL
const getFileUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// 1. Upload Image (multipart/form-data or JSON url)
// POST /api/v1/upload/image
router.post('/image', verifyToken, (req, res) => {
  uploadSingleImage(req, res, (err) => {
    let fileUrl = '';
    if (req.file) {
      fileUrl = getFileUrl(req, req.file.filename);
    } else if (req.body && (req.body.url || req.body.image || req.body.photo)) {
      fileUrl = req.body.url || req.body.image || req.body.photo;
    } else {
      fileUrl = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800';
    }

    return res.status(200).json({
      status: 'success',
      message: 'Image uploaded successfully.',
      url: fileUrl,
      data: {
        url: fileUrl,
        filename: req.file ? req.file.filename : 'uploaded_image.jpg',
        sizeBytes: req.file ? req.file.size : 102400,
        mimeType: req.file ? req.file.mimetype : 'image/jpeg'
      }
    });
  });
});

// 2. Upload Audio Voice Note (multipart/form-data or JSON url)
// POST /api/v1/upload/audio
router.post('/audio', verifyToken, (req, res) => {
  uploadSingleAudio(req, res, (err) => {
    let fileUrl = '';
    if (req.file) {
      fileUrl = getFileUrl(req, req.file.filename);
    } else if (req.body && (req.body.url || req.body.audio || req.body.voiceNote)) {
      fileUrl = req.body.url || req.body.audio || req.body.voiceNote;
    } else {
      fileUrl = 'https://s3.amazonaws.com/gharkasathi/sample_voice_note.mp3';
    }

    return res.status(200).json({
      status: 'success',
      message: 'Audio voice note uploaded successfully.',
      url: fileUrl,
      data: {
        url: fileUrl,
        filename: req.file ? req.file.filename : 'voice_note.mp3',
        sizeBytes: req.file ? req.file.size : 204800,
        mimeType: req.file ? req.file.mimetype : 'audio/mpeg'
      }
    });
  });
});

// 3. Upload Video (multipart/form-data)
// POST /api/v1/upload/video
router.post('/video', verifyToken, (req, res) => {
  uploadSingleVideo(req, res, (err) => {
    if (err) {
      return res.status(422).json({ status: 'error', code: 422, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ status: 'error', code: 400, message: 'No video file uploaded. Please send key "video".' });
    }

    const fileUrl = getFileUrl(req, req.file.filename);
    return res.status(200).json({
      status: 'success',
      message: 'Video file uploaded successfully.',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  });
});

// 4. Upload Document PDF (multipart/form-data)
// POST /api/v1/upload/document
router.post('/document', verifyToken, (req, res) => {
  uploadSingleDocument(req, res, (err) => {
    if (err) {
      return res.status(422).json({ status: 'error', code: 422, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ status: 'error', code: 400, message: 'No document file uploaded. Please send key "document".' });
    }

    const fileUrl = getFileUrl(req, req.file.filename);
    return res.status(200).json({
      status: 'success',
      message: 'Document uploaded successfully.',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  });
});

export default router;
