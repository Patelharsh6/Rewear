// This middleware function checks if a user is logged in before allowing
// them to access a protected route.

exports.protect = (req, res, next) => {
    // Check if the user ID exists in the session
    if (req.session.userId) {
        // If the user is logged in, proceed to the next middleware or route handler
        return next();
    } else {
        // If the user is not logged in, redirect them to the login page
        res.redirect('/login');
    }
};
