-- Seed data for Window & Door Contractors industry
-- Industry ID: 919a15b7-4ce8-4c5e-8dda-b73cee43de68

-- First, add cost codes for Window & Door
INSERT INTO cost_codes (id, industry_id, code, name, category, description, organization_id, is_active)
VALUES
  -- Labor rates
  (gen_random_uuid(), '919a15b7-4ce8-4c5e-8dda-b73cee43de68', 'WD100', 'Window & Door Labor', 'labor', 'Installation and service labor', NULL, true),
  -- Window services
  (gen_random_uuid(), '919a15b7-4ce8-4c5e-8dda-b73cee43de68', 'WD200', 'Window Installation', 'service', 'Window installation services', NULL, true),
  -- Door services
  (gen_random_uuid(), '919a15b7-4ce8-4c5e-8dda-b73cee43de68', 'WD300', 'Door Installation', 'service', 'Door installation services', NULL, true),
  -- Repair services
  (gen_random_uuid(), '919a15b7-4ce8-4c5e-8dda-b73cee43de68', 'WD400', 'Repair & Service', 'service', 'Window and door repairs', NULL, true),
  -- Materials and hardware
  (gen_random_uuid(), '919a15b7-4ce8-4c5e-8dda-b73cee43de68', 'WD500', 'Materials & Hardware', 'material', 'Windows, doors, and hardware', NULL, true);

-- Get the cost code IDs and insert line items
WITH cost_code_ids AS (
  SELECT id, code FROM cost_codes 
  WHERE industry_id = '919a15b7-4ce8-4c5e-8dda-b73cee43de68' 
  AND organization_id IS NULL
)
-- Insert line items
INSERT INTO line_items (id, user_id, cost_code_id, name, description, price, unit, is_active)
SELECT 
  gen_random_uuid(),
  '21471c0c-2492-4fdb-af77-ac0f2fd78ed5'::uuid, -- System user ID
  cc.id,
  li.name,
  li.description,
  li.price,
  li.unit,
  true
FROM (
  VALUES
  -- WD100 - Window & Door Labor
  ('WD100', 'Installer', 'Professional installer', 55.00, 'hour'),
  ('WD100', 'Lead Installer', 'Senior installation specialist', 75.00, 'hour'),
  ('WD100', 'Service Technician', 'Repair technician', 65.00, 'hour'),
  ('WD100', 'Helper', 'Installation assistant', 35.00, 'hour'),
  ('WD100', 'Emergency Service', 'After-hours service', 125.00, 'hour'),
  
  -- WD200 - Window Installation
  ('WD200', 'Single Hung Install', 'Standard single hung window', 285.00, 'each'),
  ('WD200', 'Double Hung Install', 'Double hung window', 325.00, 'each'),
  ('WD200', 'Casement Install', 'Casement window installation', 345.00, 'each'),
  ('WD200', 'Slider Install', 'Sliding window installation', 295.00, 'each'),
  ('WD200', 'Bay Window Install', 'Bay window installation', 850.00, 'each'),
  ('WD200', 'Bow Window Install', 'Bow window installation', 950.00, 'each'),
  ('WD200', 'Picture Window Install', 'Fixed picture window', 425.00, 'each'),
  ('WD200', 'Awning Window Install', 'Awning window installation', 315.00, 'each'),
  ('WD200', 'Garden Window Install', 'Garden window installation', 685.00, 'each'),
  ('WD200', 'Skylight Install', 'Skylight installation', 785.00, 'each'),
  ('WD200', 'Egress Window Install', 'Basement egress window', 1250.00, 'each'),
  ('WD200', 'Storm Window Install', 'Storm window installation', 165.00, 'each'),
  ('WD200', 'Window Removal', 'Remove existing window', 125.00, 'each'),
  ('WD200', 'Window Trim Install', 'Interior trim installation', 85.00, 'each'),
  ('WD200', 'Exterior Caulking', 'Seal window exterior', 65.00, 'each'),
  ('WD200', 'Window Well Install', 'Egress window well', 485.00, 'each'),
  
  -- WD300 - Door Installation
  ('WD300', 'Entry Door Install', 'Front entry door', 485.00, 'each'),
  ('WD300', 'Interior Door Install', 'Interior passage door', 225.00, 'each'),
  ('WD300', 'French Door Install', 'Interior French doors', 585.00, 'pair'),
  ('WD300', 'Sliding Glass Install', 'Patio sliding door', 685.00, 'each'),
  ('WD300', 'Bi-Fold Door Install', 'Closet bi-fold doors', 285.00, 'each'),
  ('WD300', 'Pocket Door Install', 'Pocket door installation', 485.00, 'each'),
  ('WD300', 'Storm Door Install', 'Storm door installation', 285.00, 'each'),
  ('WD300', 'Security Door Install', 'Security door installation', 585.00, 'each'),
  ('WD300', 'Garage Door Install', 'Single car garage door', 885.00, 'each'),
  ('WD300', 'Double Garage Install', 'Double car garage door', 1285.00, 'each'),
  ('WD300', 'Pet Door Install', 'Dog/cat door installation', 285.00, 'each'),
  ('WD300', 'Door Removal', 'Remove existing door', 95.00, 'each'),
  ('WD300', 'Threshold Install', 'Door threshold replacement', 125.00, 'each'),
  ('WD300', 'Door Trim Install', 'Interior door trim', 125.00, 'each'),
  ('WD300', 'Weatherstrip Install', 'Door weatherstripping', 85.00, 'each'),
  
  -- WD400 - Repair & Service
  ('WD400', 'Window Glass Replace', 'Replace broken glass', 185.00, 'each'),
  ('WD400', 'Sash Repair', 'Window sash repair', 225.00, 'each'),
  ('WD400', 'Screen Repair', 'Window screen repair', 65.00, 'each'),
  ('WD400', 'Screen Replace', 'New window screen', 95.00, 'each'),
  ('WD400', 'Window Balance Repair', 'Fix window balance', 145.00, 'each'),
  ('WD400', 'Crank Repair', 'Casement crank repair', 125.00, 'each'),
  ('WD400', 'Lock Repair', 'Window lock repair', 85.00, 'each'),
  ('WD400', 'Door Adjustment', 'Adjust sticking door', 125.00, 'each'),
  ('WD400', 'Hinge Replacement', 'Replace door hinges', 95.00, 'set'),
  ('WD400', 'Door Lock Repair', 'Fix door lock mechanism', 145.00, 'each'),
  ('WD400', 'Closer Adjustment', 'Adjust door closer', 85.00, 'each'),
  ('WD400', 'Garage Door Tune-up', 'Service garage door', 185.00, 'each'),
  ('WD400', 'Spring Replacement', 'Garage door spring', 385.00, 'pair'),
  ('WD400', 'Roller Replacement', 'Garage door rollers', 285.00, 'set'),
  ('WD400', 'Weather Seal Replace', 'Door/window seal', 125.00, 'each'),
  
  -- WD500 - Materials & Hardware
  ('WD500', 'Entry Door - Steel', 'Steel entry door unit', 485.00, 'each'),
  ('WD500', 'Entry Door - Fiberglass', 'Fiberglass entry door', 685.00, 'each'),
  ('WD500', 'Entry Door - Wood', 'Wood entry door unit', 885.00, 'each'),
  ('WD500', 'Interior Door - Hollow', 'Hollow core door', 85.00, 'each'),
  ('WD500', 'Interior Door - Solid', 'Solid core door', 185.00, 'each'),
  ('WD500', 'French Door Set', 'Interior French doors', 485.00, 'pair'),
  ('WD500', 'Sliding Glass Door', 'Patio door unit', 885.00, 'each'),
  ('WD500', 'Double Hung Window', 'Vinyl double hung', 285.00, 'each'),
  ('WD500', 'Casement Window', 'Vinyl casement window', 385.00, 'each'),
  ('WD500', 'Entry Lockset', 'Keyed entry set', 125.00, 'each'),
  ('WD500', 'Privacy Lockset', 'Bathroom/bedroom lock', 65.00, 'each'),
  ('WD500', 'Passage Set', 'Non-locking door set', 45.00, 'each'),
  ('WD500', 'Deadbolt', 'Single cylinder deadbolt', 85.00, 'each'),
  ('WD500', 'Door Hinges', '3 pack door hinges', 24.00, 'pack'),
  ('WD500', 'Door Closer', 'Commercial door closer', 185.00, 'each'),
  ('WD500', 'Threshold', 'Aluminum threshold', 45.00, 'each'),
  ('WD500', 'Weatherstripping Kit', 'Complete door kit', 35.00, 'kit'),
  ('WD500', 'Window Screen', 'Custom window screen', 45.00, 'each'),
  ('WD500', 'Storm Door', 'Aluminum storm door', 285.00, 'each')
) AS li(code, name, description, price, unit)
JOIN cost_code_ids cc ON cc.code = li.code;