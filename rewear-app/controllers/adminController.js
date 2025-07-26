const Item = require('../models/Item');
const User = require('../models/User');

// @desc    Get the admin dashboard with all items and users
// @route   GET /admin/dashboard
// @access  Admin
exports.getAdminDashboard = async (req, res) => {
    try {
        // Fetch all items from the database, sorted by newest first
        const allItems = await Item.find({}).populate('owner', 'username').sort({ createdAt: -1 });
        
        // Fetch all users
        const allUsers = await User.find({}).sort({ createdAt: -1 });

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            items: allItems,
            users: allUsers
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).send('Server error');
    }
};

// @desc    Delete an item
// @route   POST /admin/items/:id/delete
// @access  Admin
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).send('Item not found');
        }

        // In a real app, you would also delete the images from Cloudinary here
        // for now, we will just delete the database record.
        
        await Item.findByIdAndDelete(req.params.id);

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Item Deletion Error:', error);
        res.status(500).send('Server error');
    }
};
