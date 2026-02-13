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

        console.log('Testing hr.appraisal creation with custom fields...');
        const testData = {
            employee_id: 127, // Esha Farooqe from sample
            note: 'TEST APPRAISAL CONTENT FROM AGENT',
            state: '1_new',
            x_studio_proposed_designation_1: 'Assistant Manager',
            x_studio_remarks: 'Excellent performance during test',
            x_studio_input_hike_percentage: 12.5,
            x_studio_computed_new_salary: 45000
        };

        const id = await call('object', 'execute_kw', [
            uid, ODOO_CONFIG.API_KEY,
            'hr.appraisal', 'create',
            [testData]
        ]);
        console.log('Successfully created test appraisal with ID:', id);

        console.log('Verifying the created record...');
        const record = await call('object', 'execute_kw', [
            uid, ODOO_CONFIG.API_KEY,
            'hr.appraisal', 'read',
            [[id]],
            { fields: ['employee_id', 'note', 'x_studio_proposed_designation_1', 'x_studio_remarks', 'x_studio_input_hike_percentage', 'x_studio_computed_new_salary'] }
        ]);
        console.log('Created Record Data:', JSON.stringify(record, null, 2));

        // Note: I won't delete it yet so the user can see it if they check, but normally I would clean up.
        // Actually, let's delete it to keep Odoo clean.
        await call('object', 'execute_kw', [
            uid, ODOO_CONFIG.API_KEY,
            'hr.appraisal', 'unlink',
            [[id]]
        ]);
        console.log('Test record deleted.');

    } catch (error) {
        console.error('Error during test:', error);
    }
}

main();
