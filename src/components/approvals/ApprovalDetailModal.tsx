import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Ban, Loader } from 'lucide-react';
import {
    approveRequest,
    refuseRequest,
    cancelRequest,
    type ApprovalRequest
} from '../../api/ApprovalsService';

interface ApprovalDetailModalProps {
    approval: ApprovalRequest;
    onClose: () => void;
    onUpdate: () => void;
}

const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({ approval, onClose, onUpdate }) => {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApprove = async () => {
        setProcessing(true);
        setError(null);
        try {
            const result = await approveRequest(approval.id);
            if (result.success) {
                onUpdate();
                onClose();
            } else {
                setError(result.error || 'Failed to approve request');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleRefuse = async () => {
        setProcessing(true);
        setError(null);
        try {
            const result = await refuseRequest(approval.id);
            if (result.success) {
                onUpdate();
                onClose();
            } else {
                setError(result.error || 'Failed to refuse request');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        setProcessing(true);
        setError(null);
        try {
            const result = await cancelRequest(approval.id);
            if (result.success) {
                onUpdate();
                onClose();
            } else {
                setError(result.error || 'Failed to cancel request');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: '#3b82f6',
            pending: '#f59e0b',
            approved: '#22c55e',
            refused: '#ef4444',
            cancel: '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '2rem'
            }}
            onClick={onClose}
        >
            <div
                className="card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '700px', maxHeight: '90vh',
                    display: 'flex', flexDirection: 'column',
                    animation: 'slideUp 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem', borderBottom: '1px solid var(--border-glass)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                            {approval.name}
                        </h3>
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: getStatusColor(approval.request_status),
                            background: `${getStatusColor(approval.request_status)}20`,
                            border: `1px solid ${getStatusColor(approval.request_status)}40`
                        }}>
                            {approval.request_status.toUpperCase()}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-icon"
                        style={{ width: '32px', height: '32px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Requested By</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {approval.request_owner_id ? approval.request_owner_id[1] : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Category</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {approval.category_id ? approval.category_id[1] : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Request Date</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {approval.date ? new Date(approval.date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            {approval.amount && (
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Amount</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        ${approval.amount.toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {approval.reason && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Reason / Description</p>
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--border-glass)'
                                }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                        {approval.reason}
                                    </p>
                                </div>
                            </div>
                        )}

                        {approval.date_confirmed && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Confirmation Date</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {new Date(approval.date_confirmed).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                fontSize: '0.85rem'
                            }}>
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '1rem 1.5rem', borderTop: '1px solid var(--border-glass)',
                    display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
                }}>
                    {approval.request_status === 'new' || approval.request_status === 'pending' ? (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={processing}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px',
                                    background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                    color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Ban size={16} />
                                Cancel Request
                            </button>
                            <button
                                onClick={handleRefuse}
                                disabled={processing}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px',
                                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444', cursor: 'pointer', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                {processing ? <Loader className="spin" size={16} /> : <XCircle size={16} />}
                                Refuse
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {processing ? <Loader className="spin" size={16} /> : <CheckCircle size={16} />}
                                Approve
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px', borderRadius: '10px',
                                background: 'var(--input-bg)', border: '1px solid var(--border-glass)',
                                color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ApprovalDetailModal;
