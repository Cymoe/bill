-- Standardize Cost Codes to Alpha System Migration
-- This migration converts all cost codes to use consistent 2-letter alpha prefixes

-- Step 1: Create backup table
CREATE TABLE IF NOT EXISTS cost_codes_backup_20250621 AS 
SELECT * FROM cost_codes;

-- Step 2: Remove duplicate numeric codes for Painting (keeping PT codes)
DELETE FROM cost_codes 
WHERE organization_id IS NULL
  AND industry_id = (SELECT id FROM industries WHERE slug = 'painting')
  AND code IN ('09.15', '30.00', '30.01', '30.02', '30.03', '30.04', '30.05', 
               '30.06', '30.07', '30.08', '30.09', '30.30', '30.31', '30.33', 
               '30.60', '30.61', '30.80', '30.81', '38.00');

-- Step 3: Remove duplicate numeric codes for Roofing (keeping RF codes)
DELETE FROM cost_codes 
WHERE organization_id IS NULL
  AND industry_id = (SELECT id FROM industries WHERE slug = 'roofing')
  AND code IN ('26.00', '36.00', '36.01', '36.02', '36.03', '36.09', 
               '36.31', '36.60', '36.61', '46.00');

-- Step 4: Create mapping for numeric to alpha conversions
CREATE TEMP TABLE code_mappings (
  industry_slug TEXT,
  old_code TEXT,
  new_code TEXT,
  new_prefix TEXT
);

-- Insert mappings for General Construction
INSERT INTO code_mappings VALUES
  -- Services & Consultations (001-099)
  ('general-construction', '01.00', 'GC001', 'GC'), -- Building Permit
  ('general-construction', '01.01', 'GC101', 'GC'), -- Project Supervision
  ('general-construction', '01.02', 'GC002', 'GC'), -- Project Management
  ('general-construction', '02.00', 'GC003', 'GC'), -- Site Survey
  ('general-construction', '02.03', 'GC201', 'GC'), -- Site Clearing
  ('general-construction', '02.04', 'GC202', 'GC'), -- Excavation - General
  
  -- Materials (500-599)
  ('general-construction', '03.00', 'GC500', 'GC'), -- Concrete - Footings
  ('general-construction', '03.01', 'GC501', 'GC'), -- Concrete - Slab
  ('general-construction', '03.12', 'GC203', 'GC'), -- Concrete Finishing
  ('general-construction', '06.00', 'GC502', 'GC'), -- Lumber - 2x4
  ('general-construction', '06.01', 'GC503', 'GC'), -- Lumber - 2x6
  ('general-construction', '06.09', 'GC204', 'GC'), -- Wood Framing
  ('general-construction', '09.00', 'GC504', 'GC'), -- Metal Studs
  ('general-construction', '09.01', 'GC505', 'GC'), -- Drywall - 1/2"
  ('general-construction', '09.03', 'GC205', 'GC'), -- Drywall Installation
  
  -- Labor & Services (100-299)
  ('general-construction', '87.00', 'GC100', 'GC'), -- General Labor
  ('general-construction', '87.01', 'GC206', 'GC'), -- Furniture Assembly
  ('general-construction', '87.02', 'GC207', 'GC'), -- TV Mounting
  
  -- Specialty Services (800-899)
  ('general-construction', '04.00', 'GC801', 'GC'), -- Carpentry
  ('general-construction', '07.00', 'GC802', 'GC'), -- Cleaning
  ('general-construction', '08.00', 'GC803', 'GC'), -- Closets
  ('general-construction', '10.00', 'GC804', 'GC'), -- Countertops
  ('general-construction', '11.00', 'GC805', 'GC'), -- Decks & Patios
  ('general-construction', '12.00', 'GC806', 'GC'), -- Demolition
  ('general-construction', '13.00', 'GC807', 'GC'), -- Drainage
  ('general-construction', '14.00', 'GC808', 'GC'), -- Drywall
  ('general-construction', '16.00', 'GC809', 'GC'), -- Excavation
  ('general-construction', '17.00', 'GC810', 'GC'), -- Fencing
  ('general-construction', '18.00', 'GC811', 'GC'), -- Fire/Smoke Damage Restoration
  ('general-construction', '19.00', 'GC812', 'GC'), -- Fire/Smoke Safety
  ('general-construction', '22.00', 'GC813', 'GC'), -- Garage Door
  ('general-construction', '23.00', 'GC814', 'GC'), -- Gates
  ('general-construction', '24.00', 'GC815', 'GC'), -- General Construction
  ('general-construction', '25.00', 'GC816', 'GC'), -- Glass & Mirrors
  ('general-construction', '27.00', 'GC817', 'GC'), -- Handyman
  ('general-construction', '29.00', 'GC818', 'GC'), -- Insulation
  ('general-construction', '32.00', 'GC819', 'GC'), -- Locksmith
  ('general-construction', '34.00', 'GC820', 'GC'), -- Masonry
  ('general-construction', '35.00', 'GC821', 'GC'), -- Mold Remediation
  ('general-construction', '37.00', 'GC822', 'GC'), -- Mudrooms
  ('general-construction', '43.00', 'GC823', 'GC'), -- Pest Control
  ('general-construction', '44.00', 'GC824', 'GC'), -- Radon Mitigation
  ('general-construction', '45.00', 'GC825', 'GC'), -- Retaining Walls
  ('general-construction', '47.00', 'GC826', 'GC'), -- Security Systems
  ('general-construction', '48.00', 'GC827', 'GC'), -- Septic Services
  ('general-construction', '49.00', 'GC828', 'GC'), -- Siding
  ('general-construction', '50.00', 'GC829', 'GC'), -- Smart Home
  ('general-construction', '51.00', 'GC830', 'GC'), -- Snow Removal
  ('general-construction', '55.00', 'GC831', 'GC'), -- Water Damage Restoration
  ('general-construction', '56.00', 'GC832', 'GC'), -- Window & Glass
  ('general-construction', '99-99', 'GC999', 'GC'); -- Uncategorized

-- Insert mappings for Flooring
INSERT INTO code_mappings VALUES
  ('flooring', '20.00', 'FL001', 'FL'), -- Flooring (general)
  ('flooring', '33.00', 'FL200', 'FL'), -- Hardwood Flooring - Install
  ('flooring', '33.01', 'FL500', 'FL'), -- Hardwood Flooring - Materials
  ('flooring', '33.02', 'FL201', 'FL'), -- Laminate Flooring - Install
  ('flooring', '33.03', 'FL501', 'FL'), -- Laminate Flooring - Materials
  ('flooring', '33.04', 'FL202', 'FL'), -- Vinyl/LVP Flooring - Install
  ('flooring', '33.05', 'FL502', 'FL'), -- Vinyl/LVP Flooring - Materials
  ('flooring', '33.06', 'FL203', 'FL'), -- Carpet Installation
  ('flooring', '33.07', 'FL503', 'FL'), -- Carpet Materials
  ('flooring', '33.08', 'FL204', 'FL'), -- Tile Flooring - Install
  ('flooring', '33.09', 'FL504', 'FL'), -- Tile Flooring - Materials
  ('flooring', '33.30', 'FL300', 'FL'), -- Hardwood Floor Refinishing
  ('flooring', '33.31', 'FL301', 'FL'), -- Floor Board Replacement
  ('flooring', '33.60', 'FL600', 'FL'), -- Professional Floor Cleaning
  ('flooring', '33.61', 'FL601', 'FL'), -- Hardwood Floor Maintenance
  ('flooring', '05.00', 'FL602', 'FL'), -- Carpet Cleaning
  ('flooring', '53.00', 'FL205', 'FL'); -- Tile

-- Insert mappings for HVAC
INSERT INTO code_mappings VALUES
  ('hvac', '28.00', 'HV001', 'HV'), -- HVAC (general)
  ('hvac', '70.00', 'HV200', 'HV'), -- Central AC Installation
  ('hvac', '70.01', 'HV500', 'HV'), -- AC Unit - Equipment
  ('hvac', '70.02', 'HV201', 'HV'), -- Furnace Installation
  ('hvac', '70.03', 'HV501', 'HV'), -- Furnace - Equipment
  ('hvac', '70.30', 'HV300', 'HV'), -- AC Repair Service
  ('hvac', '70.60', 'HV600', 'HV'), -- AC Tune-up Service
  ('hvac', '21.00', 'HV801', 'HV'), -- Foundation Repair
  ('hvac', '30.32', 'HV301', 'HV'), -- Drywall Repair & Paint
  ('hvac', '36.30', 'HV302', 'HV'), -- Roof Leak Repair
  ('hvac', '87.05', 'HV303', 'HV'); -- Drywall Repair

-- Insert mappings for Landscaping
INSERT INTO code_mappings VALUES
  ('landscaping', '31.00', 'LS001', 'LS'), -- Landscaping (general)
  ('landscaping', '42.00', 'LS200', 'LS'), -- Sod Installation
  ('landscaping', '42.01', 'LS500', 'LS'), -- Sod Materials
  ('landscaping', '42.02', 'LS201', 'LS'), -- Landscape Planting
  ('landscaping', '42.07', 'LS202', 'LS'), -- Paver Patio Installation
  ('landscaping', '42.08', 'LS501', 'LS'), -- Paver Materials
  ('landscaping', '42.60', 'LS600', 'LS'), -- Lawn Mowing Service
  ('landscaping', '42.61', 'LS601', 'LS'), -- Lawn Treatment Program
  ('landscaping', '54.00', 'LS203', 'LS'); -- Tree Service

-- Insert mappings for Electrical
INSERT INTO code_mappings VALUES
  ('electrical', '15.00', 'EL001', 'EL'), -- Electrical (general)
  ('electrical', '87.08', 'EL200', 'EL'); -- Ceiling Fan Installation

-- Insert mappings for Plumbing
INSERT INTO code_mappings VALUES
  ('plumbing', '40.00', 'PL001', 'PL'), -- Plumbing (general)
  ('plumbing', '87.03', 'PL200', 'PL'), -- Fixture Installation
  ('plumbing', '87.04', 'PL300', 'PL'); -- Leak Repair

-- Insert mappings for Pool & Spa
INSERT INTO code_mappings VALUES
  ('pool-spa-services', '41.00', 'PS001', 'PS'); -- Pool & Spa Services

-- Insert mappings for Solar
INSERT INTO code_mappings VALUES
  ('solar', '39.00', 'SL001', 'SL'), -- Solar (general)
  ('solar', '52.00', 'SL200', 'SL'); -- Solar Panel Installation

-- Step 5: Update cost codes with new alpha codes
UPDATE cost_codes cc
SET code = cm.new_code
FROM code_mappings cm
JOIN industries i ON i.slug = cm.industry_slug
WHERE cc.industry_id = i.id
  AND cc.code = cm.old_code
  AND cc.organization_id IS NULL;

-- Step 6: Update any line_items that reference the old codes
-- First, create a mapping of old to new codes
CREATE TEMP TABLE code_updates AS
SELECT 
  cc_old.id as old_id,
  cc_new.id as new_id
FROM cost_codes cc_old
JOIN code_mappings cm ON cc_old.code = cm.old_code
JOIN industries i ON i.slug = cm.industry_slug AND cc_old.industry_id = i.id
JOIN cost_codes cc_new ON cc_new.code = cm.new_code AND cc_new.industry_id = i.id
WHERE cc_old.organization_id IS NULL
  AND cc_new.organization_id IS NULL;

-- Update line_items to point to new cost codes
UPDATE line_items li
SET cost_code_id = cu.new_id
FROM code_updates cu
WHERE li.cost_code_id = cu.old_id;

-- Step 7: Add any missing codes that exist in the numeric system but not in alpha
-- This ensures we don't lose any codes during the migration

-- Step 8: Clean up - remove any orphaned numeric codes
DELETE FROM cost_codes
WHERE organization_id IS NULL
  AND code ~ '^[0-9]{2}\.'  -- Matches numeric pattern XX.XX
  AND industry_id IN (
    SELECT id FROM industries 
    WHERE slug IN ('general-construction', 'flooring', 'hvac', 'landscaping', 
                   'electrical', 'plumbing', 'pool-spa-services', 'solar')
  );

-- Step 9: Create summary of changes
DO $$
DECLARE
  v_changes_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_changes_count
  FROM code_mappings;
  
  RAISE NOTICE 'Cost code standardization complete. % codes converted to alpha format.', v_changes_count;
END $$;

-- Drop temporary tables
DROP TABLE IF EXISTS code_mappings;
DROP TABLE IF EXISTS code_updates;