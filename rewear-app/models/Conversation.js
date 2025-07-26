const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false }, // Add this line
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now, expires: '7d' } 
});

module.exports = mongoose.model('Conversation', conversationSchema);
