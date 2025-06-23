-- Seed detailed service options for Concrete industry
-- Industry ID: d92d151c-ff60-4dc6-b753-906151863790

-- Get service IDs
WITH service_ids AS (
  SELECT id, name FROM services 
  WHERE industry_id = 'd92d151c-ff60-4dc6-b753-906151863790' 
  AND organization_id IS NULL
)
-- Concrete Pouring Service Options
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
  -- Concrete Pouring Options
  ('Concrete Pouring', 'Driveway - Standard', 'Single car driveway 10x20', 1250.00, 'project', 8.0, 'standard', 36, true, 1, ARRAY['Concrete:4:yards', 'Wire Mesh:200:sqft', 'Expansion Joint:40:ft', 'Sealer:1:application']),
  ('Concrete Pouring', 'Driveway - Double Car', 'Double car driveway 20x20', 2250.00, 'project', 12.0, 'standard', 36, true, 2, ARRAY['Concrete:7:yards', 'Wire Mesh:400:sqft', 'Expansion Joint:60:ft', 'Sealer:1:application']),
  ('Concrete Pouring', 'Driveway - Stamped', 'Decorative stamped driveway', 3850.00, 'project', 16.0, 'premium', 36, false, 3, ARRAY['Concrete:7:yards', 'Color Hardener:8:bags', 'Release Agent:2:buckets', 'Sealer:2:coats']),
  ('Concrete Pouring', 'Sidewalk - 4ft Wide', 'Standard 4-inch sidewalk', 12.50, 'linear ft', 0.2, 'standard', 24, true, 4, ARRAY['Concrete:0.05:yards/ft', 'Forms:1:ft', 'Expansion Joint:0.25:ft']),
  ('Concrete Pouring', 'Patio - Small', '10x10 patio slab', 850.00, 'project', 6.0, 'standard', 24, true, 5, ARRAY['Concrete:1.5:yards', 'Wire Mesh:100:sqft', 'Forms:40:ft', 'Finish:1:application']),
  ('Concrete Pouring', 'Patio - Medium', '12x16 patio slab', 1485.00, 'project', 8.0, 'standard', 24, true, 6, ARRAY['Concrete:3:yards', 'Wire Mesh:192:sqft', 'Forms:56:ft', 'Control Joints:1:set']),
  ('Concrete Pouring', 'Patio - Large Stamped', '16x20 decorative patio', 3250.00, 'project', 14.0, 'premium', 36, false, 7, ARRAY['Concrete:5:yards', 'Color:6:bags', 'Stamps:1:set', 'Premium Sealer:2:coats']),
  ('Concrete Pouring', 'Garage Floor - Single', 'Single car garage slab', 1850.00, 'project', 10.0, 'standard', 36, false, 8, ARRAY['Concrete:4.5:yards', 'Vapor Barrier:240:sqft', 'Wire Mesh:240:sqft', 'Finish:1:application']),
  ('Concrete Pouring', 'Garage Floor - Double', 'Double car garage slab', 2850.00, 'project', 14.0, 'standard', 36, true, 9, ARRAY['Concrete:7:yards', 'Vapor Barrier:400:sqft', 'Rebar Grid:1:set', 'Control Joints:1:set']),
  ('Concrete Pouring', 'Foundation Wall - 8ft', 'Poured foundation wall', 145.00, 'linear ft', 0.5, 'standard', 50, false, 10, ARRAY['Concrete:0.3:yards/ft', 'Forms:16:sqft/ft', 'Rebar:2:pieces/ft', 'Ties:4:each/ft']),
  ('Concrete Pouring', 'Footing - Standard', 'Foundation footing 16x8', 95.00, 'linear ft', 0.3, 'standard', 50, false, 11, ARRAY['Concrete:0.15:yards/ft', 'Forms:1:set/ft', 'Rebar:2:pieces/ft']),
  ('Concrete Pouring', 'Slab on Grade - 4"', 'Commercial floor slab', 5.85, 'sqft', 0.02, 'standard', 24, false, 12, ARRAY['Concrete:0.012:yards/sqft', 'Vapor Barrier:1:sqft', 'Wire Mesh:1:sqft']),
  ('Concrete Pouring', 'Slab on Grade - 6"', 'Heavy duty floor slab', 7.85, 'sqft', 0.025, 'premium', 36, false, 13, ARRAY['Concrete:0.018:yards/sqft', 'Vapor Barrier:1:sqft', 'Rebar:1:sqft']),
  ('Concrete Pouring', 'Stairs - Basic 3 Step', 'Standard concrete steps', 685.00, 'set', 6.0, 'standard', 36, false, 14, ARRAY['Concrete:1:yard', 'Forms:1:set', 'Rebar:12:pieces', 'Handrail Anchors:2:each']),
  ('Concrete Pouring', 'Stairs - Wide 4 Step', 'Wide entry stairs', 1185.00, 'set', 8.0, 'standard', 36, false, 15, ARRAY['Concrete:2:yards', 'Forms:1:set', 'Rebar:20:pieces', 'Non-slip:1:application']),
  ('Concrete Pouring', 'Retaining Wall - 3ft', 'Reinforced retaining wall', 185.00, 'linear ft', 1.0, 'premium', 50, false, 16, ARRAY['Concrete:0.5:yards/ft', 'Forms:12:sqft/ft', 'Rebar Grid:1:section/ft', 'Drainage:1:ft']),
  ('Concrete Pouring', 'Curb & Gutter', 'Street curb installation', 42.00, 'linear ft', 0.15, 'standard', 36, false, 17, ARRAY['Concrete:0.08:yards/ft', 'Forms:1:set/ft', 'Expansion:0.2:ft']),
  ('Concrete Pouring', 'Equipment Pad', 'HVAC equipment pad', 385.00, 'pad', 3.0, 'standard', 24, true, 18, ARRAY['Concrete:0.5:yards', 'Wire Mesh:16:sqft', 'Isolation Joint:1:set', 'Level:1:service']),
  ('Concrete Pouring', 'Small Pour Service', 'Minimum charge < 1 yard', 485.00, 'service', 3.0, 'standard', 12, false, 19, ARRAY['Concrete:1:yard minimum', 'Delivery:1:charge', 'Tools:1:set']),
  ('Concrete Pouring', 'Pump Truck Add-On', 'Concrete pump service', 950.00, 'day', 0.0, 'standard', 0, false, 20, ARRAY['Pump Setup:1:service', 'Hose:200:ft', 'Operator:1:included'])
) AS so(service_name, name, description, price, unit, hours, quality, warranty, popular, display_order, materials)
JOIN service_ids s ON s.name = so.service_name;

-- Concrete Finishing Service Options
WITH service_ids AS (
  SELECT id, name FROM services 
  WHERE industry_id = 'd92d151c-ff60-4dc6-b753-906151863790' 
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
  -- Concrete Finishing Options
  ('Concrete Finishing', 'Broom Finish - Standard', 'Non-slip broom texture', 0.85, 'sqft', 0.01, 'standard', 12, true, 1, ARRAY['Labor:1:sqft', 'Broom:1:use']),
  ('Concrete Finishing', 'Smooth Trowel Finish', 'Interior smooth finish', 1.45, 'sqft', 0.015, 'standard', 12, true, 2, ARRAY['Trowel Work:1:sqft', 'Steel Trowel:1:use']),
  ('Concrete Finishing', 'Exposed Aggregate - Basic', 'Pea gravel exposed finish', 2.85, 'sqft', 0.025, 'standard', 24, false, 3, ARRAY['Retarder:1:sqft', 'Aggregate:1:sqft', 'Pressure Wash:1:sqft', 'Sealer:1:coat']),
  ('Concrete Finishing', 'Stamped - Brick Pattern', 'Brick pattern stamped', 4.85, 'sqft', 0.04, 'premium', 36, true, 4, ARRAY['Color Hardener:1:sqft', 'Release:1:sqft', 'Stamps:1:use', 'Sealer:2:coats']),
  ('Concrete Finishing', 'Stamped - Stone Pattern', 'Natural stone pattern', 5.85, 'sqft', 0.045, 'premium', 36, true, 5, ARRAY['Color Hardener:1:sqft', 'Antiquing:1:sqft', 'Stone Stamps:1:use', 'Premium Sealer:2:coats']),
  ('Concrete Finishing', 'Stamped - Wood Plank', 'Wood plank pattern', 5.45, 'sqft', 0.042, 'premium', 36, false, 6, ARRAY['Base Color:1:sqft', 'Accent Color:1:sqft', 'Wood Stamps:1:use', 'Matte Sealer:2:coats']),
  ('Concrete Finishing', 'Colored - Integral', 'Color mixed in concrete', 1.85, 'sqft', 0.005, 'standard', 24, true, 7, ARRAY['Color Additive:1:sqft', 'Standard Finish:1:sqft']),
  ('Concrete Finishing', 'Colored - Shake-On', 'Surface color hardener', 2.45, 'sqft', 0.02, 'standard', 24, false, 8, ARRAY['Color Hardener:2:lbs/sqft', 'Float Finish:1:sqft', 'Sealer:1:coat']),
  ('Concrete Finishing', 'Acid Stain - Single Color', 'Chemical stain finish', 3.25, 'sqft', 0.03, 'premium', 36, false, 9, ARRAY['Acid Stain:1:sqft', 'Neutralizer:1:sqft', 'Sealer:2:coats']),
  ('Concrete Finishing', 'Acid Stain - Multi-Color', 'Artistic stain design', 5.85, 'sqft', 0.05, 'premium', 36, false, 10, ARRAY['Multiple Stains:1:sqft', 'Design Work:1:sqft', 'Premium Sealer:3:coats']),
  ('Concrete Finishing', 'Polish - Basic', 'Concrete floor polish', 3.85, 'sqft', 0.035, 'standard', 24, false, 11, ARRAY['Grinding:3:passes', 'Densifier:1:sqft', 'Polish:1:sqft']),
  ('Concrete Finishing', 'Polish - High Gloss', 'Mirror finish polish', 6.85, 'sqft', 0.06, 'premium', 36, false, 12, ARRAY['Diamond Grinding:5:passes', 'Densifier:2:coats', 'High Gloss:1:application']),
  ('Concrete Finishing', 'Epoxy Floor - Clear', 'Clear epoxy coating', 4.25, 'sqft', 0.04, 'premium', 36, true, 13, ARRAY['Floor Prep:1:sqft', 'Primer:1:coat', 'Clear Epoxy:2:coats']),
  ('Concrete Finishing', 'Epoxy Floor - Colored', 'Decorative epoxy floor', 5.85, 'sqft', 0.045, 'premium', 36, true, 14, ARRAY['Diamond Grind:1:sqft', 'Epoxy Base:1:coat', 'Color Chips:1:broadcast', 'Top Coat:1:coat']),
  ('Concrete Finishing', 'Polyaspartic Coating', 'Fast-cure floor coating', 7.85, 'sqft', 0.05, 'premium', 48, false, 15, ARRAY['Surface Prep:1:sqft', 'Polyaspartic:2:coats', 'Anti-slip:1:additive']),
  ('Concrete Finishing', 'Concrete Sealer - Basic', 'Penetrating sealer', 0.95, 'sqft', 0.008, 'standard', 24, true, 16, ARRAY['Sealer:1:coat', 'Application:1:sqft']),
  ('Concrete Finishing', 'Concrete Sealer - Premium', 'High-performance sealer', 1.85, 'sqft', 0.01, 'premium', 60, false, 17, ARRAY['Surface Prep:1:sqft', 'Premium Sealer:2:coats']),
  ('Concrete Finishing', 'Control Joint Cutting', 'Saw cut control joints', 3.25, 'linear ft', 0.02, 'standard', 0, false, 18, ARRAY['Saw Blade:0.01:each/ft', 'Chalk Line:1:use', 'Clean:1:ft']),
  ('Concrete Finishing', 'Edge Detail - Rounded', 'Decorative edge finishing', 4.50, 'linear ft', 0.04, 'standard', 24, false, 19, ARRAY['Edger Tool:1:use/ft', 'Hand Finish:1:ft']),
  ('Concrete Finishing', 'Non-Slip Additive', 'Safety grip surface', 0.65, 'sqft', 0.005, 'standard', 24, true, 20, ARRAY['Grit Additive:1:sqft', 'Broadcast:1:application'])
) AS so(service_name, name, description, price, unit, hours, quality, warranty, popular, display_order, materials)
JOIN service_ids s ON s.name = so.service_name;

-- Concrete Repair Service Options
WITH service_ids AS (
  SELECT id, name FROM services 
  WHERE industry_id = 'd92d151c-ff60-4dc6-b753-906151863790' 
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
  -- Concrete Repair Options
  ('Concrete Repair', 'Crack Repair - Hairline', 'Seal hairline cracks', 12.50, 'linear ft', 0.1, 'standard', 12, true, 1, ARRAY['Crack Sealer:1:ft', 'Prep Work:1:ft', 'Sand:0.1:lb/ft']),
  ('Concrete Repair', 'Crack Repair - Wide', 'Structural crack repair', 22.50, 'linear ft', 0.2, 'premium', 24, true, 2, ARRAY['Grind Crack:1:ft', 'Epoxy Injection:1:ft', 'Surface Seal:1:ft']),
  ('Concrete Repair', 'Spalling Repair - Small', 'Surface spall patches', 85.00, 'sqft', 0.75, 'standard', 18, false, 3, ARRAY['Remove Loose:1:sqft', 'Bonding Agent:1:sqft', 'Patch Material:1:sqft', 'Finish:1:sqft']),
  ('Concrete Repair', 'Spalling Repair - Large', 'Deep spall repair', 125.00, 'sqft', 1.0, 'premium', 24, false, 4, ARRAY['Chip Out:1:sqft', 'Rebar Treatment:1:sqft', 'Structural Patch:1:sqft', 'Match Finish:1:sqft']),
  ('Concrete Repair', 'Concrete Raising - Slab', 'Mudjacking/polyfoam lift', 15.50, 'sqft', 0.02, 'standard', 24, true, 5, ARRAY['Drill Holes:0.1:each/sqft', 'Foam/Mud:1:sqft', 'Patch Holes:0.1:each/sqft']),
  ('Concrete Repair', 'Concrete Raising - Steps', 'Level sunken steps', 385.00, 'set', 2.0, 'standard', 24, false, 6, ARRAY['Access Holes:4:each', 'Lifting Material:1:set', 'Seal Holes:4:each']),
  ('Concrete Repair', 'Overlay - Thin 1/4"', 'Decorative overlay', 5.85, 'sqft', 0.04, 'standard', 18, false, 7, ARRAY['Surface Prep:1:sqft', 'Bonding Agent:1:sqft', 'Overlay Mix:1:sqft', 'Finish:1:sqft']),
  ('Concrete Repair', 'Overlay - Self-Level', 'Self-leveling overlay', 7.85, 'sqft', 0.05, 'premium', 24, false, 8, ARRAY['Grind Surface:1:sqft', 'Primer:1:sqft', 'Self-Leveler:1:sqft', 'Seal:1:coat']),
  ('Concrete Repair', 'Joint Repair - Expansion', 'Replace expansion joint', 18.50, 'linear ft', 0.15, 'standard', 18, true, 9, ARRAY['Remove Old:1:ft', 'Backer Rod:1:ft', 'Sealant:1:ft', 'Tool Joint:1:ft']),
  ('Concrete Repair', 'Joint Repair - Control', 'Reseal control joint', 8.50, 'linear ft', 0.08, 'standard', 18, false, 10, ARRAY['Clean Joint:1:ft', 'Backer Rod:0.5:ft', 'Polyurethane:1:ft']),
  ('Concrete Repair', 'Scaling Repair', 'Fix surface scaling', 65.00, 'sqft', 0.5, 'standard', 18, false, 11, ARRAY['Remove Scale:1:sqft', 'Resurface Mix:1:sqft', 'Cure:1:application']),
  ('Concrete Repair', 'Hole Patching - Small', 'Patch holes < 1 sqft', 125.00, 'hole', 1.0, 'standard', 12, true, 12, ARRAY['Clean Hole:1:each', 'Patch Mix:1:bag', 'Finish:1:each']),
  ('Concrete Repair', 'Hole Patching - Large', 'Major hole repair', 285.00, 'hole', 2.5, 'standard', 18, false, 13, ARRAY['Form Edges:1:set', 'Concrete:0.5:bag', 'Rebar Dowels:4:each', 'Finish:1:application']),
  ('Concrete Repair', 'Trip Hazard Grinding', 'Grind raised edges', 185.00, 'location', 1.0, 'standard', 12, true, 14, ARRAY['Grinder Use:1:location', 'Dust Control:1:service', 'Mark Area:1:service']),
  ('Concrete Repair', 'Concrete Removal - Partial', 'Remove damaged section', 12.50, 'sqft', 0.15, 'standard', 0, false, 15, ARRAY['Saw Cut:4:ft/sqft', 'Break Out:1:sqft', 'Haul Away:1:sqft']),
  ('Concrete Repair', 'Concrete Removal - Full', 'Complete demo & haul', 8.85, 'sqft', 0.1, 'standard', 0, false, 16, ARRAY['Equipment:0.01:hour/sqft', 'Labor:1:sqft', 'Disposal:1:sqft']),
  ('Concrete Repair', 'Waterproofing - Surface', 'Waterproof coating', 3.85, 'sqft', 0.03, 'premium', 36, false, 17, ARRAY['Surface Prep:1:sqft', 'Waterproofer:2:coats/sqft', 'Detail Work:0.1:sqft']),
  ('Concrete Repair', 'Foundation Crack Inject', 'Basement crack injection', 485.00, 'crack', 3.0, 'premium', 60, true, 18, ARRAY['Ports:8:each', 'Injection Resin:1:kit', 'Surface Seal:1:application']),
  ('Concrete Repair', 'Decorative Repair Match', 'Match stamped/colored', 145.00, 'sqft', 1.5, 'premium', 18, false, 19, ARRAY['Color Match:1:service', 'Pattern Match:1:service', 'Blend Work:1:sqft']),
  ('Concrete Repair', 'Emergency Stabilization', '24/7 emergency service', 385.00, 'hour', 1.0, 'standard', 0, false, 20, ARRAY['Fast Patch:1:bag/hour', 'Safety Cones:4:each', 'Immediate Response:1:service'])
) AS so(service_name, name, description, price, unit, hours, quality, warranty, popular, display_order, materials)
JOIN service_ids s ON s.name = so.service_name;

-- Specialty Concrete Service Options
WITH service_ids AS (
  SELECT id, name FROM services 
  WHERE industry_id = 'd92d151c-ff60-4dc6-b753-906151863790' 
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
  -- Specialty Concrete Options
  ('Specialty Concrete', 'Pervious Concrete', 'Permeable concrete system', 12.85, 'sqft', 0.08, 'premium', 36, false, 1, ARRAY['Pervious Mix:0.02:yards/sqft', 'Special Forms:1:use', 'No Compaction:1:note']),
  ('Specialty Concrete', 'Heated Driveway', 'Radiant heat system', 18.50, 'sqft', 0.12, 'premium', 60, false, 2, ARRAY['Heat Cable:1:sqft', 'Controls:0.01:system/sqft', 'Insulation:1:sqft', 'Concrete:0.015:yards/sqft']),
  ('Specialty Concrete', 'Pool Deck - Kool Deck', 'Heat-reducing pool deck', 8.85, 'sqft', 0.06, 'premium', 36, true, 3, ARRAY['Concrete:0.012:yards/sqft', 'Kool Deck:1:sqft', 'Color:1:sqft', 'Texture:1:application']),
  ('Specialty Concrete', 'Pool Deck - Stamped', 'Decorative pool surround', 12.50, 'sqft', 0.08, 'premium', 36, true, 4, ARRAY['Concrete:0.012:yards/sqft', 'Stamps:1:use', 'Color:2:applications', 'Non-slip:1:additive']),
  ('Specialty Concrete', 'Fire Pit - Built-in', 'Concrete fire pit', 1885.00, 'pit', 12.0, 'premium', 36, false, 5, ARRAY['Concrete Forms:1:set', 'Fire Brick:1:liner', 'Concrete:2:yards', 'Gas Line:1:optional']),
  ('Specialty Concrete', 'Outdoor Kitchen Base', 'Kitchen island base', 285.00, 'linear ft', 2.0, 'premium', 36, false, 6, ARRAY['Concrete:0.5:yards/ft', 'Rebar:1:cage/ft', 'Utility Rough:1:ft', 'Finish:1:ft']),
  ('Specialty Concrete', 'Concrete Countertop', 'Custom concrete counter', 125.00, 'sqft', 1.0, 'premium', 24, false, 7, ARRAY['GFRC Mix:1:sqft', 'Forms:1:sqft', 'Reinforcement:1:sqft', 'Polish:1:sqft']),
  ('Specialty Concrete', 'Skate Park Features', 'Ramps and bowls', 85.00, 'sqft', 0.5, 'premium', 36, false, 8, ARRAY['Concrete:0.02:yards/sqft', 'Steel Coping:0.1:ft/sqft', 'Smooth Finish:1:sqft']),
  ('Specialty Concrete', 'Architectural Wall', 'Decorative concrete wall', 165.00, 'sqft', 1.0, 'premium', 50, false, 9, ARRAY['Form Liner:1:sqft', 'Concrete:0.08:yards/sqft', 'Color:1:integral', 'Seal:1:coat']),
  ('Specialty Concrete', 'Green Roof Base', 'Structural roof deck', 22.50, 'sqft', 0.15, 'premium', 50, false, 10, ARRAY['Lightweight Concrete:0.015:yards/sqft', 'Waterproof:1:sqft', 'Drainage:1:sqft']),
  ('Specialty Concrete', 'Glow-in-Dark Concrete', 'Luminescent aggregate', 18.85, 'sqft', 0.1, 'premium', 36, false, 11, ARRAY['Standard Concrete:0.012:yards/sqft', 'Glow Aggregate:2:lbs/sqft', 'Clear Seal:2:coats']),
  ('Specialty Concrete', 'Concrete Art/Sculpture', 'Custom concrete art', 385.00, 'hour', 1.0, 'premium', 24, false, 12, ARRAY['Sculpting Mix:1:varied', 'Armature:1:varied', 'Tools:1:set', 'Seal:1:varied'])
) AS so(service_name, name, description, price, unit, hours, quality, warranty, popular, display_order, materials)
JOIN service_ids s ON s.name = so.service_name;