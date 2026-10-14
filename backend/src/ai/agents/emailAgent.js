class EmailAgent {
  async run({ leadName, company, dealName, context, goal = 'follow-up' }, user) {
    const targetName = leadName || 'Valued Partner';
    const targetCompany = company || 'your organization';

    let subject = `Advancing ${targetCompany}'s ERP & CRM Modernization Initiative`;
    let body = `Dear ${targetName},\n\nI hope this week is treating you well.\n\nFollowing up on our discussions regarding ${dealName || 'your enterprise architecture'}, I wanted to share how our Nexoraa AI-Powered ERP & CRM platform has helped peer organizations in your sector accelerate order-to-cash cycles by 38% while eliminating manual data reconciliation.\n\nWould you have 15 minutes this Thursday or Friday for a brief executive demo tailored to ${targetCompany}'s workflow requirements?\n\nLooking forward to speaking soon.\n\nBest regards,\n${user.name}\nEnterprise Solutions Team\nNexoraa AI-Powered ERP`;

    if (goal === 'demo-confirmation') {
      subject = `Confirmed: Solution Demonstration for ${targetCompany}`;
      body = `Hi ${targetName},\n\nThank you for booking time with us. We have locked in the solution walkthrough. Our technical architects will showcase live workflows across Leads, Pipeline Forecasting, and ERP Synchronization.\n\nMeeting link and calendar invite are attached.\n\nBest,\n${user.name}`;
    } else if (goal === 'quote-followup') {
      subject = `Reviewing Quote & Implementation Roadmap for ${targetCompany}`;
      body = `Dear ${targetName},\n\nOur team has finalized the custom quotation tailored to your operational scale. I've highlighted the phased milestone rollout to ensure zero downtime during migration.\n\nPlease let me know if you would like to review the line items together.\n\nWarm regards,\n${user.name}`;
    }

    return {
      agent: 'Email Agent',
      summary: `Generated high-impact personalized email template for ${targetCompany}`,
      generatedEmail: {
        subject,
        body,
        recipient: targetName,
        company: targetCompany
      },
      recommendedNextStep: 'Review copy, adjust custom discount terms if applicable, and dispatch via CRM Activity Email tool.'
    };
  }
}

module.exports = new EmailAgent();
