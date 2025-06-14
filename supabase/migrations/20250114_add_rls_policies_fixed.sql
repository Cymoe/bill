-- Add RLS policies for tables that have RLS enabled but no policies

-- 1. CLIENTS TABLE POLICIES
CREATE POLICY "Users can view organization clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = clients.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organization clients" ON clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = clients.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update organization clients" ON clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = clients.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete organization clients" ON clients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = clients.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- 2. PROJECTS TABLE POLICIES
CREATE POLICY "Users can view organization projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = projects.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organization projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = projects.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update organization projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = projects.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete organization projects" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = projects.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- 3. COST_CODES TABLE POLICIES (Special handling for shared codes)
CREATE POLICY "Users can view cost codes" ON cost_codes
  FOR SELECT USING (
    -- Can see shared codes (NULL organization_id) OR codes for their organization
    cost_codes.organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = cost_codes.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organization cost codes" ON cost_codes
  FOR INSERT WITH CHECK (
    -- Can only create codes for their organization, not shared codes
    cost_codes.organization_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = cost_codes.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update organization cost codes" ON cost_codes
  FOR UPDATE USING (
    -- Can only update codes for their organization, not shared codes
    cost_codes.organization_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = cost_codes.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete organization cost codes" ON cost_codes
  FOR DELETE USING (
    -- Can only delete codes for their organization, not shared codes
    cost_codes.organization_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = cost_codes.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- 4. INVOICE_PAYMENTS TABLE POLICIES
CREATE POLICY "Users can view organization invoice payments" ON invoice_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invoice_payments.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organization invoice payments" ON invoice_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invoice_payments.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update organization invoice payments" ON invoice_payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invoice_payments.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete organization invoice payments" ON invoice_payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invoice_payments.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- 5. CLIENT_INTERACTIONS TABLE POLICIES
CREATE POLICY "Users can view organization client interactions" ON client_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = client_interactions.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organization client interactions" ON client_interactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = client_interactions.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update organization client interactions" ON client_interactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = client_interactions.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete organization client interactions" ON client_interactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = client_interactions.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- 6. POLICIES FOR CHILD TABLES (inherit from parent)
-- work_pack_items - can be accessed if user can access the parent work_pack
CREATE POLICY "Users can view work pack items" ON work_pack_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM work_packs
      JOIN user_organizations ON user_organizations.organization_id = work_packs.organization_id
      WHERE work_packs.id = work_pack_items.work_pack_id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage work pack items" ON work_pack_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM work_packs
      JOIN user_organizations ON user_organizations.organization_id = work_packs.organization_id
      WHERE work_packs.id = work_pack_items.work_pack_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

-- invoice_template_items - can be accessed if user can access the parent template
CREATE POLICY "Users can view invoice template items" ON invoice_template_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoice_templates
      JOIN user_organizations ON user_organizations.organization_id = invoice_templates.organization_id
      WHERE invoice_templates.id = invoice_template_items.template_id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage invoice template items" ON invoice_template_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoice_templates
      JOIN user_organizations ON user_organizations.organization_id = invoice_templates.organization_id
      WHERE invoice_templates.id = invoice_template_items.template_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

-- project_bills - junction table policy
CREATE POLICY "Users can view project bills" ON project_bills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN user_organizations ON user_organizations.organization_id = projects.organization_id
      WHERE projects.id = project_bills.project_id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage project bills" ON project_bills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN user_organizations ON user_organizations.organization_id = projects.organization_id
      WHERE projects.id = project_bills.project_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );