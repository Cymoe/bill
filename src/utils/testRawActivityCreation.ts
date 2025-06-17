import { supabase } from '../lib/supabase';

export async function testRawActivityCreation() {
  console.log('=== TESTING RAW ACTIVITY CREATION ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // Test 1: Create activity directly in table
  console.log('TEST 1: Direct insert into activity_logs table...');
  const { data: directActivity, error: directError } = await supabase
    .from('activity_logs')
    .insert({
      organization_id: orgId,
      action: 'created',
      entity_type: 'invoice',
      entity_name: 'TEST DIRECT: created invoice TEST-DIRECT-123',
      metadata: { test: true, method: 'direct_insert' }
    })
    .select()
    .single();

  if (directError) {
    console.error('❌ Direct insert failed:', directError);
  } else {
    console.log('✅ Direct insert successful!');
    console.log('Activity ID:', directActivity.id);
  }

  // Test 2: Use RPC function
  console.log('\nTEST 2: Using log_activity RPC function...');
  const { data: rpcResult, error: rpcError } = await supabase.rpc('log_activity', {
    p_action: 'created',
    p_entity_type: 'invoice',
    p_entity_id: null,
    p_entity_name: 'TEST RPC: created invoice TEST-RPC-456',
    p_metadata: JSON.stringify({ test: true, method: 'rpc_function' }),
    p_organization_id: orgId
  });

  if (rpcError) {
    console.error('❌ RPC function failed:', rpcError);
  } else {
    console.log('✅ RPC function successful!');
    console.log('Result:', rpcResult);
  }

  // Test 3: Check if they appear in activity feed
  console.log('\nTEST 3: Checking if test activities appear...');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { data: testActivities } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('organization_id', orgId)
    .like('entity_name', 'TEST%')
    .order('created_at', { ascending: false })
    .limit(5);

  if (testActivities && testActivities.length > 0) {
    console.log(`Found ${testActivities.length} test activities:`);
    testActivities.forEach(a => {
      console.log(`  - ${a.entity_name} (${a.created_at})`);
    });
    console.log('\n🎯 CHECK YOUR ACTIVITY PANEL!');
    console.log('You should see activities starting with "Agent created invoice TEST-"');
  } else {
    console.log('❌ No test activities found!');
  }

  // Test 4: Check real-time subscription
  console.log('\nTEST 4: Testing real-time subscription...');
  
  // Subscribe to changes
  const channel = supabase
    .channel('test-activities')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs',
        filter: `organization_id=eq.${orgId}`
      },
      (payload) => {
        console.log('📡 Real-time event received:', payload);
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });

  // Create another test activity after subscription
  setTimeout(async () => {
    console.log('\nCreating activity to test real-time...');
    await supabase
      .from('activity_logs')
      .insert({
        organization_id: orgId,
        action: 'created',
        entity_type: 'invoice',
        entity_name: 'TEST REALTIME: created invoice TEST-RT-789',
        metadata: { test: true, method: 'realtime_test' }
      });
    
    console.log('Activity created. Check if real-time event was logged above.');
    
    // Cleanup
    setTimeout(() => {
      channel.unsubscribe();
      console.log('\n✅ Test complete. Check your Activity panel!');
    }, 2000);
  }, 2000);
}

// Auto-run
testRawActivityCreation();

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testRawActivityCreation = testRawActivityCreation;
}