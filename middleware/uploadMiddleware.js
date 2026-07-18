import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Engine Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || getExtensionFromMime(file.mimetype);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Helper: Infer file extension if missing
const getExtensionFromMime = (mime) => {
  switch (mime) {
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    case 'audio/mpeg': return '.mp3';
    case 'audio/wav': return '.wav';
    case 'audio/aac': return '.aac';
    case 'audio/m4a': return '.m4a';
    case 'video/mp4': return '.mp4';
    case 'application/pdf': return '.pdf';
    default: return '.bin';
  }
};

// File Filter Criteria
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/m4a', 'audio/ogg',
    'video/mp4', 'video/mkv', 'video/webm',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: Images, Audio, Video, PDF/Word docs.`), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Max limit
  fileFilter
});

export const uploadSingleImage = upload.single('image');
export const uploadSingleAudio = upload.single('audio');
export const uploadSingleVideo = upload.single('video');
export const uploadSingleDocument = upload.single('document');
export const uploadMultiplePhotos = upload.array('photos', 5);
