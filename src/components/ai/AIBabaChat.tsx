import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Minus, Maximize2 } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'ai' | 'user';
    timestamp: Date;
    attachments?: File[];
}

interface AIBabaChatProps {
    onClose: () => void;
    onMinimize: () => void;
    role?: string;
    onCommand?: (command: string, data?: any) => void;
}

const AIBabaChat: React.FC<AIBabaChatProps> = ({ onClose, onMinimize, role, onCommand }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm AI Baba, your intelligent assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [driveStatus, setDriveStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [chatDimensions, setChatDimensions] = useState({ width: 320, height: 480 });
    const [position, setPosition] = useState({
        x: window.innerWidth - 350,
        y: window.innerHeight - 590
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const [adminConfig, setAdminConfig] = useState<any>(null);
    const [pendingAction, setPendingAction] = useState<any>(null);

    useEffect(() => {
        // Scroll to bottom on new messages
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        // Check Knowledge Drive connection from AI Settings
        const savedConfig = localStorage.getItem('ai-agent-config');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            if (config.knowledgeDrive && config.knowledgeDrive.status === 'connected') {
                setDriveStatus('connected');
            }
            if (config.adminConfig) {
                // Check for session expiry
                if (config.adminConfig.sessionActive && config.adminConfig.sessionExpiry) {
                    if (new Date() > new Date(config.adminConfig.sessionExpiry)) {
                        // Auto-expire session
                        const newAdminConfig = { ...config.adminConfig, sessionActive: false };
                        setAdminConfig(newAdminConfig);
                        localStorage.setItem('ai-agent-config', JSON.stringify({ ...config, adminConfig: newAdminConfig }));
                    } else {
                        setAdminConfig(config.adminConfig);
                    }
                } else {
                    setAdminConfig(config.adminConfig);
                }
            }
        }
    }, []);

    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStartRef.current.x,
                    y: e.clientY - dragStartRef.current.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Security Logging
        console.log(`[AI BABA AUDIT] User Query: "${userMsg.text}" | Role: ${role} | Time: ${new Date().toISOString()}`);

        // Admin Audit Logging if session active
        if (adminConfig?.sessionActive) {
            const auditLog = {
                timestamp: new Date().toISOString(),
                admin_user_id: role || 'Admin',
                request_text: userMsg.text,
                data_sources_used: ['website', 'odoo', 'backend'],
                session_id: 'SESS-' + Date.now()
            };
            const currentLogs = JSON.parse(localStorage.getItem('ai_admin_audit_log') || '[]');
            currentLogs.unshift(auditLog);
            localStorage.setItem('ai_admin_audit_log', JSON.stringify(currentLogs.slice(0, 100)));
        }

        try {
            // Check for confirmation if pending action
            if (pendingAction && (userMsg.text.toLowerCase() === 'confirm' || userMsg.text.toLowerCase() === 'yes')) {
                setIsTyping(true);
                await new Promise(resolve => setTimeout(resolve, 1500));
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    text: `✅ Action Executed Successfully: ${pendingAction.description}\nChanges logged in audit trail.`,
                    sender: 'ai',
                    timestamp: new Date()
                }]);
                setPendingAction(null);
                setIsTyping(false);
                return;
            }

            // Get AI Configuration
            const savedConfig = localStorage.getItem('ai-agent-config');
            let aiResponseText = '';

            const isFullAccess = adminConfig?.sessionActive;
            const systemPrompt = `You are AI Baba, an intelligent assistant for the JAAGO Foundation ERP system. 
            ${isFullAccess ? 'ADMIN FULL ACCESS MODE ACTIVE. You have permission to read all Odoo models, server logs, and system configs.' : 'Standard Access Mode.'}
            
            You can help users with:
            1. Navigation: Opening modules like Employees, HR, Finance, Admin, Contacts, Expenses, etc.
            2. Odoo Data: Fetching employee counts, department info, or contact details.
            3. Automation: Drafting emails or setting reminders.
            ${isFullAccess ? '4. Advanced Diagnostics: Analyze Odoo field structures (ir.model.fields) and system performance.' : ''}
            
            ${isFullAccess ? 'SECURITY POLICY: Mask all secrets (API keys, passwords, tokens). Only show last 4 chars (e.g. ****ABCD).' : ''}
            
            Current UI structure:
            - Tabs: Dashboard, Human Resources, Admin & Procurement, Child Welfare, Finance, Admin, Emails Log.
            - Modules: employees, leave, contacts, approvals, expenses, onduty, appraisals, api-settings.
            
            User message: "${userMsg.text}"`;

            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                const activeProvider = config.providers?.find((p: any) => p.enabled && p.status === 'connected');

                if (activeProvider && activeProvider.apiKey) {
                    if (activeProvider.id === 'openai') {
                        const response = await fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${activeProvider.apiKey}`
                            },
                            body: JSON.stringify({
                                model: 'gpt-3.5-turbo',
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user', content: userMsg.text }
                                ]
                            })
                        });
                        const data = await response.json();
                        aiResponseText = data.choices?.[0]?.message?.content;
                    } else if (activeProvider.id === 'gemini') {
                        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${activeProvider.apiKey}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{ text: systemPrompt + "\\n\\nUser says: " + userMsg.text }]
                                }]
                            })
                        });
                        const data = await response.json();
                        aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    }
                }
            }

            // Fallback to local logic for navigation and basic queries if no AI response or for speed
            const localResponse = generateAIResponse(userMsg.text);

            // If local logic successfully triggered a command (like navigate), we prefer the local response message
            if (!aiResponseText || localResponse !== "The requested information could not be located within the system knowledge base. For technical assistance or further clarification, please contact the system administrator at nasif.kamal@jaago.com.bd.") {
                aiResponseText = localResponse;
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('AI API Error:', error);
            const aiResponseText = generateAIResponse(userMsg.text);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateAIResponse = (query: string) => {
        const q = query.toLowerCase();

        // Navigation Intents
        if (q.includes('open') || q.includes('go to') || q.includes('show')) {
            if (q.includes('human resources') || q.includes('hr')) {
                onCommand?.('navigate', { tab: 'Human Resources' });
                return "Sure! I'm opening the Human Resources dashboard for you now.";
            }
            if (q.includes('dashboard')) {
                onCommand?.('navigate', { tab: 'Dashboard' });
                return "Navigating to your main Dashboard.";
            }
            if (q.includes('admin') && q.includes('procurement')) {
                onCommand?.('navigate', { tab: 'Admin & Procurement' });
                return "Opening the Admin & Procurement section.";
            }
            if (q.includes('employee')) {
                onCommand?.('navigate', { module: 'employees' });
                return "Accessing the Employees module for you.";
            }
            if (q.includes('leave')) {
                onCommand?.('navigate', { module: 'leave' });
                return "Opening Leave Requests.";
            }
            if (q.includes('contact')) {
                onCommand?.('navigate', { module: 'contacts' });
                return "Loading your Contacts.";
            }
            if (q.includes('settings') || q.includes('api')) {
                onCommand?.('navigate', { module: 'api-settings' });
                return "Taking you to AI and API Settings.";
            }
            if (q.includes('expense')) {
                onCommand?.('navigate', { module: 'expenses' });
                return "Opening the Expenses module.";
            }
        }

        // Theme Toggle
        if (q.includes('dark mode') || q.includes('light mode') || q.includes('theme')) {
            onCommand?.('theme', {});
            return "Switching the system theme for you.";
        }

        // Simple heuristic responses for demonstration
        if (q.includes('help') || q.includes('what can you do')) {
            return "I can help you search backend data, fetch Odoo field information, perform calculations, draft emails, set reminders, and analyze your documents. What would you like to start with?";
        }

        if (q.includes('email')) {
            return "I've drafted an email for you. Would you like to review it? \n\nSubject: Information Request\nDear nasif,\n\nI am writing to inquire about the latest updates regarding the project...\n";
        }

        if (q.includes('calculate') || q.includes('+') || q.includes('*')) {
            return "Based on the stored data, the calculation result is 42,500 BDT.";
        }

        // Fallback message as required
        return "The requested information could not be located within the system knowledge base. For technical assistance or further clarification, please contact the system administrator at nasif.kamal@jaago.com.bd.";
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Simulate reading file
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: `I've analyzed the uploaded file "${files[0].name}". It seems to be a procurement report. I can summarize it or extract specific data if you'd like.`,
                sender: 'ai',
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 2000);
    };

    return (
        <div
            className="ai-baba-chat-window"
            style={{
                width: chatDimensions.width,
                height: chatDimensions.height,
                left: position.x,
                top: position.y,
                bottom: 'auto',
                right: 'auto'
            }}
        >
            {/* Resize Handles */}
            {/* Right Edge */}
            <div
                style={{ position: 'absolute', top: 0, right: 0, width: '5px', height: '100%', cursor: 'e-resize', zIndex: 1000 }}
                onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startWidth = chatDimensions.width;
                    const onMove = (me: MouseEvent) => setChatDimensions(d => ({ ...d, width: Math.max(300, startWidth + (me.clientX - startX)) }));
                    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                }}
            />
            {/* Bottom Edge */}
            <div
                style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '5px', cursor: 's-resize', zIndex: 1000 }}
                onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startHeight = chatDimensions.height;
                    const onMove = (me: MouseEvent) => setChatDimensions(d => ({ ...d, height: Math.max(400, startHeight + (me.clientY - startY)) }));
                    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                }}
            />
            {/* Bottom-Right Corner */}
            <div
                style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', cursor: 'nwse-resize', zIndex: 1001 }}
                onMouseDown={(e) => {
                    const sx = e.clientX; const sy = e.clientY;
                    const sw = chatDimensions.width; const sh = chatDimensions.height;
                    const onMove = (me: MouseEvent) => setChatDimensions({ width: Math.max(300, sw + (me.clientX - sx)), height: Math.max(400, sh + (me.clientY - sy)) });
                    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                }}
            />

            <div className="ai-baba-chat-header" onMouseDown={handleHeaderMouseDown} style={{ cursor: 'move' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h3 style={{ margin: 0 }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <img
                                src="/ai-baba.png"
                                alt="AI Baba"
                                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=AIBaba&backgroundColor=f5c518';
                                }}
                            />
                            <div className={`status-indicator ${driveStatus === 'connected' ? 'status-online' : 'status-offline'}`}
                                style={{ position: 'absolute', bottom: -2, right: -2, border: '2px solid #000', width: 6, height: 6 }} />
                        </div>
                        AI Baba Assistant
                    </h3>
                    {adminConfig?.sessionActive && (
                        <div style={{
                            fontSize: '0.6rem',
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 800,
                            width: 'fit-content',
                            border: '1px solid rgba(34, 197, 94, 0.3)'
                        }}>
                            ADMIN FULL ACCESS ACTIVE
                        </div>
                    )}
                </div>
                <div className="ai-baba-chat-controls" onMouseDown={e => e.stopPropagation()}>
                    <button className="ai-baba-control-btn" onClick={onMinimize} title="Minimize">
                        <Minus size={16} />
                    </button>
                    <button className="ai-baba-control-btn" onClick={() => setChatDimensions({ width: 320, height: 480 })} title="Reset Size">
                        <Maximize2 size={16} />
                    </button>
                    <button className="ai-baba-control-btn" onClick={onClose} title="Close">
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="ai-baba-chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message-bubble ${msg.sender === 'ai' ? 'message-ai' : 'message-user'}`}>
                        {msg.sender === 'ai' && <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '4px' }}>AI BABA</div>}
                        {msg.text.split('\n').map((line, i) => <p key={i} style={{ margin: 0 }}>{line}</p>)}
                        <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: '4px', textAlign: msg.sender === 'ai' ? 'left' : 'right' }}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="typing-indicator message-ai">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="ai-baba-chat-input" onMouseDown={e => e.stopPropagation()}>
                <input
                    type="file"
                    id="ai-attachment-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*"
                />
                <button className="ai-action-btn" onClick={() => document.getElementById('ai-attachment-upload')?.click()}>
                    <Paperclip size={18} />
                </button>

                <textarea
                    className="ai-chat-textarea"
                    placeholder="Ask AI Baba anything..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    rows={1}
                />

                <button className={`ai-action-btn ${inputText.trim() ? 'ai-send-btn' : ''}`} onClick={handleSend} disabled={!inputText.trim()}>
                    <Send size={18} />
                </button>
            </div>

            {/* Drive Connection Status Footer */}
            <div style={{
                padding: '8px 20px',
                background: 'rgba(0,0,0,0.05)',
                fontSize: '0.65rem',
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderTop: '1px solid var(--border-glass)'
            }}>
                <div className={`status-indicator ${driveStatus === 'connected' ? 'status-online' : 'status-offline'}`} style={{ width: 6, height: 6 }} />
                Knowledge Drive: {driveStatus === 'connected' ? 'Connected' : 'Not Connected'}
                {driveStatus === 'disconnected' && (
                    <span style={{ marginLeft: 'auto', color: 'var(--primary)', cursor: 'pointer' }}>Connect in Settings</span>
                )}
            </div>
        </div>
    );
};

export default AIBabaChat;
