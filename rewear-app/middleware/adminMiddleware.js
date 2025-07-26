const User = require('../models/User');

// This middleware checks if the logged-in user is an admin.
// It should be used AFTER the 'protect' middleware.
exports.isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId);

        if (user && user.role === 'admin') {
            // If the user is an admin, proceed to the next handler
            return next();
        } else {
            // If not an admin, deny access
            return res.status(403).send('Access Denied: You do not have permission to view this page.');
        }
    } catch (error) {
        console.error('Admin Check Error:', error);
        res.status(500).send('Server error');
    }
};
