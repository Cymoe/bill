-- Make Service Options Complete: Real-World Job Requirements
-- This migration ensures every service option includes ALL components needed for actual jobs
-- Not just the main work, but prep, cleanup, disposal, safety, and consumables

-- First, let's analyze what line items we have available
WITH available_items AS (
  SELECT 
    i.name as industry_name,
    cc.category,
    COUNT(li.id) as item_count,
    STRING_AGG(li.name || ' (' || li.unit || ')', ', ' ORDER BY li.name) as items
  FROM line_items li
  JOIN cost_codes cc ON li.cost_code_id = cc.id
  JOIN industries i ON cc.industry_id = i.id
  WHERE li.organization_id IS NULL
  GROUP BY i.name, cc.category
)
SELECT * FROM available_items ORDER BY industry_name, category;

-- Function to get system user ID
CREATE OR REPLACE FUNCTION get_system_user_id() RETURNS UUID AS $$
BEGIN
  RETURN '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMPREHENSIVE SERVICE OPTION TEMPLATES
-- =============================================================================

-- Let's create a complete "Crown Molding Install" that contractors will respect
-- Current version has only 7 items - let's make it 20+ items

DO $$
DECLARE
  v_service_option_id UUID;
  v_system_user_id UUID := get_system_user_id();
BEGIN
  -- Get the Crown Molding Install service option
  SELECT id INTO v_service_option_id
  FROM service_options
  WHERE name = 'Crown Molding Install'
  AND organization_id IS NULL
  LIMIT 1;

  IF v_service_option_id IS NOT NULL THEN
    -- First, clear existing items to rebuild properly
    DELETE FROM service_option_items WHERE service_option_id = v_service_option_id;

    -- Now add ALL components needed for a real crown molding job
    
    -- LABOR (Multiple types)
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    SELECT 
      v_service_option_id,
      li.id,
      CASE 
        WHEN li.name = 'Finish Carpenter' THEN 0.15  -- Lead installer
        WHEN li.name = 'Apprentice Carpenter' THEN 0.1  -- Helper
        WHEN li.name = 'Helper/Laborer' THEN 0.05  -- Cleanup
      END,
      'per_unit'::calculation_type_enum,
      false,
      CASE 
        WHEN li.name = 'Finish Carpenter' THEN 1
        WHEN li.name = 'Apprentice Carpenter' THEN 2
        WHEN li.name = 'Helper/Laborer' THEN 3
      END
    FROM line_items li
    JOIN cost_codes cc ON li.cost_code_id = cc.id
    WHERE li.name IN ('Finish Carpenter', 'Apprentice Carpenter', 'Helper/Laborer')
    AND li.organization_id IS NULL;

    -- PRIMARY MATERIALS
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    SELECT 
      v_service_option_id,
      li.id,
      CASE 
        WHEN li.name LIKE '%Crown Molding%' THEN 1.1  -- 10% waste factor
        ELSE 1
      END,
      'multiply'::calculation_type_enum,
      false,
      4
    FROM line_items li
    JOIN cost_codes cc ON li.cost_code_id = cc.id
    WHERE li.name LIKE '%Crown Molding - Standard%'
    AND li.organization_id IS NULL
    LIMIT 1;

    -- FASTENERS & ADHESIVES
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    SELECT 
      v_service_option_id,
      li.id,
      CASE 
        WHEN li.unit = 'box' THEN 0.002  -- Finish nails per linear foot
        WHEN li.unit = 'tube' THEN 0.05   -- Caulk/adhesive per linear foot
        WHEN li.unit = 'quart' THEN 0.01  -- Wood glue per linear foot
      END,
      'per_unit'::calculation_type_enum,
      false,
      ROW_NUMBER() OVER (ORDER BY li.name) + 4
    FROM line_items li
    JOIN cost_codes cc ON li.cost_code_id = cc.id
    WHERE li.name IN ('Finish Nails', 'Construction Adhesive', 'Caulk', 'Wood Glue')
    AND li.organization_id IS NULL;

    -- PREP & FINISHING MATERIALS
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    SELECT 
      v_service_option_id,
      li.id,
      CASE 
        WHEN li.name = 'Sandpaper' THEN 0.1
        WHEN li.name = 'Wood Filler' THEN 0.05
        WHEN li.name = 'Painters Tape' THEN 0.02
        WHEN li.name = 'Drop Cloth' THEN 0.01
      END,
      'per_unit'::calculation_type_enum,
      false,
      ROW_NUMBER() OVER (ORDER BY li.name) + 10
    FROM line_items li
    WHERE li.name IN ('Sandpaper', 'Wood Filler', 'Painters Tape', 'Drop Cloth')
    AND li.organization_id IS NULL;

    -- TOOLS & EQUIPMENT
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Miter saw blade (replaced periodically)
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Miter Saw Blade' AND organization_id IS NULL LIMIT 1),
     0.001, 'per_unit'::calculation_type_enum, false, 15),
    
    -- Safety equipment
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Safety Glasses' AND organization_id IS NULL LIMIT 1),
     0.01, 'per_unit'::calculation_type_enum, false, 16),
    
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Dust Mask' AND organization_id IS NULL LIMIT 1),
     0.02, 'per_unit'::calculation_type_enum, false, 17);

    -- CLEANUP & DISPOSAL
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    SELECT 
      v_service_option_id,
      li.id,
      CASE 
        WHEN li.name = 'Debris Removal' THEN 0.001  -- Per linear foot
        WHEN li.name = 'Shop Vacuum Rental' THEN 0.01  -- Daily rate spread
      END,
      'per_unit'::calculation_type_enum,
      false,
      ROW_NUMBER() OVER (ORDER BY li.name) + 17
    FROM line_items li
    WHERE li.name IN ('Debris Removal', 'Shop Vacuum Rental')
    AND li.organization_id IS NULL;

    -- MISCELLANEOUS SUPPLIES
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Measuring and marking
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Pencils' AND organization_id IS NULL LIMIT 1),
     0.02, 'per_unit'::calculation_type_enum, false, 20),
    
    -- Touch-up supplies
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Touch-up Paint' AND organization_id IS NULL LIMIT 1),
     0.01, 'per_unit'::calculation_type_enum, true, 21),
    
    -- Premium options
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Crown Molding - Premium' AND organization_id IS NULL LIMIT 1),
     1.1, 'multiply'::calculation_type_enum, true, 22);

  END IF;
END $$;

-- =============================================================================
-- COMPLETE INTERIOR PAINTING SERVICE OPTION
-- =============================================================================

DO $$
DECLARE
  v_service_option_id UUID;
  v_system_user_id UUID := get_system_user_id();
BEGIN
  -- Get the Paint Walls - 2 Coats service option
  SELECT id INTO v_service_option_id
  FROM service_options
  WHERE name = 'Paint Walls - 2 Coats'
  AND organization_id IS NULL
  LIMIT 1;

  IF v_service_option_id IS NOT NULL THEN
    -- Clear and rebuild
    DELETE FROM service_option_items WHERE service_option_id = v_service_option_id;

    -- LABOR COMPONENTS
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Lead painter
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Painter - Standard' AND organization_id IS NULL LIMIT 1),
     0.025, 'per_unit'::calculation_type_enum, false, 1),
    
    -- Helper for large jobs
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Painter Helper' AND organization_id IS NULL LIMIT 1),
     0.015, 'per_unit'::calculation_type_enum, false, 2),
    
    -- Prep work labor
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Surface Prep Labor' AND organization_id IS NULL LIMIT 1),
     0.01, 'per_unit'::calculation_type_enum, false, 3);

    -- PAINT & PRIMER
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Primer (350 sqft/gallon coverage)
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Primer - Interior' AND organization_id IS NULL LIMIT 1),
     0.0029, 'per_unit'::calculation_type_enum, false, 4),
    
    -- Paint - 2 coats (350 sqft/gallon per coat)
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Interior Paint - Standard' AND organization_id IS NULL LIMIT 1),
     0.0057, 'per_unit'::calculation_type_enum, false, 5);

    -- PREP MATERIALS
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Spackling compound
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Spackling Compound' AND organization_id IS NULL LIMIT 1),
     0.001, 'per_unit'::calculation_type_enum, false, 6),
    
    -- Sandpaper
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1),
     0.002, 'per_unit'::calculation_type_enum, false, 7),
    
    -- Painters tape
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Painters Tape' AND organization_id IS NULL LIMIT 1),
     0.02, 'per_unit'::calculation_type_enum, false, 8);

    -- PROTECTION MATERIALS
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Drop cloths
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1),
     0.01, 'per_unit'::calculation_type_enum, false, 9),
    
    -- Plastic sheeting
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Plastic Sheeting' AND organization_id IS NULL LIMIT 1),
     0.005, 'per_unit'::calculation_type_enum, false, 10);

    -- PAINTING TOOLS & SUPPLIES
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Roller covers (replace every 500 sqft)
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Roller Cover - 3/8" nap' AND organization_id IS NULL LIMIT 1),
     0.002, 'per_unit'::calculation_type_enum, false, 11),
    
    -- Paint brushes (replace periodically)
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Paintbrush - 2.5"' AND organization_id IS NULL LIMIT 1),
     0.001, 'per_unit'::calculation_type_enum, false, 12),
    
    -- Paint tray liners
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Paint Tray Liner' AND organization_id IS NULL LIMIT 1),
     0.002, 'per_unit'::calculation_type_enum, false, 13);

    -- CLEANUP SUPPLIES
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Tack cloths
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Tack Cloth' AND organization_id IS NULL LIMIT 1),
     0.002, 'per_unit'::calculation_type_enum, false, 14),
    
    -- Rags
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Cotton Rags' AND organization_id IS NULL LIMIT 1),
     0.003, 'per_unit'::calculation_type_enum, false, 15),
    
    -- Paint thinner/cleaner
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Paint Thinner' AND organization_id IS NULL LIMIT 1),
     0.0001, 'per_unit'::calculation_type_enum, false, 16);

    -- DISPOSAL
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Paint disposal fee
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Hazardous Waste Disposal' AND organization_id IS NULL LIMIT 1),
     0.0001, 'per_unit'::calculation_type_enum, false, 17);

    -- PREMIUM OPTIONS (optional)
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Premium paint upgrade
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Interior Paint - Premium' AND organization_id IS NULL LIMIT 1),
     0.0057, 'per_unit'::calculation_type_enum, true, 18),
    
    -- Zero VOC paint option
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Interior Paint - Zero VOC' AND organization_id IS NULL LIMIT 1),
     0.0057, 'per_unit'::calculation_type_enum, true, 19);

  END IF;
END $$;

-- =============================================================================
-- COMPLETE BATHROOM VANITY INSTALLATION
-- =============================================================================

DO $$
DECLARE
  v_service_option_id UUID;
  v_system_user_id UUID := get_system_user_id();
BEGIN
  -- Get the Bathroom Vanity Cabinet Installation
  SELECT id INTO v_service_option_id
  FROM service_options
  WHERE name = 'Bathroom Vanity Cabinet Installation'
  AND organization_id IS NULL
  LIMIT 1;

  IF v_service_option_id IS NOT NULL THEN
    -- Clear and rebuild
    DELETE FROM service_option_items WHERE service_option_id = v_service_option_id;

    -- LABOR COMPONENTS
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Lead plumber for connections
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Journeyman Plumber' AND organization_id IS NULL LIMIT 1),
     1.5, 'fixed'::calculation_type_enum, false, 1),
    
    -- Cabinet installer
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Cabinet Installer' AND organization_id IS NULL LIMIT 1),
     2, 'fixed'::calculation_type_enum, false, 2),
    
    -- Helper
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Helper/Laborer' AND organization_id IS NULL LIMIT 1),
     1, 'fixed'::calculation_type_enum, false, 3);

    -- PRIMARY COMPONENTS
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Vanity cabinet
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Bathroom Vanity' AND organization_id IS NULL LIMIT 1),
     1, 'multiply'::calculation_type_enum, false, 4),
    
    -- Vanity top
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Vanity Top - Cultured Marble' AND organization_id IS NULL LIMIT 1),
     1, 'multiply'::calculation_type_enum, false, 5),
    
    -- Faucet
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Bathroom Vanity Faucet' AND organization_id IS NULL LIMIT 1),
     1, 'multiply'::calculation_type_enum, false, 6),
    
    -- Sink (if separate)
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Undermount Sink' AND organization_id IS NULL LIMIT 1),
     1, 'multiply'::calculation_type_enum, true, 7);

    -- PLUMBING COMPONENTS
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- P-trap
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'P-Trap 1-1/2"' AND organization_id IS NULL LIMIT 1),
     1, 'fixed'::calculation_type_enum, false, 8),
    
    -- Supply lines
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Supply Line - Braided' AND organization_id IS NULL LIMIT 1),
     2, 'fixed'::calculation_type_enum, false, 9),
    
    -- Shut-off valves
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Shut-off Valve' AND organization_id IS NULL LIMIT 1),
     2, 'fixed'::calculation_type_enum, false, 10);

    -- MOUNTING & SEALING
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Construction adhesive
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Construction Adhesive' AND organization_id IS NULL LIMIT 1),
     1, 'fixed'::calculation_type_enum, false, 11),
    
    -- Silicone sealant
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Silicone Sealant' AND organization_id IS NULL LIMIT 1),
     2, 'fixed'::calculation_type_enum, false, 12),
    
    -- Mounting screws
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Cabinet Screws' AND organization_id IS NULL LIMIT 1),
     1, 'fixed'::calculation_type_enum, false, 13),
    
    -- Wall anchors
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Wall Anchors' AND organization_id IS NULL LIMIT 1),
     4, 'fixed'::calculation_type_enum, false, 14);

    -- PREP & PROTECTION
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Drop cloth
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1),
     1, 'fixed'::calculation_type_enum, false, 15),
    
    -- Plumbers putty
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Plumbers Putty' AND organization_id IS NULL LIMIT 1),
     1, 'fixed'::calculation_type_enum, false, 16),
    
    -- Teflon tape
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Teflon Tape' AND organization_id IS NULL LIMIT 1),
     1, 'fixed'::calculation_type_enum, false, 17);

    -- TOOLS & CONSUMABLES
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Drill bits (wear item)
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Drill Bit Set' AND organization_id IS NULL LIMIT 1),
     0.1, 'fixed'::calculation_type_enum, false, 18),
    
    -- Hole saw for plumbing
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Hole Saw - 2"' AND organization_id IS NULL LIMIT 1),
     0.1, 'fixed'::calculation_type_enum, false, 19);

    -- CLEANUP & DISPOSAL
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Old vanity removal
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Demolition Labor' AND organization_id IS NULL LIMIT 1),
     1, 'fixed'::calculation_type_enum, false, 20),
    
    -- Debris removal
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1),
     1, 'fixed'::calculation_type_enum, false, 21),
    
    -- Final cleanup
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Cleanup Service' AND organization_id IS NULL LIMIT 1),
     0.5, 'fixed'::calculation_type_enum, false, 22);

    -- OPTIONAL UPGRADES
    INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
    VALUES
    -- Granite top upgrade
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Vanity Top - Granite' AND organization_id IS NULL LIMIT 1),
     1, 'multiply'::calculation_type_enum, true, 23),
    
    -- Premium faucet
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Bathroom Faucet - Premium' AND organization_id IS NULL LIMIT 1),
     1, 'multiply'::calculation_type_enum, true, 24),
    
    -- Mirror installation
    ((SELECT v_service_option_id), 
     (SELECT id FROM line_items WHERE name = 'Bathroom Mirror' AND organization_id IS NULL LIMIT 1),
     1, 'multiply'::calculation_type_enum, true, 25);

  END IF;
END $$;

-- =============================================================================
-- Let's check our work
-- =============================================================================

WITH service_option_summary AS (
  SELECT 
    so.name,
    so.unit,
    s.name as service_name,
    COUNT(soi.id) as item_count,
    COUNT(CASE WHEN soi.is_optional = false THEN 1 END) as required_items,
    COUNT(CASE WHEN soi.is_optional = true THEN 1 END) as optional_items,
    COUNT(CASE WHEN li.unit = 'hour' THEN 1 END) as labor_items,
    COUNT(CASE WHEN li.unit != 'hour' THEN 1 END) as material_items
  FROM service_options so
  JOIN services s ON so.service_id = s.id
  LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
  LEFT JOIN line_items li ON soi.line_item_id = li.id
  WHERE so.organization_id IS NULL
  AND so.name IN ('Crown Molding Install', 'Paint Walls - 2 Coats', 'Bathroom Vanity Cabinet Installation')
  GROUP BY so.name, so.unit, s.name
)
SELECT * FROM service_option_summary;

-- Now let's add the missing line items that we referenced but don't exist yet
INSERT INTO line_items (name, unit, price, category, cost_code_id, user_id, organization_id, created_at, updated_at)
VALUES
  -- Safety equipment
  ('Safety Glasses', 'pair', 15.00, 'material', (SELECT id FROM cost_codes WHERE code = 'CP600' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Dust Mask', 'each', 2.50, 'material', (SELECT id FROM cost_codes WHERE code = 'CP600' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  
  -- Tools and blades
  ('Miter Saw Blade', 'each', 65.00, 'material', (SELECT id FROM cost_codes WHERE code = 'CP600' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Drill Bit Set', 'set', 35.00, 'material', (SELECT id FROM cost_codes WHERE code = 'CP600' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Hole Saw - 2"', 'each', 25.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PL500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  
  -- Painting labor
  ('Painter Helper', 'hour', 35.00, 'labor', (SELECT id FROM cost_codes WHERE code = 'PT100' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Surface Prep Labor', 'hour', 45.00, 'labor', (SELECT id FROM cost_codes WHERE code = 'PT100' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  
  -- Painting supplies
  ('Spackling Compound', 'quart', 12.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Plastic Sheeting', 'roll', 25.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Paint Tray Liner', 'pack', 8.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Cotton Rags', 'bag', 15.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Interior Paint - Premium', 'gallon', 65.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Interior Paint - Zero VOC', 'gallon', 75.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  
  -- Cabinet installation
  ('Cabinet Installer', 'hour', 65.00, 'labor', (SELECT id FROM cost_codes WHERE code = 'CP100' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Vanity Top - Cultured Marble', 'each', 250.00, 'material', (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Vanity Top - Granite', 'each', 650.00, 'material', (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Undermount Sink', 'each', 175.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PL500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Cabinet Screws', 'box', 12.00, 'material', (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Wall Anchors', 'pack', 8.00, 'material', (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  
  -- Plumbing supplies
  ('Supply Line - Braided', 'each', 12.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PL500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Shut-off Valve', 'each', 25.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PL500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Plumbers Putty', 'container', 6.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PL500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Teflon Tape', 'roll', 3.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PL500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Silicone Sealant', 'tube', 8.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PL500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Bathroom Faucet - Premium', 'each', 450.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PL500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Bathroom Mirror', 'each', 125.00, 'material', (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  
  -- Demolition and cleanup
  ('Demolition Labor', 'hour', 45.00, 'labor', (SELECT id FROM cost_codes WHERE code = 'GC100' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Hazardous Waste Disposal', 'fee', 50.00, 'service', (SELECT id FROM cost_codes WHERE code = 'GC001' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Shop Vacuum Rental', 'day', 35.00, 'equipment', (SELECT id FROM cost_codes WHERE code = 'GC700' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  
  -- More misc items
  ('Pencils', 'pack', 5.00, 'material', (SELECT id FROM cost_codes WHERE code = 'GC500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Touch-up Paint', 'bottle', 15.00, 'material', (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW()),
  ('Crown Molding - Premium', 'linear_foot', 12.50, 'material', (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), get_system_user_id(), NULL, NOW(), NOW())
ON CONFLICT (name, organization_id) DO NOTHING;

-- Re-run the service option updates now that line items exist
-- (The DO blocks above will now find all the line items)