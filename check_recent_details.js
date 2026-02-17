
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}/jsonrpc`;
let cachedUid = null;

async function getUid() {
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
    const result = await response.json();
    cachedUid = result.result;
    return result.result;
}

async function odooCall(model, method, args = [], kwargs = {}) {
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
    const result = await response.json();
    return result.result;
}

async function main() {
    try {
        console.log('Fetching details of last 5 requests...');
        const requests = await odooCall('approval.request', 'search_read', [[]], {
            fields: ['name', 'reason', 'x_studio_reason_for_purchase', 'request_status', 'create_date'],
            limit: 5,
            order: 'create_date DESC'
        });
        console.log('Results:', JSON.stringify(requests, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
