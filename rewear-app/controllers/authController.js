const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Server-side password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

    if (!passwordRegex.test(password)) {
        req.flash('error_msg', 'Password does not meet the requirements.');
        return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
        req.flash('error_msg', 'Passwords do not match.');
        return res.redirect('/signup');
    }
    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            req.flash('error_msg', 'User with this email or username already exists.');
            return res.redirect('/signup');
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        req.session.userId = newUser._id;
        req.session.username = newUser.username;

        req.session.save(err => {
            if (err) {
                req.flash('success_msg', 'Registration successful! Please log in.');
                return res.redirect('/login');
            }
            req.flash('success_msg', `Welcome to ReWear, ${newUser.username}!`);
            res.redirect('/');
        });

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/signup');
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error_msg', 'That email is not registered.');
            return res.redirect('/login');
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Password incorrect.');
            return res.redirect('/login');
        }
        
        req.session.userId = user._id;
        req.session.username = user.username;

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                req.flash('error_msg', 'Something went wrong during login.');
                return res.redirect('/login');
            }
            req.flash('success_msg', `Welcome back, ${user.username}!`);
            res.redirect('/');
        });

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/login');
    }
};

const logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            req.flash('error_msg', 'Could not log out.');
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/');
    });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};
