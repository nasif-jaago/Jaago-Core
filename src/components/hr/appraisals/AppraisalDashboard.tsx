import React, { useState, useEffect, useCallback } from 'react';
import {
    PlusCircle, List, Layout, Search, Download,
    Eye, Edit3, Trash2, RefreshCcw,
    CheckCircle, Clock, AlertCircle, FileText, Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AppraisalService, type AppraisalRecord } from '../../../api/AppraisalService';

import AppraisalDemo from './AppraisalDemo';
import AppraisalActive from './AppraisalActive';
import AppraisalAddCycle from './AppraisalAddCycle';
import EmailTemplateBuilder from './EmailTemplateBuilder';

interface AppraisalDashboardProps {
    onSelectStat?: (filter: string) => void;
    initialSubView?: string;
}

const AppraisalDashboard: React.FC<AppraisalDashboardProps> = ({ onSelectStat, initialSubView }) => {
    const [histories, setHistories] = useState<AppraisalRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubTab, setActiveSubTab] = useState('all');
    const [view, setView] = useState<'logs' | 'add-cycle' | 'templates' | 'demo' | 'active'>(
        initialSubView === 'demo' ? 'demo' :
            initialSubView === 'active' ? 'active' : 'logs'
    );
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    useEffect(() => {
        if (initialSubView === 'demo') setView('demo');
        else if (initialSubView === 'active') setView('active');
        else if (initialSubView === 'add-cycle') setView('add-cycle');
        else setView('logs');
    }, [initialSubView]);

    const loadData = useCallback(async () => {
        setLoading(true);
        const res = await AppraisalService.fetchAppraisals('self');
        if (res.success) {
            setHistories(res.data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filteredHistories = histories.filter(h => {
        const matchesSearch = (Array.isArray(h.employee_id) ? h.employee_id[1] : '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.id.toString().includes(searchQuery);

        if (activeSubTab === 'all') return matchesSearch;
        const s = h.state?.toLowerCase();
        if (activeSubTab === 'pending') return matchesSearch && (s === '1_new' || s === 'pending');
        if (activeSubTab === 'sent') return matchesSearch && (s === 'sent' || s === '2_pending');
        return matchesSearch && s === activeSubTab;
    });

    const stats = {
        total: histories.length,
        pending: histories.filter(h => h.state === '1_new' || h.state === 'pending').length,
        submitted: histories.filter(h => h.state === 'submitted').length,
        finalized: histories.filter(h => h.state === '3_done' || h.state === 'finalized').length
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this appraisal record?')) return;
        setIsDeleting(id);
        const res = await AppraisalService.deleteAppraisal('self', id);
        if (res.success) {
            setHistories(prev => prev.filter(h => h.id !== id));
        } else {
            alert('Failed to delete: ' + (res.error || 'Unknown error'));
        }
        setIsDeleting(null);
    };

    const handlePreview = (row: AppraisalRecord) => {
        setPreviewContent(row.note || 'No detailed content available.');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Appraisals Module</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>Manage employee performance cycles and feedback.</p>
                </div>
            </div>

            {/* Smart Buttons - 5 Primary Modules */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                <SmartButton
                    icon={<PlusCircle size={22} />}
                    title="Add Cycle Panel"
                    subtitle="Appraisal setup"
                    active={view === 'add-cycle'}
                    onClick={() => setView('add-cycle')}
                    color="#22c55e"
                />
                <SmartButton
                    icon={<List size={22} />}
                    title="Appraisal Logs"
                    subtitle="Detailed production logs"
                    active={view === 'logs'}
                    onClick={() => setView('logs')}
                    color="#3b82f6"
                />
                <SmartButton
                    icon={<Edit3 size={22} />}
                    title="Template Builder"
                    subtitle="Email editor"
                    active={view === 'templates'}
                    onClick={() => setView('templates')}
                    color="#8b5cf6"
                />
                <SmartButton
                    icon={<Layout size={22} />}
                    title="Appraisal Demo"
                    subtitle="Test System"
                    active={view === 'demo'}
                    onClick={() => setView('demo')}
                    color="#f59e0b"
                />
                <SmartButton
                    icon={<Send size={22} />}
                    title="Appraisal Active"
                    subtitle="Live Production"
                    active={view === 'active'}
                    onClick={() => setView('active')}
                    color="#10b981"
                />
            </div>

            {/* View Switcher Area */}
            {view === 'add-cycle' ? (
                <AppraisalAddCycle
                    onBack={() => setView('logs')}
                    onSuccess={() => setView('logs')}
                    onTestSuccess={() => setView('demo')}
                />
            ) : view === 'templates' ? (
                <EmailTemplateBuilder onBack={() => setView('logs')} />
            ) : view === 'demo' ? (
                <AppraisalDemo />
            ) : view === 'active' ? (
                <AppraisalActive />
            ) : view === 'logs' ? (
                <>
                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        <StatCard title="Total Appraisals" value={stats.total} icon={<FileText size={20} />} color="var(--primary)" onClick={() => onSelectStat?.('all')} />
                        <StatCard title="Pending Action" value={stats.pending} icon={<Clock size={20} />} color="#3b82f6" onClick={() => onSelectStat?.('pending')} />
                        <StatCard title="Submitted" value={stats.submitted} icon={<Send size={20} />} color="#8b5cf6" onClick={() => onSelectStat?.('submitted')} />
                        <StatCard title="Finalized" value={stats.finalized} icon={<CheckCircle size={20} />} color="#22c55e" onClick={() => onSelectStat?.('finalized')} />
                    </div>

                    {/* Logs Table Section */}
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['all', 'draft', 'sent', 'pending', 'submitted', 'review', 'finalized'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveSubTab(t)}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            background: activeSubTab === t ? 'var(--primary)' : 'var(--input-bg)',
                                            border: `1px solid ${activeSubTab === t ? 'var(--primary)' : 'var(--border-glass)'}`,
                                            color: activeSubTab === t ? '#000' : 'var(--text-dim)',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            textTransform: 'capitalize',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search logs..."
                                        style={{
                                            padding: '10px 12px 10px 36px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '12px',
                                            color: 'var(--text-main)',
                                            fontSize: '13px',
                                            width: '240px'
                                        }}
                                    />
                                </div>
                                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                    <Download size={16} /> Export
                                </button>
                                <button onClick={loadData} className="btn-secondary" style={{ padding: '8px 12px' }}>
                                    <RefreshCcw size={16} className={loading ? 'spin' : ''} />
                                </button>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                        <th style={thStyle}>Appraisal ID</th>
                                        <th style={thStyle}>Employee</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Last Update</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistories.map(row => (
                                        <tr key={row.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                            <td style={tdStyle}>
                                                <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>#APR-{row.id.toString().padStart(5, '0')}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#000' }}>
                                                        {(Array.isArray(row.employee_id) ? row.employee_id[1] : 'U').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{Array.isArray(row.employee_id) ? row.employee_id[1] : 'Unknown'}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.display_name?.split(' - ')[0] || 'Unknown Cycle'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <StatusBadge status={row.state || 'draft'} />
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{row.date_close || 'N/A'}</div>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handlePreview(row)} className="btn-icon" title="Preview Summary">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(row.id)} className="btn-icon" title="Delete Log" style={{ color: '#ef4444' }}>
                                                        {isDeleting === row.id ? <RefreshCcw size={14} className="spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredHistories.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No appraisal history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ padding: '80px', textAlign: 'center' }}>
                    <AlertCircle size={48} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dim)' }}>Select a module to begin</h3>
                </div>
            )}

            {/* Preview Modal */}
            {
                previewContent && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '40px'
                    }} onClick={() => setPreviewContent(null)}>
                        <div className="glass-panel" style={{
                            width: '100%', maxWidth: '900px', maxHeight: '90vh',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0,
                            border: '1px solid var(--border-glass)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Appraisal Preview</h2>
                                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>Raw document content from Odoo database</p>
                                </div>
                                <button onClick={() => setPreviewContent(null)} className="btn-icon" style={{ background: 'var(--input-bg)' }}>
                                    <AlertCircle size={18} style={{ transform: 'rotate(45deg)' }} />
                                </button>
                            </div>
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '40px',
                                background: '#fff',
                                color: '#1a1a1a',
                                fontSize: '15px',
                                lineHeight: '1.6'
                            }}>
                                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                            </div>
                            <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-card)', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setPreviewContent(null)} className="btn-primary" style={{ padding: '8px 24px' }}>Close Preview</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const SmartButton: React.FC<{ icon: any, title: string, subtitle: string, onClick?: () => void, active?: boolean, color: string }> = ({ icon, title, subtitle, onClick, active, color }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={onClick}
        className="glass-panel"
        style={{
            padding: '20px',
            cursor: 'pointer',
            borderLeft: `4px solid ${color}`,
            background: active ? 'var(--input-bg)' : 'var(--bg-card)',
            boxShadow: active ? `0 0 20px ${color}20` : 'var(--shadow-3d)'
        }}
    >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>{title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>
            </div>
        </div>
    </motion.div>
);

const StatCard: React.FC<{ title: string, value: number | string, icon: any, color: string, onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <motion.div
        whileHover={onClick ? { y: -5, scale: 1.02, cursor: 'pointer' } : {}}
        onClick={onClick}
        className="glass-panel"
        style={{ padding: '20px', border: '1px solid var(--border-glass)' }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
            <div style={{ color: color }}>{icon}</div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800 }}>{value}</div>
    </motion.div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: any = {
        'draft': { color: '#64748b', label: 'Draft' },
        '1_new': { color: '#f59e0b', label: 'Pending' },
        'pending': { color: '#f59e0b', label: 'Pending' },
        'sent': { color: '#3b82f6', label: 'Sent' },
        '2_pending': { color: '#3b82f6', label: 'Ongoing' },
        'submitted': { color: '#10b981', label: 'Submitted' },
        'review': { color: '#8b5cf6', label: 'Review' },
        '3_done': { color: '#10b981', label: 'Finalized' },
        'finalized': { color: '#10b981', label: 'Finalized' },
        'archived': { color: '#94a3b8', label: 'Archived' },
    };
    const s = config[status.toLowerCase()] || config.draft;
    return (
        <span style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '20px',
            background: `${s.color}15`,
            color: s.color,
            border: `1px solid ${s.color}30`
        }}>
            {s.label.toUpperCase()}
        </span>
    );
};

const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
    padding: '16px',
    fontSize: '14px',
    verticalAlign: 'middle'
};

export default AppraisalDashboard;
