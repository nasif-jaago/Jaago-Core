import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Save, Send, CheckCircle2, XCircle, Printer,
    MessageSquare, Paperclip, ShieldCheck, Database, Building2, User, Search, Info,
    FileText, Download, Trash2, Upload, File
} from 'lucide-react';
import {
    fetchRequisitionById,
    createRequisition,
    updateRequisition,
    submitRequisition,
    approveRequisition,
    refuseRequisition,
    fetchRequisitionCategories,
    fetchProjects,
    fetchDepartments,
    fetchCompanies,
    fetchCurrentUserProfile,
    fetchEmployees,
    downloadPDF,
    fetchProductLines,
    deleteRequisition,
    fetchAttachments,
    uploadAttachment,
    getAttachmentData
} from '../../api/RequisitionsService';
import { getUid } from '../../api/odoo';
import RequisitionProductLines from './RequisitionProductLines';
import ApprovalHistoryTable from './ApprovalHistoryTable';
import RefuseModal from './RefuseModal';
import type {
    RequisitionRequest,
    RequisitionFormValues,
    RequisitionCategory,
    Project,
    Employee,
    ApiResponse
} from '../../types/requisition';

interface RequisitionFormPageProps {
    requisitionId?: number;
    onBack: () => void;
    onSuccess: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64String = result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

const RequisitionFormPage: React.FC<RequisitionFormPageProps> = ({ requisitionId, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [categories, setCategories] = useState<RequisitionCategory[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [showRefuseModal, setShowRefuseModal] = useState(false);

    // Attachment state
    const [attachments, setAttachments] = useState<any[]>([]);
    const [pendingFiles, setPendingFiles] = useState<{ name: string, data: string, size: number, type: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [ownerSearch, setOwnerSearch] = useState('');
    const [showOwnerResults, setShowOwnerResults] = useState(false);
    const ownerRef = useRef<HTMLDivElement>(null);

    const [projectSearch, setProjectSearch] = useState('');
    const [showProjectResults, setShowProjectResults] = useState(false);
    const projectRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<Partial<RequisitionRequest>>({
        name: '',
        category_id: false,
        date: new Date().toISOString().split('T')[0],
        request_owner_id: false,
        company_id: false,
        x_studio_departmentproject_name: false,
        x_studio_reason_for_purchase: '',
        x_studio_delivery_instructions: '',
        x_studio_projects_name: false,
        x_studio_project_code: '',
        x_studio_budget_amount: 0,
        x_studio_total_amount: 0,
        x_studio_refusal_note: '',
        reason: '',
        product_line_ids: [],
        request_status: 'new'
    });

    useEffect(() => {
        loadData();
        const handleClickOutside = (e: MouseEvent) => {
            if (ownerRef.current && !ownerRef.current.contains(e.target as Node)) {
                setShowOwnerResults(false);
            }
            if (projectRef.current && !projectRef.current.contains(e.target as Node)) {
                setShowProjectResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [requisitionId]);

    const loadData = async () => {
        setLoading(true);
        const [compRes, userRes, deptRes] = await Promise.all([
            fetchCompanies(),
            fetchCurrentUserProfile(),
            fetchDepartments()
        ]);

        if (compRes.success) setCompanies(compRes.data || []);
        if (deptRes.success) setDepartments(deptRes.data || []);

        let initialCompanyId: number | undefined;

        if (userRes.success && userRes.data) {
            setCurrentUser(userRes.data);
            if (!requisitionId) {
                initialCompanyId = Array.isArray(userRes.data.company_id) ? userRes.data.company_id[0] : (typeof userRes.data.company_id === 'number' ? userRes.data.company_id : undefined);
                const uid = await getUid().catch(() => null);
                const ownerId = uid || (Array.isArray(userRes.data.user_id) ? userRes.data.user_id[0] : userRes.data.id);
                setFormData(prev => ({
                    ...prev,
                    request_owner_id: [ownerId, userRes.data!.name],
                    company_id: userRes.data!.company_id as any,
                    x_studio_departmentproject_name: userRes.data!.department_id as any
                }));
                setOwnerSearch(userRes.data!.name);
            }
        }

        if (requisitionId) {
            const res = await fetchRequisitionById(requisitionId);
            if (res.success && res.data) {
                const updatedData = { ...res.data };
                const linesRes = await fetchProductLines(requisitionId);
                if (linesRes.success) {
                    updatedData.product_line_ids = linesRes.data as any;
                }
                setFormData(updatedData);
                initialCompanyId = Array.isArray(updatedData.company_id) ? updatedData.company_id[0] : (typeof updatedData.company_id === 'number' ? updatedData.company_id : undefined);
                if (Array.isArray(updatedData.request_owner_id)) setOwnerSearch(updatedData.request_owner_id[1]);
                if (Array.isArray(updatedData.x_studio_projects_name)) setProjectSearch(updatedData.x_studio_projects_name[1]);
                else if (typeof updatedData.x_studio_projects_name === 'string') setProjectSearch(updatedData.x_studio_projects_name);
            }
            // Load attachments
            loadAttachments();
        }

        const [catRes, projRes] = await Promise.all([
            fetchRequisitionCategories(initialCompanyId),
            fetchProjects({ companyId: initialCompanyId })
        ]);

        if (catRes.success && catRes.data) {
            setCategories(catRes.data);
            if (!requisitionId && formData.category_id === false) {
                const defaultCat = catRes.data.find(c => c.name.trim().toLowerCase().includes("rfq") || c.name.trim().toLowerCase().includes("req"));
                if (defaultCat) setFormData(prev => ({ ...prev, category_id: [defaultCat.id, defaultCat.name] }));
            }
        }
        if (projRes.success) setProjects(projRes.data || []);
        setLoading(false);
    };

    const loadAttachments = async () => {
        if (!requisitionId) return;
        const res = await fetchAttachments('approval.request', requisitionId);
        if (res.success) setAttachments(res.data || []);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const base64Data = await fileToBase64(file);

            if (requisitionId) {
                // Upload immediately if we have a record
                const res = await uploadAttachment('approval.request', requisitionId, file.name, base64Data);
                if (res.success) {
                    await loadAttachments();
                } else {
                    alert('Upload failed: ' + res.error);
                }
            } else {
                // Add to pending if it's a new draft
                setPendingFiles(prev => [...prev, {
                    name: file.name,
                    data: base64Data,
                    size: file.size,
                    type: file.type
                }]);
            }
        } catch (err: any) {
            alert('Error processing file: ' + err.message);
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemovePending = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDownloadAttachment = async (att: any) => {
        setActionLoading(true);
        const res = await getAttachmentData(att.id);
        if (res.success && res.data) {
            const link = document.createElement('a');
            link.href = `data:${att.mimetype};base64,${res.data}`;
            link.download = att.name;
            link.click();
        } else {
            alert('Failed to download attachment: ' + res.error);
        }
        setActionLoading(false);
    };

    const refreshCompanyData = async (companyId?: number) => {
        const [catRes, projRes] = await Promise.all([
            fetchRequisitionCategories(companyId),
            fetchProjects({ companyId })
        ]);
        if (catRes.success && catRes.data) {
            setCategories(catRes.data);
            const defaultCat = catRes.data.find(c => c.name.trim().toLowerCase().includes("rfq") || c.name.trim().toLowerCase().includes("req"));
            if (defaultCat) setFormData(prev => ({ ...prev, category_id: [defaultCat.id, defaultCat.name] }));
        }
        if (projRes.success) setProjects(projRes.data || []);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOwnerSearch = async (val: string) => {
        setOwnerSearch(val);
        if (val.length > 1) {
            const res = await fetchEmployees(val);
            if (res.success) {
                setEmployees(res.data || []);
                setShowOwnerResults(true);
            }
        } else {
            setEmployees([]);
            setShowOwnerResults(false);
        }
    };

    const handleProjectSearch = async (val: string) => {
        setProjectSearch(val);
        if (val.length > 0) {
            const res = await fetchProjects({ searchTerm: val, companyId: typeof formData.company_id === 'number' ? formData.company_id : (Array.isArray(formData.company_id) ? formData.company_id[0] : undefined) });
            if (res.success) {
                setProjects(res.data || []);
                setShowProjectResults(true);
            }
        } else {
            setFormData(prev => ({ ...prev, x_studio_projects_name: false }));
            const res = await fetchProjects({ companyId: typeof formData.company_id === 'number' ? formData.company_id : (Array.isArray(formData.company_id) ? formData.company_id[0] : undefined) });
            if (res.success) {
                setProjects(res.data || []);
                setShowProjectResults(true);
            }
        }
    };

    const selectProject = (proj: Project) => {
        handleInputChange('x_studio_projects_name', [proj.id, proj.display_name || proj.name]);
        setProjectSearch(proj.display_name || proj.name);
        setShowProjectResults(false);
    };

    const selectOwner = (emp: Employee) => {
        const companyId = Array.isArray(emp.company_id) ? emp.company_id[0] : undefined;
        if (!emp.user_id) {
            alert(`Employee "${emp.name}" is not linked to an Odoo User.`);
            return;
        }
        setFormData(prev => ({
            ...prev,
            request_owner_id: emp.user_id as any,
            company_id: emp.company_id as any,
            x_studio_departmentproject_name: emp.department_id as any
        }));
        setOwnerSearch(emp.name);
        setShowOwnerResults(false);
        refreshCompanyData(companyId);
    };

    const validateForm = () => {
        if (!formData.name) return 'Subject is required';
        if (!formData.category_id) return 'Requisition category is required';
        const budget = formData.x_studio_budget_amount || 0;
        const total = formData.x_studio_total_amount || 0;
        if (budget > 0 && total > budget) return `Submission blocked: Total exceeds budget.`;
        return null;
    };

    const handleSave = async (submit: boolean = false) => {
        const error = validateForm();
        if (error) {
            alert(error);
            return;
        }
        setSaving(true);
        const extractId = (val: any) => {
            if (typeof val === 'number') return val;
            if (Array.isArray(val) && val.length > 0) return val[0];
            return undefined;
        };
        const payload: RequisitionFormValues = {
            name: formData.name || '',
            category_id: extractId(formData.category_id),
            date: formData.date,
            reference: formData.reference,
            request_owner_id: extractId(formData.request_owner_id),
            company_id: extractId(formData.company_id),
            x_studio_departmentproject_name: extractId(formData.x_studio_departmentproject_name),
            x_studio_reason_for_purchase: formData.x_studio_reason_for_purchase,
            x_studio_delivery_instructions: formData.x_studio_delivery_instructions,
            x_studio_projects_name: extractId(formData.x_studio_projects_name),
            x_studio_project_code: formData.x_studio_project_code,
            x_studio_budget_amount: formData.x_studio_budget_amount,
            x_studio_total_amount: formData.x_studio_total_amount,
            x_studio_refusal_note: formData.x_studio_refusal_note,
            reason: formData.reason,
            product_line_ids: (formData.product_line_ids || []).map((line: any) => {
                const lineValues = {
                    product_id: extractId(line.product_id) || false,
                    x_studio_product_description: line.x_studio_product_description || '',
                    product_uom_id: extractId(line.product_uom_id) || false,
                    quantity: parseFloat(line.quantity as any) || 0,
                    x_studio_per_unit_price: parseFloat(line.x_studio_per_unit_price as any) || 0,
                    x_studio_estimated_price: parseFloat(line.x_studio_estimated_price as any) || 0
                };
                if (line.id) {
                    return [1, line.id, lineValues]; // Update existing
                } else {
                    return [0, 0, lineValues]; // Create new
                }
            }) as any
        };
        let result: ApiResponse<number | boolean>;
        if (requisitionId) result = await updateRequisition(requisitionId, payload);
        else result = await createRequisition(payload);

        if (result.success) {
            const id = requisitionId || (result.data as number);

            // Upload pending files if any
            if (pendingFiles.length > 0) {
                for (const file of pendingFiles) {
                    await uploadAttachment('approval.request', id, file.name, file.data);
                }
                setPendingFiles([]);
            }

            if (submit) {
                const subRes = await submitRequisition(id);
                if (subRes.success) onSuccess();
                else alert('Saved but failed to submit: ' + subRes.error);
            } else onSuccess();
        } else alert('Error: ' + result.error);
        setSaving(false);
    };

    const handleApprove = async () => {
        if (!requisitionId) return;
        setActionLoading(true);
        const res = await approveRequisition(requisitionId);
        if (res.success) onSuccess();
        else alert('Approval failed: ' + res.error);
        setActionLoading(false);
    };

    const handleRefuse = async (reason: string) => {
        if (!requisitionId) return;
        setActionLoading(true);
        const res = await refuseRequisition(requisitionId, { reason });
        if (res.success) {
            setShowRefuseModal(false);
            onSuccess();
        } else alert('Refusal failed: ' + res.error);
        setActionLoading(false);
    };

    const handleDelete = async () => {
        if (!requisitionId) return;
        if (!window.confirm('Delete this requisition permanently?')) return;
        setActionLoading(true);
        const res = await deleteRequisition(requisitionId);
        if (res.success) onSuccess();
        else alert('Delete failed: ' + res.error);
        setActionLoading(false);
    };

    const handlePrint = async () => {
        if (!requisitionId) return;
        const res = await downloadPDF(requisitionId);
        if (res.success && res.data) window.open(res.data, '_blank');
    };

    const getCurrencySymbol = () => {
        if (!formData.company_id) return '$';
        const companyId = Array.isArray(formData.company_id) ? formData.company_id[0] : formData.company_id;
        const company = companies.find(c => c.id === companyId);
        return company?.currency_symbol || '$';
    };

    const getStatusGlowColor = () => {
        switch (formData.request_status) {
            case 'approved': return '#22c55e';
            case 'refused': return '#ef4444';
            case 'pending':
            case 'pending_approval': return '#f59e0b';
            case 'new':
            case 'draft': return '#3b82f6';
            default: return 'var(--primary)';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <div className="spinner-large" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Loading...</p>
            </div>
        );
    }

    const { request_status, can_edit, can_approve, can_refuse, pr_number, current_approver_id } = formData;
    const isNew = !requisitionId;
    const isEditing = isNew || can_edit;
    const currency = getCurrencySymbol();
    const glowColor = getStatusGlowColor();

    return (
        <div className="fade-in" style={{ fontSize: '0.85rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1rem', left: '0', right: '0', height: '4px', background: glowColor, borderRadius: '2px', boxShadow: `0 0 10px ${glowColor}`, zIndex: 10 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={onBack} className="btn-secondary" style={{ padding: '8px' }}><ArrowLeft size={18} /></button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>ERP / Requisitions {pr_number ? `/ ${pr_number}` : ''}</p>
                            {request_status && <span className={`badge badge-${request_status}`} style={{ fontSize: '0.6rem', padding: '2px 8px', background: glowColor + '20', color: glowColor, fontWeight: 900 }}>{request_status.toUpperCase()}</span>}
                            {current_approver_id && Array.isArray(current_approver_id) && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '2px 8px', borderRadius: '4px' }}>WAITING: {current_approver_id[1]}</span>}
                        </div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, textTransform: 'uppercase' }}>
                            {isNew ? 'New Request' : (formData.name || 'Untitled')}
                        </h1>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {requisitionId && <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '8px 12px' }}><Printer size={16} /> PRINT PDF</button>}
                    {requisitionId && (request_status === 'new' || request_status === 'draft') && <button onClick={handleDelete} className="btn-secondary" style={{ color: '#ef4444', fontSize: '0.75rem', padding: '8px 12px' }}><XCircle size={16} /> DELETE</button>}
                    {isEditing && (
                        <>
                            <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '8px 12px' }}>{saving ? '...' : 'SAVE DRAFT'}</button>
                            <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary" style={{ fontSize: '0.75rem', padding: '8px 16px', fontWeight: 800 }}>SUBMIT REQUEST</button>
                        </>
                    )}
                    {can_approve && !actionLoading && <button onClick={handleApprove} className="btn-primary" style={{ background: '#22c55e', color: '#fff' }}><CheckCircle2 size={16} /> APPROVE</button>}
                    {can_refuse && !actionLoading && <button onClick={() => setShowRefuseModal(true)} className="btn-primary" style={{ background: '#ef4444', color: '#fff' }}><XCircle size={16} /> REFUSE</button>}
                    {actionLoading && <div className="spinner-small" />}
                </div>
            </div>

            <div id="requisition-form-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* PROJECT & DETAILS SECTION */}
                <div id="section-context" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', position: 'relative', zIndex: 20 }}>
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '12px', overflow: 'visible' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}><Database size={16} /><h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>PROJECT CONTEXT</h3></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }} ref={projectRef}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>PROJECT</label>
                                {isEditing ? <input className="input-field" value={projectSearch} onChange={e => handleProjectSearch(e.target.value)} onFocus={() => handleProjectSearch('')} placeholder="Search project..." style={{ fontSize: '0.85rem' }} /> : <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{Array.isArray(formData.x_studio_projects_name) ? formData.x_studio_projects_name[1] : (typeof formData.x_studio_projects_name === 'string' ? formData.x_studio_projects_name : '--')}</div>}
                                {showProjectResults && projects.length > 0 && <div className="non-glass-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}>{projects.map(p => <div key={p.id} onClick={() => selectProject(p)} className="dropdown-item"><div className="title" style={{ fontSize: '0.85rem' }}>{p.display_name || p.name}</div></div>)}</div>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTIVITY CODE</label>
                                {isEditing ? <input className="input-field" value={formData.x_studio_project_code || ''} onChange={e => handleInputChange('x_studio_project_code', e.target.value)} placeholder="Code..." style={{ fontSize: '0.85rem' }} /> : <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formData.x_studio_project_code || '--'}</div>}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>COMPANY</label>{isEditing ? <select className="input-field" value={Array.isArray(formData.company_id) ? formData.company_id[0] : (formData.company_id || '')} onChange={e => { const id = parseInt(e.target.value); const c = companies.find(x => x.id === id); handleInputChange('company_id', c ? [c.id, c.name] : false); refreshCompanyData(id); }} style={{ fontSize: '0.85rem' }}><option value="">Select...</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select> : <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{Array.isArray(formData.company_id) ? formData.company_id[1] : '--'}</div>}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>DEPARTMENT</label>{isEditing ? <select className="input-field" value={Array.isArray(formData.x_studio_departmentproject_name) ? formData.x_studio_departmentproject_name[0] : (formData.x_studio_departmentproject_name || '')} onChange={e => handleInputChange('x_studio_departmentproject_name', parseInt(e.target.value))} style={{ fontSize: '0.85rem' }}><option value="">Select...</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select> : <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{Array.isArray(formData.x_studio_departmentproject_name) ? formData.x_studio_departmentproject_name[1] : '--'}</div>}</div>
                        </div>
                        <div id="request-owner-container" style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }} ref={ownerRef}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>REQUEST OWNER</label>
                            {isEditing ? <input className="input-field" value={ownerSearch} onChange={e => handleOwnerSearch(e.target.value)} onFocus={() => handleOwnerSearch('')} placeholder="Search owner..." style={{ fontSize: '0.85rem' }} /> : <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{Array.isArray(formData.request_owner_id) ? formData.request_owner_id[1] : '--'}</div>}
                            {showOwnerResults && employees.length > 0 && <div className="non-glass-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}>{employees.map(emp => <div key={emp.id} onClick={() => selectOwner(emp)} className="dropdown-item"><div className="title" style={{ fontSize: '0.85rem' }}>{emp.name}</div><div className="subtitle">{Array.isArray(emp.department_id) ? emp.department_id[1] : 'No Department'}</div></div>)}</div>}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}><ShieldCheck size={16} /><h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>REQUISITION DETAILS</h3></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>SUBJECT</label>
                            {/* Maps to Odoo technical field: name */}
                            {isEditing ? <input className="input-field" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} placeholder="Enter Requisition Subject..." style={{ fontWeight: 800, fontSize: '0.95rem' }} /> : <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{formData.name || '--'}</div>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>TYPE</label>{isEditing ? <select className="input-field" value={Array.isArray(formData.category_id) ? formData.category_id[0] : (formData.category_id || '')} onChange={e => handleInputChange('category_id', parseInt(e.target.value))} style={{ fontSize: '0.85rem' }}><option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select> : <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{Array.isArray(formData.category_id) ? formData.category_id[1] : '--'}</div>}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>DATE</label>{isEditing ? <input type="date" className="input-field" value={formData.date || ''} onChange={e => handleInputChange('date', e.target.value)} style={{ fontSize: '0.85rem' }} /> : <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formData.date || '--'}</div>}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>BUDGET ({currency})</label>{isEditing ? <input type="number" className="input-field" value={formData.x_studio_budget_amount || ''} onChange={e => handleInputChange('x_studio_budget_amount', parseFloat(e.target.value))} style={{ fontSize: '0.85rem' }} /> : <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currency} {(formData.x_studio_budget_amount || 0).toLocaleString()}</div>}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>EST. TOTAL AMOUNT</label><div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.25rem' }}>{currency} {(formData.x_studio_total_amount || 0).toLocaleString()}</div></div>
                        </div>
                    </div>
                </div>

                {/* ITEMS & PRODUCTS SECTION */}
                <div id="section-items" className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <RequisitionProductLines
                        lines={formData.product_line_ids as any || []}
                        onChange={lines => { handleInputChange('product_line_ids', lines); handleInputChange('x_studio_total_amount', lines.reduce((acc, c) => acc + (parseFloat(c.x_studio_estimated_price as any) || 0), 0)); }}
                        readonly={!isEditing}
                        currency={currency}
                        companyId={Array.isArray(formData.company_id) ? formData.company_id[0] : (typeof formData.company_id === 'number' ? formData.company_id : undefined)}
                    />
                </div>

                {/* SUPPLEMENTARY INFO SECTION */}
                <div id="section-supplementary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}><Info size={16} /><h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>SUPPLEMENTARY INFO</h3></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>REASON FOR PURCHASE</label>
                            {isEditing ? <textarea className="input-field" value={formData.x_studio_reason_for_purchase || ''} onChange={e => handleInputChange('x_studio_reason_for_purchase', e.target.value)} placeholder="Detail the reason..." style={{ height: '80px', resize: 'none', padding: '12px', fontSize: '0.85rem' }} /> : <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>{formData.x_studio_reason_for_purchase || '--'}</div>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>DELIVERY INSTRUCTIONS</label>
                            {isEditing ? <textarea className="input-field" value={formData.x_studio_delivery_instructions || ''} onChange={e => handleInputChange('x_studio_delivery_instructions', e.target.value)} placeholder="How and where to deliver..." style={{ height: '80px', resize: 'none', padding: '12px', fontSize: '0.85rem' }} /> : <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>{formData.x_studio_delivery_instructions || '--'}</div>}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}><MessageSquare size={16} /><h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>DECISION & COMMENTS</h3></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>REFUSAL / GRANT NOTE</label>
                            {isEditing && (formData.request_status === 'new' || formData.request_status === 'draft') ? (
                                <input className="input-field" value={formData.x_studio_refusal_note || ''} readOnly placeholder="Populated by approver..." style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                            ) : (
                                <div style={{ color: '#ef4444', fontWeight: 700, padding: '10px', background: formData.x_studio_refusal_note ? 'rgba(239, 68, 68, 0.1)' : 'transparent', borderRadius: '8px', fontSize: '0.9rem' }}>{formData.x_studio_refusal_note || '--'}</div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>COMMENTS / DESCRIPTION</label>
                            {isEditing ? <textarea className="input-field" value={formData.reason || ''} onChange={e => handleInputChange('reason', e.target.value)} placeholder="Any additional comments..." style={{ height: '80px', resize: 'none', padding: '12px', fontSize: '0.85rem' }} /> : <div className="html-content" dangerouslySetInnerHTML={{ __html: formData.reason || '--' }} style={{ fontSize: '0.9rem', lineHeight: '1.5' }} />}
                        </div>
                    </div>
                </div>

                {/* APPROVAL HISTORY */}
                {requisitionId && formData.approval_history_ids && (
                    <div id="section-history">
                        <ApprovalHistoryTable history={formData.approval_history_ids as any || []} />
                    </div>
                )}

                {/* ATTACHMENTS & CHATTER */}
                <div id="section-footer-info" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    <div id="section-attachments" className="card" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <Paperclip size={16} color="var(--primary)" /> ATTACHMENTS {isNew && <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', marginLeft: '4px', fontWeight: 900 }}>DRAFT</span>}
                            </h3>
                            {isEditing && (
                                <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 800 }} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                    <Upload size={14} /> {uploading ? 'UPLOADING...' : 'ATTACH FILE'}
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {attachments.map(att => (
                                <div key={att.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ padding: '8px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '8px' }}><FileText size={18} color="var(--primary)" /></div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{att.name}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{att.mimetype} • {(att.file_size / 1024).toFixed(1)} KB</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDownloadAttachment(att)} className="btn-secondary" style={{ padding: '8px' }} title="Download"><Download size={16} /></button>
                                </div>
                            ))}

                            {pendingFiles.map((file, idx) => (
                                <div key={`pending-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}><FileText size={18} color="#3b82f6" /></div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{file.name}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#3b82f6' }}>Draft Attachment • {(file.size / 1024).toFixed(1)} KB</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemovePending(idx)} className="btn-secondary" style={{ padding: '8px', color: '#ef4444' }} title="Remove"><Trash2 size={16} /></button>
                                </div>
                            ))}

                            {attachments.length === 0 && pendingFiles.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    No documents attached yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {requisitionId && (
                        <div id="section-chatter" className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={16} color="var(--primary)" /> CHATTER</h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Timeline events and communication history will appear here.</div>
                        </div>
                    )}
                </div>
            </div>

            {showRefuseModal && <RefuseModal onClose={() => setShowRefuseModal(false)} onSubmit={handleRefuse} />}
        </div>
    );
};

export default RequisitionFormPage;
