import React, { useState, useEffect } from 'react';
import { ChevronLeft, Printer, Download, CheckCircle2 } from 'lucide-react';
import { fetchExpenseById, fetchExpenseChatter, fetchExpenseApprovals, type Expense } from '../../api/ExpensesService';
import { odooCall } from '../../api/odoo';

interface ExpenseAuditReportProps {
    expense: Expense;
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

const ExpenseAuditReport: React.FC<ExpenseAuditReportProps> = ({ expense: initialExpense, onBack }) => {
    const [expense, setExpense] = useState<Expense>(initialExpense);
    const [chatter, setChatter] = useState<any[]>([]);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [lineItems, setLineItems] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReportData();
    }, [initialExpense.id]);

    const loadReportData = async () => {
        setLoading(true);
        try {
            const [fullData, chatterRes, approvalsRes] = await Promise.all([
                fetchExpenseById(initialExpense.id),
                fetchExpenseChatter(initialExpense.id),
                fetchExpenseApprovals(initialExpense.id)
            ]);

            if (fullData.success && fullData.data) {
                setExpense(fullData.data);
                await loadLineItems(fullData.data);
            }
            if (chatterRes.success && chatterRes.data) {
                setChatter(chatterRes.data);
            }
            if (approvalsRes.success && approvalsRes.data) {
                setApprovals(approvalsRes.data);
            }
        } catch (error) {
            console.error('Error loading report data:', error);
        }
        setLoading(false);
    };

    const loadLineItems = async (exp: Expense) => {
        const type = exp.x_studio_selection_field_5hb_1jbkffh63;
        const lines: any = {};

        try {
            if (type === 'Conveyance bill form' && exp.x_studio_travel_description?.length > 0) {
                lines.conveyance = await odooCall('x_hr_expense_line_62b76', 'read', [exp.x_studio_travel_description]);
            } else if (type === 'Option 2-Expense' && exp.x_studio_expense?.length > 0) {
                lines.liquidation = await odooCall('x_hr_expense_line_de6a5', 'read', [exp.x_studio_expense]);
            } else if (type === 'Operational budget' && exp.x_studio_budget_lines?.length > 0) {
                lines.operational = await odooCall('x_hr_expense_line_af882', 'read', [exp.x_studio_budget_lines]);
            } else if (type === 'Option 1-Advance' && exp.x_studio_nature_of_expense?.length > 0) {
                lines.advances = await odooCall('x_hr_expense_line_68c34', 'read', [exp.x_studio_nature_of_expense]);
            }
        } catch (error) {
            console.error('Error loading line items:', error);
        }

        setLineItems(lines);
    };

    const handlePrint = () => {
        window.print();
    };

    const rqType = expense.x_studio_selection_field_5hb_1jbkffh63 || 'Option 1';
    const rqLabel = REQUISITION_TYPES_LABELS[rqType] || rqType;

    const auditApprovals = approvals.length > 0 ? approvals.map((a: any) => ({
        name: a.request_owner_id?.[1] || 'Authorized User',
        date: a.date_confirmed || 'Pending',
        status: a.status
    })) : chatter
        .filter((msg: any) => msg.subtype_id?.[1] === 'Status Updated' || msg.body.includes('Approved') || msg.body.includes('status changed'))
        .map((msg: any) => ({
            name: msg.author_id?.[1] || 'System',
            date: msg.date,
            status: 'Approved'
        }))
        .slice(0, 3);

    if (loading) {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="pulse" style={{ width: '60px', height: '60px', background: 'var(--primary-glow)', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div className="report-view fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Action Bar */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onBack} className="btn-icon" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <h3 style={{ fontWeight: 700 }}>Comprehensive Audit Report</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handlePrint} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Printer size={16} /> Print Report
                    </button>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Audit Document - A4 Optimized */}
            <div className="audit-document" style={{
                background: 'white',
                color: '#1a1a1a',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                minHeight: '297mm',
                width: '210mm',
                margin: '0 auto',
                fontFamily: '"Arial", "Segoe UI", sans-serif',
                position: 'relative',
                fontSize: '11px'
            }}>
                {/* Header Section - Reduced Size */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '12px', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>
                        {Array.isArray(expense.company_id) ? expense.company_id[1] : 'JAAGO FOUNDATION'}
                    </h1>
                    <h5 style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#666', fontWeight: 600, letterSpacing: '1px' }}>
                        {rqLabel}
                    </h5>
                </div>

                {/* Subject & Basic Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#666' }}>Subject:</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#000' }}>{expense.name}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#666' }}>Reference Code:</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#714b67' }}>{expense.x_studio_code || 'N/A'}</p>
                        <p style={{ margin: '3px 0 0', fontSize: '0.7rem', color: '#666' }}>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Basic Information Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', marginBottom: '15px', fontSize: '0.7rem' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #ddd' }}>Field</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #ddd' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Employee Name</td>
                            <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{Array.isArray(expense.employee_id) ? expense.employee_id[1] : '--'}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Date</td>
                            <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{expense.date || '--'}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Payment Mode</td>
                            <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{expense.payment_mode === 'own_account' ? 'Own Account' : 'Company Account'}</td>
                        </tr>
                        {expense.x_studio_purpose_of_travel_1 && (
                            <tr>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Purpose of Travel</td>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{expense.x_studio_purpose_of_travel_1}</td>
                            </tr>
                        )}
                        {expense.x_studio_destination_city_country && (
                            <tr>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Destination</td>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{expense.x_studio_destination_city_country}</td>
                            </tr>
                        )}
                        {expense.x_studio_mode_of_travel && (
                            <tr>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Mode of Travel</td>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{expense.x_studio_mode_of_travel}</td>
                            </tr>
                        )}
                        {expense.x_studio_travel_date && (
                            <tr>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Travel Date</td>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{expense.x_studio_travel_date}</td>
                            </tr>
                        )}
                        {expense.x_studio_return_date && (
                            <tr>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Return Date</td>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{expense.x_studio_return_date}</td>
                            </tr>
                        )}
                        {expense.x_studio_duration && (
                            <tr>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Duration</td>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{expense.x_studio_duration}</td>
                            </tr>
                        )}
                        {expense.x_studio_place_of_visit && (
                            <tr>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 600 }}>Place of Visit</td>
                                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{expense.x_studio_place_of_visit}</td>
                            </tr>
                        )}
                        <tr>
                            <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 700, color: '#714b67' }}>Total Amount</td>
                            <td style={{ padding: '6px 8px', border: '1px solid #ddd', fontWeight: 700, fontSize: '0.85rem' }}>
                                {expense.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {Array.isArray(expense.currency_id) ? expense.currency_id[1] : 'BDT'}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Dynamic Line Items - Conveyance */}
                {lineItems.conveyance && lineItems.conveyance.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                        <h6 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #333' }}>TRAVEL DESCRIPTION</h6>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: '0.65rem' }}>
                            <thead style={{ background: '#f1f1f1' }}>
                                <tr>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>From</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>To</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Description</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Transport</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.conveyance.map((line: any, i: number) => (
                                    <tr key={i}>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_studio_date || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_studio_from || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_studio_to || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_name || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_studio_transport || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>{line.x_studio_cost?.toFixed(2) || '0.00'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Dynamic Line Items - Expense Liquidation */}
                {lineItems.liquidation && lineItems.liquidation.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                        <h6 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #333' }}>EXPENSE LIQUIDATION DETAILS</h6>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: '0.65rem' }}>
                            <thead style={{ background: '#f1f1f1' }}>
                                <tr>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Description</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Project</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>Proj Code</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>Budget Line</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>Amount</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>Invoice#</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.liquidation.map((line: any, i: number) => (
                                    <tr key={i}>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_studio_date || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_name || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{Array.isArray(line.x_studio_projects_name) ? line.x_studio_projects_name[1] : '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>{line.x_studio_project_code || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>{line.x_studio_budgets_line || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>{line.x_studio_amount?.toFixed(2) || '0.00'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>{line.x_studio_invoice || '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Dynamic Line Items - Operational Budget */}
                {lineItems.operational && lineItems.operational.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                        <h6 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #333' }}>OPERATIONAL BUDGET LINES</h6>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: '0.65rem' }}>
                            <thead style={{ background: '#f1f1f1' }}>
                                <tr>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>SL</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Description</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>Quantity</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Date Required</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>Est. Price</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.operational.map((line: any, i: number) => (
                                    <tr key={i}>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_studio_sl || i + 1}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_name || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>{line.x_studio_quantity || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_studio_date_required || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>{line.x_studio_unit_price?.toFixed(2) || '0.00'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>{line.x_studio_estimated_price?.toFixed(2) || '0.00'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_studio_remarks || '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Dynamic Line Items - Advances */}
                {lineItems.advances && lineItems.advances.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                        <h6 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #333' }}>ADVANCE REQUEST BREAKDOWN</h6>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: '0.65rem' }}>
                            <thead style={{ background: '#f1f1f1' }}>
                                <tr>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Nature of Expense</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'left' }}>Description</th>
                                    <th style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.advances.map((line: any, i: number) => (
                                    <tr key={i}>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_studio_nature_of_expense || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc' }}>{line.x_name || '--'}</td>
                                        <td style={{ padding: '5px 6px', border: '1px solid #ccc', textAlign: 'right' }}>{line.x_studio_amount_1?.toFixed(2) || '0.00'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Audit Approval Section */}
                <div style={{ marginTop: '20px', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '320px' }}>
                            <h6 style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '10px', borderBottom: '1px solid #333' }}>APPROVAL DETAILS</h6>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem' }}>
                                <thead style={{ background: '#f1f1f1' }}>
                                    <tr>
                                        <th style={{ padding: '6px', border: '1px solid #ccc', textAlign: 'left' }}>Approver</th>
                                        <th style={{ padding: '6px', border: '1px solid #ccc', textAlign: 'right' }}>Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditApprovals.length > 0 ? auditApprovals.map((app: any, i: number) => (
                                        <tr key={i}>
                                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <CheckCircle2 size={10} color="#10b981" />
                                                    {app.name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '6px', border: '1px solid #ccc', textAlign: 'right', fontSize: '0.6rem' }}>
                                                {app.date ? new Date(app.date).toLocaleString() : 'N/A'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={2} style={{ padding: '15px', textAlign: 'center', color: '#999', fontStyle: 'italic', border: '1px solid #ccc' }}>
                                                Pending System Approval
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <div style={{ borderTop: '1px solid #000', width: '160px', margin: '0 0 4px auto' }}></div>
                                <p style={{ fontSize: '0.6rem', fontWeight: 700, textAlign: 'right' }}>Authorized Signature & Seal</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div style={{ position: 'absolute', bottom: '15px', left: '30px', right: '30px', fontSize: '0.55rem', color: '#999', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                    <p style={{ margin: 0 }}>This is a computer-generated audit report for record keeping purposes. Generated via JAAGO Core ERP System on {new Date().toLocaleDateString()}.</p>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .report-view { margin: 0 !important; padding: 0 !important; background: white !important; }
                    .audit-document { 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        width: 210mm !important; 
                        max-width: 210mm !important; 
                        padding: 15mm !important;
                        min-height: 297mm !important;
                    }
                    body { background: white !important; }
                    .app-container { padding: 0 !important; }
                    .main-content { padding: 0 !important; margin: 0 !important; }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default ExpenseAuditReport;
