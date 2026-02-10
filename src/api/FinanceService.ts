import { odooCall } from './odoo';

export const fetchFinanceStats = async () => {
    try {
        // 1. Fetch Invoices (Customer)
        const invoices = await odooCall('account.move', 'search_read', [[['move_type', '=', 'out_invoice']]], {
            fields: ['name', 'state', 'invoice_date', 'amount_total', 'amount_residual', 'partner_id', 'invoice_user_id']
        });

        // 2. Fetch Bills (Vendor)
        const bills = await odooCall('account.move', 'search_read', [[['move_type', '=', 'in_invoice']]], {
            fields: ['name', 'state', 'invoice_date', 'amount_total', 'amount_residual', 'partner_id']
        });

        // 3. Fetch Payments
        const payments = await odooCall('account.payment', 'search_read', [[]], {
            fields: ['name', 'payment_type', 'amount', 'state', 'date', 'partner_id', 'journal_id']
        });

        // 4. Fetch Journals
        const journals = await odooCall('account.journal', 'search_read', [[]], {
            fields: ['name', 'type', 'code']
        });

        // 5. Fetch Aging Data (Optional, but let's sum up current/overdue)
        // For a true dashboard, we'd need more complex queries, but we can aggregate moves here.

        return {
            success: true,
            data: {
                invoices,
                bills,
                payments,
                journals
            }
        };
    } catch (error: any) {
        console.error('Error fetching finance stats:', error);
        return { success: false, error: error.message };
    }
};
