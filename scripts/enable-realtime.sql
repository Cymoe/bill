-- Script to enable real-time for activity_logs table
-- Run this in the Supabase SQL Editor

-- First, check if the table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'activity_logs'
) AS table_exists;

-- Enable real-time for the table
BEGIN;

-- Remove the table from the publication if it exists
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS activity_logs;

-- Add the activity_logs table to the real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;

COMMIT;

-- Verify the table is now part of the publication
SELECT 
  schemaname,
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'activity_logs';

-- You should see:
-- schemaname | tablename
-- -----------|--------------
-- public     | activity_logs