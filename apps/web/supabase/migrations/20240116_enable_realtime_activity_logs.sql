-- Enable real-time for activity_logs table
-- This ensures that real-time subscriptions work properly

-- First, check if the publication exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        -- Create the publication if it doesn't exist
        CREATE PUBLICATION supabase_realtime;
    END IF;
END
$$;

-- Add the activity_logs table to the real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS activity_logs;

-- Verify that real-time is enabled for the table
DO $$
DECLARE
    table_count INT;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'activity_logs';
    
    IF table_count > 0 THEN
        RAISE NOTICE 'Real-time successfully enabled for activity_logs table';
    ELSE
        RAISE WARNING 'Failed to enable real-time for activity_logs table';
    END IF;
END
$$;

-- Grant necessary permissions for real-time
GRANT SELECT ON activity_logs TO anon;
GRANT SELECT ON activity_logs TO authenticated;

-- Create an index to improve real-time performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_realtime 
ON activity_logs(organization_id, created_at DESC);

-- Add a comment to document this configuration
COMMENT ON TABLE activity_logs IS 'Activity log table with real-time updates enabled';