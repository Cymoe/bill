-- Plumbing Industry Data Migration
-- Creates comprehensive cost codes, project types, work packs, and documents for plumbing contractors

-- First, ensure we have the plumbing industry
INSERT INTO industries (name, slug, description, icon, is_active)
VALUES ('Plumbing', 'plumbing', 'Plumbing contracting and services', '🚿', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Plumbing Cost Codes
-- Service and Diagnostic Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('PL001', 'Service Call', 'Diagnostic service call', 'service', 'hour', 125.00),
  ('PL002', 'Emergency Service', 'After-hours emergency call', 'service', 'hour', 225.00),
  ('PL003', 'Camera Inspection', 'Video pipe inspection', 'service', 'ls', 350.00),
  ('PL004', 'Leak Detection', 'Electronic leak detection', 'service', 'hour', 185.00),
  ('PL005', 'Plumbing Inspection', 'Code compliance inspection', 'service', 'ls', 295.00),
  ('PL006', 'Water Test', 'Water quality testing', 'service', 'ls', 125.00),
  ('PL007', 'Pressure Test', 'System pressure testing', 'service', 'ls', 175.00),
  ('PL008', 'Locate & Mark', 'Locate and mark utilities', 'service', 'hour', 95.00),
  ('PL009', 'Permit Pull', 'Obtain plumbing permits', 'service', 'ls', 250.00),
  ('PL010', 'Backflow Test', 'Annual backflow testing', 'service', 'device', 125.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Water Heater Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('PL100', 'Water Heater - 40 Gal', '40 gallon tank installation', 'material', 'ea', 1450.00),
  ('PL101', 'Water Heater - 50 Gal', '50 gallon tank installation', 'material', 'ea', 1650.00),
  ('PL102', 'Water Heater - 75 Gal', '75 gallon tank installation', 'material', 'ea', 2250.00),
  ('PL103', 'Tankless - Gas', 'Gas tankless water heater', 'material', 'ea', 3850.00),
  ('PL104', 'Tankless - Electric', 'Electric tankless heater', 'material', 'ea', 2450.00),
  ('PL105', 'Expansion Tank', 'Thermal expansion tank', 'material', 'ea', 285.00),
  ('PL106', 'Recirculation Pump', 'Hot water recirculation', 'material', 'ea', 650.00),
  ('PL107', 'Water Heater Pan', 'Drain pan installation', 'material', 'ea', 125.00),
  ('PL108', 'T&P Valve', 'Temperature & pressure valve', 'material', 'ea', 145.00),
  ('PL109', 'Gas Line', 'Gas line for water heater', 'material', 'lf', 45.00),
  ('PL110', 'Heater Labor', 'Water heater install labor', 'labor', 'hour', 125.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Fixture Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('PL200', 'Toilet - Standard', 'Standard toilet install', 'material', 'ea', 450.00),
  ('PL201', 'Toilet - Comfort Height', 'ADA height toilet', 'material', 'ea', 550.00),
  ('PL202', 'Toilet - Smart', 'Smart toilet/bidet', 'material', 'ea', 2850.00),
  ('PL203', 'Sink - Bathroom', 'Bathroom sink install', 'material', 'ea', 385.00),
  ('PL204', 'Sink - Kitchen', 'Kitchen sink install', 'material', 'ea', 650.00),
  ('PL205', 'Sink - Utility', 'Utility/laundry sink', 'material', 'ea', 325.00),
  ('PL206', 'Faucet - Bathroom', 'Bathroom faucet install', 'material', 'ea', 285.00),
  ('PL207', 'Faucet - Kitchen', 'Kitchen faucet install', 'material', 'ea', 425.00),
  ('PL208', 'Shower Valve', 'Shower valve installation', 'material', 'ea', 485.00),
  ('PL209', 'Tub - Standard', 'Standard tub installation', 'material', 'ea', 850.00),
  ('PL210', 'Tub - Freestanding', 'Freestanding tub install', 'material', 'ea', 1850.00),
  ('PL211', 'Shower - Prefab', 'Prefab shower unit', 'material', 'ea', 1250.00),
  ('PL212', 'Garbage Disposal', 'Disposal installation', 'material', 'ea', 385.00),
  ('PL213', 'Dishwasher Hook-Up', 'Dishwasher connection', 'labor', 'ea', 225.00),
  ('PL214', 'Ice Maker Line', 'Refrigerator water line', 'material', 'ea', 165.00),
  ('PL215', 'Fixture Labor', 'Fixture install labor', 'labor', 'hour', 95.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Piping and Rough-In Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('PL300', 'Copper Pipe - 1/2"', '1/2" copper pipe', 'material', 'lf', 12.00),
  ('PL301', 'Copper Pipe - 3/4"', '3/4" copper pipe', 'material', 'lf', 15.00),
  ('PL302', 'Copper Pipe - 1"', '1" copper pipe', 'material', 'lf', 22.00),
  ('PL303', 'PEX Pipe - 1/2"', '1/2" PEX pipe', 'material', 'lf', 3.50),
  ('PL304', 'PEX Pipe - 3/4"', '3/4" PEX pipe', 'material', 'lf', 4.50),
  ('PL305', 'CPVC Pipe', 'CPVC pipe installation', 'material', 'lf', 5.50),
  ('PL306', 'Cast Iron Pipe', 'Cast iron drain pipe', 'material', 'lf', 45.00),
  ('PL307', 'PVC Drain - 2"', '2" PVC drain pipe', 'material', 'lf', 8.50),
  ('PL308', 'PVC Drain - 3"', '3" PVC drain pipe', 'material', 'lf', 12.00),
  ('PL309', 'PVC Drain - 4"', '4" PVC drain pipe', 'material', 'lf', 15.00),
  ('PL310', 'Rough-In - Bath', 'Bathroom rough plumbing', 'labor', 'fixture', 850.00),
  ('PL311', 'Rough-In - Kitchen', 'Kitchen rough plumbing', 'labor', 'ls', 1250.00),
  ('PL312', 'Pipe Insulation', 'Pipe insulation install', 'material', 'lf', 4.50),
  ('PL313', 'Shut-Off Valve', 'Install shut-off valve', 'material', 'ea', 85.00),
  ('PL314', 'Pressure Regulator', 'PRV installation', 'material', 'ea', 385.00),
  ('PL315', 'Pipe Labor', 'Pipe installation labor', 'labor', 'hour', 95.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Drain Cleaning and Repair Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('PL400', 'Drain Snake - Basic', 'Basic drain cleaning', 'service', 'ea', 185.00),
  ('PL401', 'Drain Snake - Main', 'Main line cleaning', 'service', 'ea', 485.00),
  ('PL402', 'Hydro Jetting', 'High pressure cleaning', 'service', 'hour', 385.00),
  ('PL403', 'Root Cutting', 'Sewer root removal', 'service', 'hour', 485.00),
  ('PL404', 'Pipe Repair - Minor', 'Small pipe repair', 'labor', 'ea', 285.00),
  ('PL405', 'Pipe Repair - Major', 'Major pipe repair', 'labor', 'lf', 125.00),
  ('PL406', 'Pipe Burst Repair', 'Emergency burst repair', 'labor', 'ea', 685.00),
  ('PL407', 'Slab Leak Repair', 'Under slab leak repair', 'labor', 'ea', 1850.00),
  ('PL408', 'Re-Route Pipes', 'Re-route plumbing lines', 'labor', 'lf', 85.00),
  ('PL409', 'Epoxy Lining', 'Pipe epoxy lining', 'subcontractor', 'lf', 125.00),
  ('PL410', 'Trenchless Repair', 'No-dig pipe repair', 'subcontractor', 'lf', 285.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Water Treatment and Specialty Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('PL500', 'Water Softener', 'Water softener system', 'material', 'ea', 2850.00),
  ('PL501', 'Water Filter - Whole House', 'Whole house filtration', 'material', 'ea', 1850.00),
  ('PL502', 'Water Filter - Under Sink', 'Point of use filter', 'material', 'ea', 485.00),
  ('PL503', 'Reverse Osmosis', 'RO system installation', 'material', 'ea', 685.00),
  ('PL504', 'UV Purification', 'UV water treatment', 'material', 'ea', 1250.00),
  ('PL505', 'Sump Pump', 'Sump pump installation', 'material', 'ea', 850.00),
  ('PL506', 'Sewage Pump', 'Sewage ejector pump', 'material', 'ea', 1450.00),
  ('PL507', 'Backflow Preventer', 'Backflow device install', 'material', 'ea', 850.00),
  ('PL508', 'Gas Line - Interior', 'Gas pipe installation', 'subcontractor', 'lf', 65.00),
  ('PL509', 'Gas Line - Exterior', 'Underground gas line', 'subcontractor', 'lf', 85.00),
  ('PL510', 'Medical Gas', 'Medical gas piping', 'subcontractor', 'outlet', 385.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Commercial Plumbing Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('PL600', 'Commercial Toilet', 'Commercial grade toilet', 'material', 'ea', 850.00),
  ('PL601', 'Urinal', 'Urinal installation', 'material', 'ea', 750.00),
  ('PL602', 'Floor Drain', 'Floor drain installation', 'material', 'ea', 485.00),
  ('PL603', 'Grease Trap', 'Grease trap installation', 'material', 'ea', 2850.00),
  ('PL604', 'Mop Sink', 'Janitor sink install', 'material', 'ea', 685.00),
  ('PL605', 'Eye Wash Station', 'Emergency eye wash', 'material', 'ea', 850.00),
  ('PL606', 'Drinking Fountain', 'Water fountain install', 'material', 'ea', 1250.00),
  ('PL607', 'Commercial Kitchen', 'Restaurant plumbing', 'subcontractor', 'fixture', 1850.00),
  ('PL608', 'Lab Plumbing', 'Laboratory fixtures', 'subcontractor', 'fixture', 1450.00),
  ('PL609', 'Roof Drain', 'Roof drainage system', 'material', 'ea', 685.00),
  ('PL610', 'Fire Sprinkler Tie-In', 'Fire system connection', 'subcontractor', 'ea', 1850.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Create function to add plumbing project types
CREATE OR REPLACE FUNCTION create_plumbing_project_types()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
BEGIN
  -- Get plumbing industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'plumbing'
  LIMIT 1;
  
  -- Insert plumbing project types
  INSERT INTO project_categories (name, slug, description, icon, industry_id, display_order, is_active) VALUES
    ('Water Heater Replacement', 'water-heater', 'Water heater installation and replacement', '🔥', v_industry_id, 1, true),
    ('Bathroom Plumbing', 'bathroom-plumbing', 'Complete bathroom plumbing renovation', '🚿', v_industry_id, 2, true),
    ('Kitchen Plumbing', 'kitchen-plumbing', 'Kitchen plumbing and fixture installation', '🍳', v_industry_id, 3, true),
    ('Whole House Re-Pipe', 'whole-house-repipe', 'Complete home re-piping', '🏠', v_industry_id, 4, true),
    ('Drain Cleaning', 'drain-cleaning', 'Drain cleaning and maintenance', '🚰', v_industry_id, 5, true),
    ('Sewer Line Repair', 'sewer-repair', 'Sewer line repair and replacement', '🔧', v_industry_id, 6, true),
    ('Water Treatment', 'water-treatment', 'Water softeners and filtration systems', '💧', v_industry_id, 7, true),
    ('Gas Line Installation', 'gas-line', 'Natural gas piping and connections', '🔥', v_industry_id, 8, true),
    ('Commercial Plumbing', 'commercial-plumbing', 'Commercial plumbing installations', '🏢', v_industry_id, 9, true),
    ('Emergency Plumbing', 'emergency-plumbing', 'Emergency plumbing repairs', '🚨', v_industry_id, 10, true)
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
SELECT create_plumbing_project_types();

-- Create function to generate plumbing work packs
CREATE OR REPLACE FUNCTION create_plumbing_work_packs()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
  v_project_type RECORD;
  v_work_pack_id UUID;
BEGIN
  -- Get plumbing industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'plumbing'
  LIMIT 1;

  -- Create work packs for each project type
  FOR v_project_type IN 
    SELECT id, slug, name 
    FROM project_categories 
    WHERE industry_id = v_industry_id
  LOOP
    CASE v_project_type.slug
      WHEN 'water-heater' THEN
        -- Budget Water Heater
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Water Heater Replacement',
          'Basic 40-50 gallon tank water heater replacement',
          v_industry_id, v_project_type.id, 'budget',
          1800.00, 6, 1, true
        );
        
        -- Standard Water Heater
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Water Heater Replacement',
          'High-efficiency tank or basic tankless installation',
          v_industry_id, v_project_type.id, 'standard',
          3200.00, 10, 1, true
        );
        
        -- Premium Water Heater
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Water Heater System',
          'High-end tankless with recirculation and smart controls',
          v_industry_id, v_project_type.id, 'premium',
          6500.00, 16, 2, true
        );

      WHEN 'bathroom-plumbing' THEN
        -- Budget Bathroom
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Bathroom Plumbing',
          'Basic fixture replacement, existing rough-in',
          v_industry_id, v_project_type.id, 'budget',
          2500.00, 16, 2, true
        );
        
        -- Standard Bathroom
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Bathroom Plumbing',
          'Complete bathroom rough-in and fixture installation',
          v_industry_id, v_project_type.id, 'standard',
          5500.00, 32, 4, true
        );
        
        -- Premium Bathroom
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Master Bath Plumbing',
          'Luxury fixtures, multiple shower heads, freestanding tub',
          v_industry_id, v_project_type.id, 'premium',
          12000.00, 56, 7, true
        );

      WHEN 'whole-house-repipe' THEN
        -- Budget Re-Pipe
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget House Re-Pipe',
          'PEX re-pipe, 1500 sq ft home, basic manifold',
          v_industry_id, v_project_type.id, 'budget',
          8000.00, 40, 5, true
        );
        
        -- Standard Re-Pipe
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard House Re-Pipe',
          'Complete re-pipe 2500 sq ft, manifold system, PRV',
          v_industry_id, v_project_type.id, 'standard',
          15000.00, 64, 8, true
        );
        
        -- Premium Re-Pipe
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium House Re-Pipe',
          'Copper re-pipe, home run system, smart valves',
          v_industry_id, v_project_type.id, 'premium',
          30000.00, 96, 12, true
        );

      WHEN 'sewer-repair' THEN
        -- Budget Sewer
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Sewer Repair',
          'Spot repair, dig and replace section',
          v_industry_id, v_project_type.id, 'budget',
          3500.00, 16, 2, true
        );
        
        -- Standard Sewer
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Sewer Line Replacement',
          'Full sewer line replacement to city connection',
          v_industry_id, v_project_type.id, 'standard',
          8500.00, 32, 4, true
        );
        
        -- Premium Sewer
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Trenchless Sewer Replacement',
          'Pipe bursting or lining, minimal excavation',
          v_industry_id, v_project_type.id, 'premium',
          15000.00, 40, 3, true
        );

      ELSE
        -- Default work packs for other project types
        -- Budget
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget ' || v_project_type.name,
          'Basic ' || LOWER(v_project_type.name) || ' service',
          v_industry_id, v_project_type.id, 'budget',
          1500.00, 8, 1, true
        );

        -- Standard
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard ' || v_project_type.name,
          'Professional ' || LOWER(v_project_type.name) || ' installation',
          v_industry_id, v_project_type.id, 'standard',
          4000.00, 24, 3, true
        );

        -- Premium
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium ' || v_project_type.name,
          'High-end ' || LOWER(v_project_type.name) || ' with premium fixtures',
          v_industry_id, v_project_type.id, 'premium',
          10000.00, 48, 6, true
        );
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_plumbing_work_packs();

-- Create plumbing document templates
CREATE OR REPLACE FUNCTION create_plumbing_documents()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
BEGIN
  -- Get plumbing industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'plumbing'
  LIMIT 1;

  -- Plumbing Service Agreement
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
    'Plumbing Service Agreement',
    'Standard plumbing contractor service agreement',
    'contract',
    v_industry_id,
    'PLUMBING SERVICE AGREEMENT

This Agreement is entered into on {{agreement_date}} between:

PLUMBING CONTRACTOR:
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

MATERIALS AND FIXTURES:
{{materials_list}}

PRICING:
Labor Rate: \${{labor_rate}}/hour
After Hours Rate: \${{emergency_rate}}/hour
Material Markup: {{material_markup}}%
Total Estimate: \${{total_estimate}}

PAYMENT TERMS:
{{payment_terms}}

SCHEDULE:
Start Date: {{start_date}}
Estimated Completion: {{completion_date}}
Working Hours: {{working_hours}}

PERMITS:
Plumbing permits {{permit_responsibility}}. Permit fees estimated at \${{permit_cost}}.

WARRANTY:
Labor: {{labor_warranty}} from completion
Parts: Manufacturer warranties apply
Warranty excludes damage from freezing, misuse, or acts of nature

WATER DAMAGE:
Contractor takes reasonable precautions to prevent water damage but is not responsible for hidden conditions or pre-existing issues that may cause leaks.

ADDITIONAL TERMS:
1. Access to water shut-off required
2. Customer to clear work areas
3. Additional work requires written approval
4. Old fixtures disposed unless customer requests otherwise
5. Payment due upon completion

EMERGENCY SERVICE:
24/7 emergency service available at premium rates

ACCEPTANCE:

CUSTOMER:                           CONTRACTOR:
_____________________              _____________________
{{customer_name}}                  {{contractor_name}}
Date: ________                     Date: ________',
    ARRAY[
      ROW('agreement_date', 'Agreement Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of agreement')::document_variable,
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'Plumbing contractor name')::document_variable,
      ROW('license_number', 'License Number', 'text', true, NULL, NULL, 'Plumbing license')::document_variable,
      ROW('contractor_address', 'Contractor Address', 'text', true, NULL, NULL, 'Business address')::document_variable,
      ROW('contractor_phone', 'Contractor Phone', 'text', true, NULL, NULL, 'Business phone')::document_variable,
      ROW('contractor_email', 'Contractor Email', 'text', true, NULL, NULL, 'Business email')::document_variable,
      ROW('customer_name', 'Customer Name', 'text', true, NULL, NULL, 'Customer name')::document_variable,
      ROW('customer_address', 'Customer Address', 'text', true, NULL, NULL, 'Customer address')::document_variable,
      ROW('customer_phone', 'Customer Phone', 'text', true, NULL, NULL, 'Customer phone')::document_variable,
      ROW('customer_email', 'Customer Email', 'text', true, NULL, NULL, 'Customer email')::document_variable,
      ROW('service_address', 'Service Address', 'text', true, NULL, NULL, 'Job location')::document_variable,
      ROW('scope_description', 'Scope Description', 'text', true, NULL, NULL, 'Work to be performed')::document_variable,
      ROW('materials_list', 'Materials List', 'text', true, NULL, NULL, 'Materials and fixtures')::document_variable,
      ROW('labor_rate', 'Labor Rate', 'number', true, '125', NULL, 'Standard hourly rate')::document_variable,
      ROW('emergency_rate', 'Emergency Rate', 'number', true, '225', NULL, 'After hours rate')::document_variable,
      ROW('material_markup', 'Material Markup', 'number', true, '25', NULL, 'Markup percentage')::document_variable,
      ROW('total_estimate', 'Total Estimate', 'number', true, NULL, NULL, 'Total estimated cost')::document_variable,
      ROW('payment_terms', 'Payment Terms', 'text', true, 'Payment due upon completion', NULL, 'Payment schedule')::document_variable,
      ROW('start_date', 'Start Date', 'date', true, NULL, NULL, 'Work start date')::document_variable,
      ROW('completion_date', 'Completion Date', 'date', true, NULL, NULL, 'Estimated completion')::document_variable,
      ROW('working_hours', 'Working Hours', 'text', true, '8 AM - 5 PM', NULL, 'Normal work hours')::document_variable,
      ROW('permit_responsibility', 'Permit Responsibility', 'text', true, 'will be obtained by contractor', NULL, 'Who handles permits')::document_variable,
      ROW('permit_cost', 'Permit Cost', 'number', true, '250', NULL, 'Estimated permit fees')::document_variable,
      ROW('labor_warranty', 'Labor Warranty', 'text', true, '1 year', NULL, 'Labor warranty period')::document_variable
    ],
    true,
    true
  );

  -- Plumbing Inspection Report
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
    'Plumbing System Inspection Report',
    'Comprehensive plumbing system inspection',
    'inspection',
    v_industry_id,
    'PLUMBING SYSTEM INSPECTION REPORT

Property: {{property_address}}
Owner: {{owner_name}}
Date: {{inspection_date}}
Inspector: {{inspector_name}}
License #: {{inspector_license}}

WATER SUPPLY SYSTEM:
Water Source: {{water_source}}
Water Pressure: {{water_pressure}} PSI
Main Shut-Off Location: {{shutoff_location}}
Pipe Material: {{supply_pipe_material}}
Pipe Condition: {{supply_condition}}

INSPECTION CHECKLIST:

WATER SUPPLY:
[ ] Main shut-off operational
[ ] Pressure within normal range (40-80 PSI)
[ ] No visible leaks at meter
[ ] Pressure regulator functioning
[ ] Expansion tank present (if needed)
[ ] Backflow prevention installed
[ ] Hose bibs have vacuum breakers
Notes: {{supply_notes}}

WATER HEATER:
Type: {{heater_type}}
Age: {{heater_age}} years
Capacity: {{heater_capacity}} gallons
[ ] T&P valve present and extended
[ ] No visible leaks or corrosion
[ ] Proper venting (gas units)
[ ] Drain pan installed
[ ] Seismic straps (where required)
Notes: {{heater_notes}}

FIXTURES:
[ ] Kitchen sink - no leaks
[ ] Bathroom sinks - proper drainage
[ ] Toilets - secure, no running
[ ] Tubs/showers - proper drainage
[ ] Washing machine connections
[ ] All fixtures have shut-offs
[ ] Proper trap configuration
Notes: {{fixture_notes}}

DRAINAGE SYSTEM:
Pipe Material: {{drain_material}}
[ ] All drains flowing properly
[ ] No evidence of backups
[ ] Vent pipes properly terminated
[ ] Clean-outs accessible
[ ] No sewer gas odors
Notes: {{drainage_notes}}

GAS PIPING (if applicable):
[ ] No gas odors detected
[ ] Proper bonding and grounding
[ ] Shut-off valves accessible
[ ] CSST properly bonded
[ ] Appliance connectors approved type
Notes: {{gas_notes}}

ISSUES DISCOVERED:
{{issues_list}}

RECOMMENDATIONS:
{{recommendations}}

OVERALL ASSESSMENT:
[ ] SATISFACTORY - System in good condition
[ ] MARGINAL - Minor repairs needed
[ ] POOR - Significant repairs required

Inspector Signature: _____________________
Date: {{inspection_date}}',
    ARRAY[
      ROW('property_address', 'Property Address', 'text', true, NULL, NULL, 'Inspection location')::document_variable,
      ROW('owner_name', 'Owner Name', 'text', true, NULL, NULL, 'Property owner')::document_variable,
      ROW('inspection_date', 'Inspection Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of inspection')::document_variable,
      ROW('inspector_name', 'Inspector Name', 'text', true, NULL, NULL, 'Inspector name')::document_variable,
      ROW('inspector_license', 'Inspector License', 'text', true, NULL, NULL, 'License number')::document_variable,
      ROW('water_source', 'Water Source', 'text', true, 'Municipal', NULL, 'Water supply source')::document_variable,
      ROW('water_pressure', 'Water Pressure', 'number', true, NULL, NULL, 'System pressure PSI')::document_variable,
      ROW('shutoff_location', 'Shutoff Location', 'text', true, NULL, NULL, 'Main shutoff location')::document_variable,
      ROW('supply_pipe_material', 'Supply Pipes', 'text', true, NULL, NULL, 'Supply pipe type')::document_variable,
      ROW('supply_condition', 'Supply Condition', 'text', true, NULL, NULL, 'Pipe condition')::document_variable,
      ROW('supply_notes', 'Supply Notes', 'text', false, 'No issues found', NULL, 'Water supply notes')::document_variable,
      ROW('heater_type', 'Heater Type', 'text', true, NULL, NULL, 'Water heater type')::document_variable,
      ROW('heater_age', 'Heater Age', 'number', true, NULL, NULL, 'Water heater age')::document_variable,
      ROW('heater_capacity', 'Heater Capacity', 'number', true, NULL, NULL, 'Tank capacity')::document_variable,
      ROW('heater_notes', 'Heater Notes', 'text', false, 'No issues found', NULL, 'Water heater notes')::document_variable,
      ROW('fixture_notes', 'Fixture Notes', 'text', false, 'No issues found', NULL, 'Fixture notes')::document_variable,
      ROW('drain_material', 'Drain Material', 'text', true, NULL, NULL, 'Drain pipe type')::document_variable,
      ROW('drainage_notes', 'Drainage Notes', 'text', false, 'No issues found', NULL, 'Drainage notes')::document_variable,
      ROW('gas_notes', 'Gas Notes', 'text', false, 'N/A', NULL, 'Gas piping notes')::document_variable,
      ROW('issues_list', 'Issues List', 'text', false, 'None', NULL, 'Issues discovered')::document_variable,
      ROW('recommendations', 'Recommendations', 'text', false, 'None', NULL, 'Recommended repairs')::document_variable
    ],
    true,
    false
  );

  -- Water Heater Warranty
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
    'Water Heater Installation Warranty',
    'Warranty certificate for water heater installation',
    'warranty',
    v_industry_id,
    'WATER HEATER INSTALLATION WARRANTY

This certifies that {{contractor_name}} has installed a water heater at:

INSTALLATION ADDRESS: {{install_address}}
CUSTOMER: {{customer_name}}
INSTALLATION DATE: {{install_date}}

WATER HEATER DETAILS:
Manufacturer: {{manufacturer}}
Model: {{model_number}}
Serial Number: {{serial_number}}
Type: {{heater_type}}
Capacity: {{capacity}}
Fuel Type: {{fuel_type}}

WARRANTY COVERAGE:

LABOR WARRANTY:
Installation labor is warranted for {{labor_warranty_period}} from the date of installation against defects in workmanship.

PARTS WARRANTY:
Water heater tank: {{tank_warranty}} (manufacturer)
Parts and components: {{parts_warranty}} (manufacturer)

THIS WARRANTY COVERS:
- Improper installation
- Leaks at connections
- Incorrect venting (gas units)
- Code compliance issues
- T&P valve installation

THIS WARRANTY DOES NOT COVER:
- Damage from freezing
- Sediment buildup
- Damage from hard water/lack of maintenance
- Acts of nature
- Modifications by others
- Normal wear and tear

MAINTENANCE REQUIREMENTS:
- Annual T&P valve testing
- Periodic tank flushing
- Anode rod inspection (recommended every 3 years)

WARRANTY SERVICE:
For warranty service, contact:
{{contractor_name}}
{{contractor_phone}}
{{contractor_email}}

This warranty is transferable to subsequent owners.

INSTALLER:
_____________________
{{installer_name}}
License #: {{license_number}}
Date: {{install_date}}',
    ARRAY[
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'Company name')::document_variable,
      ROW('install_address', 'Install Address', 'text', true, NULL, NULL, 'Installation location')::document_variable,
      ROW('customer_name', 'Customer Name', 'text', true, NULL, NULL, 'Customer name')::document_variable,
      ROW('install_date', 'Install Date', 'date', true, CURRENT_DATE::text, NULL, 'Installation date')::document_variable,
      ROW('manufacturer', 'Manufacturer', 'text', true, NULL, NULL, 'Heater manufacturer')::document_variable,
      ROW('model_number', 'Model Number', 'text', true, NULL, NULL, 'Model number')::document_variable,
      ROW('serial_number', 'Serial Number', 'text', true, NULL, NULL, 'Serial number')::document_variable,
      ROW('heater_type', 'Heater Type', 'text', true, 'Tank', NULL, 'Tank or tankless')::document_variable,
      ROW('capacity', 'Capacity', 'text', true, NULL, NULL, 'Tank capacity')::document_variable,
      ROW('fuel_type', 'Fuel Type', 'text', true, 'Gas', NULL, 'Gas or electric')::document_variable,
      ROW('labor_warranty_period', 'Labor Warranty', 'text', true, '1 year', NULL, 'Labor warranty')::document_variable,
      ROW('tank_warranty', 'Tank Warranty', 'text', true, '6 years', NULL, 'Tank warranty')::document_variable,
      ROW('parts_warranty', 'Parts Warranty', 'text', true, '1 year', NULL, 'Parts warranty')::document_variable,
      ROW('contractor_phone', 'Contractor Phone', 'text', true, NULL, NULL, 'Contact phone')::document_variable,
      ROW('contractor_email', 'Contractor Email', 'text', true, NULL, NULL, 'Contact email')::document_variable,
      ROW('installer_name', 'Installer Name', 'text', true, NULL, NULL, 'Installer name')::document_variable,
      ROW('license_number', 'License Number', 'text', true, NULL, NULL, 'Plumbing license')::document_variable
    ],
    true,
    false
  );

END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_plumbing_documents();