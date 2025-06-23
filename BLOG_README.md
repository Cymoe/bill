# Bill Breeze Blog Setup

## Development

The blog runs on a separate port from the main app:

- **Main App**: http://localhost:3000
- **Blog**: http://localhost:4321/blog

### Running Both Apps

```bash
# Run both apps simultaneously (recommended)
npm run dev:all

# Or run them separately in different terminals:
npm run dev        # Main app on :3000
npm run dev:blog   # Blog on :4321
```

### Accessing the Blog

During development:
- Navigate to http://localhost:4321/blog to see the blog directly
- Or go to http://localhost:3000/blog (the main app will proxy to the blog)

## Important Notes

1. **Node Version**: The blog requires Node.js 18.20.8 or higher. If you see version warnings, the blog may not run properly.

2. **Port Configuration**:
   - Main app: Port 3000 (configured in apps/web/vite.config.ts)
   - Blog: Port 4321 (configured in apps/blog/astro.config.mjs)

3. **Proxy Setup**: The main app's Vite config includes a proxy that forwards `/blog` requests to the Astro server during development.

## Production

In production (Vercel), both apps are built and served from the same domain:
- Main app at: yourdomain.com
- Blog at: yourdomain.com/blog

The `vercel.json` file handles the routing between the two applications.

## Content Management

### Manual Post Creation
Create new MDX files in `apps/blog/src/content/blog/`

### AI Generation
```bash
# Generate single post
npm run generate:post "Your Topic" industry

# Generate batch of posts
npm run generate:batch
```

## Troubleshooting

### "Cannot find /blog" error
Make sure both servers are running with `npm run dev:all`

### Node version errors
Update Node.js to 18.20.8 or higher, or use a Node version manager like `nvm`

### Blog not updating
The Astro dev server hot-reloads MDX changes automatically. If not, restart the blog server.