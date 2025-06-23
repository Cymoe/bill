// Development helper to create Supabase client with full access
// WARNING: Only use this in development!

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(dirname(__dirname), '.env.local') });

export function createDevClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Check if we're in development
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Using anon key in production');
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return createClient(supabaseUrl, anonKey);
  }
  
  // In development, use service role key for full access
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn('⚠️  No service role key found, falling back to anon key');
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return createClient(supabaseUrl, anonKey);
  }
  
  console.log('🔓 Using service role key (full access) - DEVELOPMENT ONLY');
  return createClient(supabaseUrl, serviceRoleKey);
}