import React from 'react';
import { Filter, Calendar, ChevronDown } from 'lucide-react';

const Filters: React.FC = () => {
    return (
        <div className="glass" style={{
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '2rem',
            border: '1px solid var(--glass-border)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginRight: '1rem' }}>
                <Filter size={18} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filters</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
                {[
                    { label: 'Date Range', icon: Calendar },
                    { label: 'Department', icon: null },
                    { label: 'Project', icon: null },
                    { label: 'Programme', icon: null },
                    { label: 'Donor', icon: null },
                    { label: 'Location', icon: null },
                    { label: 'Status', icon: null },
                ].map((f) => (
                    <div key={f.label} className="glass" style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.03)'
                    }}>
                        {f.icon && <f.icon size={14} />}
                        {f.label}
                        <ChevronDown size={14} />
                    </div>
                ))}
            </div>

            <button style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline'
            }}>
                Clear All
            </button>
        </div>
    );
};

export default Filters;
