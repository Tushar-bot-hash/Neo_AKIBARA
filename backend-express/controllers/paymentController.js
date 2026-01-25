const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const PaymentTransaction = require('../models/PaymentTransaction');

// @desc    Create checkout session
// @route   POST /api/payment/checkout
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { origin_url } = req.body;

    // Get cart items
    const cartItems = await CartItem.find({ user: req.user.id }).populate('product');

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.product;
      if (!product) continue;

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      user_email: req.user.email,
      items: orderItems,
      total_amount: totalAmount,
      status: 'pending'
    });

    // Create Stripe checkout session
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Stripe not configured'
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: orderItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product_name,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      success_url: `${origin_url}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin_url}/cart`,
      metadata: {
        order_id: order._id.toString(),
        user_id: req.user.id.toString()
      }
    });

    // Update order with session ID
    order.payment_session_id = session.id;
    await order.save();

    // Create payment transaction
    await PaymentTransaction.create({
      session_id: session.id,
      order: order._id,
      user: req.user.id,
      amount: totalAmount,
      currency: 'usd',
      status: 'pending',
      payment_status: 'initiated'
    });

    res.status(200).json({
      success: true,
      url: session.url,
      session_id: session.id
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment status
// @route   GET /api/payment/status/:sessionId
// @access  Private
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Check if already processed
    const existingTransaction = await PaymentTransaction.findOne({
      session_id: sessionId,
      payment_status: 'paid'
    });

    if (existingTransaction) {
      return res.status(200).json({
        success: true,
        data: existingTransaction
      });
    }

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Update transaction
    await PaymentTransaction.findOneAndUpdate(
      { session_id: sessionId },
      {
        status: session.status,
        payment_status: session.payment_status
      }
    );

    // If paid, update order and clear cart
    if (session.payment_status === 'paid') {
      const orderId = session.metadata.order_id;

      await Order.findByIdAndUpdate(orderId, { status: 'completed' });
      await CartItem.deleteMany({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: {
        session_id: sessionId,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Stripe webhook
// @route   POST /api/payment/webhook/stripe
// @access  Public
exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Update payment transaction
    await PaymentTransaction.findOneAndUpdate(
      { session_id: session.id },
      {
        status: 'complete',
        payment_status: 'paid'
      }
    );

    // Update order
    const orderId = session.metadata.order_id;
    await Order.findByIdAndUpdate(orderId, { status: 'completed' });
  }

  res.status(200).json({ received: true });
};
