import { supabase } from '@/lib/supabase';
import { ActivityLogService } from '@/services/ActivityLogService';

export async function testActivityLogging() {
  console.log('🧪 Testing Activity Logging...\n');
  
  // 1. Get current organization
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  
  // Get organization from user metadata or first organization
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('owner_id', user.id)
    .limit(1);
    
  const orgId = orgs?.[0]?.id || user.user_metadata?.organization_id;
  
  if (!orgId) {
    console.error('❌ No organization found');
    return;
  }
  
  console.log('✅ Using organization:', orgId);
  
  // 2. Create test activity using the service
  console.log('\n📝 Creating test activity...');
  const activityId = await ActivityLogService.logActivity(
    'created',
    'test',
    `manual-test-${Date.now()}`,
    'Manual Test Activity',
    {
      test: true,
      created_by: 'testActivityLogging',
      timestamp: new Date().toISOString()
    },
    orgId
  );
  
  if (activityId) {
    console.log('✅ Activity created with ID:', activityId);
  } else {
    console.error('❌ Failed to create activity');
    return;
  }
  
  // 3. Check if it was saved to database
  console.log('\n🔍 Verifying in database...');
  const { data: savedActivity, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('id', activityId)
    .single();
    
  if (error) {
    console.error('❌ Error fetching activity:', error);
  } else {
    console.log('✅ Activity found in database:', {
      id: savedActivity.id,
      action: savedActivity.action,
      entity_type: savedActivity.entity_type,
      organization_id: savedActivity.organization_id
    });
  }
  
  // 4. Test fetching activities
  console.log('\n📋 Fetching recent activities...');
  const activities = await ActivityLogService.getActivities({ limit: 5 });
  console.log(`Found ${activities.length} recent activities`);
  
  // 5. Check real-time subscription
  console.log('\n📡 Setting up real-time subscription...');
  let received = false;
  
  const { unsubscribe } = ActivityLogService.subscribeToActivities(
    (activity) => {
      console.log('🎉 Real-time activity received!', activity);
      received = true;
    },
    { organization_id: orgId }
  );
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create another test activity
  console.log('\n📝 Creating another test activity to trigger real-time...');
  const testId2 = await ActivityLogService.logActivity(
    'updated',
    'test',
    `realtime-test-${Date.now()}`,
    'Real-time Test Activity',
    { realtime_test: true },
    orgId
  );
  
  console.log('Activity created, waiting for real-time event...');
  
  // Wait for real-time
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  if (received) {
    console.log('\n✅ Real-time is working!');
  } else {
    console.log('\n❌ No real-time event received');
    console.log('Possible issues:');
    console.log('- Real-time not enabled for activity_logs table');
    console.log('- WebSocket connection issues');
    console.log('- Organization ID mismatch');
  }
  
  // Cleanup
  unsubscribe();
  
  console.log('\n✅ Test complete');
}

// Make available globally
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).testActivityLogging = testActivityLogging;
}