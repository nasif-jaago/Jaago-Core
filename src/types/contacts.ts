/**
 * Type definitions for Odoo Contacts
 */

export type FieldType =
    | 'char'
    | 'text'
    | 'selection'
    | 'many2one'
    | 'many2many'
    | 'one2many'
    | 'boolean'
    | 'integer'
    | 'float'
    | 'date'
    | 'datetime'
    | 'binary'
    | 'html'
    | 'monetary';

export interface ContactField {
    name: string;
    string: string; // Display label
    type: FieldType;
    required?: boolean;
    readonly?: boolean;
    help?: string;
    selection?: Array<[string, string]>; // For selection fields
    relation?: string; // For relational fields (model name)
    domain?: any[];
    context?: any;
    store?: boolean;
}

export interface Contact {
    id: number;
    name: string;
    display_name?: string;
    email?: string;
    phone?: string;

    website?: string;
    company_id?: [number, string] | false;
    company_type?: 'person' | 'company';
    image_128?: string;
    image_256?: string;
    image_1920?: string;
    street?: string;
    street2?: string;
    city?: string;
    state_id?: [number, string] | false;
    zip?: string;
    country_id?: [number, string] | false;
    category_id?: Array<number>;
    parent_id?: [number, string] | false;
    child_ids?: number[];
    user_id?: [number, string] | false;
    is_company?: boolean;
    customer_rank?: number;
    supplier_rank?: number;
    employee?: boolean;
    active?: boolean;
    comment?: string;
    create_date?: string;
    write_date?: string;
    [key: string]: any; // For Studio custom fields
}

export interface ContactCategory {
    id: number;
    name: string;
    color?: number;
    parent_id?: [number, string] | false;
    active?: boolean;
}

export interface ContactFormValues {
    name: string;
    email?: string;
    phone?: string;

    website?: string;
    function?: string;
    title?: number;
    company_id?: number;
    is_company?: boolean;
    parent_id?: number;
    street?: string;
    street2?: string;
    city?: string;
    state_id?: number;
    zip?: string;
    country_id?: number;
    category_id?: number[];
    customer_rank?: number;
    supplier_rank?: number;
    employee?: boolean;
    comment?: string;
    [key: string]: any; // For Studio custom fields
}

export interface ContactFilters {
    search?: string;
    companyIds?: number[];
    categoryIds?: number[];
    isCustomer?: boolean;
    isSupplier?: boolean;
    isEmployee?: boolean;
    activeOnly?: boolean;
}

export interface RelatedRecord {
    id: number;
    name: string;
    display_name?: string;
    date?: string;
    amount_total?: number;
    state?: string;
    [key: string]: any;
}

export interface RelatedRecords {
    invoices?: RelatedRecord[];
    salesOrders?: RelatedRecord[];
    crmLeads?: RelatedRecord[];
    projects?: RelatedRecord[];
}
