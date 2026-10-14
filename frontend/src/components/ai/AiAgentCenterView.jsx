import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Play,
  Send,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  Database,
  Lock,
  XCircle,
  Clock
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';

export const AiAgentCenterView = () => {
  const [selectedAgent, setSelectedAgent] = useState('Sales Agent');
  const [queryInput, setQueryInput] = useState('');
  const [running, setRunning] = useState(false);
  const [agentResponse, setAgentResponse] = useState(null);
  const [aiTasks, setAiTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('agents'); // 'agents', 'approvals', 'security'

  // Context Selectors for agent actions
  const [contextData, setContextData] = useState({
    opportunities: [],
    leads: [],
    accounts: [],
    tickets: []
  });
  const [selectedEntityId, setSelectedEntityId] = useState('');

  const agents = [
    {
      name: 'Sales Agent',
      icon: TrendingUpIcon,
      tagline: 'Deal velocity, stage progression & stalled deal intervention',
      color: '#60a5fa',
      defaultQuery: 'Analyze high value pipeline and identify stalled opportunities exceeding ₹2,50,000.'
    },
    {
      name: 'Lead Agent',
      icon: UsersIcon,
      tagline: 'Dynamic qualification, scoring & duplicate prospect detection',
      color: '#34d399',
      defaultQuery: 'Triage incoming enterprise leads and recommend priority sales assignment.'
    },
    {
      name: 'Customer Agent',
      icon: BuildingIcon,
      tagline: 'Account 360 health, churn risk mitigation & expansion insights',
      color: '#a78bfa',
      defaultQuery: 'Synthesize account health and flag any customer with active critical tickets.'
    },
    {
      name: 'Support Agent',
      icon: LifeBuoyIcon,
      tagline: 'Ticket classification, SLA breach warnings & reply drafting',
      color: '#f43f5e',
      defaultQuery: 'Inspect customer support queue for immediate SLA breach risks and draft remediation reply.'
    },
    {
      name: 'Analytics Agent',
      icon: BarChartIcon,
      tagline: 'Anomaly detection, revenue forecasting & executive summaries',
      color: '#f59e0b',
      defaultQuery: 'Generate executive CRM briefing and evaluate monthly sales conversion anomalies.'
    },
    {
      name: 'Email Agent',
      icon: MailIcon,
      tagline: 'High-converting personalized customer correspondence drafting',
      color: '#22d3ee',
      defaultQuery: 'Draft executive solution demo invitation tailored for enterprise IT leaders.'
    }
  ];

  const fetchContext = async () => {
    try {
      const [oppsRes, leadsRes, accRes, tickRes, tasksRes] = await Promise.all([
        api.getOpportunities({ limit: 10 }),
        api.getLeads({ limit: 10 }),
        api.getAccounts({ limit: 10 }),
        api.getTickets(),
        api.getAiTasks()
      ]);

      setContextData({
        opportunities: oppsRes.data || [],
        leads: leadsRes.data || [],
        accounts: accRes.data || [],
        tickets: tickRes.data || []
      });

      setAiTasks(tasksRes.data || []);
    } catch (err) {
      console.error('Failed to load agent context:', err);
    }
  };

  useEffect(() => {
    fetchContext();
  }, []);

  const handleRunAgent = async (e) => {
    if (e) e.preventDefault();
    setRunning(true);
    setAgentResponse(null);

    const q = queryInput || agents.find(a => a.name === selectedAgent)?.defaultQuery;

    const payload = {};
    if (selectedAgent === 'Sales Agent' && selectedEntityId) payload.opportunityId = selectedEntityId;
    if (selectedAgent === 'Lead Agent' && selectedEntityId) payload.leadId = selectedEntityId;
    if (selectedAgent === 'Customer Agent' && selectedEntityId) payload.accountId = selectedEntityId;
    if (selectedAgent === 'Support Agent' && selectedEntityId) payload.ticketId = selectedEntityId;
    if (selectedAgent === 'Email Agent') {
      payload.company = 'Infosys Global';
      payload.leadName = 'Vikram Sarabhai';
      payload.dealName = 'ERP Cloud Modernization';
    }

    try {
      const res = await api.queryAgent(selectedAgent, q, payload);
      setAgentResponse(res.data);
      fetchContext();
    } catch (err) {
      alert('Agent execution failed: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleApproveAction = async (taskId) => {
    try {
      await api.approveAiTask(taskId);
      alert('High-impact AI action approved and executed through CRM Service Layer.');
      fetchContext();
    } catch (err) {
      alert('Approval error: ' + err.message);
    }
  };

  const handleRejectAction = async (taskId) => {
    try {
      await api.rejectAiTask(taskId);
      alert('AI proposal rejected.');
      fetchContext();
    } catch (err) {
      alert('Rejection error: ' + err.message);
    }
  };

  const handleExecuteSuggestedTool = async (suggestedTool) => {
    try {
      const res = await api.executeTool(suggestedTool.name, suggestedTool.params, false);
      if (res.data?.status === 'REQUIRES_APPROVAL') {
        alert(`Guardrail Triggered: ${res.data.message}\nAction queued for Human-In-The-Loop approval.`);
        setActiveTab('approvals');
        fetchContext();
      } else {
        alert(`Tool '${suggestedTool.name}' executed successfully! CRM state updated.`);
        fetchContext();
      }
    } catch (err) {
      alert('Tool error: ' + err.message);
    }
  };

  const pendingApprovals = aiTasks.filter(t => t.status === 'Requires Approval');

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1>AI Agent Center & Security Orchestrator</h1>
            <span className="badge badge-purple" style={{ padding: '3px 8px' }}>
              <ShieldCheck size={12} /> Guardrail Enforced
            </span>
          </div>
          <p>Autonomous specialized LLM agents operating strictly through a validated, auditable CRM tool layer</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          <Bot size={16} /> Specialized CRM Agents (6)
        </button>
        <button
          className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <Lock size={16} /> Human-In-The-Loop Approvals ({pendingApprovals.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheck size={16} /> Architecture & Guardrail Matrix
        </button>
      </div>

      {/* TAB 1: AGENTS */}
      {activeTab === 'agents' && (
        <div>
          {/* Agent Selection Cards */}
          <div className="grid-cols-3" style={{ marginBottom: 24 }}>
            {agents.map((ag) => {
              const Icon = ag.icon;
              const isSel = selectedAgent === ag.name;
              return (
                <div
                  key={ag.name}
                  className={`ai-agent-card ${isSel ? 'selected' : ''}`}
                  onClick={() => { setSelectedAgent(ag.name); setQueryInput(ag.defaultQuery); setSelectedEntityId(''); }}
                >
                  <div className="ai-pill-active">
                    <div className="ai-pill-pulse" />
                    <span>Agent Ready</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: '10px',
                      backgroundColor: `${ag.color}22`,
                      color: ag.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{ag.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Enterprise Autonomous Agent</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {ag.tagline}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Agent Query & Context Box */}
          <div className="card" style={{ marginBottom: 24, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={20} style={{ color: '#818cf8' }} />
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>
                  Engage {selectedAgent}
                </span>
              </div>

              {/* Context Selector */}
              {selectedAgent === 'Sales Agent' && (
                <select
                  className="filter-select"
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                >
                  <option value="">Inspect Entire Pipeline</option>
                  {contextData.opportunities.map(o => (
                    <option key={o._id} value={o.opportunityId}>{o.name} (₹{o.amount?.toLocaleString()})</option>
                  ))}
                </select>
              )}

              {selectedAgent === 'Lead Agent' && (
                <select
                  className="filter-select"
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                >
                  <option value="">Triage All Inbound Leads</option>
                  {contextData.leads.map(l => (
                    <option key={l._id} value={l.leadId}>{l.firstName} {l.lastName} - {l.company}</option>
                  ))}
                </select>
              )}

              {selectedAgent === 'Customer Agent' && (
                <select
                  className="filter-select"
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                >
                  <option value="">Select Account for 360 Analysis</option>
                  {contextData.accounts.map(a => (
                    <option key={a._id} value={a.accountId}>{a.companyName}</option>
                  ))}
                </select>
              )}

              {selectedAgent === 'Support Agent' && (
                <select
                  className="filter-select"
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                >
                  <option value="">Queue Overview & Breaches</option>
                  {contextData.tickets.map(t => (
                    <option key={t._id} value={t.ticketId}>{t.ticketId}: {t.subject}</option>
                  ))}
                </select>
              )}
            </div>

            <form onSubmit={handleRunAgent}>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="form-control"
                  rows={3}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder={`Ask ${selectedAgent} a question or choose an enterprise inspection workflow...`}
                  style={{ paddingRight: 110, fontSize: '0.92rem', resize: 'vertical' }}
                />
                <button
                  type="submit"
                  disabled={running}
                  className="btn btn-primary"
                  style={{ position: 'absolute', right: 12, bottom: 12 }}
                >
                  {running ? <Activity size={16} className="animate-spin" /> : <Play size={16} />}
                  <span>{running ? 'Processing...' : 'Run Agent'}</span>
                </button>
              </div>
            </form>

            {/* Agent Live Response Panel */}
            {agentResponse && (
              <div style={{
                marginTop: 20,
                padding: '20px',
                borderRadius: '10px',
                backgroundColor: 'rgba(10, 14, 23, 0.85)',
                border: '1px solid rgba(99, 102, 241, 0.35)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={18} style={{ color: '#34d399' }} />
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      {agentResponse.agent} Intelligence Briefing
                    </span>
                  </div>
                  <span className="badge badge-purple">TaskId: {String(agentResponse.taskId).slice(-6)}</span>
                </div>

                <div style={{ fontSize: '0.92rem', color: '#cbd5e1', marginBottom: 14, lineHeight: 1.5 }}>
                  {agentResponse.summary}
                </div>

                {/* Structured Insights */}
                {agentResponse.insights && (
                  <ul style={{ paddingLeft: 20, marginBottom: 14, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {agentResponse.insights.map((ins, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{ins}</li>
                    ))}
                  </ul>
                )}

                {/* Score Assessment */}
                {agentResponse.scoreAssessment && (
                  <div style={{ padding: 12, backgroundColor: 'var(--bg-input)', borderRadius: 8, marginBottom: 12, fontSize: '0.85rem' }}>
                    Score: <strong>{agentResponse.scoreAssessment.currentScore}/100</strong> • Category: <StatusBadge status={agentResponse.scoreAssessment.category} type="score" />
                    <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: 4 }}>{agentResponse.scoreAssessment.status}</div>
                  </div>
                )}

                {/* SLA Risk Assessment */}
                {agentResponse.slaStatus && (
                  <div style={{ padding: 12, backgroundColor: 'var(--bg-input)', borderRadius: 8, marginBottom: 12, fontSize: '0.85rem' }}>
                    <div style={{ color: agentResponse.slaStatus.isSlaAtRisk ? '#f43f5e' : '#34d399', fontWeight: 600 }}>
                      {agentResponse.slaStatus.warning}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                      Hours remaining: {agentResponse.slaStatus.hoursRemaining}h
                    </div>
                  </div>
                )}

                {/* Email Draft Output */}
                {agentResponse.generatedEmail && (
                  <div style={{ padding: 14, backgroundColor: 'var(--bg-input)', borderRadius: 8, marginBottom: 14 }}>
                    <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, marginBottom: 6 }}>
                      SUBJECT: {agentResponse.generatedEmail.subject}
                    </div>
                    <pre style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.82rem',
                      color: '#cbd5e1',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5
                    }}>
                      {agentResponse.generatedEmail.body}
                    </pre>
                  </div>
                )}

                {/* Recommended Action & Tool Execution */}
                {agentResponse.recommendedAction && (
                  <div style={{ fontSize: '0.85rem', color: '#93c5fd', marginTop: 10, marginBottom: 12 }}>
                    <strong>Strategic Recommendation:</strong> {agentResponse.recommendedAction}
                  </div>
                )}

                {agentResponse.suggestedTool && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(79, 70, 229, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    marginTop: 10
                  }}>
                    <div style={{ fontSize: '0.82rem' }}>
                      <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Proposed Tool Execution: </span>
                      <code style={{ color: '#fff' }}>{agentResponse.suggestedTool.name}()</code>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleExecuteSuggestedTool(agentResponse.suggestedTool)}
                    >
                      Authorize & Execute Tool
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PENDING HUMAN APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Lock size={18} style={{ color: '#f59e0b' }} /> Human-In-The-Loop Approval Queue (Section 15)
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Actions with financial, conversion, or contract impact require explicit human confirmation.
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
              <CheckCircle size={32} style={{ margin: '0 auto 10px', color: '#34d399', opacity: 0.6 }} />
              <div>All pending agent actions have been reviewed and approved.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pendingApprovals.map((task) => (
                <div key={task._id} style={{
                  padding: 16,
                  borderRadius: 10,
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid rgba(245, 158, 11, 0.35)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={18} style={{ color: '#fbbf24' }} />
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                        Tool Action: <code>{task.proposedAction?.toolName}()</code>
                      </span>
                    </div>
                    <span className="badge badge-amber">Requires Approval</span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: 8 }}>
                    <strong>Guardrail Reason:</strong> {task.proposedAction?.reason}
                  </div>

                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-dim)',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: 8,
                    borderRadius: 6,
                    marginBottom: 12
                  }}>
                    Parameters: {JSON.stringify(task.proposedAction?.params)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#fda4af', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                      onClick={() => handleRejectAction(task._id)}
                    >
                      <XCircle size={14} /> Reject Proposal
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApproveAction(task._id)}
                    >
                      <CheckCircle size={14} /> Authorize & Commit to DB
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARCHITECTURE & SECURITY MATRIX */}
      {activeTab === 'security' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={18} style={{ color: '#818cf8' }} /> Section 15: AI Tool Security & Guardrail Pipeline
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: '12px',
            marginBottom: 24,
            overflowX: 'auto',
            gap: 12
          }}>
            {[
              { label: 'AI Agent', sub: 'Reasoning Prompt' },
              { label: 'AI Orchestrator', sub: 'Routing & Context' },
              { label: 'Guardrail Layer', sub: 'Injection & Sensitive check' },
              { label: 'Validation & RBAC', sub: 'JWT Token & Permissions' },
              { label: 'CRM Service Layer', sub: 'Controlled Business Logic' },
              { label: 'MongoDB', sub: 'Audit Trail Written' }
            ].map((node, nIdx) => (
              <React.Fragment key={node.label}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  backgroundColor: nIdx === 2 || nIdx === 3 ? 'rgba(79, 70, 229, 0.2)' : 'var(--bg-card)',
                  border: nIdx === 2 || nIdx === 3 ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  minWidth: 130
                }}>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{node.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>{node.sub}</div>
                </div>
                {nIdx < 5 && <ArrowRight size={18} style={{ color: '#818cf8', flexShrink: 0 }} />}
              </React.Fragment>
            ))}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: 8 }}>Controlled Tool Registry</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {[
                'getLead()', 'searchLeads()', 'updateLead()', 'createTask()',
                'getCustomer()', 'getOpportunity()', 'updateOpportunity()',
                'createActivity()', 'getSalesReport()', 'getCustomerTimeline()'
              ].map(tool => (
                <div key={tool} style={{ padding: '8px 12px', borderRadius: 6, backgroundColor: 'var(--bg-input)', fontFamily: 'monospace', color: '#93c5fd', fontSize: '0.8rem' }}>
                  ✓ {tool}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper SVG icon wrappers
const TrendingUpIcon = ({ size }) => <TrendingUp size={size} />;
const UsersIcon = ({ size }) => <Users size={size} />;
const BuildingIcon = ({ size }) => <Building2 size={size} />;
const LifeBuoyIcon = ({ size }) => <LifeBuoy size={size} />;
const BarChartIcon = ({ size }) => <BarChart3 size={size} />;
const MailIcon = ({ size }) => <Mail size={size} />;

import { TrendingUp, Users, Building2, LifeBuoy, BarChart3, Mail } from 'lucide-react';
export default AiAgentCenterView;
