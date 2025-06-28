-- Fix the unique constraint on service_options to properly support shared-to-custom model
-- This allows the same service option name to exist for different organizations

-- First, drop the existing constraint that's causing issues
ALTER TABLE service_options 
DROP CONSTRAINT IF EXISTS unique_option_per_service;

-- Create the proper constraint that includes organization_id
-- This allows:
-- 1. One shared version (organization_id = NULL) per name/service
-- 2. One custom version per organization per name/service
ALTER TABLE service_options 
ADD CONSTRAINT unique_service_option_per_org 
UNIQUE (name, service_id, organization_id);

-- Also ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_options_org_service 
ON service_options(organization_id, service_id);

CREATE INDEX IF NOT EXISTS idx_service_options_is_template 
ON service_options(is_template) 
WHERE is_template = true;

-- Add a comment to document the constraint
COMMENT ON CONSTRAINT unique_service_option_per_org ON service_options IS 
'Ensures unique service option names within a service for each organization. Allows shared (NULL org) and custom versions to coexist.';