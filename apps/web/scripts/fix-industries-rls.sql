-- 1. First check the current state
SELECT name, slug, is_active FROM industries ORDER BY name LIMIT 10;

-- 2. Update all industries to be active
UPDATE industries SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- 3. Verify the fix
SELECT COUNT(*) as total_industries, COUNT(CASE WHEN is_active = true THEN 1 END) as active_industries FROM industries;

-- 4. Test what anonymous users can see
SET ROLE anon;
SELECT COUNT(*) as visible_to_anon FROM industries;
RESET ROLE;