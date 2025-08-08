const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  getStats,
  getAllFiles,
  deleteFileAdmin,
  getAllUsers,
  deleteUserAdmin
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);
router.get('/files', getAllFiles);
router.delete('/files/:id', deleteFileAdmin);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUserAdmin);

module.exports = router;