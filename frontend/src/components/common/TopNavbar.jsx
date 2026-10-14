import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Shield, ChevronRight, LogOut, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useAuth, ROLES_LIST } from '../../context/AuthContext';

export const TopNavbar = () => {
  const {
    activeModule,
    user,
    unreadCount,
    handleSwitchRole,
    setGlobalSearchOpen,
    notificationsOpen,
    setNotificationsOpen,
    setActiveModule,
    logout
  } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moduleTitles = {
    dashboard: 'Executive Dashboard',
    leads: 'Lead Management & Scoring',
    accounts: 'Customer Accounts 360',
    contacts: 'Contact Management',
    opportunities: 'Opportunity Pipeline & Forecast',
    activities: 'Activities & Timelines',
    sales: 'Sales, Quotes & Orders',
    marketing: 'Marketing Campaigns & Attribution',
    service: 'Customer Service & SLAs',
    automation: 'Workflow Automation Engine',
    reports: 'Reports & Analytics',
    ai: 'AI Agent Center & Tool Orchestrator',
    admin: 'Administration & RBAC',
    integrations: 'ERP Ecosystem Integration'
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Super Admin': return '#f43f5e';
      case 'Sales Manager': return '#f59e0b';
      case 'Sales Representative': return '#10b981';
      case 'Support Agent': return '#38bdf8';
      case 'Marketing Lead':
      case 'Marketing Manager': return '#a855f7';
      default: return '#818cf8';
    }
  };

  const coreRoles = [
    'Super Admin',
    'Sales Manager',
    'Sales Representative',
    'Support Agent',
    'Marketing Lead'
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="breadcrumbs">
          <span>CRM</span>
          <ChevronRight size={14} className="separator" />
          <span className="current">{moduleTitles[activeModule] || activeModule}</span>
        </div>

        <div className="global-search-trigger" onClick={() => setGlobalSearchOpen(true)}>
          <Search size={16} />
          <span>Quick search leads, deals, accounts...</span>
          <span className="kbd-shortcut">Ctrl+K</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Role Quick Switcher Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={15} style={{ color: getRoleColor(user?.role) }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Role:</span>
          <select
            id="topbar-role-select"
            className="role-switcher-select"
            value={user?.role || 'Sales Representative'}
            onChange={(e) => handleSwitchRole(e.target.value)}
            title="Switch RBAC Role to test permissions across CRM"
          >
            {ROLES_LIST.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* AI Quick Launcher button */}
        <button
          className="btn btn-secondary btn-sm"
          style={{
            borderColor: 'rgba(99, 102, 241, 0.4)',
            color: '#a5b4fc',
            background: 'rgba(79, 70, 229, 0.1)'
          }}
          onClick={() => setActiveModule('ai')}
        >
          <Sparkles size={14} style={{ color: '#818cf8' }} />
          <span>AI Co-Pilot</span>
        </button>

        {/* Notification Bell */}
        <button
          className="topbar-action-btn"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notification-badge" />}
        </button>

        {/* User Profile Popover */}
        <div className="user-profile-wrapper" ref={menuRef}>
          <div
            className={`user-profile-btn ${userMenuOpen ? 'active' : ''}`}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title="User Profile & Account Menu"
          >
            <div
              className="user-avatar"
              style={{
                backgroundColor: getRoleColor(user?.role),
                color: '#fff',
                fontWeight: 700
              }}
            >
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user?.name || 'User'}</span>
            <ChevronDown size={14} style={{ color: 'var(--text-dim)', marginLeft: 2 }} />
          </div>

          {userMenuOpen && (
            <div className="user-dropdown-menu">
              <div className="user-dropdown-header">
                <div
                  className="user-dropdown-avatar"
                  style={{
                    backgroundColor: getRoleColor(user?.role)
                  }}
                >
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div className="user-dropdown-name">{user?.name || 'Enterprise User'}</div>
                  <div className="user-dropdown-email">{user?.email || 'user@crm.internal'}</div>
                  <div
                    className="user-dropdown-role-tag"
                    style={{
                      backgroundColor: `${getRoleColor(user?.role)}20`,
                      color: getRoleColor(user?.role),
                      border: `1px solid ${getRoleColor(user?.role)}40`
                    }}
                  >
                    {user?.role || 'Guest'}
                  </div>
                </div>
              </div>

              <div>
                <div className="user-dropdown-section-title">Quick Switch Persona</div>
                <div className="user-dropdown-roles-grid" style={{ marginTop: 6 }}>
                  {coreRoles.map((roleName) => {
                    const isSelected = user?.role === roleName;
                    const rColor = getRoleColor(roleName);
                    return (
                      <div
                        key={roleName}
                        className={`user-dropdown-role-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          handleSwitchRole(roleName);
                          setUserMenuOpen(false);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: rColor
                            }}
                          />
                          <span>{roleName}</span>
                        </div>
                        {isSelected && <Check size={14} style={{ color: '#818cf8' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                id="user-dropdown-logout"
                className="user-dropdown-logout-btn"
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out ({user?.role || 'User'})</span>
              </button>
            </div>
          )}
        </div>

        {/* Dedicated Navbar Logout Button */}
        <button
          id="topbar-logout-btn"
          className="topbar-logout-btn"
          onClick={logout}
          title={`Log out from ${user?.role || 'session'}`}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
