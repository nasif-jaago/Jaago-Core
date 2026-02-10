import React, { useState, useEffect } from 'react';
import SidebarLeft from './components/layout/SidebarLeft';
import RightPanel from './components/layout/RightPanel';
import DashboardCore from './components/dashboard/DashboardCore';
import StrategicOverview from './components/dashboard/StrategicOverview';
import HRDashboard from './components/dashboard/HRDashboard';
import FinanceDashboard from './components/dashboard/FinanceDashboard';
import ChildWelfareDashboard from './components/dashboard/ChildWelfareDashboard';
import EmployeesPage from './components/hr/EmployeesPage';
import LeaveRequestPage from './components/hr/LeaveRequestPage';
import ContactsPage from './components/contacts/ContactsPage';
import ApprovalsPage from './components/approvals/ApprovalsPage';
import ExpensesPage from './components/expenses/ExpensesPage';
import OnDutyPage from './components/hr/OnDutyPage';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SystemAdminDashboard from './components/dashboard/SystemAdminDashboard';
import { MODULE_REGISTRY } from './api/ModuleRegistry';
import GenericModulePage from './components/shared/GenericModulePage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import DashboardChatter from './components/dashboard/DashboardChatter';
import ErrorBoundary from './components/ErrorBoundary';
import { LayoutGrid, Star, ChevronRight, Moon, Sun, RefreshCcw, Bell, Globe, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const role = user?.user_metadata?.role || 'user';
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  // Chatter State
  const [isChatterOpen, setIsChatterOpen] = useState(false);
  const [chatterMode, setChatterMode] = useState<'small' | 'full'>('small');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.left = `${e.clientX - 25}px`;
      ripple.style.top = `${e.clientY - 25}px`;
      ripple.style.width = '50px';
      ripple.style.height = '50px';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
        <RefreshCcw className="spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveModule(null); // Reset module view when changing main tabs
  };

  const renderContent = () => {
    if (activeModule) {
      if (activeModule === 'employees') {
        return <EmployeesPage onBack={() => setActiveModule(null)} />;
      }
      if (activeModule === 'leave') {
        return <LeaveRequestPage onBack={() => setActiveModule(null)} />;
      }
      if (activeModule === 'contacts') {
        return <ContactsPage onBack={() => setActiveModule(null)} />;
      }
      if (activeModule === 'approvals') {
        return <ApprovalsPage onBack={() => setActiveModule(null)} />;
      }
      if (activeModule === 'expenses') {
        return <ExpensesPage onBack={() => setActiveModule(null)} />;
      }
      if (activeModule === 'onduty') {
        return <OnDutyPage onBack={() => setActiveModule(null)} />;
      }

      const config = MODULE_REGISTRY[activeModule];
      if (config) {
        return <GenericModulePage config={config} onBack={() => setActiveModule(null)} />;
      }
    }

    switch (activeTab) {
      case 'Dashboard':
        return <StrategicOverview />;
      case 'Human Resources':
        return <HRDashboard />;
      case 'Admin & Procurement':
        return <AdminDashboard />;
      case 'Child Welfare':
        return <ChildWelfareDashboard />;
      case 'Finance':
        return <FinanceDashboard />;
      case 'Admin':
        return role === 'admin' ? <SystemAdminDashboard /> : <StrategicOverview />;
      default:
        return <DashboardCore title={activeTab} />;
    }
  };

  return (
    <div className={`app-container ${isMobileMenuOpen ? 'mobile-menu-open' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className={`sidebar-wrapper ${isMobileMenuOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{
        position: isMobileMenuOpen ? 'fixed' : 'relative',
        top: 0, left: 0, height: '100vh', zIndex: 1000,
        display: isMobileMenuOpen ? 'block' : undefined
      }}>
        <SidebarLeft
          activeTab={activeTab}
          setActiveTab={(tab) => {
            handleTabChange(tab);
            setIsMobileMenuOpen(false);
          }}
          onLogoClick={() => {
            handleTabChange('Dashboard');
            window.location.reload(); // Hard refresh to reset all data as requested
          }}
          user={user}
        />
      </div>

      <main className="main-content">
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-toggle"
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'none' }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="sidebar-toggle-desktop"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)'
              }}
            >
              {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
            <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <LayoutGrid size={16} />
              <Star size={16} />
              <span style={{ margin: '0 4px' }}>Dashboards</span>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                {activeTab === 'Dashboard' ? 'JAAGO Core' : activeTab}
                {activeModule && (
                  <>
                    <ChevronRight size={14} style={{ margin: '0 4px' }} />
                    <span style={{ color: 'var(--primary)' }}>{activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <RefreshCcw size={18} style={{ cursor: 'pointer' }} onClick={() => window.location.reload()} />
            <Bell size={18} style={{ cursor: 'pointer' }} />
            <Globe size={18} style={{ cursor: 'pointer' }} />
          </div>
        </header>

        <div className="content-scroll" style={{ flex: 1, minHeight: 0 }}>
          {renderContent()}
        </div>
      </main>

      <RightPanel
        activeTab={activeTab}
        onModuleClick={(id) => setActiveModule(id)}
        onOdooDiscussClick={() => setIsChatterOpen(true)}
        onGoogleChatClick={() => window.open('https://mail.google.com/chat', '_blank')}
      />

      <DashboardChatter
        isOpen={isChatterOpen}
        onClose={() => setIsChatterOpen(false)}
        mode={chatterMode}
        setMode={setChatterMode}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
