import { Client } from './ClientService';
import { VendorFormData } from './vendorService';
import { SubcontractorFormData } from './subcontractorService';
import { TeamMemberFormData } from './TeamMemberService';

export type PersonType = 'client' | 'vendor' | 'subcontractor' | 'team';

export interface ImportResult<T> {
  data: T[];
  source: string;
  confidence: number;
  personType: PersonType;
}

export class UniversalImportService {
  // Detect person type from content
  static detectPersonType(text: string): PersonType {
    const lowerText = text.toLowerCase();
    
    // Check for vendor indicators
    if (lowerText.includes('vendor') || lowerText.includes('supplier') || 
        lowerText.includes('llc') || lowerText.includes('inc') || 
        lowerText.includes('corporation') || lowerText.includes('supply')) {
      return 'vendor';
    }
    
    // Check for subcontractor indicators
    if (lowerText.includes('subcontractor') || lowerText.includes('sub') ||
        lowerText.includes('trade') || lowerText.includes('contractor') ||
        lowerText.includes('electrical') || lowerText.includes('plumbing') ||
        lowerText.includes('hvac') || lowerText.includes('roofing')) {
      return 'subcontractor';
    }
    
    // Check for team member indicators
    if (lowerText.includes('@') && lowerText.includes('.com') && 
        !lowerText.includes('client') && !lowerText.includes('customer')) {
      // Email that looks like it's from the same domain suggests team member
      return 'team';
    }
    
    // Default to client
    return 'client';
  }

  // Parse smart input for any person type
  static parseSmartInput(input: string, forceType?: PersonType): ImportResult<Client | VendorFormData | SubcontractorFormData | TeamMemberFormData> {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line);
    const personType = forceType || this.detectPersonType(input);
    const results: Array<Client | VendorFormData | SubcontractorFormData | TeamMemberFormData> = [];
    
    // Extract common patterns
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const phoneRegex = /(?:\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g;
    const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w]{2,}/g;
    
    // Try to parse structured data first (JSON, CSV-like)
    try {
      // Check if it's JSON
      const jsonData = JSON.parse(input);
      if (Array.isArray(jsonData)) {
        jsonData.forEach(item => {
          results.push(this.convertToPersonType(item, personType));
        });
        return { data: results, source: 'JSON Import', confidence: 0.95, personType };
      }
    } catch (e) {
      // Not JSON, continue with other parsing methods
    }
    
    // Parse line by line for contact information
    let currentPerson: Record<string, any> = {};
    let lastWasName = false;
    
    lines.forEach((line, index) => {
      // Skip empty lines
      if (!line) return;
      
      // Check for email
      const emailMatch = line.match(emailRegex);
      if (emailMatch) {
        if (currentPerson.email) {
          // New person starts
          results.push(this.convertToPersonType(currentPerson, personType));
          currentPerson = {};
        }
        currentPerson.email = emailMatch[0];
      }
      
      // Check for phone
      const phoneMatch = line.match(phoneRegex);
      if (phoneMatch) {
        currentPerson.phone = phoneMatch[0];
      }
      
      // Check for website
      const websiteMatch = line.match(websiteRegex);
      if (websiteMatch && !emailMatch) {
        currentPerson.website = websiteMatch[0];
      }
      
      // Try to identify names vs companies
      const hasNumbers = /\d/.test(line);
      const hasCommonBusinessWords = /\b(LLC|Inc|Corp|Company|Co\.|Services|Solutions|Group)\b/i.test(line);
      
      if (!emailMatch && !phoneMatch && !websiteMatch) {
        if (hasCommonBusinessWords || (personType === 'vendor' && !hasNumbers)) {
          currentPerson.company_name = line;
        } else if (!hasNumbers && line.split(' ').length <= 4) {
          // Likely a person's name
          if (personType === 'vendor' || personType === 'subcontractor') {
            currentPerson.contact_name = line;
          } else {
            currentPerson.name = line;
          }
          lastWasName = true;
        } else if (lastWasName) {
          // Could be a title or company after a name
          currentPerson.company_name = line;
          lastWasName = false;
        } else {
          // Could be an address or notes
          if (currentPerson.address) {
            currentPerson.notes = (currentPerson.notes || '') + ' ' + line;
          } else {
            currentPerson.address = line;
          }
        }
      }
    });
    
    // Add the last person
    if (Object.keys(currentPerson).length > 0) {
      results.push(this.convertToPersonType(currentPerson, personType));
    }
    
    // If no structured data found, try to parse as a single entry
    if (results.length === 0 && lines.length > 0) {
      const singlePerson = this.parseSingleEntry(input, personType);
      if (singlePerson) {
        results.push(singlePerson);
      }
    }
    
    return {
      data: results,
      source: 'Smart Parse',
      confidence: results.length > 0 ? 0.8 : 0.5,
      personType
    };
  }
  
  // Parse a single entry
  private static parseSingleEntry(text: string, personType: PersonType): Client | VendorFormData | SubcontractorFormData | TeamMemberFormData {
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/(?:\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/);
    const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w]{2,}/);
    
    const result: Record<string, any> = {};
    
    if (emailMatch) result.email = emailMatch[0];
    if (phoneMatch) result.phone = phoneMatch[0];
    if (websiteMatch && !emailMatch) result.website = websiteMatch[0];
    
    // Extract name/company
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    lines.forEach(line => {
      if (!line.includes('@') && !line.match(/\d{3}/) && !line.match(/https?:/)) {
        if (personType === 'vendor' || personType === 'subcontractor') {
          if (!result.company_name && /\b(LLC|Inc|Corp|Company)\b/i.test(line)) {
            result.company_name = line;
          } else if (!result.contact_name) {
            result.contact_name = line;
          }
        } else {
          if (!result.name) {
            result.name = line;
          } else if (!result.company_name) {
            result.company_name = line;
          }
        }
      }
    });
    
    return this.convertToPersonType(result, personType);
  }
  
  // Convert generic data to specific person type
  private static convertToPersonType(data: Record<string, any>, personType: PersonType): Client | VendorFormData | SubcontractorFormData | TeamMemberFormData {
    switch (personType) {
      case 'vendor':
        return {
          name: data.company_name || data.name || '',
          contact_name: data.contact_name || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          address: data.address || '',
          category: 'General Contractor',
          notes: data.notes || ''
        } as VendorFormData;
        
      case 'subcontractor':
        return {
          name: data.name || data.contact_name || '',
          company_name: data.company_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          trade: data.trade || 'General',
          license_number: data.license_number || '',
          insurance_info: data.insurance_info || '',
          hourly_rate: data.hourly_rate || null,
          notes: data.notes || ''
        } as SubcontractorFormData;
        
      case 'team':
        return {
          name: data.name || data.contact_name || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'Team Member',
          department: data.department || '',
          permissions: data.permissions || 'viewer',
          notes: data.notes || ''
        } as TeamMemberFormData;
        
      case 'client':
      default:
        return {
          name: data.name || data.contact_name || '',
          company_name: data.company_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          notes: data.notes || ''
        } as Client;
    }
  }
  
  // Import from calendar events (adapted for all person types)
  static async extractContactsFromCalendar(personType: PersonType): Promise<ImportResult<any>> {
    // This would connect to calendar APIs in production
    // For demo, return mock data based on person type
    const mockData = personType === 'vendor' ? [
      {
        name: 'BuildRight Supply Co.',
        contact_name: 'Mike Stevens',
        email: 'mike@buildrightsupply.com',
        phone: '(555) 345-6789',
        category: 'Materials Supplier'
      },
      {
        name: 'ProTools Rental',
        contact_name: 'Lisa Park',
        email: 'lisa@protoolsrental.com',
        phone: '(555) 456-7890',
        category: 'Equipment Rental'
      }
    ] : personType === 'subcontractor' ? [
      {
        name: 'Tony Martinez',
        company_name: 'Martinez Electric',
        email: 'tony@martinezelectric.com',
        phone: '(555) 567-8901',
        trade: 'Electrical'
      }
    ] : personType === 'team' ? [
      {
        name: 'Alex Johnson',
        email: 'alex.johnson@company.com',
        role: 'Project Manager',
        department: 'Operations'
      }
    ] : [
      {
        name: 'Robert Builder',
        company_name: 'Builder & Associates',
        email: 'robert@builderassoc.com',
        phone: '(555) 234-5678'
      }
    ];
    
    return {
      data: mockData.map(d => this.convertToPersonType(d, personType)),
      source: 'Calendar Import',
      confidence: 0.85,
      personType
    };
  }
  
  // Import from email (adapted for all person types)
  static async extractContactsFromEmail(personType: PersonType): Promise<ImportResult<any>> {
    // This would connect to email APIs in production
    // For demo, return mock data based on person type
    const mockData = personType === 'vendor' ? [
      {
        name: 'Quality Lumber LLC',
        contact_name: 'Frank Wilson',
        email: 'frank@qualitylumber.com',
        phone: '(555) 678-9012',
        category: 'Lumber Supplier'
      }
    ] : personType === 'team' ? [
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        role: 'Estimator',
        department: 'Sales'
      }
    ] : [
      {
        name: 'Jennifer Homeowner',
        email: 'jennifer.h@email.com',
        phone: '(555) 789-0123'
      }
    ];
    
    return {
      data: mockData.map(d => this.convertToPersonType(d, personType)),
      source: 'Email Import',
      confidence: 0.9,
      personType
    };
  }
}