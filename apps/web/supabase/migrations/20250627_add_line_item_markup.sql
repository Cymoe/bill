-- Add markup percentage to line item overrides for more intuitive pricing
-- This allows contractors to set markup at the line item level where they actually think about pricing

-- Add markup_percentage column to line_item_overrides
ALTER TABLE line_item_overrides
ADD COLUMN IF NOT EXISTS markup_percentage DECIMAL(5,2) CHECK (markup_percentage >= -100 AND markup_percentage <= 500);

-- Add comment explaining the field
COMMENT ON COLUMN line_item_overrides.markup_percentage IS 'Markup percentage for this line item. When set, custom_price is calculated as base_price * (1 + markup_percentage/100)';

-- Create a function to calculate price from markup
CREATE OR REPLACE FUNCTION calculate_line_item_price(
    base_price DECIMAL,
    markup_percentage DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    IF markup_percentage IS NULL THEN
        RETURN base_price;
    END IF;
    RETURN base_price * (1 + markup_percentage / 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the get_organization_line_items function to include markup data
CREATE OR REPLACE FUNCTION get_organization_line_items(p_organization_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    cost_code_id UUID,
    price NUMERIC,
    unit VARCHAR(50),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    organization_id UUID,
    cost_code_name TEXT,
    cost_code_code VARCHAR(20),
    base_price NUMERIC,
    has_override BOOLEAN,
    markup_percentage NUMERIC,
    margin_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        li.id,
        li.name,
        li.description,
        li.cost_code_id,
        COALESCE(
            lio.custom_price,
            calculate_line_item_price(li.price, lio.markup_percentage),
            li.price
        ) as price,
        li.unit,
        li.is_active,
        li.created_at,
        li.updated_at,
        li.organization_id,
        cc.name as cost_code_name,
        cc.code as cost_code_code,
        li.price as base_price,
        CASE WHEN lio.id IS NOT NULL THEN true ELSE false END as has_override,
        lio.markup_percentage,
        -- Calculate margin percentage for display
        CASE 
            WHEN COALESCE(lio.custom_price, calculate_line_item_price(li.price, lio.markup_percentage), li.price) > 0 
            THEN ((COALESCE(lio.custom_price, calculate_line_item_price(li.price, lio.markup_percentage), li.price) - li.price) / 
                  COALESCE(lio.custom_price, calculate_line_item_price(li.price, lio.markup_percentage), li.price)) * 100
            ELSE 0
        END as margin_percentage
    FROM line_items li
    LEFT JOIN cost_codes cc ON li.cost_code_id = cc.id
    LEFT JOIN line_item_overrides lio ON lio.line_item_id = li.id 
        AND lio.organization_id = p_organization_id
    WHERE li.organization_id IS NULL  -- Shared industry items
       OR li.organization_id = p_organization_id  -- Organization-specific items
    ORDER BY cc.code, li.name;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing overrides to use markup percentage
-- Calculate markup % from existing custom prices where possible
UPDATE line_item_overrides lio
SET markup_percentage = ROUND(((lio.custom_price - li.price) / li.price) * 100, 2)
FROM line_items li
WHERE lio.line_item_id = li.id
AND li.price > 0
AND lio.custom_price IS NOT NULL
AND lio.markup_percentage IS NULL;

-- Create a view for line items with calculated pricing
CREATE OR REPLACE VIEW line_items_with_pricing AS
SELECT 
    li.id,
    li.name,
    li.description,
    li.cost_code_id,
    li.unit,
    li.price as base_cost,
    lio.organization_id,
    lio.markup_percentage,
    lio.custom_price,
    COALESCE(
        lio.custom_price,
        calculate_line_item_price(li.price, lio.markup_percentage),
        li.price
    ) as final_price,
    -- Calculate margin for display
    CASE 
        WHEN COALESCE(lio.custom_price, calculate_line_item_price(li.price, lio.markup_percentage), li.price) > 0 
        THEN ((COALESCE(lio.custom_price, calculate_line_item_price(li.price, lio.markup_percentage), li.price) - li.price) / 
              COALESCE(lio.custom_price, calculate_line_item_price(li.price, lio.markup_percentage), li.price)) * 100
        ELSE 0
    END as margin_percentage,
    cc.code as cost_code,
    cc.name as cost_code_name,
    cc.category as cost_code_category
FROM line_items li
LEFT JOIN cost_codes cc ON li.cost_code_id = cc.id
LEFT JOIN line_item_overrides lio ON lio.line_item_id = li.id;

-- Add RLS policy for the view
ALTER VIEW line_items_with_pricing OWNER TO authenticated;
GRANT SELECT ON line_items_with_pricing TO authenticated;