-- Commercial Construction Industry Data Migration
-- Creates comprehensive cost codes, project types, work packs, and documents for commercial construction

-- First, ensure we have the commercial construction industry
INSERT INTO industries (name, slug, description, icon, is_active)
VALUES ('Commercial Construction', 'commercial-construction', 'Commercial building and tenant improvements', '🏢', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Commercial Construction Cost Codes
-- Site Development Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('CC001', 'Site Survey & Engineering', 'Commercial site survey and engineering', 'service', 'ls', 5000.00),
  ('CC002', 'Site Clearing', 'Clear and grub site', 'equipment', 'acre', 3500.00),
  ('CC003', 'Mass Excavation', 'Large scale excavation', 'equipment', 'cy', 18.00),
  ('CC004', 'Site Utilities', 'Water, sewer, storm connections', 'subcontractor', 'lf', 125.00),
  ('CC005', 'Parking Lot - Asphalt', 'Asphalt parking lot', 'subcontractor', 'sf', 3.50),
  ('CC006', 'Parking Lot - Concrete', 'Concrete parking lot', 'subcontractor', 'sf', 6.50),
  ('CC007', 'Site Lighting', 'Parking lot lighting', 'material', 'ea', 2800.00),
  ('CC008', 'Landscaping - Commercial', 'Commercial landscaping', 'subcontractor', 'sf', 4.50),
  ('CC009', 'Site Signage', 'Monument and directional signs', 'material', 'ea', 3500.00),
  ('CC010', 'Traffic Control', 'Construction traffic control', 'service', 'day', 450.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Structural Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('CC100', 'Concrete Footings', 'Commercial grade footings', 'material', 'cy', 185.00),
  ('CC101', 'Foundation Walls', 'Poured concrete walls', 'material', 'sf', 14.00),
  ('CC102', 'Slab on Deck', 'Concrete on metal deck', 'material', 'sf', 8.50),
  ('CC103', 'Structural Steel', 'Steel frame structure', 'material', 'ton', 2800.00),
  ('CC104', 'Steel Erection', 'Steel erection labor', 'subcontractor', 'ton', 850.00),
  ('CC105', 'Metal Decking', 'Composite metal deck', 'material', 'sf', 4.50),
  ('CC106', 'Concrete Columns', 'Cast-in-place columns', 'material', 'lf', 125.00),
  ('CC107', 'Precast Panels', 'Precast wall panels', 'material', 'sf', 22.00),
  ('CC108', 'Fireproofing', 'Spray-on fireproofing', 'subcontractor', 'sf', 2.85),
  ('CC109', 'Expansion Joints', 'Building expansion joints', 'material', 'lf', 85.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Exterior Envelope Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('CC200', 'Curtain Wall System', 'Aluminum curtain wall', 'material', 'sf', 65.00),
  ('CC201', 'Storefront System', 'Aluminum storefront', 'material', 'sf', 45.00),
  ('CC202', 'EIFS System', 'Exterior insulation finish', 'subcontractor', 'sf', 12.00),
  ('CC203', 'Metal Panel System', 'Insulated metal panels', 'material', 'sf', 28.00),
  ('CC204', 'Brick Veneer - Commercial', 'Commercial brick veneer', 'subcontractor', 'sf', 18.00),
  ('CC205', 'Stone Veneer - Commercial', 'Natural stone cladding', 'subcontractor', 'sf', 35.00),
  ('CC206', 'Roofing - TPO', 'TPO membrane roofing', 'subcontractor', 'sq', 650.00),
  ('CC207', 'Roofing - EPDM', 'EPDM rubber roofing', 'subcontractor', 'sq', 550.00),
  ('CC208', 'Roofing - Modified Bitumen', 'Modified bitumen system', 'subcontractor', 'sq', 750.00),
  ('CC209', 'Roof Insulation', 'Rigid roof insulation', 'material', 'sf', 2.25)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Interior Build-Out Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('CC300', 'Metal Stud Framing', 'Commercial metal studs', 'material', 'sf', 3.50),
  ('CC301', 'Drywall - Commercial', '5/8" Type X drywall', 'material', 'sf', 2.25),
  ('CC302', 'Acoustic Ceiling', 'Suspended acoustic tiles', 'material', 'sf', 4.50),
  ('CC303', 'Flooring - VCT', 'Vinyl composition tile', 'material', 'sf', 2.85),
  ('CC304', 'Flooring - Carpet Tile', 'Commercial carpet tiles', 'material', 'sf', 4.50),
  ('CC305', 'Flooring - Polished Concrete', 'Polished concrete finish', 'subcontractor', 'sf', 6.50),
  ('CC306', 'Flooring - Epoxy', 'Epoxy floor coating', 'subcontractor', 'sf', 5.50),
  ('CC307', 'Demountable Partitions', 'Modular office walls', 'material', 'lf', 125.00),
  ('CC308', 'Glass Partitions', 'Interior glass walls', 'material', 'sf', 85.00),
  ('CC309', 'Commercial Doors', 'Hollow metal doors/frames', 'material', 'ea', 850.00),
  ('CC310', 'Door Hardware - Commercial', 'Commercial grade hardware', 'material', 'ea', 450.00),
  ('CC311', 'Toilet Partitions', 'Restroom partitions', 'material', 'ea', 650.00),
  ('CC312', 'Commercial Millwork', 'Reception desks, built-ins', 'material', 'lf', 285.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- MEP Systems Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('CC400', 'Plumbing - Commercial', 'Complete plumbing system', 'subcontractor', 'sf', 12.00),
  ('CC401', 'HVAC - VAV System', 'Variable air volume system', 'subcontractor', 'sf', 18.00),
  ('CC402', 'HVAC - Split Systems', 'Multiple split systems', 'subcontractor', 'ton', 4500.00),
  ('CC403', 'HVAC - Chiller System', 'Chilled water system', 'subcontractor', 'ton', 2200.00),
  ('CC404', 'Electrical Service - Commercial', '400A-1200A service', 'subcontractor', 'ea', 15000.00),
  ('CC405', 'Electrical Distribution', 'Panels and feeders', 'subcontractor', 'sf', 8.50),
  ('CC406', 'Lighting - Commercial', 'LED lighting package', 'material', 'sf', 6.50),
  ('CC407', 'Emergency Generator', 'Backup power generator', 'material', 'kw', 850.00),
  ('CC408', 'Fire Sprinkler System', 'Wet sprinkler system', 'subcontractor', 'sf', 3.85),
  ('CC409', 'Fire Alarm System', 'Addressable fire alarm', 'subcontractor', 'sf', 2.50),
  ('CC410', 'Security System', 'Access control and cameras', 'subcontractor', 'sf', 4.25),
  ('CC411', 'Data/Telecom Cabling', 'Cat6 structured cabling', 'subcontractor', 'drop', 285.00),
  ('CC412', 'Building Automation', 'BAS/BMS system', 'subcontractor', 'sf', 3.50)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Specialty Commercial Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('CC500', 'Elevator - Hydraulic', '2-stop hydraulic elevator', 'subcontractor', 'ea', 45000.00),
  ('CC501', 'Elevator - Traction', 'Traction elevator per floor', 'subcontractor', 'stop', 25000.00),
  ('CC502', 'Loading Dock Equipment', 'Dock levelers and seals', 'material', 'ea', 8500.00),
  ('CC503', 'Commercial Kitchen Equip', 'Restaurant kitchen package', 'material', 'ls', 125000.00),
  ('CC504', 'Lab Casework', 'Laboratory cabinets/counters', 'material', 'lf', 850.00),
  ('CC505', 'Clean Room Construction', 'Clean room per ISO class', 'subcontractor', 'sf', 285.00),
  ('CC506', 'Acoustic Treatment', 'Sound panels and baffles', 'material', 'sf', 18.00),
  ('CC507', 'Operable Partitions', 'Folding partition walls', 'material', 'sf', 125.00),
  ('CC508', 'Window Treatments', 'Commercial blinds/shades', 'material', 'sf', 12.00),
  ('CC509', 'Signage - Interior', 'Wayfinding and ADA signage', 'material', 'sf', 85.00),
  ('CC510', 'Green Building Premium', 'LEED certification costs', 'service', 'sf', 2.50)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Create function to add commercial construction project types
CREATE OR REPLACE FUNCTION create_commercial_construction_project_types()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
BEGIN
  -- Get commercial construction industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'commercial-construction'
  LIMIT 1;
  
  -- Insert commercial construction project types
  INSERT INTO project_categories (name, slug, description, icon, industry_id, display_order, is_active) VALUES
    ('Office Build-Out', 'office-buildout', 'Corporate office space construction', '🏢', v_industry_id, 1, true),
    ('Retail Build-Out', 'retail-buildout', 'Retail store construction and fit-out', '🛍️', v_industry_id, 2, true),
    ('Restaurant Build-Out', 'restaurant-buildout', 'Restaurant and food service construction', '🍽️', v_industry_id, 3, true),
    ('Medical Office Build-Out', 'medical-buildout', 'Medical and dental office construction', '🏥', v_industry_id, 4, true),
    ('Warehouse Construction', 'warehouse-construction', 'Industrial warehouse and distribution', '🏭', v_industry_id, 5, true),
    ('Ground-Up Commercial', 'ground-up-commercial', 'New commercial building construction', '🏗️', v_industry_id, 6, true),
    ('Hotel/Hospitality', 'hotel-hospitality', 'Hotel and hospitality construction', '🏨', v_industry_id, 7, true),
    ('Educational Facility', 'educational-facility', 'School and training facility construction', '🎓', v_industry_id, 8, true),
    ('Data Center', 'data-center', 'Data center and server room construction', '💾', v_industry_id, 9, true),
    ('Mixed-Use Development', 'mixed-use', 'Combined retail/office/residential projects', '🏙️', v_industry_id, 10, true)
  ON CONFLICT (slug) DO UPDATE
  SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    industry_id = EXCLUDED.industry_id,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_commercial_construction_project_types();

-- Create function to generate commercial construction work packs
CREATE OR REPLACE FUNCTION create_commercial_construction_work_packs()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
  v_project_type RECORD;
  v_work_pack_id UUID;
BEGIN
  -- Get commercial construction industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'commercial-construction'
  LIMIT 1;

  -- Create work packs for each project type
  FOR v_project_type IN 
    SELECT id, slug, name 
    FROM project_categories 
    WHERE industry_id = v_industry_id
  LOOP
    CASE v_project_type.slug
      WHEN 'office-buildout' THEN
        -- Budget Office
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Office Build-Out',
          'Basic office space, open plan, 3000-5000 sq ft',
          v_industry_id, v_project_type.id, 'budget',
          150000.00, 600, 30, true
        );
        
        -- Standard Office
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Office Build-Out',
          'Professional office with private offices and conference rooms, 5000-10000 sq ft',
          v_industry_id, v_project_type.id, 'standard',
          400000.00, 1000, 45, true
        );
        
        -- Premium Office
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Office Build-Out',
          'Executive office suite with high-end finishes, 10000+ sq ft',
          v_industry_id, v_project_type.id, 'premium',
          1000000.00, 1800, 75, true
        );

      WHEN 'retail-buildout' THEN
        -- Budget Retail
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Retail Build-Out',
          'Basic retail space, vanilla box finish, 2000-3000 sq ft',
          v_industry_id, v_project_type.id, 'budget',
          100000.00, 400, 21, true
        );
        
        -- Standard Retail
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Retail Build-Out',
          'Brand-specific retail with custom fixtures, 3000-5000 sq ft',
          v_industry_id, v_project_type.id, 'standard',
          250000.00, 700, 35, true
        );
        
        -- Premium Retail
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Retail Build-Out',
          'Flagship store with luxury finishes, 5000+ sq ft',
          v_industry_id, v_project_type.id, 'premium',
          600000.00, 1200, 60, true
        );

      WHEN 'restaurant-buildout' THEN
        -- Budget Restaurant
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Restaurant Build-Out',
          'Quick service restaurant, 1500-2500 sq ft',
          v_industry_id, v_project_type.id, 'budget',
          200000.00, 800, 45, true
        );
        
        -- Standard Restaurant
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Restaurant Build-Out',
          'Full service restaurant with bar, 3000-5000 sq ft',
          v_industry_id, v_project_type.id, 'standard',
          500000.00, 1400, 60, true
        );
        
        -- Premium Restaurant
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Restaurant Build-Out',
          'Fine dining with custom kitchen and finishes, 5000+ sq ft',
          v_industry_id, v_project_type.id, 'premium',
          1200000.00, 2200, 90, true
        );

      WHEN 'warehouse-construction' THEN
        -- Budget Warehouse
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Warehouse Construction',
          'Basic warehouse shell, 10000-20000 sq ft',
          v_industry_id, v_project_type.id, 'budget',
          600000.00, 1200, 90, true
        );
        
        -- Standard Warehouse
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Warehouse Construction',
          'Distribution center with office space, 20000-50000 sq ft',
          v_industry_id, v_project_type.id, 'standard',
          2000000.00, 2400, 150, true
        );
        
        -- Premium Warehouse
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Warehouse Construction',
          'High-bay automated warehouse, 50000+ sq ft',
          v_industry_id, v_project_type.id, 'premium',
          5000000.00, 4000, 240, true
        );

      ELSE
        -- Default work packs for other project types
        -- Budget
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget ' || v_project_type.name,
          'Basic ' || LOWER(v_project_type.name) || ' with standard finishes',
          v_industry_id, v_project_type.id, 'budget',
          300000.00, 800, 60, true
        );

        -- Standard
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard ' || v_project_type.name,
          'Quality ' || LOWER(v_project_type.name) || ' with upgraded systems',
          v_industry_id, v_project_type.id, 'standard',
          800000.00, 1600, 120, true
        );

        -- Premium
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium ' || v_project_type.name,
          'High-end ' || LOWER(v_project_type.name) || ' with premium features',
          v_industry_id, v_project_type.id, 'premium',
          2000000.00, 3000, 180, true
        );
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_commercial_construction_work_packs();

-- Create commercial construction document templates
CREATE OR REPLACE FUNCTION create_commercial_construction_documents()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
BEGIN
  -- Get commercial construction industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'commercial-construction'
  LIMIT 1;

  -- Commercial Construction Contract
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
    'Commercial Construction Contract',
    'Standard AIA-style commercial construction contract',
    'contract',
    v_industry_id,
    'COMMERCIAL CONSTRUCTION CONTRACT

This Agreement is made this {{contract_date}} between:

OWNER:
{{owner_name}}
{{owner_address}}
Contact: {{owner_contact}}
Phone: {{owner_phone}}
Email: {{owner_email}}

CONTRACTOR:
{{contractor_name}}
License #: {{contractor_license}}
{{contractor_address}}
Phone: {{contractor_phone}}
Email: {{contractor_email}}

PROJECT:
{{project_name}}
{{project_address}}

ARCHITECT:
{{architect_name}}
{{architect_contact}}

CONTRACT DOCUMENTS:
The Contract Documents consist of this Agreement, Conditions of the Contract, Drawings, Specifications, and all Addenda issued prior to execution of this Agreement.

SCOPE OF WORK:
The Contractor shall fully execute the Work described in the Contract Documents, except as specifically indicated in the Contract Documents to be the responsibility of others.

CONTRACT SUM:
The Owner shall pay the Contractor the Contract Sum of {{contract_sum}} subject to additions and deductions as provided in the Contract Documents.

PROGRESS PAYMENTS:
{{payment_terms}}

TIME OF COMMENCEMENT AND SUBSTANTIAL COMPLETION:
The Work shall commence on {{start_date}} and shall achieve Substantial Completion by {{completion_date}}, subject to adjustments as provided in the Contract Documents.

LIQUIDATED DAMAGES:
The Contractor shall pay liquidated damages of {{liquidated_damages}} per day for each day after the Substantial Completion date that the Work remains incomplete.

INSURANCE AND BONDS:
The Contractor shall purchase and maintain insurance as set forth in the Contract Documents. Performance Bond: {{performance_bond}}% Payment Bond: {{payment_bond}}%

RETAINAGE:
{{retainage_percentage}}% of each progress payment shall be retained until Final Completion.

SIGNATURES:

OWNER:                               CONTRACTOR:
_____________________               _____________________
{{owner_signature}}                 {{contractor_signature}}
Date: ________                      Date: ________',
    ARRAY[
      ROW('contract_date', 'Contract Date', 'date', true, CURRENT_DATE::text, NULL, 'Agreement date')::document_variable,
      ROW('owner_name', 'Owner Name', 'text', true, NULL, NULL, 'Property owner/developer')::document_variable,
      ROW('owner_address', 'Owner Address', 'text', true, NULL, NULL, 'Owner business address')::document_variable,
      ROW('owner_contact', 'Owner Contact', 'text', true, NULL, NULL, 'Owner representative')::document_variable,
      ROW('owner_phone', 'Owner Phone', 'text', true, NULL, NULL, 'Owner phone')::document_variable,
      ROW('owner_email', 'Owner Email', 'text', true, NULL, NULL, 'Owner email')::document_variable,
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'General contractor')::document_variable,
      ROW('contractor_license', 'License Number', 'text', true, NULL, NULL, 'Contractor license')::document_variable,
      ROW('contractor_address', 'Contractor Address', 'text', true, NULL, NULL, 'Contractor address')::document_variable,
      ROW('contractor_phone', 'Contractor Phone', 'text', true, NULL, NULL, 'Contractor phone')::document_variable,
      ROW('contractor_email', 'Contractor Email', 'text', true, NULL, NULL, 'Contractor email')::document_variable,
      ROW('project_name', 'Project Name', 'text', true, NULL, NULL, 'Project name')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Project location')::document_variable,
      ROW('architect_name', 'Architect Name', 'text', false, 'N/A', NULL, 'Project architect')::document_variable,
      ROW('architect_contact', 'Architect Contact', 'text', false, 'N/A', NULL, 'Architect contact info')::document_variable,
      ROW('contract_sum', 'Contract Sum', 'number', true, NULL, NULL, 'Total contract amount')::document_variable,
      ROW('payment_terms', 'Payment Terms', 'text', true, NULL, NULL, 'Payment schedule details')::document_variable,
      ROW('start_date', 'Start Date', 'date', true, NULL, NULL, 'Work commencement date')::document_variable,
      ROW('completion_date', 'Completion Date', 'date', true, NULL, NULL, 'Substantial completion date')::document_variable,
      ROW('liquidated_damages', 'Liquidated Damages', 'number', true, '1000', NULL, 'Daily liquidated damages')::document_variable,
      ROW('performance_bond', 'Performance Bond %', 'number', true, '100', NULL, 'Performance bond percentage')::document_variable,
      ROW('payment_bond', 'Payment Bond %', 'number', true, '100', NULL, 'Payment bond percentage')::document_variable,
      ROW('retainage_percentage', 'Retainage %', 'number', true, '10', NULL, 'Retainage percentage')::document_variable,
      ROW('owner_signature', 'Owner Signature', 'text', true, NULL, NULL, 'Owner signatory name')::document_variable,
      ROW('contractor_signature', 'Contractor Signature', 'text', true, NULL, NULL, 'Contractor signatory')::document_variable
    ],
    true,
    true
  );

  -- Subcontractor Agreement
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
    'Commercial Subcontractor Agreement',
    'Agreement between general contractor and subcontractor',
    'contract',
    v_industry_id,
    'SUBCONTRACTOR AGREEMENT

This Agreement is entered into on {{agreement_date}} between:

CONTRACTOR: {{contractor_name}} ("Contractor")
SUBCONTRACTOR: {{subcontractor_name}} ("Subcontractor")

PROJECT: {{project_name}}
LOCATION: {{project_address}}
PRIME CONTRACT: Contract between {{owner_name}} and Contractor dated {{prime_contract_date}}

SCOPE OF WORK:
Subcontractor shall provide all labor, materials, equipment, and services for:
{{scope_of_work}}

SUBCONTRACT AMOUNT: \${{subcontract_amount}}

SCHEDULE:
Start: {{start_date}}
Complete: {{completion_date}}

PAYMENT TERMS:
{{payment_terms}}
Retainage: {{retainage}}%

INSURANCE REQUIREMENTS:
General Liability: \${{gl_amount}} per occurrence
Workers Compensation: Statutory limits
Auto Liability: \${{auto_amount}}

INDEMNIFICATION:
Subcontractor shall indemnify and hold harmless Contractor and Owner from all claims arising from Subcontractor''s work.

SIGNATURES:

CONTRACTOR:                          SUBCONTRACTOR:
_____________________               _____________________
By: {{contractor_rep}}              By: {{subcontractor_rep}}
Date: ________                      Date: ________',
    ARRAY[
      ROW('agreement_date', 'Agreement Date', 'date', true, CURRENT_DATE::text, NULL, 'Agreement date')::document_variable,
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'General contractor')::document_variable,
      ROW('subcontractor_name', 'Subcontractor Name', 'text', true, NULL, NULL, 'Subcontractor company')::document_variable,
      ROW('project_name', 'Project Name', 'text', true, NULL, NULL, 'Project name')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Project location')::document_variable,
      ROW('owner_name', 'Owner Name', 'text', true, NULL, NULL, 'Property owner')::document_variable,
      ROW('prime_contract_date', 'Prime Contract Date', 'date', true, NULL, NULL, 'Main contract date')::document_variable,
      ROW('scope_of_work', 'Scope of Work', 'text', true, NULL, NULL, 'Subcontractor scope')::document_variable,
      ROW('subcontract_amount', 'Subcontract Amount', 'number', true, NULL, NULL, 'Total subcontract value')::document_variable,
      ROW('start_date', 'Start Date', 'date', true, NULL, NULL, 'Work start date')::document_variable,
      ROW('completion_date', 'Completion Date', 'date', true, NULL, NULL, 'Required completion')::document_variable,
      ROW('payment_terms', 'Payment Terms', 'text', true, 'Net 30 days after invoice', NULL, 'Payment schedule')::document_variable,
      ROW('retainage', 'Retainage %', 'number', true, '10', NULL, 'Retainage percentage')::document_variable,
      ROW('gl_amount', 'GL Coverage', 'text', true, '2,000,000', NULL, 'General liability amount')::document_variable,
      ROW('auto_amount', 'Auto Coverage', 'text', true, '1,000,000', NULL, 'Auto liability amount')::document_variable,
      ROW('contractor_rep', 'Contractor Rep', 'text', true, NULL, NULL, 'Contractor signatory')::document_variable,
      ROW('subcontractor_rep', 'Subcontractor Rep', 'text', true, NULL, NULL, 'Subcontractor signatory')::document_variable
    ],
    true,
    false
  );

  -- Certificate of Substantial Completion
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
    'Certificate of Substantial Completion',
    'Document certifying substantial completion of commercial project',
    'certificate',
    v_industry_id,
    'CERTIFICATE OF SUBSTANTIAL COMPLETION

Project: {{project_name}}
Location: {{project_address}}
Contract Date: {{contract_date}}
Contractor: {{contractor_name}}
Owner: {{owner_name}}
Architect: {{architect_name}}

TO OWNER AND CONTRACTOR:

The Work performed under this Contract has been reviewed and found to be substantially complete as of {{completion_date}}. The date of Substantial Completion is the date established by this Certificate.

DEFINITION OF SUBSTANTIAL COMPLETION:
The Work is substantially complete when construction is sufficiently complete so that the Owner can occupy or utilize the Work for its intended purpose.

ITEMS TO BE COMPLETED OR CORRECTED:
The following items must be completed or corrected before final payment:
{{punch_list_items}}

WARRANTIES:
The warranties required by the Contract Documents shall commence on the date of Substantial Completion.

RESPONSIBILITIES AFTER SUBSTANTIAL COMPLETION:
Owner: Utilities, insurance, security, and maintenance
Contractor: Completion of punch list items, warranties

SIGNATURES:

ARCHITECT:                           DATE:
_____________________               _________
{{architect_signature}}

CONTRACTOR:                          DATE:
_____________________               _________
{{contractor_signature}}

OWNER:                              DATE:
_____________________               _________
{{owner_signature}}',
    ARRAY[
      ROW('project_name', 'Project Name', 'text', true, NULL, NULL, 'Project name')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Project location')::document_variable,
      ROW('contract_date', 'Contract Date', 'date', true, NULL, NULL, 'Original contract date')::document_variable,
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'General contractor')::document_variable,
      ROW('owner_name', 'Owner Name', 'text', true, NULL, NULL, 'Property owner')::document_variable,
      ROW('architect_name', 'Architect Name', 'text', true, NULL, NULL, 'Project architect')::document_variable,
      ROW('completion_date', 'Completion Date', 'date', true, CURRENT_DATE::text, NULL, 'Substantial completion date')::document_variable,
      ROW('punch_list_items', 'Punch List Items', 'text', true, NULL, NULL, 'Remaining items')::document_variable,
      ROW('architect_signature', 'Architect Signature', 'text', true, NULL, NULL, 'Architect name')::document_variable,
      ROW('contractor_signature', 'Contractor Signature', 'text', true, NULL, NULL, 'Contractor signatory')::document_variable,
      ROW('owner_signature', 'Owner Signature', 'text', true, NULL, NULL, 'Owner signatory')::document_variable
    ],
    true,
    false
  );

END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_commercial_construction_documents();