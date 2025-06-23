-- General Construction Project Types Migration
-- Creates comprehensive project categories for general construction industry

-- First ensure we have the general construction industry ID
DO $$
DECLARE
  v_industry_id UUID;
BEGIN
  -- Get the general construction industry ID
  SELECT id INTO v_industry_id 
  FROM industries 
  WHERE slug = 'general-construction'
  LIMIT 1;
  
  IF v_industry_id IS NULL THEN
    RAISE EXCEPTION 'General construction industry not found. Please run the cost codes migration first.';
  END IF;

  -- Insert all general construction project types
  -- Residential Projects
  INSERT INTO project_categories (name, slug, description, icon, industry_id, display_order, is_active) VALUES
    ('New Home Construction', 'new-home-construction', 'Build new single-family homes from ground up', '🏠', v_industry_id, 1, true),
    ('Multi-Family Construction', 'multi-family-construction', 'Apartment buildings, condos, townhomes', '🏢', v_industry_id, 2, true),
    ('Home Addition', 'home-addition', 'Room additions, second stories, expansions', '🏗️', v_industry_id, 3, true),
    ('Whole House Renovation', 'whole-house-renovation', 'Complete home remodeling and renovation', '🔨', v_industry_id, 4, true),
    ('ADU Construction', 'adu-construction', 'Accessory dwelling units and guest houses', '🏘️', v_industry_id, 5, true),
    ('Garage Construction', 'garage-construction', 'Detached and attached garage building', '🚗', v_industry_id, 6, true),
    
    -- Commercial Projects
    ('Office Build-Out', 'office-buildout', 'Commercial office space construction', '🏢', v_industry_id, 7, true),
    ('Retail Build-Out', 'retail-buildout', 'Retail store construction and renovation', '🛍️', v_industry_id, 8, true),
    ('Restaurant Build-Out', 'restaurant-buildout', 'Restaurant and food service construction', '🍽️', v_industry_id, 9, true),
    ('Warehouse Construction', 'warehouse-construction', 'Industrial warehouse and storage facilities', '🏭', v_industry_id, 10, true),
    ('Light Industrial', 'light-industrial', 'Light manufacturing and industrial spaces', '🏗️', v_industry_id, 11, true),
    
    -- Specialty Projects
    ('Foundation Repair', 'foundation-repair', 'Foundation and structural repairs', '🔧', v_industry_id, 12, true),
    ('Exterior Renovation', 'exterior-renovation', 'Siding, windows, doors, and exterior upgrades', '🏠', v_industry_id, 13, true),
    ('Interior Renovation', 'interior-renovation', 'General interior remodeling projects', '🛠️', v_industry_id, 14, true),
    ('Site Development', 'site-development', 'Site preparation, grading, and utilities', '🚜', v_industry_id, 15, true)
  ON CONFLICT (slug) DO UPDATE
  SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    industry_id = EXCLUDED.industry_id,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- Create task templates for New Home Construction
  INSERT INTO task_templates (category_id, title, description, default_priority, typical_duration_days, display_order)
  SELECT 
    pc.id,
    t.title,
    t.description,
    t.priority::text,
    t.duration,
    t.ord
  FROM project_categories pc
  CROSS JOIN (VALUES
    ('Permits & Planning', 'Obtain building permits and approvals', 'high', 14, 1),
    ('Site Preparation', 'Clear lot, excavation, utilities', 'high', 7, 2),
    ('Foundation', 'Pour footings and foundation', 'high', 10, 3),
    ('Framing', 'Frame walls, floors, and roof structure', 'high', 14, 4),
    ('Roofing', 'Install sheathing, underlayment, and roofing', 'high', 5, 5),
    ('Exterior Sheathing', 'Install exterior sheathing and wrap', 'medium', 4, 6),
    ('Windows & Doors', 'Install all windows and exterior doors', 'high', 3, 7),
    ('Plumbing Rough-In', 'Install water supply and drain lines', 'high', 5, 8),
    ('Electrical Rough-In', 'Install wiring and electrical boxes', 'high', 5, 9),
    ('HVAC Rough-In', 'Install ductwork and equipment', 'high', 4, 10),
    ('Insulation', 'Install wall and ceiling insulation', 'medium', 3, 11),
    ('Drywall', 'Hang, tape, and finish drywall', 'medium', 10, 12),
    ('Exterior Siding', 'Install siding and exterior trim', 'medium', 7, 13),
    ('Interior Trim', 'Install doors, baseboards, and trim', 'medium', 5, 14),
    ('Flooring', 'Install all flooring materials', 'medium', 5, 15),
    ('Kitchen Installation', 'Install cabinets and countertops', 'high', 4, 16),
    ('Bathroom Fixtures', 'Install all bathroom fixtures', 'high', 3, 17),
    ('Interior Painting', 'Paint all interior surfaces', 'medium', 5, 18),
    ('Exterior Painting', 'Paint/stain exterior surfaces', 'medium', 3, 19),
    ('Final Mechanicals', 'Complete plumbing, electrical, HVAC', 'high', 3, 20),
    ('Landscaping', 'Grade, sod, and landscape', 'low', 3, 21),
    ('Final Inspection', 'Pass all final inspections', 'high', 2, 22),
    ('Punch List', 'Complete all remaining items', 'high', 3, 23),
    ('Final Cleaning', 'Deep clean for move-in', 'low', 1, 24)
  ) AS t(title, description, priority, duration, ord)
  WHERE pc.slug = 'new-home-construction';

  -- Create expense templates for New Home Construction
  INSERT INTO expense_templates (category_id, description, typical_amount, expense_category, vendor, display_order)
  SELECT 
    pc.id,
    e.description,
    e.amount,
    e.category,
    e.vendor,
    e.ord
  FROM project_categories pc
  CROSS JOIN (VALUES
    ('Building Permits', 4500.00, 'Service', 'City Building Dept', 1),
    ('Site Work & Excavation', 12000.00, 'Subcontractor', 'Excavation Contractor', 2),
    ('Foundation Materials', 8500.00, 'Material', 'Concrete Supplier', 3),
    ('Foundation Labor', 6500.00, 'Subcontractor', 'Foundation Contractor', 4),
    ('Framing Materials', 28000.00, 'Material', 'Lumber Yard', 5),
    ('Framing Labor', 18000.00, 'Subcontractor', 'Framing Contractor', 6),
    ('Roofing Materials', 8000.00, 'Material', 'Roofing Supplier', 7),
    ('Roofing Labor', 6000.00, 'Subcontractor', 'Roofing Contractor', 8),
    ('Windows & Doors', 15000.00, 'Material', 'Window/Door Supplier', 9),
    ('Plumbing Contract', 12000.00, 'Subcontractor', 'Plumbing Contractor', 10),
    ('Electrical Contract', 11000.00, 'Subcontractor', 'Electrical Contractor', 11),
    ('HVAC Contract', 9500.00, 'Subcontractor', 'HVAC Contractor', 12),
    ('Insulation', 4500.00, 'Subcontractor', 'Insulation Contractor', 13),
    ('Drywall Materials', 6000.00, 'Material', 'Drywall Supplier', 14),
    ('Drywall Labor', 8500.00, 'Subcontractor', 'Drywall Contractor', 15),
    ('Siding Materials', 12000.00, 'Material', 'Siding Supplier', 16),
    ('Siding Labor', 8000.00, 'Subcontractor', 'Siding Contractor', 17),
    ('Flooring Materials', 10000.00, 'Material', 'Flooring Store', 18),
    ('Flooring Labor', 5000.00, 'Subcontractor', 'Flooring Installer', 19),
    ('Kitchen Cabinets', 12000.00, 'Material', 'Cabinet Supplier', 20),
    ('Countertops', 6000.00, 'Material', 'Stone Fabricator', 21),
    ('Interior Paint', 6500.00, 'Subcontractor', 'Painting Contractor', 22),
    ('Appliances', 6000.00, 'Material', 'Appliance Store', 23),
    ('Landscaping', 8000.00, 'Subcontractor', 'Landscape Contractor', 24)
  ) AS e(description, amount, category, vendor, ord)
  WHERE pc.slug = 'new-home-construction';

END $$;