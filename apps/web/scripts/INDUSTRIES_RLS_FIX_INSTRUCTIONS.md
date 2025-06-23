# Industries RLS Fix Instructions

To fix the industries table RLS issue, you need to execute these SQL queries in your Supabase project.

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com/project/wnwatjwcjptwehagqiwf
2. Navigate to the SQL Editor
3. Copy and paste the following queries and execute them one by one:

### Query 1: Check current state
```sql
SELECT name, slug, is_active FROM industries ORDER BY name LIMIT 10;
```

### Query 2: Update all industries to be active
```sql
UPDATE industries SET is_active = true WHERE is_active IS NULL OR is_active = false;
```

### Query 3: Verify the fix
```sql
SELECT COUNT(*) as total_industries, 
       COUNT(CASE WHEN is_active = true THEN 1 END) as active_industries 
FROM industries;
```

### Query 4: Test anonymous access
```sql
-- Test what anonymous users can see
SET ROLE anon;
SELECT COUNT(*) as visible_to_anon FROM industries;
RESET ROLE;
```

## Option 2: Using Node.js Script

1. First, get your service role key from Supabase:
   - Go to: https://app.supabase.com/project/wnwatjwcjptwehagqiwf/settings/api
   - Copy the "service_role" key (it has full access to bypass RLS)

2. Run the script:
```bash
cd /Users/myleswebb/Apps/bills/apps/web
export SUPABASE_SERVICE_KEY="your-service-role-key-here"
node scripts/fix-industries-rls.cjs
```

## Option 3: Using psql Command Line

If you have the database password, you can use:
```bash
psql "postgresql://postgres.wnwatjwcjptwehagqiwf:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -f scripts/fix-industries-rls.sql
```

## Expected Results

After running these queries:
- All industries should have `is_active = true`
- The total count and active count should match
- Anonymous users should be able to see industries (if RLS policy allows)

## Additional Notes

The issue appears to be that industries have `is_active = NULL` or `false`, and your RLS policy might be filtering them out. By setting all industries to `is_active = true`, they should become visible to all users according to your RLS policies.