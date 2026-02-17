import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Users, Heart, Zap,
    PieChart, Briefcase, Handshake, TrendingUp,
    ClipboardList, ShoppingBag,
    LayoutGrid, Globe
} from 'lucide-react';

interface Department {
    id: string;
    name: string;
    icon: React.ElementType;
    color: string;
}

const DEPARTMENTS: Department[] = [
    { id: 'Human Resources', name: 'Human Resources', icon: Users, color: '#3b82f6' },
    { id: 'Admin & Procurement', name: 'Admin & Procurement', icon: ShoppingBag, color: '#10b981' },
    { id: 'Child Welfare', name: 'Child Welfare', icon: Heart, color: '#ef4444' },
    { id: 'Digital & Creative', name: 'Digital & Creative', icon: Zap, color: '#f59e0b' },
    { id: 'Finance', name: 'Finance', icon: PieChart, color: '#6366f1' },
    { id: 'Founder\'s Office', name: 'Founder\'s Office', icon: Briefcase, color: '#8b5cf6' },
    { id: 'Fundraising', name: 'Fundraising & Grants', icon: Handshake, color: '#ec4899' },
    { id: 'Impact Investment', name: 'Impact Investment', icon: TrendingUp, color: '#06b6d4' },
    { id: 'Project Implementation', name: 'Project Implementation', icon: ClipboardList, color: '#84cc16' },
    { id: 'IT', name: 'IT Department', icon: Globe, color: '#3b82f6' }
];

interface DepartmentLauncherProps {
    isOpen: boolean;
    onClose: () => void;
    setActiveTab: (tab: string) => void;
}

const DepartmentLauncher: React.FC<DepartmentLauncherProps> = ({ isOpen, onClose, setActiveTab }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const launcherRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const filteredDepartments = DEPARTMENTS.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 3000,
                        background: 'rgba(5, 5, 10, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '40px 16px'
                    }}
                >
                    <motion.div
                        ref={launcherRef}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 35
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '650px',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            textAlign: 'center',
                            background: 'var(--bg-surface)',
                            padding: '20px',
                            borderRadius: '20px',
                            border: '1px solid var(--border-glass)',
                            boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                            position: 'relative'
                        }}
                    >
                        {/* Header Section */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-dim)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    zIndex: 10
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#fff';
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--text-dim)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                                }}
                            >
                                <X size={14} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                                <LayoutGrid size={18} color="var(--primary)" />
                                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>
                                    DEPARTMENTS
                                </h2>
                            </div>

                            {/* Search Bar */}
                            <div style={{ maxWidth: '300px', margin: '0 auto', position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 36px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </div>
                        </div>

                        {/* App Grid */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))',
                                gap: '12px',
                                padding: '8px',
                                overflowY: 'auto',
                                scrollbarWidth: 'none'
                            }}
                            className="launcher-grid"
                        >
                            {filteredDepartments.map((dept, index) => (
                                <AppTile
                                    key={dept.id}
                                    dept={dept}
                                    index={index}
                                    onClick={() => {
                                        setActiveTab(dept.id);
                                        onClose();
                                    }}
                                />
                            ))}

                            {filteredDepartments.length === 0 && (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    padding: '20px',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <Globe size={24} opacity={0.3} />
                                    <p style={{ fontSize: '0.75rem' }}>No matches</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <style>{`
                        .launcher-grid::-webkit-scrollbar { display: none; }
                        
                        @media (min-width: 1024px) {
                            .launcher-grid {
                                grid-template-columns: repeat(7, 1fr) !important;
                            }
                        }

                        @media (max-width: 1023px) and (min-width: 640px) {
                            .launcher-grid {
                                grid-template-columns: repeat(5, 1fr) !important;
                            }
                        }

                        @media (max-width: 639px) {
                            .launcher-grid {
                                grid-template-columns: repeat(4, 1fr) !important;
                                gap: 10px !important;
                            }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const AppTile: React.FC<{ dept: Department; index: number; onClick: () => void }> = ({ dept, index, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                delay: index * 0.02,
                type: 'spring',
                stiffness: 400,
                damping: 25
            }}
            whileHover={{
                scale: 1.05,
                translateY: -2,
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                outline: 'none'
            }}
        >
            <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.4))',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease'
            }}
                className="tile-box"
            >
                {/* Glow Effect */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at center, ${dept.color}10, transparent 70%)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                }} className="tile-glow" />

                <dept.icon
                    size={22}
                    style={{
                        color: dept.color,
                        filter: `drop-shadow(0 0 5px ${dept.color}22)`,
                        zIndex: 1
                    }}
                />
            </div>

            <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'center',
                maxWidth: '65px',
                lineHeight: '1.2',
                letterSpacing: '0.1px'
            }}>
                {dept.name}
            </span>

            <style>{`
                .tile-box:hover, .motion-div:focus-visible .tile-box {
                    border-color: var(--primary);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.4), 0 0 10px var(--primary-glow);
                }
                .tile-box:hover .tile-glow {
                    opacity: 1;
                }
            `}</style>
        </motion.div>
    );
};

export default DepartmentLauncher;
