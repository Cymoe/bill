# Real-time Activity Logs Setup Guide

This guide explains how to enable real-time updates for the activity logs feature.

## Current Status

The activity logs feature is fully implemented with:
- ✅ Activity logging to database
- ✅ Activity feed UI components
- ✅ Real-time subscription code
- ✅ Connection status indicators
- ✅ Manual refresh fallback
- ⚠️ Real-time updates (requires database configuration)

## Enable Real-time Updates

To enable real-time updates for activity logs, you need to add the `activity_logs` table to the Supabase real-time publication.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Database → Replication**
4. Find the `activity_logs` table in the list
5. Toggle the switch to enable real-time for this table
6. Save your changes

### Option 2: Using SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Enable real-time for activity_logs table
BEGIN;

-- Remove the table from the publication if it exists
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS activity_logs;

-- Add the activity_logs table to the real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;

COMMIT;

-- Verify it's enabled
SELECT 
  schemaname,
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'activity_logs';
```

## Testing Real-time Updates

### In Development Mode

1. Open the Activity Panel (click the activity icon in the sidebar)
2. Look for the connection status indicator:
   - 🟢 Green: Real-time connected
   - 🟡 Yellow: Connecting
   - 🔴 Red: Connection error
   - ⚫ Gray: Disconnected

3. If connected, click the "Test Real-time" button (dev mode only)
4. A test activity should appear instantly without page refresh

### Debug Connection Issues

If real-time isn't working:

1. Click "Debug Connection" button (appears when there's an error)
2. Check the browser console for detailed logs
3. Common issues:
   - Table not added to real-time publication
   - WebSocket connection blocked
   - Authentication issues
   - Network connectivity problems

### Manual Testing

You can also test by:
1. Creating an invoice, estimate, or other entity
2. The activity should appear in the feed instantly
3. If not, use the refresh button as a fallback

## Troubleshooting

### Real-time not working checklist:

1. **Check table is published**:
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime';
   ```

2. **Check RLS policies**:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'activity_logs';
   ```

3. **Test WebSocket connection**:
   - Open browser DevTools
   - Go to Network tab
   - Filter by WS (WebSocket)
   - Should see active WebSocket connection

4. **Check browser console**:
   - Look for "Successfully subscribed to activity logs"
   - Check for any error messages

### Fallback Options

If real-time cannot be enabled:
- Users can use the manual refresh button
- Activities will still be logged and viewable
- Page refresh will show new activities

## Performance Considerations

- Real-time subscriptions use WebSockets
- Each connected user maintains a persistent connection
- Consider connection limits for your Supabase plan
- The implementation includes automatic reconnection logic

## Security

The activity logs use Row Level Security (RLS):
- Users can only see activities from their organization
- Real-time subscriptions respect these RLS policies
- No sensitive data is exposed through WebSocket connections