import { odooCall } from './src/api/odoo.ts';

async function getAllExpenseFields() {
    try {
        console.log('Fetching all hr.expense fields...');
        const fields = await odooCall('hr.expense', 'fields_get', [], {
            attributes: ['string', 'type', 'required', 'readonly', 'selection']
        });

        console.log('\n--- HR EXPENSE FIELDS ---');
        const studioFields = Object.keys(fields).filter(f => f.startsWith('x_studio_'));
        studioFields.forEach(f => {
            console.log(`${f}: ${fields[f].string} (${fields[f].type})`);
        });
    } catch (error) {
        console.error('Error fetching fields:', error);
    }
}

getAllExpenseFields();
