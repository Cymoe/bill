import { createDevClient } from './create-dev-client.mjs';

// Use development client with full access (service role key)
const supabase = createDevClient();

const { data, error } = await supabase
  .from('industries')
  .select('id, slug, name')
  .order('name');

if (error) {
  console.error('Error fetching industries:', error);
  process.exit(1);
}

console.log('Available industries in database:');
console.log('================================');
if (!data || data.length === 0) {
  console.log('No industries found!');
} else {
  data.forEach(i => {
    console.log(`${i.name}:`);
    console.log(`  ID: ${i.id}`);
    console.log(`  Slug: ${i.slug}`);
    console.log('');
  });
  
  console.log('\nIndustry slugs summary:');
  console.log(data.map(i => i.slug).join(', '));
}