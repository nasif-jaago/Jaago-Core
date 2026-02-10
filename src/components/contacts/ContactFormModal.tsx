import React, { useState, useEffect } from 'react';
import { X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { createContact, getStudioFields } from '../../api/ContactsService';
import { fetchCompanies, fetchRecords } from '../../api/odoo';
import type { ContactFormValues, ContactField } from '../../types/contacts';
import { validateEmail, validatePhone } from '../../utils/contactHelpers';
import DynamicFieldRenderer from './DynamicFieldRenderer';

interface ContactFormModalProps {
    onClose: () => void;
    onSuccess: () => void;

}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<ContactFormValues>({
        name: '',
        email: '',
        phone: '',
        website: '',
        is_company: false,
        customer_rank: 0,
        supplier_rank: 0,
        employee: false,
        street: '',
        city: '',
        zip: ''
    });

    const [companies, setCompanies] = useState<any[]>([]);
    const [titles, setTitles] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);

    const [studioFields, setStudioFields] = useState<ContactField[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        console.log('Loading contact form data...');
        try {
            const results = await Promise.allSettled([
                fetchCompanies(),
                fetchRecords('res.partner.title', ['name', 'shortcut']),
                fetchRecords('res.country', ['name'], [], 300), // Increase limit for countries
                fetchRecords('res.country.state', ['name', 'country_id'], [], 1000), // Increase limit for states
                getStudioFields()
            ]);

            const [companiesRes, titlesRes, countriesRes, statesRes, studioFieldsRes] = results;

            // Handle Companies
            if (companiesRes.status === 'fulfilled' && companiesRes.value.success && Array.isArray(companiesRes.value.data)) {
                setCompanies(companiesRes.value.data);
            } else {
                console.warn('Failed to load companies', companiesRes);
            }

            // Handle Titles
            if (titlesRes.status === 'fulfilled' && titlesRes.value.success && Array.isArray(titlesRes.value.data)) {
                setTitles(titlesRes.value.data);
            }

            // Handle Countries
            if (countriesRes.status === 'fulfilled' && countriesRes.value.success && Array.isArray(countriesRes.value.data)) {
                setCountries(countriesRes.value.data);
            }

            // Handle States
            if (statesRes.status === 'fulfilled' && statesRes.value.success && Array.isArray(statesRes.value.data)) {
                setStates(statesRes.value.data);
            }

            // Handle Studio Fields
            if (studioFieldsRes.status === 'fulfilled') {
                setStudioFields(studioFieldsRes.value);
            }
        } catch (err) {
            console.error('Critical error loading form data:', err);
        } finally {
            setLoading(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'Name is required';
        }

        if (formData.email && !validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Invalid phone format';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setSaving(true);
        try {
            const result = await createContact(formData);

            if (result.success) {
                onSuccess();
            } else {
                setErrors({ submit: result.error || 'Failed to create contact' });
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
                    animation: 'slideUp 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem', borderBottom: '1px solid var(--border-glass)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Create New Contact
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn-icon"
                        style={{ width: '32px', height: '32px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                                <Loader className="spin" size={40} color="var(--primary)" />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Basic Information */}
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                                        Basic Information
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                Name <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.name}
                                                onChange={(e) => updateField('name', e.target.value)}
                                                placeholder="Enter contact name"
                                                style={{ width: '100%' }}
                                            />
                                            {errors.name && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="input-field"
                                                value={formData.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                                placeholder="email@example.com"
                                                style={{ width: '100%' }}
                                            />
                                            {errors.email && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                className="input-field"
                                                value={formData.phone}
                                                onChange={(e) => updateField('phone', e.target.value)}
                                                placeholder="+1234567890"
                                                style={{ width: '100%' }}
                                            />
                                            {errors.phone && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>{errors.phone}</p>}
                                        </div>



                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                Company
                                            </label>
                                            <select
                                                className="input-field"
                                                value={formData.company_id || ''}
                                                onChange={(e) => updateField('company_id', e.target.value ? parseInt(e.target.value) : undefined)}
                                                style={{ width: '100%' }}
                                            >
                                                <option value="">Select Company</option>
                                                {companies.map(company => (
                                                    <option key={company.id} value={company.id}>{company.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                Website
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.website || ''}
                                                onChange={(e) => updateField('website', e.target.value)}
                                                placeholder="https://example.com"
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                Job Position
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.function || ''}
                                                onChange={(e) => updateField('function', e.target.value)}
                                                placeholder="e.g. Sales Manager"
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                Title
                                            </label>
                                            <select
                                                className="input-field"
                                                value={formData.title || ''}
                                                onChange={(e) => updateField('title', e.target.value ? parseInt(e.target.value) : undefined)}
                                                style={{ width: '100%' }}
                                            >
                                                <option value="">Select Title</option>
                                                {titles.map(title => (
                                                    <option key={title.id} value={title.id}>{title.name || title.shortcut}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Type */}
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                                        Contact Type
                                    </h4>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_company || false}
                                                onChange={(e) => updateField('is_company', e.target.checked)}
                                            />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Is Company</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={(formData.customer_rank || 0) > 0}
                                                onChange={(e) => updateField('customer_rank', e.target.checked ? 1 : 0)}
                                            />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Customer</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={(formData.supplier_rank || 0) > 0}
                                                onChange={(e) => updateField('supplier_rank', e.target.checked ? 1 : 0)}
                                            />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Vendor</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.employee || false}
                                                onChange={(e) => updateField('employee', e.target.checked)}
                                            />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Employee</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                                        Address
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                Street
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.street || ''}
                                                onChange={(e) => updateField('street', e.target.value)}
                                                placeholder="Street address"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.street2 || ''}
                                                onChange={(e) => updateField('street2', e.target.value)}
                                                placeholder="Street address line 2"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.city || ''}
                                                onChange={(e) => updateField('city', e.target.value)}
                                                placeholder="City"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                State
                                            </label>
                                            <select
                                                className="input-field"
                                                value={formData.state_id || ''}
                                                onChange={(e) => updateField('state_id', e.target.value ? parseInt(e.target.value) : undefined)}
                                                style={{ width: '100%' }}
                                                disabled={!formData.country_id} // Optimization: only enable if country selected? Or just show all
                                            >
                                                <option value="">Select State</option>
                                                {states
                                                    .filter(s => !formData.country_id || s.country_id[0] === formData.country_id)
                                                    .map(state => (
                                                        <option key={state.id} value={state.id}>{state.name}</option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.zip || ''}
                                                onChange={(e) => updateField('zip', e.target.value)}
                                                placeholder="ZIP"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                                                Country
                                            </label>
                                            <select
                                                className="input-field"
                                                value={formData.country_id || ''}
                                                onChange={(e) => updateField('country_id', e.target.value ? parseInt(e.target.value) : undefined)}
                                                style={{ width: '100%' }}
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map(country => (
                                                    <option key={country.id} value={country.id}>{country.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Studio Custom Fields */}
                                {studioFields.length > 0 && (
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                                            Custom Fields
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {studioFields.map(field => (
                                                <DynamicFieldRenderer
                                                    key={field.name}
                                                    field={field}
                                                    value={formData[field.name]}
                                                    onChange={(value) => updateField(field.name, value)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '1rem 1.5rem', borderTop: '1px solid var(--border-glass)',
                        display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
                    }}>
                        {errors.submit && (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.85rem' }}>
                                <AlertCircle size={16} />
                                {errors.submit}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px', borderRadius: '10px',
                                background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                            style={{ minWidth: '120px' }}
                        >
                            {saving ? (
                                <>
                                    <Loader className="spin" size={16} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    Create Contact
                                </>
                            )}
                        </button>
                    </div>
                </form>
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

export default ContactFormModal;
