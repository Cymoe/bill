import * as XLSX from 'xlsx';
import { SubcontractorService, Subcontractor } from './subcontractorService';
import { supabase } from '../lib/supabase';

export class SubcontractorExportService {
  static async exportToCSV(subcontractors: Subcontractor[]): Promise<void> {
    try {
      // Create CSV content
      const rows: string[][] = [];
      
      // Header
      rows.push(['Subcontractors Export']);
      rows.push([`Generated: ${new Date().toLocaleString()}`]);
      rows.push([`Total Subcontractors: ${subcontractors.length}`]);
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
        'Trade Category',
        'License Number',
        'Insurance Carrier',
        'Insurance Policy',
        'Insurance Expiry',
        'Workers Comp',
        'Preferred',
        'Rating',
        'Total Value',
        'Projects',
        'Last Project Date'
      ]);
      
      // Data rows
      subcontractors.forEach(sub => {
        rows.push([
          sub.name,
          sub.contact_name || '',
          sub.email || '',
          sub.phone || '',
          sub.address || '',
          sub.city || '',
          sub.state || '',
          sub.zip || '',
          sub.trade_category || '',
          sub.license_number || '',
          sub.insurance_carrier || '',
          sub.insurance_policy_number || '',
          sub.insurance_expiry ? new Date(sub.insurance_expiry).toLocaleDateString() : '',
          sub.workers_comp_number || '',
          sub.is_preferred ? 'Yes' : 'No',
          sub.rating?.toString() || '',
          sub.totalValue ? `$${sub.totalValue.toFixed(2)}` : '$0.00',
          (sub.projectCount || 0).toString(),
          sub.lastProjectDate ? new Date(sub.lastProjectDate).toLocaleDateString() : ''
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
      link.setAttribute('download', `subcontractors_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }
  
  static async exportToExcel(subcontractors: Subcontractor[]): Promise<void> {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['Subcontractors Summary'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Total Subcontractors: ${subcontractors.length}`],
        [''],
        ['Statistics:'],
        [`Preferred Subcontractors: ${subcontractors.filter(s => s.is_preferred).length}`],
        [`Trade Categories: ${new Set(subcontractors.map(s => s.trade_category)).size}`],
        [`Total Project Value: $${subcontractors.reduce((sum, s) => sum + (s.totalValue || 0), 0).toFixed(2)}`],
        [`Total Projects: ${subcontractors.reduce((sum, s) => sum + (s.projectCount || 0), 0)}`],
        [`Average Rating: ${(subcontractors.reduce((sum, s) => sum + (s.rating || 0), 0) / subcontractors.filter(s => s.rating).length || 0).toFixed(1)}`]
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Subcontractors Detail Sheet
      const detailData = subcontractors.map(sub => ({
        'Name': sub.name,
        'Contact Name': sub.contact_name || '',
        'Email': sub.email || '',
        'Phone': sub.phone || '',
        'Address': sub.address || '',
        'City': sub.city || '',
        'State': sub.state || '',
        'ZIP': sub.zip || '',
        'Trade Category': sub.trade_category || '',
        'License Number': sub.license_number || '',
        'Insurance Carrier': sub.insurance_carrier || '',
        'Insurance Policy': sub.insurance_policy_number || '',
        'Insurance Expiry': sub.insurance_expiry || '',
        'Workers Comp': sub.workers_comp_number || '',
        'Preferred': sub.is_preferred ? 'Yes' : 'No',
        'Rating': sub.rating || '',
        'Total Value': sub.totalValue || 0,
        'Projects': sub.projectCount || 0,
        'Last Project': sub.lastProjectDate || ''
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
        { wch: 20 }, // Trade Category
        { wch: 20 }, // License Number
        { wch: 25 }, // Insurance Carrier
        { wch: 20 }, // Insurance Policy
        { wch: 15 }, // Insurance Expiry
        { wch: 20 }, // Workers Comp
        { wch: 10 }, // Preferred
        { wch: 10 }, // Rating
        { wch: 15 }, // Total Value
        { wch: 10 }, // Projects
        { wch: 15 }  // Last Project
      ];
      detailWs['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, detailWs, 'Subcontractors');
      
      // Trade Category Summary Sheet
      const tradeStats: Record<string, { count: number; value: number; projects: number }> = {};
      subcontractors.forEach(sub => {
        const trade = sub.trade_category || 'Unspecified';
        if (!tradeStats[trade]) {
          tradeStats[trade] = { count: 0, value: 0, projects: 0 };
        }
        tradeStats[trade].count++;
        tradeStats[trade].value += sub.totalValue || 0;
        tradeStats[trade].projects += sub.projectCount || 0;
      });
      
      const tradeData = Object.entries(tradeStats).map(([trade, stats]) => ({
        'Trade Category': trade,
        'Subcontractors': stats.count,
        'Total Value': stats.value,
        'Total Projects': stats.projects,
        'Avg Value/Sub': stats.count > 0 ? (stats.value / stats.count).toFixed(2) : '0'
      }));
      
      const tradeWs = XLSX.utils.json_to_sheet(tradeData);
      XLSX.utils.book_append_sheet(wb, tradeWs, 'Trade Summary');
      
      // Generate and download
      XLSX.writeFile(wb, `subcontractors_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
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
            const [name, contactName, email, phone, address, city, state, zip, tradeCategory, licenseNumber, insuranceCarrier, insurancePolicy, insuranceExpiry, workersComp, preferred, rating] = values;
            
            if (name) {
              const { error } = await supabase
                .from('subcontractors')
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
                  trade_category: tradeCategory?.trim() || null,
                  license_number: licenseNumber?.trim() || null,
                  insurance_carrier: insuranceCarrier?.trim() || null,
                  insurance_policy_number: insurancePolicy?.trim() || null,
                  insurance_expiry: insuranceExpiry?.trim() || null,
                  workers_comp_number: workersComp?.trim() || null,
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
          name.toLowerCase().includes('subcontractor') || 
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
                .from('subcontractors')
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
                  trade_category: row['Trade Category'] ? String(row['Trade Category']).trim() : null,
                  license_number: row['License Number'] ? String(row['License Number']).trim() : null,
                  insurance_carrier: row['Insurance Carrier'] ? String(row['Insurance Carrier']).trim() : null,
                  insurance_policy_number: row['Insurance Policy'] ? String(row['Insurance Policy']).trim() : null,
                  insurance_expiry: row['Insurance Expiry'] ? String(row['Insurance Expiry']).trim() : null,
                  workers_comp_number: row['Workers Comp'] ? String(row['Workers Comp']).trim() : null,
                  is_preferred: row['Preferred'] ? String(row['Preferred']).toLowerCase() === 'yes' : false,
                  rating: row['Rating'] ? parseInt(String(row['Rating'])) : null,
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