import { supabase } from './supabase';

export type Tables = {
  bills: {
    id: string;
    user_id: string;
    amount: number;
    description: string;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue';
    created_at: string;
  };
  users: {
    id: string;
    name: string;
    email: string;
    picture?: string;
    company?: string;
    title?: string;
    phone?: string;
    address?: string;
    bio?: string;
    settings: {
      theme: string;
      emailNotifications: boolean;
      currency: string;
      dateFormat: string;
      timeZone: string;
    };
    created_at: string;
    last_login_at?: string;
    last_updated_at: string;
  };
  clients: {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    company_name: string;
    notes?: string;
    created_at: string;
  };
  invoices: {
    id: string;
    user_id: string;
    client_id: string;
    invoice_number: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    due_date: string;
    total_amount: number;
    created_at: string;
  };
  products: {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    price: number;
    created_at: string;
  };
  invoice_items: {
    id: string;
    invoice_id: string;
    product_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  };
  invoice_templates: {
    id: string;
    user_id: string;
    name: string;
    content: any; // JSONB type
    created_at: string;
  };
};

export const db = {
  users: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    async update(id: string, data: Partial<Tables['users']>) {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    }
  },
  clients: {
    async list(userId: string) {
      const { data, error } = await supabase
        .from('clients')
        .select()
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
    async create(data: Omit<Tables['clients'], 'id' | 'created_at'>) {
      const { error } = await supabase
        .from('clients')
        .insert(data);
      if (error) throw error;
    },
    async update(id: string, data: Partial<Tables['clients']>) {
      const { error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },
  invoices: {
    async list(userId: string) {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name,
            email,
            company
          )
        `)
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name,
            email,
            company,
            address,
            phone
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    async create(data: Omit<Tables['invoices'], 'id' | 'created_at'>) {
      const { error } = await supabase
        .from('invoices')
        .insert(data);
      if (error) throw error;
    },
    async update(id: string, data: Partial<Tables['invoices']>) {
      const { error } = await supabase
        .from('invoices')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },
  products: {
    async list(userId: string) {
      const { data, error } = await supabase
        .from('products')
        .select()
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
    async create(data: Omit<Tables['products'], 'id' | 'created_at'>) {
      const { error } = await supabase
        .from('products')
        .insert(data);
      if (error) throw error;
    },
    async update(id: string, data: Partial<Tables['products']>) {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },
  invoice_items: {
    async list(invoiceId: string) {
      const { data, error } = await supabase
        .from('invoice_items')
        .select(`
          *,
          products (*)
        `)
        .eq('invoice_id', invoiceId);
      if (error) throw error;
      return data;
    },
    async create(data: Omit<Tables['invoice_items'], 'id'>) {
      const { error } = await supabase
        .from('invoice_items')
        .insert(data);
      if (error) throw error;
    },
    async update(id: string, data: Partial<Tables['invoice_items']>) {
      const { error } = await supabase
        .from('invoice_items')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('invoice_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },
  invoice_templates: {
    async list(userId: string) {
      const { data: templates, error: templatesError } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('user_id', userId);
      
      if (templatesError) throw templatesError;

      // Fetch items for each template
      const templatesWithItems = await Promise.all(
        templates.map(async (template) => {
          const { data: items, error: itemsError } = await supabase
            .from('invoice_template_items')
            .select('*')
            .eq('template_id', template.id);
          
          if (itemsError) throw itemsError;
          
          return {
            ...template,
            description: template.content?.description || '',
            total_amount: template.content?.total_amount || 0,
            items: items || []
          };
        })
      );
      
      return templatesWithItems;
    },

    async getById(id: string) {
      const { data: template, error: templateError } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (templateError) throw templateError;

      // Fetch items for the template
      const { data: items, error: itemsError } = await supabase
        .from('invoice_template_items')
        .select('*')
        .eq('template_id', id);
      
      if (itemsError) throw itemsError;
      
      return {
        ...template,
        description: template.content?.description || '',
        total_amount: template.content?.total_amount || 0,
        items: items || []
      };
    },

    async create(data: Omit<Tables['invoice_templates'], 'id' | 'created_at'> & { items: Array<{ product_id: string; quantity: number; price: number }> }) {
      const { items, ...templateData } = data;
      
      // Start a transaction
      const { data: template, error: templateError } = await supabase
        .from('invoice_templates')
        .insert(templateData)
        .select()
        .single();
      
      if (templateError) throw templateError;

      // Insert items
      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_template_items')
          .insert(
            items.map(item => ({
              template_id: template.id,
              ...item
            }))
          );
        
        if (itemsError) throw itemsError;
      }

      return template;
    },

    async update(id: string, data: Partial<Tables['invoice_templates']> & { items?: Array<{ product_id: string; quantity: number; price: number }> }) {
      const { items, ...templateData } = data;
      
      // Update template
      const { error: templateError } = await supabase
        .from('invoice_templates')
        .update({
          ...templateData,
          content: {
            ...templateData.content,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', id);
      
      if (templateError) throw templateError;

      // Update items if provided
      if (items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('invoice_template_items')
          .delete()
          .eq('template_id', id);
        
        if (deleteError) throw deleteError;

        // Insert new items
        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('invoice_template_items')
            .insert(
              items.map(item => ({
                template_id: id,
                ...item
              }))
            );
          
          if (itemsError) throw itemsError;
        }
      }
    },

    async delete(id: string) {
      // Delete template (items will be cascade deleted)
      const { error } = await supabase
        .from('invoice_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  }
};
