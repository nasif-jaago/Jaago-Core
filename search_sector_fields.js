
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
                args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'project.project', 'fields_get', [[]], { attributes: ['string', 'type', 'relation'] }]
            },
            id: 2
        })
    });
    const fields = await callRes.json();
    for (const [k, v] of Object.entries(fields.result)) {
        if (k.includes('sector') || k.includes('category') || k.includes('type')) {
            console.log(`${k}: ${v.string} (${v.type})`);
        }
    }
}
main();
