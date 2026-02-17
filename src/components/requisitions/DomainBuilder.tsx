import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, ChevronDown, Check, X } from 'lucide-react';
import { fetchRequisitionFields, fetchRequisitionRelationOptions } from '../../api/RequisitionsService';
import type { RequisitionField } from '../../types/requisition';

interface Condition {
    field: string;
    operator: string;
    value: any;
}

interface DomainBuilderProps {
    domain: string;
    onChange: (domain: string) => void;
}

const OPERATORS = [
    { label: 'is equal to', value: '=' },
    { label: 'is not equal to', value: '!=' },
    { label: 'greater than', value: '>' },
    { label: 'greater than or equal to', value: '>=' },
    { label: 'lower than', value: '<' },
    { label: 'lower than or equal to', value: '<=' },
    { label: 'is between', value: 'between' },
    { label: 'contains', value: 'ilike' },
    { label: 'does not contain', value: 'not ilike' },
    { label: 'is set', value: '!= False' },
    { label: 'is not set', value: '= False' }
];

const ValueEditor: React.FC<{
    field: RequisitionField;
    operator: string;
    value: any;
    onChange: (val: any) => void;
}> = ({ field, operator, value, onChange }) => {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (field?.type === 'many2one' && field.relation) {
            loadOptions();
        }
    }, [field]);

    const loadOptions = async () => {
        setLoading(true);
        const res = await fetchRequisitionRelationOptions(field.relation!, [], 200);
        if (res.success) {
            setOptions(res.data || []);
        }
        setLoading(false);
    };

    if (operator === 'between') {
        const parts = (value || '').toString().split(',');
        const val1 = parts[0] || '';
        const val2 = parts[1] || '';

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <input
                    type="number"
                    className="input-field"
                    value={val1}
                    onChange={e => onChange(`${e.target.value},${val2}`)}
                    placeholder="Min"
                    style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                />
                <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>→</span>
                <input
                    type="number"
                    className="input-field"
                    value={val2}
                    onChange={e => onChange(`${val1},${e.target.value}`)}
                    placeholder="Max"
                    style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                />
            </div>
        );
    }

    if (field?.type === 'many2one') {
        return (
            <select
                className="input-field"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                disabled={loading}
            >
                <option value="">Select {field.string}...</option>
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.display_name || opt.name}</option>
                ))}
            </select>
        );
    }

    if (field?.type === 'selection' && field.selection) {
        return (
            <select
                className="input-field"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
            >
                <option value="">Select...</option>
                {field.selection.map(([val, label]: any) => (
                    <option key={val} value={val}>{label}</option>
                ))}
            </select>
        );
    }

    if (field?.type === 'boolean') {
        return (
            <select
                className="input-field"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
            >
                <option value="True">Yes / True</option>
                <option value="False">No / False</option>
            </select>
        );
    }

    if (field?.type === 'float' || field?.type === 'monetary' || field?.type === 'integer') {
        return (
            <input
                type="number"
                className="input-field"
                value={value === 'False' ? '' : value}
                onChange={e => onChange(e.target.value)}
                placeholder="0.00"
                style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
            />
        );
    }

    return (
        <input
            className="input-field"
            value={value === 'False' ? '' : (value || '')}
            onChange={e => onChange(e.target.value)}
            placeholder="Value..."
            style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
        />
    );
};

const DomainBuilder: React.FC<DomainBuilderProps> = ({ domain, onChange }) => {
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [matchType, setMatchType] = useState<'all' | 'any'>('all');
    const [fields, setFields] = useState<Record<string, RequisitionField>>({});
    const [fieldOptions, setFieldOptions] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const lastSerialized = React.useRef<string>('');

    useEffect(() => {
        loadFields();
    }, []);

    useEffect(() => {
        // Only parse if the domain changed externally
        if (domain !== lastSerialized.current && Object.keys(fields).length > 0) {
            parseDomain();
        }
    }, [domain, fields]);

    const loadFields = async () => {
        const res = await fetchRequisitionFields();
        if (res.success && res.data) {
            const fieldData = res.data;
            setFields(fieldData);
            const options = Object.entries(fieldData)
                .filter(([_, f]) => ['char', 'text', 'float', 'monetary', 'integer', 'selection', 'many2one', 'boolean'].includes((f as any).type))
                .map(([key, f]) => ({ label: (f as any).string, value: key }))
                .sort((a, b) => a.label.localeCompare(b.label));
            setFieldOptions(options);
        }
        setLoading(false);
    };

    const parseDomain = () => {
        if (!domain || domain === '[]') {
            setConditions([]);
            return;
        }

        try {
            let clean = domain.trim();
            let currentMatchType: 'all' | 'any' = 'all';
            if (clean.includes("'|'")) {
                currentMatchType = 'any';
                clean = clean.replace("'|', ", "");
            }
            setMatchType(currentMatchType);

            if (clean.startsWith('[') && clean.endsWith(']')) {
                clean = clean.substring(1, clean.length - 1);
            } else {
                return;
            }

            const parts = clean.split(/\), ?\(/);
            const parsed: Condition[] = parts.map(p => {
                let s = p.replace(/^\(/, '').replace(/\)$/, '');
                const match = s.match(/'([^']+)', ?'([^']+)', ?(.+)/);
                if (match) {
                    let val = match[3].trim();
                    if (val.startsWith("'") && val.endsWith("'")) {
                        val = val.substring(1, val.length - 1);
                    }
                    return {
                        field: match[1],
                        operator: match[2],
                        value: val
                    };
                }
                return null;
            }).filter(Boolean) as Condition[];

            // Group adjacent >= and <= into "between" if matchType is "all"
            const finalConditions: Condition[] = [];
            if (currentMatchType === 'all') {
                for (let i = 0; i < parsed.length; i++) {
                    const curr = parsed[i];
                    const next = parsed[i + 1];
                    if (next && curr.field === next.field && curr.operator === '>=' && next.operator === '<=') {
                        finalConditions.push({
                            field: curr.field,
                            operator: 'between',
                            value: `${curr.value},${next.value}`
                        });
                        i++; // skip next
                    } else {
                        finalConditions.push(curr);
                    }
                }
            } else {
                finalConditions.push(...parsed);
            }

            setConditions(finalConditions);
        } catch (e) {
            console.error('Failed to parse domain:', e);
        }
    };

    const serializeDomain = (newConditions: Condition[], newMatchType: 'all' | 'any') => {
        if (newConditions.length === 0) {
            lastSerialized.current = '[]';
            onChange('[]');
            return;
        }

        const serializedParts: string[] = [];
        newConditions.forEach(c => {
            const field = fields[c.field];

            if (c.operator === 'between') {
                const parts = (c.value || '').toString().split(',');
                const val1 = parts[0] ? parts[0].trim() : '0';
                const val2 = parts[1] ? parts[1].trim() : '0';

                serializedParts.push(`('${c.field}', '>=', ${val1})`);
                serializedParts.push(`('${c.field}', '<=', ${val2})`);
            } else {
                let val = c.value;
                if (field?.type === 'many2one' || field?.type === 'integer' || field?.type === 'float' || field?.type === 'monetary') {
                    if (val === '' || val === null || val === undefined || val === 'False') val = 'False';
                    else if (!isNaN(val) && val.toString().trim() !== '') val = val;
                    else val = `'${val}'`;
                } else if (val === 'True' || val === 'False') {
                    // keep unquoted
                } else {
                    val = `'${val}'`;
                }
                serializedParts.push(`('${c.field}', '${c.operator}', ${val})`);
            }
        });

        const prefix = newMatchType === 'any' ? `'|', ` : '';
        const serialized = `[${prefix}${serializedParts.join(', ')}]`;
        lastSerialized.current = serialized;
        onChange(serialized);
    };

    const addCondition = () => {
        const newConditions = [...conditions, { field: fieldOptions[0]?.value || 'name', operator: '=', value: '' }];
        setConditions(newConditions);
        serializeDomain(newConditions, matchType);
    };

    const removeCondition = (index: number) => {
        const newConditions = [...conditions];
        newConditions.splice(index, 1);
        setConditions(newConditions);
        serializeDomain(newConditions, matchType);
    };

    const updateCondition = (index: number, fieldName: keyof Condition, value: any) => {
        const newConditions = [...conditions];
        newConditions[index] = { ...newConditions[index], [fieldName]: value };

        if (fieldName === 'field') {
            const fieldInfo = fields[value];
            if (fieldInfo?.type === 'boolean') newConditions[index].value = 'True';
            else newConditions[index].value = '';
        }

        setConditions(newConditions);
        serializeDomain(newConditions, matchType);
    };

    if (loading) return <div className="spinner-small"></div>;

    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <span>Match</span>
                <select
                    value={matchType}
                    onChange={e => {
                        const val = e.target.value as 'all' | 'any';
                        setMatchType(val);
                        serializeDomain(conditions, val);
                    }}
                    style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed var(--primary)', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, padding: '0 4px' }}
                >
                    <option value="all">all</option>
                    <option value="any">any</option>
                </select>
                <span>of the following rules:</span>
            </div>

            {conditions.map((c, index) => (
                <div key={index} className="fade-in" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <select
                        className="input-field"
                        value={c.field}
                        onChange={e => updateCondition(index, 'field', e.target.value)}
                        style={{ flex: 1, minWidth: '150px', padding: '6px 8px', fontSize: '0.8rem' }}
                    >
                        {fieldOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>

                    <select
                        className="input-field"
                        value={c.operator}
                        onChange={e => updateCondition(index, 'operator', e.target.value)}
                        style={{ width: '150px', padding: '6px 8px', fontSize: '0.8rem' }}
                    >
                        {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>

                    {!['!= False', '= False'].includes(c.operator) && (
                        <div style={{ flex: 1.5, display: 'flex' }}>
                            <ValueEditor
                                field={fields[c.field]}
                                operator={c.operator}
                                value={c.value}
                                onChange={val => updateCondition(index, 'value', val)}
                            />
                        </div>
                    )}

                    <button
                        onClick={() => removeCondition(index)}
                        title="Remove Rule"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}

            <button
                onClick={addCondition}
                style={{
                    marginTop: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
            >
                <Plus size={14} /> NEW RULE
            </button>
        </div>
    );
};

export default DomainBuilder;
