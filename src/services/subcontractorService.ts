import { supabase } from '../lib/supabase';

export interface Subcontractor {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  trade_category: string;
  specialty: string;
  hourly_rate?: number;
  license_number?: string;
  certification_info?: string;
  insurance_info?: string;
  rating?: number;
  is_preferred: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Calculated fields
  totalValue?: number;
  projectCount?: number;
  lastProjectDate?: string;
}

export interface SubcontractorFormData {
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  trade_category: string;
  specialty: string;
  hourly_rate?: number;
  license_number?: string;
  certification_info?: string;
  insurance_info?: string;
  rating?: number;
  is_preferred: boolean;
  notes?: string;
}

export const TRADE_CATEGORIES = [
  'Electrical',
  'Plumbing', 
  'HVAC',
  'Roofing',
  'Flooring',
  'Painting',
  'Drywall',
  'Framing',
  'Concrete',
  'Landscaping',
  'Tile',
  'Cabinet Installation',
  'General Labor',
  'Other'
];

export class SubcontractorService {
  /**
   * Get all subcontractors for the current organization
   */
  static async getSubcontractors(organizationId: string): Promise<Subcontractor[]> {
    const { data, error } = await supabase
      .from('subcontractors')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_preferred', { ascending: false })
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get subcontractors by trade category
   */
  static async getSubcontractorsByTrade(organizationId: string, tradeCategory: string): Promise<Subcontractor[]> {
    const { data, error } = await supabase
      .from('subcontractors')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('trade_category', tradeCategory)
      .order('is_preferred', { ascending: false })
      .order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get preferred subcontractors
   */
  static async getPreferredSubcontractors(organizationId: string): Promise<Subcontractor[]> {
    const { data, error } = await supabase
      .from('subcontractors')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_preferred', true)
      .order('trade_category')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a single subcontractor by ID
   */
  static async getSubcontractor(subcontractorId: string): Promise<Subcontractor | null> {
    const { data, error } = await supabase
      .from('subcontractors')
      .select('*')
      .eq('id', subcontractorId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new subcontractor
   */
  static async createSubcontractor(organizationId: string, userId: string, subcontractorData: SubcontractorFormData): Promise<Subcontractor> {
    const { data, error } = await supabase
      .from('subcontractors')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        ...subcontractorData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a subcontractor
   */
  static async updateSubcontractor(subcontractorId: string, subcontractorData: Partial<SubcontractorFormData>): Promise<Subcontractor> {
    const { data, error } = await supabase
      .from('subcontractors')
      .update({
        ...subcontractorData,
        updated_at: new Date().toISOString()
      })
      .eq('id', subcontractorId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a subcontractor
   */
  static async deleteSubcontractor(subcontractorId: string): Promise<void> {
    const { error } = await supabase
      .from('subcontractors')
      .delete()
      .eq('id', subcontractorId);

    if (error) throw error;
  }

  /**
   * Get subcontractor statistics (mock for now)
   */
  static async getSubcontractorStats(subcontractorId: string): Promise<{
    totalValue: number;
    projectCount: number;
    lastProjectDate?: string;
  }> {
    // For now, return mock stats since we haven't implemented
    // the expense/project tracking for subcontractors yet
    return {
      totalValue: Math.floor(Math.random() * 100000),
      projectCount: Math.floor(Math.random() * 20),
      lastProjectDate: new Date().toISOString()
    };
  }
} 