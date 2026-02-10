/**
 * Contacts Service - Dedicated API layer for res.partner operations
 * Handles all Odoo Contacts CRUD operations, Studio field discovery, and related data
 */

import { odooCall, createRecord, writeRecord, fetchRecords, type OdooResponse } from './odoo';
import type { Contact, ContactField, ContactCategory, ContactFilters, ContactFormValues, RelatedRecords } from '../types/contacts';
import { buildContactDomain } from '../utils/contactHelpers';

// Field metadata cache
let fieldsCache: Record<string, ContactField> | null = null;
let fieldsCacheTime: number | null = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Standard fields to always fetch for contacts
 */
const STANDARD_CONTACT_FIELDS = [
    'name',
    'display_name',
    'email',
    'phone',
    'website',
    'company_id',
    'company_type',
    'image_128',
    'image_256',
    'street',
    'street2',
    'city',
    'state_id',
    'zip',
    'country_id',
    'category_id',
    'parent_id',
    'child_ids',
    'user_id',
    'is_company',
    'customer_rank',
    'supplier_rank',
    'employee',
    'active',
    'comment',
    'create_date',
    'write_date'
];

/**
 * Get all field metadata for res.partner (including Studio fields)
 * Uses caching to minimize API calls
 */
export const getContactFields = async (): Promise<Record<string, ContactField>> => {
    // Return cached data if still valid
    if (fieldsCache && fieldsCacheTime && (Date.now() - fieldsCacheTime < CACHE_DURATION)) {
        return fieldsCache;
    }

    try {
        const fields = await odooCall('res.partner', 'fields_get', [], {
            attributes: ['string', 'type', 'required', 'readonly', 'help', 'selection', 'relation', 'domain', 'store']
        });

        fieldsCache = fields as Record<string, ContactField>;
        fieldsCacheTime = Date.now();

        return fieldsCache;
    } catch (error) {
        console.error('Failed to fetch contact fields:', error);
        return {};
    }
};

/**
 * Get list of all Studio custom fields (fields starting with x_studio_)
 */
export const getStudioFields = async (): Promise<ContactField[]> => {
    const allFields = await getContactFields();
    return Object.entries(allFields)
        .filter(([name]) => name.startsWith('x_studio_'))
        .filter(([, field]) => field.store !== false) // Only stored fields
        .map(([name, field]) => ({ ...field, name }));
};

/**
 * Get full list of all available fields from the model
 */
export const getAllContactFields = async (): Promise<string[]> => {
    const allFields = await getContactFields();
    // Return all field names that are stored
    return Object.keys(allFields).filter(name => allFields[name].store !== false);
};

/**
 * Categorize fields into Odoo-like tabs
 */
export const getFieldTabMapping = (fieldName: string): string => {
    if (fieldName.startsWith('x_studio_')) return 'Studio Custom';

    // Accounting
    if (fieldName.startsWith('property_') || fieldName.includes('account') || fieldName.includes('bank') || fieldName.includes('tax') || fieldName.includes('currency')) {
        return 'Accounting';
    }

    // Sales & Purchase
    if (fieldName.includes('sale') || fieldName.includes('purchase') || fieldName.includes('payment') || fieldName.includes('delivery') || fieldName.includes('pricelist')) {
        return 'Sales & Purchase';
    }

    // Marketing
    if (fieldName.includes('marketing') || fieldName.includes('campaign') || fieldName.includes('medium') || fieldName.includes('source')) {
        return 'Marketing';
    }

    // Internal Notes
    if (fieldName === 'comment' || fieldName.includes('note')) {
        return 'Notes';
    }

    // Address & Contact info (General)
    if (['name', 'email', 'phone', 'website', 'function', 'title', 'category_id', 'company_id', 'user_id', 'street', 'street2', 'city', 'state_id', 'zip', 'country_id', 'vat', 'lang'].includes(fieldName)) {
        return 'General';
    }

    return 'Other Details';
};



/**
 * Fetch contacts with filters and pagination
 * optimized for list view (only standard fields + studio fields)
 */
export const fetchContacts = async (
    filters: ContactFilters = {},
    offset: number = 0,
    limit: number = 50
): Promise<OdooResponse<Contact[]>> => {
    try {
        const domain = buildContactDomain(filters);

        // Optimize: Use standard fields + studio fields for list view
        const studioFields = await getStudioFields();
        const studioNames = studioFields.map(f => f.name);
        const fields = [...STANDARD_CONTACT_FIELDS, ...studioNames];

        const contacts = await odooCall('res.partner', 'search_read', [domain], {
            fields,
            offset,
            limit,
            order: 'name asc'
        });

        return {
            success: true,
            data: contacts as Contact[],
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to fetch contacts',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Get total count of contacts matching filters
 */
export const getContactsCount = async (filters: ContactFilters = {}): Promise<number> => {
    try {
        const domain = buildContactDomain(filters);
        return await odooCall('res.partner', 'search_count', [domain]);
    } catch (error) {
        console.error('Failed to get contacts count:', error);
        return 0;
    }
};

/**
 * Fetch single contact by ID with all fields
 */
export const fetchContactById = async (id: number): Promise<OdooResponse<Contact>> => {
    try {
        const fields = await getAllContactFields();
        const contacts = await odooCall('res.partner', 'read', [[id]], { fields });

        if (!contacts || contacts.length === 0) {
            return {
                success: false,
                error: 'Contact not found',
                syncTime: new Date().toISOString()
            };
        }

        return {
            success: true,
            data: contacts[0] as Contact,
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to fetch contact',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Create new contact
 */
export const createContact = async (values: ContactFormValues): Promise<OdooResponse<number>> => {
    try {
        const contactId = await createRecord('res.partner', values);
        return {
            success: true,
            data: contactId,
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to create contact',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Update existing contact
 */
export const updateContact = async (id: number, values: Partial<ContactFormValues>): Promise<OdooResponse<boolean>> => {
    try {
        await writeRecord('res.partner', id, values);
        return {
            success: true,
            data: true,
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to update contact',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Archive contact (set active = false)
 */
export const archiveContact = async (id: number): Promise<OdooResponse<boolean>> => {
    return updateContact(id, { active: false });
};

/**
 * Unarchive contact (set active = true)
 */
export const unarchiveContact = async (id: number): Promise<OdooResponse<boolean>> => {
    return updateContact(id, { active: true });
};

/**
 * Assign tags/categories to contact
 */
export const assignTags = async (contactId: number, categoryIds: number[]): Promise<OdooResponse<boolean>> => {
    try {
        // Odoo Many2many format: [(6, 0, [id1, id2, ...])] replaces all tags
        await writeRecord('res.partner', contactId, {
            category_id: [[6, 0, categoryIds]]
        });

        return {
            success: true,
            data: true,
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to assign tags',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Fetch all contact categories/tags
 */
export const fetchCategories = async (): Promise<OdooResponse<ContactCategory[]>> => {
    try {
        const result = await fetchRecords('res.partner.category', ['name', 'color', 'parent_id', 'active'], [], 500);
        return result as OdooResponse<ContactCategory[]>;
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to fetch categories',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Fetch options for a many2one field
 */
export const fetchRelationOptions = async (model: string, domain: any[] = [], limit: number = 20): Promise<OdooResponse<any[]>> => {
    try {
        const result = await fetchRecords(model, ['name', 'display_name'], domain, limit);
        return result;
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to fetch options',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Create new contact category
 */
export const createCategory = async (name: string, color?: number): Promise<OdooResponse<number>> => {
    try {
        const categoryId = await createRecord('res.partner.category', { name, color });
        return {
            success: true,
            data: categoryId,
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to create category',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Fetch related records for a contact
 */
export const fetchRelatedData = async (contactId: number): Promise<OdooResponse<RelatedRecords>> => {
    try {
        const [invoices, salesOrders, crmLeads, projects] = await Promise.allSettled([
            // Invoices
            odooCall('account.move', 'search_read', [[['partner_id', '=', contactId], ['move_type', 'in', ['out_invoice', 'in_invoice']]]], {
                fields: ['name', 'invoice_date', 'amount_total', 'state'],
                limit: 10,
                order: 'invoice_date desc'
            }),
            // Sales Orders
            odooCall('sale.order', 'search_read', [[['partner_id', '=', contactId]]], {
                fields: ['name', 'date_order', 'amount_total', 'state'],
                limit: 10,
                order: 'date_order desc'
            }),
            // CRM Leads/Opportunities
            odooCall('crm.lead', 'search_read', [[['partner_id', '=', contactId]]], {
                fields: ['name', 'email_from', 'phone', 'expected_revenue', 'stage_id', 'create_date'],
                limit: 10,
                order: 'create_date desc'
            }),
            // Projects
            odooCall('project.project', 'search_read', [[['partner_id', '=', contactId]]], {
                fields: ['name', 'date_start', 'date', 'label_tasks'],
                limit: 10,
                order: 'date_start desc'
            })
        ]);

        return {
            success: true,
            data: {
                invoices: invoices.status === 'fulfilled' ? invoices.value : [],
                salesOrders: salesOrders.status === 'fulfilled' ? salesOrders.value : [],
                crmLeads: crmLeads.status === 'fulfilled' ? crmLeads.value : [],
                projects: projects.status === 'fulfilled' ? projects.value : []
            },
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to fetch related data',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Search contacts by name/email (for autocomplete)
 */
export const searchContacts = async (query: string, limit: number = 20): Promise<OdooResponse<Contact[]>> => {
    try {
        const domain = [
            '|', '|',
            ['name', 'ilike', query],
            ['email', 'ilike', query],
            ['phone', 'ilike', query]
        ];

        const contacts = await odooCall('res.partner', 'search_read', [domain], {
            fields: ['name', 'email', 'phone', 'company_id', 'image_128'],
            limit
        });

        return {
            success: true,
            data: contacts as Contact[],
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to search contacts',
            syncTime: new Date().toISOString()
        };
    }
};

/**
 * Duplicate contact
 */
export const duplicateContact = async (id: number): Promise<OdooResponse<number>> => {
    try {
        const newId = await odooCall('res.partner', 'copy', [id]);
        return {
            success: true,
            data: newId,
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to duplicate contact',
            syncTime: new Date().toISOString()
        };
    }
};
