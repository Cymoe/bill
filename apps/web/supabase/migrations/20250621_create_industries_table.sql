-- Create industries table if it doesn't exist
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_industries_slug ON industries(slug);
CREATE INDEX IF NOT EXISTS idx_industries_is_active ON industries(is_active);
CREATE INDEX IF NOT EXISTS idx_industries_display_order ON industries(display_order);

-- Create organization_industries junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS organization_industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, industry_id)
);

-- Create indexes for organization_industries
CREATE INDEX IF NOT EXISTS idx_org_industries_org_id ON organization_industries(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_industries_industry_id ON organization_industries(industry_id);

-- Enable RLS on industries table
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view active industries
CREATE POLICY "Anyone can view active industries" ON industries
  FOR SELECT
  USING (is_active = true);

-- Enable RLS on organization_industries
ALTER TABLE organization_industries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_industries
CREATE POLICY "Users can view their organization industries" ON organization_industries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organization_industries.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage organization industries" ON organization_industries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organization_industries.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- Insert all industries with proper display order
INSERT INTO industries (name, slug, description, icon, color, display_order, is_active)
VALUES 
  -- Construction Industries
  ('General Construction', 'general-construction', 'General contracting and construction services', '🏗️', '#6B7280', 10, true),
  ('Electrical', 'electrical', 'Electrical contracting and services', '⚡', '#F59E0B', 20, true),
  ('Plumbing', 'plumbing', 'Plumbing contracting and services', '🚿', '#3B82F6', 30, true),
  ('HVAC', 'hvac', 'Heating, ventilation, and air conditioning services', '❄️', '#06B6D4', 40, true),
  ('Roofing', 'roofing', 'Roofing installation and repair services', '🏠', '#DC2626', 50, true),
  ('Flooring', 'flooring', 'Flooring installation and refinishing services', '🪵', '#7C3AED', 60, true),
  ('Landscaping', 'landscaping', 'Landscaping and outdoor design services', '🌳', '#10B981', 70, true),
  
  -- Specialized Construction
  ('Commercial Construction', 'commercial-construction', 'Commercial building and tenant improvements', '🏢', '#1F2937', 80, true),
  ('Residential Construction', 'residential-construction', 'Specialized residential remodeling and renovation', '🏠', '#84CC16', 90, true),
  ('Kitchen Remodeling', 'kitchen-remodeling', 'Kitchen design and renovation services', '🍳', '#F97316', 100, true),
  ('Bathroom Remodeling', 'bathroom-remodeling', 'Bathroom design and renovation services', '🚿', '#8B5CF6', 110, true),
  
  -- Renewable Energy
  ('Solar', 'solar', 'Solar panel installation and renewable energy services', '☀️', '#FDE047', 120, true),
  
  -- Real Estate
  ('Property Management', 'property-management', 'Property management and maintenance services', '🔑', '#4B5563', 130, true),
  ('Real Estate Investment', 'real-estate-investment', 'Real estate investment and development', '🏡', '#059669', 140, true)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Add comments for documentation
COMMENT ON TABLE industries IS 'Master list of industries that organizations can select from';
COMMENT ON TABLE organization_industries IS 'Junction table linking organizations to their selected industries';
COMMENT ON COLUMN industries.display_order IS 'Controls the order industries appear in selection lists';
COMMENT ON COLUMN industries.color IS 'Hex color code for UI theming per industry';