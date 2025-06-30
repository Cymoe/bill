-- Add project-specific pricing context columns
ALTER TABLE projects 
ADD COLUMN pricing_mode_id UUID REFERENCES pricing_modes(id) ON DELETE SET NULL,
ADD COLUMN lock_pricing BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_projects_pricing_mode_id ON projects(pricing_mode_id);

-- Add comment explaining the columns
COMMENT ON COLUMN projects.pricing_mode_id IS 'Optional pricing mode override for this specific project';
COMMENT ON COLUMN projects.lock_pricing IS 'When true, this project maintains its pricing even when organization pricing changes';