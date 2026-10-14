import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  Shield,
  Sliders,
  X,
  Star
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';

export const ServiceView = () => {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'complaints', 'sla'
  const [tickets, setTickets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [slaRules, setSlaRules] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Forms
  const [ticketForm, setTicketForm] = useState({
    customerName: '',
    account: '',
    subject: '',
    description: '',
    category: 'Technical',
    priority: 'High'
  });

  const [resolveForm, setResolveForm] = useState({
    description: 'Issue diagnosed and hotfix deployed.',
    satisfactionScore: 5,
    customerFeedback: 'Very prompt resolution by support team.'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, sRes, aRes] = await Promise.all([
        api.getTickets(),
        api.getComplaints(),
        api.getSlaRules(),
        api.getAccounts()
      ]);
      setTickets(tRes.data || []);
      setComplaints(cRes.data || []);
      setSlaRules(sRes.data || []);
      setAccounts(aRes.data || []);

      if (aRes.data?.length > 0 && !ticketForm.customerName) {
        setTicketForm(prev => ({ ...prev, customerName: aRes.data[0].companyName, account: aRes.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load customer service:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.createTicket(ticketForm);
      setShowCreateTicketModal(false);
      setTicketForm({ customerName: accounts[0]?.companyName || '', account: accounts[0]?._id, subject: '', description: '', category: 'Technical', priority: 'High' });
      fetchData();
    } catch (err) {
      alert('Error creating ticket: ' + err.message);
    }
  };

  const handleResolveTicket = async (e) => {
    e.preventDefault();
    try {
      await api.updateTicket(selectedTicket._id, {
        status: 'Resolved',
        resolution: resolveForm
      });
      setShowResolveModal(false);
      setSelectedTicket(null);
      fetchData();
      alert(`Ticket #${selectedTicket.ticketId} marked as Resolved! CSAT rating recorded.`);
    } catch (err) {
      alert('Resolution error: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <h1>Customer Service, SLAs & Complaints</h1>
          <p>Multi-tier enterprise support queue, SLA breach detection timer, and resolution CSAT satisfaction</p>
        </div>

        <div className="page-actions">
          {activeTab === 'tickets' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateTicketModal(true)}>
              <Plus size={14} /> Log Support Ticket
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <LifeBuoy size={16} /> Active Tickets ({tickets.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          <AlertTriangle size={16} /> Escalated Complaints ({complaints.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'sla' ? 'active' : ''}`}
          onClick={() => setActiveTab('sla')}
        >
          <Shield size={16} /> Configurable SLA Matrix ({slaRules.length})
        </button>
      </div>

      {/* TAB 1: TICKETS */}
      {activeTab === 'tickets' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject & Category</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>SLA Due & Status</th>
                <th>Assigned Agent</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const now = new Date();
                const due = new Date(t.sla?.slaDueAt || Date.now());
                const hoursLeft = Math.round((due - now) / 3600000);
                const isBreached = t.sla?.breached || (hoursLeft < 0 && !['Resolved', 'Closed'].includes(t.status));

                return (
                  <tr key={t._id}>
                    <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{t.ticketId}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{t.subject}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{t.category}</div>
                    </td>
                    <td>{t.customerName}</td>
                    <td><StatusBadge status={t.priority} /></td>
                    <td>
                      {['Resolved', 'Closed'].includes(t.status) ? (
                        <span className="badge badge-green">Resolved On-Time</span>
                      ) : isBreached ? (
                        <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} /> SLA BREACHED
                        </span>
                      ) : (
                        <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {hoursLeft}h remaining
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#fff' }}>{t.assignedAgent?.name || 'David Chen'}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      {t.status !== 'Resolved' && t.status !== 'Closed' ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7', fontSize: '0.72rem', padding: '3px 8px' }}
                          onClick={() => { setSelectedTicket(t); setShowResolveModal(true); }}
                        >
                          Resolve & CSAT
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, color: '#fbbf24', fontSize: '0.8rem' }}>
                          <Star size={13} fill="#fbbf24" /> {t.resolution?.satisfactionScore || 5}/5
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Category</th>
                <th>Customer</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Assigned Agent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontFamily: 'monospace', color: '#fda4af', fontWeight: 600 }}>{c.complaintId}</td>
                  <td><span className="badge badge-slate">{c.category}</span></td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{c.customerName}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.description}</td>
                  <td><StatusBadge status={c.severity} /></td>
                  <td>{c.assignedAgent?.name}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SLA CONFIGURATION */}
      {activeTab === 'sla' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Enterprise Service Level Agreement (SLA) Matrix</div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Incident resolution deadlines and automatic manager escalation timers enforced by the CRM service layer:
          </p>
          <div className="grid-cols-4">
            {slaRules.map((rule) => (
              <div key={rule.priority} className="card" style={{ padding: 18, borderLeft: rule.priority === 'Critical' ? '4px solid #f43f5e' : '4px solid #6366f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <StatusBadge status={rule.priority} />
                  <span style={{ fontSize: '0.72rem', color: '#34d399' }}>Auto-escalate</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '8px 0' }}>
                  {rule.targetResolutionHours} Hours
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Target Resolution Window
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 8 }}>
                  Escalation Trigger: After {rule.escalationAfterHours} hour(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Ticket */}
      {showCreateTicketModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LifeBuoy size={18} style={{ color: '#818cf8' }} /> Log Enterprise Support Ticket
              </div>
              <button onClick={() => setShowCreateTicketModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer Account *</label>
                  <select
                    className="form-control"
                    value={ticketForm.account}
                    onChange={(e) => {
                      const acc = accounts.find(a => a._id === e.target.value);
                      setTicketForm({ ...ticketForm, account: acc._id, customerName: acc.companyName });
                    }}
                  >
                    {accounts.map(a => (
                      <option key={a._id} value={a._id}>{a.companyName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    className="form-control"
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="e.g. ERP journal sync timeout on SEZ invoice"
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    >
                      <option value="Critical">Critical (2h SLA)</option>
                      <option value="High">High (4h SLA)</option>
                      <option value="Medium">Medium (8h SLA)</option>
                      <option value="Low">Low (24h SLA)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Billing">Billing</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Integration">Integration</option>
                      <option value="Account Management">Account Management</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTicketModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Start SLA Timer & Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Ticket */}
      {showResolveModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} style={{ color: '#34d399' }} /> Resolve Ticket #{selectedTicket.ticketId}
              </div>
              <button onClick={() => setShowResolveModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResolveTicket}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resolution Details *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    required
                    value={resolveForm.description}
                    onChange={(e) => setResolveForm({ ...resolveForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Satisfaction Rating (1-5)</label>
                  <select
                    className="form-control"
                    value={resolveForm.satisfactionScore}
                    onChange={(e) => setResolveForm({ ...resolveForm, satisfactionScore: Number(e.target.value) })}
                  >
                    <option value="5">5 - Excellent (Exceeded Expectations)</option>
                    <option value="4">4 - Good (Prompt Resolution)</option>
                    <option value="3">3 - Satisfactory</option>
                    <option value="2">2 - Needs Improvement</option>
                    <option value="1">1 - Unsatisfactory</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResolveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Complete & Close Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceView;
