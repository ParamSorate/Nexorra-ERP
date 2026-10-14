/**
 * Standard API Response Utilities
 */
const successResponse = (res, message = 'Success', data = {}, statusCode = 200, pagination = null) => {
  const response = {
    success: true,
    message,
    data
  };
  if (pagination) {
    response.pagination = pagination;
  }
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

module.exports = {
  successResponse,
  errorResponse
};
