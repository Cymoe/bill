import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnwatjwcjptwehagqiwf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2F0andjanB0d2VoYWdxaXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MzE3MTksImV4cCI6MjA0NjQwNzcxOX0.Unvi8rwvM2HDBZTnQmRDDWp7fnvIibViAAjUQzfOjwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Also check if table exists
async function checkTableExists() {
  const { data, error } = await supabase
    .rpc('to_regclass', { classname: 'public.industries' });
  
  if (error) {
    console.error('Error checking if table exists:', error);
    return false;
  }
  
  return data !== null;
}

async function checkIndustriesTable() {
  try {
    // Check if table exists
    console.log('Checking if industries table exists...');
    const tableExists = await checkTableExists();
    console.log('Table exists:', tableExists);
    
    // First query: Count total records
    console.log('\nChecking total count of industries...');
    const { count, error: countError } = await supabase
      .from('industries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting industries:', countError);
    } else {
      console.log(`Total industries count: ${count}`);
    }

    // Second query: Get first 10 industries
    console.log('\nFetching first 10 industries...');
    const { data: industriesData, error: industriesError } = await supabase
      .from('industries')
      .select('id, name, slug')
      .order('name')
      .limit(10);

    if (industriesError) {
      console.error('Error fetching industries:', industriesError);
    } else {
      console.log(`Industries found: ${industriesData ? industriesData.length : 0}`);
      if (industriesData && industriesData.length > 0) {
        console.table(industriesData);
      } else {
        console.log('No industries data returned');
      }
    }

    // Also check if we need authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('\nAuth error:', authError);
    } else {
      console.log('\nCurrent auth session:', session ? 'Authenticated' : 'Not authenticated');
    }
    
    // Try to run the insert from the migration directly
    console.log('\nAttempting to insert sample industry data...');
    const { data: insertData, error: insertError } = await supabase
      .from('industries')
      .insert([
        {
          name: 'General Construction',
          slug: 'general-construction',
          description: 'General contracting and construction services',
          icon: '🏗️',
          color: '#6B7280',
          display_order: 10,
          is_active: true
        }
      ])
      .select();
    
    if (insertError) {
      console.error('Error inserting industry:', insertError);
    } else {
      console.log('Successfully inserted:', insertData);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }

  process.exit(0);
}

checkIndustriesTable();