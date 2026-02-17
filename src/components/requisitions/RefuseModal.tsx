import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

interface RefuseModalProps {
    onClose: () => void;
    onSubmit: (reason: string) => void;
    loading?: boolean;
}

const RefuseModal: React.FC<RefuseModalProps> = ({ onClose, onSubmit, loading }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Please provide a reason for refusal');
            return;
        }
        onSubmit(reason);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', border: '1px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={20} color="#ef4444" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Refuse Requisition</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Please state the reason why you are refusing this requisition. This will be visible to the request owner.
                    </p>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <textarea
                            className="input-field"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Enter refusal reason..."
                            style={{ width: '100%', height: '120px', resize: 'none', padding: '12px' }}
                            autoFocus
                        />
                        {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>{error}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            style={{ flex: 1, padding: '10px' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                flex: 1.5,
                                padding: '10px',
                                background: '#ef4444',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? <div className="spinner-small" /> : <><Send size={16} /> CONFIRM REFUSAL</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RefuseModal;
