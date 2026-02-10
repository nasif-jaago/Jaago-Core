import { odooCall } from './odoo';

export interface Attendance {
    id: number;
    employee_id: [number, string];
    department_id: [number, string] | false;
    manager_id: [number, string] | false;
    check_in: string;
    check_out: string | false;
    worked_hours: number;
    x_studio_reasonnote?: string;
    x_studio_attendance_mode?: string;
    x_studio_state?: string;
}

export interface AttendanceFormValues {
    employee_id: number;
    check_in: string;
    check_out?: string | false;
    x_studio_reasonnote?: string;
    x_studio_attendance_mode?: string;
    x_studio_state?: string;
}

export const fetchAttendance = async (domain: any[] = []): Promise<{ success: boolean; data?: Attendance[]; error?: string }> => {
    try {
        const records = await odooCall('hr.attendance', 'search_read', [domain], {
            fields: [
                'id', 'employee_id', 'department_id', 'manager_id',
                'check_in', 'check_out', 'worked_hours',
                'x_studio_reasonnote', 'x_studio_attendance_mode', 'x_studio_state'
            ],
            order: 'check_in desc'
        });
        return { success: true, data: records };
    } catch (error: any) {
        console.error('Error fetching attendance:', error);
        return { success: false, error: error.message };
    }
};

export const createAttendance = async (values: AttendanceFormValues): Promise<{ success: boolean; data?: number; error?: string }> => {
    try {
        const result = await odooCall('hr.attendance', 'create', [values]);
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error creating attendance:', error);
        return { success: false, error: error.message };
    }
};

export const updateAttendance = async (id: number, values: Partial<AttendanceFormValues>): Promise<{ success: boolean; error?: string }> => {
    try {
        await odooCall('hr.attendance', 'write', [[id], values]);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating attendance:', error);
        return { success: false, error: error.message };
    }
};
