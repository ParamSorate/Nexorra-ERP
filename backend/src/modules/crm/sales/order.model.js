const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
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
  quote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
    required: false
  },
  quoteNumber: {
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
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Draft', 'Confirmed', 'Processing', 'Completed', 'Cancelled'],
    default: 'Confirmed',
    index: true
  },
  erpSync: {
    syncedWithErp: { type: Boolean, default: true },
    inventoryAllocated: { type: Boolean, default: true },
    invoiceGenerated: { type: Boolean, default: false },
    financePaymentStatus: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' },
    erpReferenceId: { type: String, default: () => 'ERP-SO-' + Math.floor(100000 + Math.random() * 900000) }
  },
  owner: {
    userId: { type: String, default: 'USR001' },
    name: { type: String, default: 'Sarah Jenkins' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
