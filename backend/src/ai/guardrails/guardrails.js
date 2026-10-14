/**
 * AI Tool Guardrails & Sensitive Action Approval Checker
 */

const SENSITIVE_ACTIONS = [
  'convertLead',
  'deleteRecord',
  'closeDealWon',
  'closeDealLost',
  'markCustomerChurned',
  'applyMassDiscount'
];

const checkGuardrails = (toolName, params, user) => {
  // 1. Guard against direct DB script injections
  const serialized = JSON.stringify(params);
  if (serialized.includes('$where') || serialized.includes('javascript:') || serialized.includes('eval(')) {
    return {
      allowed: false,
      reason: 'Malicious payload detected in AI tool arguments. Action blocked by CRM security guardrail.'
    };
  }

  // 2. Sensitive action human-in-the-loop check
  if (SENSITIVE_ACTIONS.includes(toolName)) {
    return {
      allowed: false,
      requiresApproval: true,
      reason: `Action '${toolName}' is classified as high-impact and requires explicit Human-In-The-Loop approval.`
    };
  }

  // 3. High value opportunity update guardrail
  if (toolName === 'updateOpportunity' && params.updates?.amount > 500000 && user.role !== 'Sales Manager' && user.role !== 'Super Admin') {
    return {
      allowed: false,
      requiresApproval: true,
      reason: 'Updates to deals exceeding ₹5,00,000 require Sales Manager sign-off.'
    };
  }

  return { allowed: true, requiresApproval: false };
};

module.exports = {
  SENSITIVE_ACTIONS,
  checkGuardrails
};
