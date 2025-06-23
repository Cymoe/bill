import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(dirname(__dirname), '.env') });

// We need to use the service role key to bypass RLS
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure you have VITE_SUPABASE_URL and ideally SUPABASE_SERVICE_KEY in your .env file');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Industries data from the migration file
const industriesData = [
  // Construction Industries
  { name: 'General Construction', slug: 'general-construction', description: 'General contracting and construction services', icon: '🏗️', color: '#6B7280', display_order: 10, is_active: true },
  { name: 'Electrical', slug: 'electrical', description: 'Electrical contracting and services', icon: '⚡', color: '#F59E0B', display_order: 20, is_active: true },
  { name: 'Plumbing', slug: 'plumbing', description: 'Plumbing contracting and services', icon: '🚿', color: '#3B82F6', display_order: 30, is_active: true },
  { name: 'HVAC', slug: 'hvac', description: 'Heating, ventilation, and air conditioning services', icon: '❄️', color: '#06B6D4', display_order: 40, is_active: true },
  { name: 'Roofing', slug: 'roofing', description: 'Roofing installation and repair services', icon: '🏠', color: '#DC2626', display_order: 50, is_active: true },
  { name: 'Flooring', slug: 'flooring', description: 'Flooring installation and refinishing services', icon: '🪵', color: '#7C3AED', display_order: 60, is_active: true },
  { name: 'Landscaping', slug: 'landscaping', description: 'Landscaping and outdoor design services', icon: '🌳', color: '#10B981', display_order: 70, is_active: true },
  
  // Specialized Construction
  { name: 'Commercial Construction', slug: 'commercial-construction', description: 'Commercial building and tenant improvements', icon: '🏢', color: '#1F2937', display_order: 80, is_active: true },
  { name: 'Residential Construction', slug: 'residential-construction', description: 'Specialized residential remodeling and renovation', icon: '🏠', color: '#84CC16', display_order: 90, is_active: true },
  { name: 'Kitchen Remodeling', slug: 'kitchen-remodeling', description: 'Kitchen design and renovation services', icon: '🍳', color: '#F97316', display_order: 100, is_active: true },
  { name: 'Bathroom Remodeling', slug: 'bathroom-remodeling', description: 'Bathroom design and renovation services', icon: '🚿', color: '#8B5CF6', display_order: 110, is_active: true },
  
  // Renewable Energy
  { name: 'Solar', slug: 'solar', description: 'Solar panel installation and renewable energy services', icon: '☀️', color: '#FDE047', display_order: 120, is_active: true },
  
  // Real Estate
  { name: 'Property Management', slug: 'property-management', description: 'Property management and maintenance services', icon: '🔑', color: '#4B5563', display_order: 130, is_active: true },
  { name: 'Real Estate Investment', slug: 'real-estate-investment', description: 'Real estate investment and development', icon: '🏡', color: '#059669', display_order: 140, is_active: true }
];

// Additional industries that might be missing
const additionalIndustries = [
  { name: 'Painting', slug: 'painting', description: 'Interior and exterior painting services', icon: '🎨', color: '#EC4899', display_order: 65, is_active: true },
  { name: 'Carpentry', slug: 'carpentry', description: 'Custom carpentry and woodworking services', icon: '🔨', color: '#F97316', display_order: 55, is_active: true },
  { name: 'Pest Control', slug: 'pest-control', description: 'Pest control and extermination services', icon: '🐛', color: '#991B1B', display_order: 75, is_active: true },
  { name: 'Pool & Spa', slug: 'pool-spa', description: 'Pool and spa installation and maintenance', icon: '🏊', color: '#0E7490', display_order: 85, is_active: true }
];

async function populateIndustries() {
  try {
    console.log('\n📊 Checking current industries...');
    
    // First check if any industries exist
    const { count: existingCount, error: countError } = await supabase
      .from('industries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error checking industries:', countError);
      return;
    }

    console.log(`   Found ${existingCount || 0} existing industries`);

    if (existingCount > 0) {
      console.log('\n⚠️  Industries already exist. Checking for missing ones...');
      
      // Get existing slugs
      const { data: existing } = await supabase
        .from('industries')
        .select('slug');
      
      const existingSlugs = new Set(existing?.map(i => i.slug) || []);
      
      // Combine all industries and filter out existing ones
      const allIndustries = [...industriesData, ...additionalIndustries];
      const missingIndustries = allIndustries.filter(i => !existingSlugs.has(i.slug));
      
      if (missingIndustries.length === 0) {
        console.log('✅ All industries already exist!');
        return;
      }
      
      console.log(`\n📝 Adding ${missingIndustries.length} missing industries...`);
      
      // Insert missing industries
      const { data: inserted, error: insertError } = await supabase
        .from('industries')
        .insert(missingIndustries)
        .select();
      
      if (insertError) {
        console.error('❌ Error inserting industries:', insertError);
        return;
      }
      
      console.log(`✅ Successfully added ${inserted.length} industries`);
      
    } else {
      console.log('\n📝 Populating all industries...');
      
      // Insert all industries
      const allIndustries = [...industriesData, ...additionalIndustries];
      
      const { data: inserted, error: insertError } = await supabase
        .from('industries')
        .insert(allIndustries)
        .select();
      
      if (insertError) {
        console.error('❌ Error inserting industries:', insertError);
        console.error('Details:', insertError.details);
        console.error('Message:', insertError.message);
        
        // If RLS is blocking, provide instructions
        if (insertError.code === '42501') {
          console.log('\n⚠️  Row Level Security (RLS) is blocking the insert.');
          console.log('   You need to either:');
          console.log('   1. Use a service role key (not the anon key) in SUPABASE_SERVICE_KEY');
          console.log('   2. Or run the SQL directly in Supabase dashboard');
          console.log('\n   To get your service role key:');
          console.log('   1. Go to https://supabase.com/dashboard/project/wnwatjwcjptwehagqiwf/settings/api');
          console.log('   2. Copy the "service_role" key (starts with eyJ...)');
          console.log('   3. Add to .env as SUPABASE_SERVICE_KEY=<your-key>');
        }
        return;
      }
      
      console.log(`✅ Successfully populated ${inserted.length} industries!`);
    }

    // Show final count
    console.log('\n📊 Final industry list:');
    const { data: final } = await supabase
      .from('industries')
      .select('name, slug')
      .order('display_order');
    
    final?.forEach(i => {
      console.log(`   • ${i.name} (${i.slug})`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the population
populateIndustries();