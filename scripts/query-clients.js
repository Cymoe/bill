#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryClients() {
  try {
    console.log('🔍 Querying clients table...\n');
    
    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        company_name,
        email,
        phone,
        address,
        city,
        state,
        zip,
        user_id,
        organization_id,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error querying clients:', error);
      return;
    }

    if (!clients || clients.length === 0) {
      console.log('📋 No clients found in the database.');
      console.log('\n💡 You should create some sample clients first before creating estimates.');
      return;
    }

    console.log(`📊 Found ${clients.length} client(s):\n`);
    
    clients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} (ID: ${client.id})`);
      console.log(`   Company: ${client.company_name || 'N/A'}`);
      console.log(`   Email: ${client.email}`);
      console.log(`   Phone: ${client.phone || 'N/A'}`);
      console.log(`   Location: ${client.city ? `${client.city}, ${client.state}` : 'N/A'}`);
      console.log(`   User ID: ${client.user_id}`);
      console.log(`   Organization ID: ${client.organization_id}`);
      console.log(`   Created: ${new Date(client.created_at).toLocaleDateString()}`);
      console.log('');
    });

    console.log('💡 You can use these client IDs when creating estimates.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the query
queryClients();