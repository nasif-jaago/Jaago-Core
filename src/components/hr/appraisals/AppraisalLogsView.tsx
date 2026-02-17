import React, { useState, useEffect, useCallback } from 'react';
import {
    Download, Eye, Edit3, Trash2, ArrowLeft,
    RefreshCcw, ChevronLeft, ChevronRight,
    Search as SearchIcon, X, FileText
} from 'lucide-react';
import { AppraisalService, type AppraisalRecord } from '../../../api/AppraisalService';
import { FormBuilderService } from '../../../api/FormBuilderService';

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
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [statusEditRecord, setStatusEditRecord] = useState<AppraisalRecord | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        const [appraisalRes, submissionData, employeeRes] = await Promise.all([
            AppraisalService.fetchAppraisals('self'),
            AppraisalService.getActiveSubmissions(),
            AppraisalService.fetchEmployees()
        ]);

        if (appraisalRes.success) {
            setHistories(appraisalRes.data || []);
        }
        setSubmissions(submissionData || []);
        setEmployees(employeeRes.success ? employeeRes.data || [] : []);
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        if (initialFilter) {
            setStatusFilter(initialFilter);
        }
    }, [initialFilter]);

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

    const handleEdit = (record: AppraisalRecord) => {
        setStatusEditRecord(record);
    };

    const updateStatus = async (newStatus: string) => {
        if (!statusEditRecord) return;
        setIsUpdatingStatus(true);
        const res = await AppraisalService.updateAppraisal('self', statusEditRecord.id, { state: newStatus });
        if (res.success) {
            setHistories(prev => prev.map(h => h.id === statusEditRecord.id ? { ...h, state: newStatus } : h));

            // Log the action
            await AppraisalService.logActiveAction({
                appraisal_id: statusEditRecord.id,
                action_type: 'Status Changed',
                details: `Status manually updated to ${newStatus}`,
                status: 'success'
            });

            setStatusEditRecord(null);
        } else {
            alert('Failed to update status: ' + (res.error || 'Unknown error'));
        }
        setIsUpdatingStatus(false);
    };

    const handlePrintPDF = (row: AppraisalRecord) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const empName = Array.isArray(row.employee_id) ? row.employee_id[1] : 'Unknown';
        const dept = row.department_id ? (Array.isArray(row.department_id) ? row.department_id[1] : row.department_id) : '—';
        const sub = submissions.find(s => s.appraisal_id === row.id);

        printWindow.document.write(`
            <html>
                <head>
                    <title>Appraisal Report - #APR-${row.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #1e293b; }
                        .header { border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                        .label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; }
                        .value { font-size: 16px; margin-top: 4px; }
                        h1 { margin: 0; color: #0f172a; }
                        .responses { margin-top: 40px; }
                        .question-box { margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; }
                        .q-text { font-weight: bold; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Appraisal Performance Report</h1>
                        <p>ID: #APR-${row.id} | Generated: ${new Date().toLocaleString()}</p>
                    </div>
                    <div class="info-grid">
                        <div>
                            <div class="label">Employee Name</div>
                            <div class="value">${empName}</div>
                        </div>
                        <div>
                            <div class="label">Department</div>
                            <div class="value">${dept}</div>
                        </div>
                        <div>
                            <div class="label">Status</div>
                            <div class="value">${row.state}</div>
                        </div>
                        <div>
                            <div class="label">Submission Date</div>
                            <div class="value">${row.date_close || 'N/A'}</div>
                        </div>
                    </div>
                    <div class="responses">
                        <h2>Form Responses</h2>
                        ${sub ? Object.entries(sub.responses).map(([q, val]) => `
                            <div class="question-box">
                                <div class="q-text">${q}</div>
                                <div>${Array.isArray(val) ? val.join(', ') : val}</div>
                            </div>
                        `).join('') : '<p>No detailed form responses found.</p>'}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const filteredRecords = histories.filter(h => {
        const matchesSearch = (Array.isArray(h.employee_id) ? h.employee_id[1] : '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.id.toString().includes(searchQuery);

        const state = h.state?.toString().toLowerCase().trim() || 'draft';
        let matchesStatus = statusFilter === 'all';

        if (statusFilter === 'pending') {
            matchesStatus = (state === 'pending' || state === '1_new' || state === 'draft');
        } else if (statusFilter === 'sent') {
            matchesStatus = (state === 'sent');
        } else if (statusFilter === 'submitted') {
            matchesStatus = (state === 'submitted' || state === '2_pending');
        } else if (statusFilter === 'finalized') {
            matchesStatus = (state === 'finalized' || state === 'done' || state === '3_done');
        } else if (statusFilter !== 'all') {
            matchesStatus = (state === statusFilter);
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
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['all', 'pending', 'sent', 'submitted', 'finalized'].map(t => (
                            <button
                                key={t}
                                onClick={() => setStatusFilter(t)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '12px',
                                    background: statusFilter === t ? 'var(--primary-gradient)' : 'var(--input-bg)',
                                    border: `1px solid ${statusFilter === t ? 'transparent' : 'var(--border-glass)'}`,
                                    color: statusFilter === t ? '#000' : 'var(--text-dim)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 800,
                                    textTransform: 'capitalize',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: statusFilter === t ? '0 10px 15px -3px rgba(34, 197, 94, 0.3)' : 'none'
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                                width: '280px'
                            }}
                        />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <span style={{ color: 'var(--primary)' }}>{filteredRecords.length}</span> Results
                    </div>
                </div>
            </div>

            {/* Large Table */}
            <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
                <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-card)' }}>
                    <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#0f172a', zIndex: 10 }}>
                            <tr style={{ borderBottom: '2px solid var(--border-glass)' }}>
                                <th style={{ ...thStyle, width: '100px' }}>ID</th>
                                <th style={{ ...thStyle, width: '180px' }}>Employee</th>
                                <th style={{ ...thStyle, width: '140px' }}>Dept</th>
                                <th style={{ ...thStyle, width: '180px' }}>Manager</th>
                                <th style={{ ...thStyle, width: '120px' }}>Status</th>
                                <th style={{ ...thStyle, width: '130px' }}>Date</th>
                                <th style={{ ...thStyle, width: '180px' }}>Form</th>
                                <th style={{ ...thStyle, width: '180px' }}>Remarks</th>
                                <th style={{ ...thStyle, width: '140px', textAlign: 'right' }}>Actions</th>
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
                                <tr
                                    key={row.id}
                                    className="table-row-hover"
                                    style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s ease', cursor: 'pointer' }}
                                    onClick={async () => {
                                        const sub = submissions.find(s => s.appraisal_id === row.id);
                                        if (sub) {
                                            setLoading(true);
                                            const formRes = await FormBuilderService.fetchFormById(sub.form_id);
                                            const fullSub = { ...sub, full_form: formRes.success ? formRes.data : null };
                                            setSelectedSubmission(fullSub);
                                            setLoading(false);
                                        } else {
                                            alert('No detailed form submission found for this record.');
                                        }
                                    }}
                                >
                                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontWeight: 700, opacity: 0.8 }}>#APR-{row.id}</span></td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{Array.isArray(row.employee_id) ? row.employee_id[1] : 'Unknown'}</div>
                                    </td>
                                    <td style={tdStyle}>{row.department_id ? (Array.isArray(row.department_id) ? row.department_id[1] : row.department_id) : '—'}</td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                                            {(() => {
                                                const empId = Array.isArray(row.employee_id) ? row.employee_id[0] : row.employee_id;
                                                const employee = employees.find(e => e.id === empId);
                                                if (!employee || !employee.parent_id) return '—';

                                                // Odoo parent_id is usually [id, name]
                                                return Array.isArray(employee.parent_id) ? employee.parent_id[1] : employee.parent_id;
                                            })()}
                                        </div>
                                    </td>
                                    <td style={tdStyle}><StatusBadge status={row.state || 'draft'} /></td>
                                    <td style={tdStyle}>{row.date_close || '—'}</td>
                                    <td style={tdStyle}>
                                        {(() => {
                                            const isSubmitted = row.state === '2_pending' || row.state === 'submitted';
                                            const formTitle = submissions.find(s => s.appraisal_id === row.id)?.form_title || (isSubmitted ? 'Form Submitted' : '—');
                                            return (
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: isSubmitted ? '#39FF14' : 'var(--text-dim)',
                                                    fontWeight: isSubmitted ? 900 : 600,
                                                    textShadow: isSubmitted ? '0 0 10px rgba(57, 255, 20, 0.5)' : 'none',
                                                    background: isSubmitted ? 'rgba(57, 255, 20, 0.05)' : 'transparent',
                                                    padding: isSubmitted ? '4px 8px' : '0',
                                                    borderRadius: '4px',
                                                    display: 'inline-block'
                                                }}>
                                                    {formTitle}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px' }}>
                                            {row.x_studio_remarks || 'Pending Review'}
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            {submissions.some(s => s.appraisal_id === row.id) && (
                                                <button
                                                    className="btn-icon"
                                                    title="View Form Submission"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const sub = submissions.find(s => s.appraisal_id === row.id);
                                                        if (sub) {
                                                            setLoading(true);
                                                            const formRes = await FormBuilderService.fetchFormById(sub.form_id);
                                                            const fullSub = { ...sub, full_form: formRes.success ? formRes.data : null };
                                                            setSelectedSubmission(fullSub);
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                                                >
                                                    <FileText size={14} style={{ color: '#22c55e' }} />
                                                </button>
                                            )}
                                            <button
                                                className="btn-icon"
                                                title="Open in New Tab"
                                                onClick={(e) => { e.stopPropagation(); window.open(`/appraisal/${row.id}`, '_blank'); }}
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                title="Edit Status"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
                                            >
                                                <Edit3 size={14} style={{ color: '#3b82f6' }} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                title="Print PDF"
                                                onClick={(e) => { e.stopPropagation(); handlePrintPDF(row); }}
                                            >
                                                <Download size={14} style={{ color: '#22c55e' }} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                title="Delete"
                                                disabled={isDeleting === row.id}
                                                onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
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
                            {filteredRecords.length === 0 && (
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
                            )}
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
                <div style={modalOverlayStyle} onClick={() => setPreviewContent(null)}>
                    <div className="glass-panel" style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <div style={modalHeaderStyle}>
                            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Appraisal Preview</h2>
                            <button onClick={() => setPreviewContent(null)} className="btn-icon"><X size={18} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', background: '#fff', color: '#1a1a1a' }}>
                            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Details Modal */}
            {selectedSubmission && (
                <div style={modalOverlayStyle} onClick={() => setSelectedSubmission(null)}>
                    <div className="glass-panel" style={{ ...modalContentStyle, background: 'var(--bg-deep)' }} onClick={e => e.stopPropagation()}>
                        <div style={modalHeaderStyle}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Form Submission Details</h2>
                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>{selectedSubmission.form_title} • Case #APR-{selectedSubmission.appraisal_id}</p>
                            </div>
                            <button onClick={() => setSelectedSubmission(null)} className="btn-icon"><X size={18} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {selectedSubmission.full_form?.questions ? (
                                selectedSubmission.full_form.questions.map((q: any) => {
                                    const answer = selectedSubmission.responses[q.id];
                                    if (answer === undefined) return null;
                                    return (
                                        <div key={q.id} className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface)' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>{q.label}</div>
                                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                                                {Array.isArray(answer) ? (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                                        {answer.map(v => <span key={v} style={{ background: 'var(--input-bg)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>{v}</span>)}
                                                    </div>
                                                ) : (
                                                    <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{answer}</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                Object.entries(selectedSubmission.responses).map(([qId, val]: [string, any]) => (
                                    <div key={qId} className="glass-panel" style={{ padding: '20px', background: 'var(--bg-surface)' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase' }}>Question: {qId}</div>
                                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            {Array.isArray(val) ? (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                                    {val.map(v => <span key={v} style={{ background: 'var(--input-bg)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>{v}</span>)}
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{val}</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-surface)' }}>
                            <button onClick={() => setSelectedSubmission(null)} className="btn-golden-3d" style={{ padding: '10px 24px' }}>Close View</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Status Edit Modal */}
            {statusEditRecord && (
                <div style={modalOverlayStyle} onClick={() => setStatusEditRecord(null)}>
                    <div className="glass-panel" style={{ width: '400px', padding: '32px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Update Status</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '24px' }}>Change appraisal status for {Array.isArray(statusEditRecord.employee_id) ? statusEditRecord.employee_id[1] : 'Employee'}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {['draft', 'sent', 'submitted', 'pending', 'finalized'].map(s => (
                                <button
                                    key={s}
                                    disabled={isUpdatingStatus}
                                    onClick={() => updateStatus(
                                        s === 'pending' ? '1_new' :
                                            (s === 'finalized' ? '3_done' :
                                                (s === 'submitted' ? '2_pending' : s))
                                    )}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border-glass)',
                                        color: '#fff',
                                        textAlign: 'left',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                                >
                                    <span style={{ textTransform: 'capitalize' }}>{s}</span>
                                    {isUpdatingStatus && statusEditRecord.state === s && <RefreshCcw size={14} className="spin" />}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStatusEditRecord(null)}
                            style={{ width: '100%', marginTop: '24px', padding: '12px', borderRadius: '10px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontWeight: 800, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px'
};

const modalContentStyle: React.CSSProperties = {
    width: '100%', maxWidth: '900px', maxHeight: '100%',
    display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0
};

const modalHeaderStyle: React.CSSProperties = {
    padding: '20px 32px', borderBottom: '1px solid var(--border-glass)', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)'
};

const STATUS_CONFIG: any = {
    'draft': { color: '#94a3b8', label: 'Draft' },
    '1_new': { color: '#f59e0b', label: 'Pending' },
    'sent': { color: '#3b82f6', label: 'Sent' },
    '2_pending': { color: '#10b981', label: 'Submitted' },
    'submitted': { color: '#10b981', label: 'Submitted' },
    '3_done': { color: 'var(--primary)', label: 'Finalized' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = STATUS_CONFIG[status.toLowerCase()] || { color: '#64748b', label: status };
    return (
        <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
            {s.label.toUpperCase()}
        </span>
    );
};

const thStyle: React.CSSProperties = {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '2px solid var(--primary)',
    textAlign: 'left',
    whiteSpace: 'nowrap'
};

const tdStyle: React.CSSProperties = {
    padding: '12px 20px',
    fontSize: '13px',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};

export default AppraisalLogsView;
