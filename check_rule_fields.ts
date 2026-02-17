
const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};
const BASE_URL = `https://${ODOO_CONFIG.DOMAIN}`;
import * as fs from 'fs';

async function test() {
    const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
    const authRes = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
    const authJson = await authRes.json();
    const uid = authJson.result;

    // 1. Get project.project fields
    const body = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'project.project', 'fields_get', [], { attributes: ['string', 'type'] }]
        },
        id: 2
    };
    const res = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await res.json();
    const fields = result.result;

    // Filter studio fields and standard ones
    const lines: string[] = [];
    for (const [name, info] of Object.entries(fields)) {
        const f = info as any;
        if (name.includes('studio') || name === 'name' || name === 'display_name' || name === 'company_id' || name === 'active') {
            lines.push(`${name} | ${f.type} | ${f.string}`);
        }
    }
    fs.writeFileSync('project_fields.txt', lines.join('\n'));
    console.log('Wrote', lines.length, 'relevant fields');

    // 2. Search projects with basic fields only
    const body2 = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            service: 'object',
            method: 'execute_kw',
            args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, 'project.project', 'search_read', [
                [['name', 'ilike', 'DASRA']]
            ], {
                fields: ['name', 'display_name', 'company_id', 'active'],
                limit: 10
            }]
        },
        id: 3
    };
    const res2 = await fetch(`${BASE_URL}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body2) });
    const result2 = await res2.json();
    console.log('DASRA projects:', JSON.stringify(result2.result, null, 2));
}

test();
