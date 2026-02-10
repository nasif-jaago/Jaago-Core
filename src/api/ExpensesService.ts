/**
 * Odoo Expenses Service
 * Handles all interactions with the hr.expense and hr.expense.sheet models
 */

import { odooCall, fetchRecords } from './odoo';

export interface ExpenseField {
    name: string;
    string: string;
    type: string;
    selection?: [string, string][];
    relation?: string;
    required?: boolean;
    readonly?: boolean;
    help?: string;
}

export interface Expense {
    id: number;
    name: string;
    employee_id: [number, string] | false;
    product_id: [number, string] | false;
    price_unit: number;
    quantity: number;
    total_amount: number;
    date: string;
    payment_mode: 'own_account' | 'company_account';
    state: 'draft' | 'reported' | 'approved' | 'done' | 'refused';
    description?: string;
    analytic_distribution?: any;
    company_id?: [number, string] | false;
    currency_id?: [number, string] | false;
    create_date?: string;
    write_date?: string;
    [key: string]: any;
}

export interface ExpenseSheet {
    id: number;
    name: string;
    employee_id: [number, string] | false;
    state: 'draft' | 'submit' | 'approve' | 'post' | 'done' | 'cancel';
    total_amount: number;
    expense_line_ids: number[];
    accounting_date?: string;
    approval_date?: string;
    company_id?: [number, string] | false;
    currency_id?: [number, string] | false;
    create_date?: string;
    write_date?: string;
    [key: string]: any;
}

export interface ExpenseProduct {
    id: number;
    name: string;
    can_be_expensed: boolean;
    standard_price?: number;
    uom_id?: [number, string] | false;
    [key: string]: any;
}

export interface ExpenseFormValues {
    name: string;
    employee_id?: number;
    product_id?: number;
    price_unit: number;
    quantity?: number;
    date?: string;
    payment_mode?: 'own_account' | 'company_account';
    description?: string;
    [key: string]: any;
}

/**
 * Fetch expenses with filters
 */
export const fetchExpenses = async (
    filters: any = {},
    offset: number = 0,
    limit: number = 80
): Promise<{ success: boolean; data?: Expense[]; error?: string }> => {
    try {
        const domain: any[] = [];

        // Build domain based on filters
        if (filters.state) {
            domain.push(['state', '=', filters.state]);
        }
        if (filters.employee_id) {
            domain.push(['employee_id', '=', filters.employee_id]);
        }
        if (filters.payment_mode) {
            domain.push(['payment_mode', '=', filters.payment_mode]);
        }
        if (filters.date_from) {
            domain.push(['date', '>=', filters.date_from]);
        }
        if (filters.date_to) {
            domain.push(['date', '<=', filters.date_to]);
        }

        const fields = filters.fields || [
            'name',
            'employee_id',
            'product_id',
            'price_unit',
            'quantity',
            'total_amount',
            'date',
            'payment_mode',
            'state',
            'description',
            'company_id',
            'currency_id',
            'create_date',
            'write_date'
        ];

        const result = await odooCall('hr.expense', 'search_read', [domain], {
            fields,
            offset,
            limit,
            order: 'date DESC, create_date DESC'
        });

        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error fetching expenses:', error);
        return { success: false, error: error.message || 'Failed to fetch expenses' };
    }
};

/**
 * Get count of expenses
 */
export const getExpensesCount = async (filters: any = {}): Promise<number> => {
    try {
        const domain: any[] = [];

        if (filters.state) {
            domain.push(['state', '=', filters.state]);
        }
        if (filters.employee_id) {
            domain.push(['employee_id', '=', filters.employee_id]);
        }

        const count = await odooCall('hr.expense', 'search_count', [domain]);
        return count || 0;
    } catch (error) {
        console.error('Error getting expenses count:', error);
        return 0;
    }
};

/**
 * Fetch expense products (products that can be expensed)
 */
export const fetchExpenseProducts = async (): Promise<{
    success: boolean;
    data?: ExpenseProduct[];
    error?: string;
}> => {
    try {
        const result = await odooCall('product.product', 'search_read', [
            [['can_be_expensed', '=', true]]
        ], {
            fields: ['name', 'standard_price', 'uom_id'],
            limit: 200
        });
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error fetching expense products:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch employees for expense assignment
 */
export const fetchEmployees = async (): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
}> => {
    try {
        const result = await fetchRecords('hr.employee', ['name', 'work_email', 'job_title', 'company_id'], [], 500);
        return result;
    } catch (error: any) {
        console.error('Error fetching employees:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create a new expense
 */
export const createExpense = async (
    data: ExpenseFormValues,
    companyId?: number,
    currencyId?: number
): Promise<{ success: boolean; id?: number; error?: string }> => {
    try {
        // Set defaults for required Odoo fields
        const payload = {
            ...data,
            quantity: data.quantity || 1,
            company_id: companyId || data.company_id || 1,
            currency_id: currencyId || data.currency_id || 55
        };

        console.log('Creating expense with payload:', JSON.stringify(payload, null, 2));

        const id = await odooCall('hr.expense', 'create', [payload]);
        return { success: true, id };
    } catch (error: any) {
        console.error('Error creating expense:', error);
        return { success: false, error: error.message || 'Failed to create expense' };
    }
};

/**
 * Fetch a single expense by ID
 */
export const fetchExpenseById = async (id: number): Promise<{
    success: boolean;
    data?: Expense;
    error?: string;
}> => {
    try {
        const result = await odooCall('hr.expense', 'read', [[id]]);
        return { success: true, data: result[0] };
    } catch (error: any) {
        console.error('Error fetching expense:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Submit expense for approval
 */
export const submitExpense = async (id: number): Promise<{
    success: boolean;
    error?: string;
}> => {
    try {
        await odooCall('hr.expense', 'action_submit_expenses', [[id]]);
        return { success: true };
    } catch (error: any) {
        console.error('Error submitting expense:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Approve expense
 */
export const approveExpense = async (id: number): Promise<{
    success: boolean;
    error?: string;
}> => {
    try {
        await odooCall('hr.expense', 'approve_expense_sheets', [[id]]);
        return { success: true };
    } catch (error: any) {
        console.error('Error approving expense:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Refuse expense
 */
export const refuseExpense = async (id: number, reason?: string): Promise<{
    success: boolean;
    error?: string;
}> => {
    try {
        await odooCall('hr.expense', 'refuse_expense', [[id]], { reason });
        return { success: true };
    } catch (error: any) {
        console.error('Error refusing expense:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete expense (only if in draft state)
 */
export const deleteExpense = async (id: number): Promise<{
    success: boolean;
    error?: string;
}> => {
    try {
        await odooCall('hr.expense', 'unlink', [[id]]);
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting expense:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch expense sheets
 */
export const fetchExpenseSheets = async (
    filters: any = {},
    offset: number = 0,
    limit: number = 80
): Promise<{ success: boolean; data?: ExpenseSheet[]; error?: string }> => {
    try {
        const domain: any[] = [];

        if (filters.state) {
            domain.push(['state', '=', filters.state]);
        }
        if (filters.employee_id) {
            domain.push(['employee_id', '=', filters.employee_id]);
        }

        const fields = [
            'name',
            'employee_id',
            'state',
            'total_amount',
            'expense_line_ids',
            'accounting_date',
            'approval_date',
            'company_id',
            'currency_id',
            'create_date',
            'write_date'
        ];

        const result = await odooCall('hr.expense.sheet', 'search_read', [domain], {
            fields,
            offset,
            limit,
            order: 'create_date DESC'
        });

        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error fetching expense sheets:', error);
        return { success: false, error: error.message || 'Failed to fetch expense sheets' };
    }
};
/**
 * Fetch all fields for hr.expense model
 */
export const fetchExpenseFields = async (): Promise<{ success: boolean; data?: Record<string, ExpenseField>; error?: string }> => {
    try {
        const fields = await odooCall('hr.expense', 'fields_get', [], {
            attributes: ['string', 'type', 'selection', 'relation', 'required', 'readonly', 'help']
        });

        // Add name to each field object for easier handling
        const formattedFields: Record<string, ExpenseField> = {};
        Object.keys(fields).forEach(name => {
            formattedFields[name] = { ...fields[name], name };
        });

        return { success: true, data: formattedFields };
    } catch (error: any) {
        console.error('Error fetching expense fields:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch options for relational fields
 */
export const fetchExpenseRelationOptions = async (model: string, domain: any[] = [], limit: number = 80): Promise<{ success: boolean; data?: any[]; error?: string }> => {
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
