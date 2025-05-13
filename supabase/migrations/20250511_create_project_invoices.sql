-- Create project_invoices junction table
CREATE TABLE project_invoices (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, invoice_id)
);

-- Create index for better query performance
CREATE INDEX idx_project_invoices_project_id ON project_invoices(project_id);
CREATE INDEX idx_project_invoices_invoice_id ON project_invoices(invoice_id);

-- Add RLS policies
ALTER TABLE project_invoices ENABLE ROW LEVEL SECURITY;

-- Policy to ensure users can only access project_invoices for projects they own
CREATE POLICY "Users can manage their own project invoices" ON project_invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND p.user_id = auth.uid()
    )
  );
