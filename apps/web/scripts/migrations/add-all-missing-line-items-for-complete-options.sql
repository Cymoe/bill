-- Add All Missing Line Items for Complete Service Options
-- This migration ensures all line items referenced in our comprehensive service options exist

-- Function to get system user ID
CREATE OR REPLACE FUNCTION get_system_user_id() RETURNS UUID AS $$
BEGIN
  RETURN '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- PAINTING LINE ITEMS
-- =====================================================================

INSERT INTO line_items (name, unit, price, category, cost_code_id, user_id, organization_id, created_at, updated_at)
SELECT 
  v.name,
  v.unit,
  v.price,
  v.category,
  cc.id,
  get_system_user_id(),
  NULL,
  NOW(),
  NOW()
FROM (VALUES
  -- Painting Labor
  ('Painter - Standard', 'hour', 55.00, 'labor', 'PT100'),
  ('Painter - Premium', 'hour', 75.00, 'labor', 'PT100'),
  ('Painter Helper', 'hour', 35.00, 'labor', 'PT100'),
  ('Surface Prep Labor', 'hour', 45.00, 'labor', 'PT100'),
  
  -- Paint & Primers
  ('Primer - Interior', 'gallon', 25.00, 'material', 'PT500'),
  ('Interior Paint - Standard', 'gallon', 35.00, 'material', 'PT500'),
  ('Interior Paint - Premium', 'gallon', 65.00, 'material', 'PT500'),
  ('Interior Paint - Zero VOC', 'gallon', 75.00, 'material', 'PT500'),
  ('Exterior Primer', 'gallon', 30.00, 'material', 'PT500'),
  ('Exterior Paint - Premium', 'gallon', 55.00, 'material', 'PT500'),
  
  -- Prep Materials
  ('Spackling Compound', 'quart', 12.00, 'material', 'PT500'),
  ('Sandpaper', 'pack', 8.00, 'material', 'PT500'),
  ('Caulk', 'tube', 5.00, 'material', 'PT500'),
  ('Exterior Caulk', 'tube', 8.00, 'material', 'PT500'),
  ('Painters Tape', 'roll', 6.00, 'material', 'PT500'),
  ('Drop Cloth', 'each', 15.00, 'material', 'PT500'),
  ('Plastic Sheeting', 'roll', 25.00, 'material', 'PT500'),
  ('Masking Film', 'roll', 45.00, 'material', 'PT500'),
  
  -- Application Tools
  ('Roller Cover - 3/8" nap', 'each', 6.00, 'material', 'PT500'),
  ('Roller Cover - 3/4" nap', 'each', 8.00, 'material', 'PT500'),
  ('Paintbrush - 2.5"', 'each', 12.00, 'material', 'PT500'),
  ('Paintbrush - 4"', 'each', 18.00, 'material', 'PT500'),
  ('Paint Tray', 'each', 5.00, 'material', 'PT500'),
  ('Paint Tray Liner', 'pack', 8.00, 'material', 'PT500'),
  ('Extension Pole', 'each', 25.00, 'material', 'PT500'),
  
  -- Cleanup Supplies
  ('Tack Cloth', 'each', 2.00, 'material', 'PT500'),
  ('Cotton Rags', 'bag', 15.00, 'material', 'PT500'),
  ('Paint Thinner', 'gallon', 18.00, 'material', 'PT500'),
  ('Mineral Spirits', 'gallon', 20.00, 'material', 'PT500'),
  ('Soap', 'bottle', 5.00, 'material', 'PT500'),
  
  -- Equipment
  ('Pressure Washer Rental', 'day', 85.00, 'equipment', 'PT600'),
  ('Spray Equipment Rental', 'day', 125.00, 'equipment', 'PT600'),
  ('Extension Ladder Rental', 'day', 45.00, 'equipment', 'PT600'),
  ('Scraper Blades', 'pack', 12.00, 'material', 'PT500'),
  
  -- Safety & Testing
  ('Safety Harness', 'each', 125.00, 'equipment', 'PT600'),
  ('Painting Permit', 'each', 150.00, 'service', 'PT001'),
  ('Lead Paint Test Kit', 'each', 25.00, 'material', 'PT500')
) AS v(name, unit, price, category, code)
JOIN cost_codes cc ON cc.code = v.code AND cc.organization_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM line_items li 
  WHERE li.name = v.name 
  AND li.organization_id IS NULL
);

-- =====================================================================
-- CARPENTRY LINE ITEMS
-- =====================================================================

INSERT INTO line_items (name, unit, price, category, cost_code_id, user_id, organization_id, created_at, updated_at)
SELECT 
  v.name,
  v.unit,
  v.price,
  v.category,
  cc.id,
  get_system_user_id(),
  NULL,
  NOW(),
  NOW()
FROM (VALUES
  -- Carpentry Labor
  ('Master Carpenter', 'hour', 85.00, 'labor', 'CP100'),
  ('Finish Carpenter', 'hour', 65.00, 'labor', 'CP100'),
  ('Apprentice Carpenter', 'hour', 40.00, 'labor', 'CP100'),
  ('Cabinet Installer', 'hour', 65.00, 'labor', 'CP100'),
  
  -- Molding & Trim
  ('Crown Molding - Standard', 'linear_foot', 6.50, 'material', 'CP500'),
  ('Crown Molding - Premium', 'linear_foot', 12.50, 'material', 'CP500'),
  ('Corner Blocks', 'each', 15.00, 'material', 'CP500'),
  ('Quarter Round', 'linear_foot', 2.50, 'material', 'CP500'),
  ('Shoe Molding', 'linear_foot', 3.00, 'material', 'CP500'),
  
  -- Wood Materials
  ('Plywood - Cabinet Grade', 'sheet', 65.00, 'material', 'CP500'),
  ('Hardwood - Oak', 'board_foot', 8.50, 'material', 'CP500'),
  ('Wood Edge Banding', 'linear_foot', 2.00, 'material', 'CP500'),
  
  -- Fasteners
  ('Finish Nails', 'box', 12.00, 'material', 'CP500'),
  ('Wood Screws - Cabinet', 'box', 15.00, 'material', 'CP500'),
  ('Pocket Screws', 'box', 18.00, 'material', 'CP500'),
  ('Construction Adhesive', 'tube', 5.00, 'material', 'CP500'),
  ('Wood Glue', 'quart', 12.00, 'material', 'CP500'),
  
  -- Finishing Supplies
  ('Wood Filler', 'each', 8.00, 'material', 'CP500'),
  ('Wood Stain', 'quart', 18.00, 'material', 'CP500'),
  ('Polyurethane Finish', 'quart', 25.00, 'material', 'CP500'),
  ('Sandpaper - Fine', 'pack', 10.00, 'material', 'CP500'),
  ('Steel Wool', 'pack', 8.00, 'material', 'CP500'),
  ('Touch-up Paint', 'bottle', 15.00, 'material', 'CP500'),
  
  -- Hardware
  ('Shelf Pins', 'pack', 8.00, 'material', 'CP500'),
  ('Soft Close Hinges', 'pair', 25.00, 'material', 'CP500'),
  ('LED Strip Lighting', 'foot', 8.00, 'material', 'CP500'),
  
  -- Tools
  ('Miter Saw Blade', 'each', 65.00, 'material', 'CP600'),
  ('Router Bits', 'set', 45.00, 'material', 'CP600'),
  ('Saw Blades', 'each', 35.00, 'material', 'CP600'),
  ('Safety Glasses', 'pair', 15.00, 'material', 'CP600'),
  ('Dust Mask', 'each', 2.50, 'material', 'CP600'),
  ('Pencils', 'pack', 5.00, 'material', 'CP600')
) AS v(name, unit, price, category, code)
JOIN cost_codes cc ON cc.code = v.code AND cc.organization_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM line_items li 
  WHERE li.name = v.name 
  AND li.organization_id IS NULL
);

-- =====================================================================
-- DRYWALL LINE ITEMS
-- =====================================================================

-- First ensure we have drywall cost codes
INSERT INTO cost_codes (code, name, category, industry_id, organization_id, created_at, updated_at)
SELECT 'DW100', 'Drywall Labor', 'labor', 
  (SELECT id FROM industries WHERE name = 'Drywall'),
  NULL, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes WHERE code = 'DW100' AND organization_id IS NULL
);

INSERT INTO cost_codes (code, name, category, industry_id, organization_id, created_at, updated_at)
SELECT 'DW500', 'Drywall Materials', 'material', 
  (SELECT id FROM industries WHERE name = 'Drywall'),
  NULL, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes WHERE code = 'DW500' AND organization_id IS NULL
);

INSERT INTO cost_codes (code, name, category, industry_id, organization_id, created_at, updated_at)
SELECT 'DW600', 'Drywall Equipment', 'equipment', 
  (SELECT id FROM industries WHERE name = 'Drywall'),
  NULL, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes WHERE code = 'DW600' AND organization_id IS NULL
);

INSERT INTO line_items (name, unit, price, category, cost_code_id, user_id, organization_id, created_at, updated_at)
SELECT 
  v.name,
  v.unit,
  v.price,
  v.category,
  cc.id,
  get_system_user_id(),
  NULL,
  NOW(),
  NOW()
FROM (VALUES
  -- Drywall Labor
  ('Drywall Hanger', 'hour', 55.00, 'labor', 'DW100'),
  ('Drywall Finisher', 'hour', 65.00, 'labor', 'DW100'),
  ('Texture Specialist', 'hour', 70.00, 'labor', 'DW100'),
  
  -- Drywall Sheets
  ('1/2" Drywall 4x8', 'sheet', 12.00, 'material', 'DW500'),
  ('5/8" Drywall 4x8', 'sheet', 14.00, 'material', 'DW500'),
  ('Moisture Resistant Drywall', 'sheet', 18.00, 'material', 'DW500'),
  ('1/2" Drywall 4x12', 'sheet', 16.00, 'material', 'DW500'),
  
  -- Compounds & Tapes
  ('Joint Compound', 'bucket', 15.00, 'material', 'DW500'),
  ('Mesh Tape', 'roll', 8.00, 'material', 'DW500'),
  ('Paper Tape', 'roll', 6.00, 'material', 'DW500'),
  ('Corner Bead', 'each', 4.00, 'material', 'DW500'),
  ('Adhesive', 'tube', 6.00, 'material', 'DW500'),
  
  -- Fasteners
  ('Drywall Screws 1-1/4"', 'box', 25.00, 'material', 'DW500'),
  ('Drywall Screws 1-5/8"', 'box', 28.00, 'material', 'DW500'),
  
  -- Texture Materials
  ('Texture Material', 'bag', 12.00, 'material', 'DW500'),
  ('Primer - Drywall', 'gallon', 22.00, 'material', 'DW500'),
  
  -- Sanding
  ('Sanding Sponges', 'pack', 12.00, 'material', 'DW500'),
  ('Drywall Sandpaper', 'pack', 15.00, 'material', 'DW500'),
  
  -- Equipment
  ('Drywall Lift Rental', 'day', 45.00, 'equipment', 'DW600'),
  ('Texture Sprayer Rental', 'day', 65.00, 'equipment', 'DW600'),
  ('Stilts Rental', 'day', 35.00, 'equipment', 'DW600'),
  
  -- Protection
  ('Drop Cloths', 'each', 20.00, 'material', 'DW500'),
  ('Plastic Sheeting - Heavy', 'roll', 35.00, 'material', 'DW500')
) AS v(name, unit, price, category, code)
JOIN cost_codes cc ON cc.code = v.code AND cc.organization_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM line_items li 
  WHERE li.name = v.name 
  AND li.organization_id IS NULL
);

-- =====================================================================
-- FLOORING LINE ITEMS
-- =====================================================================

INSERT INTO line_items (name, unit, price, category, cost_code_id, user_id, organization_id, created_at, updated_at)
SELECT 
  v.name,
  v.unit,
  v.price,
  v.category,
  cc.id,
  get_system_user_id(),
  NULL,
  NOW(),
  NOW()
FROM (VALUES
  -- Flooring Labor
  ('Flooring Installer - Lead', 'hour', 65.00, 'labor', 'FL100'),
  ('Flooring Installer - Helper', 'hour', 40.00, 'labor', 'FL100'),
  
  -- Hardwood Materials
  ('Hardwood Flooring - Oak', 'sqft', 4.50, 'material', 'FL500'),
  ('Hardwood Flooring - Maple', 'sqft', 5.50, 'material', 'FL500'),
  ('Hardwood Flooring - Bamboo', 'sqft', 3.50, 'material', 'FL500'),
  
  -- Underlayment & Barriers
  ('Underlayment - Standard', 'sqft', 0.50, 'material', 'FL500'),
  ('Underlayment - Premium', 'sqft', 0.75, 'material', 'FL500'),
  ('Moisture Barrier', 'sqft', 0.25, 'material', 'FL500'),
  
  -- Fasteners & Adhesives
  ('Flooring Nails', 'box', 35.00, 'material', 'FL500'),
  ('Flooring Adhesive', 'gallon', 45.00, 'material', 'FL500'),
  
  -- Transitions & Trim
  ('Transition Strips', 'each', 25.00, 'material', 'FL500'),
  ('Reducers', 'each', 28.00, 'material', 'FL500'),
  ('T-Molding', 'linear_foot', 5.00, 'material', 'FL500'),
  
  -- Prep Materials
  ('Floor Leveling Compound', 'bag', 28.00, 'material', 'FL500'),
  ('Floor Patch', 'gallon', 35.00, 'material', 'FL500'),
  
  -- Protection
  ('Floor Protection Paper', 'roll', 45.00, 'material', 'FL500'),
  
  -- Equipment
  ('Floor Nailer Rental', 'day', 85.00, 'equipment', 'FL600'),
  ('Miter Saw Rental', 'day', 65.00, 'equipment', 'FL600'),
  ('Floor Sander Rental', 'day', 125.00, 'equipment', 'FL600'),
  
  -- Safety
  ('Knee Pads', 'pair', 25.00, 'material', 'FL500'),
  
  -- Finishing
  ('Hardwood Floor Stain', 'gallon', 45.00, 'material', 'FL500'),
  ('Polyurethane Floor Finish', 'gallon', 55.00, 'material', 'FL500')
) AS v(name, unit, price, category, code)
JOIN cost_codes cc ON cc.code = v.code AND cc.organization_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM line_items li 
  WHERE li.name = v.name 
  AND li.organization_id IS NULL
);

-- =====================================================================
-- PLUMBING LINE ITEMS
-- =====================================================================

-- Ensure PL500 exists
INSERT INTO cost_codes (code, name, category, industry_id, organization_id, created_at, updated_at)
SELECT 'PL500', 'Plumbing Materials', 'material', 
  (SELECT id FROM industries WHERE name = 'Plumbing'),
  NULL, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes WHERE code = 'PL500' AND organization_id IS NULL
);

INSERT INTO cost_codes (code, name, category, industry_id, organization_id, created_at, updated_at)
SELECT 'PL100', 'Plumbing Labor', 'labor', 
  (SELECT id FROM industries WHERE name = 'Plumbing'),
  NULL, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes WHERE code = 'PL100' AND organization_id IS NULL
);

INSERT INTO line_items (name, unit, price, category, cost_code_id, user_id, organization_id, created_at, updated_at)
SELECT 
  v.name,
  v.unit,
  v.price,
  v.category,
  cc.id,
  get_system_user_id(),
  NULL,
  NOW(),
  NOW()
FROM (VALUES
  -- Plumbing Labor
  ('Master Plumber', 'hour', 125.00, 'labor', 'PL100'),
  ('Journeyman Plumber', 'hour', 85.00, 'labor', 'PL100'),
  ('Apprentice Plumber', 'hour', 55.00, 'labor', 'PL100'),
  
  -- Fixtures
  ('Bathroom Sink - Standard', 'each', 125.00, 'material', 'PL500'),
  ('Bathroom Sink - Designer', 'each', 350.00, 'material', 'PL500'),
  ('Bathroom Faucet', 'each', 150.00, 'material', 'PL500'),
  ('Bathroom Faucet - Premium', 'each', 450.00, 'material', 'PL500'),
  ('Pop-up Drain Assembly', 'each', 35.00, 'material', 'PL500'),
  
  -- Pipes & Fittings
  ('P-Trap 1-1/2"', 'each', 12.00, 'material', 'PL500'),
  ('P-Trap 2"', 'each', 15.00, 'material', 'PL500'),
  ('Supply Line - Braided', 'each', 12.00, 'material', 'PL500'),
  ('Shut-off Valve', 'each', 25.00, 'material', 'PL500'),
  ('Drain Extension', 'each', 8.00, 'material', 'PL500'),
  
  -- Sealing Materials
  ('Plumbers Putty', 'container', 6.00, 'material', 'PL500'),
  ('Teflon Tape', 'roll', 3.00, 'material', 'PL500'),
  ('Pipe Thread Compound', 'bottle', 8.00, 'material', 'PL500'),
  ('Silicone Sealant', 'tube', 8.00, 'material', 'PL500'),
  
  -- Hardware
  ('Mounting Hardware', 'set', 15.00, 'material', 'PL500'),
  ('Pipe Straps', 'pack', 8.00, 'material', 'PL500'),
  
  -- Tools
  ('Pipe Wrench Rental', 'day', 15.00, 'equipment', 'PL001'),
  ('Basin Wrench Rental', 'day', 12.00, 'equipment', 'PL001'),
  
  -- Testing & Safety
  ('Leak Detection Dye', 'bottle', 12.00, 'material', 'PL500'),
  
  -- Permits & Services
  ('Plumbing Permit', 'each', 150.00, 'service', 'PL001'),
  ('Old Fixture Removal', 'each', 75.00, 'service', 'PL001')
) AS v(name, unit, price, category, code)
JOIN cost_codes cc ON cc.code = v.code AND cc.organization_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM line_items li 
  WHERE li.name = v.name 
  AND li.organization_id IS NULL
);

-- =====================================================================
-- CONCRETE LINE ITEMS
-- =====================================================================

-- First ensure concrete cost codes exist
INSERT INTO cost_codes (code, name, category, industry_id, organization_id, created_at, updated_at)
SELECT 'CO100', 'Concrete Labor', 'labor', 
  (SELECT id FROM industries WHERE name = 'Concrete'),
  NULL, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes WHERE code = 'CO100' AND organization_id IS NULL
);

INSERT INTO cost_codes (code, name, category, industry_id, organization_id, created_at, updated_at)
SELECT 'CO600', 'Concrete Equipment', 'equipment', 
  (SELECT id FROM industries WHERE name = 'Concrete'),
  NULL, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes WHERE code = 'CO600' AND organization_id IS NULL
);

INSERT INTO line_items (name, unit, price, category, cost_code_id, user_id, organization_id, created_at, updated_at)
SELECT 
  v.name,
  v.unit,
  v.price,
  v.category,
  cc.id,
  get_system_user_id(),
  NULL,
  NOW(),
  NOW()
FROM (VALUES
  -- Concrete Labor
  ('Concrete Finisher - Lead', 'hour', 75.00, 'labor', 'CO100'),
  ('Concrete Worker', 'hour', 45.00, 'labor', 'CO100'),
  ('Equipment Operator', 'hour', 85.00, 'labor', 'CO100'),
  
  -- Concrete & Base
  ('Concrete - 3500 PSI', 'cubic_yard', 125.00, 'material', 'CO500'),
  ('Concrete - 4000 PSI', 'cubic_yard', 135.00, 'material', 'CO500'),
  ('Gravel Base', 'ton', 25.00, 'material', 'CO500'),
  ('Sand Bedding', 'ton', 20.00, 'material', 'CO500'),
  
  -- Reinforcement
  ('Rebar #4', 'linear_foot', 0.75, 'material', 'CO500'),
  ('Rebar #5', 'linear_foot', 1.10, 'material', 'CO500'),
  ('Wire Mesh', 'sqft', 0.35, 'material', 'CO500'),
  ('Rebar Chairs', 'each', 0.50, 'material', 'CO500'),
  
  -- Forming
  ('2x4 Form Lumber', 'linear_foot', 2.50, 'material', 'CO500'),
  ('Form Stakes', 'each', 3.00, 'material', 'CO500'),
  ('Form Oil', 'gallon', 12.00, 'material', 'CO500'),
  
  -- Finishing
  ('Concrete Sealer', 'gallon', 25.00, 'material', 'CO500'),
  ('Curing Compound', 'gallon', 18.00, 'material', 'CO500'),
  ('Expansion Joint', 'linear_foot', 3.50, 'material', 'CO500'),
  ('Colored Concrete', 'bag', 8.00, 'material', 'CO500'),
  ('Stamped Pattern', 'sqft', 2.50, 'material', 'CO500'),
  
  -- Equipment
  ('Concrete Pump Rental', 'hour', 250.00, 'equipment', 'CO600'),
  ('Power Trowel Rental', 'day', 125.00, 'equipment', 'CO600'),
  ('Vibrator Rental', 'day', 85.00, 'equipment', 'CO600'),
  ('Concrete Saw Rental', 'day', 95.00, 'equipment', 'CO600'),
  
  -- Permits & Services
  ('Concrete Permit', 'each', 200.00, 'service', 'CO001'),
  ('Excavation & Disposal', 'cubic_yard', 45.00, 'service', 'CO001')
) AS v(name, unit, price, category, code)
JOIN cost_codes cc ON cc.code = v.code AND cc.organization_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM line_items li 
  WHERE li.name = v.name 
  AND li.organization_id IS NULL
);

-- =====================================================================
-- GENERAL/SHARED LINE ITEMS
-- =====================================================================

INSERT INTO line_items (name, unit, price, category, cost_code_id, user_id, organization_id, created_at, updated_at)
SELECT 
  v.name,
  v.unit,
  v.price,
  v.category,
  cc.id,
  get_system_user_id(),
  NULL,
  NOW(),
  NOW()
FROM (VALUES
  -- General Labor
  ('Helper/Laborer', 'hour', 30.00, 'labor', 'GC100'),
  ('Cleanup Crew', 'hour', 25.00, 'labor', 'GC100'),
  ('Demolition Labor', 'hour', 45.00, 'labor', 'GC100'),
  
  -- Cleanup & Disposal
  ('Debris Removal', 'load', 150.00, 'service', 'GC001'),
  ('Dumpster Rental', 'week', 450.00, 'service', 'GC001'),
  ('Cleanup Service', 'hour', 35.00, 'service', 'GC001'),
  ('Final Cleanup', 'hour', 30.00, 'service', 'GC001'),
  ('Hazardous Waste Disposal', 'fee', 50.00, 'service', 'GC001'),
  
  -- Equipment Rental
  ('Shop Vacuum Rental', 'day', 35.00, 'equipment', 'GC700'),
  ('Generator Rental', 'day', 65.00, 'equipment', 'GC700'),
  ('Scaffolding Rental', 'day', 125.00, 'equipment', 'GC700')
) AS v(name, unit, price, category, code)
JOIN cost_codes cc ON cc.code = v.code AND cc.organization_id IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM line_items li 
  WHERE li.name = v.name 
  AND li.organization_id IS NULL
);

-- Verify our work
SELECT 
  i.name as industry,
  cc.category,
  COUNT(li.id) as item_count
FROM line_items li
JOIN cost_codes cc ON li.cost_code_id = cc.id
JOIN industries i ON cc.industry_id = i.id
WHERE li.organization_id IS NULL
GROUP BY i.name, cc.category
ORDER BY i.name, cc.category;