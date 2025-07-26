const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const swapSchema = new Schema({
    // The user who wants the item
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The owner of the item being requested
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The item the requester wants
    requestedItem: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    // The item being offered in exchange (optional for points-based swaps)
    offeredItem: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    // The type of swap
    swapType: {
        type: String,
        enum: ['direct', 'points'],
        required: true
    },
    // The status of the swap request
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Swap', swapSchema);
