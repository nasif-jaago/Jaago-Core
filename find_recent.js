const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

async function odooCall(model, method, args, kwargs = {}) {
    const url = `https://${ODOO_CONFIG.DOMAIN}/jsonrpc`;

    // Auth
    const authBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'common',
            method: 'authenticate',
            args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]
        },
        id: 1
    };

    const authRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authBody)
    });
    const authJson = await authRes.json();
    const uid = authJson.result;

    if (!uid) throw new Error('Auth failed');

    // Call
    const callBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs]
        },
        id: 2
    };

    const callRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callBody)
    });
    const callJson = await callRes.json();
    return callJson.result;
}

async function findRecent() {
    try {
        const result = await odooCall('approval.request', 'search_read', [[]], {
            fields: ['id', 'name', 'reason'],
            limit: 5,
            order: 'create_date DESC'
        });
        console.log('Recent Requests:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

findRecent();
