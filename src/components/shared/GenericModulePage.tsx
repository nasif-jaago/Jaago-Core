import React, { useState, useEffect } from 'react';
import { fetchRecords, deleteRecord } from '../../api/odoo';
import type { ModuleConfig } from '../../api/ModuleRegistry';
import {
    ChevronLeft, Plus, Download, Search, Filter,
    Trash2, Edit3, AlertCircle, Calendar as CalendarIcon
} from 'lucide-react';

interface GenericModulePageProps {
    config: ModuleConfig;
    onBack: () => void;
}

const GenericModulePage: React.FC<GenericModulePageProps> = ({ config, onBack }) => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Date Filtering State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadRecords();
    }, [config]);

    const loadRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchRecords(config.model, config.listFields, config.domain || []);
            if (res.success && res.data) {
                setRecords(res.data);
            } else {
                setError(res.error || `Failed to load ${config.displayName}`);
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await deleteRecord(config.model, id);
            setRecords(prev => prev.filter(r => r.id !== id));
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const filteredRecords = records.filter(rec => {
        // Search Term Filter
        const matchesSearch = Object.values(rec).join(' ').toLowerCase().includes(searchTerm.toLowerCase());

        // Date Range Filter
        let matchesDate = true;
        if (config.filterDateField && rec[config.filterDateField]) {
            const recDate = new Date(rec[config.filterDateField]).getTime();
            if (startDate) {
                const start = new Date(startDate).setHours(0, 0, 0, 0);
                if (recDate < start) matchesDate = false;
            }
            if (endDate) {
                const end = new Date(endDate).setHours(23, 59, 59, 999);
                if (recDate > end) matchesDate = false;
            }
        }

        return matchesSearch && matchesDate;
    });

    const renderValue = (field: string, val: any) => {
        if (val === null || val === false) return '--';
        if (Array.isArray(val)) {
            if (val.length === 2 && typeof val[0] === 'number') return val[1]; // Many2one
            return val.join(', '); // Many2many or other arrays
        }

        // Format Decimal Hours (Working Hours)
        if (field === 'worked_hours' && typeof val === 'number') {
            return val.toFixed(2);
        }

        // Handle Odoo Datetime Strings (YYYY-MM-DD HH:MM:SS)
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val)) {
            try {
                const date = new Date(val + ' UTC');
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' (' + date.toLocaleDateString() + ')';
            } catch (e) {
                return val;
            }
        }
        return String(val);
    };

    const getStatusColor = (state: string) => {
        const s = String(state).toLowerCase();
        switch (s) {
            case 'done': case 'posted': case 'validate': return '#22c55e';
            case 'draft': return 'var(--text-muted)';
            case 'cancel': return '#ef4444';
            case 'progress': case 'confirmed': return 'var(--primary)';
            default: return 'var(--primary)';
        }
    };

    // Special renderer for Attendance Status Tags
    const renderAttendanceStatus = (rec: any) => {
        const tags = [];
        if (rec.x_studio_late) tags.push({ label: 'Late', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' });
        if (rec.x_studio_absent) tags.push({ label: 'Absent', bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' });
        if (rec.x_studio_auto_check_out) tags.push({ label: 'Auto Check-out', bg: 'rgba(245, 197, 24, 0.1)', color: 'var(--primary)' });

        if (tags.length === 0) return <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>On Time</span>;

        return (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {tags.map((tag, i) => (
                    <span key={i} style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem',
                        fontWeight: 700, background: tag.bg, color: tag.color,
                        border: `1px solid ${tag.color}44`
                    }}>
                        {tag.label}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'var(--text-main)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={onBack}
                        className="btn-icon"
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                            borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'var(--transition)', boxShadow: 'var(--shadow-3d)'
                        }}
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Odoo / {config.name}</p>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{config.displayName}</h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Create New
                    </button>
                    <button style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Constraints Bar */}
            <div className="card" style={{ padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder={`Search in ${config.displayName}...`}
                        className="input-field"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '40px' }}
                    />
                </div>

                {/* Date Range Filter */}
                {config.filterDateField && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                            <CalendarIcon size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '32px', fontSize: '0.8rem', width: '150px' }}
                                placeholder="Start Date"
                            />
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
                        <div style={{ position: 'relative' }}>
                            <CalendarIcon size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '32px', fontSize: '0.8rem', width: '150px' }}
                                placeholder="End Date"
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}

                <button className="btn-icon" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-glass)' }}>
                    <Filter size={18} />
                </button>
                <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>{filteredRecords.length} Records</span>
            </div>

            {/* Records Table */}
            <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                            <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '16px 24px' }}>Name / Ref</th>
                                {config.listFields
                                    .filter(f => f !== 'name' && f !== 'image_128' && !f.startsWith('x_studio'))
                                    .map(field => (
                                        <th key={field} style={{ padding: '16px', textTransform: 'capitalize' }}>
                                            {field.replace('_id', '').replace('_', ' ')}
                                        </th>
                                    ))}
                                {config.model === 'hr.attendance' && <th style={{ padding: '16px' }}>Status</th>}
                                <th style={{ padding: '16px', width: '80px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td colSpan={config.listFields.length + 2} style={{ padding: '24px' }}>
                                            <div className="pulse" style={{ height: '18px', background: 'var(--input-bg)', borderRadius: '4px' }} />
                                        </td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={config.listFields.length + 2} style={{ padding: '80px', textAlign: 'center' }}>
                                        <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '1rem', opacity: 0.5 }} />
                                        <div style={{ color: '#ef4444', fontWeight: 600 }}>{error}</div>
                                        <button onClick={loadRecords} className="btn-primary" style={{ marginTop: '1rem' }}>Retry Sync</button>
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={config.listFields.length + 2} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No records found for {config.displayName} in this period.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((rec) => (
                                    <tr key={rec.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{rec.name || rec.display_name || `#${rec.id}`}</div>
                                        </td>
                                        {config.listFields
                                            .filter(f => f !== 'name' && f !== 'image_128' && !f.startsWith('x_studio'))
                                            .map((field) => (
                                                <td key={field} style={{ padding: '16px', fontSize: '0.8rem' }}>
                                                    {field === 'state' ? (
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            color: getStatusColor(rec[field]), fontWeight: 700,
                                                            fontSize: '0.7rem', textTransform: 'uppercase'
                                                        }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(rec[field]) }} />
                                                            {rec[field]}
                                                        </div>
                                                    ) : renderValue(field, rec[field])}
                                                </td>
                                            ))}
                                        {config.model === 'hr.attendance' && (
                                            <td style={{ padding: '16px' }}>
                                                {renderAttendanceStatus(rec)}
                                            </td>
                                        )}
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn-icon" style={{ width: '28px', height: '28px' }} title="Edit"><Edit3 size={14} /></button>
                                                <button onClick={() => handleDelete(rec.id)} className="btn-icon" style={{ width: '28px', height: '28px', color: '#ef4444' }} title="Delete"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
        .table-row-hover:hover {
            background: rgba(var(--primary-rgb), 0.02) !important;
        }
        .pulse {
            animation: pulse-bg 1.5s infinite;
        }
        @keyframes pulse-bg {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
        }
        .input-field::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.6;
        }
      `}</style>
        </div>
    );
};

export default GenericModulePage;
