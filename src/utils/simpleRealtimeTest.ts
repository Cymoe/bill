import { supabase } from '@/lib/supabase';

export async function simpleRealtimeTest() {
  console.log('=== SIMPLE REALTIME TEST ===');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user logged in');
    return;
  }
  
  // Get org from user metadata
  const orgId = user.user_metadata?.organization_id;
  if (!orgId) {
    console.error('No organization_id in user metadata');
    return;
  }
  
  console.log('Testing with org:', orgId);
  
  // Create a VERY simple channel
  const channel = supabase.channel('simple-test-channel');
  
  // Subscribe to postgres changes
  channel
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'activity_logs'
    }, (payload) => {
      console.log('🎉 GOT EVENT!', payload);
    })
    .subscribe((status) => {
      console.log('Status:', status);
    });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  // Create test record
  console.log('Creating test activity...');
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      action: 'created',
      entity_type: 'test',
      entity_id: 'test-' + Date.now(),
      entity_name: 'Simple Test',
      organization_id: orgId
    });
    
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert successful');
  }
  
  // Wait for event
  console.log('Waiting 5 seconds...');
  await new Promise(r => setTimeout(r, 5000));
  
  // Cleanup
  console.log('Cleaning up...');
  supabase.removeChannel(channel);
  console.log('Done!');
}

if (typeof window !== 'undefined') {
  (window as any).simpleRealtimeTest = simpleRealtimeTest;
}