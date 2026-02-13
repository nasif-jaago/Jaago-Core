import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, RefreshCw, Target, Rocket } from 'lucide-react';
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
            background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)',
            color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* 3D Animated Background Elements */}
            <div style={{
                position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px',
                background: 'linear-gradient(45deg, rgba(245, 197, 24, 0.1), transparent)',
                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                filter: 'blur(60px)',
                animation: 'morph 15s ease-in-out infinite alternate',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px',
                background: 'linear-gradient(45deg, rgba(0, 242, 255, 0.05), transparent)',
                borderRadius: '50% 50% 20% 80% / 50% 20% 80% 50%',
                filter: 'blur(80px)',
                animation: 'morph 20s ease-in-out infinite alternate-reverse',
                zIndex: 0
            }} />

            <style>{`
                @keyframes morph {
                    0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotate(0deg) scale(1); }
                    100% { border-radius: 50% 50% 20% 80% / 50% 20% 80% 50%; transform: rotate(180deg) scale(1.2); }
                }
                .glass-portal {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(25px) saturate(180%);
                    -webkit-backdrop-filter: blur(25px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
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
                }
                .vision-card, .mission-card {
                    background: #ffffff;
                    padding: 35px;
                    border-radius: 20px;
                    position: relative;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    color: #000;
                }
                .vision-card:hover, .mission-card:hover {
                    transform: translateY(-10px) rotateX(5deg);
                }
                .accent-bar {
                    position: absolute;
                    left: 20px;
                    top: 85px;
                    width: 6px;
                    height: 120px;
                    background: #F5C518;
                    border-radius: 10px;
                }
                .spin { animation: spin 1.5s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* Top Logo */}
            <div style={{ position: 'absolute', top: 40, left: 60, zIndex: 100 }}>
                <JaagoLogo color="#fff" showFoundation={true} scale={0.7} />
            </div>

            <div className="glass-portal">
                {/* Left Side: Login Form */}
                <div style={{ flex: 1, maxWidth: '400px' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '10px', letterSpacing: '-1px' }}>
                            {isSignUp ? 'Join Us.' : 'Sign In.'}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>
                            Access the JAAGO Core Ecosystem
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {isSignUp && (
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '18px 20px 18px 54px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none'
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '18px 20px 18px 54px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '18px 20px 18px 54px', borderRadius: '16px', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                                <input type="checkbox" style={{ accentColor: '#F5C518' }} />
                                Remember
                            </label>
                            <span onClick={handleForgotPassword} style={{ color: '#F5C518', cursor: 'pointer', fontWeight: 600 }}>Forgot?</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', background: '#F5C518', color: '#000', border: 'none', padding: '18px', borderRadius: '16px',
                                fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.3s', marginTop: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                boxShadow: '0 20px 40px rgba(245, 197, 24, 0.2)'
                            }}
                        >
                            {loading ? <RefreshCw className="spin" size={20} /> : (isSignUp ? 'Create Account' : 'Sign In Now')}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                            {isSignUp ? 'Have an account? ' : "New here? "}
                            <span
                                onClick={() => setIsSignUp(!isSignUp)}
                                style={{ color: '#F5C518', cursor: 'pointer', fontWeight: 700 }}
                            >
                                {isSignUp ? 'Login' : 'Signup'}
                            </span>
                        </p>

                        {message && (
                            <div style={{
                                padding: '15px', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center',
                                background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: message.type === 'success' ? '#10b981' : '#ef4444'
                            }}>
                                {message.text}
                            </div>
                        )}
                    </form>
                </div>

                {/* Right Side: Vision & Mission */}
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
                            <div style={{ background: 'rgba(242, 63, 63, 0.1)', padding: '10px', borderRadius: '12px' }}>
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

            {/* Bottom Credits */}
            <div style={{ position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', letterSpacing: '2px' }}>
                © 2026 JAAGO FOUNDATION | CORE ECOSYSTEM
            </div>
        </div>
    );
};

export default LoginPage;

