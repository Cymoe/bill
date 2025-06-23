import { supabase } from '../lib/supabase';

export interface VendorContact {
  id: string;
  vendor_id: string;
  name: string;
  role?: string;
  title?: string;
  phone?: string;
  email?: string;
  mobile?: string;
  extension?: string;
  department?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorContactFormData {
  name: string;
  role?: string;
  title?: string;
  phone?: string;
  email?: string;
  mobile?: string;
  extension?: string;
  department?: string;
  is_primary?: boolean;
  notes?: string;
}

export const CONTACT_ROLES = [
  'Owner',
  'Sales Manager', 
  'Sales Representative',
  'Account Manager',
  'Project Manager',
  'Customer Service',
  'Technical Support',
  'Billing/Accounts Receivable',
  'Emergency Services',
  'Field Supervisor',
  'Office Manager',
  'Estimator',
  'Service Manager',
  'Dispatcher'
];

export class VendorContactService {
  /**
   * Get all contacts for a vendor
   */
  static async getVendorContacts(vendorId: string): Promise<VendorContact[]> {
    const { data, error } = await supabase
      .from('vendor_contacts')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('is_primary', { ascending: false })
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get the primary contact for a vendor
   */
  static async getPrimaryContact(vendorId: string): Promise<VendorContact | null> {
    const { data, error } = await supabase
      .from('vendor_contacts')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_primary', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data || null;
  }

  /**
   * Create a new vendor contact
   */
  static async createVendorContact(vendorId: string, contactData: VendorContactFormData): Promise<VendorContact> {
    // If this is being set as primary, unset other primary contacts first
    if (contactData.is_primary) {
      await this.unsetPrimaryContact(vendorId);
    }

    const { data, error } = await supabase
      .from('vendor_contacts')
      .insert({
        vendor_id: vendorId,
        ...contactData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a vendor contact
   */
  static async updateVendorContact(contactId: string, contactData: Partial<VendorContactFormData>): Promise<VendorContact> {
    // If this is being set as primary, unset other primary contacts first
    if (contactData.is_primary) {
      const contact = await this.getVendorContact(contactId);
      if (contact) {
        await this.unsetPrimaryContact(contact.vendor_id);
      }
    }

    const { data, error } = await supabase
      .from('vendor_contacts')
      .update({
        ...contactData,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a vendor contact
   */
  static async deleteVendorContact(contactId: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
  }

  /**
   * Get a single vendor contact
   */
  static async getVendorContact(contactId: string): Promise<VendorContact | null> {
    const { data, error } = await supabase
      .from('vendor_contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Set a contact as the primary contact (and unset others)
   */
  static async setPrimaryContact(contactId: string): Promise<void> {
    // Get the contact to find vendor_id
    const contact = await this.getVendorContact(contactId);
    if (!contact) throw new Error('Contact not found');

    // Unset other primary contacts for this vendor
    await this.unsetPrimaryContact(contact.vendor_id);

    // Set this contact as primary
    const { error } = await supabase
      .from('vendor_contacts')
      .update({ 
        is_primary: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId);

    if (error) throw error;
  }

  /**
   * Unset primary contact for a vendor
   */
  static async unsetPrimaryContact(vendorId: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_contacts')
      .update({ 
        is_primary: false,
        updated_at: new Date().toISOString()
      })
      .eq('vendor_id', vendorId)
      .eq('is_primary', true);

    if (error) throw error;
  }

  /**
   * Get contacts by role across all vendors
   */
  static async getContactsByRole(role: string): Promise<VendorContact[]> {
    const { data, error } = await supabase
      .from('vendor_contacts')
      .select(`
        *,
        vendor:vendors(name, category)
      `)
      .eq('role', role)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Search contacts by name or email
   */
  static async searchContacts(searchTerm: string, vendorId?: string): Promise<VendorContact[]> {
    let query = supabase
      .from('vendor_contacts')
      .select(`
        *,
        vendor:vendors(name, category)
      `)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('name')
      .limit(20);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Import contacts from vendor legacy data
   */
  static async importFromVendorData(vendorId: string): Promise<VendorContact | null> {
    // Get vendor's existing contact info
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('contact_name, phone, email')
      .eq('id', vendorId)
      .single();

    if (error || !vendor.contact_name) return null;

    // Create primary contact from vendor data
    const contactData: VendorContactFormData = {
      name: vendor.contact_name,
      phone: vendor.phone,
      email: vendor.email,
      role: 'Primary Contact',
      is_primary: true
    };

    return await this.createVendorContact(vendorId, contactData);
  }
} 