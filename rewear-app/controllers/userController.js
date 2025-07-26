const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');

// @desc    Get the logged-in user's dashboard
// @route   GET /dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.redirect('/login');
        
        const items = await Item.find({ owner: userId }).sort({ createdAt: -1 });

        const incomingSwaps = await Swap.find({ owner: userId, status: 'pending' }).populate('requester', 'username').populate('requestedItem', 'title').populate('offeredItem', 'title images');
        const outgoingSwaps = await Swap.find({ requester: userId, status: 'pending' }).populate('owner', 'username').populate('requestedItem', 'title');
        const swapHistory = await Swap.find({
            $or: [{ owner: userId }, { requester: userId }],
            status: { $in: ['completed', 'rejected', 'cancelled'] }
        }).sort({ updatedAt: -1 }).limit(5).populate('owner', 'username').populate('requester', 'username').populate('requestedItem', 'title').populate('offeredItem', 'title');

        res.render('dashboard', {
            title: 'My Dashboard',
            user,
            items,
            incomingSwaps,
            outgoingSwaps,
            swapHistory
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).send('Server error while loading dashboard.');
    }
};

// @desc    Get a public user profile
// @route   GET /user/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
    try {
        const profileUser = await User.findById(req.params.id).select('-password -email'); // Exclude sensitive info
        if (!profileUser) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/items');
        }

        // Fetch only the available items for the public profile
        const items = await Item.find({ owner: profileUser._id, status: 'available' }).sort({ createdAt: -1 });

        res.render('profile', {
            title: `${profileUser.username}'s Profile`,
            profileUser,
            items
        });

    } catch (error) {
        console.error('Get User Profile Error:', error);
        req.flash('error_msg', 'Could not load user profile.');
        res.redirect('/items');
    }
};
