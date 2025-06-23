-- Create standard products for all industries
-- These are pre-built product templates that bundle common line items

-- First, let's create a temporary function to help create products with line items
CREATE OR REPLACE FUNCTION create_product_with_items(
    p_name TEXT,
    p_description TEXT,
    p_collection TEXT,
    p_price NUMERIC,
    p_unit TEXT,
    p_industry_id UUID,
    p_line_item_configs JSONB
) RETURNS UUID AS $$
DECLARE
    v_product_id UUID;
    v_line_item JSONB;
BEGIN
    -- Create the product
    INSERT INTO products (
        name,
        description,
        price,
        unit,
        type,
        category,
        status,
        is_base_product,
        user_id,
        organization_id,
        created_at,
        updated_at
    ) VALUES (
        p_name,
        p_description,
        p_price,
        p_unit,
        'service',
        p_collection,
        'active',
        true,
        '3d2c5387-fe36-48cd-ba52-d51d29375adc'::UUID,  -- Using existing user for now
        NULL,  -- Available to all organizations
        NOW(),
        NOW()
    ) RETURNING id INTO v_product_id;

    -- Create product_line_items for each line item
    FOR v_line_item IN SELECT * FROM jsonb_array_elements(p_line_item_configs)
    LOOP
        INSERT INTO product_line_items (
            product_id,
            line_item_id,
            quantity,
            unit,
            price
        )
        SELECT 
            v_product_id,
            li.id,
            (v_line_item->>'quantity')::NUMERIC,
            v_line_item->>'unit',
            (v_line_item->>'price')::NUMERIC
        FROM line_items li
        JOIN cost_codes cc ON li.cost_code_id = cc.id
        WHERE cc.industry_id = p_industry_id
        AND li.name = v_line_item->>'name';
    END LOOP;

    RETURN v_product_id;
END;
$$ LANGUAGE plpgsql;

-- CARPENTRY PRODUCTS
DO $$
DECLARE
    v_carpentry_id UUID;
BEGIN
    SELECT id INTO v_carpentry_id FROM industries WHERE name = 'Carpentry';

    -- Basic Deck Installation (8x10)
    PERFORM create_product_with_items(
        'Basic Deck Installation (8x10)',
        'Complete installation of 80 sq ft pressure-treated deck with standard railing',
        'residential',
        2850.00,
        'project',
        v_carpentry_id,
        '[
            {"name": "Journeyman Carpenter", "quantity": 16, "unit": "hour", "price": 55},
            {"name": "Apprentice Carpenter", "quantity": 16, "unit": "hour", "price": 35},
            {"name": "Pressure-Treated Lumber", "quantity": 320, "unit": "board_foot", "price": 1.25},
            {"name": "Deck Screws & Fasteners", "quantity": 10, "unit": "pound", "price": 8.50},
            {"name": "Concrete Footings", "quantity": 6, "unit": "each", "price": 25}
        ]'::jsonb
    );

    -- Kitchen Cabinet Installation
    PERFORM create_product_with_items(
        'Kitchen Cabinet Installation',
        'Professional installation of up to 15 linear feet of kitchen cabinets',
        'residential',
        1875.00,
        'project',
        v_carpentry_id,
        '[
            {"name": "Master Carpenter", "quantity": 8, "unit": "hour", "price": 75},
            {"name": "Journeyman Carpenter", "quantity": 8, "unit": "hour", "price": 55},
            {"name": "Cabinet Installation Hardware", "quantity": 1, "unit": "set", "price": 125},
            {"name": "Wood Shims & Fasteners", "quantity": 1, "unit": "bundle", "price": 45}
        ]'::jsonb
    );

    -- Custom Closet System
    PERFORM create_product_with_items(
        'Custom Closet System',
        'Design and installation of custom closet organizer system (up to 8ft wide)',
        'residential',
        2450.00,
        'project',
        v_carpentry_id,
        '[
            {"name": "Master Carpenter", "quantity": 12, "unit": "hour", "price": 75},
            {"name": "Closet System Materials", "quantity": 1, "unit": "system", "price": 850},
            {"name": "Installation Hardware", "quantity": 1, "unit": "kit", "price": 95}
        ]'::jsonb
    );

    -- Interior Door Installation
    PERFORM create_product_with_items(
        'Interior Door Installation',
        'Installation of pre-hung interior door including trim',
        'residential',
        385.00,
        'door',
        v_carpentry_id,
        '[
            {"name": "Journeyman Carpenter", "quantity": 3, "unit": "hour", "price": 55},
            {"name": "Door Installation Kit", "quantity": 1, "unit": "kit", "price": 35},
            {"name": "Wood Shims & Fasteners", "quantity": 1, "unit": "bundle", "price": 15}
        ]'::jsonb
    );

    -- Crown Molding Installation
    PERFORM create_product_with_items(
        'Crown Molding Installation',
        'Installation of crown molding per 100 linear feet',
        'residential',
        875.00,
        'per_100_lf',
        v_carpentry_id,
        '[
            {"name": "Master Carpenter", "quantity": 8, "unit": "hour", "price": 75},
            {"name": "Installation Supplies", "quantity": 1, "unit": "kit", "price": 75}
        ]'::jsonb
    );
END $$;

-- ELECTRICAL PRODUCTS
DO $$
DECLARE
    v_electrical_id UUID;
BEGIN
    SELECT id INTO v_electrical_id FROM industries WHERE name = 'Electrical';

    -- Whole House Surge Protector
    PERFORM create_product_with_items(
        'Whole House Surge Protector Installation',
        'Installation of whole house surge protection system at main panel',
        'residential',
        685.00,
        'project',
        v_electrical_id,
        '[
            {"name": "Master Electrician", "quantity": 2, "unit": "hour", "price": 95},
            {"name": "Surge Protector Device", "quantity": 1, "unit": "each", "price": 285},
            {"name": "Electrical Supplies", "quantity": 1, "unit": "kit", "price": 45}
        ]'::jsonb
    );

    -- Ceiling Fan Installation
    PERFORM create_product_with_items(
        'Ceiling Fan Installation',
        'Installation of ceiling fan with light kit (fan provided by customer)',
        'residential',
        325.00,
        'each',
        v_electrical_id,
        '[
            {"name": "Journeyman Electrician", "quantity": 2, "unit": "hour", "price": 75},
            {"name": "Fan-Rated Box", "quantity": 1, "unit": "each", "price": 35},
            {"name": "Wire Nuts & Supplies", "quantity": 1, "unit": "kit", "price": 15}
        ]'::jsonb
    );

    -- EV Charger Installation
    PERFORM create_product_with_items(
        'Level 2 EV Charger Installation',
        'Installation of 240V Level 2 EV charging station (up to 50ft from panel)',
        'residential',
        1875.00,
        'project',
        v_electrical_id,
        '[
            {"name": "Master Electrician", "quantity": 4, "unit": "hour", "price": 95},
            {"name": "Journeyman Electrician", "quantity": 4, "unit": "hour", "price": 75},
            {"name": "50A Circuit Breaker", "quantity": 1, "unit": "each", "price": 85},
            {"name": "6/3 NM Cable", "quantity": 50, "unit": "foot", "price": 4.25},
            {"name": "Electrical Supplies", "quantity": 1, "unit": "kit", "price": 125}
        ]'::jsonb
    );

    -- Recessed Lighting Package
    PERFORM create_product_with_items(
        'Recessed Lighting Package (6 lights)',
        'Installation of 6 LED recessed lights with dimmer switch',
        'residential',
        1285.00,
        'project',
        v_electrical_id,
        '[
            {"name": "Journeyman Electrician", "quantity": 6, "unit": "hour", "price": 75},
            {"name": "LED Recessed Light", "quantity": 6, "unit": "each", "price": 45},
            {"name": "Dimmer Switch", "quantity": 1, "unit": "each", "price": 65},
            {"name": "14/2 Romex Wire", "quantity": 100, "unit": "foot", "price": 0.85}
        ]'::jsonb
    );
END $$;

-- PLUMBING PRODUCTS
DO $$
DECLARE
    v_plumbing_id UUID;
BEGIN
    SELECT id INTO v_plumbing_id FROM industries WHERE name = 'Plumbing';

    -- Water Heater Replacement
    PERFORM create_product_with_items(
        'Water Heater Replacement (50 gal)',
        'Remove old and install new 50-gallon gas water heater',
        'residential',
        2485.00,
        'project',
        v_plumbing_id,
        '[
            {"name": "Master Plumber", "quantity": 3, "unit": "hour", "price": 125},
            {"name": "Journeyman Plumber", "quantity": 3, "unit": "hour", "price": 85},
            {"name": "50 Gal Water Heater", "quantity": 1, "unit": "each", "price": 850},
            {"name": "Water Heater Installation Kit", "quantity": 1, "unit": "kit", "price": 185},
            {"name": "Disposal Fee", "quantity": 1, "unit": "each", "price": 75}
        ]'::jsonb
    );

    -- Toilet Installation
    PERFORM create_product_with_items(
        'Toilet Installation',
        'Remove old toilet and install new (toilet provided by customer)',
        'residential',
        385.00,
        'each',
        v_plumbing_id,
        '[
            {"name": "Journeyman Plumber", "quantity": 2, "unit": "hour", "price": 85},
            {"name": "Wax Ring & Bolts", "quantity": 1, "unit": "kit", "price": 25},
            {"name": "Supply Line", "quantity": 1, "unit": "each", "price": 18},
            {"name": "Disposal Fee", "quantity": 1, "unit": "each", "price": 35}
        ]'::jsonb
    );

    -- Kitchen Faucet Installation
    PERFORM create_product_with_items(
        'Kitchen Faucet Installation',
        'Installation of kitchen faucet (faucet provided by customer)',
        'residential',
        285.00,
        'each',
        v_plumbing_id,
        '[
            {"name": "Journeyman Plumber", "quantity": 1.5, "unit": "hour", "price": 85},
            {"name": "Supply Lines", "quantity": 2, "unit": "each", "price": 15},
            {"name": "Plumbers Putty", "quantity": 1, "unit": "each", "price": 8}
        ]'::jsonb
    );

    -- Garbage Disposal Installation
    PERFORM create_product_with_items(
        'Garbage Disposal Installation',
        'Installation of garbage disposal unit (unit provided by customer)',
        'residential',
        325.00,
        'each',
        v_plumbing_id,
        '[
            {"name": "Journeyman Plumber", "quantity": 2, "unit": "hour", "price": 85},
            {"name": "Disposal Installation Kit", "quantity": 1, "unit": "kit", "price": 45},
            {"name": "Electrical Work", "quantity": 0.5, "unit": "hour", "price": 75}
        ]'::jsonb
    );
END $$;

-- HVAC PRODUCTS
DO $$
DECLARE
    v_hvac_id UUID;
BEGIN
    SELECT id INTO v_hvac_id FROM industries WHERE name = 'HVAC';

    -- AC Tune-Up Service
    PERFORM create_product_with_items(
        'AC Tune-Up & Maintenance',
        'Comprehensive AC system inspection, cleaning, and tune-up',
        'residential',
        285.00,
        'service',
        v_hvac_id,
        '[
            {"name": "HVAC Technician", "quantity": 1.5, "unit": "hour", "price": 95},
            {"name": "Refrigerant (up to 2 lbs)", "quantity": 2, "unit": "pound", "price": 35},
            {"name": "Filter", "quantity": 1, "unit": "each", "price": 25}
        ]'::jsonb
    );

    -- Ductless Mini-Split Installation
    PERFORM create_product_with_items(
        'Ductless Mini-Split Installation',
        'Installation of single-zone ductless mini-split system',
        'residential',
        4850.00,
        'project',
        v_hvac_id,
        '[
            {"name": "HVAC Lead Technician", "quantity": 8, "unit": "hour", "price": 125},
            {"name": "HVAC Technician", "quantity": 8, "unit": "hour", "price": 95},
            {"name": "Mini-Split System", "quantity": 1, "unit": "system", "price": 1850},
            {"name": "Line Set & Accessories", "quantity": 1, "unit": "kit", "price": 385},
            {"name": "Electrical Disconnect", "quantity": 1, "unit": "each", "price": 125}
        ]'::jsonb
    );

    -- Furnace Maintenance
    PERFORM create_product_with_items(
        'Furnace Tune-Up & Safety Check',
        'Complete furnace inspection, cleaning, and safety check',
        'residential',
        245.00,
        'service',
        v_hvac_id,
        '[
            {"name": "HVAC Technician", "quantity": 1.5, "unit": "hour", "price": 95},
            {"name": "Furnace Filter", "quantity": 1, "unit": "each", "price": 35}
        ]'::jsonb
    );

    -- Smart Thermostat Installation
    PERFORM create_product_with_items(
        'Smart Thermostat Installation',
        'Installation and setup of WiFi smart thermostat',
        'residential',
        385.00,
        'each',
        v_hvac_id,
        '[
            {"name": "HVAC Technician", "quantity": 1, "unit": "hour", "price": 95},
            {"name": "Smart Thermostat", "quantity": 1, "unit": "each", "price": 225}
        ]'::jsonb
    );
END $$;

-- PAINTING PRODUCTS
DO $$
DECLARE
    v_painting_id UUID;
BEGIN
    SELECT id INTO v_painting_id FROM industries WHERE name = 'Painting';

    -- Interior Room Painting
    PERFORM create_product_with_items(
        'Interior Room Painting (12x12)',
        'Complete painting of 12x12 room - walls and ceiling, 2 coats',
        'residential',
        875.00,
        'room',
        v_painting_id,
        '[
            {"name": "Lead Painter", "quantity": 6, "unit": "hour", "price": 65},
            {"name": "Painter", "quantity": 6, "unit": "hour", "price": 45},
            {"name": "Premium Paint", "quantity": 3, "unit": "gallon", "price": 55},
            {"name": "Primer", "quantity": 1, "unit": "gallon", "price": 35},
            {"name": "Painting Supplies", "quantity": 1, "unit": "kit", "price": 45}
        ]'::jsonb
    );

    -- Exterior House Painting
    PERFORM create_product_with_items(
        'Exterior House Painting (per 1000 sq ft)',
        'Complete exterior painting including prep work',
        'residential',
        3250.00,
        'per_1000_sqft',
        v_painting_id,
        '[
            {"name": "Lead Painter", "quantity": 24, "unit": "hour", "price": 65},
            {"name": "Painter", "quantity": 24, "unit": "hour", "price": 45},
            {"name": "Exterior Paint", "quantity": 10, "unit": "gallon", "price": 65},
            {"name": "Primer", "quantity": 3, "unit": "gallon", "price": 45},
            {"name": "Prep Materials", "quantity": 1, "unit": "kit", "price": 125}
        ]'::jsonb
    );

    -- Cabinet Painting
    PERFORM create_product_with_items(
        'Kitchen Cabinet Painting',
        'Professional painting of kitchen cabinets (up to 20 doors/drawers)',
        'residential',
        2850.00,
        'project',
        v_painting_id,
        '[
            {"name": "Lead Painter", "quantity": 16, "unit": "hour", "price": 65},
            {"name": "Painter", "quantity": 16, "unit": "hour", "price": 45},
            {"name": "Cabinet Paint", "quantity": 3, "unit": "gallon", "price": 85},
            {"name": "Primer", "quantity": 2, "unit": "gallon", "price": 65},
            {"name": "Sanding Supplies", "quantity": 1, "unit": "kit", "price": 85}
        ]'::jsonb
    );
END $$;

-- LANDSCAPING PRODUCTS
DO $$
DECLARE
    v_landscaping_id UUID;
BEGIN
    SELECT id INTO v_landscaping_id FROM industries WHERE name = 'Landscaping';

    -- Basic Lawn Care Package
    PERFORM create_product_with_items(
        'Monthly Lawn Care Package',
        'Weekly mowing, edging, and cleanup for properties up to 1/4 acre',
        'residential',
        185.00,
        'month',
        v_landscaping_id,
        '[
            {"name": "Crew Leader", "quantity": 4, "unit": "hour", "price": 35},
            {"name": "Landscaper", "quantity": 4, "unit": "hour", "price": 25}
        ]'::jsonb
    );

    -- Spring Cleanup
    PERFORM create_product_with_items(
        'Spring Cleanup Service',
        'Complete spring cleanup including leaf removal, bed edging, and mulch',
        'residential',
        685.00,
        'project',
        v_landscaping_id,
        '[
            {"name": "Crew Leader", "quantity": 8, "unit": "hour", "price": 35},
            {"name": "Landscaper", "quantity": 16, "unit": "hour", "price": 25},
            {"name": "Disposal Fees", "quantity": 1, "unit": "load", "price": 85}
        ]'::jsonb
    );

    -- Mulch Installation
    PERFORM create_product_with_items(
        'Mulch Installation (per cubic yard)',
        'Delivery and installation of premium hardwood mulch',
        'residential',
        125.00,
        'cubic_yard',
        v_landscaping_id,
        '[
            {"name": "Landscaper", "quantity": 1, "unit": "hour", "price": 25},
            {"name": "Premium Mulch", "quantity": 1, "unit": "cubic_yard", "price": 45}
        ]'::jsonb
    );

    -- Sod Installation
    PERFORM create_product_with_items(
        'Sod Installation (per 1000 sq ft)',
        'Complete sod installation including ground prep',
        'residential',
        875.00,
        'per_1000_sqft',
        v_landscaping_id,
        '[
            {"name": "Crew Leader", "quantity": 6, "unit": "hour", "price": 35},
            {"name": "Landscaper", "quantity": 12, "unit": "hour", "price": 25},
            {"name": "Premium Sod", "quantity": 1000, "unit": "sqft", "price": 0.35},
            {"name": "Soil Amendment", "quantity": 2, "unit": "cubic_yard", "price": 45}
        ]'::jsonb
    );
END $$;

-- ROOFING PRODUCTS
DO $$
DECLARE
    v_roofing_id UUID;
BEGIN
    SELECT id INTO v_roofing_id FROM industries WHERE name = 'Roofing';

    -- Roof Repair Service
    PERFORM create_product_with_items(
        'Emergency Roof Repair',
        'Emergency repair service for leaks and storm damage (up to 100 sq ft)',
        'residential',
        875.00,
        'project',
        v_roofing_id,
        '[
            {"name": "Roofing Foreman", "quantity": 3, "unit": "hour", "price": 75},
            {"name": "Roofer", "quantity": 3, "unit": "hour", "price": 55},
            {"name": "Shingles", "quantity": 1, "unit": "square", "price": 125},
            {"name": "Underlayment & Supplies", "quantity": 1, "unit": "kit", "price": 85}
        ]'::jsonb
    );

    -- Gutter Installation
    PERFORM create_product_with_items(
        'Seamless Gutter Installation',
        'Installation of seamless aluminum gutters (per 100 linear feet)',
        'residential',
        1285.00,
        'per_100_lf',
        v_roofing_id,
        '[
            {"name": "Gutter Specialist", "quantity": 8, "unit": "hour", "price": 65},
            {"name": "Helper", "quantity": 8, "unit": "hour", "price": 35},
            {"name": "Seamless Gutter Material", "quantity": 100, "unit": "linear_foot", "price": 4.50},
            {"name": "Hangers & Hardware", "quantity": 1, "unit": "kit", "price": 125}
        ]'::jsonb
    );

    -- Roof Inspection
    PERFORM create_product_with_items(
        'Comprehensive Roof Inspection',
        'Detailed roof inspection with written report and photos',
        'residential',
        285.00,
        'inspection',
        v_roofing_id,
        '[
            {"name": "Roofing Inspector", "quantity": 2, "unit": "hour", "price": 85},
            {"name": "Inspection Report", "quantity": 1, "unit": "each", "price": 45}
        ]'::jsonb
    );
END $$;

-- FLOORING PRODUCTS
DO $$
DECLARE
    v_flooring_id UUID;
BEGIN
    SELECT id INTO v_flooring_id FROM industries WHERE name = 'Flooring';

    -- Luxury Vinyl Plank Installation
    PERFORM create_product_with_items(
        'LVP Flooring Installation',
        'Installation of luxury vinyl plank flooring (per 100 sq ft)',
        'residential',
        785.00,
        'per_100_sqft',
        v_flooring_id,
        '[
            {"name": "Lead Installer", "quantity": 4, "unit": "hour", "price": 65},
            {"name": "Flooring Installer", "quantity": 4, "unit": "hour", "price": 45},
            {"name": "Underlayment", "quantity": 100, "unit": "sqft", "price": 0.45},
            {"name": "Transitions & Trim", "quantity": 1, "unit": "kit", "price": 85}
        ]'::jsonb
    );

    -- Hardwood Refinishing
    PERFORM create_product_with_items(
        'Hardwood Floor Refinishing',
        'Sand and refinish hardwood floors (per 100 sq ft)',
        'residential',
        485.00,
        'per_100_sqft',
        v_flooring_id,
        '[
            {"name": "Hardwood Specialist", "quantity": 3, "unit": "hour", "price": 75},
            {"name": "Floor Finisher", "quantity": 3, "unit": "hour", "price": 55},
            {"name": "Stain & Finish", "quantity": 1, "unit": "kit", "price": 125}
        ]'::jsonb
    );

    -- Tile Installation
    PERFORM create_product_with_items(
        'Ceramic Tile Installation',
        'Installation of ceramic tile flooring (per 100 sq ft)',
        'residential',
        1285.00,
        'per_100_sqft',
        v_flooring_id,
        '[
            {"name": "Tile Setter", "quantity": 8, "unit": "hour", "price": 75},
            {"name": "Helper", "quantity": 8, "unit": "hour", "price": 35},
            {"name": "Thinset & Grout", "quantity": 1, "unit": "kit", "price": 185},
            {"name": "Tile Spacers & Tools", "quantity": 1, "unit": "kit", "price": 45}
        ]'::jsonb
    );
END $$;

-- SOLAR PRODUCTS
DO $$
DECLARE
    v_solar_id UUID;
BEGIN
    SELECT id INTO v_solar_id FROM industries WHERE name = 'Solar';

    -- Solar Consultation Package
    PERFORM create_product_with_items(
        'Solar Feasibility Study',
        'Comprehensive solar analysis including shading, production estimates, and ROI',
        'residential',
        485.00,
        'study',
        v_solar_id,
        '[
            {"name": "Solar Consultant", "quantity": 3, "unit": "hour", "price": 95},
            {"name": "Site Analysis Report", "quantity": 1, "unit": "each", "price": 125}
        ]'::jsonb
    );

    -- Solar Panel Cleaning
    PERFORM create_product_with_items(
        'Solar Panel Cleaning Service',
        'Professional cleaning of solar panel system (up to 20 panels)',
        'residential',
        285.00,
        'service',
        v_solar_id,
        '[
            {"name": "Solar Technician", "quantity": 2, "unit": "hour", "price": 65},
            {"name": "Cleaning Supplies", "quantity": 1, "unit": "kit", "price": 35}
        ]'::jsonb
    );

    -- Solar Monitoring Setup
    PERFORM create_product_with_items(
        'Solar Monitoring System Setup',
        'Installation and configuration of solar production monitoring',
        'residential',
        685.00,
        'project',
        v_solar_id,
        '[
            {"name": "Solar Technician", "quantity": 3, "unit": "hour", "price": 85},
            {"name": "Monitoring Equipment", "quantity": 1, "unit": "kit", "price": 285}
        ]'::jsonb
    );
END $$;

-- PEST CONTROL PRODUCTS
DO $$
DECLARE
    v_pest_control_id UUID;
BEGIN
    SELECT id INTO v_pest_control_id FROM industries WHERE name = 'Pest Control';

    -- Initial Pest Treatment
    PERFORM create_product_with_items(
        'Initial Pest Control Treatment',
        'Comprehensive initial treatment for common household pests',
        'residential',
        285.00,
        'treatment',
        v_pest_control_id,
        '[
            {"name": "Lead Technician", "quantity": 1.5, "unit": "hour", "price": 65},
            {"name": "Pest Control Products", "quantity": 1, "unit": "treatment", "price": 85}
        ]'::jsonb
    );

    -- Quarterly Service Plan
    PERFORM create_product_with_items(
        'Quarterly Pest Prevention',
        'Preventive pest control service (per quarter)',
        'residential',
        145.00,
        'service',
        v_pest_control_id,
        '[
            {"name": "Pest Technician", "quantity": 1, "unit": "hour", "price": 55},
            {"name": "Prevention Products", "quantity": 1, "unit": "application", "price": 45}
        ]'::jsonb
    );

    -- Termite Inspection
    PERFORM create_product_with_items(
        'Termite Inspection',
        'Complete termite inspection with written report',
        'residential',
        185.00,
        'inspection',
        v_pest_control_id,
        '[
            {"name": "Termite Specialist", "quantity": 1.5, "unit": "hour", "price": 75},
            {"name": "Inspection Report", "quantity": 1, "unit": "each", "price": 35}
        ]'::jsonb
    );
END $$;

-- GENERAL CONSTRUCTION PRODUCTS
DO $$
DECLARE
    v_general_id UUID;
BEGIN
    SELECT id INTO v_general_id FROM industries WHERE name = 'General Construction';

    -- Bathroom Remodel
    PERFORM create_product_with_items(
        'Basic Bathroom Remodel',
        'Complete bathroom renovation (5x8 bathroom)',
        'residential',
        12850.00,
        'project',
        v_general_id,
        '[
            {"name": "Project Manager", "quantity": 16, "unit": "hour", "price": 125},
            {"name": "General Contractor", "quantity": 80, "unit": "hour", "price": 85},
            {"name": "Skilled Laborer", "quantity": 80, "unit": "hour", "price": 55},
            {"name": "Permits", "quantity": 1, "unit": "set", "price": 485},
            {"name": "Dumpster Rental", "quantity": 1, "unit": "week", "price": 385}
        ]'::jsonb
    );

    -- Basement Finishing
    PERFORM create_product_with_items(
        'Basement Finishing (per 100 sq ft)',
        'Complete basement finishing including framing, drywall, and basic electrical',
        'residential',
        4850.00,
        'per_100_sqft',
        v_general_id,
        '[
            {"name": "General Contractor", "quantity": 40, "unit": "hour", "price": 85},
            {"name": "Skilled Laborer", "quantity": 40, "unit": "hour", "price": 55},
            {"name": "Framing Materials", "quantity": 1, "unit": "package", "price": 685},
            {"name": "Drywall & Finishing", "quantity": 1, "unit": "package", "price": 485},
            {"name": "Basic Electrical", "quantity": 1, "unit": "package", "price": 385}
        ]'::jsonb
    );

    -- Home Addition Planning
    PERFORM create_product_with_items(
        'Home Addition Design & Permits',
        'Architectural design and permit acquisition for home addition',
        'residential',
        5850.00,
        'project',
        v_general_id,
        '[
            {"name": "Project Manager", "quantity": 20, "unit": "hour", "price": 125},
            {"name": "Architectural Services", "quantity": 1, "unit": "design", "price": 2850},
            {"name": "Permit Expediting", "quantity": 1, "unit": "service", "price": 485}
        ]'::jsonb
    );
END $$;

-- Create a function to get products by industry (similar to line items)
CREATE OR REPLACE FUNCTION get_organization_products(p_organization_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    price NUMERIC,
    unit TEXT,
    type TEXT,
    category TEXT,
    status TEXT,
    is_base_product BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    item_count BIGINT,
    total_cost NUMERIC,
    margin_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH org_industries AS (
        SELECT industry_id 
        FROM organization_industries 
        WHERE organization_id = p_organization_id
    ),
    industry_products AS (
        SELECT DISTINCT p.*
        FROM products p
        LEFT JOIN product_line_items pli ON p.id = pli.product_id
        LEFT JOIN line_items li ON pli.line_item_id = li.id
        LEFT JOIN cost_codes cc ON li.cost_code_id = cc.id
        WHERE (
            -- System-level products
            (p.organization_id IS NULL AND p.is_base_product = true)
            -- Or organization's own products
            OR p.organization_id = p_organization_id
        )
        -- Filter system products by industry
        AND (
            p.organization_id = p_organization_id
            OR cc.industry_id IN (SELECT industry_id FROM org_industries)
            OR NOT EXISTS (SELECT 1 FROM product_line_items WHERE product_id = p.id)
        )
    )
    SELECT 
        ip.id,
        ip.name,
        ip.description,
        ip.price,
        ip.unit,
        ip.type,
        ip.category,
        ip.status,
        ip.is_base_product,
        ip.created_at,
        ip.updated_at,
        COUNT(pli.id) as item_count,
        COALESCE(SUM(pli.quantity * pli.price), 0) as total_cost,
        CASE 
            WHEN COALESCE(SUM(pli.quantity * pli.price), 0) > 0 
            THEN ((ip.price - COALESCE(SUM(pli.quantity * pli.price), 0)) / ip.price) * 100
            ELSE 100
        END as margin_percentage
    FROM industry_products ip
    LEFT JOIN product_line_items pli ON ip.id = pli.product_id
    GROUP BY ip.id, ip.name, ip.description, ip.price, ip.unit, ip.type, 
             ip.category, ip.status, ip.is_base_product, ip.created_at, ip.updated_at
    ORDER BY ip.name;
END;
$$ LANGUAGE plpgsql;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS create_product_with_items;