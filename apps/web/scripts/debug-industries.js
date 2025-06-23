import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(dirname(__dirname), '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Debugging industries table access...\n');

// Try different queries to understand what's happening
async function debugIndustries() {
  // 1. Basic select
  console.log('1. Basic select query:');
  const { data: basic, error: basicError } = await supabase
    .from('industries')
    .select('id, slug, name')
    .order('name');
  
  if (basicError) {
    console.log('   ❌ Error:', basicError.message);
    console.log('   Code:', basicError.code);
    console.log('   Details:', basicError.details);
  } else {
    console.log(`   ✅ Found ${basic?.length || 0} industries`);
    if (basic && basic.length > 0) {
      console.log('   First few:', basic.slice(0, 3).map(i => i.name).join(', '));
    }
  }

  // 2. Check if it's an RLS issue by counting
  console.log('\n2. Count query:');
  const { count, error: countError } = await supabase
    .from('industries')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log('   ❌ Error:', countError.message);
  } else {
    console.log(`   ✅ Total count: ${count}`);
  }

  // 3. Try with is_active filter (from RLS policy)
  console.log('\n3. Active industries only:');
  const { data: active, error: activeError } = await supabase
    .from('industries')
    .select('id, slug, name, is_active')
    .eq('is_active', true)
    .order('name');
  
  if (activeError) {
    console.log('   ❌ Error:', activeError.message);
  } else {
    console.log(`   ✅ Found ${active?.length || 0} active industries`);
  }

  // 4. Check specific slugs we're looking for
  console.log('\n4. Checking specific industry slugs:');
  const slugsToCheck = ['general-construction', 'plumbing', 'electrical', 'hvac', 'landscaping'];
  
  for (const slug of slugsToCheck) {
    const { data: specific, error: specificError } = await supabase
      .from('industries')
      .select('id, name, slug')
      .eq('slug', slug)
      .single();
    
    if (specificError) {
      console.log(`   ❌ ${slug}: Not found (${specificError.message})`);
    } else if (specific) {
      console.log(`   ✅ ${slug}: Found "${specific.name}" (ID: ${specific.id})`);
    }
  }

  // 5. Get all slugs to see what's actually there
  console.log('\n5. All available slugs:');
  const { data: allSlugs, error: slugError } = await supabase
    .from('industries')
    .select('slug, name')
    .order('slug');
  
  if (slugError) {
    console.log('   ❌ Error:', slugError.message);
  } else if (allSlugs && allSlugs.length > 0) {
    console.log('   Available slugs:');
    allSlugs.forEach(i => {
      console.log(`   - ${i.slug} (${i.name})`);
    });
  }

  // 6. Check auth status
  console.log('\n6. Auth status:');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.log('   ⚠️  No authenticated user - using anonymous access');
  } else {
    console.log('   ✅ Authenticated as:', user.email || user.id);
  }
}

debugIndustries().catch(console.error);