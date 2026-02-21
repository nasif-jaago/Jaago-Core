import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Mail, User, Lock, ArrowLeft, Send, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

const RequestAccessPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: signUpError } = await signUp(email, password, name);

        if (signUpError) {
            setError(signUpError.message);
        } else {
            setSubmitted(true);
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', padding: '20px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel"
                    style={{ width: '100%', maxWidth: '440px', padding: '48px', borderRadius: '32px', textAlign: 'center' }}
                >
                    <div style={{ color: '#10b981', marginBottom: '24px' }}>
                        <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '16px' }}>Request Submitted</h1>
                    <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '32px' }}>
                        Thank you for requesting access. We've sent a verification email to <strong>{email}</strong>.
                        Please verify your email, after which our administrators will review your request.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="btn-3d"
                        style={{ padding: '16px 32px', width: '100%' }}
                    >
                        Back to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '480px', padding: '48px', borderRadius: '32px' }}
            >
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '32px', fontSize: '0.9rem', padding: 0 }}
                >
                    <ArrowLeft size={18} />
                    Back to Login
                </button>

                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Request Access</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '40px' }}>Join the JAAGO organizational platform</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="input-field-wrapper">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>FULL NAME</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                style={{ width: '100%', paddingLeft: '48px' }}
                            />
                        </div>
                    </div>

                    <div className="input-field-wrapper">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>WORK EMAIL</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="john.doe@jaago.com.bd"
                                required
                                style={{ width: '100%', paddingLeft: '48px' }}
                            />
                        </div>
                    </div>

                    <div className="input-field-wrapper">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>SET PASSWORD</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ width: '100%', paddingLeft: '48px' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-3d"
                        style={{ padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px' }}
                    >
                        {loading ? <RefreshCw className="spin" size={20} /> : (
                            <>
                                <span>Submit Access Request</span>
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    Your request will be automatically matched with your Odoo employee profile for faster approval.
                </p>
            </motion.div>
        </div>
    );
};

export default RequestAccessPage;
