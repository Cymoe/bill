import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './format';
import type { Doc } from "../convex/_generated/dataModel";

interface InvoiceData {
  invoice: Doc<"invoices">;
  client: Doc<"clients">;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount?: number;
}

export const generatePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Company Header (Your Company)
  doc.setFontSize(24);
  doc.setTextColor(66, 66, 66);
  doc.text('InvoiceHub', 20, yPos);
  
  // Your company info (placeholder - you can customize this)
  yPos += 15;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('123 Business Street', 20, yPos);
  yPos += 5;
  doc.text('City, State 12345', 20, yPos);
  yPos += 5;
  doc.text('Phone: (555) 123-4567', 20, yPos);
  yPos += 5;
  doc.text('Email: billing@invoicehub.com', 20, yPos);

  // Invoice Title and Number
  yPos += 20;
  doc.setFontSize(28);
  doc.setTextColor(66, 66, 66);
  doc.text('INVOICE', pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`#${data.invoice.number}`, pageWidth - 20, yPos, { align: 'right' });

  // Status
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(data.invoice.status === 'paid' ? 34 : 66, 
                   data.invoice.status === 'paid' ? 197 : 66,
                   data.invoice.status === 'paid' ? 94 : 66);
  doc.text(data.invoice.status.toUpperCase(), pageWidth - 20, yPos, { align: 'right' });

  // Dates
  yPos += 20;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Issue Date:', pageWidth - 80, yPos);
  doc.setTextColor(66, 66, 66);
  doc.text(new Date(data.invoice.date).toLocaleDateString(), pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setTextColor(128, 128, 128);
  doc.text('Due Date:', pageWidth - 80, yPos);
  doc.setTextColor(66, 66, 66);
  doc.text(new Date(data.invoice.dueDate).toLocaleDateString(), pageWidth - 20, yPos, { align: 'right' });

  // Bill To Section
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(128, 128, 128);
  doc.text('Bill To:', 20, yPos);

  if (data.client) {
    yPos += 10;
    doc.setTextColor(66, 66, 66);
    doc.setFontSize(11);
    doc.text(data.client.company, 20, yPos);
    yPos += 6;
    doc.text(data.client.name, 20, yPos);
    yPos += 6;
    doc.text(data.client.email, 20, yPos);
    
    if (data.client.address) {
      yPos += 6;
      const addressLines = data.client.address.split('\n');
      addressLines.forEach((line: string) => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });
    }
  }

  // Items Table
  yPos += 20;
  const tableData = data.items.map(item => [
    item.product_name,
    item.quantity.toString(),
    formatCurrency(item.price),
    formatCurrency(item.price * item.quantity)
  ]);

  (doc as any).autoTable({
    startY: yPos,
    head: [['Item', 'Quantity', 'Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      textColor: [66, 66, 66],
      cellPadding: 6
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Subtotal
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Subtotal:', pageWidth - 80, finalY);
  doc.setTextColor(66, 66, 66);
  doc.text(formatCurrency(data.totalAmount || data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)), pageWidth - 20, finalY, { align: 'right' });
  
  // Tax
  doc.setTextColor(128, 128, 128);
  doc.text('Tax (0%):', pageWidth - 80, finalY + 8);
  doc.setTextColor(66, 66, 66);
  doc.text(formatCurrency(0), pageWidth - 20, finalY + 8, { align: 'right' });
  
  // Total
  doc.setFontSize(12);
  doc.setTextColor(66, 66, 66);
  doc.text('Total:', pageWidth - 80, finalY + 20);
  doc.setFontSize(14);
  doc.text(formatCurrency(data.totalAmount || data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)), pageWidth - 20, finalY + 20, { align: 'right' });

  // Footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', pageWidth / 2, footerY - 10, { align: 'center' });
  doc.text('Payment is due within 30 days of issue.', pageWidth / 2, footerY - 5, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  doc.save(`invoice-${data.invoice.number}.pdf`);
};