import React, { useState, useEffect } from 'react';
import {
    Plus, FileText, Image, Film, Layout, Eye, Send,
    Type, AlignLeft, CheckSquare, ChevronDown, Upload, Calendar, Clock,
    GripVertical, Trash2, Copy, MoreVertical, CheckCircle2, X,
    ArrowLeft, Palette, Globe, Lock, Share2, RotateCcw, Save, Download
} from 'lucide-react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { FormBuilderService, type Form, type FormQuestion } from '../../../api/FormBuilderService';

const QUESTION_TYPES = [
    { type: 'short_answer', label: 'Short Answer', icon: <Type size={16} /> },
    { type: 'paragraph', label: 'Paragraph', icon: <AlignLeft size={16} /> },
    { type: 'multiple_choice', label: 'Multiple Choice', icon: <CheckCircle2 size={16} /> },
    { type: 'checkboxes', label: 'Checkboxes', icon: <CheckSquare size={16} /> },
    { type: 'dropdown', label: 'Dropdown', icon: <ChevronDown size={16} /> },
    { type: 'file_upload', label: 'File Upload', icon: <Upload size={16} /> },
    { type: 'linear_scale', label: 'Linear Scale', icon: <MoreVertical size={16} /> },
    { type: 'date', label: 'Date', icon: <Calendar size={16} /> },
    { type: 'time', label: 'Time', icon: <Clock size={16} /> },
    { type: 'mc_grid', label: 'Multiple choice grid', icon: <Layout size={16} /> },
    { type: 'cb_grid', label: 'Checkbox grid', icon: <Layout size={16} /> },
];

const FormBuilder: React.FC<{ onBack?: () => void, initialId?: string }> = ({ onBack, initialId }) => {
    const [form, setForm] = useState<Partial<Form>>({
        title: 'Untitled Form',
        description: 'Form Description',
        status: 'draft',
        theme_config: { color: '#22c55e', font: 'Inter' },
        settings: { public: true }
    });
    const [questions, setQuestions] = useState<Partial<FormQuestion>[]>([]);
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAutosaving, setIsAutosaving] = useState(false);
    const [view, setView] = useState<'editor' | 'responses' | 'settings'>('editor');
    const [showPalette, setShowPalette] = useState(false);
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
        if (initialId) {
            loadForm(initialId);
        } else {
            // Start with one question
            addQuestion();
        }
    }, [initialId]);

    const loadForm = async (id: string) => {
        setLoading(true);
        const res = await FormBuilderService.fetchFormById(id);
        if (res.success && res.data) {
            setForm(res.data);
            setQuestions(res.data.questions || []);
        }
        setLoading(false);
    };

    const addQuestion = (type: FormQuestion['type'] = 'multiple_choice') => {
        const newQ: Partial<FormQuestion> = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            label: 'Untitled Question',
            required: false,
            options_json: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' ? ['Option 1'] : null
        };
        setQuestions([...questions, newQ]);
        setActiveQuestionId(newQ.id!);
    };

    const updateQuestion = (id: string, updates: Partial<FormQuestion>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
        if (activeQuestionId === id) setActiveQuestionId(null);
    };

    const duplicateQuestion = (q: Partial<FormQuestion>) => {
        const newQ = { ...q, id: Math.random().toString(36).substr(2, 9) };
        const index = questions.findIndex(item => item.id === q.id);
        const newQuestions = [...questions];
        newQuestions.splice(index + 1, 0, newQ);
        setQuestions(newQuestions);
        setActiveQuestionId(newQ.id!);
    };

    const saveForm = async () => {
        setLoading(true);
        const res = await FormBuilderService.saveForm(form, questions);
        if (res.success) {
            setForm(res.data);
            alert('Form saved successfully!');
        }
        setLoading(false);
    };

    // Autosave logic
    useEffect(() => {
        if (!form.title || questions.length === 0 || loading || isAutosaving) return;

        const timer = setTimeout(async () => {
            console.log('Autosaving form...');
            setIsAutosaving(true);
            const res = await FormBuilderService.saveForm(form, questions);
            if (res.success && res.data?.id) {
                // If it was a new form, update the local state with the assigned ID
                if (!form.id) {
                    setForm(prev => ({ ...prev, id: res.data.id }));
                }
            }
            setIsAutosaving(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [form, questions]);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-deep)',
            display: 'flex',
            flexDirection: 'column',
            color: 'var(--text-main)',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* TOP NAVIGATION */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border-glass)',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="btn-icon" style={{ background: 'var(--input-bg)' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                fontSize: '18px',
                                fontWeight: 800,
                                outline: 'none',
                                width: '240px'
                            }}
                        />
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {loading || isAutosaving ? 'Saving...' : 'All changes saved'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', background: 'var(--input-bg)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border-glass)' }}>
                    {['editor', 'responses', 'settings'].map(t => (
                        <button
                            key={t}
                            onClick={() => setView(t as any)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                background: view === t ? 'var(--primary)' : 'transparent',
                                color: view === t ? '#000' : 'var(--text-dim)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setShowPalette(true)} className="btn-icon" style={{ background: 'var(--input-bg)' }}>
                        <Palette size={18} />
                    </button>
                    <button onClick={() => window.open(`/?view=form-preview&id=${form.id}`, '_blank')} className="btn-icon" style={{ background: 'var(--input-bg)' }}>
                        <Eye size={18} />
                    </button>
                    <button onClick={() => setShowShare(true)} className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px', gap: '8px', display: 'flex', alignItems: 'center' }}>
                        <Send size={16} /> SEND
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={saveForm}
                        disabled={loading}
                        className="btn-3d-green"
                        style={{
                            padding: '8px 16px',
                            fontSize: '12px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 0 #065f46, 0 8px 15px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        {loading ? <RotateCcw size={14} className="spin" /> : <Save size={14} />}
                        {loading ? 'SAVING...' : 'SAVE FORM'}
                    </motion.button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main style={{
                flex: 1,
                padding: '40px 20px',
                display: 'flex',
                gap: '24px',
                justifyContent: 'center',
                overflowY: 'auto'
            }}>
                <div style={{ width: '100%', maxWidth: '770px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {view === 'editor' && (
                        <>
                            {/* FORM HEADER CARD */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel"
                                style={{
                                    borderTop: `10px solid ${form.theme_config.color}`,
                                    padding: '24px 32px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}
                            >
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    style={{
                                        fontSize: '32px',
                                        fontWeight: 900,
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid transparent',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        padding: '4px 0',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderBottomColor = 'var(--border-glass)'}
                                    onBlur={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
                                    placeholder="Form Title"
                                />
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    style={{
                                        fontSize: '14px',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid transparent',
                                        color: 'var(--text-dim)',
                                        outline: 'none',
                                        resize: 'none',
                                        padding: '4px 0',
                                        transition: 'border-color 0.2s',
                                        minHeight: '40px'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderBottomColor = 'var(--border-glass)'}
                                    onBlur={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
                                    placeholder="Form description"
                                />
                            </motion.div>

                            {/* QUESTIONS LIST */}
                            <Reorder.Group
                                as="div"
                                axis="y"
                                values={questions}
                                onReorder={(newOrder) => {
                                    console.log('Reordering questions:', newOrder);
                                    setQuestions(newOrder);
                                }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                            >
                                {questions.map((q) => (
                                    <QuestionCard
                                        key={q.id}
                                        question={q}
                                        isActive={activeQuestionId === q.id}
                                        onActivate={() => setActiveQuestionId(q.id!)}
                                        onUpdate={(upd) => updateQuestion(q.id!, upd)}
                                        onDelete={() => deleteQuestion(q.id!)}
                                        onDuplicate={() => duplicateQuestion(q)}
                                    />
                                ))}
                            </Reorder.Group>

                            <div style={{ height: '100px' }} />
                        </>
                    )}

                    {view === 'responses' && <ResponsesView formId={form.id!} />}
                    {view === 'settings' && <SettingsView form={form} setForm={setForm} />}
                </div>

                {/* FLOATING TOOLSBAR */}
                {view === 'editor' && (
                    <div style={{
                        position: 'sticky',
                        top: '100px',
                        height: 'fit-content',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        background: 'var(--bg-surface)',
                        padding: '8px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-glass)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <ToolButton icon={<Plus size={20} />} label="Add question" onClick={() => addQuestion()} color="#22c55e" />
                        <ToolButton icon={<FileText size={20} />} label="Import questions" color="#3b82f6" />
                        <ToolButton icon={<Type size={20} />} label="Add title & description" color="#f59e0b" />
                        <ToolButton icon={<Image size={20} />} label="Add image" color="#8b5cf6" />
                        <ToolButton icon={<Film size={20} />} label="Add video" color="#ef4444" />
                        <ToolButton icon={<Layout size={20} />} label="Add section" color="#10b981" />
                    </div>
                )}
            </main>

            {/* MODALS */}
            {showPalette && <PaletteModal onClose={() => setShowPalette(false)} form={form} setForm={setForm} />}
            {showShare && <ShareModal onClose={() => setShowShare(false)} form={form} />}
        </div>
    );
};

const QuestionCard: React.FC<{
    question: Partial<FormQuestion>;
    isActive: boolean;
    onActivate: () => void;
    onUpdate: (upd: Partial<FormQuestion>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}> = ({ question: q, isActive, onActivate, onUpdate, onDelete, onDuplicate }) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            as="div"
            value={q}
            dragListener={false}
            dragControls={controls}
            onClick={onActivate}
            style={{
                position: 'relative',
                background: 'var(--bg-surface)',
                borderRadius: '16px',
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                boxShadow: isActive ? '0 8px 32px rgba(0,0,0,0.4)' : 'var(--shadow-sm)',
                padding: isActive ? '24px 32px' : '24px',
                transition: 'all 0.2s ease',
                cursor: isActive ? 'default' : 'pointer'
            }}
        >
            <div
                onPointerDown={(e) => controls.start(e)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    opacity: isActive ? 1 : 0.2,
                    cursor: 'grab',
                    padding: '8px',
                    touchAction: 'none'
                }}
            >
                <GripVertical size={16} color="var(--text-muted)" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <input
                            value={q.label}
                            onChange={(e) => onUpdate({ label: e.target.value })}
                            className="form-input"
                            style={{
                                width: '100%',
                                fontSize: '15px',
                                fontWeight: 600,
                                background: isActive ? 'var(--input-bg)' : 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '2px solid var(--primary)' : '1px solid transparent',
                                borderRadius: isActive ? '12px 12px 0 0' : '0'
                            }}
                            placeholder="Question"
                        />
                    </div>

                    {isActive && (
                        <div style={{ width: '220px' }}>
                            <select
                                value={q.type}
                                onChange={(e) => onUpdate({ type: e.target.value as any, options_json: (e.target.value === 'multiple_choice' || e.target.value === 'checkboxes' || e.target.value === 'dropdown') ? ['Option 1'] : null })}
                                className="form-input"
                                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', background: 'var(--input-bg)' }}
                            >
                                {QUESTION_TYPES.map(t => (
                                    <option key={t.type} value={t.type}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* QUESTION BODY BASED ON TYPE */}
                <div style={{ padding: '4px' }}>
                    {q.type === 'short_answer' && (
                        <div style={{ borderBottom: '1px dotted var(--text-dim)', width: '60%', padding: '8px 0', fontSize: '14px', color: 'var(--text-muted)' }}>Short answer text</div>
                    )}
                    {q.type === 'paragraph' && (
                        <div style={{ borderBottom: '1px dotted var(--text-dim)', width: '90%', padding: '8px 0', fontSize: '14px', color: 'var(--text-muted)' }}>Long answer text</div>
                    )}
                    {(q.type === 'multiple_choice' || q.type === 'checkboxes' || q.type === 'dropdown') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {q.options_json?.map((opt: string, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {q.type === 'multiple_choice' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--text-muted)' }} />}
                                    {q.type === 'checkboxes' && <div style={{ width: 16, height: 16, borderRadius: '4px', border: '2px solid var(--text-muted)' }} />}
                                    {q.type === 'dropdown' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{idx + 1}.</span>}

                                    <input
                                        value={opt}
                                        onChange={(e) => {
                                            const newOps = [...q.options_json!];
                                            newOps[idx] = e.target.value;
                                            onUpdate({ options_json: newOps });
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '14px', flex: 1, borderBottom: '1px solid transparent' }}
                                        onFocus={(e) => e.currentTarget.style.borderBottom = '1px solid var(--border-glass)'}
                                        onBlur={(e) => e.currentTarget.style.borderBottom = '1px solid transparent'}
                                    />

                                    {isActive && q.options_json.length > 1 && (
                                        <button onClick={() => onUpdate({ options_json: q.options_json!.filter((_: any, i: number) => i !== idx) })} className="btn-icon" style={{ width: '28px', height: '28px' }}>
                                            <X size={14} color="#ef4444" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isActive && (
                                <button
                                    onClick={() => onUpdate({ options_json: [...q.options_json!, `Option ${q.options_json!.length + 1}`] })}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, padding: '8px 0', cursor: 'pointer', textAlign: 'left', width: 'fit-content' }}
                                >
                                    + Add option
                                </button>
                            )}
                        </div>
                    )}
                    {q.type === 'file_upload' && (
                        <div style={{ padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-glass)', background: 'var(--input-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <Upload size={24} color="var(--primary)" />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>File upload placeholder</span>
                        </div>
                    )}
                    {q.type === 'linear_scale' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                            <span>1</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map(v => <div key={v} style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--text-muted)' }} />)}
                            </div>
                            <span>5</span>
                        </div>
                    )}
                </div>

                {/* CARD FOOTER */}
                {isActive && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={onDuplicate} className="btn-icon" title="Duplicate"><Copy size={18} /></button>
                            <button onClick={onDelete} className="btn-icon" style={{ color: '#ef4444' }} title="Delete"><Trash2 size={18} /></button>
                        </div>
                        <div style={{ height: '24px', width: '1px', background: 'var(--border-glass)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Required</span>
                            <div
                                onClick={() => onUpdate({ required: !q.required })}
                                style={{ width: '36px', height: '20px', borderRadius: '10px', background: q.required ? 'var(--primary)' : 'var(--input-bg)', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                            >
                                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: q.required ? '19px' : '3px', transition: 'left 0.3s' }} />
                            </div>
                        </div>
                        <button className="btn-icon"><MoreVertical size={18} /></button>
                    </div>
                )}
            </div>
        </Reorder.Item>
    );
};

const ToolButton: React.FC<{ icon: any, label: string, onClick?: () => void, color: string }> = ({ icon, label, onClick, color }) => (
    <motion.button
        whileHover={{ scale: 1.1, x: 2 }}
        onClick={onClick}
        className="btn-icon"
        style={{
            width: '40px', height: '40px', background: 'transparent', color: 'var(--text-dim)', position: 'relative'
        }}
        title={label}
    >
        <div style={{ color: color }}>{icon}</div>
    </motion.button>
);

const ResponsesView: React.FC<{ formId: string }> = ({ formId }) => {
    const [responses, setResponses] = useState<any[]>([]);

    useEffect(() => {
        loadResponses();
    }, [formId]);

    const loadResponses = async () => {
        const res = await FormBuilderService.fetchResponses(formId);
        if (res.success) setResponses(res.data || []);
    };

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{responses.length} Responses</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ gap: '8px' }}><Download size={16} /> Export CSV</button>
                    <button onClick={loadResponses} className="btn-icon"><RotateCcw size={16} /></button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-glass)' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>Respondent</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>Submission Date</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {responses.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <td style={{ padding: '16px', fontSize: '14px' }}>{r.respondent_email || 'Anonymous'}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>{new Date(r.submitted_at).toLocaleString()}</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button className="btn-icon" style={{ color: 'var(--primary)' }}><Eye size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {responses.length === 0 && (
                            <tr><td colSpan={3} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>Waiting for responses...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SettingsView: React.FC<{ form: any, setForm: (f: any) => void }> = ({ form, setForm }) => (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} /> General Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SettingToggle label="Collect email addresses" active={form.settings.collect_email} onToggle={(v) => setForm({ ...form, settings: { ...form.settings, collect_email: v } })} />
                <SettingToggle label="Limit to 1 response" active={form.settings.limit_one} onToggle={(v) => setForm({ ...form, settings: { ...form.settings, limit_one: v } })} />
                <SettingToggle label="Allow response editing" active={form.settings.allow_edit} onToggle={(v) => setForm({ ...form, settings: { ...form.settings, allow_edit: v } })} />
            </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18} /> Access Control</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SettingToggle label="Requires JAAGO Intranet Login" active={form.settings.internal_only} onToggle={(v) => setForm({ ...form, settings: { ...form.settings, internal_only: v } })} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)' }}>RESPONSE DEADLINE</label>
                    <input type="datetime-local" className="form-input" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '10px' }} />
                </div>
            </div>
        </div>
    </div>
);

const SettingToggle: React.FC<{ label: string, active: boolean, onToggle: (v: boolean) => void }> = ({ label, active, onToggle }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{label}</span>
        <div
            onClick={() => onToggle(!active)}
            style={{ width: '40px', height: '22px', borderRadius: '11px', background: active ? 'var(--primary)' : 'var(--input-bg)', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
        >
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: active ? '21px' : '3px', transition: 'left 0.3s' }} />
        </div>
    </div>
);

const PaletteModal: React.FC<{ onClose: () => void, form: any, setForm: (f: any) => void }> = ({ onClose, form, setForm }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            onClick={e => e.stopPropagation()}
            style={{ width: '320px', height: '100%', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-glass)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Theme Options</h3>
                <button onClick={onClose} className="btn-icon"><X size={18} /></button>
            </div>

            <div>
                <SectionTitle title="Theme Color" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#64748b'].map(c => (
                        <div
                            key={c}
                            onClick={() => setForm({ ...form, theme_config: { ...form.theme_config, color: c } })}
                            style={{ width: '100%', paddingTop: '100%', borderRadius: '12px', background: c, cursor: 'pointer', border: form.theme_config.color === c ? '3px solid #fff' : 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                        />
                    ))}
                </div>
            </div>

            <div>
                <SectionTitle title="Font Style" />
                <select
                    className="form-input"
                    value={form.theme_config.font}
                    onChange={(e) => setForm({ ...form, theme_config: { ...form.theme_config, font: e.target.value } })}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--input-bg)' }}
                >
                    <option value="Inter">Standard (Inter)</option>
                    <option value="Roboto">Modern (Roboto)</option>
                    <option value="Outfit">Elegant (Outfit)</option>
                    <option value="monospace">Formal (Mono)</option>
                </select>
            </div>
        </motion.div>
    </div>
);

const ShareModal: React.FC<{ onClose: () => void, form: any }> = ({ onClose, form }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            style={{ width: '600px', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-glass)', padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>Send Form</h2>
                <button onClick={onClose} className="btn-icon"><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', background: 'var(--input-bg)', borderRadius: '16px', padding: '6px' }}>
                <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Share2 size={16} /> Link</button>
                <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', color: 'var(--text-dim)', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Send size={16} /> Email</button>
                <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', color: 'var(--text-dim)', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Layout size={16} /> Embed</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>SHAREABLE LINK</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input readOnly value={`https://jaago.erp/?view=form-preview&id=${form.id}`} style={{ flex: 1, padding: '12px 16px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '14px' }} />
                    <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(`https://jaago.erp/?view=form-preview&id=${form.id}`); alert('Link copied!'); }}>Copy</button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={onClose} className="btn-secondary" style={{ padding: '12px 32px' }}>Done</button>
            </div>
        </motion.div>
    </div>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h4 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>{title}</h4>
);

export default FormBuilder;
