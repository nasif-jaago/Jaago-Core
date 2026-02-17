import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, CheckCircle, ArrowLeft,
    Calendar, Users, User, Mail, Shield, Loader2, Send,
    CheckSquare, Square, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppraisalService, type OdooEmployee } from '../../../api/AppraisalService';

interface AppraisalAddCycleProps {
    onBack: () => void;
    onSuccess: () => void;
    onTestSuccess?: () => void;
}

const AppraisalAddCycle: React.FC<AppraisalAddCycleProps> = ({ onBack, onSuccess, onTestSuccess }) => {
    const [appraisalPeriod, setAppraisalPeriod] = useState(`Cycle ${new Date().getFullYear()}`);
    const [employees, setEmployees] = useState<OdooEmployee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [generatedCount, setGeneratedCount] = useState(0);
    const [currentAppraisals, setCurrentAppraisals] = useState<{ id: number, email: string, empName: string, empId: number }[]>([]);

    // Email Template selection
    const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [isSendingEmails, setIsSendingEmails] = useState(false);
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [templateError, setTemplateError] = useState(false);

    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            const [empRes, templateRes] = await Promise.all([
                AppraisalService.fetchEmployees(),
                AppraisalService.fetchEmailTemplates()
            ]);
            if (empRes.success) setEmployees(empRes.data || []);
            if (templateRes.success) setEmailTemplates(templateRes.data || []);
            setLoading(false);
        };
        loadInitial();
    }, []);

    const filteredEmployees = useMemo(() => {
        return employees.filter(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (e.work_email || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [employees, searchQuery]);

    const handleSelectAll = () => {
        if (selectedEmployees.length === filteredEmployees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(filteredEmployees.map(e => e.id));
        }
    };

    const toggleEmployee = (id: number) => {
        setSelectedEmployees(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };


    const handleOpenCycle = async () => {
        setShowConfirmModal(false);
        setIsSaving(true);
        const createdItems: { id: number, email: string, empName: string, empId: number }[] = [];

        try {
            // 1. Creation Loop (Duplicate check is now just a console warning to allow re-testing)
            for (const empId of selectedEmployees) {
                const emp = employees.find(e => e.id === empId);
                if (!emp?.work_email) {
                    console.warn(`Skipping ${emp?.name || empId}: No email.`);
                    continue;
                }

                // Check for duplicate but don't block (just warn)
                const isDuplicate = await AppraisalService.checkDuplicateAppraisal(empId, appraisalPeriod);
                if (isDuplicate) {
                    console.log(`Note: Appraisal for ${emp.name} in ${appraisalPeriod} already exists. Creating another.`);
                }

                const res = await AppraisalService.createAppraisal('self', {
                    employee_id: empId,
                    state: '1_new',
                    display_name: `${appraisalPeriod} - ${emp?.name}`,
                    date_close: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });

                if (res.success && res.data) {
                    const odooId = res.data;
                    createdItems.push({
                        id: odooId,
                        email: emp.work_email,
                        empName: emp.name,
                        empId: emp.id
                    });

                    // Generate and Save Token to Supabase
                    if (selectedTemplateId) {
                        try {
                            await AppraisalService.saveAppraisalMetadata(odooId, selectedTemplateId);
                        } catch (err) {
                            console.error('Metadata save failed for', odooId, err);
                        }
                    }
                } else {
                    throw new Error(res.error || `Failed to create record for ${emp.name}`);
                }
            }

            if (createdItems.length === 0) {
                throw new Error('No records were created. Please check employee selection and emails.');
            }

            setGeneratedCount(createdItems.length);
            setCurrentAppraisals(createdItems);
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error('Cycle Creation Error:', err);
            alert('Error: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendEmails = async () => {
        if (!selectedTemplateId) {
            setTemplateError(true);
            return;
        }
        setIsSendingEmails(true);
        let successCount = 0;
        let failCount = 0;
        let lastError = '';

        try {
            // 1. Fetch Template
            const template = emailTemplates.find(t => t.id === selectedTemplateId);
            if (!template) throw new Error('Template not found');

            let blocks = template.blocks || template.content_json || template.description;
            const bodyHtmlStr = (template.body_html || '').trim();

            if (!Array.isArray(blocks)) {
                let source = typeof blocks === 'string' ? blocks : '';
                if (!source && bodyHtmlStr.startsWith('[') || bodyHtmlStr.startsWith('{')) source = bodyHtmlStr;

                if (source) {
                    try {
                        const parsed = JSON.parse(source);
                        blocks = Array.isArray(parsed) ? parsed : (parsed.blocks || [parsed]);
                    } catch (e) { }
                }
            }

            const subjectTemplate = template.subject || 'Action Required: Your Performance Appraisal';

            for (const item of currentAppraisals) {
                try {
                    // Fetch Metadata (Token)
                    const metadata = await AppraisalService.getAppraisalMetadata(item.id);
                    const token = metadata?.secure_token || 'INVALID_TOKEN';
                    const secureLink = `${window.location.origin}/?view=appraisal-editor&token=${token}&id=${item.id}&mode=employee`;

                    // 2. Render Template (Replace Variables)
                    const employeeName = item.empName || 'Employee';
                    const finalSubject = subjectTemplate.replace(/{{employee_name}}/g, employeeName);

                    const renderVars = {
                        employee_name: employeeName,
                        secure_link: secureLink,
                        recipient_email: item.email,
                        appraisal_period: appraisalPeriod,
                        appraisal_id: item.id.toString(),
                        company_name: 'JAAGO Foundation'
                    };

                    let bodyHtml = '';
                    if (Array.isArray(blocks)) {
                        bodyHtml = AppraisalService.renderTemplateToHTML(blocks, renderVars);
                    } else if (template.body_html) {
                        bodyHtml = template.body_html
                            .replace(/{{employee_name}}/g, employeeName)
                            .replace(/{{object\.employee_id\.name}}/g, employeeName)
                            .replace(/{{object\.name}}/g, employeeName)
                            .replace(/{{secure_link}}/g, secureLink)
                            .replace(/{{appraisal_period}}/g, appraisalPeriod);
                    } else {
                        bodyHtml = `
                            <div style="font-family:sans-serif;padding:30px;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;">
                                <h2 style="color:#1e293b;">Hi ${employeeName},</h2>
                                <p style={{color:'#475569',lineHeight:'1.6',fontSize:'16px'}}>Your performance appraisal for <b>${appraisalPeriod}</b> is now ready for your input.</p>
                                <div style="margin:40px 0;text-align:center;">
                                    <a href="${secureLink}" style="background:#22c55e;color:white;padding:16px 32px;text-decoration:none;border-radius:12px;font-weight:800;display:inline-block;box-shadow:0 10px 15px -3px rgba(34, 197, 94, 0.3);">
                                        COMPLETE YOUR APPRAISAL NOW
                                    </a>
                                </div>
                                <p style="color:#94a3b8;font-size:12px;text-align:center;">If the button doesn't work, copy this link: <br/> ${secureLink}</p>
                            </div>
                        `;
                    }

                    // 3. Send Email (Odoo)
                    const sendRes = await AppraisalService.sendEmail(
                        item.email,
                        finalSubject,
                        bodyHtml,
                        'hr.appraisal',
                        item.id
                    );

                    if (sendRes.success) {
                        successCount++;
                        // 4. Log in Active System (Production)
                        await AppraisalService.saveActiveEmail({
                            id: item.id,
                            receiver_name: employeeName,
                            receiver_email: item.email,
                            subject: finalSubject,
                            body: bodyHtml,
                            secure_token: token,
                            department: 'General',
                            status: 'Sent',
                            created_at: new Date().toISOString()
                        });

                        await AppraisalService.logActiveAction({
                            appraisal_id: item.id,
                            email: item.email,
                            employee_name: employeeName,
                            action_type: 'Bulk Email Sent',
                            details: `Appraisal invitation sent for period ${appraisalPeriod}`,
                            status: 'Success'
                        });

                        // 5. Update Odoo Status to 'sent'
                        await AppraisalService.updateAppraisal('self', item.id, { state: 'sent' });
                    } else {
                        failCount++;
                        lastError = sendRes.error || 'SMTP Error';
                    }
                } catch (innerErr: any) {
                    failCount++;
                    lastError = innerErr.message;
                    console.error('Single Email Error:', innerErr);
                }
            }

            if (failCount > 0) {
                alert(`Sent ${successCount} emails successfully. Failed ${failCount}. Last error: ${lastError}`);
            } else {
                alert(`All ${successCount} emails sent successfully!`);
            }

            setShowSuccessModal(false);
            onSuccess();
        } catch (err: any) {
            console.error('Email Flow Error:', err);
            alert('Error during email process: ' + err.message);
        } finally {
            setIsSendingEmails(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!selectedTemplateId) {
            setTemplateError(true);
            return;
        }
        setIsSendingTest(true);
        try {
            const template = emailTemplates.find(t => t.id === selectedTemplateId);
            const firstAppraisal = currentAppraisals[0];
            const emp = employees.find(e => e.work_email === firstAppraisal.email);

            const metadata = await AppraisalService.getAppraisalMetadata(firstAppraisal.id);
            const token = metadata?.secure_token || 'TEST_TOKEN';

            const employeeName = emp?.name || 'Test Employee';
            const secureLink = `${window.location.origin}/?view=appraisal-editor&token=${token}&id=${firstAppraisal.id}&mode=employee`;

            let bodyHtml = '';
            let blocks = template?.blocks || template?.content_json || template?.description;
            const bodyHtmlStr = (template?.body_html || '').trim();

            if (!Array.isArray(blocks)) {
                let source = typeof blocks === 'string' ? blocks : '';
                if (!source && (bodyHtmlStr.startsWith('[') || bodyHtmlStr.startsWith('{'))) source = bodyHtmlStr;

                if (source) {
                    try {
                        const parsed = JSON.parse(source);
                        blocks = Array.isArray(parsed) ? parsed : (parsed.blocks || [parsed]);
                    } catch (e) { }
                }
            }


            const renderVars = {
                employee_name: employeeName,
                secure_link: secureLink,
                recipient_email: firstAppraisal.email,
                appraisal_period: appraisalPeriod,
                appraisal_id: firstAppraisal.id.toString(),
                company_name: 'JAAGO Foundation'
            };

            if (Array.isArray(blocks)) {
                bodyHtml = AppraisalService.renderTemplateToHTML(blocks, renderVars);
            } else if (template?.body_html) {
                bodyHtml = template.body_html
                    .replace(/{{employee_name}}/g, employeeName)
                    .replace(/{{object\.employee_id\.name}}/g, employeeName)
                    .replace(/{{object\.name}}/g, employeeName)
                    .replace(/{{secure_link}}/g, secureLink)
                    .replace(/{{appraisal_period}}/g, appraisalPeriod);
            } else {
                bodyHtml = `
                    <div style="font-family:sans-serif;padding:30px;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;">
                        <h2 style="color:#1e293b;">Hi ${employeeName},</h2>
                        <p style="color:#475569;line-height:1.6;font-size:16px;">Your performance appraisal for <b>${appraisalPeriod}</b> is now ready for your input.</p>
                        <div style="margin:40px 0;text-align:center;">
                            <a href="${secureLink}" style="background:#22c55e;color:white;padding:16px 32px;text-decoration:none;border-radius:12px;font-weight:800;display:inline-block;box-shadow:0 10px 15px -3px rgba(34, 197, 94, 0.3);">
                                COMPLETE YOUR APPRAISAL NOW
                            </a>
                        </div>
                        <p style="color:#94a3b8;font-size:12px;text-align:center;">If the button doesn't work, copy this link: <br/> ${secureLink}</p>
                    </div>
                `;
            }

            await AppraisalService.saveTestEmail({
                receiver_email: firstAppraisal.email,
                employee_name: employeeName,
                department: employees.find(e => e.id === firstAppraisal.empId)?.parent_id ? 'IT' : 'Education', // Fixed empId usage
                appraisal_id: firstAppraisal.id,
                subject: template?.subject || 'Test Appraisal Cycle',
                body: bodyHtml,
                secure_token: token,
                created_at: new Date().toISOString()
            });

            await AppraisalService.logActiveAction({
                appraisal_id: firstAppraisal.id,
                email: firstAppraisal.email,
                employee_name: employeeName,
                action_type: 'Test Email Sent',
                details: `Test appraisal email sent to demo inbox for ${employeeName}`,
                status: 'Success'
            });

            alert('Test email successfully sent to Demo Inbox!');
            if (onTestSuccess) onTestSuccess();
        } catch (err: any) {
            alert('Failed to send test email: ' + err.message);
        } finally {
            setIsSendingTest(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={onBack} className="btn-icon">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Add New Appraisal Cycle</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Configure the cycle period and assign employees.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', flex: 1, overflow: 'hidden' }}>
                {/* Left Panel: Configuration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} color="var(--primary)" /> Appraisal Period
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>CYCLE NAME</label>
                            <input
                                value={appraisalPeriod}
                                onChange={(e) => setAppraisalPeriod(e.target.value)}
                                className="form-input"
                                style={{ width: '100%', fontSize: '14px', marginBottom: '20px' }}
                            />
                            <button
                                disabled={selectedEmployees.length === 0 || isSaving}
                                onClick={() => setShowConfirmModal(true)}
                                className="btn-3d-green"
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isSaving ? <Loader2 className="spin" size={18} /> : <CheckCircle size={18} />}
                                OPEN CYCLE
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={16} color="var(--primary)" /> Selection Summary
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                            <SummaryRow label="Selected Employees" value={selectedEmployees.length} />
                            <SummaryRow label="Target Model" value="hr.appraisal" />
                            <SummaryRow label="Auto-Notification" value="Enabled" />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Employee Selection */}
                <div className="glass-panel" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    background: 'rgba(34, 197, 94, 0.05)',
                    borderColor: 'rgba(34, 197, 94, 0.2)',
                    boxShadow: '0 10px 30px rgba(34, 197, 94, 0.1)'
                }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(34, 197, 94, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Users size={20} color="#22c55e" />
                            <span style={{ fontWeight: 800, fontSize: '15px' }}>Employee Selection</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or email..."
                                    style={{
                                        padding: '8px 12px 8px 32px',
                                        fontSize: '13px',
                                        borderRadius: '8px',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border-glass)',
                                        color: 'var(--text-main)',
                                        width: '240px'
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleSelectAll}
                                className="btn-secondary"
                                style={{ padding: '8px 12px', fontSize: '12px', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                            >
                                {selectedEmployees.length === filteredEmployees.length ? 'Clear All' : 'Select All'}
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <Loader2 className="spin" size={32} color="#22c55e" />
                                <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading employees...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredEmployees.map(emp => (
                                    <EmployeeRow
                                        key={emp.id}
                                        emp={emp}
                                        selected={selectedEmployees.includes(emp.id)}
                                        onToggle={() => toggleEmployee(emp.id)}
                                    />
                                ))}
                                {filteredEmployees.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No employees found matching your search.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ padding: '32px', width: '400px', textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245, 197, 24, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <AlertCircle size={32} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Confirm Open Cycle</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '32px' }}>
                                Are you sure you want to generate <b>{selectedEmployees.length}</b> appraisal records for <b>{appraisalPeriod}</b>?
                            </p>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                                <button onClick={() => setShowConfirmModal(false)} className="btn-3d-red" style={{ flex: 1 }}>Cancel</button>
                                <button onClick={handleOpenCycle} className="btn-3d-green" style={{ flex: 1 }}>Confirm</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel" style={{ padding: '32px', width: '440px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <CheckCircle size={36} color="#22c55e" />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Cycle Created</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>{generatedCount} records generated successfully.</p>
                            </div>

                            <div style={{ background: 'var(--input-bg)', padding: '20px', borderRadius: '16px', border: `1px solid ${templateError ? '#ef4444' : 'var(--border-glass)'}`, marginBottom: '24px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>SELECT EMAIL TEMPLATE</label>
                                <select
                                    value={selectedTemplateId || ''}
                                    onChange={(e) => { setSelectedTemplateId(Number(e.target.value)); setTemplateError(false); }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--surface)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '8px',
                                        color: 'var(--text-main)',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">Select a template...</option>
                                    {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                {templateError && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>Please select a template to continue.</p>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <button
                                    onClick={handleSendEmails}
                                    disabled={isSendingEmails}
                                    className="btn-3d-green"
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    {isSendingEmails ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                                    Send Emails Now
                                </button>
                                <button
                                    onClick={handleSendTestEmail}
                                    disabled={isSendingTest || isSendingEmails}
                                    className="btn-3d-blue"
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        boxShadow: '0 8px 0 #1e40af, 0 15px 20px rgba(0,0,0,0.2)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isSendingTest ? <Loader2 className="spin" size={18} /> : <Mail size={18} />}
                                    Send Test Email
                                </button>
                                <button onClick={() => { setShowSuccessModal(false); onSuccess(); }} className="btn-3d-red" style={{ width: '100%' }}>Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

const EmployeeRow: React.FC<{ emp: OdooEmployee, selected: boolean, onToggle: () => void }> = ({ emp, selected, onToggle }) => (
    <motion.div
        whileHover={{ x: 5 }}
        onClick={onToggle}
        style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: selected ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-card)',
            border: `1px solid ${selected ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-glass)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
        }}
    >
        <div style={{ color: selected ? '#22c55e' : 'var(--text-muted)' }}>
            {selected ? <CheckSquare size={20} /> : <Square size={20} />}
        </div>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color={selected ? '#22c55e' : 'var(--text-dim)'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={10} /> {emp.work_email || 'No email'}
            </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)' }}>
                Supervisor: <span style={{ color: 'var(--text-main)' }}>{Array.isArray(emp.parent_id) ? emp.parent_id[1] : 'None'}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                Next: {emp.next_appraisal_date || 'N/A'}
            </div>
        </div>
    </motion.div>
);

const SummaryRow: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 700 }}>{value}</span>
    </div>
);

export default AppraisalAddCycle;
