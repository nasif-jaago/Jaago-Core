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

// Environment-aware Configuration
const IS_PROD = import.meta.env.PROD;

/**
 * BASE_URL Logic:
 * 1. Uses VITE_ODOO_BASE_URL if defined in .env
 * 2. Falls back to '/odoo-api' (Standard Proxy)
 * 3. Final fallback to direct Odoo URL (requires CORS allowed on Odoo side)
 */
export const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_ODOO_BASE_URL;
    if (envUrl) return envUrl;

    // If we are on production and NOT using a proxy, we use the direct domain
    if (IS_PROD && !window.location.pathname.startsWith('/odoo-api')) {
        return `https://${ODOO_CONFIG.DOMAIN}`;
    }

    return '/odoo-api';
};

const BASE_URL = getBaseUrl();

export interface OdooResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    syncTime: string;
}

const safeJson = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    const status = response.status;

    // Check if we received HTML instead of JSON
    if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
            const errorMsg = `DEPLOYMENT ERROR: The API proxy "${BASE_URL}" is not configured on the production server. \n` +
                `Current Host: ${window.location.hostname}\n` +
                `HTTP Status: ${status}\n` +
                `The request to ${BASE_URL} returned the website's HTML instead of API data. \n\n` +
                `FIX: You must update your Nginx/Apache configuration to proxy "${BASE_URL}" to "https://jaago-foundation.odoo.com". \n` +
                `See the NGINX_PROXY.conf file in the project root for the correct configuration.`;

            console.error('API Connectivity Error:', errorMsg);
            throw new Error(errorMsg);
        }
    }

    try {
        return await response.json();
    } catch (e) {
        const text = await response.text().catch(() => 'No response body');
        throw new Error(`Failed to parse API response as JSON (Status: ${status}). Body: ${text.substring(0, 100)}...`);
    }
};

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

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const result = await safeJson(response);
        if (result.error) throw new Error(result.error.data?.message || result.error.message);

        if (result.result) {
            cachedUid = result.result;
            return result.result;
        }
        throw new Error('Authentication failed');
    } catch (error: any) {
        console.error('Odoo Auth Error:', error);
        throw error;
    }
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

        const result = await safeJson(response);
        if (result.error) throw new Error(result.error.data?.message || result.error.message);
        return result.result;
    } catch (error: any) {
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
            fields: ['name', 'currency_id'],
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

/**
 * Log a message to the Odoo record chatter
 */
export const logToChatter = async (model: string, id: number, message: string) => {
    try {
        return await odooCall(model, 'message_post', [[id]], { body: message });
    } catch (err) {
        console.error('Failed to log to Odoo chatter', err);
    }
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
