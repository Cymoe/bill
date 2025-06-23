// Fix activity descriptions showing indexed metadata
import { supabase } from '../lib/supabase';

export async function fixBadActivityDescriptions() {
  console.log('=== FIXING BAD ACTIVITY DESCRIPTIONS ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // Get activities with bad descriptions
  const { data: activities, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('organization_id', orgId)
    .like('entity_name', '%0:%')  // Look for the indexed format
    .limit(500);

  if (error) {
    console.error('Error fetching activities:', error);
    return;
  }

  console.log(`Found ${activities?.length || 0} activities with bad descriptions\n`);

  let fixedCount = 0;

  for (const activity of activities || []) {
    console.log(`\nProcessing activity ${activity.id}:`);
    console.log(`Current entity_name: ${activity.entity_name?.substring(0, 100)}...`);
    
    try {
      // The entity_name contains the metadata as a string - extract the actual name
      let entityName = '';
      
      // Try to parse the metadata if it's a string
      if (typeof activity.metadata === 'string') {
        try {
          const parsed = JSON.parse(activity.metadata);
          entityName = parsed[`${activity.entity_type}_name`] || 
                      parsed.name || 
                      parsed.title || 
                      parsed.description || '';
        } catch (e) {
          console.log('Could not parse metadata as JSON');
        }
      } else if (activity.metadata) {
        entityName = activity.metadata[`${activity.entity_type}_name`] || 
                    activity.metadata.name || 
                    activity.metadata.title || 
                    activity.metadata.description || '';
      }

      // If we still don't have a name, try to extract it from the bad entity_name
      if (!entityName && activity.entity_name) {
        // Look for patterns like "product_name":"Anti-Theft Mailbox Insert"
        const nameMatch = activity.entity_name.match(/"(?:product_name|name|title)":"([^"]+)"/);
        if (nameMatch) {
          entityName = nameMatch[1];
        }
      }

      // Generate proper description
      let newDescription = '';
      switch (activity.entity_type) {
        case 'client':
          newDescription = `${activity.action} client${entityName ? ' ' + entityName : ''}`;
          break;
        case 'project':
          newDescription = `${activity.action} project${entityName ? ' ' + entityName : ''}`;
          break;
        case 'product':
          newDescription = `${activity.action} product${entityName ? ' ' + entityName : ''}`;
          break;
        case 'expense':
          newDescription = `${activity.action} expense${entityName ? ' ' + entityName : ''}`;
          break;
        case 'vendor':
          newDescription = `${activity.action} vendor${entityName ? ' ' + entityName : ''}`;
          break;
        case 'subcontractor':
          newDescription = `${activity.action} subcontractor${entityName ? ' ' + entityName : ''}`;
          break;
        case 'team_member':
          newDescription = activity.action === 'created' ? 
            `added team member${entityName ? ' ' + entityName : ''}` : 
            `${activity.action} team member${entityName ? ' ' + entityName : ''}`;
          break;
        case 'invoice':
          newDescription = `${activity.action} invoice${entityName ? ' ' + entityName : ''}`;
          break;
        case 'estimate':
          newDescription = `${activity.action} estimate${entityName ? ' ' + entityName : ''}`;
          break;
        default:
          newDescription = `${activity.action} ${activity.entity_type}${entityName ? ' ' + entityName : ''}`;
      }

      console.log(`New description: ${newDescription}`);

      // Update the activity
      const { error: updateError } = await supabase
        .from('activity_logs')
        .update({ entity_name: newDescription.trim() })
        .eq('id', activity.id);

      if (updateError) {
        console.error(`Failed to update activity ${activity.id}:`, updateError);
      } else {
        console.log(`✅ Fixed!`);
        fixedCount++;
      }
    } catch (err) {
      console.error(`Error processing activity ${activity.id}:`, err);
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} activity descriptions`);
  
  // Check if there are more to fix
  const { count } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .like('entity_name', '%0:%');
    
  if (count && count > 0) {
    console.log(`\n⚠️  There are still ${count} activities with bad descriptions.`);
    console.log('Run fixBadActivityDescriptions() again to fix more.');
  } else {
    console.log('\n🎉 All activity descriptions are now fixed!');
  }
  
  // Reload after a short delay
  if (fixedCount > 0) {
    console.log('\nReloading page in 2 seconds...');
    setTimeout(() => window.location.reload(), 2000);
  }
}

// Auto-run when imported
fixBadActivityDescriptions();

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).fixBadActivityDescriptions = fixBadActivityDescriptions;
}