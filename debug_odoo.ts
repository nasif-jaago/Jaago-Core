
import { odooCall, getCount } from './src/api/odoo';

async function testConnection() {
    console.log("Testing Odoo Connection...");
    try {
        const count = await getCount('res.partner', []);
        console.log("Partner Count:", count);

        const projectCount = await getCount('project.project', []);
        console.log("Project Count:", projectCount);

        const childCount = await getCount('product.template', [['x_studio_product_for', '=', 'CWD']]);
        console.log("Child Count (CWD):", childCount);

        const childCountSAC = await getCount('product.template', [['x_studio_product_for', '=', 'SAC']]);
        console.log("Child Count (SAC):", childCountSAC);

    } catch (err) {
        console.error("Odoo Connection failed:", err);
    }
}

testConnection();
