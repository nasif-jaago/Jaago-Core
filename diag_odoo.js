
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};
const URL = 'https://' + ODOO_CONFIG.DOMAIN + '/jsonrpc';

async function run() {
    try {
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
        const authRes = await fetch(URL, { method: 'POST', body: JSON.stringify(authBody) });
        const authData = await authRes.json();
        const uid = authData.result;
        console.log('UID:', uid);

        if (!uid) {
            console.error('Auth failed:', authData);
            return;
        }

        async function call(model, method, args) {
            const body = {
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    service: 'object',
                    method: 'execute_kw',
                    args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args]
                },
                id: 2
            };
            const res = await fetch(URL, { method: 'POST', body: JSON.stringify(body) });
            const data = await res.json();
            return data.result;
        }

        const counts = {
            sponsor_tags: await call('res.partner', 'search_count', [[['category_id.name', 'ilike', 'Sponsor']]]),
            donor_tags: await call('res.partner', 'search_count', [[['category_id.name', 'ilike', 'Donor']]]),
            customer_rank: await call('res.partner', 'search_count', [[['customer_rank', '>', 0]]]),
            all: await call('res.partner', 'search_count', [[]])
        };
        console.log('Counts:', counts);

        const cats = await call('res.partner.category', 'search_read', [[], ['name']]);
        console.log('Categories:', cats.map(c => c.name));

    } catch (e) {
        console.error('Error:', e);
    }
}
run();
