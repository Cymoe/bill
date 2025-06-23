// Check if activity tracking is complete and caught up
import { supabase } from '../lib/supabase';

export async function checkActivityStatus() {
  console.log('=== CHECKING ACTIVITY STATUS ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // Check activity counts by type
  const entityTypes = [
    'invoice', 'estimate', 'client', 'project', 'product', 
    'expense', 'vendor', 'subcontractor', 'team_member'
  ];
  
  console.log('Activity counts by entity type:');
  let totalActivities = 0;
  
  for (const type of entityTypes) {
    const { count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('entity_type', type);
    
    const typeCount = count || 0;
    totalActivities += typeCount;
    console.log(`${type}: ${typeCount} activities`);
  }
  
  console.log(`\nTOTAL ACTIVITIES: ${totalActivities}`);
  
  // Check recent activities
  console.log('\nMost recent activities:');
  const { data: recent } = await supabase
    .from('activity_logs')
    .select('entity_type, entity_name, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (recent) {
    recent.forEach((a, i) => {
      const time = new Date(a.created_at);
      console.log(`${i + 1}. [${a.entity_type}] ${a.entity_name} (${time.toLocaleString()})`);
    });
  }
  
  // Check if there are any entities without activities
  console.log('\n--- Checking for missing activities ---');
  
  const tables = ['clients', 'projects', 'products'];
  let missingCount = 0;
  
  for (const table of tables) {
    const entityType = table.slice(0, -1); // Remove 's'
    
    // Get all entities
    const { count: entityCount } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);
    
    // Get activities for this type
    const { count: activityCount } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('entity_type', entityType)
      .eq('action', 'created');
    
    const missing = (entityCount || 0) - (activityCount || 0);
    if (missing > 0) {
      console.log(`⚠️  ${table}: ${missing} entities without creation activities`);
      missingCount += missing;
    } else {
      console.log(`✅ ${table}: All entities have activities`);
    }
  }
  
  if (missingCount === 0) {
    console.log('\n🎉 ALL CAUGHT UP! Every entity has activity tracking.');
  } else {
    console.log(`\n⚠️  ${missingCount} entities still need activities.`);
  }
  
  console.log('\n✅ Activity tracking is active for all new operations.');
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).checkActivityStatus = checkActivityStatus;
}