import { odooCall } from './odoo';

export interface Employee {
    id: number;
    name: string;
    department_id: [number, string] | false;
    parent_id: [number, string] | false; // Manager
    user_id: [number, string] | false;
    company_id: [number, string] | false;
    image_1920?: string;
}

export const fetchEmployees = async (domain: any[] = []): Promise<{ success: boolean; data?: Employee[]; error?: string }> => {
    try {
        const records = await odooCall('hr.employee', 'search_read', [domain], {
            fields: ['id', 'name', 'work_email', 'identification_id', 'department_id', 'parent_id', 'user_id', 'company_id', 'image_128']
        });
        return { success: true, data: records };
    } catch (error: any) {
        console.error('Error fetching employees:', error);
        return { success: false, error: error.message };
    }
};

export const fetchCurrentEmployee = async (userId: number): Promise<{ success: boolean; data?: Employee; error?: string }> => {
    try {
        const records = await odooCall('hr.employee', 'search_read', [[['user_id', '=', userId]]], {
            fields: ['id', 'name', 'department_id', 'parent_id', 'user_id', 'company_id', 'image_128'],
            limit: 1
        });
        if (records && records.length > 0) {
            return { success: true, data: records[0] };
        }
        return { success: false, error: 'Employee not found' };
    } catch (error: any) {
        console.error('Error fetching current employee:', error);
        return { success: false, error: error.message };
    }
};
