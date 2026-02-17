
const ODOO_CONFIG = {
    DOMAIN: 'https://jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

async function main() {
    const authRes = await fetch(ODOO_CONFIG.DOMAIN + '/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'common',
                method: 'authenticate',
                args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]
            },
            id: 1
        })
    });
    const auth = await authRes.json();
    const uid = auth.result;

    const call = (model, method, args, kwargs = {}) => fetch(ODOO_CONFIG.DOMAIN + '/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs]
            },
            id: 2
        })
    }).then(res => res.json()).then(res => res.result);

    const projectFields = await call('project.project', 'fields_get', [[]], { attributes: ['string', 'type', 'relation'] });
    const fieldsToTry = Object.entries(projectFields).filter(([k, v]) => v.type === 'many2one' || v.type === 'selection');

    console.log('--- Grouping Projects by existing fields ---');
    for (const [k, v] of fieldsToTry.slice(0, 20)) {
        const groups = await call('project.project', 'read_group', [[], ['name'], [k]]);
        if (groups && groups.length > 1) { // More than 1 group means it's interesting
            console.log(`${k} (${v.string}): ${groups.length} groups`);
            console.log(groups.slice(0, 3).map(g => `${g[k] || 'None'}: ${g[k + '_count'] || g.__count}`));
        }
    }
}
main();
