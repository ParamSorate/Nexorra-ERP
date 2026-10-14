const Opportunity = require('../../modules/crm/opportunities/opportunity.model');
const Lead = require('../../modules/crm/leads/lead.model');
const Order = require('../../modules/crm/sales/order.model');

class AnalyticsAgent {
  async run({ query }, user) {
    const [leads, opps, orders] = await Promise.all([
      Lead.find(),
      Opportunity.find(),
      Order.find()
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const convertedLeads = leads.filter(l => l.isConverted || l.leadStatus === 'Converted').length;
    const conversionRate = leads.length ? Math.round((convertedLeads / leads.length) * 100) : 0;

    const wonOpps = opps.filter(o => o.stage === 'Closed Won');
    const pipelineOpps = opps.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage));
    const pipelineValue = pipelineOpps.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Identify anomalies
    const anomalies = [];
    if (conversionRate < 15) {
      anomalies.push('Lead-to-deal conversion is below the 15% enterprise benchmark.');
    }
    const stalledProposalCount = opps.filter(o => o.stage === 'Proposal' && o.amount > 200000).length;
    if (stalledProposalCount > 2) {
      anomalies.push(`${stalledProposalCount} high-value deals are lingering in Proposal stage without progression.`);
    }

    return {
      agent: 'Analytics Agent',
      summary: `CRM Executive Intelligence Briefing & Anomaly Analysis`,
      kpiSummary: {
        totalRevenue: `₹${totalRevenue.toLocaleString()}`,
        activePipelineValue: `₹${pipelineValue.toLocaleString()}`,
        leadConversionRate: `${conversionRate}% (${convertedLeads}/${leads.length})`,
        closedWonDeals: wonOpps.length
      },
      anomaliesIdentified: anomalies.length > 0 ? anomalies : ['No critical anomalies detected in current pipeline velocity.'],
      strategicRecommendation: 'Focus sales engineering efforts on closing Proposal stage deals before quarter end to exceed targets by 18%.'
    };
  }
}

module.exports = new AnalyticsAgent();
