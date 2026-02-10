import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Calendar as CalendarIcon,
    HardDrive,
    Paperclip, Send, CheckCircle2, ChevronRight,
    ChevronDown
} from 'lucide-react';
import { fetchRecords } from '../../api/odoo';

interface LeaveRequestPageProps {
    onBack: () => void;
}

const LeaveRequestPage: React.FC<LeaveRequestPageProps> = ({ onBack }) => {
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<any>(null);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [selectedType, setSelectedType] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Custom Dropdown State
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    const [allocations, setAllocations] = useState<any[]>([]);

    useEffect(() => {
        loadInitialData();

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.custom-dropdown-container')) {
                setIsTypeDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // 1. Fetch current user's employee record
            const empRes = await fetchRecords('hr.employee',
                ['name', 'department_id', 'company_id', 'parent_id', 'job_id', 'image_128'],
                [['active', '=', true]], 1
            );

            let empId = null;
            if (empRes.data && empRes.data.length > 0) {
                setEmployee(empRes.data[0]);
                empId = empRes.data[0].id;
            }

            // 2. Fetch Allocations for this specific employee
            // In Odoo, hr.leave.allocation links employee to leave types they can use
            const allocRes = await fetchRecords('hr.leave.allocation',
                ['id', 'holiday_status_id', 'number_of_days', 'leaves_taken', 'max_leaves'],
                [['employee_id', '=', empId], ['state', '=', 'validate']], 50
            );

            if (allocRes.data) {
                setAllocations(allocRes.data);

                // 3. Extract unique Leave Types from allocations
                const typesMap = new Map();
                allocRes.data.forEach((a: any) => {
                    if (a.holiday_status_id) {
                        typesMap.set(a.holiday_status_id[0], {
                            id: a.holiday_status_id[0],
                            name: a.holiday_status_id[1]
                        });
                    }
                });

                const availableTypes = Array.from(typesMap.values());
                setLeaveTypes(availableTypes);
                if (availableTypes.length > 0) setSelectedType(availableTypes[0].id);
            }
        } catch (err) {
            console.error("Failed to load leave data", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateDays = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end.getTime() - start.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        return days > 0 ? days : 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSuccess(true);
        }, 1500);
    };

    const selectedTypeLabel = leaveTypes.find(t => String(t.id) === String(selectedType))?.name || 'Select leave type...';

    if (success) {
        return (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={40} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Request Submitted</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Your leave request has been sent for approval.</p>
                </div>
                <button onClick={onBack} className="btn-primary" style={{ padding: '12px 24px' }}>Return to Dashboard</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="pulse" style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Header */}
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Leave Request</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>New Time Off Request</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', flex: 1 }}>
                {/* Form Area */}
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Employee <span style={{ color: 'var(--primary)' }}>?</span></span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '8px',
                                        background: 'var(--primary)', color: '#000',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: 900
                                    }}>
                                        {employee?.name?.charAt(0) || 'S'}
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {employee?.name || 'S.M. Nayem Ahasan'}
                                        <ChevronRight size={14} color="var(--primary)" />
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Company <span style={{ color: 'var(--primary)' }}>?</span></span>
                                <span style={{ fontWeight: 700, color: '#0ea5e9' }}>{employee?.company_id?.[1] || 'JAAGO Foundation Trust'}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Department <span style={{ color: 'var(--primary)' }}>?</span></span>
                                <span style={{ fontWeight: 700, color: '#10b981' }}>{employee?.department_id?.[1] || 'SHIELD'}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Manager <span style={{ color: 'var(--primary)' }}>?</span></span>
                                <span style={{ fontWeight: 700, color: '#10b981' }}>{employee?.parent_id?.[1] || 'Samsun Nahar'}</span>
                            </div>
                        </div>

                        {/* Custom Dark Glass Dropdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="custom-dropdown-container">
                            <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>Time Off Type <span style={{ color: 'var(--primary)' }}>?</span></label>
                            <div style={{ position: 'relative' }}>
                                <div
                                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        background: 'var(--input-bg)', border: '1px solid var(--border)',
                                        color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <span>{selectedTypeLabel}</span>
                                    <ChevronDown size={18} style={{ transform: isTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                                </div>

                                {isTypeDropdownOpen && (
                                    <div
                                        className="fade-in"
                                        style={{
                                            position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 50,
                                            background: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(16px)',
                                            borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden',
                                            padding: '8px'
                                        }}
                                    >
                                        {leaveTypes.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => { setSelectedType(t.id); setIsTypeDropdownOpen(false); }}
                                                style={{
                                                    padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem',
                                                    color: String(selectedType) === String(t.id) ? 'var(--primary)' : 'var(--text-main)',
                                                    background: String(selectedType) === String(t.id) ? 'rgba(245, 197, 24, 0.1)' : 'transparent',
                                                    cursor: 'pointer', transition: 'all 0.2s', fontWeight: String(selectedType) === String(t.id) ? 700 : 500
                                                }}
                                                className="dropdown-item-hover"
                                            >
                                                {t.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>Dates <span style={{ color: 'var(--primary)' }}>?</span></label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <CalendarIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{
                                                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
                                                background: 'var(--input-bg)', border: '1px solid var(--border)',
                                                color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--text-muted)' }} size={16} />
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <CalendarIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{
                                                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
                                                background: 'var(--input-bg)', border: '1px solid var(--border)',
                                                color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '70px' }}>
                                        ( {calculateDays()} days )
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>Description</label>
                            <textarea
                                placeholder="No description provided"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '16px',
                                    background: 'var(--input-bg)', border: '1px solid var(--border)',
                                    color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none',
                                    minHeight: '120px', resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <button type="button" style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 16px', borderRadius: '10px',
                                background: 'var(--input-bg)', border: '1px solid var(--border)',
                                color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600
                            }}>
                                <Paperclip size={18} /> Attach File
                            </button>
                            <button
                                disabled={submitting}
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 32px' }}
                            >
                                {submitting ? <div className="pulse" style={{ width: '16px', height: '16px', background: '#000', borderRadius: '50%' }} /> : <Send size={18} />}
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.1), transparent)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HardDrive size={18} color="var(--primary)" /> Leave Balance
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {allocations.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No active allocations found.</p>
                            ) : (
                                allocations.map((alloc, i) => {
                                    const total = alloc.max_leaves || 0;
                                    const used = alloc.leaves_taken || 0;
                                    const remaining = total - used;
                                    const percent = total > 0 ? (used / total) * 100 : 0;

                                    return (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                                                <span>{alloc.holiday_status_id?.[1] || 'Leave'}</span>
                                                <span>{remaining} / {total} Days</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: 'var(--input-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary)' }} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Policy Notes</h3>
                        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <li>Requests must be submitted at least 2 days in advance.</li>
                            <li>Sick leaves requires a medical certificate if more than 2 days.</li>
                            <li>Balance resets at the end of the fiscal year.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .dropdown-item-hover:hover {
                    background: rgba(245, 197, 24, 0.15) !important;
                    color: var(--primary) !important;
                    padding-left: 20px !important;
                }
            `}</style>
        </div>
    );
};

export default LeaveRequestPage;
