-- Fix zero-price Painting service options by adding line items
-- This will create service_option_items to link services to appropriate line items

-- First, let's handle "Paint Entry Door - Basic"
-- This should include: labor (2 hours) + door paint + prep materials
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN li.name = 'Painter - Standard' THEN 2  -- 2 hours of labor
        WHEN li.name = 'Exterior Paint' THEN 0.25   -- 1/4 gallon
        WHEN li.name = 'Sandpaper' THEN 0.1         -- 1/10 pack
        WHEN li.name = 'Painters Tape' THEN 0.25    -- 1/4 roll
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name = 'Paint Entry Door - Basic'
AND so.price = 0
AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Sandpaper', 'Painters Tape')
ON CONFLICT DO NOTHING;

-- "Paint Entry Door - Complete" (more comprehensive)
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN li.name = 'Painter - Standard' THEN 3  -- 3 hours of labor
        WHEN li.name = 'Exterior Paint' THEN 0.5    -- 1/2 gallon
        WHEN li.name = 'Primer - Exterior' THEN 0.25 -- 1/4 gallon primer
        WHEN li.name = 'Sandpaper' THEN 0.2         -- 1/5 pack
        WHEN li.name = 'Painters Tape' THEN 0.5     -- 1/2 roll
        WHEN li.name = 'Caulk' THEN 0.5             -- 1/2 tube
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name = 'Paint Entry Door - Complete'
AND so.price = 0
AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Primer - Exterior', 'Sandpaper', 'Painters Tape', 'Caulk')
ON CONFLICT DO NOTHING;

-- "Paint Exterior Trim" (per linear foot)
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN li.name = 'Painter - Standard' THEN 0.05  -- 3 minutes per linear foot
        WHEN li.name = 'Exterior Paint' THEN 0.01      -- Small amount per linear foot
        WHEN li.name = 'Painters Tape' THEN 0.01       -- Minimal tape per foot
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name = 'Paint Exterior Trim'
AND so.price = 0
AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Painters Tape')
ON CONFLICT DO NOTHING;

-- "Small Hole Repair" 
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN li.name = 'Painter - Standard' THEN 0.5   -- 30 minutes
        WHEN li.name = 'Caulk & Spackle' THEN 0.1      -- Small amount
        WHEN li.name = 'Sandpaper' THEN 0.05           -- Minimal sanding
        WHEN li.name = 'Interior Paint - Standard' THEN 0.05  -- Touch up paint
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name = 'Small Hole Repair'
AND so.price = 0
AND li.name IN ('Painter - Standard', 'Caulk & Spackle', 'Sandpaper', 'Interior Paint - Standard')
ON CONFLICT DO NOTHING;

-- "Large Hole Patch"
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN li.name = 'Painter - Standard' THEN 1.5   -- 1.5 hours
        WHEN li.name = 'Caulk & Spackle' THEN 0.25     -- More materials
        WHEN li.name = 'Sandpaper' THEN 0.15           -- More sanding
        WHEN li.name = 'Interior Paint - Standard' THEN 0.1   -- More paint
        WHEN li.name = 'Primer - Interior' THEN 0.1    -- Need primer
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name = 'Large Hole Patch'
AND so.price = 0
AND li.name IN ('Painter - Standard', 'Caulk & Spackle', 'Sandpaper', 'Interior Paint - Standard', 'Primer - Interior')
ON CONFLICT DO NOTHING;

-- "Cabinet Touch-Up" (hourly rate)
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN li.name = 'Master Painter' THEN 1         -- 1 hour skilled work
        WHEN li.name = 'Interior Paint - Premium' THEN 0.05  -- Small amount
        WHEN li.name = 'Sandpaper' THEN 0.1            -- Fine sanding
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name = 'Cabinet Touch-Up'
AND so.price = 0
AND li.name IN ('Master Painter', 'Interior Paint - Premium', 'Sandpaper')
ON CONFLICT DO NOTHING;

-- After inserting line items, update the service option prices to reflect the calculated total
-- This is a one-time update to set initial prices
UPDATE service_options so
SET price = COALESCE((
    SELECT SUM(li.price * soi.quantity)
    FROM service_option_items soi
    JOIN line_items li ON soi.line_item_id = li.id
    WHERE soi.service_option_id = so.id
), 0)
WHERE so.price = 0
AND EXISTS (
    SELECT 1 
    FROM service_option_items soi 
    WHERE soi.service_option_id = so.id
);

-- Let's check what we've done
SELECT 
    so.name,
    so.price as old_price,
    COALESCE(SUM(li.price * soi.quantity), 0) as calculated_price,
    COUNT(soi.id) as line_item_count
FROM service_options so
LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
LEFT JOIN line_items li ON soi.line_item_id = li.id
WHERE so.name IN (
    'Paint Entry Door - Basic',
    'Paint Entry Door - Complete', 
    'Paint Exterior Trim',
    'Small Hole Repair',
    'Large Hole Patch',
    'Cabinet Touch-Up'
)
GROUP BY so.id, so.name, so.price
ORDER BY so.name;