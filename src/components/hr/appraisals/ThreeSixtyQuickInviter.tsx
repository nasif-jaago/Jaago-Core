import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Search as SearchIcon, Trash2, Send, RefreshCcw,
    CheckCircle2, X
} from 'lucide-react';
import { AppraisalService } from '../../../api/AppraisalService';
import { fetchEmployees } from '../../../api/EmployeesService';

const ThreeSixtyQuickInviter: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [data, setData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [submittedIds, setSubmittedIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('[360QuickInviter] mounted. View params:', window.location.search);
    }, []);

    const handleSearch = async (val: string) => {
        setSearchTerm(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            console.log('[360QuickInviter] Searching for:', val);
            const res = await fetchEmployees([
                '|', '|',
                ['name', 'ilike', val],
                ['work_email', 'ilike', val],
                ['identification_id', 'ilike', val]
            ]);
            if (res.success) {
                const results = res.data?.filter(emp => !data.some(d => d.employee_id === emp.id)).slice(0, 5) || [];
                console.log('[360QuickInviter] Search results:', results.length);
                setSearchResults(results);
                setError(null);
            } else {
                console.error('[360QuickInviter] Search failed:', res.error);
                setError('Search failed: ' + res.error);
            }
        } catch (err) {
            console.error('[360QuickInviter] Search error:', err);
            setError('Search error occurred.');
        }
    };

    const addEmployee = (emp: any) => {
        if (!emp || !emp.id) return;
        if (data.length >= 3) {
            alert('Maximum 3 employees can be added at once.');
            return;
        }
        const newEntry = {
            employee_id: emp.id,
            name: emp.name || 'Anonymous',
            email: emp.work_email || '',
            positivePoints: ['', '', ''],
            improvePoints: ['', '', '']
        };
        console.log('[360QuickInviter] Adding employee:', newEntry.name);
        setData([...data, newEntry]);
        setSearchTerm('');
        setSearchResults([]);
    };

    const removeEmployee = (id: number) => {
        setData(data.filter(d => d.employee_id !== id));
    };


    const handleSubmitFeedback = async (emp: any) => {
        if (submittedIds.includes(emp.employee_id)) return;

        setSendingId(emp.employee_id);
        setError(null);
        try {
            console.log('[360QuickInviter] Sending invite to:', emp.name);
            // We use the existing send360Invites which generates token and emails
            const res = await AppraisalService.send360Invites([{
                employee_id: emp.employee_id,
                name: emp.name,
                email: emp.email
            }], ''); // templateId empty for default

            if (res.success) {
                console.log('[360QuickInviter] Invite sent successfully');
                setSubmittedIds(prev => [...prev, emp.employee_id]);
                alert(`Invitation sent to ${emp.name}! They will receive an email with the feedback link.`);
            } else {
                console.error('[360QuickInviter] Invitation failed:', res.error);
                setError('Failed to send invite: ' + res.error);
                alert(`Failed to send invite: ${res.error}`);
            }
        } catch (err: any) {
            console.error('[360QuickInviter] Invitation error:', err);
            setError('Invitation error: ' + (err.message || 'Unknown error'));
            alert('Failed to send invitation.');
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', padding: '40px 20px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    background: 'var(--bg-surface)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-glass)',
                    padding: '30px',
                    boxShadow: 'var(--shadow-3d)'
                }}
            >
                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <X size={16} /> {error}
                    </motion.div>
                )}

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)' }}>
                        <UserPlus size={24} /> 360° QUICK INVITER
                    </h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <SearchIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Add Employee to Invite..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px 12px 40px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                                        borderRadius: '12px', marginTop: '8px', zIndex: 100,
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden'
                                    }}
                                >
                                    {searchResults.map(emp => (
                                        <div
                                            key={emp.id}
                                            onClick={() => addEmployee(emp)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--border-glass)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ fontWeight: 700, fontSize: '13px' }}>{emp.name}</div>
                                            <div style={{ color: 'var(--text-dim)', fontSize: '11px' }}>{emp.work_email}</div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {data.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', border: '2px dashed var(--border-glass)', borderRadius: '20px', background: 'rgba(255,255,255,0.02)' }}>
                            <SearchIcon size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-dim)', fontSize: '16px' }}>Search and add employees to send feedback invitations</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {data.map(emp => (
                                <motion.div
                                    key={emp.employee_id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '20px',
                                        padding: '24px',
                                        opacity: submittedIds.includes(emp.employee_id) ? 0.6 : 1
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <div style={{
                                                width: '48px', height: '48px',
                                                background: 'var(--primary-gradient)',
                                                borderRadius: '12px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 900, color: '#000', fontSize: '18px'
                                            }}>
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: 800 }}>{emp.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{emp.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {!submittedIds.includes(emp.employee_id) && (
                                                <button
                                                    onClick={() => removeEmployee(emp.employee_id)}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        border: 'none', color: '#ef4444',
                                                        padding: '10px', borderRadius: '10px', cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleSubmitFeedback(emp)}
                                                disabled={sendingId === emp.employee_id || submittedIds.includes(emp.employee_id)}
                                                style={{
                                                    background: submittedIds.includes(emp.employee_id)
                                                        ? 'rgba(34, 197, 94, 0.2)'
                                                        : (sendingId === emp.employee_id ? 'var(--input-bg)' : 'linear-gradient(135deg, #22c55e, #16a34a)'),
                                                    border: 'none',
                                                    color: submittedIds.includes(emp.employee_id) ? '#22c55e' : '#fff',
                                                    padding: '10px 24px',
                                                    borderRadius: '10px',
                                                    cursor: (sendingId === emp.employee_id || submittedIds.includes(emp.employee_id)) ? 'not-allowed' : 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: 800,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {sendingId === emp.employee_id ? <RefreshCcw className="spin" size={16} /> : (submittedIds.includes(emp.employee_id) ? <CheckCircle2 size={16} /> : <Send size={16} />)}
                                                {sendingId === emp.employee_id ? 'SENDING...' : (submittedIds.includes(emp.employee_id) ? 'INVITED' : 'SEND INVITE')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>


                {onBack && (
                    <button
                        onClick={onBack}
                        style={{ marginTop: '30px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <X size={16} /> Close Inviter
                    </button>
                )}
            </motion.div>
        </div>
    );
};

export default ThreeSixtyQuickInviter;
