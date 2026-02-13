import React, { useState, useEffect } from 'react';
import {
    Mail, Search, Filter, RefreshCcw, ChevronRight,
    X, Building2, Calendar, User,
    CheckCircle2, Clock, AlertCircle, XCircle
} from 'lucide-react';
import { fetchEmailLogs, fetchCompanies, type EmailLog } from '../../api/EmailsLogService';

const EmailsLogPage: React.FC = () => {
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
    const [lastSync, setLastSync] = useState<string>('');

    const loadData = async () => {
        setLoading(true);
        try {
            const domain: any[] = [];
            if (selectedCompany !== 'all') {
                domain.push(['record_company_id', '=', parseInt(selectedCompany)]);
            }

            const [logsRes, companiesRes] = await Promise.all([
                fetchEmailLogs(domain),
                fetchCompanies()
            ]);

            if (logsRes.success) {
                setLogs(logsRes.data || []);
                setLastSync(logsRes.syncTime);
            } else {
                setError(logsRes.error || 'Failed to fetch logs');
            }

            if (companiesRes.success) {
                setCompanies(companiesRes.data || []);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Auto-refresh every 60 seconds
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, [selectedCompany]);

    const filteredLogs = logs.filter(log =>
    (String(log.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(log.email_to || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusStyle = (state: string) => {
        switch (state) {
            case 'sent':
                return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: <CheckCircle2 size={14} /> };
            case 'outgoing':
                return { bg: 'rgba(245, 197, 24, 0.1)', color: '#f5c518', icon: <Clock size={14} /> };
            case 'exception':
                return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: <AlertCircle size={14} /> };
            case 'cancel':
                return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af', icon: <XCircle size={14} /> };
            default:
                return { bg: 'var(--input-bg)', color: 'var(--text-muted)', icon: <Clock size={14} /> };
        }
    };

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: 'var(--text-main)' }}>Error Loading Logs</h3>
                <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                <button onClick={loadData} className="btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--primary-glow)', borderRadius: '12px' }}>
                            <Mail size={24} color="var(--primary)" />
                        </div>
                        Emails Log
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monitor and track outgoing Odoo communication</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCcw size={12} className={loading ? 'spin' : ''} />
                        Last updated: {new Date(lastSync).toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by subject or recipient..."
                        className="form-input"
                        style={{ paddingLeft: '40px', width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px', position: 'relative' }}>
                    <Filter size={18} color="var(--text-muted)" />
                    <div style={{ position: 'relative', flex: 1 }}>
                        <select
                            className="form-input"
                            style={{
                                width: '100%',
                                background: 'var(--input-bg)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border-glass)',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                paddingRight: '36px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                        >
                            <option value="all" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>All Companies</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronRight
                            size={16}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%) rotate(90deg)',
                                pointerEvents: 'none',
                                color: 'var(--primary)'
                            }}
                        />
                    </div>
                </div>
                <button
                    onClick={loadData}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
                    disabled={loading}
                >
                    <RefreshCcw size={18} className={loading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Table View */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>DATE</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>SUBJECT</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>RECIPIENT</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>COMPANY</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                                    <RefreshCcw className="spin" size={32} color="var(--primary)" />
                                    <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Fetching email logs...</p>
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                                    <Mail size={48} color="var(--text-muted)" style={{ opacity: 0.3 }} />
                                    <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>No email logs found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map(log => {
                                const status = getStatusStyle(log.state);
                                return (
                                    <tr
                                        key={log.id}
                                        onClick={() => setSelectedLog(log)}
                                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
                                        className="table-row-hover"
                                    >
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            {log.date ? new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{log.subject || '(No Subject)'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {log.model && <span>{log.model} #{log.res_id}</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            {log.email_to || 'N/A'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                                <Building2 size={14} color="var(--text-muted)" />
                                                {log.record_company_id ? log.record_company_id[1] : 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: status.bg,
                                                color: status.color,
                                                width: 'fit-content'
                                            }}>
                                                {status.icon}
                                                {log.state.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <ChevronRight size={18} color="var(--text-muted)" />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {selectedLog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div className="card fade-in" style={{
                        width: '100%', maxWidth: '900px', maxHeight: '90vh',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0,
                        border: '1px solid var(--border-glass)'
                    }}>
                        {/* Modal Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--input-bg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ padding: '8px', background: 'var(--primary-glow)', borderRadius: '10px' }}>
                                    <Mail size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Email Details</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{selectedLog.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Subject</p>
                                        <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{selectedLog.subject}</p>
                                    </div>
                                    <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Recipient</p>
                                        <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{selectedLog.email_to}</p>
                                    </div>
                                    <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Sender</p>
                                        <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{selectedLog.email_from}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1, background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Date</p>
                                            <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} />
                                                {new Date(selectedLog.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{ flex: 1, background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Time</p>
                                            <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} />
                                                {new Date(selectedLog.date).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Author</p>
                                        <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <User size={14} />
                                            {selectedLog.author_id ? selectedLog.author_id[1] : 'System'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1, background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Status</p>
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700,
                                                color: getStatusStyle(selectedLog.state).color
                                            }}>
                                                {getStatusStyle(selectedLog.state).icon}
                                                {selectedLog.state.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1, background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Company</p>
                                            <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{selectedLog.record_company_id ? selectedLog.record_company_id[1] : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                                    Email Content
                                </h4>
                                <div
                                    style={{
                                        background: 'var(--bg-deep)',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.6,
                                        minHeight: '200px'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: selectedLog.body_html || '<p style="color: grey">No content available</p>' }}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--input-bg)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
                            {selectedLog.model && (
                                <button className="btn-primary" onClick={() => window.open(`https://jaago-foundation.odoo.com/web#id=${selectedLog.res_id}&model=${selectedLog.model}&view_type=form`, '_blank')}>
                                    View in Odoo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailsLogPage;
