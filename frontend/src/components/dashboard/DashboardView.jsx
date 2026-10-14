import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  PieChart,
  LifeBuoy,
  Sparkles,
  Calendar,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const DashboardView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ rep: '', leadSource: '', pipeline: '' });
  const { setActiveModule } = useAuth();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard(filters);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filters]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
        Loading Enterprise CRM Dashboard...
      </div>
    );
  }

  const { kpis = {}, charts = {}, widgets = {} } = data || {};

  return (
    <div className="page-container">
      {/* Header and Filter Bar */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-box">
          <h1>Enterprise CRM Overview</h1>
          <p>Real-time commercial intelligence, pipeline velocity, and autonomous agent recommendations</p>
        </div>

        <div className="page-actions" style={{ flexWrap: 'wrap' }}>
          {/* Filter: Sales Rep */}
          <select
            className="filter-select"
            value={filters.rep}
            onChange={(e) => setFilters({ ...filters, rep: e.target.value })}
          >
            <option value="">All Sales Reps</option>
            <option value="Sarah Jenkins">Sarah Jenkins</option>
            <option value="Marcus Vance">Marcus Vance</option>
          </select>

          {/* Filter: Lead Source */}
          <select
            className="filter-select"
            value={filters.leadSource}
            onChange={(e) => setFilters({ ...filters, leadSource: e.target.value })}
          >
            <option value="">All Lead Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Event">Event</option>
            <option value="Advertisement">Advertisement</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={fetchDashboard}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Row 1 & 2 (8 KPI Cards) */}
      <div className="grid-cols-4">
        {/* Total Leads */}
        <div className="kpi-card" style={{ '--kpi-bg': 'rgba(59, 130, 246, 0.15)', '--kpi-color': '#60a5fa', '--kpi-glow': 'rgba(59, 130, 246, 0.2)' }}>
          <div className="kpi-icon-wrap"><Users size={20} /></div>
          <div className="kpi-label">Total Leads</div>
          <div className="kpi-value">{kpis.totalLeads ?? 0}</div>
          <div className="kpi-meta"><span style={{ color: '#34d399' }}>+18%</span> from marketing campaigns</div>
        </div>

        {/* Qualified Leads */}
        <div className="kpi-card" style={{ '--kpi-bg': 'rgba(16, 185, 129, 0.15)', '--kpi-color': '#34d399', '--kpi-glow': 'rgba(16, 185, 129, 0.2)' }}>
          <div className="kpi-icon-wrap"><TrendingUp size={20} /></div>
          <div className="kpi-label">Qualified Leads</div>
          <div className="kpi-value">{kpis.qualifiedLeads ?? 0}</div>
          <div className="kpi-meta">Lead score &gt;= 50</div>
        </div>

        {/* Customers */}
        <div className="kpi-card" style={{ '--kpi-bg': 'rgba(139, 92, 246, 0.15)', '--kpi-color': '#a78bfa', '--kpi-glow': 'rgba(139, 92, 246, 0.2)' }}>
          <div className="kpi-icon-wrap"><Building2 size={20} /></div>
          <div className="kpi-label">Customer Accounts</div>
          <div className="kpi-value">{kpis.customersCount ?? 0}</div>
          <div className="kpi-meta">Enterprise & Strategic</div>
        </div>

        {/* Open Opportunities */}
        <div className="kpi-card" style={{ '--kpi-bg': 'rgba(245, 158, 11, 0.15)', '--kpi-color': '#fbbf24', '--kpi-glow': 'rgba(245, 158, 11, 0.2)' }}>
          <div className="kpi-icon-wrap"><TrendingUp size={20} /></div>
          <div className="kpi-label">Open Deals</div>
          <div className="kpi-value">{kpis.openOppsCount ?? 0}</div>
          <div className="kpi-meta">In active negotiation</div>
        </div>

        {/* Pipeline Value */}
        <div className="kpi-card" style={{ '--kpi-bg': 'rgba(6, 182, 212, 0.15)', '--kpi-color': '#22d3ee', '--kpi-glow': 'rgba(6, 182, 212, 0.2)' }}>
          <div className="kpi-icon-wrap"><DollarSign size={20} /></div>
          <div className="kpi-label">Active Pipeline</div>
          <div className="kpi-value">₹{((kpis.pipelineValue || 0) / 100000).toFixed(1)}L</div>
          <div className="kpi-meta">Across 5 sales stages</div>
        </div>

        {/* Won Revenue */}
        <div className="kpi-card" style={{ '--kpi-bg': 'rgba(16, 185, 129, 0.15)', '--kpi-color': '#34d399', '--kpi-glow': 'rgba(16, 185, 129, 0.2)' }}>
          <div className="kpi-icon-wrap"><DollarSign size={20} /></div>
          <div className="kpi-label">Won Revenue</div>
          <div className="kpi-value">₹{((kpis.wonRevenue || 0) / 100000).toFixed(1)}L</div>
          <div className="kpi-meta"><span style={{ color: '#34d399' }}>100%</span> booked ERP orders</div>
        </div>

        {/* Conversion Rate */}
        <div className="kpi-card" style={{ '--kpi-bg': 'rgba(99, 102, 241, 0.15)', '--kpi-color': '#818cf8', '--kpi-glow': 'rgba(99, 102, 241, 0.2)' }}>
          <div className="kpi-icon-wrap"><PieChart size={20} /></div>
          <div className="kpi-label">Conversion Rate</div>
          <div className="kpi-value">{kpis.conversionRate ?? 0}%</div>
          <div className="kpi-meta">Lead to qualified status</div>
        </div>

        {/* Open Tickets */}
        <div className="kpi-card" style={{ '--kpi-bg': 'rgba(244, 63, 94, 0.15)', '--kpi-color': '#f43f5e', '--kpi-glow': 'rgba(244, 63, 94, 0.2)' }}>
          <div className="kpi-icon-wrap"><LifeBuoy size={20} /></div>
          <div className="kpi-label">Open Support Tickets</div>
          <div className="kpi-value">{kpis.openTicketsCount ?? 0}</div>
          <div className="kpi-meta">Active SLA timers</div>
        </div>
      </div>

      {/* AI Recommendations Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(6, 182, 212, 0.08))',
        borderColor: 'rgba(99, 102, 241, 0.35)',
        marginBottom: 24,
        padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} style={{ color: '#818cf8' }} />
            <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>AI Agent Center: Strategic Insights</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveModule('ai')}>
            Open Agent Center &rarr;
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {(widgets.aiRecommendations || []).map((rec) => (
            <div key={rec.id} style={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '10px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#93c5fd' }}>{rec.type}</span>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: rec.urgency === 'Critical' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: rec.urgency === 'Critical' ? '#fda4af' : '#fcd34d'
                }}>
                  {rec.urgency}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Charts Grid (Sections 3.2: 8 Charts) */}
      <div className="grid-cols-2">
        {/* Chart 1 & 2: Sales Pipeline Stage Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} style={{ color: '#818cf8' }} /> Pipeline Stage Distribution (₹)
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveModule('opportunities')}>
              Pipeline Kanban
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {(charts.stageDistribution || []).map((item) => {
              const maxVal = Math.max(...(charts.stageDistribution || []).map(s => s.value), 1);
              const pct = Math.round((item.value / maxVal) * 100);
              return (
                <div key={item.stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span style={{ color: '#cbd5e1' }}>{item.stage}</span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>₹{item.value.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', height: 8, backgroundColor: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                      borderRadius: 4
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3 & 7: Monthly Revenue Trend vs Target */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <DollarSign size={18} style={{ color: '#34d399' }} /> Monthly Revenue Trend (₹)
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Target: ₹4,00,000/mo</span>
          </div>
          <div className="chart-bar-group">
            {(charts.monthlyRevenue || []).map((m) => {
              const heightPct = Math.min(100, Math.round((m.revenue / 500000) * 100));
              return (
                <div key={m.month} className="chart-bar-col">
                  <div className="chart-bar" style={{ height: `${heightPct}%` }} title={`₹${m.revenue.toLocaleString()}`}>
                    <div style={{
                      position: 'absolute',
                      top: -18,
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '0.65rem',
                      color: '#a5b4fc',
                      fontWeight: 600
                    }}>
                      {(m.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="chart-bar-label">{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 5: Lead Source Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <PieChart size={18} style={{ color: '#fbbf24' }} /> Lead Source Volume
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveModule('marketing')}>
              Attribution
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
            {(charts.leadSourceDistribution || []).map((s) => (
              <div key={s.source} style={{
                backgroundColor: 'var(--bg-input)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{s.source}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Inbound channel</div>
                </div>
                <span className="badge badge-blue" style={{ fontSize: '0.85rem' }}>{s.count} leads</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 6: Sales Representative Performance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Users size={18} style={{ color: '#a78bfa' }} /> Sales Rep Quota & Pipeline
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            {(charts.repPerformance || []).map((r) => (
              <div key={r.rep} style={{
                backgroundColor: 'var(--bg-input)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{r.rep}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Won: <span style={{ color: '#34d399', fontWeight: 600 }}>₹{r.won.toLocaleString()}</span> • Deals: {r.deals}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Active Pipeline</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd' }}>₹{r.pipeline.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Widgets Grid: Recent Leads, Upcoming Meetings, Pending Tasks */}
      <div className="grid-cols-3" style={{ marginTop: 24 }}>
        {/* Recent Leads Widget */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Leads</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveModule('leads')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(widgets.recentLeads || []).slice(0, 4).map((l) => (
              <div key={l._id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                backgroundColor: 'var(--bg-input)',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{l.firstName} {l.lastName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.company}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={l.scoreCategory} type="score" />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>{l.leadScore}/100</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings & Activities */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Scheduled Meetings</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveModule('activities')}>Calendar</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(widgets.upcomingMeetings && widgets.upcomingMeetings.length > 0 ? widgets.upcomingMeetings : widgets.recentActivities || []).slice(0, 4).map((a) => (
              <div key={a._id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                backgroundColor: 'var(--bg-input)',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{a.subject}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.type} • {a.assignedUser?.name}</div>
                </div>
                <StatusBadge status={a.priority} />
              </div>
            ))}
          </div>
        </div>

        {/* Open Support Tickets Widget */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Open Tickets (SLA)</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveModule('service')}>Triage</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(widgets.openTickets || []).slice(0, 4).map((t) => (
              <div key={t._id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                backgroundColor: 'var(--bg-input)',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{t.ticketId}: {t.subject}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.customerName}</div>
                </div>
                <StatusBadge status={t.priority} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
