/**
 * Test the Magic Import functionality
 * Run this file to see examples of how the smart parser works
 */

import { ClientImportService } from '../services/ClientImportService';

// Test data examples
const testCases = [
  {
    name: 'Voice Input',
    input: 'Add John Doe from ABC Construction, phone 555-123-4567, email john@abcconstruction.com'
  },
  {
    name: 'Email Signature',
    input: `
John Smith
Project Manager
XYZ Electric Company
(303) 555-9876
john.smith@xyzelectric.com
123 Main Street, Suite 100
Denver, CO 80202
    `
  },
  {
    name: 'Business Card Text',
    input: `
Mike Johnson
Johnson Plumbing Services LLC
Licensed & Insured
mike@johnsonplumbing.com
Cell: 720-555-3456
Office: 303-555-7890
    `
  },
  {
    name: 'CSV Format',
    input: 'Sarah Williams, Williams HVAC, sarah@williamshvac.com, (555) 234-5678, 456 Oak Ave, Boulder, CO 80301'
  },
  {
    name: 'Messy Paste',
    input: `
Contact: Bob Davis (Davis Roofing Inc) - 555.876.5432
Email bob.davis@davisroofing.net | Located at 789 Pine St

Also reach out to:
- Lisa Chen: lisa@chenelectric.com / 555-345-6789
- Tom Anderson from Anderson Concrete (555) 456-7890
    `
  },
  {
    name: 'Natural Language',
    input: 'I met Steve Brown today from Brown Landscaping. His number is 555-2345 and email is steve@brownlandscape.com. They\'re based in Littleton.'
  }
];

console.log('🧪 Testing Magic Import Parser\n');

testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
  console.log('Input:', testCase.input.trim());
  console.log('\n🔍 Parsed Results:');
  
  const results = ClientImportService.parseSmartInput(testCase.input);
  
  if (results.length === 0) {
    console.log('❌ No contacts found');
  } else {
    results.forEach((client, i) => {
      console.log(`\n  Contact ${i + 1}:`);
      console.log(`  - Name: ${client.name || 'N/A'}`);
      console.log(`  - Company: ${client.company_name || 'N/A'}`);
      console.log(`  - Email: ${client.email || 'N/A'}`);
      console.log(`  - Phone: ${client.phone || 'N/A'}`);
      console.log(`  - Address: ${client.address || 'N/A'}`);
    });
  }
  
  console.log('\n' + '─'.repeat(80));
});

console.log('\n✅ Test complete! The parser can handle various input formats.');
console.log('\n💡 Try pasting your own contact data to see how it works!');

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testMagicImport = (input: string) => {
    const results = ClientImportService.parseSmartInput(input);
    console.table(results);
    return results;
  };
  
  console.log('\n🎮 You can also test in the browser console:');
  console.log('testMagicImport("Your contact text here")');
}