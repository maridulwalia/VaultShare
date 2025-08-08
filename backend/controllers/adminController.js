const User = require('../models/User');
const File = require('../models/File');
const fs = require('fs').promises;
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');

const getStats = async (req, res) => {
  try {
    const [userCount, fileCount, totalDownloads, activeFiles] = await Promise.all([
      User.countDocuments(),
      File.countDocuments(),
      File.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
      File.countDocuments({ isActive: true })
    ]);

    const recentUploads = await File.find()
      .populate('uploaderId', 'email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-encryptedKey -iv -passwordHash');

    res.json({
      stats: {
        users: userCount,
        totalFiles: fileCount,
        activeFiles,
        totalDownloads: totalDownloads[0]?.total || 0
      },
      recentUploads
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to get stats' });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const files = await File.find()
      .populate('uploaderId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-encryptedKey -iv -passwordHash');

    const total = await File.countDocuments();

    res.json({
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get files error:', error);
    res.status(500).json({ message: 'Failed to get files' });
  }
};

const deleteFileAdmin = async (req, res) => {
  try {
    const fileDoc = await File.findById(req.params.id);

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
    console.error('Admin delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const fileCount = await File.countDocuments({ uploaderId: user._id });
        const totalDownloads = await File.aggregate([
          { $match: { uploaderId: user._id } },
          { $group: { _id: null, total: { $sum: '$downloadCount' } } }
        ]);

        return {
          ...user.toObject(),
          fileCount,
          totalDownloads: totalDownloads[0]?.total || 0
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
};

const deleteUserAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Don't allow deleting admin users
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Get all files uploaded by this user
    const userFiles = await File.find({ uploaderId: userId });

    // Delete all encrypted files from filesystem
    for (const file of userFiles) {
      try {
        const encryptedPath = path.join(uploadDir, file.encryptedName);
        await fs.unlink(encryptedPath);
      } catch (fsError) {
        console.warn('Failed to delete file from filesystem:', fsError);
      }
    }

    // Delete all files from database
    await File.deleteMany({ uploaderId: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all associated files deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

module.exports = {
  getStats,
  getAllFiles,
  deleteFileAdmin,
  getAllUsers,
  deleteUserAdmin
};