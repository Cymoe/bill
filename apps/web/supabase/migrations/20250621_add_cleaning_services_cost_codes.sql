-- Cleaning Services Cost Codes Migration
-- Comprehensive cost codes for cleaning contractors covering residential and commercial services

-- Insert Cleaning Services Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'cleaning'),
  NULL
FROM (VALUES
  -- Service Types and Packages (CS001-CS099)
  ('CS001', 'Initial Deep Clean', 'First-time deep cleaning service', 'service', 'hour', 55.00),
  ('CS002', 'Regular Cleaning', 'Recurring maintenance clean', 'service', 'hour', 45.00),
  ('CS003', 'Move-In Cleaning', 'Empty home deep clean', 'service', 'sf', 0.25),
  ('CS004', 'Move-Out Cleaning', 'End of lease cleaning', 'service', 'sf', 0.30),
  ('CS005', 'Post-Construction', 'Construction cleanup', 'service', 'sf', 0.45),
  ('CS006', 'Spring Cleaning', 'Seasonal deep clean', 'service', 'hour', 50.00),
  ('CS007', 'One-Time Clean', 'Single service cleaning', 'service', 'hour', 50.00),
  ('CS008', 'Emergency Cleaning', 'Same-day service', 'service', 'hour', 75.00),
  ('CS009', 'Green Cleaning', 'Eco-friendly service', 'service', 'hour', 55.00),
  ('CS010', 'Sanitization Service', 'Deep sanitization', 'service', 'sf', 0.15),
  ('CS011', 'Weekend Service', 'Weekend cleaning premium', 'service', 'hour', 55.00),
  ('CS012', 'Holiday Cleaning', 'Pre/post holiday service', 'service', 'hour', 65.00),
  ('CS013', 'Pet-Friendly Clean', 'Pet-safe products', 'service', 'hour', 50.00),

  -- Labor Rates (CS100-CS199)
  ('CS100', 'Team Leader', 'Cleaning team leader', 'labor', 'hour', 35.00),
  ('CS101', 'Cleaner', 'Professional cleaner', 'labor', 'hour', 25.00),
  ('CS102', 'Specialist', 'Specialized cleaning tech', 'labor', 'hour', 45.00),
  ('CS103', '2-Person Team', 'Two cleaner team', 'labor', 'hour', 85.00),
  ('CS104', '3-Person Team', 'Three cleaner team', 'labor', 'hour', 125.00),
  ('CS105', '4-Person Team', 'Four cleaner team', 'labor', 'hour', 165.00),
  ('CS106', 'Supervisor', 'Quality control supervisor', 'labor', 'hour', 55.00),
  ('CS107', 'Night Shift', 'After-hours cleaning', 'labor', 'hour', 35.00),
  ('CS108', 'Commercial Team', 'Commercial cleaning crew', 'labor', 'hour', 145.00),

  -- Residential Room Services (CS200-CS299)
  ('CS200', 'Kitchen - Basic', 'Standard kitchen cleaning', 'service', 'ea', 45.00),
  ('CS201', 'Kitchen - Deep', 'Deep kitchen cleaning', 'service', 'ea', 85.00),
  ('CS202', 'Bathroom - Basic', 'Standard bathroom clean', 'service', 'ea', 35.00),
  ('CS203', 'Bathroom - Deep', 'Deep bathroom cleaning', 'service', 'ea', 65.00),
  ('CS204', 'Bedroom - Basic', 'Standard bedroom clean', 'service', 'ea', 25.00),
  ('CS205', 'Bedroom - Deep', 'Deep bedroom cleaning', 'service', 'ea', 45.00),
  ('CS206', 'Living Areas', 'Living/dining room clean', 'service', 'room', 35.00),
  ('CS207', 'Home Office', 'Office cleaning service', 'service', 'ea', 30.00),
  ('CS208', 'Basement', 'Basement cleaning', 'service', 'sf', 0.15),
  ('CS209', 'Garage', 'Garage cleaning service', 'service', 'bay', 65.00),
  ('CS210', 'Laundry Room', 'Laundry area cleaning', 'service', 'ea', 25.00),
  ('CS211', 'Stairs/Hallways', 'Stairway and hall cleaning', 'service', 'flight', 25.00),

  -- Appliance Cleaning (CS250-CS299)
  ('CS250', 'Refrigerator - Inside', 'Interior fridge cleaning', 'service', 'ea', 45.00),
  ('CS251', 'Refrigerator - Outside', 'Exterior fridge cleaning', 'service', 'ea', 15.00),
  ('CS252', 'Oven Cleaning', 'Deep oven cleaning', 'service', 'ea', 65.00),
  ('CS253', 'Microwave', 'Microwave cleaning', 'service', 'ea', 15.00),
  ('CS254', 'Dishwasher', 'Dishwasher cleaning', 'service', 'ea', 25.00),
  ('CS255', 'Washer/Dryer', 'Laundry appliance clean', 'service', 'set', 35.00),
  ('CS256', 'Small Appliances', 'Counter appliance cleaning', 'service', 'ea', 10.00),
  ('CS257', 'Range Hood', 'Exhaust hood cleaning', 'service', 'ea', 35.00),
  ('CS258', 'Garbage Disposal', 'Disposal cleaning/freshening', 'service', 'ea', 15.00),

  -- Window and Glass (CS300-CS349)
  ('CS300', 'Window - Interior', 'Inside window cleaning', 'service', 'pane', 3.50),
  ('CS301', 'Window - Exterior', 'Outside window cleaning', 'service', 'pane', 5.50),
  ('CS302', 'Window - Both Sides', 'Complete window cleaning', 'service', 'pane', 8.50),
  ('CS303', 'Window Sills/Tracks', 'Sill and track cleaning', 'service', 'window', 5.00),
  ('CS304', 'Sliding Door', 'Sliding glass door clean', 'service', 'ea', 15.00),
  ('CS305', 'Mirror Cleaning', 'Mirror polishing', 'service', 'ea', 8.00),
  ('CS306', 'Glass Surfaces', 'Glass table/shelf clean', 'service', 'sf', 0.50),
  ('CS307', 'Screen Cleaning', 'Window screen washing', 'service', 'ea', 8.00),
  ('CS308', 'Skylight Cleaning', 'Skylight cleaning', 'service', 'ea', 25.00),
  ('CS309', 'Storm Window', 'Storm window cleaning', 'service', 'ea', 12.00),

  -- Floor Care (CS350-CS399)
  ('CS350', 'Vacuum - Carpet', 'Carpet vacuuming', 'service', 'sf', 0.05),
  ('CS351', 'Vacuum - Rugs', 'Area rug vacuuming', 'service', 'ea', 15.00),
  ('CS352', 'Mop - Hardwood', 'Hardwood floor mopping', 'service', 'sf', 0.08),
  ('CS353', 'Mop - Tile', 'Tile floor mopping', 'service', 'sf', 0.06),
  ('CS354', 'Floor Polish', 'Floor polishing service', 'service', 'sf', 0.25),
  ('CS355', 'Floor Waxing', 'Professional floor waxing', 'service', 'sf', 0.35),
  ('CS356', 'Grout Cleaning', 'Tile grout cleaning', 'service', 'sf', 0.85),
  ('CS357', 'Baseboard Cleaning', 'Baseboard dusting/washing', 'service', 'lf', 0.50),
  ('CS358', 'Floor Stripping', 'Strip old floor finish', 'service', 'sf', 0.45),
  ('CS359', 'Carpet Spot Clean', 'Spot stain treatment', 'service', 'ea', 15.00),

  -- Specialized Cleaning (CS400-CS449)
  ('CS400', 'Carpet Cleaning', 'Hot water extraction', 'service', 'sf', 0.35),
  ('CS401', 'Upholstery - Sofa', 'Sofa deep cleaning', 'service', 'ea', 125.00),
  ('CS402', 'Upholstery - Chair', 'Chair deep cleaning', 'service', 'ea', 65.00),
  ('CS403', 'Mattress Cleaning', 'Mattress sanitization', 'service', 'ea', 85.00),
  ('CS404', 'Air Duct Cleaning', 'HVAC duct cleaning', 'subcontractor', 'system', 485.00),
  ('CS405', 'Pressure Washing', 'Exterior pressure wash', 'service', 'sf', 0.15),
  ('CS406', 'Blind Cleaning', 'Venetian blind cleaning', 'service', 'window', 25.00),
  ('CS407', 'Chandelier Cleaning', 'Detailed light cleaning', 'service', 'ea', 125.00),
  ('CS408', 'Ceiling Fan', 'Ceiling fan cleaning', 'service', 'ea', 25.00),
  ('CS409', 'Wall Washing', 'Wall surface cleaning', 'service', 'sf', 0.35),

  -- Commercial Services (CS450-CS499)
  ('CS450', 'Office - Small', 'Small office cleaning', 'service', 'sf', 0.12),
  ('CS451', 'Office - Large', 'Large office cleaning', 'service', 'sf', 0.08),
  ('CS452', 'Retail Space', 'Retail store cleaning', 'service', 'sf', 0.10),
  ('CS453', 'Restaurant', 'Restaurant cleaning', 'service', 'sf', 0.15),
  ('CS454', 'Medical Office', 'Medical facility cleaning', 'service', 'sf', 0.18),
  ('CS455', 'Gym/Fitness', 'Fitness center cleaning', 'service', 'sf', 0.12),
  ('CS456', 'Warehouse', 'Warehouse cleaning', 'service', 'sf', 0.06),
  ('CS457', 'School/Daycare', 'Educational facility clean', 'service', 'sf', 0.10),
  ('CS458', 'Bank/Financial', 'Financial institution clean', 'service', 'sf', 0.12),
  ('CS459', 'Church/Worship', 'Place of worship cleaning', 'service', 'sf', 0.08),
  ('CS460', 'Common Areas', 'Building common areas', 'service', 'sf', 0.08),
  ('CS461', 'Restroom Service', 'Commercial restroom clean', 'service', 'fixture', 15.00),
  ('CS462', 'Break Room', 'Employee break room', 'service', 'ea', 45.00),
  ('CS463', 'Conference Room', 'Meeting room cleaning', 'service', 'ea', 35.00),

  -- Supplies and Materials (CS500-CS549)
  ('CS500', 'All-Purpose Cleaner', 'General cleaning solution', 'material', 'gal', 18.00),
  ('CS501', 'Glass Cleaner', 'Window cleaning solution', 'material', 'gal', 15.00),
  ('CS502', 'Disinfectant', 'EPA-approved disinfectant', 'material', 'gal', 25.00),
  ('CS503', 'Floor Cleaner', 'Floor cleaning solution', 'material', 'gal', 22.00),
  ('CS504', 'Bathroom Cleaner', 'Bathroom specific cleaner', 'material', 'gal', 20.00),
  ('CS505', 'Degreaser', 'Kitchen degreaser', 'material', 'gal', 28.00),
  ('CS506', 'Furniture Polish', 'Wood furniture polish', 'material', 'can', 8.50),
  ('CS507', 'Microfiber Cloths', 'Professional microfiber', 'material', 'dz', 18.00),
  ('CS508', 'Mop Heads', 'Commercial mop heads', 'material', 'ea', 12.00),
  ('CS509', 'Vacuum Bags', 'Commercial vacuum bags', 'material', 'pk', 15.00),
  ('CS510', 'Trash Bags', 'Heavy duty trash bags', 'material', 'case', 45.00),
  ('CS511', 'Paper Towels', 'Commercial paper towels', 'material', 'case', 38.00),
  ('CS512', 'Toilet Paper', 'Commercial toilet paper', 'material', 'case', 42.00),
  ('CS513', 'Hand Soap', 'Liquid hand soap', 'material', 'gal', 15.00),
  ('CS514', 'Air Freshener', 'Commercial air freshener', 'material', 'can', 8.00),

  -- Equipment (CS550-CS599)
  ('CS550', 'Vacuum - Commercial', 'Commercial vacuum', 'equipment', 'ea', 385.00),
  ('CS551', 'Floor Buffer', 'Floor buffing machine', 'equipment', 'day', 125.00),
  ('CS552', 'Carpet Extractor', 'Carpet cleaning machine', 'equipment', 'day', 185.00),
  ('CS553', 'Pressure Washer', 'Power washing equipment', 'equipment', 'day', 145.00),
  ('CS554', 'Extension Poles', 'High reach tools', 'equipment', 'ea', 45.00),
  ('CS555', 'Cleaning Cart', 'Janitorial cart', 'equipment', 'ea', 285.00),
  ('CS556', 'Wet/Dry Vacuum', 'Shop vacuum', 'equipment', 'ea', 185.00),
  ('CS557', 'Steam Cleaner', 'Steam cleaning unit', 'equipment', 'day', 95.00),
  ('CS558', 'Ladder', '6-foot step ladder', 'equipment', 'ea', 125.00),

  -- Add-On Services (CS600-CS699)
  ('CS600', 'Inside Cabinets', 'Cabinet interior cleaning', 'service', 'lf', 8.50),
  ('CS601', 'Light Fixtures', 'Light fixture cleaning', 'service', 'ea', 15.00),
  ('CS602', 'Switch Plates', 'Clean outlet covers', 'service', 'ea', 2.50),
  ('CS603', 'Door Cleaning', 'Door and frame washing', 'service', 'ea', 8.00),
  ('CS604', 'Pet Hair Removal', 'Specialized pet hair service', 'service', 'room', 25.00),
  ('CS605', 'Cobweb Removal', 'High ceiling cobwebs', 'service', 'room', 15.00),
  ('CS606', 'Trash Removal', 'Haul away trash', 'service', 'bag', 5.00),
  ('CS607', 'Recycling Service', 'Sort and remove recycling', 'service', 'hour', 35.00),
  ('CS608', 'Organization', 'Basic organizing service', 'service', 'hour', 45.00),
  ('CS609', 'Bed Making', 'Make beds/change linens', 'service', 'bed', 15.00),
  ('CS610', 'Linen Service', 'Wash and fold linens', 'service', 'load', 25.00),
  ('CS611', 'Dish Washing', 'Wash dirty dishes', 'service', 'load', 15.00),
  ('CS612', 'Plant Care', 'Water indoor plants', 'service', 'visit', 15.00),

  -- Specialty Situations (CS700-CS749)
  ('CS700', 'Hoarding Cleanup', 'Extreme cleaning situation', 'service', 'hour', 85.00),
  ('CS701', 'Biohazard Cleaning', 'Hazardous material cleanup', 'subcontractor', 'hour', 185.00),
  ('CS702', 'Crime Scene', 'Crime scene cleaning', 'subcontractor', 'hour', 285.00),
  ('CS703', 'Fire/Smoke Damage', 'Fire damage cleaning', 'service', 'sf', 0.85),
  ('CS704', 'Water Damage', 'Water damage cleanup', 'service', 'sf', 0.65),
  ('CS705', 'Mold Remediation', 'Mold cleanup service', 'subcontractor', 'sf', 8.50),
  ('CS706', 'Odor Removal', 'Professional deodorizing', 'service', 'room', 125.00),
  ('CS707', 'Estate Cleaning', 'Estate cleanout service', 'service', 'hour', 65.00),

  -- Airbnb/Rental Services (CS750-CS799)
  ('CS750', 'Vacation Rental', 'Short-term rental clean', 'service', 'unit', 125.00),
  ('CS751', 'Turnover Service', 'Between guest cleaning', 'service', 'hour', 55.00),
  ('CS752', 'Linen Exchange', 'Fresh linen service', 'service', 'set', 35.00),
  ('CS753', 'Restock Supplies', 'Replenish amenities', 'service', 'unit', 25.00),
  ('CS754', 'Key Exchange', 'Key handling service', 'service', 'ea', 15.00),
  ('CS755', 'Damage Inspection', 'Property inspection', 'service', 'unit', 35.00),
  ('CS756', 'Guest Prep', 'Pre-arrival preparation', 'service', 'unit', 45.00),

  -- Green/Eco Services (CS800-CS849)
  ('CS800', 'Eco Products', 'Green cleaning products', 'material', 'kit', 65.00),
  ('CS801', 'Essential Oils', 'Natural fragrance options', 'material', 'set', 45.00),
  ('CS802', 'Reusable Supplies', 'Washable cleaning cloths', 'material', 'set', 35.00),
  ('CS803', 'HEPA Filtration', 'HEPA vacuum service', 'service', 'hour', 10.00),
  ('CS804', 'Chemical-Free', 'No chemical cleaning', 'service', 'hour', 60.00),
  ('CS805', 'Allergen Reduction', 'Anti-allergen treatment', 'service', 'room', 35.00),

  -- Contracts and Packages (CS850-CS899)
  ('CS850', 'Weekly Contract', 'Weekly service discount', 'service', 'month', -10.00),
  ('CS851', 'Bi-Weekly Contract', 'Bi-weekly discount', 'service', 'month', -5.00),
  ('CS852', 'Monthly Contract', 'Monthly service rate', 'service', 'month', 0.00),
  ('CS853', 'Quarterly Deep', 'Quarterly deep clean', 'service', 'visit', 285.00),
  ('CS854', 'Annual Contract', 'Yearly service agreement', 'service', 'year', -15.00),
  ('CS855', 'Package - Studio', 'Studio apartment package', 'service', 'ea', 85.00),
  ('CS856', 'Package - 1BR', '1-bedroom package', 'service', 'ea', 125.00),
  ('CS857', 'Package - 2BR', '2-bedroom package', 'service', 'ea', 165.00),
  ('CS858', 'Package - 3BR', '3-bedroom package', 'service', 'ea', 225.00),
  ('CS859', 'Package - 4BR+', '4+ bedroom package', 'service', 'ea', 285.00),

  -- Miscellaneous (CS900-CS999)
  ('CS900', 'Travel Fee', 'Outside service area', 'service', 'mile', 1.25),
  ('CS901', 'Rush Fee', 'Same-day service fee', 'service', 'ls', 50.00),
  ('CS902', 'Cancellation Fee', 'Late cancellation charge', 'service', 'ls', 50.00),
  ('CS903', 'Key Service', 'Key pickup/dropoff', 'service', 'trip', 25.00),
  ('CS904', 'Pet Fee', 'Additional pet charge', 'service', 'pet', 15.00),
  ('CS905', 'Heavy Soil Fee', 'Extremely dirty surcharge', 'service', 'hour', 15.00),
  ('CS906', 'Access Fee', 'Difficult access charge', 'service', 'ls', 35.00),
  ('CS907', 'Supply Fee', 'Customer supplies credit', 'service', 'ls', -10.00),
  ('CS908', 'Tip/Gratuity', 'Service gratuity', 'service', 'ls', 0.00),
  ('CS909', 'Quality Guarantee', 'Satisfaction guarantee', 'service', 'ls', 0.00),
  ('CS910', 'Insurance', 'Additional insurance', 'service', 'month', 45.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_cleaning ON cost_codes(code) WHERE code LIKE 'CS%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for cleaning services including residential, commercial, and specialty cleaning';