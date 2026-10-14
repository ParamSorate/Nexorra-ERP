const { Workflow, WorkflowExecution } = require('./workflow.model');
const Notification = require('../notifications/notification.model');
const Activity = require('../activities/activity.model');
const { logAudit } = require('../../../middleware/auditLogger');

class WorkflowEngine {
  /**
   * Evaluate workflows matching a trigger event
   * @param {string} triggerType
   * @param {string} entityType
   * @param {object} entityRecord
   */
  async evaluateAndExecute(triggerType, entityType, entityRecord) {
    try {
      const activeWorkflows = await Workflow.find({
        isActive: true,
        'trigger.type': triggerType,
        'trigger.entity': entityType
      });

      if (!activeWorkflows || activeWorkflows.length === 0) return;

      for (const wf of activeWorkflows) {
        const isMatch = this.checkCondition(wf.condition, entityRecord);
        if (!isMatch) {
          await WorkflowExecution.create({
            workflowId: wf._id,
            workflowName: wf.name,
            triggerType,
            entityType,
            entityId: entityRecord._id || entityRecord.leadId || entityRecord.opportunityId,
            status: 'Condition Not Met',
            actionsTriggered: [],
            logs: [`Condition not met: ${wf.condition.field} ${wf.condition.operator} ${wf.condition.value}`]
          });
          continue;
        }

        const logs = [];
        const actionsTriggered = [];

        for (const action of wf.actions) {
          try {
            await this.executeAction(action, entityRecord, entityType, logs);
            actionsTriggered.push(action.actionType);
          } catch (actionErr) {
            logs.push(`Error executing ${action.actionType}: ${actionErr.message}`);
          }
        }

        wf.executionCount = (wf.executionCount || 0) + 1;
        wf.lastExecutedAt = new Date();
        await wf.save();

        await WorkflowExecution.create({
          workflowId: wf._id,
          workflowName: wf.name,
          triggerType,
          entityType,
          entityId: entityRecord._id || entityRecord.leadId || entityRecord.opportunityId,
          status: 'Success',
          actionsTriggered,
          logs,
          executedAt: new Date()
        });

        await logAudit({
          action: 'WORKFLOW_TRIGGERED',
          module: 'automation',
          entity: 'Workflow',
          entityId: String(wf._id),
          details: `Workflow '${wf.name}' executed ${actionsTriggered.length} actions on ${entityType}`
        });
      }
    } catch (err) {
      console.error('[Workflow Engine Error]', err);
    }
  }

  checkCondition(condition, record) {
    if (!condition || !condition.field) return true;
    const val = record[condition.field];
    const target = condition.value;

    switch (condition.operator) {
      case '>':
        return Number(val) > Number(target);
      case '>=':
        return Number(val) >= Number(target);
      case '<':
        return Number(val) < Number(target);
      case '<=':
        return Number(val) <= Number(target);
      case '==':
        return String(val) === String(target);
      case '!=':
        return String(val) !== String(target);
      case 'includes':
        return String(val).toLowerCase().includes(String(target).toLowerCase());
      default:
        return false;
    }
  }

  async executeAction(action, record, entityType, logs) {
    const { actionType, params } = action;

    if (actionType === 'CREATE_TASK') {
      const actId = 'ACT-' + Math.floor(1000 + Math.random() * 9000);
      await Activity.create({
        activityId: actId,
        type: 'Task',
        subject: params.subject || `Automated Follow-up for ${record.company || record.name || entityType}`,
        description: params.description || 'System-generated task via CRM workflow automation',
        priority: params.priority || 'High',
        assignedUser: {
          userId: params.assignedUserId || record.owner?.userId || 'USR001',
          name: params.assignedUserName || record.owner?.name || 'Sarah Jenkins'
        },
        relatedTo: {
          lead: entityType === 'Lead' ? { id: record._id, name: `${record.firstName} ${record.lastName}` } : undefined,
          opportunity: entityType === 'Opportunity' ? { id: record._id, name: record.name } : undefined,
          account: entityType === 'Account' ? { id: record._id, name: record.companyName } : undefined
        },
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      logs.push(`Created task '${actId}' assigned to ${params.assignedUserName || 'Lead Owner'}`);
    }

    if (actionType === 'SEND_NOTIFICATION') {
      await Notification.create({
        recipientUserId: params.recipientUserId || record.owner?.userId || 'USR001',
        title: params.title || `Workflow Alert: ${record.company || record.name || 'Record updated'}`,
        message: params.message || `Automated action occurred on ${entityType}`,
        type: 'workflow',
        entityType,
        entityId: String(record._id || record.leadId || '')
      });
      logs.push(`Dispatched notification to user ${params.recipientUserId || 'USR001'}`);
    }

    if (actionType === 'REQUIRE_APPROVAL') {
      await Notification.create({
        recipientUserId: 'USR002', // Manager
        title: `Manager Approval Required: High Value Deal`,
        message: `${entityType} ${record.name || record.company} requires approval (Value: ${record.amount || 'High'})`,
        type: 'approval',
        entityType,
        entityId: String(record._id || record.opportunityId || '')
      });
      logs.push(`Dispatched approval request to Sales Manager`);
    }
  }
}

module.exports = new WorkflowEngine();
