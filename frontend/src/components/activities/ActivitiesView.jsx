import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Phone,
  Mail,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';

export const ActivitiesView = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Meeting',
    subject: '',
    description: '',
    priority: 'Medium',
    activityDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 48 * 3600000).toISOString().split('T')[0]
  });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.getActivities({
        type: typeFilter,
        status: statusFilter,
        limit: 50
      });
      setActivities(res.data || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [typeFilter, statusFilter]);

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      await api.createActivity(formData);
      setShowCreateModal(false);
      setFormData({
        type: 'Meeting',
        subject: '',
        description: '',
        priority: 'Medium',
        activityDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 48 * 3600000).toISOString().split('T')[0]
      });
      fetchActivities();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const markCompleted = async (id) => {
    try {
      await api.updateActivity(id, { status: 'Completed' });
      fetchActivities();
    } catch (err) {
      alert('Error updating activity: ' + err.message);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call': return <Phone size={16} style={{ color: '#60a5fa' }} />;
      case 'Email': return <Mail size={16} style={{ color: '#c084fc' }} />;
      case 'Meeting': return <Users size={16} style={{ color: '#34d399' }} />;
      case 'Note': return <FileText size={16} style={{ color: '#fbbf24' }} />;
      default: return <Clock size={16} style={{ color: '#818cf8' }} />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-box">
          <h1>Activity Management & Timeline</h1>
          <p>Coordinate customer touchpoints across Calls, Emails, Executive Meetings, and Tasks</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> Schedule Activity
          </button>
        </div>
      </div>

      <div className="table-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Activity Types</option>
            <option value="Meeting">Meetings</option>
            <option value="Call">Calls</option>
            <option value="Email">Emails</option>
            <option value="Task">Tasks</option>
            <option value="Note">Notes</option>
            <option value="Follow-up">Follow-ups</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {activities.length} recorded touchpoints
        </div>
      </div>

      {/* Activities Timeline / Cards View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>Loading activities...</div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>No activities matching filter.</div>
        ) : (
          activities.map((a) => (
            <div
              key={a._id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderLeft: a.status === 'Completed' ? '4px solid #10b981' : a.priority === 'Critical' || a.priority === 'High' ? '4px solid #f43f5e' : '4px solid #6366f1'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getTypeIcon(a.type)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{a.subject}</span>
                    <span className="badge badge-slate" style={{ fontSize: '0.68rem' }}>{a.type}</span>
                    <StatusBadge status={a.priority} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    {a.description}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
                    Assigned to: <strong style={{ color: '#cbd5e1' }}>{a.assignedUser?.name}</strong> • Date: {new Date(a.activityDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {a.status === 'Completed' ? (
                  <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} /> Completed
                  </span>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}
                    onClick={() => markCompleted(a.activityId)}
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarCheck size={18} style={{ color: '#818cf8' }} /> Schedule Activity
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateActivity}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Meeting">Meeting</option>
                      <option value="Call">Call</option>
                      <option value="Email">Email</option>
                      <option value="Task">Task</option>
                      <option value="Note">Note</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    className="form-control"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Demonstration of CRM automation engine"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Agenda</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Details regarding agenda or discussion items"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Scheduled Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.activityDate}
                      onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesView;
