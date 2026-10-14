const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: 'Technology'
  },
  jobTitle: {
    type: String,
    default: ''
  },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  leadSource: {
    type: String,
    enum: ['Website', 'Referral', 'Advertisement', 'Email', 'Social Media', 'Event', 'Cold Call', 'Partner', 'API', 'CSV Import'],
    default: 'Website'
  },
  campaign: {
    type: String,
    default: 'Q1 Enterprise Growth'
  },
  leadStatus: {
    type: String,
    enum: ['New', 'Contacted', 'In Progress', 'Qualified', 'Unqualified', 'Converted', 'Lost'],
    default: 'New',
    index: true
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 15
  },
  scoreCategory: {
    type: String,
    enum: ['Cold', 'Warm', 'Hot'],
    default: 'Cold'
  },
  owner: {
    userId: { type: String, default: 'USR001' },
    name: { type: String, default: 'Sarah Jenkins' },
    email: { type: String, default: 'sarah.jenkins@crm.internal' }
  },
  qualification: {
    budget: { type: String, default: '$50,000 - $100,000' },
    requirement: { type: String, default: 'Enterprise ERP & CRM modernization' },
    timeline: { type: String, default: '1-3 Months' },
    decisionMaker: { type: Boolean, default: true },
    companySize: { type: String, default: '50-250 Employees' },
    productInterest: { type: String, default: 'Enterprise ERP Suite' }
  },
  activitiesSummary: {
    emailsOpened: { type: Number, default: 0 },
    websiteVisits: { type: Number, default: 0 },
    demoRequested: { type: Boolean, default: false },
    replied: { type: Boolean, default: false }
  },
  lastContactDate: {
    type: Date,
    default: null
  },
  nextFollowUp: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  isConverted: {
    type: Boolean,
    default: false
  },
  convertedAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null
  },
  convertedContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    default: null
  },
  convertedOpportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null
  },
  convertedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

leadSchema.index({ email: 1, phone: 1 });
leadSchema.index({ leadStatus: 1, leadScore: -1 });
leadSchema.index({ 'owner.userId': 1 });

module.exports = mongoose.model('Lead', leadSchema);
