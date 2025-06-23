-- Seed data for Drywall industry
-- Industry ID: 3ed3cb26-fdef-46fe-a853-6dbe69c05a45

-- First, add cost codes for Drywall
INSERT INTO cost_codes (id, industry_id, code, name, category, description, organization_id, is_active)
VALUES
  -- Labor rates
  (gen_random_uuid(), '3ed3cb26-fdef-46fe-a853-6dbe69c05a45', 'DW100', 'Drywall Labor', 'labor', 'Drywall installation and finishing labor', NULL, true),
  -- Installation services
  (gen_random_uuid(), '3ed3cb26-fdef-46fe-a853-6dbe69c05a45', 'DW200', 'Drywall Installation', 'service', 'New drywall installation services', NULL, true),
  -- Repair services
  (gen_random_uuid(), '3ed3cb26-fdef-46fe-a853-6dbe69c05a45', 'DW300', 'Drywall Repair', 'service', 'Drywall repair and patching services', NULL, true),
  -- Finishing services
  (gen_random_uuid(), '3ed3cb26-fdef-46fe-a853-6dbe69c05a45', 'DW400', 'Finishing & Texture', 'service', 'Taping, mudding, and texturing services', NULL, true),
  -- Materials
  (gen_random_uuid(), '3ed3cb26-fdef-46fe-a853-6dbe69c05a45', 'DW500', 'Drywall Materials', 'material', 'Drywall sheets and supplies', NULL, true);

-- Get the cost code IDs and insert line items
WITH cost_code_ids AS (
  SELECT id, code FROM cost_codes 
  WHERE industry_id = '3ed3cb26-fdef-46fe-a853-6dbe69c05a45' 
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
  -- DW100 - Drywall Labor
  ('DW100', 'Drywall Installer', 'Professional drywall installer', 55.00, 'hour'),
  ('DW100', 'Drywall Finisher', 'Taping and finishing specialist', 65.00, 'hour'),
  ('DW100', 'Lead Installer', 'Experienced lead installer', 75.00, 'hour'),
  ('DW100', 'Helper/Laborer', 'Assistant for material handling', 35.00, 'hour'),
  ('DW100', 'Texture Specialist', 'Custom texture application', 70.00, 'hour'),
  
  -- DW200 - Drywall Installation
  ('DW200', 'Hang Drywall - Wall', 'Install drywall on walls', 1.25, 'sqft'),
  ('DW200', 'Hang Drywall - Ceiling', 'Install drywall on ceilings', 1.75, 'sqft'),
  ('DW200', 'Hang Drywall - High Ceiling', 'Install above 10 feet', 2.25, 'sqft'),
  ('DW200', 'Moisture Resistant Install', 'Green board installation', 1.50, 'sqft'),
  ('DW200', 'Fire Rated Install', 'Type X fire-rated drywall', 1.65, 'sqft'),
  ('DW200', 'Soundproof Drywall', 'Sound dampening drywall', 2.15, 'sqft'),
  ('DW200', 'Corner Bead Install', 'Metal corner bead installation', 3.50, 'linear ft'),
  ('DW200', 'Arch/Curve Work', 'Curved wall or archway', 85.00, 'linear ft'),
  ('DW200', 'Access Panel Install', 'Install access panel', 125.00, 'each'),
  ('DW200', 'Furring Strip Install', 'Install furring strips', 2.25, 'linear ft'),
  
  -- DW300 - Drywall Repair
  ('DW300', 'Small Hole Patch', 'Patch nail holes and small dents', 65.00, 'each'),
  ('DW300', 'Medium Hole Patch', 'Patch 2-4 inch holes', 125.00, 'each'),
  ('DW300', 'Large Hole Patch', 'Patch 4-8 inch holes', 185.00, 'each'),
  ('DW300', 'Very Large Patch', 'Patch 8-24 inch damage', 285.00, 'each'),
  ('DW300', 'Crack Repair', 'Fix drywall cracks', 8.50, 'linear ft'),
  ('DW300', 'Water Damage Repair', 'Replace water damaged drywall', 12.50, 'sqft'),
  ('DW300', 'Ceiling Repair', 'Patch ceiling damage', 165.00, 'each'),
  ('DW300', 'Corner Repair', 'Fix damaged corners', 95.00, 'each'),
  ('DW300', 'Seam Repair', 'Fix separated seams', 12.00, 'linear ft'),
  ('DW300', 'Texture Match - Small', 'Match existing texture', 125.00, 'each'),
  ('DW300', 'Texture Match - Large', 'Match texture large area', 4.50, 'sqft'),
  
  -- DW400 - Finishing & Texture
  ('DW400', 'Tape & Mud - Standard', 'Standard 3-coat finish', 1.35, 'sqft'),
  ('DW400', 'Tape & Mud - Level 5', 'Premium smooth finish', 1.85, 'sqft'),
  ('DW400', 'Skim Coat', 'Skim coat existing walls', 1.25, 'sqft'),
  ('DW400', 'Orange Peel Texture', 'Apply orange peel texture', 0.85, 'sqft'),
  ('DW400', 'Knockdown Texture', 'Apply knockdown texture', 0.95, 'sqft'),
  ('DW400', 'Skip Trowel Texture', 'Apply skip trowel texture', 1.45, 'sqft'),
  ('DW400', 'Smooth Finish', 'Sand to smooth finish', 0.75, 'sqft'),
  ('DW400', 'Popcorn Texture', 'Apply popcorn ceiling texture', 1.25, 'sqft'),
  ('DW400', 'Venetian Plaster', 'Decorative plaster finish', 4.50, 'sqft'),
  ('DW400', 'Prime Drywall', 'Apply primer coat', 0.65, 'sqft'),
  
  -- DW500 - Drywall Materials
  ('DW500', 'Drywall Sheet 1/2" x 4x8', 'Standard drywall sheet', 12.50, 'sheet'),
  ('DW500', 'Drywall Sheet 5/8" x 4x8', 'Thicker drywall sheet', 14.50, 'sheet'),
  ('DW500', 'Moisture Resistant 4x8', 'Green board sheet', 18.50, 'sheet'),
  ('DW500', 'Fire Rated 5/8" x 4x8', 'Type X fire-rated', 16.50, 'sheet'),
  ('DW500', 'Drywall Sheet 4x12', 'Large format sheet', 18.00, 'sheet'),
  ('DW500', 'Joint Compound', '5 gallon bucket', 15.50, 'bucket'),
  ('DW500', 'Joint Tape', 'Paper tape roll', 4.50, 'roll'),
  ('DW500', 'Mesh Tape', 'Fiberglass mesh tape', 6.50, 'roll'),
  ('DW500', 'Corner Bead', 'Metal corner bead 8ft', 3.25, 'each'),
  ('DW500', 'Vinyl Corner Bead', 'Vinyl corner bead 8ft', 4.50, 'each'),
  ('DW500', 'Drywall Screws 1-1/4"', 'Box of screws', 8.50, 'box'),
  ('DW500', 'Drywall Screws 1-5/8"', 'Box of screws', 9.50, 'box'),
  ('DW500', 'Setting Compound', '25 lb bag fast-set', 12.50, 'bag'),
  ('DW500', 'Texture Spray', 'Spray texture can', 8.50, 'can'),
  ('DW500', 'Sanding Sponge', 'Drywall sanding sponge', 3.50, 'each'),
  ('DW500', 'Drywall Primer', 'Primer sealer gallon', 28.00, 'gallon')
) AS li(code, name, description, price, unit)
JOIN cost_code_ids cc ON cc.code = li.code;