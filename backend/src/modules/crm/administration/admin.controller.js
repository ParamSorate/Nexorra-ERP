const jwt = require('jsonwebtoken');
const User = require('./user.model');
const Role = require('./role.model');
const AuditLog = require('./auditLog.model');
const config = require('../../../config/config');
const { successResponse, errorResponse } = require('../../../utils/response');
const { logAudit } = require('../../../middleware/auditLogger');
const { DEFAULT_PERMISSIONS } = require('../../../middleware/rbac');

// Auth: Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const aliasMap = {
      'superadmin@crm.internal': 'admin@crm.internal',
      'superadmin': 'admin@crm.internal',
      'salesmanager@crm.internal': 'manager@crm.internal',
      'sales.manager@crm.internal': 'manager@crm.internal',
      'marcus.vance@crm.internal': 'manager@crm.internal',
      'salesmanager': 'manager@crm.internal',
      'salesrep@crm.internal': 'sarah.jenkins@crm.internal',
      'sales.rep@crm.internal': 'sarah.jenkins@crm.internal',
      'sales.representative@crm.internal': 'sarah.jenkins@crm.internal',
      'salesrep': 'sarah.jenkins@crm.internal',
      'supportagent@crm.internal': 'david.chen@crm.internal',
      'support.agent@crm.internal': 'david.chen@crm.internal',
      'support@crm.internal': 'david.chen@crm.internal',
      'supportagent': 'david.chen@crm.internal',
      'marketinglead@crm.internal': 'alex.morgan@crm.internal',
      'marketing.lead@crm.internal': 'alex.morgan@crm.internal',
      'marketing@crm.internal': 'alex.morgan@crm.internal',
      'marketinglead': 'alex.morgan@crm.internal'
    };
    const lookupEmails = [normalizedEmail];
    if (aliasMap[normalizedEmail]) lookupEmails.push(aliasMap[normalizedEmail]);

    const user = await User.findOne({ email: { $in: lookupEmails } }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const userSafe = user.toObject();
    delete userSafe.password;

    return successResponse(res, 'Login successful', {
      token,
      user: userSafe
    });
  } catch (error) {
    next(error);
  }
};

// Auth: Get current user
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 'User session loaded', user);
  } catch (error) {
    next(error);
  }
};

// Auth: Switch Role (convenience for demo / testing RBAC roles in Nexoraa AI-Powered ERP)
const switchRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 'User not found', 404);

    user.role = role;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return successResponse(res, `Switched active role to '${role}'`, { token, user });
  } catch (error) {
    next(error);
  }
};

// Users Management
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    return successResponse(res, 'Users retrieved', users);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.userId) {
      const count = await User.countDocuments();
      data.userId = `USR-${1000 + count + 1}`;
    }
    const user = await User.create(data);
    const userSafe = user.toObject();
    delete userSafe.password;

    await logAudit({ req, action: 'CREATE', module: 'administration', entity: 'User', entityId: user.userId, newValue: userSafe });
    return successResponse(res, 'User created successfully', userSafe, 201);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.password; // Don't overwrite password via generic update

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return errorResponse(res, 'User not found', 404);

    await logAudit({ req, action: 'UPDATE', module: 'administration', entity: 'User', entityId: user.userId, newValue: user.toObject() });
    return successResponse(res, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

// Roles & Permissions
const getRoles = async (req, res, next) => {
  try {
    let roles = await Role.find();
    if (roles.length === 0) {
      // Initialize default roles with permission matrix
      const initialRoles = Object.keys(DEFAULT_PERMISSIONS).map(roleName => ({
        name: roleName,
        description: `Enterprise role for ${roleName}`,
        permissions: Object.keys(DEFAULT_PERMISSIONS[roleName]).map(mod => ({
          module: mod,
          actions: DEFAULT_PERMISSIONS[roleName][mod]
        }))
      }));
      roles = await Role.create(initialRoles);
    }
    return successResponse(res, 'Roles retrieved', roles);
  } catch (error) {
    next(error);
  }
};

const updateRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const role = await Role.findByIdAndUpdate(id, { permissions }, { new: true });
    return successResponse(res, 'Role permissions updated successfully', role);
  } catch (error) {
    next(error);
  }
};

// Audit Logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { module, action, search } = req.query;
    const filter = {};
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (search) {
      filter.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(100);
    return successResponse(res, 'Audit logs retrieved', logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  switchRole,
  getUsers,
  createUser,
  updateUser,
  getRoles,
  updateRolePermissions,
  getAuditLogs
};
