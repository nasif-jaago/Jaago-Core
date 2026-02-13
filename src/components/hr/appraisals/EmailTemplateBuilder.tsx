import React, { useState, useEffect } from 'react';
import {
    Type, Heading as HeadingIcon, Minus, Image as ImageIcon,
    Space, Signature, ExternalLink, Trash2, Settings,
    Save, Eye, Plus, ArrowLeft, RefreshCcw, Smartphone as MobileIcon, Monitor as DesktopIcon,
    FileText, Upload
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { AppraisalService } from '../../../api/AppraisalService';

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
    type: 'text' | 'heading' | 'button' | 'divider' | 'image' | 'spacer' | 'signature' | 'variable' | 'secure_link' | 'document';
    content: string;
    style: StyleConfig;
    url?: string;
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

            const response = await AppraisalService.saveEmailTemplate(templateData, initialTemplate?.id);
            if (response.success) {
                alert(`Template ${initialTemplate ? 'updated' : 'saved'} & published successfully!`);
                if (onBack) onBack(); // Go back to template list
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
                                        style={{
                                            position: 'relative', cursor: 'grab', marginBottom: '4px',
                                            border: `2px solid ${selectedId === block.id ? 'var(--primary)' : 'transparent'}`,
                                            borderRadius: '12px', padding: '8px', transition: 'border-color 0.2s'
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
                                                <div style={{ display: 'inline-block', background: block.style.backgroundColor, color: block.style.color, padding: block.style.padding, borderRadius: block.style.borderRadius, fontWeight: block.style.fontWeight as any, textDecoration: 'none' }}>
                                                    {block.content}
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
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                        <SectionTitle title="Properties Editor" />
                        {selectedBlock ? (
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

                                <div>
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
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-glass)', borderRadius: '16px' }}>
                                <Settings size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select a block to edit properties</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
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

export default EmailTemplateBuilder;
