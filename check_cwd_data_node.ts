// Native fetch used

const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}/jsonrpc`;
let cachedUid: number | null = null;

async function getUid(): Promise<number> {
    if (cachedUid) return cachedUid;
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
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result: any = await response.json();
    cachedUid = result.result;
    return result.result;
}

async function odooCall(model: string, method: string, args: any[] = [], kwargs: any = {}) {
    const uid = await getUid();
    const body = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs]
        },
        id: Math.floor(Math.random() * 1000)
    };
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result: any = await response.json();
    return result.result;
}

async function checkCWDData() {
    try {
        // Products filtering by specific terms
        const productTerms = ['SAC', 'SAC BD', 'SAC UK', 'SAC INC', 'UK', 'INC'];
        const domain = ['|', '|', '|', '|', '|',
            ['name', 'ilike', 'SAC'],
            ['name', 'ilike', 'SAC BD'],
            ['name', 'ilike', 'SAC UK'],
            ['name', 'ilike', 'SAC INC'],
            ['name', 'ilike', 'UK'],
            ['name', 'ilike', 'INC']
        ];

        const products = await odooCall('product.template', 'search_read', [domain], {
            fields: ['name', 'list_price', 'qty_available', 'sales_count'],
            limit: 20
        });
        console.log('--- Filtered Products ---');
        console.log(JSON.stringify(products, null, 2));

        const subscriptions = await odooCall('sale.subscription', 'search_read', [[]], {
            fields: ['name', 'recurring_total', 'stage_id', 'partner_id'],
            limit: 10
        });
        console.log('\n--- Subscriptions ---');
        console.log(JSON.stringify(subscriptions, null, 2));

        const tasks = await odooCall('project.task', 'search_read', [[]], {
            fields: ['name', 'project_id', 'stage_id', 'user_ids'],
            limit: 10
        });
        console.log('\n--- Tasks (CWD Teamwork) ---');
        console.log(JSON.stringify(tasks, null, 2));

        const crm = await odooCall('crm.lead', 'search_read', [[]], {
            fields: ['name', 'expected_revenue', 'stage_id', 'user_id', 'probability'],
            limit: 10
        });
        console.log('\n--- CRM Leads ---');
        console.log(JSON.stringify(crm, null, 2));

        const sales = await odooCall('sale.order', 'search_read', [[]], {
            fields: ['name', 'amount_total', 'user_id', 'state'],
            limit: 10
        });
        console.log('\n--- Sales Orders ---');
        console.log(JSON.stringify(sales, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkCWDData();
