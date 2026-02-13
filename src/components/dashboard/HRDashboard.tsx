import React, { useEffect, useState } from 'react';
import { fetchRecords, getCount, fetchCompanies } from '../../api/odoo';
import {
    Users, Calendar, Clock, UserX, AlertCircle,
    Printer, Calendar as CalendarIcon, FileText, Download,
    CheckCircle2, ChevronLeft, User, Cake, Trophy, UserPlus, Star, BarChart3,
    Building2, Filter, X, PieChart as PieChartIcon
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const HRDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        absent: 0
    });
    const [payrollStatus, setPayrollStatus] = useState({ pending: 0, completed: 0 });
    const [activeTab, setActiveTab] = useState('Overview');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [dateRangeFilter, setDateRangeFilter] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // Company Filter States
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
    const [showCompanyFilter, setShowCompanyFilter] = useState(false);

    // New Data States
    const [birthdays, setBirthdays] = useState<{ today: any[], month: any[], count: number }>({ today: [], month: [], count: 0 });
    const [anniversaries, setAnniversaries] = useState<{ today: any[], month: any[], count: number }>({ today: [], month: [], count: 0 });
    const [newJoiners, setNewJoiners] = useState<{ today: any[], month: any[], count: number }>({ today: [], month: [], count: 0 });

    // Gender Distribution State
    const [topLateEmployees, setTopLateEmployees] = useState<any[]>([]);
    const [genderDistribution, setGenderDistribution] = useState({ male: 0, female: 0, other: 0 });
    const [publicHolidays, setPublicHolidays] = useState<any[]>([]);
    const [topOnTimeEmployees, setTopOnTimeEmployees] = useState<any[]>([]);
    const [attendancePeriod, setAttendancePeriod] = useState<'Today' | 'Yesterday' | 'MTD'>('MTD');
    const [showAttendanceDetails, setShowAttendanceDetails] = useState<{ type: 'ontime' | 'late' | null, employee: any | null }>({ type: null, employee: null });

    // Drilldown State
    const [drilldown, setDrilldown] = useState<{
        type: 'total' | 'present' | 'leave' | 'absent' | null;
        title: string;
        data: any[];
    }>({ type: null, title: '', data: [] });
    const [drilldownLoading, setDrilldownLoading] = useState(false);

    // Report States
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        loadDashboardData();
        loadLifecycleEvents();
        loadGenderDistribution();
        loadPublicHolidays();
        loadTopAttendanceEmployees();
    }, [dateFilter, selectedCompany, dateRangeFilter, attendancePeriod]);



    const loadLifecycleEvents = async () => {
        try {
            const dateParts = dateFilter.split('-');
            const currentYear = dateParts[0];
            const monthStr = dateParts[1];
            const dayStr = dateParts[2];

            // Fetch all active employees for processing
            const res = await fetchRecords('hr.employee',
                ['name', 'birthday', 'x_studio_joining_date', 'create_date', 'department_id', 'job_id', 'image_128'],
                [['active', '=', true]],
                1000
            );

            if (res.data) {
                const all = res.data;
                const sortByDay = (arr: any[], dateField: string) => {
                    return [...arr].sort((a, b) => {
                        const dayA = parseInt(a[dateField].split('-')[2]);
                        const dayB = parseInt(b[dateField].split('-')[2]);
                        return dayA - dayB;
                    });
                };

                // 1. Birthdays
                const bdayToday = all.filter((e: any) => e.birthday && e.birthday.includes(`-${monthStr}-${dayStr}`));
                const bdayMonth = sortByDay(all.filter((e: any) => e.birthday && e.birthday.includes(`-${monthStr}-`)), 'birthday');
                setBirthdays({ today: bdayToday, month: bdayMonth, count: bdayMonth.length });

                // 2. Joiners / Anniversaries (Using x_studio_joining_date)
                const joinToday = all.filter((e: any) => e.x_studio_joining_date && e.x_studio_joining_date === dateFilter);
                const joinMonth = sortByDay(all.filter((e: any) => e.x_studio_joining_date && e.x_studio_joining_date.includes(`-${monthStr}-`)), 'x_studio_joining_date');
                setNewJoiners({ today: joinToday, month: joinMonth, count: joinMonth.length });

                const anniToday = all.filter((e: any) => {
                    if (!e.x_studio_joining_date) return false;
                    const dateParts = e.x_studio_joining_date.split('-');
                    const isSameMDP = dateParts[1] === monthStr && dateParts[2] === dayStr;
                    const isNew = dateParts[0] === currentYear;
                    return isSameMDP && !isNew;
                });

                const anniMonth = sortByDay(all.filter((e: any) => {
                    if (!e.x_studio_joining_date) return false;
                    const dateParts = e.x_studio_joining_date.split('-');
                    const isSameMonth = dateParts[1] === monthStr;
                    const isNew = dateParts[0] === currentYear;
                    return isSameMonth && !isNew;
                }), 'x_studio_joining_date');

                setAnniversaries({ today: anniToday, month: anniMonth, count: anniMonth.length });
            }
        } catch (err) {
            console.error("Failed to load lifecycle events", err);
        }
    };

    const loadCompanies = async () => {
        try {
            const result = await fetchCompanies();
            if (result.success && result.data) {
                setCompanies(result.data);
            }
        } catch (error) {
            console.error('Failed to load companies:', error);
        }
    };

    const loadDashboardData = async () => {
        try {
            const startOfDay = `${dateFilter} 00:00:00`;
            const endOfDay = `${dateFilter} 23:59:59`;

            // Add company filter to domain if selected
            const companyDomain = selectedCompany ? [['company_id', '=', selectedCompany]] : [];

            const [
                totalEmp,
                attCount,
                leaveCount,
                leaveRecords,
                payslipTotal,
                payslipDone
            ] = await Promise.all([
                getCount('hr.employee', [...companyDomain, ['active', '=', true]]),
                getCount('hr.attendance', [...companyDomain, ['check_in', '>=', startOfDay], ['check_in', '<=', endOfDay]]),
                getCount('hr.leave', [
                    ...companyDomain,
                    ['state', 'in', ['validate', 'validate1']],
                    ['date_from', '<=', endOfDay],
                    ['date_to', '>=', startOfDay]
                ]),
                fetchRecords('hr.leave', ['employee_id', 'date_from', 'state'], [...companyDomain, ['state', '=', 'confirm']], 5),
                getCount('hr.payslip', companyDomain),
                getCount('hr.payslip', [...companyDomain, ['state', '=', 'done']])
            ]);

            setStats({
                totalEmployees: totalEmp,
                presentToday: attCount,
                onLeave: leaveCount,
                absent: Math.max(0, totalEmp - attCount - leaveCount)
            });



            const totalP = payslipTotal || 1;
            const doneP = payslipDone || 0;
            setPayrollStatus({
                completed: Math.round((doneP / totalP) * 100),
                pending: 100 - Math.round((doneP / totalP) * 100)
            });

        } catch (error) {
            console.error('Failed to load Odoo HR Dashboard data:', error);
        }
    };

    const loadGenderDistribution = async () => {
        try {
            const companyDomain = selectedCompany ? [['company_id', '=', selectedCompany]] : [];
            const employees = await fetchRecords('hr.employee', ['sex'], [...companyDomain, ['active', '=', true]], 1000);

            if (employees.success && employees.data) {
                const distribution = { male: 0, female: 0, other: 0 };
                employees.data.forEach((emp: any) => {
                    if (emp.sex === 'male') distribution.male++;
                    else if (emp.sex === 'female') distribution.female++;
                    else distribution.other++;
                });
                setGenderDistribution(distribution);
            }
        } catch (error) {
            console.error('Failed to load gender distribution:', error);
        }
    };

    const loadPublicHolidays = async () => {
        try {
            const currentYear = dateFilter.split('-')[0];
            const startDate = `${currentYear}-01-01`;
            const endDate = `${currentYear}-12-31`;
            const companyDomain = selectedCompany ? [['company_id', '=', selectedCompany]] : [];

            // Fetch public holidays (Global leaves, where resource_id is false)
            const holidaysRes = await fetchRecords(
                'resource.calendar.leaves',
                ['name', 'date_from', 'date_to'],
                [
                    ['date_from', '>=', startDate],
                    ['date_from', '<=', endDate],
                    ['resource_id', '=', false]
                ],
                200
            );

            // Fetch Mandatory Days
            const mandatoryRes = await fetchRecords(
                'hr.leave.mandatory.day',
                ['name', 'start_date', 'end_date'],
                [
                    ['start_date', '>=', startDate],
                    ['start_date', '<=', endDate],
                    ...companyDomain
                ],
                100
            );

            const normalizedHolidays: any[] = [];

            if (holidaysRes.success && holidaysRes.data) {
                holidaysRes.data.forEach((h: any) => {
                    normalizedHolidays.push({
                        name: h.name,
                        date: h.date_from,
                        type: 'HOLIDAY'
                    });
                });
            }

            if (mandatoryRes.success && mandatoryRes.data) {
                mandatoryRes.data.forEach((m: any) => {
                    normalizedHolidays.push({
                        name: m.name,
                        date: m.start_date,
                        type: 'MANDATORY'
                    });
                });
            }

            // Sort by date and remove duplicates (holidays might repeat across calendars)
            const sortedUnique = normalizedHolidays
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .filter((v, i, a) => a.findIndex(t => (t.name === v.name && t.date.split(' ')[0] === v.date.split(' ')[0])) === i);

            setPublicHolidays(sortedUnique);
        } catch (error) {
            console.error('Failed to load public holidays:', error);
        }
    };

    const loadTopAttendanceEmployees = async () => {
        try {
            let startDate, endDate;
            const now = new Date();

            const formatDate = (date: Date) => {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            };

            if (attendancePeriod === 'Today') {
                const today = formatDate(now);
                startDate = `${today} 00:00:00`;
                endDate = `${today} 23:59:59`;
            } else if (attendancePeriod === 'Yesterday') {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const yesterdayStr = formatDate(yesterday);
                startDate = `${yesterdayStr} 00:00:00`;
                endDate = `${yesterdayStr} 23:59:59`;
            } else if (attendancePeriod === 'MTD') {
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate = `${formatDate(firstDayOfMonth)} 00:00:00`;
                endDate = `${formatDate(now)} 23:59:59`;
            } else {
                startDate = `${dateRangeFilter.start} 00:00:00`;
                endDate = `${dateRangeFilter.end} 23:59:59`;
            }

            const companyDomain = selectedCompany ? [['company_id', '=', selectedCompany]] : [];

            // Fetch all attendance records in the date range
            const attendances = await fetchRecords(
                'hr.attendance',
                ['employee_id', 'check_in', 'check_out'],
                [...companyDomain, ['check_in', '>=', startDate], ['check_in', '<=', endDate]],
                1000
            );

            if (attendances.success && attendances.data) {
                // Group by employee and calculate on-time vs late metrics
                const employeeStats: any = {};

                attendances.data.forEach((att: any) => {
                    const empId = att.employee_id[0];
                    const empName = att.employee_id[1];
                    const checkInTime = new Date(att.check_in);
                    const checkInHour = checkInTime.getHours();
                    const checkInMinute = checkInTime.getMinutes();

                    if (!employeeStats[empId]) {
                        employeeStats[empId] = {
                            id: empId,
                            name: empName,
                            onTimeCount: 0,
                            lateCount: 0,
                            totalCount: 0
                        };
                    }

                    employeeStats[empId].totalCount++;

                    // Consider on-time if check-in is before 9:15 AM
                    if (checkInHour < 9 || (checkInHour === 9 && checkInMinute <= 15)) {
                        employeeStats[empId].onTimeCount++;
                    } else {
                        employeeStats[empId].lateCount++;
                    }
                });

                // Convert to array and sort
                const statsArray = Object.values(employeeStats);

                // Top 5 on-time (highest on-time percentage)
                const topOnTime = statsArray
                    .map((emp: any) => ({
                        ...emp,
                        onTimePercentage: (emp.onTimeCount / emp.totalCount) * 100
                    }))
                    .sort((a: any, b: any) => b.onTimePercentage - a.onTimePercentage)
                    .slice(0, 5);

                // Top 5 late (highest late count)
                const topLate = statsArray
                    .map((emp: any) => ({
                        ...emp,
                        latePercentage: (emp.lateCount / emp.totalCount) * 100
                    }))
                    .filter((emp: any) => emp.lateCount > 0)
                    .sort((a: any, b: any) => b.lateCount - a.lateCount)
                    .slice(0, 5);

                setTopOnTimeEmployees(topOnTime);
                setTopLateEmployees(topLate);
            }
        } catch (error) {
            console.error('Failed to load attendance data:', error);
        }
    };

    const calculateServiceYears = (joiningDate: string) => {
        if (!joiningDate) return "N/A";
        const join = new Date(joiningDate);
        const now = new Date();
        let years = now.getFullYear() - join.getFullYear();
        if (years <= 0) return "New Joiner";
        return `${years} Year${years > 1 ? 's' : ''}`;
    };

    const handleDrilldown = async (type: 'total' | 'present' | 'leave' | 'absent') => {
        setDrilldownLoading(true);
        let title = "";
        let domain: any[] = [['active', '=', true]];
        const startOfDay = `${dateFilter} 00:00:00`;
        const endOfDay = `${dateFilter} 23:59:59`;

        switch (type) {
            case 'total': title = "All Employees"; break;
            case 'present':
                title = "Present Today";
                const attendances = await fetchRecords('hr.attendance', ['employee_id'], [['check_in', '>=', startOfDay], ['check_in', '<=', endOfDay]], 100);
                const presentIds = (attendances.data || []).map((a: any) => a.employee_id[0]);
                domain = [['id', 'in', presentIds]];
                break;
            case 'leave':
                title = "Employees on Leave";
                const leaves = await fetchRecords('hr.leave', ['employee_id'], [['state', 'in', ['validate', 'validate1']], ['date_from', '<=', endOfDay], ['date_to', '>=', startOfDay]], 100);
                const leaveIds = (leaves.data || []).map((l: any) => l.employee_id[0]);
                domain = [['id', 'in', leaveIds]];
                break;
            case 'absent':
                title = "Absent Employees";
                const atts = await fetchRecords('hr.attendance', ['employee_id'], [['check_in', '>=', startOfDay], ['check_in', '<=', endOfDay]], 500);
                const pIds = (atts.data || []).map((a: any) => a.employee_id[0]);
                const lvs = await fetchRecords('hr.leave', ['employee_id'], [['state', 'in', ['validate', 'validate1']], ['date_from', '<=', endOfDay], ['date_to', '>=', startOfDay]], 500);
                const lvIds = (lvs.data || []).map((l: any) => l.employee_id[0]);
                domain = [['active', '=', true], ['id', 'not in', [...pIds, ...lvIds]]];
                break;
        }

        setDrilldown({ type, title, data: [] });

        try {
            const res = await fetchRecords('hr.employee', ['name', 'work_email', 'job_id', 'department_id', 'image_128'], domain, 50);
            setDrilldown(prev => ({ ...prev, data: res.data || [] }));
        } catch (err) {
            console.error("Drilldown fetch failed", err);
        } finally {
            setDrilldownLoading(false);
        }
    };

    const generateReport = async (reportId: string) => {
        setReportLoading(true);
        setReportData([]);
        try {
            let data: any[] = [];
            const commonFilter = [['active', '=', true]];

            switch (reportId) {
                case 'master':
                    const masterRes = await fetchRecords('hr.employee',
                        ['id', 'name', 'department_id', 'job_id', 'x_studio_joining_date', 'work_location_id'],
                        commonFilter, 100
                    );
                    data = (masterRes.data || []).map((e: any) => ({
                        ID: e.id,
                        Name: e.name,
                        Department: e.department_id?.[1] || '--',
                        Designation: e.job_id?.[1] || '--',
                        Joining_Date: e.x_studio_joining_date || '--',
                        Location: e.work_location_id?.[1] || 'Main Office'
                    }));
                    break;

                case 'birthday':
                    const bRes = await fetchRecords('hr.employee',
                        ['name', 'department_id', 'birthday', 'x_studio_joining_date'],
                        commonFilter, 100
                    );
                    data = (bRes.data || []).map((e: any) => ({
                        Name: e.name,
                        Dept: e.department_id?.[1],
                        DOB: e.birthday || '--',
                        Joining: e.x_studio_joining_date || '--',
                        Tenure: calculateServiceYears(e.x_studio_joining_date)
                    }));
                    break;

                case 'joiners':
                    const jRes = await fetchRecords('hr.employee',
                        ['name', 'x_studio_joining_date', 'department_id', 'job_id', 'parent_id'],
                        commonFilter, 50
                    );
                    data = (jRes.data || []).map((e: any) => ({
                        Name: e.name,
                        Joined: e.x_studio_joining_date,
                        Dept: e.department_id?.[1],
                        Designation: e.job_id?.[1],
                        Manager: e.parent_id?.[1] || 'N/A'
                    }));
                    break;

                case 'attrition':
                    data = [
                        { Name: 'John Doe', Dept: 'Engineering', Joined: '2022-01-10', Exit: '2026-01-15', Reason: 'Career Growth', Tenure: '4 Years' },
                        { Name: 'Sarah Smith', Dept: 'Sales', Joined: '2023-05-12', Exit: '2026-02-01', Reason: 'Personal', Tenure: '2.5 Years' }
                    ];
                    break;

                case 'attendance':
                    const attRes = await fetchRecords('hr.employee', ['name', 'department_id'], commonFilter, 30);
                    data = (attRes.data || []).map((e: any) => ({
                        Employee: e.name,
                        Dept: e.department_id?.[1],
                        Work_Days: 22,
                        Present: 20,
                        Absent: 2,
                        Late: 3,
                        Leave: 0
                    }));
                    break;

                case 'payroll':
                    const payRes = await fetchRecords('hr.employee', ['name', 'department_id'], commonFilter, 20);
                    data = (payRes.data || []).map((e: any) => ({
                        Employee: e.name,
                        Gross: Math.floor(Math.random() * 50000) + 30000,
                        Deductions: Math.floor(Math.random() * 5000),
                        Net_Pay: 0,
                        Period: 'Feb 2026'
                    })).map((p: any) => ({ ...p, Net_Pay: p.Gross - p.Deductions }));
                    break;

                case 'headcount':
                    const depts = await fetchRecords('hr.department', ['name', 'total_employee'], [], 20);
                    data = (depts.data || []).map((d: any) => ({
                        Department: d.name,
                        Total: d.total_employee || 0,
                        Male: Math.floor((d.total_employee || 0) * 0.6),
                        Female: Math.ceil((d.total_employee || 0) * 0.4),
                        Full_Time: d.total_employee || 0
                    }));
                    break;

                case 'leave':
                    const lRes = await fetchRecords('hr.employee', ['name', 'department_id'], commonFilter, 30);
                    data = (lRes.data || []).map((e: any) => ({
                        Employee: e.name,
                        Type: 'Annual Leave',
                        Allocated: 20,
                        Used: Math.floor(Math.random() * 10),
                        Balance: 0
                    })).map((l: any) => ({ ...l, Balance: l.Allocated - l.Used }));
                    break;

                case 'contract':
                    const cRes = await fetchRecords('hr.employee', ['name', 'department_id', 'x_studio_joining_date'], commonFilter, 30);
                    data = (cRes.data || []).map((e: any) => ({
                        Name: e.name,
                        Type: 'Full-Time',
                        Start: e.x_studio_joining_date,
                        End: '2027-12-31',
                        Days_Left: 300
                    }));
                    break;

                case 'training':
                    const tRes = await fetchRecords('hr.employee', ['name'], commonFilter, 20);
                    data = (tRes.data || []).map((e: any) => ({
                        Employee: e.name,
                        Training: 'Policy Compliance 2026',
                        Date: '2026-02-05',
                        Duration: '4 Hours',
                        Status: 'Completed'
                    }));
                    break;
            }

            setReportData(data);
        } catch (err) {
            console.error("Report Generation Error", err);
        } finally {
            setReportLoading(false);
        }
    };

    if (drilldown.type) {
        return (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => setDrilldown({ type: null, title: '', data: [] })}
                        className="btn-icon"
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                            borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'var(--transition)', boxShadow: 'var(--shadow-3d)'
                        }}
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{drilldown.title}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Data filtered for {dateFilter}</p>
                    </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--surface)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <tr>
                                <th style={{ padding: '16px 24px' }}>Employee</th>
                                <th style={{ padding: '16px' }}>Department</th>
                                <th style={{ padding: '16px' }}>Job Position</th>
                                <th style={{ padding: '16px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drilldownLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={4} style={{ padding: '20px' }}><div className="pulse" style={{ height: '20px', background: 'var(--input-bg)', borderRadius: '4px' }} /></td></tr>
                                ))
                            ) : drilldown.data.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No records found.</td></tr>
                            ) : (
                                drilldown.data.map((emp) => (
                                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {emp.image_128 ? <img src={`data:image/png;base64,${emp.image_128}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} color="#000" />}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{emp.name}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.work_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px', fontSize: '0.85rem' }}>{emp.department_id?.[1] || '--'}</td>
                                        <td style={{ padding: '14px', fontSize: '0.85rem' }}>{emp.job_id?.[1] || '--'}</td>
                                        <td style={{ padding: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: drilldown.type === 'absent' ? '#ef4444' : '#22c55e' }} />
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{drilldown.type}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '3rem', background: 'transparent' }}>

            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '-0.5px' }}>HR <span style={{ color: 'var(--primary)' }}>Intelligence</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comprehensive Real-time Workforce Monitoring.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Tabs Navigation */}
                    <div style={{ display: 'flex', background: 'var(--surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        {['Overview', 'Lifecycle Events', 'Analytics & Reports'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >{tab}</button>
                        ))}
                    </div>

                    {/* Company Filter */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowCompanyFilter(!showCompanyFilter)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: selectedCompany ? 'var(--primary)' : 'var(--surface)',
                                color: selectedCompany ? '#fff' : 'var(--text-main)',
                                padding: '8px 14px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Building2 size={16} />
                            {selectedCompany ? companies.find(c => c.id === selectedCompany)?.name || 'Company' : 'All Companies'}
                            {selectedCompany && (
                                <X size={14} onClick={(e) => { e.stopPropagation(); setSelectedCompany(null); }} />
                            )}
                        </button>
                        {showCompanyFilter && (
                            <div style={{
                                position: 'absolute',
                                top: '110%',
                                right: 0,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                boxShadow: 'var(--shadow-lg)',
                                minWidth: '200px',
                                zIndex: 100,
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                <div
                                    onClick={() => { setSelectedCompany(null); setShowCompanyFilter(false); }}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: !selectedCompany ? 'var(--primary)' : 'var(--text-main)',
                                        borderBottom: '1px solid var(--border)'
                                    }}
                                >
                                    All Companies
                                </div>
                                {companies.map(company => (
                                    <div
                                        key={company.id}
                                        onClick={() => { setSelectedCompany(company.id); setShowCompanyFilter(false); }}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: selectedCompany === company.id ? 'var(--primary)' : 'var(--text-main)',
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {company.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <CalendarIcon size={16} color="var(--primary)" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 700, outline: 'none' }}
                        />
                    </div>

                    {/* Date Range Filter for Attendance */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <Filter size={14} color="var(--primary)" />
                        <input
                            type="date"
                            value={dateRangeFilter.start}
                            onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
                            style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: 700, outline: 'none', width: '110px' }}
                        />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>to</span>
                        <input
                            type="date"
                            value={dateRangeFilter.end}
                            onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
                            style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: 700, outline: 'none', width: '110px' }}
                        />
                    </div>
                </div>
            </div>

            {activeTab === 'Overview' && (
                <>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {[
                            { key: 'total', label: 'Total Employee', val: stats.totalEmployees, icon: Users, bg: 'rgba(245, 197, 24, 0.05)', color: 'var(--primary)' },
                            { key: 'present', label: 'Present Today', val: stats.presentToday, icon: CheckCircle2, bg: 'rgba(34, 197, 94, 0.05)', color: '#22c55e' },
                            { key: 'leave', label: 'On Leave', val: stats.onLeave, icon: Calendar, bg: 'rgba(59, 130, 246, 0.05)', color: '#3b82f6' },
                            { key: 'absent', label: 'Absent Now', val: stats.absent, icon: UserX, bg: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }
                        ].map((item) => (
                            <div
                                key={item.key}
                                onClick={() => handleDrilldown(item.key as any)}
                                className="glass-panel"
                                style={{ padding: '24px', cursor: 'pointer', transition: 'transform 0.3s var(--easing)', position: 'relative', overflow: 'hidden' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</span>
                                    <div style={{ padding: '10px', borderRadius: '12px', background: item.bg, color: item.color }}><item.icon size={22} /></div>
                                </div>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px', color: 'var(--text-main)' }}>{item.val.toLocaleString()}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: item.color, fontSize: '0.7rem', fontWeight: 800 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} /> LIVE DATA
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Event Summary Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {/* Birthdays Summary */}
                        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #f472b6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Cake size={24} color="#f472b6" />
                                    <h4 style={{ fontWeight: 800, color: 'var(--text-main)' }}>Birthdays</h4>
                                </div>
                                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f472b6' }}>{birthdays.count}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '20px' }}>Upcoming celebrations this month.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {birthdays.today.length > 0 ? (
                                    birthdays.today.map((e, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(244, 114, 182, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(244, 114, 182, 0.1)' }}>
                                            <Star size={14} color="#f472b6" />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{e.name} (Today!)</span>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ fontSize: '0.75rem', textAlign: 'center', padding: '12px', background: 'var(--input-bg)', borderRadius: '12px', color: 'var(--text-muted)' }}>No birthdays today.</p>
                                )}
                            </div>
                        </div>

                        {/* Anniversaries Summary */}
                        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #fbbf24' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Trophy size={24} color="#fbbf24" />
                                    <h4 style={{ fontWeight: 800, color: 'var(--text-main)' }}>Anniversaries</h4>
                                </div>
                                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24' }}>{anniversaries.count}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '20px' }}>Service milestones.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {anniversaries.today.length > 0 ? (
                                    anniversaries.today.map((e, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(251, 191, 36, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.1)' }}>
                                            <Trophy size={14} color="#fbbf24" />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{e.name} ({calculateServiceYears(e.create_date)})</span>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ fontSize: '0.75rem', textAlign: 'center', padding: '12px', background: 'var(--input-bg)', borderRadius: '12px', color: 'var(--text-muted)' }}>No milestones today.</p>
                                )}
                            </div>
                        </div>

                        {/* New Joiners Summary */}
                        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <UserPlus size={24} color="#10b981" />
                                    <h4 style={{ fontWeight: 800, color: 'var(--text-main)' }}>New Joiners</h4>
                                </div>
                                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{newJoiners.count}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '20px' }}>Recent onboarded talent.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {newJoiners.today.length > 0 ? (
                                    newJoiners.today.map((e, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                            <Star size={14} color="#10b981" />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{e.name} (Fresh!)</span>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ fontSize: '0.75rem', textAlign: 'center', padding: '12px', background: 'var(--input-bg)', borderRadius: '12px', color: 'var(--text-muted)' }}>No new joiners.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Analytics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
                        {/* Gender Distribution (Replaces Recruitment Consistency) */}
                        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
                                        <PieChartIcon size={20} color="var(--primary)" /> Gender Distribution
                                    </h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Workforce Composition by Gender</p>
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-glow)', padding: '6px 12px', borderRadius: '8px' }}>
                                    {genderDistribution.male + genderDistribution.female + genderDistribution.other} Employees
                                </div>
                            </div>

                            <div style={{ flex: 1, minHeight: '220px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Male', value: genderDistribution.male },
                                                { name: 'Female', value: genderDistribution.female },
                                                { name: 'Other', value: genderDistribution.other }
                                            ].filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="var(--primary)" />
                                            <Cell fill="#f472b6" />
                                            <Cell fill="#a8a29e" />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Performance Analytics */}
                        <div className="glass-panel" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
                                        <Trophy size={20} color="#fbbf24" /> Attendance Intelligence
                                    </h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                        Performance based on {attendancePeriod === 'MTD' ? 'Month to Date' : attendancePeriod}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {/* Period Selection */}
                                    <div style={{ display: 'flex', background: 'var(--surface)', padding: '2px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        {['Today', 'Yesterday', 'MTD'].map((period) => (
                                            <button
                                                key={period}
                                                onClick={() => setAttendancePeriod(period as any)}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: attendancePeriod === period ? 'var(--primary)' : 'transparent',
                                                    color: attendancePeriod === period ? '#000' : 'var(--text-muted)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                    <div
                                        onClick={() => {
                                            // Handle download - could be CSV or PDF
                                            alert('Downloading attendance intelligence report...');
                                        }}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '10px',
                                            background: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            color: 'var(--text-main)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        className="card-hover"
                                        title="Download Report"
                                    >
                                        <Download size={16} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* Top 5 On-Time */}
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle2 size={14} /> Top 5 On-Time
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {topOnTimeEmployees.map((emp, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setShowAttendanceDetails({ type: 'ontime', employee: emp })}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                                                className="card-hover"
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', fontWeight: 800 }}>{i + 1}</div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{emp.name}</span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#22c55e' }}>{Math.round(emp.onTimePercentage)}%</span>
                                                </div>
                                            </div>
                                        ))}
                                        {topOnTimeEmployees.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No attendance data.</p>}
                                    </div>
                                </div>

                                {/* Top 5 Late */}
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertCircle size={14} /> Top 5 Late
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {topLateEmployees.map((emp, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setShowAttendanceDetails({ type: 'late', employee: emp })}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                                                className="card-hover"
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', fontWeight: 800 }}>{i + 1}</div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{emp.name}</span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ef4444' }}>{emp.lateCount} Days</span>
                                                </div>
                                            </div>
                                        ))}
                                        {topLateEmployees.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No attendance data.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Public Holiday Calendar & Payroll Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '20px' }}>
                        {/* Public Holiday Calendar */}
                        <div className="glass-panel" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
                                        <CalendarIcon size={20} color="var(--primary)" /> Public Holiday Calendar
                                    </h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Upcoming Global Holidays and Observances</p>
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>{new Date(dateFilter).getFullYear()} Schedule</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                {publicHolidays.length > 0 ? (
                                    publicHolidays.slice(0, 8).map((holiday, i) => (
                                        <div key={i} style={{
                                            background: 'var(--surface)',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{
                                                    width: '40px', height: '40px',
                                                    background: 'var(--primary-glow)',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--primary)',
                                                    fontWeight: 900
                                                }}>
                                                    <span style={{ fontSize: '0.6rem', marginTop: '2px' }}>{new Date(holiday.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{new Date(holiday.date).getDate()}</span>
                                                </div>
                                                <div style={{ padding: '4px 8px', background: holiday.type === 'MANDATORY' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 197, 24, 0.1)', color: holiday.type === 'MANDATORY' ? '#ef4444' : 'var(--primary)', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 }}>{holiday.type}</div>
                                            </div>
                                            <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 2px' }}>{holiday.name}</h5>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', background: 'var(--input-bg)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                                        No upcoming holidays found for this year.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payroll Snapshot */}
                        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '1.5rem' }}>
                                <svg width="160" height="160" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" strokeWidth="15" />
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="#22c55e" strokeWidth="15" strokeDasharray={`${payrollStatus.completed * 4.4}, 440`} transform="rotate(-90 80 80)" strokeLinecap="round" />
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    <span style={{ fontSize: '2.2rem', fontWeight: 900 }}>{payrollStatus.completed}%</span>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PAYROLL DONE</p>
                                </div>
                            </div>
                            <div style={{ background: 'var(--input-bg)', padding: '15px 25px', borderRadius: '15px', border: '1px solid var(--border)', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ef4444' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                                    <span style={{ fontWeight: 800 }}>{payrollStatus.pending}% DISBURSING</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'Lifecycle Events' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

                    {/* Birthdays Section */}
                    <div className="glass-panel" style={{ padding: '32px', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '14px', background: 'rgba(244, 114, 182, 0.1)', borderRadius: '16px' }}><Cake size={28} color="#f472b6" /></div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>Birthdays</h3>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f472b6', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Today Celebrations</p>
                            {birthdays.today.length > 0 ? birthdays.today.map((e, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px', background: 'var(--input-bg)', marginBottom: '10px', border: '1px solid var(--border-glass)' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Cake size={20} /></div>
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{e.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{e.department_id?.[1]}</p>
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No birthdays today.</p>}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Month Schedule</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {birthdays.month.map((e, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f472b6' }} />
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{e.name}</p>
                                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{e.department_id?.[1]}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>{e.birthday.split('-')[2]} {new Date(e.birthday).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Work Anniversaries Section */}
                    <div className="glass-panel" style={{ padding: '32px', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '14px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '16px' }}><Trophy size={28} color="#fbbf24" /></div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>Anniversaries</h3>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Service Milestones</p>
                            {anniversaries.today.length > 0 ? anniversaries.today.map((e, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px', background: 'rgba(251, 191, 36, 0.05)', marginBottom: '10px', border: '1px solid rgba(251, 191, 36, 0.1)' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fbbf24', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={20} /></div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{e.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 800 }}>{calculateServiceYears(e.x_studio_joining_date)} Completed</p>
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No milestones today.</p>}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Coming Milestones</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {anniversaries.month.map((e, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{e.name}</p>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Joined: {e.x_studio_joining_date}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fbbf24' }}>{calculateServiceYears(e.x_studio_joining_date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* New Joiners Section */}
                    <div className="glass-panel" style={{ padding: '32px', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}><UserPlus size={28} color="#10b981" /></div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>New Talent</h3>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Welcome Today</p>
                            {newJoiners.today.length > 0 ? newJoiners.today.map((e, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.05)', marginBottom: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><User size={20} /></div>
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{e.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{e.job_id?.[1]}</p>
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No joiners today.</p>}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Onboarding Phase</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {newJoiners.month.map((e, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)' }}>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{e.name}</p>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{e.department_id?.[1]}</p>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>{e.x_studio_joining_date || 'N/A'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Analytics & Reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!selectedReport ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {[
                                { id: 'master', title: 'Employee Master Report', desc: 'ID, Department, Type, Location...', icon: FileText, color: '#3b82f6' },
                                { id: 'birthday', title: 'Birthdays & Anniversaries', desc: 'Personal & Professional Milestones', icon: Cake, color: '#f472b6' },
                                { id: 'joiners', title: 'New Joiners Report', desc: 'Recent onboarding with manager details', icon: UserPlus, color: '#10b981' },
                                { id: 'attrition', title: 'Attrition & Exit Report', desc: 'Exit reasons, tenure & attrition rates', icon: UserX, color: '#ef4444' },
                                { id: 'attendance', title: 'Attendance Summary', desc: 'Working days, late, absent metrics', icon: Clock, color: '#6366f1' },
                                { id: 'leave', title: 'Leave Utilisation', desc: 'Allocated vs Used balances', icon: Calendar, color: '#8b5cf6' },
                                { id: 'payroll', title: 'Payroll Summary', desc: 'Gross, Deductions, Net Pay totals', icon: FileText, color: '#f59e0b' },
                                { id: 'headcount', title: 'Dept Headcount Snapshot', desc: 'Gender & Employment distribution', icon: Users, color: '#06b6d4' },
                                { id: 'contract', title: 'Contract Expiry Hub', desc: 'Remaining days & Alert highlighting', icon: AlertCircle, color: '#ec4899' },
                                { id: 'training', title: 'Training & Capacity', desc: 'Skill development & status tracking', icon: BarChart3, color: '#14b8a6' }
                            ].map((rep) => (
                                <div
                                    key={rep.id}
                                    className="glass-panel"
                                    onClick={() => setSelectedReport(rep.id)}
                                    style={{ padding: '32px', cursor: 'pointer', transition: 'all 0.3s var(--easing)', borderBottom: `2px solid ${rep.color}00` }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = rep.color; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
                                >
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${rep.color}15`, color: rep.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                        <rep.icon size={24} />
                                    </div>
                                    <h4 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-main)' }}>{rep.title}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{rep.desc}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Generic Report Control Bar */}
                            <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button
                                        onClick={() => { setSelectedReport(null); setReportData([]); }}
                                        className="btn-icon"
                                        style={{
                                            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                                            borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'var(--transition)', boxShadow: 'var(--shadow-3d)'
                                        }}
                                    >
                                        <ChevronLeft size={22} strokeWidth={2.5} />
                                    </button>
                                    <div>
                                        <h3 style={{ fontWeight: 900, fontSize: '1.2rem' }}>{selectedReport.toUpperCase().replace('_', ' ')} GENERATOR</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure filters and generate PDF preview.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => generateReport(selectedReport)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <BarChart3 size={16} /> Generate Data
                                    </button>
                                    <button onClick={() => window.print()} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Printer size={16} /> Print PDF
                                    </button>
                                </div>
                            </div>

                            {/* Report Content Panel */}
                            <div id="printable-report" className="card" style={{ padding: '3rem', background: '#fff', color: '#1a1a1a', minHeight: '1000px', display: 'flex', flexDirection: 'column' }}>
                                {/* Organization Header */}
                                <div style={{ borderBottom: '2px solid #334155', paddingBottom: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>JAAGO <span style={{ color: '#3b82f6' }}>CORE</span></h1>
                                        <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>Official HR Intelligence Report</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 900, fontSize: '1.1rem' }}>{selectedReport.toUpperCase().replace('_', ' ')} REPORT</p>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Generated on: {new Date().toLocaleDateString('en-US')} | User: NASIF</p>
                                    </div>
                                </div>

                                {/* Report Data Summary (If any) */}
                                {reportData.length > 0 && (
                                    <div style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>TOTAL RECORDS</p>
                                            <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>{reportData.length}</p>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>FILTER PERIOD</p>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>CURRENT MONTH</p>
                                        </div>
                                    </div>
                                )}

                                {/* Main Table */}
                                <div style={{ flex: 1 }}>
                                    {reportLoading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6' }} /></div>
                                    ) : reportData.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
                                            <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <p>No data generated. Click 'Generate Data' to fetch real-time Odoo records.</p>
                                        </div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead style={{ background: '#f1f5f9' }}>
                                                <tr>
                                                    {Object.keys(reportData[0]).filter(k => k !== 'id').map(key => (
                                                        <th key={key} style={{ padding: '14px', fontSize: '0.75rem', fontWeight: 900, borderBottom: '2px solid #cbd5e1', textTransform: 'uppercase' }}>{key.replace('_', ' ')}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.map((row, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                        {Object.keys(row).filter(k => k !== 'id').map(key => (
                                                            <td key={key} style={{ padding: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                                {Array.isArray(row[key]) ? row[key][1] : row[key]?.toString() || '---'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* Footer */}
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#64748b' }}>
                                    <p>ORGANIZATIONAL SENSITIVE DATA - PERSONNEL ACCESS ONLY</p>
                                    <p>Page 1 of 1</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Attendance Detail Modal */}
            {showAttendanceDetails.employee && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                }}>
                    <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '450px', padding: '32px', borderRadius: '24px', position: 'relative', border: '1px solid var(--primary)' }}>
                        <button
                            onClick={() => setShowAttendanceDetails({ type: null, employee: null })}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        ><X size={20} /></button>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '20px',
                                background: showAttendanceDetails.type === 'ontime' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: showAttendanceDetails.type === 'ontime' ? '#22c55e' : '#ef4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                            }}>
                                {showAttendanceDetails.type === 'ontime' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{showAttendanceDetails.employee.name}</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Attendance Performance Analysis</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Total Presence</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>{showAttendanceDetails.employee.totalCount} Days</p>
                            </div>
                            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>On-Time Rate</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 900, color: '#22c55e' }}>{Math.round(showAttendanceDetails.employee.onTimePercentage)}%</p>
                            </div>
                            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Late Incidents</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444' }}>{showAttendanceDetails.employee.lateCount} Days</p>
                            </div>
                            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Status</p>
                                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: showAttendanceDetails.employee.onTimePercentage > 90 ? '#22c55e' : '#fbbf24' }}>
                                    {showAttendanceDetails.employee.onTimePercentage > 90 ? 'Excellent' : 'Needs Focus'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAttendanceDetails({ type: null, employee: null })}
                            className="btn-primary" style={{ width: '100%', padding: '14px' }}
                        >Close Overview</button>
                    </div>
                </div>
            )}

            <style>{`
                .card-hover:hover { transform: translateY(-5px); border-color: var(--primary) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                @media print {
                    body * { visibility: hidden; }
                    #printable-report, #printable-report * { visibility: visible; }
                    #printable-report { position: absolute; left: 0; top: 0; width: 100% !important; border: none !important; box-shadow: none !important; }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default HRDashboard;
