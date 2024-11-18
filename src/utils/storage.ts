import { Client, Product, Invoice, InvoiceTemplate } from '../types';
import { supabase } from '../lib/supabase';

// Initialize local storage with mock data if empty
export function initializeStorage() {
  // This function is now a no-op since we're using Supabase
  console.log('Storage initialized with Supabase');
}

// Clients
export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('company');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

// Products
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Invoices
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

export async function saveInvoices(invoices: Invoice[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('invoices')
      .upsert(invoices);
    if (error) throw error;
  } catch (error) {
    console.error('Error saving invoices:', error);
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .upsert(products);
    if (error) throw error;
  } catch (error) {
    console.error('Error saving products:', error);
  }
}

export async function saveClients(clients: Client[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('clients')
      .upsert(clients);
    if (error) throw error;
  } catch (error) {
    console.error('Error saving clients:', error);
  }
}

// Invoice Templates
export function getInvoiceTemplates(): InvoiceTemplate[] {
  const templates = localStorage.getItem('invoiceTemplates');
  return templates ? JSON.parse(templates) : [];
}

export function saveInvoiceTemplates(templates: InvoiceTemplate[]): void {
  localStorage.setItem('invoiceTemplates', JSON.stringify(templates));
}