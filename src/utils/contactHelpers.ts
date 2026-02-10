/**
 * Utility helper functions for Odoo Contacts
 */

import type { ContactFilters, Contact } from '../types/contacts';

/**
 * Build Odoo domain from contact filters
 */
export const buildContactDomain = (filters: ContactFilters): any[] => {
    const domain: any[] = [];

    // Active filter
    if (filters.activeOnly !== undefined) {
        domain.push(['active', '=', filters.activeOnly]);
    }

    // Company filter
    if (filters.companyIds && filters.companyIds.length > 0) {
        domain.push(['company_id', 'in', filters.companyIds]);
    }

    // Category/Tags filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
        domain.push(['category_id', 'in', filters.categoryIds]);
    }

    // Contact type filters
    if (filters.isCustomer) {
        domain.push(['customer_rank', '>', 0]);
    }
    if (filters.isSupplier) {
        domain.push(['supplier_rank', '>', 0]);
    }
    if (filters.isEmployee) {
        domain.push(['employee', '=', true]);
    }

    // Search term (across multiple fields)
    if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        domain.push('|', '|',
            ['name', 'ilike', searchTerm],
            ['email', 'ilike', searchTerm],
            ['phone', 'ilike', searchTerm]
        );
    }

    return domain;
};

/**
 * Format contact type badges
 */
export const getContactTypeBadges = (contact: Contact): string[] => {
    const badges: string[] = [];

    if (contact.customer_rank && contact.customer_rank > 0) {
        badges.push('Customer');
    }
    if (contact.supplier_rank && contact.supplier_rank > 0) {
        badges.push('Vendor');
    }
    if (contact.employee) {
        badges.push('Employee');
    }
    if (contact.is_company) {
        badges.push('Company');
    }

    return badges;
};

/**
 * Format full address from contact
 */
export const formatAddress = (contact: Contact): string => {
    const parts: string[] = [];

    if (contact.street) parts.push(contact.street);
    if (contact.street2) parts.push(contact.street2);

    const cityLine: string[] = [];
    if (contact.city) cityLine.push(contact.city);
    if (contact.state_id && Array.isArray(contact.state_id)) cityLine.push(contact.state_id[1]);
    if (contact.zip) cityLine.push(contact.zip);
    if (cityLine.length > 0) parts.push(cityLine.join(', '));

    if (contact.country_id && Array.isArray(contact.country_id)) {
        parts.push(contact.country_id[1]);
    }

    return parts.join('\n');
};

/**
 * Get initials from contact name for avatar
 */
export const getContactInitials = (name: string): string => {
    if (!name) return '?';

    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone format (basic)
 */
export const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    // Allow international formats: +, digits, spaces, hyphens, parentheses
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone);
};

/**
 * Format Odoo Many2one field [id, name] to display
 */
export const formatMany2one = (value: any): string => {
    if (!value) return '--';
    if (Array.isArray(value) && value.length >= 2) {
        return value[1];
    }
    return String(value);
};

/**
 * Get color for contact type badge
 */
export const getBadgeColor = (badgeType: string): { bg: string; text: string; border: string } => {
    switch (badgeType.toLowerCase()) {
        case 'customer':
            return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: '#22c55e44' };
        case 'vendor':
        case 'supplier':
            return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '#3b82f644' };
        case 'employee':
            return { bg: 'rgba(245, 197, 24, 0.1)', text: 'var(--primary)', border: 'var(--primary-glow)' };
        case 'company':
            return { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: '#a855f744' };
        default:
            return { bg: 'var(--input-bg)', text: 'var(--text-dim)', border: 'var(--border-glass)' };
    }
};

/**
 * Check if contact has image
 */
export const hasContactImage = (contact: Contact): boolean => {
    return !!(contact.image_128 || contact.image_256 || contact.image_1920);
};

/**
 * Get best available contact image
 */
export const getContactImage = (contact: Contact, size: 'small' | 'medium' | 'large' = 'medium'): string | null => {
    const imageField = size === 'small' ? 'image_128' : size === 'medium' ? 'image_256' : 'image_1920';
    const image = contact[imageField] || contact.image_128;

    if (!image) return null;
    return `data:image/png;base64,${image}`;
};

/**
 * Sort contacts by field
 */
export const sortContacts = (contacts: Contact[], field: keyof Contact, direction: 'asc' | 'desc' = 'asc'): Contact[] => {
    return [...contacts].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        // Handle null/undefined
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return direction === 'asc' ? 1 : -1;
        if (bVal == null) return direction === 'asc' ? -1 : 1;

        // Handle arrays (Many2one fields)
        const aComp = Array.isArray(aVal) ? aVal[1] : aVal;
        const bComp = Array.isArray(bVal) ? bVal[1] : bVal;

        if (aComp < bComp) return direction === 'asc' ? -1 : 1;
        if (aComp > bComp) return direction === 'asc' ? 1 : -1;
        return 0;
    });
};
