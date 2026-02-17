/**
 * Requisition Type Definitions
 * Comprehensive types for the Requisition system
 */

export interface RequisitionRequest {
    id: number;
    name: string;
    request_owner_id: [number, string] | false;
    category_id: [number, string] | false;
    request_status: 'new' | 'pending' | 'approved' | 'refused' | 'cancel' | 'draft' | 'pending_approval';
    date: string;
    date_confirmed?: string;
    reason?: string;
    amount?: number;
    reference?: string;
    company_id?: [number, string] | false;
    create_date?: string;
    write_date?: string;

    // Custom Odoo Studio fields
    x_studio_reason_for_purchase?: string;
    x_studio_delivery_instructions?: string;
    x_studio_projects_name?: [number, string] | string | number | false;
    x_studio_project_code?: string;
    x_studio_budget_amount?: number;
    x_studio_total_amount?: number;
    x_studio_refusal_note?: string;

    // Relations
    product_line_ids?: number[];
    approval_history_ids?: number[];
    pr_number?: string;

    // Computed/helper fields
    current_approver_id?: [number, string] | false;
    can_approve?: boolean;
    can_refuse?: boolean;
    can_edit?: boolean;
    can_submit?: boolean;

    [key: string]: any;
}

export interface RequisitionLine {
    id?: number;
    request_id?: number;
    product_id: number | [number, string] | false;
    x_studio_product_description?: string;
    product_uom_id: number | [number, string] | false;
    quantity?: number;
    x_studio_per_unit_price?: number;
    x_studio_estimated_price?: number;

    company_id?: number;
}

export interface ApprovalRule {
    id?: number;
    name: string;
    model_id?: [number, string] | false;
    model_name?: string;
    method?: string;
    domain: string;
    approver_ids: number[];
    approval_group_id?: [number, string] | false;
    users_to_notify?: number[];
    notification_order?: string;
    exclusive_user?: boolean;
    conditional?: boolean;
    message?: string;
    active: boolean;
    kanban_color?: number;
}

export interface ApprovalHistory {
    id: number;
    request_id: number;
    approver_id: [number, string];
    step_name: string;
    decision: 'approved' | 'refused' | 'pending';
    decision_date?: string;
    comments?: string;
    signature?: string;
    sequence: number;
}

export interface RequisitionFormValues {
    name: string;
    category_id?: number;
    request_owner_id?: number;
    date?: string;
    reference?: string;
    company_id?: number;

    // Custom fields
    x_studio_reason_for_purchase?: string;
    x_studio_delivery_instructions?: string;
    x_studio_projects_name?: number | string;
    x_studio_project_code?: string;
    x_studio_budget_amount?: number;
    x_studio_refusal_note?: string;
    reason?: string;

    // Product lines
    product_line_ids?: RequisitionLine[];

    [key: string]: any;
}

export interface Product {
    id: number;
    name: string;
    display_name: string;
    default_code?: string;
    list_price?: number;
    standard_price?: number;
    uom_id?: [number, string];
    categ_id?: [number, string];
}

export interface UoM {
    id: number;
    name: string;
    display_name: string;
    category_id?: [number, string];
}

export interface Project {
    id: number;
    name: string;
    display_name?: string;
    code?: string;
    budget?: number;
    partner_id?: [number, string];
    company_id?: [number, string] | number | false;
}

export interface Employee {
    id: number;
    name: string;
    work_email?: string;
    department_id?: [number, string];
    parent_id?: [number, string];
    user_id?: [number, string];
    company_id?: [number, string];
}

export interface ApprovalStep {
    sequence: number;
    name: string;
    approver_id: [number, string] | false;
    status: 'pending' | 'approved' | 'refused' | 'skipped';
    decision_date?: string;
    comments?: string;
}

export interface RefuseReason {
    reason: string;
    notify_owner?: boolean;
}

export interface RequisitionFilters {
    status?: string;
    category_id?: number;
    my_requests?: boolean;
    user_id?: number;
    date_from?: string;
    date_to?: string;
    project_id?: number;
    amount_min?: number;
    amount_max?: number;
    searchTerm?: string;
}

export interface RequisitionCategory {
    id: number;
    name: string;
    description?: string;
    has_amount?: 'required' | 'optional' | 'no';
    has_date?: 'required' | 'optional' | 'no';
    has_period?: 'required' | 'optional' | 'no';
    has_quantity?: 'required' | 'optional' | 'no';
    has_reference?: 'required' | 'optional' | 'no';
    automated_sequence?: boolean;
    approval_minimum?: number;
    [key: string]: any;
}

export interface RequisitionField {
    name: string;
    string: string;
    type: string;
    required: boolean;
    relation?: string;
    selection?: [string, string][];
    help?: string;
    readonly?: boolean;
    states?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data?: T[];
    total?: number;
    offset?: number;
    limit?: number;
    error?: string;
}
