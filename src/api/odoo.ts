/**
 * Odoo Integration Layer
 * Configuration and methods for JAAGO Foundation Odoo ERP.
 */

export const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const IS_MOCK_MODE = false;

// Using the Vite proxy defined in vite.config.ts to avoid CORS
const BASE_URL = '/odoo-api';

export interface OdooResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    syncTime: string;
}

/**
 * Authenticate and get UID
 */
let cachedUid: number | null = null;

/**
 * Authenticate and get UID, with caching
 */
export const getUid = async (): Promise<number> => {
    if (cachedUid) return cachedUid;

    const url = `${BASE_URL}/jsonrpc`;
    const body = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'common',
            method: 'authenticate',
            args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]
        },
        id: Math.floor(Math.random() * 1000)
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result = await response.json();
    if (result.error) throw new Error(result.error.data?.message || result.error.message);

    if (result.result) {
        cachedUid = result.result;
        return result.result;
    }
    throw new Error('Authentication failed');
};

/**
 * Helper to make Odoo JSON-RPC calls via proxy
 */
export const odooCall = async (model: string, method: string, args: any[] = [], kwargs: any = {}) => {
    try {
        const uid = await getUid();
        const url = `${BASE_URL}/jsonrpc`;
        const body = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    ODOO_CONFIG.DATABASE,
                    uid,
                    ODOO_CONFIG.API_KEY,
                    model,
                    method,
                    args,
                    kwargs
                ]
            },
            id: Math.floor(Math.random() * 1000)
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error.data?.message || result.error.message);
        return result.result;
    } catch (error) {
        console.error('Odoo API Error:', error);
        throw error;
    }
};

export const fetchEmployees = async (): Promise<OdooResponse<any[]>> => {
    if (IS_MOCK_MODE) {
        return {
            success: true,
            syncTime: new Date().toISOString(),
            data: []
        };
    }

    try {
        const fields = [
            'name',
            'barcode',
            'work_phone',
            'department_id',
            'company_id',
            'job_id',
            'work_email',
            'image_128',
            'address_id',
            'parent_id',
            'job_title',
            'create_date'
        ];

        const employees = await odooCall('hr.employee', 'search_read', [[['active', '=', true]]], {
            fields,
            limit: 500
        });

        return {
            success: true,
            syncTime: new Date().toISOString(),
            data: employees
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to fetch employees',
            syncTime: new Date().toISOString()
        };
    }
};

export const fetchDepartments = async (): Promise<OdooResponse<any[]>> => {
    try {
        const departments = await odooCall('hr.department', 'search_read', [[]], {
            fields: ['name', 'total_employee'],
            order: 'name'
        });
        return { success: true, data: departments, syncTime: new Date().toISOString() };
    } catch (err: any) {
        return { success: false, error: err.message, syncTime: new Date().toISOString() };
    }
};

export const fetchCompanies = async (): Promise<OdooResponse<any[]>> => {
    try {
        const companies = await odooCall('res.company', 'search_read', [[]], {
            fields: ['name'],
            order: 'name'
        });
        return { success: true, data: companies, syncTime: new Date().toISOString() };
    } catch (err: any) {
        return { success: false, error: err.message, syncTime: new Date().toISOString() };
    }
};

export const createEmployee = async (vals: any) => {
    return await odooCall('hr.employee', 'create', [vals]);
};

/**
 * Generic CRUD operations
 */
export const fetchRecords = async (model: string, fields: string[] = [], domain: any[] = [], limit: number = 80): Promise<OdooResponse<any[]>> => {
    try {
        const records = await odooCall(model, 'search_read', [domain], { fields, limit });
        return { success: true, data: records, syncTime: new Date().toISOString() };
    } catch (err: any) {
        return { success: false, error: err.message, syncTime: new Date().toISOString() };
    }
};

export const getCount = async (model: string, domain: any[] = []): Promise<number> => {
    try {
        const count = await odooCall(model, 'search_count', [domain]);
        // console.log(`Odoo Count [${model}]:`, count);
        return count;
    } catch (err: any) {
        console.error(`Odoo Count Error [${model}]:`, err.message || err);
        throw err; // Throw so caller can handle fallback
    }
};

export const createRecord = async (model: string, vals: any) => {
    return await odooCall(model, 'create', [vals]);
};

export const writeRecord = async (model: string, id: number, vals: any) => {
    return await odooCall(model, 'write', [[id], vals]);
};

export const deleteRecord = async (model: string, id: number) => {
    return await odooCall(model, 'unlink', [[id]]);
};

export const updateEmployee = async (employeeId: number, vals: any) => {
    return await odooCall('hr.employee', 'write', [[employeeId], vals]);
};

export const fetchHRData = async (): Promise<OdooResponse<any>> => {
    return {
        success: true,
        syncTime: new Date().toISOString(),
        data: {
            status: 'Connected to Odoo via Proxy',
            leaveBalances: { annual: 15, sick: 10, unpaid: 2 },
            attendanceLogs: [],
            payrollSummary: { gross: 0, deductions: 0, net: 0 }
        }
    };
};
