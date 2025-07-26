const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', itemController.getAllItems);
router.get('/new', protect, itemController.getNewItemForm);
router.post('/', protect, upload.array('images', 8), itemController.createItem);
router.get('/:id', itemController.getItemById);

// Edit and Update routes
router.get('/:id/edit', protect, itemController.getEditItemForm);
// Add the upload middleware to the update route
router.post('/:id', protect, upload.array('images', 8), itemController.updateItem);

// Delete route
router.post('/:id/delete', protect, itemController.deleteItem);

module.exports = router;
