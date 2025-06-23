// Direct fix for problematic activities - no fancy logic, just fix them
import { supabase } from '../lib/supabase';

export async function directActivityFix() {
  console.log('=== DIRECT FIX: Finding and fixing problematic activities ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // Get ALL invoice activities for this org
  const { data: activities, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('organization_id', orgId)
    .eq('entity_type', 'invoice');

  if (error) {
    console.error('Error fetching activities:', error);
    return;
  }

  if (!activities || activities.length === 0) {
    console.log('No invoice activities found');
    return;
  }

  console.log(`Found ${activities.length} invoice activities\n`);

  // Define what makes a good description
  const needsFix = (name: string) => {
    if (!name) return true;
    
    // These specific ones need fixing
    if (name === 'Test Activity Debug Entry') return true;
    if (name === 'INV-193186') return true;
    if (name === 'Test Direct Call') return true;
    if (name === 'Test Invoice #INV-DEBUG-456') return true;
    if (name === 'Invoice #INV-2025-001') return true;
    
    // Also fix if it doesn't have an action word
    const hasAction = ['created', 'updated', 'sent', 'marked', 'changed', 'deleted', 'viewed']
      .some(action => name.toLowerCase().includes(action));
    
    return !hasAction;
  };

  // Fix each problematic activity
  let fixed = 0;
  let errors = 0;

  for (const activity of activities) {
    const currentName = activity.entity_name || '';
    
    if (!needsFix(currentName)) {
      continue;
    }

    console.log(`\nFixing: "${currentName}" (ID: ${activity.id})`);

    // Generate new name based on what we have
    let newName = '';
    
    if (currentName === 'Test Activity Debug Entry') {
      newName = `${activity.action} invoice TEST-DEBUG`;
    } else if (currentName === 'Test Direct Call') {
      newName = `${activity.action} invoice TEST-DIRECT`;
    } else if (currentName === 'INV-193186') {
      newName = `${activity.action} invoice INV-193186`;
    } else if (currentName.startsWith('Test Invoice #')) {
      const num = currentName.replace('Test Invoice #', '');
      newName = `${activity.action} invoice ${num}`;
    } else if (currentName.startsWith('Invoice #')) {
      const num = currentName.replace('Invoice #', '');
      newName = `${activity.action} invoice ${num}`;
    } else if (currentName.match(/^INV-\d+$/)) {
      newName = `${activity.action} invoice ${currentName}`;
    } else if (!currentName) {
      newName = `${activity.action} invoice UNKNOWN`;
    } else {
      // For anything else, just prepend the action
      newName = `${activity.action} invoice ${currentName}`;
    }

    // Do the update
    const { error: updateError } = await supabase
      .from('activity_logs')
      .update({ entity_name: newName })
      .eq('id', activity.id);

    if (updateError) {
      console.error(`❌ Failed to update: ${updateError.message}`);
      errors++;
    } else {
      console.log(`✅ Updated to: "${newName}"`);
      fixed++;
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`✅ Fixed: ${fixed} activities`);
  console.log(`❌ Errors: ${errors}`);

  // Show final state
  console.log('\nFetching updated activities...');
  const { data: updated } = await supabase
    .from('activity_logs')
    .select('entity_name, action')
    .eq('organization_id', orgId)
    .eq('entity_type', 'invoice')
    .order('created_at', { ascending: false });

  if (updated) {
    console.log('\nAll invoice activities:');
    updated.forEach((a, i) => {
      const good = a.entity_name && 
        a.entity_name.includes('invoice') && 
        ['created', 'updated', 'sent', 'marked', 'changed', 'deleted', 'viewed']
          .some(action => a.entity_name.toLowerCase().includes(action));
      
      console.log(`${good ? '✅' : '❌'} ${i + 1}. ${a.entity_name || 'NO NAME'}`);
    });
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).directActivityFix = directActivityFix;
}