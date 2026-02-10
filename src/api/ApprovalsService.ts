/**
 * Odoo Approvals Service
 * Handles all interactions with the approval.request model
 */

import { odooCall, fetchRecords } from './odoo';

export interface ApprovalRequest {
    id: number;
    name: string;
    request_owner_id: [number, string] | false;
    category_id: [number, string] | false;
    request_status: 'new' | 'pending' | 'approved' | 'refused' | 'cancel';
    date: string;
    date_confirmed?: string;
    reason?: string;
    amount?: number;
    approver_ids?: number[];
    has_access_to_request?: boolean;
    create_date?: string;
    write_date?: string;
    [key: string]: any;
}

export interface ApprovalField {
    name: string;
    string: string;
    type: string;
    required: boolean;
    relation?: string;
    selection?: [string, string][];
    help?: string;
}


export interface ApprovalCategory {
    id: number;
    name: string;
    description?: string;
    has_amount?: 'required' | 'optional' | 'no';
    has_date?: 'required' | 'optional' | 'no';
    has_period?: 'required' | 'optional' | 'no';
    has_quantity?: 'required' | 'optional' | 'no';
    has_reference?: 'required' | 'optional' | 'no';
    automated_sequence?: boolean;
    [key: string]: any;
}

export interface ApprovalFormValues {
    name: string;
    category_id?: number;
    request_owner_id?: number;
    reason?: string;
    amount?: number;
    date?: string;
    date_end?: string;
    quantity?: number;
    reference?: string;
    [key: string]: any;
}

/**
 * Fetch approval requests with filters
 */
export const fetchApprovals = async (
    filters: any = {},
    offset: number = 0,
    limit: number = 80
): Promise<{ success: boolean; data?: ApprovalRequest[]; error?: string }> => {
    try {
        const domain: any[] = [];

        // Build domain based on filters
        if (filters.status) {
            domain.push(['request_status', '=', filters.status]);
        }
        if (filters.category_id) {
            domain.push(['category_id', '=', filters.category_id]);
        }
        if (filters.my_requests) {
            // Filter for current user's requests
            domain.push(['request_owner_id', '=', filters.user_id]);
        }

        const fields = [
            'name',
            'request_owner_id',
            'category_id',
            'request_status',
            'date',
            'date_confirmed',
            'reason',
            'amount',
            'create_date',
            'write_date'
        ];

        const result = await odooCall('approval.request', 'search_read', [domain], {
            fields,
            offset,
            limit,
            order: 'create_date DESC'
        });

        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error fetching approvals:', error);
        return { success: false, error: error.message || 'Failed to fetch approvals' };
    }
};

/**
 * Get count of approval requests
 */
export const getApprovalsCount = async (filters: any = {}): Promise<number> => {
    try {
        const domain: any[] = [];

        if (filters.status) {
            domain.push(['request_status', '=', filters.status]);
        }
        if (filters.category_id) {
            domain.push(['category_id', '=', filters.category_id]);
        }

        const count = await odooCall('approval.request', 'search_count', [domain]);
        return count || 0;
    } catch (error) {
        console.error('Error getting approvals count:', error);
        return 0;
    }
};

/**
 * Fetch approval categories
 */
export const fetchApprovalCategories = async (): Promise<{
    success: boolean;
    data?: ApprovalCategory[];
    error?: string;
}> => {
    try {
        const result = await fetchRecords('approval.category', [
            'name',
            'description',
            'has_amount',
            'has_date',
            'has_period',
            'has_quantity',
            'has_reference'
        ]);
        return result;
    } catch (error: any) {
        console.error('Error fetching approval categories:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create a new approval request
 */
export const createApprovalRequest = async (
    data: ApprovalFormValues
): Promise<{ success: boolean; id?: number; error?: string }> => {
    try {
        console.log('Creating approval request with payload:', JSON.stringify(data, null, 2));
        const id = await odooCall('approval.request', 'create', [data]);
        return { success: true, id };
    } catch (error: any) {
        console.error('Error creating approval request:', error);
        return { success: false, error: error.message || 'Failed to create approval request' };
    }
};

/**
 * Fetch all available fields for approval.request
 */
export const fetchApprovalFields = async (): Promise<Record<string, ApprovalField>> => {
    try {
        const fields = await odooCall('approval.request', 'fields_get', [], {
            attributes: ['string', 'type', 'required', 'relation', 'selection', 'help']
        });
        return fields;
    } catch (error) {
        console.error('Error fetching approval fields:', error);
        return {};
    }
};

/**
 * Fetch relation options for many2one fields
 */
export const fetchApprovalRelationOptions = async (
    model: string,
    domain: any[] = [],
    limit: number = 100
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
    try {
        const result = await fetchRecords(model, ['name', 'display_name'], domain, limit);
        return result;
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch a single approval request by ID
 */
export const fetchApprovalById = async (id: number): Promise<{
    success: boolean;
    data?: ApprovalRequest;
    error?: string;
}> => {
    try {
        const result = await odooCall('approval.request', 'read', [[id]]);
        return { success: true, data: result[0] };
    } catch (error: any) {
        console.error('Error fetching approval:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Approve a request
 */
export const approveRequest = async (id: number): Promise<{
    success: boolean;
    error?: string;
}> => {
    try {
        await odooCall('approval.request', 'action_approve', [[id]]);
        return { success: true };
    } catch (error: any) {
        console.error('Error approving request:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Refuse a request
 */
export const refuseRequest = async (id: number): Promise<{
    success: boolean;
    error?: string;
}> => {
    try {
        await odooCall('approval.request', 'action_refuse', [[id]]);
        return { success: true };
    } catch (error: any) {
        console.error('Error refusing request:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel a request
 */
export const cancelRequest = async (id: number): Promise<{
    success: boolean;
    error?: string;
}> => {
    try {
        await odooCall('approval.request', 'action_cancel', [[id]]);
        return { success: true };
    } catch (error: any) {
        console.error('Error canceling request:', error);
        return { success: false, error: error.message };
    }
};
