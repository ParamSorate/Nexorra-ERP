const Lead = require('../leads/lead.model');
const Account = require('../accounts/account.model');
const Opportunity = require('../opportunities/opportunity.model');
const Order = require('../sales/order.model');
const Quote = require('../sales/quote.model');
const Ticket = require('../customerService/ticket.model');
const Complaint = require('../customerService/complaint.model');
const { successResponse } = require('../../../utils/response');

const getReportData = async (req, res, next) => {
  try {
    const { category = 'sales' } = req.query;

    if (category === 'sales') {
      const [orders, quotes, opps] = await Promise.all([
        Order.find(),
        Quote.find(),
        Opportunity.find()
      ]);

      const wonDeals = opps.filter(o => o.stage === 'Closed Won');
      const winRate = opps.length ? Math.round((wonDeals.length / opps.length) * 100) : 0;
      const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

      return successResponse(res, 'Sales Report loaded', {
        category: 'Sales',
        metrics: {
          totalRevenue,
          ordersCount: orders.length,
          quotesCount: quotes.length,
          acceptedQuotes: quotes.filter(q => q.status === 'Accepted').length,
          winRate: `${winRate}%`
        },
        records: orders.map(o => ({
          id: o.orderNumber,
          customer: o.customerName,
          date: new Date(o.orderDate).toLocaleDateString(),
          total: o.total,
          status: o.status,
          erpSync: o.erpSync?.syncedWithErp ? 'Synced' : 'Pending'
        }))
      });
    }

    if (category === 'leads') {
      const leads = await Lead.find();
      const converted = leads.filter(l => l.isConverted || l.leadStatus === 'Converted').length;
      return successResponse(res, 'Leads Report loaded', {
        category: 'Leads',
        metrics: {
          totalLeads: leads.length,
          convertedLeads: converted,
          conversionRate: leads.length ? `${Math.round((converted / leads.length) * 100)}%` : '0%',
          hotLeads: leads.filter(l => l.scoreCategory === 'Hot').length,
          avgScore: leads.length ? Math.round(leads.reduce((s, l) => s + l.leadScore, 0) / leads.length) : 0
        },
        records: leads.map(l => ({
          id: l.leadId,
          name: `${l.firstName} ${l.lastName}`,
          company: l.company,
          source: l.leadSource,
          score: l.leadScore,
          category: l.scoreCategory,
          status: l.leadStatus
        }))
      });
    }

    if (category === 'opportunities') {
      const opps = await Opportunity.find();
      const openDeals = opps.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage));
      const totalPipeline = openDeals.reduce((s, o) => s + o.amount, 0);

      return successResponse(res, 'Opportunities Report loaded', {
        category: 'Opportunities',
        metrics: {
          totalOpportunities: opps.length,
          openOpportunities: openDeals.length,
          pipelineValue: totalPipeline,
          wonValue: opps.filter(o => o.stage === 'Closed Won').reduce((s, o) => s + o.amount, 0),
          lostValue: opps.filter(o => o.stage === 'Closed Lost').reduce((s, o) => s + o.amount, 0)
        },
        records: opps.map(o => ({
          id: o.opportunityId,
          dealName: o.name,
          account: o.accountName,
          stage: o.stage,
          amount: o.amount,
          probability: `${o.probability}%`,
          expectedClose: new Date(o.expectedCloseDate).toLocaleDateString(),
          owner: o.owner?.name
        }))
      });
    }

    if (category === 'customers') {
      const [accounts, orders] = await Promise.all([Account.find(), Order.find()]);
      return successResponse(res, 'Customer Accounts Report loaded', {
        category: 'Customer Accounts',
        metrics: {
          totalCustomers: accounts.length,
          activeCustomers: accounts.filter(a => a.customerStatus === 'Active').length,
          atRiskCustomers: accounts.filter(a => a.customerStatus === 'At Risk').length,
          avgHealthScore: accounts.length ? Math.round(accounts.reduce((s, a) => s + (a.healthScore || 80), 0) / accounts.length) : 85
        },
        records: accounts.map(a => ({
          id: a.accountId,
          company: a.companyName,
          industry: a.industry,
          customerType: a.customerType,
          status: a.customerStatus,
          healthScore: a.healthScore,
          owner: a.accountOwner?.name
        }))
      });
    }

    if (category === 'service') {
      const [tickets, complaints] = await Promise.all([Ticket.find(), Complaint.find()]);
      const breachedCount = tickets.filter(t => t.sla?.breached).length;
      const slaCompliance = tickets.length ? Math.round(((tickets.length - breachedCount) / tickets.length) * 100) : 100;

      return successResponse(res, 'Customer Service Report loaded', {
        category: 'Customer Service & SLA',
        metrics: {
          totalTickets: tickets.length,
          openTickets: tickets.filter(t => ['Open', 'In Progress', 'Assigned'].includes(t.status)).length,
          resolvedTickets: tickets.filter(t => t.status === 'Resolved').length,
          slaCompliance: `${slaCompliance}%`,
          complaintsCount: complaints.length
        },
        records: tickets.map(t => ({
          id: t.ticketId,
          subject: t.subject,
          customer: t.customerName,
          category: t.category,
          priority: t.priority,
          status: t.status,
          slaBreached: t.sla?.breached ? 'YES' : 'NO'
        }))
      });
    }

    return successResponse(res, 'Report loaded', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportData
};
