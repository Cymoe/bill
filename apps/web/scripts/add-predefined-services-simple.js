import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(dirname(__dirname), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Service definitions organized by industry
const servicesByIndustry = {
  'general-construction': [
    { name: 'Foundation Work', description: 'Installation and repair of building foundations', category: 'installation', display_order: 10 },
    { name: 'Framing', description: 'Wood and metal framing for residential and commercial structures', category: 'installation', display_order: 20 },
    { name: 'Concrete Work', description: 'Concrete pouring, finishing, and repair services', category: 'installation', display_order: 30 },
    { name: 'Drywall Installation', description: 'Hanging, taping, and finishing drywall', category: 'installation', display_order: 40 },
    { name: 'Structural Repairs', description: 'Repair of load-bearing elements and structural damage', category: 'repair', display_order: 50 },
    { name: 'Water Damage Restoration', description: 'Repair and restoration after water damage', category: 'repair', display_order: 60 },
    { name: 'Project Consultation', description: 'Construction planning and feasibility consultation', category: 'consultation', display_order: 70 },
    { name: 'Building Inspection', description: 'Pre-purchase and construction phase inspections', category: 'inspection', display_order: 80 }
  ],
  'plumbing': [
    { name: 'Fixture Installation', description: 'Installation of sinks, toilets, faucets, and other fixtures', category: 'installation', display_order: 10 },
    { name: 'Pipe Installation', description: 'Installation of water supply and drainage pipes', category: 'installation', display_order: 20 },
    { name: 'Water Heater Installation', description: 'Installation and replacement of water heaters', category: 'installation', display_order: 30 },
    { name: 'Leak Repair', description: 'Detection and repair of water leaks', category: 'repair', display_order: 40 },
    { name: 'Drain Cleaning', description: 'Clearing clogs and cleaning drainage systems', category: 'repair', display_order: 50 },
    { name: 'Emergency Plumbing', description: '24/7 emergency plumbing repairs', category: 'repair', display_order: 60 },
    { name: 'Plumbing Maintenance', description: 'Regular inspection and maintenance of plumbing systems', category: 'maintenance', display_order: 70 },
    { name: 'Plumbing Inspection', description: 'Comprehensive plumbing system inspections', category: 'inspection', display_order: 80 }
  ],
  'electrical': [
    { name: 'Outlet & Switch Installation', description: 'Installation of electrical outlets, switches, and covers', category: 'installation', display_order: 10 },
    { name: 'Lighting Installation', description: 'Installation of indoor and outdoor lighting fixtures', category: 'installation', display_order: 20 },
    { name: 'Panel Upgrade', description: 'Electrical panel replacement and upgrades', category: 'installation', display_order: 30 },
    { name: 'Wiring Installation', description: 'Running new electrical wiring for renovations or new construction', category: 'installation', display_order: 40 },
    { name: 'Electrical Troubleshooting', description: 'Diagnosis and repair of electrical issues', category: 'repair', display_order: 50 },
    { name: 'Emergency Electrical', description: '24/7 emergency electrical repairs', category: 'repair', display_order: 60 },
    { name: 'Electrical Inspection', description: 'Safety inspections and code compliance checks', category: 'inspection', display_order: 70 },
    { name: 'Electrical Maintenance', description: 'Preventive maintenance for electrical systems', category: 'maintenance', display_order: 80 }
  ],
  'flooring': [
    { name: 'Hardwood Installation', description: 'Installation of solid and engineered hardwood flooring', category: 'installation', display_order: 10 },
    { name: 'Tile Installation', description: 'Installation of ceramic, porcelain, and natural stone tiles', category: 'installation', display_order: 20 },
    { name: 'Carpet Installation', description: 'Installation of carpet and padding', category: 'installation', display_order: 30 },
    { name: 'Vinyl/LVP Installation', description: 'Installation of vinyl, luxury vinyl plank, and laminate flooring', category: 'installation', display_order: 40 },
    { name: 'Floor Repair', description: 'Repair of damaged flooring sections', category: 'repair', display_order: 50 },
    { name: 'Floor Refinishing', description: 'Sanding and refinishing of hardwood floors', category: 'finishing', display_order: 60 },
    { name: 'Subfloor Preparation', description: 'Leveling and preparing subfloors for new flooring', category: 'preparation', display_order: 70 }
  ],
  'painting': [
    { name: 'Interior Painting', description: 'Painting of interior walls, ceilings, and trim', category: 'finishing', display_order: 10 },
    { name: 'Exterior Painting', description: 'Painting of exterior siding, trim, and surfaces', category: 'finishing', display_order: 20 },
    { name: 'Cabinet Painting', description: 'Professional painting and refinishing of cabinets', category: 'finishing', display_order: 30 },
    { name: 'Commercial Painting', description: 'Large-scale painting for commercial properties', category: 'finishing', display_order: 40 },
    { name: 'Surface Preparation', description: 'Patching, sanding, and priming surfaces', category: 'preparation', display_order: 50 },
    { name: 'Wallpaper Removal', description: 'Removal of existing wallpaper and wall preparation', category: 'preparation', display_order: 60 },
    { name: 'Decorative Finishes', description: 'Faux finishes, textures, and specialty coatings', category: 'finishing', display_order: 70 }
  ]
};

async function addPredefinedServices() {
  console.log('🚀 Starting to add predefined services...\n');
  console.log('📝 Adding system-level services (no organization_id)...');

  for (const [industrySlug, services] of Object.entries(servicesByIndustry)) {
    console.log(`\n📦 Processing ${industrySlug}...`);
    
    // Get industry ID
    const { data: industry, error: industryError } = await supabase
      .from('industries')
      .select('id, name')
      .eq('slug', industrySlug)
      .single();

    if (industryError || !industry) {
      console.error(`❌ Could not find industry: ${industrySlug}`);
      continue;
    }

    console.log(`   Found industry: ${industry.name}`);

    // Check if services already exist for this industry
    const { count: existingCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('industry_id', industry.id);

    if (existingCount > 0) {
      console.log(`   ⚠️  Skipping - ${existingCount} services already exist for ${industry.name}`);
      continue;
    }

    // Add services for this industry
    const servicesToInsert = services.map(service => ({
      ...service,
      industry_id: industry.id,
      is_active: true
      // No organization_id or created_by - these are system-level services
    }));

    const { data: insertedServices, error: insertError } = await supabase
      .from('services')
      .insert(servicesToInsert)
      .select();

    if (insertError) {
      console.error(`❌ Error adding services for ${industry.name}:`, insertError.message);
    } else {
      console.log(`   ✅ Added ${insertedServices.length} services for ${industry.name}`);
    }
  }

  // Summary
  console.log('\n📊 Summary:');
  const { data: allServices } = await supabase
    .from('services')
    .select('industry_id, industries(name)')
    .order('industry_id');

  const servicesByIndustryCount = {};
  allServices?.forEach(service => {
    const industryName = service.industries?.name || 'Unknown';
    servicesByIndustryCount[industryName] = (servicesByIndustryCount[industryName] || 0) + 1;
  });

  Object.entries(servicesByIndustryCount).forEach(([industry, count]) => {
    console.log(`   ${industry}: ${count} services`);
  });

  console.log('\n✨ Done! Services have been added to the database.');
  console.log('🎯 Next step: Add service options with pricing for each service.');
}

// Run the script
addPredefinedServices().catch(console.error);