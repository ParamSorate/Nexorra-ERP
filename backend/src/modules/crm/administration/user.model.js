const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  department: {
    type: String,
    enum: ['Sales', 'Marketing', 'Customer Service', 'Management', 'Operations', 'Finance', 'IT'],
    default: 'Sales'
  },
  team: {
    type: String,
    default: 'Enterprise Direct'
  },
  region: {
    type: String,
    default: 'Global'
  },
  role: {
    type: String,
    required: true,
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
    ],
    default: 'Sales Representative'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  phone: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
