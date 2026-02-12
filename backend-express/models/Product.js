const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    // Ensure this matches your AdminPage Select values exactly
    enum: ['figures', 'clothing', 'posters', 'accessories', 'manga', 'collectibles', 'media']
  },
  // UPDATED: Sizes array with flexible enum
  sizes: {
    type: [String],
    default: [],
    // Includes standard sizes plus 'OS' (One Size)
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS', null] 
  },
  image_url: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  stock: {
    type: Number,
    required: true,
    default: 100,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * DATABASE GUARDRAIL
 * If the category is NOT clothing, we force the sizes array to be empty.
 * This prevents a "Poster" from accidentally having an "XL" size in the DB.
 */
productSchema.pre('save', function(next) {
  if (this.category !== 'clothing') {
    this.sizes = [];
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);