/**
 * Email Integration Service
 * Provides integration with email providers to extract contacts
 */

import { ClientImportService } from './ClientImportService';
import { Client } from './ClientService';

export interface EmailMessage {
  id: string;
  subject: string;
  from: {
    name?: string;
    email: string;
  };
  to: Array<{
    name?: string;
    email: string;
  }>;
  cc?: Array<{
    name?: string;
    email: string;
  }>;
  date: Date;
  body: {
    text?: string;
    html?: string;
  };
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

export interface EmailProvider {
  name: string;
  connect: (credentials: any) => Promise<void>;
  disconnect: () => Promise<void>;
  getRecentEmails: (options?: { limit?: number; since?: Date }) => Promise<EmailMessage[]>;
  searchEmails: (query: string, options?: { limit?: number }) => Promise<EmailMessage[]>;
}

export class EmailIntegrationService {
  private static providers: Map<string, EmailProvider> = new Map();
  private static activeProvider: EmailProvider | null = null;
  
  /**
   * Register an email provider
   */
  static registerProvider(provider: EmailProvider) {
    this.providers.set(provider.name, provider);
  }
  
  /**
   * Connect to an email provider
   */
  static async connect(providerName: string, credentials: any) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Email provider ${providerName} not found`);
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
   * Extract contacts from recent emails
   */
  static async extractContactsFromRecentEmails(
    options?: { limit?: number; since?: Date }
  ): Promise<Client[]> {
    if (!this.activeProvider) {
      // Return mock data for demo
      return this.getMockEmailContacts();
    }
    
    try {
      const emails = await this.activeProvider.getRecentEmails(options);
      return this.extractContactsFromEmails(emails);
    } catch (error) {
      console.error('Error extracting contacts from emails:', error);
      return [];
    }
  }
  
  /**
   * Search emails and extract contacts
   */
  static async searchAndExtractContacts(
    query: string,
    options?: { limit?: number }
  ): Promise<Client[]> {
    if (!this.activeProvider) {
      // Return mock data for demo
      return this.getMockEmailContacts();
    }
    
    try {
      const emails = await this.activeProvider.searchEmails(query, options);
      return this.extractContactsFromEmails(emails);
    } catch (error) {
      console.error('Error searching emails:', error);
      return [];
    }
  }
  
  /**
   * Extract contacts from email messages
   */
  private static extractContactsFromEmails(emails: EmailMessage[]): Client[] {
    const contactsMap = new Map<string, Client>();
    
    for (const email of emails) {
      // Extract from sender
      if (email.from.email && !this.isInternalEmail(email.from.email)) {
        const key = email.from.email.toLowerCase();
        if (!contactsMap.has(key)) {
          contactsMap.set(key, {
            name: email.from.name || this.extractNameFromEmail(email.from.email),
            email: email.from.email,
            user_id: '',
            organization_id: ''
          });
        }
      }
      
      // Extract from recipients
      const allRecipients = [...(email.to || []), ...(email.cc || [])];
      for (const recipient of allRecipients) {
        if (recipient.email && !this.isInternalEmail(recipient.email)) {
          const key = recipient.email.toLowerCase();
          if (!contactsMap.has(key)) {
            contactsMap.set(key, {
              name: recipient.name || this.extractNameFromEmail(recipient.email),
              email: recipient.email,
              user_id: '',
              organization_id: ''
            });
          }
        }
      }
      
      // Try to extract additional contacts from email body
      if (email.body.text) {
        const bodyContacts = ClientImportService.parseSmartInput(email.body.text);
        for (const contact of bodyContacts) {
          const key = contact.email?.toLowerCase() || contact.phone || contact.name;
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
   * Get mock email contacts for demo
   */
  private static getMockEmailContacts(): Client[] {
    return [
      {
        name: 'David Chen',
        company_name: 'Chen Electrical Services',
        email: 'david@chenelectric.com',
        phone: '(555) 987-6543',
        user_id: '',
        organization_id: ''
      },
      {
        name: 'Emily Rodriguez',
        company_name: 'Rodriguez Roofing',
        email: 'emily@rodriguezroofing.com',
        phone: '(555) 456-7890',
        user_id: '',
        organization_id: ''
      },
      {
        name: 'Michael Thompson',
        company_name: 'Thompson Plumbing Co',
        email: 'mike@thompsonplumbing.com',
        phone: '(555) 321-9876',
        user_id: '',
        organization_id: ''
      }
    ];
  }
}

/**
 * Gmail Provider using Google APIs
 */
export class GmailProvider implements EmailProvider {
  name = 'gmail';
  private accessToken: string | null = null;
  
  async connect(credentials: { accessToken: string }) {
    this.accessToken = credentials.accessToken;
    // Verify token is valid
    const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + this.accessToken);
    if (!response.ok) {
      throw new Error('Invalid Gmail access token');
    }
  }
  
  async disconnect() {
    this.accessToken = null;
  }
  
  async getRecentEmails(options?: { limit?: number; since?: Date }): Promise<EmailMessage[]> {
    if (!this.accessToken) throw new Error('Not connected to Gmail');
    
    const limit = options?.limit || 50;
    const query = options?.since 
      ? `after:${Math.floor(options.since.getTime() / 1000)}`
      : '';
    
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}&q=${query}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch Gmail messages');
    
    const data = await response.json();
    const messages: EmailMessage[] = [];
    
    // Fetch full message details
    for (const message of data.messages || []) {
      const msgResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      if (msgResponse.ok) {
        const msgData = await msgResponse.json();
        messages.push(this.parseGmailMessage(msgData));
      }
    }
    
    return messages;
  }
  
  async searchEmails(query: string, options?: { limit?: number }): Promise<EmailMessage[]> {
    if (!this.accessToken) throw new Error('Not connected to Gmail');
    
    const limit = options?.limit || 50;
    
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to search Gmail messages');
    
    const data = await response.json();
    const messages: EmailMessage[] = [];
    
    // Fetch full message details
    for (const message of data.messages || []) {
      const msgResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      if (msgResponse.ok) {
        const msgData = await msgResponse.json();
        messages.push(this.parseGmailMessage(msgData));
      }
    }
    
    return messages;
  }
  
  private parseGmailMessage(msgData: any): EmailMessage {
    const headers = msgData.payload.headers.reduce((acc: any, header: any) => {
      acc[header.name.toLowerCase()] = header.value;
      return acc;
    }, {});
    
    // Extract body
    let textBody = '';
    let htmlBody = '';
    
    const extractBody = (part: any) => {
      if (part.mimeType === 'text/plain' && part.body.data) {
        textBody = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (part.mimeType === 'text/html' && part.body.data) {
        htmlBody = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (part.parts) {
        part.parts.forEach(extractBody);
      }
    };
    
    extractBody(msgData.payload);
    
    // Parse email addresses
    const parseEmails = (header: string): Array<{ name?: string; email: string }> => {
      if (!header) return [];
      return header.split(',').map(addr => {
        const match = addr.match(/(?:"?([^"]*)"?\s)?<(.+?)>/);
        if (match) {
          return { name: match[1]?.trim(), email: match[2] };
        }
        return { email: addr.trim() };
      });
    };
    
    return {
      id: msgData.id,
      subject: headers.subject || '',
      from: parseEmails(headers.from)[0] || { email: '' },
      to: parseEmails(headers.to),
      cc: parseEmails(headers.cc),
      date: new Date(parseInt(msgData.internalDate)),
      body: {
        text: textBody,
        html: htmlBody
      }
    };
  }
}

/**
 * Outlook Provider using Microsoft Graph API
 */
export class OutlookProvider implements EmailProvider {
  name = 'outlook';
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
      throw new Error('Invalid Outlook access token');
    }
  }
  
  async disconnect() {
    this.accessToken = null;
  }
  
  async getRecentEmails(options?: { limit?: number; since?: Date }): Promise<EmailMessage[]> {
    // Implementation would be similar to Gmail but using Microsoft Graph API
    throw new Error('Outlook provider not fully implemented. Use Gmail or mock data.');
  }
  
  async searchEmails(query: string, options?: { limit?: number }): Promise<EmailMessage[]> {
    // Implementation would be similar to Gmail but using Microsoft Graph API
    throw new Error('Outlook provider not fully implemented. Use Gmail or mock data.');
  }
}