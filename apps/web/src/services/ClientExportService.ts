import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

interface Client {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  totalValue?: number;
  projectCount?: number;
  lastProjectDate?: string;
  [key: string]: any;
}

export class ClientExportService {
  static async exportToCSV(clients: Client[]): Promise<void> {
    try {
      // Create CSV content
      const rows: string[][] = [];
      
      // Header
      rows.push(['Clients Export']);
      rows.push([`Generated: ${new Date().toLocaleString()}`]);
      rows.push([`Total Clients: ${clients.length}`]);
      rows.push(['']);
      
      // Column headers
      rows.push([
        'Name',
        'Company Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'State',
        'ZIP',
        'Total Value',
        'Projects',
        'Last Project Date'
      ]);
      
      // Data rows
      clients.forEach(client => {
        rows.push([
          client.name,
          client.company_name || '',
          client.email || '',
          client.phone || '',
          client.address || '',
          client.city || '',
          client.state || '',
          client.zip || '',
          client.totalValue ? `$${client.totalValue.toFixed(2)}` : '$0.00',
          (client.projectCount || 0).toString(),
          client.lastProjectDate ? new Date(client.lastProjectDate).toLocaleDateString() : ''
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
      link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }
  
  static async exportToExcel(clients: Client[]): Promise<void> {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['Clients Summary'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Total Clients: ${clients.length}`],
        [''],
        ['Statistics:'],
        [`Active Clients: ${clients.filter(c => {
          const hasRecentProject = !!(c.lastProjectDate && 
            new Date(c.lastProjectDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
          return hasRecentProject;
        }).length}`],
        [`Total Project Value: $${clients.reduce((sum, c) => sum + (c.totalValue || 0), 0).toFixed(2)}`],
        [`Total Projects: ${clients.reduce((sum, c) => sum + (c.projectCount || 0), 0)}`],
        [`Repeat Clients: ${clients.filter(c => (c.projectCount || 0) > 1).length}`]
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Clients Detail Sheet
      const detailData = clients.map(client => ({
        'Name': client.name,
        'Company Name': client.company_name || '',
        'Email': client.email || '',
        'Phone': client.phone || '',
        'Address': client.address || '',
        'City': client.city || '',
        'State': client.state || '',
        'ZIP': client.zip || '',
        'Total Value': client.totalValue || 0,
        'Projects': client.projectCount || 0,
        'Last Project Date': client.lastProjectDate || ''
      }));
      
      const detailWs = XLSX.utils.json_to_sheet(detailData);
      
      // Auto-size columns
      const wscols = [
        { wch: 25 }, // Name
        { wch: 30 }, // Company Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 35 }, // Address
        { wch: 20 }, // City
        { wch: 10 }, // State
        { wch: 10 }, // ZIP
        { wch: 15 }, // Total Value
        { wch: 10 }, // Projects
        { wch: 15 }  // Last Project Date
      ];
      detailWs['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, detailWs, 'Clients');
      
      // Generate and download
      XLSX.writeFile(wb, `clients_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
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
            const [name, companyName, email, phone, address, city, state, zip] = parseCSVLine(line);
            
            if (name && email) {
              const { error } = await supabase
                .from('clients')
                .insert({
                  organization_id: organizationId,
                  name: name.trim(),
                  company_name: companyName?.trim() || '',
                  email: email.trim(),
                  phone: phone?.trim() || '',
                  address: address?.trim() || '',
                  city: city?.trim() || '',
                  state: state?.trim() || '',
                  zip: zip?.trim() || '',
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
          name.toLowerCase().includes('client') || 
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
            const email = row['Email'];
            
            if (name && email) {
              const { error } = await supabase
                .from('clients')
                .insert({
                  organization_id: organizationId,
                  name: String(name).trim(),
                  company_name: row['Company Name'] ? String(row['Company Name']).trim() : '',
                  email: String(email).trim(),
                  phone: row['Phone'] ? String(row['Phone']).trim() : '',
                  address: row['Address'] ? String(row['Address']).trim() : '',
                  city: row['City'] ? String(row['City']).trim() : '',
                  state: row['State'] ? String(row['State']).trim() : '',
                  zip: row['ZIP'] ? String(row['ZIP']).trim() : '',
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