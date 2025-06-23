-- Seed realistic construction estimates
-- Note: Replace organization_id and user_id with actual values from your database

DO $$
DECLARE
    org_id UUID;
    user_id UUID;
BEGIN
    -- Get the first organization and user (adjust as needed)
    SELECT id INTO org_id FROM organizations LIMIT 1;
    SELECT user_id INTO user_id FROM user_organizations WHERE organization_id = org_id LIMIT 1;

    -- Kitchen Renovation Estimate
    INSERT INTO estimates (
        id, user_id, organization_id, client_id, estimate_number, title, description,
        status, issue_date, expiry_date, subtotal, tax_rate, tax_amount, total_amount,
        notes, terms
    ) VALUES (
        gen_random_uuid(),
        user_id,
        org_id,
        'd6f75785-b95c-4350-bd15-9cc28455c350', -- Johnson Construction LLC
        'EST-2025-001',
        'Complete Kitchen Renovation - Main House',
        'Full kitchen remodel including cabinets, countertops, appliances, flooring, and electrical work.',
        'sent',
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE + INTERVAL '25 days',
        42500.00,
        8.25,
        3506.25,
        46006.25,
        'Includes all materials and labor. Kitchen will be out of commission for approximately 3-4 weeks.',
        'Payment terms: 50% down, 25% at midpoint, 25% upon completion. All materials guaranteed for 1 year.'
    );

    -- Bathroom Remodel Estimate  
    INSERT INTO estimates (
        id, user_id, organization_id, client_id, estimate_number, title, description,
        status, issue_date, expiry_date, subtotal, tax_rate, tax_amount, total_amount,
        notes, terms
    ) VALUES (
        gen_random_uuid(),
        user_id,
        org_id,
        '8f6c30eb-83b3-467d-b253-2c54d2fb7d38', -- Smith Renovations
        'EST-2025-002',
        'Master Bathroom Renovation',
        'Complete master bathroom remodel including tile work, vanity, shower, and plumbing.',
        'draft',
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE + INTERVAL '28 days',
        18750.00,
        8.25,
        1546.88,
        20296.88,
        'Timeline: 2-3 weeks. Includes all fixtures and finishes as specified.',
        'Payment terms: 40% down, 30% at rough-in completion, 30% upon final completion.'
    );

    -- Office Build-out Estimate
    INSERT INTO estimates (
        id, user_id, organization_id, client_id, estimate_number, title, description,
        status, issue_date, expiry_date, subtotal, tax_rate, tax_amount, total_amount,
        notes, terms
    ) VALUES (
        gen_random_uuid(),
        user_id,
        org_id,
        '6d0d97d6-da7c-4c0c-9807-cbe73c049caf', -- Global Solutions Ltd
        'EST-2025-003',
        'Office Space Build-out - Suite 200',
        'Commercial office build-out including framing, drywall, flooring, lighting, and HVAC modifications.',
        'accepted',
        CURRENT_DATE - INTERVAL '12 days',
        CURRENT_DATE + INTERVAL '18 days',
        67200.00,
        8.25,
        5544.00,
        72744.00,
        'Project includes 2,800 sq ft office space with 8 private offices, conference room, and open workspace.',
        'Net 30 payment terms. Change orders require written approval and may affect timeline.'
    );

    -- Deck Construction Estimate
    INSERT INTO estimates (
        id, user_id, organization_id, client_id, estimate_number, title, description,
        status, issue_date, expiry_date, subtotal, tax_rate, tax_amount, total_amount,
        notes, terms
    ) VALUES (
        gen_random_uuid(),
        user_id,
        org_id,
        '9e4a8430-6def-41cf-9071-495d3b04de8f', -- Sarah Thompson (individual)
        'EST-2025-004',
        'Composite Deck Construction',
        'New 400 sq ft composite deck with railing, stairs, and pergola.',
        'pending',
        CURRENT_DATE - INTERVAL '1 day',
        CURRENT_DATE + INTERVAL '29 days',
        15800.00,
        8.25,
        1303.50,
        17103.50,
        'Includes composite decking, aluminum railing system, and cedar pergola. Weather dependent timeline.',
        'Payment terms: 50% down upon contract signing, 50% upon completion.'
    );

    -- Property Maintenance Estimate
    INSERT INTO estimates (
        id, user_id, organization_id, client_id, estimate_number, title, description,
        status, issue_date, expiry_date, subtotal, tax_rate, tax_amount, total_amount,
        notes, terms
    ) VALUES (
        gen_random_uuid(),
        user_id,
        org_id,
        '2397f5ab-59d9-47e2-a2bb-2d683e856876', -- Brown Property Management
        'EST-2025-005',
        'Apartment Complex Exterior Repairs',
        'Exterior building maintenance including siding repair, roof work, and parking lot resurfacing.',
        'sent',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        34600.00,
        8.25,
        2854.50,
        37454.50,
        'Work to be completed over 6-8 weeks to minimize tenant disruption. Includes warranty.',
        'Net 15 payment terms. Work scheduled in phases to accommodate tenants.'
    );

    -- HVAC Installation Estimate
    INSERT INTO estimates (
        id, user_id, organization_id, client_id, estimate_number, title, description,
        status, issue_date, expiry_date, subtotal, tax_rate, tax_amount, total_amount,
        notes, terms
    ) VALUES (
        gen_random_uuid(),
        user_id,
        org_id,
        '62ef3775-3559-4d26-bc80-1d1785e3918e', -- Davis Commercial Contractors
        'EST-2025-006',
        'Commercial HVAC System Installation',
        'Installation of new 15-ton commercial HVAC system with ductwork modifications.',
        'expired',
        CURRENT_DATE - INTERVAL '45 days',
        CURRENT_DATE - INTERVAL '15 days',
        28900.00,
        8.25,
        2384.25,
        31284.25,
        'Includes removal of old system, installation of new equipment, and ductwork modifications.',
        'Equipment warranty: 5 years parts, 1 year labor. Installation warranty: 1 year.'
    );

END $$;

-- Insert estimate items for Kitchen Renovation (EST-2025-001)
INSERT INTO estimate_items (estimate_id, description, quantity, unit_price, total_price, cost_code, display_order)
SELECT e.id, item.description, item.quantity, item.unit_price, item.total_price, item.cost_code, item.display_order
FROM estimates e,
(VALUES 
    ('Demolition and disposal', 1, 2500.00, 2500.00, '02', 1),
    ('Cabinets - Custom maple with soft close', 1, 18500.00, 18500.00, '06', 2),
    ('Quartz countertops with undermount sink', 42, 125.00, 5250.00, '09', 3),
    ('Stainless steel appliance package', 1, 8500.00, 8500.00, '11', 4),
    ('Hardwood flooring installation', 280, 12.50, 3500.00, '09', 5),
    ('Electrical work - outlets, lighting, under cabinet', 1, 2800.00, 2800.00, '16', 6),
    ('Plumbing - sink, garbage disposal, dishwasher', 1, 1450.00, 1450.00, '15', 7)
) AS item(description, quantity, unit_price, total_price, cost_code, display_order)
WHERE e.estimate_number = 'EST-2025-001';

-- Insert estimate items for Bathroom Remodel (EST-2025-002)
INSERT INTO estimate_items (estimate_id, description, quantity, unit_price, total_price, cost_code, display_order)
SELECT e.id, item.description, item.quantity, item.unit_price, item.total_price, item.cost_code, item.display_order
FROM estimates e,
(VALUES 
    ('Demolition and disposal', 1, 1800.00, 1800.00, '02', 1),
    ('Tile work - floor and shower walls', 85, 45.00, 3825.00, '09', 2),
    ('Vanity with marble top', 1, 2200.00, 2200.00, '06', 3),
    ('Shower fixtures and glass door', 1, 3500.00, 3500.00, '15', 4),
    ('Toilet and accessories', 1, 850.00, 850.00, '15', 5),
    ('Electrical - fan, lights, outlets', 1, 1200.00, 1200.00, '16', 6),
    ('Paint and finishing work', 1, 675.00, 675.00, '09', 7),
    ('Plumbing rough-in and finish', 1, 4700.00, 4700.00, '15', 8)
) AS item(description, quantity, unit_price, total_price, cost_code, display_order)
WHERE e.estimate_number = 'EST-2025-002';

-- Insert estimate items for Office Build-out (EST-2025-003)
INSERT INTO estimate_items (estimate_id, description, quantity, unit_price, total_price, cost_code, display_order)
SELECT e.id, item.description, item.quantity, item.unit_price, item.total_price, item.cost_code, item.display_order
FROM estimates e,
(VALUES 
    ('Framing and drywall - 8 offices', 2800, 8.50, 23800.00, '09', 1),
    ('Flooring - luxury vinyl plank', 2800, 6.75, 18900.00, '09', 2),
    ('Electrical - lighting and power', 1, 8500.00, 8500.00, '16', 3),
    ('HVAC modifications and ductwork', 1, 6200.00, 6200.00, '15', 4),
    ('Paint - primer and 2 coats', 5600, 1.25, 7000.00, '09', 5),
    ('Doors and hardware - 8 offices', 8, 320.00, 2560.00, '08', 6),
    ('Ceiling grid and tiles', 2800, 2.50, 7000.00, '09', 7)
) AS item(description, quantity, unit_price, total_price, cost_code, display_order)
WHERE e.estimate_number = 'EST-2025-003';

-- Insert estimate items for Deck Construction (EST-2025-004)
INSERT INTO estimate_items (estimate_id, description, quantity, unit_price, total_price, cost_code, display_order)
SELECT e.id, item.description, item.quantity, item.unit_price, item.total_price, item.cost_code, item.display_order
FROM estimates e,
(VALUES 
    ('Excavation and site prep', 1, 1200.00, 1200.00, '02', 1),
    ('Pressure treated frame and joists', 1, 3800.00, 3800.00, '06', 2),
    ('Composite decking installation', 400, 18.50, 7400.00, '06', 3),
    ('Aluminum railing system', 64, 35.00, 2240.00, '05', 4),
    ('Cedar pergola construction', 1, 1160.00, 1160.00, '06', 5)
) AS item(description, quantity, unit_price, total_price, cost_code, display_order)
WHERE e.estimate_number = 'EST-2025-004';

-- Insert estimate items for Property Maintenance (EST-2025-005)
INSERT INTO estimate_items (estimate_id, description, quantity, unit_price, total_price, cost_code, display_order)
SELECT e.id, item.description, item.quantity, item.unit_price, item.total_price, item.cost_code, item.display_order
FROM estimates e,
(VALUES 
    ('Siding repair and replacement', 450, 22.00, 9900.00, '07', 1),
    ('Roof repairs and flashing', 1, 4800.00, 4800.00, '07', 2),
    ('Parking lot crack sealing', 2500, 2.20, 5500.00, '02', 3),
    ('Parking lot resurfacing', 1200, 8.50, 10200.00, '02', 4),
    ('Exterior painting touch-ups', 1, 2200.00, 2200.00, '09', 5),
    ('Gutter cleaning and minor repairs', 1, 2000.00, 2000.00, '07', 6)
) AS item(description, quantity, unit_price, total_price, cost_code, display_order)
WHERE e.estimate_number = 'EST-2025-005';

-- Insert estimate items for HVAC Installation (EST-2025-006)
INSERT INTO estimate_items (estimate_id, description, quantity, unit_price, total_price, cost_code, display_order)
SELECT e.id, item.description, item.quantity, item.unit_price, item.total_price, item.cost_code, item.display_order
FROM estimates e,
(VALUES 
    ('Remove existing HVAC system', 1, 2200.00, 2200.00, '02', 1),
    ('15-ton commercial unit installation', 1, 18500.00, 18500.00, '15', 2),
    ('Ductwork modifications and connections', 1, 4200.00, 4200.00, '15', 3),
    ('Electrical connections and controls', 1, 2800.00, 2800.00, '16', 4),
    ('System testing and commissioning', 1, 1200.00, 1200.00, '15', 5)
) AS item(description, quantity, unit_price, total_price, cost_code, display_order)
WHERE e.estimate_number = 'EST-2025-006';