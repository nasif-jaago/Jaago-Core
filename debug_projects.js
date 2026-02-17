
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
    if (result.error) throw new Error(JSON.stringify(result.error));
    return result.result;
}

async function main() {
    try {
        const uid = await odooCall('common', 'authenticate', [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]);
        const call = (model, method, args, kwargs = {}) => odooCall('object', 'execute_kw', [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs]);

        const projects = await call('project.project', 'search_read', [[]], { limit: 10 });
        console.log('--- Project Names & Fields ---');
        projects.forEach(p => {
            console.log(`- Project: ${p.name}`);
            const fieldsWithValue = Object.entries(p).filter(([k, v]) => v && (String(v).includes('Education') || String(v).includes('Health') || String(v).includes('Nutrition')));
            if (fieldsWithValue.length > 0) {
                console.log('  Fields containing sectors:', fieldsWithValue);
            }
        });

        const tags = await call('project.tags', 'search_read', [[]], { limit: 20 });
        console.log('--- Project Tags ---');
        console.log(tags.map(t => t.name));

    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

main();
