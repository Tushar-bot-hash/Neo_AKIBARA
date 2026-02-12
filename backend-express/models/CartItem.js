const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // NEW: Store the selected dimension for clothing
  size: {
    type: String,
    default: null // Will remain null for non-clothing items
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * UPDATED INDEX
 * Now, uniqueness is defined by User + Product + Size.
 * This allows:
 * - User A + Shirt ID + "S" (Quantity 1)
 * - User A + Shirt ID + "L" (Quantity 1)
 * ...to exist as separate rows in your database.
 */
cartItemSchema.index({ user: 1, product: 1, size: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);