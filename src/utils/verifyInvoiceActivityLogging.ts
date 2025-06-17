import { supabase } from '../lib/supabase';

export async function verifyInvoiceActivityLogging() {
  console.log('=== DEEP INVESTIGATION: INVOICE ACTIVITY LOGGING ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // STEP 1: Check if we have ANY invoice activities at all
  console.log('STEP 1: Checking existing invoice activities...');
  const { data: existingActivities, error: actError } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('organization_id', orgId)
    .eq('entity_type', 'invoice')
    .eq('action', 'created')
    .order('created_at', { ascending: false })
    .limit(5);

  if (actError) {
    console.error('Error fetching activities:', actError);
    return;
  }

  console.log(`Found ${existingActivities?.length || 0} existing invoice creation activities`);
  if (existingActivities && existingActivities.length > 0) {
    console.log('Most recent invoice activities:');
    existingActivities.forEach(act => {
      console.log(`  - ${act.entity_name} (${act.created_at})`);
    });
  }

  // STEP 2: Get the most recent invoice
  console.log('\nSTEP 2: Finding most recent invoice...');
  const { data: recentInvoices, error: invError } = await supabase
    .from('invoices')
    .select('id, invoice_number, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (invError) {
    console.error('Error fetching invoices:', invError);
    return;
  }

  if (recentInvoices && recentInvoices.length > 0) {
    const invoice = recentInvoices[0];
    console.log(`Most recent invoice: ${invoice.invoice_number} (${invoice.created_at})`);
    
    // Check if this invoice has an activity
    const { data: invoiceActivity } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', orgId)
      .eq('entity_type', 'invoice')
      .eq('entity_id', invoice.id)
      .single();

    if (invoiceActivity) {
      console.log(`✅ This invoice HAS an activity log!`);
    } else {
      console.log(`❌ This invoice has NO activity log!`);
    }
  }

  // STEP 3: Create a new invoice and track it
  console.log('\nSTEP 3: Creating a new invoice to test real-time logging...');
  
  // Get a client first
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('organization_id', orgId)
    .limit(1);

  if (!clients?.[0]) {
    console.error('No client found to create invoice');
    return;
  }

  const testInvoiceNumber = `TEST-${Date.now()}`;
  
  // Create invoice
  const { data: newInvoice, error: createError } = await supabase
    .from('invoices')
    .insert({
      organization_id: orgId,
      client_id: clients[0].id,
      invoice_number: testInvoiceNumber,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: 999.00,
      amount: 999.00,
      tax_rate: 0,
      tax_amount: 0,
      notes: 'Verification test invoice'
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating invoice:', createError);
    return;
  }

  console.log(`Created invoice: ${newInvoice.invoice_number} (ID: ${newInvoice.id})`);

  // STEP 4: Wait and check for activity
  console.log('\nSTEP 4: Checking for activity log...');
  
  // Wait a bit for trigger/RPC to execute
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: activity } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', orgId)
      .eq('entity_type', 'invoice')
      .eq('entity_id', newInvoice.id)
      .single();

    if (activity) {
      console.log(`✅ ACTIVITY FOUND after ${i + 1} seconds!`);
      console.log(`Activity details:`);
      console.log(`  - ID: ${activity.id}`);
      console.log(`  - Action: ${activity.action}`);
      console.log(`  - Description: ${activity.entity_name}`);
      console.log(`  - Created at: ${activity.created_at}`);
      
      // STEP 5: Verify it shows in the feed
      console.log('\n🎯 CHECK YOUR ACTIVITY PANEL NOW!');
      console.log(`You should see: "Agent created invoice ${newInvoice.invoice_number}"`);
      return;
    } else {
      console.log(`⏳ No activity yet... (${i + 1}/5)`);
    }
  }

  console.log('\n❌ NO ACTIVITY CREATED!');
  console.log('This means the activity logging is NOT working for invoices.');
  
  // STEP 6: Debug why
  console.log('\nSTEP 6: Investigating why...');
  
  // Check if we have the log_activity RPC function
  const { data: functions } = await supabase
    .rpc('log_activity', {
      p_action: 'test',
      p_entity_type: 'test',
      p_organization_id: orgId
    })
    .single();
    
  console.log('RPC function test:', functions ? 'exists' : 'might not exist or have issues');
}

// Auto-run
verifyInvoiceActivityLogging();

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).verifyInvoiceActivityLogging = verifyInvoiceActivityLogging;
}