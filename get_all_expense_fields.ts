import { odooCall } from './src/api/odoo';

async function getAllExpenseFields() {
    try {
        console.log('Fetching all hr.expense fields...');
        const fields = await odooCall('hr.expense', 'fields_get', [], {
            attributes: ['string', 'type', 'required', 'readonly', 'selection']
        });

        console.log('\n--- HR EXPENSE FIELDS ---');
        console.log(JSON.stringify(fields, null, 2));
    } catch (error) {
        console.error('Error fetching fields:', error);
    }
}

getAllExpenseFields();
