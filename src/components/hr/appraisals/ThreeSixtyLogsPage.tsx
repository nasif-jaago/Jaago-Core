import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Calendar, Eye, Download,
    RefreshCcw, User, Star, TrendingUp,
    Shield, CheckCircle, Clock, X
} from 'lucide-react';
import { AppraisalService } from '../../../api/AppraisalService';
import { useAuth } from '../../../context/AuthContext';

interface ThreeSixtyLogsPageProps {
    onBack?: () => void;
}

const ThreeSixtyLogsPage: React.FC<ThreeSixtyLogsPageProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterTemplate, setFilterTemplate] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await AppraisalService.fetch360FeedbackLogs();
            if (res.success) {
                setLogs(res.data || []);
            }
        } catch (err) {
            console.error('Error loading 360 logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.requested_person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.requested_person_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.feedback_giver_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
        const matchesTemplate = filterTemplate === 'All' || log.template_id === filterTemplate;

        const logDate = new Date(log.submitted_at);
        const matchesDate = (!startDate || logDate >= new Date(startDate)) &&
            (!endDate || logDate <= new Date(endDate));

        return matchesSearch && matchesStatus && matchesTemplate && matchesDate;
    });

    const templates = Array.from(new Set(logs.map(l => l.template_id))).filter(Boolean);

    const role = (user?.user_metadata?.role || 'user').toLowerCase();
    const hasAccess = role === 'admin' || role === 'hr';

    if (!hasAccess) {
        return (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                <Shield size={64} style={{ marginBottom: '24px', opacity: 0.2 }} />
                <h2>Access Denied</h2>
                <p>Only HR or Admin can access these logs.</p>
                {onBack && (
                    <button onClick={onBack} className="btn-secondary" style={{ marginTop: '20px' }}>Go Back</button>
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', color: 'var(--text-main)', background: 'var(--bg-deep)', minHeight: 'calc(100vh - 120px)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {onBack && (
                        <button onClick={onBack} className="btn-icon" style={{ padding: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                            <X size={20} />
                        </button>
                    )}
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>360° Feedback Logs</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Review all submitted peer feedback across the organization</p>
                    </div>
                </div>
                <button onClick={loadLogs} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px' }}>
                    <RefreshCcw size={16} className={loading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 2, minWidth: '300px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by requested person or giver..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '14px', color: '#fff', outline: 'none' }}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ flex: 1, padding: '14px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '14px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="All">All Status</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Pending">Pending</option>
                </select>
                <select
                    value={filterTemplate}
                    onChange={(e) => setFilterTemplate(e.target.value)}
                    style={{ flex: 1, padding: '14px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '14px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="All">All Templates</option>
                    {templates.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '6px 16px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
                    <Calendar size={14} color="var(--primary)" />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '8px', background: 'transparent', border: 'none', color: '#fff', fontSize: '12px', outline: 'none' }} />
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '8px', background: 'transparent', border: 'none', color: '#fff', fontSize: '12px', outline: 'none' }} />
                </div>
            </div>

            {/* Logs Table */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Log ID</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Requested Person</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Feedback Giver</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submission Date</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                                    <RefreshCcw className="spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                    No feedback logs found matching criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 500, color: 'var(--text-dim)' }}>#{log.id.toString().padStart(6, '0')}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{log.requested_person_name}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{log.requested_person_email}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{log.feedback_giver_name}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{log.feedback_giver_email || 'Verified Peer'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px' }}>
                                            <Clock size={14} />
                                            {new Date(log.submitted_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 900 }}>
                                            <CheckCircle size={12} />
                                            SUBMITTED
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-glass)', padding: '8px', borderRadius: '10px', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setSelectedLog(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--primary)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.1), transparent)', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '60px', height: '60px', background: 'var(--input-bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--primary)' }}>
                                        <User size={30} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{selectedLog.requested_person_name}</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{selectedLog.requested_person_email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLog(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                    {/* Positive FEEDBACK */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                            <Star size={20} color="#22c55e" />
                                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>Positive Feedback</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {selectedLog.positive_feedback_points.map((p: string, i: number) => (
                                                <div key={i} style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.1)', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#22c55e', display: 'block', marginBottom: '8px' }}>POINT {i + 1}</span>
                                                    {p || 'Not provided'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* IMPROVE FEEDBACK */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                            <TrendingUp size={20} color="#3b82f6" />
                                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>Needs to Improve</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {selectedLog.improve_feedback_points.map((p: string, i: number) => (
                                                <div key={i} style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#3b82f6', display: 'block', marginBottom: '8px' }}>POINT {i + 1}</span>
                                                    {p || 'Not provided'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Submission Info</p>
                                            <div style={{ display: 'flex', gap: '40px' }}>
                                                <div>
                                                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '4px' }}>Feedback Giver</p>
                                                    <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{selectedLog.feedback_giver_name}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '4px' }}>Date Submitted</p>
                                                    <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{new Date(selectedLog.submitted_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Download size={14} />
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThreeSixtyLogsPage;
