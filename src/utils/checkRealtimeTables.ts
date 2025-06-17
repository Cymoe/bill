import { supabase } from '@/lib/supabase';

export async function checkRealtimeTables() {
  console.log('📋 Checking Real-time Enabled Tables...\n');
  
  try {
    // Try to run the custom function if it exists
    const { data, error } = await supabase.rpc('get_publication_tables', {
      publication_name: 'supabase_realtime'
    });
    
    if (!error && data) {
      console.log('Tables with real-time enabled:');
      console.log('─────────────────────────────');
      
      const activityLogsEnabled = data.some((table: any) => 
        table.tablename === 'activity_logs' && table.schemaname === 'public'
      );
      
      data.forEach((table: any) => {
        const icon = table.tablename === 'activity_logs' ? '→' : ' ';
        console.log(`${icon} ${table.schemaname}.${table.tablename}`);
      });
      
      console.log('\n─────────────────────────────');
      console.log(`Total tables: ${data.length}`);
      
      if (activityLogsEnabled) {
        console.log('\n✅ activity_logs IS enabled for real-time!');
      } else {
        console.log('\n❌ activity_logs is NOT enabled for real-time!');
        console.log('\nTo enable it:');
        console.log('1. Go to Supabase Dashboard > Database > Replication');
        console.log('2. Find "activity_logs" and toggle it ON');
        console.log('3. Or run: ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;');
      }
      
      return activityLogsEnabled;
    } else {
      console.log('⚠️  Could not fetch publication tables.');
      console.log('The helper function might not be installed.');
      console.log('\nTo check manually, run this SQL in Supabase:');
      console.log("SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';");
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Make available globally
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).checkRealtimeTables = checkRealtimeTables;
  
  console.log('💡 Real-time debugging tools available:');
  console.log('  - checkRealtimeTables() - List all real-time enabled tables');
  console.log('  - directRealtimeTest() - Test real-time with a fresh connection');
  console.log('  - verifyRealtimeSetup() - Comprehensive setup verification');
  console.log('  - testActivityInsertion() - Insert a test activity');
}