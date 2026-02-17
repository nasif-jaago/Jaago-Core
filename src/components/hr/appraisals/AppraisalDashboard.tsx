import React, { useState, useEffect, useCallback } from 'react';
import {
    PlusCircle, List, Layout,
    Edit3, CheckCircle, Clock, FileText, Send, UserPlus, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AppraisalService, type AppraisalRecord } from '../../../api/AppraisalService';

import AppraisalDemo from './AppraisalDemo';
import AppraisalActive from './AppraisalActive';
import AppraisalAddCycle from './AppraisalAddCycle';
import EmailTemplateBuilder from './EmailTemplateBuilder';
import ThreeSixtyLogsPage from './ThreeSixtyLogsPage';
import FormBuilderPage from './FormBuilderPage';
import AppraisalLogsView from './AppraisalLogsView';

interface AppraisalDashboardProps {
    onSelectStat?: (filter: string) => void;
    initialSubView?: string;
}

const AppraisalDashboard: React.FC<AppraisalDashboardProps> = ({ initialSubView }) => {
    const [histories, setHistories] = useState<AppraisalRecord[]>([]);
    const [activeSubTab, setActiveSubTab] = useState('all');
    const [view, setView] = useState<'logs' | 'add-cycle' | 'templates' | 'demo' | 'active' | 'feedback-360' | 'form-builder'>(
        initialSubView === 'demo' ? 'demo' :
            initialSubView === 'active' ? 'active' :
                initialSubView === 'form-builder' ? 'form-builder' :
                    initialSubView === 'feedback-360' ? 'feedback-360' : 'logs'
    );

    useEffect(() => {
        if (initialSubView === 'demo') setView('demo');
        else if (initialSubView === 'active') setView('active');
        else if (initialSubView === 'add-cycle') setView('add-cycle');
        else if (initialSubView === 'feedback-360') setView('feedback-360');
        else setView('logs');
    }, [initialSubView]);

    const loadData = useCallback(async () => {
        const res = await AppraisalService.fetchAppraisals('self');
        if (res.success) {
            setHistories(res.data || []);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const stats = {
        total: histories.length,
        pending: histories.filter(h => h.state === '1_new' || h.state === 'pending' || h.state === 'draft').length,
        sent: histories.filter(h => h.state === 'sent').length,
        submitted: histories.filter(h => h.state === '2_pending' || h.state === 'submitted').length,
        finalized: histories.filter(h => h.state === '3_done' || h.state === 'done').length
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Appraisals Module</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>Manage employee performance cycles and feedback.</p>
                </div>
            </div>

            {/* Smart Buttons - 7 Primary Modules */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                width: '100%'
            }}>
                <SmartButton
                    icon={<PlusCircle size={18} />}
                    title="Add Cycle Panel"
                    subtitle="Appraisal setup"
                    active={view === 'add-cycle'}
                    onClick={() => setView('add-cycle')}
                    color="#10b981"
                />
                <SmartButton
                    icon={<List size={18} />}
                    title="Appraisal Logs"
                    subtitle="Detailed logs"
                    active={view === 'logs'}
                    onClick={() => setView('logs')}
                    color="#3b82f6"
                />
                <SmartButton
                    icon={<Edit3 size={18} />}
                    title="Template Builder"
                    subtitle="Email editor"
                    active={view === 'templates'}
                    onClick={() => setView('templates')}
                    color="#8b5cf6"
                />
                <SmartButton
                    icon={<Layout size={18} />}
                    title="Form Builder"
                    subtitle="Logic Forms"
                    active={view === 'form-builder'}
                    onClick={() => setView('form-builder')}
                    color="#06b6d4"
                />
                <SmartButton
                    icon={<Layout size={18} />}
                    title="Appraisal Demo"
                    subtitle="Test System"
                    active={view === 'demo'}
                    onClick={() => setView('demo')}
                    color="#f59e0b"
                />
                <SmartButton
                    icon={<Send size={18} />}
                    title="Appraisal Active"
                    subtitle="Live Production"
                    active={view === 'active'}
                    onClick={() => setView('active')}
                    color="#ef4444"
                />
                <SmartButton
                    icon={<UserPlus size={18} />}
                    title="360 Feedback"
                    subtitle="Peer Review"
                    active={view === 'feedback-360'}
                    onClick={() => setView('feedback-360')}
                    color="#ec4899"
                />
            </div>

            {/* View Switcher Area */}
            {view === 'add-cycle' ? (
                <AppraisalAddCycle
                    onBack={() => setView('logs')}
                    onSuccess={() => setView('logs')}
                    onTestSuccess={() => setView('demo')}
                />
            ) : view === 'templates' ? (
                <EmailTemplateBuilder onBack={() => setView('logs')} />
            ) : view === 'form-builder' ? (
                <FormBuilderPage />
            ) : view === 'demo' ? (
                <AppraisalDemo />
            ) : view === 'active' ? (
                <AppraisalActive />
            ) : view === 'feedback-360' ? (
                <ThreeSixtyLogsPage />
            ) : view === 'logs' ? (
                <>
                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                        <StatCard title="Total Appraisals" value={stats.total} icon={<FileText size={20} />} color="var(--primary)" onClick={() => setView('logs')} />
                        <StatCard title="Pending" value={stats.pending} icon={<Clock size={20} />} color="#f59e0b" onClick={() => { setView('logs'); setActiveSubTab('pending'); }} />
                        <StatCard title="Sent" value={stats.sent} icon={<Send size={20} />} color="#3b82f6" onClick={() => { setView('logs'); setActiveSubTab('sent'); }} />
                        <StatCard title="Submitted" value={stats.submitted} icon={<FileText size={20} />} color="#10b981" onClick={() => { setView('logs'); setActiveSubTab('submitted'); }} />
                        <StatCard title="Finalized" value={stats.finalized} icon={<CheckCircle size={20} />} color="var(--primary)" onClick={() => { setView('logs'); setActiveSubTab('finalized'); }} />
                    </div>

                    <AppraisalLogsView
                        onBack={() => setView('logs')}
                        initialFilter={activeSubTab}
                    />
                </>
            ) : (
                <div style={{ padding: '80px', textAlign: 'center' }}>
                    <AlertCircle size={48} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dim)' }}>Select a module to begin</h3>
                </div>
            )}
        </div>
    );
};

const SmartButton: React.FC<{ icon: any, title: string, subtitle: string, onClick?: () => void, active?: boolean, color: string }> = ({ icon, title, subtitle, onClick, active, color }) => (
    <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="glass-panel"
        style={{
            padding: '12px 14px',
            cursor: 'pointer',
            borderBottom: active ? `2px solid ${color}` : '1px solid var(--border-glass)',
            background: active ? `${color}15` : 'var(--bg-card)',
            boxShadow: active ? `0 10px 20px -5px ${color}30` : 'var(--shadow-3d)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-start',
            minWidth: 0,
            transition: 'all 0.3s ease'
        }}
    >
        <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: active ? color : `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: active ? '#000' : color,
            transition: 'all 0.3s ease'
        }}>
            {icon}
        </div>
        <div style={{ width: '100%', overflow: 'hidden' }}>
            <div style={{
                fontSize: '13px',
                fontWeight: 800,
                color: active ? '#fff' : 'var(--text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>{title}</div>
            <div style={{
                fontSize: '10px',
                color: active ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                marginTop: '1px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>{subtitle}</div>
        </div>
    </motion.div>
);

const StatCard: React.FC<{ title: string, value: number | string, icon: any, color: string, onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <motion.div
        whileHover={onClick ? { y: -5, scale: 1.02, cursor: 'pointer' } : {}}
        onClick={onClick}
        className="glass-panel"
        style={{ padding: '20px', border: '1px solid var(--border-glass)' }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
            <div style={{ color: color }}>{icon}</div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800 }}>{value}</div>
    </motion.div>
);

export default AppraisalDashboard;
