import React from 'react';
import { CheckCircle2, XCircle, Clock, UserCheck } from 'lucide-react';
import type { ApprovalHistory } from '../../types/requisition';

interface ApprovalHistoryTableProps {
    history: ApprovalHistory[];
}

const statusConfig = {
    approved: { icon: CheckCircle2, color: '#22c55e', label: 'Approved' },
    refused: { icon: XCircle, color: '#ef4444', label: 'Refused' },
    pending: { icon: Clock, color: 'var(--primary)', label: 'Pending' },
    skipped: { icon: Clock, color: 'var(--text-muted)', label: 'Skipped' }
};

const ApprovalHistoryTable: React.FC<ApprovalHistoryTableProps> = ({ history }) => {
    if (!history || history.length === 0) return null;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="var(--primary)" /> Approval Chain & History
            </h3>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', width: '60px' }}>Step</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approval Step</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approver</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', width: '120px' }}>Decision</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', width: '150px' }}>Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comments</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', width: '180px' }}>Signature Zone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.sort((a, b) => a.sequence - b.sequence).map((item, index) => {
                            const StatusIcon = statusConfig[item.decision]?.icon || Clock;
                            const statusColor = statusConfig[item.decision]?.color || 'var(--text-muted)';
                            const statusLabel = statusConfig[item.decision]?.label || 'Unknown';

                            return (
                                <tr key={item.id} style={{ borderBottom: index < history.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                                    <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        {item.sequence}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {item.step_name}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.approver_id[1]}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authorized Approver</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColor, fontSize: '0.85rem', fontWeight: 700 }}>
                                            <StatusIcon size={14} />
                                            {statusLabel.toUpperCase()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {item.decision_date ? new Date(item.decision_date).toLocaleDateString() : '--'}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                        {item.comments || '--'}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{
                                            border: '1px dashed var(--border-glass)',
                                            borderRadius: '8px',
                                            height: '50px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '8px',
                                            background: item.decision === 'approved' ? 'rgba(34, 197, 94, 0.05)' : 'transparent'
                                        }}>
                                            {item.decision === 'approved' ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 800 }}>DIGITALLY SIGNED</div>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                                        {item.approver_id[1]}<br />
                                                        {item.decision_date}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Signature Zone</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApprovalHistoryTable;
