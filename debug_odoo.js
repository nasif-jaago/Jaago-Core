const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}/jsonrpc`;

async function odooCall(model, method, args = [], kwargs = {}) {
    // Authenticate first
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

    const authRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authBody)
    });
    const authResult = await authRes.json();
    const uid = authResult.result;

    const body = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [
                ODOO_CONFIG.DATABASE,
                uid,
                ODOO_CONFIG.API_KEY,
                model,
                method,
                args,
                kwargs
            ]
        },
        id: 2
    };

    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const result = await response.json();
    return result.result;
}

(async () => {
    try {
        console.log('Fetching fields for hr.appraisal...');
        const fields = await odooCall('hr.appraisal', 'fields_get', [], { attributes: ['string', 'type'] });
        console.log('FIELDS_START');
        console.log(JSON.stringify(fields, null, 2));
        console.log('FIELDS_END');

        console.log('Fetching some records to see data...');
        const records = await odooCall('hr.appraisal', 'search_read', [[]], { limit: 5 });
        console.log('RECORDS_START');
        console.log(JSON.stringify(records, null, 2));
        console.log('RECORDS_END');
    } catch (e) {
        console.error('ERROR:', e);
    }
})();
