-- Create Realistic Carpentry Service Options
-- Using proper units, coverage, and real-world quantities

DO $$
DECLARE
  v_option_id UUID;
  v_service_id UUID;
  v_system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5';
  v_line_item_id UUID;
BEGIN

  -- =====================================================================
  -- DOOR INSTALLATION SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Door Installation' AND organization_id IS NULL;

  -- Interior Door Professional Install
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
    0.00, -- Temporary price, will be calculated by trigger
    'door', 'standard', 2.5, 24, 'intermediate',
    false, false, true, 1, 10,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  -- Labor (fixed hours per door)
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Carpenter' AND organization_id IS NULL LIMIT 1), 
     2, 'fixed', false, 1),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed', false, 2);

  -- Hardware (per door)
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Door Hinges - 3 Pack' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', false, 3),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Door Handle Set' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', false, 4),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Strike Plate' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', false, 5);

  -- Trim (fixed amount per door)
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Door Casing' AND organization_id IS NULL LIMIT 1), 
     17, 'fixed', false, 6);

  -- Supplies
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Shims' AND organization_id IS NULL LIMIT 1), 
     1, 'fixed', false, 7);

  -- Adhesive with coverage (1 tube does 4 doors)
  SELECT id INTO v_line_item_id FROM line_items WHERE name = 'Adhesive' AND organization_id IS NULL LIMIT 1;
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, coverage_amount, coverage_unit, is_optional, display_order)
  VALUES
    (v_option_id, v_line_item_id, 1, 'multiply', 4, 'door_per_tube', false, 8);

  -- =====================================================================
  -- FINISH CARPENTRY SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Finish Carpentry' AND organization_id IS NULL;

  -- Crown Molding Expert Install
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Crown Molding Professional',
    'Expert crown molding installation with perfect mitered corners',
    0.00, -- Temporary price, will be calculated
    'linear_foot', 'premium', 0.12, 36, 'expert',
    false, false, true, 50, 1000,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  -- Labor (per linear foot)
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Master Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.08, 'per_unit', false, 1),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Journeyman Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.04, 'per_unit', false, 2);

  -- Materials
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Crown Molding - Standard' AND organization_id IS NULL LIMIT 1), 
     1.1, 'multiply', false, 3),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Corner Blocks' AND organization_id IS NULL LIMIT 1), 
     0.08, 'per_unit', false, 4);

  -- Adhesive with coverage (1 tube per 50 linear feet)
  SELECT id INTO v_line_item_id FROM line_items WHERE name = 'Adhesive' AND organization_id IS NULL LIMIT 1;
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, coverage_amount, coverage_unit, is_optional, display_order)
  VALUES
    (v_option_id, v_line_item_id, 1, 'multiply', 50, 'linear_foot_per_tube', false, 5);

  -- Wood Glue with coverage (1 quart per 200 linear feet)
  SELECT id INTO v_line_item_id FROM line_items WHERE name = 'Wood Glue' AND organization_id IS NULL LIMIT 1;
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, coverage_amount, coverage_unit, is_optional, display_order)
  VALUES
    (v_option_id, v_line_item_id, 1, 'multiply', 200, 'linear_foot_per_quart', false, 6);

  -- Baseboard Professional Install
  INSERT INTO service_options (
    service_id, name, description, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Baseboard Installation',
    'Professional baseboard installation with seamless joints',
    'linear_foot', 'standard', 0.08, 24, 'intermediate',
    false, false, true, 100, 2000,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  -- Labor
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.06, 'per_unit', false, 1),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', false, 2);

  -- Materials
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Baseboard' AND organization_id IS NULL LIMIT 1), 
     1.08, 'multiply', false, 3);

  -- Adhesive with coverage
  SELECT id INTO v_line_item_id FROM line_items WHERE name = 'Adhesive' AND organization_id IS NULL LIMIT 1;
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, coverage_amount, coverage_unit, is_optional, display_order)
  VALUES
    (v_option_id, v_line_item_id, 1, 'multiply', 100, 'linear_foot_per_tube', false, 4);

  -- =====================================================================
  -- CABINET INSTALLATION SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Cabinet Installation' AND organization_id IS NULL;

  -- Kitchen Cabinet Professional Install
  INSERT INTO service_options (
    service_id, name, description, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Kitchen Cabinet Installation',
    'Professional kitchen cabinet installation with leveling',
    'cabinet', 'standard', 3, 36, 'expert',
    false, true, true, 5, 50,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  -- Labor
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cabinet Installer' AND organization_id IS NULL LIMIT 1), 
     2.5, 'fixed', false, 1),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed', false, 2);

  -- Hardware
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cabinet Mounting Rails' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', false, 3),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wall Anchors - Heavy Duty' AND organization_id IS NULL LIMIT 1), 
     4, 'fixed', false, 4),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cabinet Levelers' AND organization_id IS NULL LIMIT 1), 
     4, 'fixed', false, 5),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Shims' AND organization_id IS NULL LIMIT 1), 
     2, 'fixed', false, 6);

  -- Optional upgrade
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Soft Close Hinges' AND organization_id IS NULL LIMIT 1), 
     2, 'multiply', true, 7);

  -- =====================================================================
  -- FRAMING & STRUCTURAL SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Framing & Structural' AND organization_id IS NULL;

  -- Interior Wall Framing
  INSERT INTO service_options (
    service_id, name, description, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Interior Wall Framing',
    'Non-load bearing interior wall framing 16" OC',
    'linear_foot', 'standard', 0.4, 60, 'intermediate',
    true, true, true, 10, 500,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  -- Labor
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Framing Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.3, 'per_unit', false, 1),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.1, 'per_unit', false, 2);

  -- Materials
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = '2x4 Lumber - 8ft' AND organization_id IS NULL LIMIT 1), 
     0.375, 'per_unit', false, 3);

  -- =====================================================================
  -- CUSTOM WOODWORK SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Custom Woodwork' AND organization_id IS NULL;

  -- Built-in Shelving
  INSERT INTO service_options (
    service_id, name, description, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Custom Built-In Shelving',
    'Custom shelving system with adjustable shelves',
    'linear_foot', 'standard', 1.5, 24, 'advanced',
    false, false, true, 4, 50,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  -- Labor
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Carpenter' AND organization_id IS NULL LIMIT 1), 
     1.2, 'per_unit', false, 1),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.3, 'per_unit', false, 2);

  -- Materials
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Plywood - Cabinet Grade' AND organization_id IS NULL LIMIT 1), 
     0.333, 'per_unit', false, 3),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Shelf Standards' AND organization_id IS NULL LIMIT 1), 
     0.5, 'per_unit', false, 4),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Shelf Brackets' AND organization_id IS NULL LIMIT 1), 
     2, 'per_unit', false, 5);

  -- Wood Stain with coverage (1 quart per 150 sqft, approx 50 linear feet of shelving)
  SELECT id INTO v_line_item_id FROM line_items WHERE name = 'Wood Stain' AND organization_id IS NULL LIMIT 1;
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, coverage_amount, coverage_unit, is_optional, display_order)
  VALUES
    (v_option_id, v_line_item_id, 1, 'multiply', 50, 'linear_foot_per_quart', false, 6);

  -- Polyurethane with coverage
  SELECT id INTO v_line_item_id FROM line_items WHERE name = 'Polyurethane Finish' AND organization_id IS NULL LIMIT 1;
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, coverage_amount, coverage_unit, is_optional, display_order)
  VALUES
    (v_option_id, v_line_item_id, 1, 'multiply', 75, 'linear_foot_per_quart', false, 7);

  -- =====================================================================
  -- DECK BUILDING SERVICE
  -- =====================================================================
  
  SELECT id INTO v_service_id FROM services WHERE name = 'Deck Building' AND organization_id IS NULL;

  -- Deck Construction
  INSERT INTO service_options (
    service_id, name, description, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Pressure Treated Deck Build',
    'Complete deck construction with PT lumber',
    'sqft', 'standard', 0.4, 60, 'advanced',
    true, true, true, 100, 1000,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  -- Labor
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Master Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.25, 'per_unit', false, 1),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Framing Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.15, 'per_unit', false, 2);

  -- Materials
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Pressure Treated Decking' AND organization_id IS NULL LIMIT 1), 
     1.1, 'multiply', false, 3),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Joist Hangers' AND organization_id IS NULL LIMIT 1), 
     0.125, 'per_unit', false, 4);

  -- Deck Stain & Seal
  INSERT INTO service_options (
    service_id, name, description, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active
  ) VALUES (
    v_service_id, 
    'Deck Stain & Seal',
    'Professional deck staining with premium sealer',
    'sqft', 'premium', 0.05, 24, 'basic',
    false, false, true, 100, 2000,
    NULL, v_system_user_id, true, true
  ) RETURNING id INTO v_option_id;

  -- Labor
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Journeyman Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.04, 'per_unit', false, 1),
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 2);

  -- Deck Stain with coverage
  SELECT id INTO v_line_item_id FROM line_items WHERE name = 'Deck Stain/Sealer' AND organization_id IS NULL LIMIT 1;
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, coverage_amount, coverage_unit, is_optional, display_order)
  VALUES
    (v_option_id, v_line_item_id, 1, 'multiply', 250, 'sqft_per_gallon', false, 3);

  -- Stain Brushes with coverage (1 brush per 500 sqft)
  SELECT id INTO v_line_item_id FROM line_items WHERE name = 'Stain Brushes' AND organization_id IS NULL LIMIT 1;
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, coverage_amount, coverage_unit, is_optional, display_order)
  VALUES
    (v_option_id, v_line_item_id, 1, 'multiply', 500, 'sqft_per_each', false, 4);

  -- Sandpaper with coverage (1 pack per 100 sqft)
  SELECT id INTO v_line_item_id FROM line_items WHERE name = 'Sandpaper - Fine' AND organization_id IS NULL LIMIT 1;
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, coverage_amount, coverage_unit, is_optional, display_order)
  VALUES
    (v_option_id, v_line_item_id, 1, 'multiply', 100, 'sqft_per_pack', false, 5);

END $$;

-- Verify the results
SELECT 
  s.name as service_name,
  so.name as option_name,
  so.unit,
  COUNT(soi.id) as item_count,
  COUNT(CASE WHEN soi.coverage_amount IS NOT NULL THEN 1 END) as coverage_items
FROM service_options so
JOIN services s ON so.service_id = s.id
LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
WHERE s.industry_id = (SELECT id FROM industries WHERE name = 'Carpentry')
AND so.organization_id IS NULL
GROUP BY s.name, so.name, so.unit
ORDER BY s.name, so.name;