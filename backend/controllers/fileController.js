const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const File = require('../models/File');
const { encryptFile, decryptFile, generateKey, generateIV } = require('../utils/encryption');

const uploadDir = path.join(__dirname, '../uploads');

// Ensure upload directory exists (only for local)
if (process.env.STORAGE_MODE === 'local') {
  fs.mkdir(uploadDir, { recursive: true }).catch(console.error);
}

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const {
      password,
      expiryHours,
      maxDownloads,
      isLoginRequired,
      authorizedEmails
    } = req.body;

    // Generate encryption key and IV
    const key = generateKey();
    const iv = generateIV();

    // Read and encrypt file
    let fileBuffer;

    if (process.env.STORAGE_MODE === 'gridfs') {
      // For GridFS: file is in memory buffer (depends on multer storage config)
      fileBuffer = req.file.buffer;
    } else {
      // Local: read from temp file saved on disk by multer
      fileBuffer = await fs.readFile(req.file.path);
    }

    const encryptedBuffer = encryptFile(fileBuffer, key, iv);

    let encryptedName;
    if (process.env.STORAGE_MODE === 'gridfs') {
      // Store encryptedBuffer in GridFS, generate a filename or use Mongo _id
      // We'll handle GridFS write below after saving fileDoc
      encryptedName = null; // No file path needed for GridFS
    } else {
      // Local storage encrypted filename
      encryptedName = `${Date.now()}_${Math.random().toString(36).substring(2)}.enc`;
      const encryptedPath = path.join(uploadDir, encryptedName);
      await fs.writeFile(encryptedPath, encryptedBuffer);
      // Remove original uploaded file
      await fs.unlink(req.file.path);
    }

    // Calculate expiry date
    let expiryDate = null;
    if (expiryHours && parseInt(expiryHours) > 0) {
      expiryDate = new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000);
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Save file metadata
    const fileDoc = new File({
      originalName: req.file.originalname,
      encryptedName, // null if gridfs mode
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploaderId: req.user._id,
      encryptedKey: key.toString('base64'),
      iv: iv.toString('base64'),
      passwordHash,
      expiryDate,
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
      isLoginRequired: isLoginRequired === 'true',
      authorizedEmails: authorizedEmails ? JSON.parse(authorizedEmails) : []
    });

    await fileDoc.save();

    if (process.env.STORAGE_MODE === 'gridfs') {
      // Save encryptedBuffer to GridFS with fileDoc._id as filename or metadata
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
      });

      const uploadStream = bucket.openUploadStream(fileDoc._id.toString(), {
        metadata: {
          mimetype: req.file.mimetype,
          originalName: req.file.originalname,
        }
      });

      uploadStream.end(encryptedBuffer);
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });
    }

    res.json({
      file: {
        id: fileDoc._id,
        originalName: fileDoc.originalName,
        size: fileDoc.size,
        downloadUrl: `/api/files/download/${fileDoc._id}`
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

const downloadFile = async (req, res) => {
  try {
    const fileDoc = await File.findById(req.params.id);

    if (!fileDoc || !fileDoc.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check expiry, download limits, login, password (unchanged)...

    // Read and decrypt file buffer based on storage mode
    let decryptedBuffer;

    if (process.env.STORAGE_MODE === 'gridfs') {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
      });

      const downloadStream = bucket.openDownloadStream(fileDoc._id);

      // Accumulate chunks from stream
      const chunks = [];
      await new Promise((resolve, reject) => {
        downloadStream.on('data', (chunk) => chunks.push(chunk));
        downloadStream.on('error', reject);
        downloadStream.on('end', resolve);
      });

      const encryptedBuffer = Buffer.concat(chunks);
      const key = Buffer.from(fileDoc.encryptedKey, 'base64');
      const iv = Buffer.from(fileDoc.iv, 'base64');
      decryptedBuffer = decryptFile(encryptedBuffer, key, iv);
    } else {
      const encryptedPath = path.join(uploadDir, fileDoc.encryptedName);
      const encryptedBuffer = await fs.readFile(encryptedPath);
      const key = Buffer.from(fileDoc.encryptedKey, 'base64');
      const iv = Buffer.from(fileDoc.iv, 'base64');
      decryptedBuffer = decryptFile(encryptedBuffer, key, iv);
    }

    // Update download counts, deactivate if needed (unchanged)...

    // Send file
    res.set({
      'Content-Type': fileDoc.mimetype,
      'Content-Disposition': `attachment; filename="${fileDoc.originalName}"`
    });

    res.send(decryptedBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Download failed' });
  }
};

// The rest of your controller functions (getFileInfo, getUserFiles, deleteFile) stay mostly the same
// except deleteFile also needs to remove from GridFS in gridfs mode:

const deleteFile = async (req, res) => {
  try {
    const fileDoc = await File.findOne({
      _id: req.params.id,
      uploaderId: req.user._id
    });

    if (!fileDoc) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (process.env.STORAGE_MODE === 'gridfs') {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
      });
      await bucket.delete(new mongoose.Types.ObjectId(fileDoc._id));
    } else {
      // Delete encrypted file from filesystem
      try {
        const encryptedPath = path.join(uploadDir, fileDoc.encryptedName);
        await fs.unlink(encryptedPath);
      } catch (fsError) {
        console.warn('Failed to delete file from filesystem:', fsError);
      }
    }

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

module.exports = {
  uploadFile,
  downloadFile,
  getFileInfo,
  getUserFiles,
  deleteFile
};
