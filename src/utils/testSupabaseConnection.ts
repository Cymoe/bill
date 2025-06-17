import { supabase } from '@/lib/supabase';

export async function testSupabaseConnection() {
  console.log('=== TESTING SUPABASE CONNECTION ===');
  
  // Test 1: Check if we can connect to Supabase at all
  console.log('1. Testing basic Supabase connection...');
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Cannot query database:', error);
    } else {
      console.log('✅ Database connection works');
    }
  } catch (e) {
    console.error('❌ Database connection failed:', e);
  }
  
  // Test 2: Check WebSocket connection
  console.log('\n2. Testing WebSocket connection...');
  const testChannel = supabase.channel('connection-test-' + Date.now());
  
  let connected = false;
  const timeout = setTimeout(() => {
    if (!connected) {
      console.error('❌ WebSocket connection timed out');
      supabase.removeChannel(testChannel);
    }
  }, 5000);
  
  testChannel
    .subscribe((status) => {
      console.log('WebSocket status:', status);
      if (status === 'SUBSCRIBED') {
        connected = true;
        clearTimeout(timeout);
        console.log('✅ WebSocket connection established');
        
        // Clean up
        setTimeout(() => {
          supabase.removeChannel(testChannel);
          console.log('Channel cleaned up');
        }, 1000);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error');
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Channel timed out');
      }
    });
  
  // Test 3: Check Supabase URL and anon key
  console.log('\n3. Checking Supabase configuration...');
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Supabase URL:', url ? '✅ Set' : '❌ Missing');
  console.log('Anon Key:', anonKey ? `✅ Set (${anonKey.substring(0, 20)}...)` : '❌ Missing');
  
  // Test 4: Check auth status
  console.log('\n4. Checking authentication...');
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    console.log('✅ Authenticated as:', user.email);
    console.log('Organization ID:', user.user_metadata?.organization_id || '❌ Missing');
  } else {
    console.error('❌ Not authenticated');
  }
}

if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}