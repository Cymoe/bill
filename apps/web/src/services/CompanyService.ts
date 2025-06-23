import { supabase } from '../lib/supabase';

export interface Company {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  industry?: string;
  website?: string;
  main_phone?: string;
  main_email?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  tax_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Calculated fields
  clientCount?: number;
  totalValue?: number;
  activeProjects?: number;
}

export interface CompanyWithClients extends Company {
  clients: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    department?: string;
  }>;
}

export interface CompanyFormData {
  name: string;
  industry?: string;
  website?: string;
  main_phone?: string;
  main_email?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  tax_id?: string;
  notes?: string;
}

export const INDUSTRIES = [
  'Healthcare',
  'Education',
  'Retail/Commercial',
  'Real Estate Development',
  'Manufacturing',
  'Hospitality',
  'Government',
  'Non-Profit',
  'Technology',
  'Finance',
  'Construction',
  'Agriculture',
  'Energy',
  'Transportation',
  'Other'
];

export class CompanyService {
  /**
   * Get all companies for the organization
   */
  static async getCompanies(organizationId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        clients!clients_company_id_fkey(count)
      `)
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;
    
    return (data || []).map(company => ({
      ...company,
      clientCount: company.clients?.[0]?.count || 0
    }));
  }

  /**
   * Get a single company with all its clients
   */
  static async getCompanyWithClients(companyId: string): Promise<CompanyWithClients | null> {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        clients!clients_company_id_fkey(
          id,
          name,
          email,
          phone,
          role,
          department
        )
      `)
      .eq('id', companyId)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      clients: data.clients || []
    };
  }

  /**
   * Create a new company
   */
  static async createCompany(userId: string, organizationId: string, companyData: CompanyFormData): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        ...companyData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a company
   */
  static async updateCompany(companyId: string, companyData: Partial<CompanyFormData>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update({
        ...companyData,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a company (and optionally its clients)
   */
  static async deleteCompany(companyId: string, deleteClients: boolean = false): Promise<void> {
    if (deleteClients) {
      // Delete all clients first
      const { error: clientsError } = await supabase
        .from('clients')
        .delete()
        .eq('company_id', companyId);
      
      if (clientsError) throw clientsError;
    } else {
      // Unlink clients from company
      const { error: unlinkError } = await supabase
        .from('clients')
        .update({ company_id: null })
        .eq('company_id', companyId);
      
      if (unlinkError) throw unlinkError;
    }

    // Delete the company
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) throw error;
  }

  /**
   * Link an existing client to a company
   */
  static async linkClientToCompany(clientId: string, companyId: string, role?: string, department?: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update({
        company_id: companyId,
        role: role,
        department: department,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (error) throw error;
  }

  /**
   * Unlink a client from a company
   */
  static async unlinkClientFromCompany(clientId: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update({
        company_id: null,
        role: null,
        department: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (error) throw error;
  }

  /**
   * Get all clients not yet linked to any company
   */
  static async getUnlinkedClients(organizationId: string): Promise<Array<{id: string, name: string, email: string}>> {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('organization_id', organizationId)
      .is('company_id', null)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Search companies by name
   */
  static async searchCompanies(organizationId: string, searchTerm: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('organization_id', organizationId)
      .ilike('name', `%${searchTerm}%`)
      .order('name')
      .limit(10);

    if (error) throw error;
    return data || [];
  }
} 