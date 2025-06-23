-- Enable real-time for activity_logs table
-- This migration properly configures the activity_logs table for real-time updates

BEGIN;

-- Remove the table from the publication if it exists
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS activity_logs;

-- Add the activity_logs table to the real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;

COMMIT;

-- Note: After running this migration, you may need to:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Database → Replication
-- 3. Verify that activity_logs is listed and enabled
-- 4. If not visible, manually enable it from the dashboard