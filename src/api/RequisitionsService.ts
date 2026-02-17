/**
 * Odoo Requisitions Service - Complete Implementation
 * Handles all interactions with the approval.request model and related entities
 */

import { odooCall, fetchRecords, getUid } from './odoo';
export * from '../types/requisition';
import type {
    RequisitionRequest,
    RequisitionLine,
    ApprovalRule,
    ApprovalHistory,
    RequisitionFormValues,
    Product,
    UoM,
    Project,
    Employee,
    RequisitionFilters,
    RequisitionCategory,
    RefuseReason,
    ApiResponse,
    PaginatedResponse,
    RequisitionField
} from '../types/requisition';

/**
 * Common fields used for fetching a single requisition
 */
const FULL_REQUISITION_FIELDS = [
    'name',
    'request_owner_id',
    'category_id',
    'request_status',
    'date',
    'date_confirmed',
    'reason',
    'amount',
    'reference',
    'company_id',
    'create_date',
    'write_date',
    'x_studio_reason_for_purchase',
    'x_studio_delivery_instructions',
    'x_studio_projects_name',
    'x_studio_project_code',
    'x_studio_budget_amount',
    'x_studio_total_amount',
    'product_line_ids',
    'approver_ids',
    'x_studio_departmentproject_name',
    'x_studio_refusal_note'
];

/**
 * Fetch requisition requests with filters and pagination
 */
export const fetchRequisitions = async (
    filters: RequisitionFilters = {},
    offset: number = 0,
    limit: number = 80
): Promise<PaginatedResponse<RequisitionRequest>> => {
    try {
        const domain: any[] = [];

        if (filters.status) {
            domain.push(['request_status', '=', filters.status]);
        }

        if (filters.my_requests && filters.user_id) {
            domain.push(['request_owner_id', '=', filters.user_id]);
        }

        if (filters.category_id) {
            domain.push(['category_id', '=', filters.category_id]);
        }

        if (filters.searchTerm) {
            domain.push('|',
                ['name', 'ilike', filters.searchTerm],
                ['reference', 'ilike', filters.searchTerm]
            );
        }

        const result = await odooCall('approval.request', 'search_read', [domain], {
            fields: ['name', 'request_owner_id', 'category_id', 'request_status', 'date', 'amount', 'reference', 'company_id', 'x_studio_total_amount'],
            offset,
            limit,
            order: 'create_date desc'
        });

        const count = await getRequisitionsCount(filters);

        return { success: true, data: result, total: count };
    } catch (error: any) {
        console.error('Error fetching requisitions:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get total count of requisitions for pagination
 */
export const getRequisitionsCount = async (filters: RequisitionFilters = {}): Promise<number> => {
    try {
        const domain: any[] = [];
        if (filters.status) domain.push(['request_status', '=', filters.status]);
        if (filters.my_requests && filters.user_id) domain.push(['request_owner_id', '=', filters.user_id]);
        if (filters.category_id) domain.push(['category_id', '=', filters.category_id]);
        if (filters.searchTerm) {
            domain.push('|', ['name', 'ilike', filters.searchTerm], ['reference', 'ilike', filters.searchTerm]);
        }
        const count = await odooCall('approval.request', 'search_count', [domain]);
        return count || 0;
    } catch (error) {
        console.error('Error fetching count:', error);
        return 0;
    }
};

/**
 * Fetch a single requisition by ID with all details
 */
export const fetchRequisitionById = async (id: number): Promise<ApiResponse<RequisitionRequest>> => {
    try {
        const results = await odooCall('approval.request', 'search_read', [[['id', '=', id]]], {
            fields: FULL_REQUISITION_FIELDS
        });

        if (!results || results.length === 0) {
            return { success: false, error: 'Requisition not found' };
        }

        const data = results[0];

        if (data.approver_ids && data.approver_ids.length > 0) {
            const approvers = await odooCall('approval.approver', 'search_read', [[['id', 'in', data.approver_ids]]], {
                fields: ['user_id', 'status', 'write_date', 'sequence']
            });
            data.approval_history_ids = approvers.map((a: any) => ({
                id: a.id,
                approver_id: a.user_id,
                decision: a.status,
                decision_date: a.write_date,
                sequence: a.sequence,
                step_name: 'Approval Step'
            }));
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Error fetching requisition:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create a new requisition request
 */
export const createRequisition = async (values: RequisitionFormValues): Promise<ApiResponse<number>> => {
    try {
        const res = await odooCall('approval.request', 'create', [values]);
        return { success: true, data: res };
    } catch (error: any) {
        console.error('Error creating requisition:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update an existing requisition request
 */
export const updateRequisition = async (id: number, values: RequisitionFormValues): Promise<ApiResponse<boolean>> => {
    try {
        await odooCall('approval.request', 'write', [[id], values]);
        return { success: true, data: true };
    } catch (error: any) {
        console.error('Error updating requisition:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Submit a requisition for approval
 */
export const submitRequisition = async (id: number): Promise<ApiResponse<boolean>> => {
    try {
        await odooCall('approval.request', 'action_confirm', [[id]]);
        return { success: true, data: true };
    } catch (error: any) {
        console.error('Error submitting requisition:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Approve a requisition
 */
export const approveRequisition = async (id: number): Promise<ApiResponse<boolean>> => {
    try {
        await odooCall('approval.request', 'action_approve', [[id]]);
        return { success: true, data: true };
    } catch (error: any) {
        console.error('Error approving requisition:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Refuse a requisition
 */
export const refuseRequisition = async (id: number, refuse?: RefuseReason): Promise<ApiResponse<boolean>> => {
    try {
        await odooCall('approval.request', 'action_refuse', [[id]], {
            refusal_reason: refuse?.reason || 'No reason provided'
        });
        // Also update the refusal note field if it exists
        if (refuse?.reason) {
            await odooCall('approval.request', 'write', [[id], { x_studio_refusal_note: refuse.reason }]);
        }
        return { success: true, data: true };
    } catch (error: any) {
        console.error('Error refusing requisition:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete a requisition request (Draft only)
 */
export const deleteRequisition = async (id: number): Promise<ApiResponse<boolean>> => {
    try {
        await odooCall('approval.request', 'unlink', [[id]]);
        return { success: true, data: true };
    } catch (error: any) {
        console.error('Error deleting requisition:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch products with category filter
 */
export const fetchProducts = async (options: { searchTerm?: string; productFor?: string; companyId?: number } = {}, limit: number = 150): Promise<ApiResponse<Product[]>> => {
    try {
        const domain: any[] = [['sale_ok', '=', true]];

        if (options.companyId) {
            domain.push(['company_id', 'in', [options.companyId, false]]);
        }

        if (options.productFor && options.productFor !== '' && options.productFor !== 'all') {
            domain.push(['x_studio_product_for', '=', options.productFor]);
        }

        if (options.searchTerm) {
            domain.push('|', ['name', 'ilike', options.searchTerm], ['default_code', 'ilike', options.searchTerm]);
        }

        const result = await odooCall('product.template', 'search_read', [domain], {
            fields: ['name', 'display_name', 'default_code', 'list_price', 'standard_price', 'uom_id', 'categ_id'],
            limit
        });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Units of Measure with fallback for older Odoo versions
 */
export const fetchUoMs = async (): Promise<ApiResponse<UoM[]>> => {
    try {
        // Try uom.uom first (standard in Odoo 12+)
        try {
            const result = await odooCall('uom.uom', 'search_read', [[]], {
                fields: ['name', 'display_name']
            });
            if (result && Array.isArray(result)) return { success: true, data: result };
        } catch (e) {
            console.warn('uom.uom not found, trying product.uom');
        }

        // Try product.uom (standard in Odoo <12)
        const fallback = await odooCall('product.uom', 'search_read', [[]], {
            fields: ['name', 'display_name']
        });
        return { success: true, data: fallback };
    } catch (error: any) {
        console.error('Error fetching UoMs:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Requisition Categories
 */
export const fetchRequisitionCategories = async (companyId?: number): Promise<ApiResponse<RequisitionCategory[]>> => {
    try {
        const domain: any[] = [];
        if (companyId) domain.push(['company_id', 'in', [companyId, false]]);
        const result = await odooCall('approval.category', 'search_read', [domain], {
            fields: ['name', 'description', 'has_amount', 'has_date', 'has_reference']
        });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Projects
 */
export const fetchProjects = async (options: { searchTerm?: string; companyId?: number } = {}): Promise<ApiResponse<Project[]>> => {
    try {
        const domain: any[] = [];
        if (options.searchTerm) domain.push(['name', 'ilike', options.searchTerm]);
        if (options.companyId) domain.push(['company_id', 'in', [options.companyId, false]]);
        const result = await odooCall('project.project', 'search_read', [domain], {
            fields: ['name', 'display_name', 'code', 'company_id']
        });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Departments
 */
export const fetchDepartments = async (): Promise<ApiResponse<any[]>> => {
    try {
        const result = await odooCall('hr.department', 'search_read', [[]], {
            fields: ['name']
        });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Companies and their currency symbols
 */
export const fetchCompanies = async (): Promise<ApiResponse<any[]>> => {
    try {
        const result = await odooCall('res.company', 'search_read', [[]], {
            fields: ['name', 'currency_id'],
            order: 'name'
        });

        const currencyIds = [...new Set(result.map((c: any) => Array.isArray(c.currency_id) ? c.currency_id[0] : c.currency_id).filter(Boolean))];

        if (currencyIds.length > 0) {
            const currencies = await odooCall('res.currency', 'search_read', [[['id', 'in', currencyIds]]], {
                fields: ['name', 'symbol']
            });
            const currencyMap = new Map(currencies.map((c: any) => [c.id, c.symbol]));

            result.forEach((c: any) => {
                const curId = Array.isArray(c.currency_id) ? c.currency_id[0] : c.currency_id;
                c.currency_symbol = currencyMap.get(curId) || '$';
            });
        }

        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error fetching companies:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Employees for searching
 */
export const fetchEmployees = async (searchTerm: string = '', limit: number = 20): Promise<ApiResponse<Employee[]>> => {
    try {
        const domain: any[] = [];
        if (searchTerm) {
            domain.push('|', ['name', 'ilike', searchTerm], ['work_email', 'ilike', searchTerm]);
        }
        const result = await odooCall('hr.employee', 'search_read', [domain], {
            fields: ['name', 'work_email', 'department_id', 'user_id', 'company_id'],
            limit
        });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Current User Profile
 */
export const fetchCurrentUserProfile = async (): Promise<ApiResponse<Employee>> => {
    try {
        const uid = await getUid();
        const result = await odooCall('hr.employee', 'search_read', [[['user_id', '=', uid]]], {
            fields: ['name', 'work_email', 'department_id', 'user_id', 'company_id'],
            limit: 1
        });
        if (result && result.length > 0) return { success: true, data: result[0] };
        return { success: false, error: 'User profile not found' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Product Lines for a requisition
 */
export const fetchProductLines = async (requisitionId: number): Promise<ApiResponse<RequisitionLine[]>> => {
    try {
        const result = await odooCall('approval.product.line', 'search_read', [[['approval_request_id', '=', requisitionId]]], {
            fields: ['product_id', 'description', 'x_studio_product_description', 'product_uom_id', 'quantity', 'x_studio_per_unit_price', 'x_studio_estimated_price']
        });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Download Requisition PDF
 */
export const downloadPDF = async (id: number): Promise<ApiResponse<string>> => {
    // This is a placeholder as PDF generation usually requires a specific endpoint 
    // but we can return a link to the Odoo report if possible.
    return { success: true, data: `/report/pdf/approval.report_approval/${id}` };
};

/**
 * Fetch Attachments for a record
 */
export const fetchAttachments = async (resModel: string, resId: number): Promise<ApiResponse<any[]>> => {
    try {
        const result = await odooCall('ir.attachment', 'search_read', [[
            ['res_model', '=', resModel],
            ['res_id', '=', resId]
        ]], {
            fields: ['name', 'mimetype', 'create_date', 'file_size']
        });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Upload Attachment
 */
export const uploadAttachment = async (resModel: string, resId: number, name: string, base64Data: string): Promise<ApiResponse<number>> => {
    try {
        const res = await odooCall('ir.attachment', 'create', [{
            name,
            datas: base64Data,
            res_model: resModel,
            res_id: resId,
            type: 'binary'
        }]);
        return { success: true, data: res };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Get Attachment Data (Base64)
 */
export const getAttachmentData = async (id: number): Promise<ApiResponse<string>> => {
    try {
        const result = await odooCall('ir.attachment', 'read', [[id], ['datas']]);
        if (result && result.length > 0) return { success: true, data: result[0].datas };
        return { success: false, error: 'Attachment not found' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Approval Rules
 */
export const fetchApprovalRules = async (): Promise<ApiResponse<ApprovalRule[]>> => {
    try {
        // Many custom approval systems use 'approval.rule' or similar
        const result = await odooCall('approval.rule', 'search_read', [[]], {
            fields: ['name', 'domain', 'approver_ids', 'exclusive_user', 'conditional', 'message', 'active']
        });
        return { success: true, data: result };
    } catch (error: any) {
        // Fallback or empty if model doesn't exist
        console.warn('approval.rule model might not exist, returning empty:', error);
        return { success: true, data: [] };
    }
};

/**
 * Create Approval Rule
 */
export const createApprovalRule = async (values: Partial<ApprovalRule>): Promise<ApiResponse<number>> => {
    try {
        const res = await odooCall('approval.rule', 'create', [values]);
        return { success: true, data: res };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Update Approval Rule
 */
export const updateApprovalRule = async (id: number, values: Partial<ApprovalRule>): Promise<ApiResponse<boolean>> => {
    try {
        await odooCall('approval.rule', 'write', [[id], values]);
        return { success: true, data: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Delete Approval Rule
 */
export const deleteApprovalRule = async (id: number): Promise<ApiResponse<boolean>> => {
    try {
        await odooCall('approval.rule', 'unlink', [[id]]);
        return { success: true, data: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch fields metadata for approval.request
 */
export const fetchRequisitionFields = async (): Promise<ApiResponse<Record<string, RequisitionField>>> => {
    try {
        const result = await odooCall('approval.request', 'fields_get', [], {
            attributes: ['string', 'help', 'type', 'required', 'relation', 'selection', 'readonly', 'states']
        });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch relation options for many2one fields
 */
export const fetchRequisitionRelationOptions = async (model: string, domain: any[] = [], limit: number = 80): Promise<ApiResponse<any[]>> => {
    try {
        const result = await odooCall(model, 'search_read', [domain], {
            fields: ['name', 'display_name'],
            limit
        });
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Aliases for compatibility with other components
 */
export const createRequisitionRequest = createRequisition;
export const approveRequest = approveRequisition;
export const refuseRequest = refuseRequisition;

/**
 * Cancel a requisition request
 */
export const cancelRequest = async (id: number): Promise<ApiResponse<boolean>> => {
    try {
        await odooCall('approval.request', 'action_cancel', [[id]]);
        return { success: true, data: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
