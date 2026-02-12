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
    enum: ['figures', 'clothing', 'posters', 'accessories', 'manga', 'collectibles', 'media']
  },
  // NEW: Sizes array specifically for clothing
  sizes: {
    type: [String],
    default: [],
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'] 
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

module.exports = mongoose.model('Product', productSchema);