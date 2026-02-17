import React from 'react';
import { X, Users, Cpu, Shield, CheckCircle2, ChevronRight } from 'lucide-react';

interface UserSettingsModalProps {
    user: any;
    groups: any[];
    onClose: () => void;
}

// Comprehensive list of all pages for permissions (Sync with SupabaseUserModal)
const ALL_PAGES = [
    { id: 'strategic_overview', name: 'Strategic Overview' },
    { id: 'finance_dashboard', name: 'Finance Dashboard' },
    { id: 'hr_dashboard', name: 'HR Dashboard' },
    { id: 'procurement_dashboard', name: 'Procurement Dashboard' },
    { id: 'system_admin', name: 'System Administration' },
    { id: 'employees', name: 'Employees' },
    { id: 'timeoff', name: 'Time Off' },
    { id: 'recruitment', name: 'Recruitment' },
    { id: 'attendance', name: 'Attendance' },
    { id: 'payroll', name: 'Payroll' },
    { id: 'appraisals', name: 'Appraisals' },
    { id: 'inventory', name: 'Inventory' },
    { id: 'purchase', name: 'Purchase' },
    { id: 'crm', name: 'CRM' },
    { id: 'projects', name: 'Projects' },
    { id: 'tasks', name: 'Tasks' },
    { id: 'accounting', name: 'Accounting' },
    { id: 'expenses', name: 'Expenses' },
    { id: 'meetingroom', name: 'Meeting Room' },
    { id: 'helpdesk', name: 'Help Desk' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'timesheet', name: 'Time Sheets' },
    { id: 'sales', name: 'Sales' },
    { id: 'subscriptions', name: 'Subscriptions' },
    { id: 'cwdteamwork', name: 'CWD Teamwork' },
    { id: 'todos', name: 'To-do' },
    { id: 'contacts', name: 'Contacts' },
    { id: 'settings', name: 'Settings' },
];

const PermissionToggle: React.FC<{
    label: string;
    isActive: boolean;
    onToggle: () => void;
}> = ({ label, isActive, onToggle }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'var(--input-bg)',
        border: '1px solid var(--border-glass)',
        borderRadius: '10px',
        marginBottom: '6px',
        transition: 'all 0.3s ease'
    }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</span>
        <div
            onClick={onToggle}
            style={{
                width: '38px',
                height: '20px',
                borderRadius: '10px',
                background: isActive ? '#10b981' : '#ef4444',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
                boxShadow: isActive ? '0 0 10px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.4)'
            }}
        >
            <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '3px',
                left: isActive ? '21px' : '3px',
                transition: 'left 0.3s ease'
            }} />
        </div>
    </div>
);

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ user, groups, onClose }) => {
    const [selectedApps, setSelectedApps] = React.useState<string[]>(user.app_permissions || []);

    if (!user) return null;

    const toggleApp = (appId: string) => {
        setSelectedApps(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
        );
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            overflow: 'auto'
        }}>
            <div className="glass-panel fade-in" style={{
                width: '100%', maxWidth: '650px', padding: '0',
                border: '1px solid var(--border-glass)', borderRadius: '24px',
                position: 'relative', maxHeight: '90vh', overflow: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '24px', borderBottom: '1px solid var(--border-glass)',
                    background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 1
                }}>
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '16px',
                            background: 'var(--primary-gradient)', color: '#000',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: '1.5rem'
                        }}>
                            {user.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                                {user.name}
                            </h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '2px' }}>{user.login}</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <span style={{
                                    padding: '3px 10px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 800,
                                    background: 'rgba(245, 197, 24, 0.1)', color: '#f5c518',
                                    border: '1px solid rgba(245, 197, 24, 0.2)',
                                    boxShadow: '0 0 10px rgba(245, 197, 24, 0.2)'
                                }}>
                                    ODOO SYSTEM USER
                                </span>
                                <span style={{
                                    padding: '3px 10px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 800,
                                    background: user.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: user.active ? '#10b981' : '#ef4444',
                                    border: `1px solid ${user.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}>
                                    {user.active ? '● LIVE' : '○ OFFLINE'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px' }}>
                    {/* Basic Info Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={18} color="var(--primary)" /> Account Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User ID</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, fontFamily: 'monospace' }}>#{user.id}</div>
                            </div>
                            <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                                    {user.company_id ? user.company_id[1] : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Apps Access Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Cpu size={20} color="var(--primary)" /> Application Access Rights
                        </h3>
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
                            {user.app_names && user.app_names.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {user.app_names.map((appName: string, idx: number) => (
                                        <div key={idx} style={{
                                            padding: '8px 16px', borderRadius: '10px',
                                            background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8',
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                            fontSize: '0.85rem', fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <CheckCircle2 size={14} />
                                            {appName.split('/').pop()}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                                    No application access assigned
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Security Groups Section */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={20} color="var(--primary)" /> Security Groups ({user.group_ids?.length || 0})
                        </h3>
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                            {user.group_ids && user.group_ids.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {user.group_ids.map((gid: number, idx: number) => {
                                        const group = groups.find((g: any) => g.id === gid);
                                        return group ? (
                                            <div key={idx} style={{
                                                padding: '12px', borderRadius: '8px',
                                                background: 'var(--input-bg)',
                                                border: '1px solid var(--border-glass)',
                                                fontSize: '0.85rem', fontWeight: 600,
                                                color: 'var(--text-main)',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                                <span>{group.full_name || group.name}</span>
                                                <ChevronRight size={14} color="var(--text-muted)" />
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                                    No security groups assigned
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Page Permissions Section */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={20} color="var(--primary)" /> Page Access Permissions
                        </h3>
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                                {ALL_PAGES.map((page) => (
                                    <PermissionToggle
                                        key={page.id}
                                        label={page.name}
                                        isActive={selectedApps.includes(page.id)}
                                        onToggle={() => toggleApp(page.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: '24px 32px', borderTop: '1px solid var(--border-glass)',
                    background: 'var(--bg-surface)', display: 'flex', gap: '12px', justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '0.85rem' }}
                    >
                        Close
                    </button>
                    <button
                        className="btn-3d"
                        style={{ padding: '12px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Shield size={16} /> Edit Permissions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSettingsModal;
