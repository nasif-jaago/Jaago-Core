# JAAGO Requisition System - Technical Documentation

## 1. Rules Storage & Configuration
Approval rules are stored in the `studio.approval.rule` model. 
- **Sequence**: Determines the order of approval steps.
- **Category**: Rules are scoped to specific `approval.category` records (e.g., "Purchase Requisition").
- **Approvers**: Multiple approvers can be assigned to a single step.

## 2. Domain Evaluation
The rules engine evaluates applicability using Odoo's standard domain syntax.
- **Field**: `domain` (Text field in `studio.approval.rule`).
- **Evaluation**: During `action_confirm`, the requisition record uses `filtered_domain(eval(rule.domain))` to decide if a rule applies.
- **Context**: Any field on the `approval.request` model (including custom Studio fields like `x_studio_total_amount`) can be used in the domain.

## 3. Approver Resolution
Approvers are resolved per step based on the `approval_type`:
- **Supervisor**: Dynamically resolves to `request_owner_id.parent_id` (the employee hierarchy).
- **Finance/Coordinator/ED/Custom**: Resolves to the specific `hr.employee` records linked in `approver_ids`.

## 4. Multi-Step Workflow Logic
1. **Submission**: `action_confirm()` is called.
2. **Rule Matching**: System fetches all rules for the category, filters them by domain and amount thresholds.
3. **History Generation**: `approval.approver.history` records are created for each matching step, marked as `pending`.
4. **Sequencing**: Approvals must follow the `sequence` order. Only the current step's approver has the `can_approve` permission.

## 5. Escalation & Thresholds
- **Amount Thresholds**: Rules have `amount_threshold_min` and `amount_threshold_max`. A rule only triggers if the requisition's `x_studio_total_amount` falls within this range.
- **Notification**: Upon approval of a step, the system automatically identifies the next pending history record and triggers `_notify_next_approver()`, which sends an email and schedules an Odoo activity.

## 6. Access Control & Security
- **Permissions**: Calculated dynamically via `can_approve`, `can_refuse`, and `can_edit` computed fields.
- **State Protection**: Requisitions in `pending` or `approved` state cannot be edited by the owner.
- **Hierarchy Security**: Uses Odoo Record Rules to ensure users only see relevant requisitions.

## 7. Reporting & Audit
- **Audit Trail**: Every decision is logged in `approval.approver.history` with a timestamp and user reference.
- **PDF Report**: Uses a custom QWeb template `requisition_report_template` to render the form, product lines, and the full approval history table with signature zones.
