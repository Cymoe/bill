import { supabase } from '../lib/supabase';

export async function checkWorkPackTemplateActivities() {
  console.log('=== CHECKING WORK PACK & TEMPLATE ACTIVITIES ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  try {
    // 1. Check work pack activities
    console.log('1. Work Pack Activities:\n');
    
    const { data: workPackActivities, count: wpCount } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('entity_type', 'work_pack')
      .order('created_at', { ascending: false })
      .limit(5);
      
    console.log(`Total work pack activities: ${wpCount || 0}`);
    
    if (workPackActivities && workPackActivities.length > 0) {
      workPackActivities.forEach((activity, i) => {
        console.log(`\n${i + 1}. ${activity.action} - ${activity.entity_name || 'No name'}`);
        console.log(`   ID: ${activity.entity_id}`);
        console.log(`   Date: ${new Date(activity.created_at).toLocaleString()}`);
        if (activity.metadata) {
          console.log(`   Details:`, activity.metadata);
        }
      });
    } else {
      console.log('   No work pack activities found');
    }
    
    // 2. Check template activities
    console.log('\n\n2. Template Activities:\n');
    
    const { data: templateActivities, count: tCount } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('entity_type', 'template')
      .order('created_at', { ascending: false })
      .limit(5);
      
    console.log(`Total template activities: ${tCount || 0}`);
    
    if (templateActivities && templateActivities.length > 0) {
      templateActivities.forEach((activity, i) => {
        console.log(`\n${i + 1}. ${activity.action} - ${activity.entity_name || 'No name'}`);
        console.log(`   ID: ${activity.entity_id}`);
        console.log(`   Date: ${new Date(activity.created_at).toLocaleString()}`);
        if (activity.metadata) {
          console.log(`   Details:`, activity.metadata);
        }
      });
    } else {
      console.log('   No template activities found');
    }
    
    // 3. Summary by action type
    console.log('\n\n3. Activity Summary:\n');
    
    const { data: actionSummary } = await supabase
      .from('activity_logs')
      .select('entity_type, action')
      .eq('organization_id', orgId)
      .in('entity_type', ['work_pack', 'template']);
      
    if (actionSummary) {
      const summary: Record<string, Record<string, number>> = {};
      
      actionSummary.forEach(item => {
        if (!summary[item.entity_type]) {
          summary[item.entity_type] = {};
        }
        summary[item.entity_type][item.action] = (summary[item.entity_type][item.action] || 0) + 1;
      });
      
      Object.entries(summary).forEach(([entityType, actions]) => {
        console.log(`${entityType}:`);
        Object.entries(actions).forEach(([action, count]) => {
          console.log(`   ${action}: ${count}`);
        });
      });
    }
    
    console.log('\n=== CHECK COMPLETED ===');
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).checkWorkPackTemplateActivities = checkWorkPackTemplateActivities;
}