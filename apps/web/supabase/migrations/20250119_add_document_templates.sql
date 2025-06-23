-- Document Templates System Migration
-- Adds support for industry-specific legal documents and templates

-- Create document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'contract', 'permit', 'proposal', 'invoice', 
    'change_order', 'warranty', 'safety', 'other'
  )),
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  project_type_id UUID REFERENCES project_categories(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  -- Ensure unique names within organization
  CONSTRAINT unique_template_name_per_org UNIQUE (organization_id, name)
);

-- Create generated documents table
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  variables_data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'signed')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by VARCHAR(255),
  file_url TEXT,
  created_by UUID REFERENCES profiles(id)
);

-- Create work pack document templates junction table
CREATE TABLE IF NOT EXISTS work_pack_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_pack_id UUID NOT NULL REFERENCES work_packs(id) ON DELETE CASCADE,
  document_template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  is_required BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique document per work pack
  CONSTRAINT unique_work_pack_document UNIQUE (work_pack_id, document_template_id)
);

-- Add indexes for performance
CREATE INDEX idx_document_templates_org_id ON document_templates(organization_id);
CREATE INDEX idx_document_templates_type ON document_templates(document_type);
CREATE INDEX idx_document_templates_industry ON document_templates(industry_id);
CREATE INDEX idx_document_templates_project_type ON document_templates(project_type_id);

CREATE INDEX idx_generated_documents_template_id ON generated_documents(template_id);
CREATE INDEX idx_generated_documents_project_id ON generated_documents(project_id);
CREATE INDEX idx_generated_documents_org_id ON generated_documents(organization_id);
CREATE INDEX idx_generated_documents_status ON generated_documents(status);

CREATE INDEX idx_work_pack_document_templates_work_pack ON work_pack_document_templates(work_pack_id);
CREATE INDEX idx_work_pack_document_templates_template ON work_pack_document_templates(document_template_id);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_pack_document_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_templates
CREATE POLICY "Users can view document templates in their organizations" ON document_templates
  FOR SELECT TO authenticated
  USING (
    is_default = true OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = document_templates.organization_id
    )
  );

CREATE POLICY "Users can create document templates in their organizations" ON document_templates
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = document_templates.organization_id
    )
  );

CREATE POLICY "Users can update document templates in their organizations" ON document_templates
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = document_templates.organization_id
    )
  );

CREATE POLICY "Users can delete document templates in their organizations" ON document_templates
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = document_templates.organization_id
    )
  );

-- RLS Policies for generated_documents
CREATE POLICY "Users can view generated documents in their organizations" ON generated_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = generated_documents.organization_id
    )
  );

CREATE POLICY "Users can create generated documents in their organizations" ON generated_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = generated_documents.organization_id
    )
  );

CREATE POLICY "Users can update generated documents in their organizations" ON generated_documents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = generated_documents.organization_id
    )
  );

CREATE POLICY "Users can delete generated documents in their organizations" ON generated_documents
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.organization_id = generated_documents.organization_id
    )
  );

-- RLS Policies for work_pack_document_templates
CREATE POLICY "Users can view work pack document templates" ON work_pack_document_templates
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_packs wp
      JOIN user_organizations uo ON uo.organization_id = wp.organization_id
      WHERE wp.id = work_pack_document_templates.work_pack_id
        AND uo.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage work pack document templates" ON work_pack_document_templates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_packs wp
      JOIN user_organizations uo ON uo.organization_id = wp.organization_id
      WHERE wp.id = work_pack_document_templates.work_pack_id
        AND uo.user_id = auth.uid()
    )
  );

-- Function to copy default templates to organization
CREATE OR REPLACE FUNCTION copy_default_templates_to_organization(p_organization_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO document_templates (
    organization_id,
    name,
    description,
    document_type,
    industry_id,
    project_type_id,
    content,
    variables,
    is_active,
    is_default
  )
  SELECT 
    p_organization_id,
    name,
    description,
    document_type,
    industry_id,
    project_type_id,
    content,
    variables,
    is_active,
    false -- Not default for organization copies
  FROM document_templates
  WHERE is_default = true
  ON CONFLICT (organization_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_document_templates_updated_at();

-- Insert default system templates
INSERT INTO document_templates (
  name,
  description,
  document_type,
  content,
  variables,
  is_active,
  is_default
) VALUES
(
  'Standard Construction Contract',
  'Basic construction contract template with standard terms',
  'contract',
  E'CONSTRUCTION CONTRACT\n\nThis Agreement is entered into on {{contract_date}} between:\n\nCONTRACTOR: {{contractor_name}}\nAddress: {{contractor_address}}\nLicense #: {{contractor_license}}\n\nCLIENT: {{client_name}}\nAddress: {{client_address}}\n\nPROJECT LOCATION: {{project_address}}\n\nSCOPE OF WORK:\n{{scope_of_work}}\n\nPAYMENT TERMS:\nTotal Contract Price: ${{total_price}}\nPayment Schedule:\n- Upon signing: ${{deposit_amount}} ({{deposit_percentage}}%)\n- Progress payments as follows:\n  {{payment_schedule}}\n- Final payment upon completion: ${{final_payment}}\n\nTIMELINE:\nStart Date: {{start_date}}\nEstimated Completion: {{end_date}}\n\nSTANDARD TERMS AND CONDITIONS:\n1. Changes to the scope of work must be documented in writing\n2. Contractor warrants work for {{warranty_period}} from completion\n3. Client must provide access to work area\n4. Delays due to weather or acts of God will extend timeline\n5. Disputes will be resolved through mediation\n\nSIGNATURES:\nContractor: _________________________ Date: _________\nClient: _____________________________ Date: _________',
  '[
    {"key": "contract_date", "label": "Contract Date", "type": "date", "required": true},
    {"key": "contractor_name", "label": "Contractor Name", "type": "text", "required": true},
    {"key": "contractor_address", "label": "Contractor Address", "type": "text", "required": true},
    {"key": "contractor_license", "label": "License Number", "type": "text", "required": true},
    {"key": "client_name", "label": "Client Name", "type": "text", "required": true},
    {"key": "client_address", "label": "Client Address", "type": "text", "required": true},
    {"key": "project_address", "label": "Project Address", "type": "text", "required": true},
    {"key": "scope_of_work", "label": "Scope of Work", "type": "text", "required": true},
    {"key": "total_price", "label": "Total Price", "type": "number", "required": true},
    {"key": "deposit_amount", "label": "Deposit Amount", "type": "number", "required": true},
    {"key": "deposit_percentage", "label": "Deposit Percentage", "type": "number", "required": true, "default_value": 30},
    {"key": "payment_schedule", "label": "Payment Schedule", "type": "text", "required": true},
    {"key": "final_payment", "label": "Final Payment", "type": "number", "required": true},
    {"key": "start_date", "label": "Start Date", "type": "date", "required": true},
    {"key": "end_date", "label": "End Date", "type": "date", "required": true},
    {"key": "warranty_period", "label": "Warranty Period", "type": "text", "required": true, "default_value": "1 year"}
  ]'::jsonb,
  true,
  true
),
(
  'Change Order Form',
  'Document changes to original contract scope',
  'change_order',
  E'CHANGE ORDER #{{change_order_number}}\n\nProject: {{project_name}}\nOriginal Contract Date: {{original_contract_date}}\nChange Order Date: {{change_order_date}}\n\nDESCRIPTION OF CHANGE:\n{{change_description}}\n\nCOST IMPACT:\nOriginal Contract Amount: ${{original_amount}}\nChange Order Amount: ${{change_amount}}\nNew Contract Total: ${{new_total}}\n\nSCHEDULE IMPACT:\nOriginal Completion Date: {{original_completion}}\nRevised Completion Date: {{revised_completion}}\nDays Added: {{days_added}}\n\nAUTHORIZATION:\nContractor: _________________________ Date: _________\nClient: _____________________________ Date: _________',
  '[
    {"key": "change_order_number", "label": "Change Order Number", "type": "number", "required": true},
    {"key": "project_name", "label": "Project Name", "type": "text", "required": true},
    {"key": "original_contract_date", "label": "Original Contract Date", "type": "date", "required": true},
    {"key": "change_order_date", "label": "Change Order Date", "type": "date", "required": true},
    {"key": "change_description", "label": "Description of Changes", "type": "text", "required": true},
    {"key": "original_amount", "label": "Original Contract Amount", "type": "number", "required": true},
    {"key": "change_amount", "label": "Change Order Amount", "type": "number", "required": true},
    {"key": "new_total", "label": "New Contract Total", "type": "number", "required": true},
    {"key": "original_completion", "label": "Original Completion Date", "type": "date", "required": true},
    {"key": "revised_completion", "label": "Revised Completion Date", "type": "date", "required": true},
    {"key": "days_added", "label": "Days Added", "type": "number", "required": true}
  ]'::jsonb,
  true,
  true
);