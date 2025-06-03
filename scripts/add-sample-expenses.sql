-- Add sample expenses to showcase the cost code interface
-- This script adds various construction expenses across different cost codes

-- Get the current project ID (replace with actual project ID)
-- Project ID: 533e80c4-2eb5-469e-b15e-84459c83f41d

-- Get some cost code IDs first (these would be actual IDs from your database)
-- We'll use the ones that should exist from the system

-- Sample expenses for different cost codes
INSERT INTO expenses (
  id,
  description,
  amount,
  vendor,
  category,
  date,
  status,
  project_id,
  user_id,
  cost_code_id,
  created_at,
  updated_at
) VALUES
-- Electrical expenses (15.00 Electrical)
(gen_random_uuid(), 'Electrical wire 12 AWG copper', 245.50, 'Home Depot', 'Material', '2025-01-02', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '15.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Circuit breakers and panel', 520.00, 'Electrical Supply Co', 'Material', '2025-01-03', 'pending', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '15.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Electrician labor - 8 hours', 640.00, 'Pro Electric', 'Labor', '2025-01-04', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '15.00' LIMIT 1), NOW(), NOW()),

-- Plumbing expenses (41.00 Plumbing)
(gen_random_uuid(), 'PVC pipes and fittings', 185.75, 'Plumbing Warehouse', 'Material', '2025-01-01', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '41.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Kitchen sink and faucet', 425.00, 'Kitchen & Bath Center', 'Material', '2025-01-05', 'pending', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '41.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Plumber service call', 150.00, 'Quick Fix Plumbing', 'Service', '2025-01-06', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '41.00' LIMIT 1), NOW(), NOW()),

-- Carpentry expenses (04.00 Carpentry)
(gen_random_uuid(), 'Lumber 2x4 studs', 320.00, 'Lumber Yard', 'Material', '2024-12-28', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '04.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Cabinet installation labor', 800.00, 'Custom Carpentry', 'Labor', '2025-01-07', 'pending', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '04.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Wood screws and fasteners', 45.25, 'Hardware Store', 'Material', '2024-12-30', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '04.00' LIMIT 1), NOW(), NOW()),

-- Flooring expenses (20.00 Flooring)
(gen_random_uuid(), 'Hardwood flooring planks', 1250.00, 'Premium Floors', 'Material', '2025-01-08', 'pending', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '20.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Floor installation tools rental', 125.00, 'Tool Rental Plus', 'Equipment', '2025-01-09', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '20.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Flooring contractor', 950.00, 'Expert Flooring', 'Subcontractor', '2025-01-10', 'pending', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '20.00' LIMIT 1), NOW(), NOW()),

-- HVAC expenses (28.00 HVAC)
(gen_random_uuid(), 'HVAC ductwork materials', 380.00, 'Air Flow Supply', 'Material', '2025-01-11', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '28.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Thermostat upgrade', 275.00, 'Climate Control Co', 'Material', '2025-01-12', 'pending', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '28.00' LIMIT 1), NOW(), NOW()),

-- Painting expenses (38.00 Painting) - adding to existing
(gen_random_uuid(), 'Interior paint - premium', 185.00, 'Paint Pro Supply', 'Material', '2025-01-13', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '38.00' LIMIT 1), NOW(), NOW()),
(gen_random_uuid(), 'Painter labor - 3 days', 720.00, 'Quality Painters', 'Labor', '2025-01-14', 'pending', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), (SELECT id FROM cost_codes WHERE code = '38.00' LIMIT 1), NOW(), NOW()),

-- Permits and inspections
(gen_random_uuid(), 'Building permit fee', 450.00, 'City Hall', 'Permits', '2024-12-20', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), NULL, NOW(), NOW()),
(gen_random_uuid(), 'Electrical inspection fee', 75.00, 'City Inspections', 'Permits', '2025-01-15', 'pending', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), NULL, NOW(), NOW()),

-- Unassigned expenses (no cost code)
(gen_random_uuid(), 'Project management software', 89.99, 'SaaS Company', 'Service', '2025-01-01', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), NULL, NOW(), NOW()),
(gen_random_uuid(), 'Safety equipment and gear', 225.00, 'Safety First Supply', 'Equipment', '2024-12-15', 'paid', '533e80c4-2eb5-469e-b15e-84459c83f41d', (SELECT auth.uid()), NULL, NOW(), NOW()); 