#!/usr/bin/env node

// Simple test script to verify email functionality
// Run with: node test-email.js

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

async function testEmailFunction() {
  try {
    console.log('Testing Edge Function deployment...');
    
    // Test the function endpoint
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (response.ok) {
      console.log('✅ Edge Function is deployed and responding to requests');
      console.log('Response status:', response.status);
      
      // Check if RESEND_API_KEY is set
      console.log('\n⚠️  Make sure to set your RESEND_API_KEY:');
      console.log('supabase secrets set RESEND_API_KEY=your-api-key-here');
      
      console.log('\n📧 Email domains to configure in Resend:');
      console.log('- billbreeze.com (for sending emails)');
      
      console.log('\n🔗 Edge Function URL:');
      console.log(`${SUPABASE_URL}/functions/v1/send-email`);
      
    } else {
      console.error('❌ Edge Function returned an error:', response.status);
      const text = await response.text();
      console.error('Response:', text);
    }
  } catch (error) {
    console.error('❌ Failed to test Edge Function:', error.message);
  }
}

testEmailFunction();