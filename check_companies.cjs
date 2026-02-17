
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};
const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}`;

async function checkCompanies() {
    try {
        const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
        const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
        const uid = (await authRes.json()).result;

        const call = async (model, method, args, kwargs = {}) => {
            const res = await fetch(`${BASE_URL}/jsonrpc`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs] },
                    id: Math.random()
                })
            });
            return (await res.json()).result;
        };

        const cat = await call('approval.category', 'read', [[3]], { fields: ['company_id'] });
        const proj = await call('project.project', 'read', [[7]], { fields: ['company_id'] });
        const prod = await call('product.product', 'read', [[50815]], { fields: ['company_id'] });

        console.log(JSON.stringify({
            category: cat[0],
            project: proj[0],
            product: prod[0]
        }, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkCompanies();
