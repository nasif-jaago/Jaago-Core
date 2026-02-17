import React, { useState } from 'react';
import { X, User, Mail, Lock, Key, Shield, RefreshCw } from 'lucide-react';
import { supabaseAdmin } from '../../lib/supabase';

interface SupabaseUserModalProps {
    user: any;
    onClose: () => void;
    onUpdate: () => void;
}

// Comprehensive list of all pages for permissions
const ALL_PAGES = [
    { id: 'strategic_overview', name: 'Strategic Overview', department: 'Executive' },
    { id: 'finance_dashboard', name: 'Finance Dashboard', department: 'Finance' },
    { id: 'hr_dashboard', name: 'HR Dashboard', department: 'HR' },
    { id: 'procurement_dashboard', name: 'Procurement Dashboard', department: 'Procurement' },
    { id: 'system_admin', name: 'System Administration', department: 'Admin' },
    { id: 'employees', name: 'Employees', department: 'HR' },
    { id: 'timeoff', name: 'Time Off', department: 'HR' },
    { id: 'recruitment', name: 'Recruitment', department: 'HR' },
    { id: 'attendance', name: 'Attendance', department: 'HR' },
    { id: 'payroll', name: 'Payroll', department: 'HR' },
    { id: 'appraisals', name: 'Appraisals', department: 'HR' },
    { id: 'inventory', name: 'Inventory', department: 'Operations' },
    { id: 'purchase', name: 'Purchase', department: 'Finance' },
    { id: 'crm', name: 'CRM', department: 'Sales' },
    { id: 'projects', name: 'Projects', department: 'Operations' },
    { id: 'tasks', name: 'Tasks', department: 'Operations' },
    { id: 'accounting', name: 'Accounting', department: 'Finance' },
    { id: 'expenses', name: 'Expenses', department: 'Finance' },
    { id: 'meetingroom', name: 'Meeting Room', department: 'Admin' },
    { id: 'helpdesk', name: 'Help Desk', department: 'Admin' },
    { id: 'maintenance', name: 'Maintenance', department: 'Admin' },
    { id: 'timesheet', name: 'Time Sheets', department: 'HR' },
    { id: 'sales', name: 'Sales', department: 'Sales' },
    { id: 'subscriptions', name: 'Subscriptions', department: 'Sales' },
    { id: 'cwdteamwork', name: 'CWD Teamwork', department: 'Operations' },
    { id: 'todos', name: 'To-do', department: 'General' },
    { id: 'contacts', name: 'Contacts', department: 'General' },
    { id: 'settings', name: 'Settings', department: 'General' },
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
        padding: '12px 16px',
        background: 'var(--input-bg)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        marginBottom: '8px',
        transition: 'all 0.3s ease'
    }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</span>
        <div
            onClick={onToggle}
            style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: isActive ? '#10b981' : '#ef4444',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
                boxShadow: isActive ? '0 0 10px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.4)'
            }}
        >
            <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '3px',
                left: isActive ? '23px' : '3px',
                transition: 'left 0.3s ease'
            }} />
        </div>
    </div>
);

const SupabaseUserModal: React.FC<SupabaseUserModalProps> = ({ user, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'permissions'>('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile states
    const [email, setEmail] = useState(user?.email || '');
    const [role, setRole] = useState(user?.user_metadata?.role || 'user');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Permissions states
    const [selectedApps, setSelectedApps] = useState<string[]>(user?.user_metadata?.app_access || []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (!user?.id) throw new Error('User ID not found');
            const updates: any = {
                email,
                user_metadata: {
                    ...(user?.user_metadata || {}),
                    role: role
                }
            };

            const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, updates);
            if (error) throw error;

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => {
                onUpdate();
                onClose();
            }, 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        }
        setLoading(false);
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            if (!user?.id) throw new Error('User ID not found');
            const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
                password: newPassword
            });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Password reset successfully!' });
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to reset password' });
        }
        setLoading(false);
    };

    const handleUpdatePermissions = async () => {
        setLoading(true);
        setMessage(null);
        try {
            if (!user?.id) throw new Error('User ID not found');
            const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
                user_metadata: {
                    ...(user?.user_metadata || {}),
                    app_access: selectedApps
                }
            });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Permissions updated successfully!' });
            setTimeout(() => {
                onUpdate();
                onClose();
            }, 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update permissions' });
        }
        setLoading(false);
    };

    const toggleApp = (appId: string) => {
        setSelectedApps(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
        );
    };

    if (!user) return null;

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
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                                User Management
                            </h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '4px' }}>{user?.email}</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <span style={{
                                    padding: '3px 10px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 800,
                                    background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    boxShadow: '0 0 10px rgba(129, 140, 248, 0.3)'
                                }}>
                                    SUPABASE AUTH
                                </span>
                                <span style={{
                                    padding: '3px 10px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 800,
                                    background: role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    color: role === 'admin' ? '#ef4444' : '#10b981',
                                    border: role === 'admin' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                                    textTransform: 'uppercase',
                                    boxShadow: role === 'admin' ? '0 0 10px rgba(239, 68, 68, 0.3)' : '0 0 10px rgba(16, 185, 129, 0.3)'
                                }}>
                                    {role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            onClick={() => setActiveTab('profile')}
                            style={{
                                padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                                background: activeTab === 'profile' ? 'var(--primary)' : 'var(--input-bg)',
                                color: activeTab === 'profile' ? '#000' : 'var(--text-main)',
                                border: '1px solid var(--border-glass)',
                                fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <User size={14} /> Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('permissions')}
                            style={{
                                padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                                background: activeTab === 'permissions' ? 'var(--primary)' : 'var(--input-bg)',
                                color: activeTab === 'permissions' ? '#000' : 'var(--text-main)',
                                border: '1px solid var(--border-glass)',
                                fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Shield size={14} /> Permissions
                        </button>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    {message && (
                        <div style={{
                            marginBottom: '20px', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#10b981' : '#ef4444',
                            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <User size={20} color="var(--primary)" /> Account Information
                                </h3>
                                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                                            Email Address
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="input-field"
                                                style={{ width: '100%', paddingLeft: '48px' }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                                            System Role
                                        </label>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setRole('user')}
                                                style={{
                                                    flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                                    background: role === 'user' ? 'rgba(16, 185, 129, 0.1)' : 'var(--input-bg)',
                                                    border: `2px solid ${role === 'user' ? '#10b981' : 'var(--border-glass)'}`,
                                                    color: role === 'user' ? '#10b981' : 'var(--text-main)',
                                                    fontWeight: 700, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                }}
                                            >
                                                <User size={16} /> Regular User
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRole('admin')}
                                                style={{
                                                    flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                                    background: role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'var(--input-bg)',
                                                    border: `2px solid ${role === 'admin' ? '#ef4444' : 'var(--border-glass)'}`,
                                                    color: role === 'admin' ? '#ef4444' : 'var(--text-main)',
                                                    fontWeight: 700, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                }}
                                            >
                                                <Shield size={16} /> System Admin
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-3d"
                                        style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        {loading ? <RefreshCw className="spin" size={16} /> : <User size={16} />}
                                        Update Profile
                                    </button>
                                </form>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Lock size={20} color="var(--primary)" /> Reset Password
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                                            New Password
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="input-field"
                                                style={{ width: '100%', paddingLeft: '48px' }}
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                                            Confirm Password
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="input-field"
                                                style={{ width: '100%', paddingLeft: '48px' }}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleResetPassword}
                                        disabled={loading || !newPassword || !confirmPassword}
                                        className="btn-secondary"
                                        style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        {loading ? <RefreshCw className="spin" size={16} /> : <Key size={16} />}
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'permissions' && (
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Shield size={20} color="var(--primary)" /> Department-wise Access Rights
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                                {ALL_PAGES.map((page) => (
                                    <PermissionToggle
                                        key={page.id}
                                        label={page.name}
                                        isActive={selectedApps.includes(page.id)}
                                        onToggle={() => toggleApp(page.id)}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleUpdatePermissions}
                                disabled={loading}
                                className="btn-3d"
                                style={{ width: '100%', padding: '14px', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
                            >
                                {loading ? <RefreshCw className="spin" size={16} /> : <Shield size={16} />}
                                Save Permissions
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupabaseUserModal;
