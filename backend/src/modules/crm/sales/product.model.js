const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Software Licenses', 'Cloud Subscriptions', 'Implementation Services', 'Support & Maintenance', 'Hardware'],
    default: 'Software Licenses'
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 18 // percentage (e.g. GST)
  },
  discount: {
    type: Number,
    default: 0 // default max discount %
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Discontinued'],
    default: 'Active'
  },
  stockAvailable: {
    type: Number,
    default: 1000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
