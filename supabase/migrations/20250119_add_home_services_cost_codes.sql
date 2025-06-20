-- Home Services Cost Codes Migration
-- Adds cost codes for non-construction home service businesses

-- This migration adds cost codes for home services using the XX.XX format:
-- 70-89: Home services (non-construction trades)
-- 70-72: HVAC Services
-- 73-74: Appliance Services  
-- 75-76: Cleaning Services
-- 77-78: Pest Control
-- 79-80: Property Management
-- 81-82: Home Inspection
-- 83-84: Moving Services
-- 85-86: Window/Door Services
-- 87-89: General Handyman

BEGIN;

-- HVAC SERVICES (70-72)
-- Heating, ventilation, and air conditioning
-- Installation (70.00-70.29)
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
('70.00', 'Central AC Installation', 'Install central air conditioning system', 'labor', 'ton', 1500.00),
('70.01', 'AC Unit - Equipment', 'Central air conditioning unit', 'equipment', 'ton', 2500.00),
('70.02', 'Furnace Installation', 'Install gas or electric furnace', 'labor', 'each', 1800.00),
('70.03', 'Furnace - Equipment', 'Gas or electric furnace unit', 'equipment', 'each', 2200.00),
('70.04', 'Heat Pump Installation', 'Install heat pump system', 'labor', 'ton', 1800.00),
('70.05', 'Heat Pump - Equipment', 'Heat pump unit and components', 'equipment', 'ton', 3000.00),
('70.06', 'Ductwork Installation', 'Install HVAC ductwork', 'labor', 'lf', 25.00),
('70.07', 'Ductwork Materials', 'Sheet metal and insulation', 'material', 'lf', 15.00),
('70.08', 'Mini-Split Installation', 'Install ductless mini-split', 'labor', 'head', 800.00),
('70.09', 'Mini-Split - Equipment', 'Ductless system components', 'equipment', 'head', 1500.00),
('70.10', 'Thermostat Installation', 'Install programmable thermostat', 'labor', 'each', 185.00),
('70.11', 'Air Handler Installation', 'Install air handler unit', 'labor', 'each', 950.00),
('70.12', 'Ventilation Fan Install', 'Bath or kitchen exhaust fan', 'labor', 'each', 225.00),
('70.13', 'Humidifier Installation', 'Whole-house humidifier', 'labor', 'each', 450.00),
('70.14', 'Air Purifier Installation', 'Whole-house air purification', 'labor', 'each', 650.00),
('70.15', 'Zoning System Install', 'Multi-zone HVAC controls', 'labor', 'zone', 850.00),

-- Repairs (70.30-70.59)
('70.30', 'AC Repair Service', 'Diagnose and repair AC', 'service', 'hour', 125.00),
('70.31', 'Furnace Repair Service', 'Diagnose and repair furnace', 'service', 'hour', 125.00),
('70.32', 'Refrigerant Recharge', 'Add refrigerant to system', 'service', 'lb', 85.00),
('70.33', 'Compressor Replacement', 'Replace AC compressor', 'labor', 'each', 1200.00),
('70.34', 'Blower Motor Replacement', 'Replace furnace blower', 'labor', 'each', 450.00),
('70.35', 'Capacitor Replacement', 'Replace start/run capacitor', 'labor', 'each', 225.00),
('70.36', 'Duct Repair/Sealing', 'Seal leaky ductwork', 'labor', 'hour', 95.00),
('70.37', 'Thermostat Repair', 'Fix thermostat issues', 'service', 'hour', 95.00),
('70.38', 'Heat Exchanger Repair', 'Repair cracked heat exchanger', 'labor', 'each', 850.00),
('70.39', 'Emergency Service', 'After-hours emergency repair', 'service', 'hour', 185.00),

-- Maintenance (70.60-70.79)
('70.60', 'AC Tune-up Service', 'Annual AC maintenance', 'service', 'each', 125.00),
('70.61', 'Furnace Tune-up Service', 'Annual furnace maintenance', 'service', 'each', 125.00),
('70.62', 'Filter Replacement Service', 'Replace air filters', 'service', 'each', 65.00),
('70.63', 'Duct Cleaning Service', 'Clean air ducts thoroughly', 'service', 'each', 450.00),
('70.64', 'Coil Cleaning Service', 'Clean evaporator/condenser coils', 'service', 'each', 185.00),
('70.65', 'HVAC Inspection', 'Complete system inspection', 'service', 'each', 150.00),
('70.66', 'Maintenance Agreement', 'Annual service contract', 'service', 'year', 350.00),
('70.67', 'UV Light Service', 'Replace UV bulbs', 'service', 'each', 125.00),

-- Specialty (70.80-70.99)
('70.80', 'Indoor Air Quality Test', 'Test and analyze air quality', 'service', 'each', 350.00),
('70.81', 'Energy Audit Service', 'HVAC efficiency analysis', 'service', 'each', 450.00),
('70.82', 'Geothermal Installation', 'Geothermal HVAC system', 'labor', 'ton', 3500.00),
('70.83', 'Commercial HVAC Service', 'Commercial system work', 'service', 'hour', 185.00),

-- APPLIANCE SERVICES (73-74)
-- Appliance repair and installation
-- Installation (73.00-73.29)
('73.00', 'Refrigerator Installation', 'Install and level refrigerator', 'labor', 'each', 185.00),
('73.01', 'Range/Oven Installation', 'Install gas or electric range', 'labor', 'each', 225.00),
('73.02', 'Dishwasher Installation', 'Install built-in dishwasher', 'labor', 'each', 285.00),
('73.03', 'Washer Installation', 'Install washing machine', 'labor', 'each', 185.00),
('73.04', 'Dryer Installation', 'Install and vent dryer', 'labor', 'each', 225.00),
('73.05', 'Microwave Installation', 'Install over-range microwave', 'labor', 'each', 185.00),
('73.06', 'Garbage Disposal Install', 'Install disposal unit', 'labor', 'each', 225.00),
('73.07', 'Ice Maker Installation', 'Connect ice maker line', 'labor', 'each', 185.00),
('73.08', 'Water Heater Installation', 'Install tank water heater', 'labor', 'each', 650.00),
('73.09', 'Tankless Heater Install', 'Install tankless water heater', 'labor', 'each', 950.00),

-- Repairs (73.30-73.59)
('73.30', 'Appliance Diagnostic', 'Diagnose appliance problem', 'service', 'each', 95.00),
('73.31', 'Refrigerator Repair', 'Fix refrigerator issues', 'service', 'hour', 125.00),
('73.32', 'Washer Repair', 'Repair washing machine', 'service', 'hour', 125.00),
('73.33', 'Dryer Repair', 'Fix dryer problems', 'service', 'hour', 125.00),
('73.34', 'Dishwasher Repair', 'Repair dishwasher', 'service', 'hour', 125.00),
('73.35', 'Oven/Range Repair', 'Fix cooking appliances', 'service', 'hour', 125.00),
('73.36', 'Disposal Repair', 'Fix garbage disposal', 'service', 'hour', 95.00),
('73.37', 'Water Heater Repair', 'Repair water heater', 'service', 'hour', 125.00),

-- Maintenance (73.60-73.79)
('73.60', 'Appliance Cleaning Service', 'Deep clean appliances', 'service', 'each', 85.00),
('73.61', 'Dryer Vent Cleaning', 'Clean dryer vent line', 'service', 'each', 125.00),
('73.62', 'Water Heater Flush', 'Flush sediment from tank', 'service', 'each', 125.00),
('73.63', 'Appliance Maintenance Plan', 'Annual service agreement', 'service', 'year', 350.00),

-- CLEANING SERVICES (75-76)
-- Professional cleaning services
-- Regular Cleaning (75.00-75.29)
('75.00', 'House Cleaning - Basic', 'Standard house cleaning', 'service', 'hour', 45.00),
('75.01', 'House Cleaning - Deep', 'Deep cleaning service', 'service', 'hour', 65.00),
('75.02', 'Office Cleaning', 'Commercial office cleaning', 'service', 'sf', 0.15),
('75.03', 'Move-in/out Cleaning', 'Complete empty home cleaning', 'service', 'each', 350.00),
('75.04', 'Post-Construction Clean', 'Clean after construction', 'service', 'sf', 0.50),
('75.05', 'Window Cleaning - Interior', 'Clean inside windows', 'service', 'pane', 8.00),
('75.06', 'Window Cleaning - Exterior', 'Clean outside windows', 'service', 'pane', 10.00),
('75.07', 'Carpet Cleaning', 'Hot water extraction cleaning', 'service', 'room', 75.00),
('75.08', 'Upholstery Cleaning', 'Clean furniture upholstery', 'service', 'piece', 85.00),
('75.09', 'Tile & Grout Cleaning', 'Deep clean tile and grout', 'service', 'sf', 1.50),
('75.10', 'Hardwood Floor Cleaning', 'Professional wood floor clean', 'service', 'sf', 0.75),

-- Specialty Cleaning (75.30-75.59)
('75.30', 'Pressure Washing', 'Exterior pressure washing', 'service', 'sf', 0.35),
('75.31', 'Roof Cleaning', 'Soft wash roof cleaning', 'service', 'sf', 0.50),
('75.32', 'Gutter Cleaning', 'Clean gutters and downspouts', 'service', 'lf', 2.00),
('75.33', 'Solar Panel Cleaning', 'Clean solar panels safely', 'service', 'panel', 15.00),
('75.34', 'Garage Cleaning', 'Deep clean and organize garage', 'service', 'each', 250.00),
('75.35', 'Hoarding Cleanup', 'Specialized hoarding cleanup', 'service', 'hour', 85.00),
('75.36', 'Biohazard Cleaning', 'Hazardous material cleanup', 'service', 'hour', 150.00),

-- Recurring Services (75.60-75.79)
('75.60', 'Weekly Cleaning Service', 'Recurring weekly clean', 'service', 'visit', 125.00),
('75.61', 'Bi-weekly Cleaning', 'Every other week service', 'service', 'visit', 150.00),
('75.62', 'Monthly Cleaning', 'Monthly cleaning service', 'service', 'visit', 185.00),
('75.63', 'Seasonal Deep Clean', 'Quarterly deep cleaning', 'service', 'visit', 350.00),

-- PEST CONTROL (77-78)
-- Pest management services
-- Treatment Services (77.00-77.29)
('77.00', 'General Pest Treatment', 'Treat common household pests', 'service', 'visit', 125.00),
('77.01', 'Ant Treatment', 'Eliminate ant infestations', 'service', 'visit', 150.00),
('77.02', 'Roach Treatment', 'Cockroach elimination', 'service', 'visit', 185.00),
('77.03', 'Spider Treatment', 'Spider control service', 'service', 'visit', 125.00),
('77.04', 'Bed Bug Treatment', 'Bed bug heat treatment', 'service', 'room', 450.00),
('77.05', 'Termite Treatment', 'Termite elimination', 'service', 'lf', 8.00),
('77.06', 'Rodent Control', 'Mice and rat elimination', 'service', 'visit', 185.00),
('77.07', 'Wasp/Bee Removal', 'Remove stinging insects', 'service', 'nest', 225.00),
('77.08', 'Mosquito Treatment', 'Yard mosquito control', 'service', 'each', 185.00),
('77.09', 'Flea Treatment', 'Indoor/outdoor flea control', 'service', 'visit', 225.00),
('77.10', 'Wildlife Removal', 'Remove raccoons, squirrels, etc', 'service', 'each', 350.00),

-- Prevention Services (77.30-77.59)
('77.30', 'Exclusion Work', 'Seal entry points', 'labor', 'hour', 95.00),
('77.31', 'Termite Baiting System', 'Install bait stations', 'labor', 'each', 85.00),
('77.32', 'Moisture Control', 'Install vapor barriers', 'labor', 'sf', 1.50),
('77.33', 'Attic Insulation Treatment', 'Treat and replace insulation', 'labor', 'sf', 3.50),

-- Ongoing Services (77.60-77.79)
('77.60', 'Quarterly Pest Service', 'Regular pest prevention', 'service', 'quarter', 125.00),
('77.61', 'Monthly Pest Service', 'Monthly treatment plan', 'service', 'month', 65.00),
('77.62', 'Termite Warranty', 'Annual termite protection', 'service', 'year', 350.00),
('77.63', 'Mosquito Program', 'Seasonal mosquito control', 'service', 'season', 650.00),

-- PROPERTY MANAGEMENT (79-80)
-- Property maintenance services
-- Regular Services (79.00-79.29)
('79.00', 'Property Inspection', 'Comprehensive property check', 'service', 'each', 150.00),
('79.01', 'Tenant Screening', 'Background and credit check', 'service', 'each', 75.00),
('79.02', 'Lease Preparation', 'Prepare rental agreements', 'service', 'each', 250.00),
('79.03', 'Rent Collection Service', 'Monthly rent processing', 'service', 'month', 50.00),
('79.04', 'Maintenance Coordination', 'Coordinate repairs', 'service', 'hour', 65.00),
('79.05', 'Emergency Response', '24/7 emergency service', 'service', 'call', 125.00),
('79.06', 'Move-in Inspection', 'Document property condition', 'service', 'each', 185.00),
('79.07', 'Move-out Inspection', 'Final property inspection', 'service', 'each', 185.00),
('79.08', 'Property Marketing', 'List and show property', 'service', 'each', 450.00),

-- Maintenance Tasks (79.30-79.59)
('79.30', 'Seasonal Maintenance', 'Quarterly property service', 'service', 'visit', 225.00),
('79.31', 'Gutter Maintenance', 'Clean and inspect gutters', 'service', 'each', 185.00),
('79.32', 'HVAC Filter Service', 'Replace all filters', 'service', 'visit', 85.00),
('79.33', 'Smoke Detector Service', 'Test and replace batteries', 'service', 'each', 65.00),
('79.34', 'Winterization Service', 'Prepare property for winter', 'service', 'each', 350.00),

-- Management Plans (79.60-79.79)
('79.60', 'Full Management Service', 'Complete property management', 'service', 'month', 10.00),
('79.61', 'Lease-Only Service', 'Find tenant only', 'service', 'each', 1000.00),
('79.62', 'HOA Management', 'Homeowners association mgmt', 'service', 'unit', 15.00),

-- HOME INSPECTION (81-82)
-- Professional inspection services
-- Inspection Services (81.00-81.29)
('81.00', 'Full Home Inspection', 'Complete property inspection', 'service', 'each', 450.00),
('81.01', 'Pre-Listing Inspection', 'Seller's inspection', 'service', 'each', 350.00),
('81.02', 'New Construction Phase', 'Phase inspection', 'service', 'each', 250.00),
('81.03', 'Final Walk-through', 'Final construction inspection', 'service', 'each', 350.00),
('81.04', 'Condo Inspection', 'Condominium inspection', 'service', 'each', 350.00),
('81.05', 'Mobile Home Inspection', 'Manufactured home inspection', 'service', 'each', 450.00),
('81.06', 'Commercial Inspection', 'Commercial property inspection', 'service', 'sf', 0.15),
('81.07', 'Pool/Spa Inspection', 'Pool system inspection', 'service', 'each', 185.00),
('81.08', 'Septic Inspection', 'Septic system evaluation', 'service', 'each', 450.00),

-- Specialty Inspections (81.30-81.59)
('81.30', 'Radon Testing', 'Test for radon gas', 'service', 'each', 185.00),
('81.31', 'Mold Inspection', 'Visual mold inspection', 'service', 'each', 350.00),
('81.32', 'Termite Inspection', 'Wood destroying organism', 'service', 'each', 125.00),
('81.33', 'Thermal Imaging', 'Infrared camera inspection', 'service', 'each', 250.00),
('81.34', 'Sewer Scope Inspection', 'Camera sewer line inspection', 'service', 'each', 350.00),
('81.35', 'Chimney Inspection', 'Level 2 chimney inspection', 'service', 'each', 350.00),
('81.36', 'Roof Certification', 'Roof condition certification', 'service', 'each', 225.00),
('81.37', 'Foundation Inspection', 'Structural foundation check', 'service', 'each', 450.00),

-- MOVING SERVICES (83-84)
-- Professional moving and storage
-- Moving Services (83.00-83.29)
('83.00', 'Local Moving - Labor', 'Local moving crew', 'labor', 'hour', 125.00),
('83.01', 'Long Distance Moving', 'Interstate moving service', 'service', 'lb', 0.75),
('83.02', 'Packing Service', 'Professional packing', 'labor', 'hour', 85.00),
('83.03', 'Packing Materials', 'Boxes, tape, bubble wrap', 'material', 'room', 125.00),
('83.04', 'Furniture Disassembly', 'Take apart furniture', 'labor', 'piece', 65.00),
('83.05', 'Furniture Assembly', 'Reassemble furniture', 'labor', 'piece', 65.00),
('83.06', 'Piano Moving', 'Move pianos safely', 'service', 'each', 450.00),
('83.07', 'Safe Moving', 'Move heavy safes', 'service', 'each', 350.00),
('83.08', 'Appliance Moving', 'Move major appliances', 'service', 'each', 125.00),
('83.09', 'Storage Service', 'Monthly storage unit', 'service', 'month', 125.00),

-- Specialty Moving (83.30-83.59)
('83.30', 'Office Moving', 'Commercial office relocation', 'service', 'hour', 150.00),
('83.31', 'Senior Moving', 'Assisted senior relocation', 'service', 'hour', 125.00),
('83.32', 'Hoisting Service', 'Crane/hoist large items', 'service', 'each', 850.00),
('83.33', 'White Glove Service', 'Premium moving service', 'service', 'hour', 225.00),

-- WINDOW & DOOR SERVICES (85-86)
-- Window and door installation/repair
-- Installation (85.00-85.29)
('85.00', 'Window Installation', 'Install replacement windows', 'labor', 'each', 350.00),
('85.01', 'Entry Door Installation', 'Install exterior door', 'labor', 'each', 450.00),
('85.02', 'Interior Door Installation', 'Install interior doors', 'labor', 'each', 185.00),
('85.03', 'Sliding Door Installation', 'Install patio sliding door', 'labor', 'each', 650.00),
('85.04', 'Storm Door Installation', 'Install storm door', 'labor', 'each', 285.00),
('85.05', 'Garage Door Installation', 'Install garage door', 'labor', 'each', 850.00),
('85.06', 'Garage Opener Installation', 'Install door opener', 'labor', 'each', 350.00),
('85.07', 'Window Well Installation', 'Install basement window wells', 'labor', 'each', 450.00),
('85.08', 'Egress Window Install', 'Install emergency exit window', 'labor', 'each', 1500.00),

-- Repairs (85.30-85.59)
('85.30', 'Window Repair', 'Fix broken windows', 'service', 'hour', 95.00),
('85.31', 'Screen Repair', 'Fix or replace screens', 'labor', 'each', 65.00),
('85.32', 'Door Adjustment', 'Adjust sticking doors', 'service', 'each', 85.00),
('85.33', 'Lock Repair/Rekey', 'Fix or rekey locks', 'service', 'each', 125.00),
('85.34', 'Weather Stripping', 'Replace weather seals', 'labor', 'lf', 8.00),
('85.35', 'Glass Replacement', 'Replace broken glass', 'labor', 'sf', 25.00),
('85.36', 'Garage Door Repair', 'Fix garage door issues', 'service', 'hour', 125.00),
('85.37', 'Window Hardware Repair', 'Fix cranks, locks, balances', 'labor', 'each', 125.00),

-- GENERAL HANDYMAN (87-89)
-- General repair and maintenance
-- Common Services (87.00-87.29)
('87.00', 'General Labor', 'General handyman services', 'labor', 'hour', 75.00),
('87.01', 'Furniture Assembly', 'Assemble furniture', 'labor', 'piece', 85.00),
('87.02', 'TV Mounting', 'Mount TV on wall', 'labor', 'each', 185.00),
('87.03', 'Picture Hanging', 'Hang pictures and art', 'labor', 'hour', 65.00),
('87.04', 'Shelf Installation', 'Install shelving', 'labor', 'lf', 25.00),
('87.05', 'Drywall Repair', 'Patch holes in drywall', 'labor', 'each', 125.00),
('87.06', 'Caulking Service', 'Caulk tubs, sinks, windows', 'labor', 'hour', 75.00),
('87.07', 'Fixture Installation', 'Install towel bars, hooks', 'labor', 'each', 45.00),
('87.08', 'Ceiling Fan Installation', 'Install ceiling fan', 'labor', 'each', 225.00),
('87.09', 'Outlet/Switch Replace', 'Replace electrical fixtures', 'labor', 'each', 65.00),
('87.10', 'Toilet Repair', 'Fix running toilets', 'labor', 'each', 125.00),
('87.11', 'Faucet Installation', 'Install new faucets', 'labor', 'each', 185.00),
('87.12', 'Garbage Disposal Install', 'Install disposal', 'labor', 'each', 225.00),
('87.13', 'Doorbell Installation', 'Install wired doorbell', 'labor', 'each', 185.00),
('87.14', 'Smoke Detector Install', 'Install smoke alarms', 'labor', 'each', 65.00),

-- Maintenance (87.30-87.59)
('87.30', 'Honey-Do List Service', 'Complete maintenance list', 'service', 'hour', 75.00),
('87.31', 'Seasonal Maintenance', 'Quarterly home service', 'service', 'visit', 350.00),
('87.32', 'Vacation Home Check', 'Check vacant property', 'service', 'visit', 85.00),
('87.33', 'Senior Home Safety', 'Install grab bars, ramps', 'labor', 'hour', 85.00),
('87.34', 'Child Safety Install', 'Baby gates, locks, covers', 'labor', 'hour', 75.00),

-- Specialty (87.80-87.99)
('87.80', 'Holiday Decoration Install', 'Install holiday lights', 'labor', 'hour', 85.00),
('87.81', 'Holiday Decoration Removal', 'Remove and store decorations', 'labor', 'hour', 75.00),
('87.82', 'Emergency Repair Service', 'After-hours emergency', 'service', 'hour', 150.00),
('87.83', 'Property Maintenance Plan', 'Annual service agreement', 'service', 'year', 1200.00);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_service_type ON cost_codes(SUBSTRING(code FROM 1 FOR 2));

COMMIT;