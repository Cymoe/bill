import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

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

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'subcontractor',
      entityId: data.id,
      action: 'created',
      description: `created subcontractor ${data.name}`,
      metadata: {
        trade_category: data.trade_category,
        specialty: data.specialty,
        hourly_rate: data.hourly_rate || 'Not specified',
        is_preferred: data.is_preferred,
        company: data.company_name || 'Individual'
      }
    });

    return data;
  }

  /**
   * Update a subcontractor
   */
  static async updateSubcontractor(subcontractorId: string, subcontractorData: Partial<SubcontractorFormData>, organizationId: string): Promise<Subcontractor> {
    // Get current subcontractor for comparison
    const { data: currentSubcontractor, error: fetchError } = await supabase
      .from('subcontractors')
      .select('*')
      .eq('id', subcontractorId)
      .single();

    if (fetchError) throw fetchError;

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

    // Build metadata for what changed
    const metadata: Record<string, any> = {};
    if (subcontractorData.name && subcontractorData.name !== currentSubcontractor.name) {
      metadata.old_name = currentSubcontractor.name;
      metadata.new_name = subcontractorData.name;
    }
    if (subcontractorData.trade_category && subcontractorData.trade_category !== currentSubcontractor.trade_category) {
      metadata.old_trade = currentSubcontractor.trade_category;
      metadata.new_trade = subcontractorData.trade_category;
    }
    if (subcontractorData.hourly_rate !== undefined && subcontractorData.hourly_rate !== currentSubcontractor.hourly_rate) {
      metadata.old_rate = currentSubcontractor.hourly_rate;
      metadata.new_rate = subcontractorData.hourly_rate;
    }
    if (subcontractorData.is_preferred !== undefined && subcontractorData.is_preferred !== currentSubcontractor.is_preferred) {
      metadata.old_preferred = currentSubcontractor.is_preferred;
      metadata.new_preferred = subcontractorData.is_preferred;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'subcontractor',
      entityId: subcontractorId,
      action: 'updated',
      description: `updated subcontractor ${data.name}`,
      metadata
    });

    return data;
  }

  /**
   * Delete a subcontractor
   */
  static async deleteSubcontractor(subcontractorId: string, organizationId: string): Promise<void> {
    // Get subcontractor info before deletion
    const { data: subcontractor, error: fetchError } = await supabase
      .from('subcontractors')
      .select('name, trade_category, specialty, company_name')
      .eq('id', subcontractorId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('subcontractors')
      .delete()
      .eq('id', subcontractorId);

    if (error) throw error;

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'subcontractor',
      entityId: subcontractorId,
      action: 'deleted',
      description: `deleted subcontractor ${subcontractor.name}`,
      metadata: {
        name: subcontractor.name,
        trade_category: subcontractor.trade_category,
        specialty: subcontractor.specialty,
        company: subcontractor.company_name || 'Individual'
      }
    });
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