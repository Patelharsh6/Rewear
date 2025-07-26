const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// GET /cart -> Show the cart page
router.get('/', protect, cartController.getCart);

// POST /cart/add/:itemId -> Add an item to the cart
router.post('/add/:itemId', protect, cartController.addToCart);

// POST /cart/remove/:itemId -> Remove an item from the cart
router.post('/remove/:itemId', protect, cartController.removeFromCart);

module.exports = router;
