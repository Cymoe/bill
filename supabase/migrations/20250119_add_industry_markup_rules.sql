-- Industry Markup Rules Migration
-- Adds industry-specific markup configuration for cost code to product generation

-- Create industry markup rules table
CREATE TABLE IF NOT EXISTS industry_markup_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  cost_code_category VARCHAR(50) NOT NULL CHECK (cost_code_category IN ('labor', 'material', 'equipment', 'subcontractor', 'service')),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('budget', 'standard', 'premium')),
  markup_percentage DECIMAL(5,2) NOT NULL CHECK (markup_percentage >= 0 AND markup_percentage <= 500),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  -- Unique constraint: one rule per organization/industry/category/tier combination
  CONSTRAINT unique_industry_markup_rule UNIQUE (organization_id, industry_id, cost_code_category, tier)
);

-- Add indexes for performance
CREATE INDEX idx_industry_markup_rules_org_id ON industry_markup_rules(organization_id);
CREATE INDEX idx_industry_markup_rules_industry_id ON industry_markup_rules(industry_id);
CREATE INDEX idx_industry_markup_rules_category_tier ON industry_markup_rules(cost_code_category, tier);

-- Add metadata column to products table for tracking generation source
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN products.metadata IS 'Stores additional product metadata including generation source, markup details, etc.';

-- Create default industry markup rules for common industries
INSERT INTO industry_markup_rules (industry_id, cost_code_category, tier, markup_percentage)
SELECT 
  i.id as industry_id,
  category.value as cost_code_category,
  tier.value as tier,
  CASE 
    -- Labor markups (higher due to overhead)
    WHEN category.value = 'labor' AND tier.value = 'budget' THEN 20
    WHEN category.value = 'labor' AND tier.value = 'standard' THEN 40
    WHEN category.value = 'labor' AND tier.value = 'premium' THEN 65
    -- Material markups
    WHEN category.value = 'material' AND tier.value = 'budget' THEN 15
    WHEN category.value = 'material' AND tier.value = 'standard' THEN 30
    WHEN category.value = 'material' AND tier.value = 'premium' THEN 50
    -- Equipment markups (lower margins)
    WHEN category.value = 'equipment' AND tier.value = 'budget' THEN 10
    WHEN category.value = 'equipment' AND tier.value = 'standard' THEN 25
    WHEN category.value = 'equipment' AND tier.value = 'premium' THEN 40
    -- Subcontractor markups
    WHEN category.value = 'subcontractor' AND tier.value = 'budget' THEN 15
    WHEN category.value = 'subcontractor' AND tier.value = 'standard' THEN 30
    WHEN category.value = 'subcontractor' AND tier.value = 'premium' THEN 45
    -- Service markups
    WHEN category.value = 'service' AND tier.value = 'budget' THEN 18
    WHEN category.value = 'service' AND tier.value = 'standard' THEN 35
    WHEN category.value = 'service' AND tier.value = 'premium' THEN 55
  END as markup_percentage
FROM industries i
CROSS JOIN (
  VALUES ('labor'), ('material'), ('equipment'), ('subcontractor'), ('service')
) as category(value)
CROSS JOIN (
  VALUES ('budget'), ('standard'), ('premium')
) as tier(value)
WHERE i.is_active = true
ON CONFLICT (organization_id, industry_id, cost_code_category, tier) DO NOTHING;

-- Enable RLS
ALTER TABLE industry_markup_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view industry markup rules in their organizations" ON industry_markup_rules
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = industry_markup_rules.organization_id
    )
  );

CREATE POLICY "Users can create industry markup rules in their organizations" ON industry_markup_rules
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = industry_markup_rules.organization_id
    )
  );

CREATE POLICY "Users can update industry markup rules in their organizations" ON industry_markup_rules
  FOR UPDATE TO authenticated
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = industry_markup_rules.organization_id
    )
  );

CREATE POLICY "Users can delete industry markup rules in their organizations" ON industry_markup_rules
  FOR DELETE TO authenticated
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = industry_markup_rules.organization_id
    )
  );

-- Function to get effective markup for a cost code
CREATE OR REPLACE FUNCTION get_effective_markup(
  p_organization_id UUID,
  p_industry_id UUID,
  p_cost_code_category VARCHAR(50),
  p_tier VARCHAR(20)
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_markup DECIMAL(5,2);
BEGIN
  -- First try organization-specific rule
  SELECT markup_percentage INTO v_markup
  FROM industry_markup_rules
  WHERE organization_id = p_organization_id
    AND industry_id = p_industry_id
    AND cost_code_category = p_cost_code_category
    AND tier = p_tier
    AND is_active = true
  LIMIT 1;
  
  -- If not found, try global rule (organization_id IS NULL)
  IF v_markup IS NULL THEN
    SELECT markup_percentage INTO v_markup
    FROM industry_markup_rules
    WHERE organization_id IS NULL
      AND industry_id = p_industry_id
      AND cost_code_category = p_cost_code_category
      AND tier = p_tier
      AND is_active = true
    LIMIT 1;
  END IF;
  
  -- Default markup if still not found
  IF v_markup IS NULL THEN
    v_markup := 30.00; -- Default 30% markup
  END IF;
  
  RETURN v_markup;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_industry_markup_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_industry_markup_rules_updated_at
  BEFORE UPDATE ON industry_markup_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_industry_markup_rules_updated_at();