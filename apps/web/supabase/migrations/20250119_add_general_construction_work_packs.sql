-- General Construction Work Packs Migration
-- Creates comprehensive work packs for all general construction project types

-- Create work_packs table if it doesn't exist
CREATE TABLE IF NOT EXISTS work_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry_id UUID REFERENCES industries(id),
  project_type_id UUID REFERENCES project_categories(id),
  tier VARCHAR(20) CHECK (tier IN ('budget', 'standard', 'premium')),
  base_price DECIMAL(12,2),
  estimated_hours INTEGER,
  typical_duration_days INTEGER,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Create work_pack_items table for products in work packs
CREATE TABLE IF NOT EXISTS work_pack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_pack_id UUID REFERENCES work_packs(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  cost_code_id UUID REFERENCES cost_codes(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  notes TEXT,
  display_order INTEGER DEFAULT 0
);

-- Create work_pack_tasks table
CREATE TABLE IF NOT EXISTS work_pack_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_pack_id UUID REFERENCES work_packs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_hours INTEGER,
  priority VARCHAR(20) DEFAULT 'medium',
  display_order INTEGER DEFAULT 0
);

-- Create work_pack_documents table
CREATE TABLE IF NOT EXISTS work_pack_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_pack_id UUID REFERENCES work_packs(id) ON DELETE CASCADE,
  document_template_id UUID REFERENCES document_templates(id),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_work_packs_org_id ON work_packs(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_packs_industry_id ON work_packs(industry_id);
CREATE INDEX IF NOT EXISTS idx_work_packs_project_type_id ON work_packs(project_type_id);
CREATE INDEX IF NOT EXISTS idx_work_pack_items_work_pack_id ON work_pack_items(work_pack_id);
CREATE INDEX IF NOT EXISTS idx_work_pack_tasks_work_pack_id ON work_pack_tasks(work_pack_id);
CREATE INDEX IF NOT EXISTS idx_work_pack_documents_work_pack_id ON work_pack_documents(work_pack_id);

-- Enable RLS
ALTER TABLE work_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_pack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_pack_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_pack_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_packs
CREATE POLICY "Users can view work packs in their organizations" ON work_packs
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_packs.organization_id
    )
  );

-- Function to create comprehensive work packs
CREATE OR REPLACE FUNCTION create_general_construction_work_packs()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
  v_project_type RECORD;
  v_work_pack_id UUID;
BEGIN
  -- Get general construction industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'general-construction'
  LIMIT 1;

  -- Create work packs for each project type
  FOR v_project_type IN 
    SELECT id, slug, name 
    FROM project_categories 
    WHERE industry_id = v_industry_id
  LOOP
    -- Create Budget, Standard, and Premium work packs based on project type
    CASE v_project_type.slug
      WHEN 'new-home-construction' THEN
        -- Budget Tier - $150-200/sq ft (2000 sq ft = $300,000-400,000)
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget New Home Construction',
          'Basic single-family home with standard finishes and builder-grade materials',
          v_industry_id, v_project_type.id, 'budget',
          350000.00, 1200, 120, true
        ) RETURNING id INTO v_work_pack_id;
        
        -- Add work pack items (products) for budget tier
        INSERT INTO work_pack_items (work_pack_id, cost_code_id, quantity, unit_price)
        SELECT v_work_pack_id, id, 
          CASE 
            WHEN code = '01100' THEN 1 -- Building Permit
            WHEN code = '02200' THEN 500 -- Excavation (cy)
            WHEN code = '03310' THEN 2000 -- Slab on Grade (sf)
            WHEN code = '06100' THEN 2000 -- Rough Carpentry (sf)
            WHEN code = '07200' THEN 5000 -- Wall Insulation (sf)
            WHEN code = '08110' THEN 25 -- Interior Doors
            WHEN code = '09200' THEN 8000 -- Drywall (sf)
            WHEN code = '09410' THEN 1500 -- Laminate Flooring (sf)
            WHEN code = '15100' THEN 15 -- Plumbing Fixtures
            WHEN code = '16300' THEN 50 -- Electrical Outlets
            ELSE 1
          END,
          base_price
        FROM cost_codes
        WHERE code IN ('01100','02200','03310','06100','07200','08110','09200','09410','15100','16300');

        -- Standard Tier - $250-350/sq ft
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard New Home Construction',
          'Quality home with upgraded finishes, energy-efficient features, and brand-name fixtures',
          v_industry_id, v_project_type.id, 'standard',
          600000.00, 1600, 150, true
        ) RETURNING id INTO v_work_pack_id;

        -- Premium Tier - $400-600/sq ft
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium New Home Construction',
          'Luxury custom home with high-end finishes, smart home features, and premium materials',
          v_industry_id, v_project_type.id, 'premium',
          1000000.00, 2400, 210, true
        );

      WHEN 'home-addition' THEN
        -- Budget Addition
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Home Addition',
          'Basic room addition with standard finishes, 400-600 sq ft',
          v_industry_id, v_project_type.id, 'budget',
          75000.00, 400, 45, true
        );

        -- Standard Addition
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Home Addition',
          'Quality addition with good finishes and proper integration, 600-800 sq ft',
          v_industry_id, v_project_type.id, 'standard',
          150000.00, 600, 60, true
        );

        -- Premium Addition
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Home Addition',
          'Luxury master suite or great room addition with high-end finishes, 800-1200 sq ft',
          v_industry_id, v_project_type.id, 'premium',
          300000.00, 900, 90, true
        );

      WHEN 'office-buildout' THEN
        -- Budget Office
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Office Build-Out',
          'Basic office space with standard finishes, 2000-3000 sq ft',
          v_industry_id, v_project_type.id, 'budget',
          120000.00, 600, 30, true
        );

        -- Standard Office
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Office Build-Out',
          'Professional office with quality finishes, conference rooms, 3000-5000 sq ft',
          v_industry_id, v_project_type.id, 'standard',
          250000.00, 900, 45, true
        );

        -- Premium Office
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Office Build-Out',
          'Executive office suite with high-end finishes, custom millwork, 5000+ sq ft',
          v_industry_id, v_project_type.id, 'premium',
          500000.00, 1400, 60, true
        );

      WHEN 'whole-house-renovation' THEN
        -- Budget Renovation
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Whole House Renovation',
          'Cosmetic updates, paint, flooring, and fixture replacements',
          v_industry_id, v_project_type.id, 'budget',
          80000.00, 600, 60, true
        );

        -- Standard Renovation
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Whole House Renovation',
          'Full renovation including kitchen, baths, systems updates',
          v_industry_id, v_project_type.id, 'standard',
          200000.00, 1200, 120, true
        );

        -- Premium Renovation
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Whole House Renovation',
          'Complete luxury renovation with structural changes and additions',
          v_industry_id, v_project_type.id, 'premium',
          500000.00, 2000, 180, true
        );

      WHEN 'adu-construction' THEN
        -- Budget ADU
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget ADU Construction',
          'Basic 400-600 sq ft ADU with standard finishes',
          v_industry_id, v_project_type.id, 'budget',
          120000.00, 600, 90, true
        );

        -- Standard ADU
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard ADU Construction',
          'Quality 600-800 sq ft ADU with good finishes',
          v_industry_id, v_project_type.id, 'standard',
          200000.00, 800, 120, true
        );

        -- Premium ADU
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium ADU Construction',
          'Luxury 800-1200 sq ft ADU with high-end finishes',
          v_industry_id, v_project_type.id, 'premium',
          350000.00, 1200, 150, true
        );

      ELSE
        -- Default work packs for other project types
        -- Budget
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget ' || v_project_type.name,
          'Basic ' || LOWER(v_project_type.name) || ' with standard materials and finishes',
          v_industry_id, v_project_type.id, 'budget',
          50000.00, 300, 30, true
        );

        -- Standard
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard ' || v_project_type.name,
          'Quality ' || LOWER(v_project_type.name) || ' with upgraded materials and finishes',
          v_industry_id, v_project_type.id, 'standard',
          100000.00, 500, 45, true
        );

        -- Premium
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium ' || v_project_type.name,
          'High-end ' || LOWER(v_project_type.name) || ' with luxury materials and custom features',
          v_industry_id, v_project_type.id, 'premium',
          200000.00, 800, 60, true
        );
    END CASE;
  END LOOP;

  -- Add common tasks to all work packs
  INSERT INTO work_pack_tasks (work_pack_id, title, description, estimated_hours, priority, display_order)
  SELECT 
    wp.id,
    t.title,
    t.description,
    t.hours,
    t.priority,
    t.ord
  FROM work_packs wp
  CROSS JOIN (VALUES
    ('Initial Consultation', 'Meet with client and assess project scope', 4, 'high', 1),
    ('Design & Planning', 'Create detailed plans and specifications', 16, 'high', 2),
    ('Permits & Approvals', 'Obtain necessary permits and approvals', 8, 'high', 3),
    ('Material Procurement', 'Order and schedule material deliveries', 8, 'medium', 4),
    ('Site Preparation', 'Prepare work area and protect existing structures', 8, 'medium', 5),
    ('Project Execution', 'Main construction/renovation work', 0, 'high', 6), -- Hours vary by project
    ('Quality Control', 'Ongoing quality checks and corrections', 0, 'medium', 7),
    ('Final Inspection', 'Complete final inspections and approvals', 4, 'high', 8),
    ('Client Walkthrough', 'Review completed work with client', 2, 'high', 9),
    ('Project Closeout', 'Final documentation and warranty info', 4, 'medium', 10)
  ) AS t(title, description, hours, priority, ord)
  WHERE wp.is_template = true;

END;
$$ LANGUAGE plpgsql;

-- Execute the function to create work packs
SELECT create_general_construction_work_packs();

-- Add sample work pack attributes (included items, required permits, key features)
-- This would typically be stored in JSONB columns but we'll use related tables for structure
CREATE TABLE IF NOT EXISTS work_pack_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_pack_id UUID REFERENCES work_packs(id) ON DELETE CASCADE,
  attribute_type VARCHAR(50) CHECK (attribute_type IN ('included_item', 'required_permit', 'key_task')),
  value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Add attributes for New Home Construction work packs
INSERT INTO work_pack_attributes (work_pack_id, attribute_type, value, display_order)
SELECT 
  wp.id,
  'included_item',
  item.value,
  item.ord
FROM work_packs wp
CROSS JOIN (VALUES
  ('Architectural plans and engineering', 1),
  ('All required permits and inspections', 2),
  ('Site preparation and excavation', 3),
  ('Foundation and concrete work', 4),
  ('Complete framing package', 5),
  ('Roofing and exterior envelope', 6),
  ('All mechanical systems (plumbing, electrical, HVAC)', 7),
  ('Insulation and drywall', 8),
  ('Interior and exterior finishes', 9),
  ('Final landscaping and cleanup', 10)
) AS item(value, ord)
WHERE wp.project_type_id IN (SELECT id FROM project_categories WHERE slug = 'new-home-construction')
  AND wp.is_template = true;

-- Add required permits
INSERT INTO work_pack_attributes (work_pack_id, attribute_type, value, display_order)
SELECT 
  wp.id,
  'required_permit',
  permit.value,
  permit.ord
FROM work_packs wp
CROSS JOIN (VALUES
  ('Building Permit', 1),
  ('Electrical Permit', 2),
  ('Plumbing Permit', 3),
  ('Mechanical Permit', 4),
  ('Grading Permit', 5)
) AS permit(value, ord)
WHERE wp.project_type_id IN (SELECT id FROM project_categories WHERE slug = 'new-home-construction')
  AND wp.is_template = true;