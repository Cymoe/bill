// Fix old invoice activities that only have invoice number as description
import { supabase } from '../lib/supabase';

export async function fixOldInvoiceActivities(organizationId?: string) {
  console.log('=== Fixing Old Invoice Activities ===\n');
  
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
    
    // Fetch invoice activities with improper descriptions
    console.log('\n1. Fetching invoice activities to fix...');
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
      console.log('✅ No invoice activities found to fix');
      return;
    }
    
    // Filter activities that need fixing (only have invoice number as entity_name)
    const activitiesToFix = activities.filter(activity => {
      return activity.entity_name && 
        !activity.entity_name.includes(' ') && 
        activity.entity_name.startsWith('INV-');
    });
    
    if (activitiesToFix.length === 0) {
      console.log('✅ All invoice activities have proper descriptions!');
      return;
    }
    
    console.log(`\n📋 Found ${activitiesToFix.length} activities to fix:`);
    activitiesToFix.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.entity_name} (${activity.action})`);
    });
    
    // Fix each activity
    console.log('\n2. Fixing activities...');
    let fixed = 0;
    let failed = 0;
    
    for (const activity of activitiesToFix) {
      const invoiceNumber = activity.entity_name;
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
      
      // Update the activity
      const { error: updateError } = await supabase
        .from('activity_logs')
        .update({ entity_name: newDescription })
        .eq('id', activity.id);
      
      if (updateError) {
        console.error(`❌ Failed to fix: ${invoiceNumber}`, updateError);
        failed++;
      } else {
        console.log(`✅ Fixed: ${invoiceNumber} → "${newDescription}"`);
        fixed++;
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`✅ Successfully fixed: ${fixed} activities`);
    if (failed > 0) {
      console.log(`❌ Failed to fix: ${failed} activities`);
    }
    
    // Show the updated activities
    console.log('\n3. Verifying fixes...');
    const { data: updatedActivities } = await supabase
      .from('activity_logs')
      .select('id, entity_name, action, created_at')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'invoice')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (updatedActivities) {
      console.log('\nRecent invoice activities after fix:');
      updatedActivities.forEach((activity, index) => {
        const hasProperFormat = activity.entity_name && activity.entity_name.includes(' ');
        const icon = hasProperFormat ? '✅' : '❌';
        console.log(`${icon} ${index + 1}. ${activity.entity_name}`);
      });
    }
    
    console.log('\n✅ Fix complete! Refresh the activity page to see the updated descriptions.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).fixOldInvoiceActivities = fixOldInvoiceActivities;
}