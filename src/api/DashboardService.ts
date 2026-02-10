/**
 * JAAGO Foundation Dashboard Service
 * Handles complex Odoo aggregations for the Executive Overview
 */

import { getCount, fetchRecords } from './odoo';

export interface DashboardFilters {
    companyIds: number[];
    dateRange: {
        start: string;
        end: string;
    };
}

export const DashboardService = {
    /**
     * Strategic Overview KPIs
     */
    async getStrategicKPIs(filters: DashboardFilters) {
        const domain: any[] = [];
        if (filters.companyIds.length > 0) {
            domain.push(['company_id', 'in', filters.companyIds]);
        }

        // Parallel count fetching
        const [projects, employees, partners] = await Promise.all([
            getCount('project.project', domain),
            getCount('hr.employee', [...domain, ['active', '=', true]]),
            getCount('res.partner', [...domain, ['employee', '=', false]])
        ]);

        // Finance Aggregation (simplified for example - in real Odoo would use compute or analytic accounting)
        const moves = await fetchRecords('account.move',
            ['amount_total_signed', 'move_type', 'state'],
            [...domain, ['state', '=', 'posted'], ['date', '>=', filters.dateRange.start], ['date', '<=', filters.dateRange.end]],
            1000
        );

        let revenue = 0;
        let expenses = 0;

        moves.data?.forEach(m => {
            if (m.move_type.includes('out_')) revenue += m.amount_total_signed;
            if (m.move_type.includes('in_')) expenses += Math.abs(m.amount_total_signed);
        });

        return {
            activeProjects: projects,
            totalRevenue: revenue,
            totalExpenses: expenses,
            netSurplus: revenue - expenses,
            employeeCount: employees,
            donorCount: partners,
            growthYOY: 15 // Mocked for now
        };
    },

    /**
     * Financial & Banks
     */
    async getFinancialData(filters: DashboardFilters) {
        const domain: any[] = [];
        if (filters.companyIds.length > 0) {
            domain.push(['company_id', 'in', filters.companyIds]);
        }

        const journals = await fetchRecords('account.journal',
            ['name', 'type', 'balance'],
            [...domain, ['type', 'in', ['bank', 'cash']]],
            20
        );

        let bankBalance = 0;
        journals.data?.forEach(j => bankBalance += j.balance);

        return {
            bankBalance,
            journals: journals.data || []
        };
    },

    /**
     * CRM & Fundraising
     */
    async getFundraisingData(filters: DashboardFilters) {
        const domain: any[] = [];
        if (filters.companyIds.length > 0) {
            domain.push(['company_id', 'in', filters.companyIds]);
        }

        const leadsPromise = fetchRecords('crm.lead', ['name', 'expected_revenue', 'stage_id'], domain, 100);

        // Subscription is integrated into sale.order in v16+
        let subs: any = { success: true, data: [] };
        try {
            const result = await fetchRecords('sale.order', ['amount_total', 'subscription_state'], [...domain, ['is_subscription', '=', true]], 100);
            if (result.success) subs = result;
        } catch (e) {
            console.warn('Subscription fields on sale.order not available');
        }

        const leads = await leadsPromise;

        let pipelineValue = 0;
        leads.data?.forEach(l => pipelineValue += l.expected_revenue || 0);

        let recurringRevenue = 0;
        // In sale.order version, amount_total represents the recurring value
        subs.data?.forEach((s: any) => recurringRevenue += s.amount_total || 0);

        return {
            pipelineValue,
            recurringRevenue,
            leadsCount: leads.data?.length || 0
        };
    },

    /**
     * HR & Payroll
     */
    async getHRData(filters: DashboardFilters) {
        const domain: any[] = [];
        if (filters.companyIds.length > 0) {
            domain.push(['company_id', 'in', filters.companyIds]);
        }

        const [leaves, expenses] = await Promise.all([
            getCount('hr.leave', [...domain, ['state', '=', 'validate']]),
            getCount('hr.expense', [...domain, ['state', '=', 'reported']])
        ]);

        return {
            activeLeaves: leaves,
            pendingExpenses: expenses
        };
    },

    /**
     * Inventory & Operations
     */
    async getInventoryData(filters: DashboardFilters) {
        const domain: any[] = [];
        if (filters.companyIds.length > 0) {
            domain.push(['company_id', 'in', filters.companyIds]);
        }

        const quants = await fetchRecords('stock.quant',
            ['quantity', 'product_id', 'location_id'],
            [...domain, ['quantity', '>', 0]],
            100
        );

        return {
            totalItems: quants.data?.length || 0,
            lowStockCount: 12 // Mocked threshold for demo
        };
    },

    /**
     * Volunteer & Youth Engagement
     */
    async getYouthData(_filters: DashboardFilters) {
        // In Odoo, volunteers are often partners with a specific category or projects
        const [volunteers, hours] = await Promise.all([
            getCount('res.partner', [['category_id.name', 'ilike', 'Volunteer']]),
            fetchRecords('project.task', ['effective_hours'], [['project_id.name', 'ilike', 'Volunteer']], 500)
        ]);

        let totalHours = 0;
        hours.data?.forEach(h => totalHours += h.effective_hours || 0);

        return {
            volunteerCount: volunteers,
            loggedHours: totalHours
        };
    }
};
