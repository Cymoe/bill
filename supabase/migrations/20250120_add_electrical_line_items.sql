-- Add template line items for Electrical industry
-- These are pre-configured items that all electrical organizations will have access to

-- Get industry and cost code IDs
WITH industry_ids AS (
  SELECT id FROM industries WHERE name = 'Electrical'
),
electrical_codes AS (
  SELECT 
    id,
    code,
    name
  FROM cost_codes
  WHERE industry_id = (SELECT id FROM industry_ids)
    AND organization_id IS NULL
)

-- Materials for Conductors and Devices (52.00)
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
FROM electrical_codes codes
CROSS JOIN (
  VALUES
    -- Wire and Cable (52.01)
    ('12 AWG THHN Wire - Black', '12 gauge THHN stranded copper wire, 500ft spool', 125.00, 'spool', 'material'),
    ('12 AWG THHN Wire - White', '12 gauge THHN stranded copper wire, 500ft spool', 125.00, 'spool', 'material'),
    ('12 AWG THHN Wire - Red', '12 gauge THHN stranded copper wire, 500ft spool', 125.00, 'spool', 'material'),
    ('12 AWG THHN Wire - Green', '12 gauge THHN stranded copper wire, 500ft spool', 125.00, 'spool', 'material'),
    ('14 AWG THHN Wire - Black', '14 gauge THHN stranded copper wire, 500ft spool', 85.00, 'spool', 'material'),
    ('14 AWG THHN Wire - White', '14 gauge THHN stranded copper wire, 500ft spool', 85.00, 'spool', 'material'),
    ('10 AWG THHN Wire - Black', '10 gauge THHN stranded copper wire, 500ft spool', 195.00, 'spool', 'material'),
    ('10 AWG THHN Wire - Red', '10 gauge THHN stranded copper wire, 500ft spool', 195.00, 'spool', 'material'),
    ('8 AWG THHN Wire', '8 gauge THHN stranded copper wire, 500ft spool', 385.00, 'spool', 'material'),
    ('6 AWG THHN Wire', '6 gauge THHN stranded copper wire, 500ft spool', 625.00, 'spool', 'material'),
    ('12-2 Romex NM-B', '12-2 with ground non-metallic cable, 250ft coil', 185.00, 'coil', 'material'),
    ('12-3 Romex NM-B', '12-3 with ground non-metallic cable, 250ft coil', 275.00, 'coil', 'material'),
    ('14-2 Romex NM-B', '14-2 with ground non-metallic cable, 250ft coil', 125.00, 'coil', 'material'),
    ('14-3 Romex NM-B', '14-3 with ground non-metallic cable, 250ft coil', 195.00, 'coil', 'material'),
    ('10-2 Romex NM-B', '10-2 with ground non-metallic cable, 250ft coil', 325.00, 'coil', 'material'),
    ('10-3 Romex NM-B', '10-3 with ground non-metallic cable, 250ft coil', 425.00, 'coil', 'material'),
    ('MC Cable 12-2', '12-2 metal clad cable with ground, 250ft coil', 385.00, 'coil', 'material'),
    ('MC Cable 12-3', '12-3 metal clad cable with ground, 250ft coil', 525.00, 'coil', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '52.01';

-- Devices and Fixtures (52.02)
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
FROM electrical_codes codes
CROSS JOIN (
  VALUES
    ('Single Pole Switch', '15A single pole switch, commercial grade', 8.50, 'each', 'material'),
    ('3-Way Switch', '15A 3-way switch, commercial grade', 12.00, 'each', 'material'),
    ('4-Way Switch', '15A 4-way switch, commercial grade', 18.00, 'each', 'material'),
    ('Dimmer Switch', '600W single pole dimmer switch', 22.00, 'each', 'material'),
    ('Duplex Receptacle - 15A', '15A 125V duplex receptacle, commercial grade', 6.50, 'each', 'material'),
    ('Duplex Receptacle - 20A', '20A 125V duplex receptacle, commercial grade', 8.50, 'each', 'material'),
    ('GFCI Receptacle', '20A GFCI receptacle with LED indicator', 22.00, 'each', 'material'),
    ('AFCI Breaker - 15A', '15A arc fault circuit interrupter breaker', 45.00, 'each', 'material'),
    ('AFCI Breaker - 20A', '20A arc fault circuit interrupter breaker', 45.00, 'each', 'material'),
    ('USB Receptacle', 'Duplex receptacle with USB-A and USB-C ports', 28.00, 'each', 'material'),
    ('Switch Plate - Single', 'Single gang switch plate, white', 1.50, 'each', 'material'),
    ('Switch Plate - Double', 'Double gang switch plate, white', 2.50, 'each', 'material'),
    ('Switch Plate - Triple', 'Triple gang switch plate, white', 3.50, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '52.02';

-- Conduit and Raceways (52.10)
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
FROM electrical_codes codes
CROSS JOIN (
  VALUES
    ('1/2" EMT Conduit', '1/2 inch EMT conduit, 10ft length', 6.50, 'stick', 'material'),
    ('3/4" EMT Conduit', '3/4 inch EMT conduit, 10ft length', 8.50, 'stick', 'material'),
    ('1" EMT Conduit', '1 inch EMT conduit, 10ft length', 12.00, 'stick', 'material'),
    ('1-1/4" EMT Conduit', '1-1/4 inch EMT conduit, 10ft length', 18.00, 'stick', 'material'),
    ('1/2" EMT Connector', '1/2 inch EMT compression connector', 1.25, 'each', 'material'),
    ('3/4" EMT Connector', '3/4 inch EMT compression connector', 1.75, 'each', 'material'),
    ('1" EMT Connector', '1 inch EMT compression connector', 2.50, 'each', 'material'),
    ('1/2" EMT Coupling', '1/2 inch EMT coupling', 0.85, 'each', 'material'),
    ('3/4" EMT Coupling', '3/4 inch EMT coupling', 1.25, 'each', 'material'),
    ('1" EMT Coupling', '1 inch EMT coupling', 1.85, 'each', 'material'),
    ('1/2" EMT 90° Elbow', '1/2 inch EMT 90 degree elbow', 2.50, 'each', 'material'),
    ('3/4" EMT 90° Elbow', '3/4 inch EMT 90 degree elbow', 3.50, 'each', 'material'),
    ('1" EMT 90° Elbow', '1 inch EMT 90 degree elbow', 5.50, 'each', 'material'),
    ('1/2" PVC Conduit', '1/2 inch PVC conduit, 10ft length', 3.50, 'stick', 'material'),
    ('3/4" PVC Conduit', '3/4 inch PVC conduit, 10ft length', 4.50, 'stick', 'material'),
    ('1" PVC Conduit', '1 inch PVC conduit, 10ft length', 6.50, 'stick', 'material'),
    ('1/2" Flexible Conduit', '1/2 inch flexible metal conduit, 25ft coil', 28.00, 'coil', 'material'),
    ('3/4" Flexible Conduit', '3/4 inch flexible metal conduit, 25ft coil', 42.00, 'coil', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '52.10';

-- Boxes and Enclosures (52.20)
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
FROM electrical_codes codes
CROSS JOIN (
  VALUES
    ('Single Gang Box', 'Single gang metal outlet box', 2.50, 'each', 'material'),
    ('Double Gang Box', 'Double gang metal outlet box', 4.50, 'each', 'material'),
    ('Triple Gang Box', 'Triple gang metal outlet box', 8.50, 'each', 'material'),
    ('4" Square Box', '4 inch square metal junction box', 3.50, 'each', 'material'),
    ('4" Square Cover - Blank', '4 inch square blank cover', 1.50, 'each', 'material'),
    ('4" Square Cover - Single', '4 inch square single device cover', 2.00, 'each', 'material'),
    ('4" Octagon Box', '4 inch octagon metal box', 2.50, 'each', 'material'),
    ('Single Gang Old Work Box', 'Single gang old work box', 1.50, 'each', 'material'),
    ('Double Gang Old Work Box', 'Double gang old work box', 2.50, 'each', 'material'),
    ('Weatherproof Box - Single', 'Single gang weatherproof box with cover', 12.00, 'each', 'material'),
    ('Weatherproof Box - Double', 'Double gang weatherproof box with cover', 18.00, 'each', 'material'),
    ('Junction Box 6x6x4', '6x6x4 inch metal junction box', 18.00, 'each', 'material'),
    ('Junction Box 8x8x4', '8x8x4 inch metal junction box', 25.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '52.20';

-- Panels and Breakers (52.30)
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
FROM electrical_codes codes
CROSS JOIN (
  VALUES
    ('100A Main Panel', '100A 20-space main breaker panel', 185.00, 'each', 'material'),
    ('200A Main Panel', '200A 40-space main breaker panel', 285.00, 'each', 'material'),
    ('Sub Panel 100A', '100A 20-space main lug panel', 125.00, 'each', 'material'),
    ('15A Single Pole Breaker', '15A single pole circuit breaker', 8.50, 'each', 'material'),
    ('20A Single Pole Breaker', '20A single pole circuit breaker', 8.50, 'each', 'material'),
    ('30A Single Pole Breaker', '30A single pole circuit breaker', 12.00, 'each', 'material'),
    ('15A Tandem Breaker', '15A tandem circuit breaker', 18.00, 'each', 'material'),
    ('20A Tandem Breaker', '20A tandem circuit breaker', 18.00, 'each', 'material'),
    ('30A Double Pole Breaker', '30A double pole circuit breaker', 22.00, 'each', 'material'),
    ('40A Double Pole Breaker', '40A double pole circuit breaker', 28.00, 'each', 'material'),
    ('50A Double Pole Breaker', '50A double pole circuit breaker', 35.00, 'each', 'material'),
    ('60A Double Pole Breaker', '60A double pole circuit breaker', 42.00, 'each', 'material'),
    ('100A Double Pole Breaker', '100A double pole circuit breaker', 125.00, 'each', 'material'),
    ('Ground Bar Kit', 'Ground bar kit for panel', 18.00, 'each', 'material'),
    ('Neutral Bar Kit', 'Neutral bar kit for panel', 22.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '52.30';

-- Lighting (53.00)
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
FROM electrical_codes codes
CROSS JOIN (
  VALUES
    ('2x4 LED Panel', '2x4 LED flat panel, 40W, 4000K', 85.00, 'each', 'material'),
    ('2x2 LED Panel', '2x2 LED flat panel, 30W, 4000K', 65.00, 'each', 'material'),
    ('4ft LED Strip', '4ft LED strip fixture, 40W, 4000K', 45.00, 'each', 'material'),
    ('8ft LED Strip', '8ft LED strip fixture, 80W, 4000K', 85.00, 'each', 'material'),
    ('6" LED Recessed Can', '6 inch LED recessed light, 15W', 22.00, 'each', 'material'),
    ('4" LED Recessed Can', '4 inch LED recessed light, 10W', 18.00, 'each', 'material'),
    ('LED High Bay', 'LED high bay fixture, 150W, 5000K', 185.00, 'each', 'material'),
    ('LED Wall Pack', 'LED wall pack fixture, 40W, 5000K', 125.00, 'each', 'material'),
    ('Emergency Exit Sign', 'LED emergency exit sign with battery backup', 45.00, 'each', 'material'),
    ('Emergency Light', 'LED emergency light with battery backup', 65.00, 'each', 'material'),
    ('Occupancy Sensor', 'PIR occupancy sensor switch', 28.00, 'each', 'material'),
    ('Photocell', 'Outdoor photocell sensor', 12.00, 'each', 'material')
) AS item(name, description, price, unit, category)
WHERE codes.code = '53.00';

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
FROM electrical_codes codes
CROSS JOIN (
  VALUES
    ('Master Electrician', 'Master electrician hourly rate', 125.00, 'hour', 'labor'),
    ('Journeyman Electrician', 'Journeyman electrician hourly rate', 85.00, 'hour', 'labor'),
    ('Apprentice Electrician', 'Apprentice electrician hourly rate', 55.00, 'hour', 'labor'),
    ('Electrical Helper', 'Electrical helper hourly rate', 35.00, 'hour', 'labor')
) AS item(name, description, price, unit, category)
WHERE codes.code = '52.00';

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
FROM electrical_codes codes
CROSS JOIN (
  VALUES
    ('Service Call', 'Standard service call charge', 125.00, 'each', 'service'),
    ('Emergency Service Call', 'After hours emergency service', 225.00, 'each', 'service'),
    ('Electrical Inspection', 'Comprehensive electrical system inspection', 350.00, 'each', 'service'),
    ('Panel Upgrade - 100A to 200A', 'Upgrade electrical panel from 100A to 200A', 2850.00, 'each', 'service'),
    ('Whole House Surge Protection', 'Install whole house surge protector', 450.00, 'each', 'service'),
    ('Generator Transfer Switch', 'Install manual transfer switch for generator', 850.00, 'each', 'service'),
    ('EV Charger Installation', 'Install Level 2 EV charging station', 1250.00, 'each', 'service'),
    ('Outlet Installation', 'Install new electrical outlet', 185.00, 'each', 'service'),
    ('Switch Installation', 'Install new light switch', 165.00, 'each', 'service'),
    ('Ceiling Fan Installation', 'Install ceiling fan with switch', 285.00, 'each', 'service'),
    ('Recessed Light Installation', 'Install recessed light fixture', 125.00, 'each', 'service'),
    ('Troubleshooting', 'Electrical troubleshooting hourly rate', 125.00, 'hour', 'service')
) AS item(name, description, price, unit, category)
WHERE codes.code = '52.60';

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
FROM electrical_codes codes
CROSS JOIN (
  VALUES
    ('Wire Puller Rental', 'Electric wire puller daily rental', 125.00, 'day', 'equipment'),
    ('Conduit Bender - 1/2" to 1"', 'Manual conduit bender set rental', 35.00, 'day', 'equipment'),
    ('Hydraulic Bender', 'Hydraulic conduit bender rental', 185.00, 'day', 'equipment'),
    ('Cable Locator', 'Underground cable locator rental', 95.00, 'day', 'equipment'),
    ('Megger Tester', 'Insulation resistance tester rental', 85.00, 'day', 'equipment'),
    ('Thermal Camera', 'Thermal imaging camera rental', 125.00, 'day', 'equipment'),
    ('Trencher Rental', 'Walk-behind trencher daily rental', 285.00, 'day', 'equipment'),
    ('Hammer Drill', 'Rotary hammer drill rental', 65.00, 'day', 'equipment'),
    ('Hole Saw Kit', 'Electrical hole saw kit rental', 45.00, 'day', 'equipment'),
    ('Fish Tape - 100ft', 'Fiberglass fish tape rental', 25.00, 'day', 'equipment')
) AS item(name, description, price, unit, category)
WHERE codes.code = '52.70';