const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Shoes'] },
    size: { type: String, required: true },
    condition: { type: String, required: true, enum: ['New with tags', 'Excellent', 'Good', 'Fair'] },
    location: {
        state: { type: String, required: true },
        city: { type: String, required: true },
        area: { type: String, required: true }
    },
    price: { // Changed from pointsValue
        type: Number,
        required: true,
        min: 0
    },
    images: [{ url: String, public_id: String }],
    status: { type: String, enum: ['available', 'pending_swap', 'swapped'], default: 'available' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
