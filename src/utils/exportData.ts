import { Doc } from "../../convex/_generated/dataModel";
import { formatCurrency } from './format';

type Invoice = Doc<"invoices">;
type Client = Doc<"clients">;
type Product = Doc<"products">;

export const exportInvoicesToCSV = (
  invoices: Invoice[],
  clients: Client[],
  products: Product[]
) => {
  // CSV Headers
  const headers = [
    'Invoice Number',
    'Date',
    'Due Date',
    'Status',
    'Client Company',
    'Client Name',
    'Client Email',
    'Items',
    'Total Amount'
  ].join(',');

  // Format each invoice into a CSV row
  const rows = invoices.map(invoice => {
    const client = clients.find(c => c._id === invoice.clientId);
    
    // Format items
    const items = invoice.items.map(item => {
      const product = products.find(p => p._id === item.productId);
      return `${product?.name} (${item.quantity} x ${formatCurrency(item.price)})`;
    }).join('; ');

    return [
      invoice.number,
      new Date(invoice.date).toLocaleDateString(),
      new Date(invoice.dueDate).toLocaleDateString(),
      invoice.status,
      client?.company || '',
      client?.name || '',
      client?.email || '',
      `"${items}"`,
      formatCurrency(invoice.total_amount)
    ].join(',');
  });

  // Combine headers and rows
  const csv = [headers, ...rows].join('\n');

  // Create and download the file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};