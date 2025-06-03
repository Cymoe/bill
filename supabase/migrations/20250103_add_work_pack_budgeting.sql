-- Work Pack Budgeting System Migration
-- Adds cost code-based budgeting capabilities to work packs

-- Main budget table for each work pack
CREATE TABLE work_pack_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_pack_id UUID NOT NULL REFERENCES work_packs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_budget_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  labor_budget_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  material_budget_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  equipment_budget_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  subcontractor_budget_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_budget_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  margin_percentage DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual cost code budget line items
CREATE TABLE work_pack_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_pack_budget_id UUID NOT NULL REFERENCES work_pack_budgets(id) ON DELETE CASCADE,
  cost_code_id UUID NOT NULL REFERENCES cost_codes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  budgeted_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  budgeted_unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  budgeted_total_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  actual_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  actual_unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  actual_total_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  variance_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  variance_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'budgeted',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget tracking entries for actual costs
CREATE TABLE work_pack_budget_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_pack_budget_item_id UUID NOT NULL REFERENCES work_pack_budget_items(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type VARCHAR(20) NOT NULL, -- 'expense', 'labor', 'material', 'equipment'
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  vendor_name VARCHAR(255),
  reference_number VARCHAR(100),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_work_pack_budgets_work_pack_id ON work_pack_budgets(work_pack_id);
CREATE INDEX idx_work_pack_budgets_organization_id ON work_pack_budgets(organization_id);
CREATE INDEX idx_work_pack_budget_items_budget_id ON work_pack_budget_items(work_pack_budget_id);
CREATE INDEX idx_work_pack_budget_items_cost_code_id ON work_pack_budget_items(cost_code_id);
CREATE INDEX idx_work_pack_budget_items_organization_id ON work_pack_budget_items(organization_id);
CREATE INDEX idx_work_pack_budget_tracking_item_id ON work_pack_budget_tracking(work_pack_budget_item_id);
CREATE INDEX idx_work_pack_budget_tracking_organization_id ON work_pack_budget_tracking(organization_id);
CREATE INDEX idx_work_pack_budget_tracking_date ON work_pack_budget_tracking(transaction_date);

-- Unique constraints
ALTER TABLE work_pack_budgets ADD CONSTRAINT unique_work_pack_active_budget 
  UNIQUE (work_pack_id, is_active) 
  WHERE is_active = true;

ALTER TABLE work_pack_budget_items ADD CONSTRAINT unique_budget_cost_code 
  UNIQUE (work_pack_budget_id, cost_code_id);

-- Triggers for automatic calculations
CREATE OR REPLACE FUNCTION update_work_pack_budget_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update budget item total cost
  NEW.budgeted_total_cost = NEW.budgeted_quantity * NEW.budgeted_unit_cost;
  NEW.actual_total_cost = NEW.actual_quantity * NEW.actual_unit_cost;
  NEW.variance_amount = NEW.actual_total_cost - NEW.budgeted_total_cost;
  
  -- Calculate variance percentage
  IF NEW.budgeted_total_cost > 0 THEN
    NEW.variance_percentage = (NEW.variance_amount / NEW.budgeted_total_cost) * 100;
  ELSE
    NEW.variance_percentage = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_work_pack_budget_totals
  BEFORE INSERT OR UPDATE ON work_pack_budget_items
  FOR EACH ROW
  EXECUTE FUNCTION update_work_pack_budget_totals();

-- Function to update main budget totals when items change
CREATE OR REPLACE FUNCTION update_main_budget_totals()
RETURNS TRIGGER AS $$
DECLARE
  budget_record RECORD;
BEGIN
  -- Get the budget ID from either NEW or OLD record
  IF TG_OP = 'DELETE' THEN
    budget_record = OLD;
  ELSE
    budget_record = NEW;
  END IF;
  
  -- Update the main budget totals by cost code category
  UPDATE work_pack_budgets 
  SET 
    total_budget_amount = (
      SELECT COALESCE(SUM(wbi.budgeted_total_cost), 0)
      FROM work_pack_budget_items wbi
      WHERE wbi.work_pack_budget_id = budget_record.work_pack_budget_id
    ),
    labor_budget_amount = (
      SELECT COALESCE(SUM(wbi.budgeted_total_cost), 0)
      FROM work_pack_budget_items wbi
      JOIN cost_codes cc ON wbi.cost_code_id = cc.id
      WHERE wbi.work_pack_budget_id = budget_record.work_pack_budget_id
        AND cc.category = 'labor'
    ),
    material_budget_amount = (
      SELECT COALESCE(SUM(wbi.budgeted_total_cost), 0)
      FROM work_pack_budget_items wbi
      JOIN cost_codes cc ON wbi.cost_code_id = cc.id
      WHERE wbi.work_pack_budget_id = budget_record.work_pack_budget_id
        AND cc.category = 'material'
    ),
    equipment_budget_amount = (
      SELECT COALESCE(SUM(wbi.budgeted_total_cost), 0)
      FROM work_pack_budget_items wbi
      JOIN cost_codes cc ON wbi.cost_code_id = cc.id
      WHERE wbi.work_pack_budget_id = budget_record.work_pack_budget_id
        AND cc.category = 'equipment'
    ),
    subcontractor_budget_amount = (
      SELECT COALESCE(SUM(wbi.budgeted_total_cost), 0)
      FROM work_pack_budget_items wbi
      JOIN cost_codes cc ON wbi.cost_code_id = cc.id
      WHERE wbi.work_pack_budget_id = budget_record.work_pack_budget_id
        AND cc.category = 'subcontractor'
    ),
    service_budget_amount = (
      SELECT COALESCE(SUM(wbi.budgeted_total_cost), 0)
      FROM work_pack_budget_items wbi
      JOIN cost_codes cc ON wbi.cost_code_id = cc.id
      WHERE wbi.work_pack_budget_id = budget_record.work_pack_budget_id
        AND cc.category = 'service'
    ),
    updated_at = NOW()
  WHERE id = budget_record.work_pack_budget_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_main_budget_totals
  AFTER INSERT OR UPDATE OR DELETE ON work_pack_budget_items
  FOR EACH ROW
  EXECUTE FUNCTION update_main_budget_totals();

-- RLS Policies
ALTER TABLE work_pack_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_pack_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_pack_budget_tracking ENABLE ROW LEVEL SECURITY;

-- Work Pack Budgets Policies
CREATE POLICY "Users can view work pack budgets in their organizations" ON work_pack_budgets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budgets.organization_id
    )
  );

CREATE POLICY "Users can create work pack budgets in their organizations" ON work_pack_budgets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budgets.organization_id
    )
  );

CREATE POLICY "Users can update work pack budgets in their organizations" ON work_pack_budgets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budgets.organization_id
    )
  );

CREATE POLICY "Users can delete work pack budgets in their organizations" ON work_pack_budgets
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budgets.organization_id
    )
  );

-- Work Pack Budget Items Policies
CREATE POLICY "Users can view work pack budget items in their organizations" ON work_pack_budget_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budget_items.organization_id
    )
  );

CREATE POLICY "Users can create work pack budget items in their organizations" ON work_pack_budget_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budget_items.organization_id
    )
  );

CREATE POLICY "Users can update work pack budget items in their organizations" ON work_pack_budget_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budget_items.organization_id
    )
  );

CREATE POLICY "Users can delete work pack budget items in their organizations" ON work_pack_budget_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budget_items.organization_id
    )
  );

-- Work Pack Budget Tracking Policies
CREATE POLICY "Users can view work pack budget tracking in their organizations" ON work_pack_budget_tracking
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budget_tracking.organization_id
    )
  );

CREATE POLICY "Users can create work pack budget tracking in their organizations" ON work_pack_budget_tracking
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budget_tracking.organization_id
    )
  );

CREATE POLICY "Users can update work pack budget tracking in their organizations" ON work_pack_budget_tracking
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budget_tracking.organization_id
    )
  );

CREATE POLICY "Users can delete work pack budget tracking in their organizations" ON work_pack_budget_tracking
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = work_pack_budget_tracking.organization_id
    )
  ); 