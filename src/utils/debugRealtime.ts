import { supabase } from '@/lib/supabase';

export async function debugRealtime() {
  console.log('🔍 Starting Comprehensive Real-time Debug...\n');
  
  // 1. Check Supabase client
  console.log('1️⃣ Checking Supabase client configuration...');
  console.log('   URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('   Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  // 2. Check authentication
  console.log('\n2️⃣ Checking authentication...');
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error('   ❌ Auth error:', authError);
    return;
  }
  console.log('   ✅ Authenticated:', !!session);
  if (session) {
    console.log('   User ID:', session.user.id);
    console.log('   Token expires:', new Date(session.expires_at! * 1000).toLocaleString());
  }
  
  // 3. Check WebSocket connection
  console.log('\n3️⃣ Checking WebSocket connection...');
  const channels = supabase.getChannels();
  console.log('   Active channels:', channels.length);
  
  // 4. Test database access
  console.log('\n4️⃣ Testing database access...');
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('   ❌ Cannot query activity_logs:', error);
      return;
    }
    console.log('   ✅ Can query activity_logs table');
  } catch (e) {
    console.error('   ❌ Database error:', e);
    return;
  }
  
  // 5. Create a test subscription with detailed logging
  console.log('\n5️⃣ Creating test subscription...');
  
  let subscriptionSuccess = false;
  let eventReceived = false;
  
  const testChannel = supabase
    .channel('debug-channel-' + Date.now(), {
      config: {
        broadcast: { self: true },
        presence: { key: 'debug' }
      }
    })
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activity_logs'
      },
      (payload) => {
        eventReceived = true;
        console.log('\n🎉 REAL-TIME EVENT RECEIVED!');
        console.log('   Event:', payload.eventType);
        console.log('   Table:', payload.table);
        console.log('   Schema:', payload.schema);
        console.log('   Record:', payload.new);
      }
    );
  
  // Add detailed subscription status logging
  const subscription = testChannel.subscribe((status, error) => {
    console.log(`\n   Channel status: ${status}`);
    if (error) {
      console.error('   Subscription error:', error);
    }
    
    switch (status) {
      case 'SUBSCRIBED':
        subscriptionSuccess = true;
        console.log('   ✅ Successfully subscribed!');
        break;
      case 'CHANNEL_ERROR':
        console.error('   ❌ Channel error occurred');
        break;
      case 'TIMED_OUT':
        console.error('   ❌ Subscription timed out');
        break;
      case 'CLOSED':
        console.log('   🔒 Channel closed');
        break;
    }
  });
  
  // Wait for subscription
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 6. Check channel state
  console.log('\n6️⃣ Channel diagnostics:');
  console.log('   State:', testChannel.state);
  console.log('   Topic:', testChannel.topic);
  // @ts-ignore
  console.log('   Socket connected:', testChannel.socket?.isConnected());
  // @ts-ignore
  console.log('   Socket state:', testChannel.socket?.connectionState());
  
  if (!subscriptionSuccess) {
    console.error('\n❌ Failed to establish subscription!');
    console.log('\nPossible causes:');
    console.log('- WebSocket connection blocked by firewall/proxy');
    console.log('- Browser extensions blocking WebSocket');
    console.log('- Network connectivity issues');
    console.log('- Authentication token expired');
    
    supabase.removeChannel(testChannel);
    return;
  }
  
  // 7. Insert test record
  console.log('\n7️⃣ Inserting test record...');
  try {
    const { data: insertData, error: insertError } = await supabase.rpc('log_activity', {
      p_action: 'created',
      p_entity_type: 'debug',
      p_entity_id: 'debug-test-' + Date.now(),
      p_entity_name: 'Debug Real-time Test',
      p_metadata: { 
        debug: true,
        timestamp: new Date().toISOString(),
        purpose: 'realtime-debugging'
      }
    });
    
    if (insertError) {
      console.error('   ❌ Insert failed:', insertError);
    } else {
      console.log('   ✅ Test record inserted:', insertData);
    }
  } catch (e) {
    console.error('   ❌ Insert error:', e);
  }
  
  // 8. Wait for event
  console.log('\n8️⃣ Waiting for real-time event (10 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // 9. Results
  console.log('\n📊 FINAL RESULTS:');
  console.log('─────────────────────');
  console.log(`Database access:      ✅`);
  console.log(`Subscription setup:   ${subscriptionSuccess ? '✅' : '❌'}`);
  console.log(`Real-time event:      ${eventReceived ? '✅' : '❌'}`);
  
  if (!eventReceived && subscriptionSuccess) {
    console.log('\n⚠️  WebSocket is connected but events are not being received.');
    console.log('\nThis could mean:');
    console.log('1. RLS policies are blocking real-time events');
    console.log('2. The publication is not properly configured');
    console.log('3. There\'s a delay in event propagation');
    
    console.log('\n🔧 Try running this SQL to check RLS:');
    console.log('SELECT * FROM pg_policies WHERE tablename = \'activity_logs\';');
  }
  
  // Cleanup
  supabase.removeChannel(testChannel);
  console.log('\n✅ Debug complete. Channel cleaned up.');
}

// Also test with a completely fresh client
export async function debugWithFreshClient() {
  console.log('🧪 Testing with fresh Supabase client...\n');
  
  const { createClient } = await import('@supabase/supabase-js');
  
  const freshClient = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  );
  
  // Get session from main client
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Set the session on fresh client
    await freshClient.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
  }
  
  let received = false;
  
  const channel = freshClient
    .channel('fresh-test-' + Date.now())
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'activity_logs'
    }, (payload) => {
      received = true;
      console.log('✅ Event received on fresh client!', payload);
    })
    .subscribe((status) => {
      console.log('Fresh client status:', status);
    });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Insert with fresh client
  const { error } = await freshClient.from('activity_logs').insert({
    action: 'created',
    entity_type: 'fresh-test',
    entity_id: 'fresh-' + Date.now(),
    entity_name: 'Fresh Client Test',
    metadata: { fresh: true }
  });
  
  if (error) {
    console.error('Insert error:', error);
  }
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Fresh client test complete. Event received:', received);
  
  freshClient.removeChannel(channel);
}

// Make available globally
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).debugRealtime = debugRealtime;
  (window as any).debugWithFreshClient = debugWithFreshClient;
}