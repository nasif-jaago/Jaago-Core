import { odooCall, type OdooResponse } from './odoo';
import { supabase } from '../lib/supabase';

export interface OdooEmployee {
    id: number;
    name: string;
    work_email: string;
    next_appraisal_date: string | false;
    parent_id: [number, string] | false;
}

export interface AppraisalRecord {
    id: number;
    display_name: string;
    employee_id?: [number, string];
    employee_name?: string;
    work_email?: string;
    next_appraisal_date?: string;
    supervisor_id?: [number, string];
    state: string;
    write_date: string;
    [key: string]: any;
}

export interface EmailLog {
    id: number;
    email_to?: string;
    email_from?: string;
    subject: string;
    date: string;
    state?: string;
    body?: string;
}

export const AppraisalService = {
    // Model mapping based on actual Odoo models
    MODEL_MAP: {
        self: 'hr.appraisal',
        supervisor: 'hr.appraisal',
        '360': 'hr.appraisal'
    },

    RESPONSE_MODEL_MAP: {
        self: 'hr.appraisal',
        supervisor: 'hr.appraisal',
        '360': 'hr.appraisal'
    },

    fetchAppraisals: async (tabType: 'self' | 'supervisor' | '360'): Promise<OdooResponse<AppraisalRecord[]>> => {
        try {
            const model = AppraisalService.MODEL_MAP[tabType];
            const records = await odooCall(model, 'search_read', [[]], {
                fields: [
                    'display_name', 'employee_id', 'date_close', 'state', 'write_date', 'note',
                    'department_id', 'manager_ids',
                    'x_studio_remarks', 'x_studio_input_hike_percentage', 'x_studio_computed_new_salary', 'x_studio_proposed_designation_1'
                ],
                order: 'write_date desc'
            });

            return {
                success: true,
                data: records,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    fetchAppraisalById: async (tabType: 'self' | 'supervisor' | '360', id: number): Promise<OdooResponse<AppraisalRecord>> => {
        try {
            const model = AppraisalService.MODEL_MAP[tabType];
            const records = await odooCall(model, 'read', [[id]], {
                fields: [
                    'display_name', 'employee_id', 'date_close', 'state', 'write_date', 'note',
                    'department_id', 'manager_ids',
                    'x_studio_remarks', 'x_studio_input_hike_percentage', 'x_studio_computed_new_salary', 'x_studio_proposed_designation_1'
                ]
            });

            if (!records || records.length === 0) throw new Error('Appraisal not found');

            return {
                success: true,
                data: records[0],
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    fetchEmployees: async (search?: string): Promise<OdooResponse<OdooEmployee[]>> => {
        try {
            const domain: any[] = [['active', '=', true]];
            if (search) {
                domain.push(['name', 'ilike', search]);
            }
            // Removed restricted filter to show all employees

            const records = await odooCall('hr.employee', 'search_read', [domain], {
                fields: ['name', 'work_email', 'next_appraisal_date', 'parent_id'],
                order: 'name asc'
            });

            return {
                success: true,
                data: records,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    createAppraisal: async (tabType: 'self' | 'supervisor' | '360', data: any): Promise<OdooResponse<number>> => {
        try {
            const model = AppraisalService.MODEL_MAP[tabType];

            // Basic validation check before Odoo call
            if (!data.employee_id) throw new Error('Employee ID is required.');
            if (!data.display_name) throw new Error('Appraisal Period/Name is required.');

            const id = await odooCall(model, 'create', [data]);

            if (!id) throw new Error('Odoo created the record but returned no ID.');

            return {
                success: true,
                data: id,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            console.error('[AppraisalService] Creation Error:', err);
            return {
                success: false,
                error: err.message || 'Unknown creation error',
                code: err.code || 'DB_INSERT_FAILED',
                syncTime: new Date().toISOString()
            };
        }
    },

    checkDuplicateAppraisal: async (employeeId: number, period: string): Promise<boolean> => {
        try {
            const domain = [
                ['employee_id', '=', employeeId],
                ['display_name', 'ilike', period],
                ['state', 'not in', ['finalized', 'archived', 'cancel']]
            ];
            const records = await odooCall('hr.appraisal', 'search_count', [domain]);
            return records > 0;
        } catch (err) {
            console.error('[AppraisalService] Duplicate Check Error:', err);
            return false; // Default to false but log error
        }
    },

    fetchEmailTemplates: async (): Promise<OdooResponse<any[]>> => {
        try {
            // First try fetching from Supabase (New System)
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .eq('is_active', true);

            if (!error && data && data.length > 0) {
                return {
                    success: true,
                    data: data,
                    syncTime: new Date().toISOString()
                };
            }

            // Fallback to Odoo mail.templates for compatibility
            const templates = await odooCall('mail.template', 'search_read', [[['model_id.model', '=', 'hr.appraisal']]], {
                fields: ['name', 'subject']
            });
            return {
                success: true,
                data: templates || [],
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            console.error('[AppraisalService] Template Fetch Error:', err);
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    saveAppraisalMetadata: async (odooId: number, templateId: number): Promise<string> => {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        try {
            const { error } = await supabase
                .from('appraisal_metadata')
                .upsert({
                    id: odooId,
                    secure_token: token,
                    template_id: templateId,
                    status: 'pending_employee'
                });

            if (error) throw error;
        } catch (err: any) {
            console.warn('[AppraisalService] saveAppraisalMetadata fallback to LocalStorage');
            const storageKey = 'jaago_appraisal_metadata';
            const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
            existing[odooId] = { id: odooId, secure_token: token, template_id: templateId, status: 'pending_employee' };
            localStorage.setItem(storageKey, JSON.stringify(existing));
        }
        return token;
    },

    getAppraisalMetadata: async (odooId: number): Promise<any> => {
        try {
            const { data, error } = await supabase
                .from('appraisal_metadata')
                .select('*')
                .eq('id', odooId)
                .single();

            if (error) throw error;
            return data;
        } catch (err: any) {
            console.warn('[AppraisalService] getAppraisalMetadata fallback to LocalStorage');
            const existing = JSON.parse(localStorage.getItem('jaago_appraisal_metadata') || '{}');
            return existing[odooId] || null;
        }
    },

    saveTestEmail: async (data: any): Promise<void> => {
        const storageKey = 'jaago_test_emails';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newEmail = { ...data, id: Date.now(), status: 'Pending' };
        localStorage.setItem(storageKey, JSON.stringify([newEmail, ...existing]));

        await AppraisalService.logTestAction({
            email: data.receiver_email,
            action_type: 'Sent',
            status: 'Success',
            details: `Test email sent to ${data.employee_name}`
        });
    },

    updateTestEmailStatus: async (token: string, status: string, additionalData: any = {}): Promise<void> => {
        const storageKey = 'jaago_test_emails';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updated = existing.map((email: any) =>
            email.secure_token === token ? { ...email, status, ...additionalData } : email
        );
        localStorage.setItem(storageKey, JSON.stringify(updated));
    },

    logTestAction: async (data: any): Promise<void> => {
        const storageKey = 'jaago_test_activity_logs';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newLog = { ...data, id: Date.now(), timestamp: new Date().toISOString() };
        localStorage.setItem(storageKey, JSON.stringify([newLog, ...existing]));
    },

    getTestActionLogs: async (): Promise<any[]> => {
        return JSON.parse(localStorage.getItem('jaago_test_activity_logs') || '[]');
    },

    saveTestAppraisalLog: async (data: any): Promise<void> => {
        const storageKey = 'jaago_test_submissions';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([{ ...data, id: Date.now() }, ...existing]));
    },

    getTestAppraisalSubmissions: async (): Promise<any[]> => {
        return JSON.parse(localStorage.getItem('jaago_test_submissions') || '[]');
    },

    // --- ACTIVE SYSTEM (PROD) ---
    // Helper to determine if we should fallback to localStorage
    _shouldUseLocalActive: () => {
        // We can check if a flag exists or just rely on try-catch in methods
        return !supabase;
    },

    saveActiveEmail: async (data: any): Promise<void> => {
        try {
            const { error } = await supabase
                .from('active_emails')
                .insert([{ ...data, status: 'Pending' }]);
            if (error) throw error;
        } catch (err: any) {
            console.warn('[AppraisalService] Supabase active_emails failed, falling back to LocalStorage:', err.message);
            const storageKey = 'jaago_active_emails';
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const newEmail = { ...data, status: 'Pending' };
            localStorage.setItem(storageKey, JSON.stringify([newEmail, ...existing]));
        }

        await AppraisalService.logActiveAction({
            email_id: data.id || null,
            email: data.receiver_email,
            action_type: 'Sent',
            status: 'Success',
            details: `Active appraisal email sent to ${data.receiver_name}`
        });
    },

    getActiveEmails: async (): Promise<any[]> => {
        try {
            const { data, error } = await supabase
                .from('active_emails')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (err: any) {
            console.warn('[AppraisalService] getActiveEmails fallback to LocalStorage');
            return JSON.parse(localStorage.getItem('jaago_active_emails') || '[]');
        }
    },

    updateActiveEmailStatus: async (token: string, status: string, additionalData: any = {}): Promise<void> => {
        try {
            const { error } = await supabase
                .from('active_emails')
                .update({ status, ...additionalData })
                .eq('secure_token', token);
            if (error) throw error;
        } catch (err: any) {
            console.warn('[AppraisalService] updateActiveEmailStatus fallback to LocalStorage');
            const storageKey = 'jaago_active_emails';
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const updated = existing.map((email: any) =>
                email.secure_token === token ? { ...email, status, ...additionalData } : email
            );
            localStorage.setItem(storageKey, JSON.stringify(updated));
        }
    },

    logActiveAction: async (data: any): Promise<void> => {
        try {
            const { error } = await supabase
                .from('active_logs')
                .insert([{ ...data, created_at: new Date().toISOString() }]);
            if (error) throw error;
        } catch (err: any) {
            const storageKey = 'jaago_active_logs';
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const newLog = { ...data, id: Date.now(), created_at: new Date().toISOString() };
            localStorage.setItem(storageKey, JSON.stringify([newLog, ...existing]));
        }
    },

    getActiveActionLogs: async (): Promise<any[]> => {
        try {
            const { data, error } = await supabase
                .from('active_logs')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (err: any) {
            return JSON.parse(localStorage.getItem('jaago_active_logs') || '[]');
        }
    },

    saveActiveSubmission: async (data: any): Promise<void> => {
        try {
            const { error } = await supabase
                .from('active_submissions')
                .insert([data]);
            if (error) throw error;
        } catch (err: any) {
            const storageKey = 'jaago_active_submissions';
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            localStorage.setItem(storageKey, JSON.stringify([{ ...data, id: Date.now() }, ...existing]));
        }
    },

    getActiveSubmissions: async (): Promise<any[]> => {
        try {
            const { data, error } = await supabase
                .from('active_submissions')
                .select('*')
                .order('submitted_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (err: any) {
            return JSON.parse(localStorage.getItem('jaago_active_submissions') || '[]');
        }
    },

    deleteActiveLogs: async (): Promise<void> => {
        try {
            const { error } = await supabase
                .from('active_logs')
                .delete()
                .neq('id', 0); // Delete all
            if (error) throw error;
        } catch (err: any) {
            localStorage.removeItem('jaago_active_logs');
        }
    },

    sendAppraisalEmail: async (appraisalId: number, templateId: number, email?: string): Promise<OdooResponse<boolean>> => {
        try {
            const kwargs: any = { force_send: true };
            if (email) {
                kwargs.email_values = { email_to: email };
            }
            const result = await odooCall('mail.template', 'send_mail', [templateId, appraisalId], kwargs);
            return {
                success: true,
                data: !!result,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            console.error('[AppraisalService] Email Send Error:', err);
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    updateAppraisal: async (tabType: 'self' | 'supervisor' | '360', id: number, data: any): Promise<OdooResponse<boolean>> => {
        try {
            const model = AppraisalService.MODEL_MAP[tabType];
            const success = await odooCall(model, 'write', [[id], data]);
            return {
                success: true,
                data: success,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    deleteAppraisal: async (tabType: 'self' | 'supervisor' | '360', id: number): Promise<OdooResponse<boolean>> => {
        try {
            const model = AppraisalService.MODEL_MAP[tabType];
            const success = await odooCall(model, 'unlink', [[id]]);
            return {
                success: true,
                data: success,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    sendEmail: async (to: string, subject: string, body: string, resModel: string, resId: number, cc?: string, bcc?: string): Promise<OdooResponse<number>> => {
        try {
            if (!to) throw new Error('Recipient email address is missing.');

            const emailData = {
                email_from: 'nasif.kamal@jaago.com.bd', // Explicitly set author to avoid server filtering
                email_to: to,
                email_cc: cc,
                email_bcc: bcc,
                subject: subject,
                body_html: body,
                model: resModel,
                res_id: resId,
                auto_delete: false,
                state: 'outgoing'
            };

            const id = await odooCall('mail.mail', 'create', [emailData]);
            if (!id) throw new Error('Failed to create mail.mail record in Odoo.');

            // Explicitly trigger send
            await odooCall('mail.mail', 'send', [[id]]);

            return {
                success: true,
                data: id,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            console.error('[AppraisalService] sendEmail failed:', err.message);
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    fetchEmailLogs: async (type: 'outgoing' | 'incoming'): Promise<OdooResponse<EmailLog[]>> => {
        try {
            const model = type === 'outgoing' ? 'mail.mail' : 'mail.message';
            const domain = type === 'outgoing' ? [] : [['message_type', '=', 'email']];
            const fields = type === 'outgoing'
                ? ['email_to', 'subject', 'date', 'state']
                : ['email_from', 'subject', 'date', 'body'];

            const records = await odooCall(model, 'search_read', [domain], {
                fields,
                limit: 20,
                order: 'date desc'
            });

            const formattedRecords = records.map((r: any) => ({
                id: r.id,
                email_to: r.email_to,
                email_from: r.email_from,
                subject: r.subject || '(No Subject)',
                date: r.date,
                state: r.state,
                body: r.body
            }));

            return {
                success: true,
                data: formattedRecords,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    fetchResponses: async (tabType: 'self' | 'supervisor' | '360'): Promise<OdooResponse<any[]>> => {
        try {
            const model = AppraisalService.RESPONSE_MODEL_MAP[tabType];
            const records = await odooCall(model, 'search_read', [[]], {
                fields: [
                    'employee_id', 'date_close', 'note',
                    'x_studio_remarks', 'x_studio_input_hike_percentage', 'x_studio_computed_new_salary', 'x_studio_proposed_designation_1'
                ],
                order: 'write_date desc'
            });
            return {
                success: true,
                data: records,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    saveEmailTemplate: async (templateData: any, templateId?: number): Promise<OdooResponse<number | boolean>> => {
        try {
            // Save to mail.template model in Odoo
            const data: any = {
                name: templateData.name,
                subject: templateData.subject || `Appraisal: ${templateData.name}`,
                body_html: JSON.stringify(templateData.blocks), // Store blocks as JSON in body
                description: templateData.status || 'published',
                auto_delete: false
            };

            if (!templateId) {
                // If creating, we need to find the model_id for hr.appraisal
                const model_ids = await odooCall('ir.model', 'search', [[['model', '=', 'hr.appraisal']]], { limit: 1 });
                if (model_ids && model_ids.length > 0) {
                    data.model_id = model_ids[0];
                }
                const id = await odooCall('mail.template', 'create', [data]);
                return {
                    success: true,
                    data: id,
                    syncTime: new Date().toISOString()
                };
            } else {
                // If updating
                const success = await odooCall('mail.template', 'write', [[templateId], data]);
                return {
                    success: true,
                    data: success,
                    syncTime: new Date().toISOString()
                };
            }
        } catch (err: any) {
            console.error('[AppraisalService] Save Template Error:', err);
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    fetchEmailTemplatesDetailed: async (): Promise<OdooResponse<any[]>> => {
        try {
            const templates = await odooCall('mail.template', 'search_read', [[['model_id.model', '=', 'hr.appraisal']]], {
                fields: ['name', 'subject', 'body_html', 'description', 'write_date']
            });

            const unescapeHtml = (html: string) => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                return doc.documentElement.textContent || '';
            };

            const formattedTemplates = templates.map((t: any) => {
                let blocks = [];
                let rawBody = t.body_html || '';

                try {
                    // Stage 1: Direct Parse
                    blocks = JSON.parse(rawBody);
                } catch (e) {
                    try {
                        // Stage 2: Handle encoded HTML entities
                        const unescaped = unescapeHtml(rawBody);
                        blocks = JSON.parse(unescaped);
                    } catch (e2) {
                        try {
                            // Stage 3: Handle JSON wrapped in HTML tags
                            const div = document.createElement('div');
                            div.innerHTML = rawBody;
                            const text = div.textContent || div.innerText || '';
                            blocks = JSON.parse(text.trim());
                        } catch (e3) {
                            // Stage 4: If all JSON parsing fails, treat as plain text/HTML
                            console.log(`Template ${t.id} is not JSON, treating as raw content`);
                            blocks = [{
                                id: 'raw-content',
                                type: 'text',
                                content: rawBody,
                                style: { fontSize: '14px', textAlign: 'left', color: '#475569' }
                            }];
                        }
                    }
                }

                if (!Array.isArray(blocks)) {
                    // If it parsed but isn't an array, wrap it
                    blocks = [{
                        id: 'fallback-content',
                        type: 'text',
                        content: typeof blocks === 'string' ? blocks : JSON.stringify(blocks),
                        style: { fontSize: '14px' }
                    }];
                }

                return {
                    id: t.id,
                    name: t.name,
                    subject: t.subject,
                    blocks: blocks,
                    status: t.description || 'published',
                    updated_at: t.write_date
                };
            });

            return {
                success: true,
                data: formattedTemplates,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            console.error('[AppraisalService] Fetch Detailed Templates Error:', err);
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    },

    deleteEmailTemplate: async (templateId: number): Promise<OdooResponse<boolean>> => {
        try {
            const success = await odooCall('mail.template', 'unlink', [[templateId]]);
            return {
                success: true,
                data: success,
                syncTime: new Date().toISOString()
            };
        } catch (err: any) {
            console.error('[AppraisalService] Delete Template Error:', err);
            return {
                success: false,
                error: err.message,
                syncTime: new Date().toISOString()
            };
        }
    }
};
