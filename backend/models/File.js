const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  encryptedName: {
    type: String,
    required: true,
    unique: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  encryptedKey: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  maxDownloads: {
    type: Number,
    default: null
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isLoginRequired: {
    type: Boolean,
    default: false
  },
  authorizedEmails: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastDownload: {
    type: Date
  }
});

// Index for cleanup of expired files
fileSchema.index({ expiryDate: 1 });
fileSchema.index({ uploaderId: 1 });

module.exports = mongoose.model('File', fileSchema);