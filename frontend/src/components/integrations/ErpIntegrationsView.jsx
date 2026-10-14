import React, { useState, useEffect } from 'react';
import {
  Network,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Database,
  Layers,
  ShoppingBag,
  CreditCard,
  Package,
  Activity,
  Zap
} from 'lucide-react';
import api from '../../api/client';

export const ErpIntegrationsView = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [syncingOrderId, setSyncingOrderId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [iRes, oRes] = await Promise.all([
        api.getErpStatus(),
        api.getOrders()
      ]);
      setIntegrations(iRes.data || []);
      setOrders(oRes.data || []);
    } catch (err) {
      console.error('Failed to load ERP integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerSync = async (orderNumber) => {
    setSyncingOrderId(orderNumber);
    try {
      await api.syncOrderToErp(orderNumber);
      alert(`Order #${orderNumber} synced across Inventory Allocation and Finance Ledger!`);
      fetchData();
    } catch (err) {
      alert('Sync failed: ' + err.message);
    } finally {
      setSyncingOrderId('');
    }
  };

  const pipelineStages = [
    { title: '1. Opportunity', icon: Zap, sub: 'CRM Pipeline Deal' },
    { title: '2. Quotation', icon: Layers, sub: 'Commercial Discount & Tax' },
    { title: '3. Sales Order', icon: ShoppingBag, sub: 'Confirmed Order Event' },
    { title: '4. Inventory Allocation', icon: Package, sub: 'Stock Reserved in Warehouse' },
    { title: '5. Finance Invoice', icon: CreditCard, sub: 'AR Ledger & GST Journal' },
    { title: '6. Payment Reconciliation', icon: CheckCircle, sub: 'Customer Account Credited' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <h1>Nexoraa AI-Powered ERP Ecosystem Integration</h1>
          <p>Section 22: Event-driven cross-module synchronization between CRM, Sales, Inventory, and Finance</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            <RefreshCw size={14} /> Check Service Mesh Health
          </button>
        </div>
      </div>

      {/* Visual Pipeline Flow Diagram */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">
            <Network size={18} style={{ color: '#818cf8' }} /> Unified Order-To-Cash Lifecycle (CRM &harr; ERP)
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-input)',
          borderRadius: 12,
          overflowX: 'auto',
          gap: 12
        }}>
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.title}>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  minWidth: 140
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    color: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px'
                  }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>{stage.title}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>{stage.sub}</div>
                </div>
                {idx < pipelineStages.length - 1 && (
                  <ArrowRight size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Microservice Connectors Status */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">ERP Service Mesh Connectors</div>
        </div>
        <div className="grid-cols-3">
          {integrations.map((item) => (
            <div key={item.module} style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{item.module}</span>
                <span className="badge badge-green">Healthy</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                Service: {item.service}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: 8 }}>
                Roundtrip Latency: {item.latencyMs}ms • Real-time
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Orders ERP Reconciler */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Live Commercial Orders Sync Queue</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Simulate instantaneous ERP ledger dispatch and stock reservation
          </span>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Inventory Allocated</th>
                <th>Finance Invoice</th>
                <th>ERP Ledger Ref</th>
                <th style={{ textAlign: 'right' }}>Sync Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{o.orderNumber}</td>
                  <td>{o.customerName}</td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>₹{o.total?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${o.erpSync?.inventoryAllocated ? 'badge-green' : 'badge-amber'}`}>
                      {o.erpSync?.inventoryAllocated ? 'Allocated in Warehouse' : 'Pending Allocation'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${o.erpSync?.invoiceGenerated ? 'badge-green' : 'badge-amber'}`}>
                      {o.erpSync?.invoiceGenerated ? 'Invoice Dispatched' : 'Draft Journal'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{o.erpSync?.erpReferenceId}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.72rem' }}
                      disabled={syncingOrderId === o.orderNumber}
                      onClick={() => handleTriggerSync(o.orderNumber)}
                    >
                      {syncingOrderId === o.orderNumber ? 'Syncing...' : 'Sync to ERP &rarr;'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ErpIntegrationsView;
