import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Download, Eye, Edit3, Trash2,
    CheckCircle2, FileText,
    RefreshCcw, Search as SearchIcon
} from 'lucide-react';
import { FormBuilderService } from '../../../api/FormBuilderService';
import { motion, AnimatePresence } from 'framer-motion';

const FormListView: React.FC<{
    onCreateNew: () => void;
    onEdit: (id: string) => void;
    onViewLogs: (id: string) => void;
}> = ({ onCreateNew, onEdit, onViewLogs }) => {
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await FormBuilderService.fetchForms();
        if (res.success) setForms(res.data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this form?')) return;
        const res = await FormBuilderService.deleteForm(id);
        if (res.success) setForms(forms.filter(f => f.id !== id));
    };

    const filteredForms = forms.filter(f => {
        const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>Form Builder Module</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>Create, manage and track internal surveys and appraisals.</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="btn-primary"
                    style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                    <Plus size={18} /> CREATE NEW FORM
                </button>
            </div>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <StatCard title="Total Forms" value={forms.length} icon={<FileText size={20} />} color="var(--primary)" />
                <StatCard title="Published" value={forms.filter(f => f.status === 'published').length} icon={<CheckCircle2 size={20} />} color="#22c55e" />
                <StatCard title="Drafts" value={forms.filter(f => f.status === 'draft').length} icon={<Edit3 size={20} />} color="#f59e0b" />
                <StatCard title="Total Responses" value={1240} icon={<RefreshCcw size={20} />} color="#3b82f6" />
            </div>

            {/* TABLE ACTIONS */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <SearchIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search forms..."
                                className="form-input"
                                style={{ paddingLeft: '36px', width: '300px' }}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-input"
                            style={{ width: '160px' }}
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={loadData} className="btn-secondary" style={{ padding: '10px' }}>
                            <RefreshCcw size={18} className={loading ? 'spin' : ''} />
                        </button>
                        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px' }}>
                            <Download size={16} /> Export List
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <th style={thStyle}>Form Name</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Responses</th>
                                <th style={thStyle}>Created By</th>
                                <th style={thStyle}>Last Updated</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredForms.map((f) => (
                                    <motion.tr
                                        key={f.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="table-row-hover"
                                        style={{ borderBottom: '1px solid var(--border-glass)' }}
                                    >
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                                    <FileText size={18} />
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: '14px' }}>{f.title}</div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: 800,
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: f.status === 'published' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                color: f.status === 'published' ? '#22c55e' : '#f59e0b',
                                                textTransform: 'uppercase'
                                            }}>{f.status}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                                <RefreshCcw size={14} color="var(--text-dim)" /> 24
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, color: '#000' }}>HR</div>
                                                Admin User
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{new Date(f.updated_at).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => onEdit(f.id)} className="btn-icon" title="Edit Form"><Edit3 size={14} /></button>
                                                <button onClick={() => window.open(`/?view=form-preview&id=${f.id}`)} className="btn-icon" title="Preview"><Eye size={14} /></button>
                                                <button onClick={() => onViewLogs(f.id)} className="btn-icon" title="View Logs"><Search size={14} /></button>
                                                <button onClick={() => handleDelete(f.id)} className="btn-icon" style={{ color: '#ef4444' }} title="Delete"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredForms.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        No forms found. Create one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string, value: string | number, icon: any, color: string }> = ({ title, value, icon, color }) => (
    <div className="glass-panel" style={{ padding: '24px', borderLeft: `4px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</span>
            <div style={{ color: color }}>{icon}</div>
        </div>
        <div style={{ fontSize: '28px', fontWeight: 900 }}>{value}</div>
    </div>
);

const thStyle: React.CSSProperties = { padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle: React.CSSProperties = { padding: '16px', verticalAlign: 'middle' };

export default FormListView;
