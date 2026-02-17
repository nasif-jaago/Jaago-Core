# -*- coding: utf-8 -*-

from odoo import models, fields


class ApprovalApproverHistory(models.Model):
    _name = 'approval.approver.history'
    _description = 'Approval History and Audit Trail'
    _order = 'sequence, id'
    _rec_name = 'step_name'

    request_id = fields.Many2one(
        'approval.request',
        string='Requisition',
        required=True,
        ondelete='cascade',
        index=True
    )
    sequence = fields.Integer(
        string='Step Sequence',
        required=True,
        help='Order of approval steps'
    )
    step_name = fields.Char(
        string='Approval Step',
        required=True,
        help='Name of this approval step (e.g., Supervisor Approval, Finance Review)'
    )
    approver_id = fields.Many2one(
        'hr.employee',
        string='Approver',
        required=True,
        help='Employee responsible for this approval step'
    )
    decision = fields.Selection([
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('refused', 'Refused'),
        ('skipped', 'Skipped')
    ], string='Decision', required=True, default='pending')
    
    decision_date = fields.Datetime(
        string='Decision Date',
        readonly=True,
        help='When the approval/refusal was made'
    )
    comments = fields.Text(
        string='Comments',
        help='Additional comments or refusal reason'
    )
    signature = fields.Char(
        string='Signature',
        help='Digital signature or approval code'
    )
    
    # Related fields for easy access
    approver_email = fields.Char(
        related='approver_id.work_email',
        string='Approver Email',
        readonly=True
    )
    approver_department = fields.Char(
        related='approver_id.department_id.name',
        string='Department',
        readonly=True
    )
    
    company_id = fields.Many2one(
        'res.company',
        related='request_id.company_id',
        store=True,
        readonly=True
    )

    def name_get(self):
        """Custom display name"""
        result = []
        for record in self:
            name = f"{record.step_name} - {record.approver_id.name} ({record.decision})"
            result.append((record.id, name))
        return result
