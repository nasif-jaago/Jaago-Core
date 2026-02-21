import React, { useEffect, useState } from 'react';
import {
    CheckCircle2, XCircle, Search, Clock,
    RefreshCw, AlertCircle, Eye, ClipboardList,
    Monitor, Globe, History, X
} from 'lucide-react';
import {
    fetchLoginRequests, approveLoginRequest, rejectLoginRequest,
    fetchRequestLogs, linkEmployeeToRequest, fetchOdooEmployeeByEmail
} from '../../api/AuthManagementService';
import type { LoginRequest } from '../../api/AuthManagementService';
import { useAuth } from '../../context/AuthContext';

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
                // Refresh detailed view
                const updated = await fetchLoginRequests({ searchTerm: id }); // specific search
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
            // Refresh logs and detailed view
            const updated = await fetchLoginRequests({ searchTerm: selectedRequest.id });
            if (updated.success && updated.data && updated.data.length > 0) setSelectedRequest(updated.data[0]);
            viewLogs(selectedRequest.id);
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

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'Pending').length,
        notFound: requests.filter(r => r.status === 'Employee Not Found').length,
        approved: requests.filter(r => r.status === 'Approved').length
    };

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
                                <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} />
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', marginLeft: '20px' }}>{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900,
                                        background: req.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' :
                                            req.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                                req.status === 'Pending' ? 'rgba(245, 197, 24, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: req.status === 'Approved' ? '#10b981' :
                                            req.status === 'Rejected' ? '#ef4444' :
                                                req.status === 'Pending' ? '#f5c518' : '#ef4444',
                                        border: '1px solid currentColor'
                                    }}>
                                        {req.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setSelectedRequest(req); viewLogs(req.id); }} className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }}>
                                            <Eye size={16} />
                                        </button>
                                        {req.status !== 'Approved' && (
                                            <button
                                                onClick={() => handleApprove(req.id)}
                                                disabled={actionLoading}
                                                className="btn-3d"
                                                style={{ padding: '8px 16px', fontSize: '0.75rem', background: '#10b981', color: '#fff' }}
                                            >
                                                {actionLoading ? <RefreshCw className="spin" size={14} /> : 'Approve'}
                                            </button>
                                        )}
                                        {req.status === 'Pending' && (
                                            <button
                                                onClick={() => { setSelectedRequest(req); setShowRejectModal(true); }}
                                                className="btn-secondary"
                                                style={{ padding: '8px 16px', fontSize: '0.75rem', color: '#ef4444' }}
                                            >
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

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '32px', borderRadius: '24px', border: '1px solid #ef4444' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px', color: '#ef4444' }}>Reject Request</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '24px' }}>Please provide a reason for rejecting {selectedRequest.email}</p>

                        <textarea
                            className="input-field"
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            style={{ width: '100%', height: '120px', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowRejectModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleReject} disabled={!rejectionReason || actionLoading} className="btn-3d" style={{ flex: 1, background: '#ef4444', color: '#fff' }}>
                                {actionLoading ? <RefreshCw className="spin" size={18} /> : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logs Timeline & Details Overlay */}
            {showLogs && selectedRequest && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'flex-end' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', height: '100%', padding: '40px', borderRadius: '0', borderLeft: '1px solid var(--border-glass)', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                                    <ClipboardList size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>Request Details</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Full audit history and technical metadata</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowLogs(false); setManualSearchResult(null); setSelectedRequest(null); }} className="btn-secondary" style={{ padding: '8px', borderRadius: '12px' }}>
                                <X size={22} />
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

                        {/* Odoo Match Section */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ODOO EMPLOYEE MATCH</div>
                            </div>

                            {selectedRequest.employee_id ? (
                                <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
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
                                        <input
                                            className="input-field"
                                            placeholder="Employee email..."
                                            value={manualEmail}
                                            onChange={e => setManualEmail(e.target.value)}
                                            style={{ flex: 1, height: '42px' }}
                                        />
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
                                                <button
                                                    onClick={handleManualLink}
                                                    disabled={actionLoading}
                                                    className="btn-3d"
                                                    style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                                                >
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
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: i === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                            border: '4px solid var(--bg-deep)', zIndex: 1,
                                            boxShadow: i === 0 ? '0 0 10px var(--primary-glow)' : 'none'
                                        }} />
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
                                                <div style={{
                                                    marginTop: '12px', padding: '12px', borderRadius: '12px',
                                                    background: 'rgba(0,0,0,0.2)', fontSize: '0.75rem', color: 'var(--text-dim)',
                                                    fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.03)'
                                                }}>
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

                        {/* Actions */}
                        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '16px' }}>
                            {selectedRequest.status !== 'Approved' && (
                                <button
                                    onClick={() => handleApprove(selectedRequest.id)}
                                    disabled={actionLoading}
                                    className="btn-3d"
                                    style={{ flex: 1, padding: '16px', background: '#10b981', color: '#fff' }}
                                >
                                    {actionLoading ? <RefreshCw className="spin" size={20} /> : 'Approve Access'}
                                </button>
                            )}
                            {selectedRequest.status === 'Pending' && (
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={actionLoading}
                                    className="btn-secondary"
                                    style={{ flex: 1, padding: '16px', color: '#ef4444' }}
                                >
                                    Reject Request
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LoginRequestsPage;
