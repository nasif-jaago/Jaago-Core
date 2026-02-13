import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, Server } from 'lucide-react';
import IncomingMailServerPage from './IncomingMailServerPage';
import OutgoingMailServerPage from './OutgoingMailServerPage';

interface EmailServerPageProps {
    onBack: () => void;
}

const EmailServerPage: React.FC<EmailServerPageProps> = ({ onBack }) => {
    const [activeSubmenu, setActiveSubmenu] = useState<'incoming' | 'outgoing' | null>(null);

    if (activeSubmenu === 'incoming') {
        return <IncomingMailServerPage onBack={() => setActiveSubmenu(null)} />;
    }

    if (activeSubmenu === 'outgoing') {
        return <OutgoingMailServerPage onBack={() => setActiveSubmenu(null)} />;
    }

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: window.innerWidth < 768 ? '12px' : '0'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 style={{
                        fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        margin: 0
                    }}>
                        Email Server
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        margin: '2px 0 0 0'
                    }}>
                        Configure incoming and outgoing mail servers
                    </p>
                </div>
            </div>

            {/* Menu Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px',
                maxWidth: '1200px'
            }}>
                {/* Incoming Mail Server Card */}
                <div
                    className="glass-panel"
                    onClick={() => setActiveSubmenu('incoming')}
                    style={{
                        padding: window.innerWidth < 768 ? '24px' : '32px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--border-glass)';
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '50%',
                        opacity: 0.1
                    }} />

                    <div style={{
                        width: window.innerWidth < 768 ? '48px' : '56px',
                        height: window.innerWidth < 768 ? '48px' : '56px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                    }}>
                        <Mail size={window.innerWidth < 768 ? 24 : 28} color="#fff" />
                    </div>

                    <h2 style={{
                        fontSize: window.innerWidth < 768 ? '1.1rem' : '1.25rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        marginBottom: '10px'
                    }}>
                        Incoming Mail Server
                    </h2>

                    <p style={{
                        color: 'var(--text-dim)',
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        marginBottom: '16px'
                    }}>
                        Configure IMAP, POP, and Gmail OAuth settings to receive emails. Manage server credentials, SSL/TLS settings, and monitor incoming email logs.
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            padding: '6px 12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#3b82f6'
                        }}>
                            IMAP
                        </div>
                        <div style={{
                            padding: '6px 12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#3b82f6'
                        }}>
                            POP
                        </div>
                        <div style={{
                            padding: '6px 12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#3b82f6'
                        }}>
                            Gmail OAuth
                        </div>
                    </div>

                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: 'var(--input-bg)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <Server size={18} color="var(--primary)" />
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Features
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 700 }}>
                                Auto-fetch • SSL/TLS • OAuth • Logs
                            </div>
                        </div>
                    </div>
                </div>

                {/* Outgoing Mail Server Card */}
                <div
                    className="glass-panel"
                    onClick={() => setActiveSubmenu('outgoing')}
                    style={{
                        padding: window.innerWidth < 768 ? '24px' : '32px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--border-glass)';
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        borderRadius: '50%',
                        opacity: 0.1
                    }} />

                    <div style={{
                        width: window.innerWidth < 768 ? '48px' : '56px',
                        height: window.innerWidth < 768 ? '48px' : '56px',
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)'
                    }}>
                        <Send size={window.innerWidth < 768 ? 24 : 28} color="#fff" />
                    </div>

                    <h2 style={{
                        fontSize: window.innerWidth < 768 ? '1.1rem' : '1.25rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        marginBottom: '10px'
                    }}>
                        Outgoing Mail Server
                    </h2>

                    <p style={{
                        color: 'var(--text-dim)',
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        marginBottom: '16px'
                    }}>
                        Set up SMTP servers to send emails. Configure authentication, encryption, debug mode, and track all outgoing email delivery status with detailed logs.
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            padding: '6px 12px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#22c55e'
                        }}>
                            SMTP
                        </div>
                        <div style={{
                            padding: '6px 12px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#22c55e'
                        }}>
                            TLS/SSL
                        </div>
                        <div style={{
                            padding: '6px 12px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#22c55e'
                        }}>
                            OAuth
                        </div>
                    </div>

                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: 'var(--input-bg)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <Server size={18} color="var(--primary)" />
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Features
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 700 }}>
                                Test Connection • Debug • Encryption • Logs
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="glass-panel" style={{
                padding: window.innerWidth < 768 ? '16px' : '20px',
                maxWidth: '1200px'
            }}>
                <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '12px'
                }}>
                    📧 Email Server Configuration
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px'
                }}>
                    <div>
                        <h4 style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            marginBottom: '6px'
                        }}>
                            Incoming Mail
                        </h4>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-dim)',
                            lineHeight: 1.5
                        }}>
                            Configure servers to receive emails via IMAP or POP protocols. Support for Gmail OAuth authentication and automatic email fetching.
                        </p>
                    </div>
                    <div>
                        <h4 style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            marginBottom: '6px'
                        }}>
                            Outgoing Mail
                        </h4>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-dim)',
                            lineHeight: 1.5
                        }}>
                            Set up SMTP servers for sending emails. Configure encryption (TLS/SSL), test connections, and monitor delivery status with comprehensive logs.
                        </p>
                    </div>
                    <div>
                        <h4 style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            marginBottom: '6px'
                        }}>
                            Security & Monitoring
                        </h4>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-dim)',
                            lineHeight: 1.5
                        }}>
                            All servers support SSL/TLS encryption, OAuth authentication, and provide detailed logging for monitoring email activity and troubleshooting.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailServerPage;
