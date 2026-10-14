import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  LifeBuoy,
  ShoppingBag,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  Activity,
  Users
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';

export const AccountsView = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Account 360 Drawer State
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [account360, setAccount360] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [active360Tab, setActive360Tab] = useState('overview');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Technology',
    website: '',
    phone: '',
    email: '',
    customerType: 'Enterprise',
    employeeCount: 500,
    annualRevenue: 50000000,
    healthScore: 90
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.getAccounts({
        search,
        industry: industryFilter,
        customerStatus: statusFilter
      });
      setAccounts(res.data || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [search, industryFilter, statusFilter]);

  const openAccount360 = async (id) => {
    setSelectedAccountId(id);
    setDrawerLoading(true);
    try {
      const res = await api.getAccount360(id);
      setAccount360(res.data);
      setActive360Tab('overview');
    } catch (err) {
      alert('Failed to load Account 360: ' + err.message);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await api.createAccount(formData);
      setShowCreateModal(false);
      setFormData({
        companyName: '',
        industry: 'Technology',
        website: '',
        phone: '',
        email: '',
        customerType: 'Enterprise',
        employeeCount: 500,
        annualRevenue: 50000000,
        healthScore: 90
      });
      fetchAccounts();
    } catch (err) {
      alert('Create account failed: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-box">
          <h1>Customer Accounts 360</h1>
          <p>Unified customer records, LTV analytics, contact relationships, and live interaction timeline</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New Account
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="table-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-input-wrap">
            <Search size={16} style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search companies, account IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Telecommunications">Telecommunications</option>
            <option value="Logistics">Logistics</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="At Risk">At Risk</option>
            <option value="Prospect">Prospect</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {accounts.length} enterprise accounts
        </div>
      </div>

      {/* Accounts Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Company Name</th>
              <th>Industry</th>
              <th>Type</th>
              <th>Health Score</th>
              <th>Status</th>
              <th>Owner</th>
              <th style={{ textAlign: 'right' }}>360 View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  Loading accounts...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  No customer accounts found.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc._id} style={{ cursor: 'pointer' }} onClick={() => openAccount360(acc.accountId)}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>
                    {acc.accountId}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{acc.companyName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{acc.website || acc.email}</div>
                  </td>
                  <td>{acc.industry}</td>
                  <td>
                    <span className="badge badge-purple">{acc.customerType}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: acc.healthScore >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                        color: acc.healthScore >= 80 ? '#34d399' : '#fda4af'
                      }}>
                        {acc.healthScore}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>/100</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={acc.customerStatus} />
                  </td>
                  <td>{acc.accountOwner?.name || 'Sarah Jenkins'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => { e.stopPropagation(); openAccount360(acc.accountId); }}
                    >
                      Inspect 360 &rarr;
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Account 360 Slide-over Modal / Drawer */}
      {selectedAccountId && (
        <div className="modal-overlay" onClick={() => setSelectedAccountId(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: 840, height: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {drawerLoading || !account360 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>
                Loading Account 360 Data...
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="modal-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={20} style={{ color: '#818cf8' }} />
                      <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
                        {account360.overview.companyName}
                      </h2>
                      <StatusBadge status={account360.overview.customerStatus} />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {account360.overview.accountId} • {account360.overview.industry} • Owner: {account360.overview.accountOwner?.name}
                    </div>
                  </div>
                  <button onClick={() => setSelectedAccountId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                    <X size={22} />
                  </button>
                </div>

                {/* Tabs Header */}
                <div style={{ padding: '0 24px', backgroundColor: 'var(--bg-card)' }}>
                  <div className="tabs-header" style={{ marginBottom: 0 }}>
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'contacts', label: `Contacts (${account360.contacts?.length || 0})` },
                      { id: 'opportunities', label: `Deals (${account360.opportunities?.length || 0})` },
                      { id: 'orders', label: `Orders (${account360.orders?.length || 0})` },
                      { id: 'tickets', label: `Tickets (${account360.tickets?.length || 0})` },
                      { id: 'timeline', label: 'Timeline' },
                      { id: 'insights', label: 'AI Insights' }
                    ].map(t => (
                      <button
                        key={t.id}
                        className={`tab-btn ${active360Tab === t.id ? 'active' : ''}`}
                        onClick={() => setActive360Tab(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Contents */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                  {active360Tab === 'overview' && (
                    <div>
                      <div className="grid-cols-3" style={{ marginBottom: 20 }}>
                        <div className="card" style={{ padding: 14 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ANNUAL REVENUE</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                            ₹{account360.overview.annualRevenue?.toLocaleString()}
                          </div>
                        </div>
                        <div className="card" style={{ padding: 14 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>EMPLOYEE COUNT</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: 4 }}>
                            {account360.overview.employeeCount?.toLocaleString()}
                          </div>
                        </div>
                        <div className="card" style={{ padding: 14 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>HEALTH SCORE</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8', marginTop: 4 }}>
                            {account360.overview.healthScore} / 100
                          </div>
                        </div>
                      </div>

                      <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-title" style={{ marginBottom: 12 }}>Corporate Contact Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
                          <div><span style={{ color: 'var(--text-dim)' }}>Phone:</span> <span style={{ color: '#fff' }}>{account360.overview.phone || 'N/A'}</span></div>
                          <div><span style={{ color: 'var(--text-dim)' }}>Email:</span> <span style={{ color: '#fff' }}>{account360.overview.email || 'N/A'}</span></div>
                          <div><span style={{ color: 'var(--text-dim)' }}>Website:</span> <span style={{ color: '#60a5fa' }}>{account360.overview.website || 'N/A'}</span></div>
                          <div><span style={{ color: 'var(--text-dim)' }}>Location:</span> <span style={{ color: '#fff' }}>{account360.overview.address?.city}, {account360.overview.address?.country}</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {active360Tab === 'contacts' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {account360.contacts.length === 0 ? (
                        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>No contacts linked to this account.</div>
                      ) : (
                        account360.contacts.map((c) => (
                          <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, backgroundColor: 'var(--bg-input)', borderRadius: 8 }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{c.firstName} {c.lastName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.jobTitle} • {c.email} • {c.phone}</div>
                            </div>
                            {c.isDecisionMaker && (
                              <span className="badge badge-green">Decision Maker</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {active360Tab === 'opportunities' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {account360.opportunities.length === 0 ? (
                        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>No deals registered yet.</div>
                      ) : (
                        account360.opportunities.map((o) => (
                          <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'var(--bg-input)', borderRadius: 8 }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{o.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Close: {new Date(o.expectedCloseDate).toLocaleDateString()}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <StatusBadge status={o.stage} />
                              <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>₹{o.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {active360Tab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {account360.orders.length === 0 ? (
                        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>No orders placed yet.</div>
                      ) : (
                        account360.orders.map((o) => (
                          <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'var(--bg-input)', borderRadius: 8 }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff' }}>Order #{o.orderNumber}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(o.orderDate).toLocaleDateString()} • ERP Ref: {o.erpSync?.erpReferenceId}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span className="badge badge-green" style={{ marginBottom: 4 }}>{o.status}</span>
                              <div style={{ fontWeight: 700, color: '#34d399' }}>₹{o.total.toLocaleString()}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {active360Tab === 'tickets' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {account360.tickets.length === 0 ? (
                        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>No customer service tickets.</div>
                      ) : (
                        account360.tickets.map((t) => (
                          <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'var(--bg-input)', borderRadius: 8 }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{t.ticketId}: {t.subject}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {t.category} • Agent: {t.assignedAgent?.name}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <StatusBadge status={t.priority} />
                              <StatusBadge status={t.status} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {active360Tab === 'timeline' && (
                    <div className="timeline">
                      {(account360.timeline || []).map((ev, idx) => (
                        <div key={idx} className="timeline-item">
                          <div className="timeline-dot" />
                          <div className="timeline-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{ev.title}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{new Date(ev.date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ev.details}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {active360Tab === 'insights' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Sparkles size={18} style={{ color: '#818cf8' }} />
                        <span style={{ fontWeight: 600, color: '#fff' }}>AI Copilot Synthesized Account Intelligence</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(account360.aiInsights || []).map((ins, idx) => (
                          <div key={idx} style={{
                            padding: 14,
                            borderRadius: 8,
                            backgroundColor: ins.category === 'Risk' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(79, 70, 229, 0.12)',
                            border: ins.category === 'Risk' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ins.category === 'Risk' ? '#fda4af' : '#a5b4fc', textTransform: 'uppercase' }}>
                                {ins.category} Intelligence
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Confidence: {Math.round(ins.confidence * 100)}%</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#fff', lineHeight: 1.5 }}>
                              {ins.insight}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setSelectedAccountId(null)}>
                    Close 360 View
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} style={{ color: '#818cf8' }} /> Create Customer Account
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAccount}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    className="form-control"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Wipro Digital Limited"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <select
                      className="form-control"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance & Banking</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer Type</label>
                    <select
                      className="form-control"
                      value={formData.customerType}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                    >
                      <option value="Enterprise">Enterprise</option>
                      <option value="Mid-Market">Mid-Market</option>
                      <option value="SMB">SMB</option>
                      <option value="Strategic Partner">Strategic Partner</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsView;
