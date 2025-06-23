import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface DocumentTemplate {
  id?: string;
  organization_id: string;
  name: string;
  description?: string;
  document_type: 'contract' | 'permit' | 'proposal' | 'invoice' | 'change_order' | 'warranty' | 'safety' | 'other';
  industry_id?: string;
  project_type_id?: string;
  content: string;
  variables: DocumentVariable[];
  is_active: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  default_value?: any;
  options?: string[]; // For select type
  description?: string;
}

export interface GeneratedDocument {
  id?: string;
  template_id: string;
  project_id?: string;
  organization_id: string;
  name: string;
  content: string;
  variables_data: Record<string, any>;
  status: 'draft' | 'final' | 'signed';
  generated_at: string;
  signed_at?: string;
  signed_by?: string;
}

// Default document templates by industry and type
const DEFAULT_TEMPLATES: Partial<DocumentTemplate>[] = [
  {
    name: 'Standard Construction Contract',
    description: 'Basic construction contract template with standard terms',
    document_type: 'contract',
    industry_id: 'residential-construction',
    content: `
CONSTRUCTION CONTRACT

This Agreement is entered into on {{contract_date}} between:

CONTRACTOR: {{contractor_name}}
Address: {{contractor_address}}
License #: {{contractor_license}}

CLIENT: {{client_name}}
Address: {{client_address}}

PROJECT LOCATION: {{project_address}}

SCOPE OF WORK:
{{scope_of_work}}

PAYMENT TERMS:
Total Contract Price: \${{total_price}}
Payment Schedule:
- Upon signing: \${{deposit_amount}} ({{deposit_percentage}}%)
- Progress payments as follows:
  {{payment_schedule}}
- Final payment upon completion: \${{final_payment}}

TIMELINE:
Start Date: {{start_date}}
Estimated Completion: {{end_date}}

STANDARD TERMS AND CONDITIONS:
1. Changes to the scope of work must be documented in writing
2. Contractor warrants work for {{warranty_period}} from completion
3. Client must provide access to work area
4. Delays due to weather or acts of God will extend timeline
5. Disputes will be resolved through mediation

SIGNATURES:
Contractor: _________________________ Date: _________
Client: _____________________________ Date: _________
`,
    variables: [
      { key: 'contract_date', label: 'Contract Date', type: 'date', required: true },
      { key: 'contractor_name', label: 'Contractor Name', type: 'text', required: true },
      { key: 'contractor_address', label: 'Contractor Address', type: 'text', required: true },
      { key: 'contractor_license', label: 'License Number', type: 'text', required: true },
      { key: 'client_name', label: 'Client Name', type: 'text', required: true },
      { key: 'client_address', label: 'Client Address', type: 'text', required: true },
      { key: 'project_address', label: 'Project Address', type: 'text', required: true },
      { key: 'scope_of_work', label: 'Scope of Work', type: 'text', required: true },
      { key: 'total_price', label: 'Total Price', type: 'number', required: true },
      { key: 'deposit_amount', label: 'Deposit Amount', type: 'number', required: true },
      { key: 'deposit_percentage', label: 'Deposit Percentage', type: 'number', required: true, default_value: 30 },
      { key: 'payment_schedule', label: 'Payment Schedule', type: 'text', required: true },
      { key: 'final_payment', label: 'Final Payment', type: 'number', required: true },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
      { key: 'end_date', label: 'End Date', type: 'date', required: true },
      { key: 'warranty_period', label: 'Warranty Period', type: 'text', required: true, default_value: '1 year' }
    ],
    is_active: true,
    is_default: true
  },
  {
    name: 'Change Order Form',
    description: 'Document changes to original contract scope',
    document_type: 'change_order',
    content: `
CHANGE ORDER #{{change_order_number}}

Project: {{project_name}}
Original Contract Date: {{original_contract_date}}
Change Order Date: {{change_order_date}}

DESCRIPTION OF CHANGE:
{{change_description}}

COST IMPACT:
Original Contract Amount: \${{original_amount}}
Change Order Amount: \${{change_amount}}
New Contract Total: \${{new_total}}

SCHEDULE IMPACT:
Original Completion Date: {{original_completion}}
Revised Completion Date: {{revised_completion}}
Days Added: {{days_added}}

AUTHORIZATION:
Contractor: _________________________ Date: _________
Client: _____________________________ Date: _________
`,
    variables: [
      { key: 'change_order_number', label: 'Change Order Number', type: 'number', required: true },
      { key: 'project_name', label: 'Project Name', type: 'text', required: true },
      { key: 'original_contract_date', label: 'Original Contract Date', type: 'date', required: true },
      { key: 'change_order_date', label: 'Change Order Date', type: 'date', required: true },
      { key: 'change_description', label: 'Description of Changes', type: 'text', required: true },
      { key: 'original_amount', label: 'Original Contract Amount', type: 'number', required: true },
      { key: 'change_amount', label: 'Change Order Amount', type: 'number', required: true },
      { key: 'new_total', label: 'New Contract Total', type: 'number', required: true },
      { key: 'original_completion', label: 'Original Completion Date', type: 'date', required: true },
      { key: 'revised_completion', label: 'Revised Completion Date', type: 'date', required: true },
      { key: 'days_added', label: 'Days Added', type: 'number', required: true }
    ],
    is_active: true,
    is_default: true
  },
  {
    name: 'Warranty Certificate',
    description: 'Standard warranty documentation for completed work',
    document_type: 'warranty',
    content: `
WARRANTY CERTIFICATE

This certifies that {{contractor_name}} warrants the following work:

PROJECT: {{project_description}}
LOCATION: {{project_location}}
COMPLETION DATE: {{completion_date}}

WARRANTY PERIOD: {{warranty_period}} from date of completion

COVERAGE:
This warranty covers defects in workmanship and materials for:
{{covered_items}}

EXCLUSIONS:
This warranty does not cover:
- Normal wear and tear
- Damage from misuse or neglect
- Acts of God or natural disasters
- Modifications by others

To make a warranty claim, contact:
{{contractor_name}}
Phone: {{contractor_phone}}
Email: {{contractor_email}}

Issued by: _________________________ Date: _________
`,
    variables: [
      { key: 'contractor_name', label: 'Contractor Name', type: 'text', required: true },
      { key: 'project_description', label: 'Project Description', type: 'text', required: true },
      { key: 'project_location', label: 'Project Location', type: 'text', required: true },
      { key: 'completion_date', label: 'Completion Date', type: 'date', required: true },
      { key: 'warranty_period', label: 'Warranty Period', type: 'text', required: true, default_value: '1 year' },
      { key: 'covered_items', label: 'Items Covered', type: 'text', required: true },
      { key: 'contractor_phone', label: 'Contractor Phone', type: 'text', required: true },
      { key: 'contractor_email', label: 'Contractor Email', type: 'text', required: true }
    ],
    is_active: true,
    is_default: true
  }
];

export class DocumentTemplateService {
  /**
   * Get all document templates for an organization
   */
  static async list(organizationId: string, filters?: {
    document_type?: string;
    industry_id?: string;
    project_type_id?: string;
    is_active?: boolean;
  }): Promise<DocumentTemplate[]> {
    let query = supabase
      .from('document_templates')
      .select('*')
      .or(`organization_id.eq.${organizationId},is_default.eq.true`)
      .order('document_type')
      .order('name');

    if (filters?.document_type) {
      query = query.eq('document_type', filters.document_type);
    }
    if (filters?.industry_id) {
      query = query.eq('industry_id', filters.industry_id);
    }
    if (filters?.project_type_id) {
      query = query.eq('project_type_id', filters.project_type_id);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  }

  /**
   * Get a specific template
   */
  static async getById(id: string): Promise<DocumentTemplate | null> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Create a new document template
   */
  static async create(template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        ...template,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: template.organization_id,
        entityType: 'document_template',
        entityId: data.id,
        action: 'created',
        description: `Created document template: ${template.name}`,
        metadata: {
          name: template.name,
          document_type: template.document_type,
          industry_id: template.industry_id
        }
      });
    } catch (logError) {
      console.error('Failed to log template creation:', logError);
    }

    return data;
  }

  /**
   * Update a document template
   */
  static async update(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    if (data.organization_id) {
      try {
        await ActivityLogService.log({
          organizationId: data.organization_id,
          entityType: 'document_template',
          entityId: id,
          action: 'updated',
          description: `Updated document template: ${data.name}`,
          metadata: {
            name: data.name,
            updated_fields: Object.keys(updates)
          }
        });
      } catch (logError) {
        console.error('Failed to log template update:', logError);
      }
    }

    return data;
  }

  /**
   * Delete a document template
   */
  static async delete(id: string, organizationId: string): Promise<void> {
    const { data: template } = await supabase
      .from('document_templates')
      .select('name')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('document_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId,
        entityType: 'document_template',
        entityId: id,
        action: 'deleted',
        description: `Deleted document template: ${template?.name}`,
        metadata: {
          name: template?.name
        }
      });
    } catch (logError) {
      console.error('Failed to log template deletion:', logError);
    }
  }

  /**
   * Generate a document from a template
   */
  static async generateDocument(
    templateId: string,
    variables: Record<string, any>,
    projectId?: string,
    organizationId?: string
  ): Promise<GeneratedDocument> {
    // Get the template
    const template = await this.getById(templateId);
    if (!template) throw new Error('Template not found');

    // Process the template content with variables
    let content = template.content;
    
    // Replace all variables in the content
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(regex, variables[key] || '');
    });

    // Create the generated document record
    const generatedDoc: Omit<GeneratedDocument, 'id'> = {
      template_id: templateId,
      project_id: projectId,
      organization_id: organizationId || template.organization_id,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      content,
      variables_data: variables,
      status: 'draft',
      generated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('generated_documents')
      .insert(generatedDoc)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    if (organizationId) {
      try {
        await ActivityLogService.log({
          organizationId,
          entityType: 'document',
          entityId: data.id,
          action: 'generated',
          description: `Generated document from template: ${template.name}`,
          metadata: {
            template_id: templateId,
            template_name: template.name,
            project_id: projectId
          }
        });
      } catch (logError) {
        console.error('Failed to log document generation:', logError);
      }
    }

    return data;
  }

  /**
   * Get variables from template content
   */
  static extractVariables(content: string): string[] {
    const regex = /{{\\s*([^}]+)\\s*}}/g;
    const variables = new Set<string>();
    let match;

    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }

    return Array.from(variables);
  }

  /**
   * Validate variables against template requirements
   */
  static validateVariables(
    template: DocumentTemplate,
    providedVariables: Record<string, any>
  ): { valid: boolean; missing: string[]; errors: string[] } {
    const missing: string[] = [];
    const errors: string[] = [];

    template.variables.forEach(variable => {
      const value = providedVariables[variable.key];

      if (variable.required && (value === undefined || value === null || value === '')) {
        missing.push(variable.label);
      }

      if (value !== undefined && value !== null) {
        // Type validation
        switch (variable.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`${variable.label} must be a number`);
            }
            break;
          case 'date':
            if (!Date.parse(value)) {
              errors.push(`${variable.label} must be a valid date`);
            }
            break;
          case 'select':
            if (variable.options && !variable.options.includes(value)) {
              errors.push(`${variable.label} must be one of: ${variable.options.join(', ')}`);
            }
            break;
        }
      }
    });

    return {
      valid: missing.length === 0 && errors.length === 0,
      missing,
      errors
    };
  }

  /**
   * Initialize default templates for an organization
   */
  static async initializeDefaults(organizationId: string): Promise<void> {
    try {
      for (const defaultTemplate of DEFAULT_TEMPLATES) {
        await this.create({
          ...defaultTemplate,
          organization_id: organizationId,
          is_active: true,
          is_default: false
        } as DocumentTemplate);
      }
    } catch (error) {
      console.error('Error initializing default templates:', error);
    }
  }
}