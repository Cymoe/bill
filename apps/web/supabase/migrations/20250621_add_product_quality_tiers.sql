-- Add quality tier system to products
ALTER TABLE products 
ADD COLUMN quality_tier TEXT DEFAULT 'standard' 
CHECK (quality_tier IN ('basic', 'standard', 'premium'));

-- Add tier pricing multiplier
ALTER TABLE products 
ADD COLUMN tier_multiplier NUMERIC(4,2) DEFAULT 1.0;

-- Add index for better performance
CREATE INDEX idx_products_quality_tier ON products(quality_tier);
CREATE INDEX idx_products_parent_variant ON products(parent_product_id, quality_tier);

-- Update existing products to be 'standard' tier
UPDATE products 
SET quality_tier = 'standard',
    tier_multiplier = 1.0
WHERE quality_tier IS NULL;

-- Create function to generate product variants
CREATE OR REPLACE FUNCTION generate_product_variants(
    p_product_id UUID,
    p_basic_multiplier NUMERIC DEFAULT 0.85,
    p_premium_multiplier NUMERIC DEFAULT 1.25
) RETURNS VOID AS $$
DECLARE
    v_product RECORD;
    v_basic_id UUID;
    v_premium_id UUID;
BEGIN
    -- Get the standard product
    SELECT * INTO v_product
    FROM products
    WHERE id = p_product_id
    AND quality_tier = 'standard'
    AND parent_product_id IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found or not a standard tier base product';
    END IF;
    
    -- Create basic variant
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
        parent_product_id,
        quality_tier,
        tier_multiplier,
        created_at,
        updated_at
    ) VALUES (
        v_product.name || ' - Basic',
        COALESCE(v_product.description, '') || ' (Basic quality option)',
        ROUND(v_product.price * p_basic_multiplier, 2),
        v_product.unit,
        v_product.type,
        v_product.category,
        v_product.status,
        false,
        v_product.user_id,
        v_product.organization_id,
        p_product_id,
        'basic',
        p_basic_multiplier,
        NOW(),
        NOW()
    ) RETURNING id INTO v_basic_id;
    
    -- Create premium variant
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
        parent_product_id,
        quality_tier,
        tier_multiplier,
        created_at,
        updated_at
    ) VALUES (
        v_product.name || ' - Premium',
        COALESCE(v_product.description, '') || ' (Premium quality with enhanced materials and warranty)',
        ROUND(v_product.price * p_premium_multiplier, 2),
        v_product.unit,
        v_product.type,
        v_product.category,
        v_product.status,
        false,
        v_product.user_id,
        v_product.organization_id,
        p_product_id,
        'premium',
        p_premium_multiplier,
        NOW(),
        NOW()
    ) RETURNING id INTO v_premium_id;
    
    -- Copy line items to variants with adjusted prices
    -- Basic variant line items
    INSERT INTO product_line_items (
        product_id,
        line_item_id,
        quantity,
        unit,
        price
    )
    SELECT 
        v_basic_id,
        line_item_id,
        quantity,
        unit,
        ROUND(price * p_basic_multiplier, 2)
    FROM product_line_items
    WHERE product_id = p_product_id;
    
    -- Premium variant line items
    INSERT INTO product_line_items (
        product_id,
        line_item_id,
        quantity,
        unit,
        price
    )
    SELECT 
        v_premium_id,
        line_item_id,
        quantity,
        unit,
        ROUND(price * p_premium_multiplier, 2)
    FROM product_line_items
    WHERE product_id = p_product_id;
    
END;
$$ LANGUAGE plpgsql;

-- Update the get_organization_products function to include quality tier
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
        SELECT oi.industry_id, i.name as industry_name
        FROM organization_industries oi
        JOIN industries i ON oi.industry_id = i.id
        WHERE oi.organization_id = p_organization_id
    ),
    product_industries AS (
        SELECT DISTINCT 
            p.id as product_id,
            COALESCE(cc.industry_id, 
                     (SELECT oi.industry_id FROM org_industries oi LIMIT 1)) as industry_id
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
        pi.industry_id,
        i.name as industry_name
    FROM products p
    JOIN product_industries pi ON p.id = pi.product_id
    JOIN industries i ON pi.industry_id = i.id
    LEFT JOIN product_line_items pli ON p.id = pli.product_id
    WHERE pi.industry_id IN (SELECT industry_id FROM org_industries)
      AND (p.organization_id IS NULL OR p.organization_id = p_organization_id)
    GROUP BY p.id, p.name, p.description, p.price, p.unit, p.type, 
             p.category, p.status, p.is_base_product, p.parent_product_id,
             p.quality_tier, p.tier_multiplier, p.created_at, p.updated_at,
             pi.industry_id, i.name
    ORDER BY i.name, p.parent_product_id NULLS FIRST, p.quality_tier;
END;
$$ LANGUAGE plpgsql;