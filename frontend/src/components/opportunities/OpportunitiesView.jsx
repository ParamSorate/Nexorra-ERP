import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  LayoutGrid,
  List,
  BarChart2,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldAlert,
  X
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';

export const OpportunitiesView = () => {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'table', 'forecast'
  const [board, setBoard] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    accountName: '',
    account: '',
    stage: 'New',
    amount: 500000,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 3600000).toISOString().split('T')[0],
    product: 'Enterprise ERP Suite',
    competitor: 'None',
    nextAction: 'Deliver technical presentation'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boardRes, oppsRes, forecastRes, accRes] = await Promise.all([
        api.getPipelineBoard(),
        api.getOpportunities({ limit: 50 }),
        api.getForecast(),
        api.getAccounts()
      ]);

      setBoard(boardRes.data || []);
      setOpportunities(oppsRes.data || []);
      setForecast(forecastRes.data || {});
      setAccounts(accRes.data || []);

      if (accRes.data?.length > 0 && !formData.account) {
        setFormData(prev => ({ ...prev, account: accRes.data[0]._id, accountName: accRes.data[0].companyName }));
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStageMove = async (opportunityId, nextStage) => {
    try {
      await api.updateOpportunityStage(opportunityId, nextStage, `Moved to ${nextStage} via pipeline Kanban`);
      fetchData();
    } catch (err) {
      alert('Error updating stage: ' + err.message);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    try {
      await api.createOpportunity(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        accountName: accounts[0]?.companyName || '',
        account: accounts[0]?._id,
        stage: 'New',
        amount: 500000,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 3600000).toISOString().split('T')[0],
        product: 'Enterprise ERP Suite',
        competitor: 'None',
        nextAction: 'Deliver technical presentation'
      });
      fetchData();
    } catch (err) {
      alert('Error creating opportunity: ' + err.message);
    }
  };

  const stagesList = ['New', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-box">
          <h1>Opportunities & Pipeline Forecast</h1>
          <p>Kanban pipeline visualization, weighted probability modeling, and revenue forecasting</p>
        </div>

        <div className="page-actions">
          {/* View Toggles */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-input)', padding: 3, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setViewMode('table')}
            >
              <List size={14} /> Table
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'forecast' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setViewMode('forecast')}
            >
              <BarChart2 size={14} /> Forecast
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New Deal
          </button>
        </div>
      </div>

      {/* Pipeline Summary Bar */}
      {forecast?.kpis && (
        <div className="grid-cols-4" style={{ marginBottom: 20 }}>
          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL ACTIVE PIPELINE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>
              ₹{((forecast.kpis.totalPipeline || 0) / 100000).toFixed(1)} Lakhs
            </div>
          </div>
          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>WEIGHTED PIPELINE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a78bfa', marginTop: 2 }}>
              ₹{((forecast.kpis.weightedPipeline || 0) / 100000).toFixed(1)} Lakhs
            </div>
          </div>
          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>CLOSED WON REVENUE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', marginTop: 2 }}>
              ₹{((forecast.kpis.wonRevenue || 0) / 100000).toFixed(1)} Lakhs
            </div>
          </div>
          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>WIN RATE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginTop: 2 }}>
              {forecast.kpis.winRate || 0}%
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: KANBAN PIPELINE */}
      {viewMode === 'kanban' && (
        <div className="kanban-board">
          {board.map((col) => {
            const stageIndex = stagesList.indexOf(col.stage);
            return (
              <div key={col.stage} className="kanban-column">
                <div className="kanban-column-header">
                  <div>
                    <div className="kanban-column-title">
                      <span>{col.stage}</span>
                      <span className="count-badge">{col.deals?.length || 0}</span>
                    </div>
                    <div className="kanban-column-total">
                      ₹{((col.totalValue || 0) / 100000).toFixed(1)}L
                    </div>
                  </div>
                </div>

                <div className="kanban-cards-wrap">
                  {col.deals?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                      No deals in {col.stage}
                    </div>
                  ) : (
                    col.deals.map((deal) => (
                      <div key={deal._id} className="kanban-deal-card">
                        <div className="kanban-deal-title">{deal.name}</div>
                        <div className="kanban-deal-company">{deal.accountName}</div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 8 }}>
                          <span style={{ color: 'var(--text-dim)' }}>Probability</span>
                          <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{deal.probability}%</span>
                        </div>

                        <div className="kanban-deal-footer">
                          <span className="kanban-deal-amount">
                            ₹{deal.amount?.toLocaleString()}
                          </span>

                          {/* Stage advance button */}
                          {stageIndex < 5 && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                              onClick={() => handleStageMove(deal.opportunityId, stagesList[stageIndex + 1])}
                              title={`Advance to ${stagesList[stageIndex + 1]}`}
                            >
                              Move &rarr;
                            </button>
                          )}
                          {stageIndex === 4 && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                className="btn btn-sm btn-success"
                                style={{ padding: '2px 6px', fontSize: '0.68rem' }}
                                onClick={() => handleStageMove(deal.opportunityId, 'Closed Won')}
                              >
                                Won
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                style={{ padding: '2px 6px', fontSize: '0.68rem' }}
                                onClick={() => handleStageMove(deal.opportunityId, 'Closed Lost')}
                              >
                                Lost
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal ID</th>
                <th>Opportunity Name</th>
                <th>Account</th>
                <th>Stage</th>
                <th>Probability</th>
                <th>Deal Value</th>
                <th>Weighted Value</th>
                <th>Close Date</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{o.opportunityId}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{o.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Product: {o.product}</div>
                  </td>
                  <td>{o.accountName}</td>
                  <td><StatusBadge status={o.stage} /></td>
                  <td style={{ color: '#a5b4fc', fontWeight: 600 }}>{o.probability}%</td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>₹{o.amount?.toLocaleString()}</td>
                  <td style={{ color: '#cbd5e1' }}>₹{(((o.amount || 0) * (o.probability || 0)) / 100).toLocaleString()}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{new Date(o.expectedCloseDate).toLocaleDateString()}</td>
                  <td style={{ fontSize: '0.8rem', color: '#fff' }}>{o.owner?.name || 'Sarah Jenkins'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: FORECAST ANALYTICS */}
      {viewMode === 'forecast' && (
        <div>
          <div className="grid-cols-2">
            {/* Salesperson Forecast */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Forecast Breakdown by Salesperson</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(forecast.forecastBySalesperson || []).map((rep) => (
                  <div key={rep.rep} style={{
                    padding: 14,
                    borderRadius: 8,
                    backgroundColor: 'var(--bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{rep.rep}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Deals: {rep.totalDeals} • Won: ₹{rep.wonRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Weighted Forecast</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
                        ₹{rep.weightedForecast.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Forecast Projection */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Monthly Pipeline Realization Horizon</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(forecast.forecastByMonth || []).map((m) => (
                  <div key={m.month} style={{
                    padding: 14,
                    borderRadius: 8,
                    backgroundColor: 'var(--bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{m.month}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Closing Deals: {m.dealsCount}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Expected Inflow</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
                        ₹{m.weightedForecast.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} style={{ color: '#818cf8' }} /> Create New Opportunity
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOpportunity}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Opportunity Name *</label>
                  <input
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Infosys - ERP Cloud Rollout"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Customer Account *</label>
                    <select
                      className="form-control"
                      value={formData.account}
                      onChange={(e) => {
                        const acc = accounts.find(a => a._id === e.target.value);
                        setFormData({ ...formData, account: acc._id, accountName: acc.companyName });
                      }}
                    >
                      {accounts.map(a => (
                        <option key={a._id} value={a._id}>{a.companyName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deal Value (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Pipeline Stage</label>
                    <select
                      className="form-control"
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    >
                      {stagesList.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Close Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.expectedCloseDate}
                      onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Primary Competitor</label>
                    <input
                      className="form-control"
                      value={formData.competitor}
                      onChange={(e) => setFormData({ ...formData, competitor: e.target.value })}
                      placeholder="SAP / Salesforce"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Action</label>
                    <input
                      className="form-control"
                      value={formData.nextAction}
                      onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesView;
