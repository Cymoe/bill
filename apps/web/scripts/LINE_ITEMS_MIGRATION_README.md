# Line Items Migration Guide

This directory contains migrations to add template line items for multiple industries to your Supabase database.

## What These Migrations Do

These migrations add pre-configured line items (materials, labor rates, services, equipment) for the following industries:
- **Roofing**: 70+ items including shingles, metal roofing, gutters, labor rates
- **Electrical**: 80+ items including wire, fixtures, panels, labor rates  
- **Plumbing**: 75+ items including pipes, fixtures, water heaters, labor rates
- **HVAC**: 85+ items including equipment, ductwork, filters, labor rates

## Migration Files

1. Individual migration files (in `supabase/migrations/`):
   - `20250120_add_roofing_line_items.sql`
   - `20250120_add_electrical_line_items.sql`
   - `20250120_add_plumbing_line_items.sql`
   - `20250120_add_hvac_line_items.sql`

2. Combined migration file (in `scripts/`):
   - `combined-line-items-migration.sql` - Simplified version for easy copy/paste

## How to Apply These Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. For each migration file:
   - Open the migration file
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run**
   - Verify successful execution

**Tip**: You can run all migrations at once using the `combined-line-items-migration.sql` file.

### Option 2: Using Supabase CLI

1. Make sure you have the [Supabase CLI installed](https://supabase.com/docs/guides/cli)
2. Set your database URL:
   ```bash
   export DATABASE_URL="your-supabase-database-url"
   ```
3. Run the migration script:
   ```bash
   ./scripts/apply-line-items-migrations.sh
   ```

### Option 3: Manual SQL Execution

If you have direct database access:
```bash
psql $DATABASE_URL < supabase/migrations/20250120_add_roofing_line_items.sql
psql $DATABASE_URL < supabase/migrations/20250120_add_electrical_line_items.sql
psql $DATABASE_URL < supabase/migrations/20250120_add_plumbing_line_items.sql
psql $DATABASE_URL < supabase/migrations/20250120_add_hvac_line_items.sql
```

## Verification

After applying the migrations:

1. Log into your application
2. Go to **Price Book** → **Items**
3. You should see template items for your selected industries
4. Check that:
   - Items are properly categorized (material, labor, service, equipment)
   - Items are linked to the correct cost codes
   - Prices and units are appropriate

## Troubleshooting

### If migrations fail:

1. **Check industry exists**: Ensure the industries (Roofing, Electrical, etc.) exist in your database
2. **Check cost codes**: Verify that template cost codes exist for each industry
3. **Check for duplicates**: The migrations may fail if items already exist

### To check what's in the database:

```sql
-- Check industries
SELECT name, id FROM industries ORDER BY name;

-- Check cost codes for an industry
SELECT code, name FROM cost_codes 
WHERE industry_id = (SELECT id FROM industries WHERE name = 'Roofing')
AND organization_id IS NULL
ORDER BY code;

-- Check existing line items
SELECT COUNT(*) as count, i.name as industry 
FROM line_items li
JOIN industries i ON li.industry_id = i.id
WHERE li.organization_id IS NULL
GROUP BY i.name
ORDER BY i.name;
```

## Next Steps

After successfully applying these migrations:

1. Test the system with different user accounts
2. Verify that organizations only see items for their selected industries
3. Consider creating similar migrations for remaining industries:
   - Painting
   - Flooring
   - Landscaping
   - Solar
   - Pool & Spa
   - Property Management
   - Real Estate Investment

## Support

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Ensure your database schema matches the expected structure
3. Verify that all foreign key relationships are valid