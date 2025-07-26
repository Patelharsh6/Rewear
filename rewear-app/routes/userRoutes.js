const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET /dashboard -> Render the user dashboard
// The 'protect' middleware runs first. If the user is not logged in,
// it will redirect to /login before userController.getDashboard is ever called.
router.get('/dashboard', protect, userController.getDashboard);

module.exports = router;
