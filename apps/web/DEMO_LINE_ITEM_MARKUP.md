# Line Item Markup System Demo

## Overview
The new line item markup system provides contractors with intuitive, inline pricing controls directly where they think about pricing - at the individual line item level.

## Key Components

### 1. LineItemMarkupEditor Component
Located in the PriceBook, this component provides:
- **Inline editing** - No need to open modals
- **Dual modes** - Percentage markup or custom price
- **Real-time calculations** - See margin instantly
- **Visual hierarchy** - Cost → Markup → Price → Margin

### 2. Database Structure
```sql
-- line_item_overrides table
markup_percentage DECIMAL(5,2)  -- Store markup %
custom_price DECIMAL(10,2)      -- OR custom price (mutually exclusive)
```

### 3. UI Flow

#### Default View
When not editing, shows:
```
[Line Item Name]                    $125.00 +25%  [↗]
                                    per hour • 20% margin
```

#### Editing Mode
Click the trending up icon (↗) to enter edit mode:
```
[%] [$]  [25]% → $125.00 (20% margin)  [✓] [✗]
```

## Usage Examples

### Example 1: Setting Markup Percentage
1. Click the markup icon (↗) on any line item
2. Ensure percentage mode is selected
3. Enter desired markup (e.g., 35%)
4. See real-time price calculation
5. Click ✓ to save

**Before**: Master Carpenter - $75.00/hour (base cost)  
**After**: Master Carpenter - $101.25/hour (+35%) • 25.9% margin

### Example 2: Setting Custom Price
1. Click the markup icon (↗)
2. Switch to dollar mode ($)
3. Enter exact price (e.g., $120)
4. See calculated margin
5. Click ✓ to save

**Before**: 2x4 Lumber - $4.25/8ft (base cost)  
**After**: 2x4 Lumber - $6.00/8ft • 29.2% margin

### Example 3: Resetting to Base Price
1. When item has override, "Reset" button appears
2. Click Reset to remove custom pricing
3. Returns to industry standard price

## Benefits Over Category-Based Markup

### Previous System (Category-Based)
```
Labor: +25%
Materials: +15%
Services: +20%
```
**Issues**: 
- Too broad - all labor gets same markup
- Doesn't match how contractors think
- Hidden in settings, not where pricing happens

### New System (Line Item Level)
```
Master Carpenter: +35%
Apprentice Carpenter: +15%
Premium Oak Flooring: +40%
Standard Vinyl: +20%
```
**Benefits**:
- Precise control per item
- Matches mental model
- Inline where decisions are made
- Visual feedback immediate

## Technical Implementation

### LineItemService Methods
```typescript
// Set markup percentage
await LineItemService.setMarkupPercentage(lineItemId, orgId, 35);

// Set custom price
await LineItemService.setOverridePrice(lineItemId, orgId, 120.00);

// Reset to base
await LineItemService.removeOverridePrice(lineItemId, orgId);
```

### Database Function
```sql
-- calculate_line_item_price function
CREATE FUNCTION calculate_line_item_price(
    base_price DECIMAL,
    markup_percentage DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    IF markup_percentage IS NULL THEN
        RETURN base_price;
    END IF;
    RETURN base_price * (1 + markup_percentage / 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

## Migration Path
Existing custom prices were automatically converted to markup percentages where possible, maintaining backward compatibility while enabling the new features.

## Next Steps
1. Test the markup system with different line items
2. Set organization-wide default markups (optional)
3. Review margin reports to optimize pricing strategy