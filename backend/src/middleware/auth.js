const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../modules/crm/administration/user.model');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 'User associated with token no longer exists', 401);
    }

    if (user.status !== 'Active') {
      return errorResponse(res, 'Account is inactive. Please contact CRM Administrator', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please log in again', 401);
    }
    return errorResponse(res, 'Invalid token authorization', 401);
  }
};

module.exports = {
  authenticate
};
