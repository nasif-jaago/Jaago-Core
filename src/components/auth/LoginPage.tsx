import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, RefreshCw, Target, Rocket, Monitor, Tablet, Smartphone, Sparkles, Palette, Settings, Info } from 'lucide-react';
import JaagoLogo from '../shared/JaagoLogo';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [needsVerification, setNeedsVerification] = useState(false);

    const { signIn, signUp, resetPassword, resendVerificationEmail } = useAuth();
    const { theme, cycleTheme, viewMode, cycleViewMode } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            if (isSignUp) {
                const { error } = await signUp(email, password, name);
                if (error) throw error;
                setNeedsVerification(true);
                setMessage({ type: 'success', text: 'Verification link sent! Please check your email to activate your account.' });
            } else {
                const { error } = await signIn(email, password);
                if (error) {
                    if (error.message.includes('Email not confirmed')) {
                        setNeedsVerification(true);
                        setMessage({ type: 'info', text: 'Your email is not verified yet. Please check your inbox or click the button below to resend the link.' });
                        return;
                    }
                    throw error;
                }
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Authentication failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!email) return;
        setLoading(true);
        const { error } = await resendVerificationEmail(email);
        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'New verification link sent! Please check your email.' });
        }
        setLoading(false);
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setMessage({ type: 'error', text: 'Please enter your email address first.' });
            return;
        }
        setLoading(true);
        const { error } = await resetPassword(email);
        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Password reset link sent to your email!' });
        }
        setLoading(false);
    };

    const msgBg = (type: string) => type === 'success' ? 'rgba(16,185,129,0.1)' : type === 'info' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)';
    const msgColor = (type: string) => type === 'success' ? '#10b981' : type === 'info' ? '#3b82f6' : '#ef4444';
    const msgBorder = (type: string) => `1px solid ${type === 'success' ? 'rgba(16,185,129,0.3)' : type === 'info' ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}`;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: viewMode === 'mobile' ? 'stretch' : 'center',
            justifyContent: viewMode === 'mobile' ? 'flex-start' : 'center',
            background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)',
            color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            overflowX: 'hidden',
            position: 'relative'
        }}>
            {/* Background orbs */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'linear-gradient(45deg, rgba(245,197,24,0.1), transparent)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(60px)', animation: 'morph 15s ease-in-out infinite alternate', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'linear-gradient(45deg, rgba(0,242,255,0.05), transparent)', borderRadius: '50% 50% 20% 80% / 50% 20% 80% 50%', filter: 'blur(80px)', animation: 'morph 20s ease-in-out infinite alternate-reverse', zIndex: 0, pointerEvents: 'none' }} />

            <style>{`
                @keyframes morph {
                    0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotate(0deg) scale(1); }
                    100% { border-radius: 50% 50% 20% 80% / 50% 20% 80% 50%; transform: rotate(180deg) scale(1.2); }
                }
                .glass-portal {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(25px) saturate(180%);
                    -webkit-backdrop-filter: blur(25px) saturate(180%);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 40px;
                    padding: 60px;
                    display: flex;
                    gap: 80px;
                    max-width: 1200px;
                    width: 90%;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1);
                    z-index: 10;
                    transform-style: preserve-3d;
                    perspective: 1000px;
                    margin: 20px;
                }
                .vision-card, .mission-card {
                    background: #fff;
                    padding: 35px;
                    border-radius: 20px;
                    position: relative;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
                    color: #000;
                }
                .vision-card:hover, .mission-card:hover { transform: translateY(-10px) rotateX(5deg); }
                .accent-bar {
                    position: absolute; left: 20px; top: 85px;
                    width: 6px; height: 120px;
                    background: #F5C518; border-radius: 10px;
                }
                .spin { animation: spin 1.5s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .top-float-controls {
                    position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; gap: 10px;
                }
                .login-brand-top {
                    position: fixed; top: 20px; left: 20px; z-index: 1000;
                }
                body.view-mobile .login-brand-top,
                body.view-mobile .top-float-controls { display: none !important; }

                @media (max-width: 768px) {
                    .login-brand-top { display: none !important; }
                    .top-float-controls { top: 15px; right: 15px; }
                }

                /* Tablet portal */
                body.view-tablet .glass-portal {
                    flex-direction: column;
                    width: 92%;
                    max-width: 520px;
                    padding: 36px;
                    gap: 28px;
                    border-radius: 32px;
                    margin: 24px auto;
                }
            `}</style>

            {/* Fixed controls and brand — desktop/tablet only */}
            <div className="login-brand-top">
                <JaagoLogo color="#fff" showFoundation={true} scale={0.6} />
            </div>
            <div className="top-float-controls">
                <motion.button
                    onClick={cycleViewMode}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', padding: '10px', borderRadius: '12px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
                    title={`View: ${viewMode.toUpperCase()}`}
                >
                    {viewMode === 'desktop' && <Monitor size={20} />}
                    {viewMode === 'tablet' && <Tablet size={20} />}
                    {viewMode === 'mobile' && <Smartphone size={20} />}
                </motion.button>
                <motion.button
                    onClick={cycleTheme}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ background: 'var(--primary-gradient)', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 15px var(--primary-glow)' }}
                    title={`Theme: ${theme.toUpperCase()}`}
                >
                    {theme === 'dark' && <Sparkles size={18} />}
                    {theme === 'mode-b' && <Palette size={18} />}
                    {theme === 'mode-c' && <Settings size={18} />}
                </motion.button>
            </div>

            {/* ── MOBILE LAYOUT ── */}
            {viewMode === 'mobile' && (
                <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', zIndex: 10, position: 'relative' }}>
                    {/* Mobile hero header */}
                    <div style={{ background: 'linear-gradient(180deg, rgba(245,197,24,0.13) 0%, transparent 100%)', padding: '52px 28px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <JaagoLogo color="#fff" showFoundation={true} scale={0.55} />
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '28px', marginBottom: '6px', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                            {isSignUp ? 'Join Us.' : 'Sign In.'}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', margin: 0 }}>
                            Access the JAAGO Core Ecosystem
                        </p>
                    </div>

                    {/* Mobile form */}
                    <div style={{ flex: 1, padding: '28px 24px 48px' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {isSignUp && (
                                <div style={{ position: 'relative' }}>
                                    <User size={17} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required
                                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '15px 18px 15px 50px', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
                                </div>
                            )}

                            <div style={{ position: 'relative' }}>
                                <Mail size={17} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required
                                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '15px 18px 15px 50px', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Lock size={17} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '15px 48px 15px 50px', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
                                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.35)' }}>
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginTop: '2px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.45)' }}>
                                    <input type="checkbox" style={{ accentColor: '#F5C518', width: '16px', height: '16px' }} />
                                    Remember me
                                </label>
                                <span onClick={handleForgotPassword} style={{ color: '#F5C518', cursor: 'pointer', fontWeight: 700 }}>Forgot?</span>
                            </div>

                            <button type="submit" disabled={loading} style={{ width: '100%', background: '#F5C518', color: '#000', border: 'none', padding: '17px', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 12px 30px rgba(245,197,24,0.25)' }}>
                                {loading ? <RefreshCw className="spin" size={20} /> : (isSignUp ? 'Create Account' : 'Sign In Now')}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
                                New to the platform?{' '}
                                <span onClick={() => { window.location.search = '?view=request-access'; }} style={{ color: '#F5C518', cursor: 'pointer', fontWeight: 700 }}>Request Access</span>
                            </p>

                            {message && (
                                <div style={{ padding: '14px', borderRadius: '12px', fontSize: '0.85rem', textAlign: 'center', background: msgBg(message.type), color: msgColor(message.type), border: msgBorder(message.type) }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: needsVerification ? '10px' : '0' }}>
                                        <Info size={15} /><span>{message.text}</span>
                                    </div>
                                    {needsVerification && (
                                        <button type="button" onClick={handleResendEmail} disabled={loading}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                                            {loading ? <RefreshCw className="spin" size={14} /> : 'Resend Verification Email'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Mobile footer */}
                    <div style={{ padding: '16px 24px 28px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', letterSpacing: '1.5px' }}>
                        © 2026 JAAGO FOUNDATION
                    </div>
                </div>
            )}

            {/* ── TABLET LAYOUT ── */}
            {viewMode === 'tablet' && (
                <>
                    <div className="glass-portal">
                        {/* Form side */}
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '28px' }}>
                                <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '6px', letterSpacing: '-1px' }}>
                                    {isSignUp ? 'Join Us.' : 'Sign In.'}
                                </h1>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Access the JAAGO Core Ecosystem</p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                {isSignUp && (
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required
                                            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 18px 16px 50px', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
                                    </div>
                                )}
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required
                                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 18px 16px 50px', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 46px 16px 50px', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
                                    <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                                        <input type="checkbox" style={{ accentColor: '#F5C518' }} />Remember
                                    </label>
                                    <span onClick={handleForgotPassword} style={{ color: '#F5C518', cursor: 'pointer', fontWeight: 600 }}>Forgot?</span>
                                </div>
                                <button type="submit" disabled={loading} style={{ width: '100%', background: '#F5C518', color: '#000', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 16px 36px rgba(245,197,24,0.2)' }}>
                                    {loading ? <RefreshCw className="spin" size={20} /> : (isSignUp ? 'Create Account' : 'Sign In Now')}
                                </button>
                                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
                                    New to the platform?{' '}
                                    <span onClick={() => { window.location.search = '?view=request-access'; }} style={{ color: '#F5C518', cursor: 'pointer', fontWeight: 700 }}>Request Access</span>
                                </p>
                                {message && (
                                    <div style={{ padding: '14px', borderRadius: '12px', fontSize: '0.875rem', textAlign: 'center', background: msgBg(message.type), color: msgColor(message.type), border: msgBorder(message.type) }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: needsVerification ? '10px' : '0' }}>
                                            <Info size={15} /><span>{message.text}</span>
                                        </div>
                                        {needsVerification && (
                                            <button type="button" onClick={handleResendEmail} disabled={loading}
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                                                {loading ? <RefreshCw className="spin" size={14} /> : 'Resend Verification Email'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Tablet compact Vision / Mission */}
                        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column', flex: 1 }}>
                            <div style={{ background: 'rgba(245,197,24,0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(245,197,24,0.12)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <Target size={20} color="#F5C518" />
                                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#F5C518' }}>Our Vision</span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                                    A society free from exploitation where every child has the opportunity for education and youth have the chance to realise their potential.
                                </p>
                            </div>
                            <div style={{ background: 'rgba(242,63,63,0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(242,63,63,0.12)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <Rocket size={20} color="#f23f3f" />
                                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f23f3f' }}>Our Mission</span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                                    Improving lives of underprivileged children and youth through quality education and empowerment programmes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', letterSpacing: '2px', zIndex: 10 }}>
                        © 2026 JAAGO FOUNDATION | CORE ECOSYSTEM
                    </div>
                </>
            )}

            {/* ── DESKTOP LAYOUT ── */}
            {viewMode === 'desktop' && (
                <>
                    <div className="glass-portal">
                        {/* Form */}
                        <div style={{ flex: 1, maxWidth: '400px' }}>
                            <div style={{ marginBottom: '40px' }}>
                                <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1px' }}>
                                    {isSignUp ? 'Join Us.' : 'Sign In.'}
                                </h1>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>Access the JAAGO Core Ecosystem</p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {isSignUp && (
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required
                                            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 20px 18px 54px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                    </div>
                                )}
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required
                                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 20px 18px 54px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 48px 18px 54px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                                    <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                                        <input type="checkbox" style={{ accentColor: '#F5C518' }} />Remember
                                    </label>
                                    <span onClick={handleForgotPassword} style={{ color: '#F5C518', cursor: 'pointer', fontWeight: 600 }}>Forgot?</span>
                                </div>
                                <button type="submit" disabled={loading} style={{ width: '100%', background: '#F5C518', color: '#000', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.3s', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 20px 40px rgba(245,197,24,0.2)' }}>
                                    {loading ? <RefreshCw className="spin" size={20} /> : (isSignUp ? 'Create Account' : 'Sign In Now')}
                                </button>
                                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                                    New to the platform?{' '}
                                    <span onClick={() => { window.location.search = '?view=request-access'; }} style={{ color: '#F5C518', cursor: 'pointer', fontWeight: 700 }}>Request Access</span>
                                </p>
                                {message && (
                                    <div style={{ padding: '15px', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center', background: msgBg(message.type), color: msgColor(message.type), border: msgBorder(message.type) }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: needsVerification ? '12px' : '0' }}>
                                            <Info size={16} /><span>{message.text}</span>
                                        </div>
                                        {needsVerification && (
                                            <button type="button" onClick={handleResendEmail} disabled={loading}
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                                                {loading ? <RefreshCw className="spin" size={14} /> : 'Resend Verification Email'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Vision & Mission cards */}
                        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '30px', justifyContent: 'center' }}>
                            <div className="vision-card">
                                <div className="accent-bar" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <div style={{ background: 'rgba(245,197,24,0.1)', padding: '10px', borderRadius: '12px' }}>
                                        <Target size={32} color="#F5C518" />
                                    </div>
                                    <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#333' }}>Our Vision</h3>
                                </div>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555', paddingLeft: '40px' }}>
                                    JAAGO Foundation envisions a society free from all forms of exploitation and discrimination, where every child has the opportunity for education, and every youth has the opportunity to realise their potential.
                                </p>
                            </div>

                            <div className="mission-card">
                                <div className="accent-bar" style={{ height: '140px' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <div style={{ background: 'rgba(242,63,63,0.1)', padding: '10px', borderRadius: '12px' }}>
                                        <Rocket size={32} color="#f23f3f" />
                                    </div>
                                    <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#333' }}>Our Mission</h3>
                                </div>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555', paddingLeft: '40px' }}>
                                    To bring about substantial improvement in the lives of underprivileged children and youth living in poverty, illiteracy, and social inequality through quality education and youth empowerment.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', letterSpacing: '2px', zIndex: 10 }}>
                        © 2026 JAAGO FOUNDATION | CORE ECOSYSTEM
                    </div>
                </>
            )}
        </div>
    );
};

export default LoginPage;
