// Investigate why activity updates aren't working
import { supabase } from '../lib/supabase';

export async function investigateActivityIssue() {
  console.log('=== INVESTIGATING ACTIVITY UPDATE ISSUE ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  // 1. Check current user and permissions
  console.log('1. Checking current user...');
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User ID:', user?.id);
  console.log('User email:', user?.email);
  
  // 2. Test if we can update ANY activity
  console.log('\n2. Testing if we can update ANY invoice activity...');
  
  const { data: testActivity } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('organization_id', orgId)
    .eq('entity_type', 'invoice')
    .limit(1)
    .single();
    
  if (testActivity) {
    console.log(`Found test activity: "${testActivity.entity_name}" (ID: ${testActivity.id})`);
    
    // Try a simple update
    const testName = `TEST UPDATE ${Date.now()}`;
    const { error: updateError, data: updateData } = await supabase
      .from('activity_logs')
      .update({ entity_name: testName })
      .eq('id', testActivity.id)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('Error details:', JSON.stringify(updateError, null, 2));
    } else {
      console.log('✅ Update succeeded! Returned data:', updateData);
      
      // Check if it actually updated
      const { data: checkData } = await supabase
        .from('activity_logs')
        .select('entity_name')
        .eq('id', testActivity.id)
        .single();
        
      if (checkData?.entity_name === testName) {
        console.log('✅ Verified: Update persisted in database');
        
        // Revert it back
        await supabase
          .from('activity_logs')
          .update({ entity_name: testActivity.entity_name })
          .eq('id', testActivity.id);
      } else {
        console.log('❌ Update did NOT persist! Current value:', checkData?.entity_name);
      }
    }
  }

  // 3. Check for RLS policies
  console.log('\n3. Checking RLS policies...');
  const { data: policies, error: policyError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'activity_logs');
    
  if (policyError) {
    console.log('Could not check policies:', policyError.message);
  } else if (policies && policies.length > 0) {
    console.log(`Found ${policies.length} RLS policies on activity_logs table:`);
    policies.forEach(p => {
      console.log(`- ${p.policyname}: ${p.cmd} (${p.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'})`);
    });
  } else {
    console.log('No RLS policies found on activity_logs table');
  }

  // 4. Try direct RPC call to update
  console.log('\n4. Testing direct RPC update...');
  
  // First, let's see if there's an update RPC function
  const { data: rpcFunctions } = await supabase
    .from('pg_proc')
    .select('proname')
    .like('proname', '%activity%');
    
  if (rpcFunctions) {
    console.log('Activity-related RPC functions:');
    rpcFunctions.forEach(f => console.log(`- ${f.proname}`));
  }

  // 5. Check table structure
  console.log('\n5. Checking activity_logs table structure...');
  const { data: columns } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_name', 'activity_logs')
    .eq('table_schema', 'public');
    
  if (columns) {
    console.log('Columns in activity_logs:');
    columns.forEach(c => {
      console.log(`- ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable}, default: ${c.column_default || 'none'})`);
    });
  }

  // 6. Try to find specific problematic activities
  console.log('\n6. Looking for problematic activities...');
  
  const problematicNames = [
    'Test Activity Debug Entry',
    'INV-193186',
    'Test Direct Call'
  ];
  
  for (const name of problematicNames) {
    const { data, error, count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('entity_type', 'invoice')
      .eq('entity_name', name);
      
    if (error) {
      console.error(`Error searching for "${name}":`, error);
    } else {
      console.log(`\n"${name}": Found ${count} entries`);
      if (data && data.length > 0) {
        const activity = data[0];
        console.log(`  ID: ${activity.id}`);
        console.log(`  Created: ${activity.created_at}`);
        console.log(`  User ID: ${activity.user_id}`);
        console.log(`  Action: ${activity.action}`);
        
        // Check if current user owns this activity
        if (activity.user_id === user?.id) {
          console.log('  ✅ You own this activity');
        } else {
          console.log('  ⚠️  Different user owns this activity');
        }
      }
    }
  }

  console.log('\n=== Investigation complete ===');
  console.log('Check the results above to understand why updates might be failing.');
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).investigateActivityIssue = investigateActivityIssue;
}