export interface Client {
  id?: string;
  company_name: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  type: string;
  created_at?: string;
}

export interface Invoice {
  id?: string;
  client_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  total_amount: number;
  created_at?: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id?: string;
  quantity: number;
  price: number;
  created_at?: string;
}

export interface Project {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  client_id: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  budget?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectBill {
  project_id: string;
  bill_id: string;
}

export interface ProjectInvoice {
  project_id: string;
  invoice_id: string;
}