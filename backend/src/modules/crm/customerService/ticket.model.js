const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
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
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: false
  },
  contactName: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Technical', 'Billing', 'Feature Request', 'Integration', 'Account Management'],
    default: 'Technical'
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium',
    index: true
  },
  status: {
    type: String,
    enum: ['Open', 'Assigned', 'In Progress', 'Waiting', 'Resolved', 'Closed'],
    default: 'Open',
    index: true
  },
  assignedAgent: {
    userId: { type: String, default: 'USR004' },
    name: { type: String, default: 'David Chen' }
  },
  sla: {
    targetHours: { type: Number, default: 8 },
    breached: { type: Boolean, default: false },
    escalated: { type: Boolean, default: false },
    slaDueAt: { type: Date, required: true, default: () => new Date(Date.now() + 8 * 60 * 60 * 1000) }
  },
  resolution: {
    description: { type: String, default: '' },
    resolvedBy: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
    customerFeedback: { type: String, default: '' },
    satisfactionScore: { type: Number, min: 1, max: 5, default: 5 }
  }
}, {
  timestamps: true
});

ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ 'sla.breached': 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
