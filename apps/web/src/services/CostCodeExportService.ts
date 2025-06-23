import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  type: string;
  cost_code_id?: string;
  status: string;
  favorite: boolean;
  vendor_id?: string;
  sku?: string;
}

interface CostCode {
  id: string;
  name: string;
  code: string;
}

export class CostCodeExportService {
  static async exportToCSV(products: Product[], costCodes: CostCode[]): Promise<void> {
    try {
      // Create CSV content
      const rows: string[][] = [];
      
      // Header
      rows.push(['Cost Code Export']);
      rows.push([`Generated: ${new Date().toLocaleString()}`]);
      rows.push([`Total Items: ${products.length}`]);
      rows.push(['']);
      
      // Column headers
      rows.push([
        'Cost Code',
        'Item Name',
        'Description',
        'Type',
        'Price',
        'Unit',
        'SKU',
        'Status',
        'Favorite'
      ]);
      
      // Data rows
      products.forEach(product => {
        const costCode = costCodes.find(cc => cc.id === product.cost_code_id);
        const costCodeDisplay = costCode ? `${costCode.code} ${costCode.name}` : '—';
        
        rows.push([
          costCodeDisplay,
          product.name,
          product.description || '',
          product.type || '',
          product.price.toFixed(2),
          product.unit || '',
          product.sku || '',
          product.status || 'active',
          product.favorite ? 'Yes' : 'No'
        ]);
      });
      
      // Convert to CSV string
      const csvContent = rows.map(row => 
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma or newline
          const escaped = String(cell).replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped;
        }).join(',')
      ).join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `cost_codes_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }
  
  static async exportToExcel(products: Product[], costCodes: CostCode[]): Promise<void> {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Cost Codes Summary Sheet
      const summaryData = [
        ['Cost Code Export Summary'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Total Items: ${products.length}`],
        [''],
        ['Statistics by Type:']
      ];
      
      // Count by type
      const typeCounts: Record<string, number> = {};
      products.forEach(p => {
        typeCounts[p.type || 'other'] = (typeCounts[p.type || 'other'] || 0) + 1;
      });
      
      Object.entries(typeCounts).forEach(([type, count]) => {
        summaryData.push([`${type}:`, count.toString()]);
      });
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Cost Codes Detail Sheet
      const detailData = products.map(product => {
        const costCode = costCodes.find(cc => cc.id === product.cost_code_id);
        return {
          'Cost Code': costCode ? `${costCode.code} ${costCode.name}` : '—',
          'Item Name': product.name,
          'Description': product.description || '',
          'Type': product.type || '',
          'Price': product.price,
          'Unit': product.unit || '',
          'SKU': product.sku || '',
          'Status': product.status || 'active',
          'Favorite': product.favorite ? 'Yes' : 'No'
        };
      });
      
      const detailWs = XLSX.utils.json_to_sheet(detailData);
      
      // Auto-size columns
      const maxWidth = 50;
      const wscols = [
        { wch: 30 }, // Cost Code
        { wch: 30 }, // Item Name
        { wch: 40 }, // Description
        { wch: 15 }, // Type
        { wch: 12 }, // Price
        { wch: 10 }, // Unit
        { wch: 15 }, // SKU
        { wch: 10 }, // Status
        { wch: 10 }  // Favorite
      ];
      detailWs['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, detailWs, 'Cost Codes');
      
      // Generate and download
      XLSX.writeFile(wb, `cost_codes_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }
  
  static async importFromFile(file: File, organizationId: string, userId: string): Promise<{ success: number; errors: string[] }> {
    try {
      const errors: string[] = [];
      let success = 0;
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        // Handle CSV import
        const text = await file.text();
        const lines = text.split('\n');
        
        // Skip header rows (first 5 rows based on our export format)
        const dataLines = lines.slice(5).filter(line => line.trim());
        
        for (const line of dataLines) {
          try {
            const [costCode, name, description, type, price, unit, sku, status, favorite] = parseCSVLine(line);
            
            if (name && price) {
              const { error } = await supabase
                .from('products')
                .insert({
                  organization_id: organizationId,
                  user_id: userId,
                  name: name.trim(),
                  description: description?.trim() || '',
                  type: type?.trim() || 'material',
                  price: parseFloat(price) || 0,
                  unit: unit?.trim() || 'each',
                  sku: sku?.trim() || null,
                  status: status?.trim() || 'active',
                  favorite: favorite?.toLowerCase() === 'yes',
                  vendor_id: null,
                  cost_code_id: null // Would need to match cost code by code/name
                });
                
              if (error) {
                errors.push(`Failed to import "${name}": ${error.message}`);
              } else {
                success++;
              }
            }
          } catch (err) {
            errors.push(`Error parsing line: ${line}`);
          }
        }
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Handle Excel import
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        
        // Try to find the detail sheet
        const sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase().includes('cost') || 
          name.toLowerCase().includes('detail') ||
          name === workbook.SheetNames[0]
        );
        
        if (!sheetName) {
          throw new Error('No valid sheet found in Excel file');
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        for (const row of jsonData) {
          try {
            const name = row['Item Name'] || row['Name'] || row['Product Name'];
            const price = row['Price'] || row['Unit Price'] || row['Cost'];
            
            if (name && price) {
              const { error } = await supabase
                .from('products')
                .insert({
                  organization_id: organizationId,
                  user_id: userId,
                  name: String(name).trim(),
                  description: String(row['Description'] || '').trim(),
                  type: String(row['Type'] || 'material').trim(),
                  price: parseFloat(String(price)) || 0,
                  unit: String(row['Unit'] || 'each').trim(),
                  sku: row['SKU'] ? String(row['SKU']).trim() : null,
                  status: String(row['Status'] || 'active').trim(),
                  favorite: String(row['Favorite'] || '').toLowerCase() === 'yes',
                  vendor_id: null,
                  cost_code_id: null
                });
                
              if (error) {
                errors.push(`Failed to import "${name}": ${error.message}`);
              } else {
                success++;
              }
            }
          } catch (err) {
            errors.push(`Error importing row: ${JSON.stringify(row)}`);
          }
        }
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }
      
      return { success, errors };
      
    } catch (error) {
      console.error('Error importing file:', error);
      throw error;
    }
  }
}

// Helper function to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current); // Don't forget last value
  return result;
}