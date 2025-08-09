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

const storage = process.env.STORAGE_MODE === 'gridfs' 
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'backend/temp/');
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
      }
    });

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.post('/download/:id', authMiddleware, downloadFile);
router.get('/info/:id', getFileInfo);
router.get('/my-files', authMiddleware, getUserFiles);
router.delete('/:id', authMiddleware, deleteFile);

module.exports = router;
