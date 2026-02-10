import React, { useState, useEffect } from 'react';
import {
    LayoutGrid, Settings, Cloud, X, ChevronDown, MoveRight,
    Send, User, Building2, Calendar, Clock, HelpCircle, Loader,
    CheckCircle, AlertCircle
} from 'lucide-react';
import { getUid } from '../../api/odoo';
import { fetchCurrentEmployee, type Employee } from '../../api/EmployeesService';
import { createAttendance } from '../../api/AttendanceService';

interface OnDutyPageProps {
    onBack: () => void;
}

const OnDutyPage: React.FC<OnDutyPageProps> = ({ onBack }) => {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [reasonNote, setReasonNote] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [currentTime] = useState(new Date());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const uid = await getUid();
            const result = await fetchCurrentEmployee(uid);
            if (result.success && result.data) {
                setEmployee(result.data);
            } else {
                setError(result.error || 'Failed to load employee data');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!employee) return;

        setSaving(true);
        setError(null);
        try {
            const checkInStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const values = {
                employee_id: employee.id,
                check_in: checkInStr,
                x_studio_reasonnote: reasonNote,
                x_studio_attendance_mode: 'On Duty',
                x_studio_state: 'Waiting' // Typically "Waiting" or "Submitted" based on image "SEND"
            };

            const result = await createAttendance(values);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => onBack(), 2000);
            } else {
                setError(result.error || 'Failed to submit On Duty status');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit data');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date: Date) => {
        const options: any = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-GB', options).replace(',', '');
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    if (loading) {
        return (
            <div className="on-duty-container loading">
                <Loader className="spin" size={32} />
                <p>Loading employee profile...</p>
            </div>
        );
    }

    return (
        <div className="on-duty-container">
            {/* Header */}
            <header className="on-duty-header">
                <div className="header-left">
                    <LayoutGrid size={18} className="grid-icon" />
                    <h1>On Duty</h1>
                </div>
            </header>

            {/* Sub-header / Breadcrumb Bar */}
            <div className="on-duty-sub-header">
                <div className="sub-header-left">
                    <button className="btn-new">New</button>
                    <div className="timestamp-badge">
                        <span>From {formatTime(currentTime)}</span>
                        <Settings size={14} className="icon-btn" />
                    </div>
                    <Cloud size={18} className="icon-btn" />
                    <X size={18} className="icon-btn" onClick={onBack} />
                </div>
            </div>

            {/* Action Bar */}
            <div className="on-duty-actions">
                <button
                    className={`btn-send ${saving ? 'disabled' : ''}`}
                    onClick={handleSend}
                    disabled={saving}
                >
                    {saving ? <Loader className="spin" size={16} /> : 'SEND'}
                </button>
            </div>

            {/* Form Content */}
            <div className="on-duty-card">
                <div className="form-content">
                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success">
                            <CheckCircle size={18} />
                            <span>On Duty status submitted successfully!</span>
                        </div>
                    )}

                    <div className="field-row">
                        <div className="field-label">Employee <HelpCircle size={12} className="help-icon" /></div>
                        <div className="field-value employee-value">
                            <div className="employee-info">
                                <div className="avatar">
                                    {employee?.image_1920 ? (
                                        <img src={`data:image/png;base64,${employee.image_1920}`} alt={employee.name} />
                                    ) : (
                                        <User size={16} />
                                    )}
                                </div>
                                <span className="employee-name">{employee?.name}</span>
                                <ChevronDown size={14} className="chevron" />
                                <MoveRight size={14} className="arrow-right" />
                            </div>
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field-label">Department <HelpCircle size={12} className="help-icon" /></div>
                        <div className="field-value link-style">
                            {employee?.department_id ? employee.department_id[1] : "-"}
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field-label">Manager <HelpCircle size={12} className="help-icon" /></div>
                        <div className="field-value link-style">
                            {employee?.parent_id ? employee.parent_id[1] : "-"}
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field-label">Check In <HelpCircle size={12} className="help-icon" /></div>
                        <div className="field-value">
                            {formatDate(currentTime)}
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field-label">Check Out <HelpCircle size={12} className="help-icon" /></div>
                        <div className="field-value status-text">
                            Currently Working
                        </div>
                    </div>

                    <div className="field-row vertical">
                        <div className="field-label">Reason/Note <HelpCircle size={12} className="help-icon" /></div>
                        <div className="field-value">
                            <textarea
                                className="note-input"
                                placeholder="Enter reason or notes here..."
                                value={reasonNote}
                                onChange={(e) => setReasonNote(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .on-duty-container {
                    padding: 0;
                    background: #f8fafc;
                    min-height: 100vh;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }

                .on-duty-container.loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    color: #64748b;
                }

                .on-duty-header {
                    padding: 12px 24px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .grid-icon {
                    color: #64748b;
                }

                .on-duty-header h1 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0;
                }

                .on-duty-sub-header {
                    padding: 8px 24px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                }

                .sub-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .btn-new {
                    padding: 6px 16px;
                    border: 1px solid #714b67;
                    background: white;
                    color: #714b67;
                    font-weight: 500;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    cursor: pointer;
                }

                .timestamp-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    color: #1e293b;
                    font-weight: 500;
                }

                .icon-btn {
                    color: #64748b;
                    cursor: pointer;
                }

                .on-duty-actions {
                    padding: 12px 24px;
                }

                .btn-send {
                    padding: 8px 24px;
                    background: #e5e7eb;
                    border: none;
                    color: #1e293b;
                    font-weight: 600;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-send:hover {
                    background: #d1d5db;
                }

                .btn-send.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .on-duty-card {
                    max-width: 800px;
                    margin: 0 24px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    padding: 32px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .form-content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .field-row {
                    display: grid;
                    grid-template-columns: 180px 1fr;
                    align-items: center;
                }

                .field-row.vertical {
                    grid-template-columns: 1fr;
                    align-items: flex-start;
                    gap: 8px;
                }

                .field-label {
                    color: #475569;
                    font-weight: 600;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .help-icon {
                    color: #3b82f6;
                    cursor: help;
                }

                .field-value {
                    font-size: 0.95rem;
                    color: #1e293b;
                }

                .employee-value {
                    border-bottom: 1px solid #008784;
                    padding-bottom: 4px;
                }

                .employee-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .avatar {
                    width: 24px;
                    height: 24px;
                    background: #f1f5f9;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .employee-name {
                    font-weight: 500;
                    color: #1e293b;
                    background: #e0e7ff; /* Blue highlight as in image */
                    padding: 0 4px;
                    border-radius: 2px;
                }

                .chevron {
                    color: #008784;
                    margin-left: auto;
                }

                .arrow-right {
                    color: #64748b;
                }

                .link-style {
                    color: #008784;
                    cursor: pointer;
                }

                .status-text {
                    color: #94a3b8;
                }

                .note-input {
                    width: 100%;
                    min-height: 100px;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    resize: vertical;
                    outline: none;
                }

                .note-input:focus {
                    border-color: #008784;
                }

                .alert {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    margin-bottom: 8px;
                }

                .alert-error {
                    background: #fef2f2;
                    color: #b91c1c;
                    border: 1px solid #fee2e2;
                }

                .alert-success {
                    background: #f0fdf4;
                    color: #15803d;
                    border: 1px solid #dcfce7;
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default OnDutyPage;
