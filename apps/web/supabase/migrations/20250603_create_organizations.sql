-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry_id UUID REFERENCES industries(id),
  description TEXT,
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_organizations junction table (many-to-many)
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  is_default BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, organization_id)
);

-- Add organization_id to existing tables for multi-tenancy
ALTER TABLE projects ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE work_packs ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE products ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE clients ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE invoices ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE tasks ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE expenses ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Create indexes for performance
CREATE INDEX idx_organizations_industry_id ON organizations(industry_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON user_organizations(organization_id);
CREATE INDEX idx_user_organizations_default ON user_organizations(user_id, is_default) WHERE is_default = true;

-- Create indexes on organization_id for all tables
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_work_packs_organization_id ON work_packs(organization_id);
CREATE INDEX idx_products_organization_id ON products(organization_id);
CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX idx_expenses_organization_id ON expenses(organization_id);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update their organization" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for user_organizations
CREATE POLICY "Users can view their own organization memberships" ON user_organizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organization admins can manage memberships" ON user_organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = user_organizations.organization_id
      AND uo.user_id = auth.uid()
      AND uo.role IN ('owner', 'admin')
    )
  );

-- Function to create default organization for new users
CREATE OR REPLACE FUNCTION create_default_organization_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name TEXT;
  org_slug TEXT;
BEGIN
  -- Get user's name or email for organization name
  SELECT 
    COALESCE(raw_user_meta_data->>'full_name', email) INTO user_name
  FROM auth.users 
  WHERE id = NEW.id;
  
  -- Generate unique slug
  org_slug := regexp_replace(lower(user_name), '[^a-z0-9]+', '-', 'g');
  org_slug := org_slug || '-' || substr(NEW.id::text, 1, 8);
  
  -- Create organization
  INSERT INTO organizations (name, slug, industry_id)
  VALUES (
    user_name || '''s Company',
    org_slug,
    (SELECT id FROM industries WHERE name = 'General Construction' LIMIT 1)
  )
  RETURNING id INTO new_org_id;
  
  -- Link user to organization as owner
  INSERT INTO user_organizations (user_id, organization_id, role, is_default)
  VALUES (NEW.id, new_org_id, 'owner', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER create_default_org_on_user_create
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_organization_for_user();

-- Update existing users to have organizations
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  user_name TEXT;
  org_slug TEXT;
BEGIN
  FOR user_record IN SELECT id FROM users WHERE NOT EXISTS (
    SELECT 1 FROM user_organizations WHERE user_id = users.id
  ) LOOP
    -- Get user's name or email
    SELECT 
      COALESCE(raw_user_meta_data->>'full_name', email) INTO user_name
    FROM auth.users 
    WHERE id = user_record.id;
    
    -- Generate unique slug
    org_slug := regexp_replace(lower(user_name), '[^a-z0-9]+', '-', 'g');
    org_slug := org_slug || '-' || substr(user_record.id::text, 1, 8);
    
    -- Create organization
    INSERT INTO organizations (name, slug, industry_id)
    VALUES (
      user_name || '''s Company',
      org_slug,
      (SELECT id FROM industries WHERE name = 'General Construction' LIMIT 1)
    )
    RETURNING id INTO new_org_id;
    
    -- Link user to organization
    INSERT INTO user_organizations (user_id, organization_id, role, is_default)
    VALUES (user_record.id, new_org_id, 'owner', true);
    
    -- Update user's existing data to belong to this organization
    UPDATE projects SET organization_id = new_org_id WHERE user_id = user_record.id;
    UPDATE work_packs SET organization_id = new_org_id WHERE user_id = user_record.id;
    UPDATE products SET organization_id = new_org_id WHERE user_id = user_record.id;
    UPDATE clients SET organization_id = new_org_id WHERE user_id = user_record.id;
    UPDATE invoices SET organization_id = new_org_id WHERE user_id = user_record.id;
    UPDATE tasks SET organization_id = new_org_id WHERE user_id = user_record.id;
    UPDATE expenses SET organization_id = new_org_id WHERE user_id = user_record.id;
  END LOOP;
END $$;

-- Update RLS policies for existing tables to include organization checks
-- Example for work_packs (apply similar pattern to other tables)
DROP POLICY IF EXISTS "Users can view their own work packs" ON work_packs;
CREATE POLICY "Users can view work packs in their organizations" ON work_packs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = work_packs.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create their own work packs" ON work_packs;
CREATE POLICY "Users can create work packs in their organizations" ON work_packs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = work_packs.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

-- Add function to get user's current organization
CREATE OR REPLACE FUNCTION get_user_current_organization(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  industry_id UUID,
  industry_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.industry_id,
    i.name as industry_name
  FROM organizations o
  JOIN user_organizations uo ON o.id = uo.organization_id
  LEFT JOIN industries i ON o.industry_id = i.id
  WHERE uo.user_id = $1
  AND uo.is_default = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql; 