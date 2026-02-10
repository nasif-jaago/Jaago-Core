import { odooCall } from './src/api/odoo';

async function checkModels() {
    try {
        console.log('Checking approval.request...');
        const approvalFields = await odooCall('approval.request', 'fields_get', [], { attributes: ['string', 'type', 'name'] });
        console.log('approval.request fields:', Object.keys(approvalFields));

        console.log('\nChecking hr.expense...');
        const expenseFields = await odooCall('hr.expense', 'fields_get', [], { attributes: ['string', 'type', 'name'] });
        console.log('hr.expense fields:', Object.keys(expenseFields));

    } catch (error) {
        console.error('Error checking models:', error);
    }
}

checkModels();
