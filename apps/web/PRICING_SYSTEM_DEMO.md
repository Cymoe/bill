# Pricing System Demo

## Overview
We've implemented a comprehensive discount-based pricing system with markup functionality. Here's how to see it in action:

## 1. Access the Markup Configuration

Navigate to the Company Settings from the user menu in the sidebar:
- Click on your profile icon in the sidebar
- Select "Company Settings"
- You'll land on the "Pricing & Markup" tab

## 2. Markup Configuration Features

### Category-Based Markup
The system automatically applies markup based on cost code categories:

- **Labor (100-199)**: Default 40% markup
  - Example: $50/hr cost → $70/hr customer price (28.6% margin)
  
- **Materials (500-599)**: Default 25% markup
  - Example: $200 cost → $250 customer price (20% margin)
  
- **Services (200-299, 300-399, 600-699)**: Default 35% markup
  - Example: $100 cost → $135 customer price (25.9% margin)
  
- **Subcontractor (700-799)**: Default 15% markup
  - Example: $1000 cost → $1150 customer price (13% margin)

### Visual Interface
- Each category has its own card with icon
- Real-time preview of pricing calculations
- Examples showing cost → price conversion
- Margin percentage displayed for profitability tracking

## 3. Service Option Customization

When customizing service options:
1. Click "Customize" on any service option
2. Instead of manual price entry, set a **Bundle Discount %**
3. See real-time calculation:
   - Base Price: Sum of all line items
   - Discount: Percentage off for bundling
   - Customer Price: Final discounted price

## 4. Pricing Flow Example

Let's trace a complete pricing calculation:

### Line Item Level (Atomic Unit)
```
Journeyman Carpenter: $55/hr (base cost)
```

### Service Option Level (Bundle)
```
Interior Wall Framing Service:
- 2x Journeyman Carpenter @ $55/hr = $110
- 50x 2x4 Lumber @ $4.25 = $212.50
- 10x Drywall Sheets @ $12.50 = $125
Total Base Cost: $447.50
Bundle Discount (10%): -$44.75
Discounted Cost: $402.75
```

### Markup Application
```
Labor portion ($110) @ 40% markup = $154
Materials portion ($337.50) @ 25% markup = $421.88
Total Customer Price: $575.88
```

### Package Level (Additional Discount)
```
If included in "Complete Room Package":
Package Discount (5%): -$28.79
Final Package Price: $547.09
```

## 5. Key Benefits

### For Contractors
- **Transparency**: See exact costs vs prices
- **Flexibility**: Adjust markups by category
- **Profitability**: Built-in margin tracking
- **Simplicity**: No confusing manual overrides

### For Customers  
- **Optional Transparency**: Can show/hide cost breakdown
- **Competitive Pricing**: Bundle discounts visible
- **Clear Value**: Understand what they're paying for

## 6. Database Architecture

### Tables Created
- `organization_markup_rules`: Stores category-based markup percentages
- `service_options.bundle_discount_percentage`: Service-level discounts
- `service_packages.package_discount_percentage`: Package-level discounts
- `estimates.markup_mode`: Flexible markup control per estimate

### Views Created
- `service_option_calculated_prices`: Real-time price calculations
- `service_package_calculated_prices`: Package pricing with discounts
- `comprehensive_pricing_view`: Complete pricing breakdown

## 7. Testing the System

1. **View Current Markup Settings**
   - Go to Company Settings → Pricing & Markup
   - See default markup percentages
   - Adjust as needed for your market

2. **Customize a Service Option**
   - Go to Services page
   - Click on any service option
   - Click "Customize" 
   - Set bundle discount percentage
   - See instant price calculation

3. **Create an Estimate**
   - Add services to cart
   - Create estimate
   - Markup automatically applied based on categories
   - Customer sees final prices

## 8. Advanced Features

### Estimate-Level Override
When creating estimates, you can:
- Use organization defaults (default)
- Set custom markup for specific job
- Disable markup entirely (cost-plus contracts)

### Reporting & Analytics
- Track margins by category
- Identify most profitable services
- Optimize pricing strategy

## Next Steps

1. Test markup configuration with your organization
2. Customize service options with bundle discounts
3. Create test estimates to see full pricing flow
4. Monitor profitability with new margin tracking