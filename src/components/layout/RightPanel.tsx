import React from 'react';
import {
    CheckCircle, Receipt, Calendar, Clock,
    Timer, Users, Banknote,
    UserPlus, Bell, MessageSquare,
    Package, DoorOpen, HelpCircle, Wrench,
    Users2, LineChart, Target, CreditCard,
    ShoppingCart, Calculator, Hourglass, Folder,
    Contact, Award, CheckCircle2, Bot, Mail, Lock, Eye, EyeOff, LogOut,
    Monitor, Tablet, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface RightPanelProps {
    activeTab: string;
    onModuleClick?: (moduleId: string) => void;
    onOdooDiscussClick?: () => void;
    onGoogleChatClick?: () => void;
    isCollapsed?: boolean;
    className?: string;
}

const commonApps = [
    { id: 'approvals', name: 'Requisition', icon: CheckCircle },
    { id: 'expenses', name: 'Expenses', icon: Receipt },
    { id: 'leave', name: 'Leave Request', icon: Calendar },
    { id: 'onduty', name: 'On Duty', icon: Clock },
    { id: 'contacts', name: 'Contacts', icon: Contact },
    { id: 'todos', name: 'To-do', icon: CheckCircle2 },
    { id: 'aibaba', name: 'AI Baba', icon: Bot },
];

const hrModules = [
    { id: 'timeoff', name: 'Time Off', icon: Timer },
    { id: 'attendance', name: 'Attendance', icon: Users },
    { id: 'payroll', name: 'Payroll', icon: Banknote },
    { id: 'recruitment', name: 'Recruitment', icon: UserPlus },
    { id: 'appraisals', name: 'Appraisals', icon: Award },
    { id: 'appraisal-360-logs', name: '360 Feedback', icon: UserPlus, openInNewTab: true },
    { id: 'employees', name: 'Employees', icon: Users2 },
];

const adminModules = [
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'meetingroom', name: 'Meeting Room', icon: DoorOpen },
    { id: 'helpdesk', name: 'Help Desk', icon: HelpCircle },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench },
    { id: 'purchase', name: 'Purchase', icon: ShoppingCart },
];

const financeModules = [
    { id: 'accounting', name: 'Accounting', icon: Calculator },
    { id: 'payroll', name: 'Payroll', icon: Banknote },
    { id: 'timesheet', name: 'Time Sheet', icon: Hourglass },
];

const contentModules = [
    { id: 'projects', name: 'Projects', icon: Folder },
];

const itModules = [
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench },
];

const investmentModules = [
    { id: 'crm', name: 'CRM', icon: Target },
];

const GoogleIntegrationSection: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(() => !!localStorage.getItem('google_auth'));
    const [showLoginModal, setShowLoginModal] = React.useState(false);
    const [activeWidget, setActiveWidget] = React.useState<'gmail' | 'calendar' | null>(null);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLogin = () => {
        if (email && password) {
            setIsLoading(true);
            // Simulate API delay
            setTimeout(() => {
                localStorage.setItem('google_auth', JSON.stringify({ email }));
                setIsLoggedIn(true);
                setShowLoginModal(false);
                setIsLoading(false);
            }, 1500);
        }
    };

    const toggleWidget = (type: 'gmail' | 'calendar') => {
        if (!isLoggedIn) {
            setActiveWidget(type);
            setShowLoginModal(true);
        } else {
            setActiveWidget(activeWidget === type ? null : type);
        }
    };

    return (
        <>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div
                    className="card-hover"
                    onClick={() => toggleWidget('gmail')}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'var(--gmail-primary)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                    }}
                >
                    <Mail size={14} color="#fff" />
                    <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>Gmail</p>
                </div>
                <div
                    className="card-hover"
                    onClick={() => toggleWidget('calendar')}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'var(--google-primary)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                    }}
                >
                    <Calendar size={14} color="#fff" />
                    <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>Calendar</p>
                </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '360px', padding: '2rem', border: '1px solid var(--primary)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--primary-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Lock size={20} color="#000" />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Google Login</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Sign in to access your {activeWidget}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourname@gmail.com"
                                    style={{
                                        padding: '12px',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.85rem'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            paddingRight: '40px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.85rem'
                                        }}
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                className="btn-primary"
                                onClick={handleLogin}
                                disabled={isLoading}
                                style={{
                                    padding: '12px',
                                    marginTop: '1rem',
                                    fontWeight: 800,
                                    borderRadius: '10px',
                                    position: 'relative',
                                    opacity: isLoading ? 0.7 : 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <div className="spinner-small" />
                                        CONNECTING...
                                    </div>
                                ) : 'CONNECT ACCOUNT'}
                            </button>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Widgets */}
            {isLoggedIn && activeWidget === 'gmail' && (
                <div className="fade-in" style={{
                    marginTop: '0.5rem',
                    padding: '12px',
                    borderRadius: '16px',
                    background: 'var(--gmail-primary-soft)',
                    border: '1px solid var(--gmail-primary-soft)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gmail-primary)', margin: 0 }}>GMAIL</p>
                            <span style={{ fontSize: '0.6rem', color: 'var(--gmail-primary)', background: 'var(--gmail-primary-soft)', padding: '2px 6px', borderRadius: '4px' }}>3 New</span>
                        </div>
                        <button
                            onClick={() => { localStorage.removeItem('google_auth'); setIsLoggedIn(false); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                            title="Sign Out"
                        >
                            <LogOut size={12} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { from: 'Korvi Rakshand', subject: 'Project Update', time: '10m ago' },
                            { from: 'Google Calendar', subject: 'Invitation: Weekly Sync', time: '1h ago' },
                            { from: 'Slack Notifications', subject: 'You have a new mention', time: '2h ago' }
                        ].map((mail, i) => (
                            <div key={i} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>{mail.from}</p>
                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', margin: 0 }}>{mail.time}</p>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mail.subject}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isLoggedIn && activeWidget === 'calendar' && (
                <div className="fade-in" style={{
                    marginTop: '0.5rem',
                    padding: '12px',
                    borderRadius: '16px',
                    background: 'var(--google-primary-soft)',
                    border: '1px solid var(--google-primary-soft)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--google-primary)', margin: 0 }}>CALENDAR</p>
                        <button
                            onClick={() => { localStorage.removeItem('google_auth'); setIsLoggedIn(false); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                            title="Sign Out"
                        >
                            <LogOut size={12} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { title: 'Project Review', time: '11:00 AM - 12:00 PM', status: 'Confirmed' },
                            { title: 'HR Strategy', time: '02:30 PM - 03:30 PM', status: 'Pending' },
                            { title: 'Team Catch-up', time: '04:00 PM - 04:30 PM', status: 'Confirmed' }
                        ].map((meeting, i) => (
                            <div key={i} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid var(--google-primary)' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>{meeting.title}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '2px 0' }}>{meeting.time}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: meeting.status === 'Confirmed' ? '#22c55e' : '#f59e0b' }} />
                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{meeting.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

const mockLogs = [
    { id: 1, event: 'Odoo Account move sync', status: 'Success', time: '2 mins ago', color: '#22c55e' },
    { id: 2, event: 'HR Department metadata refresh', status: 'Success', time: '15 mins ago', color: '#22c55e' },
    { id: 3, event: 'Donor categories aggregation', status: 'Success', time: '1 hour ago', color: '#22c55e' },
    { id: 4, event: 'Project tag indexing', status: 'In Progress', time: 'Just now', color: 'var(--primary)' },
    { id: 5, event: 'Backup routine', status: 'Success', time: '3 hours ago', color: '#22c55e' },
];

const RightPanel: React.FC<RightPanelProps> = ({ activeTab, onModuleClick, onOdooDiscussClick, onGoogleChatClick, isCollapsed, className }) => {
    const [showLogs, setShowLogs] = React.useState(false);
    const { viewMode, cycleViewMode } = useTheme();
    const getDynamicModules = () => {
        switch (activeTab) {
            case 'Human Resources': return { title: 'HR Modules', modules: hrModules };
            case 'Admin & Procurement': return { title: 'Procurement Modules', modules: adminModules };
            case 'Finance': return { title: 'Finance Modules', modules: financeModules };
            case 'Programmes': return { title: 'Programmes Modules', modules: contentModules };
            case 'Project Implementation': return { title: 'PI Modules', modules: contentModules };
            case 'IT': return { title: 'IT Modules', modules: itModules };
            case 'Impact Investment': return { title: 'Investment Modules', modules: investmentModules };
            case 'Child Welfare': return {
                title: 'CWD Modules',
                modules: [
                    { id: 'cwdteamwork', name: 'CWD Teamwork', icon: Users2 },
                    { id: 'sales', name: 'Sales', icon: LineChart },
                    { id: 'crm', name: 'CRM', icon: Target },
                    { id: 'subscriptions', name: 'Subscriptions', icon: CreditCard },
                ]
            };
            default: return null;
        }
    };

    const dynamicData = getDynamicModules();

    return (
        <aside className={`right-panel ${isCollapsed ? 'collapsed' : ''} ${className || ''}`}>
            {/* Common Apps Section - NOW FIRST */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', opacity: 0.8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '3px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }} />
                        MODS
                    </div>

                    {/* Platform View Switcher */}
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); cycleViewMode(); }}
                        whileHover={{ scale: 1.1, color: 'var(--primary)' }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            padding: '4px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(56, 189, 248, 0.1)',
                            transition: 'all 0.3s ease'
                        }}
                        title={`View: ${viewMode.toUpperCase()}`}
                    >
                        {viewMode === 'desktop' && <Monitor size={14} />}
                        {viewMode === 'tablet' && <Tablet size={14} />}
                        {viewMode === 'mobile' && <Smartphone size={14} />}
                    </motion.button>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {commonApps.map((app) => (
                        <div
                            key={app.id}
                            className="card"
                            onClick={() => onModuleClick?.(app.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                background: 'var(--input-bg)',
                                border: '1px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-glow)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                                <app.icon size={app.id === 'aibaba' ? 18 : 16} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{app.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Communication Section - NOW SECOND */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                    <div style={{ width: '3px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }} />
                    CHAT & APPS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Odoo Discuss */}
                    <div
                        className="card-hover"
                        onClick={onOdooDiscussClick}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: 'var(--odoo-primary)',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            border: 'none',
                        }}
                    >
                        <MessageSquare size={14} color="#fff" />
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>Odoo Discuss</p>
                        </div>
                    </div>

                    {/* Google Chat */}
                    <div
                        className="card-hover"
                        onClick={onGoogleChatClick}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: 'var(--google-primary)',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            border: 'none',
                        }}
                    >
                        <MessageSquare size={14} color="#fff" />
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>Google Chat</p>
                        </div>
                    </div>

                    {/* Gmail & Calendar Integration */}
                    <GoogleIntegrationSection />
                </div>
            </div>

            {/* Dynamic Section */}
            {dynamicData && (
                <div style={{ marginBottom: '1.5rem' }} className="fade-in">
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '3px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }} />
                        {dynamicData.title.split(' ')[0]}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {dynamicData.modules.map((module) => (
                            <div
                                key={module.id}
                                className="card"
                                onClick={() => onModuleClick?.(module.id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px 8px',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    border: '1px solid var(--primary-glow)',
                                    background: 'rgba(var(--primary-rgb), 0.05)'
                                }}
                            >
                                <module.icon size={16} color="var(--primary)" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-main)' }}>{module.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Promo / Info */}
            <div style={{
                marginTop: 'auto',
                padding: '1.25rem',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.1), transparent)',
                border: '1px solid var(--primary-glow)',
                position: 'relative',
                flexShrink: 0,
                marginBottom: '1rem'
            }}>
                <Bell size={16} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--primary)' }} />
                <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '4px' }}>System Status</p>
                <p style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Odoo Sync
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '0.85rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                        Online
                    </span>
                </p>
                <button
                    className="btn-primary"
                    style={{ width: '100%', fontSize: '0.75rem', padding: '10px', fontWeight: 800, borderRadius: '12px' }}
                    onClick={() => setShowLogs(true)}
                >
                    View Logs
                </button>
            </div>

            {/* Logs Modal Overlay */}
            {showLogs && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px'
                }} onClick={() => setShowLogs(false)}>
                    <div
                        className="glass-panel"
                        style={{ width: '100%', maxWidth: '450px', padding: '32px', border: '1px solid var(--primary)', position: 'relative' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>SYSTEM SYNC LOGS</h2>
                            <button
                                onClick={() => setShowLogs(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 900 }}
                            >
                                CLOSE
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {mockLogs.map(log => (
                                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{log.event}</p>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{log.time}</p>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: log.color, padding: '4px 8px', borderRadius: '4px', background: `${log.color}15` }}>
                                        {log.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                            <p style={{ fontSize: '0.7rem', color: '#22c55e', margin: 0, fontWeight: 700 }}>Next Sync Scheduled: 14:00 (In 2 mins)</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};


export default RightPanel;
