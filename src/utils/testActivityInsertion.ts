import { ActivityLogService } from '@/services/ActivityLogService';
import { supabase } from '@/lib/supabase';

export async function testActivityInsertion() {
  console.log('🧪 Testing activity insertion for real-time updates...');
  
  try {
    // Get current user's organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user logged in');
      return null;
    }
    
    // Get first organization for the user
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();
      
    const orgId = userOrg?.organization_id;
    if (!orgId) {
      console.error('❌ No organization found for user');
      return null;
    }
    
    console.log('✅ Using organization:', orgId);
    
    // Create a test activity
    const activityId = await ActivityLogService.logActivity(
      'created',
      'test',
      `test-${Date.now()}`,
      'Real-time Test Activity',
      {
        test: true,
        timestamp: new Date().toISOString(),
        purpose: 'Testing real-time updates'
      },
      orgId
    );
    
    if (activityId) {
      console.log('✅ Test activity created successfully with ID:', activityId);
      console.log('👀 Check if the activity appears in the Activity Panel without refreshing');
      return activityId;
    } else {
      console.error('❌ Failed to create test activity');
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating test activity:', error);
    return null;
  }
}

// Export a function to be called from the browser console
if (typeof window !== 'undefined') {
  (window as any).testActivityInsertion = testActivityInsertion;
}