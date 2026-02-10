import { odooCall } from './odoo';

export const fetchProcurementStats = async () => {
    try {
        // Fetch Purchase Orders
        const pos = await odooCall('purchase.order', 'search_read', [[]], {
            fields: ['amount_total', 'partner_id', 'date_order', 'state']
        });

        // Fetch Inventory Transfers
        const inventory = await odooCall('stock.picking', 'search_read', [[]], {
            fields: ['state', 'scheduled_date']
        });

        // Fetch Meeting Rooms
        const meetings = await odooCall('calendar.event', 'search_read', [[]], {
            fields: ['start', 'stop', 'location']
        });

        // Fetch Maintenance Requests
        const maintenance = await odooCall('maintenance.request', 'search_read', [[]], {
            fields: ['state', 'priority']
        });

        return {
            success: true,
            data: {
                purchaseOrders: pos,
                inventory,
                meetings,
                maintenance
            }
        };
    } catch (error: any) {
        console.error('Error fetching procurement stats:', error);
        return { success: false, error: error.message };
    }
};
