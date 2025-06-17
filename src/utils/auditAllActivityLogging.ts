// Audit ALL activity logging across the entire application
import { supabase } from '../lib/supabase';

export async function auditAllActivityLogging() {
  console.log('=== AUDITING ALL ACTIVITY LOGGING ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // 1. Check what entity types have activities
  console.log('1. Checking activity counts by entity type...\n');
  
  const entityTypes = [
    'invoice', 'estimate', 'client', 'project', 'product', 
    'expense', 'vendor', 'subcontractor', 'team_member', 
    'work_pack', 'template'
  ];
  
  const activityCounts: Record<string, number> = {};
  
  for (const entityType of entityTypes) {
    const { count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('entity_type', entityType);
    
    activityCounts[entityType] = count || 0;
    console.log(`${entityType}: ${count || 0} activities`);
  }
  
  // 2. Check recent activities
  console.log('\n2. Recent activities (last 20)...\n');
  
  const { data: recentActivities } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (recentActivities) {
    recentActivities.forEach((activity, i) => {
      console.log(`${i + 1}. [${activity.entity_type}] ${activity.entity_name || activity.action} (${new Date(activity.created_at).toLocaleString()})`);
    });
  }
  
  // 3. Check which services have activity logging
  console.log('\n3. Checking which services have ActivityLogService imported...\n');
  
  const servicesToCheck = [
    'InvoiceService', 'EstimateService', 'ClientService', 'ProjectService',
    'ProductService', 'ExpenseService', 'VendorService', 'SubcontractorService',
    'TeamMemberService', 'WorkPackService'
  ];
  
  console.log('Services that SHOULD have activity logging:');
  servicesToCheck.forEach(service => console.log(`- ${service}`));
  
  // 4. Test creating an activity for each type
  console.log('\n4. Testing activity creation for each entity type...\n');
  
  const testActivities = [
    { type: 'client', action: 'created', name: 'test client activity' },
    { type: 'project', action: 'created', name: 'test project activity' },
    { type: 'product', action: 'created', name: 'test product activity' },
    { type: 'expense', action: 'created', name: 'test expense activity' },
  ];
  
  for (const test of testActivities) {
    try {
      const { error } = await supabase.rpc('log_activity', {
        p_action: test.action,
        p_entity_type: test.type,
        p_entity_id: `test-${Date.now()}`,
        p_entity_name: test.name,
        p_metadata: JSON.stringify({ test: true }),
        p_organization_id: orgId
      });
      
      if (error) {
        console.error(`❌ Failed to create ${test.type} activity:`, error.message);
      } else {
        console.log(`✅ Successfully created ${test.type} activity`);
      }
    } catch (err) {
      console.error(`❌ Error creating ${test.type} activity:`, err);
    }
  }
  
  // 5. Summary
  console.log('\n=== SUMMARY ===\n');
  
  const activeTypes = Object.entries(activityCounts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => `${type} (${count})`);
    
  const inactiveTypes = Object.entries(activityCounts)
    .filter(([_, count]) => count === 0)
    .map(([type]) => type);
  
  console.log('Entity types WITH activities:', activeTypes.join(', ') || 'NONE');
  console.log('\nEntity types WITHOUT activities:', inactiveTypes.join(', ') || 'NONE');
  
  if (inactiveTypes.length > 0) {
    console.log('\n⚠️  WARNING: The following entity types have NO activities:');
    inactiveTypes.forEach(type => console.log(`   - ${type}`));
    console.log('\nThese services may not have activity logging implemented!');
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).auditAllActivityLogging = auditAllActivityLogging;
}