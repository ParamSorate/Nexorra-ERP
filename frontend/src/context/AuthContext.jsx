import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const ROLES_LIST = [
  'Super Admin',
  'CRM Admin',
  'Sales Manager',
  'Sales Representative',
  'Marketing Lead',
  'Marketing Manager',
  'Support Agent',
  'Analyst',
  'Viewer'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crm_token'));
  const [activeModule, setActiveModule] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Three states: 'loading' | 'authenticated' | 'unauthenticated'
  const [authStatus, setAuthStatus] = useState('loading');

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // On mount — restore session from stored token
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('crm_token');
      if (!savedToken) {
        setAuthStatus('unauthenticated');
        return;
      }
      try {
        api.setToken(savedToken);
        const meRes = await api.getMe();
        if (meRes?.data) {
          setUser(meRes.data);
          setToken(savedToken);
          setAuthStatus('authenticated');
        } else {
          throw new Error('Invalid session');
        }
      } catch (err) {
        console.warn('Session restore failed, clearing token:', err.message);
        localStorage.removeItem('crm_token');
        api.setToken(null);
        setToken(null);
        setAuthStatus('unauthenticated');
      }
    };

    restoreSession();
  }, []);

  // Fetch notifications periodically (only when authenticated)
  useEffect(() => {
    if (authStatus !== 'authenticated' || !user) return;

    const loadNotifications = async () => {
      try {
        const res = await api.getNotifications();
        if (res.data) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        console.warn('Failed to load notifications:', err.message);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [authStatus, user]);

  /**
   * Login — called from LoginPage form or demo user buttons
   */
  const login = async (email, password) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.login(email, password);
      if (res?.token && res?.user) {
        setToken(res.token);
        setUser(res.user);
        setActiveModule('dashboard');
        setAuthStatus('authenticated');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  /**
   * Logout — clears session, returns to login screen
   */
  const logout = () => {
    localStorage.removeItem('crm_token');
    api.setToken(null);
    setUser(null);
    setToken(null);
    setNotifications([]);
    setUnreadCount(0);
    setActiveModule('dashboard');
    setAuthStatus('unauthenticated');
  };

  const handleSwitchRole = async (newRole) => {
    try {
      const res = await api.switchRole(newRole);
      if (res?.user) setUser(res.user);
      if (res?.token) setToken(res.token);
    } catch (err) {
      alert('Error switching role: ' + err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markNotificationRead('all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        authStatus,
        activeModule,
        setActiveModule,
        notifications,
        unreadCount,
        login,
        logout,
        loginLoading,
        loginError,
        handleSwitchRole,
        markAllNotificationsRead,
        globalSearchOpen,
        setGlobalSearchOpen,
        notificationsOpen,
        setNotificationsOpen,
        // Legacy compat
        loading: authStatus === 'loading',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
