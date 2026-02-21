import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

const AcceptInvitePage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Supabase typically handles the hash automatically and signs the user in
        // if they came from an invite email.
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                setStatus('error');
                setMessage('Invalid or expired invite link. Please contact your administrator.');
            }
        };
        checkSession();
    }, []);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setMessage('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setStatus('error');
            setMessage(error.message);
        } else {
            setStatus('success');
            setMessage('Your password has been set! Your account is now pending administrative approval.');
        }
        setLoading(false);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '440px', padding: '48px', borderRadius: '32px', textAlign: 'center' }}
            >
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#000' }}>
                    <Lock size={32} />
                </div>

                {status === 'form' && (
                    <>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Complete Registration</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '32px' }}>Set a secure password to access your account</p>

                        <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="input-field-wrapper" style={{ textAlign: 'left' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>NEW PASSWORD</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ width: '100%', padding: '16px', borderRadius: '16px' }}
                                />
                            </div>

                            <div className="input-field-wrapper" style={{ textAlign: 'left' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', display: 'block', marginLeft: '4px' }}>CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ width: '100%', padding: '16px', borderRadius: '16px' }}
                                />
                            </div>

                            {message && (
                                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} />
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-3d"
                                style={{ padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {loading ? <RefreshCw className="spin" size={20} /> : (
                                    <>
                                        <span>Set Password & Finish</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}

                {status === 'success' && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                        <div style={{ color: '#10b981', marginBottom: '16px' }}>
                            <CheckCircle2 size={56} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px' }}>Success!</h2>
                        <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '32px' }}>{message}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="btn-3d"
                            style={{ padding: '16px 32px' }}
                        >
                            Return to Login
                        </button>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                        <div style={{ color: '#ef4444', marginBottom: '16px' }}>
                            <AlertCircle size={56} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px' }}>Link Invalid</h2>
                        <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '32px' }}>{message}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="btn-secondary"
                            style={{ padding: '16px 32px' }}
                        >
                            Go to Homepage
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default AcceptInvitePage;
