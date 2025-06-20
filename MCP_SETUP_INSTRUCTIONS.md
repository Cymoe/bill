# Setting Up MCP for Supabase Development

To use the Supabase MCP tools for development, you need to configure them with proper permissions.

## Steps to Enable MCP Tools:

### 1. Get Your Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **bills** (deexxwmauoqmaqupqgtw)
3. Navigate to **Settings** → **API**
4. Find the **service_role** key (NOT the anon key)
   - This key has full admin access to your database
   - Keep it secure and never commit it to git

### 2. Update the MCP Configuration

1. Open `/Users/myleswebb/Apps/bills/mcp.json`
2. Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service role key
3. Save the file

### 3. Add to .gitignore

Make sure `mcp.json` is in your `.gitignore` to prevent committing sensitive keys:

```bash
echo "mcp.json" >> .gitignore
```

### 4. Restart Claude Code

After updating the configuration:
1. Close Claude Code completely
2. Reopen it in your project directory
3. The MCP tools should now have proper permissions

## Security Notes

- **NEVER commit the service role key** to version control
- The service role key bypasses Row Level Security (RLS)
- Only use it for development and migrations
- For production apps, always use the anon key with proper RLS policies

## Alternative: Environment Variable

Instead of hardcoding the key, you can use an environment variable:

1. Set the environment variable:
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. Update `mcp.json` to use the variable:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-supabase@latest",
           "deexxwmauoqmaqupqgtw",
           "--service-role-key",
           "${SUPABASE_SERVICE_ROLE_KEY}"
         ]
       }
     }
   }
   ```

## Testing MCP Access

Once configured, I should be able to:
- Run SQL queries directly
- Apply migrations
- Manage database schema
- Execute admin operations

This will significantly speed up the development process!