import React, { useState, useEffect } from 'react';
import {
    X, Maximize2, Minimize2, Send,
    MessageSquare, Hash, User,
    Paperclip, Smile
} from 'lucide-react';
import { fetchRecords } from '../../api/odoo';

interface ChatterProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'small' | 'full';
    setMode: (mode: 'small' | 'full') => void;
}

const DashboardChatter: React.FC<ChatterProps> = ({ isOpen, onClose, mode, setMode }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeChannel, setActiveChannel] = useState('General');

    useEffect(() => {
        if (isOpen) {
            loadMessages();
        }
    }, [isOpen]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            // Simulating Odoo Discuss message fetch
            // In a real scenario, we would call 'mail.message' search_read
            const res = await fetchRecords('hr.employee', ['name', 'image_128'], [], 5);
            const mockMessages = (res.data || []).map((emp: any, i: number) => ({
                id: i,
                author: emp.name,
                text: i === 0 ? "Hello Team! How is the project progressing?" : "Updated the payroll reports for this month.",
                time: "10:30 AM",
                avatar: emp.image_128
            }));
            setMessages(mockMessages);
        } catch (err) {
            console.error("Failed to load Odoo messages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessage = {
            id: Date.now(),
            author: "NASIF",
            text: input,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            avatar: null,
            isMe: true
        };
        setMessages([...messages, newMessage]);
        setInput('');
    };

    if (!isOpen) return null;

    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: mode === 'small' ? '20px' : '0',
        right: mode === 'small' ? '20px' : '0',
        width: mode === 'small' ? '400px' : '100vw',
        height: mode === 'small' ? '600px' : '100vh',
        background: 'var(--surface)',
        borderRadius: mode === 'small' ? '24px' : '0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    return (
        <div style={containerStyle} className="fade-in">
            {/* Header */}
            <div style={{
                padding: '1.25rem 1.5rem',
                background: 'linear-gradient(135deg, #714B67 0%, #4D3246 100%)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}>
                        <MessageSquare size={18} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>JAAGO Core Discuss</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>Active Session</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => setMode(mode === 'small' ? 'full' : 'small')}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
                    >
                        {mode === 'small' ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Sidebar & Chat Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Internal Sidebar (Channels) */}
                <div style={{ width: '120px', borderRight: '1px solid var(--border)', background: 'var(--input-bg)', padding: '1.5rem 0', display: mode === 'full' ? 'block' : 'none' }}>
                    <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Channels</p>
                    </div>
                    {['General', 'HR-Team', 'Admin', 'Tech'].map(ch => (
                        <div
                            key={ch}
                            onClick={() => setActiveChannel(ch)}
                            style={{
                                padding: '10px 1rem',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: activeChannel === ch ? 'var(--primary)' : 'var(--text-main)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: activeChannel === ch ? 'rgba(245, 197, 24, 0.05)' : 'transparent'
                            }}
                        >
                            <Hash size={14} /> {ch}
                        </div>
                    ))}
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {loading ? (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="pulse" style={{ width: '40px', height: '40px', background: '#714B67', borderRadius: '50%' }} />
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div key={m.id} style={{ alignSelf: m.isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: '10px' }}>
                                    {!m.isMe && (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--input-bg)', flexShrink: 0, overflow: 'hidden' }}>
                                            {m.avatar ? <img src={`data:image/png;base64,${m.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%' }} /> : <User size={16} style={{ margin: '8px' }} />}
                                        </div>
                                    )}
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: m.isMe ? '18px 2px 18px 18px' : '2px 18px 18px 18px',
                                        background: m.isMe ? '#714B67' : 'var(--input-bg)',
                                        color: m.isMe ? '#fff' : 'var(--text-main)',
                                        border: m.isMe ? 'none' : '1px solid var(--border)'
                                    }}>
                                        {!m.isMe && <p style={{ fontSize: '0.65rem', fontWeight: 900, marginBottom: '4px', opacity: 0.7 }}>{m.author}</p>}
                                        <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{m.text}</p>
                                        <p style={{ fontSize: '0.6rem', textAlign: 'right', marginTop: '6px', opacity: 0.5 }}>{m.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
                        <div style={{
                            background: 'var(--input-bg)',
                            borderRadius: '16px',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: '1px solid var(--border)'
                        }}>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Paperclip size={18} /></button>
                            <input
                                type="text"
                                placeholder={`Write to #${activeChannel}...`}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                style={{
                                    flex: 1,
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-main)',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    padding: '8px 0'
                                }}
                            />
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Smile size={18} /></button>
                            <button
                                onClick={handleSend}
                                style={{
                                    background: '#714B67',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardChatter;
