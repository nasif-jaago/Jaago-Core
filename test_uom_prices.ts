
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}`;

async function checkPricesAndUoms() {
    const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
    const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
    const authJson = await authRes.json();
    const uid = authJson.result;

    // 1. Check product.product fields
    const fieldsBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'product.product', 'fields_get', [['list_price', 'standard_price', 'uom_id']], { attributes: ['string', 'type'] }]
        },
        id: 2
    };
    const res = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fieldsBody) });
    console.log('Product Price/UoM Fields:', JSON.stringify((await res.json()).result, null, 2));

    // 2. Try fetching UoM list
    const uomBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'uom.uom', 'search_read', [[]], { fields: ['name'], limit: 10 }]
        },
        id: 3
    };
    const uomResFull = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(uomBody) });
    const uomData = await uomResFull.json();
    console.log('UoM Sample Data:', JSON.stringify(uomData.result, null, 2));
    if (uomData.error) console.log('UoM Error:', uomData.error);
}

checkPricesAndUoms();
