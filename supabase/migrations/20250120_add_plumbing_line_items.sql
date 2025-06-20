-- Add template line items for Plumbing industry
-- These are pre-configured items that all plumbing organizations will have access to

-- Get industry and cost code IDs
WITH industry_ids AS (
  SELECT id FROM industries WHERE name = 'Plumbing'
),
plumbing_codes AS (
  SELECT 
    id,
    code,
    name
  FROM cost_codes
  WHERE industry_id = (SELECT id FROM industry_ids)
    AND organization_id IS NULL
)

-- Pipes and Fittings (61.10)
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
FROM plumbing_codes codes
CROSS JOIN (
  VALUES
    -- Copper Pipes
    ('1/2" Copper Pipe Type M', '1/2 inch copper pipe Type M, 10ft length', 28.00, 'stick', 'material'),
    ('3/4" Copper Pipe Type M', '3/4 inch copper pipe Type M, 10ft length', 42.00, 'stick', 'material'),
    ('1" Copper Pipe Type M', '1 inch copper pipe Type M, 10ft length', 68.00, 'stick', 'material'),
    ('1/2" Copper Pipe Type L', '1/2 inch copper pipe Type L, 10ft length', 38.00, 'stick', 'material'),
    ('3/4" Copper Pipe Type L', '3/4 inch copper pipe Type L, 10ft length', 58.00, 'stick', 'material'),
    ('1" Copper Pipe Type L', '1 inch copper pipe Type L, 10ft length', 92.00, 'stick', 'material'),
    
    -- PEX Pipes
    ('1/2" PEX-A Red', '1/2 inch PEX-A tubing red, 100ft coil', 65.00, 'coil', 'material'),
    ('1/2" PEX-A Blue', '1/2 inch PEX-A tubing blue, 100ft coil', 65.00, 'coil', 'material'),
    ('3/4" PEX-A Red', '3/4 inch PEX-A tubing red, 100ft coil', 125.00, 'coil', 'material'),
    ('3/4" PEX-A Blue', '3/4 inch PEX-A tubing blue, 100ft coil', 125.00, 'coil', 'material'),
    ('1" PEX-A', '1 inch PEX-A tubing, 100ft coil', 195.00, 'coil', 'material'),
    
    -- PVC Pipes
    ('1-1/2" PVC Schedule 40', '1-1/2 inch PVC pipe Schedule 40, 10ft length', 8.50, 'stick', 'material'),
    ('2" PVC Schedule 40', '2 inch PVC pipe Schedule 40, 10ft length', 12.00, 'stick', 'material'),
    ('3" PVC Schedule 40', '3 inch PVC pipe Schedule 40, 10ft length', 22.00, 'stick', 'material'),
    ('4" PVC Schedule 40', '4 inch PVC pipe Schedule 40, 10ft length', 32.00, 'stick', 'material'),
    
    -- CPVC Pipes
    ('1/2" CPVC', '1/2 inch CPVC pipe, 10ft length', 6.50, 'stick', 'material'),
    ('3/4" CPVC', '3/4 inch CPVC pipe, 10ft length', 8.50, 'stick', 'material'),
    ('1" CPVC', '1 inch CPVC pipe, 10ft length', 12.00, 'stick', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '61.10';

-- Fittings (61.11)
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
FROM plumbing_codes codes
CROSS JOIN (
  VALUES
    -- Copper Fittings
    ('1/2" Copper 90° Elbow', '1/2 inch copper 90 degree elbow', 2.50, 'each', 'material'),
    ('3/4" Copper 90° Elbow', '3/4 inch copper 90 degree elbow', 3.50, 'each', 'material'),
    ('1" Copper 90° Elbow', '1 inch copper 90 degree elbow', 6.50, 'each', 'material'),
    ('1/2" Copper Tee', '1/2 inch copper tee', 3.50, 'each', 'material'),
    ('3/4" Copper Tee', '3/4 inch copper tee', 4.50, 'each', 'material'),
    ('1" Copper Tee', '1 inch copper tee', 8.50, 'each', 'material'),
    ('1/2" Copper Coupling', '1/2 inch copper coupling', 1.50, 'each', 'material'),
    ('3/4" Copper Coupling', '3/4 inch copper coupling', 2.00, 'each', 'material'),
    ('1" Copper Coupling', '1 inch copper coupling', 3.50, 'each', 'material'),
    
    -- PEX Fittings
    ('1/2" PEX 90° Elbow', '1/2 inch PEX crimp elbow', 2.00, 'each', 'material'),
    ('3/4" PEX 90° Elbow', '3/4 inch PEX crimp elbow', 3.00, 'each', 'material'),
    ('1/2" PEX Tee', '1/2 inch PEX crimp tee', 2.50, 'each', 'material'),
    ('3/4" PEX Tee', '3/4 inch PEX crimp tee', 3.50, 'each', 'material'),
    ('1/2" PEX Coupling', '1/2 inch PEX crimp coupling', 1.50, 'each', 'material'),
    ('3/4" PEX Coupling', '3/4 inch PEX crimp coupling', 2.00, 'each', 'material'),
    ('PEX Crimp Ring 1/2"', '1/2 inch PEX copper crimp ring', 0.35, 'each', 'material'),
    ('PEX Crimp Ring 3/4"', '3/4 inch PEX copper crimp ring', 0.45, 'each', 'material'),
    
    -- PVC Fittings
    ('1-1/2" PVC 90° Elbow', '1-1/2 inch PVC 90 degree elbow', 1.50, 'each', 'material'),
    ('2" PVC 90° Elbow', '2 inch PVC 90 degree elbow', 2.50, 'each', 'material'),
    ('3" PVC 90° Elbow', '3 inch PVC 90 degree elbow', 6.50, 'each', 'material'),
    ('4" PVC 90° Elbow', '4 inch PVC 90 degree elbow', 12.00, 'each', 'material'),
    ('2" PVC Wye', '2 inch PVC wye fitting', 4.50, 'each', 'material'),
    ('3" PVC Wye', '3 inch PVC wye fitting', 8.50, 'each', 'material'),
    ('4" PVC Wye', '4 inch PVC wye fitting', 15.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '61.11';

-- Valves (61.20)
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
FROM plumbing_codes codes
CROSS JOIN (
  VALUES
    ('1/2" Ball Valve', '1/2 inch brass ball valve, full port', 8.50, 'each', 'material'),
    ('3/4" Ball Valve', '3/4 inch brass ball valve, full port', 12.00, 'each', 'material'),
    ('1" Ball Valve', '1 inch brass ball valve, full port', 18.00, 'each', 'material'),
    ('1/2" Gate Valve', '1/2 inch brass gate valve', 12.00, 'each', 'material'),
    ('3/4" Gate Valve', '3/4 inch brass gate valve', 16.00, 'each', 'material'),
    ('1" Gate Valve', '1 inch brass gate valve', 22.00, 'each', 'material'),
    ('Angle Stop 1/2"', '1/2 inch chrome angle stop valve', 6.50, 'each', 'material'),
    ('Angle Stop 3/8"', '3/8 inch chrome angle stop valve', 6.50, 'each', 'material'),
    ('PRV 3/4"', '3/4 inch pressure reducing valve', 85.00, 'each', 'material'),
    ('Check Valve 3/4"', '3/4 inch brass check valve', 18.00, 'each', 'material'),
    ('Hose Bib', 'Brass hose bib with vacuum breaker', 18.00, 'each', 'material'),
    ('Frost-Free Hose Bib', '12 inch frost-free hose bib', 32.00, 'each', 'material'),
    ('Washing Machine Valve Box', 'Recessed washing machine outlet box', 45.00, 'each', 'material'),
    ('Ice Maker Valve Box', 'Recessed ice maker outlet box', 35.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '61.20';

-- Fixtures (61.30)
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
FROM plumbing_codes codes
CROSS JOIN (
  VALUES
    -- Toilets
    ('Standard Toilet - Round', 'Standard height round bowl toilet, 1.6 GPF', 125.00, 'each', 'material'),
    ('Comfort Height Toilet - Elongated', 'Comfort height elongated toilet, 1.28 GPF', 185.00, 'each', 'material'),
    ('Dual Flush Toilet', 'Dual flush elongated toilet, 1.1/1.6 GPF', 285.00, 'each', 'material'),
    ('Wall Mount Toilet', 'Wall mounted toilet with carrier', 485.00, 'each', 'material'),
    ('Toilet Seat - Standard', 'Standard white toilet seat', 22.00, 'each', 'material'),
    ('Toilet Seat - Soft Close', 'Soft close elongated toilet seat', 45.00, 'each', 'material'),
    
    -- Sinks
    ('Kitchen Sink - Single Bowl', 'Stainless steel single bowl kitchen sink', 185.00, 'each', 'material'),
    ('Kitchen Sink - Double Bowl', 'Stainless steel double bowl kitchen sink', 285.00, 'each', 'material'),
    ('Bathroom Sink - Drop-in', 'Porcelain drop-in bathroom sink', 85.00, 'each', 'material'),
    ('Bathroom Sink - Undermount', 'Porcelain undermount bathroom sink', 125.00, 'each', 'material'),
    ('Pedestal Sink', 'Porcelain pedestal sink with base', 165.00, 'each', 'material'),
    ('Utility Sink', 'Plastic utility sink with legs', 125.00, 'each', 'material'),
    
    -- Faucets
    ('Kitchen Faucet - Standard', 'Single handle kitchen faucet with sprayer', 125.00, 'each', 'material'),
    ('Kitchen Faucet - Pull-Down', 'Pull-down kitchen faucet', 225.00, 'each', 'material'),
    ('Bathroom Faucet - Single', 'Single handle bathroom faucet', 85.00, 'each', 'material'),
    ('Bathroom Faucet - Widespread', '8 inch widespread bathroom faucet', 165.00, 'each', 'material'),
    ('Shower Valve', 'Single handle shower valve with trim', 125.00, 'each', 'material'),
    ('Tub/Shower Valve', 'Single handle tub/shower valve with trim', 165.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '61.30';

-- Water Heaters (61.40)
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
FROM plumbing_codes codes
CROSS JOIN (
  VALUES
    ('40 Gal Gas Water Heater', '40 gallon natural gas water heater', 685.00, 'each', 'material'),
    ('50 Gal Gas Water Heater', '50 gallon natural gas water heater', 785.00, 'each', 'material'),
    ('40 Gal Electric Water Heater', '40 gallon electric water heater', 585.00, 'each', 'material'),
    ('50 Gal Electric Water Heater', '50 gallon electric water heater', 685.00, 'each', 'material'),
    ('Tankless Water Heater - Gas', 'Natural gas tankless water heater', 1285.00, 'each', 'material'),
    ('Tankless Water Heater - Electric', 'Electric tankless water heater', 685.00, 'each', 'material'),
    ('Expansion Tank', 'Thermal expansion tank, 2 gallon', 45.00, 'each', 'material'),
    ('Water Heater Pan', 'Aluminum water heater drain pan', 28.00, 'each', 'material'),
    ('T&P Valve', 'Temperature and pressure relief valve', 18.00, 'each', 'material'),
    ('Gas Flex Connector', 'Stainless steel gas flex connector', 22.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '61.40';

-- Drain and Waste (61.50)
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
FROM plumbing_codes codes
CROSS JOIN (
  VALUES
    ('P-Trap 1-1/2"', '1-1/2 inch PVC P-trap with union', 8.50, 'each', 'material'),
    ('P-Trap 2"', '2 inch PVC P-trap with union', 12.00, 'each', 'material'),
    ('Floor Drain 2"', '2 inch PVC floor drain with grate', 28.00, 'each', 'material'),
    ('Floor Drain 3"', '3 inch PVC floor drain with grate', 38.00, 'each', 'material'),
    ('Cleanout 3"', '3 inch PVC cleanout with plug', 18.00, 'each', 'material'),
    ('Cleanout 4"', '4 inch PVC cleanout with plug', 22.00, 'each', 'material'),
    ('Toilet Flange', 'PVC toilet flange with metal ring', 12.00, 'each', 'material'),
    ('Wax Ring', 'Standard toilet wax ring', 4.50, 'each', 'material'),
    ('Wax Ring with Horn', 'Extra thick wax ring with horn', 6.50, 'each', 'material'),
    ('Shower Drain 2"', '2 inch PVC shower drain', 18.00, 'each', 'material'),
    ('Tub Drain Kit', 'Complete tub drain assembly', 45.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '61.50';

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
FROM plumbing_codes codes
CROSS JOIN (
  VALUES
    ('Master Plumber', 'Master plumber hourly rate', 125.00, 'hour', 'labor'),
    ('Journeyman Plumber', 'Journeyman plumber hourly rate', 85.00, 'hour', 'labor'),
    ('Apprentice Plumber', 'Apprentice plumber hourly rate', 55.00, 'hour', 'labor'),
    ('Plumber Helper', 'Plumber helper hourly rate', 35.00, 'hour', 'labor')
) AS item(name, description, price, unit, category)
WHERE codes.code = '61.00';

-- Service work
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
FROM plumbing_codes codes
CROSS JOIN (
  VALUES
    ('Service Call', 'Standard service call charge', 125.00, 'each', 'service'),
    ('Emergency Service Call', 'After hours emergency service', 225.00, 'each', 'service'),
    ('Drain Cleaning - Small', 'Clear kitchen or bathroom drain', 185.00, 'each', 'service'),
    ('Drain Cleaning - Main Line', 'Clear main sewer line', 385.00, 'each', 'service'),
    ('Camera Inspection', 'Video camera drain inspection', 285.00, 'each', 'service'),
    ('Leak Detection', 'Electronic leak detection service', 325.00, 'each', 'service'),
    ('Water Heater Installation', 'Install standard tank water heater', 685.00, 'each', 'service'),
    ('Tankless Installation', 'Install tankless water heater', 1885.00, 'each', 'service'),
    ('Toilet Installation', 'Remove and install toilet', 285.00, 'each', 'service'),
    ('Faucet Installation', 'Install kitchen or bathroom faucet', 185.00, 'each', 'service'),
    ('Garbage Disposal Installation', 'Install garbage disposal', 285.00, 'each', 'service'),
    ('Sump Pump Installation', 'Install sump pump with check valve', 685.00, 'each', 'service'),
    ('Backflow Testing', 'Annual backflow preventer testing', 185.00, 'each', 'service'),
    ('Pipe Repair', 'Emergency pipe repair', 385.00, 'each', 'service')
) AS item(name, description, price, unit, category)
WHERE codes.code = '61.60';

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
FROM plumbing_codes codes
CROSS JOIN (
  VALUES
    ('Drain Snake - Small', 'Handheld drain snake rental', 35.00, 'day', 'equipment'),
    ('Drain Snake - Large', 'Power drain snake rental', 125.00, 'day', 'equipment'),
    ('Camera System', 'Pipe inspection camera rental', 225.00, 'day', 'equipment'),
    ('Pipe Threader', 'Manual pipe threader set rental', 65.00, 'day', 'equipment'),
    ('ProPress Tool', 'ProPress crimping tool rental', 85.00, 'day', 'equipment'),
    ('PEX Crimper', 'PEX crimping tool set rental', 45.00, 'day', 'equipment'),
    ('Pipe Cutter Set', 'Pipe cutter set rental', 35.00, 'day', 'equipment'),
    ('Torch Kit', 'Soldering torch kit rental', 45.00, 'day', 'equipment'),
    ('Leak Detector', 'Electronic leak detector rental', 85.00, 'day', 'equipment'),
    ('Pressure Test Kit', 'Pressure testing equipment rental', 65.00, 'day', 'equipment')
) AS item(name, description, price, unit, category)
WHERE codes.code = '61.70';