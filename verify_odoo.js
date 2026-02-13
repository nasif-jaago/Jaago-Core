
const ODOO_CONFIG = {
    DOMAIN: 'https://jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

async function odooCall(model, method, args = [], kwargs = {}) {
    const url = `${ODOO_CONFIG.DOMAIN}/jsonrpc`;

    // Auth step
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

    const authRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authBody)
    });
    const authResult = await authRes.json();
    if (authResult.error) throw new Error(JSON.stringify(authResult.error));
    const uid = authResult.result;

    const body = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs]
        },
        id: 2
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result = await res.json();
    return result.result;
}

async function test() {
    console.log("Starting Odoo Connection Test...");
    try {
        const partners = await odooCall('res.partner', 'search_count', [[]]);
        console.log("Total Partners:", partners);

        const projects = await odooCall('project.project', 'search_count', [[]]);
        console.log("Total Projects:", projects);

        const sponsors = await odooCall('res.partner', 'search_count', [[['category_id.name', 'ilike', 'Sponsor']]]);
        console.log("Sponsors (category_id.name):", sponsors);

        // Try alternate sponsor check
        const sponsorAlt = await odooCall('res.partner', 'search_count', [[['category_id', '!=', false]]]);
        console.log("Partners with ANY category:", sponsorAlt);

        const childs = await odooCall('product.template', 'search_count', [[['x_studio_product_for', '=', 'CWD']]]);
        console.log("Childs (CWD):", childs);

        const childsAll = await odooCall('product.template', 'search_count', [[]]);
        console.log("Total Products:", childsAll);

    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

test();
