const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// GET /admin/dashboard -> Show the admin dashboard
// The middleware runs in order: first checks for login, then checks for admin role.
router.get('/dashboard', protect, isAdmin, adminController.getAdminDashboard);

// POST /admin/items/:id/delete -> Delete an item
router.post('/items/:id/delete', protect, isAdmin, adminController.deleteItem);

module.exports = router;
