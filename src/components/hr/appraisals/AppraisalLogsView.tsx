import React, { useState, useEffect, useCallback } from 'react';
import {
    Download, Eye, Edit3, Trash2, ArrowLeft,
    RefreshCcw, ChevronLeft, ChevronRight,
    Search as SearchIcon, X
} from 'lucide-react';
import { AppraisalService, type AppraisalRecord } from '../../../api/AppraisalService';

interface AppraisalLogsViewProps {
    onBack: () => void;
    initialFilter?: string;
}

const AppraisalLogsView: React.FC<AppraisalLogsViewProps> = ({ onBack, initialFilter = 'all' }) => {
    const [histories, setHistories] = useState<AppraisalRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilter);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        const res = await AppraisalService.fetchAppraisals('self');
        if (res.success) {
            setHistories(res.data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this appraisal log?')) return;
        setIsDeleting(id);
        const res = await AppraisalService.deleteAppraisal('self', id);
        if (res.success) {
            setHistories(prev => prev.filter(h => h.id !== id));
        } else {
            alert('Failed to delete appraisal: ' + (res.error || 'Unknown error'));
        }
        setIsDeleting(null);
    };

    const handleEdit = (id: number) => {
        // Build the URL for the editor
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('view', 'appraisal-editor');
        url.searchParams.set('id', id.toString());
        url.searchParams.set('tab', 'self');

        // Navigation that App.tsx will pick up on reload
        window.location.href = url.toString();
    };

    const filteredRecords = histories.filter(h => {
        const matchesSearch = (Array.isArray(h.employee_id) ? h.employee_id[1] : '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.id.toString().includes(searchQuery);

        const s = h.state?.toLowerCase();
        let matchesStatus = statusFilter === 'all';
        if (statusFilter === 'pending') {
            matchesStatus = (s === '1_new' || s === 'pending');
        } else if (statusFilter === 'finalized') {
            matchesStatus = (s === '3_done' || s === 'finalized');
        } else if (statusFilter === 'submitted') {
            matchesStatus = (s === 'submitted');
        } else if (statusFilter === 'sent') {
            matchesStatus = (s === 'sent');
        } else if (!matchesStatus) {
            matchesStatus = (s === statusFilter);
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Full Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="btn-icon">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Detailed Appraisal Logs</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Full history and status of all employee appraisals.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => {
                            const csv = [
                                ['Appraisal ID', 'Employee', 'Department', 'Status', 'Date'],
                                ...filteredRecords.map(r => [r.id, Array.isArray(r.employee_id) ? r.employee_id[1] : '', r.department_id ? (Array.isArray(r.department_id) ? r.department_id[1] : r.department_id) : '', r.state, r.date_close])
                            ].map(e => e.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `Appraisal_Logs_${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                        }}
                        className="btn-golden-3d"
                    >
                        <Download size={16} /> Export to Excel
                    </button>
                    <button onClick={loadData} className="btn-golden-3d" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCcw size={16} className={loading ? 'spin' : ''} /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <SearchIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by ID or Employee..."
                            style={{
                                padding: '10px 12px 10px 36px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '12px',
                                color: 'var(--text-main)',
                                fontSize: '13px',
                                width: '300px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input"
                            style={{
                                padding: '8px 12px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                fontSize: '13px',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="sent">Sent</option>
                            <option value="submitted">Submitted</option>
                            <option value="finalized">Finalized</option>
                        </select>
                    </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                    Showing <b>{filteredRecords.length}</b> of {histories.length} records
                </div>
            </div>

            {/* Large Table */}
            <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10, backdropFilter: 'blur(10px)' }}>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <th style={thStyle}>Appraisal ID</th>
                                <th style={thStyle}>Employee Name</th>
                                <th style={thStyle}>Department</th>
                                <th style={thStyle}>Reporting Manager</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Submission Date</th>
                                <th style={thStyle}>Rating Summary</th>
                                <th style={thStyle}>Final Recommendation</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-dim)' }}>
                                        {loading ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                <RefreshCcw size={32} className="spin" color="var(--primary)" />
                                                <span>Loading appraisal records...</span>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                <X size={32} color="#ef4444" />
                                                <span>No appraisal records found. Try adjusting your filters or refreshing.</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : filteredRecords.map(row => (
                                <tr key={row.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s ease' }}>
                                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontWeight: 700, opacity: 0.8 }}>#APR-{row.id}</span></td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{Array.isArray(row.employee_id) ? row.employee_id[1] : 'Unknown'}</div>
                                    </td>
                                    <td style={tdStyle}>{row.department_id ? (Array.isArray(row.department_id) ? row.department_id[1] : row.department_id) : '—'}</td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                                            {Array.isArray(row.manager_ids) && row.manager_ids.length > 0
                                                ? row.manager_ids.join(', ') // Odoo search_read usually returns array of [id, name] for Many2many
                                                : '—'}
                                        </div>
                                    </td>
                                    <td style={tdStyle}><StatusBadge status={row.state || 'draft'} /></td>
                                    <td style={tdStyle}>{row.date_close || '—'}</td>
                                    <td style={tdStyle}>
                                        {row.final_rating ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '15px' }}>{row.final_rating}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/ 5</span>
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px' }}>
                                            {row.x_studio_remarks || 'Pending Review'}
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn-icon"
                                                title="Open in New Tab"
                                                onClick={() => window.open(`/appraisal/${row.id}`, '_blank')}
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                title="Edit"
                                                onClick={() => handleEdit(row.id)}
                                            >
                                                <Edit3 size={14} style={{ color: '#3b82f6' }} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                title="Download PDF"
                                                onClick={() => alert('PDF Generation Coming Soon')}
                                            >
                                                <Download size={14} style={{ color: '#22c55e' }} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                title="Delete"
                                                disabled={isDeleting === row.id}
                                                onClick={() => handleDelete(row.id)}
                                            >
                                                {isDeleting === row.id ? (
                                                    <RefreshCcw size={14} className="spin" />
                                                ) : (
                                                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rows per page: <b>15</b></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Page 1 of {Math.ceil(filteredRecords.length / 15) || 1}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button disabled className="btn-icon" style={{ width: '32px', height: '32px', opacity: 0.5 }}><ChevronLeft size={16} /></button>
                            <button disabled className="btn-icon" style={{ width: '32px', height: '32px', opacity: 0.5 }}><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewContent && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px'
                }} onClick={() => setPreviewContent(null)}>
                    <div className="glass-panel" style={{
                        width: '100%', maxWidth: '900px', maxHeight: '100%',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Appraisal Preview</h2>
                            <button onClick={() => setPreviewContent(null)} className="btn-icon"><X size={18} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', background: '#fff', color: '#1a1a1a' }}>
                            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: any = {
        'draft': { color: '#64748b', label: 'Draft' },
        '1_new': { color: '#f59e0b', label: 'Pending' },
        'sent': { color: '#3b82f6', label: 'Sent' },
        'submitted': { color: '#10b981', label: 'Submitted' },
        '3_done': { color: '#10b981', label: 'Finalized' },
    };
    const s = config[status.toLowerCase()] || config.draft;
    return (
        <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
            {s.label.toUpperCase()}
        </span>
    );
};

const thStyle: React.CSSProperties = {
    padding: '16px',
    fontSize: '13px',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: '14px',
    color: 'var(--text-main)'
};

export default AppraisalLogsView;
