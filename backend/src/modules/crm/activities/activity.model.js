const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['Call', 'Email', 'Meeting', 'Note', 'Task', 'Follow-up'],
    required: true,
    index: true
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
  relatedTo: {
    account: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
      name: String
    },
    contact: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
      name: String
    },
    lead: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
      name: String
    },
    opportunity: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
      name: String
    }
  },
  assignedUser: {
    userId: { type: String, default: 'USR001' },
    name: { type: String, default: 'Sarah Jenkins' }
  },
  activityDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  durationMinutes: {
    type: Number,
    default: 30
  },
  outcome: {
    type: String,
    default: ''
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

activitySchema.index({ status: 1, dueDate: 1 });
activitySchema.index({ 'assignedUser.userId': 1 });

module.exports = mongoose.model('Activity', activitySchema);
