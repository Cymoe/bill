-- Rebuild Service Options From Scratch
-- This migration deletes all incomplete service options and creates new comprehensive ones
-- Every service option will have 15-25+ items covering all aspects of real contractor jobs

-- =====================================================================
-- STEP 1: BACKUP AND CLEANUP
-- =====================================================================

-- Create backup table for existing service options (just in case)
CREATE TABLE IF NOT EXISTS service_options_backup_20250629 AS 
SELECT * FROM service_options WHERE organization_id IS NULL;

CREATE TABLE IF NOT EXISTS service_option_items_backup_20250629 AS 
SELECT * FROM service_option_items 
WHERE service_option_id IN (SELECT id FROM service_options WHERE organization_id IS NULL);

-- Delete all service options with fewer than 15 items (96.9% of them!)
DELETE FROM service_option_items 
WHERE service_option_id IN (
  SELECT so.id
  FROM service_options so
  LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
  WHERE so.organization_id IS NULL
  GROUP BY so.id
  HAVING COUNT(soi.id) < 15
);

DELETE FROM service_options 
WHERE id IN (
  SELECT so.id
  FROM service_options so
  LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
  WHERE so.organization_id IS NULL
  GROUP BY so.id
  HAVING COUNT(soi.id) < 15
);

-- =====================================================================
-- STEP 2: CREATE HELPER FUNCTIONS
-- =====================================================================

-- Function to add a complete service option with all items
CREATE OR REPLACE FUNCTION create_complete_service_option(
  p_service_name TEXT,
  p_option_name TEXT,
  p_unit TEXT,
  p_base_price NUMERIC,
  p_description TEXT DEFAULT NULL,
  p_material_quality TEXT DEFAULT 'standard',
  p_estimated_hours NUMERIC DEFAULT NULL,
  p_warranty_months INTEGER DEFAULT NULL,
  p_skill_level TEXT DEFAULT 'intermediate',
  p_permit_required BOOLEAN DEFAULT FALSE,
  p_requires_inspection BOOLEAN DEFAULT FALSE
) RETURNS UUID AS $$
DECLARE
  v_service_id UUID;
  v_option_id UUID;
  v_system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
BEGIN
  -- Get service ID
  SELECT id INTO v_service_id
  FROM services 
  WHERE name = p_service_name 
  AND organization_id IS NULL
  LIMIT 1;
  
  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'Service % not found', p_service_name;
  END IF;
  
  -- Create service option
  INSERT INTO service_options (
    service_id, name, description, price, unit,
    material_quality, estimated_hours, warranty_months, skill_level,
    permit_required, requires_inspection, is_taxable,
    organization_id, user_id, is_template, is_active,
    created_at, updated_at
  ) VALUES (
    v_service_id, p_option_name, p_description, p_base_price, p_unit,
    p_material_quality, p_estimated_hours, p_warranty_months, p_skill_level,
    p_permit_required, p_requires_inspection, TRUE,
    NULL, v_system_user_id, TRUE, TRUE,
    NOW(), NOW()
  ) RETURNING id INTO v_option_id;
  
  RETURN v_option_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- STEP 3: CREATE COMPREHENSIVE PAINTING SERVICE OPTIONS
-- =====================================================================

DO $$
DECLARE
  v_option_id UUID;
  v_system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
BEGIN
  -- Interior Wall Painting - Professional Grade
  v_option_id := create_complete_service_option(
    'Interior Painting',
    'Professional Interior Wall Painting - 2 Coats',
    'sqft',
    3.50,
    'Complete wall painting service including prep, prime, and 2 finish coats',
    'standard',
    0.035, -- estimated hours per sqft
    12,    -- warranty months
    'intermediate'
  );
  
  -- Add all line items for comprehensive wall painting
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR (3 types)
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter - Standard' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 1),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter Helper' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 2),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Surface Prep Labor' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 3),
  
  -- PAINT & PRIMER
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Primer - Interior' AND organization_id IS NULL LIMIT 1), 
   0.0029, 'per_unit'::calculation_type_enum, false, 4),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Interior Paint - Standard' AND organization_id IS NULL LIMIT 1), 
   0.0057, 'per_unit'::calculation_type_enum, false, 5),
  
  -- PREP MATERIALS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Spackling Compound' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 6),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 7),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Caulk' AND organization_id IS NULL LIMIT 1), 
   0.0005, 'per_unit'::calculation_type_enum, false, 8),
  
  -- PROTECTION
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painters Tape' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 9),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 10),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Plastic Sheeting' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 11),
  
  -- APPLICATION TOOLS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Roller Cover - 3/8" nap' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 12),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paintbrush - 2.5"' AND organization_id IS NULL LIMIT 1), 
   0.0005, 'per_unit'::calculation_type_enum, false, 13),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paint Tray' AND organization_id IS NULL LIMIT 1), 
   0.0002, 'per_unit'::calculation_type_enum, false, 14),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paint Tray Liner' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 15),
  
  -- CLEANUP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Tack Cloth' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 16),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Cotton Rags' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, false, 17),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paint Thinner' AND organization_id IS NULL LIMIT 1), 
   0.0001, 'per_unit'::calculation_type_enum, false, 18),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
   0.0001, 'per_unit'::calculation_type_enum, false, 19),
  
  -- OPTIONAL UPGRADES
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Interior Paint - Premium' AND organization_id IS NULL LIMIT 1), 
   0.0057, 'per_unit'::calculation_type_enum, true, 20),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Interior Paint - Zero VOC' AND organization_id IS NULL LIMIT 1), 
   0.0057, 'per_unit'::calculation_type_enum, true, 21);

  -- Exterior House Painting - Complete
  v_option_id := create_complete_service_option(
    'Exterior Painting',
    'Complete Exterior House Painting',
    'sqft',
    4.50,
    'Full exterior painting including power wash, scrape, prime, and 2 coats',
    'premium',
    0.045,
    24,
    'advanced',
    TRUE,  -- permit required
    TRUE   -- inspection required
  );
  
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter - Premium' AND organization_id IS NULL LIMIT 1), 
   0.025, 'per_unit'::calculation_type_enum, false, 1),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painter - Standard' AND organization_id IS NULL LIMIT 1), 
   0.015, 'per_unit'::calculation_type_enum, false, 2),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Surface Prep Labor' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 3),
  
  -- PREP WORK
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Pressure Washer Rental' AND organization_id IS NULL LIMIT 1), 
   0.0005, 'per_unit'::calculation_type_enum, false, 4),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Scraper Blades' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 5),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Exterior Caulk' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 6),
  
  -- PAINT
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Exterior Primer' AND organization_id IS NULL LIMIT 1), 
   0.0033, 'per_unit'::calculation_type_enum, false, 7),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Exterior Paint - Premium' AND organization_id IS NULL LIMIT 1), 
   0.0067, 'per_unit'::calculation_type_enum, false, 8),
  
  -- PROTECTION
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Masking Film' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 9),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
   0.015, 'per_unit'::calculation_type_enum, false, 10),
  
  -- APPLICATION
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Spray Equipment Rental' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 11),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Roller Cover - 3/4" nap' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, false, 12),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Paintbrush - 4"' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 13),
  
  -- SAFETY
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Extension Ladder Rental' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 14),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Safety Harness' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 15),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Safety Glasses' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 16),
  
  -- PERMITS & CLEANUP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painting Permit' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 17),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Lead Paint Test Kit' AND organization_id IS NULL LIMIT 1), 
   0.0005, 'per_unit'::calculation_type_enum, false, 18),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 19),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Final Cleanup' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 20);

END $$;

-- =====================================================================
-- STEP 4: CREATE COMPREHENSIVE CARPENTRY SERVICE OPTIONS
-- =====================================================================

DO $$
DECLARE
  v_option_id UUID;
  v_system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
BEGIN
  -- Crown Molding Installation - Complete
  v_option_id := create_complete_service_option(
    'Finish Carpentry',
    'Crown Molding Installation - Professional',
    'linear_foot',
    12.50,
    'Complete crown molding installation with all materials and finishing',
    'standard',
    0.3, -- 0.3 hours per linear foot total
    12,
    'advanced'
  );
  
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Carpenter' AND organization_id IS NULL LIMIT 1), 
   0.15, 'per_unit'::calculation_type_enum, false, 1),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Carpenter' AND organization_id IS NULL LIMIT 1), 
   0.1, 'per_unit'::calculation_type_enum, false, 2),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Helper/Laborer' AND organization_id IS NULL LIMIT 1), 
   0.05, 'per_unit'::calculation_type_enum, false, 3),
  
  -- MATERIALS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Crown Molding - Standard' AND organization_id IS NULL LIMIT 1), 
   1.1, 'multiply'::calculation_type_enum, false, 4),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Corner Blocks' AND organization_id IS NULL LIMIT 1), 
   0.1, 'per_unit'::calculation_type_enum, false, 5),
  
  -- FASTENERS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Nails' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 6),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Construction Adhesive' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 7),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Glue' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 8),
  
  -- FINISHING
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Caulk' AND organization_id IS NULL LIMIT 1), 
   0.05, 'per_unit'::calculation_type_enum, false, 9),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Filler' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 10),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1), 
   0.05, 'per_unit'::calculation_type_enum, false, 11),
  
  -- PROTECTION & PREP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 12),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painters Tape' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 13),
  
  -- TOOLS & SAFETY
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Miter Saw Blade' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 14),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Safety Glasses' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 15),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Dust Mask' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 16),
  
  -- CLEANUP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Shop Vacuum Rental' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 17),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 18),
  
  -- OPTIONAL
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Crown Molding - Premium' AND organization_id IS NULL LIMIT 1), 
   1.1, 'multiply'::calculation_type_enum, true, 19),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Touch-up Paint' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, true, 20);

  -- Custom Built-In Shelving
  v_option_id := create_complete_service_option(
    'Custom Woodwork',
    'Custom Built-In Shelving Unit',
    'linear_foot',
    185.00,
    'Custom designed and built shelving with adjustable shelves',
    'premium',
    4.0, -- 4 hours per linear foot
    24,
    'expert'
  );
  
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Master Carpenter' AND organization_id IS NULL LIMIT 1), 
   2.5, 'per_unit'::calculation_type_enum, false, 1),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Finish Carpenter' AND organization_id IS NULL LIMIT 1), 
   1.5, 'per_unit'::calculation_type_enum, false, 2),
  
  -- MATERIALS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Plywood - Cabinet Grade' AND organization_id IS NULL LIMIT 1), 
   0.75, 'per_unit'::calculation_type_enum, false, 3),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Hardwood - Oak' AND organization_id IS NULL LIMIT 1), 
   2.5, 'per_unit'::calculation_type_enum, false, 4),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Shelf Pins' AND organization_id IS NULL LIMIT 1), 
   8, 'per_unit'::calculation_type_enum, false, 5),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Edge Banding' AND organization_id IS NULL LIMIT 1), 
   3, 'per_unit'::calculation_type_enum, false, 6),
  
  -- FASTENERS & ADHESIVES
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Screws - Cabinet' AND organization_id IS NULL LIMIT 1), 
   0.25, 'per_unit'::calculation_type_enum, false, 7),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Glue' AND organization_id IS NULL LIMIT 1), 
   0.1, 'per_unit'::calculation_type_enum, false, 8),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Pocket Screws' AND organization_id IS NULL LIMIT 1), 
   0.5, 'per_unit'::calculation_type_enum, false, 9),
  
  -- FINISHING
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Stain' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 10),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Polyurethane Finish' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 11),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper - Fine' AND organization_id IS NULL LIMIT 1), 
   0.1, 'per_unit'::calculation_type_enum, false, 12),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Steel Wool' AND organization_id IS NULL LIMIT 1), 
   0.05, 'per_unit'::calculation_type_enum, false, 13),
  
  -- HARDWARE
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Soft Close Hinges' AND organization_id IS NULL LIMIT 1), 
   0.5, 'per_unit'::calculation_type_enum, true, 14),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'LED Strip Lighting' AND organization_id IS NULL LIMIT 1), 
   1, 'per_unit'::calculation_type_enum, true, 15),
  
  -- TOOLS & EQUIPMENT
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Router Bits' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 16),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Saw Blades' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 17),
  
  -- CLEANUP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Shop Vacuum Rental' AND organization_id IS NULL LIMIT 1), 
   0.05, 'per_unit'::calculation_type_enum, false, 18),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 19),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Mineral Spirits' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 20);

END $$;

-- =====================================================================
-- STEP 5: CREATE COMPREHENSIVE DRYWALL SERVICE OPTIONS
-- =====================================================================

DO $$
DECLARE
  v_option_id UUID;
  v_system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
BEGIN
  -- Standard Drywall Installation
  v_option_id := create_complete_service_option(
    'Drywall Installation',
    'Standard Drywall Installation - Complete',
    'sqft',
    2.75,
    'Full drywall installation including hang, tape, mud, and texture',
    'standard',
    0.065,
    12,
    'intermediate'
  );
  
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drywall Hanger' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 1),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drywall Finisher' AND organization_id IS NULL LIMIT 1), 
   0.025, 'per_unit'::calculation_type_enum, false, 2),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Helper/Laborer' AND organization_id IS NULL LIMIT 1), 
   0.015, 'per_unit'::calculation_type_enum, false, 3),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Texture Specialist' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 4),
  
  -- MATERIALS
  (v_option_id, (SELECT id FROM line_items WHERE name = '1/2" Drywall 4x8' AND organization_id IS NULL LIMIT 1), 
   0.034, 'per_unit'::calculation_type_enum, false, 5),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Joint Compound' AND organization_id IS NULL LIMIT 1), 
   0.0037, 'per_unit'::calculation_type_enum, false, 6),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Mesh Tape' AND organization_id IS NULL LIMIT 1), 
   0.125, 'per_unit'::calculation_type_enum, false, 7),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Corner Bead' AND organization_id IS NULL LIMIT 1), 
   0.025, 'per_unit'::calculation_type_enum, false, 8),
  
  -- FASTENERS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drywall Screws 1-1/4"' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 9),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Adhesive' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 10),
  
  -- FINISHING
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Texture Material' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, false, 11),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Primer - Drywall' AND organization_id IS NULL LIMIT 1), 
   0.0025, 'per_unit'::calculation_type_enum, false, 12),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 13),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sanding Sponges' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 14),
  
  -- PROTECTION
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloths' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 15),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Plastic Sheeting' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 16),
  
  -- EQUIPMENT
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drywall Lift Rental' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 17),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Texture Sprayer Rental' AND organization_id IS NULL LIMIT 1), 
   0.0005, 'per_unit'::calculation_type_enum, false, 18),
  
  -- CLEANUP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Shop Vacuum Rental' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 19),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
   0.0001, 'per_unit'::calculation_type_enum, false, 20),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Cleanup Service' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 21),
  
  -- OPTIONAL
  (v_option_id, (SELECT id FROM line_items WHERE name = '5/8" Drywall 4x8' AND organization_id IS NULL LIMIT 1), 
   0.034, 'per_unit'::calculation_type_enum, true, 22),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Moisture Resistant Drywall' AND organization_id IS NULL LIMIT 1), 
   0.034, 'per_unit'::calculation_type_enum, true, 23);

END $$;

-- =====================================================================
-- STEP 6: CREATE COMPREHENSIVE FLOORING SERVICE OPTIONS
-- =====================================================================

DO $$
DECLARE
  v_option_id UUID;
  v_system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
BEGIN
  -- Hardwood Floor Installation
  v_option_id := create_complete_service_option(
    'Floor Installation',
    'Hardwood Floor Installation - Professional',
    'sqft',
    8.50,
    'Complete hardwood floor installation including subfloor prep',
    'premium',
    0.12,
    60,
    'advanced'
  );
  
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Flooring Installer - Lead' AND organization_id IS NULL LIMIT 1), 
   0.08, 'per_unit'::calculation_type_enum, false, 1),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Flooring Installer - Helper' AND organization_id IS NULL LIMIT 1), 
   0.04, 'per_unit'::calculation_type_enum, false, 2),
  
  -- MATERIALS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Hardwood Flooring - Oak' AND organization_id IS NULL LIMIT 1), 
   1.1, 'multiply'::calculation_type_enum, false, 3),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Underlayment - Premium' AND organization_id IS NULL LIMIT 1), 
   1.05, 'multiply'::calculation_type_enum, false, 4),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Moisture Barrier' AND organization_id IS NULL LIMIT 1), 
   1.05, 'multiply'::calculation_type_enum, false, 5),
  
  -- FASTENERS & ADHESIVES
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Flooring Nails' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 6),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Flooring Adhesive' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 7),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Wood Glue' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 8),
  
  -- TRANSITIONS & TRIM
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Transition Strips' AND organization_id IS NULL LIMIT 1), 
   0.05, 'per_unit'::calculation_type_enum, false, 9),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Quarter Round' AND organization_id IS NULL LIMIT 1), 
   0.15, 'per_unit'::calculation_type_enum, false, 10),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Shoe Molding' AND organization_id IS NULL LIMIT 1), 
   0.15, 'per_unit'::calculation_type_enum, false, 11),
  
  -- PREP MATERIALS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Floor Leveling Compound' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 12),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sandpaper' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 13),
  
  -- PROTECTION
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Floor Protection Paper' AND organization_id IS NULL LIMIT 1), 
   1.05, 'multiply'::calculation_type_enum, false, 14),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Painters Tape' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 15),
  
  -- EQUIPMENT
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Floor Nailer Rental' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 16),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Miter Saw Rental' AND organization_id IS NULL LIMIT 1), 
   0.005, 'per_unit'::calculation_type_enum, false, 17),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Knee Pads' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 18),
  
  -- CLEANUP
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Shop Vacuum Rental' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 19),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 20),
  
  -- OPTIONAL FINISHES
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Hardwood Floor Stain' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, true, 21),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Polyurethane Finish' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, true, 22);

END $$;

-- =====================================================================
-- STEP 7: CREATE COMPREHENSIVE PLUMBING SERVICE OPTIONS
-- =====================================================================

DO $$
DECLARE
  v_option_id UUID;
  v_system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
BEGIN
  -- Bathroom Sink Installation
  v_option_id := create_complete_service_option(
    'Plumbing Installation',
    'Complete Bathroom Sink Installation',
    'fixture',
    450.00,
    'Full sink installation including faucet, drain, and connections',
    'standard',
    3.5,
    24,
    'intermediate',
    TRUE,  -- permit required
    TRUE   -- inspection required
  );
  
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Journeyman Plumber' AND organization_id IS NULL LIMIT 1), 
   2.5, 'fixed'::calculation_type_enum, false, 1),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Apprentice Plumber' AND organization_id IS NULL LIMIT 1), 
   1.0, 'fixed'::calculation_type_enum, false, 2),
  
  -- PRIMARY FIXTURES
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Bathroom Sink - Standard' AND organization_id IS NULL LIMIT 1), 
   1, 'multiply'::calculation_type_enum, false, 3),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Bathroom Faucet' AND organization_id IS NULL LIMIT 1), 
   1, 'multiply'::calculation_type_enum, false, 4),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Pop-up Drain Assembly' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 5),
  
  -- PLUMBING COMPONENTS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'P-Trap 1-1/2"' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 6),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Supply Line - Braided' AND organization_id IS NULL LIMIT 1), 
   2, 'fixed'::calculation_type_enum, false, 7),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Shut-off Valve' AND organization_id IS NULL LIMIT 1), 
   2, 'fixed'::calculation_type_enum, false, 8),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drain Extension' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 9),
  
  -- SEALING & MOUNTING
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Plumbers Putty' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 10),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Teflon Tape' AND organization_id IS NULL LIMIT 1), 
   2, 'fixed'::calculation_type_enum, false, 11),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Silicone Sealant' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 12),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Mounting Hardware' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 13),
  
  -- TOOLS & EQUIPMENT
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Pipe Wrench Rental' AND organization_id IS NULL LIMIT 1), 
   0.5, 'fixed'::calculation_type_enum, false, 14),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Basin Wrench Rental' AND organization_id IS NULL LIMIT 1), 
   0.5, 'fixed'::calculation_type_enum, false, 15),
  
  -- TESTING & SAFETY
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Leak Detection Dye' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 16),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Drop Cloth' AND organization_id IS NULL LIMIT 1), 
   2, 'fixed'::calculation_type_enum, false, 17),
  
  -- PERMITS & DISPOSAL
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Plumbing Permit' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 18),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Old Fixture Removal' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 19),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Debris Removal' AND organization_id IS NULL LIMIT 1), 
   1, 'fixed'::calculation_type_enum, false, 20),
  
  -- OPTIONAL UPGRADES
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Bathroom Sink - Designer' AND organization_id IS NULL LIMIT 1), 
   1, 'multiply'::calculation_type_enum, true, 21),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Bathroom Faucet - Premium' AND organization_id IS NULL LIMIT 1), 
   1, 'multiply'::calculation_type_enum, true, 22);

END $$;

-- =====================================================================
-- STEP 8: CREATE COMPREHENSIVE CONCRETE SERVICE OPTIONS
-- =====================================================================

DO $$
DECLARE
  v_option_id UUID;
  v_system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::UUID;
BEGIN
  -- Concrete Driveway Pour
  v_option_id := create_complete_service_option(
    'Concrete Flatwork',
    'Concrete Driveway - Complete Installation',
    'sqft',
    7.50,
    'Full driveway installation with excavation, base prep, and finishing',
    'standard',
    0.15,
    60,
    'advanced',
    TRUE,
    TRUE
  );
  
  INSERT INTO service_option_items (service_option_id, line_item_id, quantity, calculation_type, is_optional, display_order)
  VALUES
  -- LABOR
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Concrete Finisher - Lead' AND organization_id IS NULL LIMIT 1), 
   0.08, 'per_unit'::calculation_type_enum, false, 1),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Concrete Worker' AND organization_id IS NULL LIMIT 1), 
   0.06, 'per_unit'::calculation_type_enum, false, 2),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Equipment Operator' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 3),
  
  -- CONCRETE & BASE
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Concrete - 3500 PSI' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, false, 4),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Gravel Base' AND organization_id IS NULL LIMIT 1), 
   0.03, 'per_unit'::calculation_type_enum, false, 5),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Sand Bedding' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 6),
  
  -- REINFORCEMENT
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Rebar #4' AND organization_id IS NULL LIMIT 1), 
   0.5, 'per_unit'::calculation_type_enum, false, 7),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Wire Mesh' AND organization_id IS NULL LIMIT 1), 
   1.05, 'multiply'::calculation_type_enum, false, 8),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Rebar Chairs' AND organization_id IS NULL LIMIT 1), 
   0.25, 'per_unit'::calculation_type_enum, false, 9),
  
  -- FORMING
  (v_option_id, (SELECT id FROM line_items WHERE name = '2x4 Form Lumber' AND organization_id IS NULL LIMIT 1), 
   0.15, 'per_unit'::calculation_type_enum, false, 10),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Form Stakes' AND organization_id IS NULL LIMIT 1), 
   0.15, 'per_unit'::calculation_type_enum, false, 11),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Form Oil' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 12),
  
  -- FINISHING
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Concrete Sealer' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, false, 13),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Curing Compound' AND organization_id IS NULL LIMIT 1), 
   0.003, 'per_unit'::calculation_type_enum, false, 14),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Expansion Joint' AND organization_id IS NULL LIMIT 1), 
   0.05, 'per_unit'::calculation_type_enum, false, 15),
  
  -- EQUIPMENT
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Concrete Pump Rental' AND organization_id IS NULL LIMIT 1), 
   0.002, 'per_unit'::calculation_type_enum, false, 16),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Power Trowel Rental' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 17),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Vibrator Rental' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 18),
  
  -- CLEANUP & PERMITS
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Excavation & Disposal' AND organization_id IS NULL LIMIT 1), 
   0.01, 'per_unit'::calculation_type_enum, false, 19),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Concrete Permit' AND organization_id IS NULL LIMIT 1), 
   0.001, 'per_unit'::calculation_type_enum, false, 20),
  
  -- OPTIONAL
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Colored Concrete' AND organization_id IS NULL LIMIT 1), 
   0.02, 'per_unit'::calculation_type_enum, true, 21),
  (v_option_id, (SELECT id FROM line_items WHERE name = 'Stamped Pattern' AND organization_id IS NULL LIMIT 1), 
   1, 'multiply'::calculation_type_enum, true, 22);

END $$;

-- =====================================================================
-- STEP 9: VERIFY OUR WORK
-- =====================================================================

-- Check the completeness of our new service options
WITH service_option_summary AS (
  SELECT 
    i.name as industry,
    s.name as service,
    so.name as option_name,
    COUNT(soi.id) as item_count,
    COUNT(CASE WHEN soi.is_optional = false THEN 1 END) as required_items,
    COUNT(CASE WHEN soi.is_optional = true THEN 1 END) as optional_items
  FROM service_options so
  JOIN services s ON so.service_id = s.id
  JOIN industries i ON s.industry_id = i.id
  LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
  WHERE so.organization_id IS NULL
  GROUP BY i.name, s.name, so.name
  ORDER BY item_count DESC
)
SELECT * FROM service_option_summary;

-- Summary of completeness
SELECT 
  CASE 
    WHEN item_count < 15 THEN 'INCOMPLETE (<15 items)'
    WHEN item_count < 20 THEN 'GOOD (15-19 items)'
    ELSE 'EXCELLENT (20+ items)'
  END as status,
  COUNT(*) as count
FROM (
  SELECT so.id, COUNT(soi.id) as item_count
  FROM service_options so
  LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
  WHERE so.organization_id IS NULL
  GROUP BY so.id
) summary
GROUP BY status
ORDER BY status;