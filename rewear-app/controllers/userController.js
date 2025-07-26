const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.redirect('/login');
        
        const items = await Item.find({ owner: userId }).sort({ createdAt: -1 });

        // Fetch pending swaps
        const incomingSwaps = await Swap.find({ owner: userId, status: 'pending' })
            .populate('requester', 'username')
            .populate('requestedItem', 'title')
            .populate('offeredItem', 'title images');

        const outgoingSwaps = await Swap.find({ requester: userId, status: 'pending' })
            .populate('owner', 'username')
            .populate('requestedItem', 'title');

        // Fetch the 5 most recent past swaps
        const swapHistory = await Swap.find({
            $or: [{ owner: userId }, { requester: userId }],
            status: { $in: ['completed', 'rejected', 'cancelled'] }
        }).sort({ updatedAt: -1 })
          .limit(5) // This line limits the results to 5
          .populate('owner', 'username')
          .populate('requester', 'username')
          .populate('requestedItem', 'title')
          .populate('offeredItem', 'title');

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
