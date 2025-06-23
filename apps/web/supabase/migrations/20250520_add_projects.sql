-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status VARCHAR(50) CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  budget DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Create project_bills junction table
CREATE TABLE project_bills (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, bill_id),
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_bill FOREIGN KEY (bill_id) REFERENCES bills(id)
);

-- Create project_invoices junction table
CREATE TABLE project_invoices (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, invoice_id),
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_project_bills_project_id ON project_bills(project_id);
CREATE INDEX idx_project_bills_bill_id ON project_bills(bill_id);
CREATE INDEX idx_project_invoices_project_id ON project_invoices(project_id);
CREATE INDEX idx_project_invoices_invoice_id ON project_invoices(invoice_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their project bills" ON project_bills
  FOR ALL USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_bills.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can view their project invoices" ON project_invoices
  FOR ALL USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invoices.project_id 
    AND projects.user_id = auth.uid()
  ));
