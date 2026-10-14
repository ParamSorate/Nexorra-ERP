const crmTools = require('../tools/crmTools');
const Opportunity = require('../../modules/crm/opportunities/opportunity.model');

class SalesAgent {
  async run({ query, opportunityId, action }, user) {
    if (opportunityId) {
      const opp = await crmTools.getOpportunity({ opportunityId }, user);
      
      const daysSinceCreation = Math.floor((Date.now() - new Date(opp.createdAt)) / (1000 * 60 * 60 * 24));
      const isStalled = daysSinceCreation > 14 && opp.stage !== 'Closed Won' && opp.stage !== 'Closed Lost';
      
      let nextActionRecommendation = 'Conduct executive alignment session to address procurement roadblocks.';
      if (opp.stage === 'Qualification') nextActionRecommendation = 'Validate decision-maker authority and finalize BANT qualification score.';
      if (opp.stage === 'Proposal') nextActionRecommendation = 'Follow up with CFO regarding ROI model and license packaging.';

      return {
        agent: 'Sales Agent',
        summary: `Analysis for Deal '${opp.name}' (Value: ₹${opp.amount.toLocaleString()} - Stage: ${opp.stage}):`,
        insights: [
          `Win Probability estimated at ${opp.probability}% with expected close by ${new Date(opp.expectedCloseDate).toLocaleDateString()}.`,
          isStalled ? `⚠️ Stalled Warning: Deal has had limited velocity for ${daysSinceCreation} days.` : `✅ Deal velocity is normal.`,
          `Key Competitor: ${opp.competitor || 'None identified'}. Differentiation should emphasize Nexoraa AI-Powered ERP integration.`
        ],
        recommendedAction: nextActionRecommendation,
        suggestedTool: {
          name: 'createTask',
          params: {
            subject: `Action: ${nextActionRecommendation}`,
            relatedEntity: 'Opportunity',
            relatedId: opp._id,
            priority: opp.amount > 200000 ? 'High' : 'Medium'
          }
        }
      };
    }

    // Pipeline overview & inactive opportunities detection
    const opps = await Opportunity.find({ stage: { $nin: ['Closed Won', 'Closed Lost'] } });
    const highValueOpps = opps.filter(o => o.amount >= 250000);
    const totalPipeline = opps.reduce((sum, o) => sum + o.amount, 0);

    return {
      agent: 'Sales Agent',
      summary: `Analyzed ${opps.length} active opportunities across current enterprise pipeline.`,
      insights: [
        `Total active pipeline value is ₹${totalPipeline.toLocaleString()} across ${opps.length} deals.`,
        `${highValueOpps.length} strategic deals exceed ₹2,50,000 threshold.`,
        `Top priority deal: ${highValueOpps[0]?.name || opps[0]?.name || 'N/A'}`
      ],
      recommendedAction: 'Schedule weekly pipeline triage with sales engineering for deals in Proposal and Negotiation stages.',
      suggestedTool: {
        name: 'getSalesReport',
        params: { period: 'monthly' }
      }
    };
  }
}

module.exports = new SalesAgent();
