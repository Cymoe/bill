/**
 * Calendar Integration Service
 * Provides integration with calendar providers to extract contacts from meetings
 */

import { ClientImportService } from './ClientImportService';
import { Client } from './ClientService';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendees: Array<{
    name?: string;
    email: string;
    status?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
    organizer?: boolean;
  }>;
  conferenceData?: {
    conferenceId?: string;
    conferenceSolution?: {
      name: string;
      iconUri?: string;
    };
    entryPoints?: Array<{
      entryPointType: string;
      uri?: string;
      label?: string;
    }>;
  };
}

export interface CalendarProvider {
  name: string;
  connect: (credentials: any) => Promise<void>;
  disconnect: () => Promise<void>;
  getEvents: (options?: { 
    timeMin?: Date; 
    timeMax?: Date; 
    maxResults?: number;
    query?: string;
  }) => Promise<CalendarEvent[]>;
}

export class CalendarIntegrationService {
  private static providers: Map<string, CalendarProvider> = new Map();
  private static activeProvider: CalendarProvider | null = null;
  
  /**
   * Register a calendar provider
   */
  static registerProvider(provider: CalendarProvider) {
    this.providers.set(provider.name, provider);
  }
  
  /**
   * Connect to a calendar provider
   */
  static async connect(providerName: string, credentials: any) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Calendar provider ${providerName} not found`);
    }
    
    await provider.connect(credentials);
    this.activeProvider = provider;
  }
  
  /**
   * Disconnect from the active provider
   */
  static async disconnect() {
    if (this.activeProvider) {
      await this.activeProvider.disconnect();
      this.activeProvider = null;
    }
  }
  
  /**
   * Extract contacts from recent calendar events
   */
  static async extractContactsFromRecentEvents(
    options?: { 
      timeMin?: Date; 
      timeMax?: Date; 
      maxResults?: number;
    }
  ): Promise<Client[]> {
    if (!this.activeProvider) {
      // Return mock data for demo
      return this.getMockCalendarContacts();
    }
    
    try {
      const events = await this.activeProvider.getEvents(options);
      return this.extractContactsFromEvents(events);
    } catch (error) {
      console.error('Error extracting contacts from calendar:', error);
      return [];
    }
  }
  
  /**
   * Search calendar events and extract contacts
   */
  static async searchAndExtractContacts(
    query: string,
    options?: { 
      timeMin?: Date; 
      timeMax?: Date; 
      maxResults?: number;
    }
  ): Promise<Client[]> {
    if (!this.activeProvider) {
      // Return mock data for demo
      return this.getMockCalendarContacts();
    }
    
    try {
      const events = await this.activeProvider.getEvents({ ...options, query });
      return this.extractContactsFromEvents(events);
    } catch (error) {
      console.error('Error searching calendar events:', error);
      return [];
    }
  }
  
  /**
   * Extract contacts from calendar events
   */
  private static extractContactsFromEvents(events: CalendarEvent[]): Client[] {
    const contactsMap = new Map<string, Client>();
    
    for (const event of events) {
      // Extract from attendees
      for (const attendee of event.attendees || []) {
        if (attendee.email && !this.isInternalEmail(attendee.email)) {
          const key = attendee.email.toLowerCase();
          if (!contactsMap.has(key)) {
            // Try to extract company from email domain
            const domain = attendee.email.split('@')[1];
            const companyName = this.inferCompanyFromDomain(domain);
            
            contactsMap.set(key, {
              name: attendee.name || this.extractNameFromEmail(attendee.email),
              email: attendee.email,
              company_name: companyName,
              user_id: '',
              organization_id: ''
            });
          }
        }
      }
      
      // Try to extract additional contacts from event description
      if (event.description) {
        const descriptionContacts = ClientImportService.parseSmartInput(event.description);
        for (const contact of descriptionContacts) {
          const key = contact.email?.toLowerCase() || contact.phone || contact.name;
          if (key && !contactsMap.has(key)) {
            contactsMap.set(key, contact);
          }
        }
      }
      
      // Extract from location (might contain business names)
      if (event.location && !event.location.includes('http')) {
        const locationContacts = ClientImportService.parseSmartInput(event.location);
        for (const contact of locationContacts) {
          const key = contact.email?.toLowerCase() || contact.company_name || contact.name;
          if (key && !contactsMap.has(key)) {
            contactsMap.set(key, contact);
          }
        }
      }
    }
    
    return Array.from(contactsMap.values());
  }
  
  /**
   * Check if email is internal (same domain)
   */
  private static isInternalEmail(email: string): boolean {
    // This would be configured based on user's domain
    const internalDomains = ['@yourcompany.com', '@internal.com'];
    return internalDomains.some(domain => email.toLowerCase().includes(domain));
  }
  
  /**
   * Extract name from email address
   */
  private static extractNameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    return localPart
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Infer company name from email domain
   */
  private static inferCompanyFromDomain(domain: string): string {
    // Remove common email provider domains
    const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
    if (genericDomains.includes(domain.toLowerCase())) {
      return '';
    }
    
    // Remove TLD and format as company name
    const companyPart = domain.split('.')[0];
    return companyPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Get mock calendar contacts for demo
   */
  private static getMockCalendarContacts(): Client[] {
    return [
      {
        name: 'Alex Martinez',
        company_name: 'Martinez Electrical Solutions',
        email: 'alex@martinezelectric.com',
        phone: '(555) 234-5678',
        user_id: '',
        organization_id: ''
      },
      {
        name: 'Jessica Park',
        company_name: 'Park Construction Group',
        email: 'jessica@parkconstructiongroup.com',
        phone: '(555) 345-6789',
        user_id: '',
        organization_id: ''
      },
      {
        name: 'Robert Chen',
        company_name: 'Chen HVAC Services',
        email: 'robert@chenhvac.com',
        phone: '(555) 456-7890',
        address: '789 Industrial Blvd, Suite 200',
        user_id: '',
        organization_id: ''
      },
      {
        name: 'Maria Rodriguez',
        company_name: 'Rodriguez Landscaping',
        email: 'maria@rodriguezlandscaping.com',
        user_id: '',
        organization_id: ''
      }
    ];
  }
}

/**
 * Google Calendar Provider
 */
export class GoogleCalendarProvider implements CalendarProvider {
  name = 'google-calendar';
  private accessToken: string | null = null;
  
  async connect(credentials: { accessToken: string }) {
    this.accessToken = credentials.accessToken;
    // Verify token is valid
    const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + this.accessToken);
    if (!response.ok) {
      throw new Error('Invalid Google Calendar access token');
    }
  }
  
  async disconnect() {
    this.accessToken = null;
  }
  
  async getEvents(options?: { 
    timeMin?: Date; 
    timeMax?: Date; 
    maxResults?: number;
    query?: string;
  }): Promise<CalendarEvent[]> {
    if (!this.accessToken) throw new Error('Not connected to Google Calendar');
    
    const params = new URLSearchParams();
    if (options?.timeMin) params.append('timeMin', options.timeMin.toISOString());
    if (options?.timeMax) params.append('timeMax', options.timeMax.toISOString());
    if (options?.maxResults) params.append('maxResults', String(options.maxResults));
    if (options?.query) params.append('q', options.query);
    params.append('orderBy', 'startTime');
    params.append('singleEvents', 'true');
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch calendar events');
    
    const data = await response.json();
    
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.summary || '',
      description: item.description,
      location: item.location,
      startTime: new Date(item.start.dateTime || item.start.date),
      endTime: new Date(item.end.dateTime || item.end.date),
      attendees: (item.attendees || []).map((attendee: any) => ({
        name: attendee.displayName,
        email: attendee.email,
        status: attendee.responseStatus,
        organizer: attendee.organizer
      })),
      conferenceData: item.conferenceData
    }));
  }
}

/**
 * Outlook Calendar Provider
 */
export class OutlookCalendarProvider implements CalendarProvider {
  name = 'outlook-calendar';
  private accessToken: string | null = null;
  
  async connect(credentials: { accessToken: string }) {
    this.accessToken = credentials.accessToken;
    // Verify token is valid
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error('Invalid Outlook Calendar access token');
    }
  }
  
  async disconnect() {
    this.accessToken = null;
  }
  
  async getEvents(options?: { 
    timeMin?: Date; 
    timeMax?: Date; 
    maxResults?: number;
    query?: string;
  }): Promise<CalendarEvent[]> {
    if (!this.accessToken) throw new Error('Not connected to Outlook Calendar');
    
    let url = 'https://graph.microsoft.com/v1.0/me/events';
    const params: string[] = [];
    
    if (options?.timeMin && options?.timeMax) {
      params.push(`$filter=start/dateTime ge '${options.timeMin.toISOString()}' and end/dateTime le '${options.timeMax.toISOString()}'`);
    }
    if (options?.maxResults) {
      params.push(`$top=${options.maxResults}`);
    }
    if (options?.query) {
      params.push(`$search="${options.query}"`);
    }
    params.push('$orderby=start/dateTime');
    params.push('$select=id,subject,body,location,start,end,attendees,onlineMeeting');
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch Outlook calendar events');
    
    const data = await response.json();
    
    return (data.value || []).map((item: any) => ({
      id: item.id,
      title: item.subject || '',
      description: item.body?.content,
      location: item.location?.displayName,
      startTime: new Date(item.start.dateTime),
      endTime: new Date(item.end.dateTime),
      attendees: (item.attendees || []).map((attendee: any) => ({
        name: attendee.emailAddress.name,
        email: attendee.emailAddress.address,
        status: attendee.status?.response?.toLowerCase(),
        organizer: attendee.type === 'required' && item.organizer?.emailAddress?.address === attendee.emailAddress.address
      }))
    }));
  }
}

// Initialize providers if API keys are available
if (typeof window !== 'undefined') {
  // Providers would be initialized when user connects their account
  // For now, we'll just register them
  CalendarIntegrationService.registerProvider(new GoogleCalendarProvider());
  CalendarIntegrationService.registerProvider(new OutlookCalendarProvider());
}