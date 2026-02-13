const fetch = require('node-fetch');

const ODOO_CONFIG = {
    DOMAIN: 'https://jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

async function getFields() {
    try {
        // Authenticate
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

        const authRes = await fetch(`${ODOO_CONFIG.DOMAIN}/jsonrpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authBody)
        });
        const authResult = await authRes.json();
        const uid = authResult.result;

        if (!uid) {
            console.error('Auth failed:', authResult);
            return;
        }

        // Get fields
        const fieldsBody = {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    ODOO_CONFIG.DATABASE,
                    uid,
                    ODOO_CONFIG.API_KEY,
                    'hr.expense',
                    'fields_get',
                    [],
                    { attributes: ['string', 'type'] }
                ]
            },
            id: 2
        };

        const fieldsRes = await fetch(`${ODOO_CONFIG.DOMAIN}/jsonrpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fieldsBody)
        });
        const fieldsResult = await fieldsRes.json();
        const fields = fieldsResult.result;

        console.log('\n--- STUDIO FIELDS ---');
        Object.keys(fields).filter(f => f.startsWith('x_studio_')).forEach(f => {
            console.log(`${f}: ${fields[f].string} (${fields[f].type})`);
        });

        console.log('\n--- ALL FIELDS (names only) ---');
        console.log(Object.keys(fields).join(', '));

    } catch (error) {
        console.error('Error:', error);
    }
}

getFields();
