-- Add markup system for converting costs to customer prices
-- This migration adds organization-level markup rules and estimate-level overrides

-- Create organization markup rules table
CREATE TABLE IF NOT EXISTS organization_markup_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('labor', 'materials', 'services', 'subcontractor')),
    markup_percentage DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (markup_percentage >= -100 AND markup_percentage <= 500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, category)
);

-- Add index for faster lookups
CREATE INDEX idx_org_markup_rules_org_id ON organization_markup_rules(organization_id);

-- Add markup fields to estimates table
ALTER TABLE estimates 
ADD COLUMN IF NOT EXISTS markup_mode VARCHAR(20) DEFAULT 'organization' CHECK (markup_mode IN ('organization', 'custom', 'none')),
ADD COLUMN IF NOT EXISTS custom_markup_percentage DECIMAL(5,2) CHECK (custom_markup_percentage >= -100 AND custom_markup_percentage <= 500),
ADD COLUMN IF NOT EXISTS show_cost_breakdown BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_markup_percentage BOOLEAN DEFAULT false;

-- Add comments
COMMENT ON COLUMN estimates.markup_mode IS 'How markup is applied: organization (use org defaults), custom (use custom_markup_percentage), none (no markup)';
COMMENT ON COLUMN estimates.custom_markup_percentage IS 'Custom markup percentage when markup_mode is custom';
COMMENT ON COLUMN estimates.show_cost_breakdown IS 'Whether to show cost breakdown to customer';
COMMENT ON COLUMN estimates.show_markup_percentage IS 'Whether to show markup percentage to customer';

-- Create default markup rules for existing organizations
INSERT INTO organization_markup_rules (organization_id, category, markup_percentage)
SELECT DISTINCT 
    o.id,
    category.value,
    CASE 
        WHEN category.value = 'labor' THEN 40
        WHEN category.value = 'materials' THEN 25
        WHEN category.value = 'services' THEN 35
        WHEN category.value = 'subcontractor' THEN 15
    END as markup_percentage
FROM organizations o
CROSS JOIN (VALUES ('labor'), ('materials'), ('services'), ('subcontractor')) AS category(value)
WHERE NOT EXISTS (
    SELECT 1 FROM organization_markup_rules omr 
    WHERE omr.organization_id = o.id AND omr.category = category.value
);

-- Create a function to get markup percentage for a line item
CREATE OR REPLACE FUNCTION get_line_item_markup(
    p_line_item_id UUID,
    p_organization_id UUID,
    p_estimate_id UUID DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
    v_cost_code_number INTEGER;
    v_category VARCHAR(50);
    v_markup_percentage DECIMAL(5,2);
    v_markup_mode VARCHAR(20);
    v_custom_markup DECIMAL(5,2);
BEGIN
    -- If estimate_id provided, check for custom markup
    IF p_estimate_id IS NOT NULL THEN
        SELECT markup_mode, custom_markup_percentage 
        INTO v_markup_mode, v_custom_markup
        FROM estimates 
        WHERE id = p_estimate_id;
        
        -- If custom mode, return the custom markup
        IF v_markup_mode = 'custom' AND v_custom_markup IS NOT NULL THEN
            RETURN v_custom_markup;
        ELSIF v_markup_mode = 'none' THEN
            RETURN 0;
        END IF;
    END IF;
    
    -- Get the cost code number for this line item
    SELECT CAST(REGEXP_REPLACE(cc.code, '[^0-9]', '', 'g') AS INTEGER)
    INTO v_cost_code_number
    FROM line_items li
    JOIN cost_codes cc ON li.cost_code_id = cc.id
    WHERE li.id = p_line_item_id;
    
    -- Determine category based on cost code number
    IF v_cost_code_number >= 100 AND v_cost_code_number <= 199 THEN
        v_category := 'labor';
    ELSIF v_cost_code_number >= 500 AND v_cost_code_number <= 599 THEN
        v_category := 'materials';
    ELSIF v_cost_code_number >= 700 AND v_cost_code_number <= 799 THEN
        v_category := 'subcontractor';
    ELSE
        v_category := 'services';
    END IF;
    
    -- Get the markup percentage for this category
    SELECT markup_percentage 
    INTO v_markup_percentage
    FROM organization_markup_rules
    WHERE organization_id = p_organization_id 
    AND category = v_category
    AND is_active = true;
    
    -- Return the markup percentage (default to 0 if not found)
    RETURN COALESCE(v_markup_percentage, 0);
END;
$$ LANGUAGE plpgsql;

-- Update the service option calculated prices view to include markup
DROP VIEW IF EXISTS service_option_calculated_prices CASCADE;
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
    ) as base_cost,
    -- Apply the bundle discount to get discounted cost
    COALESCE(
        SUM(
            CASE 
                WHEN lio.custom_price IS NOT NULL THEN lio.custom_price * soi.quantity
                ELSE li.price * soi.quantity
            END
        ) * (1 - COALESCE(so.bundle_discount_percentage, 0) / 100), 
        0
    ) as discounted_cost,
    -- Calculate with markup (customer price) - will need organization context
    -- This is a placeholder - actual markup calculation happens at runtime
    COALESCE(
        SUM(
            CASE 
                WHEN lio.custom_price IS NOT NULL THEN lio.custom_price * soi.quantity
                ELSE li.price * soi.quantity
            END
        ) * (1 - COALESCE(so.bundle_discount_percentage, 0) / 100), 
        0
    ) as customer_price_base
FROM service_options so
LEFT JOIN service_option_items soi ON soi.service_option_id = so.id
LEFT JOIN line_items li ON li.id = soi.line_item_id
LEFT JOIN line_item_overrides lio ON lio.line_item_id = li.id 
    AND lio.organization_id = COALESCE(so.organization_id, lio.organization_id)
WHERE so.is_template = true
GROUP BY so.id, so.name, so.service_id, so.organization_id, so.unit, so.bundle_discount_percentage;

-- Create a comprehensive pricing view that includes all calculations
CREATE OR REPLACE VIEW comprehensive_pricing_view AS
WITH line_item_details AS (
    SELECT 
        li.id as line_item_id,
        li.name as line_item_name,
        li.cost_code_id,
        cc.code as cost_code,
        CAST(REGEXP_REPLACE(cc.code, '[^0-9]', '', 'g') AS INTEGER) as cost_code_number,
        CASE 
            WHEN CAST(REGEXP_REPLACE(cc.code, '[^0-9]', '', 'g') AS INTEGER) BETWEEN 100 AND 199 THEN 'labor'
            WHEN CAST(REGEXP_REPLACE(cc.code, '[^0-9]', '', 'g') AS INTEGER) BETWEEN 500 AND 599 THEN 'materials'
            WHEN CAST(REGEXP_REPLACE(cc.code, '[^0-9]', '', 'g') AS INTEGER) BETWEEN 700 AND 799 THEN 'subcontractor'
            ELSE 'services'
        END as category,
        li.price as base_price,
        li.unit,
        li.organization_id as line_item_org_id
    FROM line_items li
    JOIN cost_codes cc ON li.cost_code_id = cc.id
)
SELECT 
    lid.*,
    lio.organization_id as override_org_id,
    lio.custom_price,
    COALESCE(lio.custom_price, lid.base_price) as effective_cost,
    omr.markup_percentage,
    COALESCE(lio.custom_price, lid.base_price) * (1 + COALESCE(omr.markup_percentage, 0) / 100) as customer_price
FROM line_item_details lid
LEFT JOIN line_item_overrides lio ON lio.line_item_id = lid.line_item_id
LEFT JOIN organization_markup_rules omr ON omr.category = lid.category 
    AND omr.organization_id = COALESCE(lio.organization_id, lid.line_item_org_id)
    AND omr.is_active = true;

-- RLS Policies
ALTER TABLE organization_markup_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization markup rules"
ON organization_markup_rules
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM user_organizations 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their organization markup rules"
ON organization_markup_rules
FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM user_organizations 
        WHERE user_id = auth.uid()
    )
);

-- Grant permissions
GRANT ALL ON organization_markup_rules TO authenticated;
GRANT ALL ON comprehensive_pricing_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_line_item_markup TO authenticated;

-- Add RLS to the views
ALTER VIEW service_option_calculated_prices OWNER TO authenticated;
ALTER VIEW comprehensive_pricing_view OWNER TO authenticated;