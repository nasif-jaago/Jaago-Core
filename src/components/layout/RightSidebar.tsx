import React, { useState } from 'react';
import {
    ChevronRight, ChevronLeft,
    CheckSquare, FileSpreadsheet,
    Calendar, Clock, ClipboardList,
    Timer, Users, Banknote, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RightSidebarProps {
    department: string;
}

const commonApps = [
    { id: 'approvals', name: 'Approvals', icon: CheckSquare },
    { id: 'expenses', name: 'Expenses', icon: FileSpreadsheet },
    { id: 'leave', name: 'Leave Request', icon: Calendar },
    { id: 'onduty', name: 'On Duty', icon: Clock },
    { id: 'todo', name: 'To-Do', icon: ClipboardList },
];

const hrModules = [
    { id: 'timeoff', name: 'Time Off', icon: Timer },
    { id: 'attendance', name: 'Attendance', icon: Users },
    { id: 'payroll', name: 'Payroll', icon: Banknote },
    { id: 'recruitment', name: 'Recruitment', icon: UserPlus },
];

const RightSidebar: React.FC<RightSidebarProps> = ({ department }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('common');

    return (
        <>
            {/* Toggle Tab */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    right: isOpen ? '300px' : '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '12px 6px',
                    borderTopLeftRadius: '12px',
                    borderBottomLeftRadius: '12px',
                    cursor: 'pointer',
                    zIndex: 1001,
                    transition: 'right 0.3s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                <span style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '1px'
                }}>
                    NAVIGATION
                </span>
            </div>

            {/* Sidebar Panel */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="glass"
                style={{
                    position: 'fixed',
                    right: 0,
                    top: '70px',
                    bottom: 0,
                    width: '300px',
                    zIndex: 1000,
                    padding: '2rem 1.5rem',
                    borderLeft: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem'
                }}
            >
                {department === 'Human Resources' && (
                    <div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                            <button
                                onClick={() => setActiveSubTab('common')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    background: activeSubTab === 'common' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: activeSubTab === 'common' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Common
                            </button>
                            <button
                                onClick={() => setActiveSubTab('hr')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    background: activeSubTab === 'hr' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: activeSubTab === 'hr' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                HR Specific
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {activeSubTab === 'hr' ? 'HR Modules' : 'Common Applications'}
                    </h3>

                    {(activeSubTab === 'hr' ? hrModules : commonApps).map((app) => (
                        <div
                            key={app.id}
                            className="glass"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.02)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 0, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(255, 107, 0, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                <app.icon size={18} />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{app.name}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div className="glass" style={{ padding: '1rem', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            Logged in as <br />
                            <strong style={{ color: 'var(--text-primary)' }}>Admin User</strong>
                        </p>
                    </div>
                </div>
            </motion.aside>

            {/* Overlay when open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(2px)',
                            zIndex: 999
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default RightSidebar;
