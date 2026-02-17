import React, { useState, useEffect } from 'react';
import { AppraisalService } from '../../../api/AppraisalService';
import { Plus, Eye, Edit, Trash2, RefreshCcw, Calendar, ArrowLeft } from 'lucide-react';
import EmailTemplateBuilder from './EmailTemplateBuilder';

interface EmailTemplateListProps {
    onBack?: () => void;
}

const EmailTemplateList: React.FC<EmailTemplateListProps> = ({ onBack }) => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await AppraisalService.fetchEmailTemplatesDetailed();
            if (response.success && response.data) {
                setTemplates(response.data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (templateId: number) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        setLoading(true);
        try {
            const response = await AppraisalService.deleteEmailTemplate(templateId);
            if (response.success && response.data) {
                alert('Template deleted successfully!');
                await fetchTemplates();
            } else {
                alert('Failed to delete template: ' + (response.data === false ? 'Odoo restricted deletion.' : (response.error || 'Unknown error')));
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Error deleting template.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (template: any) => {
        setSelectedTemplate(template);
    };

    const handlePreview = (template: any) => {
        setPreviewTemplate(template);
    };

    if (isCreating) {
        return <EmailTemplateBuilder onBack={() => { setIsCreating(false); fetchTemplates(); }} />;
    }

    if (selectedTemplate) {
        return <EmailTemplateBuilder onBack={() => { setSelectedTemplate(null); fetchTemplates(); }} initialTemplate={selectedTemplate} />;
    }

    return (
        <div style={{ padding: '24px', background: 'var(--bg-deep)', minHeight: 'calc(100vh - 120px)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-glass)',
                                color: 'var(--text-main)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            className="hover-scale"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                            Email Templates
                        </h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
                            Create and manage appraisal email templates
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={fetchTemplates}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            background: 'rgba(245, 197, 24, 0.1)',
                            border: '1px solid var(--primary)',
                            borderRadius: '10px',
                            color: 'var(--primary)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            fontSize: '14px'
                        }}
                    >
                        <RefreshCcw size={16} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        style={{
                            padding: '12px 28px',
                            background: 'var(--primary-gradient)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#000',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: 700,
                            fontSize: '14px',
                            boxShadow: '0 4px 15px var(--primary-glow)'
                        }}
                    >
                        <Plus size={18} /> Create New Template
                    </button>
                </div>
            </div>

            {/* Template Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="glass-panel"
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid var(--border-glass)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                                    {template.name}
                                </h3>
                                <div style={{
                                    padding: '4px 8px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    color: '#22c55e',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    {template.status}
                                </div>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {template.subject || 'No subject'}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={12} />
                                Updated: {new Date(template.updated_at).toLocaleDateString()}
                            </p>
                        </div>

                        <div style={{
                            background: 'var(--input-bg)',
                            padding: '12px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            fontSize: '12px',
                            color: 'var(--text-dim)',
                            border: '1px solid var(--border-glass)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                            {template.blocks && template.blocks.length > 0 ? (
                                `${template.blocks.length} content blocks designed`
                            ) : (
                                'Standard text template'
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handlePreview(template)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid #3b82f6',
                                    borderRadius: '8px',
                                    color: '#3b82f6',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontWeight: 600,
                                    fontSize: '13px'
                                }}
                            >
                                <Eye size={16} /> Preview
                            </button>
                            <button
                                onClick={() => handleEdit(template)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'rgba(245, 197, 24, 0.1)',
                                    border: '1px solid var(--primary)',
                                    borderRadius: '8px',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontWeight: 600,
                                    fontSize: '13px'
                                }}
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(template.id)}
                                disabled={loading}
                                style={{
                                    padding: '10px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid #ef4444',
                                    borderRadius: '8px',
                                    color: '#ef4444',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {previewTemplate && (
                <div
                    className="modal-backdrop"
                    onClick={() => setPreviewTemplate(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '20px'
                    }}
                >
                    <div
                        className="glass-panel"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-surface)',
                            borderRadius: '24px',
                            padding: '0',
                            maxWidth: '700px',
                            width: '100%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid var(--border-glass)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                                    {previewTemplate.name}
                                </h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{previewTemplate.subject}</p>
                            </div>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                style={{
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content - Email Canvas */}
                        <div style={{
                            padding: '40px',
                            background: '#f8fafc',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            <div style={{
                                background: '#fff',
                                padding: '40px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                minHeight: '400px',
                                color: '#1e293b'
                            }}>
                                {previewTemplate.blocks && previewTemplate.blocks.length > 0 ? (
                                    previewTemplate.blocks.map((block: any, idx: number) => (
                                        <div key={idx} style={{ marginBottom: '16px', textAlign: block.style?.textAlign || 'left' }}>
                                            {block.type === 'heading' && <h1 style={{ ...block.style, margin: 0 }}>{block.content}</h1>}
                                            {block.type === 'text' && (
                                                block.content.includes('<') && block.content.includes('>') ? (
                                                    <div style={{ ...block.style }} dangerouslySetInnerHTML={{ __html: block.content }} />
                                                ) : (
                                                    <div style={{ ...block.style, whiteSpace: 'pre-wrap' }}>{block.content}</div>
                                                )
                                            )}
                                            {block.type === 'secure_link' && (
                                                <div style={{
                                                    display: 'inline-block',
                                                    ...block.style,
                                                    textDecoration: 'none'
                                                }}>
                                                    {block.content}
                                                </div>
                                            )}
                                            {block.type === 'divider' && <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />}
                                            {block.type === 'image' && <img src={block.content} style={{ width: '100%', borderRadius: block.style?.borderRadius || '8px' }} alt="Preview" />}
                                            {block.type === 'spacer' && <div style={{ height: block.style?.padding || '20px' }} />}
                                            {block.type === 'signature' && <div style={{ ...block.style, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{block.content}</div>}
                                            {block.type === 'document' && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    ...block.style,
                                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                                }}>
                                                    <span>📄</span>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{block.content}</div>
                                                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Attachment</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#64748b', padding: '100px 0' }}>
                                        No content blocks in this template.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-surface)' }}>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                style={{
                                    padding: '12px 32px',
                                    background: 'var(--primary-gradient)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#000',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px var(--primary-glow)'
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {templates.length === 0 && !loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '100px 20px',
                    color: 'var(--text-dim)',
                    background: 'var(--bg-surface)',
                    borderRadius: '24px',
                    border: '1px dashed var(--border-glass)',
                    marginTop: '40px'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(245, 197, 24, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: 'var(--primary)',
                        border: '1px solid rgba(245, 197, 24, 0.1)'
                    }}>
                        <Plus size={40} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>No Templates Found</h3>
                    <p style={{ fontSize: '15px', maxWidth: '400px', margin: '0 auto 32px' }}>
                        You haven't created any appraisal email templates yet. Create your first template to start automating your appraisal cycles.
                    </p>
                    <button
                        onClick={() => setIsCreating(true)}
                        style={{
                            padding: '12px 32px',
                            background: 'var(--primary-gradient)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#000',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px var(--primary-glow)'
                        }}
                    >
                        Create Your First Template
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmailTemplateList;
