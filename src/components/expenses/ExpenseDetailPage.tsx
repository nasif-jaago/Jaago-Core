import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Edit3, Save, X, Loader, CheckCircle, XCircle,
    Send, Trash2, Calendar, DollarSign, User, FileText, Building2
} from 'lucide-react';
import {
    fetchExpenseById,
    submitExpense,
    approveExpense,
    refuseExpense,
    deleteExpense,
    type Expense
} from '../../api/ExpensesService';
import { writeRecord } from '../../api/odoo';

interface ExpenseDetailPageProps {
    expenseId: number;
    onBack: () => void;
    onUpdate: () => void;
}

const REQUISITION_TYPES_LABELS: Record<string, string> = {
    'Option 1': 'Travel Authorization',
    'Option 1-Advance': 'Travel Advance Request form',
    'Option 2': 'Travel Liquidation form & per diem calculation',
    'Conveyance bill form': 'Conveyance bill form',
    'Option 2-Expense': 'Expense Liquidation Form',
    'Operational budget': 'Operational budget'
};

const ExpenseDetailPage: React.FC<ExpenseDetailPageProps> = ({ expenseId, onBack, onUpdate }) => {
    const [expense, setExpense] = useState<Expense | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadExpenseDetails();
    }, [expenseId]);

    const loadExpenseDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchExpenseById(expenseId);
            if (result.success && result.data) {
                setExpense(result.data);
                setEditedData(result.data);
            } else {
                setError(result.error || 'Failed to load expense details');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!expense) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Prepare update payload - only changed fields
            const updates: any = {};
            Object.keys(editedData).forEach(key => {
                if (editedData[key] !== expense[key]) {
                    updates[key] = editedData[key];
                }
            });

            if (Object.keys(updates).length === 0) {
                setEditMode(false);
                return;
            }

            await writeRecord('hr.expense', expense.id, updates);

            setSuccess('Expense updated successfully!');
            setEditMode(false);
            loadExpenseDetails();
            onUpdate();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update expense');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!expense) return;
        setProcessing(true);
        setError(null);
        try {
            const result = await submitExpense(expense.id);
            if (result.success) {
                setSuccess('Expense submitted for approval!');
                loadExpenseDetails();
                onUpdate();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || 'Failed to submit expense');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleApprove = async () => {
        if (!expense) return;
        setProcessing(true);
        setError(null);
        try {
            const result = await approveExpense(expense.id);
            if (result.success) {
                setSuccess('Expense approved!');
                loadExpenseDetails();
                onUpdate();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || 'Failed to approve expense');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleRefuse = async () => {
        if (!expense) return;
        setProcessing(true);
        setError(null);
        try {
            const result = await refuseExpense(expense.id);
            if (result.success) {
                setSuccess('Expense refused!');
                loadExpenseDetails();
                onUpdate();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || 'Failed to refuse expense');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!expense || !confirm('Are you sure you want to delete this expense?')) return;

        setProcessing(true);
        setError(null);
        try {
            const result = await deleteExpense(expense.id);
            if (result.success) {
                onUpdate();
                onBack();
            } else {
                setError(result.error || 'Failed to delete expense');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const getStateColor = (state: string) => {
        const colors: Record<string, string> = {
            draft: '#6b7280',
            reported: '#3b82f6',
            approved: '#22c55e',
            done: '#10b981',
            refused: '#ef4444'
        };
        return colors[state] || '#6b7280';
    };

    const formatFieldValue = (key: string, value: any) => {
        if (value === false || value === undefined || value === null) return 'N/A';
        if (Array.isArray(value) && value.length === 2) return value[1];
        if (typeof value === 'number') return value.toLocaleString(undefined, { minimumFractionDigits: 2 });
        if (key.includes('date') && typeof value === 'string') {
            try {
                return new Date(value).toLocaleDateString();
            } catch {
                return value;
            }
        }
        return String(value);
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="pulse" style={{ width: '60px', height: '60px', background: 'var(--primary-glow)', borderRadius: '50%' }} />
            </div>
        );
    }

    if (!expense) {
        return (
            <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <XCircle size={48} color="#ef4444" />
                <p style={{ color: 'var(--text-muted)' }}>Failed to load expense details</p>
                <button onClick={onBack} className="btn-secondary">Go Back</button>
            </div>
        );
    }

    const rqType = expense.x_studio_selection_field_5hb_1jbkffh63 || 'Option 1';
    const rqLabel = REQUISITION_TYPES_LABELS[rqType] || rqType;

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <button
                        onClick={onBack}
                        className="btn-icon"
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                            borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--primary)'
                        }}
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Expenses / Details / #{expense.id}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{expense.name}</h2>
                            <span style={{
                                display: 'inline-block', padding: '6px 14px', borderRadius: '8px',
                                fontSize: '0.75rem', fontWeight: 700,
                                color: getStateColor(expense.state),
                                background: `${getStateColor(expense.state)}20`,
                                border: `1px solid ${getStateColor(expense.state)}40`,
                                textTransform: 'uppercase'
                            }}>
                                {expense.state}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{rqLabel}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Edit3 size={16} /> Edit
                        </button>
                    )}
                    {editMode && (
                        <>
                            <button
                                onClick={() => {
                                    setEditMode(false);
                                    setEditedData(expense);
                                }}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {saving ? <Loader className="spin" size={16} /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert-error" style={{
                    padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444'
                }}>
                    {error}
                </div>
            )}
            {success && (
                <div className="alert-success" style={{
                    padding: '1rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e'
                }}>
                    {success}
                </div>
            )}

            {/* Main Content */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', overflow: 'hidden' }}>
                {/* Left Column - Details */}
                <div className="card" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                        Expense Details
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Subject */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Subject / Description</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    className="input-field"
                                    value={editedData.name || ''}
                                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                />
                            ) : (
                                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{expense.name}</p>
                            )}
                        </div>

                        {/* Employee */}
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                                <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Employee
                            </label>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {formatFieldValue('employee_id', expense.employee_id)}
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                                <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Product
                            </label>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {formatFieldValue('product_id', expense.product_id)}
                            </p>
                        </div>

                        {/* Date */}
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Date
                            </label>
                            {editMode ? (
                                <input
                                    type="date"
                                    className="input-field"
                                    value={editedData.date || ''}
                                    onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                                />
                            ) : (
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {formatFieldValue('date', expense.date)}
                                </p>
                            )}
                        </div>

                        {/* Payment Mode */}
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Payment Mode</label>
                            {editMode ? (
                                <select
                                    className="input-field"
                                    value={editedData.payment_mode || 'own_account'}
                                    onChange={(e) => setEditedData({ ...editedData, payment_mode: e.target.value })}
                                >
                                    <option value="own_account">Own Account</option>
                                    <option value="company_account">Company Account</option>
                                </select>
                            ) : (
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {expense.payment_mode === 'own_account' ? 'Own Account' : 'Company Account'}
                                </p>
                            )}
                        </div>

                        {/* Amount Breakdown */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <div style={{
                                padding: '1.5rem', borderRadius: '12px',
                                background: 'rgba(var(--primary-rgb), 0.05)',
                                border: '1px solid var(--border-glass)'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Unit Price</label>
                                        {editMode ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="input-field"
                                                value={editedData.price_unit || 0}
                                                onChange={(e) => setEditedData({ ...editedData, price_unit: parseFloat(e.target.value) || 0 })}
                                            />
                                        ) : (
                                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                ${expense.price_unit.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Quantity</label>
                                        {editMode ? (
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={editedData.quantity || 1}
                                                onChange={(e) => setEditedData({ ...editedData, quantity: parseInt(e.target.value) || 1 })}
                                            />
                                        ) : (
                                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                {expense.quantity}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border-glass)', margin: '1rem 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                        <DollarSign size={18} style={{ display: 'inline', marginRight: '4px' }} />
                                        Total Amount
                                    </span>
                                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                                        ${expense.total_amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Internal Notes</label>
                            {editMode ? (
                                <textarea
                                    className="input-field"
                                    rows={4}
                                    value={editedData.description || ''}
                                    onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                                />
                            ) : (
                                <div style={{
                                    padding: '1rem', borderRadius: '12px',
                                    background: 'var(--input-bg)', border: '1px solid var(--border-glass)'
                                }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                        {expense.description || 'No notes'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Actions & Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
                    {/* Actions Card */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {expense.state === 'draft' && (
                                <>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={processing || editMode}
                                        className="btn-primary"
                                        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        {processing ? <Loader className="spin" size={16} /> : <Send size={16} />}
                                        Submit for Approval
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={processing}
                                        style={{
                                            width: '100%', padding: '10px', borderRadius: '10px',
                                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#ef4444', cursor: 'pointer', fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'
                                        }}
                                    >
                                        <Trash2 size={16} /> Delete Expense
                                    </button>
                                </>
                            )}
                            {(expense.state === 'reported' || expense.state === 'approved') && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        disabled={processing}
                                        className="btn-primary"
                                        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        {processing ? <Loader className="spin" size={16} /> : <CheckCircle size={16} />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={handleRefuse}
                                        disabled={processing}
                                        style={{
                                            width: '100%', padding: '10px', borderRadius: '10px',
                                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#ef4444', cursor: 'pointer', fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'
                                        }}
                                    >
                                        <XCircle size={16} /> Refuse
                                    </button>
                                </>
                            )}
                            {(expense.state === 'done' || expense.state === 'refused') && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                    No actions available for {expense.state} expenses
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="card" style={{ padding: '1.5rem', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>Metadata</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Expense ID</p>
                                <p style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-main)' }}>#{expense.id}</p>
                            </div>
                            {expense.x_studio_code && (
                                <div>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Reference Code</p>
                                    <p style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)' }}>{expense.x_studio_code}</p>
                                </div>
                            )}
                            {expense.company_id && (
                                <div>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        <Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                        Company
                                    </p>
                                    <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                        {formatFieldValue('company_id', expense.company_id)}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Created</p>
                                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                    {expense.create_date ? new Date(expense.create_date).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Last Updated</p>
                                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                    {expense.write_date ? new Date(expense.write_date).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
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

export default ExpenseDetailPage;
