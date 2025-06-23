import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { ActivityLogService } from './ActivityLogService';

export interface ProjectExportOptions {
  format: 'csv' | 'excel';
  projectIds?: string[];
  dateRange?: { start: Date; end: Date };
  status?: string[];
  organizationId: string;
}

export class ProjectExportService {
  /**
   * Export projects to various formats
   */
  static async export(projects: any[], options: ProjectExportOptions): Promise<void> {
    if (projects.length === 0) {
      throw new Error('No projects found to export');
    }
    
    switch (options.format) {
      case 'csv':
        await this.exportToCSV(projects, options);
        break;
      case 'excel':
        await this.exportToExcel(projects, options);
        break;
    }
    
    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: options.organizationId,
        entityType: 'project',
        action: 'exported',
        description: `exported ${projects.length} projects to ${options.format.toUpperCase()}`,
        metadata: {
          format: options.format,
          count: projects.length
        }
      });
    } catch (error) {
      console.error('Failed to log export activity:', error);
    }
  }

  /**
   * Export projects to CSV
   */
  private static async exportToCSV(projects: any[], options: ProjectExportOptions): Promise<void> {
    const headers = [
      'Project Name',
      'Status',
      'Category',
      'Client',
      'Budget',
      'Start Date',
      'End Date',
      'Location',
      'Description'
    ];

    const rows = projects.map(project => [
      project.name || '',
      project.status || '',
      project.category || '',
      project.client_name || '',
      project.budget?.toString() || '0',
      project.start_date ? format(new Date(project.start_date), 'yyyy-MM-dd') : '',
      project.end_date ? format(new Date(project.end_date), 'yyyy-MM-dd') : '',
      project.location || '',
      project.description || ''
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
    link.setAttribute('download', `projects_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export projects to Excel
   */
  private static async exportToExcel(projects: any[], options: ProjectExportOptions): Promise<void> {
    const wb = XLSX.utils.book_new();
    
    // Main project data
    const projectData = projects.map(project => ({
      'Project Name': project.name || '',
      'Status': project.status || '',
      'Category': project.category || '',
      'Client': project.client_name || '',
      'Budget': project.budget || 0,
      'Start Date': project.start_date ? format(new Date(project.start_date), 'yyyy-MM-dd') : '',
      'End Date': project.end_date ? format(new Date(project.end_date), 'yyyy-MM-dd') : '',
      'Location': project.location || '',
      'Description': project.description || ''
    }));

    const ws = XLSX.utils.json_to_sheet(projectData);
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');

    // Summary sheet
    const summary = [{
      'Export Date': format(new Date(), 'yyyy-MM-dd HH:mm'),
      'Total Projects': projects.length,
      'Total Budget': projects.reduce((sum, proj) => sum + (proj.budget || 0), 0),
      'Active Projects': projects.filter(proj => proj.status === 'active').length,
      'Completed Projects': projects.filter(proj => proj.status === 'completed').length,
      'On Hold Projects': projects.filter(proj => proj.status === 'on-hold').length,
      'Planned Projects': projects.filter(proj => proj.status === 'planned').length
    }];

    const wsSummary = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Save file
    XLSX.writeFile(wb, `projects_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`);
  }
}