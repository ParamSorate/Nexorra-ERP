const Contact = require('./contact.model');
const Activity = require('../activities/activity.model');
const { logAudit } = require('../../../middleware/auditLogger');

class ContactService {
  async getContacts({ page = 1, limit = 10, search = '', account = '', isDecisionMaker, sortBy = 'createdAt', sortOrder = -1 }) {
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { contactId: { $regex: search, $options: 'i' } }
      ];
    }
    if (account) query.account = account;
    if (isDecisionMaker !== undefined && isDecisionMaker !== '') {
      query.isDecisionMaker = isDecisionMaker === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ [sortBy]: Number(sortOrder) }).skip(skip).limit(Number(limit)),
      Contact.countDocuments(query)
    ]);

    return {
      contacts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getContactById(id) {
    const contact = await Contact.findOne({ $or: [{ contactId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!contact) throw new Error('Contact not found');

    const activities = await Activity.find({ 'relatedTo.contact.id': contact._id }).sort({ activityDate: -1 });

    return {
      contact,
      activities
    };
  }

  async createContact(data, user, req) {
    if (!data.contactId) {
      const count = await Contact.countDocuments();
      data.contactId = `CON-${1000 + count + 1}`;
    }

    const contact = await Contact.create(data);

    await logAudit({
      req,
      action: 'CREATE',
      module: 'contacts',
      entity: 'Contact',
      entityId: contact.contactId,
      newValue: contact.toObject(),
      details: `Created contact ${contact.firstName} ${contact.lastName}`
    });

    return contact;
  }

  async updateContact(id, updates, user, req) {
    const contact = await Contact.findOne({ $or: [{ contactId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!contact) throw new Error('Contact not found');

    const prev = contact.toObject();
    Object.assign(contact, updates);
    await contact.save();

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'contacts',
      entity: 'Contact',
      entityId: contact.contactId,
      previousValue: prev,
      newValue: contact.toObject(),
      details: `Updated contact ${contact.firstName} ${contact.lastName}`
    });

    return contact;
  }

  async deleteContact(id, user, req) {
    const contact = await Contact.findOne({ $or: [{ contactId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!contact) throw new Error('Contact not found');

    const prev = contact.toObject();
    await Contact.findByIdAndDelete(contact._id);

    await logAudit({
      req,
      action: 'DELETE',
      module: 'contacts',
      entity: 'Contact',
      entityId: contact.contactId,
      previousValue: prev,
      details: `Deleted contact ${contact.contactId}`
    });

    return { message: `Contact ${contact.contactId} deleted successfully` };
  }
}

module.exports = new ContactService();
