const express = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');
const {
  uploadFile,
  downloadFile,
  getFileInfo,
  getUserFiles,
  deleteFile
} = require('../controllers/fileController');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'backend/temp/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.post('/download/:id', authMiddleware, downloadFile);
router.get('/info/:id', getFileInfo);
router.get('/my-files', authMiddleware, getUserFiles);
router.delete('/:id', authMiddleware, deleteFile);

module.exports = router;