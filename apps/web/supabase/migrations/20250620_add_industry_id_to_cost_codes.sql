-- Add industry_id column to cost_codes table
-- This fixes the industry filtering issue where cost codes were not associated with industries

-- Add industry_id column if it doesn't exist
ALTER TABLE cost_codes ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES industries(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_industry_id ON cost_codes(industry_id);

-- Update existing cost codes with industry associations based on their prefixes
-- We'll need the industry IDs first
DO $$
DECLARE
    plumbing_id UUID;
    electrical_id UUID;
    hvac_id UUID;
    general_construction_id UUID;
    commercial_construction_id UUID;
    residential_construction_id UUID;
    home_services_id UUID;
    specialty_trades_id UUID;
BEGIN
    -- Get industry IDs
    SELECT id INTO plumbing_id FROM industries WHERE slug = 'plumbing';
    SELECT id INTO electrical_id FROM industries WHERE slug = 'electrical';
    SELECT id INTO hvac_id FROM industries WHERE slug = 'hvac';
    SELECT id INTO general_construction_id FROM industries WHERE slug = 'general-construction';
    SELECT id INTO commercial_construction_id FROM industries WHERE slug = 'commercial-construction';
    SELECT id INTO residential_construction_id FROM industries WHERE slug = 'residential-construction';
    SELECT id INTO home_services_id FROM industries WHERE slug = 'home-services';
    SELECT id INTO specialty_trades_id FROM industries WHERE slug = 'specialty-trades';

    -- Update cost codes based on their code prefixes
    -- Plumbing codes (PL prefix)
    IF plumbing_id IS NOT NULL THEN
        UPDATE cost_codes SET industry_id = plumbing_id WHERE code LIKE 'PL%';
    END IF;

    -- Electrical codes (EL prefix)
    IF electrical_id IS NOT NULL THEN
        UPDATE cost_codes SET industry_id = electrical_id WHERE code LIKE 'EL%';
    END IF;

    -- HVAC codes (HV prefix)
    IF hvac_id IS NOT NULL THEN
        UPDATE cost_codes SET industry_id = hvac_id WHERE code LIKE 'HV%';
    END IF;

    -- General construction codes (GC prefix or numeric codes like 01.00, 02.00, etc.)
    IF general_construction_id IS NOT NULL THEN
        UPDATE cost_codes SET industry_id = general_construction_id 
        WHERE code LIKE 'GC%' OR code ~ '^[0-9]{2}\.[0-9]{2}';
    END IF;

    -- Commercial construction codes (CC prefix)
    IF commercial_construction_id IS NOT NULL THEN
        UPDATE cost_codes SET industry_id = commercial_construction_id WHERE code LIKE 'CC%';
    END IF;

    -- Residential construction codes (RC prefix)
    IF residential_construction_id IS NOT NULL THEN
        UPDATE cost_codes SET industry_id = residential_construction_id WHERE code LIKE 'RC%';
    END IF;

    -- Home services codes (HS prefix)
    IF home_services_id IS NOT NULL THEN
        UPDATE cost_codes SET industry_id = home_services_id WHERE code LIKE 'HS%';
    END IF;

    -- Specialty trades codes (ST prefix)
    IF specialty_trades_id IS NOT NULL THEN
        UPDATE cost_codes SET industry_id = specialty_trades_id WHERE code LIKE 'ST%';
    END IF;

    -- Handle any remaining codes that don't match patterns
    -- Assign them to general construction as default
    IF general_construction_id IS NOT NULL THEN
        UPDATE cost_codes SET industry_id = general_construction_id 
        WHERE industry_id IS NULL;
    END IF;

END $$;

-- Add some logging to see what we updated
-- This will show up in the migration logs
DO $$
DECLARE
    total_codes INTEGER;
    codes_with_industry INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_codes FROM cost_codes;
    SELECT COUNT(*) INTO codes_with_industry FROM cost_codes WHERE industry_id IS NOT NULL;
    
    RAISE NOTICE 'Updated cost codes with industry associations:';
    RAISE NOTICE 'Total cost codes: %', total_codes;
    RAISE NOTICE 'Cost codes with industry_id: %', codes_with_industry;
END $$;