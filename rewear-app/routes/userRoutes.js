const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET /dashboard -> Render the user's private dashboard
router.get('/dashboard', protect, userController.getDashboard);

// GET /user/:id -> Render a public user profile page
router.get('/user/:id', userController.getUserProfile);

module.exports = router;
