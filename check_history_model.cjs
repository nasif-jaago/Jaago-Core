
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};
const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}`;

async function checkModel() {
    try {
        const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
        const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
        const uid = (await authRes.json()).result;

        const res = await fetch(`${BASE_URL}/jsonrpc`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'ir.model', 'search_count', [[['model', '=', 'approval.approver.history']]]] },
                id: 2
            })
        });
        const count = (await res.json()).result;
        console.log('Model approval.approver.history count:', count);

        const res2 = await fetch(`${BASE_URL}/jsonrpc`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'ir.model', 'search_count', [[['model', '=', 'approval.history']]]] },
                id: 3
            })
        });
        console.log('Model approval.history count:', (await res2.json()).result);

        const res3 = await fetch(`${BASE_URL}/jsonrpc`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'approval.request', 'fields_get', [['approval_history_ids']], { attributes: ['relation'] }] },
                id: 4
            })
        });
        const fieldInfo = (await res3.json()).result;
        console.log('approval_history_ids relation:', fieldInfo?.approval_history_ids?.relation);

    } catch (e) {
        console.error(e);
    }
}

checkModel();
