-- Final cleanup of unit inconsistencies
BEGIN;

-- Fix "service call" to use "call" for consistency
UPDATE line_items
SET unit = 'call'
WHERE unit = 'service call'
  AND organization_id IS NULL;

-- Fix "50lb box" to use standard "box" unit (weight can be in the name/description)
UPDATE line_items
SET unit = 'box'
WHERE unit = '50lb box'
  AND organization_id IS NULL;

-- Fix "initial service" to use standard "service" unit
UPDATE line_items
SET unit = 'service'
WHERE unit = 'initial service'
  AND organization_id IS NULL;

COMMIT;