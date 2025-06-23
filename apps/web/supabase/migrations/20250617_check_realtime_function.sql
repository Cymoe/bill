-- Create a function to check if a table is in the realtime publication
CREATE OR REPLACE FUNCTION public.check_realtime_enabled()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'activity_logs'
  );
END;
$$;

-- Create a function to get publication tables (for debugging)
CREATE OR REPLACE FUNCTION public.get_publication_tables(publication_name text)
RETURNS TABLE(schemaname name, tablename name)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT pt.schemaname, pt.tablename
  FROM pg_publication_tables pt
  WHERE pt.pubname = publication_name;
END;
$$;