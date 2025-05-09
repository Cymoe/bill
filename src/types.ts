export interface Client {
  id: string;
  company_name: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  created_at?: string;
}

export interface InvoiceItem {
  product_id: string;
  quantity: number;
  price: number;
  description: string;
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