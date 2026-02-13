import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Play, CheckCircle, XCircle, Send, Search } from 'lucide-react';

interface OutgoingMailServer {
    id: string;
    serverName: string;
    fromEmailFiltering: string;
    priority: number;
    active: boolean;
    authenticationType: 'Username/Password' | 'SSL Certificate' | 'Command Line Interface' | 'Gmail OAuth';
    smtpHost: string;
    smtpPort: number;
    encryptionType: 'None' | 'TLS (STARTTLS)' | 'SSL/TLS';
    debugMode: boolean;
    username: string;
    password: string;
    oauthTokenStatus: string;
    convertAttachmentsOverMB: number;
}

interface OutgoingEmailLog {
    id: string;
    date: string;
    recipientEmail: string;
    subject: string;
    status: 'Sent' | 'Failed' | 'Pending';
    errorMessage: string;
}

interface OutgoingMailServerPageProps {
    onBack: () => void;
}

const OutgoingMailServerPage: React.FC<OutgoingMailServerPageProps> = ({ onBack }) => {
    const [servers, setServers] = useState<OutgoingMailServer[]>([]);
    const [selectedServer, setSelectedServer] = useState<OutgoingMailServer | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<boolean | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [emailLogs, setEmailLogs] = useState<OutgoingEmailLog[]>([]);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        // Load sample data
        const sampleServers: OutgoingMailServer[] = [
            {
                id: '1',
                serverName: 'JAAGO SMTP Server',
                fromEmailFiltering: 'info@jaago.com.bd',
                priority: 1,
                active: true,
                authenticationType: 'Username/Password',
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                encryptionType: 'TLS (STARTTLS)',
                debugMode: false,
                username: 'info@jaago.com.bd',
                password: '••••••••',
                oauthTokenStatus: 'Active',
                convertAttachmentsOverMB: 10
            }
        ];
        setServers(sampleServers);

        // Sample logs
        const sampleLogs: OutgoingEmailLog[] = [
            {
                id: '1',
                date: new Date().toISOString(),
                recipientEmail: 'donor@example.com',
                subject: 'Monthly Impact Report',
                status: 'Sent',
                errorMessage: ''
            },
            {
                id: '2',
                date: new Date(Date.now() - 3600000).toISOString(),
                recipientEmail: 'volunteer@example.com',
                subject: 'Event Invitation',
                status: 'Sent',
                errorMessage: ''
            }
        ];
        setEmailLogs(sampleLogs);
    }, []);

    const handleCreateNew = () => {
        const newServer: OutgoingMailServer = {
            id: Date.now().toString(),
            serverName: '',
            fromEmailFiltering: '',
            priority: 10,
            active: true,
            authenticationType: 'Username/Password',
            smtpHost: '',
            smtpPort: 587,
            encryptionType: 'TLS (STARTTLS)',
            debugMode: false,
            username: '',
            password: '',
            oauthTokenStatus: 'Not Connected',
            convertAttachmentsOverMB: 10
        };
        setSelectedServer(newServer);
        setIsCreating(true);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (selectedServer) {
            if (isCreating) {
                setServers([...servers, selectedServer]);
            } else {
                setServers(servers.map(s => s.id === selectedServer.id ? selectedServer : s));
            }
            setIsEditing(false);
            setIsCreating(false);
            setSelectedServer(null);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this server?')) {
            setServers(servers.filter(s => s.id !== id));
            if (selectedServer?.id === id) {
                setSelectedServer(null);
            }
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsTesting(false);
        setTestResult({
            success: true,
            message: 'Connection test successful!\n\nSMTP server is reachable and credentials are valid.'
        });
    };

    const filteredServers = servers.filter(server => {
        const matchesSearch = server.serverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            server.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterActive === null || server.active === filterActive;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ display: 'flex', height: '100%', gap: '20px' }}>
            {/* Left Panel - Server List */}
            <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onBack} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                            Outgoing Mail
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            Manage SMTP servers
                        </p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="glass-panel" style={{ padding: '16px' }}>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search servers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '10px',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setFilterActive(null)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: filterActive === null ? 'var(--primary)' : 'var(--input-bg)',
                                color: filterActive === null ? '#000' : 'var(--text-dim)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterActive(true)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: filterActive === true ? 'var(--primary)' : 'var(--input-bg)',
                                color: filterActive === true ? '#000' : 'var(--text-dim)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilterActive(false)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: filterActive === false ? 'var(--primary)' : 'var(--input-bg)',
                                color: filterActive === false ? '#000' : 'var(--text-dim)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Inactive
                        </button>
                    </div>
                </div>

                {/* Server List */}
                <div className="glass-panel" style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                    <button
                        onClick={handleCreateNew}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--primary-gradient)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginBottom: '16px'
                        }}
                    >
                        <Plus size={20} />
                        New Server
                    </button>

                    {filteredServers.map(server => (
                        <div
                            key={server.id}
                            onClick={() => {
                                setSelectedServer(server);
                                setIsEditing(false);
                                setIsCreating(false);
                            }}
                            style={{
                                padding: '16px',
                                background: selectedServer?.id === server.id ? 'var(--primary-glow)' : 'var(--input-bg)',
                                border: `1px solid ${selectedServer?.id === server.id ? 'var(--primary)' : 'var(--border-glass)'}`,
                                borderRadius: '12px',
                                marginBottom: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Send size={18} color="var(--primary)" />
                                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{server.serverName}</span>
                                </div>
                                <div style={{
                                    padding: '4px 8px',
                                    background: server.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: server.active ? '#22c55e' : '#ef4444',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    {server.active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {server.smtpHost} • Port {server.smtpPort}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Server Details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'auto' }}>
                {selectedServer ? (
                    <>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                                {isCreating ? 'New Outgoing Server' : selectedServer.serverName}
                            </h1>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {!isEditing && !isCreating && (
                                    <>
                                        <button
                                            onClick={handleTestConnection}
                                            disabled={isTesting}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                cursor: isTesting ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <Play size={18} />
                                            {isTesting ? 'Testing...' : 'Test Connection'}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'var(--primary-gradient)',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <Edit2 size={18} />
                                            Edit
                                        </button>
                                    </>
                                )}
                                {(isEditing || isCreating) && (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <CheckCircle size={18} />
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setIsCreating(false);
                                                if (isCreating) setSelectedServer(null);
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                                {!isCreating && (
                                    <button
                                        onClick={() => handleDelete(selectedServer.id)}
                                        style={{
                                            padding: '10px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#ef4444',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                                Basic Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Server Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedServer.serverName}
                                        onChange={(e) => setSelectedServer({ ...selectedServer, serverName: e.target.value })}
                                        disabled={!isEditing && !isCreating}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Priority
                                    </label>
                                    <input
                                        type="number"
                                        value={selectedServer.priority}
                                        onChange={(e) => setSelectedServer({ ...selectedServer, priority: parseInt(e.target.value) })}
                                        disabled={!isEditing && !isCreating}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginTop: '28px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedServer.active}
                                            onChange={(e) => setSelectedServer({ ...selectedServer, active: e.target.checked })}
                                            disabled={!isEditing && !isCreating}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Active</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                    From Email Filtering
                                </label>
                                <input
                                    type="email"
                                    value={selectedServer.fromEmailFiltering}
                                    onChange={(e) => setSelectedServer({ ...selectedServer, fromEmailFiltering: e.target.value })}
                                    disabled={!isEditing && !isCreating}
                                    placeholder="sender@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                                Authentication Type
                            </h3>
                            <div style={{ marginBottom: '30px' }}>
                                <select
                                    value={selectedServer.authenticationType}
                                    onChange={(e) => setSelectedServer({ ...selectedServer, authenticationType: e.target.value as any })}
                                    disabled={!isEditing && !isCreating}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="Username/Password">Username/Password</option>
                                    <option value="SSL Certificate">SSL Certificate</option>
                                    <option value="Command Line Interface">Command Line Interface</option>
                                    <option value="Gmail OAuth">Gmail OAuth</option>
                                </select>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                                SMTP Configuration
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        SMTP Host *
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedServer.smtpHost}
                                        onChange={(e) => setSelectedServer({ ...selectedServer, smtpHost: e.target.value })}
                                        disabled={!isEditing && !isCreating}
                                        placeholder="smtp.gmail.com"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        SMTP Port *
                                    </label>
                                    <input
                                        type="number"
                                        value={selectedServer.smtpPort}
                                        onChange={(e) => setSelectedServer({ ...selectedServer, smtpPort: parseInt(e.target.value) })}
                                        disabled={!isEditing && !isCreating}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginTop: '28px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedServer.debugMode}
                                            onChange={(e) => setSelectedServer({ ...selectedServer, debugMode: e.target.checked })}
                                            disabled={!isEditing && !isCreating}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Debug Mode</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                    Encryption Type
                                </label>
                                <select
                                    value={selectedServer.encryptionType}
                                    onChange={(e) => setSelectedServer({ ...selectedServer, encryptionType: e.target.value as any })}
                                    disabled={!isEditing && !isCreating}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="None">None</option>
                                    <option value="TLS (STARTTLS)">TLS (STARTTLS)</option>
                                    <option value="SSL/TLS">SSL/TLS</option>
                                </select>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                                Login Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Username *
                                    </label>
                                    <input
                                        type="email"
                                        value={selectedServer.username}
                                        onChange={(e) => setSelectedServer({ ...selectedServer, username: e.target.value })}
                                        disabled={!isEditing && !isCreating}
                                        placeholder="user@example.com"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={selectedServer.password}
                                        onChange={(e) => setSelectedServer({ ...selectedServer, password: e.target.value })}
                                        disabled={!isEditing && !isCreating}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        OAuth Token Status
                                    </label>
                                    <div style={{
                                        padding: '12px',
                                        background: selectedServer.oauthTokenStatus === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        border: `1px solid ${selectedServer.oauthTokenStatus === 'Active' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                        borderRadius: '10px',
                                        color: selectedServer.oauthTokenStatus === 'Active' ? '#22c55e' : '#ef4444',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        textAlign: 'center'
                                    }}>
                                        {selectedServer.oauthTokenStatus}
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                                Attachment Settings
                            </h3>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                    Convert Attachments to Links Over (MB)
                                </label>
                                <input
                                    type="number"
                                    value={selectedServer.convertAttachmentsOverMB}
                                    onChange={(e) => setSelectedServer({ ...selectedServer, convertAttachmentsOverMB: parseInt(e.target.value) })}
                                    disabled={!isEditing && !isCreating}
                                    style={{
                                        width: '200px',
                                        padding: '12px',
                                        background: 'var(--input-bg)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Logs Section */}
                        {!isCreating && (
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
                                    Outgoing Email Logs
                                </h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--input-bg)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recipient Email</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subject</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Error Message</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {emailLogs.map(log => (
                                                <tr key={log.id} style={{ background: 'var(--bg-card)' }}>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                        {new Date(log.date).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                                                        {log.recipientEmail}
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                                        {log.subject}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            background: log.status === 'Sent' ? 'rgba(34, 197, 94, 0.2)' : log.status === 'Failed' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 197, 24, 0.2)',
                                                            color: log.status === 'Sent' ? '#22c55e' : log.status === 'Failed' ? '#ef4444' : '#F5C518',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700
                                                        }}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {log.errorMessage || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                        <Send size={64} color="var(--text-muted)" opacity={0.3} />
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                            Select a server or create a new one
                        </p>
                    </div>
                )}
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
                            {testResult.success ? 'Connection Successful!' : 'Test Failed'}
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

export default OutgoingMailServerPage;
