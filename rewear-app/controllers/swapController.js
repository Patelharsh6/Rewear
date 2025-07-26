const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');

const getDirectSwapForm = async (req, res) => {
    try {
        const requestedItem = await Item.findById(req.params.itemId).populate('owner', 'username');
        if (!requestedItem) {
            req.flash('error_msg', 'Item not found.');
            return res.redirect('/items');
        }
        const userItems = await Item.find({ owner: req.session.userId, status: 'available' });
        res.render('swaps/new', {
            title: 'Request a Direct Swap',
            requestedItem,
            userItems
        });
    } catch (error) {
        console.error('Direct Swap Form Error:', error);
        res.status(500).send('Server error');
    }
};

const requestDirectSwap = async (req, res) => {
    try {
        const { offeredItemId } = req.body;
        const requestedItemId = req.params.itemId;
        const requesterId = req.session.userId;

        if (!offeredItemId) {
            req.flash('error_msg', 'You must select an item to offer.');
            return res.redirect(`/swaps/request/direct/${requestedItemId}`);
        }

        const requestedItem = await Item.findById(requestedItemId);
        const offeredItem = await Item.findById(offeredItemId);

        if (!requestedItem || !offeredItem) return res.status(404).send('One of the items was not found.');
        if (offeredItem.owner.toString() !== requesterId) return res.status(403).send('You can only offer items you own.');
        if (requestedItem.status !== 'available' || offeredItem.status !== 'available') return res.status(400).send('One or more items are not available for swapping.');

        const newSwap = new Swap({
            requester: requesterId,
            owner: requestedItem.owner,
            requestedItem: requestedItemId,
            offeredItem: offeredItemId,
            swapType: 'direct',
            status: 'pending'
        });

        requestedItem.status = 'pending_swap';
        offeredItem.status = 'pending_swap';

        await newSwap.save();
        await requestedItem.save();
        await offeredItem.save();
        
        req.flash('success_msg', 'Direct swap requested successfully!');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Direct Swap Request Error:', error);
        res.status(500).send('Server error while requesting swap.');
    }
};

const respondToSwap = async (req, res) => {
    try {
        const { swapId } = req.params;
        const { action } = req.body;
        const currentUserId = req.session.userId;

        const swap = await Swap.findById(swapId).populate('requestedItem').populate('offeredItem');

        if (!swap || swap.owner.toString() !== currentUserId || swap.status !== 'pending') {
            req.flash('error_msg', 'Invalid swap request.');
            return res.redirect('/dashboard');
        }

        if (action === 'accept') {
            const requester = await User.findById(swap.requester);
            const owner = await User.findById(swap.owner);
            
            const requestedItem = swap.requestedItem;
            const offeredItem = swap.offeredItem;

            // Swap ownership
            requestedItem.owner = swap.requester;
            offeredItem.owner = swap.owner;

            requestedItem.status = 'swapped';
            offeredItem.status = 'swapped';
            
            swap.status = 'completed';

            requester.swapsMade += 1;
            owner.swapsMade += 1;

            await requestedItem.save();
            await offeredItem.save();
            await requester.save();
            await owner.save();
            
            req.flash('success_msg', 'Swap accepted!');

        } else if (action === 'reject') {
            swap.status = 'rejected';
            swap.requestedItem.status = 'available';
            swap.offeredItem.status = 'available';
            await swap.requestedItem.save();
            await swap.offeredItem.save();
            req.flash('success_msg', 'Swap rejected.');
        }

        await swap.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Respond to Swap Error:', error);
        req.flash('error_msg', 'Server error while responding to swap.');
        res.redirect('/dashboard');
    }
};

module.exports = {
    getDirectSwapForm,
    requestDirectSwap,
    respondToSwap
};

