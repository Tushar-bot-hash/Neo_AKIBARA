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

    // Create the order in the database
    // req.user comes from your 'protect' middleware
    const order = await Order.create({
      user: req.user.id,
      user_name: req.user.name,   
      user_email: req.user.email, 
      items: items.map(item => ({
        product: item.productId || item.id || item._id, 
        product_name: item.name || item.product?.name || "Unknown Product",
        quantity: item.quantity,
        price: item.price || item.product?.price,
        image_url: item.image || item.image_url || item.product?.image
      })),
      total_amount,
      shipping_address,
      payment_method: payment_method || 'Stripe',
      payment_session_id,
      status: 'processing' 
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error("Order Archive Error:", err);
    res.status(400).json({
      success: false,
      error: err.message || 'Database Uplink Failed'
    });
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