import React, { useState, useEffect } from 'react';
import {
    Layout, Grid3X3, BarChart3, TrendingUp, PieChart,
    MousePointer2, Settings2, Plus, Move, Maximize2,
    Eye, Edit3, Trash2, Copy, FileText, Image as ImageIcon,
    Activity, DollarSign, Users, Clock, Globe, Heart,
    ChevronDown, Download, Filter, Save, Layers, Play
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, PieChart as RePieChart,
    Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Widget {
    id: string;
    type: string;
    title: string;
    x: number;
    y: number;
    w: number;
    h: number;
    config: any;
}

interface Tab {
    id: string;
    label: string;
}

const DashboardDesigner: React.FC = () => {
    // --- State ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [layout, setLayout] = useState<Widget[]>([
        { id: '1', type: 'numeric', title: 'Total AI Queries', x: 0, y: 0, w: 3, h: 2, config: { value: '15.5K', trend: '+12%', color: '#F5C518' } },
        { id: '2', type: 'line', title: 'Query Volume Trend', x: 3, y: 0, w: 6, h: 4, config: { color: '#F5C518' } },
        { id: '3', type: 'numeric', title: 'Avg Response Time', x: 9, y: 0, w: 3, h: 2, config: { value: '2.3s', trend: '-5%', color: '#10b981' } },
        { id: '4', type: 'bar', title: 'Usage by Model', x: 0, y: 4, w: 5, h: 4, config: { color: '#3b82f6' } },
        { id: '5', type: 'pie', title: 'Request Distribution', x: 5, y: 4, w: 4, h: 4, config: { color: '#ef4444' } },
        { id: '6', type: 'gauge', title: 'Model Efficiency', x: 9, y: 2, w: 3, h: 2, config: { value: 85, color: '#f472b6' } }
    ]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // --- Mock Data ---
    const lineData = [
        { name: 'Jan', value: 400 }, { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 }, { name: 'Apr', value: 800 },
        { name: 'May', value: 500 }, { name: 'Jun', value: 900 }
    ];

    const barData = [
        { name: 'GPT-4', value: 45 }, { name: 'GPT-3.5', value: 30 },
        { name: 'Claude', value: 15 }, { name: 'Llama', value: 10 }
    ];

    // --- Methods ---
    const removeWidget = (id: string) => {
        setLayout(layout.filter(w => w.id !== id));
    };

    const addWidget = (type: string) => {
        const newWidget: Widget = {
            id: Date.now().toString(),
            type,
            title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            x: 0,
            y: 0,
            w: 4,
            h: 3,
            config: { value: '0', trend: '0%', color: 'var(--primary)' }
        };
        setLayout([...layout, newWidget]);
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isEditMode ? '280px 1fr 300px' : '1fr',
            height: 'calc(100vh - 100px)',
            gap: '0',
            background: 'var(--bg-deep)',
            overflow: 'hidden'
        }}>
            {/* 1. LEFT SIDEBAR (REPORTS & WIDGETS) */}
            <AnimatePresence>
                {isEditMode && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        style={{
                            background: 'var(--bg-surface)',
                            borderRight: '1px solid var(--border-glass)',
                            padding: '24px',
                            overflowY: 'auto',
                            zIndex: 10
                        }}
                    >
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={18} color="var(--primary)" /> DESIGNER TOOLS
                        </h3>

                        <div style={{ marginBottom: '32px' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>KPI WIDGETS</p>
                            <WidgetSource type="numeric" icon={DollarSign} label="Numeric Metric" onClick={() => addWidget('numeric')} />
                            <WidgetSource type="gauge" icon={Activity} label="Performance Gauge" onClick={() => addWidget('gauge')} />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>VISUALIZATIONS</p>
                            <WidgetSource type="line" icon={TrendingUp} label="Line Chart" onClick={() => addWidget('line')} />
                            <WidgetSource type="bar" icon={BarChart3} label="Bar Chart" onClick={() => addWidget('bar')} />
                            <WidgetSource type="pie" icon={PieChart} label="Pie Chart" onClick={() => addWidget('pie')} />
                            <WidgetSource type="funnel" icon={Filter} label="Funnel Analysis" onClick={() => addWidget('funnel')} />
                        </div>

                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>ELEMENTS</p>
                            <WidgetSource type="text" icon={FileText} label="Text Block" onClick={() => addWidget('text')} />
                            <WidgetSource type="image" icon={ImageIcon} label="Image/Branding" onClick={() => addWidget('image')} />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* 2. MAIN CANVAS AREA */}
            <main style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                {/* Header & Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="premium-tabs">
                            {['Overview', 'Performance', 'AI Models', 'User Analytics'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div style={{ height: '24px', width: '1px', background: 'var(--border-glass)', margin: '0 8px' }} />
                        <button className="btn-icon" title="Save Layout"><Save size={18} /></button>
                        <button className="btn-icon" title="Global Filters"><Filter size={18} /></button>
                    </div>

                    <div style={{ display: 'flex', background: 'var(--input-bg)', padding: '4px', borderRadius: '12px' }}>
                        <button
                            onClick={() => setIsEditMode(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                                background: isEditMode ? 'var(--primary)' : 'transparent',
                                color: isEditMode ? '#000' : 'var(--text-dim)',
                                border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem'
                            }}
                        >
                            <Edit3 size={14} /> DESIGN
                        </button>
                        <button
                            onClick={() => setIsEditMode(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                                background: !isEditMode ? 'var(--primary)' : 'transparent',
                                color: !isEditMode ? '#000' : 'var(--text-dim)',
                                border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem'
                            }}
                        >
                            <Eye size={14} /> VIEW
                        </button>
                    </div>
                </div>

                {/* Grid Designer */}
                <div className={isEditMode ? "designer-grid" : ""} style={{
                    display: isEditMode ? 'grid' : 'flex',
                    flexWrap: isEditMode ? 'unset' : 'wrap',
                    gridTemplateColumns: isEditMode ? 'repeat(12, 1fr)' : 'unset',
                    gap: '24px',
                    minHeight: '800px'
                }}>
                    {layout.map((w) => (
                        <WidgetContainer
                            key={w.id}
                            widget={w}
                            isEditMode={isEditMode}
                            onRemove={() => removeWidget(w.id)}
                            isSelected={selectedId === w.id}
                            onSelect={() => setSelectedId(w.id)}
                            lineData={lineData}
                            barData={barData}
                        />
                    ))}
                </div>
            </main>

            {/* 3. RIGHT SETTINGS PANEL */}
            <AnimatePresence>
                {isEditMode && (
                    <motion.aside
                        initial={{ x: 300 }}
                        animate={{ x: 0 }}
                        exit={{ x: 300 }}
                        style={{
                            background: 'var(--bg-surface)',
                            borderLeft: '1px solid var(--border-glass)',
                            padding: '24px',
                            overflowY: 'auto',
                            zIndex: 10
                        }}
                    >
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings2 size={18} color="var(--primary)" /> CONFIGURATION
                        </h3>

                        {selectedId ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px' }}>WIDGET TITLE</p>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={layout.find(l => l.id === selectedId)?.title}
                                        onChange={(e) => {
                                            const newLayout = [...layout];
                                            const idx = newLayout.findIndex(l => l.id === selectedId);
                                            newLayout[idx].title = e.target.value;
                                            setLayout(newLayout);
                                        }}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px' }}>COLOR SCHEME</p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['#F5C518', '#10b981', '#3b82f6', '#ef4444', '#f472b6'].map(c => (
                                            <div
                                                key={c}
                                                onClick={() => {
                                                    const newLayout = [...layout];
                                                    const idx = newLayout.findIndex(l => l.id === selectedId);
                                                    newLayout[idx].config.color = c;
                                                    setLayout(newLayout);
                                                }}
                                                style={{
                                                    width: '32px', height: '32px', borderRadius: '8px',
                                                    background: c, cursor: 'pointer',
                                                    border: layout.find(l => l.id === selectedId)?.config.color === c ? '2px solid #fff' : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px' }}>DIMENSIONS</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.6rem' }}>WIDTH (COLS)</label>
                                            <input type="number" className="input-field" style={{ width: '100%' }} value={layout.find(l => l.id === selectedId)?.w} readOnly />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.6rem' }}>HEIGHT (ROWS)</label>
                                            <input type="number" className="input-field" style={{ width: '100%' }} value={layout.find(l => l.id === selectedId)?.h} readOnly />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="btn-3d-red"
                                    style={{ padding: '12px', fontSize: '0.7rem', width: '100%', marginTop: 'auto' }}
                                    onClick={() => { removeWidget(selectedId); setSelectedId(null); }}
                                >
                                    <Trash2 size={14} style={{ marginRight: '8px' }} /> DELETE WIDGET
                                </button>
                            </div>
                        ) : (
                            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5 }}>
                                <MousePointer2 size={40} style={{ marginBottom: '16px' }} />
                                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Select a widget on the canvas to configure it.</p>
                            </div>
                        )}

                        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid var(--border-glass)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>GLOBAL THEME</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button className="btn-3d" style={{ padding: '10px', fontSize: '0.7rem', background: 'var(--bg-card)', color: 'var(--primary)' }}>FLAT THEME</button>
                                <button className="btn-3d" style={{ padding: '10px', fontSize: '0.7rem', background: 'var(--bg-card)', color: 'var(--primary)' }}>BORDER THEME</button>
                                <button className="btn-3d" style={{ padding: '10px', fontSize: '0.7rem', background: 'var(--bg-card)', color: 'var(--primary)' }}>TOP BORDER THEME</button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub-components ---

const WidgetSource: React.FC<any> = ({ icon: Icon, label, onClick }) => (
    <div className="widget-source" onClick={onClick}>
        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 197, 24, 0.1)', color: 'var(--primary)' }}>
            <Icon size={16} />
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{label}</span>
    </div>
);

const WidgetContainer: React.FC<any> = ({ widget, isEditMode, onRemove, isSelected, onSelect, lineData, barData }) => {
    const gridStyle = isEditMode ? {
        gridColumn: `span ${widget.w}`,
        gridRow: `span ${widget.h}`
    } : {
        width: `${(widget.w / 12) * 100}%`,
        minHeight: `${widget.h * 100}px`,
        flexShrink: 0
    };

    return (
        <motion.div
            layout
            onClick={onSelect}
            className={`designer-card ${isSelected ? 'selected' : ''}`}
            style={{
                ...gridStyle,
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                cursor: isEditMode ? 'move' : 'default',
                background: 'var(--bg-card)',
                borderRadius: '24px',
                boxShadow: isSelected ? '0 0 20px var(--primary-glow)' : 'var(--shadow-3d)',
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{widget.title}</h4>
                {isEditMode && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                        <button style={{ background: 'none', border: 'none', color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); onRemove(); }}><Trash2 size={12} /></button>
                    </div>
                )}
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                {widget.type === 'numeric' && (
                    <div className="numeric-kpi" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: widget.config.color, margin: 0 }}>{widget.config.value}</h2>
                        <div className={`kpi-trend-box ${widget.config.trend.startsWith('+') ? 'kpi-trend-up' : 'kpi-trend-down'}`}>
                            {widget.config.trend} vs last month
                        </div>
                    </div>
                )}

                {widget.type === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={lineData}>
                            <defs>
                                <linearGradient id={`gradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={widget.config.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={widget.config.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" hide />
                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="value" stroke={widget.config.color} fillOpacity={1} fill={`url(#gradient-${widget.id})`} strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}

                {widget.type === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <XAxis dataKey="name" hide />
                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '12px' }} />
                            <Bar dataKey="value" fill={widget.config.color} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {widget.type === 'pie' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={barData}
                                innerRadius="60%"
                                outerRadius="80%"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {barData.map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={['#F5C518', '#10b981', '#3b82f6', '#ef4444'][index % 4]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '12px' }} />
                        </RePieChart>
                    </ResponsiveContainer>
                )}

                {widget.type === 'gauge' && (
                    <div className="gauge-container">
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={[{ value: widget.config.value }, { value: 100 - widget.config.value }]}
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius="70%"
                                        outerRadius="90%"
                                        dataKey="value"
                                    >
                                        <Cell fill={widget.config.color} />
                                        <Cell fill="rgba(255,255,255,0.05)" />
                                    </Pie>
                                </RePieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', bottom: '20%', textAlign: 'center' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>{widget.config.value}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isEditMode && <div className="resize-handle" />}
        </motion.div>
    );
}

export default DashboardDesigner;
