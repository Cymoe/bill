-- Kitchen Remodeling Cost Codes Migration
-- Comprehensive cost codes for kitchen remodeling contractors

-- Insert Kitchen Remodeling Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'kitchen-remodeling'),
  NULL
FROM (VALUES
  -- Design and Planning (KR001-KR099)
  ('KR001', 'Kitchen Design', 'Professional kitchen design service', 'service', 'ls', 2500.00),
  ('KR002', '3D Rendering', 'Photorealistic 3D design', 'service', 'ls', 850.00),
  ('KR003', 'Space Planning', 'Layout optimization consultation', 'service', 'hour', 125.00),
  ('KR004', 'Color Consultation', 'Color scheme and materials selection', 'service', 'hour', 95.00),
  ('KR005', 'Permit Drawings', 'Construction drawings for permits', 'service', 'ls', 1250.00),
  ('KR006', 'Measurement Service', 'Detailed kitchen measurements', 'service', 'ls', 285.00),
  ('KR007', 'Project Management', 'Full project coordination', 'service', 'week', 850.00),
  ('KR008', 'Budget Planning', 'Cost estimation and planning', 'service', 'ls', 450.00),

  -- Labor Categories (KR100-KR199)
  ('KR100', 'Lead Carpenter', 'Master kitchen installer', 'labor', 'hour', 85.00),
  ('KR101', 'Cabinet Installer', 'Cabinet installation specialist', 'labor', 'hour', 75.00),
  ('KR102', 'Countertop Installer', 'Countertop fabricator/installer', 'labor', 'hour', 85.00),
  ('KR103', 'Tile Installer', 'Backsplash and floor tiling', 'labor', 'hour', 65.00),
  ('KR104', 'Plumber', 'Licensed plumber', 'labor', 'hour', 95.00),
  ('KR105', 'Electrician', 'Licensed electrician', 'labor', 'hour', 95.00),
  ('KR106', 'Painter', 'Professional painter', 'labor', 'hour', 55.00),
  ('KR107', 'Helper', 'General labor assistant', 'labor', 'hour', 45.00),
  ('KR108', 'Demo Crew', 'Demolition team', 'labor', 'hour', 125.00),

  -- Cabinetry (KR200-KR299)
  ('KR200', 'Base Cabinets - Stock', 'Standard base cabinets', 'material', 'lf', 285.00),
  ('KR201', 'Base Cabinets - Semi-Custom', 'Semi-custom base cabinets', 'material', 'lf', 485.00),
  ('KR202', 'Base Cabinets - Custom', 'Full custom base cabinets', 'material', 'lf', 850.00),
  ('KR203', 'Upper Cabinets - Stock', 'Standard wall cabinets', 'material', 'lf', 225.00),
  ('KR204', 'Upper Cabinets - Semi-Custom', 'Semi-custom wall cabinets', 'material', 'lf', 385.00),
  ('KR205', 'Upper Cabinets - Custom', 'Full custom wall cabinets', 'material', 'lf', 685.00),
  ('KR206', 'Tall Cabinets', 'Pantry and tall cabinets', 'material', 'ea', 1250.00),
  ('KR207', 'Island Cabinets', 'Kitchen island cabinetry', 'material', 'lf', 585.00),
  ('KR208', 'Cabinet Crown Molding', 'Decorative crown molding', 'material', 'lf', 28.00),
  ('KR209', 'Cabinet Light Rail', 'Under cabinet light rail', 'material', 'lf', 18.00),
  ('KR210', 'Cabinet Hardware', 'Knobs and pulls', 'material', 'ea', 8.50),
  ('KR211', 'Soft Close Hardware', 'Soft close upgrade', 'material', 'door', 25.00),
  ('KR212', 'Pull-Out Drawers', 'Drawer box inserts', 'material', 'ea', 125.00),
  ('KR213', 'Lazy Susan', 'Corner cabinet solution', 'material', 'ea', 285.00),
  ('KR214', 'Spice Rack Insert', 'Pull-out spice storage', 'material', 'ea', 185.00),
  ('KR215', 'Trash Pull-Out', 'Waste basket cabinet insert', 'material', 'ea', 225.00),
  ('KR216', 'Cabinet Installation', 'Cabinet installation labor', 'labor', 'lf', 125.00),
  ('KR217', 'Cabinet Modification', 'Custom cabinet alterations', 'labor', 'hour', 85.00),

  -- Countertops (KR300-KR349)
  ('KR300', 'Granite - Level 1', 'Basic granite countertop', 'material', 'sf', 45.00),
  ('KR301', 'Granite - Level 2', 'Mid-grade granite', 'material', 'sf', 65.00),
  ('KR302', 'Granite - Level 3', 'Premium granite', 'material', 'sf', 85.00),
  ('KR303', 'Quartz - Basic', 'Entry level quartz', 'material', 'sf', 55.00),
  ('KR304', 'Quartz - Premium', 'Designer quartz', 'material', 'sf', 95.00),
  ('KR305', 'Marble', 'Natural marble countertop', 'material', 'sf', 125.00),
  ('KR306', 'Butcher Block', 'Wood countertop', 'material', 'sf', 45.00),
  ('KR307', 'Concrete', 'Poured concrete countertop', 'material', 'sf', 85.00),
  ('KR308', 'Laminate', 'Laminate countertop', 'material', 'sf', 25.00),
  ('KR309', 'Solid Surface', 'Corian-style countertop', 'material', 'sf', 55.00),
  ('KR310', 'Edge Treatment', 'Decorative edge profile', 'material', 'lf', 15.00),
  ('KR311', 'Backsplash - 4"', 'Standard backsplash', 'material', 'lf', 12.00),
  ('KR312', 'Undermount Sink Cutout', 'Sink cutout and polish', 'labor', 'ea', 285.00),
  ('KR313', 'Cooktop Cutout', 'Cooktop cutout and polish', 'labor', 'ea', 325.00),
  ('KR314', 'Support Brackets', 'Countertop support system', 'material', 'ea', 65.00),
  ('KR315', 'Countertop Install', 'Installation labor', 'labor', 'sf', 25.00),

  -- Backsplash (KR350-KR399)
  ('KR350', 'Subway Tile', 'Classic subway tile', 'material', 'sf', 8.50),
  ('KR351', 'Mosaic Tile', 'Decorative mosaic tile', 'material', 'sf', 18.00),
  ('KR352', 'Natural Stone Tile', 'Marble/travertine tile', 'material', 'sf', 15.00),
  ('KR353', 'Glass Tile', 'Glass backsplash tile', 'material', 'sf', 22.00),
  ('KR354', 'Metal Tile', 'Stainless/copper tile', 'material', 'sf', 25.00),
  ('KR355', 'Full Height Backsplash', 'Floor to ceiling tile', 'material', 'sf', 12.00),
  ('KR356', 'Tile Installation', 'Backsplash installation', 'labor', 'sf', 12.00),
  ('KR357', 'Tile Accent Strip', 'Decorative accent band', 'material', 'lf', 18.00),
  ('KR358', 'Schluter Edge', 'Tile edge trim', 'material', 'lf', 12.00),
  ('KR359', 'Grout Sealing', 'Grout sealer application', 'service', 'sf', 1.50),

  -- Sinks and Faucets (KR400-KR449)
  ('KR400', 'Sink - Stainless Single', 'Single bowl stainless sink', 'material', 'ea', 385.00),
  ('KR401', 'Sink - Stainless Double', 'Double bowl stainless sink', 'material', 'ea', 485.00),
  ('KR402', 'Sink - Farmhouse', 'Apron front sink', 'material', 'ea', 850.00),
  ('KR403', 'Sink - Composite', 'Granite composite sink', 'material', 'ea', 585.00),
  ('KR404', 'Sink - Copper', 'Copper kitchen sink', 'material', 'ea', 1250.00),
  ('KR405', 'Faucet - Standard', 'Basic kitchen faucet', 'material', 'ea', 225.00),
  ('KR406', 'Faucet - Pull-Down', 'Pull-down spray faucet', 'material', 'ea', 385.00),
  ('KR407', 'Faucet - Commercial Style', 'Pro-style faucet', 'material', 'ea', 685.00),
  ('KR408', 'Faucet - Touchless', 'Motion sensor faucet', 'material', 'ea', 485.00),
  ('KR409', 'Water Filter Faucet', 'Dedicated filter faucet', 'material', 'ea', 185.00),
  ('KR410', 'Soap Dispenser', 'Built-in soap dispenser', 'material', 'ea', 65.00),
  ('KR411', 'Garbage Disposal', 'Waste disposal unit', 'material', 'ea', 285.00),
  ('KR412', 'Instant Hot Water', 'Instant hot water dispenser', 'material', 'ea', 485.00),
  ('KR413', 'Sink Installation', 'Sink install and hookup', 'labor', 'ea', 285.00),

  -- Appliances (KR450-KR499)
  ('KR450', 'Range - Gas 30"', 'Standard gas range', 'material', 'ea', 1250.00),
  ('KR451', 'Range - Gas 36"', 'Professional gas range', 'material', 'ea', 3850.00),
  ('KR452', 'Range - Induction', 'Induction range', 'material', 'ea', 2250.00),
  ('KR453', 'Cooktop - Gas', 'Gas cooktop', 'material', 'ea', 850.00),
  ('KR454', 'Cooktop - Electric', 'Electric cooktop', 'material', 'ea', 685.00),
  ('KR455', 'Wall Oven - Single', 'Single wall oven', 'material', 'ea', 1850.00),
  ('KR456', 'Wall Oven - Double', 'Double wall oven', 'material', 'ea', 3250.00),
  ('KR457', 'Range Hood - Under Cabinet', 'Under cabinet hood', 'material', 'ea', 385.00),
  ('KR458', 'Range Hood - Wall Mount', 'Wall mounted hood', 'material', 'ea', 850.00),
  ('KR459', 'Range Hood - Island', 'Island mount hood', 'material', 'ea', 1250.00),
  ('KR460', 'Microwave - OTR', 'Over the range microwave', 'material', 'ea', 485.00),
  ('KR461', 'Microwave - Built-in', 'Built-in microwave', 'material', 'ea', 685.00),
  ('KR462', 'Refrigerator - Standard', 'Standard refrigerator', 'material', 'ea', 1850.00),
  ('KR463', 'Refrigerator - Counter Depth', 'Counter depth fridge', 'material', 'ea', 2850.00),
  ('KR464', 'Refrigerator - Built-in', 'Built-in refrigerator', 'material', 'ea', 8500.00),
  ('KR465', 'Dishwasher - Standard', 'Standard dishwasher', 'material', 'ea', 685.00),
  ('KR466', 'Dishwasher - Premium', 'Premium quiet dishwasher', 'material', 'ea', 1250.00),
  ('KR467', 'Wine Refrigerator', 'Under counter wine fridge', 'material', 'ea', 1450.00),
  ('KR468', 'Ice Maker', 'Built-in ice maker', 'material', 'ea', 1850.00),
  ('KR469', 'Appliance Installation', 'Basic appliance hookup', 'labor', 'ea', 185.00),

  -- Electrical Work (KR500-KR549)
  ('KR500', 'Outlet Addition', 'Add new outlet', 'labor', 'ea', 225.00),
  ('KR501', 'GFCI Outlet', 'Install GFCI protection', 'labor', 'ea', 185.00),
  ('KR502', 'Dedicated Circuit', 'New appliance circuit', 'labor', 'ea', 485.00),
  ('KR503', 'Under Cabinet Lighting', 'LED under cabinet lights', 'material', 'lf', 45.00),
  ('KR504', 'Pendant Lights', 'Island pendant lights', 'material', 'ea', 285.00),
  ('KR505', 'Recessed Lights', 'Can lights', 'material', 'ea', 125.00),
  ('KR506', 'Chandelier', 'Dining area chandelier', 'material', 'ea', 685.00),
  ('KR507', 'Dimmer Switch', 'Dimmer installation', 'labor', 'ea', 125.00),
  ('KR508', 'Light Installation', 'Light fixture install', 'labor', 'ea', 125.00),

  -- Plumbing Work (KR550-KR599)
  ('KR550', 'Water Line - Sink', 'Sink water supply lines', 'labor', 'ea', 185.00),
  ('KR551', 'Water Line - Fridge', 'Refrigerator water line', 'labor', 'ea', 225.00),
  ('KR552', 'Water Line - Dishwasher', 'Dishwasher connection', 'labor', 'ea', 185.00),
  ('KR553', 'Gas Line - Range', 'Gas range connection', 'labor', 'ea', 385.00),
  ('KR554', 'Drain Line', 'New drain installation', 'labor', 'ea', 325.00),
  ('KR555', 'Shut-off Valves', 'Install shut-off valves', 'labor', 'ea', 125.00),
  ('KR556', 'Water Filter System', 'Under sink water filter', 'material', 'ea', 485.00),

  -- Flooring (KR600-KR649)
  ('KR600', 'Hardwood - Oak', 'Oak hardwood flooring', 'material', 'sf', 8.50),
  ('KR601', 'Hardwood - Exotic', 'Exotic wood flooring', 'material', 'sf', 12.00),
  ('KR602', 'Engineered Wood', 'Engineered hardwood', 'material', 'sf', 6.50),
  ('KR603', 'Luxury Vinyl Plank', 'Waterproof LVP', 'material', 'sf', 4.50),
  ('KR604', 'Ceramic Tile', 'Ceramic floor tile', 'material', 'sf', 5.50),
  ('KR605', 'Porcelain Tile', 'Porcelain floor tile', 'material', 'sf', 7.50),
  ('KR606', 'Natural Stone', 'Stone floor tile', 'material', 'sf', 12.00),
  ('KR607', 'Floor Installation', 'Flooring install labor', 'labor', 'sf', 4.50),
  ('KR608', 'Floor Removal', 'Remove old flooring', 'labor', 'sf', 2.50),
  ('KR609', 'Subfloor Repair', 'Repair damaged subfloor', 'labor', 'sf', 8.50),

  -- Windows and Doors (KR650-KR699)
  ('KR650', 'Window - Standard', 'Kitchen window replacement', 'material', 'ea', 685.00),
  ('KR651', 'Window - Garden', 'Garden window', 'material', 'ea', 1250.00),
  ('KR652', 'Window - Bay', 'Bay window', 'material', 'ea', 2850.00),
  ('KR653', 'French Doors', 'French door to patio', 'material', 'pr', 2250.00),
  ('KR654', 'Sliding Door', 'Sliding glass door', 'material', 'ea', 1850.00),
  ('KR655', 'Window Treatment', 'Blinds or shades', 'material', 'window', 285.00),
  ('KR656', 'Window Installation', 'Window install labor', 'labor', 'ea', 385.00),

  -- Finishing Work (KR700-KR749)
  ('KR700', 'Drywall Repair', 'Patch and repair walls', 'labor', 'sf', 4.50),
  ('KR701', 'Wall Texture', 'Apply wall texture', 'labor', 'sf', 2.50),
  ('KR702', 'Interior Painting', 'Paint walls and ceiling', 'labor', 'sf', 2.25),
  ('KR703', 'Cabinet Painting', 'Paint existing cabinets', 'labor', 'door', 125.00),
  ('KR704', 'Trim Work', 'Install trim and molding', 'labor', 'lf', 8.50),
  ('KR705', 'Clean-up', 'Daily job site cleanup', 'labor', 'day', 125.00),
  ('KR706', 'Final Cleaning', 'Post-construction cleaning', 'service', 'ls', 485.00),

  -- Specialty Items (KR800-KR849)
  ('KR800', 'Kitchen Island', 'Custom kitchen island', 'material', 'ea', 3850.00),
  ('KR801', 'Breakfast Bar', 'Peninsula breakfast bar', 'material', 'lf', 385.00),
  ('KR802', 'Pantry System', 'Walk-in pantry shelving', 'material', 'ls', 1850.00),
  ('KR803', 'Coffee Station', 'Built-in coffee bar', 'material', 'ea', 2850.00),
  ('KR804', 'Pot Filler', 'Over stove pot filler', 'material', 'ea', 485.00),
  ('KR805', 'Appliance Garage', 'Counter appliance storage', 'material', 'ea', 685.00),
  ('KR806', 'Desk Area', 'Kitchen desk space', 'material', 'lf', 485.00),

  -- Demolition (KR850-KR899)
  ('KR850', 'Full Demo', 'Complete kitchen demolition', 'labor', 'ls', 2850.00),
  ('KR851', 'Cabinet Removal', 'Remove existing cabinets', 'labor', 'lf', 35.00),
  ('KR852', 'Countertop Removal', 'Remove old countertops', 'labor', 'lf', 25.00),
  ('KR853', 'Appliance Removal', 'Remove and dispose appliances', 'labor', 'ea', 85.00),
  ('KR854', 'Wall Removal', 'Non-load bearing wall', 'labor', 'lf', 125.00),
  ('KR855', 'Disposal Fee', 'Debris disposal', 'service', 'load', 385.00),

  -- Miscellaneous (KR900-KR999)
  ('KR900', 'Permit Fees', 'Building permits', 'service', 'ls', 850.00),
  ('KR901', 'Structural Engineer', 'Load bearing wall analysis', 'service', 'ls', 1250.00),
  ('KR902', 'Delivery Fee', 'Material delivery charges', 'service', 'trip', 185.00),
  ('KR903', 'Protection Materials', 'Floor and wall protection', 'material', 'ls', 285.00),
  ('KR904', 'Contingency', 'Unforeseen circumstances', 'service', 'ls', 0.10),
  ('KR905', 'Warranty', 'Extended warranty coverage', 'service', 'year', 485.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_kitchen ON cost_codes(code) WHERE code LIKE 'KR%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for kitchen remodeling including cabinetry, countertops, appliances, and full renovations';