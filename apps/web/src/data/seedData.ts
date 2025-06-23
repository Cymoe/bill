import { Tables } from "../lib/database";

type ProjectInput = Omit<Tables['projects'], 'id' | 'created_at' | 'updated_at' | 'user_id'>;
type ClientInput = Omit<Tables['clients'], 'id' | 'created_at'>;
type ProductInput = Omit<Tables['products'], 'id' | 'created_at'>;
type InvoiceInput = Omit<Tables['invoices'], 'id' | 'created_at'>;

export const seedProjects: ProjectInput[] = [
  {
    name: "Website Redesign",
    description: "Complete redesign of company website with modern UI/UX",
    status: "active",
    budget: 15000,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: ""
  },
  {
    name: "Mobile App Development",
    description: "Native mobile app development for iOS and Android",
    status: "on-hold",
    budget: 25000,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    client_id: ""
  },
  {
    name: "E-commerce Platform",
    description: "Custom e-commerce solution with payment integration",
    status: "completed",
    budget: 20000,
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
    client_id: ""
  }
];

export const seedClients: ClientInput[] = [
  {
    company_name: "Acme Corp",
    name: "John Doe",
    email: "john@acme.com",
    phone: "555-0123",
    address: "1560 Broadway, Denver, CO 80202",
    user_id: ""
  },
  {
    company_name: 'TechStart Inc',
    name: 'Sarah Johnson',
    email: 'accounts@techstart.com',
    phone: '(555) 987-6543',
    address: '3000 E 1st Ave, Denver, CO 80206',
    user_id: ""
  },
  {
    company_name: 'Global Solutions Ltd',
    name: 'Michael Chen',
    email: 'finance@globalsolutions.com',
    phone: '(555) 246-8135',
    address: '8800 Westminster Blvd, Westminster, CO 80031',
    user_id: ""
  }
];

export const seedProducts: ProductInput[] = [
  {
    name: "Web Development",
    description: "Professional web development services",
    price: 150,
    user_id: ""
  },
  {
    name: 'UI/UX Design',
    description: 'User interface and experience design',
    price: 1500.00,
    user_id: ""
  },
  {
    name: 'Consulting',
    description: 'Technical consulting services',
    price: 150.00,
    user_id: ""
  }
];

export const seedInvoices: InvoiceInput[] = [
  {
    invoice_number: "INV-001",
    client_id: "",
    status: "draft",
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 0,
    user_id: ""
  }
];