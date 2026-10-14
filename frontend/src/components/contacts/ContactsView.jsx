import React, { useState, useEffect } from 'react';
import { Contact, Plus, Search, Download, Trash2, Mail, Phone, CheckCircle, X } from 'lucide-react';
import api from '../../api/client';

export const ContactsView = () => {
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [decisionMakerFilter, setDecisionMakerFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: 'VP Engineering',
    department: 'Technology',
    accountName: '',
    isDecisionMaker: true,
    linkedIn: ''
  });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const [conRes, accRes] = await Promise.all([
        api.getContacts({ search, isDecisionMaker: decisionMakerFilter }),
        api.getAccounts()
      ]);
      setContacts(conRes.data || []);
      setAccounts(accRes.data || []);
      if (accRes.data && accRes.data.length > 0 && !formData.accountName) {
        setFormData(prev => ({ ...prev, accountName: accRes.data[0].companyName, account: accRes.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, decisionMakerFilter]);

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      await api.createContact(formData);
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: 'VP Engineering',
        department: 'Technology',
        accountName: accounts[0]?.companyName || '',
        account: accounts[0]?._id,
        isDecisionMaker: true,
        linkedIn: ''
      });
      fetchContacts();
    } catch (err) {
      alert('Error creating contact: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.deleteContact(id);
      fetchContacts();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const exportCsv = () => {
    const headers = ['Contact ID,First Name,Last Name,Email,Phone,Job Title,Account,Decision Maker'];
    const rows = contacts.map(c => `"${c.contactId}","${c.firstName}","${c.lastName}","${c.email}","${c.phone}","${c.jobTitle}","${c.accountName}","${c.isDecisionMaker ? 'Yes' : 'No'}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'crm_contacts_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <h1>Contact Management</h1>
          <p>Maintain executive stakeholder records, decision maker authority, and cross-account communications</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> Add Contact
          </button>
        </div>
      </div>

      <div className="table-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-input-wrap">
            <Search size={16} style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search contacts by name, email, account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={decisionMakerFilter}
            onChange={(e) => setDecisionMakerFilter(e.target.value)}
          >
            <option value="">All Decision Levels</option>
            <option value="true">Decision Makers Only</option>
            <option value="false">Staff & Evaluators</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {contacts.length} registered contacts
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contact ID</th>
              <th>Full Name</th>
              <th>Account / Company</th>
              <th>Job Title & Dept</th>
              <th>Email & Phone</th>
              <th>Authority</th>
              <th>Owner</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Loading contacts...</td></tr>
            ) : contacts.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>No contacts found.</td></tr>
            ) : (
              contacts.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{c.contactId}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{c.firstName} {c.lastName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.linkedIn ? 'LinkedIn verified' : 'Direct stakeholder'}</div>
                  </td>
                  <td>
                    <div style={{ color: '#cbd5e1' }}>{c.accountName}</div>
                  </td>
                  <td>
                    <div style={{ color: '#fff' }}>{c.jobTitle}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.department}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: '#93c5fd' }}>{c.email}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.phone}</div>
                  </td>
                  <td>
                    {c.isDecisionMaker ? (
                      <span className="badge badge-green">Decision Maker</span>
                    ) : (
                      <span className="badge badge-slate">Evaluator</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#fff' }}>{c.contactOwner?.name || 'Sarah Jenkins'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 6px', color: '#fda4af' }}
                      onClick={() => handleDelete(c.contactId)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Contact size={18} style={{ color: '#818cf8' }} /> Add Executive Contact
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateContact}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      className="form-control"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      className="form-control"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Associated Account *</label>
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
                    <label className="form-label">Job Title</label>
                    <input
                      className="form-control"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Decision Maker Status</label>
                  <select
                    className="form-control"
                    value={formData.isDecisionMaker}
                    onChange={(e) => setFormData({ ...formData, isDecisionMaker: e.target.value === 'true' })}
                  >
                    <option value="true">Yes - Primary Decision Maker</option>
                    <option value="false">No - Technical Evaluator</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsView;
