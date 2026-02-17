# -*- coding: utf-8 -*-

from odoo import models, fields, api


class ApprovalRequestLine(models.Model):
    _name = 'approval.request.line'
    _description = 'Approval Request Product/Service Line'
    _order = 'sequence, id'

    request_id = fields.Many2one(
        'approval.request',
        string='Requisition',
        required=True,
        ondelete='cascade',
        index=True
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10
    )
    product_id = fields.Many2one(
        'product.product',
        string='Product/Service',
        required=True,
        domain=[('purchase_ok', '=', True)]
    )
    x_studio_product_description = fields.Text(
        string='Description',
        help='Detailed description of the product or service'
    )
    product_uom_id = fields.Many2one(
        'uom.uom',
        string='Unit',
        required=True
    )
    quantity = fields.Float(
        string='Quantity',
        default=1.0,
        digits='Product Unit of Measure'
    )
    x_studio_per_unit_price = fields.Float(
        string='Per Unit Price',
        digits='Product Price'
    )
    x_studio_estimated_price = fields.Float(
        string='Estimated Price',
        compute='_compute_estimated_price',
        store=True,
        digits='Product Price',
        help='Automatically calculated as quantity * per unit price'
    )
    company_id = fields.Many2one(
        'res.company',
        related='request_id.company_id',
        store=True,
        readonly=True
    )

    @api.depends('quantity', 'x_studio_per_unit_price')
    def _compute_estimated_price(self):
        """Calculate estimated price from quantity and unit price"""
        for line in self:
            line.x_studio_estimated_price = line.quantity * line.x_studio_per_unit_price

    @api.onchange('product_id')
    def _onchange_product_id(self):
        """Auto-fill fields when product is selected"""
        if self.product_id:
            # Set default UoM from product
            self.product_uom_id = self.product_id.uom_id
            
            # Set default price from product
            self.x_studio_per_unit_price = self.product_id.list_price
            
            # Set description from product
            if not self.x_studio_product_description:
                self.x_studio_product_description = self.product_id.name

    @api.onchange('product_uom_id')
    def _onchange_product_uom_id(self):
        """Validate UoM category matches product"""
        if self.product_id and self.product_uom_id:
            if self.product_uom_id.category_id != self.product_id.uom_id.category_id:
                return {
                    'warning': {
                        'title': 'Warning',
                        'message': 'The selected unit of measure is not compatible with the product.'
                    }
                }
