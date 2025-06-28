-- Comprehensive HVAC Service Options with JSONB Attributes
-- This script populates the HVAC industry with real-world services that contractors use daily

-- First, let's get the HVAC service IDs we need
WITH hvac_services AS (
  SELECT s.id, s.name 
  FROM services s
  JOIN industries i ON s.industry_id = i.id
  WHERE i.name = 'HVAC'
)

-- AC Installation Service Options
INSERT INTO service_options (
  service_id, name, description, price, unit, skill_level, 
  estimated_hours, warranty_months, is_template, attributes, organization_id
) 
SELECT 
  s.id,
  v.name,
  v.description,
  v.price,
  v.unit,
  v.skill_level,
  v.estimated_hours,
  v.warranty_months,
  true,
  v.attributes,
  NULL
FROM hvac_services s
CROSS JOIN (VALUES
  -- Mini Split Systems
  ('9K BTU Mini Split Installation', 'Install 9,000 BTU ductless mini split system', 2850.00, 'unit', 'intermediate', 6, 120, 
   '{"btu": 9000, "seer": 16, "tonnage": 0.75, "coverage_sqft": 400, "voltage": "115V", "phase": "single", "energy_star": true, "system_type": "mini_split", "zones": 1, "ductless": true, "inverter": true, "warranty_years": 10}'::jsonb),
  
  ('12K BTU Mini Split Installation', 'Install 12,000 BTU ductless mini split system', 3250.00, 'unit', 'intermediate', 6, 120,
   '{"btu": 12000, "seer": 16, "tonnage": 1, "coverage_sqft": 550, "voltage": "115V", "phase": "single", "energy_star": true, "system_type": "mini_split", "zones": 1, "ductless": true, "inverter": true, "warranty_years": 10}'::jsonb),
  
  ('18K BTU Mini Split Installation', 'Install 18,000 BTU ductless mini split system', 3850.00, 'unit', 'intermediate', 7, 120,
   '{"btu": 18000, "seer": 17, "tonnage": 1.5, "coverage_sqft": 800, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "mini_split", "zones": 1, "ductless": true, "inverter": true, "warranty_years": 10}'::jsonb),
  
  ('24K BTU Mini Split Installation', 'Install 24,000 BTU ductless mini split system', 4250.00, 'unit', 'intermediate', 8, 120,
   '{"btu": 24000, "seer": 17, "tonnage": 2, "coverage_sqft": 1200, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "mini_split", "zones": 1, "ductless": true, "inverter": true, "warranty_years": 10}'::jsonb),
  
  -- Central AC Systems
  ('1.5 Ton Central AC Installation', 'Install 1.5 ton central air conditioning system', 3500.00, 'unit', 'advanced', 8, 120,
   '{"btu": 18000, "seer": 14, "tonnage": 1.5, "coverage_sqft": 750, "voltage": "240V", "phase": "single", "energy_star": false, "system_type": "central", "refrigerant": "R410A", "warranty_years": 10}'::jsonb),
  
  ('2 Ton Central AC Installation', 'Install 2 ton central air conditioning system', 4200.00, 'unit', 'advanced', 8, 120,
   '{"btu": 24000, "seer": 14, "tonnage": 2, "coverage_sqft": 1000, "voltage": "240V", "phase": "single", "energy_star": false, "system_type": "central", "refrigerant": "R410A", "warranty_years": 10}'::jsonb),
  
  ('2.5 Ton Central AC Installation', 'Install 2.5 ton central air conditioning system', 4800.00, 'unit', 'advanced', 10, 120,
   '{"btu": 30000, "seer": 14, "tonnage": 2.5, "coverage_sqft": 1300, "voltage": "240V", "phase": "single", "energy_star": false, "system_type": "central", "refrigerant": "R410A", "warranty_years": 10}'::jsonb),
  
  ('3 Ton Central AC Installation', 'Install 3 ton central air conditioning system', 5400.00, 'unit', 'advanced', 10, 120,
   '{"btu": 36000, "seer": 14, "tonnage": 3, "coverage_sqft": 1600, "voltage": "240V", "phase": "single", "energy_star": false, "system_type": "central", "refrigerant": "R410A", "warranty_years": 10}'::jsonb),
  
  ('3.5 Ton Central AC Installation', 'Install 3.5 ton central air conditioning system', 6200.00, 'unit', 'advanced', 12, 120,
   '{"btu": 42000, "seer": 14, "tonnage": 3.5, "coverage_sqft": 1900, "voltage": "240V", "phase": "single", "energy_star": false, "system_type": "central", "refrigerant": "R410A", "warranty_years": 10}'::jsonb),
  
  ('4 Ton Central AC Installation', 'Install 4 ton central air conditioning system', 6800.00, 'unit', 'advanced', 12, 120,
   '{"btu": 48000, "seer": 14, "tonnage": 4, "coverage_sqft": 2200, "voltage": "240V", "phase": "single", "energy_star": false, "system_type": "central", "refrigerant": "R410A", "warranty_years": 10}'::jsonb),
  
  ('5 Ton Central AC Installation', 'Install 5 ton central air conditioning system', 7500.00, 'unit', 'advanced', 14, 120,
   '{"btu": 60000, "seer": 14, "tonnage": 5, "coverage_sqft": 2800, "voltage": "240V", "phase": "single", "energy_star": false, "system_type": "central", "refrigerant": "R410A", "warranty_years": 10}'::jsonb),
  
  -- High Efficiency Central AC
  ('2 Ton 16 SEER AC Installation', 'Install high efficiency 2 ton 16 SEER system', 5200.00, 'unit', 'advanced', 10, 144,
   '{"btu": 24000, "seer": 16, "tonnage": 2, "coverage_sqft": 1000, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "central", "refrigerant": "R410A", "warranty_years": 12}'::jsonb),
  
  ('3 Ton 16 SEER AC Installation', 'Install high efficiency 3 ton 16 SEER system', 6400.00, 'unit', 'advanced', 10, 144,
   '{"btu": 36000, "seer": 16, "tonnage": 3, "coverage_sqft": 1600, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "central", "refrigerant": "R410A", "warranty_years": 12}'::jsonb),
  
  ('3 Ton 18 SEER AC Installation', 'Install premium efficiency 3 ton 18 SEER system', 7800.00, 'unit', 'advanced', 12, 180,
   '{"btu": 36000, "seer": 18, "tonnage": 3, "coverage_sqft": 1600, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "central", "refrigerant": "R410A", "two_stage": true, "warranty_years": 15}'::jsonb),
  
  ('4 Ton 18 SEER AC Installation', 'Install premium efficiency 4 ton 18 SEER system', 8900.00, 'unit', 'advanced', 14, 180,
   '{"btu": 48000, "seer": 18, "tonnage": 4, "coverage_sqft": 2200, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "central", "refrigerant": "R410A", "two_stage": true, "warranty_years": 15}'::jsonb),
  
  -- Variable Speed Systems
  ('3 Ton Variable Speed AC', 'Install 3 ton variable speed inverter system', 9500.00, 'unit', 'expert', 14, 240,
   '{"btu": 36000, "seer": 20, "tonnage": 3, "coverage_sqft": 1600, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "central", "refrigerant": "R410A", "variable_speed": true, "inverter": true, "warranty_years": 20}'::jsonb),
  
  ('4 Ton Variable Speed AC', 'Install 4 ton variable speed inverter system', 10800.00, 'unit', 'expert', 16, 240,
   '{"btu": 48000, "seer": 20, "tonnage": 4, "coverage_sqft": 2200, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "central", "refrigerant": "R410A", "variable_speed": true, "inverter": true, "warranty_years": 20}'::jsonb),
  
  -- Multi-Zone Mini Splits
  ('Dual Zone Mini Split System', 'Install 2-zone ductless system (9K+12K)', 5800.00, 'system', 'advanced', 10, 120,
   '{"btu": 21000, "seer": 17, "coverage_sqft": 950, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "mini_split", "zones": 2, "ductless": true, "inverter": true, "warranty_years": 10}'::jsonb),
  
  ('Tri-Zone Mini Split System', 'Install 3-zone ductless system (9K+9K+12K)', 7200.00, 'system', 'advanced', 12, 120,
   '{"btu": 30000, "seer": 17, "coverage_sqft": 1400, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "mini_split", "zones": 3, "ductless": true, "inverter": true, "warranty_years": 10}'::jsonb),
  
  ('Quad-Zone Mini Split System', 'Install 4-zone ductless system', 8900.00, 'system', 'expert', 16, 120,
   '{"btu": 36000, "seer": 18, "coverage_sqft": 2000, "voltage": "240V", "phase": "single", "energy_star": true, "system_type": "mini_split", "zones": 4, "ductless": true, "inverter": true, "warranty_years": 10}'::jsonb)
  
) AS v(name, description, price, unit, skill_level, estimated_hours, warranty_months, attributes)
WHERE s.name = 'AC Installation'
ON CONFLICT (service_id, name, organization_id) DO NOTHING;

-- Furnace Installation Service Options
INSERT INTO service_options (
  service_id, name, description, price, unit, skill_level, 
  estimated_hours, warranty_months, is_template, attributes, organization_id
) 
SELECT 
  s.id,
  v.name,
  v.description,
  v.price,
  v.unit,
  v.skill_level,
  v.estimated_hours,
  v.warranty_months,
  true,
  v.attributes,
  NULL
FROM hvac_services s
CROSS JOIN (VALUES
  -- Gas Furnaces
  ('40K BTU Gas Furnace', 'Install 40,000 BTU 80% efficiency gas furnace', 2800.00, 'unit', 'advanced', 6, 120,
   '{"btu_input": 40000, "btu_output": 32000, "efficiency_percent": 80, "efficiency_rating": "80% AFUE", "fuel_type": "natural_gas", "stages": "single", "warranty_years": 10}'::jsonb),
  
  ('60K BTU Gas Furnace', 'Install 60,000 BTU 80% efficiency gas furnace', 3200.00, 'unit', 'advanced', 8, 120,
   '{"btu_input": 60000, "btu_output": 48000, "efficiency_percent": 80, "efficiency_rating": "80% AFUE", "fuel_type": "natural_gas", "stages": "single", "warranty_years": 10}'::jsonb),
  
  ('80K BTU Gas Furnace', 'Install 80,000 BTU 80% efficiency gas furnace', 3600.00, 'unit', 'advanced', 8, 120,
   '{"btu_input": 80000, "btu_output": 64000, "efficiency_percent": 80, "efficiency_rating": "80% AFUE", "fuel_type": "natural_gas", "stages": "single", "warranty_years": 10}'::jsonb),
  
  ('100K BTU Gas Furnace', 'Install 100,000 BTU 80% efficiency gas furnace', 4200.00, 'unit', 'advanced', 10, 120,
   '{"btu_input": 100000, "btu_output": 80000, "efficiency_percent": 80, "efficiency_rating": "80% AFUE", "fuel_type": "natural_gas", "stages": "single", "warranty_years": 10}'::jsonb),
  
  -- High Efficiency Gas Furnaces
  ('60K BTU 95% Furnace', 'Install 60,000 BTU 95% high efficiency furnace', 4500.00, 'unit', 'advanced', 10, 144,
   '{"btu_input": 60000, "btu_output": 57000, "efficiency_percent": 95, "efficiency_rating": "95% AFUE", "fuel_type": "natural_gas", "stages": "two", "energy_star": true, "warranty_years": 15}'::jsonb),
  
  ('80K BTU 95% Furnace', 'Install 80,000 BTU 95% high efficiency furnace', 5200.00, 'unit', 'advanced', 10, 144,
   '{"btu_input": 80000, "btu_output": 76000, "efficiency_percent": 95, "efficiency_rating": "95% AFUE", "fuel_type": "natural_gas", "stages": "two", "energy_star": true, "warranty_years": 15}'::jsonb),
  
  ('100K BTU 95% Furnace', 'Install 100,000 BTU 95% high efficiency furnace', 5800.00, 'unit', 'advanced', 12, 144,
   '{"btu_input": 100000, "btu_output": 95000, "efficiency_percent": 95, "efficiency_rating": "95% AFUE", "fuel_type": "natural_gas", "stages": "two", "energy_star": true, "warranty_years": 15}'::jsonb),
  
  -- Modulating Furnaces
  ('80K BTU Modulating Furnace', 'Install 80,000 BTU 97% modulating furnace', 6800.00, 'unit', 'expert', 12, 180,
   '{"btu_input": 80000, "btu_output": 77600, "efficiency_percent": 97, "efficiency_rating": "97% AFUE", "fuel_type": "natural_gas", "stages": "modulating", "energy_star": true, "warranty_years": 20}'::jsonb),
  
  ('100K BTU Modulating Furnace', 'Install 100,000 BTU 97% modulating furnace', 7500.00, 'unit', 'expert', 14, 180,
   '{"btu_input": 100000, "btu_output": 97000, "efficiency_percent": 97, "efficiency_rating": "97% AFUE", "fuel_type": "natural_gas", "stages": "modulating", "energy_star": true, "warranty_years": 20}'::jsonb),
  
  -- Electric Furnaces
  ('10KW Electric Furnace', 'Install 10KW electric furnace (34,000 BTU)', 2200.00, 'unit', 'intermediate', 6, 120,
   '{"kw": 10, "btu_output": 34000, "efficiency_percent": 100, "fuel_type": "electric", "voltage": "240V", "warranty_years": 10}'::jsonb),
  
  ('15KW Electric Furnace', 'Install 15KW electric furnace (51,000 BTU)', 2600.00, 'unit', 'intermediate', 6, 120,
   '{"kw": 15, "btu_output": 51000, "efficiency_percent": 100, "fuel_type": "electric", "voltage": "240V", "warranty_years": 10}'::jsonb),
  
  ('20KW Electric Furnace', 'Install 20KW electric furnace (68,000 BTU)', 3000.00, 'unit', 'intermediate', 8, 120,
   '{"kw": 20, "btu_output": 68000, "efficiency_percent": 100, "fuel_type": "electric", "voltage": "240V", "warranty_years": 10}'::jsonb)
  
) AS v(name, description, price, unit, skill_level, estimated_hours, warranty_months, attributes)
WHERE s.name = 'Furnace Installation'
ON CONFLICT (service_id, name, organization_id) DO NOTHING;

-- HVAC Repair Service Options
INSERT INTO service_options (
  service_id, name, description, price, unit, skill_level, 
  estimated_hours, warranty_months, is_template, attributes, organization_id
) 
SELECT 
  s.id,
  v.name,
  v.description,
  v.price,
  v.unit,
  v.skill_level,
  v.estimated_hours,
  v.warranty_months,
  true,
  v.attributes,
  NULL
FROM hvac_services s
CROSS JOIN (VALUES
  -- AC Repairs
  ('AC Diagnostic Service', 'Complete AC system diagnostic and inspection', 125.00, 'service', 'intermediate', 1, 3,
   '{"service_type": "diagnostic", "includes_report": true, "refrigerant_check": true, "electrical_test": true}'::jsonb),
  
  ('Refrigerant Recharge', 'Add refrigerant to AC system (per pound)', 125.00, 'lb', 'intermediate', 2, 12,
   '{"service_type": "recharge", "refrigerant_type": "R410A", "leak_test_included": true, "epa_certified": true}'::jsonb),
  
  ('AC Capacitor Replacement', 'Replace failed capacitor', 225.00, 'unit', 'intermediate', 1, 12,
   '{"service_type": "repair", "component": "capacitor", "emergency_available": true}'::jsonb),
  
  ('AC Contactor Replacement', 'Replace failed contactor', 275.00, 'unit', 'intermediate', 1, 12,
   '{"service_type": "repair", "component": "contactor", "emergency_available": true}'::jsonb),
  
  ('Evaporator Coil Cleaning', 'Deep clean evaporator coil', 350.00, 'service', 'intermediate', 3, 6,
   '{"service_type": "maintenance", "component": "evaporator_coil", "includes_sanitizing": true}'::jsonb),
  
  ('Condenser Coil Cleaning', 'Deep clean outdoor condenser coil', 275.00, 'service', 'basic', 2, 6,
   '{"service_type": "maintenance", "component": "condenser_coil", "includes_fin_straightening": true}'::jsonb),
  
  ('Blower Motor Replacement', 'Replace failed blower motor', 650.00, 'unit', 'advanced', 3, 12,
   '{"service_type": "repair", "component": "blower_motor", "variable_speed_available": true}'::jsonb),
  
  ('Compressor Replacement', 'Replace failed AC compressor', 1850.00, 'unit', 'expert', 6, 60,
   '{"service_type": "major_repair", "component": "compressor", "includes_refrigerant": true, "warranty_years": 5}'::jsonb),
  
  -- Furnace Repairs
  ('Furnace Diagnostic Service', 'Complete furnace inspection and diagnostic', 125.00, 'service', 'intermediate', 1, 3,
   '{"service_type": "diagnostic", "includes_combustion_analysis": true, "safety_check": true}'::jsonb),
  
  ('Ignitor Replacement', 'Replace furnace ignitor', 225.00, 'unit', 'intermediate', 1, 12,
   '{"service_type": "repair", "component": "ignitor", "hot_surface_type": true}'::jsonb),
  
  ('Flame Sensor Cleaning', 'Clean and adjust flame sensor', 125.00, 'service', 'basic', 0.5, 6,
   '{"service_type": "maintenance", "component": "flame_sensor"}'::jsonb),
  
  ('Gas Valve Replacement', 'Replace faulty gas valve', 425.00, 'unit', 'advanced', 2, 12,
   '{"service_type": "repair", "component": "gas_valve", "requires_permit": true}'::jsonb),
  
  ('Heat Exchanger Inspection', 'Inspect heat exchanger for cracks', 175.00, 'service', 'advanced', 2, 0,
   '{"service_type": "inspection", "component": "heat_exchanger", "includes_co_test": true}'::jsonb),
  
  ('Inducer Motor Replacement', 'Replace furnace inducer motor', 525.00, 'unit', 'intermediate', 2, 12,
   '{"service_type": "repair", "component": "inducer_motor"}'::jsonb)
  
) AS v(name, description, price, unit, skill_level, estimated_hours, warranty_months, attributes)
WHERE s.name = 'HVAC Repair'
ON CONFLICT (service_id, name, organization_id) DO NOTHING;

-- HVAC Maintenance Service Options
INSERT INTO service_options (
  service_id, name, description, price, unit, skill_level, 
  estimated_hours, warranty_months, is_template, attributes, organization_id
) 
SELECT 
  s.id,
  v.name,
  v.description,
  v.price,
  v.unit,
  v.skill_level,
  v.estimated_hours,
  v.warranty_months,
  true,
  v.attributes,
  NULL
FROM hvac_services s
CROSS JOIN (VALUES
  -- Maintenance Plans
  ('Spring AC Tune-Up', 'Comprehensive AC maintenance service', 149.00, 'service', 'intermediate', 2, 0,
   '{"service_type": "preventive", "season": "spring", "points_checked": 21, "includes_filter": true, "priority_service": true}'::jsonb),
  
  ('Fall Furnace Tune-Up', 'Comprehensive furnace maintenance service', 149.00, 'service', 'intermediate', 2, 0,
   '{"service_type": "preventive", "season": "fall", "points_checked": 21, "includes_filter": true, "priority_service": true}'::jsonb),
  
  ('Annual HVAC Maintenance', 'Complete HVAC system maintenance (AC + Furnace)', 279.00, 'year', 'intermediate', 4, 0,
   '{"service_type": "preventive", "frequency": "annual", "includes_both_seasons": true, "priority_service": true, "discount_repairs": 15}'::jsonb),
  
  ('Bi-Annual Maintenance Plan', 'Spring and Fall maintenance visits', 299.00, 'year', 'intermediate', 4, 0,
   '{"service_type": "preventive", "frequency": "bi_annual", "visits_per_year": 2, "priority_service": true, "discount_repairs": 15}'::jsonb),
  
  ('Premium Maintenance Plan', 'Quarterly maintenance with priority service', 599.00, 'year', 'intermediate', 8, 0,
   '{"service_type": "preventive", "frequency": "quarterly", "visits_per_year": 4, "priority_service": true, "discount_repairs": 20, "no_overtime_charges": true}'::jsonb),
  
  -- Filter Services
  ('Standard Filter Change', 'Replace standard 1" filter', 35.00, 'service', 'basic', 0.25, 0,
   '{"filter_size": "1_inch", "merv_rating": 8, "filter_included": true}'::jsonb),
  
  ('Pleated Filter Change', 'Replace pleated 1" filter', 45.00, 'service', 'basic', 0.25, 0,
   '{"filter_size": "1_inch", "merv_rating": 11, "filter_included": true, "allergen_reduction": true}'::jsonb),
  
  ('4" Media Filter Change', 'Replace 4" media filter', 85.00, 'service', 'basic', 0.5, 0,
   '{"filter_size": "4_inch", "merv_rating": 13, "filter_included": true, "lasts_months": 6}'::jsonb),
  
  ('Electronic Filter Cleaning', 'Clean electronic air cleaner cells', 125.00, 'service', 'intermediate', 1, 0,
   '{"filter_type": "electronic", "includes_pre_filter": true}'::jsonb)
  
) AS v(name, description, price, unit, skill_level, estimated_hours, warranty_months, attributes)
WHERE s.name = 'HVAC Maintenance'
ON CONFLICT (service_id, name, organization_id) DO NOTHING;

-- Ductwork Service Options
INSERT INTO service_options (
  service_id, name, description, price, unit, skill_level, 
  estimated_hours, warranty_months, is_template, attributes, organization_id
) 
SELECT 
  s.id,
  v.name,
  v.description,
  v.price,
  v.unit,
  v.skill_level,
  v.estimated_hours,
  v.warranty_months,
  true,
  v.attributes,
  NULL
FROM hvac_services s
CROSS JOIN (VALUES
  -- Duct Installation
  ('Flexible Duct Run', 'Install insulated flex duct', 125.00, 'run', 'intermediate', 2, 60,
   '{"duct_type": "flexible", "insulation": "R8", "diameter_inches": 8, "max_length_feet": 25}'::jsonb),
  
  ('Sheet Metal Duct', 'Install rigid sheet metal ductwork', 35.00, 'ft', 'advanced', 0.5, 120,
   '{"duct_type": "rigid", "material": "galvanized_steel", "insulation": "external_wrap", "gauge": 26}'::jsonb),
  
  ('Return Air Grille', 'Install return air grille with filter', 185.00, 'unit', 'basic', 1, 60,
   '{"component": "return_grille", "includes_filter_rack": true, "adjustable": true}'::jsonb),
  
  ('Supply Register', 'Install supply air register', 125.00, 'unit', 'basic', 0.75, 60,
   '{"component": "supply_register", "adjustable_damper": true, "material": "steel"}'::jsonb),
  
  -- Duct Sealing & Repair
  ('Duct Sealing - Mastic', 'Seal duct joints with mastic', 8.00, 'ft', 'intermediate', 0.25, 24,
   '{"sealing_method": "mastic", "includes_mesh": true, "energy_savings": true}'::jsonb),
  
  ('Aeroseal Duct Sealing', 'Computer-controlled duct sealing from inside', 1800.00, 'system', 'expert', 4, 120,
   '{"sealing_method": "aeroseal", "guaranteed_reduction": 90, "includes_testing": true, "warranty_years": 10}'::jsonb),
  
  ('Duct Insulation Wrap', 'Add insulation to existing ductwork', 12.00, 'ft', 'basic', 0.25, 60,
   '{"insulation_type": "fiberglass_wrap", "r_value": "R8", "vapor_barrier": true}'::jsonb),
  
  -- Duct Cleaning
  ('Residential Duct Cleaning', 'Complete duct system cleaning', 450.00, 'system', 'intermediate', 4, 12,
   '{"cleaning_method": "negative_pressure", "includes_sanitizing": true, "before_after_photos": true}'::jsonb),
  
  ('Dryer Vent Cleaning', 'Clean dryer vent from inside to outside', 125.00, 'service', 'basic', 1, 12,
   '{"includes_lint_removal": true, "fire_prevention": true, "airflow_test": true}'::jsonb),
  
  -- Testing & Balancing
  ('Duct Blaster Test', 'Test duct system for leakage', 350.00, 'test', 'advanced', 2, 0,
   '{"test_type": "pressurization", "includes_report": true, "identifies_leaks": true}'::jsonb),
  
  ('Air Balance Report', 'Measure and adjust airflow to all rooms', 450.00, 'system', 'expert', 4, 0,
   '{"includes_cfm_readings": true, "room_by_room_report": true, "damper_adjustment": true}'::jsonb)
  
) AS v(name, description, price, unit, skill_level, estimated_hours, warranty_months, attributes)
WHERE s.name = 'Ductwork Services'
ON CONFLICT (service_id, name, organization_id) DO NOTHING;

-- Indoor Air Quality Service Options
INSERT INTO service_options (
  service_id, name, description, price, unit, skill_level, 
  estimated_hours, warranty_months, is_template, attributes, organization_id
) 
SELECT 
  s.id,
  v.name,
  v.description,
  v.price,
  v.unit,
  v.skill_level,
  v.estimated_hours,
  v.warranty_months,
  true,
  v.attributes,
  NULL
FROM hvac_services s
CROSS JOIN (VALUES
  -- Air Quality Testing
  ('Indoor Air Quality Test', 'Comprehensive IAQ testing and report', 250.00, 'test', 'intermediate', 2, 0,
   '{"tests_included": ["voc", "co2", "humidity", "particulates"], "includes_recommendations": true}'::jsonb),
  
  ('Mold Test Kit', 'Professional mold testing with lab analysis', 350.00, 'test', 'intermediate', 1, 0,
   '{"test_type": "mold_spores", "lab_certified": true, "turnaround_days": 3}'::jsonb),
  
  ('Carbon Monoxide Test', 'Test all combustion appliances for CO', 125.00, 'test', 'intermediate', 1, 0,
   '{"test_type": "carbon_monoxide", "includes_detectors_check": true, "safety_priority": true}'::jsonb),
  
  -- Air Purification Systems
  ('UV Light Installation', 'Install UV germicidal light in HVAC', 650.00, 'unit', 'intermediate', 2, 24,
   '{"purification_type": "uv_light", "bulb_life_hours": 9000, "kills_percentage": 99.9, "targets": ["mold", "bacteria", "viruses"]}'::jsonb),
  
  ('HEPA Bypass System', 'Install hospital-grade HEPA filtration', 1850.00, 'system', 'advanced', 6, 60,
   '{"purification_type": "hepa", "merv_rating": 17, "captures_percentage": 99.97, "particle_size_microns": 0.3}'::jsonb),
  
  ('Electronic Air Cleaner', 'Install whole-house electronic air cleaner', 850.00, 'unit', 'intermediate', 3, 60,
   '{"purification_type": "electronic", "washable_cells": true, "efficiency_percentage": 97}'::jsonb),
  
  ('Media Air Cleaner', 'Install 5" media air cleaner cabinet', 450.00, 'unit', 'intermediate', 2, 60,
   '{"purification_type": "media_filter", "merv_rating": 13, "filter_life_months": 12}'::jsonb),
  
  -- Humidity Control
  ('Whole House Humidifier', 'Install bypass humidifier', 650.00, 'unit', 'intermediate', 3, 60,
   '{"humidity_type": "bypass", "capacity_gpd": 12, "coverage_sqft": 3000, "auto_control": true}'::jsonb),
  
  ('Steam Humidifier', 'Install steam humidifier system', 1250.00, 'unit', 'advanced', 4, 60,
   '{"humidity_type": "steam", "capacity_gpd": 18, "coverage_sqft": 4000, "auto_control": true}'::jsonb),
  
  ('Whole House Dehumidifier', 'Install ducted dehumidifier', 1450.00, 'unit', 'advanced', 4, 60,
   '{"dehumidifier_type": "whole_house", "capacity_ppd": 70, "coverage_sqft": 3000, "auto_drain": true}'::jsonb),
  
  -- Ventilation
  ('HRV Installation', 'Install heat recovery ventilator', 2250.00, 'unit', 'expert', 8, 120,
   '{"ventilation_type": "hrv", "efficiency_percentage": 70, "cfm": 150, "balanced": true}'::jsonb),
  
  ('ERV Installation', 'Install energy recovery ventilator', 2450.00, 'unit', 'expert', 8, 120,
   '{"ventilation_type": "erv", "efficiency_percentage": 80, "cfm": 150, "balanced": true, "transfers_humidity": true}'::jsonb),
  
  ('Fresh Air Intake', 'Add controlled fresh air to HVAC system', 450.00, 'unit', 'intermediate', 3, 60,
   '{"ventilation_type": "fresh_air", "motorized_damper": true, "filtered": true}'::jsonb)
  
) AS v(name, description, price, unit, skill_level, estimated_hours, warranty_months, attributes)
WHERE s.name = 'Indoor Air Quality'
ON CONFLICT (service_id, name, organization_id) DO NOTHING;

-- Return count of inserted records
SELECT COUNT(*) as total_hvac_options_added
FROM service_options so
JOIN services s ON so.service_id = s.id
JOIN industries i ON s.industry_id = i.id
WHERE i.name = 'HVAC'
AND so.organization_id IS NULL
AND so.attributes IS NOT NULL;