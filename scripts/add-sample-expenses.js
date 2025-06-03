// Script to add sample expenses to showcase the cost code interface
// Run this in the browser console while on the project page

(async function addSampleExpenses() {
  const projectId = '533e80c4-2eb5-469e-b15e-84459c83f41d';
  
  // Get the supabase client from the window (should be available in your app)
  const { supabase } = window;
  
  if (!supabase) {
    console.error('Supabase client not found');
    return;
  }
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return;
  }
  
  // First, get the available cost codes
  const { data: costCodes, error: costCodeError } = await supabase
    .from('cost_codes')
    .select('id, code, name');
    
  if (costCodeError) {
    console.error('Error fetching cost codes:', costCodeError);
    return;
  }
  
  console.log('Available cost codes:', costCodes);
  
  // Helper function to find cost code by code
  const findCostCode = (code) => costCodes.find(cc => cc.code === code);
  
  // Sample expenses data
  const expenses = [
    // Electrical expenses (15.00 Electrical)
    { description: 'Electrical wire 12 AWG copper', amount: 245.50, vendor: 'Home Depot', category: 'Material', date: '2025-01-02', status: 'paid', costCodeCode: '15.00' },
    { description: 'Circuit breakers and panel', amount: 520.00, vendor: 'Electrical Supply Co', category: 'Material', date: '2025-01-03', status: 'pending', costCodeCode: '15.00' },
    { description: 'Electrician labor - 8 hours', amount: 640.00, vendor: 'Pro Electric', category: 'Labor', date: '2025-01-04', status: 'paid', costCodeCode: '15.00' },
    
    // Plumbing expenses (41.00 Plumbing)
    { description: 'PVC pipes and fittings', amount: 185.75, vendor: 'Plumbing Warehouse', category: 'Material', date: '2025-01-01', status: 'paid', costCodeCode: '41.00' },
    { description: 'Kitchen sink and faucet', amount: 425.00, vendor: 'Kitchen & Bath Center', category: 'Material', date: '2025-01-05', status: 'pending', costCodeCode: '41.00' },
    { description: 'Plumber service call', amount: 150.00, vendor: 'Quick Fix Plumbing', category: 'Service', date: '2025-01-06', status: 'paid', costCodeCode: '41.00' },
    
    // Carpentry expenses (04.00 Carpentry)
    { description: 'Lumber 2x4 studs', amount: 320.00, vendor: 'Lumber Yard', category: 'Material', date: '2024-12-28', status: 'paid', costCodeCode: '04.00' },
    { description: 'Cabinet installation labor', amount: 800.00, vendor: 'Custom Carpentry', category: 'Labor', date: '2025-01-07', status: 'pending', costCodeCode: '04.00' },
    { description: 'Wood screws and fasteners', amount: 45.25, vendor: 'Hardware Store', category: 'Material', date: '2024-12-30', status: 'paid', costCodeCode: '04.00' },
    
    // Flooring expenses (20.00 Flooring)
    { description: 'Hardwood flooring planks', amount: 1250.00, vendor: 'Premium Floors', category: 'Material', date: '2025-01-08', status: 'pending', costCodeCode: '20.00' },
    { description: 'Floor installation tools rental', amount: 125.00, vendor: 'Tool Rental Plus', category: 'Equipment', date: '2025-01-09', status: 'paid', costCodeCode: '20.00' },
    { description: 'Flooring contractor', amount: 950.00, vendor: 'Expert Flooring', category: 'Subcontractor', date: '2025-01-10', status: 'pending', costCodeCode: '20.00' },
    
    // HVAC expenses (28.00 HVAC)
    { description: 'HVAC ductwork materials', amount: 380.00, vendor: 'Air Flow Supply', category: 'Material', date: '2025-01-11', status: 'paid', costCodeCode: '28.00' },
    { description: 'Thermostat upgrade', amount: 275.00, vendor: 'Climate Control Co', category: 'Material', date: '2025-01-12', status: 'pending', costCodeCode: '28.00' },
    
    // Painting expenses (38.00 Painting) - adding to existing
    { description: 'Interior paint - premium', amount: 185.00, vendor: 'Paint Pro Supply', category: 'Material', date: '2025-01-13', status: 'paid', costCodeCode: '38.00' },
    { description: 'Painter labor - 3 days', amount: 720.00, vendor: 'Quality Painters', category: 'Labor', date: '2025-01-14', status: 'pending', costCodeCode: '38.00' },
    
    // Roofing expenses (46.00 Roofing)
    { description: 'Asphalt shingles', amount: 850.00, vendor: 'Roofing Materials Inc', category: 'Material', date: '2025-01-16', status: 'pending', costCodeCode: '46.00' },
    { description: 'Roof repair labor', amount: 600.00, vendor: 'Apex Roofing', category: 'Labor', date: '2025-01-17', status: 'paid', costCodeCode: '46.00' },
    
    // Concrete expenses (09.00 Concrete)
    { description: 'Concrete mix bags', amount: 180.00, vendor: 'Concrete Supply', category: 'Material', date: '2024-12-25', status: 'paid', costCodeCode: '09.00' },
    { description: 'Concrete tools rental', amount: 75.00, vendor: 'Equipment Rental', category: 'Equipment', date: '2024-12-26', status: 'paid', costCodeCode: '09.00' },
    
    // Permits and inspections (no cost code)
    { description: 'Building permit fee', amount: 450.00, vendor: 'City Hall', category: 'Permits', date: '2024-12-20', status: 'paid', costCodeCode: null },
    { description: 'Electrical inspection fee', amount: 75.00, vendor: 'City Inspections', category: 'Permits', date: '2025-01-15', status: 'pending', costCodeCode: null },
    
    // Unassigned expenses (no cost code)
    { description: 'Project management software', amount: 89.99, vendor: 'SaaS Company', category: 'Service', date: '2025-01-01', status: 'paid', costCodeCode: null },
    { description: 'Safety equipment and gear', amount: 225.00, vendor: 'Safety First Supply', category: 'Equipment', date: '2024-12-15', status: 'paid', costCodeCode: null }
  ];
  
  console.log(`Adding ${expenses.length} sample expenses...`);
  
  // Add each expense
  for (const expense of expenses) {
    const costCode = expense.costCodeCode ? findCostCode(expense.costCodeCode) : null;
    
    const expenseData = {
      description: expense.description,
      amount: expense.amount,
      vendor: expense.vendor,
      category: expense.category,
      date: expense.date,
      status: expense.status,
      project_id: projectId,
      user_id: user.id,
      cost_code_id: costCode?.id || null
    };
    
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select();
      
    if (error) {
      console.error('Error adding expense:', expense.description, error);
    } else {
      console.log('Added expense:', expense.description, costCode ? `(${costCode.code})` : '(no cost code)');
    }
  }
  
  console.log('Finished adding sample expenses! Refresh the page to see them.');
})(); 