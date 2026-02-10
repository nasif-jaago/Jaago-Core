import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { fetchExpenseRelationOptions } from '../../api/ExpensesService';
import type { ExpenseField } from '../../api/ExpensesService';

interface ExpenseDynamicFieldRendererProps {
    field: ExpenseField;
    value: any;
    onChange: (value: any) => void;
    readonly?: boolean;
}

const ExpenseDynamicFieldRenderer: React.FC<ExpenseDynamicFieldRendererProps> = ({ field, value, onChange, readonly = false }) => {
    const [options, setOptions] = useState<any[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    // Fetch options for many2one fields
    useEffect(() => {
        if (field.type === 'many2one' && field.relation && !readonly) {
            loadOptions();
        }
    }, [field.relation, field.type]);

    const loadOptions = async () => {
        if (!field.relation) return;
        setLoadingOptions(true);
        const res = await fetchExpenseRelationOptions(field.relation, [], 100);
        if (res.success && res.data) {
            setOptions(res.data);
        }
        setLoadingOptions(false);
    };

    const renderInput = () => {
        // Boolean field
        if (field.type === 'boolean') {
            return (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: readonly ? 'not-allowed' : 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => onChange(e.target.checked)}
                            disabled={readonly}
                            style={{ cursor: readonly ? 'not-allowed' : 'pointer', width: '16px', height: '16px' }}
                        />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{field.string}</span>
                    </label>
                    {field.help && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '24px' }}>{field.help}</p>}
                </div>
            );
        }

        // Selection field
        if (field.type === 'selection' && field.selection) {
            return (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                        {field.string}
                        {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                        <select
                            className="input-field"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            disabled={readonly}
                            style={{ width: '100%', cursor: readonly ? 'not-allowed' : 'pointer', appearance: 'none' }}
                        >
                            <option value="">-- Select --</option>
                            {field.selection.map(([key, label]: any) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <div style={{ pointerEvents: 'none', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem' }}>▼</div>
                    </div>
                </div>
            );
        }

        // Many2one field
        if (field.type === 'many2one') {
            return (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                        {field.string}
                        {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                        {loadingOptions ? (
                            <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Loader size={12} className="spin" /> Loading...
                            </div>
                        ) : (
                            <select
                                className="input-field"
                                value={Array.isArray(value) ? value[0] : (value || '')}
                                onChange={(e) => onChange(parseInt(e.target.value))}
                                disabled={readonly}
                                style={{ width: '100%', cursor: readonly ? 'not-allowed' : 'pointer' }}
                            >
                                <option value="">-- Select {field.string} --</option>
                                {options.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.display_name || opt.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            );
        }

        // Text / Textarea
        if (field.type === 'text' || field.type === 'html') {
            return (
                <div style={{ marginBottom: '1rem', gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                        {field.string}
                        {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    <textarea
                        className="input-field"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={readonly}
                        rows={3}
                        style={{ width: '100%', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                        placeholder={field.help || ''}
                    />
                </div>
            );
        }

        // Date / DateTime
        if (field.type === 'date' || field.type === 'datetime') {
            return (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                        {field.string}
                        {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    <input
                        type={field.type === 'datetime' ? 'datetime-local' : 'date'}
                        className="input-field"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={readonly}
                        style={{ width: '100%' }}
                    />
                </div>
            );
        }

        // Numeric
        if (field.type === 'integer' || field.type === 'float' || field.type === 'monetary' || field.type === 'float_time') {
            return (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                        {field.string}
                        {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    <input
                        type="number"
                        className="input-field"
                        value={value || ''}
                        onChange={(e) => onChange(field.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))}
                        disabled={readonly}
                        step={field.type === 'integer' ? '1' : '0.01'}
                        style={{ width: '100%' }}
                    />
                </div>
            );
        }

        // Default Char
        return (
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                    {field.string}
                    {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                </label>
                <input
                    type="text"
                    className="input-field"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={readonly}
                    style={{ width: '100%' }}
                    placeholder={field.help || ''}
                />
            </div>
        );
    };

    return renderInput();
};

export default ExpenseDynamicFieldRenderer;
