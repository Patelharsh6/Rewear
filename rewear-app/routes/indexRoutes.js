const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const Item = require('../models/Item');

const ITEMS_PER_PAGE = 21;

// GET / -> Render homepage with filtered items
router.get('/', async (req, res) => {
    try {
        const page = 1;
        let query = { status: 'available' };

        // If a user is logged in, exclude their own items
        if (req.session.userId) {
            query.owner = { $ne: req.session.userId };
        }

        const items = await Item.find(query)
            .sort({ createdAt: -1 })
            .limit(ITEMS_PER_PAGE)
            .populate('owner', 'username');

        const totalItems = await Item.countDocuments(query);
        const hasMore = totalItems > ITEMS_PER_PAGE;

        res.render('index', { 
            title: 'Welcome to ReWear',
            items: items,
            hasMore: hasMore
        });
    } catch (error) {
        console.error("Homepage Error:", error);
        res.render('index', { title: 'Welcome to ReWear', items: [], hasMore: false });
    }
});

// API endpoint to fetch more items with the same filtering logic
router.get('/api/items', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        
        let query = { status: 'available' };
        if (req.session.userId) {
            query.owner = { $ne: req.session.userId };
        }

        const items = await Item.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ITEMS_PER_PAGE)
            .populate('owner', 'username');
        
        const totalItems = await Item.countDocuments(query);
        const hasMore = (skip + items.length) < totalItems;

        res.json({ items, hasMore });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// --- Other Routes ---
router.get('/login', (req, res) => res.render('login', { title: 'Login' }));
router.get('/signup', (req, res) => res.render('signup', { title: 'Sign Up' }));
router.get('/logout', authController.logoutUser);
router.post('/signup', authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;
