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

---

# Setting Up MCP for Flux Image Generation

In addition to Supabase, you can also set up the Flux Image MCP server for AI image generation.

## Flux MCP Server Setup

### 1. Get Your Flux API Key

1. Go to [Black Forest Labs](https://blackforestlabs.ai/)
2. Sign up or log in to your account
3. Navigate to API settings
4. Generate an API key

### 2. Install and Build the Server

```bash
cd mcp-servers/flux-image-server
npm install
npm run build
```

### 3. Configure Claude Desktop

Add the Flux server to your Claude Desktop configuration:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "supabase": {
      // ... your existing Supabase config ...
    },
    "flux-image": {
      "command": "node",
      "args": ["/Users/myleswebb/Apps/bills/mcp-servers/flux-image-server/dist/index.js"],
      "env": {
        "FLUX_API_KEY": "your_flux_api_key_here"
      }
    }
  }
}
```

### 4. Available Image Generation Tools

Once configured, you'll have access to:
- **generate_image**: Create images using Flux AI models
- **get_flux_models**: Query available models and their capabilities

### Example Usage

In Claude, you can now say things like:
- "Generate an image of a modern minimalist house with large windows"
- "Create a photorealistic portrait of a chef in a professional kitchen"
- "What Flux models are available?"

See the full documentation at: `mcp-servers/flux-image-server/README.md`