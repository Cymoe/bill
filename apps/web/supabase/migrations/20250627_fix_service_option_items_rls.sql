-- Fix RLS policies for service_option_items table
-- The current policies incorrectly compare organization_id with auth.uid()
-- They should check if the user belongs to the organization

-- Drop existing incorrect policies
DROP POLICY IF EXISTS "Users can create service option items" ON service_option_items;
DROP POLICY IF EXISTS "Users can update service option items" ON service_option_items;
DROP POLICY IF EXISTS "Users can delete service option items" ON service_option_items;
DROP POLICY IF EXISTS "Users can view service option items" ON service_option_items;

-- Create correct policies that check organization membership

-- View policy: Can view items for shared options (org_id = NULL) or options in user's organizations
CREATE POLICY "Users can view service option items" 
ON service_option_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM service_options so
    WHERE so.id = service_option_items.service_option_id
    AND (
      so.organization_id IS NULL -- Shared options
      OR EXISTS (
        SELECT 1 
        FROM organization_members om
        WHERE om.organization_id = so.organization_id
        AND om.user_id = auth.uid()
      )
    )
  )
);

-- Insert policy: Can create items for options in user's organizations
CREATE POLICY "Users can create service option items" 
ON service_option_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM service_options so
    WHERE so.id = service_option_items.service_option_id
    AND EXISTS (
      SELECT 1 
      FROM organization_members om
      WHERE om.organization_id = so.organization_id
      AND om.user_id = auth.uid()
    )
  )
);

-- Update policy: Can update items for options in user's organizations
CREATE POLICY "Users can update service option items" 
ON service_option_items FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM service_options so
    WHERE so.id = service_option_items.service_option_id
    AND EXISTS (
      SELECT 1 
      FROM organization_members om
      WHERE om.organization_id = so.organization_id
      AND om.user_id = auth.uid()
    )
  )
);

-- Delete policy: Can delete items for options in user's organizations
CREATE POLICY "Users can delete service option items" 
ON service_option_items FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM service_options so
    WHERE so.id = service_option_items.service_option_id
    AND EXISTS (
      SELECT 1 
      FROM organization_members om
      WHERE om.organization_id = so.organization_id
      AND om.user_id = auth.uid()
    )
  )
);

-- Add comment explaining the policies
COMMENT ON POLICY "Users can view service option items" ON service_option_items IS 
'Allows viewing items for shared options or options belonging to user organizations';

COMMENT ON POLICY "Users can create service option items" ON service_option_items IS 
'Allows creating items for options belonging to user organizations';