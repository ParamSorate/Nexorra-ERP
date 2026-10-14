import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Contact,
  TrendingUp,
  CalendarCheck,
  ShoppingBag,
  Megaphone,
  LifeBuoy,
  Cpu,
  BarChart3,
  Bot,
  ShieldCheck,
  Network,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { activeModule, setActiveModule, user, logout } = useAuth();

  const navigationGroups = [
    {
      group: 'Core CRM',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'leads', label: 'Leads', icon: Users, badge: '5' },
        { id: 'accounts', label: 'Accounts', icon: Building2 },
        { id: 'contacts', label: 'Contacts', icon: Contact },
        { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
        { id: 'activities', label: 'Activities', icon: CalendarCheck }
      ]
    },
    {
      group: 'Commercial & Operations',
      items: [
        { id: 'sales', label: 'Sales & Orders', icon: ShoppingBag },
        { id: 'marketing', label: 'Marketing', icon: Megaphone },
        { id: 'service', label: 'Customer Service', icon: LifeBuoy, badge: '3' }
      ]
    },
    {
      group: 'Intelligence & Scale',
      items: [
        { id: 'ai', label: 'AI Agent Center', icon: Bot, isHighlight: true },
        { id: 'automation', label: 'Automation', icon: Cpu },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'integrations', label: 'ERP Integrations', icon: Network },
        { id: 'admin', label: 'Administration', icon: ShieldCheck }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Bot size={22} />
        </div>
        <div>
          <div className="sidebar-logo-text">Nexoraa</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>AI-POWERED ERP · CRM</div>
        </div>
        <span className="sidebar-badge">v2.4</span>
      </div>

      <div className="sidebar-nav">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: 8 }}>
            <div className="sidebar-group-title">{group.group}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <div
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveModule(item.id)}
                  style={item.isHighlight ? {
                    borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent'
                  } : {}}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="count-badge">{item.badge}</span>
                  )}
                  {item.isHighlight && !item.badge && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '0.62rem',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      background: 'rgba(99, 102, 241, 0.25)',
                      color: '#a5b4fc',
                      fontWeight: 700
                    }}>AI</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 'auto',
        padding: '14px 16px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', flexShrink: 0 }}>
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Loading...'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#93c5fd' }}>
                {user?.role || 'Guest'}
              </div>
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            className="sidebar-logout-btn"
            onClick={logout}
            title={`Log Out (${user?.name || user?.role || 'Session'})`}
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
