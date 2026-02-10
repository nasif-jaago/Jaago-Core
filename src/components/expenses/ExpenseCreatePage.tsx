import React, { useState, useEffect } from 'react';
import {
    Loader, AlertCircle,
    Paperclip, Send, Split, Settings, HelpCircle,
    User, Building2, PieChart
} from 'lucide-react';
import {
    createExpense,
    type ExpenseProduct,
    type ExpenseFormValues,
    type ExpenseField
} from '../../api/ExpensesService';
import { getUid } from '../../api/odoo';

interface ExpenseCreatePageProps {
    products: ExpenseProduct[];
    employees: any[];
    fields: Record<string, ExpenseField>;
    onBack: () => void;
    onSuccess: () => void;
}

const REQUISITION_TYPES = [
    { id: 'Option 1', label: 'Travel Authorization & Advance Request form and Travel Allowance & Daily Allowance Form' },
    { id: 'Conveyance bill from', label: 'Conveyance bill from' },
    { id: 'Option 2', label: 'Expense Liquidation Form' },
    { id: 'Operational budget', label: 'Operational budget' }
];

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
        x_studio_selection_field_5hb_1jbkffh63: 'Option 1'
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadCurrentUser();
        // Try to pre-select current employee if possible
        if (employees.length > 0 && !formData.employee_id) {
            const currentEmployee = employees[0]; // Simplified for now
            updateField('employee_id', currentEmployee.id);
        }
    }, [employees]);

    const loadCurrentUser = async () => {
        try {
            await getUid();
            // User ID fetched for side effects or validation if needed
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
            const submitData = {
                ...formData,
                price_unit: formData.total_amount || 0
            };

            const result = await createExpense(submitData, companyId);
            if (result.success) {
                onSuccess();
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

    const selectedEmployee = employees.find(e => e.id === formData.employee_id);
    const rqType = formData.x_studio_selection_field_5hb_1jbkffh63;

    // Helper to determine if a field should be shown
    const shouldShowField = (fieldName: string) => {
        if (!rqType) return true;

        // Travel related
        if (fieldName.includes('purpose_of_travel') || fieldName.includes('flight') || fieldName.includes('station')) {
            return rqType === 'Option 1' || rqType === 'Option 2';
        }

        // Liquidation related
        if (fieldName.includes('liquidation') || fieldName.includes('advance_amount') || fieldName.includes('balance_due')) {
            return rqType === 'Option 2';
        }

        // Budget related
        if (fieldName.includes('budget')) {
            return rqType === 'Operational budget';
        }

        // Project related
        if (fieldName === 'x_studio_projects_name') {
            return rqType === 'Option 1' || rqType === 'Conveyance bill from' || rqType === 'Operational budget';
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
                    <button className="btn-attach" onClick={() => { }}>
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
                        <div className="requisition-pills">
                            {REQUISITION_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`requisition-pill ${formData.x_studio_selection_field_5hb_1jbkffh63 === type.id ? 'active' : ''}`}
                                    onClick={() => updateField('x_studio_selection_field_5hb_1jbkffh63', type.id)}
                                >
                                    {type.label}
                                </button>
                            ))}
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
                                        onChange={(e) => updateField('employee_id', parseInt(e.target.value))}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
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
                                        onChange={(e) => updateField('x_studio_code', e.target.value)}
                                    />
                                </div>
                            )}

                            {shouldShowField('x_studio_projects_name') && (
                                <div className="field-row">
                                    <div className="field-label-group">
                                        <label>Project's Name</label>
                                        <HelpCircle size={12} className="info-icon" />
                                    </div>
                                    <input
                                        type="text"
                                        className="field-input"
                                        value={formData.x_studio_projects_name || ''}
                                        onChange={(e) => updateField('x_studio_projects_name', e.target.value)}
                                    />
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

                            {/* Dynamic Studio Fields Section */}
                            {rqType === 'Option 1' && (
                                <div className="dynamic-section">
                                    <h4 className="section-title">Travel Details</h4>
                                    <div className="field-row">
                                        <label className="field-label-group">Destination City, Country <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="text"
                                            className="field-input"
                                            value={formData.x_studio_destination_city_country || ''}
                                            onChange={(e) => updateField('x_studio_destination_city_country', e.target.value)}
                                        />
                                    </div>
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
                                            <option value="Airplane">Airplane</option>
                                        </select>
                                    </div>
                                    <div className="field-row">
                                        <label className="field-label-group">Duration (Days) <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="number"
                                            className="field-input"
                                            value={formData.x_studio_duration || ''}
                                            onChange={(e) => updateField('x_studio_duration', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {rqType === 'Option 2' && (
                                <div className="dynamic-section">
                                    <h4 className="section-title">Liquidation Details</h4>
                                    <div className="field-row">
                                        <label className="field-label-group">Less: Cash Advance <HelpCircle size={12} className="info-icon" /></label>
                                        <input
                                            type="number"
                                            className="field-input"
                                            value={formData.x_studio_less_cash_advance || ''}
                                            onChange={(e) => updateField('x_studio_less_cash_advance', parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Company</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <div className="read-only-field">
                                    <Building2 size={14} />
                                    <span>JAAGO Foundation</span>
                                </div>
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Manager</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <div className="read-only-field">
                                    <div className="avatar-placeholder"><User size={12} /></div>
                                    <span>Korvi Rakshand</span>
                                </div>
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Account</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <div className="read-only-field">
                                    <span>500200 Expense Clearing Account</span>
                                </div>
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Customer to Reinvoice</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <input type="text" className="field-input" placeholder="Select customer..." />
                            </div>

                            <div className="field-row">
                                <div className="field-label-group">
                                    <label>Analytic Distribution</label>
                                    <HelpCircle size={12} className="info-icon" />
                                </div>
                                <div className="analytic-field">
                                    <PieChart size={14} />
                                    <span>Add a line</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {errors.submit && (
                <div className="error-toast">
                    <AlertCircle size={18} />
                    {errors.submit}
                </div>
            )}

            <style>{`
                .expense-page-container {
                    background: #f8fafc;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Inter', -apple-system, system-ui, sans-serif;
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
                    background: white;
                    padding: 12px 16px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .breadcrumb-section {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .btn-new-odoo {
                    background: #008784;
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
                    color: #718096;
                    font-size: 0.95rem;
                }
                .breadcrumb-path span:first-child {
                    color: #008784;
                    cursor: pointer;
                    font-weight: 500;
                }
                .breadcrumb-path .current {
                    color: #2d3748;
                    font-weight: 600;
                }
                .settings-btn {
                    background: transparent;
                    border: none;
                    color: #718096;
                    cursor: pointer;
                    display: flex;
                }

                /* Toolbar */
                .toolbar {
                    background: #f1f5f9;
                    padding: 8px 16px;
                    border-bottom: 1px solid #cbd5e1;
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
                    border: 1px solid #cbd5e1;
                    background: #f8fafc;
                    color: #475569;
                    transition: all 0.2s;
                }
                .toolbar-left .btn-attach {
                    background: #714b67;
                    color: white;
                    border-color: #714b67;
                }
                .toolbar-left button:hover {
                    opacity: 0.9;
                }

                .status-bar {
                    display: flex;
                    border: 1px solid #cbd5e1;
                    border-radius: 4px;
                    overflow: hidden;
                    background: white;
                }
                .status-step {
                    padding: 6px 16px;
                    font-size: 0.8rem;
                    color: #94a3b8;
                    border-right: 1px solid #cbd5e1;
                    position: relative;
                }
                .status-step:last-child {
                    border-right: none;
                }
                .status-step.active {
                    color: #008784;
                    background: #f0fdf4;
                    font-weight: 700;
                }
                .status-step.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #008784;
                }

                /* Form Area */
                .expense-form-card {
                    max-width: 1200px;
                    margin: 24px auto;
                    background: white;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
                    color: #4a5568;
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
                    border-bottom: 1px solid #edf2f7;
                    width: 100%;
                    padding: 8px 0;
                    outline: none;
                    color: #1a202c;
                }
                .subject-input:focus {
                    border-bottom-color: #008784;
                }

                .requisition-section {
                    margin-bottom: 32px;
                }
                .requisition-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .requisition-pill {
                    padding: 10px 16px;
                    border-radius: 6px;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                    max-width: 300px;
                    text-align: left;
                    line-height: 1.3;
                }
                .requisition-pill:hover {
                    background: #e2e8f0;
                }
                .requisition-pill.active {
                    background: #ecfeff;
                    border-color: #008784;
                    color: #008784;
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
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    font-size: 0.95rem;
                    outline: none;
                }
                .field-input:focus {
                    border-color: #008784;
                    box-shadow: 0 0 0 1px #008784;
                }

                .numeric-input-group {
                    position: relative;
                }
                .currency-addon {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #718096;
                    font-weight: 600;
                    pointer-events: none;
                }

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
                    background: #edf2f7;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #718096;
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
                    color: #2d3748;
                }
                .radio-item input {
                    width: 16px;
                    height: 16px;
                    accent-color: #008784;
                }

                .read-only-field {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    font-size: 0.95rem;
                    color: #2d3748;
                }
                .avatar-placeholder {
                    width: 20px;
                    height: 20px;
                    background: #edf2f7;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .analytic-field {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #008784;
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                }

                .dynamic-section {
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px dashed #e2e8f0;
                }
                .section-title {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 16px;
                }

                .error-toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    background: #fff5f5;
                    border: 1px solid #feb2b2;
                    color: #c53030;
                    padding: 12px 24px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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

export default ExpenseCreatePage;
