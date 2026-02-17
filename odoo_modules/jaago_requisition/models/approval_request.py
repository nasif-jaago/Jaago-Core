# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
import logging

_logger = logging.getLogger(__name__)


class ApprovalRequest(models.Model):
    _inherit = 'approval.request'

    # Custom Odoo Studio fields (matching frontend)
    x_studio_reason_for_purchase = fields.Text(
        string='Reason for Purchase',
        help='Detailed reason for this requisition'
    )
    x_studio_delivery_instructions = fields.Text(
        string='Delivery Instructions',
        help='Special delivery or handling instructions'
    )
    x_studio_projects_name = fields.Many2one(
        'project.project',
        string="Project's Name",
        help='Associated project for this requisition'
    )
    x_studio_project_code = fields.Char(
        string='Activity Code',
        related='x_studio_projects_name.code',
        readonly=True,
        store=True
    )
    x_studio_budget_amount = fields.Float(
        string='Activity Budget Amount',
        help='Total budget allocated for this activity'
    )
    x_studio_total_amount = fields.Float(
        string='Total EST Amount',
        compute='_compute_total_amount',
        store=True,
        help='Automatically calculated from product lines'
    )
    
    # Relations
    product_line_ids = fields.One2many(
        'approval.request.line',
        'request_id',
        string='Product/Service Lines',
        copy=True
    )
    approval_history_ids = fields.One2many(
        'approval.approver.history',
        'request_id',
        string='Approval History',
        readonly=True
    )
    
    # PR Number (generated after approval)
    pr_number = fields.Char(
        string='PR Number',
        readonly=True,
        copy=False,
        help='Purchase Requisition number generated after approval'
    )
    
    # Computed fields for access control
    can_approve = fields.Boolean(
        string='Can Approve',
        compute='_compute_user_permissions'
    )
    can_refuse = fields.Boolean(
        string='Can Refuse',
        compute='_compute_user_permissions'
    )
    can_edit = fields.Boolean(
        string='Can Edit',
        compute='_compute_user_permissions'
    )
    can_submit = fields.Boolean(
        string='Can Submit',
        compute='_compute_user_permissions'
    )
    current_approver_id = fields.Many2one(
        'hr.employee',
        string='Current Approver',
        compute='_compute_current_approver'
    )
    
    # Override company_id to make it required and set default
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        required=True,
        default=lambda self: self.env.company
    )

    @api.depends('product_line_ids.x_studio_estimated_price')
    def _compute_total_amount(self):
        """Calculate total amount from product lines"""
        for record in self:
            record.x_studio_total_amount = sum(
                line.x_studio_estimated_price or 0.0
                for line in record.product_line_ids
            )

    @api.depends('request_status', 'request_owner_id', 'approval_history_ids')
    def _compute_user_permissions(self):
        """Compute what actions current user can perform"""
        for record in self:
            current_user = self.env.user
            current_employee = self.env['hr.employee'].search([
                ('user_id', '=', current_user.id)
            ], limit=1)
            
            is_owner = record.request_owner_id == current_employee
            is_admin = current_user.has_group('jaago_requisition.group_requisition_admin')
            
            # Can edit: owner in draft/refused state or admin
            record.can_edit = (
                (is_owner and record.request_status in ['new', 'refused']) or
                is_admin
            )
            
            # Can submit: owner in draft state
            record.can_submit = is_owner and record.request_status == 'new'
            
            # Can approve/refuse: current approver in pending state
            current_approver = record._get_current_approver()
            is_current_approver = current_approver == current_employee
            
            record.can_approve = (
                is_current_approver and 
                record.request_status == 'pending'
            )
            record.can_refuse = record.can_approve

    @api.depends('approval_history_ids', 'request_status')
    def _compute_current_approver(self):
        """Get the current approver based on workflow"""
        for record in self:
            if record.request_status != 'pending':
                record.current_approver_id = False
                continue
            
            # Find the next pending approval step
            pending_history = record.approval_history_ids.filtered(
                lambda h: h.decision == 'pending'
            ).sorted('sequence')
            
            if pending_history:
                record.current_approver_id = pending_history[0].approver_id
            else:
                record.current_approver_id = False

    def _get_current_approver(self):
        """Helper method to get current approver"""
        self.ensure_one()
        if self.request_status != 'pending':
            return self.env['hr.employee']
        
        pending_history = self.approval_history_ids.filtered(
            lambda h: h.decision == 'pending'
        ).sorted('sequence')
        
        return pending_history[0].approver_id if pending_history else self.env['hr.employee']

    @api.model
    def create(self, vals):
        """Override create to set request owner from current user"""
        if not vals.get('request_owner_id'):
            employee = self.env['hr.employee'].search([
                ('user_id', '=', self.env.user.id)
            ], limit=1)
            if employee:
                vals['request_owner_id'] = employee.id
        
        # Set default status to 'new' (draft)
        if not vals.get('request_status'):
            vals['request_status'] = 'new'
        
        record = super(ApprovalRequest, self).create(vals)
        
        # Post creation message
        record.message_post(
            body=_('Requisition created by %s') % record.request_owner_id.name,
            message_type='notification'
        )
        
        return record

    def action_confirm(self):
        """Submit requisition for approval - triggers workflow"""
        self.ensure_one()
        
        if self.request_status != 'new':
            raise UserError(_('Only draft requisitions can be submitted.'))
        
        if not self.product_line_ids:
            raise UserError(_('Please add at least one product/service line before submitting.'))
        
        # Validate required fields based on category
        self._validate_required_fields()
        
        # Create approval workflow
        self._create_approval_workflow()
        
        # Update status
        self.write({'request_status': 'pending'})
        
        # Post message
        self.message_post(
            body=_('Requisition submitted for approval by %s') % self.request_owner_id.name,
            message_type='notification'
        )
        
        # Notify first approver
        self._notify_next_approver()
        
        return True

    def _validate_required_fields(self):
        """Validate required fields based on category configuration"""
        self.ensure_one()
        
        if not self.name:
            raise ValidationError(_('Requisition Subject is required.'))
        
        if not self.category_id:
            raise ValidationError(_('Requisition For (Category) is required.'))
        
        if self.category_id.has_amount == 'required' and not self.x_studio_total_amount:
            raise ValidationError(_('Total amount is required for this category.'))
        
        if self.category_id.has_date == 'required' and not self.date:
            raise ValidationError(_('Estimated date is required for this category.'))

    def _create_approval_workflow(self):
        """Create approval history records based on rules"""
        self.ensure_one()
        
        # Get applicable approval rules
        rules = self._get_applicable_rules()
        
        if not rules:
            # Default workflow: just supervisor
            self._create_default_workflow()
            return
        
        # Create approval history for each rule
        sequence = 1
        for rule in rules.sorted('sequence'):
            approvers = self._resolve_approvers(rule)
            for approver in approvers:
                self.env['approval.approver.history'].create({
                    'request_id': self.id,
                    'approver_id': approver.id,
                    'step_name': rule.name,
                    'decision': 'pending',
                    'sequence': sequence,
                })
                sequence += 1

    def _get_applicable_rules(self):
        """Get approval rules that apply to this requisition"""
        self.ensure_one()
        
        rules = self.env['studio.approval.rule'].search([
            ('category_id', '=', self.category_id.id),
            ('active', '=', True)
        ])
        
        # Filter by domain and amount thresholds
        applicable_rules = self.env['studio.approval.rule']
        for rule in rules:
            # Check amount threshold
            if rule.amount_threshold_min and self.x_studio_total_amount < rule.amount_threshold_min:
                continue
            if rule.amount_threshold_max and self.x_studio_total_amount > rule.amount_threshold_max:
                continue
            
            # Check domain
            if rule.domain:
                try:
                    domain = eval(rule.domain)
                    if not self.filtered_domain(domain):
                        continue
                except Exception as e:
                    _logger.warning(f'Invalid domain in rule {rule.name}: {e}')
                    continue
            
            applicable_rules |= rule
        
        return applicable_rules

    def _create_default_workflow(self):
        """Create default approval workflow (supervisor only)"""
        self.ensure_one()
        
        # Get supervisor
        supervisor = self.request_owner_id.parent_id
        if not supervisor:
            raise UserError(_('No supervisor found for %s. Please configure employee hierarchy.') % self.request_owner_id.name)
        
        self.env['approval.approver.history'].create({
            'request_id': self.id,
            'approver_id': supervisor.id,
            'step_name': 'Supervisor Approval',
            'decision': 'pending',
            'sequence': 1,
        })

    def _resolve_approvers(self, rule):
        """Resolve approvers for a given rule"""
        self.ensure_one()
        
        if rule.approval_type == 'supervisor':
            # Get supervisor from employee hierarchy
            supervisor = self.request_owner_id.parent_id
            return supervisor if supervisor else self.env['hr.employee']
        
        elif rule.approval_type in ['finance', 'coordinator', 'ed', 'custom']:
            # Use configured approvers
            return rule.approver_ids
        
        return self.env['hr.employee']

    def _notify_next_approver(self):
        """Send email notification to next pending approver"""
        self.ensure_one()
        
        current_approver = self._get_current_approver()
        if not current_approver:
            return
        
        # Get email template
        template = self.env.ref('jaago_requisition.email_template_approval_request', raise_if_not_found=False)
        if not template:
            _logger.warning('Email template not found: jaago_requisition.email_template_approval_request')
            return
        
        # Send email
        template.with_context(approver=current_approver).send_mail(self.id, force_send=True)
        
        # Create activity
        self.activity_schedule(
            'jaago_requisition.mail_activity_requisition_approval',
            user_id=current_approver.user_id.id,
            summary=_('Requisition Approval Required'),
            note=_('Please review and approve requisition: %s') % self.name
        )

    def action_approve(self, **kwargs):
        """Approve current step and move to next"""
        self.ensure_one()
        
        if not self.can_approve:
            raise UserError(_('You are not authorized to approve this requisition.'))
        
        current_employee = self.env['hr.employee'].search([
            ('user_id', '=', self.env.user.id)
        ], limit=1)
        
        # Update current approval history
        current_history = self.approval_history_ids.filtered(
            lambda h: h.approver_id == current_employee and h.decision == 'pending'
        ).sorted('sequence')
        
        if not current_history:
            raise UserError(_('No pending approval found for you.'))
        
        current_history[0].write({
            'decision': 'approved',
            'decision_date': fields.Datetime.now(),
            'signature': kwargs.get('signature', ''),
        })
        
        # Post message
        self.message_post(
            body=_('Approved by %s') % current_employee.name,
            message_type='notification'
        )
        
        # Check if all approvals are done
        pending_approvals = self.approval_history_ids.filtered(lambda h: h.decision == 'pending')
        
        if not pending_approvals:
            # All approved - finalize
            self._finalize_approval()
        else:
            # Notify next approver
            self._notify_next_approver()
        
        return True

    def action_refuse(self, **kwargs):
        """Refuse requisition with reason"""
        self.ensure_one()
        
        if not self.can_refuse:
            raise UserError(_('You are not authorized to refuse this requisition.'))
        
        reason = kwargs.get('reason', '')
        if not reason:
            raise UserError(_('Please provide a reason for refusal.'))
        
        current_employee = self.env['hr.employee'].search([
            ('user_id', '=', self.env.user.id)
        ], limit=1)
        
        # Update current approval history
        current_history = self.approval_history_ids.filtered(
            lambda h: h.approver_id == current_employee and h.decision == 'pending'
        ).sorted('sequence')
        
        if current_history:
            current_history[0].write({
                'decision': 'refused',
                'decision_date': fields.Datetime.now(),
                'comments': reason,
            })
        
        # Update status
        self.write({'request_status': 'refused'})
        
        # Post message
        self.message_post(
            body=_('Refused by %s<br/>Reason: %s') % (current_employee.name, reason),
            message_type='notification'
        )
        
        # Notify owner
        if kwargs.get('notify_owner', True):
            self._notify_owner_refusal(reason, current_employee)
        
        return True

    def _notify_owner_refusal(self, reason, approver):
        """Notify request owner about refusal"""
        self.ensure_one()
        
        template = self.env.ref('jaago_requisition.email_template_approval_refused', raise_if_not_found=False)
        if template:
            template.with_context(
                reason=reason,
                approver=approver
            ).send_mail(self.id, force_send=True)

    def _finalize_approval(self):
        """Finalize approval - generate PR number and set status"""
        self.ensure_one()
        
        # Generate PR number
        pr_number = self.env['ir.sequence'].next_by_code('approval.request.pr') or '/'
        
        # Update record
        self.write({
            'request_status': 'approved',
            'pr_number': pr_number,
            'date_confirmed': fields.Datetime.now(),
        })
        
        # Post message
        self.message_post(
            body=_('Requisition fully approved. PR Number: %s') % pr_number,
            message_type='notification'
        )
        
        # Notify owner
        template = self.env.ref('jaago_requisition.email_template_approval_complete', raise_if_not_found=False)
        if template:
            template.send_mail(self.id, force_send=True)

    def generate_pr_number(self):
        """API method to generate PR number"""
        self.ensure_one()
        if not self.pr_number:
            pr_number = self.env['ir.sequence'].next_by_code('approval.request.pr') or '/'
            self.write({'pr_number': pr_number})
        return self.pr_number

    def action_cancel(self):
        """Cancel requisition"""
        self.ensure_one()
        
        if self.request_status == 'approved':
            raise UserError(_('Cannot cancel an approved requisition.'))
        
        self.write({'request_status': 'cancel'})
        
        self.message_post(
            body=_('Requisition cancelled'),
            message_type='notification'
        )
        
        return True

    def action_draft(self):
        """Reset to draft for resubmission after refusal"""
        self.ensure_one()
        
        if self.request_status != 'refused':
            raise UserError(_('Only refused requisitions can be reset to draft.'))
        
        # Clear approval history
        self.approval_history_ids.unlink()
        
        # Reset status
        self.write({'request_status': 'new'})
        
        self.message_post(
            body=_('Requisition reset to draft for resubmission'),
            message_type='notification'
        )
        
        return True
