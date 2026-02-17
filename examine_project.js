
const ODOO_CONFIG = {
    DOMAIN: 'https://jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

async function main() {
    const authRes = await fetch(ODOO_CONFIG.DOMAIN + '/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'common',
                method: 'authenticate',
                args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]
            },
            id: 1
        })
    });
    const auth = await authRes.json();
    const uid = auth.result;

    const callRes = await fetch(ODOO_CONFIG.DOMAIN + '/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'project.project', 'search_read', [[['id', '=', 91]]], {}]
            },
            id: 2
        })
    });
    const res = await callRes.json();
    const p = res.result[0];
    console.log('--- Fields with values ---');
    if (p) {
        Object.entries(p).filter(([k, v]) => v !== false && v !== null && (!Array.isArray(v) || v.length > 0)).forEach(([k, v]) => {
            console.log(`${k}: ${JSON.stringify(v)}`);
        });
    }
}
main();
