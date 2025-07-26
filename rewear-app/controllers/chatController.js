const Conversation = require('../models/Conversation');
const User = require('../models/User');

let io;

exports.init = (socketIoInstance) => {
    io = socketIoInstance;
    io.on('connection', (socket) => {
        const userId = socket.request.session.userId;
        if (!userId) return;

        socket.join(userId); // User joins a room with their own ID

        socket.on('sendMessage', async ({ conversationId, receiverId, text }) => {
            try {
                let conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    // This is a fallback, but conversation should be created by startOrGetConversation
                    conversation = new Conversation({
                        participants: [userId, receiverId]
                    });
                }
                
                const message = { sender: userId, text };
                conversation.messages.push(message);
                conversation.lastMessageAt = Date.now();
                await conversation.save();

                const populatedMessage = {
                    ...message,
                    sender: { _id: userId, username: socket.request.session.username }
                };

                // Emit to both sender and receiver
                io.to(userId).to(receiverId).emit('newMessage', {
                    conversationId: conversation._id,
                    message: populatedMessage
                });
            } catch (error) {
                console.error('Socket sendMessage error:', error);
            }
        });
    });
};

exports.getChatPage = async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.session.userId })
            .populate('participants', 'username')
            .sort({ lastMessageAt: -1 });
            
        res.render('chat/index', { 
            title: 'My Chats',
            conversations
        });
    } catch (error) {
        console.error('Get Chat Page Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.startOrGetConversation = async (req, res) => {
    try {
        const receiverId = req.params.receiverId;
        const senderId = req.session.userId;

        if (receiverId === senderId) {
            return res.redirect('/chat');
        }

        // Find an existing conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // If no conversation exists, create one
        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, receiverId]
            });
            await conversation.save();
        }

        // Redirect to the main chat page, the frontend will handle opening this specific chat
        res.redirect(`/chat?open=${conversation._id}`);

    } catch (error) {
        console.error('Start Conversation Error:', error);
        req.flash('error_msg', 'Could not start chat.');
        res.redirect('back');
    }
};

exports.getConversationMessages = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId)
            .populate('messages.sender', 'username');

        if (!conversation || !conversation.participants.includes(req.session.userId)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(conversation.messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// New function to mark messages as read
exports.markConversationAsRead = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const userId = req.session.userId;

        await Conversation.updateOne(
            { _id: conversationId, participants: userId },
            { $set: { "messages.$[elem].isRead": true } },
            { arrayFilters: [{ "elem.sender": { $ne: userId }, "elem.isRead": false }] }
        );
        res.status(200).json({ message: 'Messages marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// New function to delete a conversation
exports.deleteConversation = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const userId = req.session.userId;

        const result = await Conversation.deleteOne({
            _id: conversationId,
            participants: userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Conversation not found or you are not a participant.' });
        }

        res.status(200).json({ message: 'Conversation deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};