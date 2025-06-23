-- Refinements to the Service-Option-Package Model based on feedback
-- 1. Remove base_price from service_packages for clarity
-- 2. Update views to calculate pricing dynamically
-- 3. Prepare materials_list for future normalization

-- Step 1: Remove base_price from service_packages
ALTER TABLE service_packages DROP COLUMN IF EXISTS base_price;

-- Step 2: Update the service_package_details view with better pricing calculation
DROP VIEW IF EXISTS service_package_details;

CREATE VIEW service_package_details AS
SELECT 
  sp.id,
  sp.organization_id,
  sp.name,
  sp.description,
  sp.level,
  sp.industry_id,
  sp.project_duration_days,
  sp.ideal_for,
  sp.includes_warranty,
  sp.is_active,
  sp.display_order,
  sp.created_at,
  sp.updated_at,
  i.name as industry_name,
  -- Item counts
  COUNT(DISTINCT spi.id) as total_item_count,
  COUNT(DISTINCT CASE WHEN spi.is_optional = false THEN spi.id END) as required_item_count,
  COUNT(DISTINCT CASE WHEN spi.is_optional = true THEN spi.id END) as optional_item_count,
  COUNT(DISTINCT CASE WHEN spi.is_upgrade = true THEN spi.id END) as upgrade_item_count,
  -- Pricing calculations
  COALESCE(SUM(
    CASE WHEN spi.is_optional = false AND spi.is_upgrade = false
    THEN spi.quantity * so.price 
    ELSE 0 END
  ), 0) as package_price,
  COALESCE(SUM(
    CASE WHEN spi.is_optional = true AND spi.is_upgrade = false
    THEN spi.quantity * so.price 
    ELSE 0 END
  ), 0) as optional_items_value,
  COALESCE(SUM(
    CASE WHEN spi.is_upgrade = true
    THEN spi.quantity * so.price 
    ELSE 0 END
  ), 0) as upgrade_items_value,
  -- Total potential value (all items)
  COALESCE(SUM(spi.quantity * so.price), 0) as total_potential_value
FROM service_packages sp
LEFT JOIN industries i ON sp.industry_id = i.id
LEFT JOIN service_package_items spi ON sp.id = spi.package_id
LEFT JOIN service_options so ON spi.service_option_id = so.id AND so.is_active = true
GROUP BY 
  sp.id, sp.organization_id, sp.name, sp.description, sp.level,
  sp.industry_id, sp.project_duration_days, sp.ideal_for,
  sp.includes_warranty, sp.is_active, sp.display_order,
  sp.created_at, sp.updated_at, i.name;

-- Step 3: Add structured materials format guidance
COMMENT ON COLUMN service_options.materials_list IS 
'Array of materials in format: "SKU:Name:Quantity:Unit" for future normalization. 
Example: ["WD-2X4-10:2x4 Lumber:10:ft", "HW-WS-50:Wood Screws:50:count"]';

-- Step 4: Create helper function to parse materials (prep for future normalization)
CREATE OR REPLACE FUNCTION parse_material_string(material_string TEXT)
RETURNS TABLE (
  sku TEXT,
  name TEXT,
  quantity DECIMAL,
  unit TEXT
) AS $$
BEGIN
  -- Handle both old format ("2x4 Lumber (10ft)") and new format ("WD-2X4-10:2x4 Lumber:10:ft")
  IF material_string LIKE '%:%:%:%' THEN
    -- New structured format
    RETURN QUERY
    SELECT 
      split_part(material_string, ':', 1) as sku,
      split_part(material_string, ':', 2) as name,
      split_part(material_string, ':', 3)::DECIMAL as quantity,
      split_part(material_string, ':', 4) as unit;
  ELSE
    -- Legacy format - extract what we can
    RETURN QUERY
    SELECT 
      NULL::TEXT as sku,
      regexp_replace(material_string, '\s*\([^)]*\)\s*$', '') as name,
      CASE 
        WHEN material_string ~ '\((\d+(?:\.\d+)?)'
        THEN (regexp_match(material_string, '\((\d+(?:\.\d+)?)'))[1]::DECIMAL
        ELSE 1::DECIMAL
      END as quantity,
      CASE
        WHEN material_string ~ '\(\d+(?:\.\d+)?\s*([^)]+)\)'
        THEN (regexp_match(material_string, '\(\d+(?:\.\d+)?\s*([^)]+)\)'))[1]
        ELSE 'each'::TEXT
      END as unit;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create material extraction view for analysis
CREATE VIEW service_option_materials_analysis AS
SELECT 
  so.id as service_option_id,
  so.name as service_option_name,
  mat.material_string,
  (parse_material_string(mat.material_string)).*
FROM service_options so
CROSS JOIN LATERAL unnest(so.materials_list) AS mat(material_string)
WHERE so.materials_list IS NOT NULL;

-- Step 6: Update the function to exclude base_price
DROP FUNCTION IF EXISTS get_organization_services(UUID);

CREATE OR REPLACE FUNCTION get_organization_services(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  icon TEXT,
  industry_id UUID,
  industry_name TEXT,
  is_active BOOLEAN,
  option_count BIGINT,
  min_price NUMERIC,
  max_price NUMERIC,
  avg_price NUMERIC,
  total_materials_count BIGINT,
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
    s.id,
    s.name,
    s.description,
    s.category,
    s.icon,
    s.industry_id,
    i.name as industry_name,
    s.is_active,
    COUNT(DISTINCT so.id) as option_count,
    MIN(so.price) as min_price,
    MAX(so.price) as max_price,
    AVG(so.price) as avg_price,
    COALESCE(SUM(array_length(so.materials_list, 1)), 0) as total_materials_count,
    s.created_at,
    s.updated_at
  FROM services s
  LEFT JOIN industries i ON s.industry_id = i.id
  LEFT JOIN service_options so ON s.id = so.service_id AND so.is_active = true
  WHERE s.organization_id = p_organization_id
     OR (s.organization_id IS NULL AND s.industry_id IN (SELECT industry_id FROM org_industries))
  GROUP BY 
    s.id, s.name, s.description, s.category, s.icon, 
    s.industry_id, i.name, s.is_active, s.created_at, s.updated_at
  ORDER BY s.display_order, s.name;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create package pricing summary view
CREATE VIEW package_pricing_summary AS
SELECT
  sp.id,
  sp.name,
  sp.level,
  sp.organization_id,
  -- Clear pricing breakdown
  spd.package_price as base_package_price,
  spd.optional_items_value as available_addons_value,
  spd.upgrade_items_value as available_upgrades_value,
  spd.package_price as starting_at_price,
  spd.total_potential_value as up_to_price,
  -- Readable price range
  CASE 
    WHEN spd.optional_items_value > 0 OR spd.upgrade_items_value > 0 THEN
      format('$%s - $%s', 
        to_char(spd.package_price, 'FM999,999'),
        to_char(spd.total_potential_value, 'FM999,999')
      )
    ELSE 
      format('$%s', to_char(spd.package_price, 'FM999,999'))
  END as price_range_display
FROM service_packages sp
JOIN service_package_details spd ON sp.id = spd.id
WHERE sp.is_active = true;

-- Step 8: Add validation trigger to ensure packages have at least one required item
CREATE OR REPLACE FUNCTION validate_package_has_required_items()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check on delete or update that might remove required items
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.is_optional = true) THEN
    -- Check if package still has at least one required item
    IF NOT EXISTS (
      SELECT 1 
      FROM service_package_items spi
      WHERE spi.package_id = COALESCE(OLD.package_id, NEW.package_id)
        AND spi.is_optional = false
        AND spi.id != COALESCE(OLD.id, NEW.id)
    ) THEN
      RAISE EXCEPTION 'Service package must have at least one required item';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_package_has_required_items
  BEFORE UPDATE OR DELETE ON service_package_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_package_has_required_items();

-- Step 9: Add helpful indexes for the new views
CREATE INDEX IF NOT EXISTS idx_service_package_items_optional 
  ON service_package_items(is_optional);
CREATE INDEX IF NOT EXISTS idx_service_package_items_upgrade 
  ON service_package_items(is_upgrade);

-- Step 10: Migration helper - Update any existing base_price references
-- This updates the migration compatibility view
DROP VIEW IF EXISTS work_packs_compatibility;

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
  spd.package_price as base_price, -- Now calculated dynamically
  sp.industry_id,
  sp.is_active,
  sp.display_order,
  sp.created_at,
  sp.updated_at
FROM service_packages sp
LEFT JOIN service_package_details spd ON sp.id = spd.id;

-- Add helpful comments
COMMENT ON VIEW service_package_details IS 
'Comprehensive view of service packages with dynamic pricing calculations. 
Package price is the sum of all required, non-upgrade items.';

COMMENT ON VIEW package_pricing_summary IS 
'Simplified pricing view for service packages showing clear price ranges';

COMMENT ON FUNCTION parse_material_string IS 
'Parses material strings in both legacy and structured formats, preparing for future materials table normalization';

COMMENT ON VIEW service_option_materials_analysis IS 
'Extracts and parses all materials from service options for analysis and future migration';

-- Log the refinement
INSERT INTO migration_status (migration_name, status, completed_at, notes)
VALUES (
  'service_model_refinements',
  'completed',
  CURRENT_TIMESTAMP,
  'Removed base_price ambiguity, added material parsing prep, improved pricing calculations'
);