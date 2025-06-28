-- Add organization markup defaults for streamlined pricing
-- This allows contractors to set default markups by category that auto-apply to line items

-- Create organization markup defaults table
CREATE TABLE IF NOT EXISTS organization_markup_defaults (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    markup_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, category),
    CONSTRAINT valid_category CHECK (category IN ('labor', 'materials', 'equipment', 'services', 'subcontractor')),
    CONSTRAINT valid_markup CHECK (markup_percentage >= -100 AND markup_percentage <= 500)
);

-- Add RLS policies
ALTER TABLE organization_markup_defaults ENABLE ROW LEVEL SECURITY;

-- Users can view their organization's defaults
CREATE POLICY "Users can view their organization markup defaults"
    ON organization_markup_defaults FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT uo.organization_id 
            FROM user_organizations uo 
            WHERE uo.user_id = auth.uid()
        )
    );

-- Users can manage their organization's defaults
CREATE POLICY "Users can manage their organization markup defaults"
    ON organization_markup_defaults FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT uo.organization_id 
            FROM user_organizations uo 
            WHERE uo.user_id = auth.uid() 
            AND uo.role IN ('owner', 'admin')
        )
    );

-- Create indexes
CREATE INDEX idx_org_markup_defaults_org ON organization_markup_defaults(organization_id);
CREATE INDEX idx_org_markup_defaults_category ON organization_markup_defaults(organization_id, category);

-- Add trigger to update updated_at
CREATE TRIGGER update_organization_markup_defaults_updated_at
    BEFORE UPDATE ON organization_markup_defaults
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get effective markup for a line item
CREATE OR REPLACE FUNCTION get_effective_markup(
    p_line_item_id UUID,
    p_organization_id UUID
) RETURNS DECIMAL AS $$
DECLARE
    v_markup DECIMAL;
    v_category VARCHAR(50);
    v_default_markup DECIMAL;
BEGIN
    -- First check if there's a specific override for this line item
    SELECT markup_percentage INTO v_markup
    FROM line_item_overrides
    WHERE line_item_id = p_line_item_id
    AND organization_id = p_organization_id;
    
    IF v_markup IS NOT NULL THEN
        RETURN v_markup;
    END IF;
    
    -- Get the category from the line item's cost code
    SELECT cc.category INTO v_category
    FROM line_items li
    JOIN cost_codes cc ON li.cost_code_id = cc.id
    WHERE li.id = p_line_item_id;
    
    -- Get the default markup for this category
    SELECT markup_percentage INTO v_default_markup
    FROM organization_markup_defaults
    WHERE organization_id = p_organization_id
    AND category = v_category;
    
    RETURN COALESCE(v_default_markup, 0);
END;
$$ LANGUAGE plpgsql;

-- Insert default markup settings for existing organizations
INSERT INTO organization_markup_defaults (organization_id, category, markup_percentage)
SELECT DISTINCT 
    o.id,
    cat.category,
    CASE 
        WHEN cat.category = 'labor' THEN 35
        WHEN cat.category = 'materials' THEN 25
        WHEN cat.category = 'equipment' THEN 30
        WHEN cat.category = 'services' THEN 30
        WHEN cat.category = 'subcontractor' THEN 15
        ELSE 25
    END
FROM organizations o
CROSS JOIN (
    SELECT unnest(ARRAY['labor', 'materials', 'equipment', 'services', 'subcontractor']) as category
) cat
ON CONFLICT (organization_id, category) DO NOTHING;

-- Add comment
COMMENT ON TABLE organization_markup_defaults IS 'Stores default markup percentages by category for each organization';