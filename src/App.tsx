import React, { useState, useEffect } from 'react';
import RightPanel from './components/layout/RightPanel';
import Header from './components/layout/Header';
import SidebarLeft from './components/layout/SidebarLeft';
import DashboardCore from './components/dashboard/DashboardCore';
import StrategicOverview from './components/dashboard/StrategicOverview';
import HRDashboard from './components/dashboard/HRDashboard';
import FinanceDashboard from './components/dashboard/FinanceDashboard';
import ChildWelfareDashboard from './components/dashboard/ChildWelfareDashboard';
import EmployeesPage from './components/hr/EmployeesPage';
import LeaveRequestPage from './components/hr/LeaveRequestPage';
import ContactsPage from './components/contacts/ContactsPage';
import RequisitionsPage from './components/requisitions/RequisitionsPage';
import ExpensesPage from './components/expenses/ExpensesPage';
import OnDutyPage from './components/hr/OnDutyPage';
import AppraisalsPage from './components/hr/AppraisalsPage';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SystemAdminDashboard from './components/dashboard/SystemAdminDashboard';
import EmailsLogPage from './components/settings/EmailsLogPage';
import APISettingsPage from './components/settings/APISettingsPage';
import ConnectorsPage from './components/settings/ConnectorsPage';
import EmailServerPage from './components/settings/EmailServerPage';
import AIAgentPage from './components/settings/AIAgentPage';

import { MODULE_REGISTRY } from './api/ModuleRegistry';
import GenericModulePage from './components/shared/GenericModulePage';
import AppraisalLogsView from './components/hr/appraisals/AppraisalLogsView';
import EmailTemplateList from './components/hr/appraisals/EmailTemplateList';
import ThreeSixtyFeedbackForm from './components/hr/appraisals/ThreeSixtyFeedbackForm';
import ThreeSixtyLogsPage from './components/hr/appraisals/ThreeSixtyLogsPage';
import FormBuilderPage from './components/hr/appraisals/FormBuilderPage';
import FormPreview from './components/hr/appraisals/FormPreview';
import ThreeSixtyQuickInviter from './components/hr/appraisals/ThreeSixtyQuickInviter';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import RequestAccessPage from './components/auth/RequestAccessPage';
import AcceptInvitePage from './components/auth/AcceptInvitePage';
import DashboardChatter from './components/dashboard/DashboardChatter';
import AIBaba from './components/ai/AIBaba';
import ErrorBoundary from './components/ErrorBoundary';
import { motion } from 'framer-motion';
import { RefreshCcw, LayoutGrid, Star, ChevronRight } from 'lucide-react';
import DepartmentLauncher from './components/layout/DepartmentLauncher';

const Layout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { viewMode } = useTheme();
  const role = user?.user_metadata?.role || 'user';
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Chatter State
  const [isChatterOpen, setIsChatterOpen] = useState(false);
  const [chatterMode, setChatterMode] = useState<'small' | 'full'>('small');

  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIBabaOpen, setIsAIBabaOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  // Sync sidebar collapse with viewMode
  useEffect(() => {
    if (viewMode === 'tablet') {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [viewMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'appraisal-logs') {
      setActiveModule('appraisal-logs');
      setIsRightPanelCollapsed(true);
    } else if (view === 'appraisal-templates') {
      setActiveModule('appraisal-templates');
      setIsRightPanelCollapsed(true);
    } else if (view === 'feedback-360') {
      setActiveModule('feedback-360');
      setIsRightPanelCollapsed(true);
    } else if (view === 'appraisal-360-logs') {
      setActiveModule('appraisal-360-logs');
      setIsRightPanelCollapsed(true);
    } else if (view === 'form-builder') {
      setActiveModule('form-builder');
      setIsRightPanelCollapsed(true);
    } else if (view === 'form-preview') {
      setActiveModule('form-preview');
      setIsRightPanelCollapsed(true);
    } else if (view === '360-quick-inviter') {
      setActiveModule('360-quick-inviter');
      setIsRightPanelCollapsed(true);
    }
  }, []);

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
        <RefreshCcw className="spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  if (!user) {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');

    if (view === 'feedback-360') return <ThreeSixtyFeedbackForm />;
    if (view === '360-quick-inviter') return <ThreeSixtyQuickInviter />;
    if (view === 'request-access') return <RequestAccessPage />;
    if (view === 'accept-invite') return <AcceptInvitePage />;

    return <LoginPage />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveModule(null);
  };

  const renderContent = () => {
    if (activeModule) {
      if (activeModule === 'employees') return <EmployeesPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'leave') return <LeaveRequestPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'contacts') return <ContactsPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'contacts-customers') return <ContactsPage onBack={() => setActiveModule(null)} initialFilters={{ isCustomer: true }} />;
      if (activeModule === 'approvals') return <RequisitionsPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'expenses') return <ExpensesPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'onduty') return <OnDutyPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'appraisals') return <AppraisalsPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'api-settings') return <APISettingsPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'connectors') return <ConnectorsPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'appraisal-logs') return <AppraisalLogsView onBack={() => setActiveModule(null)} />;
      if (activeModule === 'appraisal-templates') return <EmailTemplateList onBack={() => setActiveModule(null)} />;
      if (activeModule === 'feedback-360') return <ThreeSixtyFeedbackForm />;
      if (activeModule === 'appraisal-360-logs') return <ThreeSixtyLogsPage onBack={() => setActiveModule(null)} />;
      if (activeModule === 'form-builder') return <FormBuilderPage />;
      if (activeModule === 'form-preview') {
        const formId = new URLSearchParams(window.location.search).get('id');
        return <FormPreview formId={formId || ''} />;
      }
      if (activeModule === '360-quick-inviter') return <ThreeSixtyQuickInviter onBack={() => setActiveModule(null)} />;
      if (activeModule === 'aibaba') {
        setIsAIBabaOpen(true);
        setActiveModule(null);
        return null;
      }

      const config = MODULE_REGISTRY[activeModule];
      if (config) return <GenericModulePage config={config} onBack={() => setActiveModule(null)} />;
    }

    switch (activeTab) {
      case 'Dashboard': return <StrategicOverview onModuleClick={setActiveModule} />;
      case 'Human Resources': return <HRDashboard />;
      case 'Admin & Procurement': return <AdminDashboard />;
      case 'Child Welfare': return <ChildWelfareDashboard />;
      case 'Finance': return <FinanceDashboard />;
      case 'Admin': return role === 'admin' ? <SystemAdminDashboard /> : <StrategicOverview onModuleClick={setActiveModule} />;
      case 'Emails Log': return <EmailsLogPage />;
      case 'API': return <APISettingsPage onBack={() => setActiveModule(null)} />;
      case 'Connectors': return <ConnectorsPage onBack={() => setActiveModule(null)} />;
      case 'Email Server': return <EmailServerPage onBack={() => setActiveTab('Dashboard')} />;
      case 'AI Agent': return <AIAgentPage onBack={() => setActiveTab('Dashboard')} role={role} />;
      default: return <DashboardCore title={activeTab} />;
    }
  };

  return (
    <div className={`app-container ${viewMode}`}>
      {/* Mobile Drawer Overlay */}
      <div
        className={`drawer-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Left - Responsive */}
      <div className={`sidebar-wrapper ${isSidebarCollapsed ? 'collapsed' : ''} ${viewMode === 'mobile' ? 'mobile-drawer' : ''} ${isSidebarOpen && viewMode === 'mobile' ? 'open' : ''}`}>
        <SidebarLeft
          activeTab={activeTab}
          setActiveTab={(tab) => { handleTabChange(tab); setIsSidebarOpen(false); }}
          user={user}
          isCollapsed={isSidebarCollapsed}
          onLogoClick={() => { setActiveTab('Dashboard'); setIsSidebarOpen(false); }}
        />
      </div>

      {/* ══════════════════════════════════════════
           LEFT SIDEBAR TOGGLE — Neon Orange Arrow
          ══════════════════════════════════════════ */}
      <motion.button
        id="sidebar-toggle-btn"
        onClick={() => {
          if (viewMode === 'mobile') {
            setIsSidebarOpen(!isSidebarOpen);
          } else {
            setIsSidebarCollapsed(!isSidebarCollapsed);
          }
        }}
        whileHover={{ scale: 1.18 }}
        whileTap={{ scale: 0.88 }}
        title={isSidebarCollapsed || (!isSidebarOpen && viewMode === 'mobile') ? 'Open Sidebar' : 'Close Sidebar'}
        style={{
          position: 'fixed',
          top: '88px',
          left: (() => {
            if (viewMode === 'mobile') {
              return isSidebarOpen ? 'calc(var(--sidebar-width, 280px) - 16px)' : '0px';
            }
            if (viewMode === 'tablet') {
              return isSidebarCollapsed ? '64px' : 'calc(var(--sidebar-width, 80px) - 16px)';
            }
            return isSidebarCollapsed ? '0px' : 'calc(var(--sidebar-width, 280px) - 16px)';
          })(),
          zIndex: 1500,
          width: '32px',
          height: '42px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'left 0.4s cubic-bezier(0.4,0,0.2,1)',
          filter: 'drop-shadow(0 0 6px rgba(255,90,0,0.8)) drop-shadow(0 0 14px rgba(255,40,0,0.5))',
        }}
      >
        <motion.svg
          width="32" height="42" viewBox="0 0 32 42"
          animate={{
            scaleX: (isSidebarCollapsed || (!isSidebarOpen && viewMode === 'mobile')) ? -1 : 1
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="leftArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6a00" />
              <stop offset="50%" stopColor="#ee0979" />
              <stop offset="100%" stopColor="#ff4500" />
            </linearGradient>
            <linearGradient id="leftArrowAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffb347" />
              <stop offset="100%" stopColor="#ff6a00" />
            </linearGradient>
          </defs>
          {/* Main arrow body — pointing RIGHT (show sidebar) */}
          <polygon
            points="2,4 28,21 2,38"
            fill="url(#leftArrowGrad)"
            opacity="0.95"
          />
          {/* Bright leading edge highlight */}
          <polygon
            points="2,4 28,21 16,21"
            fill="url(#leftArrowAccent)"
            opacity="0.55"
          />
          {/* Small neon dot accent */}
          <circle cx="7" cy="21" r="3.5" fill="#ff9f43" opacity="0.9" />
        </motion.svg>
      </motion.button>


      <main className="main-content" style={{ marginLeft: 0 }}>
        <Header
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <div style={{ padding: '0 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.3s ease' }}
              onClick={() => setIsLauncherOpen(true)}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LayoutGrid size={18} />
            </div>
            <Star size={16} />
            <span
              style={{ margin: '0 4px', cursor: 'pointer' }}
              onClick={() => { setActiveTab('Dashboard'); setActiveModule(null); }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Dashboards
            </span>
            <ChevronRight size={14} />
            <span
              style={{ color: activeModule ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: 500 }}
              onClick={() => activeModule && setActiveModule(null)}
              onMouseEnter={(e) => activeModule && (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => activeModule && (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {activeTab === 'Dashboard' ? 'JAAGO Foundation' : activeTab}
            </span>
            {activeModule && (
              <>
                <ChevronRight size={14} style={{ margin: '0 4px' }} />
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  {activeModule.charAt(0).toUpperCase() + activeModule.slice(1).replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="content-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          {renderContent()}
        </div>

        <DepartmentLauncher isOpen={isLauncherOpen} onClose={() => setIsLauncherOpen(false)} setActiveTab={handleTabChange} />
      </main>

      <RightPanel
        activeTab={activeTab}
        onModuleClick={(id) => { setActiveModule(id); if (viewMode === 'mobile') setIsRightPanelCollapsed(true); }}
        onOdooDiscussClick={() => setIsChatterOpen(true)}
        onGoogleChatClick={() => window.open('https://mail.google.com/chat', '_blank')}
        isCollapsed={isRightPanelCollapsed}
        className={`${viewMode === 'mobile' && !isRightPanelCollapsed ? 'open-mobile' : ''}`}
      />

      {/* Drawer Overlay for Mobile/Tablet */}
      <div
        className={`drawer-overlay ${(isSidebarOpen || !isRightPanelCollapsed) && viewMode === 'mobile' ? 'open' : ''}`}
        onClick={() => {
          setIsSidebarOpen(false);
          setIsRightPanelCollapsed(true);
        }}
      />

      {/* ══════════════════════════════════════════
           RIGHT PANEL TOGGLE — Neon Purple Arrow
          ══════════════════════════════════════════ */}
      <motion.button
        id="right-panel-toggle-btn"
        onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        whileHover={{ scale: 1.18 }}
        whileTap={{ scale: 0.88 }}
        title={isRightPanelCollapsed ? 'Open Right Panel' : 'Close Right Panel'}
        style={{
          position: 'fixed',
          top: '88px',
          right: (() => {
            if (viewMode === 'mobile') {
              return isRightPanelCollapsed ? '0px' : 'calc(var(--right-panel-width, 320px) - 16px)';
            }
            if (viewMode === 'tablet') {
              return isRightPanelCollapsed ? '0px' : 'calc(var(--right-panel-width, 280px) - 16px)';
            }
            return isRightPanelCollapsed ? '0px' : 'calc(var(--right-panel-width, 320px) - 16px)';
          })(),
          zIndex: 2000,
          width: '32px',
          height: '42px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          display: viewMode === 'mobile' && isRightPanelCollapsed ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'right 0.4s cubic-bezier(0.4,0,0.2,1)',
          filter: 'drop-shadow(0 0 6px rgba(180,0,255,0.85)) drop-shadow(0 0 14px rgba(100,0,220,0.55))',
        }}
      >
        <motion.svg
          width="32" height="42" viewBox="0 0 32 42"
          animate={{
            scaleX: isRightPanelCollapsed ? -1 : 1
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="rightArrowGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="rightArrowAccent" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          {/* Main arrow body — pointing LEFT (close right panel) */}
          <polygon
            points="30,4 4,21 30,38"
            fill="url(#rightArrowGrad)"
            opacity="0.95"
          />
          {/* Bright leading edge highlight */}
          <polygon
            points="30,4 4,21 16,21"
            fill="url(#rightArrowAccent)"
            opacity="0.55"
          />
          {/* Small neon dot accent */}
          <circle cx="25" cy="21" r="3.5" fill="#e879f9" opacity="0.9" />
        </motion.svg>
      </motion.button>

      <DashboardChatter isOpen={isChatterOpen} onClose={() => setIsChatterOpen(false)} mode={chatterMode} setMode={setChatterMode} />

      <AIBaba
        role={role}
        forceOpen={isAIBabaOpen}
        onToggle={() => setIsAIBabaOpen(!isAIBabaOpen)}
        onCommand={(cmd, data) => {
          if (cmd === 'navigate') {
            if (data.tab) setActiveTab(data.tab);
            if (data.module) setActiveModule(data.module);
          }
        }}
      />
    </div >
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
