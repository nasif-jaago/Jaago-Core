import React from 'react';
import {
    TrendingUp, TrendingDown, MoreVertical, Users as UsersIcon
} from 'lucide-react';
import {
    PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer
} from 'recharts';

interface KPIProps {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    goal?: string;
    progress?: number;
}

const KPICard: React.FC<KPIProps> = ({ title, value, change, isPositive, goal, progress }) => (
    <div className="card fade-in" style={{ flex: 1, minWidth: '220px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>{title}</p>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <span style={{ color: isPositive ? 'var(--primary)' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {change}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>vs last month</span>
        </div>
        {goal && (
            <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{progress}%</span>
                    <span style={{ color: 'var(--text-muted)' }}>Goal: {goal}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--input-bg)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }} />
                </div>
            </div>
        )}
    </div>
);

const pieData = [
    { name: 'Direct', value: 55640, color: '#f5c518' },
    { name: 'Organic', value: 11420, color: '#e6b800' },
    { name: 'Referral', value: 1840, color: '#18181b' },
    { name: 'Social', value: 2120, color: '#71717a' },
];

const areaData = [
    { name: '1', value: 30 }, { name: '2', value: 45 }, { name: '3', value: 35 },
    { name: '4', value: 60 }, { name: '5', value: 55 }, { name: '6', value: 80 },
];

const DashboardCore: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{title} Overview</h2>
                <div style={{
                    fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'var(--input-bg)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)'
                }}>
                    Today <TrendingDown size={14} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <KPICard title="Net revenue" value="$3,131,021" change="0.4%" isPositive={true} />
                <KPICard title="ARR" value="$1,511,121" change="32%" isPositive={true} />
                <KPICard title="Quarterly revenue goal" value="71%" change="Goal: $1.1M" isPositive={true} goal="$1.1M" progress={71} />
                <KPICard title="New orders" value="18,221" change="11%" isPositive={true} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Growth Overview</h3>
                        <MoreVertical size={16} color="var(--text-muted)" />
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ width: '220px', height: '220px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>102k</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Weekly Visits</p>
                            </div>
                        </div>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {pieData.map(item => (
                                <div key={item.name}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.name}</span>
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>${item.value.toLocaleString('en-US')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UsersIcon size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>New partners</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>862</span>
                                <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>-8%</span>
                            </div>
                        </div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '1.25rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Impact</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0', color: 'var(--text-main)' }}>$136,755.77</p>
                        <div style={{ height: '80px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={areaData}>
                                    <defs>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Active Engagement</h3>
                    <MoreVertical size={16} color="var(--text-muted)" />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '8px 12px' }}>Name</th>
                            <th style={{ padding: '8px 12px' }}>Contributions</th>
                            <th style={{ padding: '8px 12px' }}>Total Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Danny Liu', email: 'danny@gmail.com', deals: 1023, value: 37431, avatar: '1' },
                            { name: 'Bella Deviant', email: 'bella@gmail.com', deals: 963, value: 30423, avatar: '2' },
                            { name: 'Darrell Steward', email: 'darrell@gmail.com', deals: 843, value: 28649, avatar: '3' },
                        ].map((c, i) => (
                            <tr key={i} style={{ borderBottom: i === 2 ? 'none' : '1px solid var(--border)' }}>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img src={`https://i.pravatar.cc/150?u=cust${c.avatar}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                                        <div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-main)' }}>{c.deals.toLocaleString('en-US')}</td>
                                <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>${c.value.toLocaleString('en-US')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardCore;
