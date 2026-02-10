import React, { useEffect, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    Package, ShoppingCart, Calendar, Wrench,
    TrendingUp, RefreshCw, BarChart3
} from 'lucide-react';
import { fetchProcurementStats } from '../../api/ProcurementService';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const result = await fetchProcurementStats();
        if (result.success) {
            setStats(result.data);
        }
        setLoading(false);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <RefreshCw className="spin" size={32} />
        </div>
    );

    const poData = stats?.purchaseOrders || [];
    const totalSpend = poData.reduce((acc: number, curr: any) => acc + (curr.amount_total || 0), 0);
    const poCount = poData.length;
    const supplierCount = new Set(poData.map((po: any) => po.partner_id?.[0])).size;

    // Line Chart Data Processor
    const years = ['2018', '2019', '2020', '2021', '2022', '2023'];
    const timeData = years.map(year => ({
        year,
        spend: Math.floor(Math.random() * 20000) + 5000,
        orders: Math.floor(Math.random() * 10000) + 2000
    }));

    const vendorPerformanceData = [
        { name: 'Good', value: 60 },
        { name: 'Average', value: 30 },
        { name: 'Poor', value: 10 },
    ];

    const topVendors = [
        { name: 'Vendor A', spend: 800 },
        { name: 'Vendor B', spend: 750 },
        { name: 'Vendor C', spend: 600 },
        { name: 'Vendor D', spend: 550 },
        { name: 'Vendor E', spend: 450 },
    ];

    const complianceData = [
        { month: 'Jan', rate: 14 }, { month: 'Feb', rate: 12 }, { month: 'Apr', rate: 10 },
        { month: 'Mar', rate: 8 }, { month: 'Apr', rate: 8 }, { month: 'May', rate: 9 },
        { month: 'Jun', rate: 8 }, { month: 'Sep', rate: 9 }, { month: 'Dec', rate: 9 }
    ];

    return (
        <div className="procurement-dashboard fade-in" style={{ padding: '24px', background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-main)' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, textAlign: 'center', marginBottom: '40px', color: 'var(--text-main)', letterSpacing: '-1px', fontFamily: "'Playfair Display', serif" }}>
                PROCUREMENT & VENDOR PERFORMANCE
            </h1>

            {/* Top KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ background: 'var(--primary-gradient)', borderRadius: '24px', padding: '24px', color: '#000', textAlign: 'center', boxShadow: '0 20px 40px rgba(245, 197, 24, 0.2)' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>${(totalSpend / 1000000).toFixed(2)}M</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.8, letterSpacing: '1px' }}>TOTAL SPEND</div>
                </div>
                <div className="glass-panel" style={{ background: '#3b82f6', borderRadius: '24px', padding: '24px', color: 'white', textAlign: 'center', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{poCount}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.8, letterSpacing: '1px' }}>PURCHASE ORDERS</div>
                </div>
                <div className="glass-panel" style={{ background: '#f59e0b', borderRadius: '24px', padding: '24px', color: 'white', textAlign: 'center', boxShadow: '0 20px 40px rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{supplierCount}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.8, letterSpacing: '1px' }}>SUPPLIER COUNT</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ height: '32px', width: '100%', background: 'linear-gradient(90deg, #3b82f6 50%, #f59e0b 30%, #ef4444 20%)', borderRadius: '8px', marginBottom: '12px' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                        <span>SPEND BY</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '2px' }}></div> ORDERS</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '2px' }}></div> POOR</span>
                    </div>
                </div>
            </div>

            {/* Second row - Main charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                {/* Spend & Orders Over Time */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center', color: 'var(--text-main)', letterSpacing: '0.5px' }}>Spend & Orders Over Time</h3>
                    <div style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-glass)" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-dim)', fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-dim)', fontWeight: 600 }} />
                                <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} />
                                <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                                <Line type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={3} dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Score Chart */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[{ value: 60 }, { value: 40 }]} innerRadius={65} outerRadius={85} startAngle={90} endAngle={450} paddingAngle={0} dataKey="value" label={false}>
                                    <Cell fill="#10b981" />
                                    <Cell fill="var(--input-bg)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>60%</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, marginTop: '4px' }}>PERFORMANCE</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div> GOOD
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></div> AVERAGE
                        </div>
                    </div>
                </div>

                {/* Spend by Category */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center', color: 'var(--text-main)', letterSpacing: '0.5px' }}>Spend by Category</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ height: '24px', width: '100%', background: 'linear-gradient(90deg, #10b981 40%, #84cc16 30%, #f59e0b 20%, #ef4444 10%)', borderRadius: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}></div>
                        <div style={{ height: '24px', width: '70%', background: '#f59e0b', borderRadius: '8px', opacity: 0.9 }}></div>
                        <div style={{ height: '24px', width: '30%', background: '#3b82f6', borderRadius: '8px', opacity: 0.9 }}></div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                            <div style={{ width: 10, height: 10, background: '#10b981', borderRadius: '2px' }}></div> MARKETING
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                            <div style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '2px' }}></div> SUPPLIES
                        </div>
                    </div>
                </div>
            </div>

            {/* Third row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.25fr', gap: '24px' }}>
                {/* Vendor Performance */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Vendor Performance</h3>
                    <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={vendorPerformanceData} innerRadius={55} outerRadius={75} paddingAngle={0} dataKey="value" label={false}>
                                    {vendorPerformanceData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                            60%
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div> GOOD
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div> POOR
                        </div>
                    </div>
                </div>

                {/* Top Vendors by Spend */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Top Vendors by Spend</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {topVendors.map((vendor, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>{vendor.name}</span>
                                <div style={{ height: '16px', width: `${(vendor.spend / 800) * 100}%`, background: COLORS[i % 4], borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Compliance Rate by Month */}
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>Compliance Rate</h3>
                    <div style={{ height: '160px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={complianceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-glass)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-dim)', fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-dim)', fontWeight: 600 }} />
                                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Footer row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '32px' }}>
                <div className="btn-3d" style={{ height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 16px', color: '#000', fontSize: '0.8rem', fontWeight: 800, background: '#ef4444', border: 'none', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}>
                    <BarChart3 size={18} style={{ marginRight: 10 }} />
                    REVENUE PROTECTION - $759K
                </div>
                <div className="btn-3d" style={{ height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 16px', color: '#000', fontSize: '0.8rem', fontWeight: 800, background: '#f59e0b', border: 'none', boxShadow: '0 10px 20px rgba(245, 158, 11, 0.2)' }}>
                    <Calendar size={18} style={{ marginRight: 10 }} />
                    AT RISK CONTRACTS - $429K
                </div>
                <div className="btn-3d" style={{ height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 16px', color: '#000', fontSize: '0.8rem', fontWeight: 800, background: '#3b82f6', border: 'none', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUp size={18} style={{ marginRight: 10 }} />
                        COMPLIANCE TREND
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.3)', padding: '2px 10px', borderRadius: '6px' }}>+4%</div>
                </div>
            </div>

            {/* Module Integration Section */}
            <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <ShoppingCart size={22} color="#3b82f6" />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Purchase</h4>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{poData.filter((p: any) => p.state === 'purchase').length}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>CONFIRMED ORDERS</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Package size={22} color="#10b981" />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Inventory</h4>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats?.inventory?.filter((i: any) => i.state !== 'done' && i.state !== 'cancel').length || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>PENDING TRANSFERS</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Calendar size={22} color="#f59e0b" />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Meeting Room</h4>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats?.meetings?.length || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>UPCOMING BOOKINGS</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Wrench size={22} color="#ef4444" />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Maintenance</h4>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{stats?.maintenance?.filter((m: any) => m.state !== 'repaired').length || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>ACTIVE REQUESTS</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
