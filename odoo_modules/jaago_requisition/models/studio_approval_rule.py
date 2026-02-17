# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class StudioApprovalRule(models.Model):
    _name = 'studio.approval.rule'
    _description = 'Approval Rule Configuration'
    _order = 'sequence, id'

    name = fields.Char(
        string='Rule Name',
        required=True,
        help='Descriptive name for this approval rule'
    )
    active = fields.Boolean(
        string='Active',
        default=True
    )
    category_id = fields.Many2one(
        'approval.category',
        string='Requisition Category',
        required=True,
        help='This rule applies to requisitions of this category'
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
        help='Order in which approval steps are executed'
    )
    approval_type = fields.Selection([
        ('supervisor', 'Supervisor'),
        ('finance', 'Finance Officer'),
        ('coordinator', 'Project Coordinator'),
        ('ed', 'Executive Director'),
        ('custom', 'Custom')
    ], string='Approval Type', required=True, default='custom')
    
    # Domain for conditional rules
    domain = fields.Text(
        string='Domain',
        help='Odoo domain to filter when this rule applies. Example: [(\'x_studio_total_amount\', \'>\', 10000)]'
    )
    
    # Approvers
    approver_ids = fields.Many2many(
        'hr.employee',
        'approval_rule_employee_rel',
        'rule_id',
        'employee_id',
        string='Approvers',
        help='Employees who can approve at this step'
    )
    
    # Amount thresholds
    amount_threshold_min = fields.Float(
        string='Minimum Amount',
        help='Rule applies if requisition amount >= this value (0 = no minimum)'
    )
    amount_threshold_max = fields.Float(
        string='Maximum Amount',
        help='Rule applies if requisition amount <= this value (0 = no maximum)'
    )
    
    # Additional conditions
    project_ids = fields.Many2many(
        'project.project',
        'approval_rule_project_rel',
        'rule_id',
        'project_id',
        string='Specific Projects',
        help='If set, rule only applies to these projects'
    )
    
    company_id = fields.Many2one(
        'res.company',
        string='Company',
        default=lambda self: self.env.company
    )
    
    # Metadata
    description = fields.Text(
        string='Description',
        help='Additional notes about this rule'
    )

    @api.constrains('amount_threshold_min', 'amount_threshold_max')
    def _check_amount_thresholds(self):
        """Validate amount thresholds"""
        for rule in self:
            if rule.amount_threshold_min < 0:
                raise ValidationError(_('Minimum amount cannot be negative.'))
            if rule.amount_threshold_max < 0:
                raise ValidationError(_('Maximum amount cannot be negative.'))
            if (rule.amount_threshold_min > 0 and 
                rule.amount_threshold_max > 0 and 
                rule.amount_threshold_min > rule.amount_threshold_max):
                raise ValidationError(_('Minimum amount cannot be greater than maximum amount.'))

    @api.constrains('domain')
    def _check_domain(self):
        """Validate domain syntax"""
        for rule in self:
            if rule.domain:
                try:
                    eval(rule.domain)
                except Exception as e:
                    raise ValidationError(_('Invalid domain syntax: %s') % str(e))

    @api.constrains('approval_type', 'approver_ids')
    def _check_approvers(self):
        """Validate approvers are set for non-supervisor types"""
        for rule in self:
            if rule.approval_type != 'supervisor' and not rule.approver_ids:
                raise ValidationError(_('Please specify at least one approver for this rule.'))

    def name_get(self):
        """Custom display name"""
        result = []
        for rule in self:
            name = f"[{rule.sequence}] {rule.name}"
            if rule.approval_type:
                name += f" ({dict(rule._fields['approval_type'].selection).get(rule.approval_type)})"
            result.append((rule.id, name))
        return result
