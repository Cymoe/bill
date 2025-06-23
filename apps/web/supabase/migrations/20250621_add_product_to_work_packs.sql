-- Add product_id to work_pack_items to link products to work packs
ALTER TABLE work_pack_items 
ADD COLUMN product_id UUID REFERENCES products(id);

-- Create index for performance
CREATE INDEX idx_work_pack_items_product_id ON work_pack_items(product_id);

-- Update item_type constraint to include 'product'
ALTER TABLE work_pack_items 
DROP CONSTRAINT IF EXISTS work_pack_items_item_type_check;

ALTER TABLE work_pack_items
ADD CONSTRAINT work_pack_items_item_type_check 
CHECK (item_type IN ('line_item', 'assembly', 'product'));

-- Create a view to get work pack details with products
CREATE OR REPLACE VIEW work_pack_details AS
SELECT 
    wp.id as work_pack_id,
    wp.name as work_pack_name,
    wp.description,
    wp.tier,
    wp.base_price,
    wp.industry_id,
    i.name as industry_name,
    wp.organization_id,
    wp.is_active,
    COUNT(DISTINCT wpi.id) as item_count,
    COUNT(DISTINCT CASE WHEN wpi.item_type = 'product' THEN wpi.id END) as product_count,
    COUNT(DISTINCT wpt.id) as task_count,
    COUNT(DISTINCT wpdt.document_template_id) as document_count,
    COALESCE(SUM(
        CASE 
            WHEN wpi.item_type = 'product' AND p.id IS NOT NULL 
            THEN wpi.quantity * COALESCE(wpi.price, p.price)
            WHEN wpi.item_type = 'line_item' AND li.id IS NOT NULL
            THEN wpi.quantity * COALESCE(wpi.price, li.price)
            ELSE 0
        END
    ), 0) as calculated_price
FROM work_packs wp
LEFT JOIN industries i ON wp.industry_id = i.id
LEFT JOIN work_pack_items wpi ON wp.id = wpi.work_pack_id
LEFT JOIN products p ON wpi.product_id = p.id
LEFT JOIN line_items li ON wpi.line_item_id = li.id
LEFT JOIN work_pack_tasks wpt ON wp.id = wpt.work_pack_id
LEFT JOIN work_pack_document_templates wpdt ON wp.id = wpdt.work_pack_id
GROUP BY 
    wp.id, wp.name, wp.description, wp.tier, wp.base_price, 
    wp.industry_id, i.name, wp.organization_id, wp.is_active;

-- Update service_type constraint to remove 'complete_project'
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_service_type_check;

ALTER TABLE products
ADD CONSTRAINT products_service_type_check 
CHECK (service_type IN (
  'installation',
  'service_call', 
  'repair',
  'maintenance',
  'inspection',
  'material',
  'equipment_rental',
  'subcontractor',
  'preparation',
  'finishing',
  'consultation'
));

-- Update existing 'complete_project' products to 'installation'
UPDATE products 
SET service_type = 'installation',
    updated_at = CURRENT_TIMESTAMP
WHERE service_type = 'complete_project';

-- Create function to get work packs for an organization
CREATE OR REPLACE FUNCTION get_organization_work_packs(p_organization_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    tier TEXT,
    base_price NUMERIC,
    industry_id UUID,
    industry_name TEXT,
    is_active BOOLEAN,
    item_count BIGINT,
    product_count BIGINT,
    task_count BIGINT,
    document_count BIGINT,
    calculated_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH org_industries AS (
        SELECT oi.industry_id
        FROM organization_industries oi
        WHERE oi.organization_id = p_organization_id
    )
    SELECT 
        wp.id,
        wp.name,
        wp.description,
        wp.tier,
        wp.base_price,
        wp.industry_id,
        i.name as industry_name,
        wp.is_active,
        COUNT(DISTINCT wpi.id) as item_count,
        COUNT(DISTINCT CASE WHEN wpi.item_type = 'product' THEN wpi.id END) as product_count,
        COUNT(DISTINCT wpt.id) as task_count,
        COUNT(DISTINCT wpdt.id) as document_count,
        COALESCE(SUM(
            CASE 
                WHEN wpi.item_type = 'product' AND p.id IS NOT NULL 
                THEN wpi.quantity * COALESCE(wpi.price, p.price)
                WHEN wpi.item_type = 'line_item' AND li.id IS NOT NULL
                THEN wpi.quantity * COALESCE(wpi.price, li.price)
                ELSE 0
            END
        ), 0) as calculated_price,
        wp.created_at,
        wp.updated_at
    FROM work_packs wp
    LEFT JOIN industries i ON wp.industry_id = i.id
    LEFT JOIN work_pack_items wpi ON wp.id = wpi.work_pack_id
    LEFT JOIN products p ON wpi.product_id = p.id
    LEFT JOIN line_items li ON wpi.line_item_id = li.id
    LEFT JOIN work_pack_tasks wpt ON wp.id = wpt.work_pack_id
    LEFT JOIN work_pack_document_templates wpdt ON wp.id = wpdt.work_pack_id
    WHERE wp.organization_id = p_organization_id
       OR (wp.organization_id IS NULL AND wp.industry_id IN (SELECT industry_id FROM org_industries))
    GROUP BY 
        wp.id, wp.name, wp.description, wp.tier, wp.base_price, 
        wp.industry_id, i.name, wp.is_active, wp.created_at, wp.updated_at
    ORDER BY i.name, wp.name;
END;
$$ LANGUAGE plpgsql;