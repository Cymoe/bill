import { supabase } from '@/lib/supabase';

export async function testRealtimeSimple() {
  console.log('=== SIMPLE REAL-TIME TEST ===');
  
  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .single();
    
  if (!org) {
    console.error('No organization found');
    return;
  }
  
  console.log('Organization:', org.id, org.name);
  
  // Set up a simple subscription
  const channel = supabase
    .channel('simple-test')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'activity_logs',
      filter: `organization_id=eq.${org.id}`
    }, (payload) => {
      console.log('🎉 REAL-TIME EVENT RECEIVED!', payload);
    })
    .subscribe((status) => {
      console.log('Channel status:', status);
    });
  
  // Wait for subscription
  await new Promise(r => setTimeout(r, 2000));
  
  // Create test activity
  console.log('Creating test activity...');
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      action: 'created',
      entity_type: 'test',
      entity_id: 'simple-' + Date.now(),
      entity_name: 'Simple Test',
      organization_id: org.id,
      metadata: { test: true }
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Activity created:', data.id);
  }
  
  // Wait for event
  console.log('Waiting 5 seconds for real-time event...');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Test complete. Check console for real-time events.');
  
  // Cleanup
  supabase.removeChannel(channel);
}

if (typeof window !== 'undefined') {
  (window as any).testRealtimeSimple = testRealtimeSimple;
}