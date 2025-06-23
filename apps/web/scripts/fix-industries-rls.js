import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment
const supabaseUrl = 'https://wnwatjwcjptwehagqiwf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2F0andjanB0d2VoYWdxaXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MzE3MTksImV4cCI6MjA0NjQwNzcxOX0.Unvi8rwvM2HDBZTnQmRDDWp7fnvIibViAAjUQzfOjwY';

// You'll need to replace this with the service role key which has admin privileges
// The anon key doesn't have permission to update the industries table
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.error('Please set it with: export SUPABASE_SERVICE_KEY="your-service-role-key"');
  console.error('You can find this in your Supabase project settings under API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixIndustriesRLS() {
  console.log('Starting industries RLS fix...\n');

  try {
    // 1. Check current state
    console.log('1. Checking current state of industries:');
    const { data: currentState, error: stateError } = await supabase
      .from('industries')
      .select('name, slug, is_active')
      .order('name')
      .limit(10);

    if (stateError) throw stateError;
    console.table(currentState);

    // 2. Update all industries to be active
    console.log('\n2. Updating all industries to be active...');
    const { error: updateError } = await supabase
      .from('industries')
      .update({ is_active: true })
      .or('is_active.is.null,is_active.eq.false');

    if (updateError) throw updateError;
    console.log('✓ All industries updated to active');

    // 3. Verify the fix
    console.log('\n3. Verifying the fix:');
    const { data: allIndustries, error: countError } = await supabase
      .from('industries')
      .select('is_active');

    if (countError) throw countError;

    const totalIndustries = allIndustries.length;
    const activeIndustries = allIndustries.filter(i => i.is_active === true).length;

    console.log(`Total industries: ${totalIndustries}`);
    console.log(`Active industries: ${activeIndustries}`);
    console.log(`Inactive industries: ${totalIndustries - activeIndustries}`);

    // 4. Test what anonymous users can see
    console.log('\n4. Testing anonymous access:');
    // Create a new client with anon key to test
    const anonSupabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: anonData, error: anonError } = await anonSupabase
      .from('industries')
      .select('id');

    if (anonError) {
      console.log('Anonymous users cannot access industries:', anonError.message);
    } else {
      console.log(`Anonymous users can see ${anonData.length} industries`);
    }

    console.log('\n✅ Industries RLS fix completed successfully!');

  } catch (error) {
    console.error('Error fixing industries RLS:', error);
    process.exit(1);
  }
}

fixIndustriesRLS();