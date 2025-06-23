// Utility to check activity database state
import { supabase } from '../lib/supabase';

export async function checkActivityDatabase() {
  try {
    console.log('=== Activity Database Check ===');
    
    // 1. Check activity_logs table
    const { data: activities, error: activitiesError } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return;
    }
    
    console.log(`Found ${activities?.length || 0} recent activities`);
    
    // 2. Count activities by entity type
    const { data: typeCounts, error: typeError } = await supabase
      .from('activity_logs')
      .select('entity_type')
      .order('entity_type');
    
    if (!typeError && typeCounts) {
      const counts: Record<string, number> = {};
      typeCounts.forEach(row => {
        counts[row.entity_type] = (counts[row.entity_type] || 0) + 1;
      });
      
      console.log('Activities by type:', counts);
    }
    
    // 3. Count activities by action
    const { data: actionCounts, error: actionError } = await supabase
      .from('activity_logs')
      .select('action')
      .order('action');
    
    if (!actionError && actionCounts) {
      const counts: Record<string, number> = {};
      actionCounts.forEach(row => {
        counts[row.action] = (counts[row.action] || 0) + 1;
      });
      
      console.log('Activities by action:', counts);
    }
    
    // 4. Show recent activities
    console.log('\nRecent activities:');
    activities?.forEach(activity => {
      console.log(`- ${activity.created_at}: ${activity.action} ${activity.entity_type} "${activity.entity_name}"`);
    });
    
    // 5. Test RPC function
    console.log('\n=== Testing RPC Function ===');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('log_activity', {
      p_action: 'test',
      p_entity_type: 'test',
      p_entity_id: 'test-id',
      p_entity_name: 'Test Activity from checkActivityDatabase',
      p_metadata: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      p_organization_id: null
    });
    
    if (rpcError) {
      console.error('RPC Error:', rpcError);
    } else {
      console.log('RPC Success:', rpcResult);
    }
    
    console.log('\n=== Check Complete ===');
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).checkActivityDatabase = checkActivityDatabase;
}