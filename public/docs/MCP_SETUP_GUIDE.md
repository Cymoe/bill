# MCP (Model Context Protocol) Setup Guide

## Overview
MCP servers extend Claude Code's capabilities by providing additional tools for interacting with external services. This guide covers setting up the Supabase MCP server for database access.

## Current Configuration
Your `mcp.json` already has the Supabase MCP server configured:

```json
{
  "scope": "project",
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_v0_91025bc2a5567e449602773d028971827981433a"
      ]
    }
  }
}
```

## Why MCP Tools Might Not Be Available

1. **Claude Code Session**: MCP servers need to be loaded when Claude Code starts. If you added the configuration after starting your session, the tools won't be available.

2. **Server Connection**: The MCP server runs as a separate process that Claude Code communicates with. If this connection fails, the tools won't appear.

3. **Authentication**: The access token might be invalid or expired.

## Setup Steps

### 1. Verify Your Supabase Access Token

Your current token starts with `sbp_v0_` which indicates it's a Supabase service role key. Ensure this token:
- Is still valid and not expired
- Has the necessary permissions for your database
- Matches your Supabase project

To get a new token:
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the `service_role` key (for full access) or `anon` key (for limited access)

### 2. Update mcp.json with Additional Configuration

The Supabase MCP server needs your project URL. Update your `mcp.json`:

```json
{
  "scope": "project",
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_SUPABASE_ACCESS_TOKEN",
        "--api-url",
        "https://YOUR_PROJECT_ID.supabase.co"
      ]
    }
  }
}
```

Replace:
- `YOUR_SUPABASE_ACCESS_TOKEN` with your actual token
- `YOUR_PROJECT_ID` with your Supabase project ID

### 3. Restart Claude Code

After updating the configuration:
1. Save the `mcp.json` file
2. Close Claude Code completely
3. Restart Claude Code in your project directory
4. The MCP server should initialize on startup

### 4. Expected MCP Tools

Once properly configured, you should have access to tools like:
- `mcp__supabase__query` - Execute SQL queries
- `mcp__supabase__list_tables` - List all tables
- `mcp__supabase__describe_table` - Get table schema
- `mcp__supabase__insert` - Insert data
- `mcp__supabase__update` - Update data
- `mcp__supabase__delete` - Delete data

### 5. Testing the Connection

After restarting, test the MCP tools:

```
# In Claude Code, try:
Use the mcp__supabase__list_tables tool to show all database tables
```

## Troubleshooting

### If tools still aren't available:

1. **Check Claude Code logs**: Look for MCP initialization errors
2. **Verify network access**: Ensure you can reach Supabase from your network
3. **Test token manually**: 
   ```bash
   curl https://YOUR_PROJECT_ID.supabase.co/rest/v1/ \
     -H "apikey: YOUR_ACCESS_TOKEN" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Common Issues:

- **Invalid token**: Get a fresh token from Supabase dashboard
- **Wrong project URL**: Double-check your Supabase project ID
- **Network restrictions**: Some corporate networks block Supabase
- **Outdated MCP server**: The `@latest` tag should handle this, but you can specify a version

## Alternative: Direct Supabase Client

If MCP isn't working, you can still interact with Supabase using the JavaScript client in your code:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// List tables (requires database introspection permissions)
const { data, error } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')
```

## Next Steps

1. Update your `mcp.json` with the correct project URL
2. Restart Claude Code
3. Test the MCP tools
4. If issues persist, check the troubleshooting section

For more information about MCP, visit the Claude Code documentation.