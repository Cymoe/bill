-- Create Essential Carpentry Service Options
-- Focus on core items only, proper cost codes, no fluff

DO $$
DECLARE
  v_option_id UUID;
  v_service_id UUID;
  v_system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5';
BEGIN

  -- =====================================================================
  -- DOOR INSTALLATION SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Door Installation' AND organization_id IS NULL;

  -- Interior Door Installation
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Interior Door Professional Install',
    'Complete interior door installation with hardware and trim',
    325.00, 'door', 'standard', 2.5, 24, 'intermediate',
    false, false, true, 1, 10,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  SELECT v_option_id, id, quantity, calc_type, is_opt, ord FROM (VALUES
    -- Labor (CP300 for finish work)
    ('Finish Carpenter', 2::numeric, 'fixed'::text, false::boolean, 1::int),
    ('Journeyman Carpenter', 0.5, 'fixed', false, 2),
    -- Materials (all CP500)
    ('Door Hinges - 3 Pack', 1, 'multiply', false, 3),
    ('Door Handle Set', 1, 'multiply', false, 4),
    ('Door Casing', 17, 'fixed', false, 5),
    ('Wood Shims', 1, 'fixed', false, 6),
    ('Finish Nails', 0.25, 'fixed', false, 7),
    ('Construction Adhesive', 0.5, 'fixed', false, 8)
  ) AS items(name, quantity, calc_type, is_opt, ord)
  JOIN line_items li ON li.name = items.name AND li.organization_id IS NULL
  JOIN cost_codes cc ON li.cost_code_id = cc.id
  WHERE cc.code LIKE 'CP%';

  -- =====================================================================
  -- FINISH CARPENTRY SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Finish Carpentry' AND organization_id IS NULL;

  -- Crown Molding
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Crown Molding Expert Install',
    'Professional crown molding with perfect mitered corners',
    8.50, 'linear_foot', 'premium', 0.12, 36, 'expert',
    false, false, true, 50, 1000,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  SELECT v_option_id, id, quantity, calc_type, is_opt, ord FROM (VALUES
    -- Labor
    ('Master Carpenter', 0.08::numeric, 'per_unit'::text, false::boolean, 1::int),
    ('Journeyman Carpenter', 0.04, 'per_unit', false, 2),
    -- Materials
    ('Crown Molding - Standard', 1.1, 'multiply', false, 3),
    ('Corner Blocks', 0.08, 'per_unit', false, 4),
    ('Finish Nails', 0.02, 'per_unit', false, 5),
    ('Construction Adhesive', 0.02, 'per_unit', false, 6),
    ('Wood Filler', 0.02, 'per_unit', false, 7)
  ) AS items(name, quantity, calc_type, is_opt, ord)
  JOIN line_items li ON li.name = items.name AND li.organization_id IS NULL
  JOIN cost_codes cc ON li.cost_code_id = cc.id
  WHERE cc.code LIKE 'CP%';

  -- Baseboard Installation
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Baseboard Professional Install',
    'Quality baseboard installation with seamless joints',
    4.25, 'linear_foot', 'standard', 0.08, 24, 'intermediate',
    false, false, true, 100, 2000,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  SELECT v_option_id, id, quantity, calc_type, is_opt, ord FROM (VALUES
    -- Labor
    ('Finish Carpenter', 0.06::numeric, 'per_unit'::text, false::boolean, 1::int),
    ('Apprentice Carpenter', 0.02, 'per_unit', false, 2),
    -- Materials  
    ('Baseboard', 1.08, 'multiply', false, 3),
    ('Finish Nails', 0.015, 'per_unit', false, 4),
    ('Construction Adhesive', 0.015, 'per_unit', false, 5),
    ('Caulk', 0.02, 'per_unit', false, 6)
  ) AS items(name, quantity, calc_type, is_opt, ord)
  JOIN line_items li ON li.name = items.name AND li.organization_id IS NULL
  JOIN cost_codes cc ON li.cost_code_id = cc.id
  WHERE cc.code LIKE 'CP%' OR li.name = 'Caulk';

  -- =====================================================================
  -- CABINET INSTALLATION SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Cabinet Installation' AND organization_id IS NULL;

  -- Kitchen Cabinet Set
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Kitchen Cabinet Professional Install',
    'Complete kitchen cabinet installation with leveling and adjustments',
    285.00, 'cabinet', 'standard', 3, 36, 'expert',
    false, true, true, 5, 50,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  SELECT v_option_id, id, quantity, calc_type, is_opt, ord FROM (VALUES
    -- Labor
    ('Cabinet Installer', 2.5::numeric, 'fixed'::text, false::boolean, 1::int),
    ('Apprentice Carpenter', 0.5, 'fixed', false, 2),
    -- Hardware
    ('Cabinet Mounting Rails', 1, 'multiply', false, 3),
    ('Wall Anchors - Heavy Duty', 4, 'fixed', false, 4),
    ('Cabinet Levelers', 4, 'fixed', false, 5),
    ('Cabinet Screws', 0.5, 'fixed', false, 6),
    ('Wood Shims', 2, 'fixed', false, 7),
    -- Optional upgrades
    ('Soft Close Hinges', 2, 'multiply', true, 8)
  ) AS items(name, quantity, calc_type, is_opt, ord)
  JOIN line_items li ON li.name = items.name AND li.organization_id IS NULL;

  -- =====================================================================
  -- FRAMING & STRUCTURAL SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Framing & Structural' AND organization_id IS NULL;

  -- Interior Wall Framing
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Interior Wall Framing Standard',
    'Non-load bearing wall framing with 16" OC studs',
    16.50, 'linear_foot', 'standard', 0.4, 60, 'intermediate',
    true, true, true, 10, 500,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  SELECT v_option_id, id, quantity, calc_type, is_opt, ord FROM (VALUES
    -- Labor
    ('Framing Carpenter', 0.3::numeric, 'per_unit'::text, false::boolean, 1::int),
    ('Apprentice Carpenter', 0.1, 'per_unit', false, 2),
    -- Materials
    ('2x4 Lumber - 8ft', 0.375, 'per_unit', false, 3), -- 3 studs per 8 feet
    ('Framing Nails', 0.1, 'per_unit', false, 4),
    ('Construction Screws', 0.05, 'per_unit', false, 5)
  ) AS items(name, quantity, calc_type, is_opt, ord)
  JOIN line_items li ON li.name = items.name AND li.organization_id IS NULL
  JOIN cost_codes cc ON li.cost_code_id = cc.id
  WHERE cc.code LIKE 'CP%' OR cc.code LIKE 'GC%';

  -- =====================================================================
  -- CUSTOM WOODWORK SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Custom Woodwork' AND organization_id IS NULL;

  -- Built-in Shelving
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Custom Shelving System',
    'Built-in shelving with adjustable shelves',
    165.00, 'linear_foot', 'standard', 1.5, 24, 'advanced',
    false, false, true, 4, 50,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  SELECT v_option_id, id, quantity, calc_type, is_opt, ord FROM (VALUES
    -- Labor
    ('Finish Carpenter', 1.2::numeric, 'per_unit'::text, false::boolean, 1::int),
    ('Apprentice Carpenter', 0.3, 'per_unit', false, 2),
    -- Materials
    ('Plywood - Cabinet Grade', 0.333, 'per_unit', false, 3),
    ('Shelf Standards', 0.5, 'per_unit', false, 4),
    ('Shelf Brackets', 2, 'per_unit', false, 5),
    ('Wood Stain', 0.02, 'per_unit', false, 6),
    ('Polyurethane Finish', 0.02, 'per_unit', false, 7)
  ) AS items(name, quantity, calc_type, is_opt, ord)
  JOIN line_items li ON li.name = items.name AND li.organization_id IS NULL;

  -- =====================================================================
  -- DECK BUILDING SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Deck Building' AND organization_id IS NULL;

  -- Deck Construction
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Pressure Treated Deck Build',
    'Complete deck construction with PT lumber',
    28.50, 'sqft', 'standard', 0.4, 60, 'advanced',
    true, true, true, 100, 1000,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  SELECT v_option_id, id, quantity, calc_type, is_opt, ord FROM (VALUES
    -- Labor
    ('Master Carpenter', 0.25::numeric, 'per_unit'::text, false::boolean, 1::int),
    ('Framing Carpenter', 0.15, 'per_unit', false, 2),
    -- Materials
    ('Pressure Treated Decking', 1.1, 'multiply', false, 3),
    ('2x8 Joist Lumber', 0.25, 'per_unit', false, 4),
    ('Joist Hangers', 0.125, 'per_unit', false, 5),
    ('Deck Screws - 3"', 0.05, 'per_unit', false, 6),
    ('Concrete Mix', 0.02, 'per_unit', false, 7)
  ) AS items(name, quantity, calc_type, is_opt, ord)
  JOIN line_items li ON li.name = items.name AND li.organization_id IS NULL;

  -- Deck Stain & Seal
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Deck Stain & Seal',
    'Professional deck staining with premium sealer',
    3.50, 'sqft', 'premium', 0.05, 24, 'basic',
    false, false, true, 100, 2000,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  SELECT v_option_id, id, quantity, calc_type, is_opt, ord FROM (VALUES
    -- Labor
    ('Journeyman Carpenter', 0.04::numeric, 'per_unit'::text, false::boolean, 1::int),
    ('Apprentice Carpenter', 0.01, 'per_unit', false, 2),
    -- Materials with coverage
    ('Deck Stain/Sealer', 1, 'multiply', false, 3),
    ('Stain Brushes', 0.005, 'per_unit', false, 4),
    ('Sandpaper - Medium', 0.01, 'per_unit', false, 5)
  ) AS items(name, quantity, calc_type, is_opt, ord)
  JOIN line_items li ON li.name = items.name AND li.organization_id IS NULL;

  -- Update coverage for deck stain
  UPDATE service_option_items soi
  SET coverage_amount = 250, coverage_unit = 'sqft_per_gallon'
  FROM line_items li
  WHERE soi.line_item_id = li.id
  AND li.name = 'Deck Stain/Sealer'
  AND soi.service_option_id = v_option_id;

END $$;

-- Verify the results
SELECT 
  s.name as service_name,
  so.name as option_name,
  so.price,
  so.unit,
  COUNT(soi.id) as item_count
FROM service_options so
JOIN services s ON so.service_id = s.id
LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
WHERE so.organization_id IS NULL
AND s.industry_id = (SELECT id FROM industries WHERE name = 'Carpentry')
GROUP BY s.name, so.name, so.price, so.unit
ORDER BY s.name, so.name;