// Check what data exists in Supabase
import { supabase } from '../lib/supabase';

export async function checkSupabaseData() {
  console.log('=== CHECKING SUPABASE DATA ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  const tables = [
    'clients',
    'projects', 
    'products',
    'invoices',
    'estimates',
    'expenses',
    'vendors',
    'subcontractors',
    'team_members',
    'activity_logs'
  ];

  console.log(`Checking data for organization: ${orgId}\n`);

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      if (error) {
        console.log(`${table}: ❌ Error - ${error.message}`);
      } else {
        console.log(`${table}: ${count || 0} records`);
      }
    } catch (err) {
      console.log(`${table}: ❌ Failed to query`);
    }
  }

  // Show sample data from activity_logs
  console.log('\n--- Sample Activity Logs ---');
  const { data: sampleActivities } = await supabase
    .from('activity_logs')
    .select('entity_type, entity_name, action, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (sampleActivities && sampleActivities.length > 0) {
    sampleActivities.forEach((activity, i) => {
      console.log(`${i + 1}. [${activity.entity_type}] ${activity.entity_name} (${new Date(activity.created_at).toLocaleDateString()})`);
    });
  } else {
    console.log('No activities found');
  }

  // Check for entities without activities
  console.log('\n--- Checking for Entities Without Activities ---');
  
  for (const table of ['clients', 'projects', 'products']) {
    const { data: entities } = await supabase
      .from(table)
      .select('id, name')
      .eq('organization_id', orgId)
      .limit(5);

    if (entities && entities.length > 0) {
      console.log(`\n${table}:`);
      for (const entity of entities) {
        const { count } = await supabase
          .from('activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('entity_type', table.slice(0, -1)) // Remove 's' from table name
          .eq('entity_id', entity.id);

        const hasActivity = (count || 0) > 0;
        console.log(`  ${hasActivity ? '✅' : '❌'} ${entity.name} (${count || 0} activities)`);
      }
    }
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).checkSupabaseData = checkSupabaseData;
}