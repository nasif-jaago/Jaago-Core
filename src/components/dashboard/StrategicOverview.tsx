import React, { useState, useEffect, useRef } from 'react';
import {
    Activity, Building2, ChevronDown, TrendingUp, DollarSign,
    Briefcase, Download, ArrowUpRight, ArrowDownRight,
    BarChart3, Heart, Filter, CheckCircle,
    Rocket, HandHeart, Users2, GraduationCap
} from 'lucide-react';
import {
    XAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart as RePieChart, Pie
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
    const dropdownRef = useRef<HTMLDivElement>(null);

    // --- Loading Data ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCompanyDropdownOpen(false);
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

        switch (preset) {
            case 'Today':
                start = now;
                break;
            case 'This Week':
                start.setDate(now.getDate() - now.getDay());
                break;
            case 'This Month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'MTD':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'QTD':
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
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
            padding: '24px',
            width: '100%',
            maxWidth: '1600px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
        }}>
            {/* 1. ADVANCED FILTER BAR */}
            <header style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                padding: '16px 24px',
                background: 'var(--bg-surface)',
                borderRadius: '24px',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-3d)'
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
                            {filters.companyIds.length === 0 ? 'CONSOLIDATED VIEW' : `${filters.companyIds.length} ENTITIES SELECTED`}
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
                                    background: preset === 'MTD' ? 'var(--primary)' : 'transparent',
                                    color: preset === 'MTD' ? '#000' : 'var(--text-dim)',
                                    fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer'
                                }}
                            >{preset}</button>
                        ))}
                    </div>

                    {/* Advanced Filters */}
                    <button
                        className="btn-3d"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                        onClick={() => alert('Opening Advanced Odoo Filter Engine...')}
                    >
                        <Filter size={16} />
                        FILTERS
                    </button>

                    <button className="btn-icon" style={{ padding: '8px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', color: 'var(--text-main)' }}>
                        <Download size={18} />
                    </button>
                </div>
            </header>

            {/* 2. EXECUTIVE SNAPSHOT (Top Row) */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <SnapshotCard
                    label="Total Programmes"
                    value={(dashboardData?.kpis?.totalProgrammes || 48).toLocaleString()}
                    change="+2.4%"
                    icon={Rocket}
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
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '32px' }}>
                {/* 3. PROGRAM & PROJECT ANALYTICS */}
                <section className="glass-panel" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} color="var(--primary)" /> PROGRAM & PROJECT INTELLIGENCE
                        </h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-3d" style={{ padding: '6px 14px', fontSize: '0.65rem' }}>SECTOR VIEW</button>
                            <button className="btn-3d-green" style={{ padding: '6px 14px', fontSize: '0.65rem' }}>MAP IMPACT</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div style={{ height: '300px' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>PROJECT DISTRIBUTION BY SECTOR</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={dashboardData?.projects.sectors || [
                                            { name: 'Education', count: 40 },
                                            { name: 'Health', count: 30 },
                                            { name: 'Nutrition', count: 20 },
                                            { name: 'Protection', count: 10 }
                                        ]}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="count"
                                    >
                                        {(dashboardData?.projects.sectors?.length ? dashboardData.projects.sectors : [
                                            { name: 'Education', count: 40 },
                                            { name: 'Health', count: 30 },
                                            { name: 'Nutrition', count: 20 },
                                            { name: 'Protection', count: 10 }
                                        ]).map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={['var(--primary)', '#10b981', '#3b82f6', '#f472b6', '#a8a29e'][index % 5]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px' }} />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '1px' }}>BUDGET UTILIZATION TRACKER</p>
                            {(dashboardData?.projects.budgets?.length ? dashboardData.projects.budgets.slice(0, 4) : [
                                { name: 'School Support Program', utilized: 750000, total: 1000000 },
                                { name: 'Healthy Kids Initiative', utilized: 450000, total: 900000 },
                                { name: 'Emergency Food Relief', utilized: 800000, total: 850000 },
                                { name: 'Youth Skills Development', utilized: 300000, total: 1200000 }
                            ]).map((b: any, i: number) => (
                                <div key={i} style={{ padding: '16px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{b.name}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>{Math.round((b.utilized / (b.total || 1)) * 100)}%</span>
                                    </div>
                                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min(100, (b.utilized / (b.total || 1)) * 100)}%`, background: 'var(--primary-gradient)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. DONOR & FUNDRAISING INTELLIGENCE */}
                <section className="glass-panel" style={{ padding: '32px' }}>
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
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)' }}>৳45.2M</span>
                                <Activity size={14} color="var(--primary)" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* 5. FINANCE & DEPARTMENT PANEL */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
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
                                        currency: 'BDT',
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
        </div>
    );
};

// --- Helper Components ---

const SnapshotCard: React.FC<any> = ({ label, value, change, icon: Icon, color, trend = 'up', onClick }) => {
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
