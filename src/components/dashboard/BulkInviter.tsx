import React, { useState, useRef, useEffect } from 'react';
import {
    Upload, Users, Send, CheckCircle2, AlertCircle,
    X, Download, FileText, Settings, Layout,
    Eye, RefreshCw, BarChart3, ShieldCheck, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inviteUser } from '../../api/AuthManagementService';
import { useAuth } from '../../context/AuthContext';

interface BulkUser {
    name: string;
    email: string;
    status: 'pending' | 'sending' | 'sent' | 'failed' | 'invalid' | 'duplicate';
    error?: string;
}

interface BulkInviterProps {
    isOpen: boolean;
    onClose: () => void;
}

const BulkInviter: React.FC<BulkInviterProps> = ({ isOpen, onClose }) => {
    const { user: currentUser } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [users, setUsers] = useState<BulkUser[]>([]);
    const [template, setTemplate] = useState({
        subject: 'Welcome to JAAGO Core System',
        body: `Hi {{Name}},\n\nYou've been invited to join the JAAGO Core Ecosystem as an administrator.\n\nPlease click the button below to set up your account and get started.\n\nOrganisation: {{Organisation}}\n\nBest regards,\nJAAGO Team`
    });
    const [placeholders, setPlaceholders] = useState({
        Organisation: 'JAAGO Foundation'
    });
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'template' | 'status'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        parseCSV(selectedFile);
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split(/\r?\n/);
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const nameIdx = headers.indexOf('name');
            const emailIdx = headers.indexOf('email');

            if (nameIdx === -1 || emailIdx === -1) {
                alert('CSV must contain "Name" and "Email" columns.');
                return;
            }

            const parsedUsers: BulkUser[] = [];
            const seenEmails = new Set<string>();

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const cols = lines[i].split(',').map(c => c.trim());
                const name = cols[nameIdx] || '';
                const email = cols[emailIdx] || '';

                if (!email || !email.includes('@')) {
                    parsedUsers.push({ name, email, status: 'invalid', error: 'Invalid email format' });
                } else if (seenEmails.has(email.toLowerCase())) {
                    parsedUsers.push({ name, email, status: 'duplicate', error: 'Duplicate in file' });
                } else {
                    seenEmails.add(email.toLowerCase());
                    parsedUsers.push({ name, email, status: 'pending' });
                }
            }
            setUsers(parsedUsers);
            setActiveTab('template');
        };
        reader.readAsText(file);
    };

    const downloadSampleCSV = () => {
        const content = "Name,Email\nJohn Doe,john@example.com\nJane Smith,jane@example.com";
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_invitation_list.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const getPreviewBody = (user: BulkUser) => {
        let body = template.body
            .replace(/{{Name}}/g, user.name || 'User')
            .replace(/{{Organisation}}/g, placeholders.Organisation);
        return body;
    };

    const handleBulkSend = async () => {
        if (!currentUser) return;
        setIsSending(true);
        setActiveTab('status');

        let sentCount = 0;
        const validUsers = users.filter(u => u.status === 'pending' || u.status === 'failed');

        for (let i = 0; i < users.length; i++) {
            if (users[i].status !== 'pending' && users[i].status !== 'failed') continue;

            const updatedUsers = [...users];
            updatedUsers[i].status = 'sending';
            setUsers(updatedUsers);

            // Mocking the email body with template for invitation
            // Note: The inviteUser function in AuthManagementService currently doesn't take a custom body 
            // because it uses Supabase's built-in invite system. 
            // For true custom templates, we'd need a custom mailer.
            // But we'll use the existing inviteUser for now as it handles Supabase Auth.

            const result = await inviteUser(users[i].email, currentUser.id);

            const finalStatusUsers = [...users];
            if (result.success) {
                finalStatusUsers[i].status = 'sent';
            } else {
                finalStatusUsers[i].status = 'failed';
                finalStatusUsers[i].error = result.error;
            }
            setUsers(finalStatusUsers);

            sentCount++;
            setProgress(Math.round((sentCount / validUsers.length) * 100));

            // Anti-bounce delay: 5 seconds
            if (i < users.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        setIsSending(false);
    };

    const retryFailed = async () => {
        const updatedUsers = users.map(u => u.status === 'failed' ? { ...u, status: 'pending' as const } : u);
        setUsers(updatedUsers);
        setProgress(0);
        handleBulkSend();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{
                    width: '100%', maxWidth: '900px', height: '80vh',
                    background: 'rgba(15,15,15,0.98)',
                    borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, #F5C518 0%, #FFD700 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#000', boxShadow: '0 10px 20px rgba(245,197,24,0.2)'
                        }}>
                            <Mail size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#fff' }}>Bulk Invitations</h2>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Manage large scale administrator invites</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: 'none',
                        color: 'rgba(255,255,255,0.4)', padding: '10px', borderRadius: '14px',
                        cursor: 'pointer'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', padding: '12px 32px', gap: '8px',
                    background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <TabButton active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} icon={<Upload size={16} />} label="1. Upload CSV" />
                    <TabButton active={activeTab === 'template'} onClick={() => setActiveTab('template')} icon={<Layout size={16} />} label="2. Configure Template" />
                    <TabButton active={activeTab === 'status'} onClick={() => setActiveTab('status')} icon={<BarChart3 size={16} />} label="3. Sending Status" disabled={users.length === 0} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    {activeTab === 'upload' && (
                        <div style={{ textAlign: 'center' }}>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    borderRadius: '24px', padding: '60px 40px',
                                    cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '20px',
                                    background: 'rgba(245,197,24,0.1)', margin: '0 auto 20px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5C518'
                                }}>
                                    <FileText size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                                    {file ? file.name : 'Select CSV File'}
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
                                    Drag and drop your user list or click to browse
                                </p>
                                <button style={{
                                    background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.3)',
                                    color: '#F5C518', padding: '12px 24px', borderRadius: '12px', fontWeight: 700
                                }}>
                                    Browse Files
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" style={{ display: 'none' }} />
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                                <button
                                    onClick={downloadSampleCSV}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer', fontSize: '0.9rem'
                                    }}
                                >
                                    <Download size={16} /> Download Sample Template
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'template' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Subject Line</label>
                                    <input
                                        type="text"
                                        value={template.subject}
                                        onChange={e => setTemplate({ ...template, subject: e.target.value })}
                                        style={{
                                            width: '100%', padding: '14px 18px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff', fontSize: '1rem', outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Email Body</label>
                                    <textarea
                                        value={template.body}
                                        onChange={e => setTemplate({ ...template, body: e.target.value })}
                                        style={{
                                            width: '100%', height: '240px', padding: '18px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'none',
                                            lineHeight: 1.6, fontFamily: 'monospace'
                                        }}
                                    />
                                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                                        Supported placeholders: <strong>{"{{Name}}"}</strong>, <strong>{"{{Organisation}}"}</strong>
                                    </p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Default Organisation</label>
                                    <input
                                        type="text"
                                        value={placeholders.Organisation}
                                        onChange={e => setPlaceholders({ ...placeholders, Organisation: e.target.value })}
                                        style={{
                                            width: '100%', padding: '12px 18px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff', fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Preview Panel */}
                            <div style={{
                                background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.05)', padding: '24px',
                                display: 'flex', flexDirection: 'column'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <Eye size={18} color="#F5C518" />
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#F5C518' }}>LIVE PREVIEW</span>
                                </div>
                                <div style={{
                                    flex: 1, padding: '24px', borderRadius: '16px',
                                    background: '#fff', color: '#333', fontSize: '0.95rem',
                                    fontFamily: 'sans-serif', whiteSpace: 'pre-wrap'
                                }}>
                                    <h4 style={{ margin: '0 0 20px', color: '#111', fontSize: '1.2rem', fontWeight: 800 }}>{template.subject}</h4>
                                    {getPreviewBody(users[0] || { name: 'User', email: '', status: 'pending' })}
                                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                                        <button disabled style={{
                                            background: '#F5C518', color: '#000', border: 'none',
                                            padding: '12px 24px', borderRadius: '8px', fontWeight: 800
                                        }}>
                                            Join Now
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleBulkSend}
                                    style={{
                                        marginTop: '24px', width: '100%',
                                        background: 'linear-gradient(135deg, #F5C518 0%, #e6b800 100%)',
                                        color: '#000', border: 'none', padding: '18px',
                                        borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem',
                                        cursor: 'pointer', boxShadow: '0 10px 20px rgba(245,197,24,0.2)'
                                    }}
                                >
                                    One-Click Bulk Invitation
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'status' && (
                        <div>
                            {/* Summary Bar */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
                                marginBottom: '32px'
                            }}>
                                <StatusCard label="TOTAL" value={users.length} color="#fff" />
                                <StatusCard label="PENDING" value={users.filter(u => u.status === 'pending').length} color="rgba(255,255,255,0.4)" />
                                <StatusCard label="SENT" value={users.filter(u => u.status === 'sent').length} color="#10b981" />
                                <StatusCard label="FAILED" value={users.filter(u => u.status === 'failed').length} color="#ef4444" />
                            </div>

                            {/* Progress Tracker */}
                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>
                                        {isSending ? 'Sending in progress (5s gap)...' : 'Operation Complete'}
                                    </span>
                                    <span style={{ fontWeight: 900, color: '#F5C518' }}>{progress}%</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        animate={{ width: `${progress}%` }}
                                        style={{ height: '100%', background: '#F5C518', boxShadow: '0 0 15px rgba(245,197,24,0.5)' }}
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div style={{
                                background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <tr style={{ textAlign: 'left', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                                            <th style={{ padding: '16px 24px' }}>Recipient</th>
                                            <th style={{ padding: '16px 24px' }}>Email</th>
                                            <th style={{ padding: '16px 24px' }}>Status</th>
                                            <th style={{ padding: '16px 24px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{user.name}</td>
                                                <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{user.email}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800,
                                                        background: user.status === 'sent' ? 'rgba(16,185,129,0.1)' :
                                                            user.status === 'failed' ? 'rgba(239,68,68,0.1)' :
                                                                user.status === 'sending' ? 'rgba(245,197,24,0.1)' : 'rgba(255,255,255,0.05)',
                                                        color: user.status === 'sent' ? '#10b981' :
                                                            user.status === 'failed' ? '#ef4444' :
                                                                user.status === 'sending' ? '#F5C518' : 'rgba(255,255,255,0.4)',
                                                        border: '1px solid currentColor'
                                                    }}>
                                                        {user.status.toUpperCase()}
                                                    </span>
                                                    {user.error && (
                                                        <div style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '4px' }}>{user.error}</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    {user.status === 'failed' && !isSending && (
                                                        <button onClick={handleBulkSend} style={{ background: 'none', border: 'none', color: '#F5C518', cursor: 'pointer' }}>
                                                            <RefreshCw size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {!isSending && users.some(u => u.status === 'failed') && (
                                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <button
                                        onClick={retryFailed}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#ef4444', padding: '12px 24px', borderRadius: '12px',
                                            fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto'
                                        }}
                                    >
                                        <RefreshCw size={18} /> Retry All Failed
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', justifyContent: 'flex-end', gap: '12px',
                    background: 'rgba(255,255,255,0.01)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    {activeTab === 'upload' && users.length > 0 && (
                        <button
                            onClick={() => setActiveTab('template')}
                            style={{
                                padding: '12px 24px', borderRadius: '14px', border: 'none',
                                background: '#F5C518', color: '#000', fontWeight: 800, cursor: 'pointer'
                            }}
                        >
                            Next: Configure Template
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, disabled?: boolean }> = ({ active, onClick, icon, label, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '12px',
            background: active ? 'rgba(245,197,24,0.1)' : 'transparent',
            border: 'none', color: active ? '#F5C518' : 'rgba(255,255,255,0.3)',
            fontWeight: 800, fontSize: '0.85rem', cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: disabled ? 0.3 : 1
        }}
    >
        {icon}
        {label}
    </button>
);

const StatusCard: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
        padding: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
    }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color }}>{value}</div>
    </div>
);

export default BulkInviter;
