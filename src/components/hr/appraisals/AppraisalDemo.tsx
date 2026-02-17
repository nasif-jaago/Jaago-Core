import React, { useState, useEffect, useMemo } from 'react';
import {
    Mail, Send, Inbox,
    CheckCircle, MessageSquare, Save, RefreshCcw,
    Table, Eye, ArrowRight, BarChart2, Filter,
    Lock, Clock, User, Briefcase, FileText, ChevronRight
} from 'lucide-react';
import { AppraisalService } from '../../../api/AppraisalService';
import { motion, AnimatePresence } from 'framer-motion';

type ViewTab = 'inbox' | 'form' | 'submitted' | 'monitoring' | 'logs';

const AppraisalDemo: React.FC = () => {
    const [view, setView] = useState<ViewTab>('inbox');
    const [testEmails, setTestEmails] = useState<any[]>([]);
    const [activeEmail, setActiveEmail] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        rating: '3',
        feedback: '',
        q1_score: 50,
        q2_score: 50,
        comments: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testLogs, setTestLogs] = useState<any[]>([]);
    const [actionLogs, setActionLogs] = useState<any[]>([]);
    const [isEmailViewOpen, setIsEmailViewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Filter states for Monitoring
    const [filterDept, setFilterDept] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const storageKey = 'jaago_test_emails';
            const emails = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const submitted = await AppraisalService.getTestAppraisalSubmissions();
            const logs = await AppraisalService.getTestActionLogs();

            setTestEmails(emails || []);
            setTestLogs(submitted || []);
            setActionLogs(logs || []);
        } catch (err) {
            console.error('Data load failed', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEmail = async (email: any) => {
        setActiveEmail(email);
        setIsEmailViewOpen(true);

        // Log "Opened" action
        await AppraisalService.logTestAction({
            email: email.receiver_email,
            action_type: 'Opened',
            status: 'Success',
            details: `Employee opened test email for ${email.subject}`
        });
        loadData();
    };

    const handleLinkClick = async () => {
        setIsEmailViewOpen(false);
        setView('form');

        // Log "Clicked" action
        await AppraisalService.logTestAction({
            email: activeEmail.receiver_email,
            action_type: 'Link Clicked',
            status: 'Success',
            details: `Employee clicked secure link in appraisal email`
        });
        loadData();
    };

    const handleSubmitAppraisal = async () => {
        if (!activeEmail) return;
        setIsSubmitting(true);
        try {
            const logEntry = {
                employee_name: activeEmail.employee_name,
                department: activeEmail.department || 'General',
                appraisal_id: activeEmail.appraisal_id,
                rating: formData.rating,
                feedback: formData.feedback,
                scores: { q1: formData.q1_score, q2: formData.q2_score },
                comments: formData.comments,
                submitted_at: new Date().toISOString(),
                status: 'Completed'
            };

            await AppraisalService.saveTestAppraisalLog(logEntry);

            // Update email status
            await AppraisalService.updateTestEmailStatus(activeEmail.secure_token, 'Submitted');

            // Log submission
            await AppraisalService.logTestAction({
                email: activeEmail.receiver_email,
                action_type: 'Submitted',
                status: 'Success',
                details: `Appraisal form successfully submitted by ${activeEmail.employee_name}`
            });

            await loadData();
            setView('submitted');
            setActiveEmail({ ...activeEmail, status: 'Submitted' }); // Make read-only
        } catch (err) {
            alert('Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = useMemo(() => {
        const totalSent = testEmails.length;
        const totalOpened = actionLogs.filter(l => l.action_type === 'Opened').length;
        const totalSubmitted = testLogs.length;
        return {
            sent: totalSent,
            opened: totalOpened,
            submitted: totalSubmitted,
            pending: totalSent - totalSubmitted
        };
    }, [testEmails, actionLogs, testLogs]);

    const isSubmitted = activeEmail?.status === 'Submitted';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease' }}>
            {/* Top Navigation Bar */}
            <div style={{
                display: 'flex',
                gap: '8px',
                background: 'var(--input-bg)',
                padding: '8px',
                borderRadius: '16px',
                border: '1px solid var(--border-glass)',
                width: 'fit-content'
            }}>
                <DemoTabButton active={view === 'inbox'} onClick={() => setView('inbox')} icon={<Inbox size={16} />} label="1. Test Receiver Inbox" />
                <DemoTabButton active={view === 'form'} onClick={() => setView('form')} icon={<FileText size={16} />} label="2. Appraisal Form" disabled={!activeEmail} />
                <DemoTabButton active={view === 'submitted'} onClick={() => setView('submitted')} icon={<CheckCircle size={16} />} label="3. Test Submit Tab" />
                <DemoTabButton active={view === 'monitoring'} onClick={() => setView('monitoring')} icon={<BarChart2 size={16} />} label="4. HR Monitoring Tool" />
                <DemoTabButton active={view === 'logs'} onClick={() => setView('logs')} icon={<Table size={16} />} label="5. Test Log Table" />
            </div>

            <div className="glass-panel" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <AnimatePresence mode="wait">
                    {/* 1. TEST INBOX */}
                    {view === 'inbox' && (
                        <motion.div key="inbox" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Employee Test Inbox</h2>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Simulated inbox for selected employees to receive their appraisal links.</p>
                                </div>
                                <button onClick={loadData} className="btn-secondary" style={{ padding: '8px 16px' }}>
                                    <RefreshCcw size={14} className={isLoading ? 'spin' : ''} /> Refresh
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {testEmails.length === 0 ? (
                                    <EmptyState icon={<Mail size={48} />} title="Inbox is empty" subtitle="Start a cycle and click 'Send Test Email' to see records here." />
                                ) : testEmails.map(email => (
                                    <div key={email.id} className="table-row-hover" style={{
                                        padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                                    }} onClick={() => handleOpenEmail(email)}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: '#000' }}>
                                                {email.employee_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>{email.subject}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', gap: '12px', marginTop: '4px' }}>
                                                    <span>To: <b>{email.employee_name}</b> ({email.receiver_email})</span>
                                                    <span>• {new Date(email.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <StatusBadge status={email.status} />
                                            <button className="btn-golden-3d" style={{ padding: '10px 20px', fontSize: '12px' }}>Open Email</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* 2. APPRAISAL FORM */}
                    {view === 'form' && activeEmail && (
                        <motion.div key="form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                            {isSubmitted && (
                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '16px', borderRadius: '12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#22c55e' }}>
                                    <Lock size={20} />
                                    <span style={{ fontWeight: 700 }}>This appraisal form has been submitted and is now in read-only mode.</span>
                                </div>
                            )}

                            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '3px', marginBottom: '12px' }}>OFFICIAL PERFORMANCE APPRAISAL 2024</div>
                                <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    JAAGO Foundation Review Form
                                </h1>
                                <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Participant: <b>{activeEmail.employee_name}</b> | Dept: <b>{activeEmail.department || 'Education'}</b></p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <QuestionCard icon={<User size={18} />} label="Part 1: Performance Rating" description="Select the rating that best describes your overall performance.">
                                    <select
                                        disabled={isSubmitted}
                                        value={formData.rating}
                                        onChange={e => setFormData({ ...formData, rating: e.target.value })}
                                        style={formInputStyle}
                                    >
                                        <option value="5">Excellent (Exceeds all expectations)</option>
                                        <option value="4">Very Good (Consistently meets expectations)</option>
                                        <option value="3">Good (Meets most expectations)</option>
                                        <option value="2">Average (Needs improvement)</option>
                                        <option value="1">Poor (Unsatisfactory performance)</option>
                                    </select>
                                </QuestionCard>

                                <QuestionCard icon={<MessageSquare size={18} />} label="Part 2: Achievement Feedback" description="Provide detailed examples of your key achievements during this cycle.">
                                    <textarea
                                        disabled={isSubmitted}
                                        placeholder="Start typing your feedback here..."
                                        value={formData.feedback}
                                        onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                                        style={{ ...formInputStyle, minHeight: '140px', resize: 'vertical' }}
                                    />
                                </QuestionCard>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <QuestionCard icon={<BarChart2 size={18} />} label="Collaboration Score" description="Score your teamwork (0-100)">
                                        <input disabled={isSubmitted} type="range" value={formData.q1_score} onChange={e => setFormData({ ...formData, q1_score: e.target.value })} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>{formData.q1_score}%</div>
                                    </QuestionCard>
                                    <QuestionCard icon={<Clock size={18} />} label="Punctuality Score" description="Score your reliability (0-100)">
                                        <input disabled={isSubmitted} type="range" value={formData.q2_score} onChange={e => setFormData({ ...formData, q2_score: e.target.value })} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>{formData.q2_score}%</div>
                                    </QuestionCard>
                                </div>

                                <QuestionCard icon={<Briefcase size={18} />} label="Overall Comments" description="Any final thoughts or career goals you'd like to share?">
                                    <textarea
                                        disabled={isSubmitted}
                                        placeholder="Future aspirations..."
                                        value={formData.comments}
                                        onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                        style={{ ...formInputStyle, minHeight: '100px' }}
                                    />
                                </QuestionCard>

                                {!isSubmitted && (
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                                        <button className="btn-secondary" style={{ flex: 1, padding: '16px', fontWeight: 800 }}>
                                            <Save size={18} /> Save as Draft
                                        </button>
                                        <button className="btn-golden-3d" style={{ flex: 2, padding: '16px', fontSize: '16px' }} onClick={handleSubmitAppraisal} disabled={isSubmitting}>
                                            {isSubmitting ? <RefreshCcw className="spin" size={20} /> : <ArrowRight size={20} />}
                                            Submit Final Appraisal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* 3. TEST SUBMIT TAB */}
                    {view === 'submitted' && (
                        <motion.div key="submitted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Submitted Appraisals (Read-Only)</h2>
                                <span style={{ padding: '6px 16px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontWeight: 800, fontSize: '12px' }}>
                                    {testLogs.length} FORMS COMPLETED
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                                {testLogs.map((log: any) => (
                                    <div key={log.id} className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>
                                                {log.employee_name.charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {[1, 2, 3, 4, 5].map(s => <div key={s} style={{ width: '8px', height: '8px', borderRadius: '50%', background: s <= Number(log.rating) ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} />)}
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{log.employee_name}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>Dept: {log.department}</div>
                                        <p style={{ fontSize: '14px', color: 'var(--text-main)', fontStyle: 'italic', marginBottom: '20px', borderLeft: '2px solid var(--primary)', paddingLeft: '12px' }}>
                                            "{log.feedback.substring(0, 60)}..."
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                                            <span>{new Date(log.submitted_at).toLocaleDateString()}</span>
                                            <button className="btn-secondary" style={{ padding: '4px 12px' }} onClick={() => { setFormData({ ...log, q1_score: log.scores?.q1, q2_score: log.scores?.q2 }); setView('form'); setActiveEmail({ employee_name: log.employee_name, status: 'Submitted', department: log.department }); }}>
                                                <Eye size={12} /> View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {testLogs.length === 0 && (
                                    <div style={{ gridColumn: '1/-1' }}>
                                        <EmptyState icon={<CheckCircle size={48} />} title="No submissions yet" subtitle="Completed forms will appear here in read-only format." />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* 4. HR MONITORING TOOL */}
                    {view === 'monitoring' && (
                        <motion.div key="monitoring" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>HR Performance Monitor</h2>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <FilterSelect value={filterDept} onChange={setFilterDept} options={['All', 'Education', 'IT', 'Admin', 'Finance']} icon={<Filter size={14} />} />
                                    <FilterSelect value={filterStatus} onChange={setFilterStatus} options={['All', 'Pending', 'Submitted']} icon={<Filter size={14} />} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                                <StatCard title="Total Test Emails" value={stats.sent} icon={<Send size={20} />} color="#3b82f6" />
                                <StatCard title="Opened Links" value={stats.opened} icon={<Eye size={20} />} color="#f59e0b" />
                                <StatCard title="Total Submissions" value={stats.submitted} icon={<CheckCircle size={20} />} color="#22c55e" />
                                <StatCard title="Conversion Rate" value={stats.sent ? Math.round((stats.submitted / stats.sent) * 100) + '%' : '0%'} icon={<ArrowRight size={20} />} color="var(--primary)" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
                                <div className="glass-panel" style={{ padding: '32px', background: 'rgba(255,255,255,0.01)' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px' }}>Submission Trend (Simulated)</h3>
                                    <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '20px', paddingBottom: '20px' }}>
                                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                            <div key={i} style={{ flex: 1, position: 'relative' }}>
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    style={{ width: '100%', background: 'var(--primary-gradient)', borderRadius: '8px 8px 0 0', opacity: 0.8 }}
                                                />
                                                <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '8px', color: 'var(--text-dim)' }}>Day {i + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Status Distribution</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <ProgressRow label="Submitted" value={stats.submitted} total={stats.sent} color="#22c55e" />
                                        <ProgressRow label="Opened" value={stats.opened} total={stats.sent} color="#f59e0b" />
                                        <ProgressRow label="Pending" value={stats.pending} total={stats.sent} color="#3b82f6" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 5. TEST LOG TABLE */}
                    {view === 'logs' && (
                        <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Appraisal System Logs</h2>
                                <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={loadData}>Clear All Logs</button>
                            </div>
                            <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <tr>
                                            <th style={thStyle}>LOG ID</th>
                                            <th style={thStyle}>EMAIL</th>
                                            <th style={thStyle}>ACTION TYPE</th>
                                            <th style={thStyle}>TIMESTAMP</th>
                                            <th style={thStyle}>STATUS</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>DETAILS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actionLogs.length === 0 ? (
                                            <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No logs available yet.</td></tr>
                                        ) : actionLogs.map((log: any, _: number) => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }} className="table-row-hover">
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', color: 'var(--text-dim)' }}>#{log.id.toString().slice(-6)}</td>
                                                <td style={tdStyle}>{log.email}</td>
                                                <td style={tdStyle}><ActionBadge type={log.action_type} /></td>
                                                <td style={tdStyle}>{new Date(log.timestamp).toLocaleString()}</td>
                                                <td style={tdStyle}><span style={{ color: log.status === 'Success' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{log.status.toUpperCase()}</span></td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <button className="btn-icon" onClick={() => alert(log.details)}><ChevronRight size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* EMAIL PREVIEW MODAL */}
            <AnimatePresence>
                {isEmailViewOpen && activeEmail && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)' }}>
                                <div style={{ fontSize: '13px', fontWeight: 800 }}>Email Preview</div>
                                <button onClick={() => setIsEmailViewOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>✕</button>
                            </div>

                            <div style={{ background: '#f8fafc', color: '#334155', padding: '40px', maxHeight: '70vh', overflowY: 'auto' }}>
                                <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', padding: '40px' }}>
                                    {activeEmail.body ? (
                                        <div dangerouslySetInnerHTML={{ __html: activeEmail.body }} />
                                    ) : (
                                        <>
                                            <div style={{ background: '#1e293b', padding: '24px', textAlign: 'center', margin: '-40px -40px 40px -40px' }}>
                                                <div style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '20px', letterSpacing: '1px' }}>JAAGO FOUNDATION</div>
                                            </div>
                                            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a202c', marginBottom: '20px' }}>Hello {activeEmail.employee_name},</h2>
                                            <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4a5568', marginBottom: '32px' }}>
                                                Your annual performance appraisal for the current cycle is now open. We value your contribution and would like to hear about your achievements and future goals.
                                            </p>
                                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                                <button onClick={handleLinkClick} style={{
                                                    background: '#22c55e', color: '#fff', padding: '16px 32px', borderRadius: '12px',
                                                    fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 8px 15px rgba(34, 197, 94, 0.4)'
                                                }}>
                                                    OPEN MY APPRAISAL FORM
                                                </button>
                                            </div>
                                            <p style={{ fontSize: '14px', color: '#718096', textAlign: 'center' }}>
                                                Please complete this within the next 7 working days.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '16px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                <button className="btn-secondary" style={{ padding: '8px 24px' }} onClick={() => setIsEmailViewOpen(false)}>Close Window</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// HELPER COMPONENTS
const DemoTabButton: React.FC<{ active: boolean, onClick: () => void, icon: any, label: string, disabled?: boolean }> = ({ active, onClick, icon, label, disabled }) => (
    <button disabled={disabled} onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px',
        background: active ? 'var(--primary)' : 'transparent',
        border: 'none', color: active ? '#000' : 'var(--text-dim)',
        fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '13px'
    }}>
        {icon} {label}
    </button>
);

const QuestionCard: React.FC<{ icon: any, label: string, description: string, children: React.ReactNode }> = ({ icon, label, description, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ color: 'var(--primary)' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{description}</div>
            </div>
        </div>
        {children}
    </div>
);

const StatCard: React.FC<{ title: string, value: number | string, icon: any, color: string }> = ({ title, value, icon, color }) => (
    <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ background: `${color}15`, color: color, padding: '10px', borderRadius: '12px' }}>{icon}</div>
            <span style={{ fontSize: '24px', fontWeight: 900 }}>{value}</span>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</div>
    </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
    <span style={{
        padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 900,
        background: status === 'Submitted' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        color: status === 'Submitted' ? '#22c55e' : '#f59e0b',
        border: `1px solid ${status === 'Submitted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
    }}>
        {status?.toUpperCase() || 'PENDING'}
    </span>
);

const ActionBadge: React.FC<{ type: string }> = ({ type }) => {
    const colors: any = { 'Sent': '#3b82f6', 'Opened': '#f59e0b', 'Link Clicked': '#8b5cf6', 'Submitted': '#22c55e' };
    return <span style={{ color: colors[type] || '#fff', fontWeight: 800 }}>{type}</span>;
};

const FilterSelect: React.FC<{ value: string, onChange: (v: string) => void, options: string[], icon: any }> = ({ value, onChange, options, icon }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }}>{icon}</div>
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...formInputStyle, padding: '8px 12px 8px 36px', minWidth: '140px' }}>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ProgressRow: React.FC<{ label: string, value: number, total: number, color: string }> = ({ label, value, total, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800 }}>
            <span>{label}</span>
            <span>{value} / {total}</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: total ? `${(value / total) * 100}%` : 0 }} style={{ height: '100%', background: color }} />
        </div>
    </div>
);

const EmptyState: React.FC<{ icon: any, title: string, subtitle: string }> = ({ icon, title, subtitle }) => (
    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ marginBottom: '20px', opacity: 0.2 }}>{icon}</div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '14px' }}>{subtitle}</p>
    </div>
);

const formInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    background: 'var(--input-bg)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

const thStyle: React.CSSProperties = { padding: '16px', fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textAlign: 'left', letterSpacing: '1px' };
const tdStyle: React.CSSProperties = { padding: '16px', fontSize: '14px', color: 'var(--text-dim)' };

export default AppraisalDemo;
