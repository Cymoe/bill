-- Data Migration Script: Transform Products/Work Packs to Service-Option-Package Model
-- This preserves all existing data while transforming it to the new structure

-- Step 1: Migrate base products to services
INSERT INTO services (
  id,
  organization_id,
  name,
  description,
  category,
  industry_id,
  is_active,
  display_order,
  created_at,
  updated_at
)
SELECT DISTINCT ON (p.name, p.organization_id, p.industry_id)
  uuid_generate_v4() as id,
  p.organization_id,
  p.name as name,
  p.description,
  CASE 
    WHEN p.service_type = 'installation' THEN 'installation'
    WHEN p.service_type = 'repair' THEN 'repair'
    WHEN p.service_type = 'maintenance' THEN 'maintenance'
    WHEN p.service_type = 'inspection' THEN 'inspection'
    WHEN p.service_type = 'consultation' THEN 'consultation'
    WHEN p.service_type = 'preparation' THEN 'preparation'
    WHEN p.service_type = 'finishing' THEN 'finishing'
    ELSE 'installation' -- default
  END as category,
  p.industry_id,
  p.status = 'active' as is_active,
  ROW_NUMBER() OVER (PARTITION BY p.organization_id ORDER BY p.created_at) as display_order,
  MIN(p.created_at) as created_at,
  MAX(p.updated_at) as updated_at
FROM products p
WHERE p.parent_product_id IS NULL -- Only parent products become services
GROUP BY p.name, p.organization_id, p.description, p.service_type, p.industry_id, p.status;

-- Step 2: Create a mapping table to track product -> service relationships
CREATE TEMP TABLE product_to_service_map AS
SELECT 
  p.id as product_id,
  p.parent_product_id,
  s.id as service_id,
  p.name as product_name,
  p.variant_name,
  p.quality_tier,
  p.price,
  p.unit,
  p.organization_id
FROM products p
JOIN services s ON 
  s.organization_id IS NOT DISTINCT FROM p.organization_id
  AND s.name = COALESCE(
    (SELECT name FROM products parent WHERE parent.id = p.parent_product_id),
    p.name
  )
  AND s.industry_id IS NOT DISTINCT FROM p.industry_id;

-- Step 3: Migrate all products (including variants) to service options
INSERT INTO service_options (
  id,
  service_id,
  organization_id,
  name,
  description,
  price,
  unit,
  material_quality,
  is_active,
  display_order,
  created_at,
  updated_at
)
SELECT 
  p.id, -- Preserve product ID for relationship mapping
  map.service_id,
  p.organization_id,
  CASE 
    WHEN p.variant_name IS NOT NULL AND p.quality_tier IS NOT NULL THEN 
      p.variant_name || ' - ' || 
      CASE p.quality_tier 
        WHEN 'basic' THEN 'Economy'
        WHEN 'standard' THEN 'Standard'
        WHEN 'premium' THEN 'Premium'
        ELSE INITCAP(p.quality_tier)
      END
    WHEN p.variant_name IS NOT NULL THEN p.variant_name
    WHEN p.quality_tier IS NOT NULL THEN 
      p.name || ' - ' || 
      CASE p.quality_tier 
        WHEN 'basic' THEN 'Economy'
        WHEN 'standard' THEN 'Standard'
        WHEN 'premium' THEN 'Premium'
        ELSE INITCAP(p.quality_tier)
      END
    ELSE p.name
  END as name,
  p.description,
  p.price,
  p.unit,
  CASE p.quality_tier
    WHEN 'basic' THEN 'economy'
    WHEN 'standard' THEN 'standard'
    WHEN 'premium' THEN 'premium'
    ELSE 'standard'
  END as material_quality,
  p.status = 'active' as is_active,
  ROW_NUMBER() OVER (PARTITION BY map.service_id ORDER BY p.quality_tier, p.variant_name, p.created_at) as display_order,
  p.created_at,
  p.updated_at
FROM products p
JOIN product_to_service_map map ON p.id = map.product_id;

-- Step 4: Migrate work packs to service packages
INSERT INTO service_packages (
  id,
  organization_id,
  name,
  description,
  level,
  base_price,
  industry_id,
  is_active,
  display_order,
  created_at,
  updated_at
)
SELECT 
  wp.id, -- Preserve work pack ID
  wp.organization_id,
  wp.name,
  wp.description,
  CASE wp.tier
    WHEN 'basic' THEN 'essentials'
    WHEN 'standard' THEN 'complete'
    WHEN 'premium' THEN 'deluxe'
    ELSE 'complete'
  END as level,
  wp.base_price,
  wp.industry_id,
  wp.is_active,
  wp.display_order,
  wp.created_at,
  wp.updated_at
FROM work_packs wp;

-- Step 5: Migrate work pack items to service package items
INSERT INTO service_package_items (
  package_id,
  service_option_id,
  quantity,
  is_optional,
  display_order
)
SELECT 
  wpi.work_pack_id as package_id,
  wpi.product_id as service_option_id, -- Products became service options with same IDs
  wpi.quantity,
  wpi.is_optional,
  wpi.display_order
FROM work_pack_items wpi
WHERE wpi.item_type = 'product'
  AND EXISTS (SELECT 1 FROM service_options so WHERE so.id = wpi.product_id);

-- Step 6: Update any foreign key references

-- Update invoice items to reference service options
ALTER TABLE invoice_items ADD COLUMN service_option_id UUID REFERENCES service_options(id);
UPDATE invoice_items ii 
SET service_option_id = ii.product_id 
WHERE ii.product_id IS NOT NULL 
  AND EXISTS (SELECT 1 FROM service_options so WHERE so.id = ii.product_id);

-- Update estimate items similarly
ALTER TABLE estimate_items ADD COLUMN service_option_id UUID REFERENCES service_options(id);
UPDATE estimate_items ei 
SET service_option_id = ei.product_id 
WHERE ei.product_id IS NOT NULL 
  AND EXISTS (SELECT 1 FROM service_options so WHERE so.id = ei.product_id);

-- Step 7: Create migration tracking table
CREATE TABLE migration_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  migration_name TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  records_migrated INTEGER,
  notes TEXT
);

INSERT INTO migration_status (migration_name, status, completed_at, records_migrated, notes)
VALUES (
  'products_to_services_migration',
  'completed',
  CURRENT_TIMESTAMP,
  (SELECT COUNT(*) FROM products),
  'Successfully migrated products to service-option model'
);

-- Step 8: Add backward compatibility views (temporary during transition)
CREATE VIEW products_compatibility AS
SELECT 
  so.id,
  so.organization_id,
  so.name,
  so.description,
  so.price,
  s.category as type,
  so.created_at,
  'service_option' as source,
  so.unit,
  'active' as status,
  true as favorite,
  s.industry_id,
  so.material_quality as quality_tier,
  s.name as parent_product_name,
  so.service_id as parent_product_id,
  CASE 
    WHEN so.name LIKE '% - Economy%' THEN REPLACE(so.name, ' - Economy', '')
    WHEN so.name LIKE '% - Standard%' THEN REPLACE(so.name, ' - Standard', '')
    WHEN so.name LIKE '% - Premium%' THEN REPLACE(so.name, ' - Premium', '')
    ELSE so.name
  END as variant_name
FROM service_options so
JOIN services s ON so.service_id = s.id;

CREATE VIEW work_packs_compatibility AS
SELECT 
  sp.id,
  sp.organization_id,
  sp.name,
  sp.description,
  CASE sp.level
    WHEN 'essentials' THEN 'basic'
    WHEN 'complete' THEN 'standard'
    WHEN 'deluxe' THEN 'premium'
  END as tier,
  sp.base_price,
  sp.industry_id,
  sp.is_active,
  sp.display_order,
  sp.created_at,
  sp.updated_at
FROM service_packages sp;

-- Add comments
COMMENT ON TABLE migration_status IS 'Tracks data migration progress from old to new model';
COMMENT ON VIEW products_compatibility IS 'Backward compatibility view during transition from products to services';
COMMENT ON VIEW work_packs_compatibility IS 'Backward compatibility view during transition from work packs to service packages';