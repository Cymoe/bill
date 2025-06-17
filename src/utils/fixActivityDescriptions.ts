// Fix activity descriptions that are showing metadata instead of proper descriptions
import { supabase } from '../lib/supabase';

export async function fixActivityDescriptions() {
  console.log('=== FIXING ACTIVITY DESCRIPTIONS ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // Get all activities
  const { data: activities, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching activities:', error);
    return;
  }

  console.log(`Found ${activities?.length || 0} activities to check\n`);

  let fixedCount = 0;

  for (const activity of activities || []) {
    // Check if entity_name looks like stringified JSON or has numeric keys
    if (activity.entity_name && (
      activity.entity_name.includes('"historical"') ||
      activity.entity_name.match(/^\d+:/) ||
      activity.entity_name.startsWith('{')
    )) {
      console.log(`Bad description found: ${activity.entity_name.substring(0, 50)}...`);
      
      // Generate proper description based on entity type and action
      let newDescription = '';
      
      // Try to extract the entity name from metadata
      let entityName = '';
      if (activity.metadata) {
        // Look for name fields in metadata
        entityName = activity.metadata[`${activity.entity_type}_name`] || 
                    activity.metadata.name || 
                    activity.metadata.title || 
                    activity.metadata.description ||
                    '';
      }

      switch (activity.entity_type) {
        case 'client':
          newDescription = `${activity.action} client ${entityName}`;
          break;
        case 'project':
          newDescription = `${activity.action} project ${entityName}`;
          break;
        case 'product':
          newDescription = `${activity.action} product ${entityName}`;
          break;
        case 'expense':
          newDescription = `${activity.action} expense ${entityName}`;
          break;
        case 'vendor':
          newDescription = `${activity.action} vendor ${entityName}`;
          break;
        case 'subcontractor':
          newDescription = `${activity.action} subcontractor ${entityName}`;
          break;
        case 'team_member':
          newDescription = activity.action === 'created' ? 
            `added team member ${entityName}` : 
            `${activity.action} team member ${entityName}`;
          break;
        case 'invoice':
          newDescription = `${activity.action} invoice ${entityName}`;
          break;
        case 'estimate':
          newDescription = `${activity.action} estimate ${entityName}`;
          break;
        default:
          newDescription = `${activity.action} ${activity.entity_type} ${entityName}`;
      }

      // Update the activity
      const { error: updateError } = await supabase
        .from('activity_logs')
        .update({ entity_name: newDescription.trim() })
        .eq('id', activity.id);

      if (updateError) {
        console.error(`Failed to update activity ${activity.id}:`, updateError);
      } else {
        console.log(`✅ Fixed: ${newDescription}`);
        fixedCount++;
      }
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} activity descriptions`);
  
  // Reload the page to see the fixes
  if (fixedCount > 0) {
    console.log('Reloading page to show updated activities...');
    setTimeout(() => window.location.reload(), 1000);
  }
}

// Auto-run when imported
fixActivityDescriptions();

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).fixActivityDescriptions = fixActivityDescriptions;
}