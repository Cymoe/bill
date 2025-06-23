// Test invoice activity logging
import { supabase } from '../lib/supabase';
import { InvoiceService } from '../services/InvoiceService';

export async function testInvoiceActivity() {
  try {
    console.log('=== Testing Invoice Activity Logging ===');
    
    // Get current user
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
      console.error('No organization found for user');
      return;
    }
    
    // Get a client
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name')
      .eq('organization_id', userOrg.organization_id)
      .limit(1);
    
    const clientId = clients?.[0]?.id;
    if (!clientId) {
      console.error('No client found - please create a client first');
      return;
    }
    
    console.log('Using client:', clients[0].name);
    
    // Create a test invoice
    console.log('\n1. Creating test invoice...');
    const testInvoice = await InvoiceService.create({
      user_id: user.id,
      organization_id: userOrg.organization_id,
      client_id: clientId,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          description: 'Test Service',
          quantity: 1,
          unit_price: 100,
          total_price: 100
        }
      ]
    });
    
    console.log('✅ Invoice created:', testInvoice.invoice_number);
    
    // Check if activity was logged
    console.log('\n2. Checking activity log...');
    const { data: activities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', 'invoice')
      .eq('entity_id', testInvoice.id)
      .order('created_at', { ascending: false });
    
    console.log(`Found ${activities?.length || 0} activities for this invoice`);
    activities?.forEach(activity => {
      console.log(`- ${activity.action}: ${activity.entity_name}`);
    });
    
    // Update the invoice
    console.log('\n3. Updating invoice status...');
    await InvoiceService.updateStatus(testInvoice.id!, 'sent');
    console.log('✅ Invoice status updated to sent');
    
    // Mark as paid
    console.log('\n4. Marking invoice as paid...');
    await InvoiceService.markAsPaid(testInvoice.id!);
    console.log('✅ Invoice marked as paid');
    
    // Check activities again
    console.log('\n5. Checking all activities...');
    const { data: allActivities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', 'invoice')
      .eq('entity_id', testInvoice.id)
      .order('created_at', { ascending: false });
    
    console.log(`Total activities: ${allActivities?.length || 0}`);
    allActivities?.forEach(activity => {
      console.log(`- ${activity.created_at}: ${activity.action} - ${activity.entity_name}`);
    });
    
    // Clean up - delete the test invoice
    console.log('\n6. Cleaning up...');
    await InvoiceService.delete(testInvoice.id!);
    console.log('✅ Test invoice deleted');
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).testInvoiceActivity = testInvoiceActivity;
}