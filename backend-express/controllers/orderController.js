const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { 
      items, 
      total_amount, 
      shipping_address, 
      payment_session_id, 
      payment_method 
    } = req.body;

    // Safety check to prevent empty archives
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: "No items detected" });
    }

    const order = await Order.create({
      user: req.user.id,
      user_name: req.user.name,
      user_email: req.user.email,
      // Map items to match your Schema fields exactly
      items: items.map(item => ({
        product: item.productId || item._id || item.id,
        product_name: item.name || item.product_name || "Unknown Product",
        quantity: item.quantity || 1,
        price: item.price || 0,
        image_url: item.image || item.image_url || "/placeholder.png" 
      })),
      total_amount,
      shipping_address: {
        street: shipping_address?.street || "Digital Delivery",
        city: shipping_address?.city || "Neo-Tokyo",
        zip: shipping_address?.zip || "000000"
      },
      payment_method: payment_method || 'Stripe',
      payment_session_id,
      status: 'processing' 
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (err) {
    next(err);
  }
};