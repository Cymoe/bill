-- Add template line items for HVAC industry
-- These are pre-configured items that all HVAC organizations will have access to

-- Get industry and cost code IDs
WITH industry_ids AS (
  SELECT id FROM industries WHERE name = 'HVAC'
),
hvac_codes AS (
  SELECT 
    id,
    code,
    name
  FROM cost_codes
  WHERE industry_id = (SELECT id FROM industry_ids)
    AND organization_id IS NULL
)

-- Equipment (71.10)
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
SELECT 
  item.name,
  item.description,
  item.price,
  item.unit,
  item.category,
  codes.id,
  (SELECT id FROM industry_ids),
  NULL,
  NOW(),
  NOW()
FROM hvac_codes codes
CROSS JOIN (
  VALUES
    -- Air Conditioners
    ('1.5 Ton AC Unit', '1.5 ton 14 SEER air conditioner condenser', 1285.00, 'each', 'material'),
    ('2 Ton AC Unit', '2 ton 14 SEER air conditioner condenser', 1485.00, 'each', 'material'),
    ('2.5 Ton AC Unit', '2.5 ton 14 SEER air conditioner condenser', 1685.00, 'each', 'material'),
    ('3 Ton AC Unit', '3 ton 14 SEER air conditioner condenser', 1885.00, 'each', 'material'),
    ('3.5 Ton AC Unit', '3.5 ton 14 SEER air conditioner condenser', 2185.00, 'each', 'material'),
    ('4 Ton AC Unit', '4 ton 14 SEER air conditioner condenser', 2485.00, 'each', 'material'),
    ('5 Ton AC Unit', '5 ton 14 SEER air conditioner condenser', 2985.00, 'each', 'material'),
    
    -- Heat Pumps
    ('2 Ton Heat Pump', '2 ton 14 SEER heat pump', 2285.00, 'each', 'material'),
    ('3 Ton Heat Pump', '3 ton 14 SEER heat pump', 2685.00, 'each', 'material'),
    ('4 Ton Heat Pump', '4 ton 14 SEER heat pump', 3185.00, 'each', 'material'),
    ('5 Ton Heat Pump', '5 ton 14 SEER heat pump', 3885.00, 'each', 'material'),
    
    -- Air Handlers
    ('2 Ton Air Handler', '2 ton air handler with electric heat strips', 885.00, 'each', 'material'),
    ('3 Ton Air Handler', '3 ton air handler with electric heat strips', 985.00, 'each', 'material'),
    ('4 Ton Air Handler', '4 ton air handler with electric heat strips', 1185.00, 'each', 'material'),
    ('5 Ton Air Handler', '5 ton air handler with electric heat strips', 1385.00, 'each', 'material'),
    
    -- Furnaces
    ('60K BTU Gas Furnace', '60,000 BTU 80% efficiency gas furnace', 885.00, 'each', 'material'),
    ('80K BTU Gas Furnace', '80,000 BTU 80% efficiency gas furnace', 985.00, 'each', 'material'),
    ('100K BTU Gas Furnace', '100,000 BTU 80% efficiency gas furnace', 1185.00, 'each', 'material'),
    ('80K BTU 95% Furnace', '80,000 BTU 95% efficiency gas furnace', 1685.00, 'each', 'material'),
    ('100K BTU 95% Furnace', '100,000 BTU 95% efficiency gas furnace', 1885.00, 'each', 'material'),
    
    -- Mini Splits
    ('9K BTU Mini Split', '9,000 BTU ductless mini split system', 1285.00, 'each', 'material'),
    ('12K BTU Mini Split', '12,000 BTU ductless mini split system', 1485.00, 'each', 'material'),
    ('18K BTU Mini Split', '18,000 BTU ductless mini split system', 1885.00, 'each', 'material'),
    ('24K BTU Mini Split', '24,000 BTU ductless mini split system', 2285.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '71.10';

-- Ductwork (71.20)
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
SELECT 
  item.name,
  item.description,
  item.price,
  item.unit,
  item.category,
  codes.id,
  (SELECT id FROM industry_ids),
  NULL,
  NOW(),
  NOW()
FROM hvac_codes codes
CROSS JOIN (
  VALUES
    -- Rectangular Duct
    ('8x8 Metal Duct', '8x8 inch rectangular metal duct, 5ft section', 28.00, 'section', 'material'),
    ('10x10 Metal Duct', '10x10 inch rectangular metal duct, 5ft section', 35.00, 'section', 'material'),
    ('12x12 Metal Duct', '12x12 inch rectangular metal duct, 5ft section', 42.00, 'section', 'material'),
    ('14x8 Metal Duct', '14x8 inch rectangular metal duct, 5ft section', 38.00, 'section', 'material'),
    ('16x8 Metal Duct', '16x8 inch rectangular metal duct, 5ft section', 42.00, 'section', 'material'),
    ('20x8 Metal Duct', '20x8 inch rectangular metal duct, 5ft section', 48.00, 'section', 'material'),
    
    -- Round Duct
    ('6" Round Duct', '6 inch round metal duct, 5ft section', 18.00, 'section', 'material'),
    ('8" Round Duct', '8 inch round metal duct, 5ft section', 22.00, 'section', 'material'),
    ('10" Round Duct', '10 inch round metal duct, 5ft section', 28.00, 'section', 'material'),
    ('12" Round Duct', '12 inch round metal duct, 5ft section', 35.00, 'section', 'material'),
    ('14" Round Duct', '14 inch round metal duct, 5ft section', 42.00, 'section', 'material'),
    
    -- Flexible Duct
    ('4" Flex Duct R6', '4 inch R6 insulated flexible duct, 25ft', 32.00, 'box', 'material'),
    ('6" Flex Duct R6', '6 inch R6 insulated flexible duct, 25ft', 42.00, 'box', 'material'),
    ('8" Flex Duct R6', '8 inch R6 insulated flexible duct, 25ft', 58.00, 'box', 'material'),
    ('10" Flex Duct R6', '10 inch R6 insulated flexible duct, 25ft', 78.00, 'box', 'material'),
    ('12" Flex Duct R6', '12 inch R6 insulated flexible duct, 25ft', 98.00, 'box', 'material'),
    ('6" Flex Duct R8', '6 inch R8 insulated flexible duct, 25ft', 48.00, 'box', 'material'),
    ('8" Flex Duct R8', '8 inch R8 insulated flexible duct, 25ft', 68.00, 'box', 'material'),
    
    -- Duct Fittings
    ('8x8 90° Elbow', '8x8 inch 90 degree elbow', 22.00, 'each', 'material'),
    ('10x10 90° Elbow', '10x10 inch 90 degree elbow', 28.00, 'each', 'material'),
    ('8" Round 90° Elbow', '8 inch round 90 degree elbow', 18.00, 'each', 'material'),
    ('10" Round 90° Elbow', '10 inch round 90 degree elbow', 22.00, 'each', 'material'),
    ('8x8x6 Tee', '8x8x6 inch duct tee', 28.00, 'each', 'material'),
    ('10x10x8 Tee', '10x10x8 inch duct tee', 35.00, 'each', 'material'),
    ('8x8 to 6" Reducer', '8x8 to 6 inch round reducer', 18.00, 'each', 'material'),
    ('10x10 to 8" Reducer', '10x10 to 8 inch round reducer', 22.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '71.20';

-- Vents and Registers (71.21)
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
SELECT 
  item.name,
  item.description,
  item.price,
  item.unit,
  item.category,
  codes.id,
  (SELECT id FROM industry_ids),
  NULL,
  NOW(),
  NOW()
FROM hvac_codes codes
CROSS JOIN (
  VALUES
    ('4x10 Floor Register', '4x10 inch steel floor register', 8.50, 'each', 'material'),
    ('4x12 Floor Register', '4x12 inch steel floor register', 9.50, 'each', 'material'),
    ('6x10 Floor Register', '6x10 inch steel floor register', 10.50, 'each', 'material'),
    ('6x12 Floor Register', '6x12 inch steel floor register', 11.50, 'each', 'material'),
    ('4x10 Ceiling Register', '4x10 inch ceiling register with damper', 12.00, 'each', 'material'),
    ('6x10 Ceiling Register', '6x10 inch ceiling register with damper', 14.00, 'each', 'material'),
    ('8x8 Return Grille', '8x8 inch return air grille', 12.00, 'each', 'material'),
    ('10x10 Return Grille', '10x10 inch return air grille', 16.00, 'each', 'material'),
    ('12x12 Return Grille', '12x12 inch return air grille', 18.00, 'each', 'material'),
    ('14x14 Return Grille', '14x14 inch return air grille', 22.00, 'each', 'material'),
    ('16x16 Return Grille', '16x16 inch return air grille', 26.00, 'each', 'material'),
    ('20x20 Return Grille', '20x20 inch return air grille', 32.00, 'each', 'material'),
    ('24x24 Return Grille', '24x24 inch return air grille', 42.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '71.21';

-- Refrigerant and Supplies (71.30)
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
SELECT 
  item.name,
  item.description,
  item.price,
  item.unit,
  item.category,
  codes.id,
  (SELECT id FROM industry_ids),
  NULL,
  NOW(),
  NOW()
FROM hvac_codes codes
CROSS JOIN (
  VALUES
    -- Refrigerant Lines
    ('1/4" Copper Line Set', '1/4 inch copper refrigerant line, 50ft', 85.00, 'coil', 'material'),
    ('3/8" Copper Line Set', '3/8 inch copper refrigerant line, 50ft', 125.00, 'coil', 'material'),
    ('1/2" Copper Line Set', '1/2 inch copper refrigerant line, 50ft', 165.00, 'coil', 'material'),
    ('5/8" Copper Line Set', '5/8 inch copper refrigerant line, 50ft', 225.00, 'coil', 'material'),
    ('3/4" Copper Line Set', '3/4 inch copper refrigerant line, 50ft', 285.00, 'coil', 'material'),
    ('1/4 x 3/8 Line Set 25ft', 'Pre-insulated line set 25ft', 125.00, 'set', 'material'),
    ('1/4 x 1/2 Line Set 25ft', 'Pre-insulated line set 25ft', 145.00, 'set', 'material'),
    ('3/8 x 5/8 Line Set 25ft', 'Pre-insulated line set 25ft', 185.00, 'set', 'material'),
    ('3/8 x 3/4 Line Set 25ft', 'Pre-insulated line set 25ft', 225.00, 'set', 'material'),
    
    -- Refrigerant
    ('R410A Refrigerant', 'R410A refrigerant, 25lb cylinder', 285.00, 'cylinder', 'material'),
    ('R22 Refrigerant', 'R22 refrigerant, 30lb cylinder', 685.00, 'cylinder', 'material'),
    ('R404A Refrigerant', 'R404A refrigerant, 24lb cylinder', 385.00, 'cylinder', 'material'),
    
    -- Accessories
    ('Filter Drier 1/4"', '1/4 inch liquid line filter drier', 12.00, 'each', 'material'),
    ('Filter Drier 3/8"', '3/8 inch liquid line filter drier', 16.00, 'each', 'material'),
    ('Sight Glass 1/4"', '1/4 inch moisture sight glass', 18.00, 'each', 'material'),
    ('Sight Glass 3/8"', '3/8 inch moisture sight glass', 22.00, 'each', 'material'),
    ('Line Set Cover 3"', '3 inch line set cover, 8ft', 28.00, 'piece', 'material'),
    ('Line Set Cover 4"', '4 inch line set cover, 8ft', 35.00, 'piece', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '71.30';

-- Controls and Thermostats (71.40)
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
SELECT 
  item.name,
  item.description,
  item.price,
  item.unit,
  item.category,
  codes.id,
  (SELECT id FROM industry_ids),
  NULL,
  NOW(),
  NOW()
FROM hvac_codes codes
CROSS JOIN (
  VALUES
    ('Basic Thermostat', 'Non-programmable digital thermostat', 35.00, 'each', 'material'),
    ('Programmable Thermostat', '7-day programmable thermostat', 85.00, 'each', 'material'),
    ('WiFi Thermostat', 'WiFi enabled smart thermostat', 185.00, 'each', 'material'),
    ('Smart Thermostat Pro', 'Professional smart thermostat with sensors', 285.00, 'each', 'material'),
    ('Humidistat', 'Digital humidistat control', 65.00, 'each', 'material'),
    ('Zone Control Panel', '2-zone control panel', 285.00, 'each', 'material'),
    ('Zone Damper 8"', '8 inch motorized zone damper', 125.00, 'each', 'material'),
    ('Zone Damper 10"', '10 inch motorized zone damper', 145.00, 'each', 'material'),
    ('Zone Damper 12"', '12 inch motorized zone damper', 165.00, 'each', 'material'),
    ('Duct Thermostat', 'Duct mounted temperature sensor', 45.00, 'each', 'material'),
    ('Low Voltage Wire', '18/8 thermostat wire, 250ft', 85.00, 'spool', 'material'),
    ('Relay Board', '24V relay control board', 125.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '71.40';

-- Filters and IAQ (71.50)
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
SELECT 
  item.name,
  item.description,
  item.price,
  item.unit,
  item.category,
  codes.id,
  (SELECT id FROM industry_ids),
  NULL,
  NOW(),
  NOW()
FROM hvac_codes codes
CROSS JOIN (
  VALUES
    ('16x20x1 Filter', '16x20x1 pleated air filter, MERV 8', 8.50, 'each', 'material'),
    ('16x25x1 Filter', '16x25x1 pleated air filter, MERV 8', 9.50, 'each', 'material'),
    ('20x20x1 Filter', '20x20x1 pleated air filter, MERV 8', 9.50, 'each', 'material'),
    ('20x25x1 Filter', '20x25x1 pleated air filter, MERV 8', 10.50, 'each', 'material'),
    ('16x20x4 Filter', '16x20x4 pleated air filter, MERV 11', 28.00, 'each', 'material'),
    ('16x25x4 Filter', '16x25x4 pleated air filter, MERV 11', 32.00, 'each', 'material'),
    ('20x20x4 Filter', '20x20x4 pleated air filter, MERV 11', 32.00, 'each', 'material'),
    ('20x25x4 Filter', '20x25x4 pleated air filter, MERV 11', 35.00, 'each', 'material'),
    ('UV Light System', 'UV air purification light system', 285.00, 'each', 'material'),
    ('Whole House Humidifier', 'Bypass whole house humidifier', 185.00, 'each', 'material'),
    ('Steam Humidifier', 'Steam whole house humidifier', 685.00, 'each', 'material'),
    ('HEPA Air Cleaner', 'Whole house HEPA air cleaner', 885.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '71.50';

-- Labor rates
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
SELECT 
  item.name,
  item.description,
  item.price,
  item.unit,
  item.category,
  codes.id,
  (SELECT id FROM industry_ids),
  NULL,
  NOW(),
  NOW()
FROM hvac_codes codes
CROSS JOIN (
  VALUES
    ('HVAC Lead Technician', 'Lead HVAC technician hourly rate', 125.00, 'hour', 'labor'),
    ('HVAC Journeyman', 'Journeyman HVAC technician hourly rate', 85.00, 'hour', 'labor'),
    ('HVAC Apprentice', 'Apprentice HVAC technician hourly rate', 55.00, 'hour', 'labor'),
    ('HVAC Helper', 'HVAC helper hourly rate', 35.00, 'hour', 'labor'),
    ('Sheet Metal Mechanic', 'Sheet metal mechanic hourly rate', 75.00, 'hour', 'labor'),
    ('Controls Technician', 'Controls specialist hourly rate', 95.00, 'hour', 'labor')
) AS item(name, description, price, unit, category)
WHERE codes.code = '71.00';

-- Service and Installation
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
SELECT 
  item.name,
  item.description,
  item.price,
  item.unit,
  item.category,
  codes.id,
  (SELECT id FROM industry_ids),
  NULL,
  NOW(),
  NOW()
FROM hvac_codes codes
CROSS JOIN (
  VALUES
    ('Service Call', 'Standard HVAC service call', 125.00, 'each', 'service'),
    ('Emergency Service', 'After hours emergency service', 225.00, 'each', 'service'),
    ('AC Tune-Up', 'Annual AC system tune-up', 185.00, 'each', 'service'),
    ('Furnace Tune-Up', 'Annual furnace tune-up', 165.00, 'each', 'service'),
    ('Complete System Tune-Up', 'AC and furnace tune-up', 285.00, 'each', 'service'),
    ('Duct Cleaning', 'Complete duct system cleaning', 485.00, 'each', 'service'),
    ('Refrigerant Recharge', 'AC refrigerant recharge service', 385.00, 'each', 'service'),
    ('Coil Cleaning', 'Evaporator and condenser coil cleaning', 285.00, 'each', 'service'),
    ('System Diagnosis', 'Complete system diagnostic', 185.00, 'each', 'service'),
    ('AC Installation - 2 Ton', 'Complete 2 ton AC system installation', 4285.00, 'each', 'service'),
    ('AC Installation - 3 Ton', 'Complete 3 ton AC system installation', 4885.00, 'each', 'service'),
    ('AC Installation - 4 Ton', 'Complete 4 ton AC system installation', 5485.00, 'each', 'service'),
    ('Heat Pump Install - 3 Ton', 'Complete 3 ton heat pump installation', 5885.00, 'each', 'service'),
    ('Furnace Installation', 'Gas furnace installation', 3285.00, 'each', 'service'),
    ('Mini Split Installation', 'Single zone mini split installation', 3285.00, 'each', 'service'),
    ('Thermostat Installation', 'Smart thermostat installation', 285.00, 'each', 'service'),
    ('Zone System Install', '2-zone system installation', 1885.00, 'each', 'service')
) AS item(name, description, price, unit, category)
WHERE codes.code = '71.60';

-- Equipment rental
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
SELECT 
  item.name,
  item.description,
  item.price,
  item.unit,
  item.category,
  codes.id,
  (SELECT id FROM industry_ids),
  NULL,
  NOW(),
  NOW()
FROM hvac_codes codes
CROSS JOIN (
  VALUES
    ('Recovery Machine', 'Refrigerant recovery machine rental', 125.00, 'day', 'equipment'),
    ('Vacuum Pump', 'Two-stage vacuum pump rental', 65.00, 'day', 'equipment'),
    ('Manifold Gauge Set', 'Digital manifold gauge set rental', 45.00, 'day', 'equipment'),
    ('Nitrogen Tank & Reg', 'Nitrogen tank with regulator rental', 85.00, 'day', 'equipment'),
    ('Leak Detector', 'Electronic leak detector rental', 65.00, 'day', 'equipment'),
    ('Micron Gauge', 'Digital micron gauge rental', 35.00, 'day', 'equipment'),
    ('Duct Pressure Tester', 'Duct leakage tester rental', 125.00, 'day', 'equipment'),
    ('Sheet Metal Brake', 'Portable sheet metal brake rental', 85.00, 'day', 'equipment'),
    ('Plasma Cutter', 'Plasma cutting system rental', 185.00, 'day', 'equipment'),
    ('Combustion Analyzer', 'Digital combustion analyzer rental', 125.00, 'day', 'equipment')
) AS item(name, description, price, unit, category)
WHERE codes.code = '71.70';