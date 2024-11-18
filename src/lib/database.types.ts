import { Doc, Id } from "../../convex/_generated/dataModel";

export interface ClientInput {
  company: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  unit: string;
}

export interface InvoiceInput {
  number: string;
  clientId: Id<"clients">;
  date: string;
  dueDate: string;
  items: Array<{
    productId: Id<"products">;
    quantity: number;
    price: number;
  }>;
  status: "draft" | "sent" | "paid" | "overdue";
  total_amount: number;
}

export interface InvoiceItem {
  productId: Id<"products">;
  quantity: number;
  price: number;
}

export interface TemplateInput {
  name: string;
  description: string;
  items: Array<{
    productId: Id<"products">;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
}

export interface DropdownItem {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}