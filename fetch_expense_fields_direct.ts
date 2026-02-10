const ODOO_CONFIG = {
    DOMAIN: 'https://jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

async function getUid() {
    const response = await fetch(`${ODOO_CONFIG.DOMAIN}/jsonrpc`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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
    const result = await response.json();
    return result.result;
}

async function getFields() {
    try {
        const uid = await getUid();
        const response = await fetch(`${ODOO_CONFIG.DOMAIN}/jsonrpc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
                        [],
                        { attributes: ['string', 'type', 'selection', 'required', 'readonly', 'help'] }
                    ]
                },
                id: 2
            })
        });
        const result = await response.json();
        console.log('FIELDS_START');
        console.log(JSON.stringify(result.result, null, 2));
        console.log('FIELDS_END');
    } catch (error) {
        console.error('Error:', error);
    }
}

getFields();
