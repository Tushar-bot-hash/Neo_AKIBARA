const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const PaymentTransaction = require('../models/PaymentTransaction');

// @desc    Create checkout session
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { origin_url, shippingDetails } = req.body;

    // 1. Fetch user's cart from MongoDB
    const cartItems = await CartItem.find({ user: req.user.id }).populate('product');

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ 
        success: true, 
        error: 'Your cart is empty in the database.' 
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    // 2. Validate and map items
    for (const item of cartItems) {
      const product = item.product;
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Item ${product?.name || 'Unknown'} is out of stock` 
        });
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price,
        image_url: product.image_url
      });
    }

    // 3. Create the Order Record
    const order = await Order.create({
      user: req.user.id,
      user_name: req.user.name,
      user_email: req.user.email,
      items: orderItems,
      total_amount: totalAmount,
      shipping_address: shippingDetails,
      status: 'pending'
    });

    // 4. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: orderItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product_name,
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
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

    // 5. Save Session ID to Order and Transaction
    order.payment_session_id = session.id;
    await order.save();

    await PaymentTransaction.create({
      session_id: session.id,
      order: order._id,
      user: req.user.id,
      amount: totalAmount,
      status: 'pending'
    });

    // 6. Send the URL back to frontend
    res.status(200).json({ success: true, url: session.url });

  } catch (err) {
    console.error(">>> STRIPE ERROR:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get status
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

// @desc    Webhook
exports.stripeWebhook = async (req, res) => {
  res.status(200).json({ received: true });
};