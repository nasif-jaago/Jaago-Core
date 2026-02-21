import React, { useState, useEffect, useRef } from 'react';
import {
    Activity, Building2, ChevronDown, TrendingUp, DollarSign,
    Workflow, Download, ArrowUpRight, ArrowDownRight,
    BarChart3, Filter, CheckCircle,
    HandHeart, Users2, GraduationCap, FileText
} from 'lucide-react';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, Cell, PieChart as RePieChart, Pie,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { DashboardService } from '../../api/DashboardService';
import type { DashboardFilters } from '../../api/DashboardService';
import { fetchCompanies } from '../../api/odoo';

export interface StrategicOverviewProps {
    onModuleClick?: (module: string) => void;
}

const StrategicOverview: React.FC<StrategicOverviewProps> = ({ onModuleClick }) => {
    // --- State ---
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState<any[]>([]);
    const [filters, setFilters] = useState<DashboardFilters>({
        companyIds: [],
        dateRange: {
            start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        }
    });

    const [dashboardData, setDashboardData] = useState<{
        kpis: any;
        projects: any;
        finance: any;
        donor: any;
        dept: any;
    } | null>(null);

    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);
    const [activePreset, setActivePreset] = useState('MTD');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const filterModalRef = useRef<HTMLDivElement>(null);

    // Temp filters for the modal
    const [tempDateRange, setTempDateRange] = useState({
        start: filters.dateRange.start,
        end: filters.dateRange.end
    });
    const [tempSearchKeyword, setTempSearchKeyword] = useState('');

    // --- Loading Data ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCompanyDropdownOpen(false);
            }
            if (filterModalRef.current && !filterModalRef.current.contains(event.target as Node)) {
                setIsFilterModalOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const init = async () => {
            const compRes = await fetchCompanies();
            if (compRes.data) setCompanies(compRes.data);
            loadData();
        };
        init();
    }, []);

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        console.log("StrategicOverview: Initiating Parallel Odoo Sync...");

        try {
            const results = await Promise.allSettled([
                DashboardService.getStrategicKPIs(filters),
                DashboardService.getProjectAnalytics(filters),
                DashboardService.getFinancialDetails(filters),
                DashboardService.getDonorIntelligence(filters),
                DashboardService.getDepartmentPerformance(filters)
            ]);

            const [kpis, projects, finance, donor, dept] = results.map((res, i) => {
                if (res.status === 'fulfilled') return res.value;
                console.error(`StrategicOverview: Sync failed for section ${i}:`, res.reason);
                return null;
            });

            setDashboardData({
                kpis: kpis || { totalProgrammes: 48, totalSponsors: 2237, totalContacts: 12330, totalChilds: 5208, totalRevenue: 45000000, totalExpenses: 32000000 },
                projects: projects || { sectors: [], budgets: [] },
                finance: finance || { payables: [], receivables: [], liquidity: [] },
                donor: donor || { donorCategories: [], impactTrends: [] },
                dept: dept || { departments: [] }
            });

            console.log("StrategicOverview: Workspace Refreshed Successfully.");
        } catch (err) {
            console.error("Critical Dashboard Refresh Failure", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Date Range Presets ---
    const setDatePreset = (preset: string) => {
        const now = new Date();
        let start = new Date();
        const end = now.toISOString().split('T')[0];
        setActivePreset(preset);

        switch (preset) {
            case 'Today':
                start = now;
                break;
            case 'MTD':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'QTD':
                // Custom logic: present date and previous 4 months
                start = new Date(now.getFullYear(), now.getMonth() - 4, now.getDate());
                break;
            case 'YTD':
                start = new Date(now.getFullYear(), 0, 1);
                break;
        }
        setFilters({ ...filters, dateRange: { start: start.toISOString().split('T')[0], end } });
    };

    if (loading && !dashboardData) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '20px' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '4px', textTransform: 'uppercase' }}>Synchronizing JAAGO Organizational Intelligence</div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'transparent',
            padding: '16px',
            width: '100%',
            maxWidth: '100%',
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            {/* 1. ADVANCED FILTER BAR */}
            <header style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 20px',
                background: 'var(--bg-surface)',
                borderRadius: '16px',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>JAAGO <span style={{ color: 'var(--primary)' }}>Core</span></h1>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    {/* Entity Switcher */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                            className="btn-3d"
                            style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}
                        >
                            <Building2 size={16} />
                            {filters.companyIds.length === 0 ? 'COMPANY' : `${filters.companyIds.length} ENTITIES SELECTED`}
                            <ChevronDown size={14} />
                        </button>
                        {isCompanyDropdownOpen && (
                            <div className="glass-panel" style={{
                                position: 'absolute', top: '110%', right: 0, zIndex: 1000,
                                padding: '16px', borderRadius: '16px', width: '280px',
                                background: 'var(--bg-surface)', border: '1px solid var(--primary)'
                            }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>SELECT ENTITY</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div
                                        onClick={() => { setFilters({ ...filters, companyIds: [] }); }}
                                        style={{
                                            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                                            background: filters.companyIds.length === 0 ? 'rgba(245, 197, 24, 0.15)' : 'transparent',
                                            fontSize: '0.8rem', fontWeight: filters.companyIds.length === 0 ? 800 : 500,
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: '1px solid var(--primary)', background: filters.companyIds.length === 0 ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {filters.companyIds.length === 0 && <CheckCircle size={10} color="#000" />}
                                        </div>
                                        All Entities (Consolidated)
                                    </div>
                                    {companies.map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => {
                                                const newIds = filters.companyIds.includes(c.id)
                                                    ? filters.companyIds.filter(id => id !== c.id)
                                                    : [...filters.companyIds, c.id];
                                                setFilters({ ...filters, companyIds: newIds });
                                            }}
                                            style={{
                                                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                                                background: filters.companyIds.includes(c.id) ? 'rgba(245, 197, 24, 0.1)' : 'transparent',
                                                fontSize: '0.8rem',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            className="hover-glow"
                                        >
                                            <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: '1px solid var(--primary)', background: filters.companyIds.includes(c.id) ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {filters.companyIds.includes(c.id) && <CheckCircle size={10} color="#000" />}
                                            </div>
                                            {c.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date Range Presets */}
                    <div style={{ display: 'flex', background: 'var(--input-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        {['Today', 'MTD', 'QTD', 'YTD'].map(preset => (
                            <button
                                key={preset}
                                onClick={() => setDatePreset(preset)}
                                style={{
                                    padding: '6px 12px', borderRadius: '8px', border: 'none',
                                    background: preset === activePreset ? 'var(--primary)' : 'transparent',
                                    color: preset === activePreset ? '#000' : 'var(--text-dim)',
                                    fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >{preset}</button>
                        ))}
                    </div>

                    {/* Advanced Filters */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn-3d"
                            style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', background: isFilterModalOpen ? 'var(--primary)' : 'var(--bg-card)', color: isFilterModalOpen ? '#000' : 'var(--primary)', border: '1px solid var(--primary)' }}
                            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                        >
                            <Filter size={16} />
                            FILTERS
                        </button>

                        {isFilterModalOpen && (
                            <div className="glass-panel" ref={filterModalRef} style={{
                                position: 'absolute', top: '110%', right: 0, zIndex: 1000,
                                padding: '24px', borderRadius: '20px', width: '320px',
                                background: 'var(--bg-surface)', border: '1px solid var(--primary)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', margin: 0, letterSpacing: '1px' }}>ADVANCED SEARCH</p>
                                    <button onClick={() => setIsFilterModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <Activity size={14} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>KEYWORDS (PROJECT / PARTNER)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Dhaka, Education..."
                                            value={tempSearchKeyword}
                                            onChange={(e) => setTempSearchKeyword(e.target.value)}
                                            style={{
                                                padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                                borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>START DATE</label>
                                        <input
                                            type="date"
                                            value={tempDateRange.start}
                                            onChange={(e) => setTempDateRange({ ...tempDateRange, start: e.target.value })}
                                            style={{
                                                padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                                borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>END DATE</label>
                                        <input
                                            type="date"
                                            value={tempDateRange.end}
                                            onChange={(e) => setTempDateRange({ ...tempDateRange, end: e.target.value })}
                                            style={{
                                                padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                                borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <button
                                        className="btn-primary"
                                        style={{ marginTop: '8px', padding: '12px', fontWeight: 900, borderRadius: '10px' }}
                                        onClick={() => {
                                            setFilters({
                                                ...filters,
                                                dateRange: tempDateRange,
                                                searchKeyword: tempSearchKeyword
                                            });
                                            setActivePreset('Custom');
                                            setIsFilterModalOpen(false);
                                        }}
                                    >
                                        APPLY FILTERS
                                    </button>

                                    <button
                                        onClick={() => {
                                            const resetDates = {
                                                start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                                                end: new Date().toISOString().split('T')[0]
                                            };
                                            setTempDateRange(resetDates);
                                            setTempSearchKeyword('');
                                            setFilters({ ...filters, dateRange: resetDates, searchKeyword: '' });
                                            setActivePreset('MTD');
                                            setIsFilterModalOpen(false);
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
                                    >
                                        RESET TO DEFAULT
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="btn-icon" style={{ padding: '8px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}>
                        <Download size={18} />
                    </button>
                </div>
            </header>

            {/* 2. EXECUTIVE SNAPSHOT (Top Row) */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
                <SnapshotCard
                    label="Running Projects"
                    value={(dashboardData?.kpis?.totalProgrammes || 48).toLocaleString()}
                    change="+2.4%"
                    icon={Workflow}
                    color="#8b5cf6"
                    onClick={() => onModuleClick?.('projects')}
                />
                <SnapshotCard
                    label="Total Sponsors"
                    value={(dashboardData?.kpis?.totalSponsors || 2237).toLocaleString()}
                    change="+15.8%"
                    icon={HandHeart}
                    color="#f43f5e"
                    onClick={() => onModuleClick?.('contacts-customers')}
                />
                <SnapshotCard
                    label="Total Contacts"
                    value={(dashboardData?.kpis?.totalContacts || 12330).toLocaleString()}
                    change="+12.4%"
                    icon={Users2}
                    color="#10b981"
                    onClick={() => onModuleClick?.('contacts')}
                />
                <SnapshotCard
                    label="Total Childs"
                    value={(dashboardData?.kpis?.totalChilds || 5208).toLocaleString()}
                    change="-1.2%"
                    icon={GraduationCap}
                    color="#f59e0b"
                    trend="down"
                    onClick={() => onModuleClick?.('expenses')}
                />
                <SnapshotCard
                    label="Total Invoices"
                    value={(dashboardData?.kpis?.totalInvoiceCount || 156).toLocaleString()}
                    subValue={new Intl.NumberFormat('en-US', { style: 'currency', currency: dashboardData?.kpis.currency || 'BDT', maximumFractionDigits: 0 }).format(dashboardData?.kpis?.totalInvoiceAmount || 12500000)}
                    change="+8.2%"
                    icon={FileText}
                    color="#3b82f6"
                    onClick={() => setIsInvoiceDetailsOpen(true)}
                />
            </section>

            {/* 2.5 ANALYTICS DASHBOARD - COMPACT GRID */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '12px' }}>
                {/* Chart 1: Revenue Trend - Line Chart */}
                <div className="glass-panel" style={{ padding: '16px' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Monthly Revenue Trend</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={[
                            { month: 'Jan', revenue: 4200, target: 4000 },
                            { month: 'Feb', revenue: 5100, target: 4500 },
                            { month: 'Mar', revenue: 4800, target: 5000 },
                            { month: 'Apr', revenue: 6200, target: 5500 },
                            { month: 'May', revenue: 5800, target: 5500 },
                            { month: 'Jun', revenue: 7100, target: 6000 }
                        ]}>
                            <XAxis dataKey="month" stroke="var(--text-dim)" style={{ fontSize: '10px' }} />
                            <YAxis stroke="var(--text-dim)" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '11px' }} />
                            <Line type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8', r: 4 }} />
                            <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2: Project Distribution - Donut */}
                <div className="glass-panel" style={{ padding: '16px' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Project Distribution</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <RePieChart>
                            <Pie
                                data={dashboardData?.projects.sectors?.length ? dashboardData.projects.sectors : [
                                    { name: 'Education', value: 40 },
                                    { name: 'Health', value: 30 },
                                    { name: 'Nutrition', value: 20 },
                                    { name: 'Protection', value: 10 }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={70}
                                paddingAngle={6}
                                dataKey="value"
                            >
                                {(dashboardData?.projects.sectors?.length ? dashboardData.projects.sectors : [
                                    { name: 'Education', value: 40 },
                                    { name: 'Health', value: 30 },
                                    { name: 'Nutrition', value: 20 },
                                    { name: 'Protection', value: 10 }
                                ]).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={['#38bdf8', '#fbbf24', '#818cf8', '#f472b6', '#10b981', '#f59e0b', '#8b5cf6'][index % 7]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '11px' }} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 3: Expense Breakdown - Area Chart */}
                <div className="glass-panel" style={{ padding: '16px' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Expense Flow Analysis</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={[
                            { week: 'W1', operational: 280, program: 180 },
                            { week: 'W2', operational: 320, program: 220 },
                            { week: 'W3', operational: 290, program: 280 },
                            { week: 'W4', operational: 350, program: 240 }
                        ]}>
                            <defs>
                                <linearGradient id="colorOp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="week" stroke="var(--text-dim)" style={{ fontSize: '10px' }} />
                            <YAxis stroke="var(--text-dim)" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '11px' }} />
                            <Area type="monotone" dataKey="operational" stroke="#fb7185" fillOpacity={1} fill="url(#colorOp)" />
                            <Area type="monotone" dataKey="program" stroke="#34d399" fillOpacity={1} fill="url(#colorProg)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 4: Team Efficiency - Horizontal Bar */}
                <div className="glass-panel" style={{ padding: '16px' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Department Efficiency</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart layout="vertical" data={[
                            { dept: 'HR', score: 92 },
                            { dept: 'Finance', score: 88 },
                            { dept: 'Programs', score: 95 },
                            { dept: 'Admin', score: 78 }
                        ]}>
                            <XAxis type="number" stroke="var(--text-dim)" style={{ fontSize: '10px' }} />
                            <YAxis type="category" dataKey="dept" stroke="var(--text-dim)" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '11px' }} />
                            <Bar dataKey="score" fill="#818cf8" radius={[0, 8, 8, 0]} barSize={20}>
                                <Cell fill="#34d399" />
                                <Cell fill="#38bdf8" />
                                <Cell fill="#fbbf24" />
                                <Cell fill="#f472b6" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* 3. DETAILED SECTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '12px' }}>

                {/* 4. DONOR & FUNDRAISING INTELLIGENCE */}
                <section className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart3 size={24} color="var(--primary)" /> FUNDRAISING HUB
                    </h3>

                    <div style={{ height: '220px', marginBottom: '24px' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>MONTHLY CONTRIBUTIONS (DEMO)</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData?.donor.impactTrends?.length ? dashboardData.donor.impactTrends : [
                                { month: 'Jan', revenue: 4500000, goal: 5000000 },
                                { month: 'Feb', revenue: 5200000, goal: 5000000 },
                                { month: 'Mar', revenue: 4800000, goal: 5000000 },
                                { month: 'Apr', revenue: 6100000, goal: 5500000 },
                                { month: 'May', revenue: 5500000, goal: 5500000 },
                                { month: 'Jun', revenue: 6700000, goal: 6000000 },
                            ]}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                />
                                <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={25} />
                                <Bar dataKey="goal" fill="rgba(255, 255, 255, 0.1)" radius={[6, 6, 0, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', transition: 'all 0.3s ease' }} className="hover-glow">
                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Donor Retention Rate</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>84.2%</span>
                                <ArrowUpRight size={14} color="#10b981" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', transition: 'all 0.3s ease' }} className="hover-glow">
                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Active Child Sponsors</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#3b82f6' }}>{dashboardData?.kpis.totalSponsors || 1240}</span>
                                <TrendingUp size={14} color="#3b82f6" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', borderRadius: '12px', background: 'rgba(245, 197, 24, 0.05)', border: '1px solid rgba(245, 197, 24, 0.1)', transition: 'all 0.3s ease' }} className="hover-glow">
                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Funding Pipeline</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)' }}>{dashboardData?.kpis.currency || 'BDT'} 45.2M</span>
                                <Activity size={14} color="var(--primary)" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* 5. FINANCE & DEPARTMENT PANEL */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '12px' }}>
                <section className="glass-panel" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <DollarSign size={20} color="var(--primary)" /> FINANCE & LIQUIDITY
                    </h3>
                    <div style={{ height: '200px', marginBottom: '24px' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>CASH FLOW TREND (DEMO)</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'W1', inflow: 400, outflow: 240 },
                                { name: 'W2', inflow: 300, outflow: 139 },
                                { name: 'W3', inflow: 200, outflow: 980 },
                                { name: 'W4', inflow: 278, outflow: 390 },
                            ]}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px' }} />
                                <Bar dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(dashboardData?.finance.liquidity?.length ? dashboardData.finance.liquidity : [
                            { name: 'Standard Chartered', balance: 4500000, company_id: [1, 'JAAGO Foundation'] },
                            { name: 'Dutch Bangla Bank', balance: 2800000, company_id: [1, 'JAAGO Foundation'] }
                        ]).map((l: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 197, 24, 0.1)', color: 'var(--primary)' }}><Building2 size={16} /></div>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>{l.name}</p>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{l.company_id[1]}</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: 900 }}>
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: dashboardData?.kpis.currency || 'BDT',
                                        maximumFractionDigits: 0
                                    }).format(l.balance || 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="glass-panel" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={24} color="var(--primary)" /> DEPARTMENT PERFORMANCE
                    </h3>
                    <div style={{ height: '220px', marginBottom: '24px' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>KPI EFFICIENCY INDEX (DEMO)</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={[
                                { name: 'HR', score: 85, color: '#10b981' },
                                { name: 'Finance', score: 92, color: '#3b82f6' },
                                { name: 'Programs', score: 78, color: 'var(--primary)' },
                                { name: 'Admin', score: 88, color: '#f472b6' },
                                { name: 'Donor Care', score: 95, color: '#8b5cf6' }
                            ]}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={25}>
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <Cell key={i} fill={['#10b981', '#3b82f6', 'var(--primary)', '#f472b6', '#8b5cf6'][i]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {(dashboardData?.dept.departments?.length ? dashboardData.dept.departments.slice(0, 4) : [
                            { name: 'Human Resources', total_employee: 45, efficiency: 85 },
                            { name: 'Finance', total_employee: 12, efficiency: 92 },
                            { name: 'Programs', total_employee: 120, efficiency: 78 },
                            { name: 'Admin', total_employee: 25, efficiency: 88 }
                        ]).map((d: any, i: number) => (
                            <div key={i} className="hover-glow" style={{ padding: '16px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => onModuleClick?.('employees')}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>{d.name.toUpperCase()}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{d.total_employee}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981' }}>{Math.round(d.efficiency || 85)}% KPI</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* 4. MODALS & OVERLAYS */}
            {isInvoiceDetailsOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '32px', border: '1px solid var(--primary)', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>INVOICE REVENUE ANALYTICS</h1>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Detailed breakdown of corporate & sponsor invoices from Odoo</p>
                            </div>
                            <button onClick={() => setIsInvoiceDetailsOpen(false)} className="btn-icon" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-glass)' }}>
                                <Activity size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Billed</p>
                                <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: dashboardData?.kpis.currency || 'BDT', maximumFractionDigits: 0 }).format(dashboardData?.kpis.totalInvoiceAmount || 0)}</p>
                            </div>
                            <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.1)' }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice Count</p>
                                <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-green)', marginTop: '4px' }}>{dashboardData?.kpis.totalInvoiceCount}</p>
                            </div>
                            <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(251, 113, 133, 0.05)', border: '1px solid rgba(251, 113, 133, 0.1)' }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Revenue / Inv</p>
                                <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: dashboardData?.kpis.currency || 'BDT', maximumFractionDigits: 0 }).format((dashboardData?.kpis.totalInvoiceAmount || 0) / (dashboardData?.kpis.totalInvoiceCount || 1))}</p>
                            </div>
                        </div>

                        <div style={{ background: 'var(--input-bg)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                                    <tr>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>INVOICE REF</th>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>PARTNER</th>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>ENTITY / COMPANY</th>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>AMOUNT ({dashboardData?.kpis.currency || 'BDT'})</th>
                                        <th style={{ padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(dashboardData?.kpis?.invoiceDetails && dashboardData.kpis.invoiceDetails.length > 0
                                        ? dashboardData.kpis.invoiceDetails
                                        : dashboardData?.kpis.companyBreakdown?.map((b: any, i: number) => ({
                                            id: i,
                                            ref: `INV/${(2024 - i)}/0${i + 1}`,
                                            partner: 'Multiple Partners',
                                            company: b.name,
                                            amount: b.revenue,
                                            status: 'posted'
                                        }))).map((inv: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                                <td style={{ padding: '16px', fontSize: '0.8rem', fontWeight: 700 }}>{inv.ref}</td>
                                                <td style={{ padding: '16px', fontSize: '0.8rem' }}>{inv.partner}</td>
                                                <td style={{ padding: '16px', fontSize: '0.8rem' }}>{inv.company}</td>
                                                <td style={{ padding: '16px', fontSize: '0.8rem', fontWeight: 800 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: dashboardData?.kpis.currency || 'BDT', maximumFractionDigits: 0 }).format(inv.amount)}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 800 }}>{inv.status?.toUpperCase() || 'POSTED'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helper Components ---

const SnapshotCard: React.FC<any> = ({ label, value, subValue, change, icon: Icon, color, trend = 'up', onClick }) => {
    return (
        <div className="glass-panel"
            onClick={onClick}
            style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s var(--easing)',
                cursor: 'pointer',
                background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                border: `1px solid ${color}30`,
                boxShadow: `0 8px 32px 0 ${color}15`,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 20px 40px 0 ${color}30`;
                e.currentTarget.style.borderColor = `${color}60`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 8px 32px 0 ${color}15`;
                e.currentTarget.style.borderColor = `${color}30`;
            }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{
                    padding: '12px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                    color: '#fff',
                    boxShadow: `0 8px 20px ${color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={24} />
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: trend === 'up' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: trend === 'up' ? '#10b981' : '#f87171',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    border: trend === 'up' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {change}
                </div>
            </div>

            <p style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                marginBottom: '8px',
                letterSpacing: '1.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>{label.toUpperCase()}</p>

            <h2 style={{
                fontSize: '2.2rem',
                fontWeight: 900,
                margin: 0,
                letterSpacing: '-1.5px',
                background: `linear-gradient(to bottom, #fff, #ccc)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>{value}</h2>

            {subValue && (
                <p style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    marginTop: '4px',
                    letterSpacing: '0.5px'
                }}>{subValue}</p>
            )}

            <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                opacity: 0.1,
                transform: 'rotate(-15deg)'
            }}>
                <Icon size={120} color={color} />
            </div>
        </div>
    );
};

export default StrategicOverview;
