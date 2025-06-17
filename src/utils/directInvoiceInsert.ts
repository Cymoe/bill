import { supabase } from '../lib/supabase';

export async function directInvoiceInsert() {
  const orgId = '6d95c2b2-cb2a-45f3-8b47-e05b87ea6830';
  
  // Get a client
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('organization_id', orgId)
    .limit(1);

  if (!clients?.[0]) {
    console.error('No client found');
    return;
  }

  // Direct insert
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      organization_id: orgId,
      client_id: clients[0].id,
      invoice_number: `INV-TEST-${Date.now()}`,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: 2500.00,
      amount: 2500.00,
      tax_rate: 0,
      tax_amount: 0,
      notes: 'Direct test invoice'
    })
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Invoice created:', invoice.invoice_number);
    console.log('Check Activity panel for: "Agent created invoice ' + invoice.invoice_number + '"');
  }
}

directInvoiceInsert();

if (typeof window !== 'undefined') {
  (window as any).directInvoiceInsert = directInvoiceInsert;
}