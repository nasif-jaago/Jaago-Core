import { odooCall } from './odoo';

export const fetchSettingsStats = async () => {
    try {
        // 1. Fetch Groups first to map IDs to Names (Apps Access)
        const groups = await odooCall('res.groups', 'search_read', [[]], {
            fields: ['name', 'full_name'],
            limit: 500
        });

        // 2. Fetch Users with basic available fields
        const users = await odooCall('res.users', 'search_read', [[]], {
            fields: ['name', 'login', 'active', 'share', 'company_id'],
            limit: 100
        });

        // Add empty app_names array for UI compatibility
        users.forEach((u: any) => {
            u.app_names = [];
            u.groups_id = [];
        });

        // 3. Fetch Modules
        const modules = await odooCall('ir.module.module', 'search_read', [[['state', '=', 'installed']]], {
            fields: ['name', 'shortdesc', 'author', 'website'],
            limit: 10
        });

        // 4. Fetch Companies
        const companies = await odooCall('res.company', 'search_read', [[]], {
            fields: ['name', 'email', 'phone', 'zip', 'city', 'country_id'],
            limit: 100
        });

        return {
            success: true,
            data: {
                users,
                groups,
                modules,
                companies
            }
        };
    } catch (error: any) {
        console.error('Error fetching settings stats:', error);
        return { success: false, error: error.message };
    }
};

export const inviteUser = async (name: string, login: string) => {
    try {
        const result = await odooCall('res.users', 'create', [{
            name,
            login
        }]);
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
