const accountService = require('./account.service');
const { successResponse } = require('../../../utils/response');

const getAccounts = async (req, res, next) => {
  try {
    const result = await accountService.getAccounts(req.query);
    return successResponse(res, 'Accounts retrieved successfully', result.accounts, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const account360 = await accountService.getAccount360(req.params.id);
    return successResponse(res, 'Account 360 data retrieved successfully', account360);
  } catch (error) {
    next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const account = await accountService.createAccount(req.body, req.user, req);
    return successResponse(res, 'Account created successfully', account, 201);
  } catch (error) {
    next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const account = await accountService.updateAccount(req.params.id, req.body, req.user, req);
    return successResponse(res, 'Account updated successfully', account);
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const result = await accountService.deleteAccount(req.params.id, req.user, req);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};
