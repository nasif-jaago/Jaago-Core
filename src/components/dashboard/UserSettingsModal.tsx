import React from 'react';
import { X, Users, Cpu, Shield, CheckCircle2, ChevronRight } from 'lucide-react';

interface UserSettingsModalProps {
    user: any;
    groups: any[];
    onClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ user, groups, onClose }) => {
    if (!user) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            overflow: 'auto'
        }}>
            <div className="glass-panel fade-in" style={{
                width: '100%', maxWidth: '800px', padding: '0',
                border: '1px solid var(--primary)', borderRadius: '24px',
                position: 'relative', maxHeight: '90vh', overflow: 'auto'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '32px', borderBottom: '1px solid var(--border-glass)',
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
                            width: '80px', height: '80px', borderRadius: '20px',
                            background: 'var(--primary-gradient)', color: '#000',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: '2rem'
                        }}>
                            {user.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                                {user.name}
                            </h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1rem', marginTop: '4px' }}>{user.login}</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                                    background: user.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: user.active ? '#10b981' : '#ef4444',
                                    border: `1px solid ${user.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}>
                                    {user.active ? '● ACTIVE' : '○ INACTIVE'}
                                </span>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                                    background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8',
                                    border: '1px solid rgba(99, 102, 241, 0.2)'
                                }}>
                                    {user.share ? 'PORTAL USER' : 'INTERNAL USER'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '32px' }}>
                    {/* Basic Info Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} color="var(--primary)" /> Account Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>User ID</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, fontFamily: 'monospace' }}>#{user.id}</div>
                            </div>
                            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Company</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
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
                            <Shield size={20} color="var(--primary)" /> Security Groups ({user.groups_id?.length || 0})
                        </h3>
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                            {user.groups_id && user.groups_id.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {user.groups_id.map((gid: number, idx: number) => {
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
