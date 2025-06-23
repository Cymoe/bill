import * as XLSX from 'xlsx';
import { VendorService, Vendor } from './vendorService';
import { supabase } from '../lib/supabase';

export class VendorExportService {
  static async exportToCSV(vendors: Vendor[]): Promise<void> {
    try {
      // Create CSV content
      const rows: string[][] = [];
      
      // Header
      rows.push(['Vendors Export']);
      rows.push([`Generated: ${new Date().toLocaleString()}`]);
      rows.push([`Total Vendors: ${vendors.length}`]);
      rows.push(['']);
      
      // Column headers
      rows.push([
        'Name',
        'Contact Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'State',
        'ZIP',
        'Category',
        'Specialty',
        'Website',
        'Tax ID',
        'Payment Terms',
        'Preferred',
        'Rating',
        'Notes'
      ]);
      
      // Data rows
      vendors.forEach(vendor => {
        rows.push([
          vendor.name,
          vendor.contact_name || '',
          vendor.email || '',
          vendor.phone || '',
          vendor.address || '',
          vendor.city || '',
          vendor.state || '',
          vendor.zip || '',
          vendor.category || '',
          vendor.specialty || '',
          vendor.website || '',
          vendor.tax_id || '',
          vendor.payment_terms || '',
          vendor.is_preferred ? 'Yes' : 'No',
          vendor.rating?.toString() || '',
          vendor.notes || ''
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
      link.setAttribute('download', `vendors_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }
  
  static async exportToExcel(vendors: Vendor[]): Promise<void> {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['Vendors Summary'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Total Vendors: ${vendors.length}`],
        [''],
        ['Statistics:'],
        [`Preferred Vendors: ${vendors.filter(v => v.is_preferred).length}`],
        [`Categories: ${new Set(vendors.map(v => v.category)).size}`],
        [`Average Rating: ${(vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.filter(v => v.rating).length || 0).toFixed(1)}`]
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Vendors Detail Sheet
      const detailData = vendors.map(vendor => ({
        'Name': vendor.name,
        'Contact Name': vendor.contact_name || '',
        'Email': vendor.email || '',
        'Phone': vendor.phone || '',
        'Address': vendor.address || '',
        'City': vendor.city || '',
        'State': vendor.state || '',
        'ZIP': vendor.zip || '',
        'Category': vendor.category || '',
        'Specialty': vendor.specialty || '',
        'Website': vendor.website || '',
        'Tax ID': vendor.tax_id || '',
        'Payment Terms': vendor.payment_terms || '',
        'Preferred': vendor.is_preferred ? 'Yes' : 'No',
        'Rating': vendor.rating || '',
        'Notes': vendor.notes || ''
      }));
      
      const detailWs = XLSX.utils.json_to_sheet(detailData);
      
      // Auto-size columns
      const wscols = [
        { wch: 25 }, // Name
        { wch: 25 }, // Contact Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 30 }, // Address
        { wch: 20 }, // City
        { wch: 10 }, // State
        { wch: 10 }, // ZIP
        { wch: 20 }, // Category
        { wch: 25 }, // Specialty
        { wch: 30 }, // Website
        { wch: 15 }, // Tax ID
        { wch: 20 }, // Payment Terms
        { wch: 10 }, // Preferred
        { wch: 10 }, // Rating
        { wch: 40 }  // Notes
      ];
      detailWs['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, detailWs, 'Vendors');
      
      // Category Summary Sheet
      const categoryStats: Record<string, { count: number; preferredCount: number }> = {};
      vendors.forEach(vendor => {
        const cat = vendor.category || 'Uncategorized';
        if (!categoryStats[cat]) {
          categoryStats[cat] = { count: 0, preferredCount: 0 };
        }
        categoryStats[cat].count++;
        if (vendor.is_preferred) {
          categoryStats[cat].preferredCount++;
        }
      });
      
      const categoryData = Object.entries(categoryStats).map(([category, stats]) => ({
        'Category': category,
        'Total Vendors': stats.count,
        'Preferred Vendors': stats.preferredCount,
        'Percentage': `${((stats.count / vendors.length) * 100).toFixed(1)}%`
      }));
      
      const categoryWs = XLSX.utils.json_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(wb, categoryWs, 'Categories');
      
      // Generate and download
      XLSX.writeFile(wb, `vendors_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }
  
  static async importFromFile(file: File, organizationId: string): Promise<{ success: number; errors: string[] }> {
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
            const values = parseCSVLine(line);
            const [name, contactName, email, phone, address, city, state, zip, category, specialty, website, taxId, paymentTerms, preferred, rating] = values;
            
            if (name) {
              const { error } = await supabase
                .from('vendors')
                .insert({
                  organization_id: organizationId,
                  name: name.trim(),
                  contact_name: contactName?.trim() || null,
                  email: email?.trim() || null,
                  phone: phone?.trim() || null,
                  address: address?.trim() || null,
                  city: city?.trim() || null,
                  state: state?.trim() || null,
                  zip: zip?.trim() || null,
                  category: category?.trim() || null,
                  specialty: specialty?.trim() || null,
                  website: website?.trim() || null,
                  tax_id: taxId?.trim() || null,
                  payment_terms: paymentTerms?.trim() || null,
                  is_preferred: preferred?.toLowerCase() === 'yes',
                  rating: rating ? parseInt(rating) : null,
                  user_id: (await supabase.auth.getUser()).data.user?.id || ''
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
          name.toLowerCase().includes('vendor') || 
          name === workbook.SheetNames[0]
        );
        
        if (!sheetName) {
          throw new Error('No valid sheet found in Excel file');
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        for (const row of jsonData) {
          try {
            const name = row['Name'];
            
            if (name) {
              const { error } = await supabase
                .from('vendors')
                .insert({
                  organization_id: organizationId,
                  name: String(name).trim(),
                  contact_name: row['Contact Name'] ? String(row['Contact Name']).trim() : null,
                  email: row['Email'] ? String(row['Email']).trim() : null,
                  phone: row['Phone'] ? String(row['Phone']).trim() : null,
                  address: row['Address'] ? String(row['Address']).trim() : null,
                  city: row['City'] ? String(row['City']).trim() : null,
                  state: row['State'] ? String(row['State']).trim() : null,
                  zip: row['ZIP'] ? String(row['ZIP']).trim() : null,
                  category: row['Category'] ? String(row['Category']).trim() : null,
                  specialty: row['Specialty'] ? String(row['Specialty']).trim() : null,
                  website: row['Website'] ? String(row['Website']).trim() : null,
                  tax_id: row['Tax ID'] ? String(row['Tax ID']).trim() : null,
                  payment_terms: row['Payment Terms'] ? String(row['Payment Terms']).trim() : null,
                  is_preferred: row['Preferred'] ? String(row['Preferred']).toLowerCase() === 'yes' : false,
                  rating: row['Rating'] ? parseInt(String(row['Rating'])) : null,
                  notes: row['Notes'] ? String(row['Notes']).trim() : null,
                  user_id: (await supabase.auth.getUser()).data.user?.id || ''
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