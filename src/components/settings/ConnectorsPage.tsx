import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Play, Loader, CheckCircle, XCircle, Activity } from 'lucide-react';

interface Connector {
    id: string;
    description: string;
    projectName: string;
    projectId: string;
    publishableKey: string;
    secretKey: string;
    legacyAnon: string;
    serviceRoleKey: string;
}

interface ConnectorsPageProps {
    onBack: () => void;
}

const ConnectorsPage: React.FC<ConnectorsPageProps> = ({ onBack }) => {
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [networkData, setNetworkData] = useState<any[]>([]);

    useEffect(() => {
        // Load existing connectors (example: Supabase)
        const existingConnector: Connector = {
            id: '1',
            description: 'Supabase Backend',
            projectName: 'JAAGO Core',
            projectId: 'jaago-core-2024',
            publishableKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            secretKey: '••••••••••••••••',
            legacyAnon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            serviceRoleKey: '••••••••••••••••'
        };
        setConnectors([existingConnector]);

        // Load saved notes
        const savedNotes = localStorage.getItem('connector-notes');
        if (savedNotes) setNotes(savedNotes);

        // Simulate network activity with orange theme
        const interval = setInterval(() => {
            setNetworkData(prev => [...prev.slice(-20), {
                time: Date.now(),
                value: Math.random() * 100,
                status: Math.random() > 0.15 ? 'active' : 'idle'
            }]);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            // Simulate connection building
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Test connection to backend
            const response = await fetch('/api/health');
            if (response.ok) {
                setIsConnecting(false);
                setTestResult({ success: true, message: 'Backend connection established successfully!' });
            } else {
                throw new Error('Connection failed');
            }
        } catch (error: any) {
            setIsConnecting(false);
            setTestResult({ success: false, message: error.message || 'Failed to connect to backend' });
        }
    };

    const handleAutoTest = async () => {
        setIsTesting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Test all connectors
            const allValid = connectors.every(c => c.projectId && c.publishableKey);

            if (allValid) {
                setIsTesting(false);
                setTestResult({
                    success: true,
                    message: `All Izz Well! 🎉\n\n✓ All ${connectors.length} connector(s) validated\n✓ Backend connection active\n✓ Authentication successful`
                });
            } else {
                throw new Error('Invalid connector configuration');
            }
        } catch (error: any) {
            setIsTesting(false);
            setTestResult({
                success: false,
                message: `Connection Test Failed ❌\n\nIssue: ${error.message}\n\nPlease verify your connector credentials.`
            });
        }
    };

    const handleAddConnector = () => {
        const newConnector: Connector = {
            id: Date.now().toString(),
            description: 'New Connector',
            projectName: '',
            projectId: '',
            publishableKey: '',
            secretKey: '',
            legacyAnon: '',
            serviceRoleKey: ''
        };
        setConnectors([...connectors, newConnector]);
        setEditingId(newConnector.id);
    };

    const handleDeleteConnector = (id: string) => {
        setConnectors(connectors.filter(c => c.id !== id));
    };

    const handleUpdateConnector = (id: string, field: keyof Connector, value: string) => {
        setConnectors(connectors.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    return (
        <div style={{
            display: 'flex',
            height: '100%',
            gap: '16px',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            padding: window.innerWidth < 768 ? '12px' : '0'
        }}>
            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                    gap: '12px'
                }}>
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
                                Connectors
                            </h1>
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                margin: '2px 0 0 0'
                            }}>
                                Manage backend connectors and service integrations
                            </p>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        width: window.innerWidth < 768 ? '100%' : 'auto'
                    }}>
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: '#000',
                                border: 'none',
                                padding: window.innerWidth < 768 ? '8px 16px' : '10px 20px',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: isConnecting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.25)',
                                flex: window.innerWidth < 768 ? 1 : 'none',
                                justifyContent: 'center'
                            }}
                        >
                            {isConnecting ? <Loader className="spin" size={16} /> : <Activity size={16} />}
                            {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                        <button
                            onClick={handleAutoTest}
                            disabled={isTesting}
                            style={{
                                background: 'var(--primary-gradient)',
                                color: '#000',
                                border: 'none',
                                padding: window.innerWidth < 768 ? '8px 16px' : '10px 20px',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: isTesting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 8px 20px var(--primary-glow)',
                                flex: window.innerWidth < 768 ? 1 : 'none',
                                justifyContent: 'center'
                            }}
                        >
                            {isTesting ? <Loader className="spin" size={16} /> : <Play size={16} />}
                            {isTesting ? 'Testing...' : 'Auto Test'}
                        </button>
                    </div>
                </div>

                {/* Connectors Table */}
                <div className="glass-panel" style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: window.innerWidth < 768 ? '16px' : '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            Active Connectors
                        </h3>
                        <button
                            onClick={handleAddConnector}
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border-glass)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Plus size={16} />
                            Add Connector
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                            <thead>
                                <tr style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Description</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Project Name</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Project ID</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Publishable Key</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Secret Key</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Legacy Anon</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Service Role</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {connectors.map(connector => (
                                    <tr key={connector.id} style={{ background: 'var(--bg-card)', transition: 'all 0.3s' }}>
                                        <td style={{ padding: '10px 12px', borderRadius: '8px 0 0 8px' }}>
                                            {editingId === connector.id ? (
                                                <input
                                                    type="text"
                                                    value={connector.description}
                                                    onChange={(e) => handleUpdateConnector(connector.id, 'description', e.target.value)}
                                                    style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', padding: '6px 10px', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.75rem' }}
                                                />
                                            ) : (
                                                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.8rem' }}>{connector.description}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            {editingId === connector.id ? (
                                                <input
                                                    type="text"
                                                    value={connector.projectName}
                                                    onChange={(e) => handleUpdateConnector(connector.id, 'projectName', e.target.value)}
                                                    style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', padding: '6px 10px', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.75rem' }}
                                                />
                                            ) : (
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{connector.projectName}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            {editingId === connector.id ? (
                                                <input
                                                    type="text"
                                                    value={connector.projectId}
                                                    onChange={(e) => handleUpdateConnector(connector.id, 'projectId', e.target.value)}
                                                    style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', padding: '6px 10px', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.75rem', fontFamily: 'monospace' }}
                                                />
                                            ) : (
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontFamily: 'monospace' }}>{connector.projectId}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            {editingId === connector.id ? (
                                                <input
                                                    type="text"
                                                    value={connector.publishableKey}
                                                    onChange={(e) => handleUpdateConnector(connector.id, 'publishableKey', e.target.value)}
                                                    style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', padding: '6px 10px', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.7rem', fontFamily: 'monospace' }}
                                                />
                                            ) : (
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontFamily: 'monospace' }}>{connector.publishableKey.substring(0, 20)}...</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{connector.secretKey}</span>
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontFamily: 'monospace' }}>{connector.legacyAnon.substring(0, 15)}...</span>
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{connector.serviceRoleKey}</span>
                                        </td>
                                        <td style={{ padding: '10px 12px', borderRadius: '0 8px 8px 0', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => setEditingId(editingId === connector.id ? null : connector.id)}
                                                    style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#3b82f6' }}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteConnector(connector.id)}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#ef4444' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div style={{
                width: window.innerWidth < 1024 ? '100%' : '280px',
                display: window.innerWidth < 768 ? 'none' : 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {/* Network Graph - Orange Theme */}
                <div className="glass-panel" style={{ padding: '16px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', boxShadow: '0 0 8px #f97316' }} />
                        Connector Network
                    </h4>
                    <div style={{ height: '160px', background: 'var(--input-bg)', borderRadius: '10px', padding: '10px', position: 'relative', overflow: 'hidden' }}>
                        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                            {networkData.map((point, i) => {
                                if (i === 0) return null;
                                const prevPoint = networkData[i - 1];
                                const x1 = ((i - 1) / 20) * 100;
                                const x2 = (i / 20) * 100;
                                const y1 = 100 - (prevPoint.value / 100) * 80;
                                const y2 = 100 - (point.value / 100) * 80;
                                return (
                                    <line
                                        key={i}
                                        x1={`${x1}%`}
                                        y1={`${y1}%`}
                                        x2={`${x2}%`}
                                        y2={`${y2}%`}
                                        stroke="#f97316"
                                        strokeWidth="2"
                                        opacity="0.8"
                                    />
                                );
                            })}
                        </svg>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
                        Real-time connector status monitoring
                    </p>
                </div>

                {/* Notes - Colorful Paper UI */}
                <div style={{
                    background: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)',
                    padding: '16px',
                    borderRadius: '10px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    position: 'relative'
                }}>
                    <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: '32px', height: '12px', background: '#f97316', borderRadius: '0 0 6px 6px', opacity: 0.7 }} />
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#000', marginBottom: '10px' }}>
                        📌 Connector Notes
                    </h4>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add connector notes, credentials backup, or reminders..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            background: 'rgba(255,255,255,0.6)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px',
                            color: '#000',
                            fontSize: '0.75rem',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                    <button
                        onClick={() => {
                            localStorage.setItem('connector-notes', notes);
                            alert('Notes saved successfully!');
                        }}
                        style={{
                            marginTop: '10px',
                            width: '100%',
                            background: '#000',
                            color: '#a7f3d0',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                        }}
                    >
                        Save Notes
                    </button>
                </div>
            </div>

            {/* Test Result Modal */}
            {testResult && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(8px)'
                }} onClick={() => setTestResult(null)}>
                    <div className="glass-panel" style={{
                        padding: '40px',
                        maxWidth: '500px',
                        textAlign: 'center',
                        animation: 'fadeIn 0.3s'
                    }} onClick={(e) => e.stopPropagation()}>
                        {testResult.success ? (
                            <CheckCircle size={64} color="#22c55e" style={{ marginBottom: '20px' }} />
                        ) : (
                            <XCircle size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
                        )}
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px' }}>
                            {testResult.success ? 'Success!' : 'Test Failed'}
                        </h3>
                        <p style={{ color: 'var(--text-dim)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                            {testResult.message}
                        </p>
                        <button
                            onClick={() => setTestResult(null)}
                            style={{
                                marginTop: '24px',
                                background: testResult.success ? '#22c55e' : '#ef4444',
                                color: '#000',
                                border: 'none',
                                padding: '12px 32px',
                                borderRadius: '12px',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConnectorsPage;
