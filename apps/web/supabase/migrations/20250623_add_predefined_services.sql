-- Add predefined services for industries
-- Starting with General Construction and Plumbing as test cases

-- General Construction Services
INSERT INTO services (
  name,
  description,
  category,
  industry_id,
  is_active,
  display_order
) VALUES
  -- Installation Services
  ('Foundation Work', 'Installation and repair of building foundations', 'installation', 
   (SELECT id FROM industries WHERE slug = 'general-construction'), true, 10),
  
  ('Framing', 'Wood and metal framing for residential and commercial structures', 'installation',
   (SELECT id FROM industries WHERE slug = 'general-construction'), true, 20),
  
  ('Concrete Work', 'Concrete pouring, finishing, and repair services', 'installation',
   (SELECT id FROM industries WHERE slug = 'general-construction'), true, 30),
  
  ('Drywall Installation', 'Hanging, taping, and finishing drywall', 'installation',
   (SELECT id FROM industries WHERE slug = 'general-construction'), true, 40),
  
  -- Repair Services
  ('Structural Repairs', 'Repair of load-bearing elements and structural damage', 'repair',
   (SELECT id FROM industries WHERE slug = 'general-construction'), true, 50),
  
  ('Water Damage Restoration', 'Repair and restoration after water damage', 'repair',
   (SELECT id FROM industries WHERE slug = 'general-construction'), true, 60),
  
  -- Consultation Services
  ('Project Consultation', 'Construction planning and feasibility consultation', 'consultation',
   (SELECT id FROM industries WHERE slug = 'general-construction'), true, 70),
  
  ('Building Inspection', 'Pre-purchase and construction phase inspections', 'inspection',
   (SELECT id FROM industries WHERE slug = 'general-construction'), true, 80);

-- Plumbing Services
INSERT INTO services (
  name,
  description,
  category,
  industry_id,
  is_active,
  display_order
) VALUES
  -- Installation Services
  ('Fixture Installation', 'Installation of sinks, toilets, faucets, and other fixtures', 'installation',
   (SELECT id FROM industries WHERE slug = 'plumbing'), true, 10),
  
  ('Pipe Installation', 'Installation of water supply and drainage pipes', 'installation',
   (SELECT id FROM industries WHERE slug = 'plumbing'), true, 20),
  
  ('Water Heater Installation', 'Installation and replacement of water heaters', 'installation',
   (SELECT id FROM industries WHERE slug = 'plumbing'), true, 30),
  
  -- Repair Services
  ('Leak Repair', 'Detection and repair of water leaks', 'repair',
   (SELECT id FROM industries WHERE slug = 'plumbing'), true, 40),
  
  ('Drain Cleaning', 'Clearing clogs and cleaning drainage systems', 'repair',
   (SELECT id FROM industries WHERE slug = 'plumbing'), true, 50),
  
  ('Emergency Plumbing', '24/7 emergency plumbing repairs', 'repair',
   (SELECT id FROM industries WHERE slug = 'plumbing'), true, 60),
  
  -- Maintenance Services
  ('Plumbing Maintenance', 'Regular inspection and maintenance of plumbing systems', 'maintenance',
   (SELECT id FROM industries WHERE slug = 'plumbing'), true, 70),
  
  -- Inspection Services
  ('Plumbing Inspection', 'Comprehensive plumbing system inspections', 'inspection',
   (SELECT id FROM industries WHERE slug = 'plumbing'), true, 80);

-- Electrical Services
INSERT INTO services (
  name,
  description,
  category,
  industry_id,
  is_active,
  display_order
) VALUES
  -- Installation Services
  ('Outlet & Switch Installation', 'Installation of electrical outlets, switches, and covers', 'installation',
   (SELECT id FROM industries WHERE slug = 'electrical'), true, 10),
  
  ('Lighting Installation', 'Installation of indoor and outdoor lighting fixtures', 'installation',
   (SELECT id FROM industries WHERE slug = 'electrical'), true, 20),
  
  ('Panel Upgrade', 'Electrical panel replacement and upgrades', 'installation',
   (SELECT id FROM industries WHERE slug = 'electrical'), true, 30),
  
  ('Wiring Installation', 'Running new electrical wiring for renovations or new construction', 'installation',
   (SELECT id FROM industries WHERE slug = 'electrical'), true, 40),
  
  -- Repair Services
  ('Electrical Troubleshooting', 'Diagnosis and repair of electrical issues', 'repair',
   (SELECT id FROM industries WHERE slug = 'electrical'), true, 50),
  
  ('Emergency Electrical', '24/7 emergency electrical repairs', 'repair',
   (SELECT id FROM industries WHERE slug = 'electrical'), true, 60),
  
  -- Inspection Services
  ('Electrical Inspection', 'Safety inspections and code compliance checks', 'inspection',
   (SELECT id FROM industries WHERE slug = 'electrical'), true, 70),
  
  -- Maintenance Services
  ('Electrical Maintenance', 'Preventive maintenance for electrical systems', 'maintenance',
   (SELECT id FROM industries WHERE slug = 'electrical'), true, 80);

-- HVAC Services (for good measure)
INSERT INTO services (
  name,
  description,
  category,
  industry_id,
  is_active,
  display_order
) VALUES
  -- Installation Services
  ('AC Installation', 'Installation of air conditioning systems', 'installation',
   (SELECT id FROM industries WHERE slug = 'hvac'), true, 10),
  
  ('Furnace Installation', 'Installation of heating systems and furnaces', 'installation',
   (SELECT id FROM industries WHERE slug = 'hvac'), true, 20),
  
  ('Ductwork Installation', 'Installation and modification of HVAC ductwork', 'installation',
   (SELECT id FROM industries WHERE slug = 'hvac'), true, 30),
  
  -- Repair Services
  ('AC Repair', 'Diagnosis and repair of air conditioning systems', 'repair',
   (SELECT id FROM industries WHERE slug = 'hvac'), true, 40),
  
  ('Heating Repair', 'Repair of furnaces and heating systems', 'repair',
   (SELECT id FROM industries WHERE slug = 'hvac'), true, 50),
  
  -- Maintenance Services
  ('HVAC Tune-Up', 'Seasonal maintenance and system optimization', 'maintenance',
   (SELECT id FROM industries WHERE slug = 'hvac'), true, 60),
  
  ('Filter Replacement', 'Regular filter replacement service', 'maintenance',
   (SELECT id FROM industries WHERE slug = 'hvac'), true, 70),
  
  -- Inspection Services
  ('HVAC Inspection', 'System efficiency and safety inspections', 'inspection',
   (SELECT id FROM industries WHERE slug = 'hvac'), true, 80);

-- Add a note about this migration
COMMENT ON TABLE services IS 'Predefined services added for General Construction, Plumbing, Electrical, and HVAC industries. Organizations can add custom services or service options with their specific pricing.';