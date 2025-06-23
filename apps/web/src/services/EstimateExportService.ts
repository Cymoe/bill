import { supabase } from '../lib/supabase';
import { Estimate, EstimateItem } from './EstimateService';
import { ActivityLogService } from './ActivityLogService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface EstimateExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  estimateIds?: string[];
  dateRange?: { start: Date; end: Date };
  status?: string[];
  includeItems?: boolean;
  organizationId: string;
}


export class EstimateExportService {
  /**
   * Export estimates to various formats
   */
  static async export(options: EstimateExportOptions): Promise<void> {
    const estimates = await this.getEstimatesToExport(options);
    
    if (estimates.length === 0) {
      throw new Error('No estimates found to export');
    }
    
    switch (options.format) {
      case 'pdf':
        // PDF export is handled separately for individual estimates
        throw new Error('Bulk PDF export not supported. Use exportEstimateToPDF for individual estimates.');
        break;
      case 'csv':
        await this.exportToCSV(estimates, options);
        break;
      case 'excel':
        await this.exportToExcel(estimates, options);
        break;
    }
    
    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: options.organizationId,
        entityType: 'estimate',
        action: 'exported',
        description: `exported ${estimates.length} estimates to ${options.format.toUpperCase()}`,
        metadata: {
          format: options.format,
          count: estimates.length,
          includeItems: options.includeItems
        }
      });
    } catch (error) {
      console.error('Failed to log export activity:', error);
    }
  }

  /**
   * Export a single estimate to PDF
   */
  static async exportEstimateToPDF(estimateId: string, organizationId: string): Promise<void> {
    const { data: estimate, error } = await supabase
      .from('estimates')
      .select(`
        *,
        client:clients(*),
        items:estimate_items(*)
      `)
      .eq('id', estimateId)
      .single();

    if (error || !estimate) throw error || new Error('Estimate not found');

    const pdf = new jsPDF();
    let yPosition = 20;

    // Header
    pdf.setFontSize(24);
    pdf.text('ESTIMATE', 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Estimate details
    pdf.setFontSize(12);
    pdf.text(`Estimate #: ${estimate.estimate_number}`, 20, yPosition);
    pdf.text(`Date: ${format(new Date(estimate.issue_date), 'MMM dd, yyyy')}`, 120, yPosition);
    yPosition += 8;
    
    if (estimate.expiry_date) {
      pdf.text(`Valid Until: ${format(new Date(estimate.expiry_date), 'MMM dd, yyyy')}`, 120, yPosition);
      yPosition += 8;
    }
    
    pdf.text(`Status: ${estimate.status.toUpperCase()}`, 120, yPosition);
    yPosition += 15;

    // Title if exists
    if (estimate.title) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(estimate.title, 20, yPosition);
      pdf.setFont(undefined, 'normal');
      yPosition += 10;
    }

    // Client info
    pdf.setFontSize(14);
    pdf.text('Prepared For:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(12);
    if (estimate.client) {
      pdf.text(estimate.client.name || '', 20, yPosition);
      yPosition += 6;
      if (estimate.client.company_name) {
        pdf.text(estimate.client.company_name, 20, yPosition);
        yPosition += 6;
      }
      if (estimate.client.email) {
        pdf.text(estimate.client.email, 20, yPosition);
        yPosition += 6;
      }
      if (estimate.client.address) {
        const addressLines = estimate.client.address.split('\n');
        addressLines.forEach(line => {
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        });
      }
    }
    yPosition += 10;

    // Description if exists
    if (estimate.description) {
      pdf.setFontSize(11);
      pdf.text('Project Description:', 20, yPosition);
      yPosition += 6;
      pdf.setFontSize(10);
      const descLines = pdf.splitTextToSize(estimate.description, 170);
      descLines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 8;
    }

    // Items table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, 170, 8, 'F');
    pdf.setFontSize(11);
    pdf.text('Item Description', 22, yPosition + 6);
    pdf.text('Qty', 110, yPosition + 6);
    pdf.text('Price', 130, yPosition + 6);
    pdf.text('Total', 160, yPosition + 6);
    yPosition += 12;

    // Items
    pdf.setFontSize(10);
    let subtotal = 0;
    estimate.items?.forEach((item: any) => {
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

    if (estimate.tax_amount && estimate.tax_amount > 0) {
      pdf.text(`Tax (${estimate.tax_rate}%):`, 130, yPosition);
      pdf.text(`$${estimate.tax_amount.toFixed(2)}`, 160, yPosition);
      yPosition += 8;
    }

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Total:', 130, yPosition);
    pdf.text(`$${estimate.total_amount.toFixed(2)}`, 160, yPosition);
    pdf.setFont(undefined, 'normal');
    yPosition += 15;

    // Terms
    if (estimate.terms) {
      pdf.setFontSize(11);
      pdf.text('Terms & Conditions:', 20, yPosition);
      yPosition += 6;
      pdf.setFontSize(10);
      const termLines = pdf.splitTextToSize(estimate.terms, 170);
      termLines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 8;
    }

    // Notes
    if (estimate.notes) {
      pdf.setFontSize(11);
      pdf.text('Notes:', 20, yPosition);
      yPosition += 6;
      pdf.setFontSize(10);
      const noteLines = pdf.splitTextToSize(estimate.notes, 170);
      noteLines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
    }

    // Signature line if accepted
    if (estimate.status === 'accepted' && estimate.client_signature) {
      yPosition += 15;
      pdf.line(20, yPosition, 80, yPosition);
      yPosition += 6;
      pdf.setFontSize(10);
      pdf.text('Authorized Signature', 20, yPosition);
      if (estimate.signed_at) {
        pdf.text(`Signed on: ${format(new Date(estimate.signed_at), 'MMM dd, yyyy')}`, 20, yPosition + 6);
      }
    }

    // Save PDF
    pdf.save(`estimate_${estimate.estimate_number}.pdf`);

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'estimate',
      entityId: estimateId,
      action: 'downloaded',
      description: `downloaded estimate ${estimate.estimate_number} as PDF`,
      metadata: {
        estimate_number: estimate.estimate_number,
        format: 'pdf'
      }
    });
  }

  /**
   * Get estimates based on export options
   */
  private static async getEstimatesToExport(options: EstimateExportOptions): Promise<any[]> {
    let query = supabase
      .from('estimates')
      .select(`
        *,
        client:clients(*),
        items:estimate_items(*)
      `)
      .eq('organization_id', options.organizationId);

    // Apply filters
    if (options.estimateIds && options.estimateIds.length > 0) {
      query = query.in('id', options.estimateIds);
    }

    if (options.dateRange) {
      query = query
        .gte('issue_date', options.dateRange.start.toISOString())
        .lte('issue_date', options.dateRange.end.toISOString());
    }

    if (options.status && options.status.length > 0) {
      query = query.in('status', options.status);
    }

    const { data, error } = await query.order('estimate_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Export estimates to CSV
   */
  private static async exportToCSV(estimates: any[], options: EstimateExportOptions): Promise<void> {
    const headers = [
      'Estimate Number',
      'Title',
      'Issue Date',
      'Expiry Date',
      'Status',
      'Client Name',
      'Client Email',
      'Client Company',
      'Subtotal',
      'Tax Rate',
      'Tax Amount',
      'Total Amount',
      'Description',
      'Notes'
    ];

    const rows = estimates.map(estimate => {
      const row = [
        estimate.estimate_number || '',
        estimate.title || '',
        format(new Date(estimate.issue_date), 'yyyy-MM-dd'),
        estimate.expiry_date ? format(new Date(estimate.expiry_date), 'yyyy-MM-dd') : '',
        estimate.status,
        estimate.client?.name || '',
        estimate.client?.email || '',
        estimate.client?.company_name || '',
        estimate.subtotal?.toFixed(2) || '0.00',
        estimate.tax_rate?.toString() || '0',
        estimate.tax_amount?.toFixed(2) || '0.00',
        estimate.total_amount?.toFixed(2) || '0.00',
        estimate.description || '',
        estimate.notes || ''
      ];

      return row;
    });

    // Add line items if requested
    if (options.includeItems) {
      // Add empty row, then line items header and data
      rows.push(['']);
      rows.push(['Line Items Detail:']);
      rows.push(['Estimate Number', 'Description', 'Quantity', 'Unit Price', 'Total']);
      
      estimates.forEach(estimate => {
        estimate.items?.forEach((item: any) => {
          rows.push([
            estimate.estimate_number,
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
    link.setAttribute('download', `estimates_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export estimates to Excel
   */
  private static async exportToExcel(estimates: any[], options: EstimateExportOptions): Promise<void> {
    const wb = XLSX.utils.book_new();
    
    // Main estimate data
    const estimateData = estimates.map(estimate => ({
      'Estimate Number': estimate.estimate_number || '',
      'Title': estimate.title || '',
      'Issue Date': format(new Date(estimate.issue_date), 'yyyy-MM-dd'),
      'Expiry Date': estimate.expiry_date ? format(new Date(estimate.expiry_date), 'yyyy-MM-dd') : '',
      'Status': estimate.status,
      'Client Name': estimate.client?.name || '',
      'Client Email': estimate.client?.email || '',
      'Client Company': estimate.client?.company_name || '',
      'Subtotal': estimate.subtotal || 0,
      'Tax Rate': estimate.tax_rate || 0,
      'Tax Amount': estimate.tax_amount || 0,
      'Total Amount': estimate.total_amount || 0,
      'Description': estimate.description || '',
      'Notes': estimate.notes || '',
      'Signed': estimate.client_signature ? 'Yes' : 'No',
      'Signed Date': estimate.signed_at ? format(new Date(estimate.signed_at), 'yyyy-MM-dd') : ''
    }));

    const ws = XLSX.utils.json_to_sheet(estimateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Estimates');

    // Line items sheet
    if (options.includeItems) {
      const lineItems: any[] = [];
      estimates.forEach(estimate => {
        estimate.items?.forEach((item: any) => {
          lineItems.push({
            'Estimate Number': estimate.estimate_number,
            'Description': item.description,
            'Quantity': item.quantity,
            'Unit Price': item.unit_price,
            'Total': item.quantity * item.unit_price,
            'Cost Code': item.cost_code_name || 'Uncategorized'
          });
        });
      });

      if (lineItems.length > 0) {
        const wsItems = XLSX.utils.json_to_sheet(lineItems);
        XLSX.utils.book_append_sheet(wb, wsItems, 'Line Items');
      }
    }

    // Summary sheet
    const summary = [{
      'Export Date': format(new Date(), 'yyyy-MM-dd HH:mm'),
      'Total Estimates': estimates.length,
      'Total Value': estimates.reduce((sum, est) => sum + (est.total_amount || 0), 0),
      'Draft': estimates.filter(est => est.status === 'draft').length,
      'Sent': estimates.filter(est => est.status === 'sent').length,
      'Accepted': estimates.filter(est => est.status === 'accepted').length,
      'Rejected': estimates.filter(est => est.status === 'rejected').length,
      'Expired': estimates.filter(est => est.status === 'expired').length,
      'Conversion Rate': estimates.length > 0 
        ? `${((estimates.filter(est => est.status === 'accepted').length / estimates.length) * 100).toFixed(1)}%`
        : '0%'
    }];

    const wsSummary = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Save file
    XLSX.writeFile(wb, `estimates_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`);
  }

}