import { ActivityLogService } from '@/services/ActivityLogService';

export async function testActivityInsertion() {
  console.log('🧪 Testing activity insertion for real-time updates...');
  
  try {
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
      }
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