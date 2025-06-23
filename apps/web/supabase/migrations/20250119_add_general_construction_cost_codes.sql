-- General Construction Cost Codes Migration
-- Implements CSI MasterFormat-based cost codes for comprehensive construction projects

-- First, ensure we have the general construction industry
INSERT INTO industries (name, slug, description, icon, is_active)
VALUES ('General Construction', 'general-construction', 'General contracting and construction services', '🏗️', true)
ON CONFLICT (slug) DO NOTHING;

-- Create cost codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS cost_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('labor', 'material', 'equipment', 'subcontractor', 'service')),
  unit VARCHAR(50) NOT NULL,
  base_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  -- Unique constraint per organization
  CONSTRAINT unique_cost_code_per_org UNIQUE (organization_id, code)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_org_id ON cost_codes(organization_id);
CREATE INDEX IF NOT EXISTS idx_cost_codes_code ON cost_codes(code);
CREATE INDEX IF NOT EXISTS idx_cost_codes_category ON cost_codes(category);

-- Enable RLS
ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view cost codes in their organizations" ON cost_codes
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = cost_codes.organization_id
    )
  );

CREATE POLICY "Users can create cost codes in their organizations" ON cost_codes
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = cost_codes.organization_id
    )
  );

CREATE POLICY "Users can update cost codes in their organizations" ON cost_codes
  FOR UPDATE TO authenticated
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = cost_codes.organization_id
    )
  );

-- Insert General Construction Cost Codes (Global - organization_id NULL)
-- Division 01: General Requirements
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('01100', 'Building Permit', 'Building permit and plan check fees', 'service', 'ls', 2500.00),
  ('01200', 'General Liability Insurance', 'Project-specific liability insurance', 'service', 'month', 800.00),
  ('01300', 'Performance Bond', 'Performance and payment bonds', 'service', 'ls', 1500.00),
  ('01400', 'Project Management', 'Construction management and supervision', 'labor', 'hour', 125.00),
  ('01500', 'Temporary Facilities', 'Job site trailer, toilets, fencing', 'equipment', 'month', 1200.00),
  ('01600', 'Temporary Utilities', 'Temporary power and water', 'service', 'month', 600.00),
  ('01700', 'Project Cleanup', 'Ongoing and final cleanup', 'labor', 'hour', 45.00),
  ('01800', 'Dumpster Rental', 'Waste disposal container', 'equipment', 'month', 450.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 02: Site Work
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('02100', 'Site Survey', 'Property survey and staking', 'service', 'ls', 1800.00),
  ('02200', 'Excavation', 'General excavation and earthwork', 'equipment', 'cy', 25.00),
  ('02210', 'Rock Excavation', 'Rock removal and excavation', 'equipment', 'cy', 85.00),
  ('02300', 'Backfill & Compaction', 'Engineered fill and compaction', 'material', 'cy', 35.00),
  ('02400', 'Utility Trenching', 'Trenching for utilities', 'equipment', 'lf', 12.00),
  ('02500', 'Grading & Drainage', 'Fine grading and site drainage', 'equipment', 'sf', 1.50),
  ('02600', 'Erosion Control', 'Silt fence and erosion measures', 'material', 'lf', 8.00),
  ('02700', 'Asphalt Paving', 'Asphalt driveway/parking', 'subcontractor', 'sf', 4.50),
  ('02800', 'Concrete Paving', 'Concrete flatwork', 'material', 'sf', 8.00),
  ('02900', 'Landscaping', 'Final landscaping and planting', 'subcontractor', 'sf', 3.50)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 03: Concrete
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('03100', 'Concrete Forms', 'Formwork for concrete', 'labor', 'sf', 4.50),
  ('03200', 'Reinforcing Steel', 'Rebar and wire mesh', 'material', 'lb', 0.85),
  ('03300', 'Foundation Concrete', 'Concrete for foundations', 'material', 'cy', 145.00),
  ('03310', 'Slab on Grade', 'Concrete slab on grade', 'material', 'sf', 6.50),
  ('03320', 'Concrete Walls', 'Cast-in-place concrete walls', 'material', 'sf', 12.00),
  ('03400', 'Precast Concrete', 'Precast concrete elements', 'material', 'sf', 18.00),
  ('03500', 'Concrete Finishing', 'Concrete finishing and curing', 'labor', 'sf', 2.50),
  ('03600', 'Concrete Repair', 'Concrete patching and repair', 'labor', 'sf', 8.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 04: Masonry
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('04100', 'Concrete Block', 'CMU block walls', 'material', 'sf', 9.50),
  ('04200', 'Brick Veneer', 'Clay brick veneer', 'material', 'sf', 14.00),
  ('04300', 'Stone Veneer', 'Natural stone veneer', 'material', 'sf', 22.00),
  ('04400', 'Masonry Reinforcing', 'Reinforcing for masonry', 'material', 'sf', 1.25),
  ('04500', 'Masonry Labor', 'Mason labor', 'labor', 'hour', 65.00),
  ('04600', 'Masonry Cleaning', 'Masonry cleaning and sealing', 'labor', 'sf', 1.50)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 05: Metals
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('05100', 'Structural Steel', 'Structural steel framing', 'material', 'lb', 1.85),
  ('05200', 'Steel Joists', 'Open web steel joists', 'material', 'lb', 2.25),
  ('05300', 'Metal Decking', 'Metal floor and roof deck', 'material', 'sf', 3.50),
  ('05400', 'Steel Stairs', 'Prefab steel stairs', 'material', 'flight', 2800.00),
  ('05500', 'Metal Railings', 'Steel railings and handrails', 'material', 'lf', 85.00),
  ('05600', 'Steel Fabrication', 'Misc steel fabrication', 'labor', 'hour', 95.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 06: Wood & Plastics
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('06100', 'Rough Carpentry', 'Framing lumber and sheathing', 'material', 'sf', 8.50),
  ('06110', 'Framing Labor', 'Carpentry framing labor', 'labor', 'hour', 55.00),
  ('06200', 'Finish Carpentry', 'Trim and millwork', 'material', 'lf', 12.00),
  ('06210', 'Finish Carpentry Labor', 'Finish carpentry labor', 'labor', 'hour', 65.00),
  ('06300', 'Wood Decking', 'Wood deck boards', 'material', 'sf', 6.50),
  ('06400', 'Cabinets - Kitchen', 'Kitchen cabinets', 'material', 'lf', 325.00),
  ('06410', 'Cabinets - Bath', 'Bathroom vanities', 'material', 'ea', 850.00),
  ('06500', 'Cabinet Installation', 'Cabinet installation labor', 'labor', 'lf', 45.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 07: Thermal & Moisture Protection
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('07100', 'Waterproofing', 'Foundation waterproofing', 'material', 'sf', 2.50),
  ('07200', 'Insulation - Walls', 'Wall insulation R-13', 'material', 'sf', 1.25),
  ('07210', 'Insulation - Ceiling', 'Ceiling insulation R-38', 'material', 'sf', 1.85),
  ('07300', 'Asphalt Shingles', 'Architectural shingles', 'material', 'sq', 285.00),
  ('07310', 'Metal Roofing', 'Standing seam metal roof', 'material', 'sq', 650.00),
  ('07320', 'Tile Roofing', 'Concrete tile roofing', 'material', 'sq', 450.00),
  ('07400', 'Roofing Labor', 'Roofing installation labor', 'labor', 'sq', 225.00),
  ('07500', 'Gutters & Downspouts', 'Aluminum gutters', 'material', 'lf', 8.50),
  ('07600', 'Flashing & Sheet Metal', 'Roof flashing', 'material', 'lf', 12.00),
  ('07700', 'Roof Access', 'Roof hatches and skylights', 'material', 'ea', 1850.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 08: Doors & Windows
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('08100', 'Entry Door', 'Exterior entry door', 'material', 'ea', 850.00),
  ('08110', 'Interior Doors', 'Interior passage doors', 'material', 'ea', 225.00),
  ('08200', 'Garage Doors', 'Overhead garage doors', 'material', 'ea', 1450.00),
  ('08300', 'Windows - Vinyl', 'Vinyl double-hung windows', 'material', 'sf', 45.00),
  ('08310', 'Windows - Wood', 'Wood clad windows', 'material', 'sf', 85.00),
  ('08400', 'Sliding Glass Doors', 'Patio sliding doors', 'material', 'ea', 1850.00),
  ('08500', 'Door Hardware', 'Locksets and hardware', 'material', 'ea', 125.00),
  ('08600', 'Door/Window Install', 'Installation labor', 'labor', 'ea', 185.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 09: Finishes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('09100', 'Metal Studs', 'Metal stud framing', 'material', 'sf', 2.85),
  ('09200', 'Drywall', 'Gypsum board installation', 'material', 'sf', 1.95),
  ('09210', 'Drywall Finishing', 'Taping and texture', 'labor', 'sf', 1.85),
  ('09300', 'Ceramic Tile', 'Ceramic floor/wall tile', 'material', 'sf', 6.50),
  ('09310', 'Natural Stone Tile', 'Marble/granite tile', 'material', 'sf', 15.00),
  ('09320', 'Tile Installation', 'Tile setting labor', 'labor', 'sf', 8.50),
  ('09400', 'Hardwood Flooring', 'Oak hardwood flooring', 'material', 'sf', 8.50),
  ('09410', 'Laminate Flooring', 'Laminate floor planks', 'material', 'sf', 3.50),
  ('09420', 'Carpet', 'Carpet and pad', 'material', 'sy', 32.00),
  ('09430', 'Vinyl Flooring', 'Luxury vinyl plank', 'material', 'sf', 4.50),
  ('09500', 'Acoustical Ceiling', 'Suspended ceiling system', 'material', 'sf', 3.85),
  ('09600', 'Flooring Installation', 'Floor covering labor', 'labor', 'sf', 3.50),
  ('09700', 'Interior Painting', 'Interior paint labor', 'labor', 'sf', 2.25),
  ('09710', 'Exterior Painting', 'Exterior paint labor', 'labor', 'sf', 2.85),
  ('09800', 'Wallcovering', 'Wallpaper installation', 'material', 'sf', 3.50)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 10-14: Specialties
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('10100', 'Toilet Accessories', 'Bathroom accessories', 'material', 'ea', 125.00),
  ('10200', 'Fire Extinguisher', 'Fire extinguisher cabinet', 'material', 'ea', 285.00),
  ('10300', 'Closet Shelving', 'Wire shelving systems', 'material', 'lf', 25.00),
  ('10400', 'Signage', 'Building signage', 'material', 'sf', 65.00),
  ('11100', 'Kitchen Appliances', 'Standard appliance package', 'material', 'set', 3500.00),
  ('11200', 'Laundry Equipment', 'Washer and dryer', 'material', 'set', 1800.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 15: Mechanical (Plumbing & HVAC)
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('15100', 'Plumbing Rough-In', 'Water supply and DWV piping', 'subcontractor', 'fixture', 850.00),
  ('15200', 'Plumbing Fixtures', 'Toilets, sinks, faucets', 'material', 'fixture', 425.00),
  ('15300', 'Water Heater', 'Standard water heater', 'material', 'ea', 1250.00),
  ('15400', 'HVAC Equipment', 'Furnace and A/C unit', 'material', 'ton', 3200.00),
  ('15500', 'HVAC Ductwork', 'Supply and return ducts', 'subcontractor', 'sf', 8.50),
  ('15600', 'HVAC Controls', 'Thermostats and controls', 'material', 'ea', 285.00),
  ('15700', 'Plumbing Labor', 'Plumber hourly rate', 'labor', 'hour', 95.00),
  ('15800', 'HVAC Labor', 'HVAC tech hourly rate', 'labor', 'hour', 95.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Division 16: Electrical
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('16100', 'Electrical Service', '200A service upgrade', 'material', 'ea', 2850.00),
  ('16200', 'Distribution Panel', 'Electrical panel', 'material', 'ea', 850.00),
  ('16300', 'Branch Wiring', 'Romex wiring per outlet', 'material', 'ea', 125.00),
  ('16400', 'Switches & Outlets', 'Devices and plates', 'material', 'ea', 25.00),
  ('16500', 'Light Fixtures', 'Standard light fixtures', 'material', 'ea', 185.00),
  ('16600', 'Electrical Labor', 'Electrician hourly rate', 'labor', 'hour', 95.00),
  ('16700', 'Low Voltage Wiring', 'Data/communication wiring', 'material', 'ea', 85.00),
  ('16800', 'Solar Panels', 'Photovoltaic system', 'material', 'kw', 2800.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cost_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cost_codes_updated_at
  BEFORE UPDATE ON cost_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_cost_codes_updated_at();