const contactService = require('./contact.service');
const { successResponse } = require('../../../utils/response');

const getContacts = async (req, res, next) => {
  try {
    const result = await contactService.getContacts(req.query);
    return successResponse(res, 'Contacts retrieved successfully', result.contacts, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const result = await contactService.getContactById(req.params.id);
    return successResponse(res, 'Contact retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const contact = await contactService.createContact(req.body, req.user, req);
    return successResponse(res, 'Contact created successfully', contact, 201);
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const contact = await contactService.updateContact(req.params.id, req.body, req.user, req);
    return successResponse(res, 'Contact updated successfully', contact);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const result = await contactService.deleteContact(req.params.id, req.user, req);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
