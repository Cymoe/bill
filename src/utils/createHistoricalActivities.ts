// Create historical activities for existing entities that don't have activity logs
import { supabase } from '../lib/supabase';

export async function createHistoricalActivities() {
  console.log('=== CREATING HISTORICAL ACTIVITIES ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user logged in');
    return;
  }

  console.log('Organization:', orgId);
  console.log('User:', user.email);
  console.log('\n');

  // Define entity types and their creation messages
  const entities = [
    { 
      table: 'clients', 
      type: 'client', 
      nameField: 'name',
      getMessage: (item: any) => `created client ${item.name}`
    },
    { 
      table: 'projects', 
      type: 'project', 
      nameField: 'name',
      getMessage: (item: any) => `created project ${item.name}`
    },
    { 
      table: 'products', 
      type: 'product', 
      nameField: 'name',
      getMessage: (item: any) => `created product ${item.name}`
    },
    { 
      table: 'expenses', 
      type: 'expense', 
      nameField: 'description',
      getMessage: (item: any) => `created expense ${item.description || `$${item.amount}`}`
    },
    { 
      table: 'vendors', 
      type: 'vendor', 
      nameField: 'name',
      getMessage: (item: any) => `created vendor ${item.name}`
    },
    { 
      table: 'subcontractors', 
      type: 'subcontractor', 
      nameField: 'name',
      getMessage: (item: any) => `created subcontractor ${item.name}`
    },
    { 
      table: 'team_members', 
      type: 'team_member', 
      nameField: 'name',
      getMessage: (item: any) => `added team member ${item.name}`
    }
  ];

  for (const entity of entities) {
    console.log(`\n--- Processing ${entity.type}s ---`);
    
    try {
      // Get all items from this entity type
      const { data: items, error } = await supabase
        .from(entity.table)
        .select('*')
        .eq('organization_id', orgId);

      if (error) {
        console.error(`Error fetching ${entity.table}:`, error.message);
        continue;
      }

      if (!items || items.length === 0) {
        console.log(`No ${entity.type}s found`);
        continue;
      }

      console.log(`Found ${items.length} ${entity.type}s`);

      // Check which ones already have activities
      const { data: existingActivities } = await supabase
        .from('activity_logs')
        .select('entity_id')
        .eq('organization_id', orgId)
        .eq('entity_type', entity.type)
        .eq('action', 'created');

      const existingIds = new Set(existingActivities?.map(a => a.entity_id) || []);
      const itemsWithoutActivities = items.filter(item => !existingIds.has(item.id));

      if (itemsWithoutActivities.length === 0) {
        console.log(`All ${entity.type}s already have creation activities`);
        continue;
      }

      console.log(`Creating activities for ${itemsWithoutActivities.length} ${entity.type}s without activities...`);

      let created = 0;
      let failed = 0;

      for (const item of itemsWithoutActivities) {
        try {
          const metadata: any = {
            historical: true,
            created_from_existing: true
          };

          // Add type-specific metadata
          if (entity.type === 'client') {
            metadata.client_name = item.name;
            metadata.client_email = item.email;
          } else if (entity.type === 'project') {
            metadata.project_name = item.name;
            metadata.status = item.status;
            metadata.budget = item.budget;
          } else if (entity.type === 'product') {
            metadata.product_name = item.name;
            metadata.price = item.price;
          } else if (entity.type === 'expense') {
            metadata.amount = item.amount;
            metadata.category = item.category;
          }

          const { error } = await supabase.rpc('log_activity', {
            p_action: 'created',
            p_entity_type: entity.type,
            p_entity_id: item.id,
            p_entity_name: entity.getMessage(item),
            p_metadata: JSON.stringify(metadata),
            p_organization_id: orgId
          });

          if (error) {
            console.error(`Failed to create activity for ${item[entity.nameField]}:`, error.message);
            failed++;
          } else {
            console.log(`✅ Created activity for ${item[entity.nameField]}`);
            created++;
          }
        } catch (err) {
          console.error(`Error processing ${item[entity.nameField]}:`, err);
          failed++;
        }
      }

      console.log(`Summary: ${created} created, ${failed} failed`);
    } catch (err) {
      console.error(`Error processing ${entity.type}s:`, err);
    }
  }

  console.log('\n=== HISTORICAL ACTIVITIES COMPLETE ===');
  console.log('Refresh the activity page to see all historical activities.');
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).createHistoricalActivities = createHistoricalActivities;
}