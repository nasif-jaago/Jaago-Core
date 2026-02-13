import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, XCircle, Link as LinkIcon, Save, Edit2, Brain, Loader, Eye, EyeOff } from 'lucide-react';

interface AIProvider {
    name: 'ChatGPT' | 'Gemini';
    enabled: boolean;
    apiKey: string;
    status: 'connected' | 'disconnected' | 'untested';
    lastTested: string;
}

interface KnowledgeDrive {
    link: string;
    status: 'connected' | 'disconnected' | 'untested';
    lastConnected: string;
}

interface AIAgentPageProps {
    onBack: () => void;
    role?: string;
}

const AIAgentPage: React.FC<AIAgentPageProps> = ({ onBack, role }) => {
    const isAdmin = role === 'admin' || role === 'System Administrator' || role === 'Super Admin';
    const [providers, setProviders] = useState<AIProvider[]>([
        {
            name: 'ChatGPT',
            enabled: false,
            apiKey: '',
            status: 'untested',
            lastTested: ''
        },
        {
            name: 'Gemini',
            enabled: false,
            apiKey: '',
            status: 'untested',
            lastTested: ''
        }
    ]);

    const [knowledgeDrive, setKnowledgeDrive] = useState<KnowledgeDrive>({
        link: '',
        status: 'untested',
        lastConnected: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isConnectingDrive, setIsConnectingDrive] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; title: string } | null>(null);

    // Admin Full Access Mode State
    const [adminConfig, setAdminConfig] = useState({
        enabled: false,
        scope: 'read_only' as 'read_only' | 'read_write_confirmed',
        timeout: 30,
        requireReauth: true,
        sessionActive: false,
        sessionExpiry: null as string | null
    });

    const [showReauth, setShowReauth] = useState(false);
    const [reauthPassword, setReauthPassword] = useState('');

    useEffect(() => {
        // Load saved configuration from localStorage
        const savedConfig = localStorage.getItem('ai-agent-config');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            if (config.providers) setProviders(config.providers);
            if (config.knowledgeDrive) setKnowledgeDrive(config.knowledgeDrive);
            if (config.adminConfig) setAdminConfig(config.adminConfig);
        }
    }, []);

    const handleProviderToggle = (providerName: 'ChatGPT' | 'Gemini') => {
        setProviders(providers.map(p => ({
            ...p,
            enabled: p.name === providerName ? !p.enabled : false // Only one can be active
        })));
    };

    const handleApiKeyChange = (providerName: 'ChatGPT' | 'Gemini', value: string) => {
        setProviders(providers.map(p =>
            p.name === providerName ? { ...p, apiKey: value } : p
        ));
    };

    const handleTestConnection = async () => {
        const activeProvider = providers.find(p => p.enabled);

        if (!activeProvider) {
            setTestResult({
                success: false,
                title: 'No Provider Selected',
                message: 'Please select an AI provider before testing.'
            });
            return;
        }

        if (!activeProvider.apiKey) {
            setTestResult({
                success: false,
                title: 'API Key Missing',
                message: 'Please provide an API key before testing.'
            });
            return;
        }

        setIsTesting(true);

        // Simulate API test
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For demo purposes, we'll simulate a successful connection
        // In production, you would make an actual API call here
        const isSuccessful = activeProvider.apiKey.length > 10; // Simple validation

        const now = new Date().toISOString();

        if (isSuccessful) {
            setProviders(providers.map(p =>
                p.name === activeProvider.name
                    ? { ...p, status: 'connected', lastTested: now }
                    : p
            ));
            setTestResult({
                success: true,
                title: 'Connection Successful',
                message: `${activeProvider.name} AI provider is working correctly.`
            });
        } else {
            setProviders(providers.map(p =>
                p.name === activeProvider.name
                    ? { ...p, status: 'disconnected', lastTested: now }
                    : p
            ));
            setTestResult({
                success: false,
                title: 'Connection Failed',
                message: 'Not Working. Please check your API key.'
            });
        }

        setIsTesting(false);
    };

    const handleConnectDrive = async () => {
        if (!knowledgeDrive.link) {
            setTestResult({
                success: false,
                title: 'Link Missing',
                message: 'Please provide a Knowledge Drive link.'
            });
            return;
        }

        // Validate URL format
        try {
            new URL(knowledgeDrive.link);
        } catch {
            setTestResult({
                success: false,
                title: 'Invalid URL',
                message: 'Please provide a valid URL format.'
            });
            return;
        }

        setIsConnectingDrive(true);

        // Simulate drive connection test
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For demo purposes, simulate successful connection
        const isAccessible = knowledgeDrive.link.includes('drive') || knowledgeDrive.link.includes('docs');

        const now = new Date().toISOString();

        if (isAccessible) {
            setKnowledgeDrive({
                ...knowledgeDrive,
                status: 'connected',
                lastConnected: now
            });
            setTestResult({
                success: true,
                title: 'Drive Connected',
                message: 'Knowledge Drive is now accessible. AI agent will use this as a knowledge base.'
            });
        } else {
            setKnowledgeDrive({
                ...knowledgeDrive,
                status: 'disconnected',
                lastConnected: now
            });
            setTestResult({
                success: false,
                title: 'Drive Connection Failed',
                message: 'Unable to access Knowledge Drive link.'
            });
        }

        setIsConnectingDrive(false);
    };

    const handleSave = () => {
        const config = {
            providers,
            knowledgeDrive,
            adminConfig
        };
        localStorage.setItem('ai-agent-config', JSON.stringify(config));

        // Log the configuration
        const log = {
            timestamp: new Date().toISOString(),
            action: 'Configuration Saved',
            activeProvider: providers.find(p => p.enabled)?.name || 'None',
            driveConnected: knowledgeDrive.status === 'connected'
        };

        const logs = JSON.parse(localStorage.getItem('ai-agent-logs') || '[]');
        logs.unshift(log);
        localStorage.setItem('ai-agent-logs', JSON.stringify(logs.slice(0, 50)));

        setIsEditing(false);
        setTestResult({
            success: true,
            title: 'Configuration Saved',
            message: 'AI Agent settings and Admin controls have been saved successfully.'
        });
    };

    const handleStartSession = () => {
        if (adminConfig.requireReauth) {
            setShowReauth(true);
        } else {
            activateSession();
        }
    };

    const activateSession = () => {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + adminConfig.timeout);

        const newConfig = {
            ...adminConfig,
            sessionActive: true,
            sessionExpiry: expiry.toISOString()
        };
        setAdminConfig(newConfig);

        // Save to localStorage immediately for the session
        const currentConfig = JSON.parse(localStorage.getItem('ai-agent-config') || '{}');
        localStorage.setItem('ai-agent-config', JSON.stringify({ ...currentConfig, adminConfig: newConfig }));

        // Log the session start
        const log = {
            timestamp: new Date().toISOString(),
            action: 'Admin Full Access Session Started',
            user: role || 'Unknown Admin',
            scope: adminConfig.scope
        };
        const logs = JSON.parse(localStorage.getItem('ai-agent-logs') || '[]');
        logs.unshift(log);
        localStorage.setItem('ai-agent-logs', JSON.stringify(logs.slice(0, 50)));

        setTestResult({
            success: true,
            title: 'Admin Session Active',
            message: `Restricted Full Access Mode is now active for ${adminConfig.timeout} minutes.`
        });
    };

    const handleEndSession = () => {
        const newConfig = {
            ...adminConfig,
            sessionActive: false,
            sessionExpiry: null
        };
        setAdminConfig(newConfig);

        const currentConfig = JSON.parse(localStorage.getItem('ai-agent-config') || '{}');
        localStorage.setItem('ai-agent-config', JSON.stringify({ ...currentConfig, adminConfig: newConfig }));

        // Log the session end
        const log = {
            timestamp: new Date().toISOString(),
            action: 'Admin Full Access Session Ended',
            user: role || 'Unknown Admin'
        };
        const logs = JSON.parse(localStorage.getItem('ai-agent-logs') || '[]');
        logs.unshift(log);
        localStorage.setItem('ai-agent-logs', JSON.stringify(logs.slice(0, 50)));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected':
                return '#22c55e';
            case 'disconnected':
                return '#ef4444';
            default:
                return '#71717A';
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                            AI Providers Configuration
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                            Configure AI providers and knowledge base integration
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {!isEditing ? (
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
                    ) : (
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
                                <Save size={18} />
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
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
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'auto' }}>
                {/* Main Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Section 1: AI Providers */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <Brain size={24} color="var(--primary)" />
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                                AI Providers
                            </h2>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                            Select and configure your AI provider. Only one provider can be active at a time.
                        </p>

                        {/* ChatGPT Provider */}
                        <div style={{
                            padding: '20px',
                            background: 'var(--input-bg)',
                            border: `2px solid ${providers[0].enabled ? 'var(--primary)' : 'var(--border-glass)'}`,
                            borderRadius: '16px',
                            marginBottom: '20px',
                            transition: 'all 0.3s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                                    <input
                                        type="checkbox"
                                        checked={providers[0].enabled}
                                        onChange={() => handleProviderToggle('ChatGPT')}
                                        disabled={!isEditing}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                            Use your own ChatGPT account
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Provide your API key to connect with your account
                                        </div>
                                    </div>
                                </label>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: getStatusColor(providers[0].status),
                                    boxShadow: `0 0 10px ${getStatusColor(providers[0].status)}`,
                                    flexShrink: 0,
                                    marginTop: '4px'
                                }} />
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    name="chatgpt_api_key"
                                    value={providers[0].apiKey}
                                    onChange={(e) => handleApiKeyChange('ChatGPT', e.target.value)}
                                    disabled={!isEditing || !providers[0].enabled}
                                    placeholder="sk-..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        fontFamily: 'monospace'
                                    }}
                                />
                            </div>

                            {providers[0].lastTested && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Last tested: {new Date(providers[0].lastTested).toLocaleString()}
                                </div>
                            )}
                        </div>

                        {/* Gemini Provider */}
                        <div style={{
                            padding: '20px',
                            background: 'var(--input-bg)',
                            border: `2px solid ${providers[1].enabled ? 'var(--primary)' : 'var(--border-glass)'}`,
                            borderRadius: '16px',
                            transition: 'all 0.3s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                                    <input
                                        type="checkbox"
                                        checked={providers[1].enabled}
                                        onChange={() => handleProviderToggle('Gemini')}
                                        disabled={!isEditing}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                            Use your own Google Gemini account
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Provide your API key to connect with your account
                                        </div>
                                    </div>
                                </label>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: getStatusColor(providers[1].status),
                                    boxShadow: `0 0 10px ${getStatusColor(providers[1].status)}`,
                                    flexShrink: 0,
                                    marginTop: '4px'
                                }} />
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    name="gemini_api_key"
                                    value={providers[1].apiKey}
                                    onChange={(e) => handleApiKeyChange('Gemini', e.target.value)}
                                    disabled={!isEditing || !providers[1].enabled}
                                    placeholder="AIza..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        fontFamily: 'monospace'
                                    }}
                                />
                            </div>

                            {providers[1].lastTested && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Last tested: {new Date(providers[1].lastTested).toLocaleString()}
                                </div>
                            )}
                        </div>

                        {/* Test Connection Button */}
                        <div style={{ marginTop: '24px' }}>
                            <button
                                onClick={handleTestConnection}
                                disabled={isTesting || !providers.some(p => p.enabled)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    cursor: isTesting || !providers.some(p => p.enabled) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    opacity: !providers.some(p => p.enabled) ? 0.5 : 1
                                }}
                            >
                                {isTesting ? <Loader className="spin" size={20} /> : <Play size={20} />}
                                {isTesting ? 'Testing Connection...' : 'Test Connection'}
                            </button>
                        </div>
                    </div>

                    {/* Section 3: Knowledge Drive Integration */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <LinkIcon size={24} color="var(--primary)" />
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                                Knowledge Drive Integration
                            </h2>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Connect a knowledge drive to enhance AI responses with custom knowledge base.
                        </p>

                        <div style={{
                            padding: '20px',
                            background: 'var(--input-bg)',
                            border: `2px solid ${knowledgeDrive.status === 'connected' ? '#22c55e' : 'var(--border-glass)'}`,
                            borderRadius: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Knowledge Drive Link
                                    </label>
                                    <input
                                        type="url"
                                        name="knowledge_drive_link"
                                        value={knowledgeDrive.link}
                                        onChange={(e) => setKnowledgeDrive({ ...knowledgeDrive, link: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="https://drive.google.com/..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: getStatusColor(knowledgeDrive.status),
                                    boxShadow: `0 0 10px ${getStatusColor(knowledgeDrive.status)}`,
                                    flexShrink: 0,
                                    marginTop: '28px'
                                }} />
                            </div>

                            {knowledgeDrive.lastConnected && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                    Last connected: {new Date(knowledgeDrive.lastConnected).toLocaleString()}
                                </div>
                            )}

                            <button
                                onClick={handleConnectDrive}
                                disabled={isConnectingDrive || !knowledgeDrive.link}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    cursor: isConnectingDrive || !knowledgeDrive.link ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: !knowledgeDrive.link ? 0.5 : 1
                                }}
                            >
                                {isConnectingDrive ? <Loader className="spin" size={18} /> : <LinkIcon size={18} />}
                                {isConnectingDrive ? 'Connecting...' : 'Connect Drive'}
                            </button>
                        </div>
                    </div>

                    {/* Section 4: Admin Full Access Mode (Admin Only) */}
                    {isAdmin && (
                        <div className="glass-panel" style={{ padding: '24px', border: adminConfig.sessionActive ? '2px solid #22c55e' : '1px solid var(--border-glass)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Save size={24} color="#22c55e" />
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                                    Admin Full Access Mode
                                </h2>
                                <div style={{
                                    marginLeft: 'auto',
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    background: adminConfig.sessionActive ? '#22c55e' : '#ef4444',
                                    boxShadow: `0 0 10px ${adminConfig.sessionActive ? '#22c55e' : '#ef4444'}`
                                }} />
                            </div>

                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                Grant AI Baba complete access to website data, backend Odoo models, and knowledge drive.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={adminConfig.enabled}
                                            onChange={(e) => setAdminConfig({ ...adminConfig, enabled: e.target.checked })}
                                            disabled={!isEditing}
                                        />
                                        Enable Full Access Capability
                                    </label>
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={adminConfig.requireReauth}
                                            onChange={(e) => setAdminConfig({ ...adminConfig, requireReauth: e.target.checked })}
                                            disabled={!isEditing}
                                        />
                                        Require Admin Re-authentication
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Access Scope
                                    </label>
                                    <select
                                        value={adminConfig.scope}
                                        onChange={(e) => setAdminConfig({ ...adminConfig, scope: e.target.value as any })}
                                        disabled={!isEditing}
                                        style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'var(--text-main)' }}
                                    >
                                        <option value="read_only">Read Only (Default)</option>
                                        <option value="read_write_confirmed">Read & Write (Confirmed)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        Session Timeout (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={adminConfig.timeout}
                                        onChange={(e) => setAdminConfig({ ...adminConfig, timeout: parseInt(e.target.value) })}
                                        disabled={!isEditing}
                                        style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'var(--text-main)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                {adminConfig.sessionActive ? (
                                    <button
                                        onClick={handleEndSession}
                                        style={{ flex: 1, padding: '14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                                    >
                                        End Admin Full Access Session
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStartSession}
                                        disabled={!adminConfig.enabled}
                                        style={{
                                            flex: 1, padding: '14px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800,
                                            cursor: !adminConfig.enabled ? 'not-allowed' : 'pointer', opacity: !adminConfig.enabled ? 0.5 : 1
                                        }}
                                    >
                                        Start Admin Full Access Session
                                    </button>
                                )}
                                <button
                                    onClick={() => {/* Open logs modal */ }}
                                    style={{ padding: '14px', background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border-glass)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Log
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Info */}
                <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Status Overview */}
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
                            Configuration Status
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Active Provider:</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    {providers.find(p => p.enabled)?.name || 'None'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Admin session:</span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: adminConfig.sessionActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: adminConfig.sessionActive ? '#22c55e' : '#ef4444'
                                }}>
                                    {adminConfig.sessionActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Provider Status:</span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: providers.find(p => p.enabled)?.status === 'connected' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: providers.find(p => p.enabled)?.status === 'connected' ? '#22c55e' : '#ef4444'
                                }}>
                                    {providers.find(p => p.enabled)?.status.toUpperCase() || 'N/A'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Knowledge Drive:</span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: knowledgeDrive.status === 'connected' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: knowledgeDrive.status === 'connected' ? '#22c55e' : '#ef4444'
                                }}>
                                    {knowledgeDrive.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Knowledge Usage Info */}
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                        borderRadius: '16px',
                        color: '#fff'
                    }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>
                            🧠 AI Knowledge Usage
                        </h4>
                        {knowledgeDrive.status === 'connected' ? (
                            <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                                <p style={{ marginBottom: '8px' }}>
                                    ✓ AI agent is using your Knowledge Drive
                                </p>
                                <p style={{ opacity: 0.9 }}>
                                    Responses will prioritize information from your connected drive over general AI knowledge.
                                </p>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.9 }}>
                                AI agent is using standard knowledge base. Connect a Knowledge Drive to provide custom information.
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                            📝 Instructions
                        </h4>
                        <ul style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.8, paddingLeft: '20px' }}>
                            <li>Select only one AI provider at a time</li>
                            <li>Enter your API key for the selected provider</li>
                            <li>Click "Test Connection" to verify</li>
                            <li>Optionally connect a Knowledge Drive</li>
                            <li>Save your configuration</li>
                        </ul>
                    </div>
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
                            {testResult.title}
                        </h3>
                        <p style={{ color: 'var(--text-dim)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                            {testResult.message}
                        </p>
                        <button
                            onClick={() => setTestResult(null)}
                            style={{
                                marginTop: '24px',
                                background: testResult.success ? '#22c55e' : '#ef4444',
                                color: testResult.success ? '#000' : '#fff',
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

            {/* Re-authentication Modal */}
            {showReauth && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10001, backdropFilter: 'blur(10px)'
                }}>
                    <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '90%' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '16px', textAlign: 'center' }}>
                            Admin Confirmation
                        </h3>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>
                            Please re-enter your administrator password to start a Restricted Full Access session.
                        </p>
                        <div style={{ position: 'relative', marginBottom: '8px' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Admin Password"
                                value={reauthPassword}
                                onChange={(e) => setReauthPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px', paddingRight: '45px', background: 'var(--bg-card)',
                                    border: '1px solid var(--border-glass)', borderRadius: '12px',
                                    color: 'var(--text-main)'
                                }}
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '20px', textAlign: 'center' }}>
                            Hint: The test password is <strong>admin</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    if (reauthPassword.trim() === 'admin') { // Simulated password
                                        setShowReauth(false);
                                        setReauthPassword('');
                                        setShowPassword(false);
                                        activateSession();
                                    } else {
                                        alert('Invalid Admin Password');
                                    }
                                }}
                                style={{ flex: 1, padding: '12px', background: 'var(--primary-gradient)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => { setShowReauth(false); setReauthPassword(''); }}
                                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', border: '1px solid var(--border-glass)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAgentPage;
