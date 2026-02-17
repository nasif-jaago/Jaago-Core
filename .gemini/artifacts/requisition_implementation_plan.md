# Requisition System - Complete Implementation Plan

## Overview
Building a full-featured Requisition system integrated with Odoo Approvals module, including multi-step approval workflows, email notifications, PDF reports, and comprehensive access controls.

## Architecture

### Backend (Odoo)
- **Module Name**: `jaago_requisition`
- **Dependencies**: `approvals`, `mail`, `product`, `hr`, `project`
- **Models**:
  1. `approval.request` (extend existing)
  2. `approval.request.line` (new - product lines)
  3. `studio.approval.rule` (new - approval rules engine)
  4. `approval.approver.history` (new - approval audit trail)

### Frontend (React/TypeScript)
- **Components**:
  1. RequisitionsPage (list view)
  2. RequisitionFormPage (create/edit)
  3. RequisitionApprovalTab (admin only)
  4. RequisitionDetailModal (view/approve/refuse)
  5. ApprovalRulesManager (rule configuration)

## Implementation Phases

### Phase 1: Backend Foundation
1. Create Odoo module structure
2. Extend `approval.request` model with custom fields
3. Create `approval.request.line` model for product lines
4. Add computed fields (total_amount, pr_number)
5. Implement state machine (draft → submitted → approved/refused)

### Phase 2: Approval Rules Engine
1. Create `studio.approval.rule` model
2. Implement domain evaluation logic
3. Build approver resolution system
4. Create step sequencing logic
5. Add threshold-based routing

### Phase 3: Mail & Notifications
1. Configure mail.thread integration
2. Create email templates for each approval step
3. Implement notification triggers
4. Add deep-link generation for emails
5. Configure followers and activity tracking

### Phase 4: Security & Access
1. Define security groups (User, Approver, Admin)
2. Create record rules
3. Implement field-level security
4. Add approval step validation
5. Enforce state-based permissions

### Phase 5: Reports & PDF
1. Create QWeb report template
2. Design approval signature section
3. Implement PR number sequence
4. Add PDF generation endpoint
5. Create print action

### Phase 6: Frontend UI
1. Build requisition form with two-column layout
2. Implement product lines table (add/remove)
3. Create approval workflow UI
4. Add refuse modal with reason input
5. Integrate chatter and attachments
6. Build approval rules configuration UI

### Phase 7: Testing & Validation
1. End-to-end workflow testing
2. Email notification verification
3. Access control validation
4. Rule engine testing
5. PDF generation testing
6. Refusal/resubmission testing

## Technical Specifications

### Database Schema

#### approval.request (extended)
```python
- x_studio_reason_for_purchase (Text)
- x_studio_delivery_instructions (Text)
- x_studio_projects_name (Many2one: project.project)
- x_studio_project_code (Char, related)
- x_studio_budget_amount (Float)
- x_studio_total_amount (Float, computed)
- product_line_ids (One2many)
- pr_number (Char, sequence)
- approval_history_ids (One2many)
```

#### approval.request.line (new)
```python
- request_id (Many2one: approval.request)
- product_id (Many2one: product.product)
- x_studio_product_description (Text)
- product_uom_id (Many2one: uom.uom)
- quantity (Float)
- x_studio_per_unit_price (Float)
- x_studio_estimated_price (Float, computed)
```

#### studio.approval.rule (new)
```python
- name (Char)
- category_id (Many2one: approval.category)
- sequence (Integer)
- domain (Text)
- approver_ids (Many2many: hr.employee)
- amount_threshold_min (Float)
- amount_threshold_max (Float)
- active (Boolean)
```

### API Endpoints

#### Frontend Service Methods
```typescript
// RequisitionsService.ts
- fetchRequisitions(filters, offset, limit)
- fetchRequisitionById(id)
- createRequisition(data)
- updateRequisition(id, data)
- submitRequisition(id)
- approveRequisition(id, signature?)
- refuseRequisition(id, reason)
- fetchProductLines(requestId)
- addProductLine(requestId, lineData)
- removeProductLine(lineId)
- fetchApprovalRules(categoryId?)
- createApprovalRule(ruleData)
- updateApprovalRule(id, ruleData)
- deleteApprovalRule(id)
- generatePRNumber(id)
- downloadPDF(id)
- fetchApprovalHistory(requestId)
```

### Workflow States

```
draft → submitted → in_approval → approved
                              ↓
                           refused → (back to draft for edit)
```

### Approval Chain Logic

1. **Submit**: Request owner submits → status = 'submitted'
2. **Step 1 - Supervisor**: Auto-assigned from employee.parent_id
3. **Step 2 - Finance Officer**: Rule-based (project + amount)
4. **Step 3 - Project Coordinator**: Rule-based (amount threshold)
5. **Step 4 - ED**: Rule-based (amount threshold)
6. **Approved**: All steps complete → generate PR number → status = 'approved'

### Email Template Structure

```html
<p>Dear ${approver.name},</p>
<p>You have a new requisition pending your approval:</p>
<ul>
  <li>Requisition: ${object.name}</li>
  <li>Requested by: ${object.request_owner_id.name}</li>
  <li>Amount: ${object.x_studio_total_amount}</li>
  <li>Project: ${object.x_studio_projects_name.name}</li>
</ul>
<p>
  <a href="${base_url}/web#id=${object.id}&model=approval.request&view_type=form" 
     style="background: #F5C518; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
    Review Requisition
  </a>
</p>
```

## File Structure

### Backend (Odoo Module)
```
jaago_requisition/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── approval_request.py
│   ├── approval_request_line.py
│   ├── studio_approval_rule.py
│   └── approval_approver_history.py
├── views/
│   ├── approval_request_views.xml
│   ├── approval_rule_views.xml
│   └── menu_views.xml
├── security/
│   ├── ir.model.access.csv
│   └── security.xml
├── data/
│   ├── mail_templates.xml
│   └── sequences.xml
├── report/
│   ├── requisition_report.xml
│   └── requisition_report_template.xml
└── static/
    └── description/
        └── icon.png
```

### Frontend (React)
```
src/
├── api/
│   └── RequisitionsService.ts (updated)
├── components/
│   └── requisitions/
│       ├── RequisitionsPage.tsx (updated)
│       ├── RequisitionFormPage.tsx (new)
│       ├── RequisitionProductLines.tsx (new)
│       ├── RequisitionApprovalTab.tsx (new)
│       ├── ApprovalRulesManager.tsx (new)
│       ├── RefuseModal.tsx (new)
│       └── ApprovalHistoryTable.tsx (new)
└── types/
    └── requisition.ts (new)
```

## Next Steps

1. Create Odoo module structure
2. Implement backend models and logic
3. Build frontend components
4. Integrate and test
5. Deploy and validate

## Success Criteria

- ✅ Full workflow from draft to approved works
- ✅ Multi-step approvals with email notifications
- ✅ Refusal and resubmission works correctly
- ✅ PDF report generates with approval signatures
- ✅ Access controls enforced at all levels
- ✅ Rule engine correctly routes approvals
- ✅ All emails contain working deep links
- ✅ Audit trail complete and visible
