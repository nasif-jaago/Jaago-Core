import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, RefreshCw } from 'lucide-react';
import JaagoLogo from '../shared/JaagoLogo';

const LoginPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const { signIn, signUp, resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password, name);
                if (error) throw error;
                setMessage({ type: 'success', text: 'Account created! Please check your email to verify.' });
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Authentication failed' });
        } finally {
            setLoading(false);
        }
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

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 10% 20%, #1a1a1a 0%, #000000 100%)',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Top Navigation */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '40px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '32px', fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span style={{ cursor: 'pointer', color: '#F5C518', opacity: 1 }}>Home</span>
                    <a
                        href="https://jaago.com.bd"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none', opacity: 0.6 }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                    >
                        Website
                    </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '2px', color: '#fff' }}>JAAGO CORE</span>
                    <div style={{ transform: 'scale(0.35) translateY(20px)', transformOrigin: 'left center' }}>
                        <JaagoLogo color="#fff" showFoundation={false} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '80px', maxWidth: '1200px', width: '90%', zIndex: 1, paddingTop: '60px' }}>
                {/* Left Side: Form */}
                <div style={{ flex: 1, maxWidth: '450px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px', color: '#fff' }}>
                        {isSignUp ? 'SIGN UP' : 'WELCOME BACK!'}
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '40px' }}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <span
                            onClick={() => setIsSignUp(!isSignUp)}
                            style={{ color: '#F5C518', cursor: 'pointer', fontWeight: 700, borderBottom: '1px solid #F5C518' }}
                        >
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </span>
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {isSignUp && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>FULL NAME</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input
                                        type="text"
                                        placeholder="Joe Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        style={{
                                            width: '100%', background: 'transparent', border: '1.5px solid rgba(245, 197, 24, 0.3)',
                                            padding: '16px 16px 16px 48px', borderRadius: '50px', color: '#fff', fontSize: '0.9rem', outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>EMAIL ADDRESS</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', background: 'transparent', border: '1.5px solid rgba(245, 197, 24, 0.3)',
                                        padding: '16px 16px 16px 48px', borderRadius: '50px', color: '#fff', fontSize: '0.9rem', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>PASSWORD</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', background: 'transparent', border: '1.5px solid rgba(245, 197, 24, 0.3)',
                                        padding: '16px 16px 16px 48px', borderRadius: '50px', color: '#fff', fontSize: '0.9rem', outline: 'none'
                                    }}
                                />
                                <div
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                                <input type="checkbox" style={{ accentColor: '#F5C518' }} />
                                Remember me
                            </label>
                            <span
                                onClick={handleForgotPassword}
                                style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#F5C518'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                            >
                                Forget password?
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', background: '#F5C518', color: '#000', border: 'none', padding: '16px', borderRadius: '50px',
                                fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            {loading ? <RefreshCw className="spin" size={20} /> : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>

                        {message && (
                            <div style={{
                                padding: '12px', borderRadius: '12px', fontSize: '0.85rem', textAlign: 'center',
                                background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: message.type === 'success' ? '#10b981' : '#ef4444',
                                border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                            }}>
                                {message.text}
                            </div>
                        )}
                    </form>
                </div>

                {/* Right Side: Jaago Logo Branding (Circle Removed) */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ position: 'relative', width: '500px', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src="/src/assets/anniversary-logo.png"
                            alt="JAAGO 18 Years"
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 10px 30px rgba(245, 197, 24, 0.2))'
                            }}
                            onError={(e) => {
                                // Fallback if image is not found
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Background Accents */}
            <div style={{
                position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px',
                background: 'rgba(245, 197, 24, 0.05)', borderRadius: '50%', filter: 'blur(80px)'
            }} />
        </div>
    );
};

export default LoginPage;
