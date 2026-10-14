const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  campaignId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Email', 'Social', 'Advertisement', 'Webinar', 'Event', 'Referral'],
    default: 'Email'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  budget: {
    type: Number,
    required: true,
    default: 10000
  },
  actualSpend: {
    type: Number,
    default: 0
  },
  targetAudience: {
    type: String,
    default: 'CTOs, CIOs, and IT Directors in APAC'
  },
  leadSource: {
    type: String,
    default: 'Email'
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Paused', 'Completed', 'Cancelled'],
    default: 'Active',
    index: true
  },
  metrics: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    replied: { type: Number, default: 0 },
    converted: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 }
  },
  emailTemplate: {
    subject: { type: String, default: '' },
    bodyHtml: { type: String, default: '' }
  },
  owner: {
    userId: { type: String, default: 'USR003' },
    name: { type: String, default: 'Alex Morgan' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
