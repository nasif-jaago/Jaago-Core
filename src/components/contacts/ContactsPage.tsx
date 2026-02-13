import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Plus, Download, Search, Filter, Grid, List,
    User, Mail, Phone, Building2, Tag, Archive, MoreVertical,
    RefreshCw
} from 'lucide-react';
import { fetchContacts, getContactsCount, fetchCategories } from '../../api/ContactsService';
import { fetchCompanies } from '../../api/odoo';
import type { Contact, ContactFilters, ContactCategory } from '../../types/contacts';
import { getContactTypeBadges, getBadgeColor, getContactImage, getContactInitials, formatMany2one } from '../../utils/contactHelpers';
import ContactFormModal from './ContactFormModal';
import ContactDetailPage from './ContactDetailPage';

interface ContactsPageProps {
    onBack: () => void;
    initialFilters?: ContactFilters;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ onBack, initialFilters }) => {
    // State
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const recordsPerPage = 50;

    // Filters
    const [filters, setFilters] = useState<ContactFilters>({
        activeOnly: true,
        ...initialFilters
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [companies, setCompanies] = useState<any[]>([]);
    const [categories, setCategories] = useState<ContactCategory[]>([]);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    // Load initial data
    useEffect(() => {
        loadCompanies();
        loadCategories();
    }, []);

    // Load contacts when filters/page change
    useEffect(() => {
        loadContacts();
    }, [filters, currentPage]);

    const loadCompanies = async () => {
        const res = await fetchCompanies();
        if (res.success && res.data) {
            setCompanies(res.data);
        }
    };

    const loadCategories = async () => {
        const res = await fetchCategories();
        if (res.success && res.data) {
            setCategories(res.data);
        }
    };

    const loadContacts = async () => {
        setLoading(true);
        setError(null);

        try {
            const offset = (currentPage - 1) * recordsPerPage;
            const [contactsRes, countRes] = await Promise.all([
                fetchContacts(filters, offset, recordsPerPage),
                getContactsCount(filters)
            ]);

            if (contactsRes.success && contactsRes.data) {
                setContacts(contactsRes.data);
                setTotalCount(countRes);
            } else {
                setError(contactsRes.error || 'Failed to load contacts');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setFilters({ ...filters, search: searchTerm });
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalCount / recordsPerPage);

    // If a contact is selected, show detail view
    if (selectedContact) {
        return (
            <ContactDetailPage
                contactId={selectedContact.id}
                onBack={() => setSelectedContact(null)}
                onUpdate={loadContacts}
            />
        );
    }

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={onBack}
                        className="btn-icon"
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                            borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--primary)'
                        }}
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Odoo / {filters.isCustomer ? 'Customers' : 'Contacts'}</p>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{filters.isCustomer ? 'Customers (Sponsors)' : 'Contacts'}</h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> Create Contact
                    </button>
                    <button
                        onClick={loadContacts}
                        style={{
                            background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                            borderRadius: '10px', padding: '8px 16px', color: 'var(--text-main)',
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>

                    {/* View Toggle */}
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--input-bg)', padding: '4px', borderRadius: '8px' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '6px 12px', borderRadius: '6px', border: 'none',
                                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'list' ? '#000' : 'var(--text-dim)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <List size={16} /> List
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            style={{
                                padding: '6px 12px', borderRadius: '6px', border: 'none',
                                background: viewMode === 'card' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'card' ? '#000' : 'var(--text-dim)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <Grid size={16} /> Cards
                        </button>
                    </div>

                    {/* Active Filter */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={filters.activeOnly}
                            onChange={(e) => setFilters({ ...filters, activeOnly: e.target.checked })}
                            style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Active Only</span>
                    </label>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {totalCount} contact{totalCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="pulse" style={{ width: '60px', height: '60px', background: 'var(--primary-glow)', borderRadius: '50%' }} />
                    </div>
                ) : error ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                        <p style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
                        <button onClick={loadContacts} className="btn-primary">Retry</button>
                    </div>
                ) : viewMode === 'list' ? (
                    <ListViewContent contacts={contacts} onSelectContact={setSelectedContact} />
                ) : (
                    <CardViewContent contacts={contacts} onSelectContact={setSelectedContact} />
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="btn-icon"
                            style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
                        >
                            ‹
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                            if (pageNum > totalPages) return null;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    style={{
                                        padding: '6px 12px', borderRadius: '8px',
                                        background: pageNum === currentPage ? 'var(--primary)' : 'var(--input-bg)',
                                        color: pageNum === currentPage ? '#000' : 'var(--text-main)',
                                        border: 'none', cursor: 'pointer', fontWeight: 600
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="btn-icon"
                            style={{ opacity: currentPage === totalPages ? 0.3 : 1 }}
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <ContactFormModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadContacts();
                    }}
                />
            )}
        </div>
    );
};

// List View Component
const ListViewContent: React.FC<{ contacts: Contact[]; onSelectContact: (contact: Contact) => void }> = ({ contacts, onSelectContact }) => (
    <div style={{ overflowY: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, borderBottom: '1px solid var(--border-glass)' }}>
                <tr style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left' }}>Contact</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Company</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '16px', textAlign: 'right', width: '50px' }}></th>
                </tr>
            </thead>
            <tbody>
                {contacts.map(contact => {
                    const badges = getContactTypeBadges(contact);
                    const image = getContactImage(contact, 'small');

                    return (
                        <tr
                            key={contact.id}
                            onClick={() => onSelectContact(contact)}
                            style={{ borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}
                            className="table-row-hover"
                        >
                            <td style={{ padding: '16px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: 'var(--input-bg)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', flexShrink: 0
                                    }}>
                                        {image ? (
                                            <img src={image} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                                                {getContactInitials(contact.name)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{contact.name}</p>
                                        {contact.is_company && (
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Organization</p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                {contact.email || '--'}
                            </td>
                            <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                {contact.phone || contact.mobile || '--'}
                            </td>
                            <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                {formatMany2one(contact.company_id)}
                            </td>
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {badges.map(badge => {
                                        const colors = getBadgeColor(badge);
                                        return (
                                            <span
                                                key={badge}
                                                style={{
                                                    padding: '3px 8px', borderRadius: '6px',
                                                    fontSize: '0.7rem', fontWeight: 700,
                                                    background: colors.bg, color: colors.text,
                                                    border: `1px solid ${colors.border}`
                                                }}
                                            >
                                                {badge}
                                            </span>
                                        );
                                    })}
                                </div>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                <button className="btn-icon" style={{ width: '32px', height: '32px' }}>
                                    <MoreVertical size={16} />
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

// Card View Component
const CardViewContent: React.FC<{ contacts: Contact[]; onSelectContact: (contact: Contact) => void }> = ({ contacts, onSelectContact }) => (
    <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {contacts.map(contact => {
                const badges = getContactTypeBadges(contact);
                const image = getContactImage(contact, 'medium');

                return (
                    <div
                        key={contact.id}
                        onClick={() => onSelectContact(contact)}
                        className="card"
                        style={{
                            padding: '1.5rem', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', gap: '1rem',
                            transition: 'var(--transition)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: 'var(--input-bg)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', flexShrink: 0
                            }}>
                                {image ? (
                                    <img src={image} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                                        {getContactInitials(contact.name)}
                                    </span>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {contact.name}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {formatMany2one(contact.company_id)}
                                </p>
                            </div>
                        </div>

                        {contact.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                <Mail size={14} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.email}</span>
                            </div>
                        )}

                        {(contact.phone || contact.mobile) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                <Phone size={14} />
                                <span>{contact.phone || contact.mobile}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {badges.map(badge => {
                                const colors = getBadgeColor(badge);
                                return (
                                    <span
                                        key={badge}
                                        style={{
                                            padding: '4px 10px', borderRadius: '8px',
                                            fontSize: '0.7rem', fontWeight: 700,
                                            background: colors.bg, color: colors.text,
                                            border: `1px solid ${colors.border}`
                                        }}
                                    >
                                        {badge}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

export default ContactsPage;
