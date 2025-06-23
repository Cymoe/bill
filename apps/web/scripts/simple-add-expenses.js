// Simpler script to add sample expenses - run in browser console
(async function() {
  const projectId = '533e80c4-2eb5-469e-b15e-84459c83f41d';
  
  // Check if supabase is available
  if (!window.supabase) {
    console.error('Supabase not found on window');
    return;
  }
  
  const { supabase } = window;
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return;
  }
  
  console.log('User found:', user.id);
  
  // Simple expenses without cost codes first
  const expenses = [
    { description: 'Premium paint supplies', amount: 385.00, vendor: 'Paint Pro Supply', category: 'Material', status: 'paid' },
    { description: 'Professional painter labor', amount: 920.00, vendor: 'Quality Painters', category: 'Labor', status: 'pending' },
    { description: 'Electrical wiring materials', amount: 445.50, vendor: 'Home Depot', category: 'Material', status: 'paid' },
    { description: 'Electrician consultation', amount: 240.00, vendor: 'Pro Electric', category: 'Service', status: 'pending' },
    { description: 'Plumbing fixtures', amount: 625.00, vendor: 'Plumbing Warehouse', category: 'Material', status: 'paid' },
    { description: 'Hardwood flooring', amount: 1450.00, vendor: 'Premium Floors', category: 'Material', status: 'pending' },
    { description: 'Tool rental for flooring', amount: 185.00, vendor: 'Tool Rental Plus', category: 'Equipment', status: 'paid' },
    { description: 'HVAC system upgrade', amount: 580.00, vendor: 'Climate Control Co', category: 'Material', status: 'pending' },
    { description: 'Building permit extension', amount: 125.00, vendor: 'City Hall', category: 'Permits', status: 'paid' },
    { description: 'Safety equipment rental', amount: 95.00, vendor: 'Safety First Supply', category: 'Equipment', status: 'paid' }
  ];
  
  console.log(`Adding ${expenses.length} expenses...`);
  
  let added = 0;
  for (const expense of expenses) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          description: expense.description,
          amount: expense.amount,
          vendor: expense.vendor,
          category: expense.category,
          date: new Date().toISOString().split('T')[0],
          status: expense.status,
          project_id: projectId,
          user_id: user.id,
          cost_code_id: null // Start without cost codes
        })
        .select();
        
      if (error) {
        console.error('Error adding:', expense.description, error);
      } else {
        console.log(`✓ Added: ${expense.description} - $${expense.amount}`);
        added++;
      }
    } catch (err) {
      console.error('Exception adding:', expense.description, err);
    }
  }
  
  console.log(`Successfully added ${added} of ${expenses.length} expenses!`);
  console.log('Refresh the page to see the new expenses.');
})(); 