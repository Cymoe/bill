-- Fix global views to only show system/shared data, not private organization data

-- Drop and recreate global_products to only show system products
DROP VIEW IF EXISTS global_products CASCADE;

CREATE VIEW global_products AS
SELECT 
    id,
    user_id,
    name,
    description,
    price,
    unit,
    created_at,
    type,
    cost_code_id AS trade_id,
    status
FROM products
WHERE organization_id IS NULL;  -- Only system products!

-- If carpentry_products exists, fix it too
DROP VIEW IF EXISTS carpentry_products CASCADE;

CREATE VIEW carpentry_products AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.unit,
    p.user_id,
    p.created_at,
    p.type,
    p.cost_code_id AS trade_id,
    p.status,
    t.name AS trade_name
FROM products p
JOIN cost_codes t ON p.cost_code_id = t.id
WHERE t.name = 'Carpentry'
  AND p.organization_id IS NULL;  -- Only system carpentry products!

-- Grant appropriate permissions
GRANT SELECT ON global_products TO authenticated;
GRANT SELECT ON carpentry_products TO authenticated;