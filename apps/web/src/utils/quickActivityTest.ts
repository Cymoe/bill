// Quick test to check activity logging and real-time
export async function quickActivityTest() {
  const { supabase } = await import('@/lib/supabase');
  const { ActivityLogService } = await import('@/services/ActivityLogService');
  
  console.log('=== QUICK ACTIVITY TEST ===');
  
  // 1. Get user and org
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User ID:', user?.id);
  
  // 2. Get organization
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name')
    .single();
  
  console.log('Organization:', orgs?.id, orgs?.name);
  
  // 3. Check last 5 activities
  console.log('\n📋 Recent activities:');
  const { data: activities } = await supabase
    .from('activity_logs')
    .select('id, action, entity_type, entity_name, created_at, organization_id')
    .order('created_at', { ascending: false })
    .limit(5);
  
  activities?.forEach(a => {
    console.log(`- ${a.action} ${a.entity_type}: ${a.entity_name} (org: ${a.organization_id})`);
  });
  
  // 4. Create test activity
  console.log('\n🧪 Creating test activity...');
  const testId = `test-${Date.now()}`;
  
  const { data: newActivity, error } = await supabase
    .from('activity_logs')
    .insert({
      action: 'created',
      entity_type: 'test',
      entity_id: testId,
      entity_name: 'Quick Test Activity',
      organization_id: orgs?.id,
      user_id: user?.id,
      metadata: { quick_test: true }
    })
    .select()
    .single();
  
  if (error) {
    console.error('❌ Error creating activity:', error);
  } else {
    console.log('✅ Activity created:', newActivity.id);
  }
  
  // 5. Subscribe and test real-time
  console.log('\n📡 Testing real-time...');
  let received = false;
  
  const channel = supabase
    .channel('quick-test-' + Date.now())
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'activity_logs',
      filter: `organization_id=eq.${orgs?.id}`
    }, (payload) => {
      console.log('🎉 REAL-TIME EVENT:', payload);
      received = true;
    })
    .subscribe();
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Create another activity
  await supabase.from('activity_logs').insert({
    action: 'created',
    entity_type: 'test',
    entity_id: 'realtime-' + Date.now(),
    entity_name: 'Real-time Test',
    organization_id: orgs?.id,
    user_id: user?.id,
    metadata: { realtime_test: true }
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('\n=== RESULTS ===');
  console.log('Organization ID:', orgs?.id);
  console.log('Activities created: ✅');
  console.log('Real-time received:', received ? '✅' : '❌');
  
  if (!received) {
    console.log('\n⚠️  Real-time not working. Check:');
    console.log('- Is the Activity Panel using the same org ID?');
    console.log('- Are WebSockets blocked?');
  }
  
  supabase.removeChannel(channel);
}

if (typeof window !== 'undefined') {
  (window as any).quickActivityTest = quickActivityTest;
}