-- Seed Services and Service Options for Handyman industry
-- Industry ID: 870d8848-0b29-4bd0-9dc7-eca2a4f77fdd

-- First, create services for Handyman
INSERT INTO services (id, organization_id, name, description, category, industry_id, is_active, display_order)
VALUES
  (gen_random_uuid(), NULL, 'Home Repairs', 'General home repair and maintenance services', 'repair', '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd', true, 1),
  (gen_random_uuid(), NULL, 'Assembly Services', 'Furniture and equipment assembly', 'installation', '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd', true, 2),
  (gen_random_uuid(), NULL, 'Minor Installations', 'Small home installations and mounting', 'installation', '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd', true, 3),
  (gen_random_uuid(), NULL, 'Maintenance Services', 'Preventive maintenance and upkeep', 'maintenance', '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd', true, 4);

-- Get service IDs and create service options
WITH service_ids AS (
  SELECT id, name FROM services 
  WHERE industry_id = '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd' 
  AND organization_id IS NULL
)
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order)
SELECT 
  gen_random_uuid(),
  s.id,
  NULL,
  so.option_name,
  so.option_desc,
  so.price,
  so.unit,
  so.hours,
  so.quality,
  so.warranty,
  true,
  so.popular,
  so.display_order
FROM (
  VALUES
  -- Home Repairs Options
  ('Home Repairs', 'Quick Fix Service', 'Minor repairs under 2 hours', 95.00, 'service', 2.0, 'standard', 30, true, 1),
  ('Home Repairs', 'Half-Day Repair', '4-hour repair service block', 220.00, 'service', 4.0, 'standard', 30, false, 2),
  ('Home Repairs', 'Full-Day Repair', '8-hour repair service block', 420.00, 'service', 8.0, 'standard', 30, false, 3),
  
  -- Assembly Services Options
  ('Assembly Services', 'Basic Assembly', 'Simple furniture assembly (1-2 hours)', 125.00, 'service', 2.0, 'standard', 0, true, 1),
  ('Assembly Services', 'Complex Assembly', 'Complex furniture or equipment (3-4 hours)', 245.00, 'service', 4.0, 'standard', 0, false, 2),
  ('Assembly Services', 'IKEA Special', 'IKEA furniture assembly per piece', 85.00, 'piece', 1.5, 'standard', 0, true, 3),
  
  -- Minor Installations Options
  ('Minor Installations', 'Basic Installation', 'TV mounts, shelves, curtain rods', 145.00, 'service', 2.0, 'standard', 90, true, 1),
  ('Minor Installations', 'Safety Installation', 'Grab bars, railings, baby gates', 185.00, 'service', 2.5, 'premium', 365, false, 2),
  ('Minor Installations', 'Multi-Item Package', 'Install 3-5 items in one visit', 325.00, 'service', 4.0, 'standard', 90, false, 3),
  
  -- Maintenance Services Options
  ('Maintenance Services', 'Quarterly Check-Up', 'Home maintenance inspection', 185.00, 'visit', 3.0, 'standard', 0, false, 1),
  ('Maintenance Services', 'Seasonal Prep', 'Prepare home for season change', 285.00, 'service', 4.0, 'standard', 0, true, 2),
  ('Maintenance Services', 'Annual Maintenance', '4 quarterly visits package', 640.00, 'year', 12.0, 'premium', 0, false, 3)
) AS so(service_name, option_name, option_desc, price, unit, hours, quality, warranty, popular, display_order)
JOIN service_ids s ON s.name = so.service_name;