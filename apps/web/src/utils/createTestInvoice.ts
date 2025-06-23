// Create a test invoice to verify activity logging
import { supabase } from '../lib/supabase';
import { InvoiceService } from '../services/InvoiceService';

export async function createTestInvoice() {
  console.log('=== CREATING TEST INVOICE ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return;
  }

  // Get a client for the invoice
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('organization_id', orgId)
    .limit(1);

  const clientId = clients?.[0]?.id;
  const clientName = clients?.[0]?.name || 'Test Client';

  if (!clientId) {
    console.error('No client found. Please create a client first.');
    return;
  }

  // Create invoice using InvoiceService
  try {
    const invoice = await InvoiceService.create({
      organization_id: orgId,
      client_id: clientId,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      subtotal: 1500.00,
      tax_rate: 0,
      tax_amount: 0,
      amount: 1500.00,
      notes: 'Test invoice created to verify activity logging',
      invoice_items: [
        {
          description: 'Test Service',
          quantity: 1,
          unit_price: 1500.00,
          total_price: 1500.00
        }
      ]
    });

    console.log(`✅ Created invoice ${invoice.invoice_number} for ${clientName}`);
    console.log(`Invoice ID: ${invoice.id}`);
    
    // Check if activity was logged
    console.log('\nChecking for activity log...');
    
    // Wait a moment for the activity to be created
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Look for the activity
    const { data: activities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', orgId)
      .eq('entity_type', 'invoice')
      .eq('entity_id', invoice.id)
      .eq('action', 'created')
      .order('created_at', { ascending: false })
      .limit(1);

    if (activities && activities.length > 0) {
      console.log('✅ Activity logged successfully!');
      console.log(`Activity ID: ${activities[0].id}`);
      console.log(`Description: ${activities[0].entity_name}`);
    } else {
      console.log('❌ No activity found for this invoice');
    }

    // Check real-time subscription
    console.log('\n📡 Watching for real-time update...');
    console.log('Check your Activity panel - you should see:');
    console.log(`"Agent created invoice ${invoice.invoice_number}"`);
    
    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
  }
}

// Auto-run when imported
createTestInvoice();

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).createTestInvoice = createTestInvoice;
}