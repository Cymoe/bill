-- General Construction Document Templates Migration
-- Creates standard contract templates and documents for general construction

-- Function to create general construction document templates
CREATE OR REPLACE FUNCTION create_general_construction_documents()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
  v_template_id UUID;
BEGIN
  -- Get general construction industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'general-construction'
  LIMIT 1;

  -- General Construction Contract
  INSERT INTO document_templates (
    name,
    description,
    document_type,
    industry_id,
    content,
    variables,
    is_active,
    is_default
  ) VALUES (
    'General Construction Contract',
    'Comprehensive construction contract for general construction projects',
    'contract',
    v_industry_id,
    'CONSTRUCTION CONTRACT

This Agreement is entered into on {{contract_date}} between:

CONTRACTOR:
{{contractor_name}}
{{contractor_address}}
License #: {{contractor_license}}
Phone: {{contractor_phone}}
Email: {{contractor_email}}

CLIENT:
{{client_name}}
{{client_address}}
Phone: {{client_phone}}
Email: {{client_email}}

PROJECT LOCATION: {{project_address}}

PROJECT DESCRIPTION:
{{project_description}}

SCOPE OF WORK:
The Contractor agrees to provide all labor, materials, equipment, and services necessary for:
{{scope_of_work}}

CONTRACT PRICE:
Total Contract Price: \${{total_price}}
This price includes all labor, materials, equipment, permits, and other costs necessary to complete the work.

PAYMENT SCHEDULE:
1. Upon signing: \${{deposit_amount}} ({{deposit_percentage}}%)
2. Progress payments:
   {{payment_schedule}}
3. Final payment upon completion: \${{final_payment}}

PROJECT TIMELINE:
Start Date: {{start_date}}
Estimated Completion: {{end_date}}
Working Days: {{working_days}}

PERMITS AND APPROVALS:
Contractor will obtain and pay for all necessary permits and approvals, including:
{{required_permits}}

CHANGE ORDERS:
Any changes to the scope of work must be documented in writing and signed by both parties before work proceeds. Changes may affect the contract price and completion date.

WARRANTIES:
Contractor warrants all work for a period of {{warranty_period}} from completion. This warranty covers defects in workmanship but does not cover normal wear and tear or damage from abuse or neglect.

INSURANCE:
Contractor maintains:
- General Liability Insurance: \${{liability_coverage}}
- Workers Compensation Insurance: As required by law
- Property Damage Insurance: \${{property_coverage}}

TERMINATION:
Either party may terminate this contract with {{termination_notice}} days written notice. Client shall pay for all work completed to date of termination.

DISPUTE RESOLUTION:
Any disputes shall be resolved through mediation, and if unsuccessful, through binding arbitration in accordance with the rules of the American Arbitration Association.

ADDITIONAL TERMS:
1. All work shall be completed in a workmanlike manner and in compliance with all applicable codes
2. Contractor shall maintain a clean and safe worksite
3. Client shall provide reasonable access to the work area
4. Delays due to weather, acts of God, or conditions beyond Contractor control shall extend the completion date
5. This agreement constitutes the entire agreement between the parties

SIGNATURES:

CONTRACTOR:                           CLIENT:
_______________________              _______________________
{{contractor_name}}                  {{client_name}}
Date: _________                      Date: _________',
    ARRAY[
      ROW('contract_date', 'Contract Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of contract signing')::document_variable,
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'Legal name of contractor')::document_variable,
      ROW('contractor_address', 'Contractor Address', 'text', true, NULL, NULL, 'Business address')::document_variable,
      ROW('contractor_license', 'License Number', 'text', true, NULL, NULL, 'Contractor license number')::document_variable,
      ROW('contractor_phone', 'Contractor Phone', 'text', true, NULL, NULL, 'Business phone number')::document_variable,
      ROW('contractor_email', 'Contractor Email', 'text', true, NULL, NULL, 'Business email')::document_variable,
      ROW('client_name', 'Client Name', 'text', true, NULL, NULL, 'Client full name')::document_variable,
      ROW('client_address', 'Client Address', 'text', true, NULL, NULL, 'Client address')::document_variable,
      ROW('client_phone', 'Client Phone', 'text', true, NULL, NULL, 'Client phone')::document_variable,
      ROW('client_email', 'Client Email', 'text', true, NULL, NULL, 'Client email')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Job site address')::document_variable,
      ROW('project_description', 'Project Description', 'text', true, NULL, NULL, 'Brief project description')::document_variable,
      ROW('scope_of_work', 'Scope of Work', 'text', true, NULL, NULL, 'Detailed scope of work')::document_variable,
      ROW('total_price', 'Total Price', 'number', true, NULL, NULL, 'Total contract amount')::document_variable,
      ROW('deposit_amount', 'Deposit Amount', 'number', true, NULL, NULL, 'Initial deposit')::document_variable,
      ROW('deposit_percentage', 'Deposit Percentage', 'number', true, '30', NULL, 'Deposit as percentage')::document_variable,
      ROW('payment_schedule', 'Payment Schedule', 'text', true, NULL, NULL, 'Progress payment details')::document_variable,
      ROW('final_payment', 'Final Payment', 'number', true, NULL, NULL, 'Final payment amount')::document_variable,
      ROW('start_date', 'Start Date', 'date', true, NULL, NULL, 'Project start date')::document_variable,
      ROW('end_date', 'End Date', 'date', true, NULL, NULL, 'Estimated completion date')::document_variable,
      ROW('working_days', 'Working Days', 'number', true, NULL, NULL, 'Number of working days')::document_variable,
      ROW('required_permits', 'Required Permits', 'text', true, NULL, NULL, 'List of required permits')::document_variable,
      ROW('warranty_period', 'Warranty Period', 'text', true, '1 year', NULL, 'Warranty duration')::document_variable,
      ROW('liability_coverage', 'Liability Coverage', 'text', true, '2,000,000', NULL, 'Liability insurance amount')::document_variable,
      ROW('property_coverage', 'Property Coverage', 'text', true, '1,000,000', NULL, 'Property damage coverage')::document_variable,
      ROW('termination_notice', 'Termination Notice', 'number', true, '7', NULL, 'Days notice for termination')::document_variable
    ],
    true,
    true
  ) RETURNING id INTO v_template_id;

  -- Change Order Template
  INSERT INTO document_templates (
    name,
    description,
    document_type,
    industry_id,
    content,
    variables,
    is_active,
    is_default
  ) VALUES (
    'Construction Change Order',
    'Change order form for modifications to original contract',
    'change_order',
    v_industry_id,
    'CHANGE ORDER #{{change_order_number}}

Project: {{project_name}}
Original Contract Date: {{original_contract_date}}
Change Order Date: {{change_order_date}}

CONTRACTOR: {{contractor_name}}
CLIENT: {{client_name}}
PROJECT ADDRESS: {{project_address}}

DESCRIPTION OF CHANGE:
{{change_description}}

REASON FOR CHANGE:
{{change_reason}}

COST BREAKDOWN:
Labor: \${{labor_cost}}
Materials: \${{material_cost}}
Equipment: \${{equipment_cost}}
Other: \${{other_cost}}
Subtotal: \${{subtotal}}
Overhead & Profit ({{overhead_percentage}}%): \${{overhead_amount}}

TOTAL CHANGE ORDER AMOUNT: \${{total_change_amount}}

SCHEDULE IMPACT:
Original Completion Date: {{original_completion_date}}
Revised Completion Date: {{revised_completion_date}}
Additional Working Days: {{additional_days}}

CONTRACT SUMMARY:
Original Contract Amount: \${{original_contract_amount}}
Previous Change Orders: \${{previous_changes_amount}}
This Change Order: \${{total_change_amount}}
NEW CONTRACT TOTAL: \${{new_contract_total}}

TERMS:
1. This Change Order becomes part of the original contract
2. All other terms and conditions remain unchanged
3. Payment terms as per original contract apply to this change

AUTHORIZATION:

CONTRACTOR:                           CLIENT:
_______________________              _______________________
{{contractor_name}}                  {{client_name}}
Date: _________                      Date: _________',
    ARRAY[
      ROW('change_order_number', 'Change Order Number', 'text', true, NULL, NULL, 'Sequential CO number')::document_variable,
      ROW('project_name', 'Project Name', 'text', true, NULL, NULL, 'Project name')::document_variable,
      ROW('original_contract_date', 'Original Contract Date', 'date', true, NULL, NULL, 'Date of original contract')::document_variable,
      ROW('change_order_date', 'Change Order Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of this change order')::document_variable,
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'Contractor name')::document_variable,
      ROW('client_name', 'Client Name', 'text', true, NULL, NULL, 'Client name')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Project location')::document_variable,
      ROW('change_description', 'Change Description', 'text', true, NULL, NULL, 'Detailed description of changes')::document_variable,
      ROW('change_reason', 'Reason for Change', 'text', true, NULL, NULL, 'Why change is needed')::document_variable,
      ROW('labor_cost', 'Labor Cost', 'number', true, '0', NULL, 'Additional labor cost')::document_variable,
      ROW('material_cost', 'Material Cost', 'number', true, '0', NULL, 'Additional material cost')::document_variable,
      ROW('equipment_cost', 'Equipment Cost', 'number', true, '0', NULL, 'Additional equipment cost')::document_variable,
      ROW('other_cost', 'Other Cost', 'number', true, '0', NULL, 'Other additional costs')::document_variable,
      ROW('subtotal', 'Subtotal', 'number', true, NULL, NULL, 'Sum of all costs')::document_variable,
      ROW('overhead_percentage', 'Overhead Percentage', 'number', true, '15', NULL, 'Overhead and profit percentage')::document_variable,
      ROW('overhead_amount', 'Overhead Amount', 'number', true, NULL, NULL, 'Overhead and profit amount')::document_variable,
      ROW('total_change_amount', 'Total Change Amount', 'number', true, NULL, NULL, 'Total change order amount')::document_variable,
      ROW('original_completion_date', 'Original Completion Date', 'date', true, NULL, NULL, 'Original project end date')::document_variable,
      ROW('revised_completion_date', 'Revised Completion Date', 'date', true, NULL, NULL, 'New project end date')::document_variable,
      ROW('additional_days', 'Additional Days', 'number', true, '0', NULL, 'Extra days needed')::document_variable,
      ROW('original_contract_amount', 'Original Contract Amount', 'number', true, NULL, NULL, 'Original contract total')::document_variable,
      ROW('previous_changes_amount', 'Previous Changes Amount', 'number', true, '0', NULL, 'Sum of previous change orders')::document_variable,
      ROW('new_contract_total', 'New Contract Total', 'number', true, NULL, NULL, 'Updated contract total')::document_variable
    ],
    true,
    true
  );

  -- Warranty Certificate
  INSERT INTO document_templates (
    name,
    description,
    document_type,
    industry_id,
    content,
    variables,
    is_active,
    is_default
  ) VALUES (
    'Construction Warranty Certificate',
    'Warranty certificate for completed construction work',
    'warranty',
    v_industry_id,
    'WARRANTY CERTIFICATE

This certifies that {{contractor_name}} ("Contractor") warrants the construction work performed at:

PROJECT LOCATION: {{project_address}}
PROJECT DESCRIPTION: {{project_description}}
COMPLETION DATE: {{completion_date}}

WARRANTY COVERAGE:
The Contractor warrants all work performed for a period of {{warranty_period}} from the completion date stated above.

This warranty covers:
- Defects in workmanship
- Failure of installed materials due to improper installation
- All work performed under Contract dated {{contract_date}}

This warranty DOES NOT cover:
- Normal wear and tear
- Damage from abuse, misuse, or neglect
- Damage from acts of God or natural disasters
- Work performed by others
- Materials provided by the owner
- Consequential or incidental damages

WARRANTY SERVICE:
To obtain warranty service, contact:
{{contractor_name}}
{{contractor_phone}}
{{contractor_email}}

Contractor will, at no charge, repair or replace any defective work covered by this warranty. Response time will be within {{response_time}} business days of notification.

TRANSFERABILITY:
This warranty is transferable to subsequent owners of the property for the remainder of the warranty period.

LIMITATION:
This warranty is in lieu of all other warranties, express or implied. The Contractor liability under this warranty is limited to the repair or replacement of defective work only.

Issued by:

_______________________
{{contractor_name}}
{{contractor_title}}
Date: {{issue_date}}',
    ARRAY[
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'Company name')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Project location')::document_variable,
      ROW('project_description', 'Project Description', 'text', true, NULL, NULL, 'Work performed')::document_variable,
      ROW('completion_date', 'Completion Date', 'date', true, NULL, NULL, 'Project completion date')::document_variable,
      ROW('warranty_period', 'Warranty Period', 'text', true, '1 year', NULL, 'Duration of warranty')::document_variable,
      ROW('contract_date', 'Contract Date', 'date', true, NULL, NULL, 'Original contract date')::document_variable,
      ROW('contractor_phone', 'Contractor Phone', 'text', true, NULL, NULL, 'Contact phone')::document_variable,
      ROW('contractor_email', 'Contractor Email', 'text', true, NULL, NULL, 'Contact email')::document_variable,
      ROW('response_time', 'Response Time', 'text', true, '2-3', NULL, 'Response time in days')::document_variable,
      ROW('contractor_title', 'Contractor Title', 'text', true, 'President', NULL, 'Signatory title')::document_variable,
      ROW('issue_date', 'Issue Date', 'date', true, CURRENT_DATE::text, NULL, 'Warranty issue date')::document_variable
    ],
    true,
    true
  );

  -- Safety Compliance Checklist
  INSERT INTO document_templates (
    name,
    description,
    document_type,
    industry_id,
    content,
    variables,
    is_active,
    is_default
  ) VALUES (
    'Construction Site Safety Checklist',
    'Daily safety inspection checklist for construction sites',
    'safety',
    v_industry_id,
    'CONSTRUCTION SITE SAFETY CHECKLIST

Project: {{project_name}}
Location: {{project_address}}
Date: {{inspection_date}}
Inspector: {{inspector_name}}

GENERAL SITE CONDITIONS:
[ ] Site secured with proper fencing/barriers
[ ] Warning signs posted
[ ] Emergency contact numbers posted
[ ] First aid kit available and stocked
[ ] Fire extinguishers accessible
[ ] Site lighting adequate

PERSONAL PROTECTIVE EQUIPMENT (PPE):
[ ] Hard hats worn by all workers
[ ] Safety glasses/goggles available
[ ] Proper footwear (steel-toed boots)
[ ] High-visibility vests worn
[ ] Hearing protection available
[ ] Fall protection equipment inspected

EXCAVATION & TRENCHING:
[ ] Excavations properly shored/sloped
[ ] Access ladders within 25 feet
[ ] Spoil piles 2+ feet from edge
[ ] Underground utilities marked
[ ] Barricades around excavations

SCAFFOLDING & LADDERS:
[ ] Scaffolds properly erected
[ ] Guardrails installed (42" high)
[ ] Planking secure and complete
[ ] Ladders in good condition
[ ] Ladders secured and extended 3 feet
[ ] Fall protection used above 6 feet

ELECTRICAL SAFETY:
[ ] GFCI protection on all circuits
[ ] No damaged cords or tools
[ ] Proper grounding verified
[ ] Electrical panels accessible
[ ] Lockout/tagout procedures followed

HOUSEKEEPING:
[ ] Walkways clear of debris
[ ] Materials properly stored
[ ] Waste disposed regularly
[ ] Nails/screws removed or bent
[ ] Tools stored when not in use

EQUIPMENT & MACHINERY:
[ ] Daily equipment inspections done
[ ] Guards in place
[ ] Backup alarms working
[ ] Operators certified/trained
[ ] Equipment lockout when serviced

HAZARD COMMUNICATION:
[ ] SDS sheets available
[ ] Chemicals properly labeled
[ ] Workers trained on hazards
[ ] Spill kit available

ISSUES IDENTIFIED:
{{safety_issues}}

CORRECTIVE ACTIONS TAKEN:
{{corrective_actions}}

Inspector Signature: _______________________
Date: {{inspection_date}}

Site Supervisor: _______________________
Date: _________',
    ARRAY[
      ROW('project_name', 'Project Name', 'text', true, NULL, NULL, 'Project name')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Site location')::document_variable,
      ROW('inspection_date', 'Inspection Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of inspection')::document_variable,
      ROW('inspector_name', 'Inspector Name', 'text', true, NULL, NULL, 'Safety inspector name')::document_variable,
      ROW('safety_issues', 'Safety Issues', 'text', false, 'None identified', NULL, 'List any safety issues found')::document_variable,
      ROW('corrective_actions', 'Corrective Actions', 'text', false, 'N/A', NULL, 'Actions taken to address issues')::document_variable
    ],
    true,
    true
  );

  -- Lien Waiver
  INSERT INTO document_templates (
    name,
    description,
    document_type,
    industry_id,
    content,
    variables,
    is_active,
    is_default
  ) VALUES (
    'Conditional Lien Waiver',
    'Conditional waiver and release of lien upon progress payment',
    'other',
    v_industry_id,
    'CONDITIONAL WAIVER AND RELEASE ON PROGRESS PAYMENT

Upon receipt by the undersigned of a check from {{payer_name}} in the sum of \${{payment_amount}} payable to {{payee_name}} and when the check has been properly endorsed and has been paid by the bank on which it is drawn, this document shall become effective to release any mechanic lien, stop payment notice, or payment bond right the undersigned has on the job of {{project_owner}} located at {{project_address}} to the following extent:

This release covers a progress payment for all labor, services, equipment, or material furnished to {{project_address}} through {{release_date}} only and does not cover any retention withheld, any items, modifications, or changes pending approval, disputed claims, or items furnished after that date. Before any recipient of this document relies on it, the party should verify evidence of payment to the undersigned.

The undersigned warrants that he/she either has already paid or will use the money received from this progress payment to promptly pay in full all laborers, subcontractors, materialmen, and suppliers for all work, materials, equipment, or services provided for or to the above referenced project up to the date of this waiver.

Date: {{signature_date}}

Company Name: {{company_name}}
By: _______________________
Title: {{signer_title}}
Address: {{company_address}}
Phone: {{company_phone}}',
    ARRAY[
      ROW('payer_name', 'Payer Name', 'text', true, NULL, NULL, 'Party making payment')::document_variable,
      ROW('payment_amount', 'Payment Amount', 'number', true, NULL, NULL, 'Amount of payment')::document_variable,
      ROW('payee_name', 'Payee Name', 'text', true, NULL, NULL, 'Party receiving payment')::document_variable,
      ROW('project_owner', 'Project Owner', 'text', true, NULL, NULL, 'Property owner name')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Project location')::document_variable,
      ROW('release_date', 'Release Date', 'date', true, NULL, NULL, 'Work covered through this date')::document_variable,
      ROW('signature_date', 'Signature Date', 'date', true, CURRENT_DATE::text, NULL, 'Date signed')::document_variable,
      ROW('company_name', 'Company Name', 'text', true, NULL, NULL, 'Your company name')::document_variable,
      ROW('signer_title', 'Signer Title', 'text', true, NULL, NULL, 'Title of person signing')::document_variable,
      ROW('company_address', 'Company Address', 'text', true, NULL, NULL, 'Company address')::document_variable,
      ROW('company_phone', 'Company Phone', 'text', true, NULL, NULL, 'Company phone')::document_variable
    ],
    true,
    false
  );

END;
$$ LANGUAGE plpgsql;

-- Execute the function to create documents
SELECT create_general_construction_documents();

-- Associate document templates with work packs
-- This ensures appropriate documents are included with each project type
INSERT INTO work_pack_documents (work_pack_id, document_template_id, is_required, display_order)
SELECT 
  wp.id as work_pack_id,
  dt.id as document_template_id,
  true as is_required,
  CASE 
    WHEN dt.document_type = 'contract' THEN 1
    WHEN dt.document_type = 'permit' THEN 2
    WHEN dt.document_type = 'change_order' THEN 3
    WHEN dt.document_type = 'warranty' THEN 4
    WHEN dt.document_type = 'safety' THEN 5
    ELSE 6
  END as display_order
FROM work_packs wp
CROSS JOIN document_templates dt
WHERE wp.is_template = true
  AND wp.industry_id = (SELECT id FROM industries WHERE slug = 'general-construction')
  AND dt.industry_id = (SELECT id FROM industries WHERE slug = 'general-construction')
  AND dt.document_type IN ('contract', 'warranty', 'safety');