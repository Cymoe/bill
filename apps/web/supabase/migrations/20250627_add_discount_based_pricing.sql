-- Add discount-based pricing to service options and packages
-- This migration adds percentage discount fields instead of manual price overrides

-- Add bundle_discount_percentage to service_options
ALTER TABLE service_options 
ADD COLUMN IF NOT EXISTS bundle_discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (bundle_discount_percentage >= 0 AND bundle_discount_percentage <= 100);

-- Add comment explaining the field
COMMENT ON COLUMN service_options.bundle_discount_percentage IS 'Percentage discount applied when bundling line items together in this service option. Applied to the sum of line item prices.';

-- Add package_discount_percentage to service_packages  
ALTER TABLE service_packages
ADD COLUMN IF NOT EXISTS package_discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (package_discount_percentage >= 0 AND package_discount_percentage <= 100);

-- Add comment explaining the field
COMMENT ON COLUMN service_packages.package_discount_percentage IS 'Additional percentage discount applied at the package level, on top of any service option discounts.';

-- Create a view to calculate effective prices with discounts
CREATE OR REPLACE VIEW service_option_calculated_prices AS
SELECT 
    so.id,
    so.name,
    so.service_id,
    so.organization_id,
    so.unit,
    so.bundle_discount_percentage,
    -- Calculate the sum of line item prices (using overrides when available)
    COALESCE(
        SUM(
            CASE 
                WHEN lio.custom_price IS NOT NULL THEN lio.custom_price * soi.quantity
                ELSE li.price * soi.quantity
            END
        ), 
        0
    ) as base_price,
    -- Apply the bundle discount
    COALESCE(
        SUM(
            CASE 
                WHEN lio.custom_price IS NOT NULL THEN lio.custom_price * soi.quantity
                ELSE li.price * soi.quantity
            END
        ) * (1 - COALESCE(so.bundle_discount_percentage, 0) / 100), 
        0
    ) as discounted_price
FROM service_options so
LEFT JOIN service_option_items soi ON soi.service_option_id = so.id
LEFT JOIN line_items li ON li.id = soi.line_item_id
LEFT JOIN line_item_overrides lio ON lio.line_item_id = li.id 
    AND lio.organization_id = COALESCE(so.organization_id, lio.organization_id)
WHERE so.is_template = true
GROUP BY so.id, so.name, so.service_id, so.organization_id, so.unit, so.bundle_discount_percentage;

-- Create a view to calculate package prices with compounded discounts
CREATE OR REPLACE VIEW service_package_calculated_prices AS
SELECT 
    sp.id,
    sp.name,
    sp.industry_id,
    sp.organization_id,
    sp.package_discount_percentage,
    -- Sum of all service option discounted prices
    COALESCE(SUM(socp.discounted_price), 0) as base_package_price,
    -- Apply additional package discount on top
    COALESCE(
        SUM(socp.discounted_price) * (1 - COALESCE(sp.package_discount_percentage, 0) / 100),
        0
    ) as final_package_price
FROM service_packages sp
LEFT JOIN service_package_templates spt ON spt.package_id = sp.id
LEFT JOIN service_option_calculated_prices socp ON socp.id = spt.template_id
GROUP BY sp.id, sp.name, sp.industry_id, sp.organization_id, sp.package_discount_percentage;

-- Update RLS policies for the new views
ALTER VIEW service_option_calculated_prices OWNER TO authenticated;
ALTER VIEW service_package_calculated_prices OWNER TO authenticated;

GRANT SELECT ON service_option_calculated_prices TO authenticated;
GRANT SELECT ON service_package_calculated_prices TO authenticated;

-- Add RLS policies
CREATE POLICY "Users can view calculated prices for their organization"
ON service_option_calculated_prices
FOR SELECT
TO authenticated
USING (
    organization_id IS NULL 
    OR organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can view package prices for their organization"
ON service_package_calculated_prices
FOR SELECT
TO authenticated
USING (
    organization_id IS NULL 
    OR organization_id IN (
        SELECT organization_id 
        FROM organization_users 
        WHERE user_id = auth.uid()
    )
);

-- Migrate existing manual prices to discounts (optional - only if needed)
-- This calculates what discount percentage would result in the current manual price
-- Only run this if you have existing manual prices that need to be converted
/*
UPDATE service_options so
SET bundle_discount_percentage = CASE 
    WHEN base_price > 0 THEN ROUND(((base_price - so.price) / base_price) * 100, 2)
    ELSE 0
END
FROM (
    SELECT 
        so.id,
        COALESCE(SUM(li.price * soi.quantity), 0) as base_price
    FROM service_options so
    LEFT JOIN service_option_items soi ON soi.service_option_id = so.id
    LEFT JOIN line_items li ON li.id = soi.line_item_id
    WHERE so.price > 0 -- Only update if manual price was set
    GROUP BY so.id
) calc
WHERE calc.id = so.id
AND so.price > 0;
*/