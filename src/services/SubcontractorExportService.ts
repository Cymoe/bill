import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { SubcontractorService, type Subcontractor } from './subcontractorService';

export interface SubcontractorExportOptions {
  format: 'csv' | 'excel';
  subcontractorIds?: string[];
  tradeCategory?: string[];
  preferredOnly?: boolean;
  organizationId: string;
}

export interface SubcontractorImportOptions {
  format: 'csv' | 'excel';
  file: File;
  organizationId: string;
  userId: string;
}

export class SubcontractorExportService {
  /**
   * Export subcontractors to various formats
   */
  static async export(subcontractors: Subcontractor[], options: SubcontractorExportOptions): Promise<void> {
    if (subcontractors.length === 0) {
      throw new Error('No subcontractors found to export');
    }
    
    switch (options.format) {
      case 'csv':
        await this.exportToCSV(subcontractors, options);
        break;
      case 'excel':
        await this.exportToExcel(subcontractors, options);
        break;
    }
    
    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: options.organizationId,
        entityType: 'subcontractor',
        action: 'exported',
        description: `exported ${subcontractors.length} subcontractors to ${options.format.toUpperCase()}`,
        metadata: {
          format: options.format,
          count: subcontractors.length
        }
      });
    } catch (error) {
      console.error('Failed to log export activity:', error);
    }
  }

  /**
   * Export subcontractors to CSV
   */
  private static async exportToCSV(subcontractors: Subcontractor[], options: SubcontractorExportOptions): Promise<void> {
    const headers = [
      'Name',
      'Company Name',
      'Email',
      'Phone',
      'Address',
      'City',
      'State',
      'ZIP',
      'Trade Category',
      'Specialty',
      'Hourly Rate',
      'License Number',
      'Certification Info',
      'Insurance Info',
      'Rating',
      'Is Preferred',
      'Notes',
      'Project Count',
      'Total Value'
    ];

    const rows = subcontractors.map(sub => [
      sub.name || '',
      sub.company_name || '',
      sub.email || '',
      sub.phone || '',
      sub.address || '',
      sub.city || '',
      sub.state || '',
      sub.zip || '',
      sub.trade_category || '',
      sub.specialty || '',
      sub.hourly_rate?.toString() || '',
      sub.license_number || '',
      sub.certification_info || '',
      sub.insurance_info || '',
      sub.rating?.toString() || '',
      sub.is_preferred ? 'Yes' : 'No',
      sub.notes || '',
      sub.projectCount?.toString() || '0',
      sub.totalValue?.toString() || '0'
    ]);

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
    link.setAttribute('download', `subcontractors_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export subcontractors to Excel
   */
  private static async exportToExcel(subcontractors: Subcontractor[], options: SubcontractorExportOptions): Promise<void> {
    const wb = XLSX.utils.book_new();
    
    // Main subcontractor data
    const subcontractorData = subcontractors.map(sub => ({
      'Name': sub.name || '',
      'Company Name': sub.company_name || '',
      'Email': sub.email || '',
      'Phone': sub.phone || '',
      'Address': sub.address || '',
      'City': sub.city || '',
      'State': sub.state || '',
      'ZIP': sub.zip || '',
      'Trade Category': sub.trade_category || '',
      'Specialty': sub.specialty || '',
      'Hourly Rate': sub.hourly_rate || 0,
      'License Number': sub.license_number || '',
      'Certification Info': sub.certification_info || '',
      'Insurance Info': sub.insurance_info || '',
      'Rating': sub.rating || 0,
      'Is Preferred': sub.is_preferred ? 'Yes' : 'No',
      'Notes': sub.notes || '',
      'Project Count': sub.projectCount || 0,
      'Total Value': sub.totalValue || 0
    }));

    const ws = XLSX.utils.json_to_sheet(subcontractorData);
    XLSX.utils.book_append_sheet(wb, ws, 'Subcontractors');

    // Summary sheet
    const totalValue = subcontractors.reduce((sum, sub) => sum + (sub.totalValue || 0), 0);
    const avgRating = subcontractors.length > 0 
      ? subcontractors.reduce((sum, sub) => sum + (sub.rating || 0), 0) / subcontractors.length 
      : 0;

    const summary = [{
      'Export Date': format(new Date(), 'yyyy-MM-dd HH:mm'),
      'Total Subcontractors': subcontractors.length,
      'Preferred Subcontractors': subcontractors.filter(sub => sub.is_preferred).length,
      'Total Value': totalValue,
      'Average Rating': Number(avgRating.toFixed(1)),
      'Trade Categories': [...new Set(subcontractors.map(sub => sub.trade_category).filter(Boolean))].length,
      'Active Projects': subcontractors.reduce((sum, sub) => sum + (sub.projectCount || 0), 0)
    }];

    const wsSummary = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Trade categories breakdown
    const tradeStats: { [key: string]: any } = {};
    subcontractors.forEach(sub => {
      const trade = sub.trade_category || 'Uncategorized';
      if (!tradeStats[trade]) {
        tradeStats[trade] = {
          'Trade Category': trade,
          'Count': 0,
          'Preferred Count': 0,
          'Total Value': 0,
          'Average Rating': 0
        };
      }
      tradeStats[trade].Count++;
      if (sub.is_preferred) tradeStats[trade]['Preferred Count']++;
      tradeStats[trade]['Total Value'] += sub.totalValue || 0;
      tradeStats[trade]['Average Rating'] += sub.rating || 0;
    });

    // Calculate averages
    Object.values(tradeStats).forEach((stat: any) => {
      stat['Average Rating'] = Number((stat['Average Rating'] / stat.Count).toFixed(1));
    });

    const wsTradeStats = XLSX.utils.json_to_sheet(Object.values(tradeStats));
    XLSX.utils.book_append_sheet(wb, wsTradeStats, 'Trade Breakdown');

    // Save file
    XLSX.writeFile(wb, `subcontractors_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`);
  }

  /**
   * Import subcontractors from file
   */
  static async import(options: SubcontractorImportOptions): Promise<{ success: number; errors: string[] }> {
    try {
      let data: any[];
      
      if (options.format === 'csv') {
        data = await this.parseCSV(options.file);
      } else if (options.format === 'excel') {
        data = await this.parseExcel(options.file);
      } else {
        throw new Error('Unsupported file format');
      }

      const results = await this.processImportData(data, options);
      
      // Log activity
      try {
        await ActivityLogService.log({
          organizationId: options.organizationId,
          entityType: 'subcontractor',
          action: 'imported',
          description: `imported ${results.success} subcontractors from ${options.format.toUpperCase()}`,
          metadata: {
            format: options.format,
            success: results.success,
            errors: results.errors.length
          }
        });
      } catch (error) {
        console.error('Failed to log import activity:', error);
      }

      return results;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  /**
   * Parse CSV file
   */
  private static async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          const data = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row: any = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse Excel file
   */
  private static async parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Process and validate import data
   */
  private static async processImportData(
    data: any[], 
    options: SubcontractorImportOptions
  ): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    const successful: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Account for header row
      
      try {
        // Validate required fields
        if (!row.Name && !row.name) {
          errors.push(`Row ${rowNumber}: Name is required`);
          continue;
        }

        if (!row['Trade Category'] && !row.trade_category && !row.specialty) {
          errors.push(`Row ${rowNumber}: Trade Category or Specialty is required`);
          continue;
        }

        // Prepare subcontractor data
        const subcontractorData = {
          name: row.Name || row.name,
          company_name: row['Company Name'] || row.company_name || '',
          email: row.Email || row.email || '',
          phone: row.Phone || row.phone || '',
          address: row.Address || row.address || '',
          city: row.City || row.city || '',
          state: row.State || row.state || '',
          zip: row.ZIP || row.zip || '',
          trade_category: row['Trade Category'] || row.trade_category || '',
          specialty: row.Specialty || row.specialty || '',
          hourly_rate: this.parseNumber(row['Hourly Rate'] || row.hourly_rate),
          license_number: row['License Number'] || row.license_number || '',
          certification_info: row['Certification Info'] || row.certification_info || '',
          insurance_info: row['Insurance Info'] || row.insurance_info || '',
          rating: this.parseRating(row.Rating || row.rating),
          is_preferred: this.parseBoolean(row['Is Preferred'] || row.is_preferred),
          notes: row.Notes || row.notes || '',
          user_id: options.userId,
          organization_id: options.organizationId
        };

        // Create subcontractor
        const { data: newSubcontractor, error } = await supabase
          .from('subcontractors')
          .insert(subcontractorData)
          .select()
          .single();

        if (error) {
          errors.push(`Row ${rowNumber}: ${error.message}`);
        } else {
          successful.push(newSubcontractor);
        }
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: successful.length,
      errors
    };
  }

  /**
   * Helper to parse number values
   */
  private static parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  /**
   * Helper to parse rating values (1-5)
   */
  private static parseRating(value: any): number | undefined {
    const num = this.parseNumber(value);
    if (num === undefined) return undefined;
    return Math.min(5, Math.max(1, num));
  }

  /**
   * Helper to parse boolean values
   */
  private static parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'true' || lower === 'yes' || lower === '1';
    }
    return Boolean(value);
  }
}