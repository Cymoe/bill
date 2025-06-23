-- ⚠️ DEVELOPMENT ONLY - Disables all RLS policies
-- Run this to remove all permission restrictions
-- NEVER run this in production!

-- Get all tables with RLS enabled
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'industries', 'cost_codes', 'line_items', 'clients', 
            'invoices', 'estimates', 'projects', 'products'
        )
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY;', 
                      r.schemaname, r.tablename);
        RAISE NOTICE 'Disabled RLS on %.%', r.schemaname, r.tablename;
    END LOOP;
END $$;