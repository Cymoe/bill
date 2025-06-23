-- Enable Row Level Security on tables that already have policies defined
-- but have RLS disabled. This is a critical security fix.

-- These tables already have organization_id columns and policies,
-- they just need RLS enabled to enforce the policies

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_packs ENABLE ROW LEVEL SECURITY;