import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, ChevronDown, LogOut, Settings, Check, Trash2, Clock, Info, AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sparkles, Monitor, Tablet, Smartphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchNotifications, markAsRead, markAllAsRead, subscribeToNotifications } from '../../api/NotificationService';
import type { Notification } from '../../api/NotificationService';

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
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onToggleSidebar, isSidebarOpen }) => {
    const { user, signOut } = useAuth();
    const { theme, cycleTheme, viewMode, cycleViewMode } = useTheme();
    const role = user?.user_metadata?.role || 'user';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch Notifications
    useEffect(() => {
        if (!user) return;

        const loadNotifications = async () => {
            const res = await fetchNotifications(user.id);
            if (res.success && res.data) {
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.is_read).length);
            }
        };

        loadNotifications();

        // Real-time subscription
        const channel = subscribeToNotifications(user.id, (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleMarkAsRead = async (id: string) => {
        const res = await markAsRead(id);
        if (res.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        const res = await markAllAsRead(user.id);
        if (res.success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'info': return <Info size={16} color="#3b82f6" />;
            case 'warning': return <AlertTriangle size={16} color="#f59e0b" />;
            case 'success': return <CheckCircle2 size={16} color="#10b981" />;
            case 'error': return <XCircle size={16} color="#ef4444" />;
            case 'reminder': return <Clock size={16} color="#8b5cf6" />;
            default: return <Info size={16} color="var(--primary)" />;
        }
    };

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
            padding: viewMode === 'mobile' ? '0 1rem' : '0 2rem',
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-glass)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Hamburger Menu - Only Mobile/Tablet */}
                <button
                    onClick={onToggleSidebar}
                    className="show-mobile-only hide-desktop"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        padding: '8px',
                        display: viewMode === 'desktop' ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Menu size={24} />
                </button>

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
                    {viewMode === 'mobile' && (
                        <div style={{ transform: 'scale(0.7)', marginLeft: '-8px' }}>
                            <Logo3D />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1.5rem)', flex: 1, justifyContent: 'flex-end' }}>
                {/* Navigation Dropdown - Hidden on Mobile/Tablet drawer mode */}
                <div style={{ position: 'relative' }} className="hide-mobile hide-tablet">
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
                                background: 'rgba(10, 15, 25, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '16px',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                                zIndex: 1000,
                                padding: '12px',
                                backdropFilter: 'blur(30px) saturate(180%)'
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

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="hide-mobile"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: isNotificationsOpen ? 'var(--primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '8px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                minWidth: '16px',
                                height: '16px',
                                padding: '0 4px',
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 800,
                                borderRadius: '10px',
                                border: '2px solid var(--bg-surface)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
                            }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <>
                                <div
                                    onClick={() => setIsNotificationsOpen(false)}
                                    style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 10px)',
                                        right: 0,
                                        width: '360px',
                                        background: 'rgba(10, 15, 25, 0.98)',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6)',
                                        zIndex: 999,
                                        overflow: 'hidden',
                                        backdropFilter: 'blur(30px) saturate(180%)'
                                    }}
                                >
                                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Notifications</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                            <button onClick={() => setIsNotificationsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                                <Bell size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No notifications yet</div>
                                                <div style={{ fontSize: '0.75rem' }}>We'll notify you when something happens</div>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                                    style={{
                                                        padding: '16px',
                                                        borderRadius: '16px',
                                                        background: notif.is_read ? 'transparent' : 'rgba(255,255,255,0.03)',
                                                        marginBottom: '4px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = notif.is_read ? 'transparent' : 'rgba(255,255,255,0.03)'}
                                                >
                                                    {!notif.is_read && (
                                                        <span style={{ position: 'absolute', top: '20px', right: '16px', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }} />
                                                    )}
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <div style={{
                                                            width: '36px', height: '36px', borderRadius: '10px',
                                                            background: 'rgba(255,255,255,0.05)', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                        }}>
                                                            {getIcon(notif.type)}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: notif.is_read ? 600 : 800, marginBottom: '2px', color: notif.is_read ? 'var(--text-main)' : '#fff' }}>
                                                                {notif.title}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4, marginBottom: '6px' }}>
                                                                {notif.message}
                                                            </div>
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Clock size={10} />
                                                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--border-glass)' }}>
                                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                                            View all activity
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

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
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 10px)',
                                    right: 0,
                                    width: '280px',
                                    background: 'rgba(10, 15, 25, 0.95)',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                                    zIndex: 999,
                                    overflow: 'hidden',
                                    backdropFilter: 'blur(30px) saturate(180%)'
                                }}
                            >
                                {/* User Info Section */}
                                <div style={{
                                    padding: '24px 20px',
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), transparent)',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
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

