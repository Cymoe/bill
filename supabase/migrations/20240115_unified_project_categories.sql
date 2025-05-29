-- Create central project categories table
CREATE TABLE project_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Store icon name/identifier
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  category_id UUID REFERENCES project_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create expenses table (replacing/extending bills)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL, -- Material, Labor, Equipment, etc.
  vendor TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'rejected')) DEFAULT 'pending',
  category_id UUID REFERENCES project_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create task templates table
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES project_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  default_priority TEXT CHECK (default_priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  typical_duration_days INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create expense templates table
CREATE TABLE expense_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES project_categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  typical_amount DECIMAL(12,2),
  expense_category TEXT NOT NULL, -- Material, Labor, Equipment, etc.
  vendor TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id to existing tables
ALTER TABLE projects ADD COLUMN category_id UUID REFERENCES project_categories(id);
ALTER TABLE products ADD COLUMN category_id UUID REFERENCES project_categories(id);
ALTER TABLE invoice_templates ADD COLUMN category_id UUID REFERENCES project_categories(id);

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_task_templates_category_id ON task_templates(category_id);
CREATE INDEX idx_expense_templates_category_id ON expense_templates(category_id);
CREATE INDEX idx_projects_category_id ON projects(category_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_invoice_templates_category_id ON invoice_templates(category_id);

-- Enable RLS
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Project categories are viewable by all authenticated users
CREATE POLICY "Authenticated users can view categories" ON project_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Template policies (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view task templates" ON task_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view expense templates" ON expense_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default project categories
INSERT INTO project_categories (name, slug, description, icon, display_order) VALUES
  ('Kitchen Remodel', 'kitchen-remodel', 'Full kitchen renovation projects', 'Home', 1),
  ('Bathroom Remodel', 'bathroom-remodel', 'Bathroom renovation and updates', 'Bath', 2),
  ('Flooring Installation', 'flooring', 'All types of flooring projects', 'Package', 3),
  ('Roof Repair', 'roof-repair', 'Roofing repairs and replacements', 'Home', 4),
  ('Deck Construction', 'deck-construction', 'Outdoor deck building', 'TreePine', 5),
  ('Interior Painting', 'interior-painting', 'Indoor painting projects', 'Paintbrush', 6),
  ('Exterior Painting', 'exterior-painting', 'Outdoor painting projects', 'Paintbrush', 7),
  ('Plumbing', 'plumbing', 'Plumbing repairs and installations', 'Wrench', 8),
  ('Electrical', 'electrical', 'Electrical work and repairs', 'Zap', 9),
  ('HVAC', 'hvac', 'Heating and cooling systems', 'Wind', 10),
  ('Landscaping', 'landscaping', 'Outdoor landscaping projects', 'TreePine', 11),
  ('General Repair', 'general-repair', 'General maintenance and repairs', 'Tool', 12);

-- Insert sample task templates for Kitchen Remodel
INSERT INTO task_templates (category_id, title, description, default_priority, typical_duration_days, display_order)
SELECT 
  id as category_id,
  title,
  description,
  priority,
  duration,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  ('Initial consultation & measurements', 'Meet with client and measure space', 'high', 1, 1),
  ('Design & material selection', 'Finalize design and select materials', 'high', 3, 2),
  ('Order cabinets & appliances', 'Place orders for major components', 'high', 1, 3),
  ('Obtain permits', 'Apply for and receive necessary permits', 'high', 7, 4),
  ('Demo existing kitchen', 'Remove old cabinets, appliances, flooring', 'medium', 2, 5),
  ('Rough plumbing', 'Update plumbing for new layout', 'medium', 2, 6),
  ('Rough electrical', 'Update electrical for new layout', 'medium', 2, 7),
  ('Drywall & painting', 'Repair walls and paint', 'medium', 3, 8),
  ('Install flooring', 'Install new flooring', 'medium', 2, 9),
  ('Install cabinets', 'Install new cabinets', 'high', 2, 10),
  ('Install countertops', 'Template and install countertops', 'high', 2, 11),
  ('Install backsplash', 'Install tile backsplash', 'medium', 1, 12),
  ('Install appliances', 'Install and connect all appliances', 'high', 1, 13),
  ('Final plumbing', 'Connect fixtures and test', 'high', 1, 14),
  ('Final electrical', 'Install outlets, switches, lighting', 'high', 1, 15),
  ('Final inspection', 'Schedule and pass final inspection', 'high', 1, 16),
  ('Client walkthrough', 'Review completed work with client', 'high', 1, 17)
) AS t(title, description, priority, duration, ord)
WHERE project_categories.slug = 'kitchen-remodel';

-- Insert sample expense templates for Kitchen Remodel
INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
SELECT 
  id as category_id,
  description,
  amount,
  category,
  vendor,
  ord
FROM project_categories 
CROSS JOIN (VALUES
  ('Kitchen cabinets', 8000.00, 'Material', 'Cabinet supplier', 1),
  ('Countertops', 3500.00, 'Material', 'Stone fabricator', 2),
  ('Appliances', 5000.00, 'Material', 'Appliance store', 3),
  ('Flooring materials', 2000.00, 'Material', 'Flooring supplier', 4),
  ('Backsplash tile', 800.00, 'Material', 'Tile shop', 5),
  ('Plumbing fixtures', 1200.00, 'Material', 'Plumbing supplier', 6),
  ('Electrical fixtures', 800.00, 'Material', 'Electrical supplier', 7),
  ('Permits', 500.00, 'Permits', 'City/County', 8),
  ('Demo labor', 1500.00, 'Labor', 'Demo crew', 9),
  ('Plumbing labor', 2500.00, 'Subcontractor', 'Plumber', 10),
  ('Electrical labor', 2000.00, 'Subcontractor', 'Electrician', 11),
  ('Cabinet installation', 1500.00, 'Labor', 'Cabinet installer', 12),
  ('Dumpster rental', 600.00, 'Equipment', 'Waste management', 13),
  ('Miscellaneous supplies', 500.00, 'Material', 'Various', 14)
) AS t(description, amount, category, vendor, ord)
WHERE project_categories.slug = 'kitchen-remodel';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_project_categories_updated_at BEFORE UPDATE ON project_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 