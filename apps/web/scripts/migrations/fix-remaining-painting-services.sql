-- Fix remaining zero-price Painting service options
-- This script handles the rest of the 51 services that have $0 price

-- Cabinet Refinishing Services
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN so.name = 'Cabinet Doors Only' THEN
            CASE 
                WHEN li.name = 'Master Painter' THEN 0.5      -- 30 min per door
                WHEN li.name = 'Interior Paint - Premium' THEN 0.1
                WHEN li.name = 'Sandpaper' THEN 0.1
            END
        WHEN so.name = 'Complete Cabinet Refinish' THEN
            CASE 
                WHEN li.name = 'Master Painter' THEN 0.25     -- 15 min per linear ft
                WHEN li.name = 'Interior Paint - Premium' THEN 0.05
                WHEN li.name = 'Sandpaper' THEN 0.05
                WHEN li.name = 'Primer - Interior' THEN 0.03
            END
        WHEN so.name = 'Cabinet Staining' THEN
            CASE 
                WHEN li.name = 'Master Painter' THEN 0.3      -- 18 min per linear ft
                WHEN li.name = 'Wood Stain' THEN 0.05
                WHEN li.name = 'Sandpaper' THEN 0.1
                WHEN li.name = 'Sealer' THEN 0.03
            END
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name IN ('Cabinet Doors Only', 'Complete Cabinet Refinish', 'Cabinet Staining')
AND so.price = 0
AND (
    (so.name = 'Cabinet Doors Only' AND li.name IN ('Master Painter', 'Interior Paint - Premium', 'Sandpaper'))
    OR (so.name = 'Complete Cabinet Refinish' AND li.name IN ('Master Painter', 'Interior Paint - Premium', 'Sandpaper', 'Primer - Interior'))
    OR (so.name = 'Cabinet Staining' AND li.name IN ('Master Painter', 'Wood Stain', 'Sandpaper', 'Sealer'))
)
ON CONFLICT DO NOTHING;

-- Drywall Repair Services
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN so.name = 'Popcorn Ceiling Repair' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.1   -- 6 min per sqft
                WHEN li.name = 'Texture Application' THEN 1    -- Already priced per sqft
                WHEN li.name = 'Interior Paint - Standard' THEN 0.02
            END
        WHEN so.name = 'Skim Coat Walls' THEN
            CASE 
                WHEN li.name = 'Master Painter' THEN 0.15      -- 9 min per sqft
                WHEN li.name = 'Caulk & Spackle' THEN 0.05
                WHEN li.name = 'Sandpaper' THEN 0.02
                WHEN li.name = 'Primer - Interior' THEN 0.02
            END
        WHEN so.name = 'Texture Matching' THEN
            CASE 
                WHEN li.name = 'Master Painter' THEN 0.2       -- 12 min per sqft
                WHEN li.name = 'Texture Application' THEN 1
                WHEN li.name = 'Interior Paint - Standard' THEN 0.03
            END
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name IN ('Popcorn Ceiling Repair', 'Skim Coat Walls', 'Texture Matching')
AND so.price = 0
AND (
    (so.name = 'Popcorn Ceiling Repair' AND li.name IN ('Painter - Standard', 'Texture Application', 'Interior Paint - Standard'))
    OR (so.name = 'Skim Coat Walls' AND li.name IN ('Master Painter', 'Caulk & Spackle', 'Sandpaper', 'Primer - Interior'))
    OR (so.name = 'Texture Matching' AND li.name IN ('Master Painter', 'Texture Application', 'Interior Paint - Standard'))
)
ON CONFLICT DO NOTHING;

-- Exterior Painting Services
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN so.name = 'Paint Porch Ceiling' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.05  -- 3 min per sqft
                WHEN li.name = 'Exterior Paint' THEN 0.025
                WHEN li.name = 'Drop Cloths' THEN 0.001
            END
        WHEN so.name = 'Paint Brick - Small Area' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.1   -- 6 min per sqft
                WHEN li.name = 'Exterior Paint' THEN 0.035
                WHEN li.name = 'Primer - Exterior' THEN 0.02
                WHEN li.name = 'Brushes & Rollers' THEN 0.01
            END
        WHEN so.name = 'Paint Stucco' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.08  -- 5 min per sqft
                WHEN li.name = 'Exterior Paint' THEN 0.03
                WHEN li.name = 'Primer - Exterior' THEN 0.015
            END
        WHEN so.name = 'Paint Hardy Board' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.06  -- 4 min per sqft
                WHEN li.name = 'Exterior Paint' THEN 0.025
                WHEN li.name = 'Primer - Exterior' THEN 0.01
            END
        WHEN so.name = 'Power Wash - Prep Only' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.02  -- 1.2 min per sqft
                WHEN li.name = 'Pressure Washing' THEN 1       -- Already priced per sqft
            END
        WHEN so.name = 'Paint Shutters' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 1     -- 1 hour per pair
                WHEN li.name = 'Exterior Paint' THEN 0.25
                WHEN li.name = 'Brushes & Rollers' THEN 0.1
            END
        WHEN so.name = 'Paint Wood Fence - Both Sides' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.08  -- 5 min per sqft
                WHEN li.name = 'Exterior Paint' THEN 0.04      -- More paint for both sides
                WHEN li.name = 'Brushes & Rollers' THEN 0.02
            END
        WHEN so.name = 'Paint Soffit' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.1   -- 6 min per linear ft
                WHEN li.name = 'Exterior Paint' THEN 0.05
                WHEN li.name = 'Painters Tape' THEN 0.02
            END
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name IN (
    'Paint Porch Ceiling', 'Paint Brick - Small Area', 'Paint Stucco', 
    'Paint Hardy Board', 'Power Wash - Prep Only', 'Paint Shutters',
    'Paint Wood Fence - Both Sides', 'Paint Soffit'
)
AND so.price = 0
AND (
    (so.name = 'Paint Porch Ceiling' AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Drop Cloths'))
    OR (so.name = 'Paint Brick - Small Area' AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Primer - Exterior', 'Brushes & Rollers'))
    OR (so.name = 'Paint Stucco' AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Primer - Exterior'))
    OR (so.name = 'Paint Hardy Board' AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Primer - Exterior'))
    OR (so.name = 'Power Wash - Prep Only' AND li.name IN ('Painter - Standard', 'Pressure Washing'))
    OR (so.name = 'Paint Shutters' AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Brushes & Rollers'))
    OR (so.name = 'Paint Wood Fence - Both Sides' AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Brushes & Rollers'))
    OR (so.name = 'Paint Soffit' AND li.name IN ('Painter - Standard', 'Exterior Paint', 'Painters Tape'))
)
ON CONFLICT DO NOTHING;

-- Interior Painting Services
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN so.name LIKE 'Paint Room - %' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' AND so.name LIKE '%Small%' THEN 4      -- 4 hours
                WHEN li.name = 'Painter - Standard' AND so.name LIKE '%Medium%' THEN 6     -- 6 hours  
                WHEN li.name = 'Painter - Standard' AND so.name LIKE '%Large%' THEN 8      -- 8 hours
                WHEN li.name = 'Interior Paint - Standard' AND so.name LIKE '%Small%' THEN 1    -- 1 gallon
                WHEN li.name = 'Interior Paint - Standard' AND so.name LIKE '%Medium%' THEN 2   -- 2 gallons
                WHEN li.name = 'Interior Paint - Standard' AND so.name LIKE '%Large%' THEN 3    -- 3 gallons
                WHEN li.name = 'Painters Tape' THEN 1
                WHEN li.name = 'Drop Cloths' THEN 0.5
                WHEN li.name = 'Brushes & Rollers' THEN 0.25
            END
        WHEN so.name = 'Paint Closet Interior' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 2     -- 2 hours
                WHEN li.name = 'Interior Paint - Standard' THEN 0.5
                WHEN li.name = 'Brushes & Rollers' THEN 0.2
            END
        WHEN so.name = 'Paint Bathroom Vanity' THEN
            CASE 
                WHEN li.name = 'Master Painter' THEN 3         -- 3 hours skilled work
                WHEN li.name = 'Interior Paint - Premium' THEN 0.5
                WHEN li.name = 'Sandpaper' THEN 0.25
                WHEN li.name = 'Primer - Interior' THEN 0.25
                WHEN li.name = 'Brushes & Rollers' THEN 0.3
            END
        WHEN so.name = 'Paint Kitchen Cabinets' THEN
            CASE 
                WHEN li.name = 'Master Painter' THEN 16        -- 2 days work
                WHEN li.name = 'Interior Paint - Premium' THEN 2
                WHEN li.name = 'Primer - Interior' THEN 1.5
                WHEN li.name = 'Sandpaper' THEN 1
                WHEN li.name = 'Brushes & Rollers' THEN 1
                WHEN li.name = 'Drop Cloths' THEN 2
            END
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE (
    so.name LIKE 'Paint Room - %' 
    OR so.name IN ('Paint Closet Interior', 'Paint Bathroom Vanity', 'Paint Kitchen Cabinets')
)
AND so.price = 0
AND (
    (so.name LIKE 'Paint Room - %' AND li.name IN ('Painter - Standard', 'Interior Paint - Standard', 'Painters Tape', 'Drop Cloths', 'Brushes & Rollers'))
    OR (so.name = 'Paint Closet Interior' AND li.name IN ('Painter - Standard', 'Interior Paint - Standard', 'Brushes & Rollers'))
    OR (so.name = 'Paint Bathroom Vanity' AND li.name IN ('Master Painter', 'Interior Paint - Premium', 'Sandpaper', 'Primer - Interior', 'Brushes & Rollers'))
    OR (so.name = 'Paint Kitchen Cabinets' AND li.name IN ('Master Painter', 'Interior Paint - Premium', 'Primer - Interior', 'Sandpaper', 'Brushes & Rollers', 'Drop Cloths'))
)
ON CONFLICT DO NOTHING;

-- Staining & Sealing Services
INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
SELECT 
    so.id,
    li.id,
    CASE 
        WHEN so.name = 'Deck Stain - Basic' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.08  -- 5 min per sqft
                WHEN li.name = 'Wood Stain' THEN 0.025
                WHEN li.name = 'Pressure Washing' THEN 1       -- Pre-cleaning
            END
        WHEN so.name = 'Deck Stain & Seal' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.12  -- 7 min per sqft
                WHEN li.name = 'Wood Stain' THEN 0.025
                WHEN li.name = 'Sealer' THEN 0.02
                WHEN li.name = 'Pressure Washing' THEN 1
            END
        WHEN so.name = 'Clear Sealant Only' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.05  -- 3 min per sqft
                WHEN li.name = 'Sealer' THEN 0.03
            END
        WHEN so.name = 'Fence Staining' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.06  -- 4 min per sqft
                WHEN li.name = 'Wood Stain' THEN 0.03
                WHEN li.name = 'Brushes & Rollers' THEN 0.01
            END
        WHEN so.name = 'Concrete Stain' THEN
            CASE 
                WHEN li.name = 'Painter - Standard' THEN 0.1   -- 6 min per sqft
                WHEN li.name = 'Sealer' THEN 0.04              -- Concrete sealer
                WHEN li.name = 'Pressure Washing' THEN 1
            END
    END as quantity
FROM service_options so
CROSS JOIN line_items li
WHERE so.name IN ('Deck Stain - Basic', 'Deck Stain & Seal', 'Clear Sealant Only', 'Fence Staining', 'Concrete Stain')
AND so.price = 0
AND (
    (so.name = 'Deck Stain - Basic' AND li.name IN ('Painter - Standard', 'Wood Stain', 'Pressure Washing'))
    OR (so.name = 'Deck Stain & Seal' AND li.name IN ('Painter - Standard', 'Wood Stain', 'Sealer', 'Pressure Washing'))
    OR (so.name = 'Clear Sealant Only' AND li.name IN ('Painter - Standard', 'Sealer'))
    OR (so.name = 'Fence Staining' AND li.name IN ('Painter - Standard', 'Wood Stain', 'Brushes & Rollers'))
    OR (so.name = 'Concrete Stain' AND li.name IN ('Painter - Standard', 'Sealer', 'Pressure Washing'))
)
ON CONFLICT DO NOTHING;

-- Update all service prices using our new function
SELECT update_all_service_option_prices();

-- Verify results
SELECT 
    s.name as service_name,
    COUNT(so.id) as total_options,
    COUNT(CASE WHEN so.price = 0 THEN 1 END) as zero_price_options,
    COUNT(CASE WHEN so.price > 0 THEN 1 END) as priced_options
FROM services s
JOIN service_options so ON s.id = so.service_id
JOIN industries i ON s.industry_id = i.id
WHERE i.name = 'Painting'
AND so.is_template = true
GROUP BY s.name
ORDER BY s.name;