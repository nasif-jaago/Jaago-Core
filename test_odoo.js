// Global fetch is used

const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

const BASE_URL = 'https://jaago-foundation.odoo.com';

async function getUid() {
    const url = `${BASE_URL}/jsonrpc`;
    const body = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'common',
            method: 'authenticate',
            args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}]
        },
        id: 1
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result = await response.json();
    return result.result;
}

async function odooCall(model, method, args = [], kwargs = {}) {
    const uid = await getUid();
    const url = `${BASE_URL}/jsonrpc`;
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

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const result = await response.json();
    return result.result;
}

async function main() {
    try {
        const fields = await odooCall('project.project', 'fields_get', [[]], { attributes: ['string', 'type', 'selection'] });
        console.log('--- Fields containing sector ---');
        console.log(Object.keys(fields).filter(k => k.toLowerCase().includes('sector')));

        console.log('--- Fields containing category ---');
        console.log(Object.keys(fields).filter(k => k.toLowerCase().includes('category')));

        console.log('--- Sample Projects ---');
        const projects = await odooCall('project.project', 'search_read', [[]], { fields: ['name', 'tag_ids', 'company_id'], limit: 5 });
        console.log(JSON.stringify(projects, null, 2));

        if (projects[0] && projects[0].tag_ids) {
            console.log('--- Tag details ---');
            const tags = await odooCall('project.tags', 'search_read', [[['id', 'in', projects[0].tag_ids]]], { fields: ['name'] });
            console.log(tags);
        }
    } catch (e) {
        console.error(e);
    }
}

main();
