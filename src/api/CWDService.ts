import { odooCall } from './odoo';

export const fetchCWDStats = async () => {
    try {
        // 1. Products (SAC, SAC BD, SAC UK, SAC INC, UK, INC)
        const productDomain = ['|', '|', '|', '|', '|',
            ['name', 'ilike', 'SAC'],
            ['name', 'ilike', 'SAC BD'],
            ['name', 'ilike', 'SAC UK'],
            ['name', 'ilike', 'SAC INC'],
            ['name', 'ilike', 'UK'],
            ['name', 'ilike', 'INC']
        ];
        const products = await odooCall('product.template', 'search_read', [productDomain], {
            fields: ['name', 'list_price', 'qty_available', 'sales_count']
        });

        // 2. Subscriptions (Active Recurring Orders)
        let subscriptions = [];
        try {
            subscriptions = await odooCall('sale.order', 'search_read', [[['is_subscription', '=', true]]], {
                fields: ['name', 'amount_total', 'subscription_state', 'partner_id']
            });
        } catch (e) {
            console.warn('Subscription fields not found on sale.order, skipping subscription data');
        }

        // 3. CRM Leads & Opportunities
        const crmData = await odooCall('crm.lead', 'search_read', [[]], {
            fields: ['name', 'expected_revenue', 'stage_id', 'user_id', 'probability']
        });

        // 4. Sales Orders
        const salesData = await odooCall('sale.order', 'search_read', [[]], {
            fields: ['name', 'amount_total', 'user_id', 'state', 'date_order'],
            limit: 100
        });

        // 5. CWD Teamwork (Tasks)
        const tasks = await odooCall('project.task', 'search_read', [[]], {
            fields: ['name', 'project_id', 'stage_id', 'user_ids'],
            limit: 50
        });

        // 6. Invoices (account.move)
        const invoices = await odooCall('account.move', 'search_read', [[['move_type', '=', 'out_invoice']]], {
            fields: ['name', 'invoice_user_id', 'state', 'partner_id', 'invoice_date', 'amount_total', 'amount_residual'],
            limit: 100
        });

        return {
            success: true,
            data: {
                products,
                subscriptions,
                crm: crmData,
                sales: salesData,
                tasks,
                invoices
            }
        };
    } catch (error: any) {
        console.error('Error fetching CWD stats:', error);
        return { success: false, error: error.message };
    }
};
