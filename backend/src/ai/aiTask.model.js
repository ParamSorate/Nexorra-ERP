const mongoose = require('mongoose');

const aiTaskSchema = new mongoose.Schema({
  agentType: {
    type: String,
    enum: ['Sales Agent', 'Lead Agent', 'Customer Agent', 'Support Agent', 'Analytics Agent', 'Email Agent'],
    required: true
  },
  query: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Requires Approval', 'Approved', 'Rejected', 'Failed'],
    default: 'Completed'
  },
  proposedAction: {
    toolName: String,
    params: mongoose.Schema.Types.Mixed,
    reason: String
  },
  executionResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  responseSummary: {
    type: String,
    default: ''
  },
  user: {
    userId: String,
    name: String,
    role: String
  },
  approvedBy: {
    userId: String,
    name: String,
    approvedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AiTask', aiTaskSchema);
