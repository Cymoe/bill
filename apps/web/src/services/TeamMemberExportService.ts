import * as XLSX from 'xlsx';
import { TeamMember } from './TeamMemberService';
import { supabase } from '../lib/supabase';

export class TeamMemberExportService {
  static async exportToCSV(teamMembers: TeamMember[]): Promise<void> {
    try {
      // Create CSV content
      const rows: string[][] = [];
      
      // Header
      rows.push(['Team Members Export']);
      rows.push([`Generated: ${new Date().toLocaleString()}`]);
      rows.push([`Total Members: ${teamMembers.length}`]);
      rows.push(['']);
      
      // Column headers
      rows.push([
        'Name',
        'Email',
        'Phone',
        'Job Title',
        'Department',
        'Employment Type',
        'Status',
        'Hourly Rate',
        'Start Date',
        'Projects Assigned',
        'Hours This Month'
      ]);
      
      // Data rows
      teamMembers.forEach(member => {
        rows.push([
          member.name,
          member.email || '',
          member.phone || '',
          member.job_title || '',
          member.department || '',
          member.employment_type || '',
          member.status || 'active',
          member.hourly_rate?.toString() || '',
          member.start_date || '',
          (member.projectsAssigned || 0).toString(),
          (member.hoursThisMonth || 0).toString()
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
      link.setAttribute('download', `team_members_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }
  
  static async exportToExcel(teamMembers: TeamMember[]): Promise<void> {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['Team Members Summary'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Total Members: ${teamMembers.length}`],
        [''],
        ['Statistics:'],
        [`Active Members: ${teamMembers.filter(m => m.status === 'active').length}`],
        [`Departments: ${new Set(teamMembers.map(m => m.department)).size}`],
        [`Total Projects: ${teamMembers.reduce((sum, m) => sum + (m.projectsAssigned || 0), 0)}`],
        [`Total Hours This Month: ${teamMembers.reduce((sum, m) => sum + (m.hoursThisMonth || 0), 0)}`]
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Team Members Detail Sheet
      const detailData = teamMembers.map(member => ({
        'Name': member.name,
        'Email': member.email || '',
        'Phone': member.phone || '',
        'Job Title': member.job_title || '',
        'Department': member.department || '',
        'Employment Type': member.employment_type || '',
        'Status': member.status || 'active',
        'Hourly Rate': member.hourly_rate || '',
        'Start Date': member.start_date || '',
        'Projects Assigned': member.projectsAssigned || 0,
        'Hours This Month': member.hoursThisMonth || 0
      }));
      
      const detailWs = XLSX.utils.json_to_sheet(detailData);
      
      // Auto-size columns
      const wscols = [
        { wch: 25 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 25 }, // Job Title
        { wch: 20 }, // Department
        { wch: 15 }, // Employment Type
        { wch: 10 }, // Status
        { wch: 12 }, // Hourly Rate
        { wch: 12 }, // Start Date
        { wch: 15 }, // Projects Assigned
        { wch: 15 }  // Hours This Month
      ];
      detailWs['!cols'] = wscols;
      
      XLSX.utils.book_append_sheet(wb, detailWs, 'Team Members');
      
      // Department Summary Sheet
      const deptStats: Record<string, { count: number; hours: number; projects: number }> = {};
      teamMembers.forEach(member => {
        const dept = member.department || 'Unassigned';
        if (!deptStats[dept]) {
          deptStats[dept] = { count: 0, hours: 0, projects: 0 };
        }
        deptStats[dept].count++;
        deptStats[dept].hours += member.hoursThisMonth || 0;
        deptStats[dept].projects += member.projectsAssigned || 0;
      });
      
      const deptData = Object.entries(deptStats).map(([dept, stats]) => ({
        'Department': dept,
        'Members': stats.count,
        'Total Hours': stats.hours,
        'Total Projects': stats.projects,
        'Avg Hours/Member': stats.count > 0 ? (stats.hours / stats.count).toFixed(1) : '0'
      }));
      
      const deptWs = XLSX.utils.json_to_sheet(deptData);
      XLSX.utils.book_append_sheet(wb, deptWs, 'Department Summary');
      
      // Generate and download
      XLSX.writeFile(wb, `team_members_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
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
            const [name, email, phone, jobTitle, department, employmentType, status, hourlyRate, startDate] = parseCSVLine(line);
            
            if (name && email) {
              const { error } = await supabase
                .from('team_members')
                .insert({
                  organization_id: organizationId,
                  name: name.trim(),
                  email: email.trim(),
                  phone: phone?.trim() || null,
                  job_title: jobTitle?.trim() || null,
                  department: department?.trim() || null,
                  employment_type: employmentType?.trim() || 'full-time',
                  status: status?.trim() || 'active',
                  hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
                  start_date: startDate?.trim() || null
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
          name.toLowerCase().includes('team') || 
          name.toLowerCase().includes('member') ||
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
                .from('team_members')
                .insert({
                  organization_id: organizationId,
                  name: String(name).trim(),
                  email: String(email).trim(),
                  phone: row['Phone'] ? String(row['Phone']).trim() : null,
                  job_title: row['Job Title'] ? String(row['Job Title']).trim() : null,
                  department: row['Department'] ? String(row['Department']).trim() : null,
                  employment_type: row['Employment Type'] ? String(row['Employment Type']).trim() : 'full-time',
                  status: row['Status'] ? String(row['Status']).trim() : 'active',
                  hourly_rate: row['Hourly Rate'] ? parseFloat(String(row['Hourly Rate'])) : null,
                  start_date: row['Start Date'] ? String(row['Start Date']).trim() : null
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