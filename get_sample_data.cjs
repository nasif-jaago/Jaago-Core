
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};
const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}`;

async function getSampleData() {
    try {
        const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
        const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
        const authJson = await authRes.json();
        const uid = authJson.result;

        if (!uid) { console.log('Auth failed'); return; }

        const call = async (model, method, args, kwargs = {}) => {
            const res = await fetch(`${BASE_URL}/jsonrpc`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs] },
                    id: Math.random()
                })
            });
            const json = await res.json();
            return json.result;
        };

        const categories = await call('approval.category', 'search_read', [[]], { fields: ['name'], limit: 1 });
        const products = await call('product.product', 'search_read', [[['active', '=', true]]], { fields: ['name', 'uom_id'], limit: 1 });
        const users = await call('res.users', 'read', [[uid]], { fields: ['company_id'] });
        const projects = await call('project.project', 'search_read', [[]], { fields: ['name'], limit: 1 });

        console.log(JSON.stringify({
            category: categories?.[0],
            product: products?.[0],
            user: users?.[0],
            project: projects?.[0]
        }, null, 2));
    } catch (e) {
        console.error(e);
    }
}

getSampleData();
