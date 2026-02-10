# Expenses Field Fix - unit_amount → price_unit

## Issue
The initial implementation used `unit_amount` as the field name for the unit price in the `hr.expense` model, which caused the error:
```
Invalid field 'unit_amount' on 'hr.expense'
```

## Root Cause
In Odoo 17's `hr.expense` model, the field for unit price is named `price_unit`, not `unit_amount`. This is consistent with other Odoo models like `sale.order.line` and `purchase.order.line`.

## Solution
Updated all references from `unit_amount` to `price_unit` across:

### Files Modified
1. **src/api/ExpensesService.ts**
   - `Expense` interface: `unit_amount` → `price_unit`
   - `ExpenseFormValues` interface: `unit_amount` → `price_unit`
   - `fetchExpenses()`: Updated fields array

2. **src/components/expenses/ExpenseFormModal.tsx**
   - Form state initialization
   - Product selection handler
   - Validation logic
   - Total calculation
   - Input field binding
   - Error messages

3. **src/components/expenses/ExpenseDetailModal.tsx**
   - Display of unit price value

## Field Mapping
| UI Label | Odoo Field | Type | Description |
|----------|------------|------|-------------|
| Unit Price | `price_unit` | Float | Price per unit/item |
| Quantity | `quantity` | Float | Number of units |
| Total Amount | `total_amount` | Float | Computed: price_unit × quantity |

## Testing
After this fix, the Expenses module should:
✅ Create expenses without field errors
✅ Display unit prices correctly
✅ Calculate totals accurately (price_unit × quantity)
✅ Fetch and display existing expenses

## Status
✅ **FIXED** - All field references updated to use correct Odoo field names
