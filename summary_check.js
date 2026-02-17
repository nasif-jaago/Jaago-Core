
const ODOO_CONFIG = {
    DOMAIN: 'https://jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

async function odooCall(service, method, args = [], kwargs = {}) {
    const response = await fetch(`${ODOO_CONFIG.DOMAIN}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: { service, method, args, kwargs },
            id: 1
        })
    });
    const result = await response.json();
    return result.result;
}

async function main() {
    try {
        const auth = await odooCall('common', 'authenticate', [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]);
        const call = (model, method, args, kwargs = {}) => odooCall('object', 'execute_kw', [ODOO_CONFIG.DATABASE, auth, ODOO_CONFIG.API_KEY, model, method, args, kwargs]);

        const keywords = ['Education', 'Health', 'Nutrition', 'Protection'];
        for (const kw of keywords) {
            const res = await call('account.analytic.account', 'search_count', [[['name', 'ilike', kw]]]);
            console.log(`${kw} count in analytic accounts: ${res}`);
        }

        const projectCount = await call('project.project', 'search_count', [[]]);
        console.log(`Total projects: ${projectCount}`);

        const projectGroups = await call('project.project', 'read_group', [[], ['name'], ['company_id']]);
        console.log('--- Projects by Company ---');
        console.log(JSON.stringify(projectGroups, null, 2));

    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

main();
