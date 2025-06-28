-- Migration: Add JSONB attributes column to service_options table
-- Purpose: Enable flexible, industry-specific attributes for better searchability and filtering
-- Date: 2025-06-26

-- Add the attributes column with a default empty object
ALTER TABLE service_options 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}';

-- Add GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_service_options_attributes 
ON service_options USING GIN (attributes);

-- Add comment explaining the column
COMMENT ON COLUMN service_options.attributes IS 'Industry-specific attributes stored as JSONB. Examples: HVAC: {btu, seer, voltage}, Painting: {voc_level, coverage_sqft, sheen}';

-- Example of how to query this column:
-- SELECT * FROM service_options WHERE attributes->>'seer' >= '15';
-- SELECT * FROM service_options WHERE attributes @> '{"energy_star": true}';
-- SELECT * FROM service_options WHERE (attributes->>'btu')::int BETWEEN 18000 AND 24000;

-- Migrate some existing data as examples (HVAC)
-- We'll extract BTU and SEER from names/descriptions where possible

-- Update HVAC AC Installation options
UPDATE service_options 
SET attributes = jsonb_build_object(
    'btu', 9000,
    'seer', 14,
    'coverage_sqft', 300,
    'voltage', '115V',
    'phase', 'single',
    'energy_star', true
)
WHERE name = 'Install mini split AC unit - 9K BTU' 
AND organization_id IS NULL;

UPDATE service_options 
SET attributes = jsonb_build_object(
    'btu', 12000,
    'seer', 14,
    'coverage_sqft', 500,
    'voltage', '115V',
    'phase', 'single',
    'energy_star', true
)
WHERE name = 'Install mini split AC unit - 12K BTU' 
AND organization_id IS NULL;

UPDATE service_options 
SET attributes = jsonb_build_object(
    'btu', 18000,
    'seer', 16,
    'coverage_sqft', 750,
    'voltage', '240V',
    'phase', 'single',
    'energy_star', true
)
WHERE name = 'Install central AC unit - 18K BTU' 
AND organization_id IS NULL;

UPDATE service_options 
SET attributes = jsonb_build_object(
    'btu', 24000,
    'seer', 16,
    'tonnage', 2,
    'coverage_sqft', 1000,
    'voltage', '240V',
    'phase', 'single',
    'energy_star', true
)
WHERE name = 'Install central AC unit - 24K BTU' 
AND organization_id IS NULL;

-- Update HVAC Furnace options
UPDATE service_options 
SET attributes = jsonb_build_object(
    'btu_input', 60000,
    'efficiency_percent', 80,
    'fuel_type', 'natural_gas',
    'stages', 'single',
    'warranty_years', 10
)
WHERE name = 'Install gas furnace - 60K BTU' 
AND organization_id IS NULL;

UPDATE service_options 
SET attributes = jsonb_build_object(
    'btu_input', 80000,
    'efficiency_percent', 95,
    'efficiency_rating', 'AFUE',
    'fuel_type', 'natural_gas',
    'stages', 'two',
    'warranty_years', 15
)
WHERE name = 'Install high-efficiency furnace - 80K BTU' 
AND organization_id IS NULL;

-- Update Painting options with VOC and coverage data
UPDATE service_options 
SET attributes = jsonb_build_object(
    'voc_level', 'low',
    'voc_grams_per_liter', 50,
    'coverage_sqft_per_gallon', 350,
    'coats_required', 2,
    'sheen', 'flat',
    'dry_time_hours', 2,
    'recoat_time_hours', 4
)
WHERE name ILIKE '%interior%paint%' 
AND name ILIKE '%low VOC%'
AND organization_id IS NULL;

-- Update Window options
UPDATE service_options 
SET attributes = jsonb_build_object(
    'glass_type', 'single_pane',
    'frame_material', 'aluminum',
    'operation_type', 'single_hung',
    'energy_star', false,
    'warranty_years', 5
)
WHERE name = 'Single pane window installation' 
AND organization_id IS NULL;

UPDATE service_options 
SET attributes = jsonb_build_object(
    'glass_type', 'double_pane',
    'frame_material', 'vinyl',
    'operation_type', 'single_hung',
    'u_factor', 0.30,
    'shgc', 0.25,
    'energy_star', true,
    'warranty_years', 10
)
WHERE name = 'Double pane window installation' 
AND organization_id IS NULL;

UPDATE service_options 
SET attributes = jsonb_build_object(
    'glass_type', 'triple_pane',
    'frame_material', 'fiberglass',
    'operation_type', 'casement',
    'u_factor', 0.20,
    'shgc', 0.20,
    'energy_star', true,
    'argon_filled', true,
    'low_e_coating', true,
    'warranty_years', 25
)
WHERE name = 'Triple pane window installation' 
AND organization_id IS NULL;

-- Verify the migration
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'service_options' 
        AND column_name = 'attributes'
    ) THEN
        RAISE NOTICE 'Migration successful: attributes column added to service_options table';
    ELSE
        RAISE EXCEPTION 'Migration failed: attributes column not found';
    END IF;
END $$;