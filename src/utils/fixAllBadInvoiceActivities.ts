// Fix ALL invoice activities that don't have proper descriptions
import { supabase } from '../lib/supabase';

export async function fixAllBadInvoiceActivities(organizationId?: string) {
  console.log('=== Fixing ALL Bad Invoice Activities ===\n');
  
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
        console.log('✅ Using organization from localStorage:', organizationId);
      } else {
        // Look up the organization
        const { data: userOrgs } = await supabase
          .from('user_organizations')
          .select('organization_id, organizations(id, name)')
          .eq('user_id', user.id)
          .limit(1);
        
        if (userOrgs && userOrgs.length > 0) {
          organizationId = userOrgs[0].organization_id;
          const orgName = (userOrgs[0].organizations as any)?.name || 'Unknown';
          console.log(`✅ Found organization: ${orgName} (${organizationId})`);
        } else {
          console.log('❌ No organization found');
          return;
        }
      }
    }
    
    // Fetch ALL invoice activities
    console.log('\n1. Fetching ALL invoice activities...');
    const { data: activities, error: fetchError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'invoice')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching activities:', fetchError);
      return;
    }
    
    if (!activities || activities.length === 0) {
      console.log('✅ No invoice activities found');
      return;
    }
    
    console.log(`Found ${activities.length} total invoice activities`);
    
    // Filter activities that need fixing - much broader criteria
    const activitiesToFix = activities.filter(activity => {
      // If entity_name is missing or doesn't contain the word "invoice", it needs fixing
      if (!activity.entity_name) return true;
      
      const name = activity.entity_name.toLowerCase();
      
      // Check if it's a proper description
      const hasProperFormat = 
        name.includes('invoice') && 
        (name.includes('created') || 
         name.includes('updated') || 
         name.includes('sent') || 
         name.includes('marked') || 
         name.includes('changed') || 
         name.includes('deleted') ||
         name.includes('test'));
      
      // If it doesn't have proper format, it needs fixing
      if (!hasProperFormat) {
        // Check if it's just an invoice number (various formats)
        const isJustInvoiceNumber = 
          /^INV-\d+$/.test(activity.entity_name) ||
          /^INV-\d{4}-\d+$/.test(activity.entity_name) ||
          /^\d+$/.test(activity.entity_name) ||
          activity.entity_name.length < 20; // Short descriptions are likely just numbers
        
        return isJustInvoiceNumber;
      }
      
      return false;
    });
    
    console.log(`\n📋 Found ${activitiesToFix.length} activities that need fixing:`);
    activitiesToFix.slice(0, 10).forEach((activity, index) => {
      console.log(`${index + 1}. "${activity.entity_name}" (${activity.action}) - ID: ${activity.id}`);
    });
    if (activitiesToFix.length > 10) {
      console.log(`... and ${activitiesToFix.length - 10} more`);
    }
    
    if (activitiesToFix.length === 0) {
      console.log('✅ All invoice activities already have proper descriptions!');
      return;
    }
    
    // Fix each activity
    console.log('\n2. Fixing activities...');
    let fixed = 0;
    let failed = 0;
    
    for (const activity of activitiesToFix) {
      // Extract invoice number from entity_name or generate one
      let invoiceNumber = activity.entity_name || 'UNKNOWN';
      
      // Clean up the invoice number
      if (!invoiceNumber.startsWith('INV-') && /^\d+$/.test(invoiceNumber)) {
        invoiceNumber = `INV-${invoiceNumber}`;
      }
      
      let newDescription = '';
      
      // Build proper description based on action
      switch (activity.action) {
        case 'created':
          newDescription = `created invoice ${invoiceNumber}`;
          break;
        case 'updated':
          newDescription = `updated invoice ${invoiceNumber}`;
          break;
        case 'sent':
          newDescription = `sent invoice ${invoiceNumber}`;
          break;
        case 'paid':
          newDescription = `marked invoice ${invoiceNumber} as paid`;
          break;
        case 'status_changed':
          newDescription = `changed status of invoice ${invoiceNumber}`;
          break;
        case 'deleted':
          newDescription = `deleted invoice ${invoiceNumber}`;
          break;
        default:
          newDescription = `${activity.action} invoice ${invoiceNumber}`;
      }
      
      // Add amount if available in metadata
      if (activity.metadata && activity.metadata.amount) {
        newDescription += ` for $${activity.metadata.amount}`;
      }
      
      // Update the activity
      const { error: updateError } = await supabase
        .from('activity_logs')
        .update({ entity_name: newDescription })
        .eq('id', activity.id);
      
      if (updateError) {
        console.error(`❌ Failed to fix activity ${activity.id}:`, updateError);
        failed++;
      } else {
        console.log(`✅ Fixed: "${activity.entity_name}" → "${newDescription}"`);
        fixed++;
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`✅ Successfully fixed: ${fixed} activities`);
    if (failed > 0) {
      console.log(`❌ Failed to fix: ${failed} activities`);
    }
    
    // Show ALL invoice activities after fix
    console.log('\n3. Showing ALL invoice activities after fix...');
    const { data: allActivities } = await supabase
      .from('activity_logs')
      .select('id, entity_name, action, created_at')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'invoice')
      .order('created_at', { ascending: false });
    
    if (allActivities) {
      console.log(`\nAll ${allActivities.length} invoice activities:`);
      allActivities.forEach((activity, index) => {
        const hasProperFormat = activity.entity_name && 
          activity.entity_name.toLowerCase().includes('invoice') &&
          activity.entity_name.split(' ').length > 1;
        const icon = hasProperFormat ? '✅' : '❌';
        console.log(`${icon} ${index + 1}. ${activity.entity_name || 'NO DESCRIPTION'} (${activity.action})`);
      });
      
      // Count bad ones remaining
      const stillBad = allActivities.filter(a => 
        !a.entity_name || 
        !a.entity_name.toLowerCase().includes('invoice') ||
        a.entity_name.split(' ').length <= 1
      );
      
      if (stillBad.length > 0) {
        console.log(`\n⚠️  Still ${stillBad.length} activities with improper descriptions`);
        console.log('These may need manual fixing or have corrupted data.');
      } else {
        console.log('\n✅ All invoice activities now have proper descriptions!');
      }
    }
    
    console.log('\n✅ Fix complete! Refresh the activity page to see the updated descriptions.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).fixAllBadInvoiceActivities = fixAllBadInvoiceActivities;
}