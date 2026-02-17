import React, { useState, useEffect } from 'react';
import {
    Type, Heading as HeadingIcon, Minus, Image as ImageIcon,
    Space, Signature, ExternalLink, Trash2, Settings,
    Save, Eye, Plus, ArrowLeft, RefreshCcw, Smartphone as MobileIcon, Monitor as DesktopIcon, X,
    FileText, Upload, UserPlus, Send, Search as SearchIcon, PlusCircle, CheckCircle2
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { AppraisalService } from '../../../api/AppraisalService';
import { FormBuilderService, type Form } from '../../../api/FormBuilderService';
import { fetchEmployees } from '../../../api/EmployeesService';
import { useAuth } from '../../../context/AuthContext';

interface StyleConfig {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    padding?: string;
    borderRadius?: string;
    margin?: string;
}

interface ContentBlock {
    id: string;
    type: 'text' | 'heading' | 'button' | 'divider' | 'image' | 'spacer' | 'signature' | 'variable' | 'secure_link' | 'document' | 'three_sixty_invite';
    content: string;
    style: StyleConfig;
    url?: string;
    formId?: string;
    formName?: string;
}

interface ComponentLibraryItem {
    type: ContentBlock['type'];
    label: string;
    icon: React.ReactNode;
    defaultContent: string;
    defaultStyle: StyleConfig;
    url?: string;
}

const COMPONENT_LIBRARY: ComponentLibraryItem[] = [
    { type: 'heading', label: 'Heading', icon: <HeadingIcon size={18} />, defaultContent: 'Performance Appraisal', defaultStyle: { fontSize: '24px', fontWeight: '800', textAlign: 'center', color: '#1e293b' } },
    { type: 'text', label: 'Text Block', icon: <Type size={18} />, defaultContent: 'Dear {{employee_name}}, your appraisal cycle for {{appraisal_period}} is now open.', defaultStyle: { fontSize: '14px', textAlign: 'left', color: '#475569' } },
    { type: 'secure_link', label: 'Appraisal Link', icon: <ExternalLink size={18} />, defaultContent: 'Complete Your Appraisal', defaultStyle: { backgroundColor: '#22c55e', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', textAlign: 'center' }, url: '{{secure_link}}' },
    { type: 'document', label: 'Doc Upload', icon: <FileText size={18} />, defaultContent: 'appraisal_form.docx', defaultStyle: { fontSize: '14px', textAlign: 'left', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '12px 16px', borderRadius: '8px' } },
    { type: 'divider', label: 'Divider', icon: <Minus size={18} />, defaultContent: '', defaultStyle: { padding: '20px 0' } },
    { type: 'image', label: 'Image', icon: <ImageIcon size={18} />, defaultContent: 'https://placehold.co/600x200', defaultStyle: { borderRadius: '12px', margin: '10px 0' } },
    { type: 'spacer', label: 'Spacer', icon: <Space size={18} />, defaultContent: '', defaultStyle: { padding: '10px' } },
    { type: 'signature', label: 'Signature', icon: <Signature size={18} />, defaultContent: 'Best Regards,\nJAAGO Foundation HR', defaultStyle: { fontSize: '13px', color: '#64748b', textAlign: 'left' } },
    { type: 'three_sixty_invite', label: '360 Invite', icon: <UserPlus size={18} />, defaultContent: '[]', defaultStyle: { padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '16px', margin: '20px 0' } },
];

const DYNAMIC_VARS = [
    '{{employee_name}}', '{{appraisal_id}}', '{{appraisal_period}}',
    '{{secure_link}}', '{{reporting_manager}}', '{{department}}', '{{company_name}}'
];

interface EmailTemplateBuilderProps {
    onBack?: () => void;
    initialTemplate?: any;
}

const EmailTemplateBuilder: React.FC<EmailTemplateBuilderProps> = ({ onBack, initialTemplate }) => {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [templateName, setTemplateName] = useState('Standard Appraisal Invitation');
    const [templateSubject, setTemplateSubject] = useState('Your Appraisal Cycle is Ready');
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [availableForms, setAvailableForms] = useState<Form[]>([]);
    const [loadingForms, setLoadingForms] = useState(false);
    const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
    const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'templates'>('templates');
    const [previewTemplateData, setPreviewTemplateData] = useState<any | null>(null);
    const [editingTemplateId, setEditingTemplateId] = useState<number | null>(initialTemplate?.id || null);

    const loadForms = async () => {
        setLoadingForms(true);
        const res = await FormBuilderService.fetchForms();
        if (res.success) {
            setAvailableForms(res.data || []);
        }
        setLoadingForms(false);
    };

    const loadTemplates = async () => {
        setLoadingTemplates(true);
        const res = await AppraisalService.fetchEmailTemplatesDetailed();
        if (res.success) {
            setEmailTemplates(res.data || []);
        }
        setLoadingTemplates(false);
    };

    useEffect(() => {
        loadForms();
        loadTemplates();
    }, []);

    // Load initial template if provided (for editing)
    useEffect(() => {
        if (initialTemplate) {
            setTemplateName(initialTemplate.name || 'Untitled Template');
            setTemplateSubject(initialTemplate.subject || '');
            setBlocks(initialTemplate.blocks || []);
        }
    }, [initialTemplate]);

    const addBlock = (comp: ComponentLibraryItem) => {
        console.log('Adding block:', comp.type, comp);
        const newBlock: ContentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type: comp.type,
            content: comp.defaultContent,
            style: { ...comp.defaultStyle },
            url: comp.url
        };
        setBlocks([...blocks, newBlock]);
        setSelectedId(newBlock.id);
        console.log('Block added successfully:', newBlock);
    };

    const deleteBlock = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const updateStyle = (id: string, styleUpdates: Partial<StyleConfig>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, style: { ...b.style, ...styleUpdates } } : b));
    };

    const saveTemplate = async () => {
        if (!templateName.trim()) {
            alert('Please enter a template name!');
            return;
        }

        setLoading(true);
        try {
            const templateData = {
                name: templateName,
                subject: templateSubject,
                blocks: blocks,
                updated_at: new Date().toISOString(),
                status: 'published'
            };

            const response = await AppraisalService.saveEmailTemplate(templateData, editingTemplateId || undefined);
            if (response.success) {
                alert(`Template ${editingTemplateId ? 'updated' : 'saved'} & published successfully!`);
                loadTemplates(); // Refresh list

                // If it was a new template, we now have an ID for further edits
                if (!editingTemplateId && typeof response.data === 'number') {
                    setEditingTemplateId(response.data);
                }

                if (onBack && !editingTemplateId) onBack(); // Go back only for first-time save if wanted
            } else {
                alert(`Failed to save template: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this template?')) return;

        const res = await AppraisalService.deleteEmailTemplate(id);
        if (res.success && res.data) {
            setEmailTemplates(prev => prev.filter(t => t.id !== id));
            if (id === editingTemplateId) {
                setEditingTemplateId(null);
            }
            alert('Template deleted successfully.');
        } else {
            alert('Failed to delete template: ' + (res.data === false ? 'Odoo restricted deletion (it might be in use or protected).' : (res.error || 'Unknown error')));
        }
    };

    const handlePreviewTemplate = (template: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewTemplateData(template);
        setShowPreview(true);
    };

    const handleEditTemplate = (template: any) => {
        setTemplateName(template.name);
        setTemplateSubject(template.subject);
        setBlocks(template.blocks || []);
        setSelectedId(null);
        setEditingTemplateId(template.id);
        setRightPanelTab('properties');
    };

    const selectedBlock = blocks.find(b => b.id === selectedId);

    return (
        <div style={{
            height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column',
            color: 'var(--text-main)', fontFamily: 'Inter, sans-serif', background: 'var(--bg-deep)'
        }}>
            {/* TOP BAR */}
            <div style={{
                padding: '16px 32px', borderBottom: '1px solid var(--border-glass)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {onBack && (
                        <button onClick={onBack} className="btn-icon" style={{ background: 'var(--input-bg)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            style={{
                                background: 'transparent', border: 'none', color: 'var(--text-main)',
                                fontSize: '18px', fontWeight: 800, outline: 'none', width: '300px'
                            }}
                            placeholder="Template Name..."
                        />
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Premium Appraisal Email Designer</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'var(--input-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-glass)' }}>
                        <button onClick={() => setPreviewMode('desktop')} style={{ padding: '8px', borderRadius: '8px', background: previewMode === 'desktop' ? 'var(--primary)' : 'transparent', border: 'none', color: previewMode === 'desktop' ? '#000' : 'var(--text-dim)', cursor: 'pointer' }}><DesktopIcon size={16} /></button>
                        <button onClick={() => setPreviewMode('mobile')} style={{ padding: '8px', borderRadius: '8px', background: previewMode === 'mobile' ? 'var(--primary)' : 'transparent', border: 'none', color: previewMode === 'mobile' ? '#000' : 'var(--text-dim)', cursor: 'pointer' }}><MobileIcon size={16} /></button>
                    </div>
                    <button
                        onClick={() => setShowPreview(true)}
                        className="btn-secondary"
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            background: 'rgba(245, 197, 24, 0.1)',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            borderRadius: '10px',
                            fontWeight: 600
                        }}
                    >
                        <Eye size={18} /> Preview
                    </button>
                    <button
                        onClick={saveTemplate}
                        disabled={loading}
                        style={{
                            padding: '12px 28px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: loading ? 'var(--input-bg)' : 'var(--primary-gradient)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#000',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 15px var(--primary-glow)',
                            transition: 'all 0.3s ease',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <RefreshCcw className="spin" size={18} /> : <Save size={18} />} SAVE & PUBLISH
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* LEFT PANEL: LIBRARY & VARIABLES */}
                <div style={{ width: '280px', borderRight: '1px solid var(--border-glass)', padding: '24px', overflowY: 'auto', background: 'var(--bg-surface)' }}>
                    {/* FORM BUILDER INTEGRATION */}
                    <div style={{ marginBottom: '32px' }}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.open('/?view=form-builder', '_blank')}
                            style={{
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
                                backdropFilter: 'blur(10px)',
                                marginBottom: '20px'
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'rgba(34, 197, 94, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#22c55e',
                                boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                            }}>
                                <PlusCircle size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#22c55e' }}>Form Builder</div>
                                <div style={{ fontSize: '10px', color: 'rgba(34, 197, 94, 0.8)' }}>Create logic forms</div>
                            </div>
                        </motion.div>
                    </div>

                    <SectionTitle title="Components" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                        {COMPONENT_LIBRARY.map(comp => (
                            <motion.button
                                key={comp.type}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addBlock(comp)}
                                style={{
                                    padding: '16px', borderRadius: '16px', background: 'var(--input-bg)',
                                    border: '1px solid var(--border-glass)', color: 'var(--text-main)', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <div style={{ color: 'var(--primary)' }}>{comp.icon}</div>
                                <span style={{ fontSize: '11px', fontWeight: 600 }}>{comp.label}</span>
                            </motion.button>
                        ))}
                    </div>

                    <SectionTitle title="Dynamic Variables" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {DYNAMIC_VARS.map(v => (
                            <div
                                key={v}
                                onClick={() => navigator.clipboard.writeText(v)}
                                style={{
                                    padding: '6px 10px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    color: '#3b82f6',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                                title="Click to copy"
                            >
                                {v}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CENTER PANEL: CANVAS */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-deep)', padding: '40px' }}>
                    <div style={{ width: '100%', maxWidth: '650px', marginBottom: '20px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>EMAIL SUBJECT</label>
                        <input
                            value={templateSubject}
                            onChange={(e) => setTemplateSubject(e.target.value)}
                            className="form-input"
                            style={{ width: '100%', fontSize: '14px', padding: '12px 16px' }}
                            placeholder="Enter email subject..."
                        />
                    </div>

                    <div style={{
                        width: previewMode === 'desktop' ? '650px' : '375px',
                        minHeight: '800px', background: '#fff', borderRadius: '24px',
                        boxShadow: 'var(--shadow-3d)', transition: 'width 0.3s ease',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ padding: '60px 40px', flex: 1 }}>
                            <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} style={{ listStyle: 'none', padding: 0 }}>
                                {blocks.map(block => (
                                    <Reorder.Item
                                        key={block.id}
                                        value={block}
                                        onClick={() => setSelectedId(block.id)}
                                        onDragOver={(e: any) => {
                                            if (block.type === 'secure_link') {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = 'copy';
                                                if (dragOverBlockId !== block.id) setDragOverBlockId(block.id);
                                            }
                                        }}
                                        onDragLeave={() => setDragOverBlockId(null)}
                                        onDrop={(e: any) => {
                                            if (block.type === 'secure_link') {
                                                e.preventDefault();
                                                setDragOverBlockId(null);
                                                const formId = e.dataTransfer.getData('formId');
                                                const formName = e.dataTransfer.getData('formName');
                                                if (formId) {
                                                    updateBlock(block.id, { formId, formName });
                                                    setSelectedId(block.id);
                                                }
                                            }
                                        }}
                                        style={{
                                            position: 'relative', cursor: 'grab', marginBottom: '4px',
                                            border: `2px solid ${selectedId === block.id ? 'var(--primary)' : dragOverBlockId === block.id ? '#22c55e' : 'transparent'}`,
                                            boxShadow: dragOverBlockId === block.id ? '0 0 20px rgba(34, 197, 94, 0.3)' : 'none',
                                            borderRadius: '12px', padding: '8px', transition: 'all 0.2s ease',
                                            transform: dragOverBlockId === block.id ? 'scale(1.02)' : 'none'
                                        }}
                                    >
                                        <div style={{
                                            textAlign: block.style.textAlign,
                                            fontSize: block.style.fontSize,
                                            fontWeight: block.style.fontWeight as any,
                                            color: block.style.color,
                                            backgroundColor: block.style.backgroundColor,
                                            padding: block.style.padding,
                                            borderRadius: block.style.borderRadius,
                                            margin: block.style.margin,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {block.type === 'heading' && <h1 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{block.content}</h1>}
                                            {block.type === 'text' && <div style={{ fontSize: 'inherit', color: 'inherit' }}>{block.content}</div>}
                                            {block.type === 'secure_link' && (
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <div style={{ background: block.style.backgroundColor, color: block.style.color, padding: block.style.padding, borderRadius: block.style.borderRadius, fontWeight: block.style.fontWeight as any, textDecoration: 'none' }}>
                                                        {block.content}
                                                    </div>
                                                    {block.formName && (
                                                        <div style={{
                                                            position: 'absolute', top: '-15px', right: '-15px',
                                                            background: '#22c55e', color: '#fff', fontSize: '9px',
                                                            padding: '2px 8px', borderRadius: '10px', fontWeight: 900,
                                                            boxShadow: '0 4px 10px rgba(34, 197, 94, 0.4)',
                                                            whiteSpace: 'nowrap', zIndex: 10,
                                                            border: '1px solid rgba(255,255,255,0.2)'
                                                        }}>
                                                            LINKED: {block.formName}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {block.type === 'divider' && <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />}
                                            {block.type === 'image' && <img src={block.content} style={{ width: '100%', borderRadius: block.style.borderRadius }} alt="Template" />}
                                            {block.type === 'spacer' && <div style={{ height: block.style.padding || '20px' }} />}
                                            {block.type === 'signature' && <div style={{ fontStyle: 'italic', fontSize: 'inherit', color: 'inherit' }}>{block.content}</div>}
                                            {block.type === 'document' && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    background: block.style.backgroundColor,
                                                    padding: block.style.padding,
                                                    borderRadius: block.style.borderRadius,
                                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                                }}>
                                                    <FileText size={20} color={block.style.color || '#3b82f6'} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: block.style.fontSize, fontWeight: '600', color: block.style.color }}>{block.content}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Click to download attachment</div>
                                                    </div>
                                                    <Upload size={16} color="#64748b" />
                                                </div>
                                            )}
                                            {block.type === 'three_sixty_invite' && (
                                                <ThreeSixtyInviteBlock
                                                    data={JSON.parse(block.content || '[]')}
                                                    onChange={(newData) => updateBlock(block.id, { content: JSON.stringify(newData) })}
                                                    templateId={templateName}
                                                />
                                            )}
                                        </div>

                                        {selectedId === block.id && (
                                            <div style={{ position: 'absolute', right: '-48px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button onClick={(e) => deleteBlock(block.id, e)} className="btn-icon" style={{ background: '#ef4444', borderColor: '#ef4444', width: '32px', height: '32px' }}><Trash2 size={14} color="#fff" /></button>
                                            </div>
                                        )}
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>

                            {blocks.length === 0 && (
                                <div style={{
                                    border: '2px dashed #e2e8f0', borderRadius: '24px', padding: '80px 40px',
                                    textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '20px'
                                }}>
                                    <Plus size={48} style={{ margin: '0 auto', opacity: 0.2 }} />
                                    <div style={{ fontSize: '15px' }}>
                                        <b style={{ color: '#64748b' }}>Design Canvas is Empty</b>
                                        <p style={{ marginTop: '8px', fontSize: '13px' }}>Drag or click components from the left sidebar to start building your template.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: PROPERTIES & TEMPLATE LIST */}
                <div style={{ width: '320px', borderLeft: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', padding: '12px 16px', gap: '8px' }}>
                        <button
                            onClick={() => setRightPanelTab('properties')}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 800,
                                background: rightPanelTab === 'properties' ? 'var(--primary-gradient)' : 'transparent',
                                color: rightPanelTab === 'properties' ? '#000' : 'var(--text-dim)',
                                border: rightPanelTab === 'properties' ? 'none' : '1px solid var(--border-glass)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            PROPERTIES
                        </button>
                        <button
                            onClick={() => setRightPanelTab('templates')}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 800,
                                background: rightPanelTab === 'templates' ? 'var(--primary-gradient)' : 'transparent',
                                color: rightPanelTab === 'templates' ? '#000' : 'var(--text-dim)',
                                border: rightPanelTab === 'templates' ? 'none' : '1px solid var(--border-glass)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            EMAIL TEMPLATES
                        </button>
                    </div>

                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                        {rightPanelTab === 'properties' ? (
                            selectedBlock ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>CONTENT</label>
                                        {selectedBlock.type === 'document' ? (
                                            <div>
                                                <input
                                                    type="file"
                                                    accept=".doc,.docx,.pdf,.txt"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            updateBlock(selectedBlock.id, { content: file.name });
                                                        }
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        background: 'var(--input-bg)',
                                                        border: '1px solid var(--border-glass)',
                                                        borderRadius: '12px',
                                                        color: 'var(--text-main)',
                                                        fontSize: '13px',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                                    <FileText size={16} color="#3b82f6" />
                                                    <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>{selectedBlock.content}</span>
                                                </div>
                                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>Supported: .doc, .docx, .pdf, .txt</p>
                                            </div>
                                        ) : selectedBlock.type === 'text' || selectedBlock.type === 'signature' ? (
                                            <textarea
                                                value={selectedBlock.content}
                                                onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                                                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text-main)', minHeight: '150px', resize: 'none', fontSize: '13px', outline: 'none' }}
                                            />
                                        ) : (
                                            <input
                                                value={selectedBlock.content}
                                                onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                                                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '13px', outline: 'none' }}
                                            />
                                        )}
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>STYLING</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <StyleInput label="Font Size" value={selectedBlock.style.fontSize} onChange={(val) => updateStyle(selectedBlock.id, { fontSize: val })} />
                                            <StyleSelect
                                                label="Alignment"
                                                value={selectedBlock.style.textAlign}
                                                options={['left', 'center', 'right']}
                                                onChange={(val) => updateStyle(selectedBlock.id, { textAlign: val as any })}
                                            />
                                            <StyleColorInput label="Text Color" value={selectedBlock.style.color} onChange={(val) => updateStyle(selectedBlock.id, { color: val })} />
                                            {selectedBlock.type === 'secure_link' && (
                                                <StyleColorInput label="Background" value={selectedBlock.style.backgroundColor} onChange={(val) => updateStyle(selectedBlock.id, { backgroundColor: val })} />
                                            )}
                                            <StyleInput label="Padding" value={selectedBlock.style.padding} onChange={(val) => updateStyle(selectedBlock.id, { padding: val })} />
                                            <StyleInput label="Border Radius" value={selectedBlock.style.borderRadius} onChange={(val) => updateStyle(selectedBlock.id, { borderRadius: val })} />
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
                                        <h4 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>LINK FORM</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {availableForms.map(form => (
                                                <motion.div
                                                    key={form.id}
                                                    draggable
                                                    onDragStart={(e: any) => {
                                                        e.dataTransfer.setData('formId', form.id);
                                                        e.dataTransfer.setData('formName', form.title);
                                                    }}
                                                    onClick={() => updateBlock(selectedBlock.id, { formId: form.id, formName: form.title })}
                                                    style={{
                                                        padding: '10px 14px',
                                                        background: selectedBlock.formId === form.id ? 'rgba(34, 197, 94, 0.1)' : 'var(--input-bg)',
                                                        border: `1px solid ${selectedBlock.formId === form.id ? 'var(--primary)' : 'var(--border-glass)'}`,
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.title}</span>
                                                    {selectedBlock.formId === form.id && <CheckCircle2 size={12} color="var(--primary)" />}
                                                </motion.div>
                                            ))}
                                            {selectedBlock.formId && (
                                                <button
                                                    onClick={() => updateBlock(selectedBlock.id, { formId: undefined, formName: undefined })}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', fontWeight: 700, padding: '4px', cursor: 'pointer', textAlign: 'left' }}
                                                >
                                                    REMOVE LINKED FORM
                                                </button>
                                            )}
                                            {availableForms.length === 0 && <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No forms available</p>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ textAlign: 'center', padding: '30px 0', border: '1px dashed var(--border-glass)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                                        <Settings size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Select a block to edit properties</p>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
                                        <SectionTitle title="Saved Forms" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {availableForms.map(form => (
                                                <div
                                                    key={form.id}
                                                    style={{
                                                        padding: '12px 16px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                                        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                                        display: 'flex', flexDirection: 'column', gap: '8px'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{form.title}</span>
                                                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: form.status === 'published' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: form.status === 'published' ? '#22c55e' : '#f59e0b' }}>{form.status.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <SectionTitle title="Existing Templates" />
                                {loadingTemplates ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}><RefreshCcw className="spin" size={24} color="var(--primary)" /></div>
                                ) : emailTemplates.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed var(--border-glass)', borderRadius: '12px', color: 'var(--text-dim)' }}>No templates found.</div>
                                ) : (
                                    emailTemplates.map(template => (
                                        <div
                                            key={template.id}
                                            style={{
                                                padding: '16px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                                borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', flexDirection: 'column', gap: '10px'
                                            }}
                                            onClick={() => handleEditTemplate(template)}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{template.name}</span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        onClick={(e) => handlePreviewTemplate(template, e)}
                                                        className="btn-icon"
                                                        style={{ width: '28px', height: '28px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none' }}
                                                        title="Preview"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteTemplate(template.id, e)}
                                                        className="btn-icon"
                                                        style={{ width: '28px', height: '28px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Subject: {template.subject}</div>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Last updated: {template.updated_at ? new Date(template.updated_at).toLocaleDateString() : 'N/A'}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {
                    showPreview && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed', inset: 0, zIndex: 9999,
                                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
                            }}
                            onClick={() => setShowPreview(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={e => e.stopPropagation()}
                                style={{
                                    width: previewMode === 'desktop' ? '800px' : '400px',
                                    maxHeight: '90vh', background: '#f1f5f9', borderRadius: '24px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden',
                                    display: 'flex', flexDirection: 'column'
                                }}
                            >
                                <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Email Preview: {previewTemplateData?.name || templateName}</h3>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Simulating: {previewMode.toUpperCase()} Layout</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')} className="btn-icon">
                                            {previewMode === 'desktop' ? <MobileIcon size={18} /> : <DesktopIcon size={18} />}
                                        </button>
                                        <button onClick={() => { setShowPreview(false); setPreviewTemplateData(null); }} className="btn-icon" style={{ background: '#f1f5f9' }}><X size={18} /></button>
                                    </div>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                        overflow: 'hidden'
                                    }}>
                                        <div dangerouslySetInnerHTML={{
                                            __html: AppraisalService.renderTemplateToHTML(previewTemplateData?.blocks || blocks, {
                                                employee_name: 'John Doe',
                                                secure_link: '#',
                                                appraisal_period: 'Annual Cycle 2024',
                                                appraisal_id: '123',
                                                company_name: 'JAAGO Foundation'
                                            })
                                        }} />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>{title}</h3>
);

const StyleInput: React.FC<{ label: string, value?: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{label}</span>
        <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '12px', outline: 'none' }}
        />
    </div>
);

const StyleSelect: React.FC<{ label: string, value?: string, options: string[], onChange: (val: string) => void }> = ({ label, value, options, onChange }) => (
    <div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '12px', outline: 'none' }}
        >
            {options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
        </select>
    </div>
);

const StyleColorInput: React.FC<{ label: string, value?: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{label}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: '32px', height: '32px', padding: '2px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}
            />
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: '100%', padding: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '11px', outline: 'none' }}
            />
        </div>
    </div>
);

const ThreeSixtyInviteBlock: React.FC<{ data: any[], onChange: (data: any[]) => void, templateId: string }> = ({ data, onChange, templateId }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sendingId, setSendingId] = useState<number | null>(null);

    const handleSearch = async (val: string) => {
        setSearchTerm(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetchEmployees([
                '|', '|',
                ['name', 'ilike', val],
                ['work_email', 'ilike', val],
                ['identification_id', 'ilike', val]
            ]);
            if (res.success) {
                setSearchResults(res.data?.filter(emp => !data.some(d => d.employee_id === emp.id)).slice(0, 5) || []);
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const addEmployee = (emp: any) => {
        if (data.length >= 5) {
            alert('Maximum 5 employees recommended for display.');
            return;
        }
        const newEntry = {
            employee_id: emp.id,
            name: emp.name,
            email: emp.work_email,
            positivePoints: ['', '', ''],
            improvePoints: ['', '', ''],
            isCollapsible: false
        };
        onChange([...data, newEntry]);
        setSearchTerm('');
        setSearchResults([]);
    };

    const removeEmployee = (id: number) => {
        onChange(data.filter(d => d.employee_id !== id));
    };

    const updateFeedback = (empId: number, type: 'positive' | 'improve', index: number, val: string) => {
        const newData = data.map(emp => {
            if (emp.employee_id === empId) {
                const points = type === 'positive' ? [...emp.positivePoints] : [...emp.improvePoints];
                points[index] = val;
                return { ...emp, [type === 'positive' ? 'positivePoints' : 'improvePoints']: points };
            }
            return emp;
        });
        onChange(newData);
    };

    const sendIndividualInvite = async (emp: any) => {
        const role = (user?.user_metadata?.role || 'user').toLowerCase();
        if (role !== 'admin' && role !== 'hr') {
            alert('Access Denied: Only HR or Admin can send 360 invites.');
            return;
        }

        if (!emp.email) {
            alert(`Work email missing for ${emp.name}.`);
            return;
        }

        setSendingId(emp.employee_id);
        try {
            const res = await AppraisalService.send360Invites([emp], templateId);
            if (res.success) {
                alert(`Invite sent to ${emp.name} successfully!`);
                // Optionally remove from list after sending
                // removeEmployee(emp.employee_id);
            } else {
                alert(`Failed to send invite: ${res.error}`);
            }
        } catch (err) {
            alert('Error sending invite.');
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div className="three-sixty-invite-mini" style={{ textAlign: 'left', color: 'var(--text-main)', background: 'var(--bg-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-glass)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                    <UserPlus size={16} /> 360° QUICK INVITER
                </h3>
                <div style={{ position: 'relative', width: '240px' }}>
                    <SearchIcon size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Add Employee..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px 8px 30px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', fontSize: '11px', outline: 'none' }}
                    />
                    <AnimatePresence>
                        {searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '10px', marginTop: '6px', zIndex: 100, boxShadow: 'var(--shadow-lg)' }}
                            >
                                {searchResults.map(emp => (
                                    <div key={emp.id} onClick={() => addEmployee(emp)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-glass)', fontSize: '11px' }}>
                                        <div style={{ fontWeight: 700 }}>{emp.name}</div>
                                        <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>{emp.work_email}</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {data.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.map(emp => (
                        <motion.div
                            key={emp.employee_id}
                            layout
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '12px',
                                padding: '12px',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', background: 'var(--primary-gradient)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '12px' }}>
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 800 }}>{emp.name}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{emp.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                        onClick={() => removeEmployee(emp.employee_id)}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                        title="Remove"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <button
                                        onClick={() => sendIndividualInvite(emp)}
                                        disabled={sendingId === emp.employee_id}
                                        style={{
                                            background: sendingId === emp.employee_id ? 'var(--input-bg)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                                            border: 'none',
                                            color: '#fff',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        {sendingId === emp.employee_id ? <RefreshCcw className="spin" size={10} /> : <Send size={10} />}
                                        {sendingId === emp.employee_id ? 'SENDING...' : 'SEND INVITE'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#22c55e', textTransform: 'uppercase' }}>Positive Points</span>
                                    {emp.positivePoints.map((p: string, i: number) => (
                                        <input
                                            key={i}
                                            value={p}
                                            onChange={(e) => updateFeedback(emp.employee_id, 'positive', i, e.target.value)}
                                            placeholder={`Point ${i + 1}`}
                                            style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '10px', outline: 'none' }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase' }}>Improvement</span>
                                    {emp.improvePoints.map((p: string, i: number) => (
                                        <input
                                            key={i}
                                            value={p}
                                            onChange={(e) => updateFeedback(emp.employee_id, 'improve', i, e.target.value)}
                                            placeholder={`Point ${i + 1}`}
                                            style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '10px', outline: 'none' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed var(--border-glass)', borderRadius: '12px', color: 'var(--text-dim)' }}>
                    <Plus size={20} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <p style={{ fontSize: '11px', margin: 0 }}>Search to add employees for 360 feedback</p>
                </div>
            )}
        </div>
    );
};

export default EmailTemplateBuilder;
