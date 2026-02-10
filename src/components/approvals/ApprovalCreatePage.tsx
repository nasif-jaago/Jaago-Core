import React, { useState, useEffect } from 'react';
import { ChevronLeft, Loader, CheckCircle, AlertCircle, Layout, Code } from 'lucide-react';
import {
    createApprovalRequest,
    type ApprovalCategory,
    type ApprovalFormValues,
    type ApprovalField
} from '../../api/ApprovalsService';
import { getUid } from '../../api/odoo';
import ApprovalDynamicFieldRenderer from './ApprovalDynamicFieldRenderer';

interface ApprovalCreatePageProps {
    categories: ApprovalCategory[];
    fields: Record<string, ApprovalField>;
    onBack: () => void;
    onSuccess: () => void;
}

const ApprovalCreatePage: React.FC<ApprovalCreatePageProps> = ({ categories, fields, onBack, onSuccess }) => {
    const [formData, setFormData] = useState<ApprovalFormValues>({
        name: '',
        category_id: undefined,
        reason: '',
        amount: undefined,
        date: new Date().toISOString().split('T')[0]
    });

    const [selectedCategory, setSelectedCategory] = useState<ApprovalCategory | null>(null);
    const [activeTab, setActiveTab] = useState<'standard' | 'studio'>('standard');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const uid = await getUid();
            setCurrentUserId(uid);
        } catch (error) {
            console.error('Failed to get current user:', error);
        }
    };

    // Filter fields into standard and studio
    const standardFieldNames = [
        'name', 'category_id', 'request_owner_id', 'reason',
        'amount', 'date', 'date_end', 'quantity', 'reference',
        'request_status'
    ];

    const studioFields = Object.keys(fields)
        .filter(key => key.startsWith('x_studio_'))
        .map(key => fields[key]);

    const handleCategoryChange = (categoryId: number) => {
        const category = categories.find(c => c.id === categoryId);
        setSelectedCategory(category || null);
        setFormData({ ...formData, category_id: categoryId });
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'Request name is required';
        }
        if (!formData.category_id) {
            newErrors.category_id = 'Category is required';
        }
        if (selectedCategory?.has_amount === 'required' && !formData.amount) {
            newErrors.amount = 'Amount is required for this category';
        }

        // Add validation for required studio fields
        studioFields.forEach(field => {
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.string} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            const hasStandardErrors = standardFieldNames.some(name => errors[name]);
            const hasStudioErrors = studioFields.some(field => errors[field.name]);

            if (hasStudioErrors && !hasStandardErrors) {
                setActiveTab('studio');
            } else {
                setActiveTab('standard');
            }
            return;
        }

        setSaving(true);
        try {
            const submitData = { ...formData };
            if (currentUserId) {
                submitData.request_owner_id = currentUserId;
            }

            const result = await createApprovalRequest(submitData);

            if (result.success) {
                onSuccess();
            } else {
                setErrors({ submit: result.error || 'Failed to create approval request' });
            }
        } catch (err: any) {
            setErrors({ submit: err.message || 'Unexpected error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

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
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Approvals</p>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>New Approval Request</h2>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                {/* Form Card */}
                <div className="card" style={{ flex: 2, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-card)' }}>
                        <button
                            onClick={() => setActiveTab('standard')}
                            style={{
                                flex: 1, padding: '1.25rem', background: 'transparent',
                                border: 'none', borderBottom: activeTab === 'standard' ? '3px solid var(--primary)' : 'none',
                                color: activeTab === 'standard' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Layout size={18} /> Standard Details
                        </button>
                        <button
                            onClick={() => setActiveTab('studio')}
                            style={{
                                flex: 1, padding: '1.25rem', background: 'transparent',
                                border: 'none', borderBottom: activeTab === 'studio' ? '3px solid var(--primary)' : 'none',
                                color: activeTab === 'studio' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Code size={18} /> Odoo Studio Fields ({studioFields.length})
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                            {activeTab === 'standard' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                                Request Name <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.name}
                                                onChange={(e) => updateField('name', e.target.value)}
                                                placeholder="e.g., Annual Leave Request, Budget Approval"
                                                style={{ width: '100%', fontSize: '1rem', padding: '12px' }}
                                            />
                                            {errors.name && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '6px' }}>{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                                Category <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <select
                                                className="input-field"
                                                value={formData.category_id || ''}
                                                onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
                                                style={{ width: '100%' }}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>{category.name}</option>
                                                ))}
                                            </select>
                                            {errors.category_id && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '6px' }}>{errors.category_id}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                            Reason / Description
                                        </label>
                                        <textarea
                                            className="input-field"
                                            value={formData.reason || ''}
                                            onChange={(e) => updateField('reason', e.target.value)}
                                            placeholder="Provide complete details about your request..."
                                            rows={5}
                                            style={{ width: '100%', resize: 'vertical' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                        {(selectedCategory?.has_date === 'required' || selectedCategory?.has_date === 'optional') && (
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                                    Date {selectedCategory?.has_date === 'required' && <span style={{ color: '#ef4444' }}>*</span>}
                                                </label>
                                                <input
                                                    type="date"
                                                    className="input-field"
                                                    value={formData.date || ''}
                                                    onChange={(e) => updateField('date', e.target.value)}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        )}

                                        {(selectedCategory?.has_amount === 'required' || selectedCategory?.has_amount === 'optional') && (
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                                    Amount {selectedCategory?.has_amount === 'required' && <span style={{ color: '#ef4444' }}>*</span>}
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    value={formData.amount || ''}
                                                    onChange={(e) => updateField('amount', parseFloat(e.target.value))}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    style={{ width: '100%' }}
                                                />
                                                {errors.amount && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '6px' }}>{errors.amount}</p>}
                                            </div>
                                        )}

                                        {(selectedCategory?.has_quantity === 'required' || selectedCategory?.has_quantity === 'optional') && (
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                                    Quantity {selectedCategory?.has_quantity === 'required' && <span style={{ color: '#ef4444' }}>*</span>}
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    value={formData.quantity || ''}
                                                    onChange={(e) => updateField('quantity', parseInt(e.target.value))}
                                                    placeholder="1"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {selectedCategory?.has_period === 'required' || selectedCategory?.has_period === 'optional' ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    className="input-field"
                                                    value={formData.date || ''}
                                                    onChange={(e) => updateField('date', e.target.value)}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    className="input-field"
                                                    value={formData.date_end || ''}
                                                    onChange={(e) => updateField('date_end', e.target.value)}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    {selectedCategory?.has_reference === 'required' || selectedCategory?.has_reference === 'optional' ? (
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                                Reference Number
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.reference || ''}
                                                onChange={(e) => updateField('reference', e.target.value)}
                                                placeholder="e.g., REF-12345"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {studioFields.map(field => (
                                        <div key={field.name}>
                                            <ApprovalDynamicFieldRenderer
                                                field={field}
                                                value={formData[field.name]}
                                                onChange={(val) => updateField(field.name, val)}
                                            />
                                            {errors[field.name] && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '-8px', marginBottom: '16px' }}>{errors[field.name]}</p>}
                                        </div>
                                    ))}
                                    {studioFields.length === 0 && (
                                        <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center' }}>
                                            <Code size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', opacity: 0.2 }} />
                                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No custom Odoo Studio fields are currently active for Approvals.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-card)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                            {errors.submit && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.9rem', fontWeight: 500 }}>
                                    <AlertCircle size={18} />
                                    {errors.submit}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={onBack}
                                style={{
                                    padding: '12px 24px', borderRadius: '12px',
                                    background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                    color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600
                                }}
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={saving}
                                style={{ minWidth: '180px', padding: '12px 24px', fontSize: '1rem' }}
                            >
                                {saving ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Loader className="spin" size={20} /> Creating...
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <CheckCircle size={20} /> Submit Request
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Layout size={20} color="var(--primary)" /> Request Specs
                        </h4>

                        {selectedCategory ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Category Description</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{selectedCategory.description || 'No description provided.'}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>REQUIRED FIELDS</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Name</span>
                                        {selectedCategory.has_amount === 'required' && <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Amount</span>}
                                        {selectedCategory.has_date === 'required' && <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Date</span>}
                                        {selectedCategory.has_period === 'required' && <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Period</span>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>Select a category to see specific requirements.</p>
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: '1.5rem', background: 'var(--primary-glow)' }}>
                        <h5 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>Approval Process</h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                            Once submitted, your request will be routed to the appropriate managers for review. You can track the status in real-time from the dashboard.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .fade-in {
                    animation: fadeIn 0.4s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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

export default ApprovalCreatePage;
