-- Add service_type to products for better organization
ALTER TABLE products 
ADD COLUMN service_type TEXT;

-- Add check constraint for valid service types
ALTER TABLE products
ADD CONSTRAINT products_service_type_check 
CHECK (service_type IN (
  'complete_project',
  'service_call', 
  'repair',
  'maintenance',
  'inspection',
  'material',
  'equipment_rental',
  'subcontractor'
));

-- Create index for performance
CREATE INDEX idx_products_service_type ON products(service_type);

-- Categorize existing products based on patterns
UPDATE products
SET service_type = CASE
  -- Complete Projects (high value, project-based)
  WHEN price >= 1000 AND (unit IN ('project', 'job') OR name ILIKE '%remodel%' OR name ILIKE '%installation%' OR name ILIKE '%system%')
  THEN 'complete_project'
  
  -- Service Calls (mid-range services)
  WHEN price BETWEEN 100 AND 999 AND (unit IN ('each', 'service', 'EA') OR name ILIKE '%install%' OR name ILIKE '%replace%')
  THEN 'service_call'
  
  -- Repairs
  WHEN name ILIKE '%repair%' OR name ILIKE '%fix%' OR name ILIKE '%emergency%'
  THEN 'repair'
  
  -- Maintenance
  WHEN name ILIKE '%maintenance%' OR name ILIKE '%tune-up%' OR name ILIKE '%cleaning%' OR name ILIKE '%quarterly%' OR name ILIKE '%annual%'
  THEN 'maintenance'
  
  -- Inspections
  WHEN name ILIKE '%inspection%' OR name ILIKE '%diagnostic%' OR name ILIKE '%assessment%' OR name ILIKE '%testing%'
  THEN 'inspection'
  
  -- Materials (small items, per unit pricing)
  WHEN price < 50 AND unit IN ('LF', 'SF', 'EA', 'GAL', 'BAG', 'each')
  THEN 'material'
  
  -- Equipment Rentals
  WHEN unit IN ('DAY', 'WEEK', 'MONTH') OR name ILIKE '%rental%'
  THEN 'equipment_rental'
  
  -- Subcontractor Services
  WHEN name ILIKE '%company%' OR name ILIKE '%specialist%' OR name ILIKE '%contractor%'
  THEN 'subcontractor'
  
  -- Default to service_call for anything else
  ELSE 'service_call'
END
WHERE organization_id IS NULL;

-- Add service_type to the get_organization_products function
DROP FUNCTION IF EXISTS get_organization_products(UUID);

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
    parent_product_id UUID,
    quality_tier TEXT,
    tier_multiplier NUMERIC,
    service_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    item_count BIGINT,
    total_cost NUMERIC,
    margin_percentage NUMERIC,
    industry_id UUID,
    industry_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH org_industries AS (
        SELECT oi.industry_id as ind_id, i.name as ind_name
        FROM organization_industries oi
        JOIN industries i ON oi.industry_id = i.id
        WHERE oi.organization_id = p_organization_id
    ),
    product_industries AS (
        SELECT DISTINCT 
            p.id as product_id,
            COALESCE(cc.industry_id, 
                     (SELECT oi.ind_id FROM org_industries oi LIMIT 1)) as prod_industry_id
        FROM products p
        LEFT JOIN product_line_items pli ON p.id = pli.product_id
        LEFT JOIN line_items li ON pli.line_item_id = li.id
        LEFT JOIN cost_codes cc ON li.cost_code_id = cc.id
        WHERE (p.organization_id IS NULL AND p.is_base_product = true)
           OR p.organization_id = p_organization_id
    )
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.unit,
        p.type,
        p.category,
        p.status,
        p.is_base_product,
        p.parent_product_id,
        p.quality_tier,
        p.tier_multiplier,
        p.service_type,
        p.created_at,
        p.updated_at,
        COUNT(pli.id) as item_count,
        COALESCE(SUM(pli.quantity * pli.price), 0) as total_cost,
        CASE 
            WHEN p.price > 0 AND COALESCE(SUM(pli.quantity * pli.price), 0) > 0 
            THEN ((p.price - COALESCE(SUM(pli.quantity * pli.price), 0)) / p.price) * 100
            WHEN p.price > 0 THEN 100
            ELSE 0
        END as margin_percentage,
        pi.prod_industry_id,
        i.name as industry_name
    FROM products p
    JOIN product_industries pi ON p.id = pi.product_id
    JOIN industries i ON pi.prod_industry_id = i.id
    LEFT JOIN product_line_items pli ON p.id = pli.product_id
    WHERE pi.prod_industry_id IN (SELECT ind_id FROM org_industries)
      AND (p.organization_id IS NULL OR p.organization_id = p_organization_id)
    GROUP BY p.id, p.name, p.description, p.price, p.unit, p.type, 
             p.category, p.status, p.is_base_product, p.parent_product_id,
             p.quality_tier, p.tier_multiplier, p.service_type, 
             p.created_at, p.updated_at,
             pi.prod_industry_id, i.name
    ORDER BY i.name, p.service_type, p.parent_product_id NULLS FIRST, p.quality_tier;
END;
$$ LANGUAGE plpgsql;