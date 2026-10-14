import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  ArrowRight,
  Play,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  X,
  History,
  Workflow as WorkflowIcon
} from 'lucide-react';
import api from '../../api/client';

export const AutomationView = () => {
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [activeTab, setActiveTab] = useState('workflows'); // 'workflows', 'executions'
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'LEAD_SCORE_CHANGED',
    triggerEntity: 'Lead',
    conditionField: 'leadScore',
    conditionOperator: '>=',
    conditionValue: 75,
    actionType: 'CREATE_TASK'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, eRes] = await Promise.all([
        api.getWorkflows(),
        api.getWorkflowExecutions()
      ]);
      setWorkflows(wRes.data || []);
      setExecutions(eRes.data || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id) => {
    try {
      await api.toggleWorkflow(id);
      fetchData();
    } catch (err) {
      alert('Toggle failed: ' + err.message);
    }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        isActive: true,
        trigger: {
          type: formData.triggerType,
          entity: formData.triggerEntity
        },
        condition: {
          field: formData.conditionField,
          operator: formData.conditionOperator,
          value: formData.conditionValue
        },
        actions: [
          {
            actionType: formData.actionType,
            params: { subject: `Auto Task: ${formData.name}`, priority: 'High' }
          }
        ]
      };

      await api.createWorkflow(payload);
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        triggerType: 'LEAD_SCORE_CHANGED',
        triggerEntity: 'Lead',
        conditionField: 'leadScore',
        conditionOperator: '>=',
        conditionValue: 75,
        actionType: 'CREATE_TASK'
      });
      fetchData();
    } catch (err) {
      alert('Error creating workflow: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <h1>Workflow Automation Engine</h1>
          <p>Autonomous Trigger &rarr; Condition &rarr; Action event processing pipeline across all CRM entities</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New Automation Rule
          </button>
        </div>
      </div>

      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'workflows' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflows')}
        >
          <Cpu size={16} /> Active Workflow Rules ({workflows.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'executions' ? 'active' : ''}`}
          onClick={() => setActiveTab('executions')}
        >
          <History size={16} /> Execution Audit Logs ({executions.length})
        </button>
      </div>

      {activeTab === 'workflows' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {workflows.map((wf) => (
            <div key={wf._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{wf.name}</span>
                    <span className={`badge ${wf.isActive ? 'badge-green' : 'badge-slate'}`}>
                      {wf.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{wf.description}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Triggered <strong>{wf.executionCount || 0}</strong> times
                  </div>
                  <button
                    onClick={() => handleToggle(wf._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: wf.isActive ? '#34d399' : 'var(--text-dim)' }}
                  >
                    {wf.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              </div>

              {/* Visual Flow Blocks: Trigger -> Condition -> Action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: 'var(--bg-input)',
                padding: '12px 16px',
                borderRadius: '8px',
                flexWrap: 'wrap'
              }}>
                {/* Trigger */}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{ fontSize: '0.68rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 600 }}>TRIGGER</div>
                  <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>{wf.trigger?.type} ({wf.trigger?.entity})</div>
                </div>

                <ArrowRight size={16} style={{ color: 'var(--text-dim)' }} />

                {/* Condition */}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{ fontSize: '0.68rem', color: '#fcd34d', textTransform: 'uppercase', fontWeight: 600 }}>CONDITION</div>
                  <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                    {wf.condition?.field} {wf.condition?.operator} {String(wf.condition?.value)}
                  </div>
                </div>

                <ArrowRight size={16} style={{ color: 'var(--text-dim)' }} />

                {/* Actions */}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ fontSize: '0.68rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 600 }}>ACTION</div>
                  <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                    {(wf.actions || []).map(a => a.actionType).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'executions' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Workflow Name</th>
                <th>Trigger Event</th>
                <th>Target Entity</th>
                <th>Status</th>
                <th>Actions Fired</th>
                <th>Executed At</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((e) => (
                <tr key={e._id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{e.workflowName}</td>
                  <td><span className="badge badge-blue">{e.triggerType}</span></td>
                  <td>{e.entityType} ({e.entityId})</td>
                  <td>
                    <span className={`badge ${e.status === 'Success' ? 'badge-green' : 'badge-amber'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td style={{ color: '#34d399', fontSize: '0.78rem' }}>
                    {e.actionsTriggered?.join(', ') || 'Condition Not Met'}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {new Date(e.executedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={18} style={{ color: '#818cf8' }} /> Build Automated Workflow Rule
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateWorkflow}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Workflow Name *</label>
                  <input
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Deal Stage Proposal Auto-Task"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Trigger Event</label>
                    <select
                      className="form-control"
                      value={formData.triggerType}
                      onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                    >
                      <option value="LEAD_SCORE_CHANGED">Lead Score Changed</option>
                      <option value="LEAD_CREATED">Lead Created</option>
                      <option value="OPPORTUNITY_STAGE_CHANGED">Opportunity Stage Changed</option>
                      <option value="OPPORTUNITY_AMOUNT_HIGH">Opportunity High Amount</option>
                      <option value="TICKET_CREATED">Ticket Created</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Action to Execute</label>
                    <select
                      className="form-control"
                      value={formData.actionType}
                      onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                    >
                      <option value="CREATE_TASK">Create Follow-up Task</option>
                      <option value="SEND_NOTIFICATION">Send In-App Notification</option>
                      <option value="REQUIRE_APPROVAL">Require Manager Approval</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Condition Field</label>
                    <input
                      className="form-control"
                      value={formData.conditionField}
                      onChange={(e) => setFormData({ ...formData, conditionField: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Threshold Value</label>
                    <input
                      className="form-control"
                      value={formData.conditionValue}
                      onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Deploy Workflow</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationView;
