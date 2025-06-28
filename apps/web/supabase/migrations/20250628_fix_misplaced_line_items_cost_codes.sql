-- Fix misplaced line items by moving them to appropriate cost codes
-- This ensures items are in the correct category (labor, materials, services, etc.)

BEGIN;

-- 1. Move HVAC materials from HV100 (Labor) to HV500 (Materials)
UPDATE line_items
SET cost_code_id = (SELECT id FROM cost_codes WHERE code = 'HV500')
WHERE cost_code_id = (SELECT id FROM cost_codes WHERE code = 'HV100')
  AND organization_id IS NULL
  AND name IN (
    '6" Flex Duct R6',
    'Air Filter (MERV 11)',
    'Condensate Pump',
    'Exhaust Fan',
    'MERV 13 Filter 20x20',
    'Pleated Air Filter 16x25x1',
    'Programmable Thermostat',
    'Refrigerant Line Set',
    'Sheet Metal Plenum',
    'Smart Thermostat',
    'Supply Air Grille 12x12',
    'Thermostat (Programmable)',
    'Air Conditioner (3-Ton)',
    'Furnace (80,000 BTU)',
    'Heat Pump (3-Ton)'
  );

-- 2. Move HVAC services from HV100 (Labor) to HV300 (Repair/Service)
UPDATE line_items
SET cost_code_id = (SELECT id FROM cost_codes WHERE code = 'HV300')
WHERE cost_code_id = (SELECT id FROM cost_codes WHERE code = 'HV100')
  AND organization_id IS NULL
  AND name IN (
    'A/C System Inspection',
    'AC Tune-Up',
    'Annual HVAC Tune-Up',
    'Combustion Analysis',
    'Duct Cleaning',
    'Furnace Cleaning',
    'Home Energy Audit',
    'HVAC Service Call',
    'Refrigerant Leak Test',
    'Service Call',
    'Filter Replacement Service',
    'Thermostat Calibration',
    'Seasonal Startup/Shutdown'
  );

-- 3. Move HVAC installations from HV100 (Labor) to HV200 (Installation)
UPDATE line_items
SET cost_code_id = (SELECT id FROM cost_codes WHERE code = 'HV200')
WHERE cost_code_id = (SELECT id FROM cost_codes WHERE code = 'HV100')
  AND organization_id IS NULL
  AND name IN (
    'HVAC Install',
    'HVAC System Installation'
  );

-- 4. Fix remaining misnamed HVAC Labor items
UPDATE line_items
SET name = CASE
    WHEN name = 'Air Balancing Company' THEN 'Air Balancing Technician'
    WHEN name = 'Ductless Mini-Split Contractor' THEN 'Mini-Split Installation Tech'
    ELSE name
  END,
  unit = 'hour'
WHERE cost_code_id = (SELECT id FROM cost_codes WHERE code = 'HV100')
  AND organization_id IS NULL
  AND name IN ('Air Balancing Company', 'Ductless Mini-Split Contractor');

-- 5. Move Landscaping materials from LS100 (Labor) to LS500 (Materials)
UPDATE line_items
SET cost_code_id = (SELECT id FROM cost_codes WHERE code = 'LS500')
WHERE cost_code_id = (SELECT id FROM cost_codes WHERE code = 'LS100')
  AND organization_id IS NULL
  AND name IN (
    'Flagstone',
    'Landscape Fabric',
    'Leaf Blower',
    'Porch Railing',
    'Rain Barrel',
    'Sod'
  );

-- 6. Move Landscaping installations from LS100 (Labor) to LS200 (Installation)
UPDATE line_items
SET cost_code_id = (SELECT id FROM cost_codes WHERE code = 'LS200')
WHERE cost_code_id = (SELECT id FROM cost_codes WHERE code = 'LS100')
  AND organization_id IS NULL
  AND name IN (
    'Garden Bed',
    'Irrigation System',
    'Tree Removal'
  );

-- 7. Ensure all true labor items use time-based units
UPDATE line_items
SET unit = 'hour'
WHERE cost_code_id IN (
    SELECT id FROM cost_codes WHERE code LIKE '%100'
  )
  AND organization_id IS NULL
  AND unit NOT IN ('hour', 'day', 'week', 'month')
  AND (
    name LIKE '%Labor%' OR 
    name LIKE '%Technician%' OR 
    name LIKE '%Helper%' OR 
    name LIKE '%Foreman%' OR
    name LIKE '%Apprentice%' OR
    name LIKE '%Journeyman%' OR
    name LIKE '%Master%'
  );

-- 8. Log the changes
DO $$
DECLARE
    changes_count INTEGER;
BEGIN
    GET DIAGNOSTICS changes_count = ROW_COUNT;
    
    IF changes_count > 0 THEN
        RAISE NOTICE 'Moved % line items to correct cost codes', changes_count;
    END IF;
END $$;

COMMIT;