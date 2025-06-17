// Debug invoice activity issue
import { supabase } from '../lib/supabase';

export async function debugInvoiceActivity() {
  try {
    console.log('=== Debugging Invoice Activity Issue ===');
    
    // 1. Check if we can manually log an invoice activity
    console.log('\n1. Testing manual activity log...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();
    
    if (!userOrg) {
      console.error('No organization found');
      return;
    }
    
    console.log('Organization ID:', userOrg.organization_id);
    console.log('User ID:', user.id);
    
    // Try the RPC directly
    console.log('\n2. Testing RPC function directly...');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('log_activity', {
      p_action: 'created',
      p_entity_type: 'invoice',
      p_entity_id: 'test-invoice-123',
      p_entity_name: 'created invoice TEST-INV-001',
      p_metadata: JSON.stringify({ 
        test: true, 
        amount: 100,
        debug: 'manual test'
      }),
      p_organization_id: userOrg.organization_id
    });
    
    if (rpcError) {
      console.error('RPC Error:', rpcError);
    } else {
      console.log('RPC Success:', rpcResult);
    }
    
    // 3. Check recent invoice activities
    console.log('\n3. Checking recent invoice activities...');
    const { data: invoiceActivities, error: activitiesError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', 'invoice')
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    } else {
      console.log(`Found ${invoiceActivities?.length || 0} invoice activities`);
      invoiceActivities?.forEach(activity => {
        console.log(`- ${activity.created_at}: ${activity.action} - ${activity.entity_name || 'NO NAME'}`);
        console.log(`  ID: ${activity.id}, Entity ID: ${activity.entity_id}`);
      });
    }
    
    // 4. Check ALL recent activities
    console.log('\n4. Checking ALL recent activities...');
    const { data: allActivities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`Recent activities (all types):`);
    allActivities?.forEach(activity => {
      console.log(`- ${activity.entity_type}: ${activity.action} - ${activity.entity_name || 'NO NAME'}`);
    });
    
    // 5. Check table structure
    console.log('\n5. Checking activity_logs table columns...');
    const { data: tableInfo } = await supabase
      .from('activity_logs')
      .select('*')
      .limit(0);
    
    console.log('Table columns:', Object.keys(tableInfo || {}));
    
    console.log('\n=== Debug Complete ===');
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).debugInvoiceActivity = debugInvoiceActivity;
}