// Test activity logging using the currently selected organization from the UI
import { supabase } from '../lib/supabase';

export async function testActivityWithSelectedOrg(organizationId?: string) {
  console.log('=== Testing Activity with Selected Organization ===\n');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user logged in');
      return;
    }
    
    // If no org ID provided, try to get it from the UI
    if (!organizationId) {
      // Try to get the selected org from localStorage
      const storedOrgId = localStorage.getItem('selectedOrgId');
      if (storedOrgId) {
        organizationId = storedOrgId;
        console.log('✅ Using organization from localStorage:', organizationId);
      } else {
        // Try to find the organization from the user_organizations table
        console.log('⚠️  Looking up organization...');
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
          console.log('❌ No organization found. Please ensure you are logged in with an organization.');
          return;
        }
      }
    }
    
    console.log('Organization ID:', organizationId);
    console.log('User ID:', user.id);
    
    // Test creating an activity directly
    console.log('\n1. Testing direct activity creation...');
    const { data: activity, error } = await supabase.rpc('log_activity', {
      p_action: 'test',
      p_entity_type: 'invoice',
      p_entity_id: 'test-123',
      p_entity_name: 'created invoice TEST-MANUAL-001',
      p_metadata: JSON.stringify({ 
        test: true,
        debug: 'manual test with selected org'
      }),
      p_organization_id: organizationId
    });
    
    if (error) {
      console.error('❌ Error creating activity:', error);
      return;
    }
    
    console.log('✅ Activity created successfully!');
    
    // Check recent activities
    console.log('\n2. Checking recent activities for this organization...');
    const { data: recentActivities, error: fetchError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (fetchError) {
      console.error('❌ Error fetching activities:', fetchError);
      return;
    }
    
    console.log(`\n✅ Found ${recentActivities?.length || 0} recent activities:`);
    recentActivities?.forEach((act, index) => {
      console.log(`${index + 1}. [${act.entity_type}] ${act.action}: ${act.entity_name || 'NO DESCRIPTION'}`);
      console.log(`   Created: ${new Date(act.created_at).toLocaleString()}`);
    });
    
    // Test invoice activities specifically
    console.log('\n3. Checking invoice activities...');
    const { data: invoiceActivities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'invoice')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (invoiceActivities && invoiceActivities.length > 0) {
      console.log(`\n✅ Found ${invoiceActivities.length} invoice activities:`);
      invoiceActivities.forEach((act, index) => {
        const hasProperFormat = act.entity_name && act.entity_name.includes('invoice');
        const icon = hasProperFormat ? '✅' : '⚠️';
        console.log(`${icon} ${index + 1}. ${act.entity_name || 'NO DESCRIPTION'}`);
      });
    } else {
      console.log('⚠️  No invoice activities found yet');
    }
    
    console.log('\n=== Test Complete ===');
    console.log('✅ Organization is properly set up for activity logging!');
    console.log(`   Organization ID: ${organizationId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).testActivityWithSelectedOrg = testActivityWithSelectedOrg;
}