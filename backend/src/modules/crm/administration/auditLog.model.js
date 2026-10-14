const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    userId: String,
    name: String,
    email: String,
    role: String
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE',
      'EXPORT',
      'IMPORT',
      'ASSIGN',
      'CONVERT',
      'STAGE_CHANGE',
      'APPROVE',
      'REJECT',
      'AI_TOOL_EXECUTION',
      'WORKFLOW_TRIGGERED',
      'STATUS_CHANGE'
    ]
  },
  module: {
    type: String,
    required: true
  },
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  userAgent: {
    type: String,
    default: 'Nexoraa AI-Powered ERP Web Client'
  }
}, {
  timestamps: true
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ 'user.userId': 1 });
auditLogSchema.index({ module: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
