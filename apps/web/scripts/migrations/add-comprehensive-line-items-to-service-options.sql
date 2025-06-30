-- Add comprehensive line items to service options
-- This ensures each service option has ALL necessary materials and labor for a complete job

-- =====================================================
-- CARPENTRY - CROWN MOLDING SERVICE OPTIONS
-- =====================================================

-- First, let's create a temporary function to help us find line items
CREATE OR REPLACE FUNCTION find_line_item_id(item_name text)
RETURNS uuid AS $$
    SELECT id FROM line_items 
    WHERE name = item_name 
    AND organization_id IS NULL 
    LIMIT 1;
$$ LANGUAGE SQL;

-- Crown Molding - Simple (per linear foot)
DO $$
DECLARE
    option_id uuid;
BEGIN
    -- Get the service option ID
    SELECT id INTO option_id FROM service_options 
    WHERE name = 'Crown Molding - Simple' 
    AND organization_id IS NULL;
    
    IF option_id IS NOT NULL THEN
        -- Delete existing items to start fresh
        DELETE FROM service_option_items WHERE service_option_id = option_id;
        
        -- Labor (proportional to linear foot)
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
        SELECT option_id, find_line_item_id('Finish Carpenter'), 0.1  -- 6 minutes per linear foot
        WHERE find_line_item_id('Finish Carpenter') IS NOT NULL;
        
        -- Materials
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity) VALUES
        (option_id, find_line_item_id('Crown Molding - Standard'), 1.05),  -- 5% waste
        (option_id, find_line_item_id('Finish Nails'), 0.1),  -- 1/10 box per linear foot
        (option_id, find_line_item_id('Wood Glue'), 0.02),  -- Small amount per foot
        (option_id, find_line_item_id('Caulk'), 0.05),  -- For gaps
        (option_id, find_line_item_id('Sandpaper'), 0.01),  -- For smoothing
        (option_id, find_line_item_id('Wood Filler'), 0.02);  -- For nail holes
        
        -- Update the price based on actual line items
        UPDATE service_options 
        SET price = (
            SELECT COALESCE(SUM(li.price * soi.quantity), 0)
            FROM service_option_items soi
            JOIN line_items li ON soi.line_item_id = li.id
            WHERE soi.service_option_id = option_id
        )
        WHERE id = option_id;
    END IF;
END $$;

-- Crown Molding - Complex (per linear foot)
DO $$
DECLARE
    option_id uuid;
BEGIN
    SELECT id INTO option_id FROM service_options 
    WHERE name = 'Crown Molding - Complex' 
    AND organization_id IS NULL;
    
    IF option_id IS NOT NULL THEN
        DELETE FROM service_option_items WHERE service_option_id = option_id;
        
        -- More labor for complex work
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
        SELECT option_id, find_line_item_id('Master Carpenter'), 0.15  -- 9 minutes per linear foot
        WHERE find_line_item_id('Master Carpenter') IS NOT NULL;
        
        -- Premium materials and more supplies
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity) VALUES
        (option_id, find_line_item_id('Crown Molding - Premium'), 1.1),  -- 10% waste for complex cuts
        (option_id, find_line_item_id('Finish Nails'), 0.15),  -- More nails for complex work
        (option_id, find_line_item_id('Wood Glue'), 0.03),
        (option_id, find_line_item_id('Caulk'), 0.08),  -- More gaps to fill
        (option_id, find_line_item_id('Sandpaper'), 0.02),
        (option_id, find_line_item_id('Wood Filler'), 0.03),
        (option_id, find_line_item_id('Corner Blocks'), 0.05);  -- For complex corners
        
        UPDATE service_options 
        SET price = (
            SELECT COALESCE(SUM(li.price * soi.quantity), 0)
            FROM service_option_items soi
            JOIN line_items li ON soi.line_item_id = li.id
            WHERE soi.service_option_id = option_id
        )
        WHERE id = option_id;
    END IF;
END $$;

-- =====================================================
-- PAINTING - COMPREHENSIVE LINE ITEMS
-- =====================================================

-- Paint Interior Door - Basic
DO $$
DECLARE
    option_id uuid;
BEGIN
    SELECT id INTO option_id FROM service_options 
    WHERE name = 'Paint Interior Door - Basic' 
    AND organization_id IS NULL;
    
    IF option_id IS NOT NULL THEN
        DELETE FROM service_option_items WHERE service_option_id = option_id;
        
        -- Labor
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
        SELECT option_id, find_line_item_id('Painter - Standard'), 1.0;  -- 1 hour
        
        -- Materials - comprehensive list
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity) VALUES
        (option_id, find_line_item_id('Interior Paint - Standard'), 0.125),  -- 1/8 gallon
        (option_id, find_line_item_id('Primer - Interior'), 0.0625),  -- 1/16 gallon
        (option_id, find_line_item_id('Paintbrush - 2.5"'), 0.1),  -- 1/10 brush (wear)
        (option_id, find_line_item_id('Mini Roller'), 0.1),  -- For flat areas
        (option_id, find_line_item_id('Roller Cover'), 0.25),  -- 1/4 cover
        (option_id, find_line_item_id('Paint Tray'), 0.1),
        (option_id, find_line_item_id('Painters Tape'), 0.2),  -- For edges
        (option_id, find_line_item_id('Drop Cloth'), 0.1),  -- Reusable
        (option_id, find_line_item_id('Sandpaper'), 0.1),  -- For prep
        (option_id, find_line_item_id('Tack Cloth'), 0.25),  -- For dust removal
        (option_id, find_line_item_id('Paint Thinner'), 0.05);  -- For cleanup
        
        UPDATE service_options 
        SET price = (
            SELECT COALESCE(SUM(li.price * soi.quantity), 0)
            FROM service_option_items soi
            JOIN line_items li ON soi.line_item_id = li.id
            WHERE soi.service_option_id = option_id
        )
        WHERE id = option_id;
    END IF;
END $$;

-- Paint Walls - 2 Coats (per sqft)
DO $$
DECLARE
    option_id uuid;
BEGIN
    SELECT id INTO option_id FROM service_options 
    WHERE name = 'Paint Walls - 2 Coats' 
    AND organization_id IS NULL;
    
    IF option_id IS NOT NULL THEN
        DELETE FROM service_option_items WHERE service_option_id = option_id;
        
        -- Labor per square foot
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
        SELECT option_id, find_line_item_id('Painter - Standard'), 0.02;  -- 1.2 minutes per sqft
        
        -- Materials per square foot
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity) VALUES
        (option_id, find_line_item_id('Interior Paint - Standard'), 0.006),  -- ~350 sqft/gallon, 2 coats
        (option_id, find_line_item_id('Primer - Interior'), 0.002),  -- If needed
        (option_id, find_line_item_id('Roller Cover'), 0.001),  -- 1 cover per 1000 sqft
        (option_id, find_line_item_id('Paint Tray Liner'), 0.0005),
        (option_id, find_line_item_id('Painters Tape'), 0.002),  -- For edges
        (option_id, find_line_item_id('Drop Cloth'), 0.0002),  -- Highly reusable
        (option_id, find_line_item_id('Plastic Sheeting'), 0.001);  -- For protection
        
        UPDATE service_options 
        SET price = (
            SELECT COALESCE(SUM(li.price * soi.quantity), 0)
            FROM service_option_items soi
            JOIN line_items li ON soi.line_item_id = li.id
            WHERE soi.service_option_id = option_id
        )
        WHERE id = option_id;
    END IF;
END $$;

-- =====================================================
-- FLOORING - COMPREHENSIVE LINE ITEMS
-- =====================================================

-- Hardwood Install - Standard (per sqft)
DO $$
DECLARE
    option_id uuid;
BEGIN
    SELECT id INTO option_id FROM service_options 
    WHERE name = 'Hardwood Install - Standard' 
    AND organization_id IS NULL;
    
    IF option_id IS NOT NULL THEN
        DELETE FROM service_option_items WHERE service_option_id = option_id;
        
        -- Labor
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
        SELECT option_id, find_line_item_id('Flooring Installer'), 0.04;  -- 2.4 minutes per sqft
        
        -- Materials - complete list
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity) VALUES
        (option_id, find_line_item_id('Hardwood Flooring - Oak'), 1.1),  -- 10% waste
        (option_id, find_line_item_id('Underlayment - Standard'), 1.05),  -- 5% overlap
        (option_id, find_line_item_id('Flooring Nails'), 0.02),  -- Per sqft
        (option_id, find_line_item_id('Wood Floor Adhesive'), 0.01),  -- For problem spots
        (option_id, find_line_item_id('Transition Strips'), 0.01),  -- Proportional
        (option_id, find_line_item_id('Quarter Round'), 0.04),  -- ~25 sqft per linear foot
        (option_id, find_line_item_id('Floor Finish'), 0.003),  -- If unfinished wood
        (option_id, find_line_item_id('Moisture Barrier'), 0.001);  -- If needed
        
        UPDATE service_options 
        SET price = (
            SELECT COALESCE(SUM(li.price * soi.quantity), 0)
            FROM service_option_items soi
            JOIN line_items li ON soi.line_item_id = li.id
            WHERE soi.service_option_id = option_id
        )
        WHERE id = option_id;
    END IF;
END $$;

-- =====================================================
-- CONCRETE - COMPREHENSIVE LINE ITEMS
-- =====================================================

-- Driveway Pour - Standard (per sqft)
DO $$
DECLARE
    option_id uuid;
BEGIN
    SELECT id INTO option_id FROM service_options 
    WHERE name = 'Driveway Pour - Standard' 
    AND organization_id IS NULL;
    
    IF option_id IS NOT NULL THEN
        DELETE FROM service_option_items WHERE service_option_id = option_id;
        
        -- Labor
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
        SELECT option_id, find_line_item_id('Concrete Finisher'), 0.05;  -- 3 minutes per sqft
        
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity)
        SELECT option_id, find_line_item_id('Concrete Laborer'), 0.03;  -- Helper time
        
        -- Materials
        INSERT INTO service_option_items (service_option_id, line_item_id, quantity) VALUES
        (option_id, find_line_item_id('Concrete Mix - 4000 PSI'), 0.015),  -- ~0.015 yards per sqft at 4" thick
        (option_id, find_line_item_id('Rebar - #4'), 0.25),  -- Grid pattern
        (option_id, find_line_item_id('Wire Mesh'), 1.1),  -- 10% overlap
        (option_id, find_line_item_id('Expansion Joint'), 0.02),  -- Proportional
        (option_id, find_line_item_id('Concrete Sealer'), 0.003),  -- Coverage rate
        (option_id, find_line_item_id('Curing Compound'), 0.002),
        (option_id, find_line_item_id('Form Oil'), 0.001),
        (option_id, find_line_item_id('Plastic Sheeting'), 0.001);  -- For curing
        
        UPDATE service_options 
        SET price = (
            SELECT COALESCE(SUM(li.price * soi.quantity), 0)
            FROM service_option_items soi
            JOIN line_items li ON soi.line_item_id = li.id
            WHERE soi.service_option_id = option_id
        )
        WHERE id = option_id;
    END IF;
END $$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS find_line_item_id(text);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- After running this migration, use this query to verify the results:

/*
SELECT 
    s.name as service,
    so.name as option_name,
    so.unit,
    COUNT(soi.id) as line_item_count,
    ROUND(so.price::numeric, 2) as calculated_price,
    STRING_AGG(
        li.name || ' (' || soi.quantity || ' ' || li.unit || ')', 
        ', ' 
        ORDER BY li.name
    ) as line_items
FROM service_options so
JOIN services s ON so.service_id = s.id
LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
LEFT JOIN line_items li ON soi.line_item_id = li.id
WHERE so.name IN (
    'Crown Molding - Simple',
    'Crown Molding - Complex',
    'Paint Interior Door - Basic',
    'Paint Walls - 2 Coats',
    'Hardwood Install - Standard',
    'Driveway Pour - Standard'
)
AND so.organization_id IS NULL
GROUP BY s.name, so.name, so.unit, so.price
ORDER BY s.name, so.name;
*/