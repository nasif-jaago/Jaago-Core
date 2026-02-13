import React, { useEffect, useState } from 'react';
import {
    Users, Shield, Settings, UserPlus, Search,
    RefreshCw, Lock, Cpu, Globe,
    ChevronRight, CheckCircle2, AlertCircle, X, Mail, Send, Building
} from 'lucide-react';
import { fetchSettingsStats } from '../../api/SettingsService';
import { useAuth } from '../../context/AuthContext';
import { supabaseAdmin } from '../../lib/supabase';
import UserSettingsModal from './UserSettingsModal';
import SupabaseUserModal from './SupabaseUserModal';

const SystemAdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [activeSection, setActiveSection] = useState<'users' | 'companies' | 'supabase'>('users');
    const [searchQuery, setSearchQuery] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [supabaseUsers, setSupabaseUsers] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedSupabaseUser, setSelectedSupabaseUser] = useState<any>(null);

    const { sendMagicLink } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchSettingsStats();
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || "Failed to fetch Odoo data.");
            }

            // Fetch Supabase users using the admin client (service_role)
            try {
                const { data: { users: sbUsers }, error: sbError } = await supabaseAdmin.auth.admin.listUsers();
                if (sbUsers) setSupabaseUsers(sbUsers);
                if (sbError) console.error("Supabase Admin Error:", sbError);
            } catch (sbE) {
                console.error("Supabase listing failed:", sbE);
            }
        } catch (e: any) {
            setError(e.message || "A critical error occurred.");
            console.error("Critical Failure:", e);
        }

        setLoading(false);
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteLoading(true);
        setInviteMessage(null);

        const { error } = await sendMagicLink(inviteEmail);

        if (error) {
            setInviteMessage({ type: 'error', text: error.message });
        } else {
            setInviteMessage({ type: 'success', text: `Magic link sent to ${inviteEmail}!` });
            setTimeout(() => {
                setIsInviteModalOpen(false);
                setInviteEmail('');
                setInviteMessage(null);
            }, 3000);
        }
        setInviteLoading(false);
    };

    const users = data?.users || [];
    const groups = data?.groups || [];
    const modules = data?.modules || [];
    const companies = data?.companies || [];

    const filteredUsers = users.filter((u: any) =>
        String(u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(u.login || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCompanies = companies.filter((c: any) =>
        String(c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="system-admin-dashboard fade-in" style={{ padding: '24px', background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-main)', position: 'relative' }}>

            {/* Loading Overlay for Initial Load */}
            {loading && !data && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <RefreshCw className="spin" size={48} color="var(--primary)" />
                        <p style={{ color: 'var(--text-main)', marginTop: '16px', fontSize: '1rem', fontWeight: 600 }}>
                            Loading System Administration...
                        </p>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div style={{
                    marginBottom: '20px', padding: '16px', borderRadius: '16px',
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem'
                }}>
                    <AlertCircle size={20} />
                    <span><strong>System Error:</strong> {error}</span>
                    <button onClick={loadData} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>Retry Connection</button>
                </div>
            )}

            {/* Header / Top Control Bar */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-1px', fontFamily: "'Playfair Display', serif" }}>
                        <Settings className="text-indigo-600" size={32} color="var(--primary)" /> SYSTEM ADMINISTRATION
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginTop: '8px', fontWeight: 500 }}>Technical control panel & user management</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={loadData} className="btn-secondary glass-panel" style={{
                        padding: '12px 20px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
                        color: 'var(--text-main)', opacity: loading ? 0.6 : 1
                    }}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} /> Sync All
                    </button>
                    <button onClick={() => setIsInviteModalOpen(true)} className="btn-3d" style={{
                        padding: '12px 24px', fontSize: '0.85rem'
                    }}>
                        <UserPlus size={16} /> Invite Admin
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '16px' }}><Users size={24} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{users.length}</div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>ODOO USERS</p>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: 'var(--primary-glow)', filter: 'blur(30px)', opacity: 0.1 }} />
                </div>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                    <div style={{ color: '#10b981', marginBottom: '16px' }}><Building size={24} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{companies.length}</div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>TOTAL COMPANIES</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                    <div style={{ color: '#f59e0b', marginBottom: '16px' }}><Cpu size={24} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{modules.length}</div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>SYS MODULES</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                    <div style={{ color: '#3b82f6', marginBottom: '16px' }}><Globe size={24} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>Live</div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>ERP STATUS</p>
                </div>
            </div>

            {/* Tabs Trigger */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <button
                    onClick={() => setActiveSection('users')}
                    style={{
                        padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                        background: activeSection === 'users' ? 'var(--primary)' : 'var(--input-bg)',
                        color: activeSection === 'users' ? '#000' : 'var(--text-main)',
                        border: '1px solid var(--border-glass)',
                        fontWeight: 700, fontSize: '0.85rem'
                    }}
                >
                    Odoo Users
                </button>
                <button
                    onClick={() => setActiveSection('companies')}
                    style={{
                        padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                        background: activeSection === 'companies' ? 'var(--primary)' : 'var(--input-bg)',
                        color: activeSection === 'companies' ? '#000' : 'var(--text-main)',
                        border: '1px solid var(--border-glass)',
                        fontWeight: 700, fontSize: '0.85rem'
                    }}
                >
                    Odoo Companies
                </button>
                <button
                    onClick={() => setActiveSection('supabase')}
                    style={{
                        padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                        background: activeSection === 'supabase' ? 'var(--primary)' : 'var(--input-bg)',
                        color: activeSection === 'supabase' ? '#000' : 'var(--text-main)',
                        border: '1px solid var(--border-glass)',
                        fontWeight: 700, fontSize: '0.85rem'
                    }}
                >
                    Supabase Auth
                </button>
            </div>

            {/* Main Area: User Management & Technical Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

                {/* Main List Panel */}
                <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                            {activeSection === 'users' ? 'Odoo User Directory' : activeSection === 'companies' ? 'Company Administration' : 'Supabase Authentication Users'}
                        </h3>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder={`Search ${activeSection}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field"
                                style={{
                                    paddingLeft: '36px', width: '240px', fontSize: '0.8rem'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto', minHeight: '400px' }}>

                        {activeSection === 'users' && (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'var(--input-bg)' }}>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Account</th>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Apps Access</th>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                                        <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user: any, i: number) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)' }} className="user-row">
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-gradient)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                                                        {user.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.login}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                                                    {(user.app_names || []).slice(0, 3).map((name: string, idx: number) => (
                                                        <span key={idx} style={{
                                                            fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px',
                                                            background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: 600,
                                                            border: '1px solid rgba(99, 102, 241, 0.2)'
                                                        }}>
                                                            {name.split('/').pop()}
                                                        </span>
                                                    ))}
                                                    {user.app_names?.length > 3 && (
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '2px 4px' }}>+{user.app_names.length - 3} more</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                                                    background: user.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: user.active ? '#10b981' : '#ef4444',
                                                    border: `1px solid ${user.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                                }}>
                                                    {user.active ? 'ACTIVE' : 'DEACTIVATED'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <button onClick={() => setSelectedUser(user)} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem' }}>
                                                    Settings
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeSection === 'companies' && (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'var(--input-bg)' }}>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Company Name</th>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Details</th>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCompanies.map((comp: any, i: number) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)' }} className="user-row">
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                                        <Building size={20} />
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{comp.name}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{comp.email || '--'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{comp.phone || '--'}</div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                {comp.city ? `${comp.city}, ${comp.country_id?.[1]}` : comp.country_id?.[1] || '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeSection === 'supabase' && (
                            <div style={{ padding: '0' }}>
                                {supabaseUsers.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--input-bg)' }}>
                                            <tr style={{ textAlign: 'left' }}>
                                                <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>User ID</th>
                                                <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</th>
                                                <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Last Sign In</th>
                                                <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Role</th>
                                                <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Created At</th>
                                                <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {supabaseUsers.map((u, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)' }} className="user-row">
                                                    <td style={{ padding: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.id.slice(0, 8)}...</td>
                                                    <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem' }}>{u.email}</td>
                                                    <td style={{ padding: '16px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}
                                                    </td>
                                                    <td style={{ padding: '16px', fontSize: '0.8rem' }}>
                                                        <span style={{
                                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                                                            background: u.user_metadata?.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                            color: u.user_metadata?.role === 'admin' ? '#ef4444' : '#10b981',
                                                            border: u.user_metadata?.role === 'admin' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {u.user_metadata?.role || 'user'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => setSelectedSupabaseUser(u)}
                                                            className="btn-secondary"
                                                            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem' }}
                                                        >
                                                            Manage
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: '60px', textAlign: 'center', opacity: 0.6 }}>
                                        <Lock size={48} style={{ marginBottom: '16px' }} />
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No Supabase Users Found</p>
                                        <p style={{ fontSize: '0.75rem', maxWidth: '300px', margin: '8px auto' }}>
                                            The admin list is empty or the connection is pending.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* technical settings / panel vibe */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Role / Group Summary */}
                    <div className="glass-panel" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '24px', padding: '24px', border: '1px solid var(--primary-glow)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={20} color="var(--primary)" /> System Roles
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {groups.slice(0, 5).map((group: any, i: number) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{group.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{group.full_name?.split('/')[0]}</div>
                                    </div>
                                    <ChevronRight size={14} color="var(--text-muted)" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Installed Modules vibe */}
                    <div className="glass-panel" style={{ borderRadius: '24px', padding: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-main)' }}>System Health</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <div style={{ color: '#10b981' }}><CheckCircle2 size={20} /></div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Odoo Server</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Connected (v17.0)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Settings Modal */}
            {selectedUser && (
                <UserSettingsModal
                    user={selectedUser}
                    groups={groups}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {/* Supabase User Management Modal */}
            {selectedSupabaseUser && (
                <SupabaseUserModal
                    user={selectedSupabaseUser}
                    onClose={() => setSelectedSupabaseUser(null)}
                    onUpdate={loadData}
                />
            )}

            {/* Invite User Modal */}
            {isInviteModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div className="glass-panel fade-in" style={{
                        width: '100%', maxWidth: '400px', padding: '32px',
                        border: '1px solid var(--primary)', borderRadius: '24px',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsInviteModalOpen(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(245, 197, 24, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <UserPlus size={28} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Invite New Admin</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '8px' }}>Send a magic login link to their email</p>
                        </div>

                        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    placeholder="Enter user email..."
                                    className="input-field"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', paddingLeft: '48px' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={inviteLoading}
                                className="btn-3d"
                                style={{ width: '100%', padding: '16px' }}
                            >
                                {inviteLoading ? <RefreshCw className="spin" size={18} /> : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <span>Send Invite Link</span>
                                        <Send size={16} />
                                    </div>
                                )}
                            </button>

                            {inviteMessage && (
                                <div style={{
                                    padding: '12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
                                    background: inviteMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: inviteMessage.type === 'success' ? '#10b981' : '#ef4444',
                                    border: `1px solid ${inviteMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                }}>
                                    {inviteMessage.text}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .spin { animation: spin-anim 1s linear infinite; }
                @keyframes spin-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .user-row:hover { background: rgba(255,255,255,0.02); }
                [data-theme='light'] .user-row:hover { background: rgba(0,0,0,0.02); }
            `}</style>
        </div>
    );
};

export default SystemAdminDashboard;
