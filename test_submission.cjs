
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};
const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}`;

async function testSubmit() {
    try {
        const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
        const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
        const uid = (await authRes.json()).result;

        if (!uid) return;

        const call = async (model, method, args, kwargs = {}) => {
            const res = await fetch(`${BASE_URL}/jsonrpc`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs] },
                    id: Math.random()
                })
            });
            return await res.json();
        };

        const payload = {
            name: "TEST REQUISITION - " + new Date().toISOString(),
            request_owner_id: uid,
            category_id: 13, // Company 1
            company_id: 1,
            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            x_studio_reason_for_purchase: "Automated test submission - Company 1 (Admin PR's)",
            x_studio_projects_name: 7,
            x_studio_project_code: "TEST-C1-V2",
            product_line_ids: [
                [0, 0, {
                    product_id: 50815, // Company 1
                    x_studio_product_description: "Test product line",
                    product_uom_id: 1,
                    quantity: 5,
                    x_studio_per_unit_price: 100,
                    x_studio_estimated_price: 500,
                    company_id: 1
                }]
            ]
        };

        console.log('Attempting to create requisition (Company 1, Cat 13)...');
        const createRes = await call('approval.request', 'create', [payload]);

        if (createRes.error) {
            console.error('CREATE ERROR:', JSON.stringify(createRes.error, null, 2));
            return;
        }

        const requestId = createRes.result;
        console.log('Requisition created with ID:', requestId);

        console.log('Attempting to confirm (submit) requisition...');
        const confirmRes = await call('approval.request', 'action_confirm', [[requestId]]);

        if (confirmRes.error) {
            console.error('CONFIRM ERROR:', JSON.stringify(confirmRes.error, null, 2));
        } else {
            console.log('Requisition confirmed successfully');
        }

    } catch (e) {
        console.error('CRASH:', e.message);
    }
}

testSubmit();
