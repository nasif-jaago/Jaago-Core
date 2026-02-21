/**
 * Auth Management Service
 * Handles Login Requests, Odoo Verification, and Audit Logging
 */

import { supabase, supabaseAdmin } from '../lib/supabase';
import { odooCall } from './odoo';
import type { ApiResponse } from '../types/requisition';

export interface LoginRequest {
    id: string;
    email: string;
    supabase_user_id?: string;
    employee_id?: number;
    employee_name?: string;
    employee_id_number?: string;
    department?: string;
    designation?: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Employee Not Found' | 'Paused';
    ip_address?: string;
    device_info?: any;
    created_at: string;
    updated_at: string;
    approved_at?: string;
    approved_by?: string;
    rejected_at?: string;
    rejected_by?: string;
    rejection_reason?: string;
    metadata?: any;
}

export type LogAction =
    | 'Invite Sent'
    | 'Request Created'
    | 'Employee Auto-Matched'
    | 'Employee Manual Linked'
    | 'Approved'
    | 'Rejected'
    | 'Login Attempt Blocked'
    | 'Login Success'
    | 'Paused'
    | 'Removed';

export interface LoginLog {
    id: string;
    request_id: string;
    action: LogAction;
    performed_by?: string;
    timestamp: string;
    metadata?: any;
    ip_address?: string;
    device_info?: any;
}

/**
 * Capture Device Info
 */
const getDeviceInfo = () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    vendor: navigator.vendor
});

/**
 * Audit Logger Utility
 */
export const createAuditLog = async (log: Omit<LoginLog, 'id' | 'timestamp'>) => {
    try {
        const { error } = await supabase.from('login_request_logs').insert([{
            ...log,
            device_info: log.device_info || getDeviceInfo(),
            timestamp: new Date().toISOString()
        }]);
        if (error) console.error('Failed to create audit log:', error);
    } catch (e) {
        console.error('Audit Log Error:', e);
    }
};

/**
 * Fetch employee details from Odoo by email (Canonical Wrapper)
 * Handles normalization and multiple matches
 */
export const fetchOdooEmployeeByEmail = async (email: string): Promise<ApiResponse<any>> => {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        // Fetch from Odoo hr.employee
        const result = await odooCall('hr.employee', 'search_read', [
            [['work_email', 'ilike', normalizedEmail]]
        ], {
            fields: ['name', 'work_email', 'department_id', 'job_id', 'id', 'active', 'barcode'],
            order: 'active desc' // Prioritize active employees
        });

        if (result && result.length > 0) {
            // Find best match if multiple
            const emp = result[0];
            return {
                success: true,
                data: {
                    employee_id: emp.id,
                    employee_name: emp.name,
                    employee_email: emp.work_email,
                    employee_id_number: emp.barcode || emp.id.toString(),
                    department: Array.isArray(emp.department_id) ? emp.department_id[1] : emp.department_id,
                    designation: Array.isArray(emp.job_id) ? emp.job_id[1] : emp.job_id,
                    is_active: emp.active,
                    match_count: result.length
                }
            };
        }
        return { success: false, error: 'Employee not found in Odoo' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Admin: Invite User
 * 1. Odoo Lookup
 * 2. Create/Upsert Login Request
 * 3. Generate Supabase Invite (Magic Link)
 */
export const inviteUser = async (email: string, adminId: string) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Odoo Lookup
        const odooRes = await fetchOdooEmployeeByEmail(normalizedEmail);

        // 2. Create/Upsert Login Request
        const requestData: Partial<LoginRequest> = {
            email: normalizedEmail,
            status: odooRes.success ? 'Pending' : 'Employee Not Found',
            employee_id: odooRes.data?.employee_id,
            employee_name: odooRes.data?.employee_name,
            department: odooRes.data?.department,
            designation: odooRes.data?.designation,
            employee_id_number: odooRes.data?.employee_id_number,
            metadata: { invited_by: adminId, odoo_matching: odooRes.success }
        };

        const { data: request, error: upsertErr } = await supabase
            .from('login_requests')
            .upsert(requestData, { onConflict: 'email' })
            .select()
            .single();

        if (upsertErr) throw upsertErr;

        // 3. Log Actions
        await createAuditLog({
            request_id: request.id,
            action: 'Invite Sent',
            performed_by: adminId,
            metadata: { email: normalizedEmail }
        });

        if (odooRes.success) {
            await createAuditLog({
                request_id: request.id,
                action: 'Employee Auto-Matched',
                metadata: odooRes.data
            });
        }

        // 4. Generate Supabase Invite (Admin API)
        // Check if user already exists to avoid redundant invites and rate limits
        const { data: existingUsers, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        const alreadyExists = existingUsers?.users.find(u => u.email?.toLowerCase() === normalizedEmail);

        if (!alreadyExists) {
            const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
                redirectTo: `${window.location.origin}?view=accept-invite`
            });
            if (inviteErr) throw inviteErr;
        } else {
            // If they exist but don't have a login request link, link them now
            if (!request.supabase_user_id) {
                await supabase.from('login_requests').update({
                    supabase_user_id: alreadyExists.id
                }).eq('id', request.id);
            }
            return {
                success: true,
                request_id: request.id,
                status: request.status,
                message: 'User already exists in Supabase Auth. Login request has been linked/updated.'
            };
        }

        return { success: true, request_id: request.id, status: request.status };
    } catch (error: any) {
        console.error('Invite Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create Login Request (User-initiated during Signup)
 */
export const createLoginRequest = async (request: Partial<LoginRequest>) => {
    try {
        const normalizedEmail = request.email?.toLowerCase().trim();
        const { data, error } = await supabase.from('login_requests').insert([{
            ...request,
            email: normalizedEmail
        }]).select().single();

        if (error) throw error;

        await createAuditLog({
            request_id: data.id,
            action: 'Request Created',
            performed_by: request.supabase_user_id,
        });

        // Auto-match
        const odooRes = await fetchOdooEmployeeByEmail(normalizedEmail!);
        if (odooRes.success) {
            await supabase.from('login_requests').update({
                employee_id: odooRes.data.employee_id,
                employee_name: odooRes.data.employee_name,
                department: odooRes.data.department,
                designation: odooRes.data.designation,
                employee_id_number: odooRes.data.employee_id_number,
                status: 'Pending'
            }).eq('id', data.id);

            await createAuditLog({
                request_id: data.id,
                action: 'Employee Auto-Matched',
                metadata: odooRes.data
            });
        }

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Admin: Approve Login Request
 */
export const approveLoginRequest = async (requestId: string, adminId: string) => {
    try {
        const { data: request, error: getErr } = await supabase.from('login_requests').select('*').eq('id', requestId).single();
        if (getErr || !request) throw new Error('Request not found');

        const { error } = await supabase.from('login_requests').update({
            status: 'Approved',
            approved_at: new Date().toISOString(),
            approved_by: adminId,
            updated_at: new Date().toISOString()
        }).eq('id', requestId);

        if (error) throw error;

        // Pattern B: Update Supabase User Metadata (approved claim)
        if (request.supabase_user_id) {
            await supabaseAdmin.auth.admin.updateUserById(request.supabase_user_id, {
                user_metadata: { role: 'approved_user', approved: true }
            });
        }

        await createAuditLog({
            request_id: requestId,
            action: 'Approved',
            performed_by: adminId
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Admin: Reject Login Request
 */
export const rejectLoginRequest = async (requestId: string, adminId: string, reason: string) => {
    try {
        const { error } = await supabase.from('login_requests').update({
            status: 'Rejected',
            rejected_at: new Date().toISOString(),
            rejected_by: adminId,
            rejection_reason: reason,
            updated_at: new Date().toISOString()
        }).eq('id', requestId);

        if (error) throw error;

        await createAuditLog({
            request_id: requestId,
            action: 'Rejected',
            performed_by: adminId,
            metadata: { reason }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch all login requests
 */
export const fetchLoginRequests = async (filters: { status?: string; searchTerm?: string } = {}) => {
    try {
        let query = supabase.from('login_requests').select('*').order('created_at', { ascending: false });

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.searchTerm) {
            query = query.or(`email.ilike.%${filters.searchTerm}%,employee_name.ilike.%${filters.searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Request Logs
 */
export const fetchRequestLogs = async (requestId?: string) => {
    try {
        let query = supabase.from('login_request_logs').select('*').order('timestamp', { ascending: false });
        if (requestId) query = query.eq('request_id', requestId);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Manual Odoo Link
 */
export const linkEmployeeToRequest = async (requestId: string, employeeData: any, adminId: string) => {
    try {
        const { error } = await supabase.from('login_requests').update({
            employee_id: employeeData.employee_id,
            employee_name: employeeData.employee_name,
            department: employeeData.department,
            designation: employeeData.designation,
            employee_id_number: employeeData.employee_id_number,
            status: 'Pending',
            updated_at: new Date().toISOString()
        }).eq('id', requestId);

        if (error) throw error;

        await createAuditLog({
            request_id: requestId,
            action: 'Employee Manual Linked',
            performed_by: adminId,
            metadata: employeeData
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Admin: Pause/Suspend Login Request
 */
export const pauseLoginRequest = async (requestId: string, adminId: string) => {
    try {
        const { data: request, error: getErr } = await supabase.from('login_requests').select('*').eq('id', requestId).single();
        if (getErr || !request) throw new Error('Request not found');

        const { error } = await supabase.from('login_requests').update({
            status: 'Paused',
            updated_at: new Date().toISOString()
        }).eq('id', requestId);

        if (error) throw error;

        // Revoke role in Supabase
        if (request.supabase_user_id) {
            await supabaseAdmin.auth.admin.updateUserById(request.supabase_user_id, {
                user_metadata: { role: 'paused_user', approved: false }
            });
        }

        await createAuditLog({
            request_id: requestId,
            action: 'Paused',
            performed_by: adminId
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Admin: Remove Login Request & User
 */
export const deleteLoginRequest = async (requestId: string, adminId: string, deleteAuthUser: boolean = false) => {
    try {
        const { data: request, error: getErr } = await supabase.from('login_requests').select('*').eq('id', requestId).single();
        if (getErr || !request) throw new Error('Request not found');

        // Optional: Delete from Supabase Auth
        if (deleteAuthUser && request.supabase_user_id) {
            const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(request.supabase_user_id);
            if (authErr) console.error('Auth deletion failed:', authErr);
        }

        const { error } = await supabase.from('login_requests').delete().eq('id', requestId);
        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
