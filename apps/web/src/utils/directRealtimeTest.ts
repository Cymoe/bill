import { createClient } from '@supabase/supabase-js';

export async function directRealtimeTest() {
  console.log('🧪 Direct Real-time Test Starting...\n');
  
  // Get Supabase credentials
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  // Create a fresh client to avoid any cached states
  const testClient = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  
  console.log('1️⃣ Creating test channel...');
  
  let receivedEvent = false;
  const channelName = `direct-test-${Date.now()}`;
  
  const channel = testClient
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to ALL events
        schema: 'public',
        table: 'activity_logs'
      },
      (payload) => {
        receivedEvent = true;
        console.log('✅ REAL-TIME EVENT RECEIVED!');
        console.log('Event type:', payload.eventType);
        console.log('Table:', payload.table);
        console.log('New record:', payload.new);
        console.log('Full payload:', JSON.stringify(payload, null, 2));
      }
    );
  
  console.log('2️⃣ Subscribing to channel...');
  
  const subscription = channel.subscribe((status, error) => {
    console.log(`Subscription status: ${status}`);
    if (error) {
      console.error('Subscription error:', error);
    }
  });
  
  // Wait for subscription
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n3️⃣ Channel state:', channel.state);
  console.log('Socket state:', (channel as any).socket?.state());
  
  if (channel.state !== 'subscribed') {
    console.error('❌ Failed to subscribe to channel');
    console.log('\nPossible reasons:');
    console.log('- Table not in realtime publication');
    console.log('- WebSocket connection blocked');
    console.log('- Authentication issues');
    testClient.removeChannel(channel);
    return;
  }
  
  console.log('\n4️⃣ Inserting test record directly...');
  
  // Insert directly without using RPC
  const { data: insertData, error: insertError } = await testClient
    .from('activity_logs')
    .insert({
      action: 'created',
      entity_type: 'test',
      entity_id: `direct-test-${Date.now()}`,
      entity_name: 'Direct Real-time Test',
      metadata: { 
        test: true, 
        method: 'direct-insert',
        timestamp: new Date().toISOString() 
      }
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Insert failed:', insertError);
    testClient.removeChannel(channel);
    return;
  }
  
  console.log('✅ Record inserted:', insertData.id);
  
  console.log('\n5️⃣ Waiting for real-time event (10 seconds)...');
  
  // Wait for event
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  if (receivedEvent) {
    console.log('\n🎉 SUCCESS! Real-time is working!');
  } else {
    console.log('\n❌ FAILED! No real-time event received.');
    console.log('\nThis confirms that real-time is NOT enabled for activity_logs.');
    console.log('\n📋 To fix this:');
    console.log('1. Go to: https://app.supabase.com/project/' + supabaseUrl.split('.')[0].replace('https://', ''));
    console.log('2. Navigate to: Database → Replication');
    console.log('3. Find "activity_logs" in the table list');
    console.log('4. Toggle the switch to enable it');
    console.log('5. Save and wait a few seconds');
    console.log('\nAlternatively, run this SQL:');
    console.log('ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;');
  }
  
  // Cleanup
  testClient.removeChannel(channel);
  console.log('\n🧹 Test complete. Channel cleaned up.');
}

// Make available in console
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).directRealtimeTest = directRealtimeTest;
}