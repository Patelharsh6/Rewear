// --- Import Core Modules ---
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();

// --- Import Models for Middleware ---
const Conversation = require('./models/Conversation');

// --- Initialize Express App & HTTP Server ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- Import Route Files ---
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const swapRoutes = require('./routes/swapRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const chatRoutes = require('./routes/chatRoutes');

// --- Database Connection, EJS Setup, Middleware ---
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Successfully connected to MongoDB.')).catch(err => console.error('Database connection error:', err));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session Middleware Setup ---
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

// --- Flash Middleware ---
app.use(flash());

// --- Custom Middleware to Pass User, Flash, and Unread Count to All Views ---
app.use(async (req, res, next) => {
    res.locals.user = req.session.userId ? { id: req.session.userId, username: req.session.username } : null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    
    if (req.session.userId) {
        try {
            // This query correctly counts conversations with at least one unread message from another user.
            const unreadCount = await Conversation.countDocuments({
                participants: req.session.userId,
                messages: {
                    $elemMatch: {
                        sender: { $ne: new mongoose.Types.ObjectId(req.session.userId) },
                        isRead: false
                    }
                }
            });
            res.locals.unreadChatCount = unreadCount;
        } catch (error) {
            console.error("Error fetching unread count:", error);
            res.locals.unreadChatCount = 0;
        }
    } else {
        res.locals.unreadChatCount = 0;
    }
    
    next();
});

// --- Use Routes ---
app.use('/', indexRoutes);
app.use('/', userRoutes);
app.use('/items', itemRoutes);
app.use('/swaps', swapRoutes);
app.use('/admin', adminRoutes);
app.use('/cart', cartRoutes);
app.use('/chat', chatRoutes);

// --- Socket.IO Chat Logic ---
require('./controllers/chatController').init(io);

// --- 404 & Error Handlers ---
app.use((req, res, next) => res.status(404).send("Sorry, can't find that!"));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Start The Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
