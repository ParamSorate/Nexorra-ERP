import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Upload,
  SlidersHorizontal,
  Search,
  ArrowRightCircle,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  CheckCircle,
  Flame,
  Award
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const LeadsView = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    industry: 'Technology',
    jobTitle: '',
    leadSource: 'Website',
    qualification: {
      budget: '₹25,00,000 - ₹50,00,000',
      requirement: 'Enterprise ERP Suite',
      timeline: '1-3 Months',
      decisionMaker: true,
      companySize: '500-1000 Employees',
      productInterest: 'Enterprise ERP Suite'
    }
  });

  // Scoring Rules State
  const [scoringRules, setScoringRules] = useState({});

  const { setActiveModule } = useAuth();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads({
        page,
        limit: 10,
        search,
        status: statusFilter,
        source: sourceFilter
      });
      setLeads(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, search, statusFilter, sourceFilter]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await api.createLead(formData);
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        email: '',
        phone: '',
        industry: 'Technology',
        jobTitle: '',
        leadSource: 'Website',
        qualification: {
          budget: '₹25,00,000 - ₹50,00,000',
          requirement: 'Enterprise ERP Suite',
          timeline: '1-3 Months',
          decisionMaker: true,
          companySize: '500-1000 Employees',
          productInterest: 'Enterprise ERP Suite'
        }
      });
      fetchLeads();
    } catch (err) {
      alert('Error creating lead: ' + err.message);
    }
  };

  const handleConvertLead = async (lead) => {
    setSelectedLead(lead);
    setShowConvertModal(true);
  };

  const executeConvert = async () => {
    try {
      await api.convertLead(selectedLead.leadId || selectedLead._id, {
        companyName: selectedLead.company,
        opportunityName: `${selectedLead.company} - Expansion Deal`,
        opportunityAmount: 600000
      });
      setShowConvertModal(false);
      setSelectedLead(null);
      fetchLeads();
      alert(`Lead ${selectedLead.company} successfully converted into Account, Contact, and Opportunity!`);
    } catch (err) {
      alert('Conversion failed: ' + err.message);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.deleteLead(id);
      fetchLeads();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const openScoringRules = async () => {
    try {
      const res = await api.getScoringRules();
      setScoringRules(res.data || {});
      setShowRulesModal(true);
    } catch (err) {
      alert('Failed to load rules: ' + err.message);
    }
  };

  const saveScoringRules = async (e) => {
    e.preventDefault();
    try {
      await api.updateScoringRules(scoringRules);
      setShowRulesModal(false);
      fetchLeads();
      alert('Lead scoring rules updated successfully! Existing leads recalibrated.');
    } catch (err) {
      alert('Failed to update scoring: ' + err.message);
    }
  };

  const executeImportDemo = async () => {
    try {
      const sampleLeads = [
        { firstName: 'Sameer', lastName: 'Nair', company: 'Paytm Payments Bank', email: 'sameer.nair@paytm.internal', phone: '+91 99001 11222', industry: 'Finance', leadSource: 'CSV Import' },
        { firstName: 'Aditi', lastName: 'Roy', company: 'Ola Mobility Technologies', email: 'aditi.roy@ola.internal', phone: '+91 99002 22333', industry: 'Technology', leadSource: 'CSV Import' },
        { firstName: 'Gautam', lastName: 'Singhania', company: 'Raymond Apparel Suite', email: 'gautam@raymond.internal', phone: '+91 99003 33444', industry: 'Manufacturing', leadSource: 'CSV Import' }
      ];
      await api.importLeads(sampleLeads);
      setShowImportModal(false);
      fetchLeads();
      alert('Batch imported 3 sample enterprise leads from CSV file.');
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-box">
          <h1>Lead Management & Scoring</h1>
          <p>Capture, automatically score, qualify, and convert enterprise prospects into revenue opportunities</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={openScoringRules}>
            <SlidersHorizontal size={14} /> Scoring Rules
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowImportModal(true)}>
            <Upload size={14} /> Import Leads
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> Capture Lead
          </button>
        </div>
      </div>

      {/* Toolbar / Search / Filter */}
      <div className="table-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-input-wrap">
            <Search size={16} style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Progress">In Progress</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            className="filter-select"
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Event">Event</option>
            <option value="Advertisement">Advertisement</option>
            <option value="CSV Import">CSV Import</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Showing {leads.length} of {pagination.total || 0} leads
        </div>
      </div>

      {/* Leads Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Prospect & Company</th>
              <th>Industry & Source</th>
              <th>Score (0-100)</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>
                    {lead.leadId}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{lead.firstName} {lead.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.company} • {lead.email}</div>
                  </td>
                  <td>
                    <div style={{ color: '#cbd5e1' }}>{lead.industry}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{lead.leadSource}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: lead.leadScore >= 70 ? '#f43f5e' : lead.leadScore >= 40 ? '#f59e0b' : '#60a5fa'
                      }}>
                        {lead.leadScore}
                      </span>
                      <StatusBadge status={lead.scoreCategory} type="score" />
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={lead.leadStatus} />
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>{lead.owner?.name || 'Unassigned'}</div>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      {!lead.isConverted && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '0.72rem', padding: '4px 8px' }}
                          onClick={() => handleConvertLead(lead)}
                          title="Convert to Account + Contact + Opportunity"
                        >
                          <ArrowRightCircle size={13} /> Convert
                        </button>
                      )}
                      {lead.isConverted && (
                        <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                          Converted
                        </span>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 6px', color: '#fda4af' }}
                        onClick={() => handleDeleteLead(lead.leadId)}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <div>Page {pagination.page} of {pagination.totalPages}</div>
            <div className="pagination-controls">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Capture Lead */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} style={{ color: '#818cf8' }} /> Capture New Enterprise Lead
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      className="form-control"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Vikram"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      className="form-control"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Sarabhai"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input
                      className="form-control"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. ISRO Systems"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vikram@isro.internal"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 00000"
                    />
                  </div>
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
                      <option value="Telecommunications">Telecommunications</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Lead Source</label>
                    <select
                      className="form-control"
                      value={formData.leadSource}
                      onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Advertisement">Advertisement</option>
                      <option value="Event">Event</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Partner">Partner</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Product Interest</label>
                    <input
                      className="form-control"
                      value={formData.qualification.productInterest}
                      onChange={(e) => setFormData({
                        ...formData,
                        qualification: { ...formData.qualification, productInterest: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginTop: 6
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a5b4fc', marginBottom: 8 }}>
                    Lead Qualification Baseline
                  </div>
                  <div className="form-grid-2">
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Estimated Budget</label>
                      <input
                        className="form-control"
                        value={formData.qualification.budget}
                        onChange={(e) => setFormData({
                          ...formData,
                          qualification: { ...formData.qualification, budget: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Decision Maker Identified?</label>
                      <select
                        className="form-control"
                        value={formData.qualification.decisionMaker}
                        onChange={(e) => setFormData({
                          ...formData,
                          qualification: { ...formData.qualification, decisionMaker: e.target.value === 'true' }
                        })}
                      >
                        <option value="true">Yes - Contact is Decision Maker (+15 pts)</option>
                        <option value="false">No - Evaluator / Influencer</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Calculate Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Convert Lead */}
      {showConvertModal && selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} style={{ color: '#34d399' }} /> Convert Lead to Revenue Account
              </div>
              <button onClick={() => setShowConvertModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Converting <strong>{selectedLead.firstName} {selectedLead.lastName}</strong> from <strong>{selectedLead.company}</strong> will automatically generate linked enterprise records:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>1. Customer Account</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedLead.company} (Enterprise)</div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>2. Primary Contact</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedLead.firstName} {selectedLead.lastName} ({selectedLead.email})</div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>3. Opportunity (Pipeline: Qualification Stage)</div>
                  <div style={{ fontWeight: 600, color: '#34d399' }}>₹6,00,000 Expansion Deal</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConvertModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={executeConvert}>
                Confirm Conversion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Lead Scoring Rules */}
      {showRulesModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={18} style={{ color: '#818cf8' }} /> Configure Lead Scoring Rules
              </div>
              <button onClick={() => setShowRulesModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveScoringRules}>
              <div className="modal-body">
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Adjust weightings for prospect interactions and demographic attributes (0-100 scale):
                </p>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Opened (+pts)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={scoringRules.emailOpened || 5}
                      onChange={(e) => setScoringRules({ ...scoringRules, emailOpened: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website Visit (+pts)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={scoringRules.websiteVisit || 5}
                      onChange={(e) => setScoringRules({ ...scoringRules, websiteVisit: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Demo Request (+pts)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={scoringRules.demoRequest || 20}
                      onChange={(e) => setScoringRules({ ...scoringRules, demoRequest: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">High-Value Company (+pts)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={scoringRules.highValueCompany || 15}
                      onChange={(e) => setScoringRules({ ...scoringRules, highValueCompany: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reply Received (+pts)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={scoringRules.replyReceived || 10}
                      onChange={(e) => setScoringRules({ ...scoringRules, replyReceived: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Decision Maker (+pts)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={scoringRules.decisionMakerIdentified || 15}
                      onChange={(e) => setScoringRules({ ...scoringRules, decisionMakerIdentified: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12, padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Category thresholds: <strong>Hot (&gt;= 70)</strong> • <strong>Warm (40-69)</strong> • <strong>Cold (&lt; 40)</strong>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRulesModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Scoring Weights
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Leads */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={18} style={{ color: '#818cf8' }} /> CSV / API Lead Ingestion
              </div>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Simulate bulk CSV ingestion of enterprise prospect accounts. All imported records pass through the dynamic lead scoring engine.
              </p>
              <div style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.1)'
              }}>
                <Upload size={32} style={{ color: '#818cf8', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Click to ingest demo CSV payload</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>Paytm, Ola, Raymond (3 records)</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={executeImportDemo}>
                Import Records Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsView;
