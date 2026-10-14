import React from 'react';
import { X, CheckCheck, Bell, AlertTriangle, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotificationDrawer = () => {
  const { notificationsOpen, setNotificationsOpen, notifications, unreadCount, markAllNotificationsRead } = useAuth();

  if (!notificationsOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'lead_assignment': return <Users size={16} style={{ color: '#93c5fd' }} />;
      case 'deal_stage': return <TrendingUp size={16} style={{ color: '#6ee7b7' }} />;
      case 'sla_breach':
      case 'approval': return <AlertTriangle size={16} style={{ color: '#fda4af' }} />;
      default: return <Bell size={16} style={{ color: '#c4b5fd' }} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 380,
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={18} style={{ color: '#818cf8' }} />
          <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: 'rgba(244, 63, 94, 0.2)',
              color: '#fda4af',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '999px',
              border: '1px solid rgba(244, 63, 94, 0.3)'
            }}>
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={() => setNotificationsOpen(false)}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'flex-end',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}>
        <button
          onClick={markAllNotificationsRead}
          style={{
            background: 'none',
            border: 'none',
            color: '#818cf8',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <CheckCircle size={32} style={{ margin: '0 auto 8px', color: 'var(--text-dim)', opacity: 0.4 }} />
            No notifications at this time.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              style={{
                backgroundColor: n.isRead ? 'var(--bg-card)' : 'rgba(79, 70, 229, 0.12)',
                border: n.isRead ? '1px solid var(--border-subtle)' : '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: 8,
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ marginTop: 2 }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 6 }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDrawer;
