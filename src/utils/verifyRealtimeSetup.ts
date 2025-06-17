import { supabase } from '@/lib/supabase';

export async function verifyRealtimeSetup() {
  console.log('🔍 Verifying Real-time Setup for activity_logs...\n');
  
  const results = {
    tableExists: false,
    canQuery: false,
    realtimeEnabled: false,
    subscriptionWorks: false,
    insertWorks: false,
    eventReceived: false
  };
  
  // 1. Check if table exists
  try {
    const { data: tables, error } = await supabase
      .rpc('to_regclass', { qualified_name: 'public.activity_logs' });
    
    if (!error && tables) {
      results.tableExists = true;
      console.log('✅ Table exists: activity_logs');
    } else {
      console.error('❌ Table does not exist or cannot be accessed');
      return results;
    }
  } catch (e) {
    console.error('❌ Error checking table existence:', e);
  }
  
  // 2. Check if we can query the table
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id')
      .limit(1);
    
    if (!error) {
      results.canQuery = true;
      console.log('✅ Can query activity_logs table');
    } else {
      console.error('❌ Cannot query activity_logs:', error);
      return results;
    }
  } catch (e) {
    console.error('❌ Query error:', e);
  }
  
  // 3. Check if table is in realtime publication
  try {
    const { data: pubTables, error } = await supabase
      .rpc('get_publication_tables', { publication_name: 'supabase_realtime' })
      .eq('tablename', 'activity_logs');
    
    if (!error && pubTables && pubTables.length > 0) {
      results.realtimeEnabled = true;
      console.log('✅ Table is in supabase_realtime publication');
    } else {
      console.error('❌ Table is NOT in supabase_realtime publication');
      console.log('   Run this SQL to enable it:');
      console.log('   ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;');
    }
  } catch (e) {
    // Try alternative method
    try {
      const { data, error } = await supabase.rpc('check_realtime_enabled');
      if (!error && data) {
        results.realtimeEnabled = true;
        console.log('✅ Real-time appears to be enabled (alternative check)');
      }
    } catch (e2) {
      console.warn('⚠️  Could not verify realtime publication status');
    }
  }
  
  // 4. Test subscription
  console.log('\n📡 Testing real-time subscription...');
  
  let eventReceivedResolve: (value: boolean) => void;
  const eventReceivedPromise = new Promise<boolean>((resolve) => {
    eventReceivedResolve = resolve;
  });
  
  const testChannel = supabase
    .channel(`test-activity-logs-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs'
      },
      (payload) => {
        console.log('📨 Real-time INSERT event received!', payload);
        results.eventReceived = true;
        eventReceivedResolve(true);
      }
    )
    .subscribe((status, error) => {
      console.log(`   Subscription status: ${status}`);
      if (error) {
        console.error('   Subscription error:', error);
      }
      if (status === 'SUBSCRIBED') {
        results.subscriptionWorks = true;
        console.log('✅ Successfully subscribed to real-time changes');
      }
    });
  
  // Wait for subscription to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 5. Test insert
  if (results.subscriptionWorks) {
    console.log('\n🧪 Testing INSERT to trigger real-time event...');
    
    try {
      const { data: activityId, error } = await supabase.rpc('log_activity', {
        p_action: 'created',
        p_entity_type: 'test',
        p_entity_id: `realtime-test-${Date.now()}`,
        p_entity_name: 'Real-time Verification Test',
        p_metadata: { 
          test: true, 
          purpose: 'verify-realtime',
          timestamp: new Date().toISOString() 
        }
      });
      
      if (!error && activityId) {
        results.insertWorks = true;
        console.log('✅ Test activity inserted with ID:', activityId);
        
        // Wait for real-time event
        console.log('⏳ Waiting for real-time event (5 seconds)...');
        const received = await Promise.race([
          eventReceivedPromise,
          new Promise<boolean>(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        
        if (received) {
          console.log('✅ Real-time event received successfully!');
        } else {
          console.error('❌ No real-time event received within 5 seconds');
        }
      } else {
        console.error('❌ Failed to insert test activity:', error);
      }
    } catch (e) {
      console.error('❌ Insert error:', e);
    }
  }
  
  // Clean up
  supabase.removeChannel(testChannel);
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('────────────────────────────');
  console.log(`Table exists:         ${results.tableExists ? '✅' : '❌'}`);
  console.log(`Can query table:      ${results.canQuery ? '✅' : '❌'}`);
  console.log(`Real-time enabled:    ${results.realtimeEnabled ? '✅' : '❌'}`);
  console.log(`Subscription works:   ${results.subscriptionWorks ? '✅' : '❌'}`);
  console.log(`Insert works:         ${results.insertWorks ? '✅' : '❌'}`);
  console.log(`Event received:       ${results.eventReceived ? '✅' : '❌'}`);
  
  if (!results.realtimeEnabled) {
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('Real-time is NOT enabled for activity_logs table.');
    console.log('\nTo fix this:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run: ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;');
    console.log('3. Or go to Database > Replication and enable activity_logs');
  } else if (!results.eventReceived) {
    console.log('\n⚠️  Real-time might be enabled but events are not being received.');
    console.log('Possible causes:');
    console.log('- WebSocket connection issues');
    console.log('- RLS policies blocking real-time events');
    console.log('- Network/firewall blocking WebSocket');
  }
  
  return results;
}

// Make it available globally in dev
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).verifyRealtimeSetup = verifyRealtimeSetup;
}