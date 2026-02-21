import React, { useState, useEffect } from 'react';
import {
    Search, Plus, FileText, ChevronRight, Filter,
    Calendar, User, Tag, Clock, CheckCircle2, XCircle,
    Download, Shield, Briefcase
} from 'lucide-react';
import { fetchRequisitions, getRequisitionsCount, fetchCompanies } from '../../api/RequisitionsService';
import RequisitionFormPage from './RequisitionFormPage';
import ApprovalRulesManager from './ApprovalRulesManager';
import type { RequisitionRequest, RequisitionFilters } from '../../types/requisition';

interface RequisitionsPageProps {
    onBack?: () => void;
}

const RequisitionsPage: React.FC<RequisitionsPageProps> = ({ onBack }) => {
    // View state
    const [view, setView] = useState<'list' | 'form' | 'admin'>('list');
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

    // Data state
    const [requisitions, setRequisitions] = useState<RequisitionRequest[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);

    // Filter state
    const [filters, setFilters] = useState<RequisitionFilters>({
        status: undefined,
        my_requests: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (view === 'list') {
                loadRequisitions();
            }
        }, searchTerm ? 500 : 0);
        return () => clearTimeout(timer);
    }, [view, filters, currentPage, searchTerm]);

    const loadRequisitions = async () => {
        setLoading(true);
        const offset = (currentPage - 1) * limit;
        const [reqRes, compRes] = await Promise.all([
            fetchRequisitions({ ...filters, searchTerm }, offset, limit),
            companies.length === 0 ? fetchCompanies() : Promise.resolve({ success: true, data: companies })
        ]);

        if (reqRes.success && reqRes.data) {
            setRequisitions(reqRes.data);
            setTotalCount(reqRes.total || 0);
        }
        if (compRes.success && compRes.data && companies.length === 0) {
            setCompanies(compRes.data);
        }
        setLoading(false);
    };

    const handleCreate = () => {
        setSelectedId(undefined);
        setView('form');
    };

    const handleEdit = (id: number) => {
        setSelectedId(id);
        setView('form');
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle2 };
            case 'refused': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle };
            case 'pending': return { color: 'var(--primary)', bg: 'rgba(var(--primary-rgb), 0.1)', icon: Clock };
            case 'pending_approval': return { color: 'var(--primary)', bg: 'rgba(var(--primary-rgb), 0.1)', icon: Clock };
            default: return { color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)', icon: Clock };
        }
    };

    if (view === 'form') {
        return (
            <RequisitionFormPage
                requisitionId={selectedId}
                onBack={() => setView('list')}
                onSuccess={() => {
                    setView('list');
                    loadRequisitions();
                }}
            />
        );
    }

    if (view === 'admin') {
        return (
            <div>
                <button onClick={() => setView('list')} className="btn-secondary" style={{ marginBottom: '1.5rem', padding: '10px' }}>
                    <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} /> Back to Requisitions
                </button>
                <ApprovalRulesManager />
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
                        Requisition Requests
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', fontWeight: 600 }}>
                        Manage and track multi-step purchase and service approvals
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setView('admin')}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                    >
                        <Shield size={18} /> Admin Rules
                    </button>
                    <button
                        onClick={handleCreate}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontWeight: 800, background: 'var(--primary-gradient)', color: '#000' }}
                    >
                        <Plus size={20} /> NEW REQUISITION
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input-field"
                        placeholder="Search by subject, PR number, or project..."
                        style={{ width: '100%', paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'pending', 'approved', 'refused'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilters({ ...filters, status: status === 'all' ? undefined : status })}
                            className={`btn-secondary ${(filters.status === status || (!filters.status && status === 'all')) ? 'active' : ''}`}
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                background: (filters.status === status || (!filters.status && status === 'all')) ? 'var(--primary-glow)' : 'var(--input-bg)'
                            }}
                        >
                            {status.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                    <div className="spinner-large" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    {requisitions.length === 0 ? (
                        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                            <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>No requisitions found</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or create a new request.</p>
                        </div>
                    ) : (
                        requisitions.map((req) => {
                            const status = getStatusStyle(req.request_status);
                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={req.id}
                                    className="card-hover"
                                    onClick={() => handleEdit(req.id)}
                                    style={{
                                        padding: '0.85rem 1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.25rem',
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {/* Status Icon */}
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: status.bg, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: status.color, flexShrink: 0
                                    }}>
                                        <StatusIcon size={20} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>
                                                {req.name || 'DRAFT'}
                                            </span>
                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                {Array.isArray(req.category_id) ? req.category_id[1] : ''}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                                            {req.name || 'Untitled Requisition'}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <Briefcase size={14} /> {Array.isArray(req.x_studio_projects_name) ? req.x_studio_projects_name[1] : 'No Project'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <User size={14} /> {Array.isArray(req.request_owner_id) ? req.request_owner_id[1] : ''}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <Calendar size={14} /> {req.date || '--'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1px' }}>EST. TOTAL</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                            {(() => {
                                                const companyId = Array.isArray(req.company_id) ? req.company_id[0] : req.company_id;
                                                const company = companies.find(c => c.id === companyId);
                                                const symbol = company?.currency_symbol || '$';
                                                return `${symbol} ${(req.x_studio_total_amount || 0).toLocaleString()}`;
                                            })()}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div style={{ color: 'var(--text-muted)' }}>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Pagination Placeholder */}
            {totalCount > limit && (
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="btn-secondary"
                        style={{ padding: '8px 16px' }}
                    >Previous</button>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                        Page {currentPage} of {Math.ceil(totalCount / limit)}
                    </div>
                    <button
                        disabled={currentPage >= Math.ceil(totalCount / limit)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="btn-secondary"
                        style={{ padding: '8px 16px' }}
                    >Next</button>
                </div>
            )}
        </div>
    );
};

export default RequisitionsPage;
