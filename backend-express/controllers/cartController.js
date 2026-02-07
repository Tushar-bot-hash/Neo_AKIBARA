const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const cartItems = await CartItem.find({ user: req.user.id })
      .populate('product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cartItems.length,
      data: cartItems
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    // ALIGNMENT: Destructure 'productId' to match CartContext.jsx fetch body
    const { productId, quantity } = req.body;

    // 1. Check if product exists in MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in database'
      });
    }

    // 2. Check if item already exists in this user's cart
    let cartItem = await CartItem.findOne({
      user: req.user.id,
      product: productId
    });

    if (cartItem) {
      // Update existing quantity
      cartItem.quantity += (Number(quantity) || 1);
      await cartItem.save();

      return res.status(200).json({
        success: true,
        message: 'Cart quantity updated',
        data: cartItem
      });
    }

    // 3. Create new cart item document
    cartItem = await CartItem.create({
      user: req.user.id,
      product: productId,
      quantity: Number(quantity) || 1
    });

    res.status(201).json({
      success: true,
      message: 'Added to cart',
      data: cartItem
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const cartItem = await CartItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { quantity: Number(quantity) },
      { new: true, runValidators: true }
    ).populate('product'); // Populate so frontend gets full item info immediately

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quantity updated',
      data: cartItem
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from cart'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    await CartItem.deleteMany({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (err) {
    next(err);
  }
};