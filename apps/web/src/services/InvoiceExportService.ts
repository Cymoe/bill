import { supabase } from '../lib/supabase';
import { Invoice, InvoiceItem } from './InvoiceService';
import { ActivityLogService } from './ActivityLogService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface InvoiceExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'quickbooks';
  invoiceIds?: string[];
  dateRange?: { start: Date; end: Date };
  status?: string[];
  includePayments?: boolean;
  includeLineItems?: boolean;
  organizationId: string;
}


export class InvoiceExportService {
  /**
   * Export invoices to various formats
   */
  static async export(options: InvoiceExportOptions): Promise<void> {
    const invoices = await this.getInvoicesToExport(options);
    
    if (invoices.length === 0) {
      throw new Error('No invoices found to export');
    }
    
    switch (options.format) {
      case 'pdf':
        // PDF export is handled separately for individual invoices
        throw new Error('Bulk PDF export not supported. Use exportInvoiceToPDF for individual invoices.');
        break;
      case 'csv':
        await this.exportToCSV(invoices, options);
        break;
      case 'excel':
        await this.exportToExcel(invoices, options);
        break;
      case 'quickbooks':
        await this.exportToQuickBooks(invoices, options);
        break;
    }
    
    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: options.organizationId,
        entityType: 'invoice',
        action: 'exported',
        description: `exported ${invoices.length} invoices to ${options.format.toUpperCase()}`,
        metadata: {
          format: options.format,
          count: invoices.length,
          includePayments: options.includePayments,
          includeLineItems: options.includeLineItems
        }
      });
    } catch (error) {
      console.error('Failed to log export activity:', error);
    }
  }

  /**
   * Export a single invoice to PDF
   */
  static async exportInvoiceToPDF(invoiceId: string, organizationId: string): Promise<void> {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) throw error || new Error('Invoice not found');

    const pdf = new jsPDF();
    let yPosition = 20;

    // Header
    pdf.setFontSize(24);
    pdf.text('INVOICE', 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Invoice details
    pdf.setFontSize(12);
    pdf.text(`Invoice #: ${invoice.invoice_number}`, 20, yPosition);
    pdf.text(`Date: ${format(new Date(invoice.issue_date), 'MMM dd, yyyy')}`, 120, yPosition);
    yPosition += 8;
    
    pdf.text(`Due Date: ${format(new Date(invoice.due_date), 'MMM dd, yyyy')}`, 120, yPosition);
    yPosition += 8;
    
    pdf.text(`Status: ${invoice.status.toUpperCase()}`, 120, yPosition);
    yPosition += 15;

    // Client info
    pdf.setFontSize(14);
    pdf.text('Bill To:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(12);
    if (invoice.client) {
      pdf.text(invoice.client.name || '', 20, yPosition);
      yPosition += 6;
      if (invoice.client.company_name) {
        pdf.text(invoice.client.company_name, 20, yPosition);
        yPosition += 6;
      }
      if (invoice.client.email) {
        pdf.text(invoice.client.email, 20, yPosition);
        yPosition += 6;
      }
      if (invoice.client.address) {
        const addressLines = invoice.client.address.split('\n');
        addressLines.forEach(line => {
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        });
      }
    }
    yPosition += 10;

    // Items table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, 170, 8, 'F');
    pdf.setFontSize(11);
    pdf.text('Description', 22, yPosition + 6);
    pdf.text('Qty', 110, yPosition + 6);
    pdf.text('Price', 130, yPosition + 6);
    pdf.text('Total', 160, yPosition + 6);
    yPosition += 12;

    // Items
    pdf.setFontSize(10);
    let subtotal = 0;
    invoice.invoice_items?.forEach((item: any) => {
      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;
      
      // Handle long descriptions
      const description = item.description || '';
      const descLines = pdf.splitTextToSize(description, 80);
      
      descLines.forEach((line: string, index: number) => {
        if (index === 0) {
          pdf.text(line, 22, yPosition);
          pdf.text(item.quantity.toString(), 110, yPosition);
          pdf.text(`$${item.unit_price.toFixed(2)}`, 130, yPosition);
          pdf.text(`$${itemTotal.toFixed(2)}`, 160, yPosition);
        } else {
          pdf.text(line, 22, yPosition);
        }
        yPosition += 6;
      });
      
      yPosition += 2;
    });

    // Totals
    yPosition += 10;
    pdf.line(100, yPosition, 190, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(11);
    pdf.text('Subtotal:', 130, yPosition);
    pdf.text(`$${subtotal.toFixed(2)}`, 160, yPosition);
    yPosition += 8;

    if (invoice.tax_amount && invoice.tax_amount > 0) {
      pdf.text(`Tax (${invoice.tax_rate}%):`, 130, yPosition);
      pdf.text(`$${invoice.tax_amount.toFixed(2)}`, 160, yPosition);
      yPosition += 8;
    }

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Total:', 130, yPosition);
    pdf.text(`$${invoice.amount.toFixed(2)}`, 160, yPosition);
    pdf.setFont(undefined, 'normal');
    yPosition += 15;

    // Notes
    if (invoice.notes) {
      pdf.setFontSize(11);
      pdf.text('Notes:', 20, yPosition);
      yPosition += 6;
      pdf.setFontSize(10);
      const noteLines = pdf.splitTextToSize(invoice.notes, 170);
      noteLines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
    }

    // Save PDF
    pdf.save(`invoice_${invoice.invoice_number}.pdf`);

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'invoice',
      entityId: invoiceId,
      action: 'downloaded',
      description: `downloaded invoice ${invoice.invoice_number} as PDF`,
      metadata: {
        invoice_number: invoice.invoice_number,
        format: 'pdf'
      }
    });
  }

  /**
   * Get invoices based on export options
   */
  private static async getInvoicesToExport(options: InvoiceExportOptions): Promise<any[]> {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*),
        payments:invoice_payments(*)
      `)
      .eq('organization_id', options.organizationId);

    // Apply filters
    if (options.invoiceIds && options.invoiceIds.length > 0) {
      query = query.in('id', options.invoiceIds);
    }

    if (options.dateRange) {
      query = query
        .gte('issue_date', options.dateRange.start.toISOString())
        .lte('issue_date', options.dateRange.end.toISOString());
    }

    if (options.status && options.status.length > 0) {
      query = query.in('status', options.status);
    }

    const { data, error } = await query.order('invoice_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Export invoices to CSV
   */
  private static async exportToCSV(invoices: any[], options: InvoiceExportOptions): Promise<void> {
    const headers = [
      'Invoice Number',
      'Issue Date',
      'Due Date',
      'Status',
      'Client Name',
      'Client Email',
      'Client Company',
      'Subtotal',
      'Tax Rate',
      'Tax Amount',
      'Total Amount',
      'Balance Due',
      'Notes'
    ];

    if (options.includePayments) {
      headers.push('Total Paid', 'Payment Count', 'Last Payment Date');
    }

    const rows = invoices.map(invoice => {
      const row = [
        invoice.invoice_number || '',
        format(new Date(invoice.issue_date), 'yyyy-MM-dd'),
        format(new Date(invoice.due_date), 'yyyy-MM-dd'),
        invoice.status,
        invoice.client?.name || '',
        invoice.client?.email || '',
        invoice.client?.company_name || '',
        invoice.subtotal?.toFixed(2) || '0.00',
        invoice.tax_rate?.toString() || '0',
        invoice.tax_amount?.toFixed(2) || '0.00',
        invoice.amount?.toFixed(2) || '0.00',
        invoice.balance_due?.toFixed(2) || invoice.amount?.toFixed(2) || '0.00',
        invoice.notes || ''
      ];

      if (options.includePayments && invoice.payments) {
        const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        const lastPayment = invoice.payments
          .sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0];
        
        row.push(
          totalPaid.toFixed(2),
          invoice.payments.length.toString(),
          lastPayment ? format(new Date(lastPayment.payment_date), 'yyyy-MM-dd') : ''
        );
      }

      return row;
    });

    // Add line items if requested
    if (options.includeLineItems) {
      // Add empty row, then line items header and data
      rows.push(['']);
      rows.push(['Line Items Detail:']);
      rows.push(['Invoice Number', 'Description', 'Quantity', 'Unit Price', 'Total']);
      
      invoices.forEach(invoice => {
        invoice.invoice_items?.forEach((item: any) => {
          rows.push([
            invoice.invoice_number,
            item.description,
            item.quantity.toString(),
            item.unit_price.toFixed(2),
            (item.quantity * item.unit_price).toFixed(2)
          ]);
        });
      });
    }

    // Convert to CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export invoices to Excel
   */
  private static async exportToExcel(invoices: any[], options: InvoiceExportOptions): Promise<void> {
    const wb = XLSX.utils.book_new();
    
    // Main invoice data
    const invoiceData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoice_number || '',
      'Issue Date': format(new Date(invoice.issue_date), 'yyyy-MM-dd'),
      'Due Date': format(new Date(invoice.due_date), 'yyyy-MM-dd'),
      'Status': invoice.status,
      'Client Name': invoice.client?.name || '',
      'Client Email': invoice.client?.email || '',
      'Client Company': invoice.client?.company_name || '',
      'Subtotal': invoice.subtotal || 0,
      'Tax Rate': invoice.tax_rate || 0,
      'Tax Amount': invoice.tax_amount || 0,
      'Total Amount': invoice.amount || 0,
      'Balance Due': invoice.balance_due || invoice.amount || 0,
      'Notes': invoice.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(invoiceData);
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');

    // Line items sheet
    if (options.includeLineItems) {
      const lineItems: any[] = [];
      invoices.forEach(invoice => {
        invoice.invoice_items?.forEach((item: any) => {
          lineItems.push({
            'Invoice Number': invoice.invoice_number,
            'Description': item.description,
            'Quantity': item.quantity,
            'Unit Price': item.unit_price,
            'Total': item.quantity * item.unit_price
          });
        });
      });

      if (lineItems.length > 0) {
        const wsItems = XLSX.utils.json_to_sheet(lineItems);
        XLSX.utils.book_append_sheet(wb, wsItems, 'Line Items');
      }
    }

    // Payments sheet
    if (options.includePayments) {
      const payments: any[] = [];
      invoices.forEach(invoice => {
        invoice.payments?.forEach((payment: any) => {
          payments.push({
            'Invoice Number': invoice.invoice_number,
            'Payment Date': format(new Date(payment.payment_date), 'yyyy-MM-dd'),
            'Amount': payment.amount,
            'Payment Method': payment.payment_method || 'Unknown',
            'Reference': payment.reference || ''
          });
        });
      });

      if (payments.length > 0) {
        const wsPayments = XLSX.utils.json_to_sheet(payments);
        XLSX.utils.book_append_sheet(wb, wsPayments, 'Payments');
      }
    }

    // Summary sheet
    const summary = [{
      'Export Date': format(new Date(), 'yyyy-MM-dd HH:mm'),
      'Total Invoices': invoices.length,
      'Total Amount': invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      'Total Paid': invoices.reduce((sum, inv) => sum + (inv.total_paid || 0), 0),
      'Total Outstanding': invoices.reduce((sum, inv) => sum + (inv.balance_due || inv.amount || 0), 0),
      'Draft': invoices.filter(inv => inv.status === 'draft').length,
      'Sent': invoices.filter(inv => inv.status === 'sent').length,
      'Paid': invoices.filter(inv => inv.status === 'paid').length,
      'Overdue': invoices.filter(inv => inv.status === 'overdue').length
    }];

    const wsSummary = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Save file
    XLSX.writeFile(wb, `invoices_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`);
  }

  /**
   * Export to QuickBooks IIF format
   */
  private static async exportToQuickBooks(invoices: any[], options: InvoiceExportOptions): Promise<void> {
    const lines: string[] = [];
    
    // Header
    lines.push('!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
    lines.push('!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
    lines.push('!ENDTRNS');

    // Transactions
    invoices.forEach(invoice => {
      const date = format(new Date(invoice.issue_date), 'MM/dd/yyyy');
      const clientName = invoice.client?.company_name || invoice.client?.name || 'Unknown';
      
      // Transaction header
      lines.push(`TRNS\tINVOICE\t${date}\tAccounts Receivable\t${clientName}\t\t${invoice.amount}\t${invoice.invoice_number}\t`);
      
      // Split lines for items
      invoice.invoice_items?.forEach((item: any) => {
        const itemAmount = -(item.quantity * item.unit_price);
        lines.push(`SPL\tINVOICE\t${date}\tSales\t${clientName}\t\t${itemAmount}\t${invoice.invoice_number}\t${item.description}`);
      });
      
      // Tax line if applicable
      if (invoice.tax_amount && invoice.tax_amount > 0) {
        lines.push(`SPL\tINVOICE\t${date}\tSales Tax Payable\t${clientName}\t\t${-invoice.tax_amount}\t${invoice.invoice_number}\tSales Tax`);
      }
      
      lines.push('ENDTRNS');
    });

    // Download
    const iif = lines.join('\n');
    const blob = new Blob([iif], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_quickbooks_${format(new Date(), 'yyyy-MM-dd')}.iif`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}