-- Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  estimate_number VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  client_signature TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, estimate_number)
);

-- Create estimate_items table
CREATE TABLE IF NOT EXISTS estimate_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  work_pack_item_id UUID REFERENCES work_pack_items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_code VARCHAR(10),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to generate estimate numbers
CREATE OR REPLACE FUNCTION generate_estimate_number(org_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  next_number INTEGER;
  year_part VARCHAR(4);
  estimate_number VARCHAR(50);
BEGIN
  -- Get current year
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  
  -- Get next number for this organization and year
  SELECT COALESCE(MAX(
    CASE 
      WHEN estimate_number ~ ('^EST-' || year_part || '-[0-9]+$') 
      THEN CAST(SPLIT_PART(estimate_number, '-', 3) AS INTEGER)
      ELSE 0 
    END
  ), 0) + 1
  INTO next_number
  FROM estimates 
  WHERE organization_id = org_id;
  
  -- Format: EST-2025-001
  estimate_number := 'EST-' || year_part || '-' || LPAD(next_number::VARCHAR, 3, '0');
  
  RETURN estimate_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update estimate totals
CREATE OR REPLACE FUNCTION update_estimate_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the estimate totals when items change
  UPDATE estimates 
  SET 
    subtotal = (
      SELECT COALESCE(SUM(total_price), 0) 
      FROM estimate_items 
      WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id)
    ),
    tax_amount = (
      SELECT COALESCE(SUM(total_price), 0) * COALESCE(tax_rate, 0) / 100
      FROM estimate_items 
      WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id)
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = COALESCE(NEW.estimate_id, OLD.estimate_id);
  
  -- Update total_amount
  UPDATE estimates 
  SET total_amount = subtotal + tax_amount
  WHERE id = COALESCE(NEW.estimate_id, OLD.estimate_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for estimate totals
DROP TRIGGER IF EXISTS estimate_items_totals_trigger ON estimate_items;
CREATE TRIGGER estimate_items_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON estimate_items
  FOR EACH ROW EXECUTE FUNCTION update_estimate_totals();

-- Create function to update estimate item totals
CREATE OR REPLACE FUNCTION update_estimate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_price = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for estimate item totals
DROP TRIGGER IF EXISTS estimate_item_total_trigger ON estimate_items;
CREATE TRIGGER estimate_item_total_trigger
  BEFORE INSERT OR UPDATE ON estimate_items
  FOR EACH ROW EXECUTE FUNCTION update_estimate_item_total();

-- Add RLS policies for estimates
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Users can only see estimates from their organization
CREATE POLICY "Users can view estimates from their organization" ON estimates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert estimates to their organization
CREATE POLICY "Users can create estimates in their organization" ON estimates
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update estimates in their organization
CREATE POLICY "Users can update estimates in their organization" ON estimates
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete estimates in their organization
CREATE POLICY "Users can delete estimates in their organization" ON estimates
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Add RLS policies for estimate_items
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;

-- Users can view estimate items from estimates they can access
CREATE POLICY "Users can view estimate items from accessible estimates" ON estimate_items
  FOR SELECT USING (
    estimate_id IN (
      SELECT id FROM estimates WHERE organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Users can insert estimate items to accessible estimates
CREATE POLICY "Users can create estimate items for accessible estimates" ON estimate_items
  FOR INSERT WITH CHECK (
    estimate_id IN (
      SELECT id FROM estimates WHERE organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Users can update estimate items for accessible estimates
CREATE POLICY "Users can update estimate items for accessible estimates" ON estimate_items
  FOR UPDATE USING (
    estimate_id IN (
      SELECT id FROM estimates WHERE organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Users can delete estimate items for accessible estimates
CREATE POLICY "Users can delete estimate items for accessible estimates" ON estimate_items
  FOR DELETE USING (
    estimate_id IN (
      SELECT id FROM estimates WHERE organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_estimates_organization_id ON estimates(organization_id);
CREATE INDEX IF NOT EXISTS idx_estimates_client_id ON estimates(client_id);
CREATE INDEX IF NOT EXISTS idx_estimates_project_id ON estimates(project_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_issue_date ON estimates(issue_date);
CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_display_order ON estimate_items(estimate_id, display_order);