const ODOO_CONFIG = {
    DOMAIN: 'https://jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

async function getSelection() {
    try {
        const authRes = await fetch(`${ODOO_CONFIG.DOMAIN}/jsonrpc`, {
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
        const authResult = await authRes.json();
        const uid = authResult.result;

        const fieldsRes = await fetch(`${ODOO_CONFIG.DOMAIN}/jsonrpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
                        [['x_studio_selection_field_5hb_1jbkffh63']],
                        { attributes: ['selection'] }
                    ]
                },
                id: 2
            })
        });
        const fieldsResult = await fieldsRes.json();
        const selection = fieldsResult.result.x_studio_selection_field_5hb_1jbkffh63.selection;
        console.log('Selection Values:', JSON.stringify(selection, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

getSelection();
