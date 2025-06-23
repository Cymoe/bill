-- Database Function for Efficient Cost Code Retrieval
-- This function retrieves cost codes for an organization, including industry-specific codes

-- Drop function if exists to allow re-creation
DROP FUNCTION IF EXISTS get_organization_cost_codes(UUID);

-- Create optimized function for retrieving organization cost codes
CREATE OR REPLACE FUNCTION get_organization_cost_codes(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  code VARCHAR(10),
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(50),
  unit VARCHAR(50),
  base_price DECIMAL(10,2),
  organization_id UUID,
  industry_id UUID,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  industry_name VARCHAR(255),
  industry_icon VARCHAR(10),
  industry_color VARCHAR(50),
  item_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH org_industries AS (
    -- Get all industries associated with the organization
    SELECT oi.industry_id
    FROM organization_industries oi
    WHERE oi.organization_id = p_organization_id
  ),
  code_usage AS (
    -- Count how many line items use each cost code
    SELECT 
      li.cost_code_id,
      COUNT(DISTINCT li.id) as usage_count
    FROM line_items li
    WHERE li.organization_id = p_organization_id
    GROUP BY li.cost_code_id
  )
  SELECT 
    cc.id,
    cc.code,
    cc.name,
    cc.description,
    cc.category,
    cc.unit,
    cc.base_price,
    cc.organization_id,
    cc.industry_id,
    cc.is_active,
    cc.created_at,
    cc.updated_at,
    i.name as industry_name,
    i.icon as industry_icon,
    i.color as industry_color,
    COALESCE(cu.usage_count, 0) as item_count
  FROM cost_codes cc
  LEFT JOIN industries i ON cc.industry_id = i.id
  LEFT JOIN code_usage cu ON cc.id = cu.cost_code_id
  WHERE 
    cc.is_active = true
    AND (
      -- Include organization-specific cost codes
      cc.organization_id = p_organization_id
      OR (
        -- Include global cost codes for the organization's industries
        cc.organization_id IS NULL 
        AND cc.industry_id IN (SELECT industry_id FROM org_industries)
      )
    )
  ORDER BY 
    cc.industry_id,
    cc.code;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_organization_cost_codes(UUID) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_organization_cost_codes(UUID) IS 'Retrieves all cost codes available to an organization, including both organization-specific and industry-specific global codes';

-- Create an index to optimize the function's performance
CREATE INDEX IF NOT EXISTS idx_line_items_cost_code_org 
ON line_items(cost_code_id, organization_id);

-- Create a view for easy access to industry cost code counts
CREATE OR REPLACE VIEW industry_cost_code_summary AS
SELECT 
  i.id as industry_id,
  i.name as industry_name,
  i.slug as industry_slug,
  i.icon as industry_icon,
  COUNT(DISTINCT cc.id) as total_codes,
  COUNT(DISTINCT cc.id) FILTER (WHERE cc.category = 'labor') as labor_codes,
  COUNT(DISTINCT cc.id) FILTER (WHERE cc.category = 'material') as material_codes,
  COUNT(DISTINCT cc.id) FILTER (WHERE cc.category = 'equipment') as equipment_codes,
  COUNT(DISTINCT cc.id) FILTER (WHERE cc.category = 'subcontractor') as subcontractor_codes,
  COUNT(DISTINCT cc.id) FILTER (WHERE cc.category = 'service') as service_codes
FROM industries i
LEFT JOIN cost_codes cc ON cc.industry_id = i.id AND cc.organization_id IS NULL
WHERE i.is_active = true
GROUP BY i.id, i.name, i.slug, i.icon
ORDER BY i.display_order;

-- Grant select permission on the view
GRANT SELECT ON industry_cost_code_summary TO authenticated;

-- Create a function to copy industry cost codes to an organization
CREATE OR REPLACE FUNCTION copy_industry_codes_to_organization(
  p_organization_id UUID,
  p_industry_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  copied_count INTEGER;
BEGIN
  -- Copy all global cost codes for the specified industry to the organization
  WITH inserted AS (
    INSERT INTO cost_codes (
      organization_id,
      code,
      name,
      description,
      category,
      unit,
      base_price,
      industry_id,
      is_active
    )
    SELECT 
      p_organization_id,
      code,
      name,
      description,
      category,
      unit,
      base_price,
      industry_id,
      is_active
    FROM cost_codes
    WHERE 
      organization_id IS NULL 
      AND industry_id = p_industry_id
      AND is_active = true
      AND NOT EXISTS (
        -- Don't copy if organization already has this code
        SELECT 1 
        FROM cost_codes existing
        WHERE existing.organization_id = p_organization_id
        AND existing.code = cost_codes.code
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO copied_count FROM inserted;
  
  RETURN copied_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION copy_industry_codes_to_organization(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION copy_industry_codes_to_organization(UUID, UUID) IS 'Copies all global cost codes from a specific industry to an organization, avoiding duplicates';