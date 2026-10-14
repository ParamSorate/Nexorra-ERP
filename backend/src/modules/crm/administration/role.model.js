const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'Super Admin',
      'CRM Admin',
      'Sales Manager',
      'Sales Representative',
      'Marketing Manager',
      'Marketing Lead',
      'Support Agent',
      'Analyst',
      'Viewer'
    ]
  },
  description: {
    type: String,
    default: ''
  },
  permissions: [{
    module: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'ASSIGN']
    }]
  }],
  isSystem: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
