-- Fix miscategorized line items and add missing essential items
-- This ensures service options can properly reference materials

-- =====================================================
-- PHASE 1: FIX MISCATEGORIZED ITEMS
-- =====================================================

-- First, let's identify items that need material counterparts
-- Crown Molding is currently labor, but we need material versions too

-- Add Crown Molding as MATERIALS (not labor)
INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT 
    'Crown Molding - Standard' as name,
    'Standard 3.5" crown molding material' as description,
    'linear_foot' as unit,
    8.50 as price,
    cc.id as cost_code_id,
    NULL as organization_id,
    true as is_active
FROM cost_codes cc
WHERE cc.code = 'CP500' -- Carpentry Materials
AND NOT EXISTS (
    SELECT 1 FROM line_items 
    WHERE name = 'Crown Molding - Standard' 
    AND organization_id IS NULL
);

INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT 
    'Crown Molding - Premium' as name,
    'Premium 5.25" decorative crown molding' as description,
    'linear_foot' as unit,
    15.75 as price,
    cc.id as cost_code_id,
    NULL as organization_id,
    true as is_active
FROM cost_codes cc
WHERE cc.code = 'CP500'
AND NOT EXISTS (
    SELECT 1 FROM line_items 
    WHERE name = 'Crown Molding - Premium' 
    AND organization_id IS NULL
);

-- Add Corner Blocks for crown molding
INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT 
    'Corner Blocks' as name,
    'Decorative corner blocks for crown molding' as description,
    'each' as unit,
    22.50 as price,
    cc.id as cost_code_id,
    NULL as organization_id,
    true as is_active
FROM cost_codes cc
WHERE cc.code = 'CP500'
AND NOT EXISTS (
    SELECT 1 FROM line_items 
    WHERE name = 'Corner Blocks' 
    AND organization_id IS NULL
);

-- =====================================================
-- PHASE 2: ADD MISSING PAINTING CONSUMABLES
-- =====================================================

-- Paint Brushes (various sizes)
INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
VALUES
-- Get the painting materials cost code
((SELECT 'Paintbrush - 1"', 'Angled sash brush', 'each', 12.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), NULL, true
  WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 1"' AND organization_id IS NULL))),
  
((SELECT 'Paintbrush - 2"', 'Standard wall brush', 'each', 15.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), NULL, true
  WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 2"' AND organization_id IS NULL))),
  
((SELECT 'Paintbrush - 2.5"', 'Angled trim brush', 'each', 18.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), NULL, true
  WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 2.5"' AND organization_id IS NULL))),
  
((SELECT 'Paintbrush - 3"', 'Wide wall brush', 'each', 22.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), NULL, true
  WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 3"' AND organization_id IS NULL))),
  
((SELECT 'Paintbrush - 4"', 'Large area brush', 'each', 28.00, 
  (SELECT id FROM cost_codes WHERE code = 'PT500' AND organization_id IS NULL), NULL, true
  WHERE NOT EXISTS (SELECT 1 FROM line_items WHERE name = 'Paintbrush - 4"' AND organization_id IS NULL)));

-- Roller Frames and Covers
INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT * FROM (VALUES
('Roller Frame - 9"', 'Standard roller frame', 'each', 8.50),
('Roller Cover - 3/8" nap', 'Smooth surface roller', 'each', 6.50),
('Roller Cover - 1/2" nap', 'Semi-smooth surface roller', 'each', 7.50),
('Roller Cover - 3/4" nap', 'Textured surface roller', 'each', 8.50),
('Mini Roller Frame', '4" mini roller frame', 'each', 5.50),
('Mini Roller Cover', '4" roller cover', 'each', 4.50),
('Paint Tray - 9"', 'Standard paint tray', 'each', 4.50),
('Paint Tray Liner', 'Disposable tray liner', 'pack', 8.50),
('Paint Grid', 'Roller grid for 5-gallon bucket', 'each', 12.00)
) AS t(name, description, unit, price)
CROSS JOIN cost_codes cc
WHERE cc.code = 'PT500' 
AND cc.organization_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM line_items li 
    WHERE li.name = t.name 
    AND li.organization_id IS NULL
);

-- Cleaning and Prep Supplies
INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT * FROM (VALUES
('Tack Cloth', 'Sticky cloth for dust removal', 'each', 2.50),
('Paint Thinner', 'Mineral spirits for cleanup', 'gallon', 18.00),
('Rags', 'Cotton cleaning rags', 'pack', 12.00),
('Plastic Sheeting', 'Protective plastic drop cloth', 'roll', 25.00),
('Putty Knife - 1.5"', 'Flexible putty knife', 'each', 8.50),
('Putty Knife - 3"', 'Wide putty knife', 'each', 12.00),
('Sanding Block', 'Hand sanding block', 'each', 6.50),
('Pole Sander', 'Drywall pole sander', 'each', 35.00)
) AS t(name, description, unit, price)
CROSS JOIN cost_codes cc
WHERE cc.code = 'PT500' 
AND cc.organization_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM line_items li 
    WHERE li.name = t.name 
    AND li.organization_id IS NULL
);

-- =====================================================
-- PHASE 3: ADD MISSING CARPENTRY MATERIALS
-- =====================================================

-- More Wood Glue options (we already have quart and bottle)
INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT 
    'Wood Glue - Small' as name,
    '4 oz wood glue bottle' as description,
    'each' as unit,
    4.50 as price,
    cc.id as cost_code_id,
    NULL as organization_id,
    true as is_active
FROM cost_codes cc
WHERE cc.code = 'CP500'
AND NOT EXISTS (
    SELECT 1 FROM line_items 
    WHERE name = 'Wood Glue - Small' 
    AND organization_id IS NULL
);

-- Various molding profiles as materials
INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT * FROM (VALUES
('Base Molding - Standard', '3.25" base molding', 'linear_foot', 3.50),
('Base Molding - Premium', '5.25" decorative base', 'linear_foot', 6.75),
('Casing - Standard', '2.25" door/window casing', 'linear_foot', 2.85),
('Casing - Premium', '3.5" decorative casing', 'linear_foot', 5.25),
('Chair Rail', 'Standard chair rail molding', 'linear_foot', 4.25),
('Picture Rail', 'Picture hanging rail', 'linear_foot', 3.75),
('Shoe Molding', 'Quarter round alternative', 'linear_foot', 1.85)
) AS t(name, description, unit, price)
CROSS JOIN cost_codes cc
WHERE cc.code = 'CP500' 
AND cc.organization_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM line_items li 
    WHERE li.name = t.name 
    AND li.organization_id IS NULL
);

-- More sandpaper varieties
INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT * FROM (VALUES
('Sandpaper - 80 grit', 'Coarse sandpaper sheets', 'pack', 8.50),
('Sandpaper - 120 grit', 'Medium sandpaper sheets', 'pack', 8.50),
('Sandpaper - 220 grit', 'Fine sandpaper sheets', 'pack', 8.50),
('Sandpaper - Assorted', 'Mixed grit pack', 'pack', 12.50),
('Sanding Sponge - Medium', 'Flexible sanding sponge', 'each', 4.50),
('Sanding Sponge - Fine', 'Fine grit sanding sponge', 'each', 4.50)
) AS t(name, description, unit, price)
CROSS JOIN cost_codes cc
WHERE cc.code = 'CP500' 
AND cc.organization_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM line_items li 
    WHERE li.name = t.name 
    AND li.organization_id IS NULL
);

-- =====================================================
-- PHASE 4: ADD MISSING FLOORING ITEMS
-- =====================================================

INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT * FROM (VALUES
('Wood Floor Adhesive', 'Urethane adhesive for hardwood', 'gallon', 45.00),
('Floor Adhesive - Vinyl', 'Pressure sensitive adhesive', 'gallon', 35.00),
('Transition Strip - Wood', 'Wood to tile transition', 'each', 28.00),
('Transition Strip - Metal', 'Aluminum transition strip', 'each', 18.00),
('Reducer Strip', 'Height transition strip', 'each', 32.00),
('T-Molding', 'Same height transition', 'each', 25.00),
('Stair Nose', 'Stair edge molding', 'each', 45.00),
('Floor Finish', 'Polyurethane floor finish', 'gallon', 55.00),
('Floor Cleaner', 'Hardwood floor cleaner', 'gallon', 18.00),
('Moisture Barrier', '6 mil vapor barrier', 'sqft', 0.15),
('Cork Underlayment', 'Sound dampening underlayment', 'sqft', 0.65),
('Flooring Nails', 'Cleats for nailer', 'box', 35.00),
('Floor Patch', 'Self-leveling compound', 'bag', 28.00)
) AS t(name, description, unit, price)
CROSS JOIN cost_codes cc
WHERE cc.code = 'FL500' -- Flooring Materials
AND cc.organization_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM line_items li 
    WHERE li.name = t.name 
    AND li.organization_id IS NULL
);

-- =====================================================
-- PHASE 5: ADD MISSING CONCRETE ITEMS
-- =====================================================

INSERT INTO line_items (name, description, unit, price, cost_code_id, organization_id, is_active)
SELECT * FROM (VALUES
('Concrete Sealer', 'Penetrating sealer', 'gallon', 35.00),
('Curing Compound', 'Concrete curing aid', 'gallon', 28.00),
('Bonding Agent', 'Concrete bonding adhesive', 'gallon', 45.00),
('Concrete Stain', 'Acid-based stain', 'gallon', 55.00),
('Release Agent', 'Stamped concrete release', 'bag', 25.00),
('Plastic Sheeting', 'Curing plastic', 'roll', 45.00),
('Burlap', 'Curing burlap', 'roll', 35.00),
('Joint Sealer', 'Polyurethane sealant', 'gallon', 85.00),
('Backer Rod', 'Joint backing material', 'linear_foot', 0.75)
) AS t(name, description, unit, price)
CROSS JOIN cost_codes cc
WHERE cc.code = 'CN500' -- Concrete Materials  
AND cc.organization_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM line_items li 
    WHERE li.name = t.name 
    AND li.organization_id IS NULL
);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- After running this migration, use this query to verify:

/*
SELECT 
    i.name as industry,
    cc.category,
    COUNT(DISTINCT li.id) as item_count
FROM line_items li
JOIN cost_codes cc ON li.cost_code_id = cc.id
JOIN industries i ON cc.industry_id = i.id
WHERE li.organization_id IS NULL
AND li.created_at >= NOW() - INTERVAL '1 hour'
GROUP BY i.name, cc.category
ORDER BY i.name, cc.category;
*/