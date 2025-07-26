const Cart = require('../models/Cart');
const Item = require('../models/Item');

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.session.userId }).populate({
            path: 'items.item',
            populate: { path: 'owner', select: 'username' }
        });

        if (!cart) {
            return res.render('cart/index', { title: 'My Cart', cartItems: [] });
        }

        const originalItemCount = cart.items.length;
        const validCartItems = cart.items.filter(cartItem => cartItem.item !== null);

        if (validCartItems.length < originalItemCount) {
            await Cart.updateOne(
                { user: req.session.userId },
                { $pull: { items: { item: null } } }
            );
        }

        res.render('cart/index', { 
            title: 'My Cart', 
            cartItems: validCartItems
        });
    } catch (error) {
        console.error("Get Cart Error:", error);
        res.status(500).send('Server Error');
    }
};

exports.addToCart = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const userId = req.session.userId;
        
        const item = await Item.findById(itemId);
        if (!item || item.owner.toString() === userId) {
            req.flash('error_msg', 'Cannot add this item to your cart.');
            return res.redirect(req.get('referer') || '/');
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        if (cart.items.some(cartItem => cartItem.item.toString() === itemId)) {
            req.flash('error_msg', 'This item is already in your cart.');
            return res.redirect(req.get('referer') || '/');
        }

        cart.items.push({ item: itemId });
        await cart.save();
        
        req.flash('success_msg', 'Item added to cart!');
        // Redirect back to the page the user was on (e.g., the homepage)
        res.redirect(req.get('referer') || '/');
    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).send('Server Error');
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const userId = req.session.userId;

        await Cart.updateOne(
            { user: userId },
            { $pull: { items: { item: itemId } } }
        );

        req.flash('success_msg', 'Item removed from cart.');
        res.redirect('/cart');
    } catch (error) {
        console.error("Remove From Cart Error:", error);
        req.flash('error_msg', 'Could not remove item from cart.');
        res.redirect('/cart');
    }
};
