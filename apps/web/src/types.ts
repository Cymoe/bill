export interface Client {
  id: string;
  company_name: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

// Line Items (standard items tied to cost codes)
export interface LineItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  cost_code_id: string; // Required - line items must be tied to a cost code
  vendor_id?: string;
  favorite?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
  cost_code?: {
    name: string;
    code: string;
  };
}

// Product Assemblies (bundles made of line items - formerly bundled products)
export interface ProductAssembly {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  base_price: number;
  unit: string;
  industry_id?: string;
  category?: string;
  vendor_id?: string;
  category_id?: string;
  favorite?: boolean;
  status?: string;
  parent_product_id?: string;
  variant_name?: string;
  created_at?: string;
  updated_at?: string;
  line_items?: AssemblyLineItem[];
}

// Junction table for assembly components
export interface AssemblyLineItem {
  id: string;
  assembly_id: string;
  line_item_id: string;
  quantity: number;
  unit?: string;
  price_override?: number;
  display_order?: number;
  is_optional?: boolean;
  created_at?: string;
  updated_at?: string;
  line_item?: LineItem;
}

// Legacy Product interface (for backward compatibility during migration)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  created_at?: string;
}

export interface InvoiceItem {
  product_id?: string; // Legacy - for backward compatibility
  line_item_id?: string; // References line_items table
  assembly_id?: string; // References product_assemblies table
  quantity: number;
  price: number;
  description: string;
}

// Industry classification for organizing business data
export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  number: string;
  client_id: string;
  date: string;
  due_date: string;
  items: InvoiceItem[];
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at?: string;
}