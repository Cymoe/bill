// Development helper to create Supabase client with full access
// WARNING: Only use this in development!

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

function createDevClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Check if we're in development
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Using anon key in production');
    return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  
  // In development, use service role key for full access
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn('⚠️  No service role key found, falling back to anon key');
    return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  
  console.log('🔓 Using service role key (full access) - DEVELOPMENT ONLY');
  return createClient(supabaseUrl, serviceRoleKey);
}

module.exports = { createDevClient };