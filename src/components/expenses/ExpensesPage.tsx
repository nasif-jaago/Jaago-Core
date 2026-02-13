import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Plus, RefreshCw, Search,
    Receipt, Eye, FileText
} from 'lucide-react';
import {
    fetchExpenses,
    getExpensesCount,
    fetchExpenseProducts,
    fetchEmployees,
    fetchExpenseFields,
    type Expense,
    type ExpenseProduct,
    type ExpenseField
} from '../../api/ExpensesService';
import ExpenseCreatePage from './ExpenseCreatePage';
import ExpenseDetailModal from './ExpenseDetailModal';
import ExpenseReportsList from './ExpenseReportsList';
import ExpenseDetailPage from './ExpenseDetailPage';

interface ExpensesPageProps {
    onBack: () => void;
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({ onBack }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [products, setProducts] = useState<ExpenseProduct[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [fields, setFields] = useState<Record<string, ExpenseField>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const recordsPerPage = 50;

    const [filters, setFilters] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState<string>('');

    const [view, setView] = useState<'list' | 'create' | 'report' | 'detail'>('list');
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadExpenses();
    }, [filters, currentPage]);

    const loadInitialData = async () => {
        const [productsRes, employeesRes, fieldsRes] = await Promise.all([
            fetchExpenseProducts(),
            fetchEmployees(),
            fetchExpenseFields()
        ]);

        if (productsRes.success && productsRes.data) {
            setProducts(productsRes.data);
        }
        if (employeesRes.success && employeesRes.data) {
            setEmployees(employeesRes.data);
        }
        if (fieldsRes.success && fieldsRes.data) {
            setFields(fieldsRes.data);
        }
    };

    const loadExpenses = async () => {
        setLoading(true);
        setError(null);

        try {
            const offset = (currentPage - 1) * recordsPerPage;
            const [expensesRes, count] = await Promise.all([
                fetchExpenses(filters, offset, recordsPerPage),
                getExpensesCount(filters)
            ]);

            if (expensesRes.success && expensesRes.data) {
                setExpenses(expensesRes.data);
                setTotalCount(count);
            } else {
                setError(expensesRes.error || 'Failed to load expenses');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleStateFilter = (state: string) => {
        setSelectedState(state);
        setFilters({ ...filters, state: state || undefined });
        setCurrentPage(1);
    };

    const getStateBadge = (state: string) => {
        const stateConfig: Record<string, { label: string; color: string; bg: string }> = {
            draft: { label: 'Draft', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
            reported: { label: 'Reported', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
            approved: { label: 'Approved', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
            done: { label: 'Done', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            refused: { label: 'Refused', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
        };

        const config = stateConfig[state] || stateConfig.draft;

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: config.color,
                background: config.bg,
                border: `1px solid ${config.color}40`
            }}>
                {config.label}
            </span>
        );
    };

    const totalPages = Math.ceil(totalCount / recordsPerPage);

    if (view === 'detail' && selectedExpenseId) {
        return (
            <ExpenseDetailPage
                expenseId={selectedExpenseId}
                onBack={() => {
                    setView('list');
                    setSelectedExpenseId(null);
                }}
                onUpdate={() => loadExpenses()}
            />
        );
    }

    if (view === 'report') {
        return (
            <ExpenseReportsList
                onBack={() => setView('list')}
            />
        );
    }

    if (view === 'create') {
        return (
            <ExpenseCreatePage
                products={products}
                employees={employees}
                fields={fields}
                onBack={() => setView('list')}
                onSuccess={() => {
                    setView('list');
                    loadExpenses();
                }}
            />
        );
    }

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Odoo / Expenses</p>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>Expense Management</h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setView('create')}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> New Expense
                    </button>
                    <button
                        onClick={() => setView('report')}
                        style={{
                            background: 'var(--primary-glow)', border: '1px solid var(--primary)',
                            borderRadius: '10px', padding: '8px 16px', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        <FileText size={16} /> Active Expenses Report
                    </button>
                    <button
                        onClick={loadExpenses}
                        style={{
                            background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                            borderRadius: '10px', padding: '8px 16px', color: 'var(--text-main)',
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            className="input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['', 'draft', 'reported', 'approved', 'done', 'refused'].map(state => (
                            <button
                                key={state}
                                onClick={() => handleStateFilter(state)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-glass)',
                                    background: selectedState === state ? 'var(--primary)' : 'var(--input-bg)',
                                    color: selectedState === state ? '#000' : 'var(--text-main)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                {state === '' ? 'All' : state.charAt(0).toUpperCase() + state.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {totalCount} expense{totalCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="pulse" style={{ width: '60px', height: '60px', background: 'var(--primary-glow)', borderRadius: '50%' }} />
                    </div>
                ) : error ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                        <p style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
                        <button onClick={loadExpenses} className="btn-primary">Retry</button>
                    </div>
                ) : (
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, borderBottom: '1px solid var(--border-glass)' }}>
                                <tr style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '16px 24px', textAlign: 'left' }}>Description</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Employee</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Product</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '16px', textAlign: 'right' }}>Amount</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Payment</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '16px', textAlign: 'right', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(expense => (
                                    <tr
                                        key={expense.id}
                                        onClick={() => {
                                            setSelectedExpenseId(expense.id);
                                            setView('detail');
                                        }}
                                        style={{ borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}
                                        className="table-row-hover"
                                    >
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                    background: 'var(--primary-glow)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <Receipt size={20} color="var(--primary)" />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{expense.name}</p>
                                                    {expense.description && (
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {expense.description.substring(0, 50)}{expense.description.length > 50 ? '...' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            {expense.employee_id ? expense.employee_id[1] : '--'}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            {expense.product_id ? expense.product_id[1] : '--'}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            {expense.date ? new Date(expense.date).toLocaleDateString() : '--'}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, textAlign: 'right' }}>
                                            ${expense.total_amount.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                            {expense.payment_mode === 'own_account' ? 'Own Account' : 'Company'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {getStateBadge(expense.state)}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button className="btn-icon" style={{ width: '32px', height: '32px' }}>
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="btn-icon"
                            style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
                        >
                            ‹
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                            if (pageNum > totalPages) return null;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    style={{
                                        padding: '6px 12px', borderRadius: '8px',
                                        background: pageNum === currentPage ? 'var(--primary)' : 'var(--input-bg)',
                                        color: pageNum === currentPage ? '#000' : 'var(--text-main)',
                                        border: 'none', cursor: 'pointer', fontWeight: 600
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="btn-icon"
                            style={{ opacity: currentPage === totalPages ? 0.3 : 1 }}
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>

            {selectedExpense && (
                <ExpenseDetailModal
                    expense={selectedExpense}
                    fields={fields}
                    onClose={() => setSelectedExpense(null)}
                    onUpdate={loadExpenses}
                />
            )}
        </div>
    );
};

export default ExpensesPage;
