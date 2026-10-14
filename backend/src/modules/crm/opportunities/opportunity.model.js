const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  opportunityId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Opportunity name is required'],
    trim: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: false
  },
  accountName: {
    type: String,
    required: true
  },
  primaryContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: false
  },
  contactName: {
    type: String,
    default: ''
  },
  owner: {
    userId: { type: String, default: 'USR001' },
    name: { type: String, default: 'Sarah Jenkins' }
  },
  pipeline: {
    type: String,
    default: 'Standard Enterprise Pipeline'
  },
  stage: {
    type: String,
    enum: ['New', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'New',
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Deal amount is required'],
    min: 0,
    default: 0
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  expectedCloseDate: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  product: {
    type: String,
    default: 'Enterprise ERP Suite'
  },
  source: {
    type: String,
    default: 'Inbound Demo'
  },
  competitor: {
    type: String,
    default: 'None'
  },
  nextAction: {
    type: String,
    default: 'Schedule executive solution demo'
  },
  description: {
    type: String,
    default: ''
  },
  winLossReason: {
    type: String,
    default: ''
  },
  stageHistory: [{
    fromStage: String,
    toStage: String,
    movedBy: String,
    movedAt: { type: Date, default: Date.now },
    reason: String
  }],
  originalLeadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  }
}, {
  timestamps: true
});

opportunitySchema.virtual('weightedAmount').get(function() {
  return ((this.amount || 0) * (this.probability || 0)) / 100;
});

opportunitySchema.set('toJSON', { virtuals: true });
opportunitySchema.set('toObject', { virtuals: true });

opportunitySchema.index({ stage: 1, amount: -1 });
opportunitySchema.index({ expectedCloseDate: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
