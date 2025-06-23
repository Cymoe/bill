-- Home Services Batch 2 Cost Codes Migration
-- Includes: Pest Control, Pool & Spa, Lawn Care, Tree Care, Window Cleaning, Pressure Washing, Gutter Services

-- PEST CONTROL COST CODES (PC prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'pest-control'),
  NULL
FROM (VALUES
  -- Service Plans (PC001-PC050)
  ('PC001', 'Initial Inspection', 'Property pest inspection', 'service', 'ls', 125.00),
  ('PC002', 'Quarterly Service', 'Quarterly treatment plan', 'service', 'quarter', 125.00),
  ('PC003', 'Monthly Service', 'Monthly treatment plan', 'service', 'month', 85.00),
  ('PC004', 'Annual Contract', 'Yearly service agreement', 'service', 'year', 485.00),
  ('PC005', 'One-Time Service', 'Single treatment', 'service', 'ls', 185.00),
  
  -- Common Pests (PC100-PC200)
  ('PC100', 'Ant Control', 'Ant treatment service', 'service', 'ls', 185.00),
  ('PC101', 'Roach Control', 'Cockroach elimination', 'service', 'ls', 225.00),
  ('PC102', 'Spider Control', 'Spider treatment', 'service', 'ls', 165.00),
  ('PC103', 'Flea Treatment', 'Flea elimination', 'service', 'ls', 285.00),
  ('PC104', 'Bed Bug Treatment', 'Bed bug elimination', 'service', 'room', 485.00),
  ('PC105', 'Termite Inspection', 'Termite inspection', 'service', 'ls', 185.00),
  ('PC106', 'Termite Treatment', 'Termite elimination', 'service', 'lf', 12.00),
  ('PC107', 'Mosquito Control', 'Mosquito treatment', 'service', 'acre', 125.00),
  ('PC108', 'Wasp/Bee Removal', 'Stinging insect removal', 'service', 'nest', 285.00),
  ('PC109', 'Fly Control', 'Fly elimination service', 'service', 'ls', 185.00),
  
  -- Rodent Control (PC200-PC250)
  ('PC200', 'Mouse Control', 'Mouse elimination', 'service', 'ls', 225.00),
  ('PC201', 'Rat Control', 'Rat elimination', 'service', 'ls', 285.00),
  ('PC202', 'Rodent Exclusion', 'Entry point sealing', 'labor', 'opening', 85.00),
  ('PC203', 'Trap Service', 'Trap monitoring/removal', 'service', 'visit', 95.00),
  ('PC204', 'Bait Station', 'Bait station service', 'service', 'station', 45.00),
  
  -- Wildlife Control (PC300-PC350)
  ('PC300', 'Raccoon Removal', 'Raccoon trapping/removal', 'service', 'ea', 385.00),
  ('PC301', 'Squirrel Removal', 'Squirrel elimination', 'service', 'ea', 285.00),
  ('PC302', 'Bird Control', 'Bird deterrent installation', 'service', 'lf', 25.00),
  ('PC303', 'Bat Removal', 'Bat exclusion service', 'service', 'ls', 685.00),
  ('PC304', 'Snake Removal', 'Snake capture/removal', 'service', 'ea', 285.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- POOL & SPA SERVICES COST CODES (PS prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'pool-spa'),
  NULL
FROM (VALUES
  -- Service Plans (PS001-PS050)
  ('PS001', 'Weekly Service', 'Weekly pool maintenance', 'service', 'month', 385.00),
  ('PS002', 'Bi-Weekly Service', 'Bi-weekly maintenance', 'service', 'month', 285.00),
  ('PS003', 'Monthly Service', 'Monthly maintenance', 'service', 'month', 185.00),
  ('PS004', 'Opening Service', 'Spring pool opening', 'service', 'ls', 485.00),
  ('PS005', 'Closing Service', 'Winter pool closing', 'service', 'ls', 485.00),
  
  -- Cleaning Services (PS100-PS150)
  ('PS100', 'Chemical Balance', 'Water chemistry adjustment', 'service', 'visit', 85.00),
  ('PS101', 'Vacuum Service', 'Pool vacuuming', 'service', 'visit', 95.00),
  ('PS102', 'Brush Walls', 'Wall brushing service', 'service', 'visit', 65.00),
  ('PS103', 'Filter Cleaning', 'Filter clean/backwash', 'service', 'ea', 125.00),
  ('PS104', 'Acid Wash', 'Pool acid washing', 'service', 'ls', 850.00),
  ('PS105', 'Tile Cleaning', 'Tile line cleaning', 'service', 'lf', 8.50),
  
  -- Equipment Repair (PS200-PS250)
  ('PS200', 'Pump Repair', 'Pool pump repair', 'labor', 'hour', 125.00),
  ('PS201', 'Pump Replace', 'Pool pump replacement', 'material', 'ea', 685.00),
  ('PS202', 'Filter Replace', 'Filter replacement', 'material', 'ea', 485.00),
  ('PS203', 'Heater Repair', 'Heater service/repair', 'labor', 'hour', 145.00),
  ('PS204', 'Heater Replace', 'Heater replacement', 'material', 'ea', 2850.00),
  ('PS205', 'Salt Cell Replace', 'Salt cell replacement', 'material', 'ea', 685.00),
  
  -- Leak Detection (PS300-PS350)
  ('PS300', 'Leak Detection', 'Leak detection service', 'service', 'hour', 185.00),
  ('PS301', 'Pipe Repair', 'Underground pipe repair', 'labor', 'hour', 125.00),
  ('PS302', 'Liner Patch', 'Vinyl liner patch', 'labor', 'patch', 285.00),
  ('PS303', 'Skimmer Repair', 'Skimmer leak repair', 'labor', 'ea', 485.00),
  
  -- Spa Services (PS400-PS450)
  ('PS400', 'Spa Service', 'Hot tub maintenance', 'service', 'month', 185.00),
  ('PS401', 'Spa Drain/Fill', 'Complete water change', 'service', 'ls', 285.00),
  ('PS402', 'Spa Cover Replace', 'New spa cover', 'material', 'ea', 685.00),
  ('PS403', 'Spa Jet Repair', 'Jet replacement', 'labor', 'ea', 125.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- LAWN CARE COST CODES (LC prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'lawn-care'),
  NULL
FROM (VALUES
  -- Service Plans (LC001-LC050)
  ('LC001', 'Weekly Mowing', 'Weekly lawn service', 'service', 'month', 185.00),
  ('LC002', 'Bi-Weekly Mowing', 'Bi-weekly service', 'service', 'month', 125.00),
  ('LC003', 'Full Service', 'Mow, edge, trim, blow', 'service', 'visit', 45.00),
  ('LC004', 'Basic Mowing', 'Mowing only', 'service', 'visit', 35.00),
  
  -- Lawn Treatments (LC100-LC150)
  ('LC100', 'Fertilization', 'Lawn fertilizer application', 'service', 'app', 85.00),
  ('LC101', 'Weed Control', 'Weed treatment', 'service', 'app', 95.00),
  ('LC102', 'Grub Control', 'Grub prevention', 'service', 'app', 125.00),
  ('LC103', 'Disease Treatment', 'Fungicide application', 'service', 'app', 145.00),
  ('LC104', 'Aeration', 'Core aeration service', 'service', 'ksf', 85.00),
  ('LC105', 'Overseeding', 'Grass overseeding', 'service', 'ksf', 125.00),
  ('LC106', 'Dethatching', 'Thatch removal', 'service', 'ksf', 95.00),
  
  -- Seasonal Services (LC200-LC250)
  ('LC200', 'Spring Cleanup', 'Spring yard cleanup', 'service', 'ls', 385.00),
  ('LC201', 'Fall Cleanup', 'Fall leaf removal', 'service', 'ls', 425.00),
  ('LC202', 'Mulch Installation', 'Mulch delivery/install', 'material', 'cy', 85.00),
  ('LC203', 'Leaf Removal', 'Leaf cleanup service', 'service', 'hour', 65.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- TREE CARE COST CODES (TC prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'tree-care'),
  NULL
FROM (VALUES
  -- Tree Services (TC001-TC050)
  ('TC001', 'Tree Assessment', 'Arborist consultation', 'service', 'hour', 125.00),
  ('TC002', 'Tree Health Check', 'Disease/pest inspection', 'service', 'tree', 85.00),
  ('TC003', 'Risk Assessment', 'Hazard tree evaluation', 'service', 'ls', 285.00),
  
  -- Tree Trimming (TC100-TC150)
  ('TC100', 'Tree Trim - Small', 'Under 25ft trimming', 'service', 'tree', 285.00),
  ('TC101', 'Tree Trim - Medium', '25-50ft trimming', 'service', 'tree', 485.00),
  ('TC102', 'Tree Trim - Large', 'Over 50ft trimming', 'service', 'tree', 885.00),
  ('TC103', 'Crown Reduction', 'Crown size reduction', 'service', 'tree', 685.00),
  ('TC104', 'Deadwooding', 'Dead branch removal', 'service', 'hour', 185.00),
  
  -- Tree Removal (TC200-TC250)
  ('TC200', 'Tree Removal - Small', 'Under 25ft removal', 'service', 'tree', 485.00),
  ('TC201', 'Tree Removal - Medium', '25-50ft removal', 'service', 'tree', 885.00),
  ('TC202', 'Tree Removal - Large', 'Over 50ft removal', 'service', 'tree', 1885.00),
  ('TC203', 'Stump Grinding', 'Stump removal', 'service', 'inch', 8.50),
  ('TC204', 'Emergency Removal', '24/7 emergency service', 'service', 'hour', 285.00),
  
  -- Tree Health (TC300-TC350)
  ('TC300', 'Deep Root Feeding', 'Fertilization injection', 'service', 'tree', 185.00),
  ('TC301', 'Pest Treatment', 'Insect/disease treatment', 'service', 'tree', 225.00),
  ('TC302', 'Cabling/Bracing', 'Tree support systems', 'service', 'tree', 485.00),
  ('TC303', 'Root Pruning', 'Root system pruning', 'service', 'lf', 45.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- WINDOW CLEANING COST CODES (WC prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'window-cleaning'),
  NULL
FROM (VALUES
  -- Service Types (WC001-WC050)
  ('WC001', 'Residential - Basic', 'Standard home service', 'service', 'pane', 3.50),
  ('WC002', 'Residential - Deep', 'Deep cleaning service', 'service', 'pane', 5.50),
  ('WC003', 'Commercial - Regular', 'Regular office cleaning', 'service', 'pane', 2.50),
  ('WC004', 'Commercial - High Rise', 'High rise window service', 'service', 'pane', 8.50),
  
  -- Window Services (WC100-WC150)
  ('WC100', 'Interior Only', 'Inside window cleaning', 'service', 'pane', 2.50),
  ('WC101', 'Exterior Only', 'Outside window cleaning', 'service', 'pane', 3.50),
  ('WC102', 'Interior & Exterior', 'Both sides cleaning', 'service', 'pane', 5.50),
  ('WC103', 'Screen Cleaning', 'Window screen cleaning', 'service', 'ea', 5.00),
  ('WC104', 'Sill/Track Clean', 'Sill and track cleaning', 'service', 'window', 8.00),
  ('WC105', 'Storm Window', 'Storm window cleaning', 'service', 'ea', 12.00),
  
  -- Specialty Cleaning (WC200-WC250)
  ('WC200', 'Skylight Cleaning', 'Skylight service', 'service', 'ea', 35.00),
  ('WC201', 'Solar Panel Clean', 'Solar panel cleaning', 'service', 'panel', 15.00),
  ('WC202', 'Chandelier Clean', 'Chandelier cleaning', 'service', 'ea', 185.00),
  ('WC203', 'Mirror Cleaning', 'Large mirror service', 'service', 'sf', 2.50)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- PRESSURE WASHING COST CODES (PW prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'pressure-washing'),
  NULL
FROM (VALUES
  -- Service Types (PW001-PW050)
  ('PW001', 'House Wash', 'Complete house washing', 'service', 'sf', 0.35),
  ('PW002', 'Driveway Clean', 'Driveway pressure washing', 'service', 'sf', 0.25),
  ('PW003', 'Deck/Patio Clean', 'Deck cleaning service', 'service', 'sf', 0.45),
  ('PW004', 'Sidewalk Clean', 'Sidewalk cleaning', 'service', 'sf', 0.20),
  
  -- Specialty Services (PW100-PW150)
  ('PW100', 'Roof Cleaning', 'Soft wash roof cleaning', 'service', 'sf', 0.55),
  ('PW101', 'Gutter Brightening', 'Gutter face cleaning', 'service', 'lf', 3.50),
  ('PW102', 'Fence Cleaning', 'Fence pressure washing', 'service', 'sf', 0.35),
  ('PW103', 'Concrete Sealing', 'After cleaning sealer', 'service', 'sf', 0.85),
  ('PW104', 'Rust Removal', 'Rust stain removal', 'service', 'sf', 1.25),
  ('PW105', 'Oil Stain Removal', 'Oil stain treatment', 'service', 'sf', 1.50),
  
  -- Commercial Services (PW200-PW250)
  ('PW200', 'Parking Lot', 'Parking lot cleaning', 'service', 'sf', 0.15),
  ('PW201', 'Building Wash', 'Commercial building', 'service', 'sf', 0.25),
  ('PW202', 'Graffiti Removal', 'Graffiti cleaning', 'service', 'sf', 3.50),
  ('PW203', 'Fleet Washing', 'Vehicle fleet washing', 'service', 'vehicle', 85.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- GUTTER SERVICES COST CODES (GS prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'gutter-services'),
  NULL
FROM (VALUES
  -- Service Types (GS001-GS050)
  ('GS001', 'Gutter Cleaning', 'Clean gutters/downspouts', 'service', 'lf', 2.50),
  ('GS002', 'Gutter Inspection', 'Full system inspection', 'service', 'ls', 125.00),
  ('GS003', 'Emergency Service', 'Emergency gutter service', 'service', 'hour', 185.00),
  
  -- Installation Services (GS100-GS150)
  ('GS100', 'Gutter Install - 5"', '5" K-style gutter', 'material', 'lf', 12.00),
  ('GS101', 'Gutter Install - 6"', '6" K-style gutter', 'material', 'lf', 15.00),
  ('GS102', 'Downspout Install', 'Downspout installation', 'material', 'lf', 10.00),
  ('GS103', 'Gutter Guard Install', 'Gutter protection system', 'material', 'lf', 22.00),
  
  -- Repair Services (GS200-GS250)
  ('GS200', 'Gutter Repair', 'Section repair/patch', 'labor', 'lf', 18.00),
  ('GS201', 'Downspout Repair', 'Downspout repair', 'labor', 'ea', 125.00),
  ('GS202', 'Reseal Joints', 'Joint sealing service', 'labor', 'joint', 25.00),
  ('GS203', 'Rehang Gutters', 'Gutter realignment', 'labor', 'lf', 8.50),
  ('GS204', 'End Cap Replace', 'End cap replacement', 'labor', 'ea', 45.00),
  
  -- Specialty Services (GS300-GS350)
  ('GS300', 'Copper Gutters', 'Copper gutter install', 'material', 'lf', 35.00),
  ('GS301', 'Box Gutters', 'Box gutter repair', 'labor', 'lf', 45.00),
  ('GS302', 'Underground Drain', 'Downspout drainage', 'material', 'lf', 25.00),
  ('GS303', 'Rain Barrel Install', 'Rain collection system', 'material', 'ea', 285.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for all industries
CREATE INDEX IF NOT EXISTS idx_cost_codes_pest_control ON cost_codes(code) WHERE code LIKE 'PC%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_pool_spa ON cost_codes(code) WHERE code LIKE 'PS%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_lawn_care ON cost_codes(code) WHERE code LIKE 'LC%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_tree_care ON cost_codes(code) WHERE code LIKE 'TC%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_window_clean ON cost_codes(code) WHERE code LIKE 'WC%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_pressure_wash ON cost_codes(code) WHERE code LIKE 'PW%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_gutter ON cost_codes(code) WHERE code LIKE 'GS%';

-- Add comment
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for home services including pest control, pool/spa, lawn care, and cleaning services';