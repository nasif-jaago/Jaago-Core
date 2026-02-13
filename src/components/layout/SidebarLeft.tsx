import React from 'react';
import {
    LayoutDashboard, Users, ShieldCheck, Baby, Palette,
    Wallet, Briefcase, Handshake, TrendingUp, Presentation,
    Layers, UserCheck, Zap, BarChart, HardDrive, Settings,
    HelpCircle, LogOut, Mail, Database, Plug, Server, Brain
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarLeftProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogoClick?: () => void;
    user: any;
    isCollapsed?: boolean;
}

const navItems = [
    { id: 'Dashboard', label: 'JAAGO Core', icon: LayoutDashboard, section: 'DASHBOARD' },
    { id: 'Human Resources', label: 'Human Resources', icon: Users, section: 'DEPARTMENTS', appId: 'hr_dashboard' },
    { id: 'Admin & Procurement', label: 'Admin & Procurement', icon: ShieldCheck, section: 'DEPARTMENTS', appId: 'procurement_dashboard' },
    { id: 'Child Welfare', label: 'Child Welfare', icon: Baby, section: 'DEPARTMENTS', appId: 'child_welfare' },
    { id: 'Digital & Creative', label: 'Digital & Creative (D&C)', icon: Palette, section: 'DEPARTMENTS', appId: 'digital_creative' },
    { id: 'Finance', label: 'Finance', icon: Wallet, section: 'DEPARTMENTS', appId: 'finance_dashboard' },
    { id: 'Founder\'s Office', label: 'Founder\'s Office (FO)', icon: Briefcase, section: 'DEPARTMENTS', appId: 'founders_office' },
    { id: 'Fundraising', label: 'Fundraising & Grants (FnG)', icon: Handshake, section: 'DEPARTMENTS', appId: 'fundraising' },
    { id: 'Impact Investment', label: 'Impact Investment (II)', icon: TrendingUp, section: 'DEPARTMENTS', appId: 'impact_investment' },
    { id: 'Project Implementation', label: 'Project Implementation (PI)', icon: Presentation, section: 'DEPARTMENTS', appId: 'project_implementation' },
    { id: 'Programmes', label: 'Programmes', icon: Layers, section: 'DEPARTMENTS', appId: 'programmes' },
    { id: 'Private Engagement', label: 'Private Sector (PSE)', icon: UserCheck, section: 'DEPARTMENTS', appId: 'private_engagement' },
    { id: 'Youth Development', label: 'Youth Development (YDP)', icon: Zap, section: 'DEPARTMENTS', appId: 'youth_development' },
    { id: 'MEAL', label: 'MEAL (Monitoring & Learning)', icon: BarChart, section: 'DEPARTMENTS', appId: 'meal' },
    { id: 'IT', label: 'IT', icon: HardDrive, section: 'DEPARTMENTS', appId: 'it_dashboard' },

    { id: 'Emails Log', label: 'Emails Log', icon: Mail, section: 'SETTINGS' },
    { id: 'API', label: 'API Settings', icon: Database, section: 'SETTINGS' },
    { id: 'Connectors', label: 'Connectors', icon: Plug, section: 'SETTINGS' },
    { id: 'Email Server', label: 'Email Server', icon: Server, section: 'SETTINGS' },
    { id: 'AI Agent', label: 'AI Agent', icon: Brain, section: 'SETTINGS' },
    { id: 'Admin', label: 'System Admin', icon: Settings, section: 'SETTINGS', isAdminOnly: true },
    { id: 'Help', label: 'Help Centre', icon: HelpCircle, section: 'SETTINGS' },
];

import JaagoLogo from '../shared/JaagoLogo';

const SidebarLeft: React.FC<SidebarLeftProps> = ({ activeTab, setActiveTab, onLogoClick, user, isCollapsed }) => {
    const role = user?.user_metadata?.role || 'user';
    const appAccess = user?.user_metadata?.app_access || [];

    const isVisible = (item: any) => {
        if (role === 'admin') return true;
        if (item.id === 'Dashboard') return true;
        if (item.isAdminOnly) return false;
        if (item.section === 'DEPARTMENTS' && item.appId) {
            return appAccess.includes(item.appId);
        }
        return true;
    };

    const filteredNavItems = navItems.filter(isVisible);
    const { signOut } = useAuth();

    return (
        <aside className="sidebar-left" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: 'width 0.3s'
        }}>
            <div style={{ padding: isCollapsed ? '10px 0' : '10px 0 0 10px', textAlign: 'center' }}>
                <JaagoLogo onClick={onLogoClick} scale={isCollapsed ? 0.4 : 0.7} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: isCollapsed ? '0 5px' : '0 10px 20px', scrollbarWidth: 'none' }}>
                {['DASHBOARD', 'DEPARTMENTS', 'SETTINGS'].map(section => {
                    const sectionItems = filteredNavItems.filter(i => i.section === section);
                    if (sectionItems.length === 0) return null;

                    return (
                        <div key={section} style={{ marginBottom: isCollapsed ? '10px' : '20px' }}>
                            {!isCollapsed && <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', marginTop: section !== 'DASHBOARD' ? '1.5rem' : '0', letterSpacing: '1px' }}>{section}</p>}
                            {sectionItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === 'Help') {
                                            window.location.href = 'https://www.odoo.com/help-form';
                                        } else {
                                            setActiveTab(item.id);
                                        }
                                    }}
                                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                    style={{
                                        padding: isCollapsed ? '10px' : '8px 12px',
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        position: 'relative'
                                    }}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <item.icon size={isCollapsed ? 20 : 18} />
                                    {!isCollapsed && <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</span>}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div style={{ padding: '20px 10px', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexDirection: isCollapsed ? 'column' : 'row' }}>
                    <button
                        onClick={() => signOut()}
                        style={{
                            width: '100%', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#ef4444', cursor: 'pointer'
                        }}
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span style={{ marginLeft: '8px' }}>Logout</span>}
                    </button>
                </div>

                {!isCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                        <img src={`https://ui-avatars.com/api/?name=${user?.email?.split('@')[0] || 'User'}&background=f5c518&color=000`} style={{ width: '32px', height: '32px', borderRadius: '8px' }} alt="Avatar" />
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.user_metadata?.name || user?.email?.split('@')[0]}
                            </p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{role}</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default SidebarLeft;
