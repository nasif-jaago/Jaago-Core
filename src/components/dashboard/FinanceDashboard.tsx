import React, { useEffect, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    AreaChart, Area
} from 'recharts';
import {
    DollarSign, CreditCard, Landmark,
    ArrowUpRight, ArrowDownRight, RefreshCw,
    Activity
} from 'lucide-react';
import { fetchFinanceStats } from '../../api/FinanceService';

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const FinanceDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const result = await fetchFinanceStats();
        if (result.success) {
            setData(result.data);
        }
        setLoading(false);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#0f172a' }}>
            <RefreshCw className="spin" size={32} />
        </div>
    );

    const invoices = data?.invoices || [];
    const bills = data?.bills || [];
    const payments = data?.payments || [];

    // KPI Calculations
    const totalInvoiced = invoices.reduce((acc: number, curr: any) => acc + curr.amount_total, 0);
    const totalBills = bills.reduce((acc: number, curr: any) => acc + curr.amount_total, 0);

    const netIncome = totalInvoiced - totalBills;

    // Revenue Trend (Invoices by Month)
    const monthlyRevenue: any = {};
    invoices.forEach((inv: any) => {
        if (!inv.invoice_date) return;
        const month = new Date(inv.invoice_date).toLocaleString('default', { month: 'short' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + inv.amount_total;
    });

    const revenueData = Object.keys(monthlyRevenue).map(month => ({
        month,
        revenue: monthlyRevenue[month]
    })).slice(-6);

    // Expense Trend (Bills by Month)
    const monthlyExpense: any = {};
    bills.forEach((bill: any) => {
        if (!bill.invoice_date) return;
        const month = new Date(bill.invoice_date).toLocaleString('default', { month: 'short' });
        monthlyExpense[month] = (monthlyExpense[month] || 0) + bill.amount_total;
    });

    const combinedTrend = revenueData.map(r => ({
        ...r,
        expense: monthlyExpense[r.month] || 0
    }));

    return (
        <div className="finance-dashboard fade-in" style={{ padding: '24px', background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-main)' }}>

            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>FINANCIAL <span style={{ color: 'var(--primary)' }}>OVERVIEW</span></h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '4px' }}>Real-time accounting performance and cash flow analysis</p>
                </div>
                <button onClick={loadData} className="btn-3d" style={{ padding: '12px 24px', fontSize: '0.8rem' }}>
                    <RefreshCw size={18} style={{ marginRight: '8px' }} /> Sync ERP
                </button>
            </div>

            {/* Main KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ padding: '24px', transition: 'transform 0.3s var(--easing)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px', color: '#3b82f6' }}><DollarSign size={22} /></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowUpRight size={14} /> 12%</span>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', letterSpacing: '1px' }}>TOTAL REVENUE</p>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>${(totalInvoiced / 1000).toFixed(1)}k</div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', transition: 'transform 0.3s var(--easing)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px', color: '#ef4444' }}><CreditCard size={22} /></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowDownRight size={14} /> 5%</span>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', letterSpacing: '1px' }}>TOTAL EXPENSES</p>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>${(totalBills / 1000).toFixed(1)}k</div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', transition: 'transform 0.3s var(--easing)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px', color: '#10b981' }}><Landmark size={22} /></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>HEALTHY</span>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', letterSpacing: '1px' }}>NET CASH FLOW</p>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>${(netIncome / 1000).toFixed(1)}k</div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', background: 'var(--primary-gradient)', border: 'none', transition: 'transform 0.3s var(--easing)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '12px', color: '#000' }}><Activity size={22} /></div>
                    </div>
                    <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px', letterSpacing: '1px' }}>PROFIT MARGIN</p>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#000' }}>{((netIncome / (totalInvoiced || 1)) * 100).toFixed(1)}%</div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>

                {/* Revenue vs Expense Area Chart */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Revenue vs Expenses Trend</h3>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}><div style={{ width: 10, height: 10, borderRadius: '3px', background: '#3b82f6' }}></div> REVENUE</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}><div style={{ width: 10, height: 10, borderRadius: '3px', background: '#ef4444' }}></div> EXPENSE</div>
                        </div>
                    </div>
                    <div style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={combinedTrend}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-glass)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid var(--border-glass)', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', color: 'var(--text-main)' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Journal Breakdown */}
                <div className="glass-panel" style={{ padding: '32px', overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px' }}>Journal Activity</h3>
                    <div style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={(() => {
                                        const journalCounts = payments.reduce((acc: any, curr: any) => {
                                            const j = curr.journal_id ? curr.journal_id[1] : 'Other';
                                            acc[j] = (acc[j] || 0) + 1;
                                            return acc;
                                        }, {});

                                        const sorted = Object.keys(journalCounts)
                                            .map(name => ({ name, value: journalCounts[name] }))
                                            .sort((a, b) => b.value - a.value);

                                        if (sorted.length > 5) {
                                            const top5 = sorted.slice(0, 5);
                                            const otherValue = sorted.slice(5).reduce((acc, curr) => acc + curr.value, 0);
                                            return [...top5, { name: 'Others', value: otherValue }];
                                        }
                                        return sorted;
                                    })()}
                                    innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value"
                                    label={false}
                                >
                                    {COLORS.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Recent Transactions */}
            <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Recent Accounting Entries</h3>
                    <button className="btn-3d" style={{ padding: '10px 20px', fontSize: '0.75rem' }}>VIEW FULL LEDGER</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)' }}>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>REFERENCE</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>PARTNER</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>DATE</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>STATUS</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...invoices, ...bills].sort((a: any, b: any) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()).slice(0, 5).map((move: any, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.3s' }} className="table-row-hover">
                                    <td style={{ padding: '20px', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem' }}>{move.name}</td>
                                    <td style={{ padding: '20px', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>{move.partner_id ? move.partner_id[1] : '-'}</td>
                                    <td style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{move.invoice_date}</td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{
                                            padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800,
                                            background: move.state === 'posted' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: move.state === 'posted' ? '#10b981' : '#f59e0b',
                                            border: `1px solid ${move.state === 'posted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                        }}>{move.state === 'posted' ? 'VALIDATED' : 'DRAFT'}</span>
                                    </td>
                                    <td style={{ padding: '20px', fontWeight: 900, textAlign: 'right', color: move.move_type === 'out_invoice' ? '#10b981' : '#ef4444', fontSize: '0.95rem' }}>
                                        {move.move_type === 'out_invoice' ? '+' : '-'}{move.amount_total.toLocaleString('en-US')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .spin { animation: spin-anim 2s linear infinite; }
                @keyframes spin-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .table-row-hover:hover { background: rgba(255, 255, 255, 0.02); }
                [data-theme='light'] .table-row-hover:hover { background: rgba(0, 0, 0, 0.01); }
            `}</style>
        </div>
    );
};

export default FinanceDashboard;
