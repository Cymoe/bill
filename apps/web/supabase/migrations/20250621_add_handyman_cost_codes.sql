-- Handyman Services Cost Codes Migration
-- Comprehensive cost codes for handyman contractors covering general repairs and maintenance

-- Insert Handyman Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'handyman'),
  NULL
FROM (VALUES
  -- Service Calls and Rates (HM001-HM099)
  ('HM001', 'Service Call', 'Standard service call fee', 'service', 'ls', 95.00),
  ('HM002', 'Emergency Call', 'After-hours emergency service', 'service', 'ls', 185.00),
  ('HM003', 'Consultation', 'Project consultation and estimate', 'service', 'hour', 75.00),
  ('HM004', 'Minimum Service', '1-hour minimum charge', 'service', 'ls', 125.00),
  ('HM005', 'Half Day Rate', '4-hour service block', 'service', 'ls', 425.00),
  ('HM006', 'Full Day Rate', '8-hour service block', 'service', 'ls', 750.00),
  ('HM007', 'Weekend Rate', 'Weekend service premium', 'service', 'hour', 95.00),
  ('HM008', 'Holiday Rate', 'Holiday service premium', 'service', 'hour', 125.00),
  ('HM009', 'Travel Charge', 'Outside service area', 'service', 'mile', 1.50),
  ('HM010', 'Diagnostic Fee', 'Problem diagnosis charge', 'service', 'ls', 85.00),

  -- Labor Categories (HM100-HM199)
  ('HM100', 'General Labor', 'Standard handyman rate', 'labor', 'hour', 65.00),
  ('HM101', 'Skilled Labor', 'Specialized repair work', 'labor', 'hour', 85.00),
  ('HM102', 'Helper Labor', 'Assistant/helper rate', 'labor', 'hour', 45.00),
  ('HM103', 'Heavy Lifting', 'Two-person lifting jobs', 'labor', 'hour', 125.00),
  ('HM104', 'Precision Work', 'Detail-oriented tasks', 'labor', 'hour', 95.00),
  ('HM105', 'Dirty Work', 'Crawlspace/attic work', 'labor', 'hour', 85.00),

  -- Drywall and Painting (HM200-HM249)
  ('HM200', 'Drywall Patch - Small', 'Holes under 4 inches', 'labor', 'ea', 125.00),
  ('HM201', 'Drywall Patch - Large', 'Holes 4-12 inches', 'labor', 'ea', 225.00),
  ('HM202', 'Drywall Sheet Replace', 'Full sheet replacement', 'labor', 'sheet', 385.00),
  ('HM203', 'Texture Matching', 'Match existing texture', 'labor', 'sf', 3.50),
  ('HM204', 'Interior Paint - Room', 'Paint one room', 'labor', 'room', 385.00),
  ('HM205', 'Interior Paint - Touch Up', 'Small paint touch-ups', 'labor', 'hour', 65.00),
  ('HM206', 'Exterior Paint - Small', 'Small exterior painting', 'labor', 'hour', 75.00),
  ('HM207', 'Caulking', 'Interior/exterior caulking', 'labor', 'lf', 4.50),
  ('HM208', 'Wallpaper Removal', 'Remove old wallpaper', 'labor', 'sf', 2.50),
  ('HM209', 'Popcorn Ceiling Patch', 'Repair textured ceiling', 'labor', 'sf', 8.50),
  ('HM210', 'Nail Pop Repair', 'Fix nail pops', 'labor', 'ea', 15.00),

  -- Door Services (HM250-HM299)
  ('HM250', 'Door Adjustment', 'Adjust sticking door', 'labor', 'ea', 85.00),
  ('HM251', 'Door Installation', 'Install pre-hung door', 'labor', 'ea', 225.00),
  ('HM252', 'Lock Installation', 'Install new lockset', 'labor', 'ea', 125.00),
  ('HM253', 'Deadbolt Installation', 'Install deadbolt lock', 'labor', 'ea', 145.00),
  ('HM254', 'Door Repair', 'Fix damaged door', 'labor', 'ea', 165.00),
  ('HM255', 'Threshold Replace', 'Replace door threshold', 'labor', 'ea', 125.00),
  ('HM256', 'Weather Stripping', 'Install weather stripping', 'labor', 'door', 85.00),
  ('HM257', 'Pet Door Install', 'Install pet door', 'labor', 'ea', 285.00),
  ('HM258', 'Sliding Door Repair', 'Fix sliding door track', 'labor', 'ea', 185.00),
  ('HM259', 'Door Closer Install', 'Install automatic closer', 'labor', 'ea', 165.00),
  ('HM260', 'Peephole Installation', 'Install door viewer', 'labor', 'ea', 65.00),

  -- Window Services (HM300-HM349)
  ('HM300', 'Window Screen Repair', 'Fix torn screen', 'labor', 'ea', 65.00),
  ('HM301', 'Window Screen Replace', 'New screen installation', 'labor', 'ea', 95.00),
  ('HM302', 'Window Caulking', 'Seal window gaps', 'labor', 'window', 85.00),
  ('HM303', 'Window Lock Repair', 'Fix window locks', 'labor', 'ea', 75.00),
  ('HM304', 'Window Balance', 'Replace window balance', 'labor', 'ea', 145.00),
  ('HM305', 'Storm Window Install', 'Install storm windows', 'labor', 'ea', 125.00),
  ('HM306', 'Window Glazing', 'Replace window glazing', 'labor', 'pane', 95.00),
  ('HM307', 'Sill Repair', 'Repair window sill', 'labor', 'ea', 185.00),
  ('HM308', 'Blind Installation', 'Install window blinds', 'labor', 'window', 85.00),
  ('HM309', 'Curtain Rod Install', 'Mount curtain rods', 'labor', 'window', 65.00),

  -- Plumbing Repairs (HM350-HM399)
  ('HM350', 'Faucet Repair', 'Fix leaky faucet', 'labor', 'ea', 125.00),
  ('HM351', 'Faucet Replace', 'Replace faucet', 'labor', 'ea', 185.00),
  ('HM352', 'Toilet Repair', 'Fix running toilet', 'labor', 'ea', 145.00),
  ('HM353', 'Toilet Replace', 'Replace toilet', 'labor', 'ea', 285.00),
  ('HM354', 'P-Trap Replace', 'Replace sink trap', 'labor', 'ea', 125.00),
  ('HM355', 'Garbage Disposal', 'Install disposal', 'labor', 'ea', 225.00),
  ('HM356', 'Shut-Off Valve', 'Replace shut-off valve', 'labor', 'ea', 145.00),
  ('HM357', 'Clog Clearing', 'Clear simple clogs', 'labor', 'ea', 125.00),
  ('HM358', 'Pipe Insulation', 'Insulate exposed pipes', 'labor', 'lf', 8.50),
  ('HM359', 'Water Filter Install', 'Install inline filter', 'labor', 'ea', 165.00),

  -- Electrical Work (HM400-HM449)
  ('HM400', 'Outlet Replace', 'Replace standard outlet', 'labor', 'ea', 85.00),
  ('HM401', 'Switch Replace', 'Replace light switch', 'labor', 'ea', 75.00),
  ('HM402', 'GFCI Install', 'Install GFCI outlet', 'labor', 'ea', 145.00),
  ('HM403', 'Dimmer Install', 'Install dimmer switch', 'labor', 'ea', 125.00),
  ('HM404', 'Ceiling Fan Install', 'Install ceiling fan', 'labor', 'ea', 285.00),
  ('HM405', 'Light Fixture Install', 'Install light fixture', 'labor', 'ea', 165.00),
  ('HM406', 'Doorbell Repair', 'Fix doorbell system', 'labor', 'ls', 125.00),
  ('HM407', 'Smoke Detector', 'Install smoke detector', 'labor', 'ea', 85.00),
  ('HM408', 'Timer Switch', 'Install timer switch', 'labor', 'ea', 125.00),
  ('HM409', 'Outlet Cover Replace', 'Replace cover plates', 'labor', 'ea', 25.00),

  -- Furniture and Assembly (HM450-HM499)
  ('HM450', 'Furniture Assembly', 'Assemble furniture', 'labor', 'hour', 65.00),
  ('HM451', 'Furniture Repair', 'Fix broken furniture', 'labor', 'hour', 75.00),
  ('HM452', 'Furniture Moving', 'Move heavy furniture', 'labor', 'hour', 85.00),
  ('HM453', 'Shelf Installation', 'Install wall shelves', 'labor', 'ea', 65.00),
  ('HM454', 'Closet Organizer', 'Install closet system', 'labor', 'hour', 75.00),
  ('HM455', 'TV Mounting', 'Mount TV on wall', 'labor', 'ea', 185.00),
  ('HM456', 'Picture Hanging', 'Hang pictures/art', 'labor', 'ea', 35.00),
  ('HM457', 'Mirror Installation', 'Hang large mirrors', 'labor', 'ea', 125.00),
  ('HM458', 'Desk Assembly', 'Assemble office desk', 'labor', 'ea', 165.00),
  ('HM459', 'Bed Frame Assembly', 'Assemble bed frame', 'labor', 'ea', 125.00),

  -- Appliance Services (HM500-HM549)
  ('HM500', 'Dishwasher Install', 'Install dishwasher', 'labor', 'ea', 285.00),
  ('HM501', 'Washer/Dryer Hookup', 'Connect W/D units', 'labor', 'set', 225.00),
  ('HM502', 'Microwave Install', 'Install over-range micro', 'labor', 'ea', 185.00),
  ('HM503', 'Ice Maker Hookup', 'Connect ice maker line', 'labor', 'ea', 125.00),
  ('HM504', 'Range Hood Install', 'Install exhaust hood', 'labor', 'ea', 285.00),
  ('HM505', 'Appliance Leveling', 'Level appliances', 'labor', 'ea', 65.00),
  ('HM506', 'Dryer Vent Cleaning', 'Clean dryer vent', 'service', 'ea', 145.00),
  ('HM507', 'Refrigerator Move', 'Move refrigerator', 'labor', 'ea', 125.00),

  -- Carpentry Work (HM550-HM599)
  ('HM550', 'Trim Installation', 'Install baseboard/crown', 'labor', 'lf', 8.50),
  ('HM551', 'Trim Repair', 'Fix damaged trim', 'labor', 'lf', 6.50),
  ('HM552', 'Cabinet Adjustment', 'Adjust cabinet doors', 'labor', 'door', 45.00),
  ('HM553', 'Cabinet Repair', 'Fix cabinet damage', 'labor', 'hour', 85.00),
  ('HM554', 'Deck Repair', 'Fix deck boards', 'labor', 'sf', 12.00),
  ('HM555', 'Fence Repair', 'Fix fence sections', 'labor', 'lf', 25.00),
  ('HM556', 'Gate Repair', 'Fix sagging gate', 'labor', 'ea', 165.00),
  ('HM557', 'Stair Repair', 'Fix squeaky stairs', 'labor', 'step', 85.00),
  ('HM558', 'Handrail Install', 'Install stair handrail', 'labor', 'lf', 45.00),
  ('HM559', 'Wood Rot Repair', 'Replace rotted wood', 'labor', 'sf', 18.00),

  -- Tile and Flooring (HM600-HM649)
  ('HM600', 'Tile Repair', 'Replace broken tiles', 'labor', 'ea', 125.00),
  ('HM601', 'Grout Repair', 'Regrout small areas', 'labor', 'sf', 8.50),
  ('HM602', 'Caulk Replace', 'Replace tub/shower caulk', 'labor', 'lf', 12.00),
  ('HM603', 'Threshold Install', 'Install floor transition', 'labor', 'ea', 125.00),
  ('HM604', 'Floor Squeak Fix', 'Fix squeaky floors', 'labor', 'sf', 6.50),
  ('HM605', 'Vinyl Repair', 'Patch vinyl flooring', 'labor', 'sf', 18.00),
  ('HM606', 'Carpet Patch', 'Repair carpet damage', 'labor', 'sf', 25.00),
  ('HM607', 'Floor Register', 'Replace floor vents', 'labor', 'ea', 65.00),

  -- Exterior Services (HM650-HM699)
  ('HM650', 'Gutter Cleaning', 'Clean gutters', 'service', 'lf', 2.50),
  ('HM651', 'Gutter Repair', 'Fix gutter sections', 'labor', 'lf', 12.00),
  ('HM652', 'Downspout Repair', 'Fix downspouts', 'labor', 'ea', 85.00),
  ('HM653', 'Pressure Washing', 'Power wash surfaces', 'service', 'hour', 125.00),
  ('HM654', 'Deck Staining', 'Stain deck surfaces', 'labor', 'sf', 2.50),
  ('HM655', 'Exterior Caulking', 'Seal exterior gaps', 'labor', 'lf', 6.50),
  ('HM656', 'Screen Door Repair', 'Fix screen door', 'labor', 'ea', 125.00),
  ('HM657', 'Mailbox Install', 'Install new mailbox', 'labor', 'ea', 145.00),
  ('HM658', 'House Numbers', 'Install address numbers', 'labor', 'set', 85.00),
  ('HM659', 'Outdoor Hook Install', 'Install plant hooks', 'labor', 'ea', 35.00),

  -- Safety and Security (HM700-HM749)
  ('HM700', 'Grab Bar Install', 'Install bathroom grab bar', 'labor', 'ea', 125.00),
  ('HM701', 'Handrail Install', 'Install safety handrail', 'labor', 'lf', 45.00),
  ('HM702', 'Baby Gate Install', 'Install child safety gate', 'labor', 'ea', 85.00),
  ('HM703', 'Cabinet Locks', 'Install child locks', 'labor', 'ea', 25.00),
  ('HM704', 'Security Light', 'Install motion light', 'labor', 'ea', 165.00),
  ('HM705', 'Door Viewer', 'Install peephole', 'labor', 'ea', 65.00),
  ('HM706', 'Window Locks', 'Install window locks', 'labor', 'ea', 45.00),
  ('HM707', 'Smoke Alarm Battery', 'Replace alarm batteries', 'service', 'ea', 25.00),
  ('HM708', 'Carbon Monoxide', 'Install CO detector', 'labor', 'ea', 85.00),

  -- Organization and Storage (HM750-HM799)
  ('HM750', 'Garage Organizer', 'Install garage storage', 'labor', 'hour', 75.00),
  ('HM751', 'Pegboard Install', 'Mount pegboard system', 'labor', 'sf', 12.00),
  ('HM752', 'Storage Shelf', 'Install storage shelving', 'labor', 'unit', 125.00),
  ('HM753', 'Overhead Storage', 'Install ceiling storage', 'labor', 'unit', 285.00),
  ('HM754', 'Bike Rack', 'Install bike storage', 'labor', 'ea', 85.00),
  ('HM755', 'Tool Rack', 'Install tool organizer', 'labor', 'ea', 65.00),
  ('HM756', 'Coat Hooks', 'Install wall hooks', 'labor', 'ea', 25.00),
  ('HM757', 'Shoe Rack', 'Install shoe storage', 'labor', 'ea', 85.00),

  -- Holiday and Seasonal (HM800-HM849)
  ('HM800', 'Holiday Lights', 'Install holiday lights', 'service', 'hour', 85.00),
  ('HM801', 'Light Removal', 'Remove holiday lights', 'service', 'hour', 65.00),
  ('HM802', 'Decoration Install', 'Install decorations', 'service', 'hour', 75.00),
  ('HM803', 'Storm Prep', 'Storm preparation work', 'service', 'hour', 95.00),
  ('HM804', 'Winterization', 'Winterize fixtures', 'service', 'ls', 285.00),
  ('HM805', 'AC Cover Install', 'Install AC unit cover', 'labor', 'ea', 65.00),

  -- Smart Home (HM850-HM899)
  ('HM850', 'Smart Doorbell', 'Install video doorbell', 'labor', 'ea', 165.00),
  ('HM851', 'Smart Lock', 'Install smart lock', 'labor', 'ea', 185.00),
  ('HM852', 'Smart Thermostat', 'Install smart thermostat', 'labor', 'ea', 225.00),
  ('HM853', 'Smart Switch', 'Install smart switch', 'labor', 'ea', 125.00),
  ('HM854', 'WiFi Extender', 'Install network extender', 'labor', 'ea', 85.00),
  ('HM855', 'Security Camera', 'Install security cam', 'labor', 'ea', 185.00),
  ('HM856', 'Smart Speaker Mount', 'Mount smart speakers', 'labor', 'ea', 65.00),

  -- Miscellaneous (HM900-HM999)
  ('HM900', 'Honey-Do List', 'Multiple small tasks', 'service', 'hour', 65.00),
  ('HM901', 'Property Check', 'Vacant property check', 'service', 'visit', 85.00),
  ('HM902', 'Rental Prep', 'Prepare rental unit', 'service', 'hour', 75.00),
  ('HM903', 'Move-In Prep', 'New home preparation', 'service', 'hour', 75.00),
  ('HM904', 'Senior Assistance', 'Help elderly residents', 'service', 'hour', 55.00),
  ('HM905', 'Package Waiting', 'Wait for deliveries', 'service', 'hour', 45.00),
  ('HM906', 'Odd Jobs', 'Miscellaneous tasks', 'service', 'hour', 65.00),
  ('HM907', 'Project Planning', 'Plan larger projects', 'service', 'hour', 85.00),
  ('HM908', 'Material Pickup', 'Get supplies for client', 'service', 'trip', 65.00),
  ('HM909', 'Disposal Run', 'Haul away debris', 'service', 'load', 125.00),
  ('HM910', 'Tool Rental', 'Special tool rental', 'equipment', 'day', 85.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_handyman ON cost_codes(code) WHERE code LIKE 'HM%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for handyman services including repairs, maintenance, and general home improvement tasks';