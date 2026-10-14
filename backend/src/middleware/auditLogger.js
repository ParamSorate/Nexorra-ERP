const AuditLog = require('../modules/crm/administration/auditLog.model');

const logAudit = async ({
  req,
  action,
  module,
  entity,
  entityId,
  previousValue = null,
  newValue = null,
  details = ''
}) => {
  try {
    const user = req && req.user ? {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    } : {
      userId: 'SYSTEM',
      name: 'System / Agent Engine',
      email: 'system@crm.internal',
      role: 'System'
    };

    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    const userAgent = req ? (req.headers['user-agent'] || 'Nexoraa AI-Powered ERP') : 'Internal Process';

    await AuditLog.create({
      user,
      action,
      module,
      entity,
      entityId: String(entityId || 'N/A'),
      previousValue,
      newValue,
      details,
      ipAddress,
      userAgent
    });
  } catch (err) {
    console.error('[Audit Logger Error]', err.message);
  }
};

module.exports = {
  logAudit
};
