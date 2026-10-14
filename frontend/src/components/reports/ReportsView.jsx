import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  TrendingUp,
  Users,
  Building2,
  LifeBuoy,
  ShoppingBag
} from 'lucide-react';
import api from '../../api/client';

export const ReportsView = () => {
  const [category, setCategory] = useState('sales'); // 'sales', 'leads', 'opportunities', 'customers', 'service'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getReports(category);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [category]);

  const handleExportCsv = () => {
    if (!reportData?.records || reportData.records.length === 0) {
      alert('No data records available to export.');
      return;
    }

    const keys = Object.keys(reportData.records[0]);
    const headerRow = keys.join(',');
    const rows = reportData.records.map(rec => keys.map(k => `"${rec[k] ?? ''}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `crm_${category}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = [
    { id: 'sales', label: 'Commercial Sales', icon: ShoppingBag },
    { id: 'leads', label: 'Lead Volume & Scoring', icon: Users },
    { id: 'opportunities', label: 'Pipeline & Forecast', icon: TrendingUp },
    { id: 'customers', label: 'Customer Retention & LTV', icon: Building2 },
    { id: 'service', label: 'Service & SLA Compliance', icon: LifeBuoy }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <h1>Reports & Commercial Analytics</h1>
          <p>Cross-functional enterprise reporting with instant export and dimensional drill-downs</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
            <Download size={14} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = category === c.id;
          return (
            <button
              key={c.id}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory(c.id)}
            >
              <Icon size={14} /> {c.label}
            </button>
          );
        })}
      </div>

      {loading || !reportData ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-dim)' }}>Loading report metrics...</div>
      ) : (
        <>
          {/* Key Metrics Summary Cards */}
          <div className="grid-cols-4" style={{ marginBottom: 24 }}>
            {Object.entries(reportData.metrics || {}).map(([key, val]) => (
              <div key={key} className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: typeof val === 'number' && val > 1000 ? '#34d399' : '#fff', marginTop: 4 }}>
                  {typeof val === 'number' && val > 1000 ? `₹${val.toLocaleString()}` : String(val)}
                </div>
              </div>
            ))}
          </div>

          {/* Records Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BarChart3 size={18} style={{ color: '#818cf8' }} /> {reportData.category} Detailed Ledger
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                {reportData.records?.length || 0} entries
              </span>
            </div>

            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {reportData.records?.length > 0 && Object.keys(reportData.records[0]).map(h => (
                      <th key={h}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.records?.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((cell, cIdx) => (
                        <td key={cIdx}>
                          {typeof cell === 'number' && cell > 1000 ? `₹${cell.toLocaleString()}` : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsView;
