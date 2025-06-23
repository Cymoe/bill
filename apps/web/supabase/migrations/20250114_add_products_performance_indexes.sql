-- Performance indexes for products table to speed up queries
-- Products page is one of the slowest, these indexes should help

-- Composite index for organization + is_base_product filtering
CREATE INDEX IF NOT EXISTS idx_products_org_base ON products(organization_id, is_base_product);

-- Index for cost_code_id joins
CREATE INDEX IF NOT EXISTS idx_products_cost_code ON products(cost_code_id);

-- Index for created_at ordering with organization
CREATE INDEX IF NOT EXISTS idx_products_org_created ON products(organization_id, created_at DESC);

-- Additional indexes for cost_codes table
-- Since it's queried with organization_id IS NULL condition
CREATE INDEX IF NOT EXISTS idx_cost_codes_org_null ON cost_codes(organization_id) WHERE organization_id IS NULL;

-- Index for cost_codes ordering
CREATE INDEX IF NOT EXISTS idx_cost_codes_code ON cost_codes(code);
