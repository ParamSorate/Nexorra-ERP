import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  KeyRound,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Check,
  X,
  History
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';

export const AdminView = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'roles', 'audit'
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter for audit logs
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('');

  // Create User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    department: 'Sales',
    team: 'Enterprise Direct',
    role: 'Sales Representative'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, aRes] = await Promise.all([
        api.getUsers(),
        api.getRoles(),
        api.getAuditLogs({ search: auditSearch, module: auditModuleFilter })
      ]);
      setUsers(uRes.data || []);
      setRoles(rRes.data || []);
      setAuditLogs(aRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auditSearch, auditModuleFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(userForm);
      setShowUserModal(false);
      setUserForm({ name: '', email: '', password: 'Password@123', department: 'Sales', team: 'Enterprise Direct', role: 'Sales Representative' });
      fetchData();
      alert('User account created successfully.');
    } catch (err) {
      alert('Error creating user: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <h1>CRM Administration & Governance</h1>
          <p>User provisioning, granular role-based access control (RBAC), and immutable security audit trails</p>
        </div>

        <div className="page-actions">
          {activeTab === 'users' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowUserModal(true)}>
              <Plus size={14} /> Provision User
            </button>
          )}
        </div>
      </div>

      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> Users ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <KeyRound size={16} /> Roles & Permissions ({roles.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <History size={16} /> Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Department & Team</th>
                <th>Assigned Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{u.userId}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.department} • {u.team}</td>
                  <td><span className="badge badge-purple">{u.role}</span></td>
                  <td><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {roles.map((r) => (
            <div key={r._id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{r.name}</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.description}</div>
                </div>
                <span className="badge badge-blue">System Role</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(r.permissions || []).map((perm, idx) => (
                  <div key={idx} style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem'
                  }}>
                    <strong style={{ color: '#818cf8', textTransform: 'uppercase' }}>{perm.module}: </strong>
                    <span style={{ color: '#cbd5e1' }}>{perm.actions?.join(', ') || 'READ'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div>
          <div className="table-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="search-input-wrap">
                <Search size={16} style={{ color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search audit trail by user, ID..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={auditModuleFilter}
                onChange={(e) => setAuditModuleFilter(e.target.value)}
              >
                <option value="">All Modules</option>
                <option value="leads">Leads</option>
                <option value="opportunities">Opportunities</option>
                <option value="accounts">Accounts</option>
                <option value="sales">Sales & Orders</option>
                <option value="aiAgentCenter">AI Agent Center</option>
                <option value="automation">Automation</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Entity ID</th>
                  <th>Audit Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>{log.user?.name || 'System'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{log.user?.role}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        log.action === 'CREATE' ? 'badge-green' :
                        log.action === 'DELETE' ? 'badge-red' :
                        log.action === 'STAGE_CHANGE' || log.action === 'CONVERT' ? 'badge-purple' :
                        log.action === 'AI_TOOL_EXECUTION' ? 'badge-cyan' : 'badge-amber'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.module}</td>
                    <td style={{ fontFamily: 'monospace', color: '#93c5fd', fontSize: '0.8rem' }}>{log.entityId}</td>
                    <td style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{log.details}</td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} style={{ color: '#818cf8' }} /> Provision CRM User
              </div>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-control"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="e.g. Arun Kumar"
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="arun@crm.internal"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-control"
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      <option value="Sales Representative">Sales Representative</option>
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Marketing Manager">Marketing Manager</option>
                      <option value="Support Agent">Support Agent</option>
                      <option value="Analyst">Analyst</option>
                      <option value="CRM Admin">CRM Admin</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-control"
                      value={userForm.department}
                      onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    >
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Management">Management</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
