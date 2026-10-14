const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trigger: {
    type: {
      type: String,
      enum: ['LEAD_CREATED', 'LEAD_SCORE_CHANGED', 'OPPORTUNITY_STAGE_CHANGED', 'OPPORTUNITY_AMOUNT_HIGH', 'TICKET_CREATED', 'SLA_BREACH_DETECTED'],
      required: true
    },
    entity: {
      type: String,
      enum: ['Lead', 'Opportunity', 'Ticket', 'Account', 'Quote'],
      required: true
    }
  },
  condition: {
    field: { type: String, required: true },
    operator: { type: String, enum: ['>', '>=', '<', '<=', '==', '!=', 'includes'], required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  actions: [{
    actionType: {
      type: String,
      enum: ['ASSIGN_USER', 'CREATE_TASK', 'SEND_NOTIFICATION', 'REQUIRE_APPROVAL', 'UPDATE_STAGE', 'SET_FIELD'],
      required: true
    },
    params: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  executionCount: {
    type: Number,
    default: 0
  },
  lastExecutedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const workflowExecutionSchema = new mongoose.Schema({
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  workflowName: String,
  triggerType: String,
  entityType: String,
  entityId: String,
  status: { type: String, enum: ['Success', 'Failed', 'Condition Not Met'], default: 'Success' },
  actionsTriggered: [String],
  logs: [String],
  executedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Workflow = mongoose.model('Workflow', workflowSchema);
const WorkflowExecution = mongoose.model('WorkflowExecution', workflowExecutionSchema);

module.exports = {
  Workflow,
  WorkflowExecution
};
