# -*- coding: utf-8 -*-
{
    'name': 'JAAGO Requisition System',
    'version': '1.0.0',
    'category': 'Approvals',
    'summary': 'Complete Requisition Management with Multi-Step Approvals',
    'description': """
        JAAGO Requisition System
        ========================
        
        Features:
        ---------
        * Full integration with Odoo Approvals module
        * Multi-step approval workflows with configurable rules
        * Product/Service line items with automatic total calculation
        * Email notifications at each approval step
        * Approval history and audit trail
        * PDF report generation with approval signatures
        * PR number generation for approved requisitions
        * Refuse and resubmit functionality
        * Access control based on roles and approval steps
        * Attachment support via mail.thread
        * Activity tracking and followers
        
        Technical:
        ----------
        * Extends approval.request model
        * New models: approval.request.line, studio.approval.rule, approval.approver.history
        * QWeb reports with approval signatures
        * Email templates for notifications
        * Security groups and record rules
        * State-based workflow management
    """,
    'author': 'JAAGO Foundation',
    'website': 'https://jaago.com.bd',
    'depends': [
        'base',
        'approvals',
        'mail',
        'product',
        'hr',
        'project',
        'uom',
    ],
    'data': [
        # Security
        'security/security.xml',
        'security/ir.model.access.csv',
        
        # Data
        'data/sequences.xml',
        'data/mail_templates.xml',
        
        # Views
        'views/approval_request_views.xml',
        'views/approval_request_line_views.xml',
        'views/studio_approval_rule_views.xml',
        'views/approval_approver_history_views.xml',
        'views/menu_views.xml',
        
        # Reports
        'report/requisition_report.xml',
        'report/requisition_report_template.xml',
    ],
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
