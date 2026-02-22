import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            // Give Supabase a moment to process the hash if present
            const { data } = await supabase.auth.getSession();

            if (!data.session && (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery'))) {
                // Wait 1 second and retry once
                await new Promise(r => setTimeout(r, 1000));
                const { data: retryData } = await supabase.auth.getSession();
                if (retryData.session) return;
            }

            if (!data.session) {
                setStatus('error');
                setMessage('Your reset link may have expired or is invalid. Please request a new one from the login page.');
            }
        };
        checkSession();
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
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
            setMessage('Your password has been updated successfully! You can now log in with your new credentials.');
        }
        setLoading(false);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)',
            padding: '20px',
            color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '48px',
                    borderRadius: '40px',
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(25px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
                }}
            >
                <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #F5C518 0%, #FFD700 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    color: '#000',
                    boxShadow: '0 10px 30px rgba(245,197,24,0.3)'
                }}>
                    <ShieldCheck size={36} />
                </div>

                {status === 'form' && (
                    <>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>Reset Password</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginBottom: '32px' }}>Enter your new strong password below</p>

                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ textAlign: 'left' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: '8px', display: 'block', marginLeft: '4px', textTransform: 'uppercase' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Min 8 characters"
                                        required
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '16px 16px 16px 48px',
                                            borderRadius: '16px',
                                            color: '#fff',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'border-color 0.3s'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ textAlign: 'left' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: '8px', display: 'block', marginLeft: '4px', textTransform: 'uppercase' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        required
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '16px 16px 16px 48px',
                                            borderRadius: '16px',
                                            color: '#fff',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            {message && (
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}>
                                    <AlertCircle size={16} />
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    background: '#F5C518',
                                    color: '#000',
                                    border: 'none',
                                    padding: '18px',
                                    borderRadius: '16px',
                                    fontWeight: 800,
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    boxShadow: '0 20px 40px rgba(245,197,24,0.2)',
                                    transition: 'transform 0.2s, background 0.2s'
                                }}
                            >
                                {loading ? <RefreshCw className="spin" size={20} /> : (
                                    <>
                                        <span>Update Password</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}

                {status === 'success' && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                        <div style={{ color: '#10b981', marginBottom: '24px' }}>
                            <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>Success!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '40px', fontSize: '1.05rem' }}>{message}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                background: '#F5C518',
                                color: '#000',
                                border: 'none',
                                padding: '16px 32px',
                                borderRadius: '16px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 10px 20px rgba(245,197,24,0.2)'
                            }}
                        >
                            Log In Now
                        </button>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                        <div style={{ color: '#ef4444', marginBottom: '24px' }}>
                            <AlertCircle size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>Link Expired</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '40px', fontSize: '1.05rem' }}>{message}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                padding: '16px 32px',
                                borderRadius: '16px',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            Go to Login
                        </button>
                    </motion.div>
                )}
            </motion.div>

            <style>{`
                .spin { animation: spin 1.5s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input:focus { border-color: #F5C518 !important; }
            `}</style>
        </div>
    );
};

export default ResetPasswordPage;
