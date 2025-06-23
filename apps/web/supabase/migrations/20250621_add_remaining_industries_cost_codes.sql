-- Remaining Industries Cost Codes Migration
-- Includes all remaining industries to complete the comprehensive cost code system

-- COMMERCIAL CONSTRUCTION (CC prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'commercial-construction'),
  NULL
FROM (VALUES
  ('CC001', 'Project Management', 'Commercial PM services', 'service', 'month', 8500.00),
  ('CC100', 'Superintendent', 'Site superintendent', 'labor', 'month', 12000.00),
  ('CC200', 'Steel Erection', 'Structural steel', 'subcontractor', 'ton', 2850.00),
  ('CC300', 'Curtain Wall', 'Glass curtain wall', 'material', 'sf', 85.00),
  ('CC400', 'Elevator Install', 'Elevator system', 'subcontractor', 'stop', 85000.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- RESIDENTIAL CONSTRUCTION (RC prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'residential-construction'),
  NULL
FROM (VALUES
  ('RC001', 'Home Design', 'Custom home design', 'service', 'sf', 3.50),
  ('RC100', 'Site Supervisor', 'Residential supervisor', 'labor', 'week', 2850.00),
  ('RC200', 'Foundation System', 'Complete foundation', 'subcontractor', 'sf', 18.00),
  ('RC300', 'Framing Package', 'Complete framing', 'material', 'sf', 25.00),
  ('RC400', 'Finish Package', 'Interior finishes', 'subcontractor', 'sf', 85.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- REAL ESTATE INVESTMENT (RE prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'real-estate-investment'),
  NULL
FROM (VALUES
  ('RE001', 'Property Analysis', 'Investment analysis', 'service', 'property', 1850.00),
  ('RE002', 'Market Study', 'Market analysis report', 'service', 'ls', 3850.00),
  ('RE100', 'Acquisition Fee', 'Purchase coordination', 'service', 'property', 0.02),
  ('RE200', 'Asset Management', 'Portfolio management', 'service', 'month', 0.01),
  ('RE300', 'Disposition Fee', 'Sales coordination', 'service', 'property', 0.03)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- GARAGE DOOR SERVICES (GD prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'garage-door'),
  NULL
FROM (VALUES
  ('GD001', 'Service Call', 'Diagnostic service', 'service', 'ls', 95.00),
  ('GD100', 'Spring Replace', 'Torsion spring replacement', 'material', 'pr', 385.00),
  ('GD200', 'Opener Repair', 'Opener motor repair', 'labor', 'ea', 285.00),
  ('GD300', 'Door Install - Single', 'Single car door', 'material', 'ea', 1850.00),
  ('GD400', 'Remote Program', 'Remote programming', 'service', 'ea', 65.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- FENCE SERVICES (FN prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'fence-services'),
  NULL
FROM (VALUES
  ('FN001', 'Fence Estimate', 'Design and estimate', 'service', 'ls', 125.00),
  ('FN100', 'Wood Fence - 6ft', 'Privacy fence install', 'material', 'lf', 35.00),
  ('FN200', 'Chain Link - 4ft', 'Chain link install', 'material', 'lf', 18.00),
  ('FN300', 'Vinyl Fence', 'Vinyl fence install', 'material', 'lf', 45.00),
  ('FN400', 'Gate Install', 'Gate installation', 'material', 'ea', 485.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- INSULATION (IN prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'insulation'),
  NULL
FROM (VALUES
  ('IN001', 'Energy Audit', 'Home energy assessment', 'service', 'ls', 385.00),
  ('IN100', 'Blown Insulation', 'Attic blown insulation', 'material', 'sf', 1.85),
  ('IN200', 'Batt Insulation', 'Wall batt insulation', 'material', 'sf', 1.45),
  ('IN300', 'Spray Foam', 'Spray foam insulation', 'material', 'sf', 3.85),
  ('IN400', 'Air Sealing', 'Air infiltration sealing', 'labor', 'hour', 95.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- WATERPROOFING (WP prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'waterproofing'),
  NULL
FROM (VALUES
  ('WP001', 'Water Test', 'Water intrusion testing', 'service', 'ls', 485.00),
  ('WP100', 'Foundation Seal', 'Exterior waterproofing', 'material', 'lf', 125.00),
  ('WP200', 'French Drain', 'Interior drain system', 'material', 'lf', 85.00),
  ('WP300', 'Sump Pump', 'Sump pump installation', 'material', 'ea', 1250.00),
  ('WP400', 'Crack Injection', 'Foundation crack repair', 'material', 'lf', 85.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- SIDING (SD prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'siding'),
  NULL
FROM (VALUES
  ('SD001', 'Siding Estimate', 'Measurement and estimate', 'service', 'ls', 285.00),
  ('SD100', 'Vinyl Siding', 'Vinyl siding install', 'material', 'sq', 485.00),
  ('SD200', 'Fiber Cement', 'Hardie board install', 'material', 'sq', 685.00),
  ('SD300', 'Wood Siding', 'Cedar siding install', 'material', 'sq', 885.00),
  ('SD400', 'Siding Repair', 'Siding repair service', 'labor', 'sf', 8.50)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- CARPET CLEANING (CT prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'carpet-cleaning'),
  NULL
FROM (VALUES
  ('CT001', 'Carpet Clean - Basic', 'Standard carpet cleaning', 'service', 'room', 45.00),
  ('CT100', 'Pet Treatment', 'Pet odor/stain treatment', 'service', 'room', 85.00),
  ('CT200', 'Upholstery - Sofa', 'Sofa cleaning', 'service', 'ea', 125.00),
  ('CT300', 'Area Rug', 'Area rug cleaning', 'service', 'sf', 2.50),
  ('CT400', 'Scotchgard', 'Fabric protection', 'service', 'room', 35.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- JANITORIAL SERVICES (JN prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'janitorial'),
  NULL
FROM (VALUES
  ('JN001', 'Office Clean - Daily', 'Daily office cleaning', 'service', 'sf', 0.08),
  ('JN100', 'Floor Care', 'Strip and wax floors', 'service', 'sf', 0.45),
  ('JN200', 'Window Clean', 'Interior window cleaning', 'service', 'pane', 1.50),
  ('JN300', 'Restroom Service', 'Restroom deep clean', 'service', 'fixture', 25.00),
  ('JN400', 'Supply Restock', 'Janitorial supplies', 'material', 'month', 185.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- CHIMNEY SWEEP (CH prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'chimney-sweep'),
  NULL
FROM (VALUES
  ('CH001', 'Chimney Inspection', 'Level 1 inspection', 'service', 'ls', 185.00),
  ('CH100', 'Chimney Cleaning', 'Standard chimney sweep', 'service', 'flue', 285.00),
  ('CH200', 'Cap Install', 'Chimney cap installation', 'material', 'ea', 385.00),
  ('CH300', 'Liner Install', 'Chimney liner installation', 'material', 'lf', 125.00),
  ('CH400', 'Tuckpointing', 'Chimney brick repair', 'labor', 'sf', 18.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- JUNK REMOVAL (JR prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'junk-removal'),
  NULL
FROM (VALUES
  ('JR001', 'Minimum Load', 'Minimum service charge', 'service', 'ls', 125.00),
  ('JR100', 'Quarter Load', '1/4 truck load', 'service', 'load', 285.00),
  ('JR200', 'Half Load', '1/2 truck load', 'service', 'load', 425.00),
  ('JR300', 'Full Load', 'Full truck load', 'service', 'load', 685.00),
  ('JR400', 'Appliance Removal', 'Large appliance haul', 'service', 'ea', 125.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- SNOW REMOVAL (SN prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'snow-removal'),
  NULL
FROM (VALUES
  ('SN001', 'Seasonal Contract', 'Season snow contract', 'service', 'season', 1850.00),
  ('SN100', 'Per Push - Res', 'Residential plowing', 'service', 'push', 85.00),
  ('SN200', 'Per Push - Com', 'Commercial plowing', 'service', 'hour', 185.00),
  ('SN300', 'Salt Application', 'Ice melt application', 'material', 'bag', 35.00),
  ('SN400', 'Sidewalk Clear', 'Sidewalk shoveling', 'labor', 'hour', 65.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- IRRIGATION SERVICES (IR prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'irrigation'),
  NULL
FROM (VALUES
  ('IR001', 'Spring Startup', 'System activation', 'service', 'ls', 185.00),
  ('IR100', 'Winterization', 'System blowout', 'service', 'ls', 165.00),
  ('IR200', 'Head Replace', 'Sprinkler head replace', 'material', 'ea', 65.00),
  ('IR300', 'Zone Install', 'New zone installation', 'material', 'zone', 885.00),
  ('IR400', 'Controller', 'Smart controller install', 'material', 'ea', 485.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- PAVING (PV prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'paving'),
  NULL
FROM (VALUES
  ('PV001', 'Driveway Estimate', 'Paving consultation', 'service', 'ls', 185.00),
  ('PV100', 'Asphalt - New', 'New asphalt paving', 'material', 'sf', 4.50),
  ('PV200', 'Asphalt - Overlay', 'Asphalt overlay', 'material', 'sf', 3.50),
  ('PV300', 'Sealcoating', 'Asphalt sealcoating', 'material', 'sf', 0.35),
  ('PV400', 'Crack Filling', 'Crack seal repair', 'material', 'lf', 2.50)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- EXCAVATION (EX prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'excavation'),
  NULL
FROM (VALUES
  ('EX001', 'Site Evaluation', 'Excavation planning', 'service', 'ls', 485.00),
  ('EX100', 'Machine Time', 'Excavator hourly rate', 'equipment', 'hour', 185.00),
  ('EX200', 'Trenching', 'Utility trenching', 'labor', 'lf', 25.00),
  ('EX300', 'Grading', 'Site grading work', 'labor', 'sf', 2.50),
  ('EX400', 'Hauling', 'Material hauling', 'equipment', 'load', 285.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- LOCKSMITH SERVICES (LK prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'locksmith'),
  NULL
FROM (VALUES
  ('LK001', 'Service Call', 'Standard service call', 'service', 'ls', 85.00),
  ('LK100', 'Rekey Lock', 'Rekey existing lock', 'service', 'cylinder', 35.00),
  ('LK200', 'Lock Install', 'New lock installation', 'material', 'ea', 185.00),
  ('LK300', 'Emergency Lockout', '24/7 lockout service', 'service', 'ls', 185.00),
  ('LK400', 'Safe Opening', 'Safe lockout service', 'service', 'hour', 285.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- SECURITY SYSTEMS (SS prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'security-systems'),
  NULL
FROM (VALUES
  ('SS001', 'System Design', 'Security consultation', 'service', 'ls', 285.00),
  ('SS100', 'Control Panel', 'Alarm control panel', 'material', 'ea', 685.00),
  ('SS200', 'Door Sensor', 'Door/window sensor', 'material', 'ea', 85.00),
  ('SS300', 'Camera Install', 'Security camera', 'material', 'ea', 285.00),
  ('SS400', 'Monitoring', 'Monthly monitoring', 'service', 'month', 45.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- HOME AUTOMATION (HA prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'home-automation'),
  NULL
FROM (VALUES
  ('HA001', 'Smart Home Consult', 'System planning', 'service', 'hour', 125.00),
  ('HA100', 'Hub Install', 'Smart hub setup', 'material', 'ea', 485.00),
  ('HA200', 'Smart Switch', 'Smart switch install', 'material', 'ea', 185.00),
  ('HA300', 'Smart Thermostat', 'Thermostat install', 'material', 'ea', 385.00),
  ('HA400', 'Integration', 'System integration', 'service', 'hour', 125.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- FIRE PROTECTION (FP prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'fire-protection'),
  NULL
FROM (VALUES
  ('FP001', 'Fire Inspection', 'Annual inspection', 'service', 'system', 285.00),
  ('FP100', 'Sprinkler Head', 'Sprinkler replacement', 'material', 'ea', 125.00),
  ('FP200', 'Fire Alarm', 'Alarm system install', 'material', 'device', 285.00),
  ('FP300', 'Extinguisher', 'Fire extinguisher', 'material', 'ea', 85.00),
  ('FP400', 'Monitoring', 'Fire monitoring', 'service', 'month', 85.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- ELEVATOR SERVICES (EV prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'elevator-services'),
  NULL
FROM (VALUES
  ('EV001', 'Monthly Service', 'Maintenance contract', 'service', 'month', 485.00),
  ('EV100', 'Emergency Call', '24/7 emergency service', 'service', 'hour', 285.00),
  ('EV200', 'Modernization', 'Elevator modernization', 'service', 'ls', 85000.00),
  ('EV300', 'State Test', 'Annual state test', 'service', 'ls', 850.00),
  ('EV400', 'Parts', 'Replacement parts', 'material', 'ls', 0.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- WELL WATER SERVICES (WW prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'well-water'),
  NULL
FROM (VALUES
  ('WW001', 'Well Inspection', 'Well system inspection', 'service', 'ls', 385.00),
  ('WW100', 'Pump Replace', 'Well pump replacement', 'material', 'ea', 2850.00),
  ('WW200', 'Pressure Tank', 'Pressure tank install', 'material', 'ea', 885.00),
  ('WW300', 'Water Testing', 'Water quality test', 'service', 'test', 285.00),
  ('WW400', 'Well Drilling', 'New well drilling', 'labor', 'ft', 45.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- SEPTIC SERVICES (SP prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'septic-services'),
  NULL
FROM (VALUES
  ('SP001', 'Septic Inspection', 'System inspection', 'service', 'ls', 485.00),
  ('SP100', 'Tank Pumping', 'Septic tank pumping', 'service', 'gal', 0.35),
  ('SP200', 'Baffle Repair', 'Tank baffle repair', 'labor', 'ea', 485.00),
  ('SP300', 'Field Repair', 'Drain field repair', 'labor', 'sf', 18.00),
  ('SP400', 'System Install', 'New septic system', 'material', 'ls', 18500.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- RESTORATION SERVICES (RS prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'restoration'),
  NULL
FROM (VALUES
  ('RS001', 'Emergency Response', '24/7 emergency service', 'service', 'hour', 185.00),
  ('RS100', 'Water Extraction', 'Water removal service', 'service', 'sf', 3.50),
  ('RS200', 'Drying Equipment', 'Dehumidifier rental', 'equipment', 'day', 125.00),
  ('RS300', 'Mold Remediation', 'Mold removal service', 'service', 'sf', 8.50),
  ('RS400', 'Fire Cleanup', 'Fire damage cleanup', 'service', 'sf', 12.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- DEMOLITION (DM prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'demolition'),
  NULL
FROM (VALUES
  ('DM001', 'Demo Permit', 'Demolition permit', 'service', 'ls', 850.00),
  ('DM100', 'Interior Demo', 'Interior demolition', 'labor', 'sf', 4.50),
  ('DM200', 'Structure Demo', 'Complete building demo', 'labor', 'sf', 8.50),
  ('DM300', 'Concrete Demo', 'Concrete removal', 'equipment', 'sf', 12.00),
  ('DM400', 'Disposal', 'Debris disposal', 'service', 'ton', 125.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- FOUNDATION REPAIR (FR prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'foundation-repair'),
  NULL
FROM (VALUES
  ('FR001', 'Foundation Inspection', 'Structural evaluation', 'service', 'ls', 485.00),
  ('FR100', 'Pier Installation', 'Foundation pier', 'material', 'ea', 1250.00),
  ('FR200', 'Slab Lifting', 'Concrete lifting', 'material', 'sf', 8.50),
  ('FR300', 'Crack Repair', 'Foundation crack seal', 'material', 'lf', 85.00),
  ('FR400', 'Wall Anchors', 'Wall anchor system', 'material', 'ea', 685.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- MECHANICAL CONTRACTING (MC prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'mechanical'),
  NULL
FROM (VALUES
  ('MC001', 'System Design', 'Mechanical system design', 'service', 'hour', 185.00),
  ('MC100', 'Boiler Install', 'Commercial boiler', 'material', 'ton', 8500.00),
  ('MC200', 'Chiller Install', 'Chiller installation', 'material', 'ton', 12500.00),
  ('MC300', 'Piping', 'Mechanical piping', 'material', 'lf', 85.00),
  ('MC400', 'Controls', 'Building automation', 'material', 'point', 485.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- AUTO DETAILING (AD prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'auto-detailing'),
  NULL
FROM (VALUES
  ('AD001', 'Basic Wash', 'Exterior wash/dry', 'service', 'vehicle', 35.00),
  ('AD100', 'Full Detail', 'Complete detailing', 'service', 'vehicle', 285.00),
  ('AD200', 'Interior Only', 'Interior deep clean', 'service', 'vehicle', 185.00),
  ('AD300', 'Paint Correction', 'Paint polishing', 'service', 'vehicle', 485.00),
  ('AD400', 'Ceramic Coating', 'Ceramic protection', 'material', 'vehicle', 885.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- DOG WALKING (DG prefix)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'dog-walking'),
  NULL
FROM (VALUES
  ('DG001', 'Single Walk', '30-minute walk', 'service', 'walk', 25.00),
  ('DG100', 'Group Walk', 'Group dog walking', 'service', 'walk', 20.00),
  ('DG200', 'Daily Package', 'M-F daily walks', 'service', 'week', 100.00),
  ('DG300', 'Pet Sitting', 'In-home pet care', 'service', 'visit', 35.00),
  ('DG400', 'Overnight Care', 'Overnight pet sitting', 'service', 'night', 85.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- PET WASTE REMOVAL (PW prefix for pet waste)
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'pet-waste-removal'),
  NULL
FROM (VALUES
  ('PW001', 'Weekly Service', 'Weekly cleanup', 'service', 'month', 85.00),
  ('PW100', 'Bi-Weekly Service', 'Every 2 weeks', 'service', 'month', 65.00),
  ('PW200', 'One-Time Clean', 'Single cleanup', 'service', 'visit', 85.00),
  ('PW300', 'Deodorizer', 'Yard deodorizer', 'material', 'app', 25.00),
  ('PW400', 'Initial Cleanup', 'First-time service', 'service', 'ls', 185.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for all remaining industries
CREATE INDEX IF NOT EXISTS idx_cost_codes_commercial_const ON cost_codes(code) WHERE code LIKE 'CC%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_residential_const ON cost_codes(code) WHERE code LIKE 'RC%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_real_estate ON cost_codes(code) WHERE code LIKE 'RE%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_garage_door ON cost_codes(code) WHERE code LIKE 'GD%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_fence ON cost_codes(code) WHERE code LIKE 'FN%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_insulation ON cost_codes(code) WHERE code LIKE 'IN%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_waterproofing ON cost_codes(code) WHERE code LIKE 'WP%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_siding ON cost_codes(code) WHERE code LIKE 'SD%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_carpet_clean ON cost_codes(code) WHERE code LIKE 'CT%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_janitorial ON cost_codes(code) WHERE code LIKE 'JN%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_chimney ON cost_codes(code) WHERE code LIKE 'CH%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_junk ON cost_codes(code) WHERE code LIKE 'JR%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_snow ON cost_codes(code) WHERE code LIKE 'SN%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_irrigation ON cost_codes(code) WHERE code LIKE 'IR%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_paving ON cost_codes(code) WHERE code LIKE 'PV%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_excavation ON cost_codes(code) WHERE code LIKE 'EX%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_locksmith ON cost_codes(code) WHERE code LIKE 'LK%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_security ON cost_codes(code) WHERE code LIKE 'SS%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_home_auto ON cost_codes(code) WHERE code LIKE 'HA%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_fire ON cost_codes(code) WHERE code LIKE 'FP%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_elevator ON cost_codes(code) WHERE code LIKE 'EV%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_well ON cost_codes(code) WHERE code LIKE 'WW%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_septic ON cost_codes(code) WHERE code LIKE 'SP%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_restoration ON cost_codes(code) WHERE code LIKE 'RS%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_demolition ON cost_codes(code) WHERE code LIKE 'DM%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_foundation ON cost_codes(code) WHERE code LIKE 'FR%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_mechanical ON cost_codes(code) WHERE code LIKE 'MC%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_auto_detail ON cost_codes(code) WHERE code LIKE 'AD%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_dog_walk ON cost_codes(code) WHERE code LIKE 'DG%';
CREATE INDEX IF NOT EXISTS idx_cost_codes_pet_waste ON cost_codes(code) WHERE code LIKE 'PW%';

-- Add final comment
COMMENT ON TABLE cost_codes IS 'Complete comprehensive cost codes for all 50+ industries in the construction and home services sectors';