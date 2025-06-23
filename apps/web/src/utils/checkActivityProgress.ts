// Check real-time activity creation progress
import { supabase } from '../lib/supabase';

export async function checkActivityProgress() {
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) return;

  console.log('=== ACTIVITY CREATION PROGRESS ===\n');

  // Get activity count in last minute
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { count: recentCount } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .gte('created_at', oneMinuteAgo);

  console.log(`Activities created in last minute: ${recentCount || 0}`);

  // Get total historical activities
  const { count: historicalCount } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('metadata->>historical', 'true');

  console.log(`Total historical activities created: ${historicalCount || 0}`);

  // Get most recent activities
  const { data: recent } = await supabase
    .from('activity_logs')
    .select('entity_type, entity_name, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (recent) {
    console.log('\nMost recent activities:');
    recent.forEach((a, i) => {
      const secondsAgo = Math.floor((Date.now() - new Date(a.created_at).getTime()) / 1000);
      console.log(`${i + 1}. [${a.entity_type}] ${a.entity_name} (${secondsAgo}s ago)`);
    });
  }

  if ((recentCount || 0) > 10) {
    console.log('\n⏳ Still creating activities... Please wait.');
  } else {
    console.log('\n✅ Activity creation appears to be complete!');
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).checkActivityProgress = checkActivityProgress;
}