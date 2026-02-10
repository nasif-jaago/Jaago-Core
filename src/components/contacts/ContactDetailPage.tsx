import React, { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft, Mail, Phone, MapPin, Building2, Tag, Edit3,
    Archive, Copy, ExternalLink, Loader, Save, X, Calendar,
    DollarSign, FileText, Briefcase
} from 'lucide-react';
import { fetchContactById, updateContact, archiveContact, fetchRelatedData, getContactFields, getFieldTabMapping } from '../../api/ContactsService';
import type { Contact, ContactField, RelatedRecords } from '../../types/contacts';
import { formatMany2one, getContactImage, getContactInitials, formatAddress, getContactTypeBadges, getBadgeColor } from '../../utils/contactHelpers';
import DynamicFieldRenderer from './DynamicFieldRenderer';

interface ContactDetailPageProps {
    contactId: number;
    onBack: () => void;
    onUpdate: () => void;
}

const ContactDetailPage: React.FC<ContactDetailPageProps> = ({ contactId, onBack, onUpdate }) => {
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editedContact, setEditedContact] = useState<any>({}); // Use any to allow partial updates with different types than Contact
    const [relatedData, setRelatedData] = useState<RelatedRecords>({});
    const [allFields, setAllFields] = useState<Record<string, ContactField>>({});
    const [activeTab, setActiveTab] = useState<string>('General');

    // Fields to exclude from dynamic tabs as they are in the header or specific sections
    // We exclude address fields from General tab because we might want to show them separately or they are standard
    // Actually, let's keep address fields in General or a specific Address tab if mapped there.
    const EXCLUDED_FIELDS = ['name', 'image_128', 'image_256', 'image_1920', 'display_name', 'message_ids', 'activity_ids', 'message_follower_ids', 'email', 'phone', 'mobile', 'website', 'company_id', 'parent_id'];

    useEffect(() => {
        loadData();
    }, [contactId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [contactRes, fieldsRes, relatedRes] = await Promise.all([
                fetchContactById(contactId),
                getContactFields(),
                fetchRelatedData(contactId)
            ]);

            if (contactRes.success && contactRes.data) {
                setContact(contactRes.data);
                // Don't initialize editedContact with full contact data to avoid type issues and sending unchanged data
                setEditedContact({});
            } else {
                setError(contactRes.error || 'Failed to load contact');
            }

            if (fieldsRes) {
                setAllFields(fieldsRes);
            }

            if (relatedRes.success && relatedRes.data) {
                setRelatedData(relatedRes.data);
            }
        } catch (err: any) {
            setError(err.message || 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!contact) return;

        setSaving(true);
        try {
            // editedContact contains only changed fields
            const res = await updateContact(contact.id, editedContact);
            if (res.success) {
                setContact({ ...contact, ...editedContact });
                setEditMode(false);
                setEditedContact({}); // Reset changes
                onUpdate();
            } else {
                alert('Failed to save: ' + res.error);
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async () => {
        if (!contact || !confirm('Archive this contact?')) return;

        try {
            const res = await archiveContact(contact.id);
            if (res.success) {
                onBack();
            }
        } catch (err) {
            alert('Failed to archive contact');
        }
    };

    // Group fields by tab
    const fieldGroups = useMemo(() => {
        const groups: Record<string, ContactField[]> = {};

        Object.entries(allFields).forEach(([name, field]) => {
            if (EXCLUDED_FIELDS.includes(name)) return;
            // logic to skip computed fields that are not stored, unless we really want them read-only
            if (field.store === false && field.type !== 'binary') return;

            const tab = getFieldTabMapping(name);
            if (!groups[tab]) groups[tab] = [];
            groups[tab].push({ ...field, name });
        });

        return groups;
    }, [allFields]);

    const tabs = useMemo(() => {
        const list = Object.keys(fieldGroups).sort((a, b) => {
            const order = ['General', 'Sales & Purchase', 'Accounting', 'Notes', 'Studio Custom', 'Other Details'];
            const idxA = order.indexOf(a);
            const idxB = order.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });
        return [...list, 'Related Records'];
    }, [fieldGroups]);

    if (loading) {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader className="spin" size={50} color="var(--primary)" />
            </div>
        );
    }

    if (error || !contact) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                <p style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>{error || 'Contact not found'}</p>
                <button onClick={onBack} className="btn-primary">Go Back</button>
            </div>
        );
    }

    const image = getContactImage(contact, 'large');
    const badges = getContactTypeBadges(contact);

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onBack} className="btn-icon" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '10px' }}>
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Odoo / Contacts</p>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{contact.name}</h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {editMode ? (
                        <>
                            <button
                                onClick={() => {
                                    setEditMode(false);
                                    setEditedContact({});
                                }}
                                style={{
                                    background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                    borderRadius: '10px', padding: '8px 16px', color: 'var(--text-main)',
                                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                                }}
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {saving ? <Loader className="spin" size={16} /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setEditMode(true)}
                                style={{
                                    background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                    borderRadius: '10px', padding: '8px 16px', color: 'var(--text-main)',
                                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                                }}
                            >
                                <Edit3 size={16} /> Edit
                            </button>
                            <button
                                onClick={handleArchive}
                                style={{
                                    background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                    borderRadius: '10px', padding: '8px 16px', color: '#ef4444',
                                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                                }}
                            >
                                <Archive size={16} /> Archive
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Contact Header Card */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '24px',
                        background: 'var(--input-bg)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0, border: '3px solid var(--border-glass)'
                    }}>
                        {image ? (
                            <img src={image} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                                {getContactInitials(contact.name)}
                            </span>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                    {contact.name}
                                </h1>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {badges.map(badge => {
                                        const colors = getBadgeColor(badge);
                                        return (
                                            <span key={badge} style={{
                                                padding: '6px 14px', borderRadius: '10px',
                                                fontSize: '0.8rem', fontWeight: 700,
                                                background: colors.bg, color: colors.text,
                                                border: `1px solid ${colors.border}`
                                            }}>
                                                {badge}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            {contact.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Mail size={18} style={{ color: 'var(--primary)' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{contact.email}</span>
                                </div>
                            )}
                            {contact.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Phone size={18} style={{ color: 'var(--primary)' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{contact.phone}</span>
                                </div>
                            )}
                            {contact.company_id && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Building2 size={18} style={{ color: 'var(--primary)' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{formatMany2one(contact.company_id)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-glass)', overflowX: 'auto', paddingBottom: '4px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 24px', background: 'none', border: 'none',
                            borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-dim)',
                            cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                            marginBottom: '-2px', whiteSpace: 'nowrap'
                        }}
                    >
                        {tab} {tab === 'Related Records' && `(${(relatedData.invoices?.length || 0) + (relatedData.salesOrders?.length || 0)})`}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeTab === 'Related Records' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {relatedData.invoices && relatedData.invoices.length > 0 && (
                            <RelatedRecordsCard title="Invoices" icon={<FileText size={20} />} records={relatedData.invoices} />
                        )}
                        {relatedData.salesOrders && relatedData.salesOrders.length > 0 && (
                            <RelatedRecordsCard title="Sales Orders" icon={<DollarSign size={20} />} records={relatedData.salesOrders} />
                        )}
                        {relatedData.crmLeads && relatedData.crmLeads.length > 0 && (
                            <RelatedRecordsCard title="CRM Opportunities" icon={<Briefcase size={20} />} records={relatedData.crmLeads} />
                        )}
                        {(relatedData.invoices?.length === 0 && relatedData.salesOrders?.length === 0 && relatedData.crmLeads?.length === 0) && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No related records found
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {fieldGroups[activeTab] && fieldGroups[activeTab].map(field => (
                            <DynamicFieldRenderer
                                key={field.name}
                                field={field}
                                value={editMode ? (editedContact[field.name] ?? contact[field.name]) : contact[field.name]}
                                onChange={(value) => setEditedContact((prev: any) => ({ ...prev, [field.name]: value }))}
                                readonly={!editMode || field.readonly}
                            />
                        ))}
                        {(!fieldGroups[activeTab] || fieldGroups[activeTab].length === 0) && (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', gridColumn: '1 / -1' }}>No fields in this section.</p>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const RelatedRecordsCard: React.FC<{ title: string; icon: React.ReactNode; records: any[] }> = ({ title, icon, records }) => (
    <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ color: 'var(--primary)' }}>{icon}</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({records.length})</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {records.slice(0, 5).map((record, i) => (
                <div key={record.id || i} style={{
                    padding: '12px', background: 'var(--input-bg)', borderRadius: '10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {record.name || record.display_name}
                        </p>
                        {record.date && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(record.date).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    {record.amount_total && (
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                            ${record.amount_total.toFixed(2)}
                        </p>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default ContactDetailPage;
