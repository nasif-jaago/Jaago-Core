
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = 'https://jaago-foundation.odoo.com';

async function getUid() {
    const url = `${BASE_URL}/jsonrpc`;
    const body = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'common',
            method: 'authenticate',
            args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]
        },
        id: 1
    };
    const response = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    const res = await response.json();
    return res.result;
}

async function odooCall(model, method, args = [], kwargs = {}) {
    const uid = await getUid();
    const url = `${BASE_URL}/jsonrpc`;
    const body = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs]
        },
        id: 2
    };
    const response = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    const res = await response.json();
    return res.result;
}

async function run() {
    try {
        const fields = await odooCall('hr.expense', 'fields_get', [['x_studio_selection_field_5hb_1jbkffh63']], { attributes: ['selection'] });
        console.log(JSON.stringify(fields['x_studio_selection_field_5hb_1jbkffh63'].selection, null, 2));
    } catch (e) { console.error(e); }
}

run();
