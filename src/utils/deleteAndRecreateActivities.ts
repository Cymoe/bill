// Delete problematic activities and recreate them correctly
import { supabase } from '../lib/supabase';

export async function deleteAndRecreateActivities() {
  console.log('=== DELETE AND RECREATE PROBLEMATIC ACTIVITIES ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // First, let's see what we're dealing with
  console.log('1. Finding all problematic invoice activities...\n');
  
  const problematicNames = [
    'Test Activity Debug Entry',
    'INV-193186',
    'Test Direct Call',
    'Test Invoice #INV-DEBUG-456',
    'Invoice #INV-2025-001'
  ];

  const toDelete: any[] = [];
  
  // Find all activities with these names
  for (const name of problematicNames) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', orgId)
      .eq('entity_type', 'invoice')
      .eq('entity_name', name);
    
    if (error) {
      console.error(`Error finding "${name}":`, error);
      continue;
    }
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} activities with name "${name}"`);
      toDelete.push(...data);
    }
  }

  if (toDelete.length === 0) {
    console.log('No problematic activities found to delete.');
    return;
  }

  console.log(`\nTotal activities to delete: ${toDelete.length}`);
  
  // Ask for confirmation
  console.log('\n2. Deleting these activities...\n');
  
  let deleted = 0;
  let failed = 0;
  
  for (const activity of toDelete) {
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .eq('id', activity.id);
    
    if (error) {
      console.error(`❌ Failed to delete "${activity.entity_name}" (ID: ${activity.id}):`, error);
      failed++;
    } else {
      console.log(`✅ Deleted: "${activity.entity_name}" (ID: ${activity.id})`);
      deleted++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`✅ Deleted: ${deleted} activities`);
  console.log(`❌ Failed: ${failed} activities`);

  // Now let's create some proper test activities if needed
  if (deleted > 0) {
    console.log('\n3. Creating proper test activities...\n');
    
    const testActivities = [
      {
        action: 'created',
        description: 'created invoice TEST-001',
        entityId: 'test-001'
      },
      {
        action: 'updated', 
        description: 'updated invoice TEST-002',
        entityId: 'test-002'
      },
      {
        action: 'sent',
        description: 'sent invoice TEST-003',
        entityId: 'test-003'
      }
    ];

    for (const activity of testActivities) {
      try {
        const { data, error } = await supabase.rpc('log_activity', {
          p_action: activity.action,
          p_entity_type: 'invoice',
          p_entity_id: activity.entityId,
          p_entity_name: activity.description,
          p_metadata: JSON.stringify({ test: true }),
          p_organization_id: orgId
        });

        if (error) {
          console.error(`❌ Failed to create test activity:`, error);
        } else {
          console.log(`✅ Created: "${activity.description}"`);
        }
      } catch (err) {
        console.error(`❌ Error creating activity:`, err);
      }
    }
  }

  console.log('\n✅ Complete! Refresh the activity page to see the changes.');
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).deleteAndRecreateActivities = deleteAndRecreateActivities;
}