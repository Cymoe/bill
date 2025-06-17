import { supabase } from '@/lib/supabase';

export async function testRealtimeConnection() {
  console.log('🔍 Testing Realtime Connection...');
  
  // 1. Test Supabase client
  console.log('1. Supabase client initialized:', !!supabase);
  
  // 2. Test authentication
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Auth error:', error);
    } else {
      console.log('✅ Authentication:', session ? 'Authenticated' : 'Not authenticated');
      if (session) {
        console.log('   User ID:', session.user.id);
        console.log('   Organization:', session.user.user_metadata?.organization_id);
      }
    }
  } catch (error) {
    console.error('❌ Auth check failed:', error);
  }
  
  // 3. Test database connection
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error);
    } else {
      console.log('✅ Database connection: OK');
    }
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
  
  // 4. Test realtime subscription
  console.log('4. Testing realtime subscription...');
  const testChannel = supabase
    .channel('test-channel-' + Date.now())
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activity_logs'
      },
      (payload) => {
        console.log('📨 Realtime event received:', payload);
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to realtime');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error');
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Subscription timed out');
      } else if (status === 'CLOSED') {
        console.log('🔒 Channel closed');
      }
    });
  
  // 5. Check WebSocket status
  setTimeout(() => {
    console.log('5. WebSocket status check...');
    const channels = supabase.getChannels();
    console.log('   Active channels:', channels.length);
    channels.forEach((channel, index) => {
      console.log(`   Channel ${index + 1}:`, {
        topic: channel.topic,
        state: channel.state,
        // @ts-ignore - accessing private property for debugging
        socket: channel.socket?.isConnected() ? 'Connected' : 'Disconnected'
      });
    });
  }, 2000);
  
  // 6. Test activity insertion
  setTimeout(async () => {
    console.log('6. Testing activity insertion...');
    try {
      const { data, error } = await supabase.rpc('log_activity', {
        p_action: 'created',
        p_entity_type: 'test',
        p_entity_id: 'test-' + Date.now(),
        p_entity_name: 'Real-time Test',
        p_metadata: { test: true, timestamp: new Date().toISOString() }
      });
      
      if (error) {
        console.error('❌ Failed to insert test activity:', error);
      } else {
        console.log('✅ Test activity inserted with ID:', data);
      }
    } catch (error) {
      console.error('❌ Activity insertion failed:', error);
    }
  }, 3000);
  
  // Clean up after 10 seconds
  setTimeout(() => {
    console.log('🧹 Cleaning up test channel...');
    supabase.removeChannel(testChannel);
    console.log('✅ Test complete');
    
    // Print instructions
    console.log('\n📋 If real-time is not working:');
    console.log('1. Go to Supabase Dashboard > Database > Replication');
    console.log('2. Enable replication for the "activity_logs" table');
    console.log('3. Or run: ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;');
    console.log('4. Check if RLS is enabled and policies allow SELECT');
  }, 10000);
}