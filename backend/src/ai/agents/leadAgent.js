const Lead = require('../../modules/crm/leads/lead.model');
const { calculateLeadScore } = require('../../utils/scoringEngine');

class LeadAgent {
  async run({ query, leadId, action }, user) {
    if (leadId) {
      const lead = await Lead.findOne({ $or: [{ leadId }, { _id: leadId.match(/^[0-9a-fA-F]{24}$/) ? leadId : null }] });
      if (!lead) throw new Error(`Lead '${leadId}' not found`);

      // 1. Scoring & Qualification
      const { score, category } = calculateLeadScore(lead);
      const isQualified = score >= 50 && lead.qualification?.decisionMaker;

      // 2. Duplicate Detection
      const duplicates = await Lead.find({
        _id: { $ne: lead._id },
        $or: [
          { email: lead.email },
          { phone: lead.phone ? lead.phone : '___none___' },
          { company: { $regex: `^${lead.company}$`, $options: 'i' } }
        ]
      });

      // 3. Recommended Assignment
      let recommendedRep = 'Sarah Jenkins (Enterprise Sales Lead)';
      if (lead.industry === 'Healthcare' || lead.industry === 'Finance') {
        recommendedRep = 'Alex Morgan (Strategic Financial & Regulated Accounts)';
      }

      return {
        agent: 'Lead Agent',
        summary: `Lead Intelligence Profile for '${lead.firstName} ${lead.lastName}' (${lead.company})`,
        scoreAssessment: {
          currentScore: score,
          category,
          status: isQualified ? 'Highly Qualified for Opportunity Creation' : 'Needs further nurturing'
        },
        duplicateCheck: {
          duplicatesFound: duplicates.length > 0,
          count: duplicates.length,
          matches: duplicates.map(d => ({ leadId: d.leadId, name: `${d.firstName} ${d.lastName}`, email: d.email }))
        },
        recommendedAssignment: recommendedRep,
        suggestedTool: {
          name: 'updateLead',
          params: {
            leadId: lead.leadId,
            updates: {
              leadScore: score,
              scoreCategory: category,
              leadStatus: isQualified ? 'Qualified' : lead.leadStatus
            }
          }
        }
      };
    }

    // High value leads sweep
    const hotLeads = await Lead.find({ scoreCategory: 'Hot', leadStatus: { $ne: 'Converted' } }).limit(5);

    return {
      agent: 'Lead Agent',
      summary: `Found ${hotLeads.length} Hot leads ready for direct executive engagement.`,
      insights: hotLeads.map(l => `${l.company} (${l.firstName} ${l.lastName}) - Score: ${l.leadScore}/100 - Source: ${l.leadSource}`),
      recommendedAction: 'Trigger Round-Robin priority dispatch or immediate outbound demo outreach.'
    };
  }
}

module.exports = new LeadAgent();
