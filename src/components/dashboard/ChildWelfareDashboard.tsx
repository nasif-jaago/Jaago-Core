import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    AreaChart, Area
} from 'recharts';
import {
    Users, Briefcase, RefreshCw
} from 'lucide-react';
import { fetchCWDStats } from '../../api/CWDService';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const ChildWelfareDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const result = await fetchCWDStats();
        if (result.success) {
            setData(result.data);
        }
        setLoading(false);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#8b5cf6' }}>
            <RefreshCw className="spin" size={32} />
        </div>
    );

    const sales = data?.sales || [];
    const crm = data?.crm || [];
    const tasks = data?.tasks || [];
    const invoices = data?.invoices || [];

    // --- Invoice Stats ---
    const totalInvoiced = invoices.reduce((acc: number, curr: any) => acc + curr.amount_total, 0);
    const totalUnpaid = invoices.reduce((acc: number, curr: any) => acc + curr.amount_residual, 0);
    const avgInvoice = invoices.length > 0 ? totalInvoiced / invoices.length : 0;

    // Invoiced by Month logic
    const monthlyInvoiced: any = {};
    invoices.forEach((inv: any) => {
        if (!inv.invoice_date) return;
        const date = new Date(inv.invoice_date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        monthlyInvoiced[monthYear] = (monthlyInvoiced[monthYear] || 0) + inv.amount_total;
    });

    const invoicedChartData = Object.keys(monthlyInvoiced).map(month => ({
        month,
        amount: monthlyInvoiced[month]
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // --- Sales Leaders ---
    const salesByPerson: any = {};
    sales.forEach((s: any) => {
        const name = s.user_id ? s.user_id[1] : 'Unassigned';
        salesByPerson[name] = (salesByPerson[name] || 0) + s.amount_total;
    });
    const salesPersonData = Object.keys(salesByPerson).map(name => ({
        name,
        total: Math.round(salesByPerson[name])
    })).sort((a, b) => b.total - a.total).slice(0, 5);

    return (
        <div className="fade-in" style={{ padding: '24px', background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-main)' }}>

            {/* Elegant Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>CHILD <span style={{ color: 'var(--primary)' }}>WELFARE</span></h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '4px' }}>Impact tracking and resource allocation metrics</p>
                </div>
                <button onClick={loadData} className="btn-3d" style={{ padding: '12px 24px', fontSize: '0.8rem' }}>
                    <RefreshCw size={18} style={{ marginRight: '8px' }} /> Refresh Data
                </button>
            </div>

            {/* Top KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '24px', transition: 'transform 0.3s var(--easing)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '1px' }}>INVOICED</p>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                        {totalInvoiced > 1000 ? `${(totalInvoiced / 1000).toFixed(1)}k` : totalInvoiced.toFixed(0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                        <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>
                            {totalUnpaid > 1000 ? `${(totalUnpaid / 1000).toFixed(1)}k` : totalUnpaid.toFixed(0)} unpaid
                        </p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', transition: 'transform 0.3s var(--easing)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '1px' }}>AVERAGE INVOICE</p>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                        {avgInvoice > 1000 ? `${(avgInvoice / 1000).toFixed(1)}k` : avgInvoice.toFixed(0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                        <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>{invoices.length} total units</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', background: 'var(--primary-gradient)', border: 'none', transition: 'transform 0.3s var(--easing)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '1px' }}>ACTIVE CRM LEADS</p>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#000' }}>
                        {crm.length}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '2px', background: '#000' }} />
                        <p style={{ color: '#000', fontSize: '0.75rem', fontWeight: 800 }}>STRATEGIC PIPELINE</p>
                    </div>
                </div>
            </div>

            {/* Invoiced by Month Chart */}
            <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px' }}>Invoiced by Month</h3>
                <div style={{ height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={invoicedChartData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-glass)" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                            <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', backdropFilter: 'blur(10px)' }} />
                            <Area type="monotone" dataKey="amount" stroke="var(--primary)" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Invoices Table */}
            <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px' }}>Recent High-Value Invoices</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Reference</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Salesperson</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Customer</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.slice(0, 8).map((inv: any, i: number) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.3s' }} className="table-row-hover">
                                    <td style={{ padding: '20px', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem' }}>{inv.name}</td>
                                    <td style={{ padding: '20px', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>{inv.invoice_user_id?.[1] || '-'}</td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{
                                            padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800,
                                            background: inv.state === 'posted' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: inv.state === 'posted' ? '#10b981' : '#f59e0b',
                                            border: `1px solid ${inv.state === 'posted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                        }}>{inv.payment_state?.toUpperCase() || inv.state?.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '20px', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>{inv.partner_id?.[1]}</td>
                                    <td style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{inv.invoice_date}</td>
                                    <td style={{ padding: '20px', fontWeight: 900, textAlign: 'right', color: 'var(--text-main)', fontSize: '0.95rem' }}>${inv.amount_total.toLocaleString('en-US')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Row - CRM & Sales Leaders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {/* CRM Distribution */}
                <article style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #eef2ff' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e1b4b', marginBottom: '20px' }}>CRM Pipeline Stages</h3>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={Object.keys(crm.reduce((acc: any, curr: any) => {
                                        const stage = curr.stage_id ? curr.stage_id[1] : 'New';
                                        acc[stage] = (acc[stage] || 0) + 1;
                                        return acc;
                                    }, {})).map(stage => ({
                                        name: stage,
                                        value: crm.filter((c: any) => (c.stage_id ? c.stage_id[1] : 'New') === stage).length
                                    }))}
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={false}
                                >
                                    {COLORS.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </article>

                {/* Sales Leaders */}
                <article style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #eef2ff' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e1b4b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} color="#ec4899" /> Sales Leaders
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {salesPersonData.map((person, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                    {person.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{person.name}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>${person.total.toLocaleString('en-US')}</span>
                                    </div>
                                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${(person.total / (salesPersonData[0]?.total || 1)) * 100}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                {/* Team Tasks */}
                <article style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #eef2ff' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e1b4b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={18} color="#3b82f6" /> Activity Status
                    </h3>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tasks.slice(0, 6).map((t: any) => ({ name: t.name.substring(0, 10), val: Math.random() * 10 + 5 }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                                <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </article>
            </div>

            <style>{`
                .spin { animation: spin-anim 1s linear infinite; }
                @keyframes spin-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ChildWelfareDashboard;
