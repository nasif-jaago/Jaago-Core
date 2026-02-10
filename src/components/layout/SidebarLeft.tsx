import React from 'react';
import {
    LayoutDashboard, Users, ShieldCheck, Baby, Palette,
    Wallet, Briefcase, Handshake, TrendingUp, Presentation,
    Layers, UserCheck, Zap, BarChart, HardDrive, Settings,
    MessageSquare, HelpCircle, LogIn, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarLeftProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogoClick?: () => void;
    user: any;
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

    { id: 'Messages', label: 'Messages', icon: MessageSquare, section: 'SETTINGS' },
    { id: 'Admin', label: 'System Admin', icon: Settings, section: 'SETTINGS', isAdminOnly: true },
    { id: 'Help', label: 'Help Centre', icon: HelpCircle, section: 'SETTINGS' },
];

import JaagoLogo from '../shared/JaagoLogo';

const SidebarLeft: React.FC<SidebarLeftProps> = ({ activeTab, setActiveTab, onLogoClick, user }) => {
    const role = user?.user_metadata?.role || 'user';
    const appAccess = user?.user_metadata?.app_access || [];

    const isVisible = (item: any) => {
        if (role === 'admin') return true;
        if (item.id === 'Dashboard') return true;
        if (item.isAdminOnly) return false;
        if (item.section === 'DEPARTMENTS' && item.appId) {
            return appAccess.includes(item.appId);
        }
        return true; // Default visible for other settings/dashboard items
    };

    const filteredNavItems = navItems.filter(isVisible);

    const { signOut } = useAuth();

    return (
        <aside className="sidebar-left" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px 0 0 10px' }}>
                <JaagoLogo onClick={onLogoClick} scale={0.7} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px', scrollbarWidth: 'none' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '1px' }}>MAIN</p>
                {filteredNavItems.filter(i => i.section === 'DASHBOARD').map(item => (
                    <div
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    >
                        <item.icon size={18} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</span>
                    </div>
                ))}

                {filteredNavItems.some(i => i.section === 'DEPARTMENTS') && (
                    <>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', marginTop: '1.5rem', letterSpacing: '1px' }}>DEPARTMENTS</p>
                        {filteredNavItems.filter(i => i.section === 'DEPARTMENTS').map(item => (
                            <div
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                style={{ padding: '8px 12px' }}
                            >
                                <item.icon size={16} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.label}</span>
                            </div>
                        ))}
                    </>
                )}

                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', marginTop: '1.5rem', letterSpacing: '1px' }}>SETTINGS</p>
                {filteredNavItems.filter(i => i.section === 'SETTINGS').map(item => (
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
                    >
                        <item.icon size={18} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</span>
                    </div>
                ))}
            </div>

            <div style={{ padding: '20px 10px', borderTop: '1px solid var(--border-glass)' }}>
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                        style={{
                            flex: 1, height: '40px', borderRadius: '10px', background: 'var(--input-bg)',
                            border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer'
                        }}
                        title="Sign In / Switch Account"
                    >
                        <LogIn size={18} />
                    </button>
                    <button
                        onClick={() => signOut()}
                        style={{
                            flex: 1, height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#ef4444', cursor: 'pointer'
                        }}
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                    <img src={`https://ui-avatars.com/api/?name=${user?.email?.split('@')[0] || 'User'}&background=f5c518&color=000`} style={{ width: '32px', height: '32px', borderRadius: '8px' }} alt="Avatar" />
                    <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.user_metadata?.name || user?.email?.split('@')[0]}
                        </p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SidebarLeft;
