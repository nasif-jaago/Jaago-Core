import React, { useState, useEffect, useMemo } from 'react';
import {
    Shield, Plus, Settings, Trash2, Edit2, CheckCircle2,
    Filter, Layers, UserCheck, Search, X, Check, Save
} from 'lucide-react';
import {
    fetchApprovalRules,
    fetchRequisitionCategories,
    createApprovalRule,
    updateApprovalRule,
    deleteApprovalRule,
    fetchEmployees
} from '../../api/RequisitionsService';
import DomainBuilder from './DomainBuilder';
import type { ApprovalRule, RequisitionCategory, Employee } from '../../types/requisition';

const ApprovalRulesManager: React.FC = () => {
    const [rules, setRules] = useState<ApprovalRule[]>([]);
    const [categories, setCategories] = useState<RequisitionCategory[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [approverSearch, setApproverSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');

    const [currentRule, setCurrentRule] = useState<Partial<ApprovalRule>>({
        name: '',
        domain: '[]',
        approver_ids: [],
        active: true,
        conditional: true,
        message: ''
    });

    useEffect(() => {
        loadData();
    }, [selectedCategory]); // Fixed: Reload when category changes

    const loadData = async () => {
        setLoading(true);
        const [ruleRes, catRes, empRes] = await Promise.all([
            fetchApprovalRules(),
            fetchRequisitionCategories(),
            fetchEmployees('', 500)
        ]);

        if (ruleRes.success) setRules(ruleRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
        if (empRes.success) setEmployees(empRes.data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!currentRule.name) {
            alert('Rule name is required');
            return;
        }

        setLoading(true);
        const res = currentRule.id
            ? await updateApprovalRule(currentRule.id, currentRule)
            : await createApprovalRule(currentRule as Omit<ApprovalRule, 'id'>);

        if (res.success) {
            setIsEditing(false);
            resetCurrentRule();
            loadData();
        } else {
            alert('Error saving rule: ' + res.error);
        }
        setLoading(false);
    };

    const resetCurrentRule = () => {
        setCurrentRule({
            name: '',
            domain: '[]',
            approver_ids: [],
            active: true,
            conditional: true,
            message: ''
        });
        setApproverSearch('');
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this rule?')) return;
        setLoading(true);
        const res = await deleteApprovalRule(id);
        if (res.success) loadData();
        setLoading(false);
    };

    const startEdit = (rule: ApprovalRule) => {
        setCurrentRule(rule);
        setIsEditing(true);
    };

    const filteredApprovers = useMemo(() => {
        return employees.filter(e =>
            e.name.toLowerCase().includes(approverSearch.toLowerCase()) ||
            (e.work_email && e.work_email.toLowerCase().includes(approverSearch.toLowerCase()))
        );
    }, [employees, approverSearch]);

    const filteredCategories = useMemo(() => {
        return categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    }, [categories, categorySearch]);

    return (
        <div className="fade-in" style={{ fontSize: '0.85rem' }}>
            {/* Header / Page Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={14} color="var(--primary)" />
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>ADMINISTRATION</span>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Workflow Rules Engine</h1>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn-primary"
                        style={{ background: 'var(--primary-gradient)', color: '#000', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800 }}
                    >
                        <Plus size={18} /> NEW RULE
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="card fade-in" style={{ padding: '1.5rem', border: '1px solid var(--border-glass)', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings size={20} color="var(--primary)" /> {currentRule.id ? 'Modify Workflow Step' : 'Configure New Workflow Step'}
                        </h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => { setIsEditing(false); resetCurrentRule(); }} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>Cancel</button>
                            <button onClick={handleSave} className="btn-primary" style={{ padding: '6px 20px', fontSize: '0.75rem', fontWeight: 800 }}>
                                <Save size={14} style={{ marginRight: '6px' }} /> {currentRule.id ? 'UPDATE' : 'DEPLOY'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 1.5fr)', gap: '1.5rem' }}>
                        {/* Configuration Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>RULE / STEP NAME</label>
                                <input
                                    className="input-field"
                                    value={currentRule.name}
                                    onChange={e => setCurrentRule({ ...currentRule, name: e.target.value })}
                                    placeholder="e.g., Manager Approval"
                                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>DESCRIPTION / MESSAGE</label>
                                <input
                                    className="input-field"
                                    value={currentRule.message || ''}
                                    onChange={e => setCurrentRule({ ...currentRule, message: e.target.value })}
                                    placeholder="e.g., Approval needed for this action"
                                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={currentRule.exclusive_user || false}
                                        onChange={e => setCurrentRule({ ...currentRule, exclusive_user: e.target.checked })}
                                    />
                                    Exclusive Approval
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={currentRule.conditional !== false}
                                        onChange={e => setCurrentRule({ ...currentRule, conditional: e.target.checked })}
                                    />
                                    Conditional Rule
                                </label>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>AUTHORED APPROVERS</label>
                                    <div style={{ position: 'relative', width: '180px' }}>
                                        <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            placeholder="Search approver..."
                                            className="input-field"
                                            value={approverSearch}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setApproverSearch(val);
                                                // Trigger server search if 2+ chars
                                                if (val.length >= 2) {
                                                    fetchEmployees(val).then(res => {
                                                        if (res.success && res.data) {
                                                            console.log(`Live search for "${val}" found ${res.data.length} employees`);
                                                            setEmployees(prev => {
                                                                const combined = [...prev, ...res.data!];
                                                                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                                                                return unique;
                                                            });
                                                        } else if (!res.success) {
                                                            console.error('Live employee search failed:', res.error);
                                                        }
                                                    });
                                                }
                                            }}
                                            style={{ padding: '4px 8px 4px 26px', fontSize: '0.7rem', width: '100%' }}
                                        />
                                    </div>
                                </div>
                                <div className="card" style={{ padding: '8px', flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', maxHeight: '300px' }}>
                                    {filteredApprovers.length === 0 ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>No employees found.</div>
                                    ) : (
                                        filteredApprovers.map(emp => (
                                            <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', cursor: 'pointer', borderRadius: '6px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={currentRule.approver_ids?.includes(emp.id)}
                                                    onChange={e => {
                                                        const ids = [...(currentRule.approver_ids || [])];
                                                        if (e.target.checked) ids.push(emp.id);
                                                        else ids.splice(ids.indexOf(emp.id), 1);
                                                        setCurrentRule({ ...currentRule, approver_ids: ids });
                                                    }}
                                                />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{emp.name}</span>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{emp.work_email || 'No email set'}</span>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Domain Builder Right */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>DOMAIN CONDITIONS</label>
                                <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, padding: '2px 6px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '4px' }}>ODOO SYNTAX ENGINE</div>
                            </div>
                            <DomainBuilder
                                domain={currentRule.domain || '[]'}
                                onChange={d => setCurrentRule({ ...currentRule, domain: d })}
                            />
                            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px dashed var(--border-glass)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <Shield size={14} /> Rule Application Logic
                                </h4>
                                <ul style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '1.25rem' }}>
                                    <li>Rules are evaluated when a requisition is submitted for approval.</li>
                                    <li>If all/any conditions match, this approval step is added to the chain.</li>
                                    <li>Amount thresholds apply automatically in addition to domain conditions.</li>
                                    <li>"Hierarchy Supervisor" type uses standard Odoo employee parent relationship.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Filters & Navigation */}
                    <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={16} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>CATEGORY:</span>
                        </div>

                        <div style={{ flex: 1, display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`btn-secondary ${selectedCategory === 'all' ? 'active' : ''}`}
                                style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '20px', background: selectedCategory === 'all' ? 'var(--primary-glow)' : 'transparent', border: selectedCategory === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-glass)' }}
                            >All Requisitions</button>

                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`btn-secondary ${selectedCategory === cat.id ? 'active' : ''}`}
                                    style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '20px', background: selectedCategory === cat.id ? 'var(--primary-glow)' : 'transparent', border: selectedCategory === cat.id ? '1px solid var(--primary)' : '1px solid var(--border-glass)' }}
                                >{cat.name}</button>
                            ))}
                        </div>

                        <div style={{ position: 'relative', width: '200px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                placeholder="Search rules..."
                                className="input-field"
                                style={{ padding: '6px 10px 6px 30px', fontSize: '0.75rem', borderRadius: '20px' }}
                            />
                        </div>
                    </div>

                    {/* Rules List */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>WORKFLOW STEP</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>DOMAIN / LOGIC</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', width: '100px' }}>STATUS</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', width: '80px' }}>OP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '3rem', textAlign: 'center' }}>
                                            <div className="spinner-small" style={{ margin: '0 auto' }}></div>
                                        </td>
                                    </tr>
                                ) : rules.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <Layers size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <p style={{ fontSize: '0.8rem' }}>No workflow rules defined yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    rules.map(rule => (
                                        <tr key={rule.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>{rule.name}</div>
                                                {rule.message && (
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                        {rule.message}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: 'var(--primary)', fontWeight: 700 }}>
                                                    <UserCheck size={10} /> {rule.approver_ids?.length || 0} Approver(s)
                                                    {rule.exclusive_user && <span style={{ marginLeft: '8px', color: '#f59e0b' }}>• Exclusive</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {rule.domain && rule.domain !== '[]' ? (
                                                        <div style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600 }}>
                                                            <Filter size={10} /> Domain Conditions Applied
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>No conditions</div>
                                                    )}
                                                    {rule.conditional && (
                                                        <div style={{ fontSize: '0.6rem', color: '#f59e0b' }}>Conditional</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                {rule.active ? (
                                                    <span style={{ fontSize: '0.6rem', color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 800, padding: '2px 8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '10px' }}>
                                                        <Check size={10} /> ACTIVE
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 800, padding: '2px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}>
                                                        <X size={10} /> DISABLED
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => startEdit(rule)} className="btn-secondary" style={{ padding: '4px', borderRadius: '4px' }}>
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button onClick={() => handleDelete(rule.id!)} className="btn-secondary" style={{ padding: '4px', borderRadius: '4px', color: '#ef4444' }}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default ApprovalRulesManager;
