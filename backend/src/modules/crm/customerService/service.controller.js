const Ticket = require('./ticket.model');
const Complaint = require('./complaint.model');
const SlaRule = require('./sla.model');
const { successResponse, errorResponse } = require('../../../utils/response');
const { logAudit } = require('../../../middleware/auditLogger');
const Notification = require('../notifications/notification.model');
const workflowEngine = require('../automation/workflow.engine');

// Tickets
const getTickets = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });

    // Mark breached tickets dynamically
    const now = new Date();
    tickets.forEach(t => {
      if (!['Resolved', 'Closed'].includes(t.status) && t.sla?.slaDueAt && new Date(t.sla.slaDueAt) < now) {
        t.sla.breached = true;
      }
    });

    return successResponse(res, 'Tickets retrieved successfully', tickets);
  } catch (error) {
    next(error);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.ticketId) {
      const count = await Ticket.countDocuments();
      data.ticketId = `TCK-${1000 + count + 1}`;
    }

    // Determine SLA hours based on priority
    let hours = 8;
    if (data.priority === 'Critical') hours = 2;
    if (data.priority === 'High') hours = 4;
    if (data.priority === 'Low') hours = 24;

    data.sla = {
      targetHours: hours,
      breached: false,
      escalated: false,
      slaDueAt: new Date(Date.now() + hours * 60 * 60 * 1000)
    };

    const ticket = await Ticket.create(data);
    await logAudit({ req, action: 'CREATE', module: 'customerService', entity: 'Ticket', entityId: ticket.ticketId, newValue: ticket.toObject() });

    await workflowEngine.evaluateAndExecute('TICKET_CREATED', 'Ticket', ticket.toObject());

    return successResponse(res, 'Ticket created successfully', ticket, 201);
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    const prev = ticket.toObject();

    if (req.body.status === 'Resolved' && ticket.status !== 'Resolved') {
      req.body.resolution = {
        ...ticket.resolution,
        ...req.body.resolution,
        resolvedAt: new Date(),
        resolvedBy: req.user.name
      };
    }

    Object.assign(ticket, req.body);
    await ticket.save();

    await logAudit({ req, action: 'UPDATE', module: 'customerService', entity: 'Ticket', entityId: ticket.ticketId, previousValue: prev, newValue: ticket.toObject() });

    return successResponse(res, 'Ticket updated successfully', ticket);
  } catch (error) {
    next(error);
  }
};

// Complaints
const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    return successResponse(res, 'Complaints retrieved successfully', complaints);
  } catch (error) {
    next(error);
  }
};

const createComplaint = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.complaintId) {
      const count = await Complaint.countDocuments();
      data.complaintId = `CMPL-${1000 + count + 1}`;
    }
    const complaint = await Complaint.create(data);
    await logAudit({ req, action: 'CREATE', module: 'customerService', entity: 'Complaint', entityId: complaint.complaintId, newValue: complaint.toObject() });
    return successResponse(res, 'Complaint recorded', complaint, 201);
  } catch (error) {
    next(error);
  }
};

// SLA Rules
const getSlaRules = async (req, res, next) => {
  try {
    let rules = await SlaRule.find();
    if (rules.length === 0) {
      // Initialize defaults
      rules = await SlaRule.create([
        { priority: 'Critical', targetResolutionHours: 2, escalationAfterHours: 1, notifyRoles: ['Support Manager', 'Super Admin'] },
        { priority: 'High', targetResolutionHours: 4, escalationAfterHours: 2, notifyRoles: ['Support Manager'] },
        { priority: 'Medium', targetResolutionHours: 8, escalationAfterHours: 4, notifyRoles: ['Support Agent'] },
        { priority: 'Low', targetResolutionHours: 24, escalationAfterHours: 12, notifyRoles: ['Support Agent'] }
      ]);
    }
    return successResponse(res, 'SLA rules retrieved', rules);
  } catch (error) {
    next(error);
  }
};

const updateSlaRule = async (req, res, next) => {
  try {
    const rule = await SlaRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return successResponse(res, 'SLA rule updated', rule);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  getComplaints,
  createComplaint,
  getSlaRules,
  updateSlaRule
};
