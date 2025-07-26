const Item = require('../models/Item');
const cloudinary = require('cloudinary').v2;

// @desc    Show the form to add a new item
const getNewItemForm = (req, res) => {
    res.render('items/new', {
        title: 'List a New Item'
    });
};

// @desc    Create a new item
const createItem = async (req, res) => {
    try {
        const { title, description, category, condition, size, price, state, city, area } = req.body;

        if (!state || !city || !area) {
            req.flash('error_msg', 'Please select a complete location (State, City, and Area).');
            return res.redirect('/items/new');
        }
        if (!req.files || req.files.length === 0) {
            req.flash('error_msg', 'You must upload at least one image.');
            return res.redirect('/items/new');
        }
        
        const images = req.files.map(f => ({ url: f.path, public_id: f.filename }));
        
        const newItem = new Item({
            title, description, category, condition, size, price,
            location: { state, city, area },
            images,
            owner: req.session.userId
        });
        
        await newItem.save();
        req.flash('success_msg', 'Your item has been successfully listed!');
        res.redirect(`/items/${newItem._id}`);
    } catch (error) {
        console.error("Error creating item:", error);
        req.flash('error_msg', 'There was a server error. Please try again.');
        res.redirect('/items/new');
    }
};

// @desc    Get all available items (excluding user's own items if logged in)
const getAllItems = async (req, res) => {
    try {
        let query = { status: 'available' };

        // If a user is logged in, exclude their own items from the list
        if (req.session.userId) {
            query.owner = { $ne: req.session.userId };
        }

        const items = await Item.find(query).populate('owner', 'username').sort({ createdAt: -1 });
        
        res.render('items/index', {
            title: 'Browse All Items',
            items
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// @desc    Get a single item by its ID
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('owner', 'username');
        if (!item) {
            req.flash('error_msg', 'Item not found.');
            return res.redirect('/items');
        }
        
        res.render('items/show', {
            title: item.title,
            item
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// @desc    Show the form to edit an item
const getEditItemForm = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error_msg', 'Item not found.');
            return res.redirect('/dashboard');
        }
        if (item.owner.toString() !== req.session.userId) {
            req.flash('error_msg', 'You are not authorized to edit this item.');
            return res.redirect('/dashboard');
        }
        res.render('items/edit', { title: 'Edit Item', item });
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

// @desc    Update an item
const updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item || item.owner.toString() !== req.session.userId) {
            return res.status(403).send('Not authorized');
        }

        if (req.body.imagesToDelete) {
            const publicIdsToDelete = req.body.imagesToDelete.split(',');
            for (const publicId of publicIdsToDelete) {
                await cloudinary.uploader.destroy(publicId);
            }
            item.images = item.images.filter(img => !publicIdsToDelete.includes(img.public_id));
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => ({ url: f.path, public_id: f.filename }));
            item.images.push(...newImages);
        }

        const { title, description, price, category, condition, size, state, city, area } = req.body;
        item.title = title;
        item.description = description;
        item.price = price;
        item.category = category;
        item.condition = condition;
        item.size = size;
        item.location = { state, city, area };
        
        await item.save();
        req.flash('success_msg', 'Item updated successfully!');
        res.redirect(`/items/${item._id}`);
    } catch (error) {
        console.error("Update Item Error:", error);
        req.flash('error_msg', 'Error updating item.');
        res.redirect(`/items/${req.params.id}/edit`);
    }
};

// @desc    Delete an item
const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).send('Item not found');
        if (item.owner.toString() !== req.session.userId) return res.status(403).send('Not authorized');

        await Item.findByIdAndDelete(req.params.id);
        
        req.flash('success_msg', 'Item has been deleted.');
        res.redirect('/dashboard');
    } catch (error) {
        req.flash('error_msg', 'Error deleting item.');
        res.redirect('/dashboard');
    }
};

module.exports = {
    getNewItemForm,
    createItem,
    getAllItems,
    getItemById,
    getEditItemForm,
    updateItem,
    deleteItem
};
