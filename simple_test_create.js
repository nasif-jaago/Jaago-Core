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

        console.log('Testing hr.appraisal creation (no delete)...');
        const testData = {
            employee_id: 127, // Esha Farooqe
            note: 'TEST APPRAISAL FROM CODE',
            state: '1_new',
            x_studio_proposed_designation_1: 'Manager Test',
            x_studio_remarks: 'Testing connection process',
            x_studio_input_hike_percentage: 5.0,
            x_studio_computed_new_salary: 42000
        };

        const id = await call('object', 'execute_kw', [
            uid, ODOO_CONFIG.API_KEY,
            'hr.appraisal', 'create',
            [testData]
        ]);
        console.log('ID:', id);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
