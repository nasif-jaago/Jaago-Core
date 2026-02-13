import { odooCall } from './odoo';

export interface EmailLog {
    id: number;
    subject: string;
    email_to: string;
    email_from: string;
    state: 'outgoing' | 'sent' | 'received' | 'exception' | 'cancel';
    date: string;
    body_html: string;
    author_id: [number, string] | false;
    model: string;
    res_id: number;
    record_company_id: [number, string] | false;
}

export const fetchEmailLogs = async (domain: any[] = [], limit: number = 80) => {
    try {
        const fields = [
            'subject',
            'email_to',
            'email_from',
            'state',
            'date',
            'body_html',
            'author_id',
            'model',
            'res_id',
            'record_company_id'
        ];

        const logs = await odooCall('mail.mail', 'search_read', [domain], {
            fields,
            limit,
            order: 'date desc'
        });

        return {
            success: true,
            data: logs as EmailLog[],
            syncTime: new Date().toISOString()
        };
    } catch (error: any) {
        console.error('Error fetching email logs:', error);
        return { success: false, error: error.message, syncTime: new Date().toISOString() };
    }
};

export const fetchCompanies = async () => {
    try {
        const companies = await odooCall('res.company', 'search_read', [[]], {
            fields: ['name']
        });
        return { success: true, data: companies };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
