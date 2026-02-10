import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, User, Search } from 'lucide-react';

const departments = [
    'Dashboard', 'Human Resources', 'Admin & Procurement', 'Child Welfare',
    'Digital & Creative', 'Finance', 'Founder\'s Office', 'Fundraising',
    'Impact Investment', 'Project Implementation', 'Programmes',
    'Private Engagement', 'Youth Development', 'MEAL', 'IT', 'Admin'
];

interface HeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '0 2rem',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flex: 1, overflow: 'hidden' }}>
                <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    whiteSpace: 'nowrap'
                }}>
                    JAAGO CORE
                </div>

                <nav style={{
                    display: 'flex',
                    gap: '1.5rem',
                    overflowX: 'auto',
                    paddingBottom: '5px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {departments.map((dept) => (
                        <button
                            key={dept}
                            onClick={() => setActiveTab(dept)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: activeTab === dept ? 'var(--primary)' : 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                fontWeight: activeTab === dept ? 600 : 400,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'var(--transition)',
                                padding: '4px 0',
                                position: 'relative'
                            }}
                        >
                            {dept}
                            {activeTab === dept && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: -15,
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: 'var(--primary)',
                                    borderRadius: '2px'
                                }} />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="glass"
                        style={{
                            padding: '8px 12px 8px 35px',
                            borderRadius: '20px',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            width: '200px',
                            background: 'rgba(255,255,255,0.05)'
                        }}
                    />
                </div>

                <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <Bell size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={18} color="white" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
