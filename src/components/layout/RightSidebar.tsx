import React, { useState } from 'react';
import {
    ChevronRight, ChevronLeft,
    CheckSquare, FileSpreadsheet,
    Calendar, Clock, ClipboardList,
    Timer, Users, Banknote, UserPlus
} from 'lucide-react';

interface RightSidebarProps {
    department: string;
}

const commonApps = [
    { id: 'approvals', name: 'Requisition', icon: CheckSquare },
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
                    color: 'black',
                    padding: '12px 6px',
                    borderTopLeftRadius: '12px',
                    borderBottomLeftRadius: '12px',
                    cursor: 'pointer',
                    zIndex: 1001,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'right 0.3s ease'
                }}
            >
                {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                <span style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '1px'
                }}>
                    NAVIGATION
                </span>
            </div>

            {/* Sidebar Panel */}
            <aside
                className="glass"
                style={{
                    position: 'fixed',
                    right: 0,
                    top: '70px',
                    bottom: 0,
                    width: '300px',
                    zIndex: 1000,
                    padding: '2rem 1.5rem',
                    borderLeft: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease',
                    background: 'var(--bg-surface)'
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
                                    background: activeSubTab === 'common' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                    color: activeSubTab === 'common' ? '#000' : 'var(--text-dim)',
                                    border: '1px solid var(--border-glass)',
                                    cursor: 'pointer',
                                    fontWeight: 700
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
                                    background: activeSubTab === 'hr' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                    color: activeSubTab === 'hr' ? '#000' : 'var(--text-dim)',
                                    border: '1px solid var(--border-glass)',
                                    cursor: 'pointer',
                                    fontWeight: 700
                                }}
                            >
                                HR Specific
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 800 }}>
                        {activeSubTab === 'hr' ? 'HR Modules' : 'Common Applications'}
                    </h3>

                    {(activeSubTab === 'hr' ? hrModules : commonApps).map((app) => (
                        <div
                            key={app.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                border: '1px solid var(--border-glass)',
                                background: 'rgba(255,255,255,0.02)'
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(245, 197, 24, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                <app.icon size={18} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{app.name}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{ padding: '1rem', borderRadius: '12px', border: '1px dashed var(--border-glass)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: 0 }}>
                            System Admin Access
                        </p>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}
                />
            )}
        </>
    );
};

export default RightSidebar;
