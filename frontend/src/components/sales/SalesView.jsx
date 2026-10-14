import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  FileCheck,
  Package,
  Layers,
  CheckCircle,
  ExternalLink,
  DollarSign,
  ArrowRight,
  X,
  CreditCard
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';

export const SalesView = () => {
  const [activeTab, setActiveTab] = useState('quotes'); // 'quotes', 'orders', 'products'
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Quote form
  const [quoteForm, setQuoteForm] = useState({
    customerName: '',
    account: '',
    items: [],
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    total: 0
  });

  // Product form
  const [prodForm, setProdForm] = useState({
    name: '',
    sku: '',
    category: 'Software Licenses',
    price: 100000,
    tax: 18,
    discount: 5
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, oRes, pRes, aRes] = await Promise.all([
        api.getQuotes(),
        api.getOrders(),
        api.getProducts(),
        api.getAccounts()
      ]);
      setQuotes(qRes.data || []);
      setOrders(oRes.data || []);
      setProducts(pRes.data || []);
      setAccounts(aRes.data || []);

      if (aRes.data?.length > 0 && !quoteForm.customerName) {
        setQuoteForm(prev => ({ ...prev, customerName: aRes.data[0].companyName, account: aRes.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptQuote = async (quoteId) => {
    try {
      const res = await api.updateQuoteStatus(quoteId, 'Accepted');
      alert(`Quote accepted! Sales Order #${res.data.generatedOrder?.orderNumber} has been automatically generated and synced to ERP.`);
      fetchData();
    } catch (err) {
      alert('Error updating quote: ' + err.message);
    }
  };

  const handleSyncErpOrder = async (orderNumber) => {
    try {
      await api.syncOrderToErp(orderNumber);
      alert(`Order ${orderNumber} reconciled with ERP Inventory & Finance.`);
      fetchData();
    } catch (err) {
      alert('Sync failed: ' + err.message);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.createProduct(prodForm);
      setShowProductModal(false);
      setProdForm({ name: '', sku: '', category: 'Software Licenses', price: 100000, tax: 18, discount: 5 });
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    try {
      const selectedProd = products[0] || { name: 'Enterprise ERP Suite', sku: 'ERP-CORE', price: 500000 };
      const subtotal = selectedProd.price;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      const payload = {
        customerName: quoteForm.customerName,
        account: quoteForm.account,
        items: [{
          productName: selectedProd.name,
          sku: selectedProd.sku,
          unitPrice: selectedProd.price,
          quantity: 1,
          lineTotal: selectedProd.price
        }],
        subtotal,
        taxAmount: tax,
        total,
        status: 'Sent'
      };

      await api.createQuote(payload);
      setShowQuoteModal(false);
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <h1>Commercial Sales, Quotes & Orders</h1>
          <p>Product catalog pricing, customer quotation workflow, and bidirectional ERP sales order fulfillment</p>
        </div>

        <div className="page-actions">
          {activeTab === 'quotes' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowQuoteModal(true)}>
              <Plus size={14} /> Generate Quote
            </button>
          )}
          {activeTab === 'products' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowProductModal(true)}>
              <Plus size={14} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotes')}
        >
          <FileCheck size={16} /> Quotations ({quotes.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={16} /> Sales Orders ({orders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={16} /> Product Catalog ({products.length})
        </button>
      </div>

      {/* TAB 1: QUOTES */}
      {activeTab === 'quotes' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quote Number</th>
                <th>Customer</th>
                <th>Subtotal</th>
                <th>Tax (18%)</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Valid Until</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q._id}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{q.quoteNumber}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{q.customerName}</td>
                  <td>₹{q.subtotal?.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-dim)' }}>₹{q.taxAmount?.toLocaleString()}</td>
                  <td style={{ color: '#34d399', fontWeight: 700, fontSize: '0.95rem' }}>₹{q.total?.toLocaleString()}</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{new Date(q.validUntil).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {q.status !== 'Accepted' ? (
                      <button
                        className="btn btn-success btn-sm"
                        style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                        onClick={() => handleAcceptQuote(q._id)}
                      >
                        Accept &rarr; Order
                      </button>
                    ) : (
                      <span className="badge badge-green">Converted to Order</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: ORDERS & ERP SYNC */}
      {activeTab === 'orders' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Quote Ref</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>ERP Integration State</th>
                <th style={{ textAlign: 'right' }}>ERP Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{o.orderNumber}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{o.customerName}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{o.quoteNumber || 'Direct Order'}</td>
                  <td style={{ color: '#34d399', fontWeight: 700, fontSize: '0.95rem' }}>₹{o.total?.toLocaleString()}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        Ref: {o.erpSync?.erpReferenceId}
                      </span>
                      {o.erpSync?.invoiceGenerated ? (
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Invoiced & Paid</span>
                      ) : (
                        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Invoice Pending</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#67e8f9' }}
                      onClick={() => handleSyncErpOrder(o.orderNumber)}
                    >
                      Re-Sync ERP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Tax %</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{p.sku}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{p.description}</div>
                  </td>
                  <td><span className="badge badge-slate">{p.category}</span></td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>₹{p.price?.toLocaleString()}</td>
                  <td>{p.tax}%</td>
                  <td style={{ color: '#60a5fa' }}>{p.stockAvailable} units</td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Quote Modal */}
      {showQuoteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCheck size={18} style={{ color: '#818cf8' }} /> Generate Custom Quotation
              </div>
              <button onClick={() => setShowQuoteModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateQuote}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer Account *</label>
                  <select
                    className="form-control"
                    value={quoteForm.account}
                    onChange={(e) => {
                      const acc = accounts.find(a => a._id === e.target.value);
                      setQuoteForm({ ...quoteForm, account: acc._id, customerName: acc.companyName });
                    }}
                  >
                    {accounts.map(a => (
                      <option key={a._id} value={a._id}>{a.companyName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Selected Solution Package</label>
                  <select className="form-control" defaultValue={products[0]?.name}>
                    {products.map(p => (
                      <option key={p._id} value={p.name}>{p.name} - ₹{p.price.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuoteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Dispatch Quotation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={18} style={{ color: '#818cf8' }} /> Add Catalog Product
              </div>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    className="form-control"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="e.g. AI Financial Forecaster Addon"
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input
                      className="form-control"
                      required
                      value={prodForm.sku}
                      onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value.toUpperCase() })}
                      placeholder="FIN-FORECAST-PRO"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
