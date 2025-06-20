-- Electrical Industry Data Migration
-- Creates comprehensive cost codes, project types, work packs, and documents for electrical contractors

-- First, ensure we have the electrical industry
INSERT INTO industries (name, slug, description, icon, is_active)
VALUES ('Electrical', 'electrical', 'Electrical contracting and services', '⚡', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Electrical Cost Codes
-- Service and Panel Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('EL001', 'Service Call', 'Diagnostic service call', 'service', 'hour', 125.00),
  ('EL002', 'Emergency Service', 'After-hours emergency call', 'service', 'hour', 185.00),
  ('EL003', 'Electrical Inspection', 'Code compliance inspection', 'service', 'ls', 350.00),
  ('EL004', 'Panel Upgrade - 100A', 'Upgrade to 100 amp service', 'material', 'ea', 1800.00),
  ('EL005', 'Panel Upgrade - 200A', 'Upgrade to 200 amp service', 'material', 'ea', 2800.00),
  ('EL006', 'Panel Upgrade - 400A', 'Upgrade to 400 amp service', 'material', 'ea', 5500.00),
  ('EL007', 'Sub Panel - 100A', 'Install 100A sub panel', 'material', 'ea', 850.00),
  ('EL008', 'Meter Base', 'New meter base installation', 'material', 'ea', 650.00),
  ('EL009', 'Service Entrance Cable', 'Service entrance wiring', 'material', 'lf', 18.00),
  ('EL010', 'Ground Rod System', 'Grounding system installation', 'material', 'set', 285.00),
  ('EL011', 'Panel Labor', 'Panel installation labor', 'labor', 'hour', 95.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Wiring and Circuit Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('EL100', 'Circuit - 15A', 'Install 15 amp circuit', 'material', 'ea', 225.00),
  ('EL101', 'Circuit - 20A', 'Install 20 amp circuit', 'material', 'ea', 250.00),
  ('EL102', 'Circuit - 30A', 'Install 30 amp circuit', 'material', 'ea', 325.00),
  ('EL103', 'Circuit - 50A', 'Install 50 amp circuit', 'material', 'ea', 450.00),
  ('EL104', 'Dedicated Circuit', 'Dedicated appliance circuit', 'material', 'ea', 385.00),
  ('EL105', 'GFCI Circuit', 'GFCI protected circuit', 'material', 'ea', 325.00),
  ('EL106', 'AFCI Circuit', 'Arc fault circuit', 'material', 'ea', 350.00),
  ('EL107', 'Romex 12-2', '12 gauge wire per foot', 'material', 'lf', 2.85),
  ('EL108', 'Romex 10-2', '10 gauge wire per foot', 'material', 'lf', 3.85),
  ('EL109', 'MC Cable', 'Metal clad cable per foot', 'material', 'lf', 4.50),
  ('EL110', 'Conduit - EMT', '1/2" EMT conduit', 'material', 'lf', 3.25),
  ('EL111', 'Wire Pulling', 'Wire installation labor', 'labor', 'hour', 85.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Outlet and Switch Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('EL200', 'Outlet - Standard', 'Standard duplex outlet', 'material', 'ea', 125.00),
  ('EL201', 'Outlet - GFCI', 'GFCI protected outlet', 'material', 'ea', 185.00),
  ('EL202', 'Outlet - USB', 'USB charging outlet', 'material', 'ea', 165.00),
  ('EL203', 'Outlet - 220V', '220V appliance outlet', 'material', 'ea', 285.00),
  ('EL204', 'Switch - Single Pole', 'Standard light switch', 'material', 'ea', 95.00),
  ('EL205', 'Switch - 3-Way', '3-way light switch', 'material', 'ea', 125.00),
  ('EL206', 'Switch - Dimmer', 'Dimmer switch installation', 'material', 'ea', 145.00),
  ('EL207', 'Switch - Smart', 'Smart/WiFi switch', 'material', 'ea', 225.00),
  ('EL208', 'Switch - Motion', 'Motion sensor switch', 'material', 'ea', 185.00),
  ('EL209', 'Switch - Timer', 'Timer switch installation', 'material', 'ea', 165.00),
  ('EL210', 'Device Installation', 'Outlet/switch labor', 'labor', 'ea', 45.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Lighting Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('EL300', 'Recessed Light - Standard', 'Standard can light', 'material', 'ea', 125.00),
  ('EL301', 'Recessed Light - LED', 'LED recessed light', 'material', 'ea', 165.00),
  ('EL302', 'Chandelier Install', 'Chandelier installation', 'labor', 'ea', 285.00),
  ('EL303', 'Pendant Light', 'Pendant light installation', 'material', 'ea', 185.00),
  ('EL304', 'Track Lighting', 'Track lighting system', 'material', 'lf', 85.00),
  ('EL305', 'Under Cabinet Light', 'Under cabinet LED strip', 'material', 'lf', 45.00),
  ('EL306', 'Ceiling Fan', 'Ceiling fan installation', 'material', 'ea', 325.00),
  ('EL307', 'Ceiling Fan - Remote', 'Fan with remote control', 'material', 'ea', 425.00),
  ('EL308', 'Exterior Light', 'Outdoor light fixture', 'material', 'ea', 225.00),
  ('EL309', 'Landscape Lighting', 'Low voltage landscape', 'material', 'ea', 125.00),
  ('EL310', 'Emergency Lighting', 'Emergency/exit lights', 'material', 'ea', 285.00),
  ('EL311', 'Light Installation', 'General lighting labor', 'labor', 'hour', 85.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Specialty Electrical Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('EL400', 'EV Charger - Level 2', 'Electric vehicle charger', 'material', 'ea', 1850.00),
  ('EL401', 'Generator Connection', 'Generator transfer switch', 'material', 'ea', 1450.00),
  ('EL402', 'Whole House Surge', 'Surge protection system', 'material', 'ea', 650.00),
  ('EL403', 'Solar Disconnect', 'Solar system disconnect', 'material', 'ea', 450.00),
  ('EL404', 'Pool/Spa Wiring', 'Pool equipment wiring', 'subcontractor', 'ls', 2200.00),
  ('EL405', 'Hot Tub Connection', 'Hot tub electrical hookup', 'material', 'ea', 850.00),
  ('EL406', 'Data Cable - Cat6', 'Cat6 network cable', 'material', 'run', 185.00),
  ('EL407', 'Coax Cable', 'RG6 coaxial cable', 'material', 'run', 125.00),
  ('EL408', 'Home Theater Wiring', 'Theater pre-wire package', 'material', 'room', 850.00),
  ('EL409', 'Security Pre-Wire', 'Security system wiring', 'material', 'opening', 85.00),
  ('EL410', 'Smart Home Hub', 'Smart home system setup', 'material', 'ls', 650.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Commercial/Industrial Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('EL500', 'Commercial Panel', '3-phase panel installation', 'material', 'ea', 4500.00),
  ('EL501', '277V Lighting', '277V lighting circuit', 'material', 'ea', 385.00),
  ('EL502', 'Motor Connection', 'Motor wiring and control', 'labor', 'hp', 125.00),
  ('EL503', 'VFD Installation', 'Variable frequency drive', 'material', 'ea', 2850.00),
  ('EL504', 'Transformer Install', 'Dry type transformer', 'material', 'kva', 285.00),
  ('EL505', 'Emergency Generator', 'Standby generator install', 'subcontractor', 'kw', 850.00),
  ('EL506', 'Fire Alarm System', 'Fire alarm installation', 'subcontractor', 'device', 285.00),
  ('EL507', 'Exit/Emergency Light', 'Exit sign with battery', 'material', 'ea', 225.00),
  ('EL508', 'Industrial Outlet', 'Heavy duty receptacle', 'material', 'ea', 385.00),
  ('EL509', 'Busway/Bus Duct', 'Electrical busway', 'material', 'lf', 185.00),
  ('EL510', 'Lightning Protection', 'Lightning rod system', 'subcontractor', 'ls', 4500.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Troubleshooting and Repair Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('EL600', 'Troubleshooting', 'Electrical troubleshooting', 'labor', 'hour', 125.00),
  ('EL601', 'Circuit Tracing', 'Trace and label circuits', 'service', 'hour', 95.00),
  ('EL602', 'Outlet Repair', 'Repair faulty outlet', 'labor', 'ea', 165.00),
  ('EL603', 'Switch Repair', 'Repair faulty switch', 'labor', 'ea', 145.00),
  ('EL604', 'Breaker Replacement', 'Replace circuit breaker', 'material', 'ea', 185.00),
  ('EL605', 'GFCI Troubleshoot', 'Diagnose GFCI issues', 'service', 'hour', 125.00),
  ('EL606', 'Short Circuit Repair', 'Find and fix short', 'labor', 'hour', 145.00),
  ('EL607', 'Code Violation Fix', 'Correct code violations', 'labor', 'ea', 225.00),
  ('EL608', 'Aluminum Wiring', 'Aluminum wire remediation', 'labor', 'connection', 45.00),
  ('EL609', 'Knob & Tube Removal', 'Remove old wiring', 'labor', 'lf', 18.00),
  ('EL610', 'Arc Fault Repair', 'Diagnose arc fault issues', 'service', 'hour', 145.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Create function to add electrical project types
CREATE OR REPLACE FUNCTION create_electrical_project_types()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
BEGIN
  -- Get electrical industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'electrical'
  LIMIT 1;
  
  -- Insert electrical project types
  INSERT INTO project_categories (name, slug, description, icon, industry_id, display_order, is_active) VALUES
    ('Panel Upgrade', 'panel-upgrade', 'Electrical service panel upgrades', '⚡', v_industry_id, 1, true),
    ('Whole House Rewire', 'whole-house-rewire', 'Complete home electrical rewiring', '🏠', v_industry_id, 2, true),
    ('Lighting Installation', 'lighting-installation', 'Interior and exterior lighting projects', '💡', v_industry_id, 3, true),
    ('EV Charger Install', 'ev-charger', 'Electric vehicle charging station', '🔌', v_industry_id, 4, true),
    ('Generator Installation', 'generator-install', 'Backup generator systems', '🔋', v_industry_id, 5, true),
    ('Smart Home Wiring', 'smart-home', 'Home automation and smart device wiring', '📱', v_industry_id, 6, true),
    ('Commercial Electrical', 'commercial-electrical', 'Commercial electrical installations', '🏢', v_industry_id, 7, true),
    ('Industrial Electrical', 'industrial-electrical', 'Industrial power and control systems', '🏭', v_industry_id, 8, true),
    ('Solar Installation', 'solar-installation', 'Solar panel electrical connections', '☀️', v_industry_id, 9, true),
    ('Emergency Repairs', 'emergency-repairs', 'Emergency electrical repairs', '🚨', v_industry_id, 10, true)
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
SELECT create_electrical_project_types();

-- Create function to generate electrical work packs
CREATE OR REPLACE FUNCTION create_electrical_work_packs()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
  v_project_type RECORD;
  v_work_pack_id UUID;
BEGIN
  -- Get electrical industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'electrical'
  LIMIT 1;

  -- Create work packs for each project type
  FOR v_project_type IN 
    SELECT id, slug, name 
    FROM project_categories 
    WHERE industry_id = v_industry_id
  LOOP
    CASE v_project_type.slug
      WHEN 'panel-upgrade' THEN
        -- Budget Panel
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Panel Upgrade',
          'Basic 100A to 200A panel upgrade with standard breakers',
          v_industry_id, v_project_type.id, 'budget',
          2800.00, 16, 2, true
        );
        
        -- Standard Panel
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Panel Upgrade',
          '200A panel with surge protection and smart breakers',
          v_industry_id, v_project_type.id, 'standard',
          4500.00, 24, 3, true
        );
        
        -- Premium Panel
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Panel Upgrade',
          '400A service with generator integration and whole-house surge',
          v_industry_id, v_project_type.id, 'premium',
          8500.00, 40, 5, true
        );

      WHEN 'whole-house-rewire' THEN
        -- Budget Rewire
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget House Rewire',
          'Basic rewire 1500 sq ft home, code compliance',
          v_industry_id, v_project_type.id, 'budget',
          8000.00, 80, 10, true
        );
        
        -- Standard Rewire
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard House Rewire',
          'Complete rewire 2500 sq ft with added circuits and upgrades',
          v_industry_id, v_project_type.id, 'standard',
          15000.00, 120, 15, true
        );
        
        -- Premium Rewire
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium House Rewire',
          'Luxury home rewire with smart home integration, 3500+ sq ft',
          v_industry_id, v_project_type.id, 'premium',
          30000.00, 200, 25, true
        );

      WHEN 'ev-charger' THEN
        -- Budget EV
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget EV Charger Install',
          'Basic Level 2 charger, existing adequate service',
          v_industry_id, v_project_type.id, 'budget',
          1500.00, 6, 1, true
        );
        
        -- Standard EV
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard EV Charger Install',
          'Level 2 charger with dedicated circuit and disconnect',
          v_industry_id, v_project_type.id, 'standard',
          2500.00, 10, 2, true
        );
        
        -- Premium EV
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium EV Charger Install',
          'Dual chargers with load management and panel upgrade',
          v_industry_id, v_project_type.id, 'premium',
          6000.00, 24, 3, true
        );

      WHEN 'generator-install' THEN
        -- Budget Generator
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Generator Install',
          'Portable generator connection with manual transfer switch',
          v_industry_id, v_project_type.id, 'budget',
          1800.00, 12, 2, true
        );
        
        -- Standard Generator
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Generator Install',
          '22kW standby generator with automatic transfer switch',
          v_industry_id, v_project_type.id, 'standard',
          8500.00, 24, 3, true
        );
        
        -- Premium Generator
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Generator Install',
          'Whole-house generator system with load management',
          v_industry_id, v_project_type.id, 'premium',
          15000.00, 40, 5, true
        );

      ELSE
        -- Default work packs for other project types
        -- Budget
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget ' || v_project_type.name,
          'Basic ' || LOWER(v_project_type.name) || ' installation',
          v_industry_id, v_project_type.id, 'budget',
          2000.00, 16, 2, true
        );

        -- Standard
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard ' || v_project_type.name,
          'Professional ' || LOWER(v_project_type.name) || ' with quality components',
          v_industry_id, v_project_type.id, 'standard',
          4000.00, 32, 4, true
        );

        -- Premium
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium ' || v_project_type.name,
          'High-end ' || LOWER(v_project_type.name) || ' with premium features',
          v_industry_id, v_project_type.id, 'premium',
          8000.00, 56, 7, true
        );
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_electrical_work_packs();

-- Create electrical document templates
CREATE OR REPLACE FUNCTION create_electrical_documents()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
BEGIN
  -- Get electrical industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'electrical'
  LIMIT 1;

  -- Electrical Service Agreement
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
    'Electrical Service Agreement',
    'Standard electrical contractor service agreement',
    'contract',
    v_industry_id,
    'ELECTRICAL SERVICE AGREEMENT

This Agreement is entered into on {{agreement_date}} between:

ELECTRICAL CONTRACTOR:
{{contractor_name}}
License #: {{license_number}}
{{contractor_address}}
Phone: {{contractor_phone}}
Email: {{contractor_email}}

CUSTOMER:
{{customer_name}}
{{customer_address}}
Phone: {{customer_phone}}
Email: {{customer_email}}

SERVICE LOCATION: {{service_address}}

SCOPE OF WORK:
{{scope_description}}

MATERIALS TO BE PROVIDED:
{{materials_list}}

PRICING:
Labor Rate: \${{labor_rate}}/hour
Material Markup: {{material_markup}}%
Total Estimated Cost: \${{total_estimate}}

PAYMENT TERMS:
{{payment_terms}}

WORK SCHEDULE:
Start Date: {{start_date}}
Estimated Completion: {{completion_date}}
Working Hours: {{working_hours}}

PERMITS:
Contractor will obtain all necessary electrical permits. Permit fees {{permit_responsibility}}.

WARRANTY:
All work is warranted for {{warranty_period}} from completion. This covers defects in workmanship but excludes damage from misuse or acts of nature.

ELECTRICAL SAFETY:
All work will be performed in accordance with the National Electrical Code (NEC) and local codes. Customer agrees to keep work area clear and safe.

LIABILITY:
Contractor carries General Liability insurance of \${{liability_amount}} and is properly licensed and bonded.

ADDITIONAL TERMS:
1. Additional work not in original scope requires written approval
2. Customer to provide clear access to work areas
3. Contractor not responsible for damage to concealed wiring or utilities
4. This estimate valid for {{estimate_validity}} days

ACCEPTANCE:

CUSTOMER:                           CONTRACTOR:
_____________________              _____________________
{{customer_name}}                  {{contractor_name}}
Date: ________                     Date: ________',
    ARRAY[
      ROW('agreement_date', 'Agreement Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of agreement')::document_variable,
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'Electrical contractor name')::document_variable,
      ROW('license_number', 'License Number', 'text', true, NULL, NULL, 'Electrical license')::document_variable,
      ROW('contractor_address', 'Contractor Address', 'text', true, NULL, NULL, 'Business address')::document_variable,
      ROW('contractor_phone', 'Contractor Phone', 'text', true, NULL, NULL, 'Business phone')::document_variable,
      ROW('contractor_email', 'Contractor Email', 'text', true, NULL, NULL, 'Business email')::document_variable,
      ROW('customer_name', 'Customer Name', 'text', true, NULL, NULL, 'Customer name')::document_variable,
      ROW('customer_address', 'Customer Address', 'text', true, NULL, NULL, 'Customer address')::document_variable,
      ROW('customer_phone', 'Customer Phone', 'text', true, NULL, NULL, 'Customer phone')::document_variable,
      ROW('customer_email', 'Customer Email', 'text', true, NULL, NULL, 'Customer email')::document_variable,
      ROW('service_address', 'Service Address', 'text', true, NULL, NULL, 'Job location')::document_variable,
      ROW('scope_description', 'Scope Description', 'text', true, NULL, NULL, 'Work to be performed')::document_variable,
      ROW('materials_list', 'Materials List', 'text', true, NULL, NULL, 'Materials to be used')::document_variable,
      ROW('labor_rate', 'Labor Rate', 'number', true, '125', NULL, 'Hourly labor rate')::document_variable,
      ROW('material_markup', 'Material Markup', 'number', true, '20', NULL, 'Markup percentage')::document_variable,
      ROW('total_estimate', 'Total Estimate', 'number', true, NULL, NULL, 'Total estimated cost')::document_variable,
      ROW('payment_terms', 'Payment Terms', 'text', true, '50% deposit, balance on completion', NULL, 'Payment schedule')::document_variable,
      ROW('start_date', 'Start Date', 'date', true, NULL, NULL, 'Work start date')::document_variable,
      ROW('completion_date', 'Completion Date', 'date', true, NULL, NULL, 'Estimated completion')::document_variable,
      ROW('working_hours', 'Working Hours', 'text', true, '8 AM - 5 PM', NULL, 'Daily work hours')::document_variable,
      ROW('permit_responsibility', 'Permit Responsibility', 'text', true, 'are included in estimate', NULL, 'Who pays permits')::document_variable,
      ROW('warranty_period', 'Warranty Period', 'text', true, '1 year', NULL, 'Warranty duration')::document_variable,
      ROW('liability_amount', 'Liability Coverage', 'text', true, '2,000,000', NULL, 'Insurance coverage')::document_variable,
      ROW('estimate_validity', 'Estimate Validity', 'number', true, '30', NULL, 'Days estimate valid')::document_variable
    ],
    true,
    true
  );

  -- Electrical Safety Inspection Report
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
    'Electrical Safety Inspection Report',
    'Comprehensive electrical system inspection checklist',
    'inspection',
    v_industry_id,
    'ELECTRICAL SAFETY INSPECTION REPORT

Property: {{property_address}}
Owner: {{owner_name}}
Date: {{inspection_date}}
Inspector: {{inspector_name}}
License #: {{inspector_license}}

ELECTRICAL SERVICE:
Service Size: {{service_size}} Amps
Service Type: {{service_type}}
Panel Manufacturer: {{panel_manufacturer}}
Panel Condition: {{panel_condition}}

INSPECTION CHECKLIST:

SERVICE ENTRANCE:
[ ] Meter base secure and weatherproof
[ ] Service mast properly supported
[ ] Service cable in good condition
[ ] Proper clearances maintained
[ ] Grounding electrode connected
Notes: {{service_notes}}

MAIN PANEL:
[ ] Panel properly labeled
[ ] No double-tapped breakers
[ ] Proper wire gauge for breakers
[ ] No missing knockouts
[ ] Panel not overfilled
[ ] AFCI/GFCI breakers as required
[ ] Neutral and ground separated
Notes: {{panel_notes}}

BRANCH CIRCUITS:
[ ] Outlets properly grounded
[ ] GFCI protection in wet areas
[ ] No reverse polarity
[ ] Proper wire connections
[ ] No aluminum wiring issues
[ ] Adequate circuit capacity
Notes: {{circuit_notes}}

GENERAL SAFETY:
[ ] No exposed wiring
[ ] Junction boxes covered
[ ] Proper working clearances
[ ] No overloaded circuits
[ ] Smoke detectors powered
[ ] No flickering lights
[ ] No burning smells
Notes: {{safety_notes}}

CODE VIOLATIONS FOUND:
{{violations_list}}

RECOMMENDATIONS:
{{recommendations}}

OVERALL ASSESSMENT:
[ ] PASS - System meets safety standards
[ ] FAIL - Corrections required
[ ] CONDITIONAL - Minor issues to address

Inspector Signature: _____________________
Date: {{inspection_date}}',
    ARRAY[
      ROW('property_address', 'Property Address', 'text', true, NULL, NULL, 'Inspection location')::document_variable,
      ROW('owner_name', 'Owner Name', 'text', true, NULL, NULL, 'Property owner')::document_variable,
      ROW('inspection_date', 'Inspection Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of inspection')::document_variable,
      ROW('inspector_name', 'Inspector Name', 'text', true, NULL, NULL, 'Inspector name')::document_variable,
      ROW('inspector_license', 'Inspector License', 'text', true, NULL, NULL, 'Inspector license number')::document_variable,
      ROW('service_size', 'Service Size', 'text', true, NULL, NULL, 'Electrical service amperage')::document_variable,
      ROW('service_type', 'Service Type', 'text', true, 'Overhead', NULL, 'Overhead or underground')::document_variable,
      ROW('panel_manufacturer', 'Panel Manufacturer', 'text', true, NULL, NULL, 'Panel brand')::document_variable,
      ROW('panel_condition', 'Panel Condition', 'text', true, NULL, NULL, 'Panel condition assessment')::document_variable,
      ROW('service_notes', 'Service Notes', 'text', false, 'No issues found', NULL, 'Service entrance notes')::document_variable,
      ROW('panel_notes', 'Panel Notes', 'text', false, 'No issues found', NULL, 'Main panel notes')::document_variable,
      ROW('circuit_notes', 'Circuit Notes', 'text', false, 'No issues found', NULL, 'Branch circuit notes')::document_variable,
      ROW('safety_notes', 'Safety Notes', 'text', false, 'No issues found', NULL, 'General safety notes')::document_variable,
      ROW('violations_list', 'Violations', 'text', false, 'None', NULL, 'Code violations found')::document_variable,
      ROW('recommendations', 'Recommendations', 'text', false, 'None', NULL, 'Recommended improvements')::document_variable
    ],
    true,
    false
  );

  -- Electrical Load Calculation
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
    'Electrical Load Calculation',
    'NEC compliant load calculation worksheet',
    'calculation',
    v_industry_id,
    'ELECTRICAL LOAD CALCULATION WORKSHEET

Project: {{project_name}}
Address: {{project_address}}
Date: {{calculation_date}}
Prepared By: {{preparer_name}}

GENERAL INFORMATION:
Square Footage: {{square_footage}} sq ft
Service Voltage: {{service_voltage}}V
Service Type: {{service_type}}

GENERAL LIGHTING LOAD (NEC 220.12):
{{square_footage}} sq ft × 3 VA/sq ft = {{lighting_load}} VA

SMALL APPLIANCE CIRCUITS (NEC 220.52):
Kitchen: 2 circuits × 1,500 VA = 3,000 VA
Laundry: 1 circuit × 1,500 VA = 1,500 VA
Subtotal: {{small_appliance_load}} VA

FIXED APPLIANCES:
Range/Oven: {{range_load}} VA
Dryer: {{dryer_load}} VA
Water Heater: {{water_heater_load}} VA
Dishwasher: {{dishwasher_load}} VA
Disposal: {{disposal_load}} VA
HVAC: {{hvac_load}} VA
Other: {{other_loads}} VA
Subtotal: {{fixed_appliance_total}} VA

TOTAL CONNECTED LOAD: {{total_connected}} VA

DEMAND FACTORS APPLIED:
First 3,000 VA @ 100% = 3,000 VA
Next {{next_amount}} VA @ 35% = {{next_calc}} VA
Remaining @ 25% = {{remaining_calc}} VA

TOTAL DEMAND LOAD: {{total_demand}} VA

SERVICE SIZE CALCULATION:
{{total_demand}} VA ÷ {{service_voltage}}V = {{calculated_amps}} Amps

RECOMMENDED SERVICE SIZE: {{recommended_service}} Amps

NOTES:
{{calculation_notes}}

Prepared By: _____________________
License #: {{license_number}}
Date: {{calculation_date}}',
    ARRAY[
      ROW('project_name', 'Project Name', 'text', true, NULL, NULL, 'Project name')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Project location')::document_variable,
      ROW('calculation_date', 'Calculation Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of calculation')::document_variable,
      ROW('preparer_name', 'Preparer Name', 'text', true, NULL, NULL, 'Person preparing calc')::document_variable,
      ROW('square_footage', 'Square Footage', 'number', true, NULL, NULL, 'Building square footage')::document_variable,
      ROW('service_voltage', 'Service Voltage', 'number', true, '240', NULL, 'Service voltage')::document_variable,
      ROW('service_type', 'Service Type', 'text', true, 'Single Phase', NULL, 'Phase configuration')::document_variable,
      ROW('lighting_load', 'Lighting Load', 'number', true, NULL, NULL, 'General lighting VA')::document_variable,
      ROW('small_appliance_load', 'Small Appliance', 'number', true, '4500', NULL, 'Small appliance VA')::document_variable,
      ROW('range_load', 'Range Load', 'number', true, '8000', NULL, 'Range/oven VA')::document_variable,
      ROW('dryer_load', 'Dryer Load', 'number', true, '5000', NULL, 'Dryer VA')::document_variable,
      ROW('water_heater_load', 'Water Heater', 'number', true, '4500', NULL, 'Water heater VA')::document_variable,
      ROW('dishwasher_load', 'Dishwasher', 'number', true, '1200', NULL, 'Dishwasher VA')::document_variable,
      ROW('disposal_load', 'Disposal', 'number', true, '750', NULL, 'Disposal VA')::document_variable,
      ROW('hvac_load', 'HVAC Load', 'number', true, '0', NULL, 'HVAC system VA')::document_variable,
      ROW('other_loads', 'Other Loads', 'number', true, '0', NULL, 'Other loads VA')::document_variable,
      ROW('fixed_appliance_total', 'Fixed Total', 'number', true, NULL, NULL, 'Total fixed appliances')::document_variable,
      ROW('total_connected', 'Total Connected', 'number', true, NULL, NULL, 'Total connected load')::document_variable,
      ROW('next_amount', 'Next Amount', 'number', true, '117000', NULL, 'Next VA amount')::document_variable,
      ROW('next_calc', 'Next Calc', 'number', true, NULL, NULL, 'Next calculation')::document_variable,
      ROW('remaining_calc', 'Remaining Calc', 'number', true, NULL, NULL, 'Remaining calculation')::document_variable,
      ROW('total_demand', 'Total Demand', 'number', true, NULL, NULL, 'Total demand load')::document_variable,
      ROW('calculated_amps', 'Calculated Amps', 'number', true, NULL, NULL, 'Calculated amperage')::document_variable,
      ROW('recommended_service', 'Recommended Service', 'number', true, NULL, NULL, 'Recommended amps')::document_variable,
      ROW('calculation_notes', 'Notes', 'text', false, '', NULL, 'Additional notes')::document_variable,
      ROW('license_number', 'License Number', 'text', true, NULL, NULL, 'Preparer license')::document_variable
    ],
    true,
    false
  );

END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_electrical_documents();