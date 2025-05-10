export interface ClientInput {
  company_name: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  user_id?: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  unit: string;
  user_id?: string;
}

export interface InvoiceInput {
  number: string;
  client_id: string;
  date: string;
  due_date: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  status: "draft" | "sent" | "paid" | "overdue";
  total_amount: number;
  user_id?: string;
}

export interface InvoiceItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface InvoiceTemplateItem {
  id?: string;
  template_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at?: string;
}

export interface TemplateInput {
  name: string;
  description: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
  user_id?: string;
}

export interface ProjectInput {
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  budget: number;
  start_date: string;
  end_date: string;
  client_id: string;
  user_id?: string;
}

export interface DropdownItem {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}