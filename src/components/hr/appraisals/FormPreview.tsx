import React, { useState, useEffect } from 'react';
import { FormBuilderService, type FormQuestion } from '../../../api/FormBuilderService';
import { AppraisalService } from '../../../api/AppraisalService';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

const FormPreview: React.FC<{ formId: string }> = ({ formId }) => {
    const [form, setForm] = useState<any>(null);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadForm();
    }, [formId]);

    const loadForm = async () => {
        setLoading(true);
        const res = await FormBuilderService.fetchFormById(formId);
        if (res.success && res.data) {
            setForm(res.data);
        } else {
            setError('Form not found or access denied.');
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const details = Object.entries(responses).map(([qId, val]) => ({
            question_id: qId,
            answer_value: val
        }));

        const res = await FormBuilderService.submitResponse({ form_id: formId }, details);
        if (res.success) {
            setSubmitted(true);

            // LOG TO APPRAISAL LOG & FORM LOG
            const urlParams = new URLSearchParams(window.location.search);
            const appraisalId = urlParams.get('appraisal_id');
            const token = urlParams.get('token');

            if (appraisalId) {
                const idNum = parseInt(appraisalId);

                // 1. Log the action
                await AppraisalService.logActiveAction({
                    action_type: 'Form Submitted',
                    details: `Employee submitted form: ${form.title}`,
                    status: 'success',
                    appraisal_id: idNum,
                    metadata: {
                        form_id: formId,
                        form_title: form.title,
                        submission_token: token,
                        question_count: details.length
                    }
                });

                // 2. Save detailed submission to Supabase for the logs view
                await AppraisalService.saveActiveSubmission({
                    appraisal_id: idNum,
                    form_id: formId,
                    form_title: form.title,
                    responses: responses,
                    submitted_at: new Date().toISOString()
                });

                // 3. Update Odoo record state to '2_pending' (In Review/Submitted)
                await AppraisalService.updateAppraisal('self', idNum, {
                    state: '2_pending',
                    date_close: new Date().toISOString().split('T')[0] // Set close date to today
                });
            }
        } else {
            alert('Failed to submit. Please try again.');
        }
        setLoading(false);
    };

    if (loading && !form) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 20px' }} />
                    <p style={{ color: 'var(--text-dim)' }}>Loading form...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Error</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel"
                    style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '500px' }}
                >
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                        <CheckCircle2 size={48} color="#22c55e" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px' }}>Response Recorded</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>Thank you. Your response for <b>{form.title}</b> has been successfully submitted and recorded.</p>
                    <button onClick={() => window.location.reload()} className="btn-secondary" style={{ padding: '12px 32px' }}>Submit another response</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', fontFamily: form.theme_config.font || 'Inter, sans-serif' }}>
            <div style={{ width: '100%', maxWidth: '770px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* FORM HEADER */}
                    <div className="glass-panel" style={{ borderTop: `10px solid ${form.theme_config.color}`, padding: '32px 40px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px', color: 'var(--text-main)' }}>{form.title}</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: '1.6' }}>{form.description}</p>
                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>* Indicates required question</span>
                            <span>JAAGO Foundation Secure Form</span>
                        </div>
                    </div>

                    {/* QUESTIONS */}
                    {form.questions?.map((q: FormQuestion) => (
                        <div className="glass-panel" key={q.id} style={{ padding: '32px 40px' }}>
                            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '24px', display: 'flex', gap: '4px' }}>
                                {q.label} {q.required && <span style={{ color: '#ef4444' }}>*</span>}
                            </div>

                            <div className="question-input-area">
                                {q.type === 'short_answer' && (
                                    <input
                                        required={q.required}
                                        value={responses[q.id] || ''}
                                        onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                                        className="form-input"
                                        placeholder="Your answer"
                                        style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--border-glass)', borderRadius: '0', background: 'transparent', padding: '8px 0' }}
                                    />
                                )}
                                {q.type === 'paragraph' && (
                                    <textarea
                                        required={q.required}
                                        value={responses[q.id] || ''}
                                        onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                                        className="form-input"
                                        placeholder="Your answer"
                                        style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--border-glass)', borderRadius: '0', background: 'transparent', padding: '8px 0', minHeight: '100px', resize: 'none' }}
                                    />
                                )}
                                {(q.type === 'multiple_choice' || q.type === 'dropdown') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {q.options_json?.map((opt: string) => (
                                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    required={q.required}
                                                    checked={responses[q.id] === opt}
                                                    onChange={() => setResponses({ ...responses, [q.id]: opt })}
                                                    style={{ width: '18px', height: '18px', accentColor: form.theme_config.color }}
                                                />
                                                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {q.type === 'checkboxes' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {q.options_json?.map((opt: string) => {
                                            const currentArr = responses[q.id] || [];
                                            const checked = currentArr.includes(opt);
                                            return (
                                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const nextArr = e.target.checked
                                                                ? [...currentArr, opt]
                                                                : currentArr.filter((i: string) => i !== opt);
                                                            setResponses({ ...responses, [q.id]: nextArr });
                                                        }}
                                                        style={{ width: '18px', height: '18px', accentColor: form.theme_config.color }}
                                                    />
                                                    <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                                {q.type === 'linear_scale' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center', padding: '20px 0' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Poor</span>
                                        {[1, 2, 3, 4, 5].map(v => (
                                            <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{v}</span>
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    required={q.required}
                                                    checked={responses[q.id] === v.toString()}
                                                    onChange={() => setResponses({ ...responses, [q.id]: v.toString() })}
                                                    style={{ width: '18px', height: '18px', accentColor: form.theme_config.color }}
                                                />
                                            </div>
                                        ))}
                                        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Excellent</span>
                                    </div>
                                )}
                                {q.type === 'date' && (
                                    <input
                                        type="date"
                                        required={q.required}
                                        value={responses[q.id] || ''}
                                        onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                                        className="form-input"
                                        style={{ padding: '10px 16px', background: 'var(--input-bg)' }}
                                    />
                                )}
                                {q.type === 'time' && (
                                    <input
                                        type="time"
                                        required={q.required}
                                        value={responses[q.id] || ''}
                                        onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                                        className="form-input"
                                        style={{ padding: '10px 16px', background: 'var(--input-bg)' }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background: form.theme_config.color,
                                border: 'none',
                                color: '#000',
                                padding: '12px 48px',
                                borderRadius: '12px',
                                fontWeight: 800,
                                fontSize: '15px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {loading ? 'SUBMITTING...' : 'SUBMIT'} <ChevronRight size={18} />
                        </button>
                        <button type="button" onClick={() => setResponses({})} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '14px', cursor: 'pointer' }}>Clear form</button>
                    </div>
                </form>

                <footer style={{ marginTop: '40px', textAlign: 'center', padding: '40px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>This form was created inside JAAGO Organizational Intelligence (ERP).</p>
                    <p style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-dim)', marginTop: '8px' }}>JAAGO FOUNDATION Forms</p>
                </footer>
            </div>
        </div>
    );
};

export default FormPreview;
