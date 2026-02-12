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
    // UPDATED: Now extracting 'size' from req.body
    const { productId, quantity, size } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // UPDATED: Check for existing item with SAME product AND SAME size
    let cartItem = await CartItem.findOne({
      user: req.user.id,
      product: productId,
      size: size || null // Match the exact variation
    });

    if (cartItem) {
      // Update quantity of this specific variation
      cartItem.quantity += (Number(quantity) || 1);
      await cartItem.save();

      return res.status(200).json({
        success: true,
        message: 'Cart variation updated',
        data: cartItem
      });
    }

    // Create new cart item with size data
    cartItem = await CartItem.create({
      user: req.user.id,
      product: productId,
      size: size || null, 
      quantity: Number(quantity) || 1
    });

    res.status(201).json({
      success: true,
      message: 'Variation added to cart',
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

    // We use the unique MongoDB ID (_id) for the cart record, 
    // so it doesn't matter if there are multiple sizes of the same product.
    const cartItem = await CartItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { quantity: Number(quantity) },
      { new: true, runValidators: true }
    ).populate('product');

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cartItem
    });
  } catch (err) {
    next(err);
  }
};

// ... (removeFromCart and clearCart remain the same as they use record IDs)