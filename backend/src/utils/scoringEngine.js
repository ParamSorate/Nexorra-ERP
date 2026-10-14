// Dynamic lead scoring engine with configurable rules

const DEFAULT_SCORING_RULES = {
  emailOpened: 5,
  websiteVisit: 5,
  demoRequest: 20,
  highValueCompany: 15,
  replyReceived: 10,
  hasPhone: 10,
  hasBudget: 15,
  decisionMakerIdentified: 15,
  clearTimeline: 10
};

let activeScoringRules = { ...DEFAULT_SCORING_RULES };

const updateScoringRules = (newRules) => {
  activeScoringRules = { ...activeScoringRules, ...newRules };
  return activeScoringRules;
};

const getScoringRules = () => {
  return activeScoringRules;
};

const calculateLeadScore = (leadData) => {
  let score = 10; // baseline score for any captured lead

  if (leadData.activitiesSummary) {
    if (leadData.activitiesSummary.emailsOpened) {
      score += leadData.activitiesSummary.emailsOpened * activeScoringRules.emailOpened;
    }
    if (leadData.activitiesSummary.websiteVisits) {
      score += leadData.activitiesSummary.websiteVisits * activeScoringRules.websiteVisit;
    }
    if (leadData.activitiesSummary.demoRequested) {
      score += activeScoringRules.demoRequest;
    }
    if (leadData.activitiesSummary.replied) {
      score += activeScoringRules.replyReceived;
    }
  }

  // Qualification criteria check
  if (leadData.qualification) {
    if (leadData.qualification.budget && leadData.qualification.budget !== 'None') {
      score += activeScoringRules.hasBudget;
    }
    if (leadData.qualification.decisionMaker) {
      score += activeScoringRules.decisionMakerIdentified;
    }
    if (leadData.qualification.timeline && leadData.qualification.timeline !== 'Unknown') {
      score += activeScoringRules.clearTimeline;
    }
  }

  if (leadData.phone) {
    score += activeScoringRules.hasPhone;
  }

  // High value company heuristics
  const highValueIndustries = ['Finance', 'Banking', 'Enterprise Software', 'Healthcare', 'Manufacturing'];
  if (leadData.industry && highValueIndustries.includes(leadData.industry)) {
    score += activeScoringRules.highValueCompany;
  }

  // Clamp score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  let category = 'Cold';
  if (score >= 70) {
    category = 'Hot';
  } else if (score >= 40) {
    category = 'Warm';
  }

  return { score, category };
};

module.exports = {
  calculateLeadScore,
  getScoringRules,
  updateScoringRules
};
