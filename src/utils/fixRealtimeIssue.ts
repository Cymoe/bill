import { supabase } from '@/lib/supabase';

export async function fixRealtimeIssue(organizationId: string) {
  console.log('🔧 Debugging real-time issue for org:', organizationId);
  
  // 1. Create a test channel with detailed logging
  const channelName = `debug-${Date.now()}`;
  let eventReceived = false;
  
  const channel = supabase.channel(channelName)
    .on('postgres_changes', {
      event: '*',
      schema: 'public', 
      table: 'activity_logs'
    }, (payload) => {
      console.log('📨 Event received (no filter):', payload);
      eventReceived = true;
    });
  
  // Subscribe with detailed status
  channel.subscribe((status, err) => {
    console.log(`Channel status: ${status}`);
    if (err) console.error('Channel error:', err);
  });
  
  // Wait for subscription
  await new Promise(r => setTimeout(r, 2000));
  
  // 2. Test with organization filter
  const channel2 = supabase.channel(`debug-filtered-${Date.now()}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'activity_logs',
      filter: `organization_id=eq.${organizationId}`
    }, (payload) => {
      console.log('📨 Event received (with filter):', payload);
    });
    
  channel2.subscribe((status) => {
    console.log(`Filtered channel status: ${status}`);
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // 3. Create test activity
  console.log('\n🧪 Creating test activity...');
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      action: 'created',
      entity_type: 'debug',
      entity_id: `fix-test-${Date.now()}`,
      entity_name: 'Fix Test Activity',
      organization_id: organizationId,
      metadata: { debug: true }
    })
    .select()
    .single();
    
  if (error) {
    console.error('❌ Error creating activity:', error);
  } else {
    console.log('✅ Activity created:', data.id);
    console.log('   Organization ID:', data.organization_id);
  }
  
  // 4. Wait and check
  console.log('\n⏳ Waiting 5 seconds for real-time event...');
  await new Promise(r => setTimeout(r, 5000));
  
  // 5. Check WebSocket connection
  console.log('\n🔌 WebSocket diagnostics:');
  // @ts-ignore
  const socket = channel.socket;
  console.log('Socket state:', socket?.state());
  console.log('Socket connected:', socket?.isConnected());
  
  // 6. Results
  console.log('\n📊 RESULTS:');
  console.log('Event received:', eventReceived ? '✅' : '❌');
  
  if (!eventReceived) {
    console.log('\n❌ Real-time is NOT working properly');
    console.log('\nPossible fixes:');
    console.log('1. The table might not be in the publication');
    console.log('2. RLS policies might be blocking real-time');
    console.log('3. WebSocket connection might be blocked');
    
    // Check RLS
    const { data: policies } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'activity_logs');
      
    console.log('\nRLS Policies on activity_logs:', policies?.length || 0);
  }
  
  // Cleanup
  supabase.removeChannel(channel);
  supabase.removeChannel(channel2);
  
  return eventReceived;
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).fixRealtimeIssue = fixRealtimeIssue;
}