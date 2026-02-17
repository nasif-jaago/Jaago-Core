
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

        console.log('--- Searching for "Education" in project tags ---');
        const tags = await call('project.tags', 'search_read', [[['name', 'ilike', 'Education']]], {});
        console.log('Project Tags:', tags);

        console.log('--- Searching for "Education" in departments ---');
        const depts = await call('hr.department', 'search_read', [[['name', 'ilike', 'Education']]], {});
        console.log('Departments:', depts);

        console.log('--- Searching for "Education" in analytic accounts ---');
        const analytics = await call('account.analytic.account', 'search_read', [[['name', 'ilike', 'Education']]], {});
        console.log('Analytic Accounts (sample):', analytics.slice(0, 3));

        console.log('--- Checking read_group on project.project for ALL many2one fields ---');
        const fields = await call('project.project', 'fields_get', [[]], { attributes: ['type', 'string', 'relation'] });
        const m2oFields = Object.entries(fields).filter(([k, v]) => v.type === 'many2one' && !k.includes('id') && !k.startsWith('message') && !k.startsWith('activity'));

        for (const [k, v] of m2oFields) {
            console.log(`Grouping by ${k} (${v.string})...`);
            const groups = await call('project.project', 'read_group', [[], ['name'], [k]]);
            if (groups && groups.length > 0) {
                console.log(`  Found ${groups.length} groups for ${k}`);
                console.log(`  Sample:`, groups.slice(0, 2));
            }
        }

    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

main();
