-- Seed data for Concrete industry
-- Industry ID: d92d151c-ff60-4dc6-b753-906151863790

-- First, add cost codes for Concrete
INSERT INTO cost_codes (id, industry_id, code, name, category, description, organization_id, is_active)
VALUES
  -- Labor rates
  (gen_random_uuid(), 'd92d151c-ff60-4dc6-b753-906151863790', 'CN100', 'Concrete Labor', 'labor', 'Concrete work labor rates', NULL, true),
  -- Pour and form work
  (gen_random_uuid(), 'd92d151c-ff60-4dc6-b753-906151863790', 'CN200', 'Concrete Pouring', 'service', 'Concrete pouring and placement', NULL, true),
  -- Finishing work
  (gen_random_uuid(), 'd92d151c-ff60-4dc6-b753-906151863790', 'CN300', 'Concrete Finishing', 'service', 'Concrete finishing and texturing', NULL, true),
  -- Repair work
  (gen_random_uuid(), 'd92d151c-ff60-4dc6-b753-906151863790', 'CN400', 'Concrete Repair', 'service', 'Concrete repair and restoration', NULL, true),
  -- Materials
  (gen_random_uuid(), 'd92d151c-ff60-4dc6-b753-906151863790', 'CN500', 'Concrete Materials', 'material', 'Concrete mix and supplies', NULL, true),
  -- Equipment rental
  (gen_random_uuid(), 'd92d151c-ff60-4dc6-b753-906151863790', 'CN700', 'Equipment Rental', 'equipment', 'Concrete equipment rental', NULL, true);

-- Get the cost code IDs and insert line items
WITH cost_code_ids AS (
  SELECT id, code FROM cost_codes 
  WHERE industry_id = 'd92d151c-ff60-4dc6-b753-906151863790' 
  AND organization_id IS NULL
)
-- Insert line items
INSERT INTO line_items (id, user_id, cost_code_id, name, description, price, unit, is_active)
SELECT 
  gen_random_uuid(),
  '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::uuid, -- System user ID
  cc.id,
  li.name,
  li.description,
  li.price,
  li.unit,
  true
FROM (
  VALUES
  -- CN100 - Concrete Labor
  ('CN100', 'Concrete Laborer', 'General concrete labor', 45.00, 'hour'),
  ('CN100', 'Concrete Finisher', 'Skilled finishing work', 65.00, 'hour'),
  ('CN100', 'Concrete Foreman', 'Lead concrete specialist', 85.00, 'hour'),
  ('CN100', 'Form Setter', 'Forms installation specialist', 60.00, 'hour'),
  ('CN100', 'Pump Operator', 'Concrete pump operator', 75.00, 'hour'),
  
  -- CN200 - Concrete Pouring
  ('CN200', 'Driveway Pour', 'Standard driveway concrete', 4.50, 'sqft'),
  ('CN200', 'Sidewalk Pour', '4 inch sidewalk', 5.00, 'sqft'),
  ('CN200', 'Patio Pour', 'Patio slab 4 inch', 4.75, 'sqft'),
  ('CN200', 'Garage Floor', 'Garage slab with vapor barrier', 5.50, 'sqft'),
  ('CN200', 'Basement Floor', 'Basement slab pour', 6.00, 'sqft'),
  ('CN200', 'Foundation Wall', 'Poured foundation walls', 125.00, 'linear ft'),
  ('CN200', 'Footing Pour', 'Foundation footings', 85.00, 'linear ft'),
  ('CN200', 'Slab on Grade', 'Commercial slab', 4.25, 'sqft'),
  ('CN200', 'Stairs Pour', 'Concrete stairs', 185.00, 'step'),
  ('CN200', 'Retaining Wall', 'Poured retaining wall', 165.00, 'linear ft'),
  ('CN200', 'Curb & Gutter', 'Street curb and gutter', 35.00, 'linear ft'),
  ('CN200', 'Small Pour', 'Under 1 yard pour', 350.00, 'each'),
  ('CN200', 'Pump Truck Setup', 'Concrete pump setup fee', 850.00, 'each'),
  
  -- CN300 - Concrete Finishing
  ('CN300', 'Broom Finish', 'Standard broom texture', 0.75, 'sqft'),
  ('CN300', 'Smooth Trowel', 'Smooth trowel finish', 1.25, 'sqft'),
  ('CN300', 'Stamped Concrete', 'Decorative stamped pattern', 3.50, 'sqft'),
  ('CN300', 'Exposed Aggregate', 'Exposed aggregate finish', 2.25, 'sqft'),
  ('CN300', 'Colored Concrete', 'Integral color added', 1.50, 'sqft'),
  ('CN300', 'Acid Stain', 'Acid stain application', 2.75, 'sqft'),
  ('CN300', 'Concrete Sealer', 'Apply concrete sealer', 0.85, 'sqft'),
  ('CN300', 'Polish Concrete', 'Polished concrete finish', 3.25, 'sqft'),
  ('CN300', 'Epoxy Coating', 'Epoxy floor coating', 4.50, 'sqft'),
  ('CN300', 'Control Joint Cut', 'Saw cut control joints', 2.50, 'linear ft'),
  ('CN300', 'Edge Finishing', 'Hand finish edges', 3.00, 'linear ft'),
  
  -- CN400 - Concrete Repair
  ('CN400', 'Crack Repair - Small', 'Hairline crack repair', 8.50, 'linear ft'),
  ('CN400', 'Crack Repair - Large', 'Major crack repair', 18.50, 'linear ft'),
  ('CN400', 'Spall Repair', 'Surface spalling repair', 65.00, 'sqft'),
  ('CN400', 'Concrete Patch', 'Patch damaged area', 85.00, 'sqft'),
  ('CN400', 'Slab Jacking', 'Lift sunken concrete', 12.50, 'sqft'),
  ('CN400', 'Resurface Concrete', 'Overlay existing concrete', 4.50, 'sqft'),
  ('CN400', 'Joint Repair', 'Expansion joint repair', 12.00, 'linear ft'),
  ('CN400', 'Scaling Repair', 'Fix surface scaling', 45.00, 'sqft'),
  ('CN400', 'Trip Hazard Grinding', 'Grind trip hazards', 125.00, 'each'),
  ('CN400', 'Concrete Removal', 'Demo and haul away', 8.50, 'sqft'),
  
  -- CN500 - Concrete Materials
  ('CN500', 'Concrete 3000 PSI', 'Standard concrete mix', 145.00, 'cubic yard'),
  ('CN500', 'Concrete 4000 PSI', 'High strength mix', 155.00, 'cubic yard'),
  ('CN500', 'Concrete 5000 PSI', 'Extra high strength', 165.00, 'cubic yard'),
  ('CN500', 'Fiber Mesh Additive', 'Fiber reinforcement', 8.50, 'bag'),
  ('CN500', 'Rebar #3', '3/8 inch rebar', 0.85, 'linear ft'),
  ('CN500', 'Rebar #4', '1/2 inch rebar', 1.25, 'linear ft'),
  ('CN500', 'Rebar #5', '5/8 inch rebar', 1.85, 'linear ft'),
  ('CN500', 'Wire Mesh', '6x6 W2.9xW2.9', 0.35, 'sqft'),
  ('CN500', 'Expansion Joint', 'Expansion joint material', 3.50, 'linear ft'),
  ('CN500', 'Concrete Forms', '2x12 form boards', 4.50, 'linear ft'),
  ('CN500', 'Form Oil', 'Form release agent', 28.00, 'gallon'),
  ('CN500', 'Concrete Bags 60lb', 'Bagged concrete', 6.50, 'bag'),
  ('CN500', 'Concrete Bags 80lb', 'Bagged concrete', 8.50, 'bag'),
  ('CN500', 'Cure & Seal', 'Curing compound', 32.00, 'gallon'),
  ('CN500', 'Concrete Color', 'Integral color pigment', 24.00, 'bag'),
  
  -- CN700 - Equipment Rental
  ('CN700', 'Concrete Mixer', 'Portable mixer rental', 125.00, 'day'),
  ('CN700', 'Power Trowel', '36 inch power trowel', 185.00, 'day'),
  ('CN700', 'Concrete Saw', 'Walk-behind saw', 225.00, 'day'),
  ('CN700', 'Plate Compactor', 'Subgrade compactor', 145.00, 'day'),
  ('CN700', 'Concrete Vibrator', 'Concrete vibrator', 85.00, 'day'),
  ('CN700', 'Bull Float', 'Magnesium bull float', 45.00, 'day'),
  ('CN700', 'Concrete Pump', 'Trailer pump rental', 1850.00, 'day'),
  ('CN700', 'Form Stakes', 'Metal form stakes', 0.50, 'each'),
  ('CN700', 'Wheelbarrow', 'Concrete wheelbarrow', 25.00, 'day')
) AS li(code, name, description, price, unit)
JOIN cost_code_ids cc ON cc.code = li.code;