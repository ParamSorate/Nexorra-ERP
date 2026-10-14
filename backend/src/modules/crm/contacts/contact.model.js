const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  contactId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    default: ''
  },
  mobile: {
    type: String,
    default: ''
  },
  jobTitle: {
    type: String,
    default: 'Decision Maker'
  },
  department: {
    type: String,
    default: 'Executive'
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: false
  },
  accountName: {
    type: String,
    default: ''
  },
  isDecisionMaker: {
    type: Boolean,
    default: false
  },
  contactOwner: {
    userId: { type: String, default: 'USR001' },
    name: { type: String, default: 'Sarah Jenkins' }
  },
  linkedIn: {
    type: String,
    default: ''
  },
  address: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  originalLeadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  }
}, {
  timestamps: true
});

contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contact', contactSchema);
