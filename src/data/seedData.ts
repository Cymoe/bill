import type { Id } from "../../convex/_generated/dataModel";
import { ClientInput, ProductInput, InvoiceInput } from "../lib/database.types";

export const seedClients: ClientInput[] = [
  {
    company: "Acme Corp",
    name: "John Doe",
    email: "john@acme.com",
    phone: "555-0123",
    address: "123 Main St\nCity, ST 12345"
  },
  {
    company: 'TechStart Inc',
    name: 'Sarah Johnson',
    email: 'accounts@techstart.com',
    phone: '(555) 987-6543',
    address: '456 Innovation Blvd'
  },
  {
    company: 'Global Solutions Ltd',
    name: 'Michael Chen',
    email: 'finance@globalsolutions.com',
    phone: '(555) 246-8135',
    address: '789 Enterprise St'
  }
];

export const seedProducts: ProductInput[] = [
  {
    name: "Web Development",
    description: "Professional web development services",
    price: 150,
    unit: "hour"
  },
  {
    name: 'UI/UX Design',
    description: 'User interface and experience design',
    price: 1500.00,
    unit: 'project'
  },
  {
    name: 'Consulting',
    description: 'Technical consulting services',
    price: 150.00,
    unit: 'hour'
  }
];

export const seedInvoices: InvoiceInput[] = [
  {
    number: "INV-001",
    clientId: "" as Id<"clients">,
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [],
    status: "draft",
    total_amount: 0
  }
];