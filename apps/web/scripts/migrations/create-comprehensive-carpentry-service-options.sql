-- Create Comprehensive Carpentry Service Options
-- Each option includes 15-25 items covering all aspects of real carpentry jobs

-- Function to get system user ID
CREATE OR REPLACE FUNCTION get_system_user_id() RETURNS UUID AS $$
BEGIN
  RETURN '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- CARPENTRY SERVICE OPTIONS - COMPREHENSIVE
-- =====================================================================

DO $$
DECLARE
  v_option_id UUID;
  v_service_id UUID;
  v_system_user_id UUID := get_system_user_id();
BEGIN

  -- =====================================================================
  -- 1. INTERIOR DOOR INSTALLATION - COMPLETE
  -- =====================================================================
  
  -- Get Door Installation service
  SELECT id INTO v_service_id
  FROM services 
  WHERE name = 'Door Installation'
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
      'Interior Door Install - Complete',
      'Professional interior door installation including frame prep, door hanging, hardware installation, trim work, and finish adjustments.',
      385.00,
      'door',
      'standard',
      3.5,
      24,
      'intermediate',
      false,
      false,
      true,
      1,
      20,
      NULL,
      v_system_user_id,
      true,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_option_id;

    -- Add all line items
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- LABOR
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Carpenter' AND organization_id IS NULL LIMIT 1), 
     2.5, 'fixed', false, 1),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     1, 'fixed', false, 2),
    
    -- DOOR & HARDWARE (customer typically provides door)
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Door Hinges - 3 Pack' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', false, 3),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Door Handle Set' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', false, 4),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Strike Plate' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', false, 5),
    
    -- TRIM MATERIALS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Door Casing' AND organization_id IS NULL LIMIT 1), 
     17, 'fixed', false, 6),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Door Stop Molding' AND organization_id IS NULL LIMIT 1), 
     17, 'fixed', false, 7),
    
    -- FASTENERS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Nails' AND organization_id IS NULL LIMIT 1), 
     0.1, 'fixed', false, 8),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Screws - Cabinet' AND organization_id IS NULL LIMIT 1), 
     0.05, 'fixed', false, 9),
    
    -- PREP & ADJUSTMENTS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Shims' AND organization_id IS NULL LIMIT 1), 
     1, 'fixed', false, 10),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Construction Adhesive' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed', false, 11),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Filler' AND organization_id IS NULL LIMIT 1), 
     0.1, 'fixed', false, 12),
    
    -- FINISHING
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Caulk' AND organization_id IS NULL LIMIT 1), 
     1, 'fixed', false, 13),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper - Fine' AND organization_id IS NULL LIMIT 1), 
     0.1, 'fixed', false, 14),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Touch-up Paint' AND organization_id IS NULL LIMIT 1), 
     0.25, 'fixed', false, 15),
    
    -- PROTECTION
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed', false, 16),
    
    -- CLEANUP
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
     0.25, 'fixed', false, 17),
    
    -- SAFETY
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Safety Glasses' AND organization_id IS NULL LIMIT 1), 
     0.05, 'fixed', false, 18),
    
    -- OPTIONAL UPGRADES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Privacy Lock Set' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', true, 19),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Soft Close Hinges' AND organization_id IS NULL LIMIT 1), 
     1.5, 'multiply', true, 20);
  END IF;

  -- =====================================================================
  -- 2. CROWN MOLDING - PROFESSIONAL INSTALLATION
  -- =====================================================================
  
  -- Get Trim & Molding service
  SELECT id INTO v_service_id
  FROM services 
  WHERE name = 'Trim & Molding'
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
      'Crown Molding - Professional Install',
      'Expert crown molding installation with precise mitered corners, seamless joints, and perfect finish. Includes all prep and cleanup.',
      12.50,
      'linear_foot',
      'premium',
      0.15,
      36,
      'expert',
      false,
      false,
      true,
      50,
      1000,
      NULL,
      v_system_user_id,
      true,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_option_id;

    -- Add line items
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- SKILLED LABOR
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Master Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.1, 'per_unit', false, 1),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.05, 'per_unit', false, 2),
    
    -- MOLDING (with waste factor)
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Crown Molding - Standard' AND organization_id IS NULL LIMIT 1), 
     1.12, 'multiply', false, 3),
    
    -- CORNER PIECES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Corner Blocks' AND organization_id IS NULL LIMIT 1), 
     0.08, 'per_unit', false, 4),
    
    -- FASTENERS & ADHESIVES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Nails' AND organization_id IS NULL LIMIT 1), 
     0.003, 'per_unit', false, 5),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Construction Adhesive' AND organization_id IS NULL LIMIT 1), 
     0.05, 'per_unit', false, 6),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Glue' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', false, 7),
    
    -- PREP & FINISHING
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Filler' AND organization_id IS NULL LIMIT 1), 
     0.05, 'per_unit', false, 8),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Caulk' AND organization_id IS NULL LIMIT 1), 
     0.03, 'per_unit', false, 9),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper - Fine' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', false, 10),
    
    -- PROTECTION & MARKING
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Painters Tape' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', false, 11),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 12),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Pencils' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 13),
    
    -- TOOLS & BLADES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Miter Saw Blade' AND organization_id IS NULL LIMIT 1), 
     0.001, 'per_unit', false, 14),
    
    -- SAFETY
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Safety Glasses' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 15),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Dust Mask' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', false, 16),
    
    -- CLEANUP
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Shop Vacuum Rental' AND organization_id IS NULL LIMIT 1), 
     0.005, 'per_unit', false, 17),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
     0.001, 'per_unit', false, 18),
    
    -- OPTIONAL PREMIUM
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Crown Molding - Premium' AND organization_id IS NULL LIMIT 1), 
     1.12, 'multiply', true, 19),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Touch-up Paint' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', true, 20);
  END IF;

  -- =====================================================================
  -- 3. CUSTOM SHELVING - BUILT-IN INSTALLATION
  -- =====================================================================
  
  -- Get Custom Carpentry service
  SELECT id INTO v_service_id
  FROM services 
  WHERE name = 'Custom Carpentry'
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
      'Built-in Shelving System',
      'Custom built-in shelving with adjustable shelves, finished edges, and wall mounting. Perfect for closets, offices, or living spaces.',
      225.00,
      'linear_foot',
      'standard',
      2,
      24,
      'advanced',
      false,
      false,
      true,
      4,
      50,
      NULL,
      v_system_user_id,
      true,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_option_id;

    -- Add line items
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- LABOR
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Carpenter' AND organization_id IS NULL LIMIT 1), 
     1.5, 'per_unit', false, 1),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.5, 'per_unit', false, 2),
    
    -- SHELF MATERIALS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Plywood - Cabinet Grade' AND organization_id IS NULL LIMIT 1), 
     0.375, 'per_unit', false, 3),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Edge Banding' AND organization_id IS NULL LIMIT 1), 
     3, 'per_unit', false, 4),
    
    -- MOUNTING HARDWARE
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Shelf Standards' AND organization_id IS NULL LIMIT 1), 
     0.5, 'per_unit', false, 5),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Shelf Brackets' AND organization_id IS NULL LIMIT 1), 
     2, 'per_unit', false, 6),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Shelf Pins' AND organization_id IS NULL LIMIT 1), 
     0.5, 'per_unit', false, 7),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wall Anchors - Heavy Duty' AND organization_id IS NULL LIMIT 1), 
     2, 'per_unit', false, 8),
    
    -- FASTENERS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Screws - Cabinet' AND organization_id IS NULL LIMIT 1), 
     0.1, 'per_unit', false, 9),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Pocket Screws' AND organization_id IS NULL LIMIT 1), 
     0.05, 'per_unit', false, 10),
    
    -- FINISHING
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Stain' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', false, 11),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Polyurethane Finish' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', false, 12),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper - Fine' AND organization_id IS NULL LIMIT 1), 
     0.1, 'per_unit', false, 13),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Steel Wool' AND organization_id IS NULL LIMIT 1), 
     0.05, 'per_unit', false, 14),
    
    -- TOOLS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Router Bits' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 15),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Saw Blades' AND organization_id IS NULL LIMIT 1), 
     0.005, 'per_unit', false, 16),
    
    -- SAFETY & CLEANUP
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Dust Mask' AND organization_id IS NULL LIMIT 1), 
     0.1, 'per_unit', false, 17),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
     0.05, 'per_unit', false, 18),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Shop Vacuum Rental' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 19),
    
    -- OPTIONAL
    (v_option_id, (SELECT id FROM line_items WHERE name = 'LED Strip Lighting' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', true, 20),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Hardwood - Oak' AND organization_id IS NULL LIMIT 1), 
     2, 'per_unit', true, 21);
  END IF;

  -- =====================================================================
  -- 4. DECK REPAIRS - COMPREHENSIVE
  -- =====================================================================
  
  -- Get Deck Building service
  SELECT id INTO v_service_id
  FROM services 
  WHERE name = 'Deck Building'
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
      'Deck Board Replacement & Repair',
      'Replace damaged deck boards, reinforce structure, sand and seal. Extends deck life by 5-10 years.',
      32.50,
      'sqft',
      'premium',
      0.25,
      24,
      'intermediate',
      false,
      false,
      true,
      50,
      500,
      NULL,
      v_system_user_id,
      true,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_option_id;

    -- Add line items
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- LABOR
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.15, 'per_unit', false, 1),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
     0.1, 'per_unit', false, 2),
    
    -- DECK BOARDS (includes waste)
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Pressure Treated Decking' AND organization_id IS NULL LIMIT 1), 
     1.15, 'multiply', false, 3),
    
    -- STRUCTURAL SUPPORT
    (v_option_id, (SELECT id FROM line_items WHERE name = '2x6 Framing Lumber' AND organization_id IS NULL LIMIT 1), 
     0.1, 'per_unit', false, 4),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Joist Hangers' AND organization_id IS NULL LIMIT 1), 
     0.05, 'per_unit', false, 5),
    
    -- FASTENERS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Deck Screws - 3"' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', false, 6),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Galvanized Nails' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 7),
    
    -- FINISHING
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Deck Stain/Sealer' AND organization_id IS NULL LIMIT 1), 
     0.0033, 'per_unit', false, 8),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Brightener' AND organization_id IS NULL LIMIT 1), 
     0.002, 'per_unit', false, 9),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper - Coarse' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', false, 10),
    
    -- TOOLS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Saw Blades' AND organization_id IS NULL LIMIT 1), 
     0.002, 'per_unit', false, 11),
    
    -- APPLICATION
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Stain Brushes' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 12),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Paint Tray' AND organization_id IS NULL LIMIT 1), 
     0.005, 'per_unit', false, 13),
    
    -- PROTECTION
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Plastic Sheeting' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 14),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Painters Tape' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 15),
    
    -- CLEANUP
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
     0.002, 'per_unit', false, 16),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Shop Vacuum Rental' AND organization_id IS NULL LIMIT 1), 
     0.005, 'per_unit', false, 17),
    
    -- SAFETY
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Safety Glasses' AND organization_id IS NULL LIMIT 1), 
     0.01, 'per_unit', false, 18),
    
    -- OPTIONAL UPGRADES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Composite Decking' AND organization_id IS NULL LIMIT 1), 
     1.15, 'multiply', true, 19),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Hidden Deck Fasteners' AND organization_id IS NULL LIMIT 1), 
     0.02, 'per_unit', true, 20);
  END IF;

  -- =====================================================================
  -- 5. KITCHEN CABINET INSTALLATION - COMPLETE
  -- =====================================================================
  
  -- Get Cabinet Installation service
  SELECT id INTO v_service_id
  FROM services 
  WHERE name = 'Cabinet Installation'
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
      'Kitchen Cabinet Install - Full Set',
      'Complete kitchen cabinet installation including wall and base cabinets, leveling, securing, door/drawer adjustments, and crown molding.',
      285.00,
      'cabinet',
      'standard',
      3,
      36,
      'expert',
      false,
      true,  -- Often requires inspection
      true,
      5,
      50,
      NULL,
      v_system_user_id,
      true,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO v_option_id;

    -- Add line items
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- EXPERT LABOR
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cabinet Installer' AND organization_id IS NULL LIMIT 1), 
     2.5, 'fixed', false, 1),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Helper/Laborer' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed', false, 2),
    
    -- MOUNTING HARDWARE
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cabinet Mounting Rails' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', false, 3),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wall Anchors - Heavy Duty' AND organization_id IS NULL LIMIT 1), 
     4, 'fixed', false, 4),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cabinet Connectors' AND organization_id IS NULL LIMIT 1), 
     2, 'fixed', false, 5),
    
    -- FASTENERS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cabinet Screws' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed', false, 6),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Screws - Cabinet' AND organization_id IS NULL LIMIT 1), 
     0.25, 'fixed', false, 7),
    
    -- ADJUSTMENTS & SHIMS
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Shims' AND organization_id IS NULL LIMIT 1), 
     2, 'fixed', false, 8),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cabinet Levelers' AND organization_id IS NULL LIMIT 1), 
     4, 'fixed', false, 9),
    
    -- FINISHING TOUCHES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Filler Strips' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed', false, 10),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Scribe Molding' AND organization_id IS NULL LIMIT 1), 
     2, 'fixed', false, 11),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Touch-up Kit' AND organization_id IS NULL LIMIT 1), 
     0.1, 'fixed', false, 12),
    
    -- PROTECTION
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Cabinet Protection Film' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed', false, 13),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
     1, 'fixed', false, 14),
    
    -- TOOLS & BLADES
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Hole Saw Set' AND organization_id IS NULL LIMIT 1), 
     0.05, 'fixed', false, 15),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Drill Bit Set' AND organization_id IS NULL LIMIT 1), 
     0.05, 'fixed', false, 16),
    
    -- CLEANUP
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Shop Vacuum Rental' AND organization_id IS NULL LIMIT 1), 
     0.1, 'fixed', false, 17),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
     0.5, 'fixed', false, 18),
    
    -- OPTIONAL
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Soft Close Hinges' AND organization_id IS NULL LIMIT 1), 
     2, 'multiply', true, 19),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Under Cabinet Lighting' AND organization_id IS NULL LIMIT 1), 
     1, 'multiply', true, 20),
    
    (v_option_id, (SELECT id FROM line_items WHERE name = 'Crown Molding - Premium' AND organization_id IS NULL LIMIT 1), 
     2, 'fixed', true, 21);
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
AND s.industry_id = (SELECT id FROM industries WHERE name = 'Carpentry')
AND so.created_at > CURRENT_DATE - INTERVAL '1 hour'
GROUP BY so.id, so.name, s.name, so.unit, so.price, so.material_quality, 
         so.estimated_hours, so.warranty_months, so.permit_required, so.requires_inspection
ORDER BY s.name, so.name;