import React from 'react';
import {
    CheckCircle, Receipt, Calendar, Clock,
    Timer, Users, Banknote,
    UserPlus, Bell, MessageSquare,
    Package, DoorOpen, HelpCircle, Wrench,
    Users2, LineChart, Target, CreditCard,
    ShoppingCart, Calculator, Hourglass, Folder,
    Contact, Award, CheckCircle2
} from 'lucide-react';

interface RightPanelProps {
    activeTab: string;
    onModuleClick?: (moduleId: string) => void;
    onOdooDiscussClick?: () => void;
    onGoogleChatClick?: () => void;
}

const commonApps = [
    { id: 'approvals', name: 'Approvals', icon: CheckCircle },
    { id: 'expenses', name: 'Expenses', icon: Receipt },
    { id: 'leave', name: 'Leave Request', icon: Calendar },
    { id: 'onduty', name: 'On Duty', icon: Clock },
    { id: 'contacts', name: 'Contacts', icon: Contact },
    { id: 'todos', name: 'To-do', icon: CheckCircle2 },
];

const hrModules = [
    { id: 'timeoff', name: 'Time Off', icon: Timer },
    { id: 'attendance', name: 'Attendance', icon: Users },
    { id: 'payroll', name: 'Payroll', icon: Banknote },
    { id: 'recruitment', name: 'Recruitment', icon: UserPlus },
    { id: 'appraisals', name: 'Appraisals', icon: Award },
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


const RightPanel: React.FC<RightPanelProps> = ({ activeTab, onModuleClick, onOdooDiscussClick, onGoogleChatClick }) => {
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
        <aside className="right-panel">
            {/* Common Apps Section */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '4px', height: '14px', background: 'var(--primary)', borderRadius: '2px' }} />
                    Common Apps
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {commonApps.map((app) => (
                        <div
                            key={app.id}
                            className="card"
                            onClick={() => onModuleClick?.(app.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: 'var(--input-bg)'
                            }}
                        >
                            <div style={{ color: 'var(--primary)' }}>
                                <app.icon size={18} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>{app.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic Section */}
            {dynamicData && (
                <div style={{ marginBottom: '2.5rem' }} className="fade-in">
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '14px', background: 'var(--primary)', borderRadius: '2px' }} />
                        {dynamicData.title}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {dynamicData.modules.map((module) => (
                            <div
                                key={module.id}
                                className="card"
                                onClick={() => onModuleClick?.(module.id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '16px 12px',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    border: '1px solid var(--primary-glow)',
                                    background: 'rgba(245, 197, 24, 0.05)'
                                }}
                            >
                                <module.icon size={20} color="var(--primary)" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{module.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Communication Section */}
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '14px', background: 'var(--primary)', borderRadius: '2px' }} />
                Discuss & Collaboration
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
                {/* Odoo Discuss */}
                <div
                    className="card-hover"
                    onClick={onOdooDiscussClick}
                    style={{
                        padding: '1rem',
                        borderRadius: '16px',
                        background: 'var(--odoo-primary)', // Solid Odoo Purple
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(113, 75, 103, 0.2)'
                    }}
                >
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}>
                        <MessageSquare size={18} color="#fff" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>Odoo Discuss</p>
                        <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>ERP Internal Chat</p>
                    </div>
                </div>

                {/* Google Chat */}
                <div
                    className="card-hover"
                    onClick={onGoogleChatClick}
                    style={{
                        padding: '1rem',
                        borderRadius: '16px',
                        background: 'var(--google-primary)', // Solid Google Teal
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(0, 137, 123, 0.2)'
                    }}
                >
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}>
                        <MessageSquare size={18} color="#fff" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>Google Chat</p>
                        <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>Enterprise Collaboration</p>
                    </div>
                </div>
            </div>

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
                <button className="btn-primary" style={{ width: '100%', fontSize: '0.75rem', padding: '8px' }}>View Logs</button>
            </div>
        </aside>
    );
};

export default RightPanel;
