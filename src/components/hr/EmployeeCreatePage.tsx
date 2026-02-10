import React, { useState, useEffect } from 'react';
import {
    createEmployee, fetchDepartments, fetchCompanies
} from '../../api/odoo';
import {
    ChevronLeft, Camera, Mail, Phone, Smartphone,
    Briefcase, Info, Save, X
} from 'lucide-react';

interface EmployeeCreatePageProps {
    onBack: () => void;
    onSuccess: () => void;
}

const EmployeeCreatePage: React.FC<EmployeeCreatePageProps> = ({ onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Work');
    const [departments, setDepartments] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        work_email: '',
        work_phone: '',
        mobile_phone: '',
        job_title: '',
        // Work section
        company_id: '',
        department_id: '',
        job_id: '',
        parent_id: '',
        address_id: '',
        // Personal information
        private_email: '',
        private_phone: '',
        bank_account_id: '',
        birthday: '',
        sex: '', // Changed from gender
        marital: 'single',
        certificate: 'other',
        study_field: '',
        study_school: '',
        emergency_contact: '',
        emergency_phone: '',
        barcode: '',
        pin: '',
        // Payroll section
        joining_date: '',
        contract_start_date: '',
        wage_type: 'monthly',
        wage: '0.00',
        monthly_allowance: '0',
        computed_new_salary: '0.00',
        employee_type: 'employee',
        contract_type_id: '',
        pay_category_id: '',
        pf_applies: false
    });

    useEffect(() => {
        const loadSelectionData = async () => {
            try {
                const [deptRes, compRes] = await Promise.all([
                    fetchDepartments(),
                    fetchCompanies()
                ]);
                if (deptRes.success && deptRes.data) setDepartments(deptRes.data);
                if (compRes.success && compRes.data) setCompanies(compRes.data);
            } catch (err) {
                console.error('Failed to load Odoo selection data', err);
            }
        };
        loadSelectionData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            setError('Employee Name is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare Odoo values (convert string IDs to numbers)
            const odooVals: any = {
                name: formData.name,
                work_email: formData.work_email,
                work_phone: formData.work_phone,
                mobile_phone: formData.mobile_phone,
                job_title: formData.job_title,
                marital: formData.marital,
                certificate: formData.certificate,
                sex: formData.sex, // Technical name fixed
            };

            if (formData.company_id) odooVals.company_id = parseInt(formData.company_id);
            if (formData.department_id) odooVals.department_id = parseInt(formData.department_id);
            if (formData.birthday) odooVals.birthday = formData.birthday;
            if (formData.barcode) odooVals.barcode = formData.barcode;

            // Payroll/Contract fields (Note: These often reside in hr.contract in Odoo, 
            // but some may be on hr.employee depending on custom JAAGO modules)
            // For now we attempt to create with the employee record.

            const res = await createEmployee(odooVals);
            if (res) {
                onSuccess();
            } else {
                setError('Failed to create employee in Odoo.');
            }
        } catch (err: any) {
            setError(err.message || 'Error communicating with Odoo.');
        } finally {
            setLoading(false);
        }
    };

    const tabs = ['Work', 'Resume', 'Certifications', 'Personal', 'Payroll', 'Settings'];

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Employees / New</p>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Create New Record</h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onBack} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer' }}>
                        Discard
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Record'}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <X size={18} /> {error}
                </div>
            )}

            {/* Main Form Content */}
            <div className="card" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '2rem' }}>
                    {/* Employee Image/Avatar Placeholder */}
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '16px', background: 'var(--input-bg)',
                        border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)'
                    }}>
                        <Camera size={32} />
                        <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: 600 }}>UPLOAD</span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Employee's Name"
                            style={{ fontSize: '2.2rem', fontWeight: 800, background: 'transparent', border: 'none', borderBottom: '2px solid var(--border)', width: '100%', color: 'var(--text-main)', marginBottom: '1rem', paddingBottom: '0.5rem' }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Mail size={16} color="var(--primary)" />
                                <input name="work_email" value={formData.work_email} onChange={handleChange} placeholder="Work Email" className="input-field" style={{ flex: 1 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Phone size={16} color="var(--primary)" />
                                <input name="work_phone" value={formData.work_phone} onChange={handleChange} placeholder="Work Phone" className="input-field" style={{ flex: 1 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Smartphone size={16} color="var(--primary)" />
                                <input name="mobile_phone" value={formData.mobile_phone} onChange={handleChange} placeholder="Work Mobile" className="input-field" style={{ flex: 1 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Briefcase size={16} color="var(--primary)" />
                                <input name="job_title" value={formData.job_title} onChange={handleChange} placeholder="Job Position (e.g. Sales Manager)" className="input-field" style={{ flex: 1 }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                    {tabs.map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 24px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Tab Content */}
                {/* Work Tab */}
                <div style={{ display: activeTab === 'Work' ? 'block' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '1px' }}>WORK INFORMATION</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Company</label>
                                    <select name="company_id" value={formData.company_id} onChange={handleChange} className="input-field">
                                        <option value="">Select Company</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Department</label>
                                    <select name="department_id" value={formData.department_id} onChange={handleChange} className="input-field">
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manager</label>
                                    <input name="parent_id" value={formData.parent_id} onChange={handleChange} className="input-field" placeholder="Search Manager..." />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '1px' }}>LOCATION</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'start' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '8px' }}>Work Address</label>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6, padding: '8px', background: 'var(--input-bg)', borderRadius: '8px' }}>
                                        JAAGO Foundation<br />
                                        House#57, Road#7B<br />
                                        Block#H, Banani<br />
                                        Dhaka BD-C 1213<br />
                                        Bangladesh
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Work Location</label>
                                    <input name="address_id" value={formData.address_id} onChange={handleChange} className="input-field" placeholder="e.g. Building 2, Remote, etc." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Tab */}
                <div style={{ display: activeTab === 'Personal' ? 'block' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '1px' }}>PRIVATE CONTACT</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Private Email</label>
                                    <input name="private_email" value={formData.private_email} onChange={handleChange} className="input-field" placeholder="e.g. myprivate@example.com" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Private Phone</label>
                                    <input name="private_phone" value={formData.private_phone} onChange={handleChange} className="input-field" />
                                </div>
                            </div>

                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', marginTop: '2.5rem', letterSpacing: '1px' }}>EMERGENCY CONTACT</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact Name</label>
                                    <input name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} className="input-field" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact Phone</label>
                                    <input name="emergency_phone" value={formData.emergency_phone} onChange={handleChange} className="input-field" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '1px' }}>PERSONAL INFORMATION</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gender</label>
                                    <select name="sex" value={formData.sex} onChange={handleChange} className="input-field">
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Marital Status</label>
                                    <select name="marital" value={formData.marital} onChange={handleChange} className="input-field">
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="legal_cohabitant">Legal Cohabitant</option>
                                        <option value="widower">Widower</option>
                                        <option value="divorced">Divorced</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Birthday</label>
                                    <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="input-field" />
                                </div>
                            </div>

                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', marginTop: '2.5rem', letterSpacing: '1px' }}>IDENTIFICATION</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Badge ID</label>
                                    <input name="barcode" value={formData.barcode} onChange={handleChange} className="input-field" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PIN Code</label>
                                    <input type="password" name="pin" value={formData.pin} onChange={handleChange} className="input-field" maxLength={4} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payroll Tab */}
                <div style={{ display: activeTab === 'Payroll' ? 'block' : 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '1px' }}>CONTRACT OVERVIEW</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Joining Date</label>
                                    <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} className="input-field" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contract</label>
                                    <input type="date" name="contract_start_date" value={formData.contract_start_date} onChange={handleChange} className="input-field" placeholder="Start Date" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Wage Type</label>
                                    <select name="wage_type" value={formData.wage_type} onChange={handleChange} className="input-field">
                                        <option value="monthly">Fixed Wage</option>
                                        <option value="hourly">Hourly Wage</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Wage</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="text" name="wage" value={formData.wage} onChange={handleChange} className="input-field" style={{ width: '100%', paddingRight: '30px' }} />
                                        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>৳</span>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monthly Total Allowance</label>
                                    <input type="number" name="monthly_allowance" value={formData.monthly_allowance} onChange={handleChange} className="input-field" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Computed New Salary</label>
                                    <input type="text" name="computed_new_salary" value={formData.computed_new_salary} readOnly className="input-field" style={{ background: 'var(--input-bg)', cursor: 'default' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ paddingTop: '2.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Employee Type</label>
                                    <select name="employee_type" value={formData.employee_type} onChange={handleChange} className="input-field">
                                        <option value="employee">Employee</option>
                                        <option value="student">Student</option>
                                        <option value="trainee">Trainee</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contract Type</label>
                                    <select name="contract_type_id" value={formData.contract_type_id} onChange={handleChange} className="input-field">
                                        <option value="">Select Type</option>
                                        <option value="1">Full-Time</option>
                                        <option value="2">Part-Time</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pay Category</label>
                                    <select name="pay_category_id" value={formData.pay_category_id} onChange={handleChange} className="input-field">
                                        <option value="">Select Category</option>
                                        <option value="bangladeshi">Bangladeshi Employee</option>
                                        <option value="international">International Employee</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PF Applies?</label>
                                    <input type="checkbox" name="pf_applies" checked={formData.pf_applies} onChange={handleChange} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {activeTab !== 'Work' && activeTab !== 'Personal' && activeTab !== 'Payroll' && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <Info size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>Form section for "{activeTab}" is coming soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeCreatePage;
