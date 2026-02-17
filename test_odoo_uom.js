
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
            params: {
                service: 'common',
                method: 'authenticate',
                args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]
            },
            id: Math.floor(Math.random() * 1000)
        };

        const authRes = await fetch(`${BASE_URL}/jsonrpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authBody)
        });
        const authResult = await authRes.json();
        const uid = authResult.result;

        if (!uid) {
            return { error: 'Auth failed' };
        }

        const body = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    ODOO_CONFIG.DATABASE,
                    uid,
                    ODOO_CONFIG.API_KEY,
                    model,
                    method,
                    args,
                    kwargs
                ]
            },
            id: Math.floor(Math.random() * 1000)
        };

        const response = await fetch(`${BASE_URL}/jsonrpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const result = await response.json();
        if (result.error) return { error: result.error.data?.message || result.error.message };
        return { result: result.result };
    } catch (e) {
        return { error: e.message };
    }
}

async function testUoM() {
    console.log('Testing UoM models...');

    const countRes = await odooCall('uom.uom', 'search_count', [[]]);
    if (countRes.error) {
        console.log('uom.uom count error:', countRes.error);
    } else {
        console.log('uom.uom count:', countRes.result);
        const readRes = await odooCall('uom.uom', 'search_read', [[]], { fields: ['name'], limit: 5 });
        if (readRes.error) {
            console.log('uom.uom read error:', readRes.error);
        } else {
            console.log('uom.uom samples:', JSON.stringify(readRes.result, null, 2));
        }
    }

    const countRes2 = await odooCall('product.uom', 'search_count', [[]]);
    if (countRes2.error) {
        console.log('product.uom count error:', countRes2.error);
    } else {
        console.log('product.uom count:', countRes2.result);
        const readRes2 = await odooCall('product.uom', 'search_read', [[]], { fields: ['name'], limit: 5 });
        if (readRes2.error) {
            console.log('product.uom read error:', readRes2.error);
        } else {
            console.log('product.uom samples:', JSON.stringify(readRes2.result, null, 2));
        }
    }
}

testUoM();
