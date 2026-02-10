import { odooCall } from './src/api/odoo';

async function checkProducts() {
    try {
        const products = await odooCall('product.template', 'search_read', [[]], {
            fields: ['name', 'list_price', 'categ_id', 'type'],
            limit: 50
        });
        console.log('--- Products ---');
        console.log(JSON.stringify(products, null, 2));

        const subscriptions = await odooCall('sale.subscription', 'search_read', [[]], {
            fields: ['name', 'partner_id', 'recurring_next_date', 'recurring_total', 'stage_id'],
            limit: 10
        });
        console.log('\n--- Subscriptions ---');
        console.log(JSON.stringify(subscriptions, null, 2));

        const sales = await odooCall('sale.order', 'search_read', [[]], {
            fields: ['name', 'partner_id', 'amount_total', 'user_id', 'state'],
            limit: 10
        });
        console.log('\n--- Sales ---');
        console.log(JSON.stringify(sales, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkProducts();
