-- Roofing Industry Cost Codes Migration
-- Comprehensive cost codes for roofing contractors covering all aspects of roofing services

-- Insert Roofing Cost Codes
-- Service and Inspection Codes (RF001-RF099)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'roofing'),
  NULL
FROM (VALUES
  -- Service Calls and Inspections
  ('RF001', 'Roof Inspection', 'Comprehensive roof inspection and report', 'service', 'ls', 250.00),
  ('RF002', 'Emergency Leak Repair', '24/7 emergency leak response', 'service', 'hour', 195.00),
  ('RF003', 'Storm Damage Assessment', 'Post-storm damage evaluation', 'service', 'ls', 350.00),
  ('RF004', 'Insurance Inspection', 'Insurance claim inspection and documentation', 'service', 'ls', 450.00),
  ('RF005', 'Drone Inspection', 'Aerial drone roof inspection', 'service', 'ls', 350.00),
  ('RF006', 'Moisture Detection', 'Infrared moisture scan', 'service', 'ls', 400.00),
  ('RF007', 'Maintenance Contract', 'Annual maintenance agreement', 'service', 'year', 800.00),
  ('RF008', 'Warranty Inspection', 'Warranty compliance inspection', 'service', 'ls', 200.00),
  ('RF009', 'Hail Damage Assessment', 'Hail impact evaluation', 'service', 'ls', 300.00),
  ('RF010', 'Wind Mitigation Inspection', 'Wind resistance certification', 'service', 'ls', 450.00),

  -- Labor Codes (RF100-RF199)
  ('RF100', 'Roofer - Journeyman', 'Experienced roofer hourly rate', 'labor', 'hour', 65.00),
  ('RF101', 'Roofer - Apprentice', 'Apprentice roofer hourly rate', 'labor', 'hour', 45.00),
  ('RF102', 'Foreman', 'Roofing foreman hourly rate', 'labor', 'hour', 85.00),
  ('RF103', 'Tear-Off Labor', 'Roof removal labor per square', 'labor', 'sq', 125.00),
  ('RF104', 'Installation Labor', 'Roofing installation per square', 'labor', 'sq', 175.00),
  ('RF105', 'Flashing Labor', 'Flashing installation labor', 'labor', 'lf', 15.00),
  ('RF106', 'Ridge Cap Labor', 'Ridge cap installation', 'labor', 'lf', 12.00),
  ('RF107', 'Valley Labor', 'Valley installation labor', 'labor', 'lf', 18.00),
  ('RF108', 'Skylight Labor', 'Skylight installation labor', 'labor', 'ea', 350.00),
  ('RF109', 'Chimney Flashing Labor', 'Chimney flashing labor', 'labor', 'ea', 450.00),
  ('RF110', 'Overtime Labor', 'Overtime hourly rate', 'labor', 'hour', 97.50),

  -- Shingle Materials (RF200-RF249)
  ('RF200', 'Shingles - 3-Tab', 'Standard 3-tab asphalt shingles', 'material', 'sq', 95.00),
  ('RF201', 'Shingles - Architectural', 'Architectural asphalt shingles', 'material', 'sq', 145.00),
  ('RF202', 'Shingles - Premium', 'Premium designer shingles', 'material', 'sq', 285.00),
  ('RF203', 'Shingles - Impact Resistant', 'Class 4 impact resistant shingles', 'material', 'sq', 325.00),
  ('RF204', 'Shingles - Cool Roof', 'Energy efficient cool shingles', 'material', 'sq', 195.00),
  ('RF205', 'Cedar Shingles', 'Natural cedar shingles', 'material', 'sq', 450.00),
  ('RF206', 'Slate Shingles', 'Natural slate roofing', 'material', 'sq', 850.00),
  ('RF207', 'Synthetic Slate', 'Composite slate alternative', 'material', 'sq', 425.00),
  ('RF208', 'Solar Shingles', 'Integrated solar shingles', 'material', 'sq', 2100.00),
  ('RF209', 'Starter Shingles', 'Starter strip shingles', 'material', 'lf', 2.85),
  ('RF210', 'Hip & Ridge Shingles', 'Hip and ridge cap shingles', 'material', 'lf', 4.50),

  -- Metal Roofing Materials (RF250-RF299)
  ('RF250', 'Metal - Standing Seam', 'Standing seam metal panels', 'material', 'sq', 650.00),
  ('RF251', 'Metal - Corrugated', 'Corrugated metal roofing', 'material', 'sq', 350.00),
  ('RF252', 'Metal - Stone Coated', 'Stone coated steel tiles', 'material', 'sq', 525.00),
  ('RF253', 'Metal - Copper', 'Copper roofing panels', 'material', 'sq', 1200.00),
  ('RF254', 'Metal - Aluminum', 'Aluminum roofing panels', 'material', 'sq', 475.00),
  ('RF255', 'Metal Trim', 'Metal trim and edging', 'material', 'lf', 8.50),
  ('RF256', 'Metal Fasteners', 'Specialized metal roof screws', 'material', 'sq', 25.00),
  ('RF257', 'Metal Sealant', 'Metal roof sealant', 'material', 'tube', 12.00),

  -- Tile Roofing Materials (RF300-RF349)
  ('RF300', 'Tile - Concrete', 'Concrete roof tiles', 'material', 'sq', 425.00),
  ('RF301', 'Tile - Clay', 'Traditional clay tiles', 'material', 'sq', 650.00),
  ('RF302', 'Tile - Spanish', 'Spanish style tiles', 'material', 'sq', 525.00),
  ('RF303', 'Tile - Flat', 'Flat profile tiles', 'material', 'sq', 475.00),
  ('RF304', 'Tile - Barrel', 'Barrel style tiles', 'material', 'sq', 725.00),
  ('RF305', 'Tile Underlayment', 'Tile-specific underlayment', 'material', 'sq', 85.00),
  ('RF306', 'Tile Fasteners', 'Tile hooks and fasteners', 'material', 'sq', 45.00),
  ('RF307', 'Tile Ridge', 'Ridge tiles', 'material', 'lf', 18.00),
  ('RF308', 'Tile Hip Starter', 'Hip starter tiles', 'material', 'ea', 25.00),
  ('RF309', 'Tile Adhesive', 'Tile adhesive foam', 'material', 'can', 35.00),

  -- Flat Roofing Materials (RF350-RF399)
  ('RF350', 'TPO Membrane', 'TPO single-ply membrane', 'material', 'sq', 425.00),
  ('RF351', 'EPDM Rubber', 'EPDM rubber roofing', 'material', 'sq', 385.00),
  ('RF352', 'PVC Membrane', 'PVC roofing membrane', 'material', 'sq', 485.00),
  ('RF353', 'Modified Bitumen', 'Modified bitumen rolls', 'material', 'sq', 325.00),
  ('RF354', 'Built-Up Roofing', 'BUR hot tar system', 'material', 'sq', 425.00),
  ('RF355', 'Roof Coating', 'Elastomeric roof coating', 'material', 'gal', 85.00),
  ('RF356', 'Foam Roofing', 'Spray polyurethane foam', 'material', 'sq', 525.00),
  ('RF357', 'Membrane Adhesive', 'Membrane bonding adhesive', 'material', 'gal', 125.00),
  ('RF358', 'Seam Tape', 'Membrane seam tape', 'material', 'roll', 95.00),
  ('RF359', 'Termination Bar', 'Membrane termination bar', 'material', 'lf', 12.00),

  -- Underlayment and Accessories (RF400-RF449)
  ('RF400', 'Felt Paper - 15lb', '15lb roofing felt', 'material', 'sq', 25.00),
  ('RF401', 'Felt Paper - 30lb', '30lb roofing felt', 'material', 'sq', 35.00),
  ('RF402', 'Synthetic Underlayment', 'Synthetic underlayment', 'material', 'sq', 65.00),
  ('RF403', 'Ice & Water Shield', 'Self-adhering membrane', 'material', 'sq', 125.00),
  ('RF404', 'Drip Edge', 'Aluminum drip edge', 'material', 'lf', 3.50),
  ('RF405', 'Valley Metal', 'Galvanized valley flashing', 'material', 'lf', 8.50),
  ('RF406', 'Step Flashing', 'Step flashing pieces', 'material', 'ea', 2.50),
  ('RF407', 'Pipe Boot', 'Rubber pipe flashing', 'material', 'ea', 18.00),
  ('RF408', 'Ridge Vent', 'Ridge ventilation system', 'material', 'lf', 12.00),
  ('RF409', 'Soffit Vent', 'Soffit ventilation', 'material', 'ea', 8.50),
  ('RF410', 'Roof Cement', 'Roofing cement', 'material', 'gal', 35.00),
  ('RF411', 'Roofing Nails', 'Galvanized roofing nails', 'material', 'lb', 3.50),
  ('RF412', 'Cap Nails', 'Plastic cap nails', 'material', 'lb', 4.50),

  -- Gutter and Drainage (RF450-RF499)
  ('RF450', 'Gutter - 5 inch', '5" K-style aluminum gutter', 'material', 'lf', 8.50),
  ('RF451', 'Gutter - 6 inch', '6" K-style aluminum gutter', 'material', 'lf', 11.00),
  ('RF452', 'Downspout', 'Aluminum downspout', 'material', 'lf', 7.50),
  ('RF453', 'Gutter Guard', 'Gutter protection system', 'material', 'lf', 22.00),
  ('RF454', 'Gutter Hangers', 'Hidden gutter hangers', 'material', 'ea', 3.50),
  ('RF455', 'End Caps', 'Gutter end caps', 'material', 'ea', 8.00),
  ('RF456', 'Elbows', 'Downspout elbows', 'material', 'ea', 8.50),
  ('RF457', 'Gutter Sealant', 'Gutter sealant', 'material', 'tube', 9.50),
  ('RF458', 'Splash Blocks', 'Concrete splash blocks', 'material', 'ea', 25.00),
  ('RF459', 'Gutter Installation', 'Gutter installation labor', 'labor', 'lf', 8.00),

  -- Equipment Rental (RF500-RF549)
  ('RF500', 'Roofing Crane', 'Crane rental for materials', 'equipment', 'day', 850.00),
  ('RF501', 'Dump Trailer', 'Debris trailer rental', 'equipment', 'day', 225.00),
  ('RF502', 'Nail Gun Rental', 'Roofing nailer rental', 'equipment', 'day', 85.00),
  ('RF503', 'Compressor Rental', 'Air compressor rental', 'equipment', 'day', 125.00),
  ('RF504', 'Safety Equipment', 'Harnesses and anchors', 'equipment', 'day', 75.00),
  ('RF505', 'Tear-Off Equipment', 'Shingle remover rental', 'equipment', 'day', 165.00),
  ('RF506', 'Material Hoist', 'Ladder hoist rental', 'equipment', 'day', 285.00),
  ('RF507', 'Scaffolding', 'Scaffolding rental', 'equipment', 'day', 185.00),
  ('RF508', 'Tarps', 'Protection tarps', 'equipment', 'ea', 45.00),

  -- Specialty Services (RF600-RF699)
  ('RF600', 'Chimney Cricket', 'Chimney cricket installation', 'subcontractor', 'ea', 650.00),
  ('RF601', 'Skylight Installation', 'New skylight installation', 'material', 'ea', 850.00),
  ('RF602', 'Solar Panel Mounting', 'Solar mounting system', 'material', 'ea', 385.00),
  ('RF603', 'Snow Guards', 'Snow retention system', 'material', 'lf', 25.00),
  ('RF604', 'Attic Ventilation', 'Power attic ventilator', 'material', 'ea', 425.00),
  ('RF605', 'Cupola Installation', 'Decorative cupola', 'material', 'ea', 1250.00),
  ('RF606', 'Lightning Rod', 'Lightning protection system', 'subcontractor', 'ls', 2850.00),
  ('RF607', 'Green Roof System', 'Living roof installation', 'material', 'sq', 2500.00),
  ('RF608', 'Roof Deck', 'Roof deck installation', 'subcontractor', 'sq', 185.00),
  ('RF609', 'Heat Cable', 'Ice dam prevention cable', 'material', 'lf', 18.00),

  -- Repairs and Maintenance (RF700-RF799)
  ('RF700', 'Shingle Repair', 'Individual shingle replacement', 'labor', 'ea', 125.00),
  ('RF701', 'Flashing Repair', 'Flashing repair service', 'labor', 'lf', 45.00),
  ('RF702', 'Leak Repair', 'General leak repair', 'labor', 'hour', 125.00),
  ('RF703', 'Emergency Tarp', 'Emergency tarp installation', 'service', 'ls', 450.00),
  ('RF704', 'Moss Treatment', 'Moss removal and treatment', 'service', 'sq', 85.00),
  ('RF705', 'Roof Cleaning', 'Soft wash roof cleaning', 'service', 'sq', 65.00),
  ('RF706', 'Gutter Cleaning', 'Gutter cleaning service', 'service', 'lf', 3.50),
  ('RF707', 'Vent Repair', 'Roof vent repair', 'labor', 'ea', 185.00),
  ('RF708', 'Caulking', 'Roof caulking service', 'labor', 'lf', 8.50),
  ('RF709', 'Coating Application', 'Protective coating application', 'labor', 'sq', 125.00),

  -- Warranty and Protection (RF800-RF899)
  ('RF800', 'Manufacturer Warranty', 'Extended manufacturer warranty', 'service', 'year', 285.00),
  ('RF801', 'Labor Warranty', 'Extended labor warranty', 'service', 'year', 185.00),
  ('RF802', 'Maintenance Plan', 'Annual maintenance plan', 'service', 'year', 650.00),
  ('RF803', 'Storm Damage Coverage', 'Storm damage protection plan', 'service', 'year', 450.00),
  ('RF804', 'Leak Warranty', 'No-leak guarantee', 'service', 'year', 350.00),

  -- Miscellaneous (RF900-RF999)
  ('RF900', 'Permit', 'Roofing permit', 'service', 'ls', 350.00),
  ('RF901', 'Disposal Fee', 'Shingle disposal fee', 'service', 'ton', 125.00),
  ('RF902', 'Delivery Charge', 'Material delivery', 'service', 'ls', 185.00),
  ('RF903', 'Site Protection', 'Landscaping protection', 'service', 'ls', 225.00),
  ('RF904', 'Photography', 'Before/after photos', 'service', 'ls', 150.00),
  ('RF905', 'Project Management', 'Project coordination', 'service', 'hour', 95.00),
  ('RF906', 'Engineering Report', 'Structural engineering', 'service', 'ls', 1250.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_roofing ON cost_codes(code) WHERE code LIKE 'RF%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for the roofing industry including all roofing types, materials, and services';