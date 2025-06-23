-- Migration to implement the Service-Option-Package Model
-- This revolutionizes our product/variant/tier system into a cleaner architecture

-- Step 1: Create new tables for the Service-Option-Package model

-- Services table (what work is performed)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN (
    'installation',
    'repair', 
    'maintenance',
    'inspection',
    'consultation',
    'preparation',
    'finishing'
  )),
  icon TEXT,
  industry_id UUID REFERENCES industries(id),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure unique service names within an organization
  UNIQUE(organization_id, name)
);

-- Service Options table (specific implementations with prices)
CREATE TABLE service_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'each',
  estimated_hours DECIMAL(5,2),
  materials_list TEXT[], -- Array of included materials
  skill_level TEXT CHECK (skill_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false, -- For "most popular" badges
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata for better filtering
  material_quality TEXT CHECK (material_quality IN ('economy', 'standard', 'premium', 'luxury')),
  warranty_months INTEGER,
  
  -- Ensure unique option names within a service
  UNIQUE(service_id, name)
);

-- Service Packages table (bundles for complete projects)
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT CHECK (level IN ('essentials', 'complete', 'deluxe')) NOT NULL,
  base_price DECIMAL(10,2), -- Can be overridden by sum of options
  industry_id UUID REFERENCES industries(id),
  project_duration_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  
  -- Package metadata
  ideal_for TEXT[], -- e.g., ['First-time homeowners', 'Budget renovations']
  includes_warranty BOOLEAN DEFAULT false,
  
  -- Ensure unique package names within an organization
  UNIQUE(organization_id, name)
);

-- Service Package Items table (which options are in each package)
CREATE TABLE service_package_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID REFERENCES service_packages(id) ON DELETE CASCADE,
  service_option_id UUID REFERENCES service_options(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  is_optional BOOLEAN DEFAULT false,
  is_upgrade BOOLEAN DEFAULT false, -- Marks upgrade options
  display_order INTEGER DEFAULT 0,
  notes TEXT, -- Package-specific notes about this option
  
  -- Prevent duplicate options in same package
  UNIQUE(package_id, service_option_id)
);

-- Create indexes for performance
CREATE INDEX idx_services_organization ON services(organization_id);
CREATE INDEX idx_services_industry ON services(industry_id);
CREATE INDEX idx_service_options_service ON service_options(service_id);
CREATE INDEX idx_service_options_price ON service_options(price);
CREATE INDEX idx_service_packages_organization ON service_packages(organization_id);
CREATE INDEX idx_service_packages_level ON service_packages(level);
CREATE INDEX idx_service_package_items_package ON service_package_items(package_id);

-- Create views for easier querying

-- Service with options count
CREATE VIEW services_with_options AS
SELECT 
  s.*,
  COUNT(DISTINCT so.id) as option_count,
  MIN(so.price) as min_price,
  MAX(so.price) as max_price,
  AVG(so.price) as avg_price
FROM services s
LEFT JOIN service_options so ON s.id = so.service_id AND so.is_active = true
GROUP BY s.id;

-- Package details with calculated price
CREATE VIEW service_package_details AS
SELECT 
  sp.*,
  COUNT(DISTINCT spi.id) as item_count,
  COUNT(DISTINCT CASE WHEN spi.is_optional = false THEN spi.id END) as required_item_count,
  COALESCE(SUM(
    CASE WHEN spi.is_optional = false 
    THEN spi.quantity * so.price 
    ELSE 0 END
  ), 0) as calculated_price,
  i.name as industry_name
FROM service_packages sp
LEFT JOIN service_package_items spi ON sp.id = spi.package_id
LEFT JOIN service_options so ON spi.service_option_id = so.id
LEFT JOIN industries i ON sp.industry_id = i.id
GROUP BY sp.id, i.name;

-- RLS Policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_package_items ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Users can view their organization's services" ON services
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid()
    )
    OR organization_id IS NULL -- System services
  );

CREATE POLICY "Users can create services for their organization" ON services
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update their organization's services" ON services
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view service options" ON service_options
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid()
    )
    OR organization_id IS NULL
  );

CREATE POLICY "Users can manage service options" ON service_options
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view service packages" ON service_packages
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid()
    )
    OR organization_id IS NULL
  );

CREATE POLICY "Users can manage service packages" ON service_packages
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view package items" ON service_package_items
  FOR SELECT USING (
    package_id IN (
      SELECT id FROM service_packages WHERE organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid()
      ) OR organization_id IS NULL
    )
  );

CREATE POLICY "Users can manage package items" ON service_package_items
  FOR ALL USING (
    package_id IN (
      SELECT id FROM service_packages WHERE organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
      )
    )
  );

-- Function to get services for an organization (similar to products)
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
    s.created_at,
    s.updated_at
  FROM services s
  LEFT JOIN industries i ON s.industry_id = i.id
  LEFT JOIN service_options so ON s.id = so.service_id AND so.is_active = true
  WHERE s.organization_id = p_organization_id
     OR (s.organization_id IS NULL AND s.industry_id IN (SELECT industry_id FROM org_industries))
  GROUP BY s.id, s.name, s.description, s.category, s.icon, s.industry_id, i.name, s.is_active, s.created_at, s.updated_at
  ORDER BY s.display_order, s.name;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON TABLE services IS 'Core services offered (e.g., Door Installation, Plumbing Repair)';
COMMENT ON TABLE service_options IS 'Specific implementations of services with materials and pricing';
COMMENT ON TABLE service_packages IS 'Bundled service options for complete projects';
COMMENT ON TABLE service_package_items IS 'Junction table linking service options to packages';

COMMENT ON COLUMN service_options.materials_list IS 'Array of materials included in this service option';
COMMENT ON COLUMN service_options.material_quality IS 'Quality tier of materials used';
COMMENT ON COLUMN service_packages.level IS 'Package tier: essentials (basic), complete (standard), deluxe (premium)';
COMMENT ON COLUMN service_package_items.is_upgrade IS 'Whether this option is an upgrade from the base package';