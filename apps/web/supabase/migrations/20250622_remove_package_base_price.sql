-- Remove base_price from service_packages as pricing should be dynamically calculated
ALTER TABLE service_packages DROP COLUMN IF EXISTS base_price;

-- Create a view for service package details with dynamic pricing
CREATE OR REPLACE VIEW service_package_details AS
SELECT
  sp.id,
  sp.organization_id,
  sp.name,
  sp.description,
  sp.industry_id,
  sp.is_active,
  sp.created_at,
  sp.updated_at,
  sp.display_order,
  -- Calculate package price from required items only
  COALESCE(SUM(
    CASE WHEN spi.is_optional = false
    THEN spi.quantity * so.price
    ELSE 0 END
  ), 0) as package_price,
  -- Calculate optional items value separately
  COALESCE(SUM(
    CASE WHEN spi.is_optional = true
    THEN spi.quantity * so.price
    ELSE 0 END
  ), 0) as optional_items_value,
  -- Total value including optional items
  COALESCE(SUM(spi.quantity * so.price), 0) as total_value,
  -- Count of services
  COUNT(DISTINCT spi.service_id) as service_count,
  -- Count of required vs optional items
  COUNT(DISTINCT CASE WHEN spi.is_optional = false THEN spi.id END) as required_items_count,
  COUNT(DISTINCT CASE WHEN spi.is_optional = true THEN spi.id END) as optional_items_count
FROM service_packages sp
LEFT JOIN service_package_items spi ON sp.id = spi.package_id
LEFT JOIN service_options so ON spi.service_option_id = so.id
GROUP BY sp.id, sp.organization_id, sp.name, sp.description, sp.industry_id, 
         sp.is_active, sp.created_at, sp.updated_at, sp.display_order;

-- Add helpful comment
COMMENT ON VIEW service_package_details IS 'Provides service package information with dynamically calculated pricing based on included service options';