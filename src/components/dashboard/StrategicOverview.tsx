import React, { useState, useEffect } from 'react';
import {
    Users, Clock,
    CheckCircle2,
    Activity,
    Rocket, Info,
    Building2, Calendar, ChevronDown,
    TrendingUp, DollarSign, Briefcase,
    ArrowRight, AlertCircle, ShoppingCart,
    UserCircle, ShieldCheck
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { DashboardService } from '../../api/DashboardService';
import type { DashboardFilters } from '../../api/DashboardService';
import { fetchCompanies } from '../../api/odoo';

const StrategicOverview: React.FC = () => {
    // --- State ---
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState<any[]>([]);
    const [filters, setFilters] = useState<DashboardFilters>({
        companyIds: [],
        dateRange: {
            start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // YTD Start
            end: new Date().toISOString().split('T')[0]
        }
    });

    const [kpiData, setKpiData] = useState<any>(null);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

    // --- Loading Data ---
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
        try {
            const [kpis, finance, fundraising, hr] = await Promise.all([
                DashboardService.getStrategicKPIs(filters),
                DashboardService.getFinancialData(filters),
                DashboardService.getFundraisingData(filters),
                DashboardService.getHRData(filters)
            ]);

            setKpiData({ kpis, finance, fundraising, hr });
        } catch (err) {
            console.error("Dashboard Data Fetch Error", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Helpers ---
    const getCurrencyConfig = () => {
        if (filters.companyIds.length === 1) {
            const comp = companies.find(c => c.id === filters.companyIds[0]);
            if (comp) {
                if (comp.name.includes('UK')) return { code: 'GBP', locale: 'en-GB' };
                if (comp.name.includes('INC')) return { code: 'USD', locale: 'en-US' };
                if (comp.name.includes('Foundation') || comp.name.includes('Trust')) return { code: 'BDT', locale: 'en-US' };
            }
        }
        return { code: 'BDT', locale: 'en-US' }; // Default/Consolidated
    };

    const formatCurrency = (val: number, forceCurrency?: string) => {
        const config = getCurrencyConfig();
        const code = forceCurrency || config.code;
        const locale = code === 'GBP' ? 'en-GB' : code === 'USD' ? 'en-US' : 'en-US';

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: code,
            maximumFractionDigits: 0
        }).format(val);
    };

    const renderMultiCurrencyValue = (val: number) => {
        if (filters.companyIds.length === 1) return formatCurrency(val);

        // Mocking breakdown for consolidated view - In production, this would come from kpiData.breakdown
        const breakdown = [
            { label: 'Foundation', code: 'BDT', icon: '৳', color: 'var(--primary)', share: 0.65 },
            { label: 'JAAGO UK', code: 'GBP', icon: '£', color: '#10b981', share: 0.20 },
            { label: 'JAAGO INC', code: 'USD', icon: '$', color: '#3b82f6', share: 0.15 }
        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{formatCurrency(val)}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
                    {breakdown.map(b => (
                        <div key={b.code} className="glass" style={{
                            padding: '6px 8px', borderRadius: '8px', borderLeft: `3px solid ${b.color}`,
                            background: 'var(--input-bg)', display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: b.color }}>{b.icon}</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700 }}>{b.label}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{formatCurrency(val * b.share, b.code)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const toggleCompany = (id: number) => {
        const newIds = filters.companyIds.includes(id)
            ? filters.companyIds.filter(cid => cid !== id)
            : [...filters.companyIds, id];
        setFilters({ ...filters, companyIds: newIds });
    };

    const getActivePreset = () => {
        const now = new Date();
        const startYTD = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        const startMTD = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const quarter = Math.floor(now.getMonth() / 3);
        const startQTD = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];

        if (filters.dateRange.start === startMTD) return 'MTD';
        if (filters.dateRange.start === startQTD) return 'QTD';
        if (filters.dateRange.start === startYTD) return 'YTD';
        return 'Custom';
    };

    const periodLabel = getActivePreset();

    if (loading && !kpiData) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <div className="logo-loader" style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', opacity: 0.4, color: 'var(--primary)' }}>
                        <svg width="120" height="120" viewBox="0 0 512 512" fill="currentColor">
                            <path d="M304.5,417.4c0,0-5.7,3.1-13.9,5.2c-8.2,2.1-12.4,5.2-12.4,5.2s2.1,10.3,1.5,13.9s-1.5,12.9-1.5,12.9s-15.5-2.6-18.6-4.6 c-3.1-2.1-7.2-1-7.2-1s-3.6,18.6-6.2,23.2s-7.2,14.4-12.9,12.9s-23.7-30.9-23.7-30.9s-19.1-31.4-19.1-38.7s4.1-12.9,4.1-12.9 s16-2.1,20.6-5.7s11.9-10.3,11.9-10.3s6.7-27.8,7.7-34c1-6.2-7.2-16.5-7.2-16.5s-19.1-19.1-22.2-22.7c-3.1-3.6,10.3-25.2,12.4-28.3 c2.1-3.1,12.4-7.2,12.4-7.2s11.3-4.1,13.9-6.7s11.9-15.5,11.9-15.5s17,21.1,19.6,23.7s18,29.4,18,29.4s11.9,13.4,14.4,14.4 s19.1-6.7,21.1-7.7s13.4-1,16,1s7.7,11.3,7.7,11.3s-0.5,11.9-0.5,16.5s9.8,24.2,9.8,24.2s-2.1,14.4-4.6,22.2 S304.5,417.4,304.5,417.4z M172.9,131.2c0,0-6.2,4.6-5.2,12.4c1,7.7,11.9,43.3,11.9,43.3s7.7,14.4,10.3,13.9c2.6-0.5,16.5-6.2,16.5-6.2 s21.6,11.3,27.8,11.9s20.6-0.5,20.6-0.5s15.5,11.3,17,14.4s13.4,51.5,13.4,51.5s7.2,25.2,11.9,25.8c4.6,0.5,33.5-1,33.5-1 s14.4-8.2,16.5-11.3s10.3-19.1,10.3-19.1s27.8-3.1,34-6.7s31.4-25.2,31.4-25.2s11.3,2.6,14.4-1.5s4.1-13.4,4.1-13.4s10.8-27.3,8.8-35.6 c-2.1-8.2-2.1-23.7-2.1-23.7s-10.8-49-13.9-53.1s-21.6-18-21.6-18s-11.9-3.1-18-1s-36.6,14.4-36.6,14.4s-8.2,0.5-12.9-4.1 s-27.3-33-30.9-34.5s-46.9,8.2-46.9,8.2s-12.4,10.8-19.1,13.9s-14.4-1.5-14.4-1.5l-2.6,22.2l-22.2,2.1L172.9,131.2z" />
                        </svg>
                    </div>
                    <span style={{
                        fontSize: '4.5rem', fontWeight: 900, color: 'var(--text-main)',
                        fontFamily: "'Playfair Display', serif", zIndex: 1, position: 'relative',
                        lineHeight: 1, marginTop: '-10px'
                    }}>j</span>
                </div>
                <div className="loader-text" style={{
                    fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)',
                    letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.8
                }}>Initializing Core</div>
            </div>
        );
    }

    return (
        <div className="strategic-dashboard fade-in" style={{
            background: 'transparent',
            padding: 'clamp(1rem, 3vw, 2rem)',
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '1600px',
            margin: '0 auto'
        }}>
            <div className="ambient-glow" style={{ top: '10%', left: '10%', opacity: 'var(--glow-opacity)' }} />
            <div className="ambient-glow" style={{ bottom: '10%', right: '10%', background: 'radial-gradient(circle, var(--accent-blue) 0%, transparent 70%)', opacity: 'calc(var(--glow-opacity) * 0.5)' }} />

            {/* --- HERO HEADER --- */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                marginBottom: 'clamp(2rem, 5vw, 4rem)', padding: '2rem 0', position: 'relative',
                gap: '2.5rem', width: '100%'
            }}>
                <div style={{ transform: 'translateZ(50px)', maxWidth: '600px' }}>
                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, margin: 0,
                        letterSpacing: '-1.5px', lineHeight: 1,
                        background: 'linear-gradient(to bottom, var(--text-main) 0%, var(--text-dim) 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        fontFamily: "'Playfair Display', serif"
                    }}>
                        JAAGO CORE
                    </h1>
                    <p style={{
                        fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 800,
                        marginTop: '8px', letterSpacing: '4px', textTransform: 'uppercase',
                        opacity: 0.9
                    }}>
                        Organizational Dashboard
                    </p>
                </div>

                <div style={{
                    display: 'flex', gap: '16px', alignItems: 'center',
                    flexWrap: 'wrap', justifyContent: 'center', width: '100%',
                    maxWidth: '1200px'
                }}>
                    {/* Multi-Company Selector */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                            className="btn-3d"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                boxShadow: 'var(--shadow-3d)',
                                border: '1px solid var(--primary)',
                                textShadow: 'none',
                                padding: '8px 20px',
                                fontSize: '0.75rem'
                            }}
                        >
                            <Building2 size={16} color="var(--primary)" />
                            {filters.companyIds.length === 0 ? 'ALL ENTITIES' : `${filters.companyIds.length} SELECTED`}
                            <ChevronDown size={12} />
                        </button>

                        {isCompanyDropdownOpen && (
                            <>
                                <div
                                    onClick={() => setIsCompanyDropdownOpen(false)}
                                    style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                                />
                                <div className="glass-panel fade-in" style={{
                                    position: 'absolute', top: '120%', left: '50%', transform: 'translateX(-50%)', zIndex: 1001,
                                    padding: '20px', borderRadius: '24px',
                                    width: 'min(400px, 85vw)', boxShadow: '0 30px 60px rgba(0,0,0,0.7)',
                                    border: '1px solid var(--primary)',
                                    display: 'flex', flexDirection: 'column', gap: '14px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '4px', position: 'relative' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '3px', textAlign: 'center' }}>SELECT ENTITIES</p>
                                        <button
                                            onClick={() => { setFilters({ ...filters, companyIds: [] }); setIsCompanyDropdownOpen(false); }}
                                            style={{
                                                position: 'absolute', right: 0, background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--border-glass)', padding: '4px 10px', borderRadius: '6px',
                                                color: 'var(--text-main)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            Reset All
                                        </button>
                                    </div>
                                    <div style={{
                                        maxHeight: '300px', overflowY: 'auto',
                                        display: 'grid', gridTemplateColumns: '1fr',
                                        gap: '8px', paddingRight: '10px'
                                    }}>
                                        {companies.map(c => {
                                            const isSelected = filters.companyIds.includes(c.id);
                                            return (
                                                <div
                                                    key={c.id}
                                                    onClick={() => toggleCompany(c.id)}
                                                    style={{
                                                        padding: '12px', borderRadius: '16px', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        background: isSelected ? 'rgba(245, 197, 24, 0.12)' : 'var(--input-bg)',
                                                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-glass)'}`,
                                                        transition: 'all 0.2s',
                                                        transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '22px', height: '22px', borderRadius: '8px',
                                                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-glass)'}`,
                                                        background: isSelected ? 'var(--primary)' : 'transparent',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {isSelected && <CheckCircle2 size={14} color="#000" strokeWidth={3} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--text-main)' : 'var(--text-dim)' }}>{c.name}</p>
                                                        <p style={{ fontSize: '0.65rem', color: 'var(--primary)', opacity: 0.7 }}>ID: {c.id}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setIsCompanyDropdownOpen(false)}
                                        className="btn-3d"
                                        style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '0.85rem' }}
                                    >
                                        Apply Selected Entities
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Date Filter */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* Presets */}
                        <div className="glass-panel" style={{ padding: '8px', borderRadius: '20px', display: 'flex', gap: '8px' }}>
                            {['MTD', 'QTD', 'YTD'].map(preset => {
                                const now = new Date();
                                let calculatedStart = new Date(now.getFullYear(), 0, 1);
                                if (preset === 'MTD') calculatedStart = new Date(now.getFullYear(), now.getMonth(), 1);
                                if (preset === 'QTD') {
                                    const quarter = Math.floor(now.getMonth() / 3);
                                    calculatedStart = new Date(now.getFullYear(), quarter * 3, 1);
                                }

                                const startStr = calculatedStart.toISOString().split('T')[0];
                                const isActive = filters.dateRange.start === startStr;

                                return (
                                    <button
                                        key={preset}
                                        onClick={() => {
                                            setFilters({
                                                ...filters,
                                                dateRange: {
                                                    start: startStr,
                                                    end: now.toISOString().split('T')[0]
                                                }
                                            });
                                        }}
                                        className={isActive ? 'btn-3d' : ''}
                                        style={{
                                            padding: isActive ? '10px 24px' : '10px 20px',
                                            borderRadius: '14px', border: 'none',
                                            background: isActive ? 'var(--primary-gradient)' : 'transparent',
                                            color: isActive ? '#000' : 'var(--text-dim)',
                                            fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            boxShadow: isActive ? '0 5px 15px var(--primary-glow)' : 'none'
                                        }}
                                    >
                                        {preset}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Date Range */}
                        <div className="glass-panel" style={{
                            padding: '12px 28px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '18px',
                            fontSize: '0.9rem'
                        }}>
                            <Calendar size={20} color="var(--primary)" />
                            <input
                                type="date"
                                value={filters.dateRange.start}
                                onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                                style={{
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '10px',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    width: '150px',
                                    padding: '6px 12px'
                                }}
                            />
                            <ArrowRight size={18} color="var(--text-dim)" />
                            <input
                                type="date"
                                value={filters.dateRange.end}
                                onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
                                style={{
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '10px',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    width: '150px',
                                    padding: '6px 12px'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 1. STRATEGIC OVERVIEW (Executive KPIs) --- */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <KPICard
                    label="Total Active Projects"
                    value={kpiData?.kpis?.activeProjects || 0}
                    change="+5%" icon={Briefcase}
                />
                <KPICard
                    label={`Total Revenue (${periodLabel})`}
                    value={kpiData?.kpis?.totalRevenue || 0}
                    isCurrency
                    renderValue={renderMultiCurrencyValue}
                    change="+12%" icon={DollarSign} color="var(--primary)"
                />
                <KPICard
                    label="Active Beneficiaries"
                    value="12,450"
                    change="+8%" icon={Users} color="#10b981"
                />
                <KPICard
                    label={`Consolidated Surplus (${periodLabel})`}
                    value={kpiData?.kpis?.netSurplus || 0}
                    isCurrency
                    renderValue={renderMultiCurrencyValue}
                    change="+3%" icon={TrendingUp} color="#3b82f6"
                />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* --- 2. PROGRAMME & FINANCIAL HEALTH --- */}
                <Section title="Financial Overview & Burn Rate">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <div style={{ height: '250px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { month: 'Jan', rev: 120000, exp: 95000 },
                                    { month: 'Feb', rev: 135000, exp: 102000 },
                                    { month: 'Mar', rev: 158000, exp: 110000 },
                                    { month: 'Apr', rev: 142000, exp: 108000 },
                                    { month: 'May', rev: 190000, exp: 125000 }
                                ]}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="var(--text-dim)" fontSize={11} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} />
                                    <Area type="monotone" dataKey="rev" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="exp" stroke="#ef4444" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <MetricRow label="Program Expense Ratio" value="78%" icon={Activity} sub="Target: 80%" />
                            <MetricRow label="Monthly Burn Rate (Avg)" value={formatCurrency(115000)} icon={Clock} sub="Standardized per month" />
                            <MetricRow label="Odoo Invoices Paid" value="92%" icon={CheckCircle2} sub="Last 30 days" />
                        </div>
                    </div>
                </Section>

                {/* --- 3. BANKS & CASH POSITION --- */}
                <Section title="Banks & Cash Position">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {kpiData?.finance?.journals.map((j: any, i: number) => (
                            <div key={i} className="glass-panel" style={{ padding: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 197, 24, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={20} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{j.name}</p>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{j.type.toUpperCase()} ACCOUNT</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{formatCurrency(j.balance)}</p>
                                    <p style={{ fontSize: '0.65rem', color: '#10b981' }}>Available</p>
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>TOTAL CONSOLIDATED LIQUIDITY</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>{formatCurrency(kpiData?.finance?.bankBalance || 0)}</p>
                        </div>
                    </div>
                </Section>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem'
            }}>
                {/* --- 4. CRM & FUNDRAISING --- */}
                <Section title="Fundraising & CRM">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ height: '140px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { label: 'Donations', value: 45 },
                                    { label: 'Sponsors', value: 82 },
                                    { label: 'Subscrip', value: 65 },
                                    { label: 'Grants', value: 30 }
                                ]}>
                                    <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                                    <XAxis dataKey="label" display="none" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <StatBlock label="Pipeline Value" value={formatCurrency(kpiData?.fundraising?.pipelineValue || 0)} />
                            <StatBlock label="Recurring Rev" value={formatCurrency(kpiData?.fundraising?.recurringRevenue || 0)} />
                            <StatBlock label="Donor Retention" value="84%" />
                            <StatBlock label="Lead Conversion" value="12%" />
                        </div>
                    </div>
                </Section>

                {/* --- 5. HR, PAYROLL & TIME OFF --- */}
                <Section title="Human Resources & Ops">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <MetricRow label="Headcount (Total)" value={kpiData?.kpis?.employeeCount || '0'} icon={UserCircle} sub="Across all entities" />
                        <MetricRow label="Payroll Status" value="Processing" icon={ShieldCheck} sub="Odoo Payslip Generation" color="#fbbf24" />
                        <MetricRow label="Active Time Off" value={kpiData?.hr?.activeLeaves || '0'} icon={Clock} sub="Validated requests" />
                        <div style={{ height: '60px', marginTop: '10px' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '8px' }}>DEPARTMENTAL DISTRIBUTION</p>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <div style={{ flex: 4, height: '8px', background: 'var(--primary)', borderRadius: '4px' }} />
                                <div style={{ flex: 2, height: '8px', background: '#3b82f6', borderRadius: '4px' }} />
                                <div style={{ flex: 1, height: '8px', background: '#10b981', borderRadius: '4px' }} />
                                <div style={{ flex: 3, height: '8px', background: '#ef4444', borderRadius: '4px' }} />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* --- 6. INVENTORY & YOUTH ENGAGEMENT --- */}
                <Section title="JAAGO Youth & Inventory">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <Rocket size={20} color="var(--primary)" />
                                <span style={{ fontWeight: 800 }}>Youth Volunteers</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>20,000+</span>
                                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>+20% YOY</span>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <ShoppingCart size={20} color="#3b82f6" />
                                <span style={{ fontWeight: 800 }}>Inventory Status</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>LOW STOCK ALERTS</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>12 Items</p>
                                </div>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertCircle size={20} color="#ef4444" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            <style>{`
                .strategic-dashboard {
                    perspective: 1500px;
                }
                .card-hover:hover {
                    transform: translateY(-10px) rotateX(4deg);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
                    border-color: var(--primary);
                }
            `}</style>
        </div>
    );
};

// --- Sub-Components ---

const KPICard: React.FC<{
    label: string,
    value: any,
    change: string,
    icon: any,
    color?: string,
    isCurrency?: boolean,
    renderValue?: (val: any) => React.ReactNode
}> = ({ label, value, change, icon: Icon, color = '#fff', isCurrency, renderValue }) => (
    <div className={`card-3d fade-in glass-panel ${isCurrency ? 'currency-card' : ''}`} style={{ padding: '2rem', minHeight: '180px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
            }}>
                <Icon size={24} color={color === '#fff' ? 'var(--primary)' : color} />
            </div>
            <div style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem',
                fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
                {change}
            </div>
        </div>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '10px', letterSpacing: '1px' }}>{label.toUpperCase()}</p>
        <div style={{ position: 'relative', zIndex: 1 }}>
            {renderValue ? renderValue(value) : <h2 style={{ fontSize: '2.25rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>{value}</h2>}
        </div>

        {/* Glow Element */}
        <div style={{
            position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
            background: color === '#fff' ? 'var(--primary-glow)' : color,
            opacity: 'var(--glow-opacity)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none'
        }} />
    </div>
);

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '28px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.5px', color: 'var(--text-main)' }}>{title}</h3>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)' }}>
                <Info size={14} color="var(--text-dim)" />
            </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
        </div>
    </div>
);

const MetricRow: React.FC<{ label: string, value: any, icon: any, sub: string, color?: string }> = ({ label, value, icon: Icon, sub, color = 'var(--primary)' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{sub}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{value}</p>
        </div>
    </div>
);

const StatBlock: React.FC<{ label: string, value: any }> = ({ label, value }) => (
    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.5px' }}>{label.toUpperCase()}</p>
        <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{value}</p>
    </div>
);

export default StrategicOverview;
