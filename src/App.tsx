import React, { useState, useEffect } from 'react';
import RightPanel from './components/layout/RightPanel';
import Header from './components/layout/Header';
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
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import DashboardChatter from './components/dashboard/DashboardChatter';
import AIBaba from './components/ai/AIBaba';
import ErrorBoundary from './components/ErrorBoundary';
import { motion } from 'framer-motion';
import { RefreshCcw, LayoutGrid, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import DepartmentLauncher from './components/layout/DepartmentLauncher';

const Layout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const role = user?.user_metadata?.role || 'user';
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Chatter State
  const [isChatterOpen, setIsChatterOpen] = useState(false);
  const [chatterMode, setChatterMode] = useState<'small' | 'full'>('small');

  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isAIBabaOpen, setIsAIBabaOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

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

    if (view === 'feedback-360') {
      return <ThreeSixtyFeedbackForm />;
    }
    if (view === '360-quick-inviter') {
      return <ThreeSixtyQuickInviter />;
    }

    return <LoginPage />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveModule(null); // Reset module view when changing main tabs
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
      if (activeModule === 'appraisal-360-logs') return <ThreeSixtyLogsPage onBack={() => setActiveModule(null)} />; // Added rendering for ThreeSixtyLogsPage
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
    <div className="app-container">
      <main className="main-content" style={{ marginLeft: 0 }}>
        <Header activeTab={activeTab} setActiveTab={handleTabChange} />

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
              style={{
                color: activeModule ? 'var(--text-muted)' : 'var(--text-main)',
                fontWeight: 500,
              }}
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

        <DepartmentLauncher
          isOpen={isLauncherOpen}
          onClose={() => setIsLauncherOpen(false)}
          setActiveTab={handleTabChange}
        />
      </main>

      <RightPanel
        activeTab={activeTab}
        onModuleClick={(id) => setActiveModule(id)}
        onOdooDiscussClick={() => setIsChatterOpen(true)}
        onGoogleChatClick={() => window.open('https://mail.google.com/chat', '_blank')}
        isCollapsed={isRightPanelCollapsed}
      />

      <motion.button
        onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        whileHover={{ scale: 1.05, x: isRightPanelCollapsed ? -2 : 2 }}
        whileTap={{ scale: 0.98 }}
        className={isRightPanelCollapsed ? "hide-mobile" : ""}
        style={{
          position: 'fixed',
          top: '120px',
          right: isRightPanelCollapsed ? '0px' : 'var(--right-panel-width, 320px)',
          width: '24px',
          height: '48px',
          borderRadius: isRightPanelCollapsed ? '8px 0 0 8px' : '0 8px 8px 0',
          background: 'var(--primary-gradient)',
          border: 'none',
          boxShadow: '0 4px 15px var(--primary-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2000,
          color: '#000',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}
      >
        <motion.div
          animate={{ rotate: isRightPanelCollapsed ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronLeft size={16} />
        </motion.div>
      </motion.button>

      <DashboardChatter
        isOpen={isChatterOpen}
        onClose={() => setIsChatterOpen(false)}
        mode={chatterMode}
        setMode={setChatterMode}
      />

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
