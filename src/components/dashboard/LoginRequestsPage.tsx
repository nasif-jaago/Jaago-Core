import React, { useEffect, useState } from 'react';
import {
    CheckCircle2, XCircle, Search, Clock,
    RefreshCw, AlertCircle, Eye, ClipboardList,
    Monitor, Globe, History, X, Trash2, Mail, Send, Copy, Check, ExternalLink, Users
} from 'lucide-react';
import {
    fetchLoginRequests, approveLoginRequest, rejectLoginRequest,
    fetchRequestLogs, linkEmployeeToRequest, fetchOdooEmployeeByEmail,
    pauseLoginRequest, deleteLoginRequest
} from '../../api/AuthManagementService';
import type { LoginRequest } from '../../api/AuthManagementService';
import { useAuth } from '../../context/AuthContext';
import BulkInviter from './BulkInviter';

// ── Email Composer Modal ─────────────────────────────────────────────────────
interface EmailComposerProps {
    request: LoginRequest;
    onClose: () => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ request, onClose }) => {
    const loginUrl = `${window.location.origin}?welcome=1`;
    const subject = 'Welcome to JAAGO Core System';
    const body = `Dear ${request.employee_name || 'Team Member'},

Your access request to the JAAGO Core System has been approved!

Please visit the link below to log in and set your password:

${loginUrl}

Steps to get started:
1. Click the link above to open the login page.
2. Enter your registered email: ${request.email}
3. Click "Forgot?" to request a password reset link.
4. Check your email for the reset link and set your new password.
5. Log in with your new password.

If you have any issues, please contact the JAAGO IT team.

Best regards,
JAAGO Foundation Admin Team`;

    const [copied, setCopied] = useState(false);
    const [bodyCopied, setBodyCopied] = useState(false);

    const mailtoHref = `mailto:${request.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(request.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyBody = () => {
        navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
        setBodyCopied(true);
        setTimeout(() => setBodyCopied(false), 2500);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 6000,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(24px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '40px 20px', overflowY: 'auto'
        }}>
            <div className="glass-panel scale-in" style={{
                width: '100%', maxWidth: '640px', borderRadius: '32px',
                border: '1px solid rgba(245,197,24,0.3)',
                background: 'rgba(10,10,10,0.97)',
                boxShadow: '0 0 60px rgba(245,197,24,0.1)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(245,197,24,0.15) 0%, rgba(245,197,24,0.05) 100%)',
                    padding: '28px 32px',
                    borderBottom: '1px solid rgba(245,197,24,0.15)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '16px',
                            background: 'rgba(245,197,24,0.15)',
                            border: '1px solid rgba(245,197,24,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(245,197,24,0.2)'
                        }}>
                            <Mail size={22} color="#F5C518" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#F5C518' }}>
                                Send Welcome Email
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>
                                Compose and send login invitation
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: 'none',
                        color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                        padding: '10px', borderRadius: '12px', display: 'flex'
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Fields */}
                <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* To */}
                    <div>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                            TO
                        </label>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px', padding: '14px 18px'
                        }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: 'var(--primary-gradient)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#000', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0
                            }}>
                                {(request.employee_name || request.email).charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                    {request.employee_name || 'User'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                                    {request.email}
                                </div>
                            </div>
                            <button onClick={handleCopyEmail} style={{
                                background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                color: copied ? '#10b981' : 'rgba(255,255,255,0.5)',
                                padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem',
                                transition: 'all 0.2s', fontWeight: 600
                            }}>
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                            SUBJECT
                        </label>
                        <div style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px', padding: '14px 18px',
                            fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)'
                        }}>
                            {subject}
                        </div>
                    </div>

                    {/* Body */}
                    <div>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                            MESSAGE BODY
                        </label>
                        <div style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px', padding: '18px',
                            fontSize: '0.82rem', lineHeight: '1.8',
                            color: 'rgba(255,255,255,0.7)',
                            fontFamily: 'monospace', whiteSpace: 'pre-wrap',
                            maxHeight: '260px', overflowY: 'auto'
                        }}>
                            {body}
                        </div>
                    </div>

                    {/* Login URL highlight */}
                    <div style={{
                        background: 'rgba(245,197,24,0.07)',
                        border: '1px solid rgba(245,197,24,0.18)',
                        borderRadius: '14px', padding: '14px 18px',
                        display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <ExternalLink size={16} color="#F5C518" />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(245,197,24,0.7)', fontWeight: 800, marginBottom: '2px' }}>LOGIN LINK</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#F5C518' }}>{loginUrl}</div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{
                    padding: '0 32px 28px',
                    display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                    {/* Primary: Open email client */}
                    <a
                        href={mailtoHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '10px', padding: '16px 24px',
                            borderRadius: '16px', textDecoration: 'none',
                            background: 'linear-gradient(135deg, #F5C518 0%, #e6b800 100%)',
                            color: '#000', fontWeight: 800, fontSize: '0.95rem',
                            boxShadow: '0 12px 30px rgba(245,197,24,0.35)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Send size={18} />
                        Open Email Client to Send
                    </a>

                    {/* Secondary: Copy full email */}
                    <button
                        onClick={handleCopyBody}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '10px', padding: '14px 24px',
                            borderRadius: '16px',
                            background: bodyCopied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${bodyCopied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'}`,
                            color: bodyCopied ? '#10b981' : 'rgba(255,255,255,0.7)',
                            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {bodyCopied ? <Check size={18} /> : <Copy size={18} />}
                        {bodyCopied ? 'Email Content Copied to Clipboard!' : 'Copy Entire Email Content'}
                    </button>

                    <button onClick={onClose} style={{
                        padding: '12px', borderRadius: '12px',
                        border: 'none', background: 'transparent',
                        color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const LoginRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<LoginRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<LoginRequest | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEmailComposer, setShowEmailComposer] = useState(false);
    const [emailTarget, setEmailTarget] = useState<LoginRequest | null>(null);
    const [showBulkInviter, setShowBulkInviter] = useState(false);

    // Manual Linking State
    const [manualEmail, setManualEmail] = useState('');
    const [manualSearchResult, setManualSearchResult] = useState<any>(null);
    const [manualLinkLoading, setManualLinkLoading] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        loadRequests();
    }, [filterStatus]);

    const loadRequests = async () => {
        setLoading(true);
        const res = await fetchLoginRequests({ status: filterStatus, searchTerm });
        if (res.success) setRequests(res.data || []);
        setLoading(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadRequests();
    };

    const handleApprove = async (id: string) => {
        if (!user) return;
        setActionLoading(true);
        const res = await approveLoginRequest(id, user.id);
        if (res.success) {
            loadRequests();
            if (selectedRequest?.id === id) {
                const updated = await fetchLoginRequests({ searchTerm: id });
                if (updated.success && updated.data && updated.data.length > 0) setSelectedRequest(updated.data[0]);
                viewLogs(id);
            }
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (!user || !selectedRequest || !rejectionReason) return;
        setActionLoading(true);
        const res = await rejectLoginRequest(selectedRequest.id, user.id, rejectionReason);
        if (res.success) {
            loadRequests();
            setSelectedRequest(null);
            setShowRejectModal(false);
            setRejectionReason('');
            setShowLogs(false);
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    const handleManualSearch = async () => {
        if (!manualEmail) return;
        setManualLinkLoading(true);
        const res = await fetchOdooEmployeeByEmail(manualEmail);
        if (res.success) {
            setManualSearchResult(res.data);
        } else {
            alert(res.error || 'Employee not found');
            setManualSearchResult(null);
        }
        setManualLinkLoading(false);
    };

    const handleManualLink = async () => {
        if (!selectedRequest || !manualSearchResult || !user) return;
        setActionLoading(true);
        const res = await linkEmployeeToRequest(selectedRequest.id, manualSearchResult, user.id);
        if (res.success) {
            loadRequests();
            setManualSearchResult(null);
            setManualEmail('');
            const updated = await fetchLoginRequests({ searchTerm: selectedRequest.id });
            if (updated.success && updated.data && updated.data.length > 0) setSelectedRequest(updated.data[0]);
            viewLogs(selectedRequest.id);
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    const handlePause = async (id: string) => {
        if (!user) return;
        if (!confirm('Are you sure you want to pause this user? They will not be able to log in.')) return;
        setActionLoading(true);
        const res = await pauseLoginRequest(id, user.id);
        if (res.success) {
            loadRequests();
            if (selectedRequest?.id === id) {
                const updated = await fetchLoginRequests({ searchTerm: id });
                if (updated.success && updated.data && updated.data.length > 0) setSelectedRequest(updated.data[0]);
                viewLogs(id);
            }
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    const handleDelete = async (deleteAuth: boolean) => {
        if (!user || !selectedRequest) return;
        setActionLoading(true);
        const res = await deleteLoginRequest(selectedRequest.id, user.id, deleteAuth);
        if (res.success) {
            loadRequests();
            setSelectedRequest(null);
            setShowDeleteModal(false);
            setShowLogs(false);
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    const viewLogs = async (requestId: string) => {
        const res = await fetchRequestLogs(requestId);
        if (res.success) {
            setLogs(res.data || []);
            setShowLogs(true);
        }
    };

    const openEmailComposer = (req: LoginRequest) => {
        setEmailTarget(req);
        setShowEmailComposer(true);
    };

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'Pending').length,
        notFound: requests.filter(r => r.status === 'Employee Not Found').length,
        approved: requests.filter(r => r.status === 'Approved').length
    };

    // Status badge helper
    const statusStyle = (status: string) => ({
        padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900,
        background: status === 'Approved' ? 'rgba(16,185,129,0.1)' :
            status === 'Rejected' ? 'rgba(239,68,68,0.1)' :
                status === 'Paused' ? 'rgba(148,163,184,0.1)' :
                    status === 'Pending' ? 'rgba(245,197,24,0.1)' : 'rgba(239,68,68,0.1)',
        color: status === 'Approved' ? '#10b981' :
            status === 'Rejected' ? '#ef4444' :
                status === 'Paused' ? '#94a3b8' :
                    status === 'Pending' ? '#f5c518' : '#ef4444',
        border: '1px solid currentColor'
    });

    return (
        <div className="login-requests-container" style={{ padding: '24px', color: 'var(--text-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>LOGIN APPROVALS</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '4px' }}>Verify and grant access to team members</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', gap: '20px' }}>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block' }}>PENDING</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.pending}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block' }}>NOT FOUND</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f87171' }}>{stats.notFound}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block' }}>APPROVED</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>{stats.approved}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowBulkInviter(true)}
                        className="btn-3d"
                        style={{
                            padding: '12px 20px', borderRadius: '12px',
                            background: '#F5C518', color: '#000',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <Users size={20} /> Bulk Invite
                    </button>
                    <button onClick={loadRequests} className="btn-secondary" style={{ padding: '12px', borderRadius: '12px' }}>
                        <RefreshCw size={20} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input-field"
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '48px', height: '48px', borderRadius: '14px' }}
                    />
                </form>
                <select
                    className="input-field"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ width: '200px', height: '48px', borderRadius: '14px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Employee Not Found">Employee Not Found</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <tr style={{ textAlign: 'left' }}>
                            <th style={{ padding: '16px 24px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>USER / EMPLOYEE</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ODOO INFO</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>REQUESTED</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>STATUS</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }}>
                                    <ClipboardList size={40} style={{ marginBottom: '12px' }} />
                                    <p>No login requests found matching your criteria.</p>
                                </td>
                            </tr>
                        )}
                        {requests.map(req => (
                            <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {/* User */}
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800 }}>
                                            {req.employee_name?.charAt(0) || req.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{req.employee_name || 'Anonymous User'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.email}</div>
                                        </div>
                                    </div>
                                </td>
                                {/* Odoo */}
                                <td style={{ padding: '16px 24px' }}>
                                    {req.employee_id ? (
                                        <div style={{ opacity: req.status === 'Employee Not Found' ? 0.4 : 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{req.department || 'No Dept'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.designation || 'No Designation'}</div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>
                                            <AlertCircle size={14} /> NO ODOO PROFILE
                                        </div>
                                    )}
                                </td>
                                {/* Requested */}
                                <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} />
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', marginLeft: '20px' }}>{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                {/* Status */}
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={statusStyle(req.status)}>{req.status.toUpperCase()}</span>
                                </td>
                                {/* Actions */}
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        <button onClick={() => { setSelectedRequest(req); viewLogs(req.id); }} className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }}>
                                            <Eye size={16} />
                                        </button>

                                        {/* ── SEND EMAIL (always visible for all statuses) ── */}
                                        <button
                                            onClick={() => openEmailComposer(req)}
                                            title="Send Welcome Email"
                                            style={{
                                                padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                                                background: 'rgba(245,197,24,0.1)',
                                                border: '1px solid rgba(245,197,24,0.25)',
                                                color: '#F5C518', display: 'flex', alignItems: 'center',
                                                gap: '5px', fontSize: '0.72rem', fontWeight: 700,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Mail size={14} /> Send Email
                                        </button>

                                        {req.status !== 'Approved' && (
                                            <button onClick={() => handleApprove(req.id)} disabled={actionLoading} className="btn-3d"
                                                style={{ padding: '8px 16px', fontSize: '0.75rem', background: '#10b981', color: '#fff' }}>
                                                {actionLoading ? <RefreshCw className="spin" size={14} /> : 'Approve'}
                                            </button>
                                        )}
                                        {req.status === 'Approved' && (
                                            <button onClick={() => handlePause(req.id)} disabled={actionLoading} className="btn-secondary"
                                                style={{ padding: '8px 16px', fontSize: '0.75rem', color: '#ef4444', border: '1px solid #ef4444' }}>
                                                Pause
                                            </button>
                                        )}
                                        {req.status === 'Paused' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleApprove(req.id)} disabled={actionLoading} className="btn-3d"
                                                    style={{ padding: '8px 16px', fontSize: '0.75rem', background: '#10b981', color: '#fff' }}>
                                                    Resume
                                                </button>
                                                <button onClick={() => { setSelectedRequest(req); setShowDeleteModal(true); }} className="btn-secondary"
                                                    style={{ padding: '8px 16px', fontSize: '0.75rem', color: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.3)' }}>
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        {(req.status === 'Pending' || req.status === 'Rejected') && (
                                            <button onClick={() => { setSelectedRequest(req); setShowRejectModal(true); }} className="btn-secondary"
                                                style={{ padding: '8px 16px', fontSize: '0.75rem', color: '#ef4444' }}>
                                                Reject
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Reject Modal ── */}
            {showRejectModal && selectedRequest && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 20px', overflowY: 'auto' }}>
                    <div className="glass-panel scale-in" style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: '32px', border: '1px solid #ef4444', position: 'relative', background: 'rgba(15,15,15,0.98)' }}>
                        <button onClick={() => setShowRejectModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={20} />
                        </button>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', color: '#ef4444' }}>Reject Request</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '28px' }}>Please provide a reason for rejecting {selectedRequest.email}</p>
                        <textarea className="input-field" placeholder="Reason for rejection..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} style={{ width: '100%', height: '140px', padding: '16px', borderRadius: '18px', marginBottom: '28px' }} />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowRejectModal(false)} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '14px' }}>Cancel</button>
                            <button onClick={handleReject} disabled={!rejectionReason || actionLoading} className="btn-3d" style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#ef4444', color: '#fff' }}>
                                {actionLoading ? <RefreshCw className="spin" size={18} /> : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Logs / Account Management Modal ── */}
            {showLogs && selectedRequest && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', overflowY: 'auto' }}>
                    <div className="glass-panel scale-in" style={{ width: '100%', maxWidth: '800px', padding: '40px', borderRadius: '32px', border: '1px solid var(--border-glass)', position: 'relative', background: 'rgba(15,15,15,0.95)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                                    <ClipboardList size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>Account Management</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Full audit history and technical metadata</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowLogs(false); setManualSearchResult(null); setSelectedRequest(null); }} className="btn-secondary" style={{ padding: '10px', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Summary Card */}
                        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', marginBottom: '32px', border: '1px solid var(--primary-glow)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>USER STATUS</div>
                                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{selectedRequest.status.toUpperCase()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>REQUEST ID</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{selectedRequest.id}</div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Globe size={18} color="var(--text-muted)" />
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>IP ADDRESS</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedRequest.ip_address || 'N/A'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Monitor size={18} color="var(--text-muted)" />
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>DEVICE INFO</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {selectedRequest.device_info?.userAgent || 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Odoo Match */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ODOO EMPLOYEE MATCH</div>
                            </div>
                            {selectedRequest.employee_id ? (
                                <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                                            {selectedRequest.employee_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedRequest.employee_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>ID: {selectedRequest.employee_id_number || selectedRequest.employee_id}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedRequest.department} • {selectedRequest.designation}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '16px' }}>Auto-matching failed. You can search Odoo manually by email to link this request.</p>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input className="input-field" placeholder="Employee email..." value={manualEmail} onChange={e => setManualEmail(e.target.value)} style={{ flex: 1, height: '42px' }} />
                                        <button onClick={handleManualSearch} disabled={manualLinkLoading} className="btn-secondary" style={{ padding: '0 16px', height: '42px' }}>
                                            {manualLinkLoading ? <RefreshCw className="spin" size={18} /> : 'Search Odoo'}
                                        </button>
                                    </div>
                                    {manualSearchResult && (
                                        <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{manualSearchResult.employee_name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{manualSearchResult.department} • {manualSearchResult.designation}</div>
                                                </div>
                                                <button onClick={handleManualLink} disabled={actionLoading} className="btn-3d" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>
                                                    {actionLoading ? <RefreshCw className="spin" size={14} /> : 'Link & Update'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Audit Log */}
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <History size={16} /> AUDIT LOG & TIMELINE
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {logs.map((log, i) => (
                                    <div key={log.id} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                                        {i < logs.length - 1 && <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-12px', width: '2px', background: 'rgba(255,255,255,0.05)' }} />}
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: '4px solid var(--bg-deep)', zIndex: 1, boxShadow: i === 0 ? '0 0 10px var(--primary-glow)' : 'none', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: i === 0 ? 'var(--primary)' : 'var(--text-main)' }}>{log.action}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        {new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </div>
                                                </div>
                                                {log.performed_by && (
                                                    <div style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-muted)' }}>
                                                        ADMIN
                                                    </div>
                                                )}
                                            </div>
                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                <div style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                    {Object.entries(log.metadata).map(([key, val]: [string, any]) => (
                                                        <div key={key} style={{ display: 'flex', gap: '8px' }}>
                                                            <span style={{ color: 'var(--primary)', opacity: 0.7 }}>{key}:</span>
                                                            <span style={{ wordBreak: 'break-all' }}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal bottom actions */}
                        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {/* Send Email Button in modal */}
                            <button
                                onClick={() => openEmailComposer(selectedRequest)}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '16px',
                                    background: 'rgba(245,197,24,0.1)',
                                    border: '1px solid rgba(245,197,24,0.3)',
                                    color: '#F5C518', fontWeight: 800, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '10px', fontSize: '0.9rem',
                                    boxShadow: '0 0 20px rgba(245,197,24,0.1)'
                                }}
                            >
                                <Mail size={18} /> Send Welcome Email
                            </button>

                            {selectedRequest.status === 'Approved' && (
                                <button onClick={() => handlePause(selectedRequest.id)} disabled={actionLoading} className="btn-secondary"
                                    style={{ flex: 1, padding: '16px', color: '#ef4444', border: '1px solid #ef4444' }}>
                                    Pause Access
                                </button>
                            )}
                            {selectedRequest.status === 'Paused' && (
                                <button onClick={() => handleApprove(selectedRequest.id)} disabled={actionLoading} className="btn-3d"
                                    style={{ flex: 1, padding: '16px', background: '#10b981', color: '#fff' }}>
                                    Resume Access
                                </button>
                            )}
                            {selectedRequest.status === 'Pending' && (
                                <button onClick={() => handleApprove(selectedRequest.id)} disabled={actionLoading} className="btn-3d"
                                    style={{ flex: 1, padding: '16px', background: '#10b981', color: '#fff' }}>
                                    {actionLoading ? <RefreshCw className="spin" size={20} /> : 'Approve Access'}
                                </button>
                            )}
                            <button onClick={() => setShowDeleteModal(true)} disabled={actionLoading} className="btn-secondary"
                                style={{ flex: 1, padding: '16px', color: '#ef4444', boxShadow: '0 0 15px rgba(239,68,68,0.4)', border: '1px solid rgba(239,68,68,0.5)', textShadow: '0 0 8px rgba(239,68,68,0.3)' }}>
                                Remove User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Modal ── */}
            {showDeleteModal && selectedRequest && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(25px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 20px', overflowY: 'auto' }}>
                    <div className="glass-panel scale-in" style={{ width: '100%', maxWidth: '480px', padding: '48px', borderRadius: '32px', border: '1px solid #ef4444', position: 'relative', background: 'rgba(10,10,10,0.98)', boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}>
                        <button onClick={() => setShowDeleteModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={20} />
                        </button>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <Trash2 size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444', marginBottom: '8px', textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>Critical Action</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>Permanently remove <strong>{selectedRequest.email}</strong>?</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button onClick={() => handleDelete(false)} className="btn-secondary" style={{ padding: '18px', borderRadius: '18px', fontSize: '0.9rem', fontWeight: 700 }}>
                                Remove Database Request Only
                            </button>
                            <button onClick={() => handleDelete(true)} className="btn-3d" style={{ background: '#ef4444', color: '#fff', padding: '18px', borderRadius: '18px', fontSize: '0.9rem', fontWeight: 800, boxShadow: '0 0 25px rgba(239,68,68,0.6)', border: '1px solid #ff4d4d' }}>
                                Full System Purge
                            </button>
                            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary" style={{ padding: '14px', borderRadius: '14px', border: 'none', color: 'var(--text-muted)' }}>
                                Cancel & Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Email Composer Modal ── */}
            {showEmailComposer && emailTarget && (
                <EmailComposer
                    request={emailTarget}
                    onClose={() => { setShowEmailComposer(false); setEmailTarget(null); }}
                />
            )}
            {/* ── Bulk Inviter Modal ── */}
            <BulkInviter
                isOpen={showBulkInviter}
                onClose={() => setShowBulkInviter(false)}
            />

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default LoginRequestsPage;
