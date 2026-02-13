import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Search, Eye } from 'lucide-react';
import { fetchExpenses, type Expense } from '../../api/ExpensesService';
import ExpenseAuditReport from './ExpenseAuditReport';

interface ExpenseReportsListProps {
    onBack: () => void;
}

const REQUISITION_TYPES_LABELS: Record<string, string> = {
    'Option 1': 'Travel Authorization',
    'Option 1-Advance': 'Travel Advance Request form',
    'Option 2': 'Travel Liquidation form & per diem calculation',
    'Conveyance bill form': 'Conveyance bill form',
    'Option 2-Expense': 'Expense Liquidation Form',
    'Operational budget': 'Operational budget'
};

const ExpenseReportsList: React.FC<ExpenseReportsListProps> = ({ onBack }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        setLoading(true);
        const result = await fetchExpenses({
            fields: [
                'name', 'employee_id', 'date', 'total_amount', 'state',
                'x_studio_selection_field_5hb_1jbkffh63', 'company_id',
                'description', 'x_studio_code'
            ]
        });
        if (result.success && result.data) {
            setExpenses(result.data);
        }
        setLoading(false);
    };

    const getReportName = (expense: Expense) => {
        const typeRaw = expense.x_studio_selection_field_5hb_1jbkffh63 || 'Option 1';
        const typeLabel = REQUISITION_TYPES_LABELS[typeRaw] || typeRaw;
        const subject = expense.name || 'No Subject';

        // Shortened version: Type (First 15 chars) - Subject (First 20 chars)
        const shortType = typeLabel.length > 20 ? typeLabel.substring(0, 20) + '...' : typeLabel;
        const shortSubject = subject.length > 25 ? subject.substring(0, 25) + '...' : subject;

        return `${shortType} | ${shortSubject}`;
    };

    const filteredExpenses = expenses.filter(exp =>
        String(exp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.x_studio_code && String(exp.x_studio_code || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (selectedExpense) {
        return <ExpenseAuditReport expense={selectedExpense} onBack={() => setSelectedExpense(null)} />;
    }

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Expenses / Reports</p>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>Active Expense Reports</h2>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', maxWidth: '500px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by subject or code..."
                        className="input-field"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '40px' }}
                    />
                </div>
            </div>

            <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowY: 'auto', height: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, borderBottom: '1px solid var(--border-glass)' }}>
                            <tr style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Report Name</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Ref Code</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Employee</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Amount</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>
                                        <div className="pulse" style={{ width: '40px', height: '40px', background: 'var(--primary-glow)', borderRadius: '50%', margin: '0 auto' }} />
                                    </td>
                                </tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No reports found</td>
                                </tr>
                            ) : filteredExpenses.map(expense => (
                                <tr key={expense.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <FileText size={18} color="var(--primary)" />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{getReportName(expense)}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{expense.x_studio_code || '--'}</td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{expense.employee_id ? expense.employee_id[1] : '--'}</td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{expense.date || '--'}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{expense.total_amount?.toLocaleString()}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => setSelectedExpense(expense)}
                                            className="btn-icon"
                                            style={{ color: 'var(--primary)' }}
                                            title="View Audit Report"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpenseReportsList;
