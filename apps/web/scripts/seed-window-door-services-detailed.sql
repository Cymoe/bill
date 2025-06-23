-- Seed detailed service options for Window & Door industry
-- Industry ID: 919a15b7-4ce8-4c5e-8dda-b73cee43de68

-- Get service IDs
WITH service_ids AS (
  SELECT id, name FROM services 
  WHERE industry_id = '919a15b7-4ce8-4c5e-8dda-b73cee43de68' 
  AND organization_id IS NULL
)
-- Window Installation Service Options
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order, materials_list)
SELECT 
  gen_random_uuid(),
  s.id,
  NULL,
  so.name,
  so.description,
  so.price,
  so.unit,
  so.hours,
  so.quality,
  so.warranty,
  true,
  so.popular,
  so.display_order,
  so.materials
FROM (
  VALUES
  -- Window Installation Options
  ('Window Installation', 'Single Hung Install - Basic', 'Standard single hung window, remove old', 285.00, 'window', 2.0, 'standard', 12, true, 1, ARRAY['Window Unit:1:each', 'Insulation:1:set', 'Caulk:1:tube', 'Fasteners:1:set']),
  ('Window Installation', 'Single Hung Install - Premium', 'Energy efficient with trim', 425.00, 'window', 3.0, 'premium', 24, false, 2, ARRAY['Premium Window:1:each', 'Insulation:1:set', 'Caulk:2:tubes', 'Interior Trim:1:set']),
  ('Window Installation', 'Double Hung Install - Basic', 'Standard double hung window', 325.00, 'window', 2.5, 'standard', 12, true, 3, ARRAY['Window Unit:1:each', 'Insulation:1:set', 'Caulk:1:tube', 'Fasteners:1:set']),
  ('Window Installation', 'Double Hung Install - Premium', 'Energy star rated with trim', 485.00, 'window', 3.5, 'premium', 24, false, 4, ARRAY['Premium Window:1:each', 'Insulation:1:set', 'Caulk:2:tubes', 'Interior Trim:1:set']),
  ('Window Installation', 'Casement Window - Standard', 'Side-opening casement window', 345.00, 'window', 2.5, 'standard', 18, false, 5, ARRAY['Casement Unit:1:each', 'Operator Hardware:1:set', 'Weatherstrip:1:set']),
  ('Window Installation', 'Casement Window - Triple Pane', 'High efficiency casement', 585.00, 'window', 3.0, 'premium', 36, false, 6, ARRAY['Triple Pane Unit:1:each', 'Premium Hardware:1:set', 'Insulation:1:set']),
  ('Window Installation', 'Sliding Window Install', 'Horizontal sliding window', 295.00, 'window', 2.0, 'standard', 12, false, 7, ARRAY['Slider Unit:1:each', 'Track System:1:set', 'Weatherstrip:1:set']),
  ('Window Installation', 'Picture Window - Small', 'Fixed window under 25 sqft', 425.00, 'window', 3.0, 'standard', 18, false, 8, ARRAY['Picture Window:1:each', 'Mounting Frame:1:set', 'Sealant:2:tubes']),
  ('Window Installation', 'Picture Window - Large', 'Fixed window over 25 sqft', 685.00, 'window', 4.0, 'premium', 24, false, 9, ARRAY['Large Picture Window:1:each', 'Heavy Frame:1:set', 'Sealant:3:tubes']),
  ('Window Installation', 'Bay Window - 3 Panel', 'Standard 3-panel bay window', 1250.00, 'window', 6.0, 'standard', 24, true, 10, ARRAY['Bay Window Kit:1:set', 'Support Brackets:1:set', 'Finish Materials:1:set']),
  ('Window Installation', 'Bow Window - 4 Panel', 'Curved 4-panel bow window', 1485.00, 'window', 8.0, 'premium', 36, false, 11, ARRAY['Bow Window Kit:1:set', 'Curved Frame:1:set', 'Premium Finish:1:set']),
  ('Window Installation', 'Garden Window Install', 'Kitchen garden window box', 785.00, 'window', 4.0, 'standard', 18, false, 12, ARRAY['Garden Box Unit:1:each', 'Shelf Kit:1:set', 'Special Seal:1:set']),
  ('Window Installation', 'Awning Window Install', 'Top-hinged awning window', 315.00, 'window', 2.0, 'standard', 18, false, 13, ARRAY['Awning Unit:1:each', 'Hinge Set:1:set', 'Operator:1:each']),
  ('Window Installation', 'Hopper Window Install', 'Bottom-hinged basement window', 285.00, 'window', 2.0, 'standard', 12, false, 14, ARRAY['Hopper Unit:1:each', 'Security Hardware:1:set', 'Well Trim:1:set']),
  ('Window Installation', 'Egress Window Complete', 'Emergency exit window with well', 1850.00, 'window', 8.0, 'premium', 36, true, 15, ARRAY['Egress Window:1:each', 'Window Well:1:each', 'Drainage Stone:10:bags']),
  ('Window Installation', 'Skylight - Fixed', 'Non-opening skylight install', 785.00, 'skylight', 4.0, 'standard', 24, false, 16, ARRAY['Skylight Unit:1:each', 'Flashing Kit:1:set', 'Interior Finish:1:set']),
  ('Window Installation', 'Skylight - Venting', 'Opening skylight with remote', 1185.00, 'skylight', 5.0, 'premium', 36, false, 17, ARRAY['Venting Skylight:1:each', 'Remote Control:1:each', 'Flashing Kit:1:set']),
  ('Window Installation', 'Storm Window - Standard', 'Exterior storm window', 165.00, 'window', 1.0, 'standard', 12, false, 18, ARRAY['Storm Window:1:each', 'Mounting Hardware:1:set']),
  ('Window Installation', 'Window Trim Package', 'Complete interior trim install', 125.00, 'window', 1.5, 'standard', 12, true, 19, ARRAY['Wood Trim:1:set', 'Corner Blocks:4:each', 'Finish Nails:1:box']),
  ('Window Installation', 'Sill Replacement', 'Replace rotted window sill', 185.00, 'window', 2.0, 'standard', 24, false, 20, ARRAY['New Sill:1:each', 'Flashing:1:piece', 'Sealant:1:tube'])
) AS so(service_name, name, description, price, unit, hours, quality, warranty, popular, display_order, materials)
JOIN service_ids s ON s.name = so.service_name;

-- Door Installation Service Options
WITH service_ids AS (
  SELECT id, name FROM services 
  WHERE industry_id = '919a15b7-4ce8-4c5e-8dda-b73cee43de68' 
  AND organization_id IS NULL
)
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order, materials_list)
SELECT 
  gen_random_uuid(),
  s.id,
  NULL,
  so.name,
  so.description,
  so.price,
  so.unit,
  so.hours,
  so.quality,
  so.warranty,
  true,
  so.popular,
  so.display_order,
  so.materials
FROM (
  VALUES
  -- Door Installation Options
  ('Door Installation', 'Entry Door - Steel Basic', 'Steel entry door with frame', 485.00, 'door', 3.0, 'standard', 24, true, 1, ARRAY['Steel Door Unit:1:each', 'Lockset:1:each', 'Weatherstrip:1:set', 'Threshold:1:each']),
  ('Door Installation', 'Entry Door - Fiberglass', 'Fiberglass door with sidelites', 885.00, 'door', 4.0, 'premium', 36, true, 2, ARRAY['Fiberglass Door:1:each', 'Sidelite Kit:1:set', 'Premium Lock:1:each', 'Trim:1:set']),
  ('Door Installation', 'Entry Door - Wood Custom', 'Solid wood entry door system', 1285.00, 'door', 5.0, 'premium', 36, false, 3, ARRAY['Wood Door:1:each', 'Custom Frame:1:set', 'Premium Hardware:1:set', 'Finish:1:application']),
  ('Door Installation', 'Interior Door - Hollow Core', 'Standard interior door', 225.00, 'door', 1.5, 'standard', 12, true, 4, ARRAY['Hollow Door:1:each', 'Passage Set:1:each', 'Hinges:3:each', 'Door Stop:1:set']),
  ('Door Installation', 'Interior Door - Solid Core', 'Sound-reducing solid door', 325.00, 'door', 2.0, 'premium', 18, false, 5, ARRAY['Solid Door:1:each', 'Privacy Set:1:each', 'Heavy Hinges:3:each', 'Trim:1:set']),
  ('Door Installation', 'French Doors - Interior', 'Double French door set', 685.00, 'set', 4.0, 'standard', 18, true, 6, ARRAY['French Door Pair:1:set', 'Ball Catch:1:each', 'Hinges:6:each', 'Astragal:1:each']),
  ('Door Installation', 'French Doors - Exterior', 'Patio French doors with lock', 1185.00, 'set', 5.0, 'premium', 36, false, 7, ARRAY['Exterior French:1:set', 'Multipoint Lock:1:each', 'Weatherstrip:1:set', 'Threshold:1:each']),
  ('Door Installation', 'Sliding Glass - Standard', '6ft sliding patio door', 785.00, 'door', 4.0, 'standard', 24, true, 8, ARRAY['Slider Unit:1:each', 'Track System:1:set', 'Handle Set:1:each', 'Screen:1:each']),
  ('Door Installation', 'Sliding Glass - Premium', '8ft slider with blinds', 1385.00, 'door', 5.0, 'premium', 36, false, 9, ARRAY['Premium Slider:1:each', 'Built-in Blinds:1:set', 'Security Bar:1:each', 'Premium Screen:1:each']),
  ('Door Installation', 'Bi-Fold Doors - Closet', 'Standard closet bi-fold', 285.00, 'opening', 2.0, 'standard', 12, true, 10, ARRAY['Bi-fold Set:1:each', 'Track Hardware:1:set', 'Pulls:2:each', 'Guide:1:each']),
  ('Door Installation', 'Bi-Fold Doors - Louvered', 'Ventilated louvered bi-fold', 385.00, 'opening', 2.5, 'premium', 18, false, 11, ARRAY['Louvered Doors:1:set', 'Heavy Track:1:set', 'Premium Pulls:2:each']),
  ('Door Installation', 'Pocket Door - Standard', 'Space-saving pocket door', 485.00, 'door', 4.0, 'standard', 18, false, 12, ARRAY['Pocket Door Kit:1:each', 'Door Slab:1:each', 'Hardware:1:set', 'Pull Set:1:each']),
  ('Door Installation', 'Pocket Door - Soft Close', 'Premium soft-close pocket door', 685.00, 'door', 4.5, 'premium', 24, false, 13, ARRAY['Soft Close Kit:1:each', 'Premium Door:1:each', 'Designer Pull:1:set']),
  ('Door Installation', 'Barn Door - Interior', 'Sliding barn door with hardware', 585.00, 'door', 3.0, 'standard', 18, true, 14, ARRAY['Barn Door:1:each', 'Track System:1:set', 'Rollers:1:set', 'Handle:1:each']),
  ('Door Installation', 'Storm Door - Standard', 'Aluminum storm door', 285.00, 'door', 2.0, 'standard', 18, false, 15, ARRAY['Storm Door:1:each', 'Closer:1:each', 'Handle Set:1:each', 'Sweep:1:each']),
  ('Door Installation', 'Storm Door - Full View', 'Full glass storm door', 485.00, 'door', 2.5, 'premium', 24, false, 16, ARRAY['Full View Door:1:each', 'Premium Closer:1:each', 'Retractable Screen:1:each']),
  ('Door Installation', 'Security Door Install', 'Steel security door', 685.00, 'door', 3.0, 'premium', 36, false, 17, ARRAY['Security Door:1:each', 'Deadbolt Set:1:each', 'Heavy Frame:1:set', 'Security Hinges:3:each']),
  ('Door Installation', 'Pet Door - Standard', 'Medium size pet door', 285.00, 'door', 2.0, 'standard', 12, false, 18, ARRAY['Pet Door Kit:1:each', 'Security Panel:1:each', 'Weather Seal:1:set']),
  ('Door Installation', 'Door Jamb Replacement', 'Replace damaged door frame', 385.00, 'door', 3.0, 'standard', 24, false, 19, ARRAY['New Jamb Kit:1:set', 'Shims:1:bundle', 'Fasteners:1:set', 'Caulk:1:tube']),
  ('Door Installation', 'Threshold & Sweep Kit', 'Complete weather sealing', 145.00, 'door', 1.0, 'standard', 12, true, 20, ARRAY['Threshold:1:each', 'Door Sweep:1:each', 'Side Seals:1:set'])
) AS so(service_name, name, description, price, unit, hours, quality, warranty, popular, display_order, materials)
JOIN service_ids s ON s.name = so.service_name;

-- Window & Door Repair Service Options
WITH service_ids AS (
  SELECT id, name FROM services 
  WHERE industry_id = '919a15b7-4ce8-4c5e-8dda-b73cee43de68' 
  AND organization_id IS NULL
)
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order, materials_list)
SELECT 
  gen_random_uuid(),
  s.id,
  NULL,
  so.name,
  so.description,
  so.price,
  so.unit,
  so.hours,
  so.quality,
  so.warranty,
  true,
  so.popular,
  so.display_order,
  so.materials
FROM (
  VALUES
  -- Repair Service Options
  ('Window & Door Repair', 'Window Glass Replace - Single', 'Replace single pane glass', 185.00, 'pane', 1.5, 'standard', 12, true, 1, ARRAY['Glass Pane:1:each', 'Glazing Putty:1:can', 'Points:1:box']),
  ('Window & Door Repair', 'Window Glass Replace - Double', 'Replace insulated glass unit', 285.00, 'unit', 2.0, 'standard', 24, true, 2, ARRAY['IGU:1:each', 'Sealant:1:tube', 'Spacers:1:set']),
  ('Window & Door Repair', 'Sash Cord Replacement', 'Fix window weight system', 225.00, 'window', 2.5, 'standard', 18, false, 3, ARRAY['Sash Cord:2:each', 'Pulleys:2:each', 'Chain:1:set']),
  ('Window & Door Repair', 'Window Balance Spring', 'Replace balance springs', 165.00, 'window', 1.5, 'standard', 18, false, 4, ARRAY['Balance Springs:2:each', 'Mounting Clips:1:set']),
  ('Window & Door Repair', 'Crank Mechanism Repair', 'Fix casement window crank', 145.00, 'window', 1.0, 'standard', 12, false, 5, ARRAY['Crank Assembly:1:each', 'Linkage:1:set', 'Lubricant:1:can']),
  ('Window & Door Repair', 'Screen Repair - Rescreen', 'Replace screen mesh only', 65.00, 'screen', 0.5, 'standard', 6, true, 6, ARRAY['Screen Mesh:1:piece', 'Spline:1:roll', 'Corners:4:each']),
  ('Window & Door Repair', 'Screen Frame Replace', 'New screen with frame', 125.00, 'screen', 1.0, 'standard', 12, false, 7, ARRAY['Screen Kit:1:each', 'Frame:1:set', 'Hardware:1:set']),
  ('Window & Door Repair', 'Window Lock Replace', 'Install new window lock', 85.00, 'lock', 0.75, 'standard', 12, false, 8, ARRAY['Lock Assembly:1:each', 'Keeper:1:each', 'Screws:1:set']),
  ('Window & Door Repair', 'Door Adjustment Service', 'Align sticking door', 125.00, 'door', 1.5, 'standard', 6, true, 9, ARRAY['Shims:1:pack', 'Long Screws:1:set', 'Lubricant:1:can']),
  ('Window & Door Repair', 'Hinge Replacement - Interior', 'Replace 3 door hinges', 145.00, 'door', 1.5, 'standard', 18, false, 10, ARRAY['Hinges:3:each', 'Screws:1:set', 'Chisel Work:1:service']),
  ('Window & Door Repair', 'Hinge Replacement - Heavy', 'Commercial grade hinges', 225.00, 'door', 2.0, 'premium', 24, false, 11, ARRAY['Heavy Hinges:3:each', 'Reinforcement:1:set', 'Long Screws:1:set']),
  ('Window & Door Repair', 'Door Lock Repair', 'Fix existing lock mechanism', 165.00, 'lock', 1.5, 'standard', 12, true, 12, ARRAY['Lock Parts:1:set', 'Lubricant:1:can', 'Strike Adjust:1:service']),
  ('Window & Door Repair', 'Deadbolt Installation', 'Add deadbolt to door', 185.00, 'door', 1.5, 'standard', 24, true, 13, ARRAY['Deadbolt:1:each', 'Strike Plate:1:each', 'Drill Template:1:use']),
  ('Window & Door Repair', 'Door Closer Adjustment', 'Tune commercial door closer', 85.00, 'closer', 0.75, 'standard', 12, false, 14, ARRAY['Adjustment:1:service', 'Fluid Check:1:service', 'Arm Adjust:1:service']),
  ('Window & Door Repair', 'Door Closer Replace', 'New pneumatic closer', 285.00, 'closer', 2.0, 'standard', 24, false, 15, ARRAY['Door Closer:1:each', 'Mounting Plate:1:each', 'Arm Assembly:1:each']),
  ('Window & Door Repair', 'Weather Seal Replace', 'Complete weather stripping', 165.00, 'door', 1.5, 'standard', 18, true, 16, ARRAY['Weatherstrip Kit:1:set', 'Door Sweep:1:each', 'Corner Pads:4:each']),
  ('Window & Door Repair', 'Sliding Door Track Repair', 'Clean and adjust tracks', 185.00, 'door', 2.0, 'standard', 12, false, 17, ARRAY['Track Cleaning:1:service', 'Roller Adjust:1:service', 'Lubricant:1:application']),
  ('Window & Door Repair', 'Sliding Door Roller Replace', 'New roller assemblies', 285.00, 'door', 2.5, 'standard', 24, false, 18, ARRAY['Roller Set:1:pair', 'Track Cap:1:set', 'Adjustment:1:service']),
  ('Window & Door Repair', 'Window Caulk & Seal', 'Exterior window resealing', 125.00, 'window', 1.0, 'standard', 24, true, 19, ARRAY['Caulk Removal:1:service', 'Premium Caulk:2:tubes', 'Backer Rod:1:roll']),
  ('Window & Door Repair', 'Emergency Board-Up', '24/7 emergency service', 285.00, 'opening', 1.5, 'standard', 0, false, 20, ARRAY['Plywood:1:sheet', 'Fasteners:1:set', 'Plastic Sheet:1:roll'])
) AS so(service_name, name, description, price, unit, hours, quality, warranty, popular, display_order, materials)
JOIN service_ids s ON s.name = so.service_name;

-- Specialty Installations Service Options
WITH service_ids AS (
  SELECT id, name FROM services 
  WHERE industry_id = '919a15b7-4ce8-4c5e-8dda-b73cee43de68' 
  AND organization_id IS NULL
)
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order, materials_list)
SELECT 
  gen_random_uuid(),
  s.id,
  NULL,
  so.name,
  so.description,
  so.price,
  so.unit,
  so.hours,
  so.quality,
  so.warranty,
  true,
  so.popular,
  so.display_order,
  so.materials
FROM (
  VALUES
  -- Specialty Options
  ('Specialty Installations', 'Garage Door - Single Car', '8x7 overhead door install', 985.00, 'door', 4.0, 'standard', 24, true, 1, ARRAY['Garage Door:1:each', 'Track System:1:set', 'Springs:1:pair', 'Opener:1:each']),
  ('Specialty Installations', 'Garage Door - Double Car', '16x7 overhead door install', 1485.00, 'door', 6.0, 'standard', 24, true, 2, ARRAY['Double Door:1:each', 'Heavy Track:1:set', 'Spring System:1:set', 'Opener:1:each']),
  ('Specialty Installations', 'Garage Door Opener Only', 'Automatic opener install', 485.00, 'opener', 2.0, 'standard', 36, false, 3, ARRAY['Opener Unit:1:each', 'Rails:1:set', 'Remotes:2:each', 'Keypad:1:each']),
  ('Specialty Installations', 'Smart Lock Installation', 'WiFi enabled smart lock', 385.00, 'lock', 1.5, 'premium', 24, false, 4, ARRAY['Smart Lock:1:each', 'Hub:1:each', 'Batteries:1:set', 'App Setup:1:service']),
  ('Specialty Installations', 'Video Doorbell Install', 'Smart video doorbell system', 285.00, 'doorbell', 1.0, 'premium', 24, true, 5, ARRAY['Video Doorbell:1:each', 'Transformer:1:each', 'Wiring:1:set', 'App Setup:1:service']),
  ('Specialty Installations', 'Window Film - Security', 'Security film application', 12.50, 'sqft', 0.1, 'premium', 60, false, 6, ARRAY['Security Film:1:sqft', 'Application Fluid:1:bottle', 'Tools:1:use']),
  ('Specialty Installations', 'Window Film - UV/Heat', 'Energy saving window film', 8.50, 'sqft', 0.08, 'standard', 36, true, 7, ARRAY['UV Film:1:sqft', 'Application Kit:1:use', 'Cleaning:1:service']),
  ('Specialty Installations', 'Hurricane Shutters', 'Storm protection shutters', 45.00, 'sqft', 0.25, 'premium', 60, false, 8, ARRAY['Shutter Panels:1:sqft', 'Track System:1:ft', 'Hardware:1:set']),
  ('Specialty Installations', 'Window Well & Cover', 'Basement window well system', 685.00, 'well', 4.0, 'standard', 36, false, 9, ARRAY['Well Unit:1:each', 'Cover:1:each', 'Drainage:10:bags', 'Fasteners:1:set']),
  ('Specialty Installations', 'Automatic Door Operator', 'ADA compliant auto door', 2850.00, 'door', 8.0, 'premium', 36, false, 10, ARRAY['Operator:1:each', 'Sensors:1:set', 'Controls:1:set', 'Signage:1:set']),
  ('Specialty Installations', 'Fire Door Installation', 'Fire-rated door system', 985.00, 'door', 4.0, 'premium', 60, false, 11, ARRAY['Fire Door:1:each', 'Rated Frame:1:set', 'Closer:1:each', 'Panic Bar:1:each']),
  ('Specialty Installations', 'Storefront System - Small', 'Commercial glass storefront', 185.00, 'sqft', 0.5, 'premium', 36, false, 12, ARRAY['Aluminum Frame:1:sqft', 'Glass:1:sqft', 'Hardware:1:set', 'Sealant:1:application'])
) AS so(service_name, name, description, price, unit, hours, quality, warranty, popular, display_order, materials)
JOIN service_ids s ON s.name = so.service_name;