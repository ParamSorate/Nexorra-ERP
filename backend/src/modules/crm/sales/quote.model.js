const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: false
  },
  customerName: {
    type: String,
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: false
  },
  opportunityName: {
    type: String,
    default: ''
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    sku: String,
    unitPrice: Number,
    quantity: { type: Number, default: 1 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 18 },
    lineTotal: Number
  }],
  subtotal: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  validUntil: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
    default: 'Draft',
    index: true
  },
  terms: {
    type: String,
    default: 'Standard 30 days payment terms upon invoice presentation.'
  },
  createdBy: {
    userId: { type: String, default: 'USR001' },
    name: { type: String, default: 'Sarah Jenkins' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quote', quoteSchema);
