const crmTools = require('../tools/crmTools');

class CustomerAgent {
  async run({ query, accountId }, user) {
    if (!accountId) {
      return {
        agent: 'Customer Agent',
        summary: 'Account parameter missing. Please select an Account/Customer to inspect 360 insights.'
      };
    }

    const data = await crmTools.getCustomer({ accountId }, user);
    const { account, contacts, opportunities, activities, orders, tickets } = data;

    // Churn Risk Assessment
    const openTickets = tickets.filter(t => ['Open', 'In Progress', 'Assigned'].includes(t.status));
    const criticalTickets = openTickets.filter(t => t.priority === 'Critical');
    const isAtRisk = criticalTickets.length > 0 || (account.customerStatus === 'At Risk');

    const totalLTV = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      agent: 'Customer Agent',
      summary: `Account 360 AI Analysis for '${account.companyName}' (${account.customerType})`,
      healthRating: account.healthScore,
      riskAssessment: {
        isAtRisk,
        riskLevel: isAtRisk ? 'High Churn Danger' : 'Stable & Growing',
        unresolvedTickets: openTickets.length,
        criticalIssues: criticalTickets.map(t => t.subject)
      },
      accountMetrics: {
        totalLTV: `₹${totalLTV.toLocaleString()}`,
        activeContacts: contacts.length,
        openDeals: opportunities.length,
        lastInteractionDate: activities[0]?.activityDate || 'None recorded'
      },
      recommendedAction: isAtRisk 
        ? 'Deploy immediate Executive Sponsor call and fast-track unresolved support tickets.'
        : 'Explore module expansion into Nexoraa AI-Powered ERP Inventory and Supply Chain suites.'
    };
  }
}

module.exports = new CustomerAgent();
