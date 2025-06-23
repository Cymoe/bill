-- Residential Construction Industry Data Migration
-- Creates comprehensive cost codes, project types, work packs, and documents for residential construction

-- First, ensure we have the residential construction industry
INSERT INTO industries (name, slug, description, icon, is_active)
VALUES ('Residential Construction', 'residential-construction', 'Specialized residential remodeling and renovation', '🏠', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Residential Construction Cost Codes (focused on remodeling/renovation)
-- Kitchen Remodeling Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('RC100', 'Kitchen Demo', 'Kitchen demolition and disposal', 'labor', 'ls', 1500.00),
  ('RC101', 'Kitchen Cabinets - Stock', 'Stock kitchen cabinets', 'material', 'lf', 200.00),
  ('RC102', 'Kitchen Cabinets - Semi-Custom', 'Semi-custom cabinets', 'material', 'lf', 350.00),
  ('RC103', 'Kitchen Cabinets - Custom', 'Full custom cabinets', 'material', 'lf', 550.00),
  ('RC104', 'Cabinet Installation', 'Cabinet installation labor', 'labor', 'lf', 65.00),
  ('RC105', 'Countertops - Laminate', 'Laminate countertops', 'material', 'sf', 25.00),
  ('RC106', 'Countertops - Quartz', 'Quartz countertops', 'material', 'sf', 65.00),
  ('RC107', 'Countertops - Granite', 'Granite countertops', 'material', 'sf', 75.00),
  ('RC108', 'Countertop Installation', 'Countertop fabrication/install', 'labor', 'sf', 35.00),
  ('RC109', 'Kitchen Sink', 'Kitchen sink and faucet', 'material', 'ea', 650.00),
  ('RC110', 'Backsplash - Tile', 'Tile backsplash material', 'material', 'sf', 12.00),
  ('RC111', 'Backsplash Installation', 'Backsplash installation', 'labor', 'sf', 15.00),
  ('RC112', 'Appliances - Basic', 'Basic appliance package', 'material', 'set', 2500.00),
  ('RC113', 'Appliances - Mid-Range', 'Mid-range appliances', 'material', 'set', 5000.00),
  ('RC114', 'Appliances - High-End', 'Professional appliances', 'material', 'set', 12000.00),
  ('RC115', 'Kitchen Island', 'Kitchen island with storage', 'material', 'ea', 2500.00),
  ('RC116', 'Kitchen Lighting', 'Under-cabinet and pendant lights', 'material', 'ls', 800.00),
  ('RC117', 'Kitchen Plumbing', 'Kitchen plumbing rough-in', 'subcontractor', 'ls', 1500.00),
  ('RC118', 'Kitchen Electrical', 'Kitchen electrical upgrade', 'subcontractor', 'ls', 2000.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Bathroom Remodeling Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('RC200', 'Bathroom Demo', 'Bathroom demolition', 'labor', 'ls', 800.00),
  ('RC201', 'Vanity - Basic', 'Basic bathroom vanity', 'material', 'ea', 400.00),
  ('RC202', 'Vanity - Mid-Range', 'Mid-range vanity with top', 'material', 'ea', 1200.00),
  ('RC203', 'Vanity - Custom', 'Custom vanity cabinet', 'material', 'ea', 2500.00),
  ('RC204', 'Toilet - Standard', 'Standard toilet', 'material', 'ea', 350.00),
  ('RC205', 'Toilet - Comfort Height', 'Comfort height toilet', 'material', 'ea', 550.00),
  ('RC206', 'Toilet - Smart', 'Smart toilet/bidet', 'material', 'ea', 2500.00),
  ('RC207', 'Tub - Standard', 'Standard bathtub', 'material', 'ea', 600.00),
  ('RC208', 'Tub - Freestanding', 'Freestanding tub', 'material', 'ea', 2200.00),
  ('RC209', 'Shower - Prefab', 'Prefab shower unit', 'material', 'ea', 800.00),
  ('RC210', 'Shower - Tile', 'Custom tile shower', 'material', 'sf', 25.00),
  ('RC211', 'Shower Door', 'Frameless glass shower door', 'material', 'ea', 900.00),
  ('RC212', 'Bathroom Tile', 'Floor and wall tile', 'material', 'sf', 8.00),
  ('RC213', 'Tile Installation', 'Tile setting labor', 'labor', 'sf', 12.00),
  ('RC214', 'Bathroom Fan', 'Exhaust fan with light', 'material', 'ea', 250.00),
  ('RC215', 'Bathroom Mirror', 'Vanity mirror', 'material', 'ea', 300.00),
  ('RC216', 'Medicine Cabinet', 'Recessed medicine cabinet', 'material', 'ea', 450.00),
  ('RC217', 'Bathroom Plumbing', 'Bathroom plumbing rough-in', 'subcontractor', 'fixture', 650.00),
  ('RC218', 'Bathroom Electrical', 'Bathroom electrical/GFCI', 'subcontractor', 'ls', 800.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Flooring Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('RC300', 'Flooring Demo', 'Remove existing flooring', 'labor', 'sf', 1.50),
  ('RC301', 'Hardwood - Oak', 'Oak hardwood flooring', 'material', 'sf', 6.50),
  ('RC302', 'Hardwood - Exotic', 'Exotic hardwood flooring', 'material', 'sf', 12.00),
  ('RC303', 'Engineered Wood', 'Engineered wood flooring', 'material', 'sf', 5.50),
  ('RC304', 'Laminate Floor', 'Laminate flooring', 'material', 'sf', 2.50),
  ('RC305', 'Luxury Vinyl', 'Luxury vinyl plank', 'material', 'sf', 4.00),
  ('RC306', 'Carpet - Basic', 'Basic carpet and pad', 'material', 'sy', 25.00),
  ('RC307', 'Carpet - Premium', 'Premium carpet and pad', 'material', 'sy', 45.00),
  ('RC308', 'Tile - Ceramic', 'Ceramic floor tile', 'material', 'sf', 5.00),
  ('RC309', 'Tile - Porcelain', 'Porcelain floor tile', 'material', 'sf', 7.00),
  ('RC310', 'Tile - Natural Stone', 'Natural stone tile', 'material', 'sf', 15.00),
  ('RC311', 'Floor Installation', 'Flooring installation labor', 'labor', 'sf', 4.50),
  ('RC312', 'Floor Prep', 'Floor leveling and prep', 'labor', 'sf', 2.00),
  ('RC313', 'Baseboard', 'Wood baseboard', 'material', 'lf', 4.50),
  ('RC314', 'Baseboard Install', 'Baseboard installation', 'labor', 'lf', 3.50)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Interior Renovation Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('RC400', 'Interior Demo', 'General interior demolition', 'labor', 'sf', 2.50),
  ('RC401', 'Wall Framing', 'Interior wall framing', 'material', 'lf', 12.00),
  ('RC402', 'Drywall', 'Drywall installation', 'material', 'sf', 2.00),
  ('RC403', 'Drywall Finish', 'Tape, mud, and texture', 'labor', 'sf', 2.50),
  ('RC404', 'Interior Paint', 'Interior painting', 'labor', 'sf', 2.00),
  ('RC405', 'Crown Molding', 'Crown molding material', 'material', 'lf', 8.00),
  ('RC406', 'Crown Install', 'Crown molding installation', 'labor', 'lf', 6.00),
  ('RC407', 'Interior Door - Hollow', 'Hollow core door', 'material', 'ea', 125.00),
  ('RC408', 'Interior Door - Solid', 'Solid core door', 'material', 'ea', 225.00),
  ('RC409', 'Door Installation', 'Interior door installation', 'labor', 'ea', 150.00),
  ('RC410', 'Closet System', 'Wire closet shelving', 'material', 'lf', 18.00),
  ('RC411', 'Built-In Shelving', 'Custom built-in shelves', 'material', 'lf', 125.00),
  ('RC412', 'Stairway Renovation', 'Stair treads and risers', 'material', 'step', 150.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Exterior Renovation Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('RC500', 'Siding - Vinyl', 'Vinyl siding material', 'material', 'sf', 3.50),
  ('RC501', 'Siding - Fiber Cement', 'Fiber cement siding', 'material', 'sf', 6.50),
  ('RC502', 'Siding - Wood', 'Wood siding material', 'material', 'sf', 8.50),
  ('RC503', 'Siding Installation', 'Siding installation labor', 'labor', 'sf', 4.00),
  ('RC504', 'Exterior Paint', 'Exterior painting', 'labor', 'sf', 3.00),
  ('RC505', 'Window - Standard', 'Standard replacement window', 'material', 'ea', 450.00),
  ('RC506', 'Window - Energy Star', 'Energy efficient window', 'material', 'ea', 750.00),
  ('RC507', 'Window Installation', 'Window installation labor', 'labor', 'ea', 250.00),
  ('RC508', 'Entry Door - Basic', 'Basic entry door', 'material', 'ea', 600.00),
  ('RC509', 'Entry Door - Premium', 'Premium entry door', 'material', 'ea', 2200.00),
  ('RC510', 'Door Installation', 'Entry door installation', 'labor', 'ea', 350.00),
  ('RC511', 'Deck - Pressure Treated', 'PT lumber decking', 'material', 'sf', 15.00),
  ('RC512', 'Deck - Composite', 'Composite decking', 'material', 'sf', 25.00),
  ('RC513', 'Deck Labor', 'Deck construction labor', 'labor', 'sf', 18.00),
  ('RC514', 'Patio Cover', 'Aluminum patio cover', 'material', 'sf', 12.00),
  ('RC515', 'Fence - Wood', 'Wood privacy fence', 'material', 'lf', 25.00),
  ('RC516', 'Fence - Vinyl', 'Vinyl privacy fence', 'material', 'lf', 35.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- HVAC & Electrical Upgrade Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
  ('RC600', 'HVAC - Furnace', 'High-efficiency furnace', 'material', 'ea', 2800.00),
  ('RC601', 'HVAC - AC Unit', 'Central air conditioner', 'material', 'ton', 1800.00),
  ('RC602', 'HVAC - Heat Pump', 'Heat pump system', 'material', 'ton', 3200.00),
  ('RC603', 'HVAC - Mini Split', 'Ductless mini split', 'material', 'ea', 2500.00),
  ('RC604', 'HVAC Installation', 'HVAC installation labor', 'subcontractor', 'ea', 2200.00),
  ('RC605', 'Ductwork', 'New or modified ductwork', 'subcontractor', 'lf', 35.00),
  ('RC606', 'Electrical Panel', '200A panel upgrade', 'material', 'ea', 1800.00),
  ('RC607', 'Electrical Wiring', 'Rewire per room', 'subcontractor', 'room', 800.00),
  ('RC608', 'Recessed Lights', 'LED recessed lights', 'material', 'ea', 125.00),
  ('RC609', 'Ceiling Fan', 'Ceiling fan with light', 'material', 'ea', 350.00),
  ('RC610', 'Smart Home', 'Smart home devices', 'material', 'ea', 250.00)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Create function to add residential construction project types
CREATE OR REPLACE FUNCTION create_residential_construction_project_types()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
BEGIN
  -- Get residential construction industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'residential-construction'
  LIMIT 1;
  
  -- Insert residential construction project types
  INSERT INTO project_categories (name, slug, description, icon, industry_id, display_order, is_active) VALUES
    ('Kitchen Remodel', 'kitchen-remodel', 'Complete kitchen renovation and updates', '🍳', v_industry_id, 1, true),
    ('Bathroom Remodel', 'bathroom-remodel', 'Bathroom renovation and modernization', '🚿', v_industry_id, 2, true),
    ('Basement Finishing', 'basement-finishing', 'Finish or remodel basement space', '🏠', v_industry_id, 3, true),
    ('Room Addition', 'room-addition', 'Add new room to existing home', '➕', v_industry_id, 4, true),
    ('Whole House Remodel', 'whole-house-remodel', 'Complete home interior renovation', '🏡', v_industry_id, 5, true),
    ('Flooring Replacement', 'flooring-replacement', 'Replace flooring throughout home', '🪵', v_industry_id, 6, true),
    ('Exterior Renovation', 'exterior-renovation', 'Siding, windows, and exterior updates', '🏗️', v_industry_id, 7, true),
    ('Deck/Patio Construction', 'deck-patio', 'Build new deck or patio area', '🌳', v_industry_id, 8, true),
    ('Attic Conversion', 'attic-conversion', 'Convert attic to living space', '🔺', v_industry_id, 9, true),
    ('Garage Conversion', 'garage-conversion', 'Convert garage to living space', '🚪', v_industry_id, 10, true)
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
SELECT create_residential_construction_project_types();

-- Create function to generate residential construction work packs
CREATE OR REPLACE FUNCTION create_residential_construction_work_packs()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
  v_project_type RECORD;
  v_work_pack_id UUID;
BEGIN
  -- Get residential construction industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'residential-construction'
  LIMIT 1;

  -- Create work packs for each project type
  FOR v_project_type IN 
    SELECT id, slug, name 
    FROM project_categories 
    WHERE industry_id = v_industry_id
  LOOP
    CASE v_project_type.slug
      WHEN 'kitchen-remodel' THEN
        -- Budget Kitchen
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Kitchen Remodel',
          'Basic kitchen update with stock cabinets and standard appliances',
          v_industry_id, v_project_type.id, 'budget',
          18000.00, 120, 14, true
        );
        
        -- Standard Kitchen
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Kitchen Remodel',
          'Full kitchen renovation with semi-custom cabinets and quality appliances',
          v_industry_id, v_project_type.id, 'standard',
          35000.00, 200, 21, true
        );
        
        -- Premium Kitchen
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Kitchen Remodel',
          'Luxury kitchen with custom cabinets, high-end appliances, and designer finishes',
          v_industry_id, v_project_type.id, 'premium',
          75000.00, 320, 30, true
        );

      WHEN 'bathroom-remodel' THEN
        -- Budget Bathroom
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Bathroom Remodel',
          'Basic bathroom refresh with standard fixtures and finishes',
          v_industry_id, v_project_type.id, 'budget',
          8000.00, 60, 7, true
        );
        
        -- Standard Bathroom
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Bathroom Remodel',
          'Complete bathroom renovation with quality fixtures and tile work',
          v_industry_id, v_project_type.id, 'standard',
          15000.00, 100, 14, true
        );
        
        -- Premium Bathroom
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Bathroom Remodel',
          'Luxury master bath with custom shower, freestanding tub, and high-end finishes',
          v_industry_id, v_project_type.id, 'premium',
          35000.00, 180, 21, true
        );

      WHEN 'basement-finishing' THEN
        -- Budget Basement
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Basement Finishing',
          'Basic basement finish with open layout, 800-1000 sq ft',
          v_industry_id, v_project_type.id, 'budget',
          25000.00, 200, 21, true
        );
        
        -- Standard Basement
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Basement Finishing',
          'Full basement with bedroom, bath, and living area, 1000-1200 sq ft',
          v_industry_id, v_project_type.id, 'standard',
          45000.00, 320, 30, true
        );
        
        -- Premium Basement
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Basement Finishing',
          'Luxury basement with home theater, bar, and custom finishes',
          v_industry_id, v_project_type.id, 'premium',
          85000.00, 480, 45, true
        );

      WHEN 'whole-house-remodel' THEN
        -- Budget Whole House
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget Whole House Remodel',
          'Cosmetic updates throughout, paint, flooring, and fixtures',
          v_industry_id, v_project_type.id, 'budget',
          50000.00, 400, 45, true
        );
        
        -- Standard Whole House
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard Whole House Remodel',
          'Full interior renovation including kitchen and bathrooms',
          v_industry_id, v_project_type.id, 'standard',
          120000.00, 800, 90, true
        );
        
        -- Premium Whole House
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium Whole House Remodel',
          'Complete luxury renovation with structural changes and additions',
          v_industry_id, v_project_type.id, 'premium',
          300000.00, 1600, 150, true
        );

      ELSE
        -- Default work packs for other project types
        -- Budget
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Budget ' || v_project_type.name,
          'Basic ' || LOWER(v_project_type.name) || ' with standard materials',
          v_industry_id, v_project_type.id, 'budget',
          20000.00, 120, 14, true
        );

        -- Standard
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Standard ' || v_project_type.name,
          'Quality ' || LOWER(v_project_type.name) || ' with upgraded materials',
          v_industry_id, v_project_type.id, 'standard',
          40000.00, 200, 21, true
        );

        -- Premium
        INSERT INTO work_packs (
          name, description, industry_id, project_type_id, tier, 
          base_price, estimated_hours, typical_duration_days, is_template
        ) VALUES (
          'Premium ' || v_project_type.name,
          'High-end ' || LOWER(v_project_type.name) || ' with luxury materials',
          v_industry_id, v_project_type.id, 'premium',
          80000.00, 320, 30, true
        );
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_residential_construction_work_packs();

-- Create residential construction document templates
CREATE OR REPLACE FUNCTION create_residential_construction_documents()
RETURNS void AS $$
DECLARE
  v_industry_id UUID;
BEGIN
  -- Get residential construction industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'residential-construction'
  LIMIT 1;

  -- Residential Remodeling Contract
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
    'Residential Remodeling Contract',
    'Standard contract for home remodeling projects',
    'contract',
    v_industry_id,
    'HOME IMPROVEMENT CONTRACT

This Agreement is entered into on {{contract_date}} between:

CONTRACTOR:
{{contractor_name}}
License #: {{contractor_license}}
{{contractor_address}}
Phone: {{contractor_phone}}
Email: {{contractor_email}}

HOMEOWNER:
{{client_name}}
{{client_address}}
Phone: {{client_phone}}
Email: {{client_email}}

PROJECT ADDRESS: {{project_address}}

SCOPE OF WORK:
The Contractor agrees to provide all labor and materials to complete the following work:
{{scope_of_work}}

MATERIALS:
{{materials_description}}

CONTRACT PRICE:
Total Contract Price: \${{total_price}}
This includes all labor, materials, permits, and disposal fees.

PAYMENT SCHEDULE:
1. Initial Deposit ({{deposit_percentage}}%): \${{deposit_amount}} - Due upon signing
2. Progress Payment: \${{progress_payment}} - Due at {{progress_milestone}}
3. Final Payment: \${{final_payment}} - Due upon completion

PROJECT SCHEDULE:
Start Date: {{start_date}}
Estimated Completion: {{end_date}}
Working Hours: {{working_hours}}

CHANGE ORDERS:
Any changes to the original scope must be documented in writing with associated costs.

WARRANTY:
Contractor provides a {{warranty_period}} warranty on all workmanship from completion date.
Manufacturer warranties on materials will be provided separately.

PERMITS:
Contractor will obtain all necessary permits. Permit costs {{permit_inclusion}}.

RIGHT OF RESCISSION:
Homeowner has the right to cancel this contract within 3 business days.

MECHANICS LIEN WARNING:
Anyone who helps improve your property and is not paid may record a mechanics lien.

SIGNATURES:

CONTRACTOR:                      HOMEOWNER:
_____________________           _____________________
{{contractor_name}}             {{client_name}}
Date: ________                  Date: ________',
    ARRAY[
      ROW('contract_date', 'Contract Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of contract')::document_variable,
      ROW('contractor_name', 'Contractor Name', 'text', true, NULL, NULL, 'Licensed contractor name')::document_variable,
      ROW('contractor_license', 'License Number', 'text', true, NULL, NULL, 'Contractor license')::document_variable,
      ROW('contractor_address', 'Contractor Address', 'text', true, NULL, NULL, 'Business address')::document_variable,
      ROW('contractor_phone', 'Contractor Phone', 'text', true, NULL, NULL, 'Business phone')::document_variable,
      ROW('contractor_email', 'Contractor Email', 'text', true, NULL, NULL, 'Business email')::document_variable,
      ROW('client_name', 'Homeowner Name', 'text', true, NULL, NULL, 'Property owner name')::document_variable,
      ROW('client_address', 'Homeowner Address', 'text', true, NULL, NULL, 'Owner address')::document_variable,
      ROW('client_phone', 'Homeowner Phone', 'text', true, NULL, NULL, 'Owner phone')::document_variable,
      ROW('client_email', 'Homeowner Email', 'text', true, NULL, NULL, 'Owner email')::document_variable,
      ROW('project_address', 'Project Address', 'text', true, NULL, NULL, 'Property address')::document_variable,
      ROW('scope_of_work', 'Scope of Work', 'text', true, NULL, NULL, 'Detailed work description')::document_variable,
      ROW('materials_description', 'Materials', 'text', true, NULL, NULL, 'Materials to be used')::document_variable,
      ROW('total_price', 'Total Price', 'number', true, NULL, NULL, 'Total contract amount')::document_variable,
      ROW('deposit_percentage', 'Deposit %', 'number', true, '30', NULL, 'Deposit percentage')::document_variable,
      ROW('deposit_amount', 'Deposit Amount', 'number', true, NULL, NULL, 'Initial deposit')::document_variable,
      ROW('progress_payment', 'Progress Payment', 'number', true, NULL, NULL, 'Progress payment amount')::document_variable,
      ROW('progress_milestone', 'Progress Milestone', 'text', true, '50% completion', NULL, 'When progress payment due')::document_variable,
      ROW('final_payment', 'Final Payment', 'number', true, NULL, NULL, 'Final payment amount')::document_variable,
      ROW('start_date', 'Start Date', 'date', true, NULL, NULL, 'Project start date')::document_variable,
      ROW('end_date', 'End Date', 'date', true, NULL, NULL, 'Estimated completion')::document_variable,
      ROW('working_hours', 'Working Hours', 'text', true, 'Monday-Friday 8am-5pm', NULL, 'Work schedule')::document_variable,
      ROW('warranty_period', 'Warranty Period', 'text', true, '1 year', NULL, 'Warranty duration')::document_variable,
      ROW('permit_inclusion', 'Permit Inclusion', 'text', true, 'are included', NULL, 'Permit cost inclusion')::document_variable
    ],
    true,
    true
  );

  -- Material Selection Form
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
    'Material Selection Form',
    'Document homeowner material selections',
    'other',
    v_industry_id,
    'MATERIAL SELECTION FORM

Project: {{project_name}}
Homeowner: {{client_name}}
Date: {{selection_date}}

KITCHEN SELECTIONS:
Cabinets: {{cabinet_selection}}
Cabinet Hardware: {{hardware_selection}}
Countertops: {{countertop_selection}}
Backsplash: {{backsplash_selection}}
Sink: {{sink_selection}}
Faucet: {{faucet_selection}}
Appliances: {{appliance_selection}}

BATHROOM SELECTIONS:
Vanity: {{vanity_selection}}
Countertop: {{bath_counter_selection}}
Toilet: {{toilet_selection}}
Tub/Shower: {{tub_shower_selection}}
Tile: {{tile_selection}}
Fixtures: {{fixture_selection}}

FLOORING SELECTIONS:
Living Areas: {{living_floor_selection}}
Bedrooms: {{bedroom_floor_selection}}
Bathrooms: {{bathroom_floor_selection}}

PAINT SELECTIONS:
Wall Colors: {{paint_selection}}
Trim Color: {{trim_selection}}

LIGHTING SELECTIONS:
{{lighting_selection}}

NOTES:
{{selection_notes}}

APPROVAL:
All selections are approved as specified above.

Homeowner: ____________________  Date: ________
Contractor: ____________________  Date: ________',
    ARRAY[
      ROW('project_name', 'Project Name', 'text', true, NULL, NULL, 'Project name')::document_variable,
      ROW('client_name', 'Homeowner Name', 'text', true, NULL, NULL, 'Client name')::document_variable,
      ROW('selection_date', 'Selection Date', 'date', true, CURRENT_DATE::text, NULL, 'Date of selections')::document_variable,
      ROW('cabinet_selection', 'Cabinet Selection', 'text', false, 'N/A', NULL, 'Cabinet choice')::document_variable,
      ROW('hardware_selection', 'Hardware Selection', 'text', false, 'N/A', NULL, 'Cabinet hardware')::document_variable,
      ROW('countertop_selection', 'Countertop Selection', 'text', false, 'N/A', NULL, 'Countertop choice')::document_variable,
      ROW('backsplash_selection', 'Backsplash Selection', 'text', false, 'N/A', NULL, 'Backsplash choice')::document_variable,
      ROW('sink_selection', 'Sink Selection', 'text', false, 'N/A', NULL, 'Sink choice')::document_variable,
      ROW('faucet_selection', 'Faucet Selection', 'text', false, 'N/A', NULL, 'Faucet choice')::document_variable,
      ROW('appliance_selection', 'Appliance Selection', 'text', false, 'N/A', NULL, 'Appliances')::document_variable,
      ROW('vanity_selection', 'Vanity Selection', 'text', false, 'N/A', NULL, 'Bathroom vanity')::document_variable,
      ROW('bath_counter_selection', 'Bath Counter', 'text', false, 'N/A', NULL, 'Bathroom countertop')::document_variable,
      ROW('toilet_selection', 'Toilet Selection', 'text', false, 'N/A', NULL, 'Toilet choice')::document_variable,
      ROW('tub_shower_selection', 'Tub/Shower', 'text', false, 'N/A', NULL, 'Tub/shower choice')::document_variable,
      ROW('tile_selection', 'Tile Selection', 'text', false, 'N/A', NULL, 'Tile choices')::document_variable,
      ROW('fixture_selection', 'Fixture Selection', 'text', false, 'N/A', NULL, 'Plumbing fixtures')::document_variable,
      ROW('living_floor_selection', 'Living Floor', 'text', false, 'N/A', NULL, 'Living area flooring')::document_variable,
      ROW('bedroom_floor_selection', 'Bedroom Floor', 'text', false, 'N/A', NULL, 'Bedroom flooring')::document_variable,
      ROW('bathroom_floor_selection', 'Bath Floor', 'text', false, 'N/A', NULL, 'Bathroom flooring')::document_variable,
      ROW('paint_selection', 'Paint Colors', 'text', false, 'N/A', NULL, 'Paint selections')::document_variable,
      ROW('trim_selection', 'Trim Color', 'text', false, 'N/A', NULL, 'Trim paint color')::document_variable,
      ROW('lighting_selection', 'Lighting', 'text', false, 'N/A', NULL, 'Light fixtures')::document_variable,
      ROW('selection_notes', 'Notes', 'text', false, 'None', NULL, 'Additional notes')::document_variable
    ],
    true,
    false
  );

END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_residential_construction_documents();