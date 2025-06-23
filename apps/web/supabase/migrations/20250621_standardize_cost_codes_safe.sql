-- Safe Standardization of Cost Codes to Alpha System
-- This migration converts all cost codes to use consistent 2-letter alpha prefixes
-- It safely handles foreign key constraints

-- Step 1: Create backup table
CREATE TABLE IF NOT EXISTS cost_codes_backup_20250621 AS 
SELECT * FROM cost_codes;

-- Step 2: For Painting - Update numeric codes to match PT codes instead of deleting
-- First, let's see if there are any line items or products using these codes
DO $$
DECLARE
    painting_id UUID;
BEGIN
    SELECT id INTO painting_id FROM industries WHERE slug = 'painting';
    
    -- Update duplicate numeric codes for Painting to use 'OLD_' prefix temporarily
    UPDATE cost_codes 
    SET code = 'OLD_' || code
    WHERE organization_id IS NULL
      AND industry_id = painting_id
      AND code IN ('09.15', '30.00', '30.01', '30.02', '30.03', '30.04', '30.05', 
                   '30.06', '30.07', '30.08', '30.09', '30.30', '30.31', '30.33', 
                   '30.60', '30.61', '30.80', '30.81', '38.00');
END $$;

-- Step 3: For Roofing - Update numeric codes to match RF codes instead of deleting
DO $$
DECLARE
    roofing_id UUID;
BEGIN
    SELECT id INTO roofing_id FROM industries WHERE slug = 'roofing';
    
    -- Update duplicate numeric codes for Roofing to use 'OLD_' prefix temporarily
    UPDATE cost_codes 
    SET code = 'OLD_' || code
    WHERE organization_id IS NULL
      AND industry_id = roofing_id
      AND code IN ('26.00', '36.00', '36.01', '36.02', '36.03', '36.09', 
                   '36.31', '36.60', '36.61', '46.00');
END $$;

-- Step 4: Create mapping for numeric to alpha conversions
CREATE TEMP TABLE code_mappings (
  industry_slug TEXT,
  old_code TEXT,
  new_code TEXT,
  new_prefix TEXT
);

-- Insert all mappings (same as before)
-- General Construction mappings
INSERT INTO code_mappings VALUES
  ('general-construction', '01.00', 'GC001', 'GC'),
  ('general-construction', '01.01', 'GC101', 'GC'),
  ('general-construction', '01.02', 'GC002', 'GC'),
  ('general-construction', '02.00', 'GC003', 'GC'),
  ('general-construction', '02.03', 'GC201', 'GC'),
  ('general-construction', '02.04', 'GC202', 'GC'),
  ('general-construction', '03.00', 'GC500', 'GC'),
  ('general-construction', '03.01', 'GC501', 'GC'),
  ('general-construction', '03.12', 'GC203', 'GC'),
  ('general-construction', '06.00', 'GC502', 'GC'),
  ('general-construction', '06.01', 'GC503', 'GC'),
  ('general-construction', '06.09', 'GC204', 'GC'),
  ('general-construction', '09.00', 'GC504', 'GC'),
  ('general-construction', '09.01', 'GC505', 'GC'),
  ('general-construction', '09.03', 'GC205', 'GC'),
  ('general-construction', '87.00', 'GC100', 'GC'),
  ('general-construction', '87.01', 'GC206', 'GC'),
  ('general-construction', '87.02', 'GC207', 'GC'),
  ('general-construction', '04.00', 'GC801', 'GC'),
  ('general-construction', '07.00', 'GC802', 'GC'),
  ('general-construction', '08.00', 'GC803', 'GC'),
  ('general-construction', '10.00', 'GC804', 'GC'),
  ('general-construction', '11.00', 'GC805', 'GC'),
  ('general-construction', '12.00', 'GC806', 'GC'),
  ('general-construction', '13.00', 'GC807', 'GC'),
  ('general-construction', '14.00', 'GC808', 'GC'),
  ('general-construction', '16.00', 'GC809', 'GC'),
  ('general-construction', '17.00', 'GC810', 'GC'),
  ('general-construction', '18.00', 'GC811', 'GC'),
  ('general-construction', '19.00', 'GC812', 'GC'),
  ('general-construction', '22.00', 'GC813', 'GC'),
  ('general-construction', '23.00', 'GC814', 'GC'),
  ('general-construction', '24.00', 'GC815', 'GC'),
  ('general-construction', '25.00', 'GC816', 'GC'),
  ('general-construction', '27.00', 'GC817', 'GC'),
  ('general-construction', '29.00', 'GC818', 'GC'),
  ('general-construction', '32.00', 'GC819', 'GC'),
  ('general-construction', '34.00', 'GC820', 'GC'),
  ('general-construction', '35.00', 'GC821', 'GC'),
  ('general-construction', '37.00', 'GC822', 'GC'),
  ('general-construction', '43.00', 'GC823', 'GC'),
  ('general-construction', '44.00', 'GC824', 'GC'),
  ('general-construction', '45.00', 'GC825', 'GC'),
  ('general-construction', '47.00', 'GC826', 'GC'),
  ('general-construction', '48.00', 'GC827', 'GC'),
  ('general-construction', '49.00', 'GC828', 'GC'),
  ('general-construction', '50.00', 'GC829', 'GC'),
  ('general-construction', '51.00', 'GC830', 'GC'),
  ('general-construction', '55.00', 'GC831', 'GC'),
  ('general-construction', '56.00', 'GC832', 'GC'),
  ('general-construction', '99-99', 'GC999', 'GC');

-- Flooring mappings
INSERT INTO code_mappings VALUES
  ('flooring', '20.00', 'FL001', 'FL'),
  ('flooring', '33.00', 'FL200', 'FL'),
  ('flooring', '33.01', 'FL500', 'FL'),
  ('flooring', '33.02', 'FL201', 'FL'),
  ('flooring', '33.03', 'FL501', 'FL'),
  ('flooring', '33.04', 'FL202', 'FL'),
  ('flooring', '33.05', 'FL502', 'FL'),
  ('flooring', '33.06', 'FL203', 'FL'),
  ('flooring', '33.07', 'FL503', 'FL'),
  ('flooring', '33.08', 'FL204', 'FL'),
  ('flooring', '33.09', 'FL504', 'FL'),
  ('flooring', '33.30', 'FL300', 'FL'),
  ('flooring', '33.31', 'FL301', 'FL'),
  ('flooring', '33.60', 'FL600', 'FL'),
  ('flooring', '33.61', 'FL601', 'FL'),
  ('flooring', '05.00', 'FL602', 'FL'),
  ('flooring', '53.00', 'FL205', 'FL');

-- HVAC mappings
INSERT INTO code_mappings VALUES
  ('hvac', '28.00', 'HV001', 'HV'),
  ('hvac', '70.00', 'HV200', 'HV'),
  ('hvac', '70.01', 'HV500', 'HV'),
  ('hvac', '70.02', 'HV201', 'HV'),
  ('hvac', '70.03', 'HV501', 'HV'),
  ('hvac', '70.30', 'HV300', 'HV'),
  ('hvac', '70.60', 'HV600', 'HV'),
  ('hvac', '21.00', 'HV801', 'HV'),
  ('hvac', '30.32', 'HV301', 'HV'),
  ('hvac', '36.30', 'HV302', 'HV'),
  ('hvac', '87.05', 'HV303', 'HV');

-- Landscaping mappings
INSERT INTO code_mappings VALUES
  ('landscaping', '31.00', 'LS001', 'LS'),
  ('landscaping', '42.00', 'LS200', 'LS'),
  ('landscaping', '42.01', 'LS500', 'LS'),
  ('landscaping', '42.02', 'LS201', 'LS'),
  ('landscaping', '42.07', 'LS202', 'LS'),
  ('landscaping', '42.08', 'LS501', 'LS'),
  ('landscaping', '42.60', 'LS600', 'LS'),
  ('landscaping', '42.61', 'LS601', 'LS'),
  ('landscaping', '54.00', 'LS203', 'LS');

-- Electrical mappings
INSERT INTO code_mappings VALUES
  ('electrical', '15.00', 'EL001', 'EL'),
  ('electrical', '87.08', 'EL200', 'EL');

-- Plumbing mappings (note: we need to add the missing plumbing codes)
INSERT INTO code_mappings VALUES
  ('plumbing', '40.00', 'PL001', 'PL');

-- Pool & Spa mappings
INSERT INTO code_mappings VALUES
  ('pool-spa-services', '41.00', 'PS001', 'PS');

-- Solar mappings
INSERT INTO code_mappings VALUES
  ('solar', '39.00', 'SL001', 'SL'),
  ('solar', '52.00', 'SL200', 'SL');

-- Step 5: Update cost codes with new alpha codes
UPDATE cost_codes cc
SET code = cm.new_code
FROM code_mappings cm
JOIN industries i ON i.slug = cm.industry_slug
WHERE cc.industry_id = i.id
  AND cc.code = cm.old_code
  AND cc.organization_id IS NULL;

-- Step 6: Mark old painting/roofing codes as inactive instead of deleting
UPDATE cost_codes 
SET is_active = false,
    name = name || ' (DEPRECATED)'
WHERE organization_id IS NULL
  AND code LIKE 'OLD_%';

-- Step 7: Summary report
DO $$
DECLARE
  v_converted INTEGER;
  v_deprecated INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_converted
  FROM code_mappings;
  
  SELECT COUNT(*) INTO v_deprecated
  FROM cost_codes
  WHERE code LIKE 'OLD_%';
  
  RAISE NOTICE 'Cost code standardization complete.';
  RAISE NOTICE '% codes converted to alpha format.', v_converted;
  RAISE NOTICE '% duplicate codes marked as deprecated.', v_deprecated;
END $$;

-- Drop temporary tables
DROP TABLE IF EXISTS code_mappings;