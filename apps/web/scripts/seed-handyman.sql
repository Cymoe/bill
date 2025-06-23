-- Seed data for Handyman industry
-- Industry ID: 870d8848-0b29-4bd0-9dc7-eca2a4f77fdd

-- First, add cost codes for Handyman
INSERT INTO cost_codes (id, industry_id, code, name, category, description, organization_id, is_active)
VALUES
  -- Labor rates
  (gen_random_uuid(), '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd', 'HM100', 'Handyman Labor', 'labor', 'General handyman labor rates', NULL, true),
  -- Common repairs
  (gen_random_uuid(), '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd', 'HM200', 'Repair Services', 'service', 'Common repair and maintenance tasks', NULL, true),
  -- Installation services
  (gen_random_uuid(), '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd', 'HM300', 'Installation Services', 'service', 'Small installation and assembly tasks', NULL, true),
  -- Materials
  (gen_random_uuid(), '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd', 'HM500', 'Handyman Materials', 'material', 'Common materials and supplies', NULL, true);

-- Get the cost code IDs
WITH cost_code_ids AS (
  SELECT id, code FROM cost_codes 
  WHERE industry_id = '870d8848-0b29-4bd0-9dc7-eca2a4f77fdd' 
  AND organization_id IS NULL
)
-- Insert line items
INSERT INTO line_items (id, cost_code_id, name, description, price, unit, is_active)
SELECT 
  gen_random_uuid(),
  cc.id,
  li.name,
  li.description,
  li.price,
  li.unit,
  true
FROM (
  VALUES
  -- HM100 - Handyman Labor
  ('HM100', 'Basic Handyman', 'General handyman hourly rate', 45.00, 'hour'),
  ('HM100', 'Skilled Handyman', 'Experienced handyman hourly rate', 65.00, 'hour'),
  ('HM100', 'Master Handyman', 'Expert handyman hourly rate', 85.00, 'hour'),
  ('HM100', 'Emergency Service', 'After-hours emergency rate', 125.00, 'hour'),
  ('HM100', 'Weekend Service', 'Weekend hourly rate', 75.00, 'hour'),
  ('HM100', 'Service Call Fee', 'Minimum service call charge', 95.00, 'each'),
  
  -- HM200 - Repair Services
  ('HM200', 'Drywall Patch - Small', 'Patch holes up to 4 inches', 95.00, 'each'),
  ('HM200', 'Drywall Patch - Medium', 'Patch holes 4-8 inches', 145.00, 'each'),
  ('HM200', 'Drywall Patch - Large', 'Patch holes 8-12 inches', 195.00, 'each'),
  ('HM200', 'Door Adjustment', 'Adjust sticking or misaligned door', 85.00, 'each'),
  ('HM200', 'Door Handle Replace', 'Replace interior door handle', 95.00, 'each'),
  ('HM200', 'Toilet Repair', 'Fix running toilet or replace parts', 125.00, 'each'),
  ('HM200', 'Faucet Repair', 'Fix leaky faucet', 115.00, 'each'),
  ('HM200', 'Caulking - Bathroom', 'Re-caulk tub or shower', 145.00, 'each'),
  ('HM200', 'Caulking - Kitchen', 'Re-caulk sink or countertop', 95.00, 'each'),
  ('HM200', 'Grout Repair', 'Repair damaged grout', 35.00, 'sqft'),
  ('HM200', 'Cabinet Door Adjustment', 'Adjust cabinet doors and drawers', 45.00, 'each'),
  ('HM200', 'Weatherstripping - Door', 'Replace door weatherstripping', 125.00, 'each'),
  ('HM200', 'Weatherstripping - Window', 'Replace window weatherstripping', 85.00, 'each'),
  ('HM200', 'Screen Repair', 'Repair window or door screen', 65.00, 'each'),
  ('HM200', 'Gutter Cleaning', 'Clean gutters and downspouts', 3.50, 'linear ft'),
  ('HM200', 'Pressure Washing - Small', 'Pressure wash small area', 185.00, 'each'),
  ('HM200', 'Deck Board Replace', 'Replace single deck board', 85.00, 'each'),
  ('HM200', 'Fence Board Replace', 'Replace fence board or picket', 45.00, 'each'),
  ('HM200', 'Gate Adjustment', 'Adjust sagging gate', 125.00, 'each'),
  
  -- HM300 - Installation Services
  ('HM300', 'TV Mount - Standard', 'Mount TV on wall (32-55")', 185.00, 'each'),
  ('HM300', 'TV Mount - Large', 'Mount TV on wall (55"+)', 245.00, 'each'),
  ('HM300', 'Shelf Installation', 'Install floating shelf', 65.00, 'each'),
  ('HM300', 'Closet Rod Install', 'Install closet rod', 95.00, 'each'),
  ('HM300', 'Towel Bar Install', 'Install bathroom towel bar', 55.00, 'each'),
  ('HM300', 'Toilet Paper Holder', 'Install toilet paper holder', 45.00, 'each'),
  ('HM300', 'Grab Bar Install', 'Install safety grab bar', 125.00, 'each'),
  ('HM300', 'Picture Hanging - Small', 'Hang pictures under 24"', 25.00, 'each'),
  ('HM300', 'Picture Hanging - Large', 'Hang pictures over 24"', 45.00, 'each'),
  ('HM300', 'Mirror Installation', 'Install wall mirror', 145.00, 'each'),
  ('HM300', 'Curtain Rod Install', 'Install window curtain rod', 85.00, 'each'),
  ('HM300', 'Ceiling Fan Assembly', 'Assemble ceiling fan (no electrical)', 125.00, 'each'),
  ('HM300', 'Light Fixture Swap', 'Replace light fixture (no wiring)', 95.00, 'each'),
  ('HM300', 'Smoke Detector Install', 'Install battery smoke detector', 65.00, 'each'),
  ('HM300', 'Door Stop Install', 'Install door stop', 35.00, 'each'),
  ('HM300', 'Baby Gate Install', 'Install safety gate', 115.00, 'each'),
  ('HM300', 'Furniture Assembly - Small', 'Assemble small furniture item', 95.00, 'each'),
  ('HM300', 'Furniture Assembly - Medium', 'Assemble medium furniture item', 165.00, 'each'),
  ('HM300', 'Furniture Assembly - Large', 'Assemble large furniture item', 245.00, 'each'),
  ('HM300', 'IKEA Assembly', 'IKEA furniture assembly', 85.00, 'hour'),
  
  -- HM500 - Handyman Materials
  ('HM500', 'Drywall Patch Kit', 'Complete patch repair kit', 18.50, 'each'),
  ('HM500', 'Caulk - Silicone', 'Silicone caulk tube', 8.50, 'tube'),
  ('HM500', 'Caulk - Painters', 'Painters caulk tube', 4.50, 'tube'),
  ('HM500', 'Wood Filler', 'Wood repair filler', 12.50, 'each'),
  ('HM500', 'Sandpaper Assortment', 'Various grit sandpaper', 15.00, 'pack'),
  ('HM500', 'Screws & Anchors', 'Assorted fasteners', 25.00, 'kit'),
  ('HM500', 'Weather Stripping', 'Door/window weatherstrip', 18.00, 'pack'),
  ('HM500', 'Touch-up Paint', 'Small paint for repairs', 12.00, 'each'),
  ('HM500', 'WD-40', 'Lubricant spray', 8.50, 'can'),
  ('HM500', 'Duct Tape', 'General purpose tape', 9.50, 'roll'),
  ('HM500', 'Wood Glue', 'Carpenter glue', 7.50, 'bottle'),
  ('HM500', 'Electrical Tape', 'Vinyl electrical tape', 4.50, 'roll')
) AS li(code, name, description, price, unit)
JOIN cost_code_ids cc ON cc.code = li.code;