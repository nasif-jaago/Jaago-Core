import React, { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline,
    X, Lock, Unlock, Loader
} from 'lucide-react';
import { AppraisalService, type OdooEmployee } from '../../api/AppraisalService';

interface AppraisalEditorProps {
    onBack?: () => void;
    initialId?: number | null;
}

const templates = {
    'Annual Performance Review': `
        <div class="page-content">
             <!-- Standardized Locked Header -->
            <div contenteditable="false" class="locked-content" data-locked="true" style="display: block; gap: 20px; margin-bottom: 32px; background: #f8fafc; padding: 24px; border-radius: 12px; border: 2px solid #e2e8f0; color: #475569; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); user-select: all; pointer-events: auto;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <p style="margin: 0 0 4px; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Employee Name</p>
                        <p id="e-name" style="margin: 0; font-weight: 800; font-size: 16px; color: #1e293b;">{{name}}</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 4px; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Work Email</p>
                        <p id="e-email" style="margin: 0; font-weight: 600; font-size: 14px; color: #334155;">{{email}}</p>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; min-width: 100px;">Email Subject:</span>
                        <div contenteditable="false" id="doc-email-subject" style="flex: 1; min-height: 24px; padding: 4px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; color: #1e293b; font-weight: 600;">{{name}} - Performance Appraisal 2026</div>
                    </div>
                </div>
                
                <span style="position: absolute; right: 12px; top: 12px; font-size: 9px; color: #22c55e; font-weight: 900; text-transform: uppercase;">SECURE LINK VERIFIED</span>
            </div>

            <h1 style="font-size: 28px; margin-bottom: 30px; font-weight: 900; text-align: center; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px;">Employee Performance Appraisal</h1>

            <h2 style="font-size: 19px; border-bottom: 2px solid #22c55e; padding-bottom: 10px; margin-bottom: 18px; font-weight: 800; color: #1e293b;">1. Self-Performance Rating</h2>
            <div style="margin-bottom: 25px; padding: 15px; background: rgba(34, 197, 94, 0.02); border-radius: 8px;">
                <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;"><i>Select the rating that best describes your performance during this period.</i></p>
                <div style="display: flex; gap: 15px; justify-content: space-between;">
                    <span contenteditable="false" style="cursor: pointer; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;">[ ] Outstanding</span>
                    <span contenteditable="false" style="cursor: pointer; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;">[ ] Exceeds Expectations</span>
                    <span contenteditable="false" style="cursor: pointer; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;">[ ] Fully Proficient</span>
                    <span contenteditable="false" style="cursor: pointer; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;">[ ] Below Expectations</span>
                </div>
            </div>

            <h2 style="font-size: 19px; border-bottom: 2px solid #22c55e; padding-bottom: 10px; margin-bottom: 18px; font-weight: 800; color: #1e293b;">2. Detailed Employee Input *</h2>
            <div contenteditable="true" style="min-height: 200px; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; font-size: 14px; color: #1e293b; background: #fff;">
                Click here to provide your detailed feedback and self-assessment...
            </div>
            
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 6px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 700;">📜 GOVERNANCE NOTICE: Core compliance sections are locked by HR.</p>
            </div>

            <div contenteditable="false" class="locked-content" data-locked="true" style="color: #475569; display: block; padding: 20px; background: #f1f5f9; border-radius: 12px; border: 2px solid #cbd5e1; margin-bottom: 30px; position: relative; user-select: all; pointer-events: auto;">
                <h2 style="font-size: 19px; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-bottom: 18px; font-weight: 800; color: #1e293b;">3. Policy Compliance & Integrity</h2>
                <p style="margin-bottom: 15px; line-height: 1.8;">The employee has maintained full compliance with JAAGO Foundation internal policies and data protection standards during the evaluation period. No disciplinary actions or policy violations have been recorded for the current cycle.</p>
                <span style="position: absolute; right: 15px; bottom: 10px; font-size: 10px; color: #ef4444; font-weight: 900;">IMMUTABLE</span>
            </div>
        </div>
    `,
    'Self-Assessment Form': `
        <div class="page-content">
            <h1 style="font-size: 26px; margin-bottom: 30px; font-weight: 900; text-align: center; color: #0f172a;">PERSONAL GROWTH & SELF-ASSESSMENT</h1>
            <div contenteditable="true" style="min-height: 400px; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; font-size: 14px; color: #1e293b; background: #fff;">
                Describe your top 3 contributions this year...
            </div>
        </div>
    `,
    '360 Degree Feedback': `
        <div class="page-content">
            <h1 style="font-size: 26px; margin-bottom: 30px; font-weight: 900; text-align: center; color: #0f172a;">PEER-TO-PEER FEEDBACK (360°)</h1>
            <div contenteditable="true" style="min-height: 400px; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; font-size: 14px; color: #1e293b; background: #fff;">
                Provide confidential feedback for {{name}}...
            </div>
        </div>
    `
};

const AppraisalEditor: React.FC<AppraisalEditorProps> = ({ initialId, onBack }) => {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.getAttribute('data-theme') === 'dark' || document.body.classList.contains('dark-theme'));
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const colors = {
        primaryGreen: '#22c55e',
        primaryBg: isDark ? '#0f172a' : '#f8fafc',
        secondaryBg: isDark ? '#1e293b' : '#f1f5f9',
        panelBg: isDark ? '#1e293b' : '#ffffff',
        textPrimary: isDark ? '#f1f5f9' : '#0f172a',
        textSecondary: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? '#334155' : '#e2e8f0',
        docWhite: '#ffffff',
        docText: '#1a1a1a',
        workspaceBg: isDark ? '#020617' : '#e2e8f0'
    };

    const params = new URLSearchParams(window.location.search);
    const tabType = (params.get('tab') as 'self' | 'supervisor' | '360') || 'self';
    const isEmployeeMode = params.get('mode') === 'employee';

    const [activeTemplate, setActiveTemplate] = useState<keyof typeof templates>('Annual Performance Review');
    const [activeSubTab, setActiveSubTab] = useState<'default' | 'create'>('default');
    const [title, setTitle] = useState(`JAAGO Annual Appraisal (${tabType === 'self' ? 'Self Assessment' : tabType === 'supervisor' ? 'Supervisor Eval' : '360 Feedback'})`);
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<OdooEmployee | null>(null);
    const [employees, setEmployees] = useState<OdooEmployee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
    const [proposedDesignation, setProposedDesignation] = useState('');
    const [hrFeedback, setHrFeedback] = useState('');
    const [hikePercentage, setHikePercentage] = useState<number>(0);
    const [finalSalary, setFinalSalary] = useState<number>(0);
    const [appraisalDate, setAppraisalDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' | 'info' } | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const editorRef = useRef<HTMLDivElement>(null);

    const updatePageCount = () => {
        if (editorRef.current) {
            const height = editorRef.current.scrollHeight;
            const newCount = Math.max(1, Math.ceil(height / 1020));
            if (newCount !== pageCount) setPageCount(newCount);
        }
    };

    useEffect(() => {
        const timer = setInterval(updatePageCount, 1500);
        return () => clearInterval(timer);
    }, [pageCount]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        loadEmployees();
        if (initialId) loadAppraisalData();
    }, [initialId]);

    const loadAppraisalData = async () => {
        if (!initialId) return;
        const res = await AppraisalService.fetchAppraisalById(tabType, initialId);
        if (res.success && res.data) {
            const record = res.data;
            if (record.employee_id) {
                // Set employee state but don't trigger template overwrite
                setSelectedEmployee({
                    id: record.employee_id[0],
                    name: record.employee_id[1],
                    work_email: record.work_email || '',
                    next_appraisal_date: record.date_close || false,
                    parent_id: false
                });
            }
            setTitle(record.display_name || title);

            // CRITICAL: Set content from database
            const savedContent = record.note || '';
            setContent(savedContent);
            if (editorRef.current) {
                editorRef.current.innerHTML = savedContent;
            }

            setProposedDesignation(record.x_studio_proposed_designation_1 || '');
            setHrFeedback(record.x_studio_remarks || '');
            setHikePercentage(record.x_studio_input_hike_percentage || 0);
            setFinalSalary(record.x_studio_computed_new_salary || 0);
            setAppraisalDate(record.date_close || new Date().toISOString().split('T')[0]);

            // Set subtab to 'create' if there's content to prevent default template overwrite in useEffect
            if (savedContent) {
                setActiveSubTab('create');
            }
        }
    };

    const loadEmployees = async (search?: string) => {
        const res = await AppraisalService.fetchEmployees(search);
        if (res.success) setEmployees(res.data || []);
    };

    const handleEmployeeSelect = (emp: OdooEmployee) => {
        setSelectedEmployee(emp);
        setShowEmployeeSearch(false);
        setSearchTerm('');
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
    };

    const handleTemplateChange = (templateName: keyof typeof templates, subTab: 'default' | 'create') => {
        setActiveTemplate(templateName);
        setActiveSubTab(subTab);
        if (subTab === 'create') {
            setContent('');
            if (editorRef.current) editorRef.current.innerHTML = '<h1 style="text-align: center;">New Appraisal</h1><p>Start typing...</p>';
        } else {
            let html = templates[templateName];
            html = html.replace(/{{name}}/g, selectedEmployee?.name || 'Select Employee...')
                .replace(/{{email}}/g, selectedEmployee?.work_email || 'No Email');
            setContent(html);
            if (editorRef.current) editorRef.current.innerHTML = html;
        }
    };

    useEffect(() => {
        if (selectedEmployee?.next_appraisal_date) setAppraisalDate(selectedEmployee.next_appraisal_date);

        // ONLY apply template if it's a NEW appraisal and we are in default mode
        if (activeSubTab === 'default' && !initialId) {
            let html = templates[activeTemplate];
            html = html.replace(/{{name}}/g, selectedEmployee?.name || 'Select Employee...')
                .replace(/{{email}}/g, selectedEmployee?.work_email || 'No Email');
            if (editorRef.current) editorRef.current.innerHTML = html;
            setContent(html);
        }
    }, [selectedEmployee, initialId]);

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const html = e.clipboardData.getData('text/html');
        if (html) {
            const cleanHtml = html.replace(/<o:p>.*?<\/o:p>/g, '');
            document.execCommand('insertHTML', false, cleanHtml);
        } else {
            document.execCommand('insertText', false, text);
        }
        setTimeout(updatePageCount, 100);
    };

    const handleLock = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
            setNotification({ message: 'Select text to lock.', type: 'error' });
            return;
        }
        const range = selection.getRangeAt(0);
        const wrapper = document.createElement('span');
        wrapper.className = 'locked-content';
        wrapper.setAttribute('contenteditable', 'false');
        wrapper.setAttribute('data-locked', 'true');
        Object.assign(wrapper.style, {
            color: '#374151', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px',
            border: '2px solid #cbd5e1', display: 'inline-block', cursor: 'not-allowed', margin: '0 2px'
        });
        range.surroundContents(wrapper);
        if (editorRef.current) setContent(editorRef.current.innerHTML);
    };

    const handleUnlock = () => {
        const selection = window.getSelection();
        if (!selection) return;
        const findLocked = (node: Node | null): HTMLElement | null => {
            let curr = node;
            while (curr && curr !== editorRef.current) {
                if (curr instanceof HTMLElement && curr.getAttribute('data-locked') === 'true') return curr;
                curr = curr.parentNode;
            }
            return null;
        };
        const locked = findLocked(selection.anchorNode);
        if (locked && locked.parentNode) {
            const html = locked.innerHTML;
            const parent = locked.parentNode;
            const temp = document.createElement('span');
            temp.innerHTML = html;
            parent.insertBefore(temp, locked);
            parent.removeChild(locked);
            if (editorRef.current) setContent(editorRef.current.innerHTML);
        }
    };

    const handleSave = async () => {
        if (!selectedEmployee) return;
        setIsSaving(true);
        const data = {
            employee_id: selectedEmployee.id,
            note: editorRef.current?.innerHTML || content,
            date_close: appraisalDate,
            state: '1_new', // Fix: Use Odoo technical key
            x_studio_proposed_designation_1: proposedDesignation,
            x_studio_remarks: hrFeedback,
            x_studio_input_hike_percentage: hikePercentage,
            x_studio_computed_new_salary: finalSalary
        };
        const res = initialId ? await AppraisalService.updateAppraisal(tabType, initialId, data) : await AppraisalService.createAppraisal(tabType, data);
        if (res.success) setNotification({ message: 'Saved successfully!', type: 'success' });
        setIsSaving(false);
    };

    const handleSendEmail = async () => {
        if (!selectedEmployee || !initialId) return;
        setIsSending(true);
        const token = btoa(`appraisal-${initialId}-${Date.now()}`);
        const secureLink = `${window.location.origin}${window.location.pathname}?view=appraisal-editor&id=${initialId}&mode=employee&token=${token}`;
        const emailBody = `
            <div style="font-family: sans-serif; padding: 30px; background: #fff;">
                <h2>Action Required: Performance Appraisal</h2>
                <p>Hello ${selectedEmployee.name},</p>
                <p>Please complete your assessment via the secure link below:</p>
                <a href="${secureLink}" style="display: inline-block; padding: 12px 24px; background: #22c55e; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">COMPLETE APPRAISAL</a>
                <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                    ${editorRef.current?.innerHTML || content}
                </div>
            </div>
        `;
        const res = await AppraisalService.sendEmail(selectedEmployee.work_email || 'hr@jaago.com', 'Performance Appraisal Secure Link', emailBody, 'hr.appraisal', initialId);
        if (res.success) {
            setNotification({ message: 'Email distributed!', type: 'success' });
            await AppraisalService.updateAppraisal(tabType, initialId, { state: '2_pending' });
        }
        setIsSending(false);
    };

    const handleSubmitByEmployee = async () => {
        if (!initialId) return;
        setIsSaving(true);
        const res = await AppraisalService.updateAppraisal(tabType, initialId, { note: editorRef.current?.innerHTML || content, state: '2_pending' });
        if (res.success) {
            setNotification({ message: 'Submitted!', type: 'success' });
            setTimeout(() => window.close(), 2000);
        }
        setIsSaving(false);
    };


    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: colors.secondaryBg, color: colors.textPrimary }}>
            <div style={{ background: colors.primaryBg, padding: '12px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button onClick={() => onBack ? onBack() : window.close()} style={{ background: '#fff', border: `1px solid ${colors.border}`, padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><X size={18} /></button>
                    <div>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ background: 'transparent', border: 'none', color: colors.textPrimary, fontWeight: 700, outline: 'none', width: '300px' }} />
                        <div style={{ fontSize: '11px', color: colors.textSecondary }}>{selectedEmployee?.name || 'No employee'}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {!isEmployeeMode && (
                        <>
                            <button onClick={() => setShowEmployeeSearch(!showEmployeeSearch)} style={{ padding: '8px 16px', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Change Employee</button>
                            <button onClick={handleSendEmail} disabled={isSending} style={{ padding: '8px 16px', background: colors.primaryGreen, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>{isSending ? <Loader size={16} className="animate-spin" /> : 'Send Email'}</button>
                            <button onClick={handleSave} disabled={isSaving} style={{ padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Save</button>
                        </>
                    )}
                </div>
            </div>

            {showEmployeeSearch && (
                <div style={{ position: 'absolute', top: '70px', right: '24px', width: '300px', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: '12px', zIndex: 1000, padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <input autoFocus placeholder="Search..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); loadEmployees(e.target.value); }} style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {employees.map(e => <div key={e.id} onClick={() => handleEmployeeSelect(e)} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{e.name}</div>)}
                    </div>
                </div>
            )}

            {!isEmployeeMode && (
                <div style={{ background: colors.panelBg, padding: '8px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', gap: '8px' }}>
                    <ToolbarButton icon={<Bold size={18} />} onClick={() => execCommand('bold')} />
                    <ToolbarButton icon={<Italic size={18} />} onClick={() => execCommand('italic')} />
                    <ToolbarButton icon={<Underline size={18} />} onClick={() => execCommand('underline')} />
                    <div style={{ width: '1px', background: colors.border, margin: '0 8px' }} />
                    <ToolbarButton icon={<Lock size={18} />} onClick={handleLock} />
                    <ToolbarButton icon={<Unlock size={18} />} onClick={handleUnlock} />
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {!isEmployeeMode && (
                    <div style={{ width: '250px', borderRight: `1px solid ${colors.border}`, background: colors.panelBg, padding: '24px' }}>
                        <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textSecondary, marginBottom: '12px' }}>Templates</h3>
                        {Object.keys(templates).map(t => (
                            <div key={t} onClick={() => handleTemplateChange(t as any, 'default')} style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', background: activeTemplate === t ? `${colors.primaryGreen}15` : 'transparent', color: activeTemplate === t ? colors.primaryGreen : colors.textPrimary, marginBottom: '4px' }}>{t}</div>
                        ))}
                    </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <div id="appraisal-editor-surface" ref={editorRef} contentEditable={!isEmployeeMode} onPaste={handlePaste} suppressContentEditableWarning={true} style={{ width: '850px', minHeight: '1100px', background: '#fff', color: '#1a1a1a', padding: '80px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', outline: 'none', lineHeight: '1.7', fontSize: '15px' }} />
                        {isEmployeeMode && (
                            <button onClick={handleSubmitByEmployee} style={{ position: 'absolute', top: '20px', right: '20px', padding: '12px 24px', background: colors.primaryGreen, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>SUBMIT APPRAISAL</button>
                        )}
                    </div>
                </div>

                {!isEmployeeMode && (
                    <div style={{ width: '300px', borderLeft: `1px solid ${colors.border}`, background: colors.panelBg, padding: '24px' }}>
                        <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: colors.textSecondary, marginBottom: '20px' }}>HR REVIEW</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: '8px' }}>PROPOSED DESIGNATION</label>
                                <input value={proposedDesignation} onChange={(e) => setProposedDesignation(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: colors.textSecondary, display: 'block', marginBottom: '8px' }}>HR FEEDBACK</label>
                                <textarea value={hrFeedback} onChange={(e) => setHrFeedback(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, minHeight: '150px', outline: 'none', resize: 'none' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .locked-content { user-select: all; }
                .locked-content:hover { border-color: #22c55e !important; }
            `}</style>
        </div>
    );
};

const ToolbarButton: React.FC<{ icon: any, onClick: any }> = ({ icon, onClick }) => (
    <div onMouseDown={(e) => { e.preventDefault(); onClick(); }} style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
);

export default AppraisalEditor;
