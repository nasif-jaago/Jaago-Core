import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, CheckCircle, AlertCircle, RefreshCcw, User } from 'lucide-react';
import { AppraisalService } from '../../../api/AppraisalService';
import { useAuth } from '../../../context/AuthContext';

const ThreeSixtyFeedbackForm: React.FC = () => {
    const { user } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [inviteData, setInviteData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string, type: 'error' | 'expired' | 'submitted' } | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const [feedback, setFeedback] = useState({
        positivePoints: ['', '', ''],
        improvePoints: ['', '', '']
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('token');
        if (t) {
            setToken(t);
            loadInvite(t);
        } else {
            setError({ message: 'Invalid or missing security token.', type: 'error' });
            setLoading(false);
        }
    }, []);

    const loadInvite = async (t: string) => {
        try {
            const res = await AppraisalService.get360InviteByToken(t);
            if (res.success) {
                setInviteData(res.data);
            } else {
                if (res.error === 'Feedback Already Submitted') {
                    setError({ message: 'Feedback Already Submitted', type: 'submitted' });
                } else if (res.error === 'Link Expired') {
                    setError({ message: 'Link Expired', type: 'expired' });
                } else {
                    setError({ message: res.error || 'Failed to load feedback request.', type: 'error' });
                }
            }
        } catch (err) {
            setError({ message: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: All 6 fields must be filled
        const allPositiveFilled = feedback.positivePoints.every(p => p.trim().length > 0);
        const allImproveFilled = feedback.improvePoints.every(p => p.trim().length > 0);

        if (!allPositiveFilled || !allImproveFilled) {
            alert('Please fill in all 3 points for both sections. These are required fields.');
            return;
        }

        setLoading(true);
        try {
            const res = await AppraisalService.submit360Feedback(token!, {
                ...feedback,
                giverName: user?.user_metadata?.full_name || user?.email || 'Anonymous Giver',
                giverEmail: user?.email || ''
            });
            if (res.success) {
                setSubmitted(true);

                // LOG TO APPRAISAL LOG
                if (inviteData?.appraisal_id) {
                    await AppraisalService.logActiveAction({
                        action_type: '360 Feedback Submitted',
                        details: `Feedback submitted for ${inviteData.requested_employee_name} by ${user?.email || 'Anonymous'}`,
                        status: 'success',
                        appraisal_id: inviteData.appraisal_id,
                        metadata: {
                            giver_email: user?.email,
                            receiver_email: inviteData.requested_employee_email,
                            token_used: token
                        }
                    });
                }
            } else {
                alert(`Failed to submit feedback: ${res.error}`);
            }
        } catch (err) {
            alert('Error submitting feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !inviteData) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
                <RefreshCcw className="spin" size={32} color="var(--primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', padding: '20px' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-glass)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    {error.type === 'submitted' ? (
                        <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 20px' }} />
                    ) : (
                        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 20px' }} />
                    )}
                    <h2 style={{ color: '#fff', marginBottom: '12px', fontSize: '20px', fontWeight: 800 }}>
                        {error.type === 'submitted' ? 'Feedback Already Submitted' :
                            error.type === 'expired' ? 'Link Expired' : 'Access Denied'}
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: '1.5' }}>
                        {error.type === 'submitted' ? 'Your feedback for this request has already been recorded. Thank you for your contribution!' :
                            error.type === 'expired' ? 'This feedback link has expired (7-day time limit). Please contact HR for a new invite.' :
                                error.message}
                    </p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', padding: '20px' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ textAlign: 'center', maxWidth: '450px', padding: '40px', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-glass)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                >
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '2px solid #22c55e' }}>
                        <CheckCircle size={40} color="#22c55e" />
                    </div>
                    <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '24px', fontWeight: 800 }}>Success!</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: '1.6' }}>
                        Your 360° feedback for <strong>{inviteData?.requested_employee_name}</strong> has been saved.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', padding: '40px 20px' }}>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ maxWidth: '850px', margin: '0 auto', background: 'var(--bg-surface)', borderRadius: '32px', border: '1px solid var(--border-glass)', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            >
                {/* Header Section */}
                <div style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.1), transparent)', borderBottom: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(245, 197, 24, 0.15)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={32} color="var(--primary)" />
                            </div>
                            <div>
                                <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                                    {inviteData?.requested_employee_name}
                                </h1>
                                <p style={{ color: 'var(--text-dim)', fontSize: '14px', margin: '4px 0 0' }}>
                                    {inviteData?.requested_employee_email}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Review Type</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '14px' }}>360° Peer Feedback</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        {/* Positive Feedback Table Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Star size={20} color="#22c55e" />
                                </div>
                                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>Positive Feedback</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {feedback.positivePoints.map((point, i) => (
                                    <div key={i}>
                                        <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>POINT {i + 1} *</label>
                                        <textarea
                                            required
                                            value={point}
                                            onChange={(e) => {
                                                const newPoints = [...feedback.positivePoints];
                                                newPoints[i] = e.target.value;
                                                setFeedback({ ...feedback, positivePoints: newPoints });
                                            }}
                                            placeholder="Example: Consistently meets project deadlines with high-quality deliverables..."
                                            style={{ width: '100%', padding: '16px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '14px', minHeight: '100px', resize: 'vertical', transition: 'all 0.3s ease', outline: 'none' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Improvement Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp size={20} color="#3b82f6" />
                                </div>
                                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>Needs to Improve</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {feedback.improvePoints.map((point, i) => (
                                    <div key={i}>
                                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', marginBottom: '8px', display: 'block' }}>POINT {i + 1} *</label>
                                        <textarea
                                            required
                                            value={point}
                                            onChange={(e) => {
                                                const newPoints = [...feedback.improvePoints];
                                                newPoints[i] = e.target.value;
                                                setFeedback({ ...feedback, improvePoints: newPoints });
                                            }}
                                            placeholder="Example: Could improve communication clarity during weekly stand-up meetings..."
                                            style={{ width: '100%', padding: '14px', background: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '14px', minHeight: '100px', resize: 'vertical', transition: 'all 0.3s ease', outline: 'none' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 60px',
                                background: loading ? 'var(--input-bg)' : 'var(--primary-gradient)',
                                color: '#000', fontWeight: 900, border: 'none', borderRadius: '16px',
                                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '18px',
                                boxShadow: loading ? 'none' : '0 15px 35px var(--primary-glow)',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase', letterSpacing: '1px'
                            }}
                        >
                            {loading ? <RefreshCcw className="spin" size={24} /> : <CheckCircle size={24} />}
                            {loading ? 'Submitting...' : 'Done'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ThreeSixtyFeedbackForm;
