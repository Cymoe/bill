// Manually fix specific bad invoice activities
import { supabase } from '../lib/supabase';

export async function manuallyFixBadActivities(organizationId?: string) {
  console.log('=== Manually Fixing Bad Invoice Activities ===\n');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user logged in');
      return;
    }
    
    // If no org ID provided, try to get it
    if (!organizationId) {
      const storedOrgId = localStorage.getItem('selectedOrgId');
      if (storedOrgId) {
        organizationId = storedOrgId;
      } else {
        const { data: userOrgs } = await supabase
          .from('user_organizations')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (userOrgs && userOrgs.length > 0) {
          organizationId = userOrgs[0].organization_id;
        } else {
          console.log('❌ No organization found');
          return;
        }
      }
    }
    
    console.log(`Using organization ID: ${organizationId}\n`);
    
    // First, get ALL invoice activities to see what we're dealing with
    console.log('Fetching all invoice activities...');
    const { data: allInvoiceActivities, error: fetchError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'invoice')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching activities:', fetchError);
      return;
    }
    
    if (!allInvoiceActivities || allInvoiceActivities.length === 0) {
      console.log('No invoice activities found.');
      return;
    }
    
    console.log(`Found ${allInvoiceActivities.length} total invoice activities\n`);
    
    // Group activities by entity_name to find duplicates
    const activityGroups: Record<string, typeof allInvoiceActivities> = {};
    allInvoiceActivities.forEach(activity => {
      const key = activity.entity_name || 'NO_NAME';
      if (!activityGroups[key]) {
        activityGroups[key] = [];
      }
      activityGroups[key].push(activity);
    });
    
    // Show current state with duplicates
    console.log('Current state (showing duplicates):');
    Object.entries(activityGroups).forEach(([name, activities]) => {
      const isValid = isValidInvoiceDescription(name);
      const icon = isValid ? '✅' : '❌';
      const count = activities.length > 1 ? ` (${activities.length} instances)` : '';
      console.log(`${icon} "${name}"${count}`);
    });
    
    console.log('\n--- Starting fixes ---\n');
    
    let totalFixed = 0;
    let skipped = 0;
    
    // Process each activity
    for (const activity of allInvoiceActivities) {
      const currentName = activity.entity_name || '';
      
      // Skip if already valid
      if (isValidInvoiceDescription(currentName)) {
        skipped++;
        continue;
      }
      
      console.log(`\nProcessing: "${currentName}" (ID: ${activity.id})`);
      
      // Determine the correct name
      let newName = '';
      
      // Handle specific known bad entries
      if (currentName === 'Test Activity Debug Entry') {
        newName = `${activity.action} invoice TEST-DEBUG`;
      } else if (currentName === 'Test Direct Call') {
        newName = `${activity.action} invoice TEST-DIRECT`;
      } else if (currentName === 'INV-193186') {
        newName = `${activity.action} invoice INV-193186`;
      } else if (!currentName) {
        // No name at all
        newName = `${activity.action} invoice UNKNOWN-${activity.id.slice(0, 8)}`;
      } else {
        // Try to extract invoice number from the current name
        let invoiceNumber = extractInvoiceNumber(currentName);
        
        if (!invoiceNumber) {
          // If we can't extract a number, use a sanitized version of the name
          invoiceNumber = currentName.replace(/[^A-Z0-9-]/gi, '').slice(0, 20) || 'UNKNOWN';
        }
        
        newName = `${activity.action} invoice ${invoiceNumber}`;
      }
      
      // Update the activity
      const { error: updateError } = await supabase
        .from('activity_logs')
        .update({ entity_name: newName })
        .eq('id', activity.id);
      
      if (updateError) {
        console.error(`❌ Failed to update:`, updateError);
      } else {
        console.log(`✅ Fixed: "${currentName}" → "${newName}"`);
        totalFixed++;
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`✅ Total activities fixed: ${totalFixed}`);
    console.log(`⏭️  Activities skipped (already valid): ${skipped}`);
    
    // Show final state
    console.log('\nFinal check of all invoice activities:');
    const { data: finalCheck } = await supabase
      .from('activity_logs')
      .select('id, entity_name, action, created_at')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'invoice')
      .order('created_at', { ascending: false });
    
    if (finalCheck) {
      // Group final results
      const finalGroups: Record<string, typeof finalCheck> = {};
      finalCheck.forEach(activity => {
        const key = activity.entity_name || 'NO_NAME';
        if (!finalGroups[key]) {
          finalGroups[key] = [];
        }
        finalGroups[key].push(activity);
      });
      
      let stillBadCount = 0;
      Object.entries(finalGroups).forEach(([name, activities]) => {
        const isValid = isValidInvoiceDescription(name);
        const icon = isValid ? '✅' : '❌';
        const count = activities.length > 1 ? ` (${activities.length} instances)` : '';
        console.log(`${icon} "${name}"${count}`);
        
        if (!isValid) {
          stillBadCount += activities.length;
        }
      });
      
      if (stillBadCount === 0) {
        console.log('\n🎉 All invoice activities now have proper descriptions!');
      } else {
        console.log(`\n⚠️  ${stillBadCount} activities still need attention`);
        console.log('Please check the database directly for any issues.');
      }
    }
    
    console.log('\n✅ Manual fix complete! Refresh the activity page.');
    
  } catch (error) {
    console.error('❌ Manual fix failed:', error);
  }
}

// Helper function to check if an invoice description is valid
function isValidInvoiceDescription(name: string): boolean {
  if (!name) return false;
  
  const lowerName = name.toLowerCase();
  
  // First check if it's just an invoice number without context (invalid)
  if (/^INV-\d+$/.test(name) || /^\d+$/.test(name)) {
    return false;
  }
  
  // Check for specific bad patterns we know about
  if (name === 'Test Activity Debug Entry' || 
      name === 'Test Direct Call' ||
      name.startsWith('Test Invoice #') ||
      name.startsWith('Invoice #')) {
    return false;
  }
  
  // Valid patterns must:
  // 1. Contain the word "invoice"
  // 2. Have an action word (created, updated, sent, etc.)
  // 3. Follow pattern: [action] invoice [number]
  
  if (lowerName.includes('invoice')) {
    // Check if it has a proper action word
    const actionWords = ['created', 'updated', 'sent', 'marked', 'changed', 'deleted', 'viewed', 'downloaded'];
    const hasAction = actionWords.some(action => lowerName.includes(action));
    
    // Must have both "invoice" and an action to be valid
    return hasAction;
  }
  
  return false;
}

// Helper function to extract invoice number from various formats
function extractInvoiceNumber(text: string): string | null {
  // Try different patterns
  const patterns = [
    /INV-[\d-]+/i,           // INV-12345
    /#([\w-]+)/,             // #12345 or #INV-12345
    /invoice\s+#?([\w-]+)/i, // Invoice 12345 or Invoice #12345
    /\b(\d{5,})\b/,          // Just a long number (5+ digits)
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const extracted = match[1] || match[0];
      // Ensure it starts with INV- if it's just numbers
      if (/^\d+$/.test(extracted)) {
        return `INV-${extracted}`;
      }
      return extracted;
    }
  }
  
  return null;
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).manuallyFixBadActivities = manuallyFixBadActivities;
}