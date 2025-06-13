-- Add organization_id to invoice_templates table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoice_templates' 
                   AND column_name = 'organization_id') THEN
        ALTER TABLE invoice_templates ADD COLUMN organization_id UUID REFERENCES organizations(id);
        
        -- Create index for performance
        CREATE INDEX idx_invoice_templates_organization_id ON invoice_templates(organization_id);
        
        -- Update existing templates with organization_id from user's default organization
        UPDATE invoice_templates t
        SET organization_id = (
            SELECT uo.organization_id 
            FROM user_organizations uo 
            WHERE uo.user_id = t.user_id 
            AND uo.is_default = true
            LIMIT 1
        )
        WHERE organization_id IS NULL;
    END IF;
END $$;

-- Update RLS policies for invoice_templates to use organization_id
DROP POLICY IF EXISTS "Users can view their own templates" ON invoice_templates;
CREATE POLICY "Users can view templates in their organizations" ON invoice_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invoice_templates.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create their own templates" ON invoice_templates;
CREATE POLICY "Users can create templates in their organizations" ON invoice_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invoice_templates.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Users can update their own templates" ON invoice_templates;
CREATE POLICY "Users can update templates in their organizations" ON invoice_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invoice_templates.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Users can delete their own templates" ON invoice_templates;
CREATE POLICY "Users can delete templates in their organizations" ON invoice_templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invoice_templates.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );