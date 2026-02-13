import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, RefreshCw, CheckCircle, XCircle, Mail, Server, Search, Filter } from 'lucide-react';

interface IncomingMailServer {
    id: string;
    serverName: string;
    serverType: 'IMAP' | 'POP' | 'Local' | 'Gmail OAuth';
    confirmed: boolean;
    lastFetchDate: string;
    host: string;
    port: number;
    sslEnabled: boolean;
    username: string;
    password: string;
    oauthTokenStatus: string;
    priority: number;
    active: boolean;
}

interface EmailLog {
    id: string;
    date: string;
    status: 'Success' | 'Failed' | 'Pending';
    message: string;
    emailAddress: string;
}

interface IncomingMailServerPageProps {
    onBack: () => void;
}

const IncomingMailServerPage: React.FC<IncomingMailServerPageProps> = ({ onBack }) => {
    const [servers, setServers] = useState<IncomingMailServer[]>([]);
    const [selectedServer, setSelectedServer] = useState<IncomingMailServer | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<boolean | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
    const [fetchHistory, setFetchHistory] = useState<EmailLog[]>([]);

    useEffect(() => {
        // Load sample data
        const sampleServers: IncomingMailServer[] = [
            {
                id: '1',
                serverName: 'JAAGO Gmail',
                serverType: 'Gmail OAuth',
                confirmed: true,
                lastFetchDate: new Date().toISOString(),
                host: 'imap.gmail.com',
                port: 993,
                sslEnabled: true,
                username: 'info@jaago.com.bd',
                password: '••••••••',
                oauthTokenStatus: 'Active',
                priority: 1,
                active: true
            }
        ];
        setServers(sampleServers);

        // Sample logs
        const sampleLogs: EmailLog[] = [
            {
                id: '1',
                date: new Date().toISOString(),
                status: 'Success',
                message: 'Fetched 15 new emails',
                emailAddress: 'info@jaago.com.bd'
            }
        ];
        setEmailLogs(sampleLogs);
        setFetchHistory(sampleLogs);
    }, []);

    const handleCreateNew = () => {
        const newServer: IncomingMailServer = {
            id: Date.now().toString(),
            serverName: '',
            serverType: 'IMAP',
            confirmed: false,
            lastFetchDate: '',
            host: '',
            port: 993,
            sslEnabled: true,
            username: '',
            password: '',
            oauthTokenStatus: 'Not Connected',
            priority: 10,
            active: true
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

    const handleFetchNow = async () => {
        setIsFetching(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const newLog: EmailLog = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status: 'Success',
            message: `Fetched ${Math.floor(Math.random() * 20)} new emails`,
            emailAddress: selectedServer?.username || ''
        };
        setEmailLogs([newLog, ...emailLogs]);
        setFetchHistory([newLog, ...fetchHistory]);
        setIsFetching(false);
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
                            Incoming Mail
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            Manage incoming servers
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
                                    <Server size={18} color="var(--primary)" />
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
                                {server.serverType} • {server.username}
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
                                {isCreating ? 'New Incoming Server' : selectedServer.serverName}
                            </h1>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {!isEditing && !isCreating && (
                                    <>
                                        <button
                                            onClick={handleFetchNow}
                                            disabled={isFetching}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                cursor: isFetching ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <RefreshCw size={18} className={isFetching ? 'spin' : ''} />
                                            {isFetching ? 'Fetching...' : 'Fetch Now'}
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
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
                                        Server Type *
                                    </label>
                                    <select
                                        value={selectedServer.serverType}
                                        onChange={(e) => setSelectedServer({ ...selectedServer, serverType: e.target.value as any })}
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
                                        <option value="IMAP">IMAP</option>
                                        <option value="POP">POP</option>
                                        <option value="Local">Local</option>
                                        <option value="Gmail OAuth">Gmail OAuth</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedServer.confirmed}
                                            onChange={(e) => setSelectedServer({ ...selectedServer, confirmed: e.target.checked })}
                                            disabled={!isEditing && !isCreating}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Confirmed</span>
                                    </label>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Last Fetch Date
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedServer.lastFetchDate ? new Date(selectedServer.lastFetchDate).toLocaleString() : 'Never'}
                                        disabled
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '10px',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                                Server Configuration
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Host *
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedServer.host}
                                        onChange={(e) => setSelectedServer({ ...selectedServer, host: e.target.value })}
                                        disabled={!isEditing && !isCreating}
                                        placeholder="imap.gmail.com"
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
                                        Port *
                                    </label>
                                    <input
                                        type="number"
                                        value={selectedServer.port}
                                        onChange={(e) => setSelectedServer({ ...selectedServer, port: parseInt(e.target.value) })}
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
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedServer.sslEnabled}
                                            onChange={(e) => setSelectedServer({ ...selectedServer, sslEnabled: e.target.checked })}
                                            disabled={!isEditing && !isCreating}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>SSL/TLS Enabled</span>
                                    </label>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
                                Login Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
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
                                Additional Settings
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                        </div>

                        {/* Logs Section */}
                        {!isCreating && (
                            <>
                                <div className="glass-panel" style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
                                        Incoming Email Logs
                                    </h3>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--input-bg)' }}>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Message</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {emailLogs.map(log => (
                                                    <tr key={log.id} style={{ background: 'var(--bg-card)' }}>
                                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                            {new Date(log.date).toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '12px' }}>
                                                            <span style={{
                                                                padding: '4px 12px',
                                                                background: log.status === 'Success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                                color: log.status === 'Success' ? '#22c55e' : '#ef4444',
                                                                borderRadius: '6px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700
                                                            }}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                                            {log.message}
                                                        </td>
                                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                                                            {log.emailAddress}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="glass-panel" style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
                                        Fetch History Logs
                                    </h3>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--input-bg)' }}>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Message</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fetchHistory.map(log => (
                                                    <tr key={log.id} style={{ background: 'var(--bg-card)' }}>
                                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                            {new Date(log.date).toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '12px' }}>
                                                            <span style={{
                                                                padding: '4px 12px',
                                                                background: log.status === 'Success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                                color: log.status === 'Success' ? '#22c55e' : '#ef4444',
                                                                borderRadius: '6px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700
                                                            }}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                                            {log.message}
                                                        </td>
                                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                                                            {log.emailAddress}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                        <Mail size={64} color="var(--text-muted)" opacity={0.3} />
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                            Select a server or create a new one
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncomingMailServerPage;
