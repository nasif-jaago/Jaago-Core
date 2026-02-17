
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = 'https://jaago-foundation.odoo.com';

async function odooCall(model, method, args = [], kwargs = {}) {
    try {
        const authBody = {
            jsonrpc: '2.0',
            method: 'call',
            params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] },
            id: 1
        };
        const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
        const uid = (await authRes.json()).result;
        if (!uid) return { error: 'Auth failed' };
        const body = { jsonrpc: '2.0', method: 'call', params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs] }, id: 2 };
        const response = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const result = await response.json();
        if (result.error) return { error: result.error.data?.message || result.error.message };
        return { result: result.result };
    } catch (e) { return { error: e.message }; }
}

async function testFetch() {
    const fields = ['name', 'display_name'];
    const readRes = await odooCall('uom.uom', 'search_read', [[]], { fields, limit: 1 });
    console.log('Fields Check:', JSON.stringify(readRes, null, 2));
}
testFetch();
