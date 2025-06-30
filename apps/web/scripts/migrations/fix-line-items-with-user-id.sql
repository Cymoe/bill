-- Fix miscategorized line items and add missing essential items
-- This ensures service options can properly reference materials

-- System user ID for all system-level line items
DO $$
DECLARE
    system_user_id UUID := '21471c0c-2492-4fdb-af77-ac0f2fd78ed5';
BEGIN

-- =====================================================
-- PHASE 1: ADD CROWN MOLDING MATERIALS
-- =====================================================

-- Add Crown Molding as MATERIALS (not labor)
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 
    'Crown Molding - Standard',
    'Standard 3.5" crown molding material',
    'linear_foot',
    8.50,
    cc.id,
    system_user_id,
    true
FROM cost_codes cc
WHERE cc.code = 'CP500' -- Carpentry Materials
AND NOT EXISTS (
    SELECT 1 FROM line_items 
    WHERE name = 'Crown Molding - Standard' 
    AND user_id = system_user_id
);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 
    'Crown Molding - Premium',
    'Premium 5.25" decorative crown molding',
    'linear_foot',
    15.75,
    cc.id,
    system_user_id,
    true
FROM cost_codes cc
WHERE cc.code = 'CP500'
AND NOT EXISTS (
    SELECT 1 FROM line_items 
    WHERE name = 'Crown Molding - Premium' 
    AND user_id = system_user_id
);

-- Add Corner Blocks for crown molding
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 
    'Corner Blocks',
    'Decorative corner blocks for crown molding',
    'each',
    22.50,
    cc.id,
    system_user_id,
    true
FROM cost_codes cc
WHERE cc.code = 'CP500'
AND NOT EXISTS (
    SELECT 1 FROM line_items 
    WHERE name = 'Corner Blocks' 
    AND user_id = system_user_id
);

-- =====================================================
-- PHASE 2: ADD MISSING PAINTING CONSUMABLES
-- =====================================================

-- Paint Brushes
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Paintbrush - 1"', 'Angled sash brush', 'each', 12.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 1"' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Paintbrush - 2"', 'Standard wall brush', 'each', 15.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 2"' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Paintbrush - 2.5"', 'Angled trim brush', 'each', 18.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 2.5"' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Paintbrush - 3"', 'Wide wall brush', 'each', 22.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 3"' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Paintbrush - 4"', 'Large area brush', 'each', 28.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 4"' AND user_id = system_user_id);

-- Roller items
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Roller Frame - 9"', 'Standard roller frame', 'each', 8.50,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Roller Frame - 9"' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Roller Cover - 3/8" nap', 'Smooth surface roller', 'each', 6.50,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Roller Cover - 3/8" nap' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Roller Cover - 1/2" nap', 'Semi-smooth surface roller', 'each', 7.50,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Roller Cover - 1/2" nap' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Roller Cover - 3/4" nap', 'Textured surface roller', 'each', 8.50,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Roller Cover - 3/4" nap' AND user_id = system_user_id);

-- Note: Mini Roller items already exist
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Paint Tray', 'Standard paint tray', 'each', 4.50,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paint Tray' AND user_id = system_user_id);

-- Already have "Roller Cover" generic, so adding Paint Tray Liner
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Paint Tray Liner', 'Disposable tray liner', 'pack', 8.50,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paint Tray Liner' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Paint Grid', 'Roller grid for 5-gallon bucket', 'each', 12.00,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paint Grid' AND user_id = system_user_id);

-- Cleaning supplies
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Tack Cloth', 'Sticky cloth for dust removal', 'each', 2.50,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Tack Cloth' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Paint Thinner', 'Mineral spirits for cleanup', 'gallon', 18.00,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paint Thinner' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Rags', 'Cotton cleaning rags', 'pack', 12.00,
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Rags' AND user_id = system_user_id);

-- Note: Plastic Sheeting already exists for painting

-- =====================================================
-- PHASE 3: ADD MISSING CARPENTRY MATERIALS
-- =====================================================

-- Molding profiles
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Base Molding - Standard', '3.25" base molding', 'linear_foot', 3.50,
  (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Base Molding - Standard' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Base Molding - Premium', '5.25" decorative base', 'linear_foot', 6.75,
  (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Base Molding - Premium' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Casing - Standard', '2.25" door/window casing', 'linear_foot', 2.85,
  (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Casing - Standard' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Casing - Premium', '3.5" decorative casing', 'linear_foot', 5.25,
  (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Casing - Premium' AND user_id = system_user_id);

-- Note: Chair Rail already exists
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Picture Rail', 'Picture hanging rail', 'linear_foot', 3.75,
  (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Picture Rail' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Shoe Molding', 'Quarter round alternative', 'linear_foot', 1.85,
  (SELECT id FROM cost_codes WHERE code = 'CP500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Shoe Molding' AND user_id = system_user_id);

-- =====================================================
-- PHASE 4: ADD MISSING FLOORING ITEMS
-- =====================================================

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Wood Floor Adhesive', 'Urethane adhesive for hardwood', 'gallon', 45.00,
  (SELECT id FROM cost_codes WHERE code = 'FL500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Wood Floor Adhesive' AND user_id = system_user_id);

-- Note: Transition Strips already exist, adding specific types
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Transition Strip - Wood', 'Wood to tile transition', 'each', 28.00,
  (SELECT id FROM cost_codes WHERE code = 'FL500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Transition Strip - Wood' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Transition Strip - Metal', 'Aluminum transition strip', 'each', 18.00,
  (SELECT id FROM cost_codes WHERE code = 'FL500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Transition Strip - Metal' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Reducer Strip', 'Height transition strip', 'each', 32.00,
  (SELECT id FROM cost_codes WHERE code = 'FL500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Reducer Strip' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'T-Molding', 'Same height transition', 'each', 25.00,
  (SELECT id FROM cost_codes WHERE code = 'FL500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'T-Molding' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Stair Nose', 'Stair edge molding', 'each', 45.00,
  (SELECT id FROM cost_codes WHERE code = 'FL500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Stair Nose' AND user_id = system_user_id);

-- Note: Moisture Barrier and Flooring Nails already exist

-- =====================================================
-- PHASE 5: ADD MISSING CONCRETE ITEMS  
-- =====================================================

-- Note: Concrete Sealer already exists, adding other items
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Curing Compound', 'Concrete curing aid', 'gallon', 28.00,
  (SELECT id FROM cost_codes WHERE code = 'CN500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Curing Compound' AND user_id = system_user_id);

-- Note: Bonding Agent already exists for painting
INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Concrete Bonding Agent', 'Concrete bonding adhesive', 'gallon', 45.00,
  (SELECT id FROM cost_codes WHERE code = 'CN500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Concrete Bonding Agent' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Concrete Stain', 'Acid-based stain', 'gallon', 55.00,
  (SELECT id FROM cost_codes WHERE code = 'CN500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Concrete Stain' AND user_id = system_user_id);

INSERT INTO line_items (name, description, unit, price, cost_code_id, user_id, is_active)
SELECT 'Release Agent', 'Stamped concrete release', 'bag', 25.00,
  (SELECT id FROM cost_codes WHERE code = 'CN500' AND organization_id IS NULL), system_user_id, true
WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Release Agent' AND user_id = system_user_id);

END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Count new items added
SELECT 
    i.name as industry,
    cc.category,
    COUNT(*) as new_items
FROM line_items li
JOIN cost_codes cc ON li.cost_code_id = cc.id
JOIN industries i ON cc.industry_id = i.id
WHERE li.user_id = '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'
AND li.created_at >= NOW() - INTERVAL '5 minutes'
GROUP BY i.name, cc.category
ORDER BY i.name, cc.category;