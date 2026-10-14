import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import TopNavbar from './components/common/TopNavbar';
import GlobalSearchModal from './components/common/GlobalSearchModal';
import NotificationDrawer from './components/common/NotificationDrawer';

// Module Views
import DashboardView from './components/dashboard/DashboardView';
import LeadsView from './components/leads/LeadsView';
import AccountsView from './components/accounts/AccountsView';
import ContactsView from './components/contacts/ContactsView';
import OpportunitiesView from './components/opportunities/OpportunitiesView';
import ActivitiesView from './components/activities/ActivitiesView';
import SalesView from './components/sales/SalesView';
import MarketingView from './components/marketing/MarketingView';
import ServiceView from './components/service/ServiceView';
import AutomationView from './components/automation/AutomationView';
import ReportsView from './components/reports/ReportsView';
import AiAgentCenterView from './components/ai/AiAgentCenterView';
import AdminView from './components/admin/AdminView';
import ErpIntegrationsView from './components/integrations/ErpIntegrationsView';

import LoginPage from './components/auth/LoginPage';

const MainLayout = () => {
  const { activeModule, loading, authStatus, user } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: '#fff'
      }}>
        Initializing Enterprise CRM Suite...
      </div>
    );
  }

  if (authStatus === 'unauthenticated' || !user) {
    return <LoginPage />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardView />;
      case 'leads':
        return <LeadsView />;
      case 'accounts':
        return <AccountsView />;
      case 'contacts':
        return <ContactsView />;
      case 'opportunities':
        return <OpportunitiesView />;
      case 'activities':
        return <ActivitiesView />;
      case 'sales':
        return <SalesView />;
      case 'marketing':
        return <MarketingView />;
      case 'service':
        return <ServiceView />;
      case 'automation':
        return <AutomationView />;
      case 'reports':
        return <ReportsView />;
      case 'ai':
        return <AiAgentCenterView />;
      case 'admin':
        return <AdminView />;
      case 'integrations':
        return <ErpIntegrationsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <TopNavbar />
        <main>
          {renderModule()}
        </main>
      </div>

      {/* Global Overlays */}
      <GlobalSearchModal />
      <NotificationDrawer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
