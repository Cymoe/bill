-- Comprehensive audit of service options to identify missing line items
-- Goal: Ensure each service option has ALL necessary materials and labor for a complete job

-- First, let's see what we currently have for each service option
WITH service_option_details AS (
    SELECT 
        s.name as service_name,
        so.name as option_name,
        so.unit,
        so.price,
        COUNT(soi.id) as line_item_count,
        STRING_AGG(
            li.name || ' (' || soi.quantity || ' ' || li.unit || ')', 
            ', ' 
            ORDER BY 
                CASE 
                    WHEN cc.category = 'labor' THEN 1
                    WHEN cc.category = 'materials' THEN 2
                    WHEN cc.category = 'equipment' THEN 3
                    ELSE 4
                END,
                li.name
        ) as included_items
    FROM service_options so
    JOIN services s ON so.service_id = s.id
    LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
    LEFT JOIN line_items li ON soi.line_item_id = li.id
    LEFT JOIN cost_codes cc ON li.cost_code_id = cc.id
    WHERE so.organization_id IS NULL -- Only system-level options
    GROUP BY s.name, so.name, so.unit, so.price
    ORDER BY s.name, so.name
)
SELECT * FROM service_option_details
WHERE line_item_count < 4  -- Flag options with suspiciously few items
OR included_items IS NULL;  -- Or no items at all

-- Common missing items by service type
-- This query helps identify patterns of what's typically missing

-- For Painting services, commonly missing:
-- - Drop cloths, plastic sheeting
-- - Brushes, rollers, paint trays
-- - Cleaning supplies (mineral spirits, rags)
-- - Primer (often missing when paint is included)
-- - Caulk and filler for prep work
-- - Sandpaper grades (multiple grits needed)
-- - Ladder rental for high areas

-- For Carpentry services, commonly missing:
-- - Fasteners (nails, screws appropriate to the job)
-- - Adhesives (wood glue, construction adhesive)
-- - Shims and spacers
-- - Caulk for finishing
-- - Sandpaper for smoothing
-- - Safety equipment rental

-- For Flooring services, commonly missing:
-- - Underlayment materials
-- - Transition strips
-- - Adhesives or fasteners
-- - Moisture barriers
-- - Floor leveling compound
-- - Knee pads and tools

-- Let's get specific counts by industry
SELECT 
    i.name as industry_name,
    COUNT(DISTINCT s.id) as service_count,
    COUNT(DISTINCT so.id) as option_count,
    COUNT(DISTINCT soi.id) as total_line_items,
    ROUND(AVG(subq.items_per_option), 2) as avg_items_per_option,
    MIN(subq.items_per_option) as min_items,
    MAX(subq.items_per_option) as max_items
FROM industries i
JOIN services s ON s.industry_id = i.id
JOIN service_options so ON so.service_id = s.id
LEFT JOIN (
    SELECT service_option_id, COUNT(*) as items_per_option
    FROM service_option_items
    GROUP BY service_option_id
) subq ON subq.service_option_id = so.id
LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
WHERE so.organization_id IS NULL
GROUP BY i.name
ORDER BY avg_items_per_option ASC;

-- Find service options with NO line items at all
SELECT 
    i.name as industry,
    s.name as service,
    so.name as option_name,
    so.unit,
    so.price
FROM service_options so
JOIN services s ON so.service_id = s.id
JOIN industries i ON s.industry_id = i.id
WHERE so.organization_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM service_option_items soi 
    WHERE soi.service_option_id = so.id
)
ORDER BY i.name, s.name, so.name;