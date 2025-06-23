// Diagnose organization lookup issues
import { supabase } from '../lib/supabase';

export async function diagnoseOrganizationIssue() {
  console.log('=== DIAGNOSING ORGANIZATION ISSUE ===\n');
  
  try {
    // 1. Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('1. Current User:', user ? user.email : 'Not logged in');
    if (userError) {
      console.error('User error:', userError);
      return;
    }
    if (!user) {
      console.error('❌ No user logged in');
      return;
    }

    // 2. Check localStorage
    const storedOrgId = localStorage.getItem('selectedOrgId');
    console.log('2. Stored Org ID in localStorage:', storedOrgId);

    // 3. Check user_organizations table
    const { data: userOrgs, error: userOrgsError } = await supabase
      .from('user_organizations')
      .select(`
        organization_id,
        role,
        is_default,
        organizations!inner (
          id,
          name,
          industry_id,
          industries (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    console.log('3. User Organizations Query Result:');
    console.log('   Data:', userOrgs);
    console.log('   Error:', userOrgsError);

    if (userOrgsError) {
      console.error('❌ Error fetching user organizations:', userOrgsError);
      return;
    }

    if (!userOrgs || userOrgs.length === 0) {
      console.log('⚠️  No organizations found for user');
      
      // Check if organizations table has any data
      const { data: allOrgs, error: allOrgsError } = await supabase
        .from('organizations')
        .select('id, name')
        .limit(5);
      
      console.log('4. All Organizations (sample):', allOrgs);
      
      if (allOrgs && allOrgs.length > 0) {
        console.log('✅ Organizations exist, but user is not linked to any');
        console.log('💡 SOLUTION: Need to create a user_organization link or create a default organization');
      } else {
        console.log('⚠️  No organizations exist in the system');
        console.log('💡 SOLUTION: Need to create a default organization and link user to it');
      }
      
      return { needsOrganization: true, userOrgs: [] };
    }

    // 4. Process and validate organizations
    const processedOrgs = userOrgs.map(userOrg => {
      const org = userOrg.organizations as any;
      return {
        id: org.id,
        name: org.name,
        industry: org.industries?.name || 'General Construction',
        industry_id: org.industry_id || '',
        role: userOrg.role,
        is_default: userOrg.is_default
      };
    });

    console.log('4. Processed Organizations:', processedOrgs);

    // 5. Check which organization should be selected
    const defaultOrg = processedOrgs.find(o => o.is_default) || processedOrgs[0];
    console.log('5. Default Organization:', defaultOrg);

    const savedOrg = storedOrgId ? processedOrgs.find(o => o.id === storedOrgId) : null;
    console.log('6. Saved Organization Match:', savedOrg);

    const finalOrg = savedOrg || defaultOrg;
    console.log('7. Final Organization to Use:', finalOrg);

    if (finalOrg && finalOrg.id) {
      console.log('✅ Organization setup looks correct');
      console.log('💡 The issue might be timing - organization context might not be loaded when invoice components initialize');
      return { needsOrganization: false, selectedOrg: finalOrg, allOrgs: processedOrgs };
    } else {
      console.log('❌ No valid organization found');
      return { needsOrganization: true, userOrgs: processedOrgs };
    }

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    return { error };
  }
}

export async function createDefaultOrganization() {
  console.log('=== CREATING DEFAULT ORGANIZATION ===\n');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user logged in');
      return;
    }

    const userName = user.email?.split('@')[0] || 'User';
    const slug = `${userName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${user.id.substring(0, 8)}`;
    
    console.log('Creating organization:', `${userName}'s Company`);
    
    // Create organization
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: `${userName}'s Company`,
        slug: slug
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating organization:', createError);
      throw createError;
    }

    console.log('✅ Organization created:', newOrg);

    // Link user to organization
    const { error: memberError } = await supabase
      .from('user_organizations')
      .insert({
        organization_id: newOrg.id,
        user_id: user.id,
        role: 'owner',
        is_default: true
      });

    if (memberError) {
      console.error('❌ Error linking user to organization:', memberError);
      throw memberError;
    }

    console.log('✅ User linked to organization as owner');
    
    // Update localStorage
    localStorage.setItem('selectedOrgId', newOrg.id);
    console.log('✅ Updated localStorage with new org ID');

    console.log('🎉 Default organization setup complete!');
    console.log('🔄 Please refresh the page for changes to take effect');
    
    return newOrg;

  } catch (error) {
    console.error('❌ Error creating default organization:', error);
    throw error;
  }
}

// Auto-run diagnosis when imported
if (typeof window !== 'undefined') {
  (window as any).diagnoseOrganizationIssue = diagnoseOrganizationIssue;
  (window as any).createDefaultOrganization = createDefaultOrganization;
  console.log('🔧 Organization diagnostic tools loaded. Run:');
  console.log('   diagnoseOrganizationIssue() - to diagnose the issue');
  console.log('   createDefaultOrganization() - to create a default organization');
}