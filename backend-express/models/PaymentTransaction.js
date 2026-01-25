const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'complete', 'expired'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['initiated', 'paid', 'unpaid', 'no_payment_required'],
    default: 'initiated'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
