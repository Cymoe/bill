/**
 * QuickBooks Integration Service
 * Provides integration with QuickBooks to import clients and financial data
 */

import { ClientImportService } from './ClientImportService';
import { Client } from './ClientService';

export interface QuickBooksCustomer {
  Id: string;
  DisplayName: string;
  CompanyName?: string;
  GivenName?: string;
  FamilyName?: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  PrimaryPhone?: {
    FreeFormNumber: string;
  };
  Mobile?: {
    FreeFormNumber: string;
  };
  BillAddr?: {
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string; // State
    PostalCode?: string;
  };
  ShipAddr?: {
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
  Active: boolean;
  Balance?: number;
  Job?: boolean;
  BillWithParent?: boolean;
  ParentRef?: {
    value: string;
    name: string;
  };
  Notes?: string;
  WebAddr?: {
    URI: string;
  };
}

export interface QuickBooksAuth {
  accessToken: string;
  refreshToken: string;
  companyId: string;
  expiresAt: Date;
}

export class QuickBooksIntegrationService {
  private static auth: QuickBooksAuth | null = null;
  private static readonly baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company'; // Use production URL in production
  
  /**
   * Connect to QuickBooks
   */
  static async connect(auth: QuickBooksAuth) {
    this.auth = auth;
    
    // Verify connection
    const response = await this.makeRequest('/companyinfo/' + auth.companyId);
    if (!response.ok) {
      throw new Error('Failed to connect to QuickBooks');
    }
  }
  
  /**
   * Disconnect from QuickBooks
   */
  static disconnect() {
    this.auth = null;
  }
  
  /**
   * Import customers from QuickBooks
   */
  static async importCustomers(options?: {
    activeOnly?: boolean;
    limit?: number;
    includeJobs?: boolean;
  }): Promise<Client[]> {
    if (!this.auth) {
      // Return mock data for demo
      return this.getMockQuickBooksCustomers();
    }
    
    try {
      // Build query
      const conditions: string[] = [];
      if (options?.activeOnly) {
        conditions.push("Active = true");
      }
      if (!options?.includeJobs) {
        conditions.push("Job = false");
      }
      
      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
      const limitClause = options?.limit ? ` MAXRESULTS ${options.limit}` : '';
      const query = `SELECT * FROM Customer${whereClause}${limitClause}`;
      
      const response = await this.makeRequest(`/query?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch QuickBooks customers');
      }
      
      const data = await response.json();
      return this.convertQuickBooksCustomersToClients(data.QueryResponse?.Customer || []);
    } catch (error) {
      console.error('Error importing from QuickBooks:', error);
      return [];
    }
  }
  
  /**
   * Search customers in QuickBooks
   */
  static async searchCustomers(searchTerm: string): Promise<Client[]> {
    if (!this.auth) {
      // Return filtered mock data for demo
      return this.getMockQuickBooksCustomers().filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    try {
      const query = `SELECT * FROM Customer WHERE DisplayName LIKE '%${searchTerm}%' OR CompanyName LIKE '%${searchTerm}%'`;
      
      const response = await this.makeRequest(`/query?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search QuickBooks customers');
      }
      
      const data = await response.json();
      return this.convertQuickBooksCustomersToClients(data.QueryResponse?.Customer || []);
    } catch (error) {
      console.error('Error searching QuickBooks:', error);
      return [];
    }
  }
  
  /**
   * Get customer details with recent transactions
   */
  static async getCustomerWithTransactions(customerId: string): Promise<{
    customer: Client;
    totalRevenue: number;
    invoiceCount: number;
    lastInvoiceDate?: Date;
  } | null> {
    if (!this.auth) {
      return null;
    }
    
    try {
      // Get customer details
      const customerResponse = await this.makeRequest(`/customer/${customerId}`);
      if (!customerResponse.ok) return null;
      
      const customerData = await customerResponse.json();
      const customer = this.convertQuickBooksCustomerToClient(customerData.Customer);
      
      // Get invoices for this customer
      const invoiceQuery = `SELECT * FROM Invoice WHERE CustomerRef = '${customerId}'`;
      const invoiceResponse = await this.makeRequest(`/query?query=${encodeURIComponent(invoiceQuery)}`);
      
      if (!invoiceResponse.ok) {
        return {
          customer,
          totalRevenue: 0,
          invoiceCount: 0
        };
      }
      
      const invoiceData = await invoiceResponse.json();
      const invoices = invoiceData.QueryResponse?.Invoice || [];
      
      const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.TotalAmt || 0), 0);
      const lastInvoice = invoices.sort((a: any, b: any) => 
        new Date(b.TxnDate).getTime() - new Date(a.TxnDate).getTime()
      )[0];
      
      return {
        customer,
        totalRevenue,
        invoiceCount: invoices.length,
        lastInvoiceDate: lastInvoice ? new Date(lastInvoice.TxnDate) : undefined
      };
    } catch (error) {
      console.error('Error getting customer details:', error);
      return null;
    }
  }
  
  /**
   * Make authenticated request to QuickBooks API
   */
  private static async makeRequest(endpoint: string, options?: RequestInit): Promise<Response> {
    if (!this.auth) {
      throw new Error('Not connected to QuickBooks');
    }
    
    // Check if token is expired
    if (new Date() >= this.auth.expiresAt) {
      // In production, implement token refresh logic here
      throw new Error('QuickBooks token expired');
    }
    
    const url = `${this.baseUrl}/${this.auth.companyId}${endpoint}`;
    
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.auth.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }
  
  /**
   * Convert QuickBooks customers to our Client format
   */
  private static convertQuickBooksCustomersToClients(customers: QuickBooksCustomer[]): Client[] {
    return customers.map(customer => this.convertQuickBooksCustomerToClient(customer));
  }
  
  /**
   * Convert a single QuickBooks customer to Client format
   */
  private static convertQuickBooksCustomerToClient(customer: QuickBooksCustomer): Client {
    // Use billing address if available, otherwise shipping address
    const address = customer.BillAddr || customer.ShipAddr;
    
    // Construct full name
    let name = customer.DisplayName;
    if (!name && (customer.GivenName || customer.FamilyName)) {
      name = [customer.GivenName, customer.FamilyName].filter(Boolean).join(' ');
    }
    
    // Prefer mobile over primary phone
    const phone = customer.Mobile?.FreeFormNumber || customer.PrimaryPhone?.FreeFormNumber;
    
    return {
      name: name || 'Unnamed Customer',
      company_name: customer.CompanyName,
      email: customer.PrimaryEmailAddr?.Address,
      phone: phone,
      address: address?.Line1,
      city: address?.City,
      state: address?.CountrySubDivisionCode,
      zip: address?.PostalCode,
      website: customer.WebAddr?.URI,
      notes: customer.Notes,
      user_id: '',
      organization_id: ''
    };
  }
  
  /**
   * Get mock QuickBooks customers for demo
   */
  private static getMockQuickBooksCustomers(): Client[] {
    return [
      {
        name: 'Thomas Anderson',
        company_name: 'Anderson Construction LLC',
        email: 'thomas@andersonconstruction.com',
        phone: '(555) 567-8901',
        address: '321 Builder Ave',
        city: 'Denver',
        state: 'CO',
        zip: '80210',
        website: 'www.andersonconstruction.com',
        notes: 'Premium client - Large commercial projects',
        user_id: '',
        organization_id: ''
      },
      {
        name: 'Patricia Williams',
        company_name: 'Williams Home Renovation',
        email: 'patricia@williamshomereno.com',
        phone: '(555) 678-9012',
        address: '654 Renovation Rd',
        city: 'Boulder',
        state: 'CO',
        zip: '80301',
        notes: 'Specializes in kitchen and bathroom remodels',
        user_id: '',
        organization_id: ''
      },
      {
        name: 'Richard Brown',
        company_name: 'Brown Property Management',
        email: 'richard@brownpm.com',
        phone: '(555) 789-0123',
        address: '987 Property Lane',
        city: 'Fort Collins',
        state: 'CO',
        zip: '80521',
        website: 'www.brownpm.com',
        notes: 'Manages 50+ rental properties',
        user_id: '',
        organization_id: ''
      },
      {
        name: 'Jennifer Davis',
        company_name: 'Davis Design Build',
        email: 'jennifer@davisdesignbuild.com',
        phone: '(555) 890-1234',
        address: '147 Design Street',
        city: 'Aspen',
        state: 'CO',
        zip: '81611',
        notes: 'High-end residential projects',
        user_id: '',
        organization_id: ''
      },
      {
        name: 'Christopher Wilson',
        company_name: 'Wilson Commercial Services',
        email: 'chris@wilsoncommercial.com',
        phone: '(555) 901-2345',
        address: '258 Commercial Blvd',
        city: 'Colorado Springs',
        state: 'CO',
        zip: '80903',
        website: 'www.wilsoncommercial.com',
        user_id: '',
        organization_id: ''
      }
    ];
  }
  
  /**
   * Get QuickBooks OAuth URL for authorization
   */
  static getAuthorizationUrl(clientId: string, redirectUri: string, state: string): string {
    const scope = 'com.intuit.quickbooks.accounting';
    const responseType = 'code';
    
    const params = new URLSearchParams({
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      response_type: responseType,
      state
    });
    
    return `https://appcenter.intuit.com/connect/oauth2?${params}`;
  }
  
  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<QuickBooksAuth> {
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }
    
    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      companyId: data.realmId,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    };
  }
}