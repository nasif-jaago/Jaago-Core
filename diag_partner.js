
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};
const URL = 'https://' + ODOO_CONFIG.DOMAIN + '/jsonrpc';

async function run() {
    try {
        const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
        const authRes = await fetch(URL, { method: 'POST', body: JSON.stringify(authBody) });
        const uid = (await authRes.json()).result;
        if (!uid) { console.error('Auth failed'); return; }

        async function call(model, method, args) {
            const body = { jsonrpc: '2.0', method: 'call', params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args] }, id: 2 };
            const res = await fetch(URL, { method: 'POST', body: JSON.stringify(body) });
            return (await res.json()).result;
        }

        const fields = await call('res.partner', 'fields_get', [[]]);
        const xFields = Object.keys(fields).filter(f => f.startsWith('x_studio'));
        console.log('Studio Fields:', xFields);

        // Check if any field is related to Sponsor
        const sponsorFields = Object.entries(fields).filter(([k, v]) => v.string.toLowerCase().includes('sponsor')).map(([k, v]) => k);
        console.log('Possible Sponsor Fields:', sponsorFields);

        const customerCount = await call('res.partner', 'search_count', [[['customer_rank', '>', 0]]]);
        console.log('Total Customers (Accounting):', customerCount);

    } catch (e) {
        console.error('Error:', e);
    }
}
run();
