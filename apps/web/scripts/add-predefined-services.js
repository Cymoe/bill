import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(dirname(__dirname), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Adding predefined services to database...\n');

    // Read the migration files
    const migration1 = readFileSync(join(dirname(__dirname), 'supabase/migrations/20250623_add_predefined_services.sql'), 'utf8');
    const migration2 = readFileSync(join(dirname(__dirname), 'supabase/migrations/20250623_add_more_predefined_services.sql'), 'utf8');

    // Run first migration
    console.log('📦 Adding services for General Construction, Plumbing, Electrical, HVAC...');
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: migration1 });
    if (error1) {
      console.error('Error running first migration:', error1);
      return;
    }
    console.log('✅ First batch of services added successfully!\n');

    // Run second migration
    console.log('📦 Adding services for Flooring, Painting, Carpentry, Landscaping...');
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: migration2 });
    if (error2) {
      console.error('Error running second migration:', error2);
      return;
    }
    console.log('✅ Second batch of services added successfully!\n');

    // Count services per industry
    console.log('📊 Services added per industry:');
    const industries = [
      'general-construction', 'plumbing', 'electrical', 'hvac',
      'flooring', 'painting', 'carpentry', 'landscaping'
    ];

    for (const slug of industries) {
      const { count } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('industry_id', await getIndustryId(slug));
      
      console.log(`   ${slug}: ${count || 0} services`);
    }

    console.log('\n✨ All predefined services have been added successfully!');
    console.log('🎯 Users can now add service options (with pricing) to these services.');

  } catch (error) {
    console.error('Error:', error);
  }
}

async function getIndustryId(slug) {
  const { data } = await supabase
    .from('industries')
    .select('id')
    .eq('slug', slug)
    .single();
  return data?.id;
}

// Check if exec_sql function exists, if not create it
async function ensureExecSqlFunction() {
  const createFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    // Try to create the function (will fail silently if it exists)
    await supabase.rpc('query', { query: createFunction });
  } catch (e) {
    // Function might already exist, that's okay
  }
}

// First ensure the function exists, then run migration
ensureExecSqlFunction().then(() => runMigration());