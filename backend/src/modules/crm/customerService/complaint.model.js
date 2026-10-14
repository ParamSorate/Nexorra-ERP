const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
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
  category: {
    type: String,
    enum: ['Service Outage', 'Billing Dispute', 'Implementation Delay', 'Feature Quality', 'Staff Conduct'],
    default: 'Service Outage'
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'High'
  },
  assignedAgent: {
    userId: { type: String, default: 'USR004' },
    name: { type: String, default: 'David Chen' }
  },
  status: {
    type: String,
    enum: ['Open', 'Investigating', 'Escalated', 'Resolved'],
    default: 'Open'
  },
  resolution: {
    description: { type: String, default: '' },
    resolvedBy: { type: String, default: '' },
    resolvedAt: { type: Date, default: null }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
