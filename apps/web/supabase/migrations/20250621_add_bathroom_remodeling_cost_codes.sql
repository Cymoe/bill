-- Bathroom Remodeling Cost Codes Migration
-- Comprehensive cost codes for bathroom remodeling contractors

-- Insert Bathroom Remodeling Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'bathroom-remodeling'),
  NULL
FROM (VALUES
  -- Design and Planning (BR001-BR099)
  ('BR001', 'Bathroom Design', 'Professional bathroom design', 'service', 'ls', 1500.00),
  ('BR002', '3D Rendering', 'Photorealistic 3D design', 'service', 'ls', 650.00),
  ('BR003', 'Space Planning', 'Layout optimization', 'service', 'hour', 95.00),
  ('BR004', 'Material Selection', 'Finishes and fixtures selection', 'service', 'hour', 85.00),
  ('BR005', 'Permit Drawings', 'Construction drawings for permits', 'service', 'ls', 850.00),
  ('BR006', 'ADA Compliance', 'Accessibility design consultation', 'service', 'ls', 450.00),
  ('BR007', 'Project Management', 'Full project coordination', 'service', 'week', 650.00),
  ('BR008', 'Budget Planning', 'Cost estimation service', 'service', 'ls', 350.00),

  -- Labor Categories (BR100-BR199)
  ('BR100', 'Lead Contractor', 'Master bathroom contractor', 'labor', 'hour', 85.00),
  ('BR101', 'Tile Installer', 'Tile installation specialist', 'labor', 'hour', 65.00),
  ('BR102', 'Plumber', 'Licensed plumber', 'labor', 'hour', 95.00),
  ('BR103', 'Electrician', 'Licensed electrician', 'labor', 'hour', 95.00),
  ('BR104', 'Carpenter', 'Finish carpenter', 'labor', 'hour', 65.00),
  ('BR105', 'Painter', 'Professional painter', 'labor', 'hour', 55.00),
  ('BR106', 'Helper', 'General labor assistant', 'labor', 'hour', 45.00),
  ('BR107', 'Demo Crew', 'Demolition team', 'labor', 'hour', 125.00),

  -- Vanities and Cabinets (BR200-BR249)
  ('BR200', 'Vanity - 24" Single', 'Small single sink vanity', 'material', 'ea', 485.00),
  ('BR201', 'Vanity - 36" Single', 'Standard single vanity', 'material', 'ea', 685.00),
  ('BR202', 'Vanity - 48" Single', 'Large single vanity', 'material', 'ea', 885.00),
  ('BR203', 'Vanity - 60" Double', 'Double sink vanity', 'material', 'ea', 1450.00),
  ('BR204', 'Vanity - 72" Double', 'Large double vanity', 'material', 'ea', 1850.00),
  ('BR205', 'Vanity - Custom', 'Custom built vanity', 'material', 'lf', 485.00),
  ('BR206', 'Medicine Cabinet', 'Mirrored medicine cabinet', 'material', 'ea', 285.00),
  ('BR207', 'Linen Cabinet', 'Tall storage cabinet', 'material', 'ea', 685.00),
  ('BR208', 'Wall Cabinet', 'Wall mounted storage', 'material', 'ea', 385.00),
  ('BR209', 'Vanity Installation', 'Vanity install labor', 'labor', 'ea', 285.00),
  ('BR210', 'Cabinet Hardware', 'Knobs and pulls', 'material', 'ea', 8.50),

  -- Countertops (BR250-BR299)
  ('BR250', 'Granite Countertop', 'Natural granite top', 'material', 'sf', 65.00),
  ('BR251', 'Quartz Countertop', 'Engineered quartz top', 'material', 'sf', 75.00),
  ('BR252', 'Marble Countertop', 'Natural marble top', 'material', 'sf', 95.00),
  ('BR253', 'Solid Surface', 'Corian-style countertop', 'material', 'sf', 55.00),
  ('BR254', 'Laminate Top', 'Laminate countertop', 'material', 'sf', 25.00),
  ('BR255', 'Concrete Top', 'Custom concrete top', 'material', 'sf', 85.00),
  ('BR256', 'Wood Top', 'Butcher block top', 'material', 'sf', 45.00),
  ('BR257', 'Sink Cutout', 'Countertop sink cutout', 'labor', 'ea', 185.00),
  ('BR258', 'Edge Treatment', 'Decorative edge profile', 'material', 'lf', 15.00),
  ('BR259', 'Backsplash', '4" standard backsplash', 'material', 'lf', 12.00),
  ('BR260', 'Counter Install', 'Installation labor', 'labor', 'sf', 25.00),

  -- Sinks and Faucets (BR300-BR349)
  ('BR300', 'Sink - Undermount', 'Undermount lavatory sink', 'material', 'ea', 285.00),
  ('BR301', 'Sink - Vessel', 'Vessel bowl sink', 'material', 'ea', 385.00),
  ('BR302', 'Sink - Pedestal', 'Pedestal sink complete', 'material', 'ea', 325.00),
  ('BR303', 'Sink - Wall Mount', 'Wall mounted sink', 'material', 'ea', 425.00),
  ('BR304', 'Sink - Console', 'Console sink with legs', 'material', 'ea', 685.00),
  ('BR305', 'Faucet - Standard', 'Basic bathroom faucet', 'material', 'ea', 185.00),
  ('BR306', 'Faucet - Widespread', 'Widespread faucet set', 'material', 'ea', 325.00),
  ('BR307', 'Faucet - Wall Mount', 'Wall mounted faucet', 'material', 'ea', 485.00),
  ('BR308', 'Faucet - Waterfall', 'Waterfall style faucet', 'material', 'ea', 425.00),
  ('BR309', 'Sink Installation', 'Sink install and hookup', 'labor', 'ea', 225.00),

  -- Toilets and Bidets (BR350-BR399)
  ('BR350', 'Toilet - Standard', 'Standard height toilet', 'material', 'ea', 285.00),
  ('BR351', 'Toilet - Comfort Height', 'ADA height toilet', 'material', 'ea', 385.00),
  ('BR352', 'Toilet - One Piece', 'One piece toilet', 'material', 'ea', 585.00),
  ('BR353', 'Toilet - Wall Hung', 'Wall mounted toilet', 'material', 'ea', 885.00),
  ('BR354', 'Toilet - Smart', 'Bidet toilet combo', 'material', 'ea', 2850.00),
  ('BR355', 'Bidet - Traditional', 'Standalone bidet', 'material', 'ea', 685.00),
  ('BR356', 'Bidet Seat', 'Bidet toilet seat', 'material', 'ea', 485.00),
  ('BR357', 'Toilet Installation', 'Toilet install labor', 'labor', 'ea', 285.00),
  ('BR358', 'Wax Ring', 'Toilet wax seal', 'material', 'ea', 12.00),
  ('BR359', 'Shut-off Valve', 'Toilet supply valve', 'material', 'ea', 45.00),

  -- Showers and Tubs (BR400-BR449)
  ('BR400', 'Tub - Standard', 'Standard alcove tub', 'material', 'ea', 485.00),
  ('BR401', 'Tub - Soaking', 'Deep soaking tub', 'material', 'ea', 885.00),
  ('BR402', 'Tub - Freestanding', 'Freestanding tub', 'material', 'ea', 1850.00),
  ('BR403', 'Tub - Whirlpool', 'Jetted whirlpool tub', 'material', 'ea', 2250.00),
  ('BR404', 'Tub - Clawfoot', 'Clawfoot style tub', 'material', 'ea', 2850.00),
  ('BR405', 'Shower Base - Acrylic', 'Acrylic shower pan', 'material', 'ea', 385.00),
  ('BR406', 'Shower Base - Tile Ready', 'Tile-ready shower pan', 'material', 'ea', 485.00),
  ('BR407', 'Shower Base - Custom', 'Custom tile shower base', 'labor', 'sf', 45.00),
  ('BR408', 'Shower Door - Sliding', 'Sliding glass door', 'material', 'ea', 685.00),
  ('BR409', 'Shower Door - Pivot', 'Pivot shower door', 'material', 'ea', 585.00),
  ('BR410', 'Shower Door - Frameless', 'Frameless glass door', 'material', 'ea', 1250.00),
  ('BR411', 'Shower Enclosure', 'Full glass enclosure', 'material', 'ea', 2850.00),
  ('BR412', 'Tub/Shower Combo', 'One piece tub/shower', 'material', 'ea', 885.00),
  ('BR413', 'Steam Shower', 'Steam shower system', 'material', 'ea', 4850.00),
  ('BR414', 'Tub Installation', 'Bathtub install labor', 'labor', 'ea', 485.00),
  ('BR415', 'Shower Installation', 'Shower base install', 'labor', 'ea', 685.00),

  -- Shower Systems (BR450-BR499)
  ('BR450', 'Shower Valve', 'Pressure balance valve', 'material', 'ea', 285.00),
  ('BR451', 'Thermostatic Valve', 'Thermostatic mixing valve', 'material', 'ea', 485.00),
  ('BR452', 'Shower Head - Standard', 'Fixed shower head', 'material', 'ea', 85.00),
  ('BR453', 'Shower Head - Rain', 'Rainfall shower head', 'material', 'ea', 285.00),
  ('BR454', 'Handheld Shower', 'Handheld shower set', 'material', 'ea', 125.00),
  ('BR455', 'Body Sprays', 'Multiple body sprays', 'material', 'ea', 185.00),
  ('BR456', 'Shower System', 'Complete shower system', 'material', 'set', 1250.00),
  ('BR457', 'Tub Filler', 'Tub filler faucet', 'material', 'ea', 485.00),
  ('BR458', 'Tub Filler - Freestanding', 'Floor mount tub filler', 'material', 'ea', 885.00),
  ('BR459', 'Shower Niche', 'Tiled shower niche', 'labor', 'ea', 285.00),

  -- Tile Work (BR500-BR549)
  ('BR500', 'Floor Tile - Ceramic', 'Ceramic floor tile', 'material', 'sf', 4.50),
  ('BR501', 'Floor Tile - Porcelain', 'Porcelain floor tile', 'material', 'sf', 6.50),
  ('BR502', 'Floor Tile - Natural Stone', 'Marble/granite tile', 'material', 'sf', 12.00),
  ('BR503', 'Wall Tile - Subway', 'Classic subway tile', 'material', 'sf', 8.50),
  ('BR504', 'Wall Tile - Mosaic', 'Decorative mosaic tile', 'material', 'sf', 18.00),
  ('BR505', 'Wall Tile - Large Format', 'Large format wall tile', 'material', 'sf', 12.00),
  ('BR506', 'Shower Tile', 'Shower wall tile', 'material', 'sf', 10.00),
  ('BR507', 'Accent Tile', 'Decorative accent band', 'material', 'lf', 25.00),
  ('BR508', 'Tile Installation', 'Tile installation labor', 'labor', 'sf', 12.00),
  ('BR509', 'Waterproofing', 'Shower waterproofing', 'material', 'sf', 3.50),
  ('BR510', 'Tile Prep', 'Surface preparation', 'labor', 'sf', 4.50),
  ('BR511', 'Grout', 'Tile grout material', 'material', 'bag', 18.00),
  ('BR512', 'Grout Sealing', 'Grout sealer application', 'service', 'sf', 1.50),
  ('BR513', 'Heated Floor', 'Electric floor heating', 'material', 'sf', 15.00),

  -- Lighting and Electrical (BR550-BR599)
  ('BR550', 'Vanity Light - 2 Light', 'Two light vanity fixture', 'material', 'ea', 185.00),
  ('BR551', 'Vanity Light - 3 Light', 'Three light vanity fixture', 'material', 'ea', 285.00),
  ('BR552', 'Vanity Light - LED Bar', 'LED vanity light bar', 'material', 'ea', 385.00),
  ('BR553', 'Ceiling Light', 'Bathroom ceiling fixture', 'material', 'ea', 225.00),
  ('BR554', 'Recessed Lights', 'Shower safe can lights', 'material', 'ea', 125.00),
  ('BR555', 'Exhaust Fan', 'Bathroom ventilation fan', 'material', 'ea', 185.00),
  ('BR556', 'Fan/Light Combo', 'Fan with light combo', 'material', 'ea', 285.00),
  ('BR557', 'Fan/Light/Heat', 'Fan with light and heater', 'material', 'ea', 385.00),
  ('BR558', 'GFCI Outlet', 'GFCI protected outlet', 'material', 'ea', 85.00),
  ('BR559', 'Light Installation', 'Light fixture install', 'labor', 'ea', 125.00),
  ('BR560', 'Outlet Addition', 'Add new outlet', 'labor', 'ea', 225.00),
  ('BR561', 'Switch Upgrade', 'Dimmer/timer switch', 'labor', 'ea', 125.00),

  -- Accessories (BR600-BR649)
  ('BR600', 'Towel Bar - 18"', 'Single towel bar', 'material', 'ea', 65.00),
  ('BR601', 'Towel Bar - 24"', 'Standard towel bar', 'material', 'ea', 85.00),
  ('BR602', 'Towel Ring', 'Hand towel ring', 'material', 'ea', 55.00),
  ('BR603', 'Robe Hook', 'Double robe hook', 'material', 'ea', 35.00),
  ('BR604', 'Toilet Paper Holder', 'TP holder', 'material', 'ea', 45.00),
  ('BR605', 'Grab Bar - 24"', 'ADA grab bar', 'material', 'ea', 85.00),
  ('BR606', 'Grab Bar - 36"', 'Long grab bar', 'material', 'ea', 125.00),
  ('BR607', 'Shower Shelf', 'Corner shower shelf', 'material', 'ea', 65.00),
  ('BR608', 'Shower Caddy', 'Hanging shower caddy', 'material', 'ea', 125.00),
  ('BR609', 'Mirror - Standard', 'Bathroom mirror', 'material', 'ea', 185.00),
  ('BR610', 'Mirror - Framed', 'Decorative framed mirror', 'material', 'ea', 385.00),
  ('BR611', 'Mirror - LED', 'LED illuminated mirror', 'material', 'ea', 685.00),
  ('BR612', 'Accessory Install', 'Install bath accessories', 'labor', 'ea', 35.00),

  -- Flooring (BR650-BR699)
  ('BR650', 'Vinyl Plank', 'Waterproof vinyl plank', 'material', 'sf', 4.50),
  ('BR651', 'Ceramic Tile', 'Ceramic floor tile', 'material', 'sf', 5.50),
  ('BR652', 'Porcelain Tile', 'Porcelain floor tile', 'material', 'sf', 7.50),
  ('BR653', 'Natural Stone', 'Stone floor tile', 'material', 'sf', 12.00),
  ('BR654', 'Heated Floor Mat', 'Electric floor heating', 'material', 'sf', 15.00),
  ('BR655', 'Floor Prep', 'Floor leveling/prep', 'labor', 'sf', 3.50),
  ('BR656', 'Floor Installation', 'Flooring install labor', 'labor', 'sf', 5.50),
  ('BR657', 'Baseboard', 'Baseboard trim', 'material', 'lf', 4.50),
  ('BR658', 'Transition Strip', 'Floor transition', 'material', 'ea', 35.00),

  -- Plumbing Rough-In (BR700-BR749)
  ('BR700', 'Water Lines', 'Hot/cold water lines', 'labor', 'fixture', 285.00),
  ('BR701', 'Drain Lines', 'Waste drain lines', 'labor', 'fixture', 325.00),
  ('BR702', 'Vent Lines', 'Plumbing vent lines', 'labor', 'fixture', 225.00),
  ('BR703', 'Valve Replacement', 'Replace shut-off valves', 'labor', 'ea', 125.00),
  ('BR704', 'Pipe Insulation', 'Insulate water lines', 'material', 'lf', 4.50),
  ('BR705', 'Access Panel', 'Plumbing access panel', 'material', 'ea', 125.00),

  -- Windows and Ventilation (BR750-BR799)
  ('BR750', 'Window - Standard', 'Privacy glass window', 'material', 'ea', 485.00),
  ('BR751', 'Window - Egress', 'Code compliant window', 'material', 'ea', 685.00),
  ('BR752', 'Skylight', 'Bathroom skylight', 'material', 'ea', 1250.00),
  ('BR753', 'Window Treatment', 'Blinds or shades', 'material', 'ea', 185.00),
  ('BR754', 'Window Install', 'Window installation', 'labor', 'ea', 385.00),

  -- Finishing Work (BR800-BR849)
  ('BR800', 'Drywall - Standard', 'Moisture resistant drywall', 'material', 'sf', 2.50),
  ('BR801', 'Drywall - Mold Resistant', 'Mold resistant board', 'material', 'sf', 3.50),
  ('BR802', 'Drywall Installation', 'Hang and finish drywall', 'labor', 'sf', 4.50),
  ('BR803', 'Wall Texture', 'Apply wall texture', 'labor', 'sf', 2.50),
  ('BR804', 'Interior Painting', 'Paint walls and ceiling', 'labor', 'sf', 2.25),
  ('BR805', 'Trim Work', 'Install trim and molding', 'labor', 'lf', 8.50),
  ('BR806', 'Door - Standard', 'Interior bathroom door', 'material', 'ea', 285.00),
  ('BR807', 'Door - Pocket', 'Space saving pocket door', 'material', 'ea', 485.00),
  ('BR808', 'Door - Barn', 'Sliding barn door', 'material', 'ea', 685.00),
  ('BR809', 'Door Installation', 'Door install labor', 'labor', 'ea', 285.00),
  ('BR810', 'Clean-up', 'Daily job site cleanup', 'labor', 'day', 125.00),
  ('BR811', 'Final Cleaning', 'Post-construction cleaning', 'service', 'ls', 385.00),

  -- Specialty Features (BR850-BR899)
  ('BR850', 'Towel Warmer', 'Heated towel rack', 'material', 'ea', 685.00),
  ('BR851', 'TV Installation', 'Waterproof TV install', 'material', 'ea', 1850.00),
  ('BR852', 'Sound System', 'In-ceiling speakers', 'material', 'pr', 485.00),
  ('BR853', 'Bench Seat', 'Built-in shower bench', 'labor', 'ea', 485.00),
  ('BR854', 'Storage Niche', 'Built-in storage niche', 'labor', 'ea', 385.00),
  ('BR855', 'Makeup Vanity', 'Seated makeup area', 'material', 'lf', 485.00),

  -- Demolition (BR900-BR949)
  ('BR900', 'Full Demo', 'Complete bathroom demo', 'labor', 'ls', 1850.00),
  ('BR901', 'Fixture Removal', 'Remove fixtures', 'labor', 'ea', 85.00),
  ('BR902', 'Tile Removal', 'Remove old tile', 'labor', 'sf', 4.50),
  ('BR903', 'Tub Removal', 'Remove and dispose tub', 'labor', 'ea', 285.00),
  ('BR904', 'Disposal Fee', 'Debris disposal', 'service', 'load', 385.00),

  -- Miscellaneous (BR950-BR999)
  ('BR950', 'Permit Fees', 'Building permits', 'service', 'ls', 485.00),
  ('BR951', 'Delivery Fee', 'Material delivery', 'service', 'trip', 125.00),
  ('BR952', 'Protection', 'Floor/wall protection', 'material', 'ls', 185.00),
  ('BR953', 'Mold Remediation', 'Mold treatment', 'service', 'sf', 8.50),
  ('BR954', 'Lead Paint', 'Lead paint abatement', 'service', 'sf', 12.00),
  ('BR955', 'Asbestos', 'Asbestos abatement', 'service', 'sf', 15.00),
  ('BR956', 'Warranty', 'Extended warranty', 'service', 'year', 385.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_bathroom ON cost_codes(code) WHERE code LIKE 'BR%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for bathroom remodeling including fixtures, tile work, plumbing, and complete renovations';