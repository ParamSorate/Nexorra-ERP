const mongoose = require('mongoose');

const slaRuleSchema = new mongoose.Schema({
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    required: true,
    unique: true
  },
  targetResolutionHours: {
    type: Number,
    required: true
  },
  escalationAfterHours: {
    type: Number,
    required: true
  },
  notifyRoles: [{
    type: String
  }],
  autoEscalate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SlaRule', slaRuleSchema);
