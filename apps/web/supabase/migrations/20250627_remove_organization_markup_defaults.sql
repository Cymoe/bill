-- Remove obsolete organization markup defaults table
-- This is replaced by the new pricing modes system

-- Drop the table if it exists
DROP TABLE IF EXISTS organization_markup_defaults CASCADE;

-- Also drop any related views or functions if they exist
DROP FUNCTION IF EXISTS update_organization_markup_defaults_updated_at() CASCADE;