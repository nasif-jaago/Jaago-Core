import https from 'https';

const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

function odooRequest(body) {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: ODOO_CONFIG.DOMAIN,
            path: '/jsonrpc',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    try {
        const authRes = await odooRequest({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'common',
                method: 'authenticate',
                args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]
            },
            id: 1
        });
        const uid = authRes.result;

        const fieldsRes = await odooRequest({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    ODOO_CONFIG.DATABASE,
                    uid,
                    ODOO_CONFIG.API_KEY,
                    'hr.appraisal',
                    'fields_get',
                    [],
                    { attributes: ['string'] }
                ]
            },
            id: 2
        });

        const names = Object.keys(fieldsRes.result).sort();
        console.log(names.join('\n'));
    } catch (e) {
        console.error(e);
    }
})();
