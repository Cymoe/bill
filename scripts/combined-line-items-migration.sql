-- Combined migration to add template line items for multiple industries
-- Run this in Supabase SQL Editor to add all line items at once

-- First, let's check what industries and cost codes we have
DO $$
BEGIN
    RAISE NOTICE 'Starting line items migration for multiple industries...';
END $$;

-- Add Roofing line items
DO $$
DECLARE
    roofing_industry_id UUID;
    cost_code_record RECORD;
BEGIN
    -- Get Roofing industry ID
    SELECT id INTO roofing_industry_id FROM industries WHERE name = 'Roofing';
    
    IF roofing_industry_id IS NULL THEN
        RAISE NOTICE 'Roofing industry not found, skipping...';
    ELSE
        RAISE NOTICE 'Adding line items for Roofing industry...';
        
        -- Add materials for each cost code
        FOR cost_code_record IN 
            SELECT id, code FROM cost_codes 
            WHERE industry_id = roofing_industry_id 
            AND organization_id IS NULL
        LOOP
            -- Add items based on cost code
            CASE cost_code_record.code
                WHEN '36.01' THEN -- Asphalt Shingle Roofing
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('3-Tab Asphalt Shingles', 'Standard 3-tab asphalt shingles, 33.3 sq ft per bundle', 28.00, 'bundle', 'material', cost_code_record.id, roofing_industry_id, NULL),
                        ('Architectural Shingles', 'Dimensional architectural shingles, 33.3 sq ft per bundle', 35.00, 'bundle', 'material', cost_code_record.id, roofing_industry_id, NULL),
                        ('15lb Roofing Felt', 'Standard 15lb felt underlayment, 400 sq ft roll', 25.00, 'roll', 'material', cost_code_record.id, roofing_industry_id, NULL),
                        ('Ice & Water Shield', 'Self-adhering ice and water barrier, 200 sq ft roll', 95.00, 'roll', 'material', cost_code_record.id, roofing_industry_id, NULL),
                        ('Drip Edge - Aluminum', 'Aluminum drip edge, 10 ft length', 8.50, 'piece', 'material', cost_code_record.id, roofing_industry_id, NULL),
                        ('Ridge Cap Shingles', 'Pre-cut ridge cap shingles, 25 lin ft per bundle', 42.00, 'bundle', 'material', cost_code_record.id, roofing_industry_id, NULL),
                        ('Roofing Nails - 1.25"', 'Galvanized roofing nails, 1.25 inch, 50lb box', 65.00, 'box', 'material', cost_code_record.id, roofing_industry_id, NULL);
                        
                WHEN '36.03' THEN -- Metal Roofing
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('Standing Seam Panel - 24"', '24" standing seam metal panel, 12 ft length', 85.00, 'panel', 'material', cost_code_record.id, roofing_industry_id, NULL),
                        ('Corrugated Metal Panel', 'Corrugated metal roofing panel, 8 ft length', 32.00, 'panel', 'material', cost_code_record.id, roofing_industry_id, NULL),
                        ('Metal Ridge Cap', 'Pre-formed metal ridge cap, 10 ft length', 45.00, 'piece', 'material', cost_code_record.id, roofing_industry_id, NULL);
                        
                WHEN '36.00' THEN -- General Roofing Labor
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('Roofer - Lead', 'Lead roofer/foreman hourly rate', 85.00, 'hour', 'labor', cost_code_record.id, roofing_industry_id, NULL),
                        ('Roofer - Journeyman', 'Experienced roofer hourly rate', 65.00, 'hour', 'labor', cost_code_record.id, roofing_industry_id, NULL),
                        ('Shingle Installation', 'Labor to install asphalt shingles', 75.00, 'square', 'labor', cost_code_record.id, roofing_industry_id, NULL);
                ELSE
                    -- Skip other codes for brevity
                    NULL;
            END CASE;
        END LOOP;
        
        RAISE NOTICE 'Roofing line items added successfully';
    END IF;
END $$;

-- Add Electrical line items
DO $$
DECLARE
    electrical_industry_id UUID;
    cost_code_record RECORD;
BEGIN
    -- Get Electrical industry ID
    SELECT id INTO electrical_industry_id FROM industries WHERE name = 'Electrical';
    
    IF electrical_industry_id IS NULL THEN
        RAISE NOTICE 'Electrical industry not found, skipping...';
    ELSE
        RAISE NOTICE 'Adding line items for Electrical industry...';
        
        -- Add materials for each cost code
        FOR cost_code_record IN 
            SELECT id, code FROM cost_codes 
            WHERE industry_id = electrical_industry_id 
            AND organization_id IS NULL
        LOOP
            -- Add items based on cost code
            CASE cost_code_record.code
                WHEN '52.01' THEN -- Wire and Cable
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('12 AWG THHN Wire - Black', '12 gauge THHN stranded copper wire, 500ft spool', 125.00, 'spool', 'material', cost_code_record.id, electrical_industry_id, NULL),
                        ('14 AWG THHN Wire - Black', '14 gauge THHN stranded copper wire, 500ft spool', 85.00, 'spool', 'material', cost_code_record.id, electrical_industry_id, NULL),
                        ('12-2 Romex NM-B', '12-2 with ground non-metallic cable, 250ft coil', 185.00, 'coil', 'material', cost_code_record.id, electrical_industry_id, NULL),
                        ('14-2 Romex NM-B', '14-2 with ground non-metallic cable, 250ft coil', 125.00, 'coil', 'material', cost_code_record.id, electrical_industry_id, NULL);
                        
                WHEN '52.02' THEN -- Devices and Fixtures
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('Single Pole Switch', '15A single pole switch, commercial grade', 8.50, 'each', 'material', cost_code_record.id, electrical_industry_id, NULL),
                        ('Duplex Receptacle - 15A', '15A 125V duplex receptacle, commercial grade', 6.50, 'each', 'material', cost_code_record.id, electrical_industry_id, NULL),
                        ('GFCI Receptacle', '20A GFCI receptacle with LED indicator', 22.00, 'each', 'material', cost_code_record.id, electrical_industry_id, NULL);
                        
                WHEN '52.00' THEN -- General Electrical Labor
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('Master Electrician', 'Master electrician hourly rate', 125.00, 'hour', 'labor', cost_code_record.id, electrical_industry_id, NULL),
                        ('Journeyman Electrician', 'Journeyman electrician hourly rate', 85.00, 'hour', 'labor', cost_code_record.id, electrical_industry_id, NULL);
                ELSE
                    -- Skip other codes for brevity
                    NULL;
            END CASE;
        END LOOP;
        
        RAISE NOTICE 'Electrical line items added successfully';
    END IF;
END $$;

-- Add Plumbing line items
DO $$
DECLARE
    plumbing_industry_id UUID;
    cost_code_record RECORD;
BEGIN
    -- Get Plumbing industry ID
    SELECT id INTO plumbing_industry_id FROM industries WHERE name = 'Plumbing';
    
    IF plumbing_industry_id IS NULL THEN
        RAISE NOTICE 'Plumbing industry not found, skipping...';
    ELSE
        RAISE NOTICE 'Adding line items for Plumbing industry...';
        
        -- Add materials for each cost code
        FOR cost_code_record IN 
            SELECT id, code FROM cost_codes 
            WHERE industry_id = plumbing_industry_id 
            AND organization_id IS NULL
        LOOP
            -- Add items based on cost code
            CASE cost_code_record.code
                WHEN '61.10' THEN -- Pipes and Fittings
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('1/2" Copper Pipe Type M', '1/2 inch copper pipe Type M, 10ft length', 28.00, 'stick', 'material', cost_code_record.id, plumbing_industry_id, NULL),
                        ('3/4" Copper Pipe Type M', '3/4 inch copper pipe Type M, 10ft length', 42.00, 'stick', 'material', cost_code_record.id, plumbing_industry_id, NULL),
                        ('1/2" PEX-A Red', '1/2 inch PEX-A tubing red, 100ft coil', 65.00, 'coil', 'material', cost_code_record.id, plumbing_industry_id, NULL),
                        ('1-1/2" PVC Schedule 40', '1-1/2 inch PVC pipe Schedule 40, 10ft length', 8.50, 'stick', 'material', cost_code_record.id, plumbing_industry_id, NULL);
                        
                WHEN '61.30' THEN -- Fixtures
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('Standard Toilet - Round', 'Standard height round bowl toilet, 1.6 GPF', 125.00, 'each', 'material', cost_code_record.id, plumbing_industry_id, NULL),
                        ('Kitchen Sink - Single Bowl', 'Stainless steel single bowl kitchen sink', 185.00, 'each', 'material', cost_code_record.id, plumbing_industry_id, NULL),
                        ('Kitchen Faucet - Standard', 'Single handle kitchen faucet with sprayer', 125.00, 'each', 'material', cost_code_record.id, plumbing_industry_id, NULL);
                        
                WHEN '61.00' THEN -- General Plumbing Labor
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('Master Plumber', 'Master plumber hourly rate', 125.00, 'hour', 'labor', cost_code_record.id, plumbing_industry_id, NULL),
                        ('Journeyman Plumber', 'Journeyman plumber hourly rate', 85.00, 'hour', 'labor', cost_code_record.id, plumbing_industry_id, NULL);
                ELSE
                    -- Skip other codes for brevity
                    NULL;
            END CASE;
        END LOOP;
        
        RAISE NOTICE 'Plumbing line items added successfully';
    END IF;
END $$;

-- Add HVAC line items
DO $$
DECLARE
    hvac_industry_id UUID;
    cost_code_record RECORD;
BEGIN
    -- Get HVAC industry ID
    SELECT id INTO hvac_industry_id FROM industries WHERE name = 'HVAC';
    
    IF hvac_industry_id IS NULL THEN
        RAISE NOTICE 'HVAC industry not found, skipping...';
    ELSE
        RAISE NOTICE 'Adding line items for HVAC industry...';
        
        -- Add materials for each cost code
        FOR cost_code_record IN 
            SELECT id, code FROM cost_codes 
            WHERE industry_id = hvac_industry_id 
            AND organization_id IS NULL
        LOOP
            -- Add items based on cost code
            CASE cost_code_record.code
                WHEN '71.10' THEN -- Equipment
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('2 Ton AC Unit', '2 ton 14 SEER air conditioner condenser', 1485.00, 'each', 'material', cost_code_record.id, hvac_industry_id, NULL),
                        ('3 Ton AC Unit', '3 ton 14 SEER air conditioner condenser', 1885.00, 'each', 'material', cost_code_record.id, hvac_industry_id, NULL),
                        ('80K BTU Gas Furnace', '80,000 BTU 80% efficiency gas furnace', 985.00, 'each', 'material', cost_code_record.id, hvac_industry_id, NULL);
                        
                WHEN '71.20' THEN -- Ductwork
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('8x8 Metal Duct', '8x8 inch rectangular metal duct, 5ft section', 28.00, 'section', 'material', cost_code_record.id, hvac_industry_id, NULL),
                        ('6" Flex Duct R6', '6 inch R6 insulated flexible duct, 25ft', 42.00, 'box', 'material', cost_code_record.id, hvac_industry_id, NULL),
                        ('4x10 Floor Register', '4x10 inch steel floor register', 8.50, 'each', 'material', cost_code_record.id, hvac_industry_id, NULL);
                        
                WHEN '71.00' THEN -- General HVAC Labor
                    INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id)
                    VALUES 
                        ('HVAC Lead Technician', 'Lead HVAC technician hourly rate', 125.00, 'hour', 'labor', cost_code_record.id, hvac_industry_id, NULL),
                        ('HVAC Journeyman', 'Journeyman HVAC technician hourly rate', 85.00, 'hour', 'labor', cost_code_record.id, hvac_industry_id, NULL);
                ELSE
                    -- Skip other codes for brevity
                    NULL;
            END CASE;
        END LOOP;
        
        RAISE NOTICE 'HVAC line items added successfully';
    END IF;
END $$;

-- Final summary
DO $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM line_items WHERE organization_id IS NULL;
    RAISE NOTICE 'Migration complete! Total template line items: %', total_count;
END $$;