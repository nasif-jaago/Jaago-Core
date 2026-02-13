const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const url = `https://${ODOO_CONFIG.DOMAIN}/jsonrpc`;

async function call(service, method, args) {
    const body = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service,
            method,
            args: [ODOO_CONFIG.DATABASE, ...args]
        },
        id: Math.floor(Math.random() * 1000)
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result = await response.json();
    if (result.error) throw new Error(JSON.stringify(result.error));
    return result.result;
}

async function main() {
    try {
        const uid = await call('common', 'authenticate', [ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]);

        console.log('Searching for models with assessment/evaluation...');
        const models = await call('object', 'execute_kw', [
            uid, ODOO_CONFIG.API_KEY,
            'ir.model', 'search_read',
            [['|', ['model', 'ilike', 'assessment'], ['model', 'ilike', 'evaluation']]],
            { fields: ['model', 'name'] }
        ]);
        console.log('Related Models:', JSON.stringify(models, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
