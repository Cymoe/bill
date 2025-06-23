-- Specialty Trades Batch 1 Cost Codes Migration
-- Includes: Carpentry, Drywall, Tiling, Concrete, Masonry

-- CARPENTRY COST CODES (CP prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'carpentry'),
  NULL
FROM (VALUES
  -- Carpentry Service Calls (CP001-CP050)
  ('CP001', 'Consultation', 'Project consultation', 'service', 'hour', 85.00),
  ('CP002', 'Estimate', 'Detailed estimate', 'service', 'ls', 125.00),
  ('CP003', 'Emergency Service', 'Emergency repair', 'service', 'hour', 125.00),
  ('CP004', 'Design Service', 'Custom design work', 'service', 'hour', 95.00),
  
  -- Carpentry Labor (CP100-CP150)
  ('CP100', 'Master Carpenter', 'Master carpenter rate', 'labor', 'hour', 85.00),
  ('CP101', 'Finish Carpenter', 'Finish carpenter rate', 'labor', 'hour', 75.00),
  ('CP102', 'Framing Carpenter', 'Framing carpenter rate', 'labor', 'hour', 65.00),
  ('CP103', 'Helper', 'Carpenter helper rate', 'labor', 'hour', 45.00),
  
  -- Framing Work (CP200-CP250)
  ('CP200', 'Wall Framing', 'Interior wall framing', 'labor', 'sf', 4.50),
  ('CP201', 'Floor Framing', 'Floor joist installation', 'labor', 'sf', 5.50),
  ('CP202', 'Roof Framing', 'Roof framing work', 'labor', 'sf', 6.50),
  ('CP203', 'Stair Framing', 'Stair structure framing', 'labor', 'flight', 850.00),
  ('CP204', 'Deck Framing', 'Deck structure framing', 'labor', 'sf', 8.50),
  
  -- Finish Carpentry (CP300-CP350)
  ('CP300', 'Baseboard Install', 'Baseboard installation', 'labor', 'lf', 4.50),
  ('CP301', 'Crown Molding', 'Crown molding install', 'labor', 'lf', 6.50),
  ('CP302', 'Chair Rail', 'Chair rail installation', 'labor', 'lf', 5.50),
  ('CP303', 'Window Casing', 'Window trim install', 'labor', 'window', 125.00),
  ('CP304', 'Door Casing', 'Door trim installation', 'labor', 'door', 95.00),
  ('CP305', 'Wainscoting', 'Wainscoting installation', 'labor', 'sf', 12.00),
  ('CP306', 'Built-in Shelving', 'Custom shelf building', 'labor', 'lf', 85.00),
  ('CP307', 'Closet System', 'Closet organizer install', 'labor', 'lf', 65.00),
  ('CP308', 'Stair Railings', 'Railing installation', 'labor', 'lf', 45.00),
  ('CP309', 'Mantel Install', 'Fireplace mantel', 'labor', 'ea', 485.00),
  
  -- Custom Millwork (CP400-CP450)
  ('CP400', 'Custom Cabinets', 'Built-in cabinet work', 'labor', 'lf', 285.00),
  ('CP401', 'Entertainment Center', 'Built-in media center', 'labor', 'lf', 385.00),
  ('CP402', 'Window Seat', 'Custom window seat', 'labor', 'lf', 425.00),
  ('CP403', 'Bookcase', 'Built-in bookcase', 'labor', 'lf', 325.00),
  ('CP404', 'Room Divider', 'Custom room divider', 'labor', 'lf', 285.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- DRYWALL COST CODES (DW prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'drywall'),
  NULL
FROM (VALUES
  -- Drywall Service (DW001-DW050)
  ('DW001', 'Estimate', 'Project estimate', 'service', 'ls', 125.00),
  ('DW002', 'Small Patch', 'Hole repair service', 'service', 'ea', 125.00),
  ('DW003', 'Water Damage', 'Water damage assessment', 'service', 'ls', 285.00),
  
  -- Drywall Labor (DW100-DW150)
  ('DW100', 'Lead Installer', 'Lead drywall mechanic', 'labor', 'hour', 75.00),
  ('DW101', 'Hanger', 'Drywall hanger rate', 'labor', 'hour', 65.00),
  ('DW102', 'Finisher', 'Taping and finishing', 'labor', 'hour', 70.00),
  ('DW103', 'Helper', 'Drywall helper', 'labor', 'hour', 45.00),
  
  -- Installation (DW200-DW250)
  ('DW200', 'Hang Drywall - Walls', 'Wall drywall hanging', 'labor', 'sf', 1.85),
  ('DW201', 'Hang Drywall - Ceiling', 'Ceiling drywall hanging', 'labor', 'sf', 2.25),
  ('DW202', 'Finish Level 0', 'No finishing', 'labor', 'sf', 0.00),
  ('DW203', 'Finish Level 1', 'Fire taping only', 'labor', 'sf', 0.65),
  ('DW204', 'Finish Level 2', 'Standard taping', 'labor', 'sf', 1.25),
  ('DW205', 'Finish Level 3', 'Textured walls', 'labor', 'sf', 1.65),
  ('DW206', 'Finish Level 4', 'Light texture/flat paint', 'labor', 'sf', 1.85),
  ('DW207', 'Finish Level 5', 'Smooth wall finish', 'labor', 'sf', 2.25),
  
  -- Materials (DW300-DW350)
  ('DW300', 'Drywall 1/2"', 'Standard drywall sheet', 'material', 'sheet', 12.00),
  ('DW301', 'Drywall 5/8"', 'Fire-rated drywall', 'material', 'sheet', 14.00),
  ('DW302', 'Moisture Resistant', 'Green board drywall', 'material', 'sheet', 16.00),
  ('DW303', 'Cement Board', 'Cement backer board', 'material', 'sheet', 18.00),
  ('DW304', 'Joint Compound', 'Drywall mud', 'material', 'box', 15.00),
  ('DW305', 'Tape', 'Paper/mesh tape', 'material', 'roll', 8.00),
  
  -- Textures (DW400-DW450)
  ('DW400', 'Orange Peel', 'Orange peel texture', 'labor', 'sf', 0.85),
  ('DW401', 'Knockdown', 'Knockdown texture', 'labor', 'sf', 0.95),
  ('DW402', 'Skip Trowel', 'Skip trowel texture', 'labor', 'sf', 1.25),
  ('DW403', 'Popcorn', 'Popcorn ceiling texture', 'labor', 'sf', 1.15),
  ('DW404', 'Texture Removal', 'Remove existing texture', 'labor', 'sf', 2.85)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- TILING COST CODES (TL prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'tiling'),
  NULL
FROM (VALUES
  -- Tiling Service (TL001-TL050)
  ('TL001', 'Design Consultation', 'Tile design service', 'service', 'hour', 95.00),
  ('TL002', 'Layout Planning', 'Tile layout design', 'service', 'room', 185.00),
  ('TL003', 'Sample Installation', 'Sample tile installation', 'service', 'ea', 85.00),
  
  -- Tiling Labor (TL100-TL150)
  ('TL100', 'Master Tiler', 'Master tile installer', 'labor', 'hour', 85.00),
  ('TL101', 'Tile Installer', 'Tile mechanic rate', 'labor', 'hour', 65.00),
  ('TL102', 'Helper', 'Tile helper rate', 'labor', 'hour', 45.00),
  
  -- Floor Tile Installation (TL200-TL250)
  ('TL200', 'Floor Tile - Basic', 'Standard floor tile install', 'labor', 'sf', 5.50),
  ('TL201', 'Floor Tile - Diagonal', 'Diagonal pattern install', 'labor', 'sf', 7.50),
  ('TL202', 'Floor Tile - Pattern', 'Complex pattern install', 'labor', 'sf', 12.00),
  ('TL203', 'Large Format Tile', 'Tiles over 15"', 'labor', 'sf', 8.50),
  ('TL204', 'Mosaic Tile', 'Mosaic floor installation', 'labor', 'sf', 15.00),
  
  -- Wall Tile Installation (TL300-TL350)
  ('TL300', 'Wall Tile - Basic', 'Standard wall tile', 'labor', 'sf', 6.50),
  ('TL301', 'Shower Walls', 'Shower tile installation', 'labor', 'sf', 8.50),
  ('TL302', 'Backsplash', 'Kitchen backsplash', 'labor', 'sf', 12.00),
  ('TL303', 'Accent Strip', 'Decorative accent band', 'labor', 'lf', 25.00),
  ('TL304', 'Niche Installation', 'Shower niche tiling', 'labor', 'ea', 285.00),
  
  -- Specialty Work (TL400-TL450)
  ('TL400', 'Waterproofing', 'Shower waterproofing', 'labor', 'sf', 3.50),
  ('TL401', 'Heated Floor Prep', 'Radiant heat installation', 'labor', 'sf', 4.50),
  ('TL402', 'Tile Repair', 'Tile replacement/repair', 'labor', 'ea', 125.00),
  ('TL403', 'Grout Repair', 'Regrout existing tile', 'labor', 'sf', 8.50),
  ('TL404', 'Tile Removal', 'Remove existing tile', 'labor', 'sf', 4.50)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- CONCRETE COST CODES (CN prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'concrete'),
  NULL
FROM (VALUES
  -- Concrete Service (CN001-CN050)
  ('CN001', 'Estimate', 'Project estimate', 'service', 'ls', 185.00),
  ('CN002', 'Concrete Testing', 'Strength testing', 'service', 'test', 285.00),
  ('CN003', 'Site Survey', 'Grade and layout survey', 'service', 'ls', 485.00),
  
  -- Concrete Labor (CN100-CN150)
  ('CN100', 'Foreman', 'Concrete foreman', 'labor', 'hour', 85.00),
  ('CN101', 'Finisher', 'Concrete finisher', 'labor', 'hour', 65.00),
  ('CN102', 'Laborer', 'Concrete laborer', 'labor', 'hour', 45.00),
  ('CN103', 'Operator', 'Equipment operator', 'labor', 'hour', 75.00),
  
  -- Flatwork (CN200-CN250)
  ('CN200', 'Driveway', 'Concrete driveway', 'material', 'sf', 8.50),
  ('CN201', 'Sidewalk', 'Concrete sidewalk', 'material', 'sf', 6.50),
  ('CN202', 'Patio', 'Concrete patio', 'material', 'sf', 7.50),
  ('CN203', 'Garage Floor', 'Garage slab', 'material', 'sf', 6.50),
  ('CN204', 'Basement Floor', 'Basement slab', 'material', 'sf', 5.50),
  
  -- Decorative Concrete (CN300-CN350)
  ('CN300', 'Stamped Concrete', 'Stamped pattern concrete', 'labor', 'sf', 12.00),
  ('CN301', 'Stained Concrete', 'Acid stain application', 'labor', 'sf', 8.50),
  ('CN302', 'Exposed Aggregate', 'Exposed aggregate finish', 'labor', 'sf', 9.50),
  ('CN303', 'Polished Concrete', 'Polished floor finish', 'labor', 'sf', 6.50),
  ('CN304', 'Colored Concrete', 'Integral color', 'material', 'sf', 2.50),
  
  -- Structural (CN400-CN450)
  ('CN400', 'Footings', 'Foundation footings', 'material', 'cy', 185.00),
  ('CN401', 'Foundation Walls', 'Poured foundation walls', 'material', 'sf', 12.00),
  ('CN402', 'Retaining Walls', 'Concrete retaining wall', 'material', 'sf', 18.00),
  ('CN403', 'Steps', 'Concrete steps', 'material', 'step', 185.00),
  ('CN404', 'Curbing', 'Concrete curb work', 'material', 'lf', 25.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- MASONRY COST CODES (MS prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'masonry'),
  NULL
FROM (VALUES
  -- Masonry Service (MS001-MS050)
  ('MS001', 'Consultation', 'Design consultation', 'service', 'hour', 95.00),
  ('MS002', 'Structural Assessment', 'Wall evaluation', 'service', 'ls', 385.00),
  ('MS003', 'Historic Match', 'Match existing masonry', 'service', 'ls', 485.00),
  
  -- Masonry Labor (MS100-MS150)
  ('MS100', 'Master Mason', 'Master mason rate', 'labor', 'hour', 85.00),
  ('MS101', 'Bricklayer', 'Bricklayer rate', 'labor', 'hour', 75.00),
  ('MS102', 'Stone Mason', 'Stone mason rate', 'labor', 'hour', 85.00),
  ('MS103', 'Tender', 'Mason tender rate', 'labor', 'hour', 45.00),
  
  -- Brick Work (MS200-MS250)
  ('MS200', 'Brick Veneer', 'Brick veneer installation', 'labor', 'sf', 14.00),
  ('MS201', 'Brick Wall', 'Full brick wall', 'labor', 'sf', 22.00),
  ('MS202', 'Brick Repair', 'Tuckpointing/repair', 'labor', 'sf', 18.00),
  ('MS203', 'Brick Columns', 'Brick column/pillar', 'labor', 'lf', 185.00),
  ('MS204', 'Brick Steps', 'Brick step construction', 'labor', 'step', 285.00),
  
  -- Block Work (MS300-MS350)
  ('MS300', 'CMU Wall', 'Concrete block wall', 'labor', 'sf', 9.50),
  ('MS301', 'Block Foundation', 'Block foundation wall', 'labor', 'sf', 11.00),
  ('MS302', 'Decorative Block', 'Split face block', 'labor', 'sf', 12.00),
  ('MS303', 'Glass Block', 'Glass block installation', 'labor', 'sf', 35.00),
  ('MS304', 'Block Filling', 'Core filling/grouting', 'material', 'cell', 8.50),
  
  -- Stone Work (MS400-MS450)
  ('MS400', 'Stone Veneer', 'Natural stone veneer', 'labor', 'sf', 25.00),
  ('MS401', 'Cultured Stone', 'Manufactured stone', 'labor', 'sf', 18.00),
  ('MS402', 'Fieldstone Wall', 'Dry stack stone wall', 'labor', 'sf', 35.00),
  ('MS403', 'Flagstone', 'Flagstone installation', 'labor', 'sf', 18.00),
  ('MS404', 'Stone Repair', 'Stone restoration', 'labor', 'sf', 45.00),
  
  -- Specialty (MS500-MS550)
  ('MS500', 'Chimney Build', 'New chimney construction', 'labor', 'lf', 485.00),
  ('MS501', 'Chimney Repair', 'Chimney restoration', 'labor', 'lf', 285.00),
  ('MS502', 'Fireplace', 'Masonry fireplace', 'labor', 'ea', 4850.00),
  ('MS503', 'Pizza Oven', 'Outdoor pizza oven', 'labor', 'ea', 3850.00),
  ('MS504', 'Mailbox Structure', 'Brick mailbox', 'labor', 'ea', 1250.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for all new industries
CREATE INDEX IF NOT EXISTS idx_cost_codes_carpentry ON cost_codes(code) WHERE code LIKE 'CP%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_drywall ON cost_codes(code) WHERE code LIKE 'DW%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_tiling ON cost_codes(code) WHERE code LIKE 'TL%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_concrete ON cost_codes(code) WHERE code LIKE 'CN%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_masonry ON cost_codes(code) WHERE code LIKE 'MS%';

-- Add comment
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for specialty trades including carpentry, drywall, tiling, concrete, and masonry';