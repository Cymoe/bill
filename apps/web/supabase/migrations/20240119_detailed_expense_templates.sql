-- Add more detailed expense templates for all project categories

-- Bathroom Remodel
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  -- Materials
  ('Vanity and sink', 850.00, 'Material', 'Bath supplier', 1),
  ('Toilet', 450.00, 'Material', 'Plumbing supplier', 2),
  ('Shower/tub unit', 1200.00, 'Material', 'Bath supplier', 3),
  ('Tile - floor (120 sq ft)', 600.00, 'Material', 'Tile shop', 4),
  ('Tile - walls (200 sq ft)', 800.00, 'Material', 'Tile shop', 5),
  ('Plumbing fixtures', 350.00, 'Material', 'Plumbing supplier', 6),
  ('Exhaust fan', 150.00, 'Material', 'Electrical supplier', 7),
  ('Mirror and accessories', 200.00, 'Material', 'Bath supplier', 8),
  ('Waterproofing materials', 150.00, 'Material', 'Building supplier', 9),
  -- Labor
  ('Demo existing bathroom', 800.00, 'Labor', 'Demo crew', 10),
  ('Plumbing rough-in', 1200.00, 'Labor', 'Licensed plumber', 11),
  ('Electrical work', 600.00, 'Labor', 'Licensed electrician', 12),
  ('Tile installation - floor', 1440.00, 'Labor', 'Tile installer', 13),
  ('Tile installation - walls', 2000.00, 'Labor', 'Tile installer', 14),
  ('Vanity installation', 300.00, 'Labor', 'Carpenter', 15),
  ('Toilet installation', 200.00, 'Labor', 'Plumber', 16),
  ('Shower/tub installation', 500.00, 'Labor', 'Plumber', 17),
  ('Drywall patching', 400.00, 'Labor', 'Drywall contractor', 18),
  ('Painting', 500.00, 'Labor', 'Painter', 19),
  -- Other
  ('Permits', 350.00, 'Permits', 'City/County', 20),
  ('Dumpster rental', 400.00, 'Equipment', 'Waste management', 21)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'bathroom-remodel';

-- Flooring Installation
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  -- Materials
  ('Hardwood flooring (500 sq ft)', 4000.00, 'Material', 'Flooring supplier', 1),
  ('Underlayment', 250.00, 'Material', 'Flooring supplier', 2),
  ('Transition strips', 175.00, 'Material', 'Flooring supplier', 3),
  ('Baseboards (120 linear ft)', 360.00, 'Material', 'Lumber yard', 4),
  ('Floor prep materials', 200.00, 'Material', 'Building supplier', 5),
  ('Stain and finish', 750.00, 'Material', 'Paint supplier', 6),
  -- Labor
  ('Remove existing flooring', 500.00, 'Labor', 'Demo crew', 7),
  ('Floor preparation', 1000.00, 'Labor', 'Flooring crew', 8),
  ('Flooring installation', 2000.00, 'Labor', 'Flooring installer', 9),
  ('Sanding and finishing', 1500.00, 'Labor', 'Flooring finisher', 10),
  ('Baseboard installation', 480.00, 'Labor', 'Carpenter', 11),
  ('Cleanup and disposal', 200.00, 'Labor', 'General labor', 12)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'flooring';

-- Roof Repair
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  -- Materials
  ('Shingles (20 squares)', 2000.00, 'Material', 'Roofing supplier', 1),
  ('Underlayment', 400.00, 'Material', 'Roofing supplier', 2),
  ('Flashing', 200.00, 'Material', 'Roofing supplier', 3),
  ('Ridge vents', 150.00, 'Material', 'Roofing supplier', 4),
  ('Nails and adhesive', 150.00, 'Material', 'Roofing supplier', 5),
  ('Gutters (150 linear ft)', 750.00, 'Material', 'Gutter supplier', 6),
  -- Labor
  ('Tear-off existing roof', 1500.00, 'Labor', 'Roofing crew', 7),
  ('Install underlayment', 800.00, 'Labor', 'Roofing crew', 8),
  ('Shingle installation', 2500.00, 'Labor', 'Roofing crew', 9),
  ('Flashing and detail work', 800.00, 'Labor', 'Roofing crew', 10),
  ('Gutter installation', 900.00, 'Labor', 'Gutter installer', 11),
  -- Other
  ('Dumpster rental', 500.00, 'Equipment', 'Waste management', 12),
  ('Permits', 200.00, 'Permits', 'City/County', 13)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'roof-repair';

-- Deck Construction
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  -- Materials
  ('Pressure treated lumber', 2500.00, 'Material', 'Lumber yard', 1),
  ('Composite decking', 3500.00, 'Material', 'Decking supplier', 2),
  ('Railing system', 1200.00, 'Material', 'Decking supplier', 3),
  ('Concrete footings', 600.00, 'Material', 'Concrete supplier', 4),
  ('Hardware and fasteners', 400.00, 'Material', 'Hardware store', 5),
  ('Stairs materials', 500.00, 'Material', 'Lumber yard', 6),
  -- Labor
  ('Excavation and footings', 1200.00, 'Labor', 'Concrete crew', 7),
  ('Framing', 2000.00, 'Labor', 'Carpenter', 8),
  ('Decking installation', 1500.00, 'Labor', 'Carpenter', 9),
  ('Railing installation', 800.00, 'Labor', 'Carpenter', 10),
  ('Stairs construction', 700.00, 'Labor', 'Carpenter', 11),
  -- Other
  ('Permits', 300.00, 'Permits', 'City/County', 12),
  ('Equipment rental', 200.00, 'Equipment', 'Tool rental', 13)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'deck-construction';

-- Interior Painting
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  -- Materials
  ('Primer (5 gallons)', 150.00, 'Material', 'Paint store', 1),
  ('Wall paint (10 gallons)', 400.00, 'Material', 'Paint store', 2),
  ('Ceiling paint (3 gallons)', 90.00, 'Material', 'Paint store', 3),
  ('Trim paint (2 gallons)', 100.00, 'Material', 'Paint store', 4),
  ('Drop cloths and plastic', 50.00, 'Material', 'Paint store', 5),
  ('Tape and supplies', 75.00, 'Material', 'Paint store', 6),
  ('Brushes and rollers', 100.00, 'Material', 'Paint store', 7),
  -- Labor
  ('Wall preparation', 600.00, 'Labor', 'Painter', 8),
  ('Priming', 400.00, 'Labor', 'Painter', 9),
  ('Wall painting (2 coats)', 1200.00, 'Labor', 'Painter', 10),
  ('Ceiling painting', 400.00, 'Labor', 'Painter', 11),
  ('Trim painting', 600.00, 'Labor', 'Painter', 12),
  ('Cleanup', 150.00, 'Labor', 'Painter', 13)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'interior-painting';

-- Plumbing
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  -- Common plumbing services
  ('Service call/diagnosis', 150.00, 'Labor', 'Licensed plumber', 1),
  ('Water heater replacement', 1200.00, 'Material', 'Plumbing supplier', 2),
  ('Water heater installation', 500.00, 'Labor', 'Licensed plumber', 3),
  ('Toilet replacement', 350.00, 'Material', 'Plumbing supplier', 4),
  ('Toilet installation', 200.00, 'Labor', 'Licensed plumber', 5),
  ('Faucet replacement', 250.00, 'Material', 'Plumbing supplier', 6),
  ('Faucet installation', 150.00, 'Labor', 'Licensed plumber', 7),
  ('Pipe repair materials', 200.00, 'Material', 'Plumbing supplier', 8),
  ('Pipe repair labor', 400.00, 'Labor', 'Licensed plumber', 9),
  ('Drain cleaning', 250.00, 'Labor', 'Licensed plumber', 10),
  ('Shut-off valve replacement', 100.00, 'Material', 'Plumbing supplier', 11),
  ('Miscellaneous fittings', 100.00, 'Material', 'Plumbing supplier', 12)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'plumbing';

-- Electrical
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  -- Common electrical services
  ('Service call/diagnosis', 150.00, 'Labor', 'Licensed electrician', 1),
  ('Panel upgrade (200 amp)', 1500.00, 'Material', 'Electrical supplier', 2),
  ('Panel installation labor', 1000.00, 'Labor', 'Licensed electrician', 3),
  ('Outlet installation (per 5)', 100.00, 'Material', 'Electrical supplier', 4),
  ('Outlet labor (per 5)', 250.00, 'Labor', 'Licensed electrician', 5),
  ('Light fixture', 150.00, 'Material', 'Lighting store', 6),
  ('Light installation', 100.00, 'Labor', 'Licensed electrician', 7),
  ('Wire (500 ft)', 250.00, 'Material', 'Electrical supplier', 8),
  ('Circuit breakers', 150.00, 'Material', 'Electrical supplier', 9),
  ('Switch installation', 150.00, 'Labor', 'Licensed electrician', 10),
  ('Electrical inspection', 150.00, 'Permits', 'City/County', 11),
  ('Miscellaneous supplies', 100.00, 'Material', 'Electrical supplier', 12)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'electrical';

-- HVAC
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  -- Common HVAC services
  ('System diagnostic', 150.00, 'Labor', 'HVAC technician', 1),
  ('AC unit (3 ton)', 3500.00, 'Material', 'HVAC supplier', 2),
  ('AC installation', 2000.00, 'Labor', 'HVAC technician', 3),
  ('Furnace unit', 2500.00, 'Material', 'HVAC supplier', 4),
  ('Furnace installation', 1500.00, 'Labor', 'HVAC technician', 5),
  ('Ductwork (per 100 ft)', 500.00, 'Material', 'HVAC supplier', 6),
  ('Duct installation', 800.00, 'Labor', 'HVAC technician', 7),
  ('Thermostat upgrade', 250.00, 'Material', 'HVAC supplier', 8),
  ('Refrigerant recharge', 300.00, 'Material', 'HVAC supplier', 9),
  ('Filter replacement', 50.00, 'Material', 'HVAC supplier', 10),
  ('Annual maintenance', 200.00, 'Labor', 'HVAC technician', 11),
  ('Permits', 200.00, 'Permits', 'City/County', 12)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'hvac';

-- General Repair
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  -- Common general repairs
  ('Handyman service (4 hours)', 300.00, 'Labor', 'Handyman', 1),
  ('Drywall patch kit', 50.00, 'Material', 'Hardware store', 2),
  ('Paint and supplies', 100.00, 'Material', 'Paint store', 3),
  ('Basic hardware', 75.00, 'Material', 'Hardware store', 4),
  ('Caulk and sealants', 40.00, 'Material', 'Hardware store', 5),
  ('Door repair materials', 150.00, 'Material', 'Hardware store', 6),
  ('Window repair materials', 200.00, 'Material', 'Hardware store', 7),
  ('Miscellaneous supplies', 100.00, 'Material', 'Various', 8)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'general-repair'; 