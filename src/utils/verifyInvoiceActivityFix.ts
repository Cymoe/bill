// Verify that invoice activity logging is now working correctly
import { supabase } from '../lib/supabase';

export async function verifyInvoiceActivityFix() {
  console.log('=== Verifying Invoice Activity Fix ===\n');
  
  try {
    // Get current user and organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user logged in');
      return;
    }
    
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();
    
    if (!userOrg) {
      console.error('❌ No organization found');
      return;
    }
    
    // Check recent invoice activities
    console.log('Checking recent invoice activities...');
    const { data: recentActivities, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', 'invoice')
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching activities:', error);
      return;
    }
    
    if (!recentActivities || recentActivities.length === 0) {
      console.log('⚠️  No invoice activities found yet');
      console.log('   Try creating a new invoice to test the fix');
      return;
    }
    
    console.log(`\n✅ Found ${recentActivities.length} invoice activities:\n`);
    
    // Check each activity for proper description format
    let allCorrect = true;
    recentActivities.forEach((activity, index) => {
      const hasProperDescription = activity.entity_name && 
        (activity.entity_name.includes('created invoice') ||
         activity.entity_name.includes('updated invoice') ||
         activity.entity_name.includes('sent invoice') ||
         activity.entity_name.includes('marked invoice') ||
         activity.entity_name.includes('deleted invoice') ||
         activity.entity_name.includes('changed status of invoice'));
      
      const icon = hasProperDescription ? '✅' : '❌';
      console.log(`${icon} ${index + 1}. ${activity.entity_name || 'NO DESCRIPTION'}`);
      console.log(`   Action: ${activity.action}, Created: ${new Date(activity.created_at).toLocaleString()}`);
      
      if (!hasProperDescription) {
        allCorrect = false;
        console.log(`   ⚠️  This activity has an improper description format`);
      }
    });
    
    console.log('\n' + '='.repeat(50));
    if (allCorrect) {
      console.log('✅ All invoice activities have proper descriptions!');
      console.log('   The fix is working correctly.');
    } else {
      console.log('⚠️  Some activities still have improper descriptions.');
      console.log('   These might be from before the fix was applied.');
      console.log('   New activities should have the correct format.');
    }
    
    // Show what a proper activity should look like
    console.log('\n📋 Proper invoice activity formats:');
    console.log('   - "created invoice INV-2024-123"');
    console.log('   - "updated invoice INV-2024-123"');
    console.log('   - "sent invoice INV-2024-123"');
    console.log('   - "marked invoice INV-2024-123 as paid"');
    console.log('   - "changed status of invoice INV-2024-123"');
    console.log('   - "deleted invoice INV-2024-123"');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Make it available globally in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).verifyInvoiceActivityFix = verifyInvoiceActivityFix;
}