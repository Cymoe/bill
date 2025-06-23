// Let's actually see what's happening with these activities
import { supabase } from '../lib/supabase';

export async function debugWhyNotFixing() {
  console.log('=== DEBUGGING: Why aren\'t these activities getting fixed? ===\\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // Let's specifically look for the problematic activities
  const problematicNames = [
    'Test Activity Debug Entry',
    'INV-193186', 
    'Test Direct Call',
    'Test Invoice #INV-DEBUG-456',
    'Invoice #INV-2025-001'
  ];

  console.log('Looking for these specific activities:\n');
  
  for (const name of problematicNames) {
    console.log(`\nSearching for: "${name}"`);
    
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, entity_name, entity_type, action, created_at')
      .eq('organization_id', orgId)
      .eq('entity_type', 'invoice')
      .eq('entity_name', name);
    
    if (error) {
      console.error('Query error:', error);
      continue;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ NOT FOUND - This name doesn\'t exist exactly as shown');
      continue;
    }
    
    console.log(`✅ FOUND ${data.length} activities with this exact name:`);
    data.forEach(activity => {
      console.log(`   ID: ${activity.id}`);
      console.log(`   Action: ${activity.action}`);
      console.log(`   Created: ${activity.created_at}`);
      
      // Try to update it RIGHT NOW
      console.log('\n   Attempting to update this specific activity...');
      
      const newName = `${activity.action} invoice ${name.replace('Test Activity Debug Entry', 'TEST-DEBUG').replace('Test Direct Call', 'TEST-DIRECT')}`;
      
      supabase
        .from('activity_logs')
        .update({ entity_name: newName })
        .eq('id', activity.id)
        .then(({ error: updateError }) => {
          if (updateError) {
            console.error(`   ❌ UPDATE FAILED:`, updateError);
          } else {
            console.log(`   ✅ UPDATE SUCCESSFUL: "${name}" → "${newName}"`);
          }
        });
    });
  }
  
  console.log('\n\nNow let\'s see what activities actually exist for this org:');
  
  const { data: allActivities } = await supabase
    .from('activity_logs')
    .select('id, entity_name, entity_type')
    .eq('organization_id', orgId)
    .eq('entity_type', 'invoice')
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (allActivities) {
    console.log(`\nFound ${allActivities.length} invoice activities:`);
    allActivities.forEach((a, i) => {
      console.log(`${i + 1}. "${a.entity_name}" (ID: ${a.id})`);
    });
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).debugWhyNotFixing = debugWhyNotFixing;
}