import { supabase } from '../lib/supabase';
import { EmailService } from './EmailService';
import { ActivityLogService } from './ActivityLogService';

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id?: string;
  user_id?: string;
  organization_id?: string;
  client_id?: string;
  project_id?: string;
  invoice_number?: string;
  source_estimate_id?: string;
  status: 'draft' | 'sent' | 'opened' | 'paid' | 'overdue' | 'signed';
  issue_date: string;
  due_date: string;
  amount: number; // Match database schema
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  notes?: string;
  terms?: string;
  sent_at?: string;
  last_sent_at?: string;
  send_count?: number;
  email_opened_at?: string;
  total_paid?: number;
  balance_due?: number;
  created_at?: string;
  updated_at?: string;
  invoice_items?: InvoiceItem[];
  client?: {
    name: string;
    email: string;
    company_name?: string;
    address?: string;
    phone?: string;
  };
  user?: {
    id: string;
    email?: string;
    company_name?: string;
    phone?: string;
  };
}

export class InvoiceService {
  /**
   * List all invoices for an organization
   */
  static async list(organizationId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
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
   * Get a single invoice by ID with items
   */
  static async getById(id: string): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(
          name,
          email,
          company_name,
          address,
          phone
        ),
        invoice_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Create a new invoice
   */
  static async create(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'invoice_number'> & { 
    organization_id: string;
    invoice_items?: InvoiceItem[] 
  }): Promise<Invoice> {
    const { invoice_items, ...invoiceData } = invoice;

    // Generate invoice number
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNumber = `INV-${year}-${timestamp}`;

    // Create the invoice - map fields to match database schema
    // Ensure due_date is a proper timestamp
    const dueDateTimestamp = new Date(invoiceData.due_date + 'T00:00:00Z').toISOString();
    
    const invoiceToInsert = {
      user_id: invoiceData.user_id,
      organization_id: invoiceData.organization_id,
      client_id: invoiceData.client_id,
      project_id: invoiceData.project_id || null,
      invoice_number: invoiceNumber,
      status: invoiceData.status || 'draft',
      issue_date: invoiceData.issue_date,
      due_date: dueDateTimestamp,
      amount: invoiceData.amount || 0,
      subtotal: invoiceData.subtotal || invoiceData.amount || 0,
      tax_rate: invoiceData.tax_rate || 0,
      tax_amount: invoiceData.tax_amount || 0,
      notes: invoiceData.notes || '',
      terms: invoiceData.terms || 'Net 30'
    };
    
    console.log('Inserting invoice with data:', invoiceToInsert);
    
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceToInsert)
      .select()
      .single();

    if (invoiceError) {
      throw invoiceError;
    }

    // Add items if provided
    if (invoice_items && invoice_items.length > 0) {
      const itemsData = invoice_items.map(item => ({
        ...item,
        invoice_id: newInvoice.id
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsData);

      if (itemsError) {
        throw itemsError;
      }
    }

    // Log the activity
    await ActivityLogService.log({
      organizationId: invoice.organization_id,
      entityType: 'invoice',
      entityId: newInvoice.id,
      action: 'created',
      description: ActivityLogService.buildDescription(
        'created',
        'invoice',
        newInvoice.invoice_number,
        `for ${invoice.amount}`
      ),
      metadata: {
        clientId: invoice.client_id,
        amount: invoice.amount,
        status: invoice.status
      }
    });

    // Return the complete invoice
    return this.getById(newInvoice.id);
  }

  /**
   * Update an existing invoice
   */
  static async update(id: string, invoice: Partial<Invoice> & { invoice_items?: InvoiceItem[] }): Promise<Invoice> {
    const { invoice_items, ...invoiceData } = invoice;

    // Update the invoice
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', id);

    if (invoiceError) {
      throw invoiceError;
    }

    // Update items if provided
    if (invoice_items !== undefined) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Insert new items
      if (invoice_items.length > 0) {
        const itemsData = invoice_items.map(item => ({
          ...item,
          invoice_id: id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsData);

        if (itemsError) {
          throw itemsError;
        }
      }
    }

    // Log the activity
    const updatedInvoice = await this.getById(id);
    await ActivityLogService.log({
      organizationId: updatedInvoice.organization_id!,
      entityType: 'invoice',
      entityId: id,
      action: 'updated',
      description: ActivityLogService.buildDescription(
        'updated',
        'invoice',
        updatedInvoice.invoice_number!
      ),
      metadata: {
        changes: invoiceData
      }
    });

    // Return the updated invoice
    return updatedInvoice;
  }

  /**
   * Update invoice status
   */
  static async updateStatus(id: string, status: Invoice['status']): Promise<void> {
    // Get invoice details for logging
    const invoice = await this.getById(id);
    
    const { error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log the activity
    await ActivityLogService.log({
      organizationId: invoice.organization_id!,
      entityType: 'invoice',
      entityId: id,
      action: 'status_changed',
      description: ActivityLogService.buildDescription(
        'status_changed',
        'invoice',
        invoice.invoice_number!,
        `to ${status}`
      ),
      metadata: {
        oldStatus: invoice.status,
        newStatus: status
      }
    });
  }

  /**
   * Send invoice via email
   */
  static async sendInvoice(
    invoiceId: string, 
    recipientEmail: string,
    options?: {
      message?: string;
      ccEmails?: string[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the invoice with client details
      const invoice = await this.getById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (!invoice.client) {
        throw new Error('Invoice has no client assigned');
      }

      // Get user details for the from address
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        invoice.user = {
          id: userData.user.id,
          email: userData.user.email,
          // Get additional user/company details if stored in profile
        };
      }

      // Send the email
      const result = await EmailService.sendInvoice(
        invoice,
        invoice.client,
        recipientEmail,
        options
      );

      if (result.success) {
        // Update invoice status and tracking fields
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            status: 'sent',
            sent_at: invoice.sent_at || now, // Only set first time
            last_sent_at: now,
            send_count: (invoice.send_count || 0) + 1
          })
          .eq('id', invoiceId);

        if (updateError) {
          console.error('Failed to update invoice status:', updateError);
        }

        // Log the email in email_logs table
        const { error: logError } = await supabase
          .from('email_logs')
          .insert({
            user_id: invoice.user_id,
            organization_id: invoice.organization_id,
            to_email: recipientEmail,
            subject: `Invoice ${invoice.invoice_number}`,
            template_type: 'invoice',
            invoice_id: invoiceId,
            status: 'sent',
            metadata: {
              cc_emails: options?.ccEmails,
              custom_message: options?.message
            }
          });

        if (logError) {
          console.error('Failed to log email:', logError);
        }

        // Log the activity
        await ActivityLogService.log({
          organizationId: invoice.organization_id!,
          entityType: 'invoice',
          entityId: invoiceId,
          action: 'sent',
          description: ActivityLogService.buildDescription(
            'sent',
            'invoice',
            invoice.invoice_number!,
            `to ${recipientEmail}`
          ),
          metadata: {
            recipientEmail,
            ccEmails: options?.ccEmails,
            customMessage: options?.message
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Error sending invoice:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invoice'
      };
    }
  }

  /**
   * Send payment reminder
   */
  static async sendPaymentReminder(invoiceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the invoice with client details
      const invoice = await this.getById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (!invoice.client) {
        throw new Error('Invoice has no client assigned');
      }

      if (!invoice.client.email) {
        throw new Error('Client has no email address');
      }

      // Get user details for the from address
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        invoice.user = {
          id: userData.user.id,
          email: userData.user.email,
          // Get additional user/company details if stored in profile
        };
      }

      // Send the reminder email
      const result = await EmailService.sendPaymentReminder(
        invoice,
        invoice.client,
        invoice.client.email
      );

      if (result.success) {
        // Update last sent timestamp
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            last_sent_at: now,
            send_count: (invoice.send_count || 0) + 1
          })
          .eq('id', invoiceId);

        if (updateError) {
          console.error('Failed to update invoice:', updateError);
        }

        // Log the email
        const { error: logError } = await supabase
          .from('email_logs')
          .insert({
            user_id: invoice.user_id,
            organization_id: invoice.organization_id,
            to_email: invoice.client.email,
            subject: `Payment Reminder: Invoice ${invoice.invoice_number}`,
            template_type: 'payment_reminder',
            invoice_id: invoiceId,
            status: 'sent'
          });

        if (logError) {
          console.error('Failed to log email:', logError);
        }
      }

      return result;
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send payment reminder'
      };
    }
  }

  /**
   * Mark invoice as paid
   */
  static async markAsPaid(id: string): Promise<void> {
    // Get invoice details for logging
    const invoice = await this.getById(id);
    
    const { error } = await supabase
      .from('invoices')
      .update({ 
        status: 'paid',
        total_paid: supabase.raw('amount'),
        balance_due: 0
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log the activity
    await ActivityLogService.log({
      organizationId: invoice.organization_id!,
      entityType: 'invoice',
      entityId: id,
      action: 'paid',
      description: ActivityLogService.buildDescription(
        'paid',
        'invoice',
        invoice.invoice_number!,
        `amount: ${invoice.amount}`
      ),
      metadata: {
        amount: invoice.amount,
        previousStatus: invoice.status
      }
    });
  }

  /**
   * Get invoices by client
   */
  static async getByClient(clientId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
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
   * Get invoices by project
   */
  static async getByProject(projectId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
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
   * Get invoices by status
   */
  static async getByStatus(organizationId: string, status: Invoice['status']): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
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
   * Delete an invoice
   */
  static async delete(id: string): Promise<void> {
    // Get invoice details for logging
    const invoice = await this.getById(id);
    
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log the activity
    await ActivityLogService.log({
      organizationId: invoice.organization_id!,
      entityType: 'invoice',
      entityId: id,
      action: 'deleted',
      description: ActivityLogService.buildDescription(
        'deleted',
        'invoice',
        invoice.invoice_number!
      ),
      metadata: {
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        clientId: invoice.client_id
      }
    });
  }
}