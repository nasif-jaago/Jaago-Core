import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Send, Loader, Trash2, Code, Layout } from 'lucide-react';
import {
    submitExpense,
    approveExpense,
    refuseExpense,
    deleteExpense,
    fetchExpenseById,
    type Expense,
    type ExpenseField
} from '../../api/ExpensesService';

interface ExpenseDetailModalProps {
    expense: Expense;
    fields: Record<string, ExpenseField>;
    onClose: () => void;
    onUpdate: () => void;
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({ expense: initialExpense, fields, onClose, onUpdate }) => {
    const [expense, setExpense] = useState<Expense>(initialExpense);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'standard' | 'studio'>('standard');

    useEffect(() => {
        loadFullDetails();
    }, [initialExpense.id]);

    const loadFullDetails = async () => {
        setLoading(true);
        try {
            const result = await fetchExpenseById(initialExpense.id);
            if (result.success && result.data) {
                setExpense(result.data);
            }
        } catch (err) {
            console.error('Failed to load full expense details:', err);
        } finally {
            setLoading(false);
        }
    };

    const studioFields = Object.keys(fields)
        .filter(key => key.startsWith('x_studio_') && expense[key] !== undefined && expense[key] !== false && expense[key] !== '')
        .map(key => ({ ...fields[key], value: expense[key] }));

    const handleSubmit = async () => {
        setProcessing(true);
        setError(null);
        try {
            const result = await submitExpense(expense.id);
            if (result.success) {
                onUpdate();
                onClose();
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
        setProcessing(true);
        setError(null);
        try {
            const result = await approveExpense(expense.id);
            if (result.success) {
                onUpdate();
                onClose();
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
        setProcessing(true);
        setError(null);
        try {
            const result = await refuseExpense(expense.id);
            if (result.success) {
                onUpdate();
                onClose();
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
        if (!confirm('Are you sure you want to delete this expense?')) return;

        setProcessing(true);
        setError(null);
        try {
            const result = await deleteExpense(expense.id);
            if (result.success) {
                onUpdate();
                onClose();
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

    const formatValue = (field: any, val: any) => {
        if (val === false || val === undefined || val === null) return 'N/A';
        if (field.type === 'many2one' && Array.isArray(val)) return val[1];
        if (field.type === 'selection' && field.selection) {
            const option = field.selection.find(([k]: any) => k === val);
            return option ? option[1] : val;
        }
        if (field.type === 'boolean') return val ? 'Yes' : 'No';
        if (field.type === 'date') return new Date(val).toLocaleDateString();
        if (field.type === 'datetime') return new Date(val).toLocaleString();
        if (typeof val === 'number') return val.toLocaleString(undefined, { minimumFractionDigits: 2 });
        return String(val);
    };

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '2rem'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '700px', maxHeight: '90vh',
                    display: 'flex', flexDirection: 'column',
                    animation: 'slideUp 0.3s ease-out',
                    border: '1px solid var(--border-glass)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem', borderBottom: '1px solid var(--border-glass)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                            {expense.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: getStateColor(expense.state),
                                background: `${getStateColor(expense.state)}20`,
                                border: `1px solid ${getStateColor(expense.state)}40`
                            }}>
                                {expense.state.toUpperCase()}
                            </span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                                ${expense.total_amount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-icon"
                        style={{ width: '32px', height: '32px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)' }}>
                    <button
                        onClick={() => setActiveTab('standard')}
                        style={{
                            flex: 1, padding: '1rem', background: 'transparent',
                            border: 'none', borderBottom: activeTab === 'standard' ? '2px solid var(--primary)' : 'none',
                            color: activeTab === 'standard' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <Layout size={18} /> Details
                    </button>
                    <button
                        onClick={() => setActiveTab('studio')}
                        style={{
                            flex: 1, padding: '1rem', background: 'transparent',
                            border: 'none', borderBottom: activeTab === 'studio' ? '2px solid var(--primary)' : 'none',
                            color: activeTab === 'studio' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <Code size={18} /> Technical / Studio ({studioFields.length})
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Loader className="spin" size={32} color="var(--primary)" />
                        </div>
                    ) : activeTab === 'standard' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Employee</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        {expense.employee_id ? expense.employee_id[1] : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Product</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        {expense.product_id ? expense.product_id[1] : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Date</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Payment Mode</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        {expense.payment_mode === 'own_account' ? 'Own Account' : 'Company Account'}
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                background: 'rgba(var(--primary-rgb), 0.05)',
                                border: '1px solid var(--border-glass)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Unit Price</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        ${expense.price_unit.toFixed(2)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Quantity</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        {expense.quantity}
                                    </span>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border-glass)', margin: '0.75rem 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Total Amount</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                                        ${expense.total_amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {expense.description && (
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Notes</p>
                                    <div style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border-glass)'
                                    }}>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                            {expense.description}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {studioFields.map(field => (
                                <div key={field.name}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{field.string}</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        {formatValue(field, field.value)}
                                    </p>
                                </div>
                            ))}
                            {studioFields.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                                    <p>No custom Studio data populated for this expense.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            fontSize: '0.85rem'
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '1rem 1.5rem', borderTop: '1px solid var(--border-glass)',
                    display: 'flex', justifyContent: 'space-between', gap: '0.75rem',
                    background: 'var(--bg-card)'
                }}>
                    <div>
                        {expense.state === 'draft' && (
                            <button
                                onClick={handleDelete}
                                disabled={processing}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px',
                                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444', cursor: 'pointer', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {expense.state === 'draft' && (
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {processing ? <Loader className="spin" size={16} /> : <Send size={16} />}
                                Submit for Approval
                            </button>
                        )}
                        {(expense.state === 'reported' || expense.state === 'approved') && (
                            <>
                                <button
                                    onClick={handleRefuse}
                                    disabled={processing}
                                    style={{
                                        padding: '10px 20px', borderRadius: '10px',
                                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                        color: '#ef4444', cursor: 'pointer', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', gap: '8px'
                                    }}
                                >
                                    {processing ? <Loader className="spin" size={16} /> : <XCircle size={16} />}
                                    Refuse
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {processing ? <Loader className="spin" size={16} /> : <CheckCircle size={16} />}
                                    Approve
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
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

export default ExpenseDetailModal;
