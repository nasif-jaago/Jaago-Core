import React, { useState } from 'react';
import { Bell, Search, Menu, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Palette, Sparkles, Monitor, Tablet, Smartphone } from 'lucide-react';

const Logo3D = () => (
    <motion.div
        style={{
            height: '45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            cursor: 'pointer',
            perspective: '1000px',
            transformStyle: 'preserve-3d',
            position: 'relative',
            marginRight: '20px'
        }}
        whileHover="hover"
    >
        <motion.div
            style={{
                height: '100%',
                transformStyle: 'preserve-3d',
                display: 'flex',
                alignItems: 'center'
            }}
            animate={{
                rotateY: [0, 5, 0, -5, 0],
                rotateX: [0, 2, 0, -2, 0]
            }}
            transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            <motion.img
                src="/logo/logo.png"
                alt="JAAGO Foundation"
                style={{
                    height: '100%',
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                    transform: 'translateZ(30px)'
                }}
                whileHover={{ scale: 1.05, transform: 'translateZ(50px)' }}
                onError={(e) => {
                    // Fallback in case of broken image
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                }}
            />
        </motion.div>
    </motion.div>
);

const navItems = [
    { id: 'Dashboard', label: 'JAAGO Foundation' },
    { id: 'Human Resources', label: 'Human Resources' },
    { id: 'Admin & Procurement', label: 'Admin & Procurement' },
    { id: 'Child Welfare', label: 'Child Welfare' },
    { id: 'Digital & Creative', label: 'Digital & Creative' },
    { id: 'Finance', label: 'Finance' },
    { id: 'Founder\'s Office', label: 'Founder\'s Office' },
    { id: 'Fundraising', label: 'Fundraising & Grants' },
    { id: 'Impact Investment', label: 'Impact Investment' },
    { id: 'Project Implementation', label: 'Project Implementation' },
    { id: 'Programmes', label: 'Programmes' },
    { id: 'Private Engagement', label: 'Private Sector' },
    { id: 'Youth Development', label: 'Youth Development' },
    { id: 'MEAL', label: 'MEAL' },
    { id: 'IT', label: 'IT' },
    { id: 'Emails Log', label: 'Emails Log' },
    { id: 'API', label: 'API Settings' },
    { id: 'Connectors', label: 'Connectors' },
    { id: 'Email Server', label: 'Email Server' },
    { id: 'AI Agent', label: 'AI Agent' },
    { id: 'Admin', label: 'System Admin' },
    { id: 'Help', label: 'Help Centre' },
];

interface HeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
    const { user, signOut } = useAuth();
    const { theme, cycleTheme } = useTheme();
    const role = user?.user_metadata?.role || 'user';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const currentNavItem = navItems.find(item => item.id === activeTab) || navItems[0];

    const handleLogout = () => {
        signOut();
        setIsUserMenuOpen(false);
    };

    // Get user info
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || 'user@jaago.com';
    const userInitials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <header className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '0 var(--header-padding, 2rem)',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border)',
            transition: 'padding 0.3s ease'
        }}>
            <div
                onClick={() => setActiveTab('Dashboard')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'opacity 0.2s',
                    flexShrink: 0
                }}
            >
                <div className="hide-mobile">
                    <Logo3D />
                </div>
                <div className="show-mobile-only" style={{ transform: 'scale(0.8)', marginLeft: '-10px' }}>
                    <Logo3D />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1.5rem)', flex: 1, justifyContent: 'flex-end' }}>
                {/* Navigation Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="responsive-nav-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '12px',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            fontSize: 'max(0.75rem, 0.9vw)',
                            fontWeight: 600,
                            transition: 'var(--transition)',
                            maxWidth: '180px'
                        }}
                    >
                        <Menu size={18} style={{ flexShrink: 0 }} />
                        <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: window.innerWidth < 480 ? 'none' : 'block'
                        }}>
                            {window.innerWidth < 640 ? currentNavItem.label.substring(0, 10) + (currentNavItem.label.length > 10 ? '...' : '') : currentNavItem.label}
                        </span>
                        <ChevronDown size={16} style={{
                            transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                            flexShrink: 0
                        }} />
                    </button>

                    {isMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                onClick={() => setIsMenuOpen(false)}
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 999
                                }}
                            />

                            {/* Dropdown Menu */}
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                width: 'min(320px, 95vw)',
                                maxHeight: '500px',
                                overflowY: 'auto',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '16px',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                                zIndex: 1000,
                                padding: '12px'
                            }}>
                                {/* Dashboard Section */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', padding: '8px 12px', letterSpacing: '1px' }}>DASHBOARD</div>
                                    <button
                                        onClick={() => {
                                            setActiveTab('Dashboard');
                                            setIsMenuOpen(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            background: activeTab === 'Dashboard' ? 'var(--primary)' : 'transparent',
                                            color: activeTab === 'Dashboard' ? '#fff' : 'var(--text-main)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: activeTab === 'Dashboard' ? 700 : 500,
                                            transition: 'var(--transition)',
                                            marginBottom: '4px'
                                        }}
                                    >
                                        JAAGO Foundation
                                    </button>
                                </div>

                                {/* Departments Section */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', padding: '8px 12px', letterSpacing: '1px' }}>DEPARTMENTS</div>
                                    {navItems.filter(item => ['Human Resources', 'Admin & Procurement', 'Child Welfare', 'Digital & Creative', 'Finance', 'Founder\'s Office', 'Fundraising', 'Impact Investment', 'Project Implementation', 'Programmes', 'Private Engagement', 'Youth Development', 'MEAL', 'IT'].includes(item.id)).map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                setIsMenuOpen(false);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '10px 16px',
                                                background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                                                color: activeTab === item.id ? '#fff' : 'var(--text-main)',
                                                border: 'none',
                                                borderRadius: '10px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: activeTab === item.id ? 700 : 500,
                                                transition: 'var(--transition)',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Settings Section */}
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', padding: '8px 12px', letterSpacing: '1px' }}>SETTINGS</div>
                                    {navItems.filter(item => ['Emails Log', 'API', 'Connectors', 'Email Server', 'AI Agent', 'Admin', 'Help'].includes(item.id)).map(item => {
                                        if (item.id === 'Admin' && role !== 'admin') return null;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    if (item.id === 'Help') {
                                                        window.location.href = 'https://www.odoo.com/help-form';
                                                    } else {
                                                        setActiveTab(item.id);
                                                        setIsMenuOpen(false);
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 16px',
                                                    background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                                                    color: activeTab === item.id ? '#fff' : 'var(--text-main)',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: activeTab === item.id ? 700 : 500,
                                                    transition: 'var(--transition)',
                                                    marginBottom: '4px'
                                                }}
                                            >
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                    <div style={{ position: 'relative' }} className="hide-mobile">
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="glass"
                            style={{
                                padding: '8px 12px 8px 35px',
                                borderRadius: '20px',
                                border: '1px solid var(--border-glass)',
                                color: 'var(--text-main)',
                                fontSize: '0.85rem',
                                width: 'min(160px, 30vw)',
                                background: 'rgba(255,255,255,0.05)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Platform View Icons */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-glass)',
                        marginRight: '4px'
                    }} className="hide-mobile">
                        <motion.button
                            whileHover={{ scale: 1.1, color: 'var(--primary)' }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                            title="Desktop View"
                        >
                            <Monitor size={16} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1, color: 'var(--primary)' }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                            title="Tablet View"
                        >
                            <Tablet size={16} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1, color: 'var(--primary)' }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                            title="Mobile View"
                        >
                            <Smartphone size={16} />
                        </motion.button>
                    </div>

                    {/* Single Theme Toggle */}
                    <motion.button
                        onClick={cycleTheme}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={`Theme: ${theme === 'dark' ? 'Standard' : theme === 'mode-b' ? 'Mode B' : 'Mode C'}`}
                        style={{
                            background: 'var(--primary-gradient)',
                            border: 'none',
                            borderRadius: '10px',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#000',
                            boxShadow: '0 3px 10px var(--primary-glow)',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}
                    >
                        {theme === 'dark' && <Sparkles size={18} key="dark" />}
                        {theme === 'mode-b' && <Palette size={18} key="mode-b" />}
                        {theme === 'mode-c' && <Settings size={18} key="mode-c" />}
                    </motion.button>
                </div>

                <button className="hide-mobile" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative', padding: '8px' }}>
                    <Bell size={20} />
                    <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-surface)' }} />
                </button>

                {/* User Profile Dropdown */}
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            padding: '4px 8px 4px 4px',
                            borderRadius: '25px',
                            background: isUserMenuOpen ? 'var(--input-bg)' : 'transparent',
                            border: `1px solid ${isUserMenuOpen ? 'var(--primary)' : 'transparent'}`,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--primary-gradient)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#fff',
                            boxShadow: '0 4px 12px var(--primary-glow)'
                        }}>
                            {userInitials}
                        </div>
                        <ChevronDown size={14} color="var(--text-dim)" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                    </div>

                    {isUserMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                onClick={() => setIsUserMenuOpen(false)}
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 998
                                }}
                            />

                            {/* User Dropdown Menu */}
                            <div
                                className="glass"
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 10px)',
                                    right: 0,
                                    width: '280px',
                                    background: 'var(--bg-surface)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-glass)',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                    zIndex: 999,
                                    overflow: 'hidden'
                                }}
                            >
                                {/* User Info Section */}
                                <div style={{
                                    padding: '20px',
                                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(56, 189, 248, 0.05))',
                                    borderBottom: '1px solid var(--border-glass)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-gradient)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1rem',
                                            fontWeight: 800,
                                            color: '#fff',
                                            boxShadow: '0 4px 15px var(--primary-glow)'
                                        }}>
                                            {userInitials}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                                                {userName}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                                {userEmail}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role Badge */}
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: role === 'admin' ? 'var(--primary-gradient)' : 'rgba(59, 130, 246, 0.2)',
                                        color: role === 'admin' ? '#fff' : '#3b82f6',
                                        borderRadius: '12px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {role}
                                    </div>
                                </div>

                                {/* Menu Options */}
                                <div style={{ padding: '8px' }}>
                                    <button
                                        onClick={() => {
                                            setActiveTab('Admin');
                                            setIsUserMenuOpen(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: '10px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            color: 'var(--text-main)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--input-bg)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Settings size={18} />
                                        Account Settings
                                    </button>

                                    <div style={{ height: '1px', background: 'var(--border-glass)', margin: '8px 0' }} />

                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: '10px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: '#ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <LogOut size={18} />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

