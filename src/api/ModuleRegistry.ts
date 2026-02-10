export interface ModuleConfig {
    id: string;
    name: string;
    model: string;
    listFields: string[];
    displayName: string;
    icon?: any;
    filterDateField?: string;
    domain?: any[];
}

export const MODULE_REGISTRY: Record<string, ModuleConfig> = {
    employees: {
        id: 'employees',
        name: 'Employees',
        model: 'hr.employee',
        displayName: 'Employees',
        listFields: ['name', 'barcode', 'department_id', 'job_id', 'work_email', 'image_128'],
    },
    timeoff: {
        id: 'timeoff',
        name: 'Time Off',
        model: 'hr.leave',
        displayName: 'Time Off Requests',
        listFields: ['employee_id', 'holiday_status_id', 'date_from', 'date_to', 'number_of_days', 'state'],
        filterDateField: 'date_from',
    },
    recruitment: {
        id: 'recruitment',
        name: 'Recruitment',
        model: 'hr.job',
        displayName: 'Job Positions',
        listFields: ['name', 'department_id', 'no_of_recruitment', 'no_of_employee'],
    },
    attendance: {
        id: 'attendance',
        name: 'Attendance',
        model: 'hr.attendance',
        displayName: 'Attendance Logs',
        listFields: [
            'employee_id',
            'check_in',
            'check_out',
            'worked_hours',
            'x_studio_late',
            'x_studio_absent',
            'x_studio_auto_check_out'
        ],
        filterDateField: 'check_in',
    },
    payroll: {
        id: 'payroll',
        name: 'Payroll',
        model: 'hr.payslip',
        displayName: 'Payslips',
        listFields: ['employee_id', 'name', 'date_from', 'date_to', 'state', 'net_wage'],
        filterDateField: 'date_from',
    },
    inventory: {
        id: 'inventory',
        name: 'Inventory',
        model: 'stock.picking',
        displayName: 'Inventory Transfers',
        listFields: ['name', 'location_id', 'location_dest_id', 'partner_id', 'state', 'scheduled_date'],
        filterDateField: 'scheduled_date',
    },
    purchase: {
        id: 'purchase',
        name: 'Purchase',
        model: 'purchase.order',
        displayName: 'Purchase Orders',
        listFields: ['name', 'partner_id', 'date_order', 'amount_total', 'state'],
        filterDateField: 'date_order',
    },
    crm: {
        id: 'crm',
        name: 'CRM',
        model: 'crm.lead',
        displayName: 'Leads & Opportunities',
        listFields: ['name', 'partner_id', 'email_from', 'phone', 'stage_id', 'expected_revenue'],
    },
    projects: {
        id: 'projects',
        name: 'Projects',
        model: 'project.project',
        displayName: 'Projects',
        listFields: ['name', 'user_id', 'partner_id', 'date_start', 'date', 'label_tasks'],
        filterDateField: 'date_start',
    },
    tasks: {
        id: 'tasks',
        name: 'Tasks',
        model: 'project.task',
        displayName: 'Project Tasks',
        listFields: ['name', 'project_id', 'user_ids', 'date_deadline', 'stage_id'],
        filterDateField: 'date_deadline',
    },
    accounting: {
        id: 'accounting',
        name: 'Accounting',
        model: 'account.move',
        displayName: 'Invoices & Bills',
        listFields: ['name', 'partner_id', 'invoice_date', 'amount_total', 'state', 'move_type'],
        filterDateField: 'invoice_date',
    },
    expenses: {
        id: 'expenses',
        name: 'Expenses',
        model: 'hr.expense',
        displayName: 'Expenses',
        listFields: ['name', 'employee_id', 'date', 'total_amount', 'state'],
        filterDateField: 'date',
    },
    appraisals: {
        id: 'appraisals',
        name: 'Appraisals',
        model: 'hr.appraisal',
        displayName: 'Employee Appraisals',
        listFields: ['employee_id', 'department_id', 'date_close', 'state'],
        filterDateField: 'date_close',
    },
    meetingroom: {
        id: 'meetingroom',
        name: 'Meeting Room',
        model: 'calendar.event',
        displayName: 'Meeting Room Bookings',
        listFields: ['name', 'start', 'stop', 'location'],
        filterDateField: 'start',
    },
    helpdesk: {
        id: 'helpdesk',
        name: 'Help Desk',
        model: 'helpdesk.ticket',
        displayName: 'Support Tickets',
        listFields: ['name', 'partner_id', 'user_id', 'priority', 'stage_id'],
    },
    maintenance: {
        id: 'maintenance',
        name: 'Maintenance',
        model: 'maintenance.request',
        displayName: 'Maintenance Requests',
        listFields: ['name', 'user_id', 'equipment_id', 'request_date', 'priority', 'stage_id'],
        filterDateField: 'request_date',
    },
    timesheet: {
        id: 'timesheet',
        name: 'Time Sheets',
        model: 'account.analytic.line',
        displayName: 'Timesheet Entries',
        listFields: ['date', 'employee_id', 'project_id', 'task_id', 'unit_amount'],
        filterDateField: 'date',
    },
    sales: {
        id: 'sales',
        name: 'Sales',
        model: 'sale.order',
        displayName: 'Sales Orders',
        listFields: ['name', 'partner_id', 'date_order', 'amount_total', 'state'],
        filterDateField: 'date_order',
    },
    subscriptions: {
        id: 'subscriptions',
        name: 'Subscriptions',
        model: 'sale.order',
        displayName: 'Recurring Subscriptions',
        listFields: ['name', 'partner_id', 'subscription_state', 'amount_total', 'date_order'],
        filterDateField: 'date_order',
    },
    cwdteamwork: {
        id: 'cwdteamwork',
        name: 'CWD Teamwork',
        model: 'project.task',
        displayName: 'CWD Team Tasks',
        listFields: ['name', 'project_id', 'user_ids', 'stage_id'],
    },
    todos: {
        id: 'todos',
        name: 'To-do',
        model: 'project.task',
        displayName: 'My To-do List',
        listFields: ['name', 'user_ids', 'personal_stage_type_id', 'date_deadline'],
        filterDateField: 'date_deadline',
        domain: [['project_id', '=', false]],
    }
};
