import { supabase } from '../lib/supabase';

export interface EstimateItem {
  id?: string;
  estimate_id?: string;
  work_pack_item_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_code?: string;
  display_order?: number;
}

export interface Estimate {
  id?: string;
  user_id?: string;
  organization_id?: string;
  client_id?: string;
  project_id?: string;
  estimate_number?: string;
  title?: string;
  description?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  issue_date: string;
  expiry_date?: string;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  client_signature?: string;
  signed_at?: string;
  created_at?: string;
  updated_at?: string;
  items?: EstimateItem[];
  client?: {
    name: string;
    email: string;
    company_name?: string;
    address?: string;
    phone?: string;
  };
}

export class EstimateService {
  /**
   * List all estimates for an organization
   */
  static async list(organizationId: string): Promise<Estimate[]> {
    const { data, error } = await supabase
      .from('estimates')
      .select(`
        *,
        client:clients(
          name,
          email,
          company_name,
          address,
          phone
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single estimate by ID with items
   */
  static async getById(id: string): Promise<Estimate> {
    const { data, error } = await supabase
      .from('estimates')
      .select(`
        *,
        client:clients(
          name,
          email,
          company_name,
          address,
          phone
        ),
        items:estimate_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Create a new estimate
   */
  static async create(estimate: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'estimate_number'> & { 
    organization_id: string;
    items?: EstimateItem[] 
  }): Promise<Estimate> {
    const { items, ...estimateData } = estimate;

    // Generate estimate number (fallback if RPC doesn't exist)
    let estimateNumber: string;
    try {
      const { data, error: numberError } = await supabase
        .rpc('generate_estimate_number', { org_id: estimate.organization_id });

      if (numberError) {
        console.warn('RPC function not available, using fallback estimate numbering');
        // Fallback: generate estimate number manually
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        estimateNumber = `EST-${year}-${timestamp}`;
      } else {
        estimateNumber = data;
      }
    } catch (error) {
      console.warn('RPC function not available, using fallback estimate numbering');
      // Fallback: generate estimate number manually
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      estimateNumber = `EST-${year}-${timestamp}`;
    }

    // Create the estimate
    const { data: newEstimate, error: estimateError } = await supabase
      .from('estimates')
      .insert({
        ...estimateData,
        estimate_number: estimateNumber
      })
      .select()
      .single();

    if (estimateError) {
      throw estimateError;
    }

    // Add items if provided
    if (items && items.length > 0) {
      const itemsData = items.map((item, index) => ({
        ...item,
        estimate_id: newEstimate.id,
        display_order: item.display_order ?? index
      }));

      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(itemsData);

      if (itemsError) {
        throw itemsError;
      }
    }

    // Return the complete estimate
    return this.getById(newEstimate.id);
  }

  /**
   * Update an existing estimate
   */
  static async update(id: string, estimate: Partial<Estimate> & { items?: EstimateItem[] }): Promise<Estimate> {
    const { items, ...estimateData } = estimate;

    // Update the estimate
    const { error: estimateError } = await supabase
      .from('estimates')
      .update(estimateData)
      .eq('id', id);

    if (estimateError) {
      throw estimateError;
    }

    // Update items if provided
    if (items !== undefined) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('estimate_items')
        .delete()
        .eq('estimate_id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Insert new items
      if (items.length > 0) {
        const itemsData = items.map((item, index) => ({
          ...item,
          estimate_id: id,
          display_order: item.display_order ?? index
        }));

        const { error: itemsError } = await supabase
          .from('estimate_items')
          .insert(itemsData);

        if (itemsError) {
          throw itemsError;
        }
      }
    }

    // Return the updated estimate
    return this.getById(id);
  }

  /**
   * Delete an estimate
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('estimates')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  /**
   * Add signature to estimate
   */
  static async addSignature(id: string, signature: string): Promise<Estimate> {
    const { error } = await supabase
      .from('estimates')
      .update({
        client_signature: signature,
        signed_at: new Date().toISOString(),
        status: 'accepted'
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return this.getById(id);
  }

  /**
   * Convert estimate to invoice
   */
  static async convertToInvoice(estimateId: string): Promise<string> {
    // Get the estimate with items
    const estimate = await this.getById(estimateId);

    if (!estimate) {
      throw new Error('Estimate not found');
    }

    if (estimate.status !== 'accepted') {
      throw new Error('Estimate must be accepted before converting to invoice');
    }

    // Create invoice data
    const invoiceData = {
      user_id: estimate.user_id,
      organization_id: estimate.organization_id,
      client_id: estimate.client_id,
      project_id: estimate.project_id,
      status: 'draft' as const,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      amount: estimate.total_amount,
      subtotal: estimate.subtotal,
      tax_rate: estimate.tax_rate || 0,
      tax_amount: estimate.tax_amount || 0,
      notes: estimate.notes,
      terms: estimate.terms
    };

    // Create the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      throw invoiceError;
    }

    // Create invoice items from estimate items
    if (estimate.items && estimate.items.length > 0) {
      const invoiceItemsData = estimate.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);

      if (itemsError) {
        throw itemsError;
      }
    }

    return invoice.id;
  }

  /**
   * Get estimates by client
   */
  static async getByClient(clientId: string): Promise<Estimate[]> {
    const { data, error } = await supabase
      .from('estimates')
      .select(`
        *,
        client:clients(
          name,
          email,
          company_name
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get estimates by project
   */
  static async getByProject(projectId: string): Promise<Estimate[]> {
    const { data, error } = await supabase
      .from('estimates')
      .select(`
        *,
        client:clients(
          name,
          email,
          company_name
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Update estimate status
   */
  static async updateStatus(id: string, status: Estimate['status']): Promise<void> {
    const { error } = await supabase
      .from('estimates')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  /**
   * Get estimates by status
   */
  static async getByStatus(organizationId: string, status: Estimate['status']): Promise<Estimate[]> {
    const { data, error } = await supabase
      .from('estimates')
      .select(`
        *,
        client:clients(
          name,
          email,
          company_name
        )
      `)
      .eq('organization_id', organizationId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Create estimate from work pack
   */
  static async createFromWorkPack(data: {
    organization_id: string;
    user_id: string;
    client_id: string;
    project_id?: string;
    title: string;
    description?: string;
    work_pack_id: string;
    work_pack_items: any[];
  }): Promise<Estimate> {
    // Calculate totals from work pack items
    const subtotal = data.work_pack_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax_rate = 0; // Default, can be configured
    const tax_amount = subtotal * (tax_rate / 100);
    const total_amount = subtotal + tax_amount;

    // Create estimate
    const estimate = await this.create({
      organization_id: data.organization_id,
      user_id: data.user_id,
      client_id: data.client_id,
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      subtotal,
      tax_rate,
      tax_amount,
      total_amount,
      items: data.work_pack_items.map((item, index) => ({
        work_pack_item_id: item.id,
        description: item.line_item?.name || item.product?.name || item.description,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        display_order: index
      }))
    });

    return estimate;
  }
}