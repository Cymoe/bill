# Industries Table Queries for Supabase Dashboard

## 1. Check if industries table exists and has data

```sql
SELECT COUNT(*) as total_count FROM industries;
```

## 2. View first 10 industries

```sql
SELECT id, name, slug FROM industries ORDER BY name LIMIT 10;
```

## 3. If the table is empty, populate it with this query:

```sql
-- Insert all industries with proper display order
INSERT INTO industries (name, slug, description, icon, color, display_order, is_active)
VALUES 
  -- Construction Industries
  ('General Construction', 'general-construction', 'General contracting and construction services', '🏗️', '#6B7280', 10, true),
  ('Electrical', 'electrical', 'Electrical contracting and services', '⚡', '#F59E0B', 20, true),
  ('Plumbing', 'plumbing', 'Plumbing contracting and services', '🚿', '#3B82F6', 30, true),
  ('HVAC', 'hvac', 'Heating, ventilation, and air conditioning services', '❄️', '#06B6D4', 40, true),
  ('Roofing', 'roofing', 'Roofing installation and repair services', '🏠', '#DC2626', 50, true),
  ('Flooring', 'flooring', 'Flooring installation and refinishing services', '🪵', '#7C3AED', 60, true),
  ('Landscaping', 'landscaping', 'Landscaping and outdoor design services', '🌳', '#10B981', 70, true),
  
  -- Specialized Construction
  ('Commercial Construction', 'commercial-construction', 'Commercial building and tenant improvements', '🏢', '#1F2937', 80, true),
  ('Residential Construction', 'residential-construction', 'Specialized residential remodeling and renovation', '🏠', '#84CC16', 90, true),
  ('Kitchen Remodeling', 'kitchen-remodeling', 'Kitchen design and renovation services', '🍳', '#F97316', 100, true),
  ('Bathroom Remodeling', 'bathroom-remodeling', 'Bathroom design and renovation services', '🚿', '#8B5CF6', 110, true),
  
  -- Renewable Energy
  ('Solar', 'solar', 'Solar panel installation and renewable energy services', '☀️', '#FDE047', 120, true),
  
  -- Real Estate
  ('Property Management', 'property-management', 'Property management and maintenance services', '🔑', '#4B5563', 130, true),
  ('Real Estate Investment', 'real-estate-investment', 'Real estate investment and development', '🏡', '#059669', 140, true)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
```

## 4. Verify the insert worked:

```sql
SELECT COUNT(*) as total_count FROM industries;
SELECT * FROM industries ORDER BY display_order;
```

## Instructions:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wnwatjwcjptwehagqiwf/editor
2. Click on the SQL Editor tab
3. Run query #1 to check if the table has data
4. If it returns 0, run query #3 to populate the table
5. Run query #4 to verify the data was inserted correctly

Note: The industries table has Row Level Security (RLS) enabled, so you need to run these queries through the Supabase dashboard's SQL editor which runs with elevated privileges.