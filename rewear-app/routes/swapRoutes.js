const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

router.get('/request/direct/:itemId', protect, swapController.getDirectSwapForm);
router.post('/request/direct/:itemId', protect, swapController.requestDirectSwap);
router.post('/respond/:swapId', protect, swapController.respondToSwap);

module.exports = router;