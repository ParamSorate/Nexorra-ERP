import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Mail, DollarSign, TrendingUp, Users, PieChart, X } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';

export const MarketingView = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Email',
    budget: 200000,
    targetAudience: 'Enterprise IT Leaders',
    leadSource: 'Email'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        api.getCampaigns(),
        api.getLeadSources()
      ]);
      setCampaigns(cRes.data || []);
      setLeadSources(sRes.data || []);
    } catch (err) {
      console.error('Failed to load marketing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      await api.createCampaign(formData);
      setShowModal(false);
      setFormData({ name: '', type: 'Email', budget: 200000, targetAudience: 'Enterprise IT Leaders', leadSource: 'Email' });
      fetchData();
    } catch (err) {
      alert('Error creating campaign: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <h1>Marketing Campaigns & Attribution</h1>
          <p>Multi-channel email and event campaign ROI, funnel metrics, and source-level conversion analytics</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Launch Campaign
          </button>
        </div>
      </div>

      {/* Lead Source Performance Cards */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          Channel & Source Performance
        </h2>
        <div className="grid-cols-4">
          {leadSources.map((src) => (
            <div key={src.source} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{src.source}</span>
                <span className="badge badge-blue">{src.conversionRate}% conv.</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>
                {src.totalLeads} Leads
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Converted: <strong style={{ color: '#34d399' }}>{src.convertedLeads}</strong> • Avg Score: {src.avgScore}/100
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Megaphone size={18} style={{ color: '#818cf8' }} /> Active Marketing Campaigns
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign ID</th>
                <th>Campaign Name</th>
                <th>Type</th>
                <th>Budget / Spend</th>
                <th>Audience</th>
                <th>Sent / Opens</th>
                <th>Conversions</th>
                <th>Revenue Generated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{c.campaignId}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Owner: {c.owner?.name}</div>
                  </td>
                  <td><span className="badge badge-purple">{c.type}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#cbd5e1' }}>₹{c.budget?.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Spend: ₹{c.actualSpend?.toLocaleString()}</div>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.targetAudience}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>{c.metrics?.sent?.toLocaleString() || 0} sent</div>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>{c.metrics?.opened?.toLocaleString() || 0} opened</div>
                  </td>
                  <td>
                    <span className="badge badge-green">{c.metrics?.converted || 0} converted</span>
                  </td>
                  <td style={{ color: '#34d399', fontWeight: 700, fontSize: '0.95rem' }}>
                    ₹{c.metrics?.revenueGenerated?.toLocaleString() || 0}
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Megaphone size={18} style={{ color: '#818cf8' }} /> Launch Campaign
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Campaign Name *</label>
                  <input
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. BFSI Digital Infrastructure Blitz"
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Email">Email</option>
                      <option value="Social">Social</option>
                      <option value="Advertisement">Advertisement</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <input
                    className="form-control"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Launch Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingView;
