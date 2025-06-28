-- Fix inappropriate units for line items based on their cost code categories
-- This migration corrects mismatched units to align with industry standards

BEGIN;

-- 1. Fix HVAC Labor items that are actually materials/equipment
-- Items in HV100 (HVAC Labor) that are clearly materials should be moved to HV500 first
UPDATE line_items 
SET unit = CASE 
    WHEN name LIKE '%Filter%' THEN 'each'
    WHEN name LIKE '%Thermostat%' THEN 'each'
    WHEN name LIKE '%Pump%' THEN 'each'
    WHEN name LIKE '%Fan%' THEN 'each'
    WHEN name LIKE '%Duct%' AND name NOT LIKE '%Cleaning%' THEN 'linear_foot'
    WHEN name LIKE '%Grille%' THEN 'each'
    WHEN name LIKE '%Plenum%' THEN 'each'
    WHEN name IN ('Air Conditioner (3-Ton)', 'Furnace (80,000 BTU)', 'Heat Pump (3-Ton)') THEN 'unit'
    WHEN name LIKE '%System Installation%' THEN 'project'
    WHEN name LIKE '%Service Call%' THEN 'call'
    WHEN name LIKE '%Tune-Up%' THEN 'service'
    WHEN name LIKE '%Inspection%' THEN 'inspection'
    WHEN name LIKE '%Cleaning%' THEN 'service'
    WHEN name LIKE '%Test%' THEN 'service'
    WHEN name LIKE '%Analysis%' THEN 'service'
    WHEN name LIKE '%Audit%' THEN 'service'
    WHEN name LIKE '%Calibration%' THEN 'service'
    WHEN name LIKE '%Startup/Shutdown%' THEN 'service'
    ELSE unit
END
WHERE cost_code_id IN (
    SELECT id FROM cost_codes WHERE code = 'HV100'
)
AND organization_id IS NULL
AND unit NOT IN ('hour', 'day');

-- 2. Fix labor rates that should use time units
UPDATE line_items
SET unit = 'hour'
WHERE cost_code_id IN (
    SELECT id FROM cost_codes WHERE code LIKE '%100' -- Labor codes
)
AND organization_id IS NULL
AND name LIKE '%Labor%' OR name LIKE '%Foreman%' OR name LIKE '%Helper%' OR name LIKE '%Apprentice%' OR name LIKE '%Journeyman%' OR name LIKE '%Master%'
AND unit NOT IN ('hour', 'day', 'week', 'month');

-- 3. Fix electrician entries in EL200 (should be in EL100 or use appropriate units)
UPDATE line_items
SET unit = 'hour'
WHERE name IN ('Electrician - Apprentice', 'Electrician - Journeyman', 'Electrician - Master')
AND cost_code_id IN (SELECT id FROM cost_codes WHERE code = 'EL200')
AND organization_id IS NULL;

-- 4. Fix tile setter in FL200 (floor installation)
UPDATE line_items
SET unit = 'hour'
WHERE name = 'Tile Setter'
AND cost_code_id IN (SELECT id FROM cost_codes WHERE code = 'FL200')
AND organization_id IS NULL;

-- 5. Fix cleanup service in DW200 (drywall installation)
UPDATE line_items
SET unit = 'service'
WHERE name = 'Cleanup Service'
AND cost_code_id IN (SELECT id FROM cost_codes WHERE code = 'DW200')
AND organization_id IS NULL;

-- 6. Fix service call fee in HM100 (handyman labor)
UPDATE line_items
SET unit = 'call'
WHERE name = 'Service Call Fee'
AND cost_code_id IN (SELECT id FROM cost_codes WHERE code = 'HM100')
AND organization_id IS NULL;

-- 7. Fix landscaping items in LS100 that aren't actually labor
UPDATE line_items
SET unit = CASE
    WHEN name = 'Flagstone' THEN 'sqft'  -- More appropriate than pound for pricing
    WHEN name = 'Garden Bed' THEN 'each'
    WHEN name = 'Irrigation System' THEN 'project'
    WHEN name = 'Landscape Fabric' THEN 'sqft'  -- Already correct
    WHEN name = 'Leaf Blower' THEN 'each'  -- Equipment rental/purchase
    WHEN name = 'Porch Railing' THEN 'linear_foot'  -- Already correct
    WHEN name = 'Rain Barrel' THEN 'each'
    WHEN name = 'Sod' THEN 'sqft'  -- Already correct
    WHEN name = 'Tree Removal' THEN 'each'
    ELSE unit
END
WHERE cost_code_id IN (
    SELECT id FROM cost_codes WHERE code = 'LS100'
)
AND organization_id IS NULL
AND name IN ('Flagstone', 'Garden Bed', 'Irrigation System', 'Landscape Fabric', 'Leaf Blower', 'Porch Railing', 'Rain Barrel', 'Sod', 'Tree Removal');

-- 8. Fix other materials that shouldn't use time units
UPDATE line_items
SET unit = CASE
    WHEN unit IN ('hour', 'day', 'week', 'month') THEN 'each'
    ELSE unit
END
WHERE cost_code_id IN (
    SELECT id FROM cost_codes WHERE code LIKE '%500' -- Material codes
)
AND organization_id IS NULL
AND unit IN ('hour', 'day', 'week', 'month');

-- 9. Log the changes
DO $$
DECLARE
    changes_count INTEGER;
BEGIN
    GET DIAGNOSTICS changes_count = ROW_COUNT;
    
    IF changes_count > 0 THEN
        RAISE NOTICE 'Fixed units for % line items', changes_count;
    END IF;
END $$;

COMMIT;