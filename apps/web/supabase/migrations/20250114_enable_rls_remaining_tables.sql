-- Enable RLS on remaining tables that contain user data

-- Related data tables
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- Child/items tables (these should inherit security from parent)
ALTER TABLE work_pack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_template_items ENABLE ROW LEVEL SECURITY;

-- Junction tables that link entities
ALTER TABLE project_bills ENABLE ROW LEVEL SECURITY;

-- Note: We're NOT enabling RLS on:
-- - users (managed by Supabase Auth)
-- - template_categories (shared reference data)
-- - product_attributes (need to check if this has org context)
-- - product_line_items (need to check usage)
-- - project_status_transitions (need to check usage)