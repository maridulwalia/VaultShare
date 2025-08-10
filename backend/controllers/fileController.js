const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const File = require('../models/File');
const { encryptFile, decryptFile, generateKey, generateIV } = require('../utils/encryption');

const uploadDir = path.join(__dirname, '../uploads');

// Ensure upload directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

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
    const fileBuffer = await fs.readFile(req.file.path);
    const encryptedBuffer = encryptFile(fileBuffer, key, iv);

    // Generate unique encrypted filename
    const encryptedName = `${Date.now()}_${Math.random().toString(36).substring(2)}.enc`;
    const encryptedPath = path.join(uploadDir, encryptedName);

    // Save encrypted file
    await fs.writeFile(encryptedPath, encryptedBuffer);

    // Remove original file
    await fs.unlink(req.file.path);

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
      encryptedName,
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

    const backendBase = process.env.BACKEND_URL || 'http://localhost:5000';
    
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

    // Check expiry
    if (fileDoc.expiryDate && new Date() > fileDoc.expiryDate) {
      fileDoc.isActive = false;
      await fileDoc.save();
      return res.status(410).json({ message: 'File has expired' });
    }

    // Check download limit
    if (fileDoc.maxDownloads && fileDoc.downloadCount >= fileDoc.maxDownloads) {
      fileDoc.isActive = false;
      await fileDoc.save();
      return res.status(410).json({ message: 'Download limit reached' });
    }

    // Check login requirement
    if (fileDoc.isLoginRequired && !req.user) {
      return res.status(401).json({ message: 'Login required to download this file' });
    }

    // Check email restriction
    if (
      fileDoc.authorizedEmails &&
      fileDoc.authorizedEmails.length > 0
    ) {
      if (!req.user || !req.user.email) {
        return res.status(401).json({ message: 'Login required to download this file' });
      }
      const isAllowed = fileDoc.authorizedEmails.includes(req.user.email);
      if (!isAllowed) {
        return res.status(403).json({ message: 'You are not authorized to download this file' });
      }
    }

    // Check password if provided in request
    if (fileDoc.passwordHash) {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: 'Password required' });
      }

      const isPasswordValid = await bcrypt.compare(password, fileDoc.passwordHash);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
      }
    }

    // Read and decrypt file
    const encryptedPath = path.join(uploadDir, fileDoc.encryptedName);
    const encryptedBuffer = await fs.readFile(encryptedPath);
    
    const key = Buffer.from(fileDoc.encryptedKey, 'base64');
    const iv = Buffer.from(fileDoc.iv, 'base64');
    const decryptedBuffer = decryptFile(encryptedBuffer, key, iv);

    // Update download count and last download
    fileDoc.downloadCount += 1;
    fileDoc.lastDownload = new Date();

    // Check if we should deactivate after this download
    if (fileDoc.maxDownloads && fileDoc.downloadCount >= fileDoc.maxDownloads) {
      fileDoc.isActive = false;
    }

    await fileDoc.save();

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

const getFileInfo = async (req, res) => {
  try {
    const fileDoc = await File.findById(req.params.id).select('-encryptedKey -iv');

    if (!fileDoc || !fileDoc.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check expiry
    if (fileDoc.expiryDate && new Date() > fileDoc.expiryDate) {
      return res.status(410).json({ message: 'File has expired' });
    }

    res.json({
      id: fileDoc._id,
      originalName: fileDoc.originalName,
      size: fileDoc.size,
      mimetype: fileDoc.mimetype,
      hasPassword: !!fileDoc.passwordHash,
      isLoginRequired: fileDoc.isLoginRequired,
      hasEmailRestriction: fileDoc.authorizedEmails && fileDoc.authorizedEmails.length > 0,
      maxDownloads: fileDoc.maxDownloads,
      downloadCount: fileDoc.downloadCount,
      expiryDate: fileDoc.expiryDate,
      createdAt: fileDoc.createdAt
    });
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({ message: 'Failed to get file info' });
  }
};

const getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ uploaderId: req.user._id })
      .select('-encryptedKey -iv')
      .lean()
      .sort({ createdAt: -1 });

    // Add hasPassword field
    const filesWithPasswordInfo = files.map(file => ({
      ...file,
      hasPassword: !!file.passwordHash
    }));

    res.json(filesWithPasswordInfo);
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({ message: 'Failed to get files' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const fileDoc = await File.findOne({
      _id: req.params.id,
      uploaderId: req.user._id
    });

    if (!fileDoc) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete encrypted file from filesystem
    try {
      const encryptedPath = path.join(uploadDir, fileDoc.encryptedName);
      await fs.unlink(encryptedPath);
    } catch (fsError) {
      console.warn('Failed to delete file from filesystem:', fsError);
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