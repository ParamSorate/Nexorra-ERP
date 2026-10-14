const salesAgent = require('../agents/salesAgent');
const leadAgent = require('../agents/leadAgent');
const customerAgent = require('../agents/customerAgent');
const supportAgent = require('../agents/supportAgent');
const analyticsAgent = require('../agents/analyticsAgent');
const emailAgent = require('../agents/emailAgent');
const crmTools = require('../tools/crmTools');
const { checkGuardrails } = require('../guardrails/guardrails');
const AiTask = require('../aiTask.model');
const { logAudit } = require('../../middleware/auditLogger');

class AIOrchestrator {
  /**
   * Route query to the requested agent or auto-detect suitable agent
   */
  async handleQuery({ agentType, query, payload = {} }, user) {
    let result = null;

    switch (agentType) {
      case 'Sales Agent':
        result = await salesAgent.run({ query, ...payload }, user);
        break;
      case 'Lead Agent':
        result = await leadAgent.run({ query, ...payload }, user);
        break;
      case 'Customer Agent':
        result = await customerAgent.run({ query, ...payload }, user);
        break;
      case 'Support Agent':
        result = await supportAgent.run({ query, ...payload }, user);
        break;
      case 'Analytics Agent':
        result = await analyticsAgent.run({ query, ...payload }, user);
        break;
      case 'Email Agent':
        result = await emailAgent.run({ ...payload }, user);
        break;
      default:
        result = await analyticsAgent.run({ query, ...payload }, user);
        break;
    }

    // Save task record for history and auditability
    const aiTask = await AiTask.create({
      agentType: agentType || 'Analytics Agent',
      query: query || 'Agent inquiry',
      status: 'Completed',
      executionResult: result,
      responseSummary: result.summary,
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role
      }
    });

    await logAudit({
      action: 'AI_TOOL_EXECUTION',
      module: 'aiAgentCenter',
      entity: 'AiTask',
      entityId: String(aiTask._id),
      details: `${agentType || 'Agent'} executed analysis for user ${user.name}`
    });

    return {
      taskId: aiTask._id,
      ...result
    };
  }

  /**
   * Controlled execution of tools via Orchestrator -> Guardrail -> Tool Layer
   */
  async executeTool({ toolName, params, confirmedByHuman = false }, user) {
    if (!crmTools[toolName]) {
      throw new Error(`Tool '${toolName}' is not registered in CRM tool layer.`);
    }

    // Guardrail evaluation
    const guardrailCheck = checkGuardrails(toolName, params, user);
    if (!guardrailCheck.allowed) {
      if (guardrailCheck.requiresApproval && !confirmedByHuman) {
        // Create pending approval task
        const pendingTask = await AiTask.create({
          agentType: 'Sales Agent',
          query: `Tool execution requested: ${toolName}`,
          status: 'Requires Approval',
          proposedAction: {
            toolName,
            params,
            reason: guardrailCheck.reason
          },
          user: {
            userId: user.userId,
            name: user.name,
            role: user.role
          }
        });

        return {
          status: 'REQUIRES_APPROVAL',
          taskId: pendingTask._id,
          message: guardrailCheck.reason,
          proposedAction: { toolName, params }
        };
      } else if (!guardrailCheck.requiresApproval) {
        throw new Error(guardrailCheck.reason);
      }
    }

    // Authorized & Guarded tool invocation
    const output = await crmTools[toolName](params, user);

    return {
      status: 'SUCCESS',
      toolName,
      result: output
    };
  }

  /**
   * Approve and execute a pending AI action
   */
  async approveAiTask(taskId, approverUser) {
    const task = await AiTask.findById(taskId);
    if (!task) throw new Error('AI Task not found');
    if (task.status !== 'Requires Approval') throw new Error(`Task is in status '${task.status}', cannot approve.`);

    const { toolName, params } = task.proposedAction;
    const output = await crmTools[toolName](params, approverUser);

    task.status = 'Approved';
    task.approvedBy = {
      userId: approverUser.userId,
      name: approverUser.name,
      approvedAt: new Date()
    };
    task.executionResult = output;
    await task.save();

    await logAudit({
      action: 'APPROVE',
      module: 'aiAgentCenter',
      entity: 'AiTask',
      entityId: String(task._id),
      details: `Action '${toolName}' approved and executed by ${approverUser.name}`
    });

    return {
      status: 'APPROVED_AND_EXECUTED',
      output
    };
  }
}

module.exports = new AIOrchestrator();
