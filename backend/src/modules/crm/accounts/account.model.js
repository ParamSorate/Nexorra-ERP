const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true
  },
  industry: {
    type: String,
    default: 'Technology'
  },
  website: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    postalCode: { type: String, default: '' }
  },
  employeeCount: {
    type: Number,
    default: 100
  },
  annualRevenue: {
    type: Number,
    default: 1000000
  },
  accountOwner: {
    userId: { type: String, default: 'USR001' },
    name: { type: String, default: 'Sarah Jenkins' },
    email: { type: String, default: 'sarah.jenkins@crm.internal' }
  },
  customerType: {
    type: String,
    enum: ['Enterprise', 'Mid-Market', 'SMB', 'Strategic Partner'],
    default: 'Enterprise'
  },
  customerStatus: {
    type: String,
    enum: ['Prospect', 'Active', 'At Risk', 'Inactive', 'Churned'],
    default: 'Active',
    index: true
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  aiInsights: [{
    category: { type: String, enum: ['Opportunity', 'Risk', 'Engagement', 'Upsell'] },
    insight: String,
    confidence: Number,
    generatedAt: { type: Date, default: Date.now }
  }],
  originalLeadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);
