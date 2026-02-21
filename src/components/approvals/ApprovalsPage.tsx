import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Plus, RefreshCw, Search,
    CheckCircle, XCircle, Clock, AlertCircle, Eye
} from 'lucide-react';
import {
    fetchApprovals,
    getApprovalsCount,
    fetchApprovalCategories,
    fetchApprovalFields,
    type ApprovalRequest,
    type ApprovalCategory,
    type ApprovalField
} from '../../api/ApprovalsService';
import ApprovalCreatePage from './ApprovalCreatePage';
import ApprovalDetailModal from './ApprovalDetailModal';

interface ApprovalsPageProps {
    onBack: () => void;
}

const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ onBack }) => {
    const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
    const [categories, setCategories] = useState<ApprovalCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const recordsPerPage = 50;

    const [filters, setFilters] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    const [view, setView] = useState<'list' | 'create'>('list');
    const [fields, setFields] = useState<Record<string, ApprovalField>>({});
    const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        const [cats, flds] = await Promise.all([
            fetchApprovalCategories(),
            fetchApprovalFields()
        ]);
        if (cats.success && cats.data) setCategories(cats.data);
        setFields(flds);
    };

    useEffect(() => {
        loadApprovals();
    }, [filters, currentPage]);



    const loadApprovals = async () => {
        setLoading(true);
        setError(null);

        try {
            const offset = (currentPage - 1) * recordsPerPage;
            const [approvalsRes, count] = await Promise.all([
                fetchApprovals(filters, offset, recordsPerPage),
                getApprovalsCount(filters)
            ]);

            if (approvalsRes.success && approvalsRes.data) {
                setApprovals(approvalsRes.data);
                setTotalCount(count);
            } else {
                setError(approvalsRes.error || 'Failed to load approvals');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status);
        setFilters({ ...filters, status: status || undefined });
        setCurrentPage(1);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
            new: { label: 'New', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: Clock },
            pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: AlertCircle },
            approved: { label: 'Approved', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle },
            refused: { label: 'Refused', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle },
            cancel: { label: 'Cancelled', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', icon: XCircle }
        };

        const config = statusConfig[status] || statusConfig.new;
        const Icon = config.icon;

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: config.color,
                background: config.bg,
                border: `1px solid ${config.color}40`
            }}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const totalPages = Math.ceil(totalCount / recordsPerPage);

    if (view === 'create') {
        return (
            <ApprovalCreatePage
                categories={categories}
                fields={fields}
                onBack={() => setView('list')}
                onSuccess={() => {
                    setView('list');
                    loadApprovals();
                }}
            />
        );
    }

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={onBack}
                        className="btn-icon"
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                            borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--primary)'
                        }}
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Odoo / Approvals</p>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>Approval Requests</h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setView('create')}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> New Request
                    </button>
                    <button
                        onClick={loadApprovals}
                        style={{
                            background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                            borderRadius: '10px', padding: '8px 16px', color: 'var(--text-main)',
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search approvals..."
                            className="input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['', 'new', 'pending', 'approved', 'refused'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilter(status)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-glass)',
                                    background: selectedStatus === status ? 'var(--primary)' : 'var(--input-bg)',
                                    color: selectedStatus === status ? '#000' : 'var(--text-main)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {totalCount} request{totalCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="pulse" style={{ width: '60px', height: '60px', background: 'var(--primary-glow)', borderRadius: '50%' }} />
                    </div>
                ) : error ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                        <p style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
                        <button onClick={loadApprovals} className="btn-primary">Retry</button>
                    </div>
                ) : (
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, borderBottom: '1px solid var(--border-glass)' }}>
                                <tr style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '16px 24px', textAlign: 'left' }}>Subject / Request</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Category</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Requested By</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Amount</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '16px', textAlign: 'right', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvals.map(approval => (
                                    <tr
                                        key={approval.id}
                                        onClick={() => setSelectedApproval(approval)}
                                        style={{ borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}
                                        className="table-row-hover"
                                    >
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{approval.name}</p>
                                            {approval.reason && (
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {approval.reason.substring(0, 60)}{approval.reason.length > 60 ? '...' : ''}
                                                </p>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            {approval.category_id ? approval.category_id[1] : '--'}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            {approval.request_owner_id ? approval.request_owner_id[1] : '--'}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            {approval.date ? new Date(approval.date).toLocaleDateString() : '--'}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                                            {approval.amount ? `$${approval.amount.toFixed(2)}` : '--'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {getStatusBadge(approval.request_status)}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button className="btn-icon" style={{ width: '32px', height: '32px' }}>
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="btn-icon"
                            style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
                        >
                            ‹
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                            if (pageNum > totalPages) return null;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    style={{
                                        padding: '6px 12px', borderRadius: '8px',
                                        background: pageNum === currentPage ? 'var(--primary)' : 'var(--input-bg)',
                                        color: pageNum === currentPage ? '#000' : 'var(--text-main)',
                                        border: 'none', cursor: 'pointer', fontWeight: 600
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="btn-icon"
                            style={{ opacity: currentPage === totalPages ? 0.3 : 1 }}
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>

            {selectedApproval && (
                <ApprovalDetailModal
                    approval={selectedApproval}
                    onClose={() => setSelectedApproval(null)}
                    onUpdate={loadApprovals}
                />
            )}
        </div>
    );
};

export default ApprovalsPage;
