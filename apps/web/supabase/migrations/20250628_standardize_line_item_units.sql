-- Standardize line item units for consistency
-- This migration standardizes various unit formats to consistent values

BEGIN;

-- Standardize square foot variations
UPDATE line_items 
SET unit = 'sqft'
WHERE unit IN ('sq ft', 'square foot');

-- Standardize linear foot variations
UPDATE line_items 
SET unit = 'linear_foot'
WHERE unit IN ('linear ft', 'linear foot', 'foot');

-- Standardize each/EA variations (use lowercase for consistency)
UPDATE line_items 
SET unit = 'each'
WHERE unit = 'EA';

-- Standardize pound variations
UPDATE line_items 
SET unit = 'pound'
WHERE unit = 'lb';

-- Standardize cubic yard (already consistent, but ensure)
UPDATE line_items 
SET unit = 'cubic_yard'
WHERE unit = 'cubic yard';

-- Log the changes
DO $$
DECLARE
    changes_count INTEGER;
BEGIN
    -- Count how many records were affected
    GET DIAGNOSTICS changes_count = ROW_COUNT;
    
    IF changes_count > 0 THEN
        RAISE NOTICE 'Standardized units for % line items', changes_count;
    END IF;
END $$;

COMMIT;