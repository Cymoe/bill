-- Appliance Repair Cost Codes Migration
-- Comprehensive cost codes for appliance repair contractors

-- Insert Appliance Repair Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'appliance-repair'),
  NULL
FROM (VALUES
  -- Service Calls and Diagnostics (AR001-AR099)
  ('AR001', 'Service Call', 'Standard service call fee', 'service', 'ls', 95.00),
  ('AR002', 'Diagnostic Fee', 'Appliance diagnosis charge', 'service', 'ea', 125.00),
  ('AR003', 'Emergency Service', 'Same-day emergency call', 'service', 'ls', 185.00),
  ('AR004', 'Weekend Service', 'Weekend service premium', 'service', 'ls', 145.00),
  ('AR005', 'Holiday Service', 'Holiday service call', 'service', 'ls', 225.00),
  ('AR006', 'Second Opinion', 'Second diagnostic evaluation', 'service', 'ea', 85.00),
  ('AR007', 'Annual Maintenance', 'Preventive maintenance contract', 'service', 'year', 285.00),
  ('AR008', 'Multi-Unit Discount', 'Multiple appliance discount', 'service', 'ea', -25.00),
  ('AR009', 'Travel Charge', 'Extended area travel fee', 'service', 'mile', 1.50),
  ('AR010', 'No-Show Fee', 'Missed appointment charge', 'service', 'ls', 65.00),

  -- Labor Rates (AR100-AR199)
  ('AR100', 'Master Technician', 'Expert technician rate', 'labor', 'hour', 125.00),
  ('AR101', 'Technician', 'Standard technician rate', 'labor', 'hour', 95.00),
  ('AR102', 'Apprentice', 'Apprentice technician rate', 'labor', 'hour', 65.00),
  ('AR103', 'Installation Labor', 'New appliance installation', 'labor', 'hour', 85.00),
  ('AR104', 'Removal Labor', 'Old appliance removal', 'labor', 'ea', 85.00),
  ('AR105', 'Rush Labor', 'Emergency repair premium', 'labor', 'hour', 145.00),

  -- Refrigerator Repairs (AR200-AR249)
  ('AR200', 'Compressor Replace', 'Refrigerator compressor replacement', 'subcontractor', 'ea', 685.00),
  ('AR201', 'Evaporator Fan', 'Evaporator fan motor replace', 'material', 'ea', 185.00),
  ('AR202', 'Condenser Fan', 'Condenser fan motor replace', 'material', 'ea', 165.00),
  ('AR203', 'Thermostat', 'Temperature control thermostat', 'material', 'ea', 125.00),
  ('AR204', 'Door Seal', 'Refrigerator door gasket', 'material', 'ea', 125.00),
  ('AR205', 'Ice Maker Repair', 'Ice maker mechanism repair', 'labor', 'ea', 185.00),
  ('AR206', 'Ice Maker Replace', 'Complete ice maker replacement', 'material', 'ea', 285.00),
  ('AR207', 'Water Filter', 'Water filter replacement', 'material', 'ea', 45.00),
  ('AR208', 'Water Valve', 'Water inlet valve replace', 'material', 'ea', 125.00),
  ('AR209', 'Defrost Timer', 'Defrost timer replacement', 'material', 'ea', 145.00),
  ('AR210', 'Defrost Heater', 'Defrost heating element', 'material', 'ea', 165.00),
  ('AR211', 'Control Board', 'Electronic control board', 'material', 'ea', 385.00),
  ('AR212', 'Relay/Overload', 'Start relay and overload', 'material', 'ea', 85.00),
  ('AR213', 'Light Assembly', 'Interior light replacement', 'material', 'ea', 65.00),
  ('AR214', 'Shelf Support', 'Shelf brackets and clips', 'material', 'set', 45.00),
  ('AR215', 'Drawer Slide', 'Crisper drawer slides', 'material', 'pr', 65.00),
  ('AR216', 'Freon Recharge', 'Refrigerant recharge service', 'service', 'lb', 125.00),
  ('AR217', 'Leak Repair', 'Refrigerant leak repair', 'labor', 'hour', 145.00),
  ('AR218', 'Coil Cleaning', 'Condenser coil cleaning', 'service', 'ea', 125.00),

  -- Washer Repairs (AR250-AR299)
  ('AR250', 'Pump Replace', 'Washer pump replacement', 'material', 'ea', 185.00),
  ('AR251', 'Motor Replace', 'Drive motor replacement', 'material', 'ea', 385.00),
  ('AR252', 'Belt Replace', 'Drive belt replacement', 'material', 'ea', 65.00),
  ('AR253', 'Timer Replace', 'Mechanical timer replace', 'material', 'ea', 225.00),
  ('AR254', 'Control Board', 'Electronic control board', 'material', 'ea', 325.00),
  ('AR255', 'Water Valve', 'Water inlet valve set', 'material', 'ea', 125.00),
  ('AR256', 'Door Lock', 'Door lock mechanism', 'material', 'ea', 145.00),
  ('AR257', 'Door Seal', 'Door boot seal (front load)', 'material', 'ea', 185.00),
  ('AR258', 'Suspension Rod', 'Suspension rod kit', 'material', 'set', 125.00),
  ('AR259', 'Shock Absorber', 'Shock absorber set', 'material', 'set', 145.00),
  ('AR260', 'Clutch Assembly', 'Clutch and brake assembly', 'material', 'ea', 225.00),
  ('AR261', 'Transmission', 'Washer transmission replace', 'material', 'ea', 485.00),
  ('AR262', 'Pressure Switch', 'Water level pressure switch', 'material', 'ea', 85.00),
  ('AR263', 'Lid Switch', 'Lid switch assembly', 'material', 'ea', 65.00),
  ('AR264', 'Agitator Repair', 'Agitator dogs or cam', 'material', 'ea', 45.00),
  ('AR265', 'Tub Bearing', 'Tub bearing replacement', 'labor', 'ea', 385.00),
  ('AR266', 'Tub Seal', 'Tub seal replacement', 'material', 'ea', 125.00),
  ('AR267', 'Leveling Legs', 'Adjustable leg set', 'material', 'set', 45.00),

  -- Dryer Repairs (AR300-AR349)
  ('AR300', 'Heating Element', 'Electric heating element', 'material', 'ea', 185.00),
  ('AR301', 'Gas Valve', 'Gas valve assembly', 'material', 'ea', 285.00),
  ('AR302', 'Igniter', 'Gas dryer igniter', 'material', 'ea', 125.00),
  ('AR303', 'Thermal Fuse', 'Thermal fuse replacement', 'material', 'ea', 45.00),
  ('AR304', 'Timer Replace', 'Mechanical timer', 'material', 'ea', 225.00),
  ('AR305', 'Control Board', 'Electronic control board', 'material', 'ea', 285.00),
  ('AR306', 'Belt Replace', 'Drum drive belt', 'material', 'ea', 45.00),
  ('AR307', 'Drum Roller', 'Drum roller set', 'material', 'set', 65.00),
  ('AR308', 'Idler Pulley', 'Belt idler pulley', 'material', 'ea', 85.00),
  ('AR309', 'Door Seal', 'Door seal replacement', 'material', 'ea', 65.00),
  ('AR310', 'Door Latch', 'Door latch assembly', 'material', 'ea', 45.00),
  ('AR311', 'Lint Filter', 'Lint filter housing', 'material', 'ea', 85.00),
  ('AR312', 'Blower Wheel', 'Blower wheel and housing', 'material', 'ea', 125.00),
  ('AR313', 'Motor Replace', 'Drive motor replacement', 'material', 'ea', 285.00),
  ('AR314', 'Vent Cleaning', 'Dryer vent cleaning service', 'service', 'ea', 145.00),
  ('AR315', 'Moisture Sensor', 'Moisture sensor bars', 'material', 'set', 65.00),
  ('AR316', 'Thermostat Set', 'Cycling thermostat set', 'material', 'set', 125.00),

  -- Dishwasher Repairs (AR350-AR399)
  ('AR350', 'Pump Motor', 'Wash pump motor assembly', 'material', 'ea', 285.00),
  ('AR351', 'Control Board', 'Electronic control board', 'material', 'ea', 325.00),
  ('AR352', 'Door Latch', 'Door latch assembly', 'material', 'ea', 125.00),
  ('AR353', 'Door Seal', 'Door seal/gasket', 'material', 'ea', 85.00),
  ('AR354', 'Spray Arm', 'Upper/lower spray arm', 'material', 'ea', 65.00),
  ('AR355', 'Water Valve', 'Water inlet valve', 'material', 'ea', 125.00),
  ('AR356', 'Float Switch', 'Water level float switch', 'material', 'ea', 45.00),
  ('AR357', 'Heating Element', 'Water heating element', 'material', 'ea', 145.00),
  ('AR358', 'Detergent Dispenser', 'Soap dispenser assembly', 'material', 'ea', 85.00),
  ('AR359', 'Rack Repair', 'Dish rack repair kit', 'material', 'kit', 35.00),
  ('AR360', 'Rack Roller', 'Rack roller/wheel set', 'material', 'set', 45.00),
  ('AR361', 'Wash Arm Support', 'Wash arm mount/hub', 'material', 'ea', 65.00),
  ('AR362', 'Drain Hose', 'Drain hose replacement', 'material', 'ea', 45.00),
  ('AR363', 'Door Spring', 'Door balance spring', 'material', 'pr', 65.00),
  ('AR364', 'Silverware Basket', 'Cutlery basket', 'material', 'ea', 35.00),
  ('AR365', 'Filter Clean', 'Filter cleaning service', 'service', 'ea', 85.00),

  -- Range/Oven Repairs (AR400-AR449)
  ('AR400', 'Bake Element', 'Electric bake element', 'material', 'ea', 125.00),
  ('AR401', 'Broil Element', 'Electric broil element', 'material', 'ea', 145.00),
  ('AR402', 'Surface Element', 'Cooktop burner element', 'material', 'ea', 85.00),
  ('AR403', 'Infinite Switch', 'Burner control switch', 'material', 'ea', 65.00),
  ('AR404', 'Oven Thermostat', 'Oven temperature control', 'material', 'ea', 185.00),
  ('AR405', 'Control Board', 'Electronic oven control', 'material', 'ea', 385.00),
  ('AR406', 'Clock Timer', 'Mechanical clock timer', 'material', 'ea', 225.00),
  ('AR407', 'Door Seal', 'Oven door gasket', 'material', 'ea', 85.00),
  ('AR408', 'Door Hinge', 'Oven door hinge set', 'material', 'set', 125.00),
  ('AR409', 'Door Glass', 'Oven door glass panel', 'material', 'ea', 185.00),
  ('AR410', 'Igniter - Oven', 'Gas oven igniter', 'material', 'ea', 145.00),
  ('AR411', 'Igniter - Surface', 'Cooktop spark igniter', 'material', 'ea', 85.00),
  ('AR412', 'Gas Valve', 'Gas control valve', 'material', 'ea', 285.00),
  ('AR413', 'Burner Cap/Base', 'Gas burner assembly', 'material', 'ea', 65.00),
  ('AR414', 'Knob Replace', 'Control knob set', 'material', 'set', 45.00),
  ('AR415', 'Light Assembly', 'Oven light and cover', 'material', 'ea', 65.00),
  ('AR416', 'Convection Fan', 'Convection fan motor', 'material', 'ea', 185.00),
  ('AR417', 'Self-Clean Lock', 'Self-clean door lock', 'material', 'ea', 145.00),

  -- Microwave Repairs (AR450-AR499)
  ('AR450', 'Magnetron', 'Microwave magnetron tube', 'material', 'ea', 185.00),
  ('AR451', 'Diode', 'High voltage diode', 'material', 'ea', 45.00),
  ('AR452', 'Capacitor', 'High voltage capacitor', 'material', 'ea', 65.00),
  ('AR453', 'Transformer', 'High voltage transformer', 'material', 'ea', 225.00),
  ('AR454', 'Door Switch', 'Interlock switch set', 'material', 'set', 85.00),
  ('AR455', 'Control Board', 'Electronic control board', 'material', 'ea', 285.00),
  ('AR456', 'Turntable Motor', 'Turntable motor assembly', 'material', 'ea', 85.00),
  ('AR457', 'Roller Guide', 'Turntable roller guide', 'material', 'ea', 25.00),
  ('AR458', 'Glass Tray', 'Turntable glass plate', 'material', 'ea', 65.00),
  ('AR459', 'Door Handle', 'Door handle assembly', 'material', 'ea', 85.00),
  ('AR460', 'Light Bulb', 'Interior light bulb', 'material', 'ea', 15.00),
  ('AR461', 'Charcoal Filter', 'Odor charcoal filter', 'material', 'ea', 35.00),
  ('AR462', 'Grease Filter', 'Grease filter screen', 'material', 'ea', 25.00),
  ('AR463', 'Fan Motor', 'Exhaust fan motor', 'material', 'ea', 145.00),
  ('AR464', 'Waveguide Cover', 'Waveguide cover replacement', 'material', 'ea', 25.00),

  -- Small Appliance Repairs (AR500-AR549)
  ('AR500', 'Garbage Disposal', 'Disposal repair service', 'labor', 'ea', 125.00),
  ('AR501', 'Disposal Replace', 'New disposal installation', 'material', 'ea', 285.00),
  ('AR502', 'Ice Maker - Standalone', 'Standalone ice maker repair', 'labor', 'hour', 95.00),
  ('AR503', 'Wine Cooler', 'Wine refrigerator repair', 'labor', 'hour', 125.00),
  ('AR504', 'Trash Compactor', 'Trash compactor repair', 'labor', 'hour', 95.00),
  ('AR505', 'Water Cooler', 'Water dispenser repair', 'labor', 'hour', 85.00),
  ('AR506', 'Coffee Maker', 'Built-in coffee maker', 'labor', 'hour', 125.00),
  ('AR507', 'Vacuum Central', 'Central vacuum repair', 'labor', 'hour', 95.00),

  -- Commercial Appliances (AR550-AR599)
  ('AR550', 'Commercial Diagnostic', 'Commercial unit diagnosis', 'service', 'ea', 185.00),
  ('AR551', 'Commercial Labor', 'Commercial repair rate', 'labor', 'hour', 145.00),
  ('AR552', 'Warranty Service', 'Warranty repair labor', 'labor', 'hour', 85.00),
  ('AR553', 'Preventive Service', 'Scheduled maintenance', 'service', 'unit', 185.00),
  ('AR554', 'Emergency Commercial', '24/7 commercial service', 'service', 'hour', 225.00),

  -- Parts and Supplies (AR600-AR649)
  ('AR600', 'Service Valve', 'Water shutoff valve', 'material', 'ea', 45.00),
  ('AR601', 'Supply Hose', 'Water supply hose set', 'material', 'pr', 35.00),
  ('AR602', 'Drain Hose', 'Appliance drain hose', 'material', 'ea', 45.00),
  ('AR603', 'Power Cord', 'Appliance power cord', 'material', 'ea', 45.00),
  ('AR604', 'Gas Connector', 'Flexible gas connector', 'material', 'ea', 65.00),
  ('AR605', 'Leveling Leg', 'Adjustable leveling legs', 'material', 'ea', 25.00),
  ('AR606', 'Anti-Vibration Pad', 'Vibration dampening pads', 'material', 'set', 35.00),
  ('AR607', 'Appliance Paint', 'Touch-up paint', 'material', 'bottle', 25.00),
  ('AR608', 'Cleaner/Degreaser', 'Appliance cleaner', 'material', 'bottle', 15.00),
  ('AR609', 'Stainless Polish', 'Stainless steel polish', 'material', 'bottle', 18.00),

  -- Installation Services (AR650-AR699)
  ('AR650', 'Dishwasher Install', 'New dishwasher installation', 'labor', 'ea', 285.00),
  ('AR651', 'Range Install', 'Range/oven installation', 'labor', 'ea', 185.00),
  ('AR652', 'Refrigerator Install', 'Refrigerator installation', 'labor', 'ea', 185.00),
  ('AR653', 'Washer Install', 'Washing machine install', 'labor', 'ea', 125.00),
  ('AR654', 'Dryer Install', 'Dryer installation', 'labor', 'ea', 125.00),
  ('AR655', 'Microwave OTR Install', 'Over-range microwave', 'labor', 'ea', 285.00),
  ('AR656', 'Gas Line Hook-up', 'Gas appliance connection', 'labor', 'ea', 185.00),
  ('AR657', 'Electrical Hook-up', '240V outlet installation', 'subcontractor', 'ea', 285.00),
  ('AR658', 'Water Line Install', 'Water line installation', 'labor', 'ea', 125.00),
  ('AR659', 'Haul Away', 'Old appliance removal', 'service', 'ea', 85.00),

  -- Maintenance Services (AR700-AR749)
  ('AR700', 'Refrigerator Maint', 'Annual fridge maintenance', 'service', 'ea', 125.00),
  ('AR701', 'Washer Maint', 'Washer maintenance service', 'service', 'ea', 95.00),
  ('AR702', 'Dryer Maint', 'Dryer maintenance service', 'service', 'ea', 95.00),
  ('AR703', 'Dishwasher Maint', 'Dishwasher maintenance', 'service', 'ea', 85.00),
  ('AR704', 'Range Maint', 'Range/oven maintenance', 'service', 'ea', 125.00),
  ('AR705', 'Bundle Maintenance', 'Multiple appliance bundle', 'service', 'ls', 285.00),

  -- Warranties and Plans (AR750-AR799)
  ('AR750', 'Extended Warranty', '1-year extended warranty', 'service', 'year', 285.00),
  ('AR751', 'Service Plan', 'Annual service plan', 'service', 'year', 485.00),
  ('AR752', 'Priority Service', 'Priority response plan', 'service', 'year', 185.00),
  ('AR753', 'Parts Coverage', 'Parts-only warranty', 'service', 'year', 185.00),

  -- Miscellaneous (AR900-AR999)
  ('AR900', 'Estimate Fee', 'Written estimate charge', 'service', 'ea', 85.00),
  ('AR901', 'Cancellation Fee', 'Late cancellation charge', 'service', 'ls', 65.00),
  ('AR902', 'Return Visit', 'Follow-up visit charge', 'service', 'ea', 45.00),
  ('AR903', 'Phone Support', 'Technical phone support', 'service', 'call', 35.00),
  ('AR904', 'Disposal Fee', 'Appliance disposal fee', 'service', 'ea', 45.00),
  ('AR905', 'Recycling Fee', 'Appliance recycling charge', 'service', 'ea', 35.00),
  ('AR906', 'Mileage Charge', 'Extended area mileage', 'service', 'mile', 1.25)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_appliance ON cost_codes(code) WHERE code LIKE 'AR%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for appliance repair including all major appliances and common repairs';