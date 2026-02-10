import React, { useState, useEffect } from 'react';
import {
    fetchEmployees, fetchDepartments, fetchCompanies
} from '../../api/odoo';
import {
    Search, Filter, List, LayoutGrid, MoreHorizontal,
    ChevronLeft, Download, Plus, ChevronDown, CheckSquare,
    User, MapPin, Building2, Briefcase
} from 'lucide-react';
import EmployeeCreatePage from './EmployeeCreatePage';

const EmployeesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // View State
    const [view, setView] = useState<'list' | 'create'>('list');

    // Filter States
    const [selectedDeptId, setSelectedDeptId] = useState<number | 'All'>('All');
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | 'All'>('All');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let result = employees;

        // Search Filter
        if (searchTerm) {
            result = result.filter(emp =>
                (emp.name && emp.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (emp.barcode && emp.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (emp.work_email && emp.work_email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Company Filter
        if (selectedCompanyId !== 'All') {
            result = result.filter(emp => emp.company_id && emp.company_id[0] === selectedCompanyId);
        }

        // Department Filter
        if (selectedDeptId !== 'All') {
            result = result.filter(emp => emp.department_id && emp.department_id[0] === selectedDeptId);
        }

        setFilteredEmployees(result);
    }, [searchTerm, selectedDeptId, selectedCompanyId, employees]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [empRes, deptRes, compRes] = await Promise.all([
                fetchEmployees(),
                fetchDepartments(),
                fetchCompanies()
            ]);

            if (empRes.success && empRes.data) setEmployees(empRes.data);
            if (deptRes.success && deptRes.data) setDepartments(deptRes.data);
            if (compRes.success && compRes.data) setCompanies(compRes.data);

            if (!empRes.success) setError(empRes.error || 'Failed to load employees');
        } catch (err: any) {
            setError(err?.message || 'Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    const getEmployeeCount = (type: 'company' | 'department', id: number | 'All') => {
        if (id === 'All') return employees.length;
        if (type === 'company') return employees.filter(e => e.company_id && e.company_id[0] === id).length;
        return employees.filter(e => e.department_id && e.department_id[0] === id).length;
    };

    if (view === 'create') {
        return (
            <EmployeeCreatePage
                onBack={() => setView('list')}
                onSuccess={() => {
                    setView('list');
                    loadData();
                }}
            />
        );
    }

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--text-main)' }}>
            {/* Top Header/Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={onBack}
                        className="btn-icon"
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                            borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'var(--transition)', boxShadow: 'var(--shadow-3d)'
                        }}
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Employees</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setView('create')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> New
                    </button>
                    <button style={{
                        background: 'var(--input-bg)', border: '1px solid var(--border)',
                        borderRadius: '10px', padding: '8px 16px', color: 'var(--text-main)',
                        fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                    }}>
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Control Bar */}
            <div style={{
                display: 'flex', gap: '1rem', marginBottom: '1.5rem',
                background: 'var(--surface)', padding: '12px', borderRadius: '14px',
                border: '1px solid var(--border)', flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search employee by name, barcode, or email..."
                        className="input-field"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '40px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{
                        background: 'var(--input-bg)', border: '1px solid var(--border)',
                        borderRadius: '10px', padding: '8px 16px', color: 'var(--text-main)',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer'
                    }}>
                        <Filter size={16} /> Filters <ChevronDown size={14} />
                    </button>
                    <div style={{ display: 'flex', background: 'var(--input-bg)', borderRadius: '10px', padding: '4px' }}>
                        <button style={{ background: 'var(--card-bg)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'var(--primary)', cursor: 'pointer' }}><List size={18} /></button>
                        <button style={{ background: 'transparent', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-muted)', cursor: 'pointer' }}><LayoutGrid size={18} /></button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                {/* Sidebar Filters */}
                <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>

                    {/* Company Filter */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <Building2 size={16} color="var(--primary)" />
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Company</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div
                                onClick={() => setSelectedCompanyId('All')}
                                style={{
                                    padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                                    background: selectedCompanyId === 'All' ? 'rgba(245, 197, 24, 0.15)' : 'transparent',
                                    color: selectedCompanyId === 'All' ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: selectedCompanyId === 'All' ? 700 : 400
                                }}
                            >
                                <span>All</span>
                            </div>
                            {companies.map(comp => (
                                <div
                                    key={comp.id}
                                    onClick={() => setSelectedCompanyId(comp.id)}
                                    style={{
                                        padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: selectedCompanyId === comp.id ? 'rgba(245, 197, 24, 0.15)' : 'transparent',
                                        color: selectedCompanyId === comp.id ? 'var(--primary)' : 'var(--text-main)',
                                        fontWeight: selectedCompanyId === comp.id ? 700 : 400
                                    }}
                                >
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp.name}</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{getEmployeeCount('company', comp.id)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <Briefcase size={16} color="var(--primary)" />
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Department</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div
                                onClick={() => setSelectedDeptId('All')}
                                style={{
                                    padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                                    background: selectedDeptId === 'All' ? 'rgba(245, 197, 24, 0.15)' : 'transparent',
                                    color: selectedDeptId === 'All' ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: selectedDeptId === 'All' ? 700 : 400
                                }}
                            >
                                <span>All</span>
                            </div>
                            {departments.map(dept => (
                                <div
                                    key={dept.id}
                                    onClick={() => setSelectedDeptId(dept.id)}
                                    style={{
                                        padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: selectedDeptId === dept.id ? 'rgba(245, 197, 24, 0.15)' : 'transparent',
                                        color: selectedDeptId === dept.id ? 'var(--primary)' : 'var(--text-main)',
                                        fontWeight: selectedDeptId === dept.id ? 700 : 400
                                    }}
                                >
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dept.name}</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{getEmployeeCount('department', dept.id)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Table View */}
                <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ overflowX: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                                <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '16px 20px', width: '20px' }}><CheckSquare size={16} /></th>
                                    <th style={{ padding: '16px' }}>Employee</th>
                                    <th style={{ padding: '16px' }}>Badge ID</th>
                                    <th style={{ padding: '16px' }}>Department</th>
                                    <th style={{ padding: '16px' }}>Job Position</th>
                                    <th style={{ padding: '16px' }}>Manager</th>
                                    <th style={{ padding: '16px' }}>Work Location</th>
                                    <th style={{ padding: '16px', width: '40px' }}><MoreHorizontal size={18} /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(8).fill(0).map((_, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td colSpan={8} style={{ padding: '24px' }}><div className="pulse" style={{ height: '20px', background: 'var(--input-bg)', borderRadius: '4px' }} /></td>
                                        </tr>
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '60px', textAlign: 'center' }}>
                                            <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>
                                            <button onClick={loadData} className="btn-primary">Retry Connection</button>
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>No employee records found matching your filters.</td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px 20px' }}><div style={{ width: '16px', height: '16px', border: '1px solid var(--border)', borderRadius: '4px' }} /></td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                        {emp.image_128 ? <img src={`data:image/png;base64,${emp.image_128}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="#000" />}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{emp.name}</p>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.work_email || 'no email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem' }}>{emp.barcode || '---'}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--input-bg)', fontSize: '0.7rem', border: '1px solid var(--border)', fontWeight: 600 }}>
                                                    {emp.department_id ? emp.department_id[1] : 'Unassigned'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem' }}>{emp.job_title || emp.job_id?.[1] || '---'}</td>
                                            <td style={{ padding: '16px' }}>
                                                {emp.parent_id ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>{emp.parent_id[1].charAt(0)}</div>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{emp.parent_id[1]}</span>
                                                    </div>
                                                ) : '---'}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    <MapPin size={14} /> {emp.address_id ? emp.address_id[1] : 'JAAGO Foundation'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeesPage;
