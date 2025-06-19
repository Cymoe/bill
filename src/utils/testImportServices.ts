import { CalendarIntegrationService } from '../services/CalendarIntegrationService';
import { EmailIntegrationService } from '../services/EmailIntegrationService';
import { QuickBooksIntegrationService } from '../services/QuickBooksIntegrationService';

export const testImportServices = async () => {
  console.log('=== TESTING IMPORT SERVICES ===');
  
  // Test Calendar Import
  console.log('\n1. Testing Calendar Import...');
  try {
    const calendarContacts = await CalendarIntegrationService.extractContactsFromRecentEvents({
      timeMin: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      timeMax: new Date(),
      maxResults: 10
    });
    console.log(`✅ Calendar import returned ${calendarContacts.length} contacts:`, calendarContacts);
  } catch (error) {
    console.error('❌ Calendar import error:', error);
  }
  
  // Test Email Import
  console.log('\n2. Testing Email Import...');
  try {
    const emailContacts = await EmailIntegrationService.extractContactsFromRecentEmails({
      limit: 10,
      since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });
    console.log(`✅ Email import returned ${emailContacts.length} contacts:`, emailContacts);
  } catch (error) {
    console.error('❌ Email import error:', error);
  }
  
  // Test QuickBooks Import
  console.log('\n3. Testing QuickBooks Import...');
  try {
    const qbCustomers = await QuickBooksIntegrationService.importCustomers({
      activeOnly: true,
      limit: 10,
      includeJobs: false
    });
    console.log(`✅ QuickBooks import returned ${qbCustomers.length} customers:`, qbCustomers);
  } catch (error) {
    console.error('❌ QuickBooks import error:', error);
  }
  
  console.log('\n=== IMPORT SERVICES TEST COMPLETE ===');
};

// Auto-run on import
testImportServices();