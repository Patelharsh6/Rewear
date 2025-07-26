const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, chatController.getChatPage);
router.get('/start/:receiverId', protect, chatController.startOrGetConversation);
router.get('/:conversationId', protect, chatController.getConversationMessages);

// New routes for marking as read and deleting
router.post('/:conversationId/read', protect, chatController.markConversationAsRead);
router.post('/:conversationId/delete', protect, chatController.deleteConversation);

module.exports = router;
