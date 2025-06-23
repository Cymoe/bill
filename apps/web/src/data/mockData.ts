import { Client, Product, Invoice } from '../types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@techcorp.com',
    company: 'TechCorp',
    address: '123 Tech Street, SF, CA 94105'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@designco.com',
    company: 'DesignCo',
    address: '456 Design Ave, NY, NY 10001'
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Website Design',
    description: 'Professional website design service',
    price: 2500,
    unit: 'project'
  },
  {
    id: '2',
    name: 'SEO Optimization',
    description: 'Monthly SEO optimization service',
    price: 800,
    unit: 'month'
  },
  {
    id: '3',
    name: 'Content Writing',
    description: 'Professional content writing service',
    price: 120,
    unit: 'article'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    clientId: '1',
    number: 'INV-001',
    date: '2024-03-15',
    dueDate: '2024-03-30',
    items: [],
    status: 'sent'
  },
  {
    id: '2',
    clientId: '2',
    number: 'INV-002',
    date: '2024-03-14',
    dueDate: '2024-03-29',
    items: [],
    status: 'paid'
  }
];