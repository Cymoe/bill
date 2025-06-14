-- EMERGENCY: Enable Row Level Security on critical tables
-- This is a critical security fix to prevent data leakage between organizations

-- Enable RLS on tables that currently have it disabled
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_pack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;

-- Note: After enabling RLS, these tables will be completely inaccessible
-- until proper policies are created. The next migrations will add
-- organization_id columns and create appropriate policies.