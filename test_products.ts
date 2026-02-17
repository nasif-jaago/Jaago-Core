
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}`;

async function odooCall(model: string, method: string, args: any[] = [], kwargs: any = {}) {
    const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
    const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
    const authJson = await authRes.json();
    const uid = authJson.result;
    if (!uid) return;
    const body = { jsonrpc: '2.0', method: 'call', params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs] }, id: 2 };
    const res = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return (await res.json()).result;
}

async function checkCompanies() {
    try {
        const products = await odooCall('product.product', 'search_read', [[['x_studio_product_for', '=', 'Procurement']]], {
            fields: ['name', 'company_id'],
            limit: 5
        });
        console.log('Procurement Products and Companies:', JSON.stringify(products, null, 2));

        const companies = await odooCall('res.company', 'search_read', [[]], { fields: ['name'] });
        console.log('Available Companies:', JSON.stringify(companies, null, 2));

        const itProducts = await odooCall('product.product', 'search_count', [[['x_studio_product_for', '=', 'IT']]]);
        console.log('IT Products Count:', itProducts);

        const adminProducts = await odooCall('product.product', 'search_count', [[['x_studio_product_for', '=', 'ADMIN']]]);
        console.log('ADMIN Products Count:', adminProducts);

    } catch (e) { console.error(e); }
}

checkCompanies();
