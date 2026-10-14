const Role = require('../modules/crm/administration/role.model');
const { errorResponse } = require('../utils/response');

// Baseline permission matrix for default roles
const DEFAULT_PERMISSIONS = {
  'Super Admin': {
    '*': ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'ASSIGN']
  },
  'CRM Admin': {
    '*': ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'ASSIGN']
  },
  'Sales Manager': {
    leads: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'ASSIGN'],
    accounts: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'ASSIGN'],
    contacts: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
    opportunities: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'ASSIGN'],
    activities: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    sales: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE'],
    marketing: ['READ'],
    customerService: ['READ'],
    automation: ['READ', 'CREATE'],
    reports: ['READ', 'EXPORT'],
    aiAgentCenter: ['READ', 'CREATE', 'UPDATE', 'APPROVE'],
    administration: ['READ']
  },
  'Sales Representative': {
    leads: ['CREATE', 'READ', 'UPDATE', 'EXPORT'],
    accounts: ['CREATE', 'READ', 'UPDATE'],
    contacts: ['CREATE', 'READ', 'UPDATE'],
    opportunities: ['CREATE', 'READ', 'UPDATE'],
    activities: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    sales: ['CREATE', 'READ', 'UPDATE'],
    marketing: ['READ'],
    customerService: ['READ'],
    automation: ['READ'],
    reports: ['READ'],
    aiAgentCenter: ['READ', 'CREATE'],
    administration: []
  },
  'Marketing Manager': {
    leads: ['CREATE', 'READ', 'UPDATE', 'EXPORT', 'ASSIGN'],
    accounts: ['READ'],
    contacts: ['CREATE', 'READ', 'UPDATE', 'EXPORT'],
    opportunities: ['READ'],
    activities: ['CREATE', 'READ', 'UPDATE'],
    sales: ['READ'],
    marketing: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
    customerService: ['READ'],
    automation: ['READ', 'CREATE'],
    reports: ['READ', 'EXPORT'],
    aiAgentCenter: ['READ', 'CREATE'],
    administration: []
  },
  'Marketing Lead': {
    leads: ['CREATE', 'READ', 'UPDATE', 'EXPORT', 'ASSIGN'],
    accounts: ['READ'],
    contacts: ['CREATE', 'READ', 'UPDATE', 'EXPORT'],
    opportunities: ['READ'],
    activities: ['CREATE', 'READ', 'UPDATE'],
    sales: ['READ'],
    marketing: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
    customerService: ['READ'],
    automation: ['READ', 'CREATE'],
    reports: ['READ', 'EXPORT'],
    aiAgentCenter: ['READ', 'CREATE'],
    administration: []
  },
  'Support Agent': {
    leads: ['READ'],
    accounts: ['READ', 'UPDATE'],
    contacts: ['READ', 'UPDATE'],
    opportunities: ['READ'],
    activities: ['CREATE', 'READ', 'UPDATE'],
    sales: ['READ'],
    marketing: ['READ'],
    customerService: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'ASSIGN', 'APPROVE'],
    automation: ['READ'],
    reports: ['READ'],
    aiAgentCenter: ['READ', 'CREATE'],
    administration: []
  },
  'Analyst': {
    leads: ['READ', 'EXPORT'],
    accounts: ['READ', 'EXPORT'],
    contacts: ['READ', 'EXPORT'],
    opportunities: ['READ', 'EXPORT'],
    activities: ['READ'],
    sales: ['READ', 'EXPORT'],
    marketing: ['READ', 'EXPORT'],
    customerService: ['READ', 'EXPORT'],
    automation: ['READ'],
    reports: ['CREATE', 'READ', 'UPDATE', 'EXPORT'],
    aiAgentCenter: ['READ'],
    administration: []
  },
  'Viewer': {
    leads: ['READ'],
    accounts: ['READ'],
    contacts: ['READ'],
    opportunities: ['READ'],
    activities: ['READ'],
    sales: ['READ'],
    marketing: ['READ'],
    customerService: ['READ'],
    automation: ['READ'],
    reports: ['READ'],
    aiAgentCenter: ['READ'],
    administration: []
  }
};

const authorize = (moduleName, requiredAction) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, 'Unauthorized - No user session found', 401);
      }

      // Super Admin and CRM Admin have unrestricted access
      if (user.role === 'Super Admin' || user.role === 'CRM Admin') {
        return next();
      }

      // Check DB-based custom role definition if present
      const customRole = await Role.findOne({ name: user.role });
      let actionsAllowed = [];

      if (customRole && customRole.permissions && customRole.permissions.length > 0) {
        const modPerm = customRole.permissions.find(p => p.module === moduleName || p.module === '*');
        if (modPerm) {
          actionsAllowed = modPerm.actions || [];
        }
      } else {
        // Fallback to default matrix
        const roleMatrix = DEFAULT_PERMISSIONS[user.role] || {};
        if (roleMatrix['*']) {
          actionsAllowed = roleMatrix['*'];
        } else if (roleMatrix[moduleName]) {
          actionsAllowed = roleMatrix[moduleName];
        }
      }

      if (!actionsAllowed.includes(requiredAction)) {
        return errorResponse(res, `Forbidden: Role '${user.role}' lacks '${requiredAction}' permission on module '${moduleName}'`, 403);
      }

      next();
    } catch (error) {
      return errorResponse(res, 'RBAC Authorization evaluation failed', 500, error.message);
    }
  };
};

module.exports = {
  authorize,
  DEFAULT_PERMISSIONS
};
