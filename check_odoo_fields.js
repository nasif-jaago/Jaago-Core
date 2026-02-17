
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = 'https://jaago-foundation.odoo.com';

async function odooCall(model, method, args = [], kwargs = {}) {
    try {
        const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
        const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
        const uid = (await authRes.json()).result;
        if (!uid) return { error: 'Auth failed' };
        const body = { jsonrpc: '2.0', method: 'call', params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs] }, id: 2 };
        const response = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const result = await response.json();
        return { result: result.result, error: result.error };
    } catch (e) { return { error: e.message }; }
}

async function checkFields() {
    console.log('Checking fields for approval.product.line...');
    const res = await odooCall('approval.product.line', 'fields_get', [], { attributes: ['string', 'type', 'required'] });
    if (res.error) {
        console.error('Error:', res.error);
    } else {
        console.log('Fields:', Object.keys(res.result).sort());
        // Also check approval.request fields to be sure about product_line_ids
        console.log('\nChecking fields for approval.request...');
        const reqFields = await odooCall('approval.request', 'fields_get', [], { attributes: ['string', 'type'] });
        console.log('Request Fields:', Object.keys(reqFields.result).sort());
    }
}
checkFields();
