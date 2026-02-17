const ODOO_CONFIG = {
    DOMAIN: 'jaago-foundation.odoo.com',
    DATABASE: 'odoo-ps-psae-jaago-foundation-main-27208359',
    USER_ID: 'nasif.kamal@jaago.com.bd',
    API_KEY: '196648f5f02338799f445343d48bf0bdeb9083ec'
};

async function odooCall(model, method, args, kwargs = {}) {
    const url = `https://${ODOO_CONFIG.DOMAIN}/jsonrpc`;
    const authBody = { jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [ODOO_CONFIG.DATABASE, ODOO_CONFIG.USER_ID, ODOO_CONFIG.API_KEY, {}] }, id: 1 };
    const authRes = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authBody) });
    const authJson = await authRes.json();
    const uid = authJson.result;
    if (!uid) {
        console.error('Auth failed', authJson);
        return null;
    }
    const callBody = { jsonrpc: '2.0', method: 'call', params: { service: 'object', method: 'execute_kw', args: [ODOO_CONFIG.DATABASE, uid, ODOO_CONFIG.API_KEY, model, method, args, kwargs] }, id: 2 };
    const callRes = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(callBody) });
    const callJson = await callRes.json();
    return callJson.result;
}

async function testConnection() {
    try {
        console.log('--- Testing Requisition Connection with New Fields ---');

        // 1. Create a test requisition
        const testData = {
            name: 'API Connection Test - New Fields',
            category_id: 1, // Assume 1 is a valid category
            date: new Date().toISOString().split('T')[0],
            x_studio_project_code: 'TEST-ACT-001',
            x_studio_reason_for_purchase: 'Testing API connection for custom fields',
            x_studio_delivery_instructions: 'Deliver to Test Lab',
            x_studio_refusal_note: 'Initial Note',
            reason: '<p>Standard Odoo Description/Comments</p>',
            request_owner_id: 2 // Assume 2 is a valid user
        };

        console.log('Creating requisition...');
        const resId = await odooCall('approval.request', 'create', [testData]);

        if (typeof resId === 'number') {
            console.log(`Success! Requisition created with ID: ${resId}`);

            // 2. Read it back to verify fields
            console.log('Verifying fields...');
            const readRes = await odooCall('approval.request', 'read', [[resId], [
                'x_studio_project_code',
                'x_studio_reason_for_purchase',
                'x_studio_delivery_instructions',
                'x_studio_refusal_note',
                'reason'
            ]]);

            if (readRes && readRes.length > 0) {
                const data = readRes[0];
                console.log('Verification Data:', data);

                if (data.x_studio_project_code === testData.x_studio_project_code &&
                    data.x_studio_reason_for_purchase === testData.x_studio_reason_for_purchase &&
                    data.x_studio_delivery_instructions === testData.x_studio_delivery_instructions &&
                    data.x_studio_refusal_note === testData.x_studio_refusal_note) {
                    console.log('TEST PASSED: All custom fields correctly saved and retrieved.');
                } else {
                    console.log('TEST FAILED: Data mismatch found.');
                }
            }

            // 3. Optional: Delete the test record
            // await odooCall('approval.request', 'unlink', [[resId]]);
            // console.log('Cleaned up test record.');

        } else {
            console.error('Failed to create requisition:', resId);
        }

    } catch (e) {
        console.error('Test error:', e);
    }
}

testConnection();
