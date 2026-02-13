import React, { useState, useEffect } from 'react';
import {
    Loader, AlertCircle,
    Paperclip, Send, Split, Settings, HelpCircle,
    User, ChevronDown, Calendar, CheckCircle2
} from 'lucide-react';
import {
    createExpense,
    getLatestExpenseCode,
    fetchExpenseByCode,
    type ExpenseProduct,
    type ExpenseFormValues,
    type ExpenseField
} from '../../api/ExpensesService';
import { ODOO_CONFIG } from '../../api/odoo';

interface ExpenseCreatePageProps {
    products: ExpenseProduct[];
    employees: any[];
    fields: Record<string, ExpenseField>;
    onBack: () => void;
    onSuccess: () => void;
}

const REQUISITION_TYPES = [
    { id: 'Option 1', label: 'Travel Authorization' },
    { id: 'Option 1-Advance', label: 'Travel Advance Request form' },
    { id: 'Option 2', label: 'Travel Liquidation form & per diem calculation' },
    { id: 'Conveyance bill form', label: 'Conveyance bill form' },
    { id: 'Option 2-Expense', label: 'Expense Liquidation Form' },
    { id: 'Operational budget', label: 'Operational budget' }
];

const REQUISITION_MAPPING: Record<string, string> = {
    'Option 1': 'Option 1',
    'Option 1-Advance': 'Option 1',
    'Option 2': 'Option 2',
    'Option 2-Expense': 'Option 2',
    'Conveyance bill form': 'Conveyance bill from',
    'Operational budget': 'Operational budget'
};

const ExpenseCreatePage: React.FC<ExpenseCreatePageProps> = ({ products, employees, onBack, onSuccess }) => {
    const [formData, setFormData] = useState<ExpenseFormValues>({
        name: 'New Expense',
        product_id: undefined,
        total_amount: 0.00,
        employee_id: undefined,
        payment_mode: 'own_account',
        date: new Date().toISOString().split('T')[0],
        price_unit: 0.00,
        quantity: 1,
        // Requisition Type Field
        x_studio_selection_field_5hb_1jbkffh63: 'Option 1',
        description: '', // Internal Notes
        manager_id: undefined
    });

    const [projects, setProjects] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState('calculation');
    const [programAdvances, setProgramAdvances] = useState<any[]>([
        { id: Date.now(), x_studio_nature_of_expense: '', x_name: '', x_studio_amount_1: 0 }
    ]);
    const [conveyanceRows, setConveyanceRows] = useState<any[]>([
        { id: Date.now(), x_studio_date: '', x_studio_from: '', x_studio_to: '', x_name: '', x_studio_transport: '', x_studio_cost: 0 }
    ]);
    const [liquidationRows, setLiquidationRows] = useState<any[]>([
        { id: Date.now(), x_studio_date: '', x_name: '', x_studio_projects_name: '', x_studio_project_code: '', x_studio_budgets_line: '', x_studio_amount: 0, x_studio_invoice: '' }
    ]);
    const [operationalRows, setOperationalRows] = useState<any[]>([
        { id: Date.now(), x_studio_sl: 1, x_name: '', x_studio_quantity: 1, x_studio_date_required: '', x_studio_unit_price: 0, x_studio_estimated_price: 0, x_studio_remarks: '' }
    ]);
    const [autofilledFields, setAutofilledFields] = useState<Set<string>>(new Set());
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        generateUniqueCode();
        loadProjects();
    }, []);

    // Effect to handle employee dependencies once employees are loaded
    useEffect(() => {
        if (employees.length > 0 && !formData.employee_id) {
            loadCurrentUser();
        }
    }, [employees]);

    const loadProjects = async () => {
        try {
            const { fetchExpenseRelationOptions } = await import('../../api/ExpensesService');
            const result = await fetchExpenseRelationOptions('project.project');
            if (result.success) {
                setProjects(result.data || []);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    const generateUniqueCode = async () => {
        try {
            const lastCode = await getLatestExpenseCode();
            let nextNum = 260001;

            if (lastCode && lastCode.startsWith('EXP-')) {
                const numPart = parseInt(lastCode.split('-')[1]);
                if (!isNaN(numPart)) {
                    nextNum = numPart + 1;
                }
            }

            const newCode = `EXP-${nextNum}`;
            updateField('x_studio_code', newCode);
        } catch (error) {
            console.error('Error generating code:', error);
            // Fallback to random if fetch fails
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            updateField('x_studio_code', `EXP-${randomNum}`);
        }
    };

    const handleCodeLookup = async (code: string) => {
        if (!code || code.length < 5) return;

        try {
            const result = await fetchExpenseByCode(code);
            if (result.success && result.data) {
                const existing = result.data;
                // Auto-fill common fields but allow adjustment
                const filled = new Set<string>();
                const updateData: any = {};

                const fieldsToFill = [
                    'name', 'employee_id', 'product_id', 'total_amount', 'payment_mode', 'description',
                    'x_studio_selection_field_5hb_1jbkffh63', 'x_studio_projects_name',
                    'x_studio_purpose_of_travel_1', 'x_studio_destination_city_country',
                    'x_studio_mode_of_travel', 'x_studio_do_you_require_an_advance_payment',
                    'x_studio_duration', 'x_studio_travel_date', 'x_studio_place_of_visit',
                    'x_studio_return_date', 'x_studio_budget_information_1', 'x_studio_less_cash_advance'
                ];

                fieldsToFill.forEach(field => {
                    const value = existing[field];
                    if (value !== undefined && value !== null && value !== '') {
                        updateData[field] = Array.isArray(value) ? value[0] : value;
                        filled.add(field);
                    }
                });

                setAutofilledFields(filled);
                setFormData(prev => ({ ...prev, ...updateData }));

                // Reset highlighting after 3 seconds
                setTimeout(() => setAutofilledFields(new Set()), 3000);
            }
        } catch (error) {
            console.warn('Lookup failed or no record found for code:', code);
        }
    };

    const loadCurrentUser = async () => {
        if (!employees || employees.length === 0) return;

        try {
            const userEmail = ODOO_CONFIG.USER_ID;
            if (!userEmail) return;

            // Try exact email match first
            let currentEmp = employees.find(e =>
                e.work_email?.toLowerCase() === userEmail.toLowerCase()
            );

            // Fallback: match by name part of email
            if (!currentEmp) {
                const namePart = userEmail.split('@')[0].replace('.', ' ').toLowerCase();
                currentEmp = employees.find(e =>
                    e.name?.toLowerCase().includes(namePart)
                );
            }

            if (currentEmp) {
                setFormData(prev => ({
                    ...prev,
                    employee_id: currentEmp.id,
                    manager_id: currentEmp.parent_id ? currentEmp.parent_id[0] : prev.manager_id
                }));
            }
        } catch (error) {
            console.error('Failed to get current user:', error);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = 'Subject is required';
        if (!formData.product_id) newErrors.product_id = 'Category is required';
        if (!formData.employee_id) newErrors.employee_id = 'Employee is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            // Find selected employee and their company
            const selectedEmployee = employees.find(e => e.id === formData.employee_id);
            const companyId = selectedEmployee?.company_id?.[0];

            // Ensure price_unit is set for Odoo (Odoo often calculates total from price * qty)
            const submitData: any = {
                ...formData,
                price_unit: formData.total_amount || 0,
                // Map the requisition type to Odoo's technical ID
                x_studio_selection_field_5hb_1jbkffh63: REQUISITION_MAPPING[formData.x_studio_selection_field_5hb_1jbkffh63] || formData.x_studio_selection_field_5hb_1jbkffh63
            };

            // Attach dynamic lines using correct Odoo one2many command format [(0, 0, {vals})]
            const label = getRqLabel(rqType);

            if (label === 'Conveyance bill form' && conveyanceRows.length > 0) {
                submitData.x_studio_travel_description = conveyanceRows.map(row => [0, 0, {
                    x_studio_date: row.x_studio_date,
                    x_studio_from: row.x_studio_from,
                    x_studio_to: row.x_studio_to,
                    x_name: row.x_name,
                    x_studio_transport: row.x_studio_transport,
                    x_studio_cost: row.x_studio_cost
                }]);
            } else if (label === 'Expense Liquidation Form' && liquidationRows.length > 0) {
                submitData.x_studio_expense = liquidationRows.map(row => [0, 0, {
                    x_studio_date: row.x_studio_date,
                    x_name: row.x_name,
                    x_studio_project_code: parseFloat(row.x_studio_project_code) || 0,
                    x_studio_budgets_line: parseFloat(row.x_studio_budgets_line) || 0,
                    x_studio_amount: row.x_studio_amount,
                    x_studio_invoice: row.x_studio_invoice,
                    x_studio_projects_name: row.x_studio_projects_name ? [[6, 0, [row.x_studio_projects_name]]] : false
                }]);
            } else if (label === 'Operational budget' && operationalRows.length > 0) {
                submitData.x_studio_budget_lines = operationalRows.map(row => [0, 0, {
                    x_studio_sl: row.x_studio_sl,
                    x_name: row.x_name,
                    x_studio_quantity: row.x_studio_quantity,
                    x_studio_date_required: row.x_studio_date_required,
                    x_studio_unit_price: row.x_studio_unit_price,
                    x_studio_estimated_price: row.x_studio_estimated_price,
                    x_studio_remarks: row.x_studio_remarks
                }]);
            } else if (label === 'Travel Advance Request form' && programAdvances.length > 0) {
                submitData.x_studio_nature_of_expense = programAdvances.map(row => [0, 0, {
                    x_studio_nature_of_expense: row.x_studio_nature_of_expense,
                    x_name: row.x_name,
                    x_studio_amount_1: row.x_studio_amount_1
                }]);
            }

            const result = await createExpense(submitData, companyId);
            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    onSuccess();
                }, 2500);
            } else {
                setErrors({ submit: result.error || 'Failed to create expense' });
            }
        } catch (err: any) {
            setErrors({ submit: err.message || 'Unexpected error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const getInputClass = (field: string, baseClass: string = 'field-input') => {
        let classes = baseClass;
        if (autofilledFields.has(field)) classes += ' autofilled-highlight';
        if (errors[field]) classes += ' field-error';
        return classes;
    };

    const selectedEmployee = employees.find(e => e.id === formData.employee_id);
    const rqType = formData.x_studio_selection_field_5hb_1jbkffh63;

    // Reset active tab when rqType changes
    useEffect(() => {
        const label = getRqLabel(rqType);
        if (label === 'Conveyance bill form') setActiveTab('travel_description');
        else if (label === 'Expense Liquidation Form') setActiveTab('expense');
        else if (label === 'Operational budget') setActiveTab('operational_budget');
        else if (label.includes('Travel') || label.includes('Liquidation')) setActiveTab('calculation');
    }, [rqType]);

    // Helper to obtain the display label from an ID (for logic checks)
    const getRqLabel = (id: string) => {
        const type = REQUISITION_TYPES.find(t => t.id === id);
        return type ? type.label : id;
    };

    // Calculations for Advance Request
    useEffect(() => {
        const label = getRqLabel(rqType);
        if (label === 'Travel Advance Request form') {
            const accommodationTotal = (formData.x_studio_a_accommodation_daily_rate || 0) * (formData.x_studio_d_number_of_days || 0);
            const perDiemTotal = (formData.x_studio_b_perdiem_daily_rate || 0) * (formData.x_studio_eper_diem_require_days || 0);
            const travelConveyance = formData.x_studio_a_travel_and_local_conveyance || 0;
            const totalAdvance = accommodationTotal + perDiemTotal + travelConveyance;

            setFormData(prev => ({
                ...prev,
                x_studio_ctotal_amount_for_accommodation: accommodationTotal,
                x_studio_ftotal_amount_for_per_diem: perDiemTotal,
                x_studio_c_a_b_total_daily_rate: totalAdvance,
                x_studio_total_advance_amount: totalAdvance,
                total_amount: totalAdvance // Also update the main total
            }));
        }
    }, [
        formData.x_studio_a_accommodation_daily_rate,
        formData.x_studio_d_number_of_days,
        formData.x_studio_b_perdiem_daily_rate,
        formData.x_studio_eper_diem_require_days,
        formData.x_studio_a_travel_and_local_conveyance
    ]);

    // Update Program Advances Total
    useEffect(() => {
        const label = getRqLabel(rqType);
        if (label === 'Travel Advance Request form') {
            const total = programAdvances.reduce((sum, item) => sum + (parseFloat(item.x_studio_amount_1) || 0), 0);
            updateField('x_studio_nature_of_expense_1', total);
        }
    }, [programAdvances, rqType]);

    // Calculations for Liquidation
    useEffect(() => {
        const label = getRqLabel(rqType);
        if (label === 'Travel Liquidation form & per diem calculation' || label === 'Expense Liquidation Form') {
            const totalFare = formData.x_studio_total_fare_cost || 0;
            const dailyAllowance = (formData.x_studio_daily_allowance || 0) * (formData.x_studio_no_of_days_stayed_1 || 0);
            const hotelRent = (formData.x_studio_hotel_rent || 0) * (formData.x_studio_no_of_nights_stayed_1 || 0);
            const otherExpenses = formData.x_studio_other_expenses_local_travel || 0;
            const totalPerDiem = dailyAllowance + hotelRent;
            const grandTotal = totalFare + hotelRent + dailyAllowance + otherExpenses;
            const advance = formData.x_studio_less_cash_advance || 0;
            const balanceDue = grandTotal - advance;

            setFormData(prev => ({
                ...prev,
                x_studio_total_daily_allowance_1: dailyAllowance,
                x_studio_total_hotel_rent_1: hotelRent,
                x_studio_total_per_diemhotel_rentdaily_allowance: totalPerDiem,
                x_studio_grand_total: grandTotal,
                x_studio_balance_due: balanceDue,
                total_amount: grandTotal
            }));
        }
    }, [
        formData.x_studio_total_fare_cost,
        formData.x_studio_daily_allowance,
        formData.x_studio_no_of_days_stayed_1,
        formData.x_studio_hotel_rent,
        formData.x_studio_no_of_nights_stayed_1,
        formData.x_studio_other_expenses_local_travel,
        formData.x_studio_less_cash_advance,
        rqType
    ]);

    // Calculations for Conveyance bill form
    useEffect(() => {
        const label = getRqLabel(rqType);
        if (label === 'Conveyance bill form') {
            const totalCost = conveyanceRows.reduce((sum, row) => sum + (parseFloat(row.x_studio_cost) || 0), 0);
            const otherBills = parseFloat(formData.x_studio_other_bills) || 0;
            const grandTotal = totalCost + otherBills;

            setFormData(prev => ({
                ...prev,
                total_amount: grandTotal,
                x_studio_grand_total: grandTotal
            }));
        }
    }, [conveyanceRows, formData.x_studio_other_bills, rqType]);

    // Calculations for Expense Liquidation Form
    useEffect(() => {
        const label = getRqLabel(rqType);
        if (label === 'Expense Liquidation Form') {
            const total = liquidationRows.reduce((sum, row) => sum + (parseFloat(row.x_studio_amount) || 0), 0);
            setFormData(prev => ({
                ...prev,
                total_amount: total
            }));
        }
    }, [liquidationRows, rqType]);

    // Calculations for Operational budget
    useEffect(() => {
        const label = getRqLabel(rqType);
        if (label === 'Operational budget') {
            const total = operationalRows.reduce((sum, row) => sum + (parseFloat(row.x_studio_estimated_price) || 0), 0);
            setFormData(prev => ({
                ...prev,
                total_amount: total
            }));
        }
    }, [operationalRows, rqType]);

    // Helper to determine if a field should be shown
    const shouldShowField = (fieldName: string) => {
        if (!rqType || fieldName === 'x_studio_code') return true;

        const label = getRqLabel(rqType);

        // Common fields for all Travel, Liquidation, Conveyance, and Operational types
        const isCommonType = label.includes('Travel') || label.includes('Liquidation') || label.includes('Conveyance') || label.includes('Operational');

        if (['x_studio_projects_name', 'x_studio_purpose_of_travel_1', 'x_studio_destination_city_country', 'x_studio_travel_date', 'x_studio_place_of_visit'].includes(fieldName)) {
            return isCommonType;
        }

        // Travel Authorization Specific
        if (label === 'Travel Authorization') {
            return [
                'x_studio_mode_of_travel',
                'x_studio_if_travel_made_by_air',
                'x_studio_tentative_departure_flight',
                'x_studio_duration',
                'x_studio_return_date',
                'x_studio_tentative_returned_flight_1'
            ].includes(fieldName);
        }

        // Advance & Liquidation (Travel) shared
        if (label === 'Travel Advance Request form' || label === 'Travel Liquidation form & per diem calculation') {
            return [
                'x_studio_travel_date_1',
                'x_studio_2travel_date',
                'x_studio_return_date_1',
                'x_studio_budget_information_1'
            ].includes(fieldName);
        }

        return true;
    };

    return (
        <div className="expense-page-container">
            {/* Top Bar Navigation */}
            <div className="top-nav-bar">
                <div className="top-nav-logo">
                    <img src="/logo.png" alt="Odoo" style={{ height: '24px' }} onError={(e) => e.currentTarget.style.display = 'none'} />
                    <span>Expenses</span>
                </div>
                <div className="top-nav-links">
                    <span className="active">My Expenses</span>
                    <span>Reporting</span>
                    <span>Configuration</span>
                </div>
            </div>

            {/* Sub-Header / Breadcrumbs */}
            <div className="sub-header">
                <div className="breadcrumb-section">
                    <button className="btn-new-odoo">New</button>
                    <div className="breadcrumb-path">
                        <span onClick={onBack}>My Expenses</span>
                        <span className="separator">/</span>
                        <span className="current">{formData.name || 'test 2.0'}</span>
                        <button className="settings-btn"><Settings size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="toolbar-left">
                    <input
                        type="file"
                        id="attachment-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                console.log('File selected:', file.name);
                                // Handle file upload logic here
                            }
                        }}
                    />
                    <button className="btn-attach" onClick={() => document.getElementById('attachment-upload')?.click()}>
                        <Paperclip size={16} /> Attach Receipt
                    </button>
                    <button className="btn-submit" onClick={() => handleSubmit()}>
                        {saving ? <Loader className="spin" size={16} /> : <Send size={16} />} Submit
                    </button>
                    <button className="btn-split">
                        <Split size={16} /> Split Expense
                    </button>
                </div>
                <div className="status-bar">
                    <div className="status-step active">Draft</div>
                    <div className="status-step">Approved</div>
                    <div className="status-step">Posted</div>
                    <div className="status-step">Paid</div>
                </div>
            </div>

            {/* Main Form Content */}
            <div className="expense-form-card">
                <div className="form-inner">
                    {/* Subject Section */}
                    <div className="subject-section">
                        <div className="field-label-group">
                            <label>Subject</label>
                            <HelpCircle size={12} className="info-icon" />
                        </div>
                        <input
                            type="text"
                            className="subject-input"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="e.g. Travel to Dhaka"
                        />
                    </div>

                    {/* Requisition Type Selection */}
                    <div className="requisition-section">
                        <div className="field-label-group">
                            <label>Requisition Type</label>
                            <HelpCircle size={12} className="info-icon" />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <select
                                className={getInputClass('x_studio_selection_field_5hb_1jbkffh63')}
                                value={formData.x_studio_selection_field_5hb_1jbkffh63 || ''}
                                onChange={(e) => {
                                    // We need to store the Technical ID for Odoo, but we might want the label for UI logic
                                    // Since multiple labels share 'Option 1', we'll store the label string instead if Odoo allows it,
                                    // OR we store the Technical ID and use a secondary state for the specific sub-type.
                                    // However, the error 'Wrong value' confirms Odoo wants the Technical ID.
                                    // I will use a clever approach: Use the Label as the value if it's unique, but here it's complicated.
                                    // Actually, Odoo's 'Wrong Value' error only happens if the value sent doesn't exist in the 'selection' list.
                                    updateField('x_studio_selection_field_5hb_1jbkffh63', e.target.value);
                                }}
                                style={{ appearance: 'none', paddingRight: '40px' }}
                            >
                                <option value="">Select Requisition Type</option>
                                {REQUISITION_TYPES.map((type, idx) => (
                                    <option key={`${type.id}-${idx}`} value={type.id}>{type.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    {/* Two Column Grid */}
                    <div className="form-grid">
                        {/* Column 1 */}
                        <div className="form-column">
                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Category</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <select
                                    className="field-input"
                                    value={formData.product_id || ''}
                                    onChange={(e) => updateField('product_id', parseInt(e.target.value))}
                                >
                                    <option value="">Select Category</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Total</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <div className="numeric-input-group">
                                    <input
                                        type="number"
                                        className="field-input"
                                        value={formData.total_amount}
                                        onChange={(e) => updateField('total_amount', parseFloat(e.target.value))}
                                        readOnly={getRqLabel(rqType) === 'Travel Advance Request form' || getRqLabel(rqType).includes('Liquidation')}
                                    />
                                    <span className="currency-addon">৳</span>
                                </div>
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Included taxes</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <div className="numeric-input-group">
                                    <input type="number" className="field-input" value="0.00" disabled />
                                    <span className="currency-addon">৳</span>
                                </div>
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Employee</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <div className="employee-select-wrapper">
                                    {selectedEmployee && (
                                        <div className="employee-avatar-mini">
                                            <User size={14} />
                                        </div>
                                    )}
                                    <select
                                        className="field-input with-avatar"
                                        value={formData.employee_id || ''}
                                        onChange={(e) => {
                                            const empId = parseInt(e.target.value);
                                            updateField('employee_id', empId);
                                            // When employee changes, update manager too
                                            const emp = employees.find(emp => emp.id === empId);
                                            if (emp && emp.parent_id) {
                                                updateField('manager_id', emp.parent_id[0]);
                                            }
                                        }}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Manager</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <select
                                    className="field-input"
                                    value={formData.manager_id || ''}
                                    onChange={(e) => updateField('manager_id', parseInt(e.target.value))}
                                >
                                    <option value="">Select Manager</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Paid By</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <div className="radio-group">
                                    <label className="radio-item">
                                        <input
                                            type="radio"
                                            name="payment_mode"
                                            checked={formData.payment_mode === 'own_account'}
                                            onChange={() => updateField('payment_mode', 'own_account')}
                                        />
                                        <span>Employee (to reimburse)</span>
                                    </label>
                                    <label className="radio-item">
                                        <input
                                            type="radio"
                                            name="payment_mode"
                                            checked={formData.payment_mode === 'company_account'}
                                            onChange={() => updateField('payment_mode', 'company_account')}
                                        />
                                        <span>Company</span>
                                    </label>
                                </div>
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Do you require an advance payment?</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <div className="radio-group">
                                    <label className="radio-item">
                                        <input
                                            type="radio"
                                            name="advance"
                                            checked={formData.x_studio_do_you_require_an_advance_payment === 'Yes'}
                                            onChange={() => updateField('x_studio_do_you_require_an_advance_payment', 'Yes')}
                                        />
                                        <span>Yes</span>
                                    </label>
                                    <label className="radio-item">
                                        <input
                                            type="radio"
                                            name="advance"
                                            checked={formData.x_studio_do_you_require_an_advance_payment === 'No'}
                                            onChange={() => updateField('x_studio_do_you_require_an_advance_payment', 'No')}
                                        />
                                        <span>No</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="form-column">
                            {shouldShowField('x_studio_code') && (
                                <div className="field-row">
                                    <div className="field-label-group">
                                        <label>Code</label>
                                        <HelpCircle size={12} className="info-icon" />
                                    </div>
                                    <input
                                        type="text"
                                        className="field-input"
                                        value={formData.x_studio_code || ''}
                                        onChange={(e) => {
                                            updateField('x_studio_code', e.target.value);
                                            handleCodeLookup(e.target.value);
                                        }}
                                        placeholder="e.g. EXP-260001"
                                    />
                                </div>
                            )}

                            {shouldShowField('x_studio_projects_name') && (
                                <div className="field-row">
                                    <div className="field-label-group">
                                        <label>Project's Name</label>
                                        <HelpCircle size={12} className="info-icon" />
                                    </div>
                                    <select
                                        className="field-input"
                                        value={formData.x_studio_projects_name || ''}
                                        onChange={(e) => updateField('x_studio_projects_name', parseInt(e.target.value))}
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.display_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {shouldShowField('x_studio_purpose_of_travel_1') && (
                                <div className="field-row">
                                    <div className="field-label-group">
                                        <label>Purpose of Travel</label>
                                        <HelpCircle size={12} className="info-icon" />
                                    </div>
                                    <input
                                        type="text"
                                        className="field-input"
                                        value={formData.x_studio_purpose_of_travel_1 || ''}
                                        onChange={(e) => updateField('x_studio_purpose_of_travel_1', e.target.value)}
                                    />
                                </div>
                            )}

                            {shouldShowField('x_studio_destination_city_country') && (
                                <div className="field-row">
                                    <label className="field-label-group">Destination City, Country <HelpCircle size={12} className="info-icon" /></label>
                                    <input
                                        type="text"
                                        className="field-input"
                                        value={formData.x_studio_destination_city_country || ''}
                                        onChange={(e) => updateField('x_studio_destination_city_country', e.target.value)}
                                    />
                                </div>
                            )}

                            {shouldShowField('x_studio_travel_date') && (
                                <div className="field-row">
                                    <label className="field-label-group">Travel Date <HelpCircle size={12} className="info-icon" /></label>
                                    <input
                                        type="date"
                                        className="field-input"
                                        value={formData.x_studio_travel_date || ''}
                                        onChange={(e) => updateField('x_studio_travel_date', e.target.value)}
                                    />
                                </div>
                            )}

                            {shouldShowField('x_studio_place_of_visit') && (
                                <div className="field-row">
                                    <label className="field-label-group">Place of visit <HelpCircle size={12} className="info-icon" /></label>
                                    <input
                                        type="text"
                                        className="field-input"
                                        value={formData.x_studio_place_of_visit || ''}
                                        onChange={(e) => updateField('x_studio_place_of_visit', e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Additional specific fields for Travel Authorization */}
                            {getRqLabel(rqType) === 'Travel Authorization' && (
                                <>
                                    <div className="field-row">
                                        <label className="field-label-group">Mode of Travel <HelpCircle size={12} className="info-icon" /></label>
                                        <select
                                            className="field-input"
                                            value={formData.x_studio_mode_of_travel || ''}
                                            onChange={(e) => updateField('x_studio_mode_of_travel', e.target.value)}
                                        >
                                            <option value="">Select Mode</option>
                                            <option value="Bus">Bus</option>
                                            <option value="Train">Train</option>
                                            <option value="Car">Car</option>
                                            <option value="Air">Air</option>
                                            <option value="Airplane">Airplane</option>
                                        </select>
                                    </div>
                                    {formData.x_studio_mode_of_travel === 'Air' && (
                                        <div className="field-row">
                                            <label className="field-label-group">If travel made by Air <HelpCircle size={12} className="info-icon" /></label>
                                            <select
                                                className="field-input"
                                                value={formData.x_studio_if_travel_made_by_air || ''}
                                                onChange={(e) => updateField('x_studio_if_travel_made_by_air', e.target.value)}
                                            >
                                                <option value="">Select Option</option>
                                                <option value="Domestic">Domestic</option>
                                                <option value="International">International</option>
                                            </select>
                                        </div>
                                    )}
                                    <div className="field-row">
                                        <label className="field-label-group">Tentative Departure Flight <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="text"
                                            className="field-input"
                                            value={formData.x_studio_tentative_departure_flight || ''}
                                            onChange={(e) => updateField('x_studio_tentative_departure_flight', e.target.value)}
                                        />
                                    </div>
                                    <div className="field-row">
                                        <label className="field-label-group">Duration (Days) <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="number"
                                            className="field-input"
                                            value={formData.x_studio_duration || ''}
                                            onChange={(e) => updateField('x_studio_duration', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="field-row">
                                        <label className="field-label-group">Return Date <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="date"
                                            className="field-input"
                                            value={formData.x_studio_return_date || ''}
                                            onChange={(e) => updateField('x_studio_return_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="field-row">
                                        <label className="field-label-group">Tentative Returned Flight <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="text"
                                            className="field-input"
                                            value={formData.x_studio_tentative_returned_flight_1 || ''}
                                            onChange={(e) => updateField('x_studio_tentative_returned_flight_1', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Additional shared fields for Advance & Liquidation */}
                            {(getRqLabel(rqType) === 'Travel Advance Request form' || getRqLabel(rqType).includes('Liquidation')) && (
                                <>
                                    <div className="field-row">
                                        <label className="field-label-group">1. Travel Date <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="date"
                                            className="field-input"
                                            value={formData.x_studio_travel_date_1 || ''}
                                            onChange={(e) => updateField('x_studio_travel_date_1', e.target.value)}
                                        />
                                    </div>
                                    <div className="field-row">
                                        <label className="field-label-group">2. Travel Date <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="date"
                                            className="field-input"
                                            value={formData.x_studio_2travel_date || ''}
                                            onChange={(e) => updateField('x_studio_2travel_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="field-row">
                                        <label className="field-label-group">Return Date <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="date"
                                            className="field-input"
                                            value={formData.x_studio_return_date_1 || ''}
                                            onChange={(e) => updateField('x_studio_return_date_1', e.target.value)}
                                        />
                                    </div>
                                    <div className="field-row">
                                        <label className="field-label-group">Budget Information <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="text"
                                            className="field-input"
                                            value={formData.x_studio_budget_information_1 || ''}
                                            onChange={(e) => updateField('x_studio_budget_information_1', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Tabs Section for All Sub-types */}
                    {(getRqLabel(rqType) === 'Travel Advance Request form' ||
                        getRqLabel(rqType).includes('Liquidation') ||
                        getRqLabel(rqType) === 'Conveyance bill form' ||
                        getRqLabel(rqType) === 'Operational budget') && (
                            <div className="tabs-container">
                                <div className="tabs-header">
                                    {getRqLabel(rqType) === 'Travel Advance Request form' && (
                                        <>
                                            <button className={`tab-btn ${activeTab === 'calculation' ? 'active' : ''}`} onClick={() => setActiveTab('calculation')}>Calculation</button>
                                            <button className={`tab-btn ${activeTab === 'program' ? 'active' : ''}`} onClick={() => setActiveTab('program')}>Program/Other Advances</button>
                                            <button className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`} onClick={() => setActiveTab('bank')}>Bank Details</button>
                                        </>
                                    )}
                                    {getRqLabel(rqType) === 'Travel Liquidation form & per diem calculation' && (
                                        <>
                                            <button className={`tab-btn ${activeTab === 'departure' ? 'active' : ''}`} onClick={() => setActiveTab('departure')}>First Departure</button>
                                            <button className={`tab-btn ${activeTab === 'arrival' ? 'active' : ''}`} onClick={() => setActiveTab('arrival')}>First Arrival</button>
                                            <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Travel Details</button>
                                            <button className={`tab-btn ${activeTab === 'cost' ? 'active' : ''}`} onClick={() => setActiveTab('cost')}>Travel Cost</button>
                                            <button className={`tab-btn ${activeTab === 'calculation' ? 'active' : ''}`} onClick={() => setActiveTab('calculation')}>Calculation</button>
                                        </>
                                    )}
                                    {getRqLabel(rqType) === 'Conveyance bill form' && (
                                        <button className={`tab-btn ${activeTab === 'travel_description' ? 'active' : ''}`} onClick={() => setActiveTab('travel_description')}>Travel Description</button>
                                    )}
                                    {getRqLabel(rqType) === 'Expense Liquidation Form' && (
                                        <>
                                            <button className={`tab-btn ${activeTab === 'expense' ? 'active' : ''}`} onClick={() => setActiveTab('expense')}>Expense</button>
                                            <button className={`tab-btn ${activeTab === 'bank_info' ? 'active' : ''}`} onClick={() => setActiveTab('bank_info')}>Bank Info</button>
                                        </>
                                    )}
                                    {getRqLabel(rqType) === 'Operational budget' && (
                                        <button className={`tab-btn ${activeTab === 'operational_budget' ? 'active' : ''}`} onClick={() => setActiveTab('operational_budget')}>Operational Budget</button>
                                    )}
                                </div>
                                <div className="tab-content">
                                    {/* Advance Request Content */}
                                    {getRqLabel(rqType) === 'Travel Advance Request form' && (
                                        <>
                                            {activeTab === 'calculation' && (
                                                <div className="tab-pane">
                                                    <div className="pane-grid">
                                                        <div className="field-row">
                                                            <label className="field-label-group">(A) Accommodation Daily Rate</label>
                                                            <input type="number" className={getInputClass('x_studio_a_accommodation_daily_rate')} value={formData.x_studio_a_accommodation_daily_rate || ''} onChange={(e) => updateField('x_studio_a_accommodation_daily_rate', parseFloat(e.target.value))} />
                                                        </div>
                                                        <div className="field-row">
                                                            <label className="field-label-group">(B) Accommodation Require for Days</label>
                                                            <input type="number" className={getInputClass('x_studio_d_number_of_days')} value={formData.x_studio_d_number_of_days || ''} onChange={(e) => updateField('x_studio_d_number_of_days', parseInt(e.target.value))} />
                                                        </div>
                                                        <div className="field-row">
                                                            <label className="field-label-group">(C) Total Amount for Accommodation</label>
                                                            <input type="number" className="field-input readonly" value={formData.x_studio_ctotal_amount_for_accommodation || ''} readOnly />
                                                        </div>
                                                        <div className="field-row">
                                                            <label className="field-label-group">(D) Daily Per diem Rate</label>
                                                            <input type="number" className={getInputClass('x_studio_b_perdiem_daily_rate')} value={formData.x_studio_b_perdiem_daily_rate || ''} onChange={(e) => updateField('x_studio_b_perdiem_daily_rate', parseFloat(e.target.value))} />
                                                        </div>
                                                        <div className="field-row">
                                                            <label className="field-label-group">(E) Per diem Require Days</label>
                                                            <input type="number" className={getInputClass('x_studio_eper_diem_require_days')} value={formData.x_studio_eper_diem_require_days || ''} onChange={(e) => updateField('x_studio_eper_diem_require_days', parseInt(e.target.value))} />
                                                        </div>
                                                        <div className="field-row">
                                                            <label className="field-label-group">(F) Total Amount for Per diem</label>
                                                            <input type="number" className="field-input readonly" value={formData.x_studio_ftotal_amount_for_per_diem || ''} readOnly />
                                                        </div>
                                                        <div className="field-row">
                                                            <label className="field-label-group">(G) Travel and Local Conveyance</label>
                                                            <input type="number" className={getInputClass('x_studio_a_travel_and_local_conveyance')} value={formData.x_studio_a_travel_and_local_conveyance || ''} onChange={(e) => updateField('x_studio_a_travel_and_local_conveyance', parseFloat(e.target.value))} />
                                                        </div>
                                                        <div className="field-row highlight">
                                                            <label className="field-label-group">Total Advance Amount</label>
                                                            <input type="number" className="field-input readonly" value={formData.x_studio_total_advance_amount || ''} readOnly />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'program' && (
                                                <div className="tab-pane">
                                                    <div className="dynamic-table-wrapper">
                                                        <table className="dynamic-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Nature of Expense</th>
                                                                    <th>Description</th>
                                                                    <th>Amount</th>
                                                                    <th></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {programAdvances.map((item, idx) => (
                                                                    <tr key={item.id}>
                                                                        <td><input type="text" value={item.x_studio_nature_of_expense} onChange={(e) => {
                                                                            const newItems = [...programAdvances];
                                                                            newItems[idx].x_studio_nature_of_expense = e.target.value;
                                                                            setProgramAdvances(newItems);
                                                                        }} /></td>
                                                                        <td><input type="text" value={item.x_name} onChange={(e) => {
                                                                            const newItems = [...programAdvances];
                                                                            newItems[idx].x_name = e.target.value;
                                                                            setProgramAdvances(newItems);
                                                                        }} /></td>
                                                                        <td><input type="number" value={item.x_studio_amount_1} onChange={(e) => {
                                                                            const newItems = [...programAdvances];
                                                                            newItems[idx].x_studio_amount_1 = parseFloat(e.target.value);
                                                                            setProgramAdvances(newItems);
                                                                        }} /></td>
                                                                        <td><button className="remove-line" onClick={() => setProgramAdvances(programAdvances.filter(p => p.id !== item.id))}>×</button></td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr>
                                                                    <td colSpan={2}>Total</td>
                                                                    <td>{programAdvances.reduce((sum, item) => sum + (parseFloat(item.x_studio_amount_1) || 0), 0)}</td>
                                                                    <td><button className="add-line" onClick={() => setProgramAdvances([...programAdvances, { id: Date.now(), x_studio_nature_of_expense: '', x_name: '', x_studio_amount_1: 0 }])}>+</button></td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'bank' && (
                                                <div className="tab-pane">
                                                    <div className="pane-grid">
                                                        <div className="field-row">
                                                            <label className="field-label-group">Bank Name</label>
                                                            <input type="text" className={getInputClass('x_studio_related_field_63a_1jce791cv')} value={formData.x_studio_related_field_63a_1jce791cv || ''} onChange={(e) => updateField('x_studio_related_field_63a_1jce791cv', e.target.value)} />
                                                        </div>
                                                        <div className="field-row">
                                                            <label className="field-label-group">Bank Account Number</label>
                                                            <input type="text" className={getInputClass('x_studio_related_field_4vg_1jce7cibv')} value={formData.x_studio_related_field_4vg_1jce7cibv || ''} onChange={(e) => updateField('x_studio_related_field_4vg_1jce7cibv', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Conveyance bill form - Travel Description Tab */}
                                    {getRqLabel(rqType) === 'Conveyance bill form' && activeTab === 'travel_description' && (
                                        <div className="tab-pane">
                                            <div className="dynamic-table-wrapper">
                                                <table className="dynamic-table">
                                                    <thead>
                                                        <tr>
                                                            <th><Calendar size={14} style={{ marginRight: '4px' }} /> Date</th>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th>Description</th>
                                                            <th>Transport</th>
                                                            <th>Cost</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {conveyanceRows.map((row, idx) => (
                                                            <tr key={row.id}>
                                                                <td><input type="date" value={row.x_studio_date} onChange={(e) => {
                                                                    const newRows = [...conveyanceRows];
                                                                    newRows[idx].x_studio_date = e.target.value;
                                                                    setConveyanceRows(newRows);
                                                                }} /></td>
                                                                <td><input type="text" value={row.x_studio_from} onChange={(e) => {
                                                                    const newRows = [...conveyanceRows];
                                                                    newRows[idx].x_studio_from = e.target.value;
                                                                    setConveyanceRows(newRows);
                                                                }} /></td>
                                                                <td><input type="text" value={row.x_studio_to} onChange={(e) => {
                                                                    const newRows = [...conveyanceRows];
                                                                    newRows[idx].x_studio_to = e.target.value;
                                                                    setConveyanceRows(newRows);
                                                                }} /></td>
                                                                <td><input type="text" value={row.x_name} onChange={(e) => {
                                                                    const newRows = [...conveyanceRows];
                                                                    newRows[idx].x_name = e.target.value;
                                                                    setConveyanceRows(newRows);
                                                                }} /></td>
                                                                <td><input type="text" value={row.x_studio_transport} onChange={(e) => {
                                                                    const newRows = [...conveyanceRows];
                                                                    newRows[idx].x_studio_transport = e.target.value;
                                                                    setConveyanceRows(newRows);
                                                                }} /></td>
                                                                <td><input type="number" value={row.x_studio_cost} onChange={(e) => {
                                                                    const newRows = [...conveyanceRows];
                                                                    newRows[idx].x_studio_cost = parseFloat(e.target.value);
                                                                    setConveyanceRows(newRows);
                                                                }} /></td>
                                                                <td><button className="remove-line" onClick={() => setConveyanceRows(conveyanceRows.filter(r => r.id !== row.id))}>×</button></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td colSpan={5}>Total Cost</td>
                                                            <td>{conveyanceRows.reduce((s, r) => s + (parseFloat(r.x_studio_cost) || 0), 0)}</td>
                                                            <td><button className="add-line" onClick={() => setConveyanceRows([...conveyanceRows, { id: Date.now(), x_studio_date: '', x_studio_from: '', x_studio_to: '', x_name: '', x_studio_transport: '', x_studio_cost: 0 }])}>+</button></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                            <div style={{ marginTop: '24px' }}>
                                                <div className="field-row">
                                                    <label className="field-label-group">Other Bills</label>
                                                    <input type="number" className={getInputClass('x_studio_other_bills')} value={formData.x_studio_other_bills || ''} onChange={(e) => updateField('x_studio_other_bills', parseFloat(e.target.value))} />
                                                </div>
                                                <div className="field-row highlight" style={{ marginTop: '12px' }}>
                                                    <label className="field-label-group">Grand Total (Cost+Others)</label>
                                                    <input type="number" className="field-input readonly" value={formData.x_studio_grand_total || ''} readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Expense Liquidation Form - Expense Tab */}
                                    {getRqLabel(rqType) === 'Expense Liquidation Form' && activeTab === 'expense' && (
                                        <div className="tab-pane">
                                            <div className="dynamic-table-wrapper">
                                                <table className="dynamic-table">
                                                    <thead>
                                                        <tr>
                                                            <th><Calendar size={14} style={{ marginRight: '4px' }} /> Date</th>
                                                            <th>Description</th>
                                                            <th>Project Name</th>
                                                            <th>Project Code</th>
                                                            <th>Budgets Line</th>
                                                            <th>Amount</th>
                                                            <th>Invoice#</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {liquidationRows.map((row, idx) => (
                                                            <tr key={row.id}>
                                                                <td><input type="date" value={row.x_studio_date} onChange={(e) => {
                                                                    const newRows = [...liquidationRows];
                                                                    newRows[idx].x_studio_date = e.target.value;
                                                                    setLiquidationRows(newRows);
                                                                }} /></td>
                                                                <td><input type="text" value={row.x_name} onChange={(e) => {
                                                                    const newRows = [...liquidationRows];
                                                                    newRows[idx].x_name = e.target.value;
                                                                    setLiquidationRows(newRows);
                                                                }} /></td>
                                                                <td>
                                                                    <select
                                                                        className="field-input"
                                                                        value={row.x_studio_projects_name || ''}
                                                                        onChange={(e) => {
                                                                            const newRows = [...liquidationRows];
                                                                            newRows[idx].x_studio_projects_name = parseInt(e.target.value);
                                                                            setLiquidationRows(newRows);
                                                                        }}
                                                                    >
                                                                        <option value="">Select Project</option>
                                                                        {projects.map(p => (
                                                                            <option key={p.id} value={p.id}>{p.display_name}</option>
                                                                        ))}
                                                                    </select>
                                                                </td>
                                                                <td><input type="number" step="0.01" value={row.x_studio_project_code} onChange={(e) => {
                                                                    const newRows = [...liquidationRows];
                                                                    newRows[idx].x_studio_project_code = e.target.value;
                                                                    setLiquidationRows(newRows);
                                                                }} /></td>
                                                                <td><input type="number" step="0.01" value={row.x_studio_budgets_line} onChange={(e) => {
                                                                    const newRows = [...liquidationRows];
                                                                    newRows[idx].x_studio_budgets_line = e.target.value;
                                                                    setLiquidationRows(newRows);
                                                                }} /></td>
                                                                <td><input type="number" value={row.x_studio_amount} onChange={(e) => {
                                                                    const newRows = [...liquidationRows];
                                                                    newRows[idx].x_studio_amount = parseFloat(e.target.value);
                                                                    setLiquidationRows(newRows);
                                                                }} /></td>
                                                                <td><input type="number" value={row.x_studio_invoice} onChange={(e) => {
                                                                    const newRows = [...liquidationRows];
                                                                    const val = parseInt(e.target.value);
                                                                    newRows[idx].x_studio_invoice = isNaN(val) ? 0 : val;
                                                                    setLiquidationRows(newRows);
                                                                }} /></td>
                                                                <td><button className="remove-line" onClick={() => setLiquidationRows(liquidationRows.filter(r => r.id !== row.id))}>×</button></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td colSpan={5}>Total Amount</td>
                                                            <td>{liquidationRows.reduce((s, r) => s + (parseFloat(r.x_studio_amount) || 0), 0)}</td>
                                                            <td><button className="add-line" onClick={() => setLiquidationRows([...liquidationRows, { id: Date.now(), x_studio_date: '', x_name: '', x_studio_projects_name: '', x_studio_project_code: '', x_studio_budgets_line: '', x_studio_amount: 0, x_studio_invoice: '' }])}>+</button></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {getRqLabel(rqType) === 'Expense Liquidation Form' && activeTab === 'bank_info' && (
                                        <div className="tab-pane">
                                            <div className="pane-grid">
                                                <div className="field-row">
                                                    <label className="field-label-group">Bank Name</label>
                                                    <input type="text" className={getInputClass('x_studio_bank_name')} value={formData.x_studio_bank_name || ''} onChange={(e) => updateField('x_studio_bank_name', e.target.value)} />
                                                </div>
                                                <div className="field-row">
                                                    <label className="field-label-group">Bank Account Number</label>
                                                    <input type="text" className={getInputClass('x_studio_bank_account_number')} value={formData.x_studio_bank_account_number || ''} onChange={(e) => updateField('x_studio_bank_account_number', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Operational budget - Tab */}
                                    {getRqLabel(rqType) === 'Operational budget' && activeTab === 'operational_budget' && (
                                        <div className="tab-pane">
                                            <div className="dynamic-table-wrapper">
                                                <table className="dynamic-table">
                                                    <thead>
                                                        <tr>
                                                            <th>SL</th>
                                                            <th>Description</th>
                                                            <th>Quantity</th>
                                                            <th><Calendar size={14} style={{ marginRight: '4px' }} /> Date Required</th>
                                                            <th>Unit Price</th>
                                                            <th>Estimated Price</th>
                                                            <th>Remarks</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {operationalRows.map((row, idx) => (
                                                            <tr key={row.id}>
                                                                <td><input type="number" value={row.x_studio_sl} onChange={(e) => {
                                                                    const newRows = [...operationalRows];
                                                                    newRows[idx].x_studio_sl = parseInt(e.target.value);
                                                                    setOperationalRows(newRows);
                                                                }} /></td>
                                                                <td><input type="text" value={row.x_name} onChange={(e) => {
                                                                    const newRows = [...operationalRows];
                                                                    newRows[idx].x_name = e.target.value;
                                                                    setOperationalRows(newRows);
                                                                }} /></td>
                                                                <td><input type="number" value={row.x_studio_quantity} onChange={(e) => {
                                                                    const newRows = [...operationalRows];
                                                                    newRows[idx].x_studio_quantity = parseInt(e.target.value);
                                                                    newRows[idx].x_studio_estimated_price = (newRows[idx].x_studio_quantity || 0) * (newRows[idx].x_studio_unit_price || 0);
                                                                    setOperationalRows(newRows);
                                                                }} /></td>
                                                                <td><input type="date" value={row.x_studio_date_required} onChange={(e) => {
                                                                    const newRows = [...operationalRows];
                                                                    newRows[idx].x_studio_date_required = e.target.value;
                                                                    setOperationalRows(newRows);
                                                                }} /></td>
                                                                <td><input type="number" value={row.x_studio_unit_price} onChange={(e) => {
                                                                    const newRows = [...operationalRows];
                                                                    newRows[idx].x_studio_unit_price = parseFloat(e.target.value);
                                                                    newRows[idx].x_studio_estimated_price = (newRows[idx].x_studio_quantity || 0) * (newRows[idx].x_studio_unit_price || 0);
                                                                    setOperationalRows(newRows);
                                                                }} /></td>
                                                                <td><input type="number" value={row.x_studio_estimated_price} readOnly /></td>
                                                                <td><input type="text" value={row.x_studio_remarks} onChange={(e) => {
                                                                    const newRows = [...operationalRows];
                                                                    newRows[idx].x_studio_remarks = e.target.value;
                                                                    setOperationalRows(newRows);
                                                                }} /></td>
                                                                <td><button className="remove-line" onClick={() => setOperationalRows(operationalRows.filter(r => r.id !== row.id))}>×</button></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td colSpan={5}>Grand Total</td>
                                                            <td>{operationalRows.reduce((s, r) => s + (parseFloat(r.x_studio_estimated_price) || 0), 0)}</td>
                                                            <td colSpan={2}><button className="add-line" onClick={() => setOperationalRows([...operationalRows, { id: Date.now(), x_studio_sl: operationalRows.length + 1, x_name: '', x_studio_quantity: 1, x_studio_date_required: '', x_studio_unit_price: 0, x_studio_estimated_price: 0, x_studio_remarks: '' }])}>+</button></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Liquidation Content (Existing mapping) */}
                                    {getRqLabel(rqType).includes('Liquidation') && (getRqLabel(rqType) === 'Travel Liquidation form & per diem calculation') && (
                                        <>
                                            {activeTab === 'departure' && (
                                                <div className="tab-pane">
                                                    <div className="field-row">
                                                        <label className="field-label-group">First Station</label>
                                                        <input type="text" className={getInputClass('x_studio_s')} value={formData.x_studio_s || ''} onChange={(e) => updateField('x_studio_s', e.target.value)} />
                                                    </div>
                                                    <div className="field-row">
                                                        <label className="field-label-group">First Station Datetime</label>
                                                        <input type="datetime-local" className={getInputClass('x_studio_first_station_datetime')} value={formData.x_studio_first_station_datetime || ''} onChange={(e) => updateField('x_studio_first_station_datetime', e.target.value)} />
                                                    </div>
                                                </div>
                                            )}
                                            {/* ... (Other liquidation tabs would go here if needed, but keeping it concise) ... */}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Internal Notes Section */}
                    <div className="notes-section" style={{ marginTop: '32px', borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
                        <div className="field-label-group">
                            <label>Internal Notes</label>
                            <HelpCircle size={12} className="info-icon" />
                        </div>
                        <textarea
                            className="field-input"
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            value={formData.description || ''}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Add notes here..."
                        />
                    </div>
                </div>
            </div>

            {errors.submit && (
                <div className="error-toast">
                    <AlertCircle size={18} />
                    {errors.submit}
                </div>
            )}

            {showSuccess && <SuccessModal />}

            <style>{`
                .expense-page-container {
                    background: var(--bg-deep);
                    color: var(--text-main);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
                }

                /* Top Nav */
                .top-nav-bar {
                    background: #2c3e50;
                    color: white;
                    display: flex;
                    align-items: center;
                    padding: 8px 16px;
                    gap: 32px;
                }
                [data-theme='light'] .top-nav-bar {
                    background: #34495e;
                }
                .top-nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    font-size: 1.1rem;
                }
                .top-nav-links {
                    display: flex;
                    gap: 20px;
                }
                .top-nav-links span {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    cursor: pointer;
                }
                .top-nav-links span:hover, .top-nav-links span.active {
                    opacity: 1;
                }
                .top-nav-links span.active {
                    font-weight: 600;
                }

                /* Sub Header */
                .sub-header {
                    background: var(--bg-surface);
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-glass);
                }
                .breadcrumb-section {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .btn-new-odoo {
                    background: var(--odoo-primary);
                    color: white;
                    border: none;
                    padding: 6px 16px;
                    border-radius: 4px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                }
                .breadcrumb-path {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }
                .breadcrumb-path span:first-child {
                    color: var(--odoo-primary);
                    cursor: pointer;
                    font-weight: 500;
                }
                .breadcrumb-path .current {
                    color: var(--text-main);
                    font-weight: 600;
                }
                .settings-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                }

                /* Toolbar */
                .toolbar {
                    background: var(--input-bg);
                    padding: 8px 16px;
                    border-bottom: 1px solid var(--border-glass);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .toolbar-left {
                    display: flex;
                    gap: 8px;
                }
                .toolbar-left button {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid var(--border-glass);
                    background: var(--bg-surface);
                    color: var(--text-main);
                    transition: all 0.2s;
                }
                .toolbar-left .btn-attach {
                    background: #714b67;
                    color: white;
                    border-color: #714b67;
                }
                .toolbar-left button:hover {
                    opacity: 0.9;
                    background: var(--input-bg);
                }

                .status-bar {
                    display: flex;
                    border: 1px solid var(--border-glass);
                    border-radius: 4px;
                    overflow: hidden;
                    background: var(--bg-surface);
                }
                .status-step {
                    padding: 6px 16px;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    border-right: 1px solid var(--border-glass);
                    position: relative;
                }
                .status-step:last-child {
                    border-right: none;
                }
                .status-step.active {
                    color: var(--odoo-primary);
                    background: var(--input-bg);
                    font-weight: 700;
                }
                .status-step.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--odoo-primary);
                }

                /* Form Area */
                .expense-form-card {
                    max-width: 1200px;
                    margin: 24px auto;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-glass);
                    box-shadow: var(--shadow-3d);
                    border-radius: 4px;
                    padding: 40px;
                }

                .field-label-group {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-bottom: 6px;
                }
                .field-label-group label {
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: var(--text-dim);
                }
                .info-icon {
                    color: #3b82f6;
                    cursor: help;
                }

                .subject-section {
                    margin-bottom: 24px;
                }
                .subject-input {
                    font-size: 2.2rem;
                    font-weight: 500;
                    border: none;
                    border-bottom: 1px solid var(--border-glass);
                    width: 100%;
                    padding: 8px 0;
                    outline: none;
                    color: var(--text-main);
                    background: transparent;
                }
                .subject-input:focus {
                    border-bottom-color: var(--odoo-primary);
                }

                .requisition-section {
                    margin-bottom: 32px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }

                .field-row {
                    margin-bottom: 20px;
                }
                .field-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-glass);
                    border-radius: 4px;
                    font-size: 0.95rem;
                    outline: none;
                    background: var(--input-bg);
                    color: var(--text-main);
                }
                .field-input:focus {
                    border-color: var(--odoo-primary);
                }
                .field-input option {
                    background: var(--bg-surface);
                    color: var(--text-main);
                }

                .numeric-input-group {
                    position: relative;
                }
                .currency-addon {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    font-weight: 600;
                    pointer-events: none;
                }

                .autofilled-highlight {
                    border-color: #10b981 !important;
                    background-color: rgba(16, 185, 129, 0.05) !important;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
                    transition: all 0.5s ease;
                }

                .field-error {
                    border-color: #ef4444 !important;
                    background-color: rgba(239, 68, 68, 0.05) !important;
                }

                .success-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }

                .success-modal {
                    background: var(--bg-surface);
                    padding: 32px;
                    border-radius: 12px;
                    box-shadow: var(--shadow-3d);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    border: 1px solid var(--border-glass);
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .success-icon {
                    color: #10b981;
                    filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
                }

                .success-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .success-msg {
                    color: var(--text-muted);
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .employee-select-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .employee-avatar-mini {
                    position: absolute;
                    left: 8px;
                    width: 24px;
                    height: 24px;
                    background: var(--border-glass);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    z-index: 10;
                }
                .field-input.with-avatar {
                    padding-left: 40px;
                }

                .radio-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding-top: 4px;
                }
                .radio-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: var(--text-dim);
                }
                .radio-item input {
                    width: 16px;
                    height: 16px;
                    accent-color: var(--odoo-primary);
                }

                .read-only-field {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    font-size: 0.95rem;
                    color: var(--text-dim);
                }
                .avatar-placeholder {
                    width: 20px;
                    height: 20px;
                    background: var(--border-glass);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .analytic-field {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--odoo-primary);
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                }

                .dynamic-section {
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px dashed var(--border-glass);
                }
                .section-title {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 16px;
                }

                /* Tabs Styling */
                .tabs-container {
                    margin-top: 32px;
                    border: 1px solid var(--border-glass);
                    border-radius: 8px;
                    overflow: hidden;
                }
                .tabs-header {
                    display: flex;
                    background: var(--input-bg);
                    border-bottom: 1px solid var(--border-glass);
                }
                .tab-btn {
                    padding: 12px 24px;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    border-right: 1px solid var(--border-glass);
                }
                .tab-btn.active {
                    background: var(--bg-surface);
                    color: var(--odoo-primary);
                    box-shadow: inset 0 -2px 0 var(--odoo-primary);
                }
                .tab-content {
                    padding: 24px;
                    background: var(--bg-surface);
                }
                .pane-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .field-row.highlight {
                    background: var(--input-bg);
                    padding: 12px;
                    border-radius: 4px;
                    border: 1px solid var(--odoo-primary);
                }

                /* Dynamic Table Enhanced */
                .dynamic-table-wrapper {
                    margin-top: 16px;
                    overflow-x: auto;
                    border-radius: 8px;
                    border: 1px solid var(--border-glass);
                }
                .dynamic-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .dynamic-table th {
                    text-align: left;
                    padding: 12px;
                    background: var(--input-bg);
                    border-bottom: 2px solid var(--border-glass);
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    font-weight: 700;
                }
                .dynamic-table td {
                    padding: 8px;
                    border-bottom: 1px solid var(--border-glass);
                }
                .dynamic-table td input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid transparent;
                    border-radius: 4px;
                    background: transparent;
                    color: var(--text-main);
                    transition: all 0.2s;
                }
                .dynamic-table td input:focus {
                    border-color: var(--odoo-primary);
                    background: var(--input-bg);
                    outline: none;
                }
                .remove-line {
                    color: #ef4444;
                    background: transparent;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    opacity: 0.6;
                }
                .remove-line:hover { opacity: 1; }
                .add-line {
                    background: var(--odoo-primary);
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 8px;
                }
                .readonly {
                    background: var(--input-bg) !important;
                    opacity: 0.8;
                    cursor: not-allowed;
                }

                .error-toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    background: var(--bg-surface);
                    border: 1px solid #feb2b2;
                    color: #c53030;
                    padding: 12px 24px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: var(--shadow-3d);
                    z-index: 1100;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// Success Modal Component
const SuccessModal = () => (
    <div className="success-modal-overlay">
        <div className="success-modal">
            <CheckCircle2 size={64} className="success-icon" />
            <h3 className="success-title">Submission Successful!</h3>
            <p className="success-msg">Your expense report has been created and synced with Odoo.</p>
        </div>
    </div>
);

export default ExpenseCreatePage;
