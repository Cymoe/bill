-- Create Comprehensive Painting Service Options
-- Each option includes 15-25 items covering all aspects of real painting jobs

-- Function to get system user ID
CREATE OR REPLACE FUNCTION get_system_user_id() RETURNS UUID AS $$
BEGIN
  RETURN '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- PAINTING SERVICE OPTIONS - COMPREHENSIVE
-- =====================================================================

DO $$
DECLARE
  v_option_id UUID;
  v_service_id UUID;
  v_system_user_id UUID := get_system_user_id();
BEGIN
  -- Get the Paint Walls service ID
  SELECT id INTO v_service_id
  FROM services 
  WHERE name = 'Paint Walls'
  AND organization_id IS NULL
  LIMIT 1;

  IF v_service_id IS NULL THEN
    RAISE NOTICE 'Paint Walls service not found';
    RETURN;
  END IF;

  -- =====================================================================
  -- 1. INTERIOR WALL PAINTING - PROFESSIONAL GRADE (2 COATS)
  -- =====================================================================
  
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active,
    created_at, updated_at
  ) VALUES (
    v_service_id, 
    'Interior Wall Painting - Professional',
    'Complete professional interior wall painting including prep, prime, 2 coats of paint, and cleanup. Includes all materials and labor.',
    8.50,  -- Per sqft pricing
    'sqft',
    'standard',
    0.06,  -- Total hours per sqft (all labor combined)
    12,    -- 1 year warranty
    'intermediate',
    false,  -- No permit required for interior painting
    false,  -- No inspection required
    true,   -- Taxable service
    100,    -- Min 100 sqft
    5000,   -- Max 5000 sqft per job
    NULL,
    v_system_user_id,
    true,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO v_option_id;

  -- Add all line items for interior wall painting
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR COMPONENTS (3 types)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter - Standard' AND organization_id IS NULL LIMIT 1), 
   0.025, 'per_unit'::calculation_type_enum, false, 1),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter Helper' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 2),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Surface Prep Labor' AND organization_id IS NULL LIMIT 1), 
   0.015, 'per_unit'::calculation_type_enum, false, 3),
  
  -- PAINT & PRIMER (core materials)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Primer - Interior' AND organization_id IS NULL LIMIT 1), 
   0.0029, 'per_unit'::calculation_type_enum, false, 4),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Interior Paint - Standard' AND organization_id IS NULL LIMIT 1), 
   0.0057, 'per_unit'::calculation_type_enum, false, 5),
  
  -- PREP MATERIALS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Spackling Compound' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 6),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, false, 7),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Caulk' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 8),
  
  -- PROTECTION MATERIALS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painters Tape' AND organization_id IS NULL LIMIT 1), 
   0.025, 'per_unit'::calculation_type_enum, false, 9),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 10),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Plastic Sheeting' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 11),
  
  -- APPLICATION TOOLS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Roller Cover - 3/8" nap' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 12),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paintbrush - 2.5"' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 13),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paint Tray' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 14),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paint Tray Liner' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 15),
  
  -- CLEANUP SUPPLIES
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Tack Cloth' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, false, 16),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Cotton Rags' AND organization_id IS NULL LIMIT 1), 
   0.004, 'per_unit'::calculation_type_enum, false, 17),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Soap' AND organization_id IS NULL LIMIT 1), 
   0.0001, 'per_unit'::calculation_type_enum, false, 18),
  
  -- DISPOSAL
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
   0.0001, 'per_unit'::calculation_type_enum, false, 19),
  
  -- OPTIONAL UPGRADES
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Interior Paint - Premium' AND organization_id IS NULL LIMIT 1), 
   0.0057, 'per_unit'::calculation_type_enum, true, 20),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Interior Paint - Zero VOC' AND organization_id IS NULL LIMIT 1), 
   0.0057, 'per_unit'::calculation_type_enum, true, 21);

  -- =====================================================================
  -- 2. CEILING PAINTING - SMOOTH FINISH
  -- =====================================================================
  
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active,
    created_at, updated_at
  ) VALUES (
    v_service_id, 
    'Ceiling Painting - Smooth Finish',
    'Professional ceiling painting with smooth finish. Includes spot priming, 2 coats of ceiling paint, edge work, and protection of walls/floors.',
    6.50,
    'sqft',
    'standard',
    0.045,
    12,
    'intermediate',
    false,
    false,
    true,
    100,
    3000,
    NULL,
    v_system_user_id,
    true,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO v_option_id;

  -- Add all line items for ceiling painting
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter - Standard' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 1),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter Helper' AND organization_id IS NULL LIMIT 1), 
   0.015, 'per_unit'::calculation_type_enum, false, 2),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Surface Prep Labor' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 3),
  
  -- PAINT (ceiling specific)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Primer - Interior' AND organization_id IS NULL LIMIT 1), 
   0.0015, 'per_unit'::calculation_type_enum, false, 4),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Interior Paint - Standard' AND organization_id IS NULL LIMIT 1), 
   0.0057, 'per_unit'::calculation_type_enum, false, 5),
  
  -- PREP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Spackling Compound' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 6),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 7),
  
  -- PROTECTION (more critical for ceiling work)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painters Tape' AND organization_id IS NULL LIMIT 1), 
   0.03, 'per_unit'::calculation_type_enum, false, 8),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
   0.015, 'per_unit'::calculation_type_enum, false, 9),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Plastic Sheeting' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 10),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Masking Film' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 11),
  
  -- TOOLS (thicker nap for ceiling texture)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Roller Cover - 3/4" nap' AND organization_id IS NULL LIMIT 1), 
   0.0025, 'per_unit'::calculation_type_enum, false, 12),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Extension Pole' AND organization_id IS NULL LIMIT 1), 
   0.0002, 'per_unit'::calculation_type_enum, false, 13),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paint Tray' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 14),
  
  -- CLEANUP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Cotton Rags' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, false, 15),
  
  -- EQUIPMENT
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Extension Ladder Rental' AND organization_id IS NULL LIMIT 1), 
   0.0005, 'per_unit'::calculation_type_enum, false, 16);

  -- =====================================================================
  -- 3. TRIM & MOLDING PAINTING - DETAIL WORK
  -- =====================================================================
  
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    minimum_quantity, maximum_quantity,
    organization_id, user_id, is_template, is_active,
    created_at, updated_at
  ) VALUES (
    v_service_id, 
    'Trim & Molding Painting - Detail',
    'Precision painting of baseboards, crown molding, door/window trim. Includes sanding, priming, 2 finish coats, and caulking.',
    4.75,
    'linear_foot',
    'premium',
    0.08,
    24,  -- 2 year warranty for trim work
    'advanced',
    false,
    false,
    true,
    50,    -- Min 50 linear feet
    2000,  -- Max 2000 linear feet
    NULL,
    v_system_user_id,
    true,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO v_option_id;

  -- Add line items for trim painting
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- SKILLED LABOR (trim requires more skill)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter - Premium' AND organization_id IS NULL LIMIT 1), 
   0.06, 'per_unit'::calculation_type_enum, false, 1),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Surface Prep Labor' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 2),
  
  -- PAINT & PRIMER (high quality for trim)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Primer - Interior' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 3),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Interior Paint - Premium' AND organization_id IS NULL LIMIT 1), 
   0.015, 'per_unit'::calculation_type_enum, false, 4),
  
  -- PREP (critical for trim)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 5),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Spackling Compound' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 6),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Caulk' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 7),
  
  -- PRECISION PROTECTION
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painters Tape' AND organization_id IS NULL LIMIT 1), 
   0.1, 'per_unit'::calculation_type_enum, false, 8),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 9),
  
  -- BRUSHWORK TOOLS (no rollers for trim)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paintbrush - 2.5"' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 10),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paintbrush - 4"' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 11),
  
  -- CLEANUP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Tack Cloth' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 12),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Cotton Rags' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 13),
  
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Mineral Spirits' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 14);

  -- =====================================================================
  -- 4. CABINET PAINTING - PROFESSIONAL REFINISHING
  -- =====================================================================
  
  -- Get Cabinet Painting service
  SELECT id INTO v_service_id
  FROM services 
  WHERE name = 'Cabinet Painting'
  AND organization_id IS NULL
  LIMIT 1;

  IF v_service_id IS NOT NULL THEN
    INSERT INTO service_options (
      service_id, name, description, price, unit,
      material_quality, estimated_hours, warranty_months, skill_level,
      permit_required, requires_inspection, is_taxable,
      minimum_quantity, maximum_quantity,
      organization_id, user_id, is_template, is_active,
      created_at, updated_at
    ) VALUES (
      v_service_id, 
      'Cabinet Painting - Complete Refinish',
      'Professional cabinet refinishing including cleaning, sanding, priming, painting, and hardware. Transform kitchen/bathroom cabinets.',
      125.00,
      'door',  -- Per cabinet door
      'premium',
      2.5,     -- 2.5 hours per door
      36,      -- 3 year warranty
      'expert',
      false,
      false,
      true,
      10,      -- Min 10 doors
      100,     -- Max 100 doors
      NULL,
      v_system_user_id,
      true,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_option_id;

    -- Add cabinet painting items
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- EXPERT LABOR
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter - Premium' AND organization_id IS NULL LIMIT 1), 
     2, 'fixed'::calculation_type_enum, false, 1),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Surface Prep Labor' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed'::calculation_type_enum, false, 2),
    
    -- SPECIALTY PAINT
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Primer - Interior' AND organization_id IS NULL LIMIT 1), 
     0.125, 'fixed'::calculation_type_enum, false, 3),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Interior Paint - Premium' AND organization_id IS NULL LIMIT 1), 
     0.25, 'fixed'::calculation_type_enum, false, 4),
    
    -- INTENSIVE PREP
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed'::calculation_type_enum, false, 5),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Tack Cloth' AND organization_id IS NULL LIMIT 1), 
     0.2, 'fixed'::calculation_type_enum, false, 6),
    
    -- PROTECTION
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Plastic Sheeting' AND organization_id IS NULL LIMIT 1), 
     0.1, 'fixed'::calculation_type_enum, false, 7),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Masking Film' AND organization_id IS NULL LIMIT 1), 
     0.1, 'fixed'::calculation_type_enum, false, 8),
    
    -- BRUSHES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Paintbrush - 2.5"' AND organization_id IS NULL LIMIT 1), 
     0.05, 'fixed'::calculation_type_enum, false, 9),
    
    -- CLEANUP
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Mineral Spirits' AND organization_id IS NULL LIMIT 1), 
     0.05, 'fixed'::calculation_type_enum, false, 10),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cotton Rags' AND organization_id IS NULL LIMIT 1), 
     0.2, 'fixed'::calculation_type_enum, false, 11),
    
    -- EQUIPMENT
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Spray Equipment Rental' AND organization_id IS NULL LIMIT 1), 
     0.02, 'fixed'::calculation_type_enum, true, 12);
  END IF;

  -- =====================================================================
  -- 5. EXTERIOR SIDING PAINTING - WEATHER RESISTANT
  -- =====================================================================
  
  -- Get Exterior Painting service
  SELECT id INTO v_service_id
  FROM services 
  WHERE name = 'Exterior Painting'
  AND organization_id IS NULL
  LIMIT 1;

  IF v_service_id IS NOT NULL THEN
    INSERT INTO service_options (
      service_id, name, description, price, unit,
      material_quality, estimated_hours, warranty_months, skill_level,
      permit_required, requires_inspection, is_taxable,
      minimum_quantity, maximum_quantity,
      organization_id, user_id, is_template, is_active,
      created_at, updated_at
    ) VALUES (
      v_service_id, 
      'Exterior Siding - Weather Shield',
      'Complete exterior siding painting with pressure washing, repairs, primer, 2 coats premium exterior paint. Weather-resistant finish.',
      12.50,
      'sqft',
      'premium',
      0.08,
      60,     -- 5 year warranty for exterior
      'intermediate',
      true,   -- Often requires permit
      true,   -- May require inspection
      true,
      500,    -- Min 500 sqft
      10000,  -- Max 10000 sqft
      NULL,
      v_system_user_id,
      true,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_option_id;

    -- Add exterior painting items
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- LABOR
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter - Standard' AND organization_id IS NULL LIMIT 1), 
     0.04, 'per_unit'::calculation_type_enum, false, 1),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter Helper' AND organization_id IS NULL LIMIT 1), 
     0.025, 'per_unit'::calculation_type_enum, false, 2),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Surface Prep Labor' AND organization_id IS NULL LIMIT 1), 
     0.015, 'per_unit'::calculation_type_enum, false, 3),
    
    -- EXTERIOR PAINT
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Exterior Primer' AND organization_id IS NULL LIMIT 1), 
     0.0029, 'per_unit'::calculation_type_enum, false, 4),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Exterior Paint - Premium' AND organization_id IS NULL LIMIT 1), 
     0.0057, 'per_unit'::calculation_type_enum, false, 5),
    
    -- PREP
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Exterior Caulk' AND organization_id IS NULL LIMIT 1), 
     0.002, 'per_unit'::calculation_type_enum, false, 6),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1), 
     0.004, 'per_unit'::calculation_type_enum, false, 7),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Scraper Blades' AND organization_id IS NULL LIMIT 1), 
     0.001, 'per_unit'::calculation_type_enum, false, 8),
    
    -- PROTECTION
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Plastic Sheeting' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit'::calculation_type_enum, false, 9),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Masking Film' AND organization_id IS NULL LIMIT 1), 
     0.005, 'per_unit'::calculation_type_enum, false, 10),
    
    -- TOOLS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Roller Cover - 3/4" nap' AND organization_id IS NULL LIMIT 1), 
     0.003, 'per_unit'::calculation_type_enum, false, 11),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Paintbrush - 4"' AND organization_id IS NULL LIMIT 1), 
     0.002, 'per_unit'::calculation_type_enum, false, 12),
    
    -- EQUIPMENT
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Pressure Washer Rental' AND organization_id IS NULL LIMIT 1), 
     0.001, 'per_unit'::calculation_type_enum, false, 13),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Extension Ladder Rental' AND organization_id IS NULL LIMIT 1), 
     0.001, 'per_unit'::calculation_type_enum, false, 14),
    
    -- SAFETY
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Safety Harness' AND organization_id IS NULL LIMIT 1), 
     0.001, 'per_unit'::calculation_type_enum, false, 15),
    
    -- PERMITS & TESTING
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Painting Permit' AND organization_id IS NULL LIMIT 1), 
     0.0001, 'per_unit'::calculation_type_enum, false, 16),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Lead Paint Test Kit' AND organization_id IS NULL LIMIT 1), 
     0.0001, 'per_unit'::calculation_type_enum, false, 17),
    
    -- CLEANUP
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
     0.0002, 'per_unit'::calculation_type_enum, false, 18),
    
    -- OPTIONAL SPRAY
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Spray Equipment Rental' AND organization_id IS NULL LIMIT 1), 
     0.001, 'per_unit'::calculation_type_enum, true, 19);
  END IF;

END $$;

-- Verify our work
SELECT 
  so.name as option_name,
  s.name as service_name,
  so.unit,
  so.price,
  so.material_quality,
  so.estimated_hours,
  so.warranty_months,
  so.permit_required,
  so.requires_inspection,
  COUNT(soi.id) as total_items,
  COUNT(CASE WHEN soi.is_optional = false THEN 1 END) as required_items,
  COUNT(CASE WHEN soi.is_optional = true THEN 1 END) as optional_items
FROM service_options so
JOIN services s ON so.service_id = s.id
LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
WHERE so.organization_id IS NULL
AND s.industry_id = (SELECT id FROM industries WHERE name = 'Painting')
AND so.created_at > CURRENT_DATE - INTERVAL '1 hour'
GROUP BY so.id, so.name, s.name, so.unit, so.price, so.material_quality, 
         so.estimated_hours, so.warranty_months, so.permit_required, so.requires_inspection
ORDER BY s.name, so.name;