
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}`;

async function checkCompanyAndProductList() {
    const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
    const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
    const authJson = await authRes.json();
    const uid = authJson.result;

    // 1. Check A4 products with company info
    const callArgs = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'product.product', 'search_read', [[['name', 'ilike', 'A4']]], { fields: ['name', 'company_id'], limit: 5 }]
        },
        id: 2
    };

    const res = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(callArgs) });
    const data = await res.json();
    console.log('A4 Products Company Info:', JSON.stringify(data.result, null, 2));

    // 2. Fetch "default base product list" (e.g. first 20 products)
    const callArgs2 = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'product.product', 'search_read', [[['active', '=', true]]], { fields: ['name', 'x_studio_product_for'], limit: 20 }]
        },
        id: 3
    };
    const res2 = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(callArgs2) });
    const data2 = await res2.json();
    console.log('Sample Base Products:', JSON.stringify(data2.result, null, 2));
}

checkCompanyAndProductList();
