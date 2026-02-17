
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};
const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}`;
const fs = require('fs');

async function checkFields() {
    try {
        const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
        const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
        const authJson = await authRes.json();
        const uid = authJson.result;

        if (!uid) {
            console.log('Auth failed');
            return;
        }

        const body = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'approval.request', 'fields_get', [], { attributes: ['string', 'type', 'relation'] }]
            },
            id: 2
        };
        const res = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const result = await res.json();
        const fields = result.result;

        const interesting = [
            'name', 'request_owner_id', 'category_id', 'request_status', 'date',
            'x_studio_projects_name', 'x_studio_project_code', 'x_studio_total_amount',
            'product_line_ids', 'x_studio_departmentproject_name'
        ];

        const results = {};
        for (const name of interesting) {
            results[name] = fields[name] || 'MISSING';
        }
        fs.writeFileSync('requisition_fields_final.json', JSON.stringify(results, null, 2));
        console.log('Done');
    } catch (e) {
        console.error(e);
    }
}

checkFields();
