-- Solar Industry Cost Codes Migration
-- Comprehensive cost codes for solar installation contractors covering residential and commercial systems

-- Insert Solar Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'solar'),
  NULL
FROM (VALUES
  -- Consultation and Design (SL001-SL099)
  ('SL001', 'Site Assessment', 'Solar site evaluation and shading analysis', 'service', 'ls', 0.00),
  ('SL002', 'Energy Audit', 'Home energy consumption analysis', 'service', 'ls', 350.00),
  ('SL003', 'System Design', 'Custom solar system design', 'service', 'kw', 150.00),
  ('SL004', 'Permit Package', 'Permit drawings and applications', 'service', 'ls', 850.00),
  ('SL005', 'Structural Analysis', 'Roof structural engineering review', 'service', 'ls', 650.00),
  ('SL006', 'Interconnection App', 'Utility interconnection application', 'service', 'ls', 450.00),
  ('SL007', 'Financial Analysis', 'ROI and savings calculation', 'service', 'ls', 250.00),
  ('SL008', 'Shade Study', 'Annual shading analysis', 'service', 'ls', 350.00),
  ('SL009', 'Drone Survey', 'Aerial site survey', 'service', 'ls', 285.00),
  ('SL010', 'Load Calculation', 'Electrical load analysis', 'service', 'ls', 385.00),

  -- Labor Codes (SL100-SL199)
  ('SL100', 'Lead Installer', 'NABCEP certified lead', 'labor', 'hour', 85.00),
  ('SL101', 'Solar Installer', 'Solar installation technician', 'labor', 'hour', 55.00),
  ('SL102', 'Electrician', 'Licensed electrician', 'labor', 'hour', 95.00),
  ('SL103', 'Roofer', 'Roofing specialist', 'labor', 'hour', 65.00),
  ('SL104', 'Helper', 'Installation assistant', 'labor', 'hour', 35.00),
  ('SL105', 'Project Manager', 'Solar project management', 'labor', 'hour', 125.00),
  ('SL106', 'Commissioning Tech', 'System commissioning', 'labor', 'hour', 95.00),
  ('SL107', 'Panel Install Labor', 'Per panel installation', 'labor', 'panel', 85.00),
  ('SL108', 'Electrical Labor', 'DC/AC wiring labor', 'labor', 'hour', 95.00),
  ('SL109', 'Ground Mount Labor', 'Ground mount installation', 'labor', 'hour', 75.00),

  -- Solar Panels (SL200-SL249)
  ('SL200', 'Panel - 350W Mono', '350W monocrystalline panel', 'material', 'ea', 285.00),
  ('SL201', 'Panel - 400W Mono', '400W monocrystalline panel', 'material', 'ea', 325.00),
  ('SL202', 'Panel - 450W Mono', '450W high-efficiency panel', 'material', 'ea', 385.00),
  ('SL203', 'Panel - 500W Bifacial', '500W bifacial panel', 'material', 'ea', 485.00),
  ('SL204', 'Panel - 300W Poly', '300W polycrystalline panel', 'material', 'ea', 225.00),
  ('SL205', 'Panel - REC Alpha', 'REC Alpha Pure series', 'material', 'ea', 425.00),
  ('SL206', 'Panel - LG NeON', 'LG NeON premium panel', 'material', 'ea', 485.00),
  ('SL207', 'Panel - SunPower', 'SunPower Maxeon panel', 'material', 'ea', 525.00),
  ('SL208', 'Panel - Q CELLS', 'Q CELLS Q.PEAK panel', 'material', 'ea', 325.00),
  ('SL209', 'Panel - Canadian Solar', 'Canadian Solar HiKu panel', 'material', 'ea', 295.00),

  -- Inverters (SL250-SL299)
  ('SL250', 'String Inverter - 5kW', '5kW string inverter', 'material', 'ea', 1850.00),
  ('SL251', 'String Inverter - 7.6kW', '7.6kW string inverter', 'material', 'ea', 2450.00),
  ('SL252', 'String Inverter - 10kW', '10kW string inverter', 'material', 'ea', 3250.00),
  ('SL253', 'Microinverter - Enphase', 'Enphase IQ8+ microinverter', 'material', 'ea', 185.00),
  ('SL254', 'Microinverter - APsystems', 'APsystems DS3 microinverter', 'material', 'ea', 165.00),
  ('SL255', 'Power Optimizer', 'SolarEdge power optimizer', 'material', 'ea', 85.00),
  ('SL256', 'Inverter - SolarEdge', 'SolarEdge HD Wave inverter', 'material', 'ea', 2850.00),
  ('SL257', 'Inverter - Fronius', 'Fronius Primo inverter', 'material', 'ea', 2650.00),
  ('SL258', 'Inverter - SMA', 'SMA Sunny Boy inverter', 'material', 'ea', 2750.00),
  ('SL259', 'Rapid Shutdown', 'Rapid shutdown device', 'material', 'ea', 125.00),

  -- Racking and Mounting (SL300-SL349)
  ('SL300', 'Rail - Aluminum', 'Aluminum mounting rail', 'material', 'lf', 8.50),
  ('SL301', 'Rail - Steel', 'Galvanized steel rail', 'material', 'lf', 6.50),
  ('SL302', 'L-Foot Mount', 'Comp shingle L-foot', 'material', 'ea', 12.00),
  ('SL303', 'Tile Hook', 'Tile roof mounting hook', 'material', 'ea', 28.00),
  ('SL304', 'Standing Seam Clamp', 'Metal roof clamp', 'material', 'ea', 22.00),
  ('SL305', 'Flashing', 'Roof flashing kit', 'material', 'ea', 35.00),
  ('SL306', 'Ground Mount Rack', 'Ground mount racking', 'material', 'kw', 385.00),
  ('SL307', 'Pole Mount', 'Single pole mount system', 'material', 'ea', 1250.00),
  ('SL308', 'Ballast Block', 'Flat roof ballast block', 'material', 'ea', 18.00),
  ('SL309', 'End Clamp', 'Module end clamp', 'material', 'ea', 8.50),
  ('SL310', 'Mid Clamp', 'Module mid clamp', 'material', 'ea', 6.50),
  ('SL311', 'Grounding Lug', 'Equipment grounding lug', 'material', 'ea', 4.50),
  ('SL312', 'Wire Management', 'Wire clips and ties', 'material', 'panel', 3.50),

  -- Electrical Components (SL350-SL399)
  ('SL350', 'DC Wire - 10AWG', 'PV wire 10AWG', 'material', 'ft', 1.85),
  ('SL351', 'DC Wire - 12AWG', 'PV wire 12AWG', 'material', 'ft', 1.25),
  ('SL352', 'AC Wire - 10AWG', 'THWN-2 10AWG', 'material', 'ft', 2.85),
  ('SL353', 'AC Wire - 8AWG', 'THWN-2 8AWG', 'material', 'ft', 3.85),
  ('SL354', 'DC Combiner Box', 'DC string combiner', 'material', 'ea', 485.00),
  ('SL355', 'AC Combiner Panel', 'AC combiner panel', 'material', 'ea', 685.00),
  ('SL356', 'DC Disconnect', 'DC disconnect switch', 'material', 'ea', 285.00),
  ('SL357', 'AC Disconnect', 'AC disconnect switch', 'material', 'ea', 185.00),
  ('SL358', 'Breaker - 20A', '20A circuit breaker', 'material', 'ea', 45.00),
  ('SL359', 'Breaker - 30A', '30A circuit breaker', 'material', 'ea', 55.00),
  ('SL360', 'Breaker - 50A', '50A circuit breaker', 'material', 'ea', 85.00),
  ('SL361', 'MC4 Connector', 'MC4 connector pair', 'material', 'pair', 8.50),
  ('SL362', 'Ground Wire', '6AWG ground wire', 'material', 'ft', 2.25),
  ('SL363', 'EMT Conduit', '3/4" EMT conduit', 'material', 'ft', 3.85),
  ('SL364', 'PVC Conduit', 'Schedule 40 PVC', 'material', 'ft', 2.85),
  ('SL365', 'Monitoring Gateway', 'System monitoring device', 'material', 'ea', 385.00),

  -- Battery Storage (SL400-SL449)
  ('SL400', 'Tesla Powerwall', 'Tesla Powerwall 2', 'material', 'ea', 11500.00),
  ('SL401', 'Enphase Battery', 'Enphase IQ Battery 10', 'material', 'ea', 8500.00),
  ('SL402', 'LG Chem Battery', 'LG Chem RESU battery', 'material', 'ea', 9500.00),
  ('SL403', 'Generac PWRcell', 'Generac PWRcell system', 'material', 'ea', 10500.00),
  ('SL404', 'Battery Inverter', 'Battery backup inverter', 'material', 'ea', 3850.00),
  ('SL405', 'Battery Rack', 'Battery mounting rack', 'material', 'ea', 485.00),
  ('SL406', 'Battery Wiring', 'Battery cable set', 'material', 'set', 285.00),
  ('SL407', 'Battery Monitor', 'Battery monitoring system', 'material', 'ea', 385.00),
  ('SL408', 'Transfer Switch', 'Automatic transfer switch', 'material', 'ea', 1850.00),
  ('SL409', 'Critical Load Panel', 'Backup load center', 'material', 'ea', 685.00),

  -- Commercial Components (SL450-SL499)
  ('SL450', 'Central Inverter', '50kW central inverter', 'material', 'ea', 18500.00),
  ('SL451', 'Transformer', 'Step-up transformer', 'material', 'ea', 8500.00),
  ('SL452', 'Data Logger', 'Commercial monitoring', 'material', 'ea', 2850.00),
  ('SL453', 'Weather Station', 'Irradiance sensor kit', 'material', 'ea', 1850.00),
  ('SL454', 'Carport Structure', 'Solar carport structure', 'material', 'kw', 1250.00),
  ('SL455', 'Tracker System', 'Single-axis tracker', 'material', 'kw', 450.00),
  ('SL456', 'Security Fence', 'Ground mount fencing', 'material', 'lf', 35.00),
  ('SL457', 'Concrete Footing', 'Ground mount foundation', 'material', 'ea', 385.00),
  ('SL458', 'Grounding Grid', 'Commercial grounding', 'material', 'ls', 2850.00),

  -- Equipment and Tools (SL500-SL549)
  ('SL500', 'Torque Wrench', 'Digital torque wrench', 'equipment', 'ea', 285.00),
  ('SL501', 'MC4 Tool', 'MC4 crimping tool', 'equipment', 'ea', 125.00),
  ('SL502', 'Digital Multimeter', 'Fluke multimeter', 'equipment', 'ea', 485.00),
  ('SL503', 'Insulation Tester', 'Megger tester', 'equipment', 'ea', 1850.00),
  ('SL504', 'IV Curve Tracer', 'Performance tester', 'equipment', 'ea', 8500.00),
  ('SL505', 'Thermal Camera', 'FLIR thermal imager', 'equipment', 'ea', 2850.00),
  ('SL506', 'Safety Harness', 'Fall protection kit', 'equipment', 'ea', 385.00),
  ('SL507', 'Rope & Rigging', 'Lifting equipment', 'equipment', 'set', 685.00),
  ('SL508', 'Panel Cart', 'Module transport cart', 'equipment', 'ea', 485.00),

  -- Services and Maintenance (SL600-SL699)
  ('SL600', 'System Commissioning', 'Initial system startup', 'service', 'kw', 125.00),
  ('SL601', 'Performance Test', 'System performance verification', 'service', 'ls', 650.00),
  ('SL602', 'Panel Cleaning', 'Module cleaning service', 'service', 'panel', 8.50),
  ('SL603', 'Annual Inspection', 'Yearly system inspection', 'service', 'kw', 85.00),
  ('SL604', 'Monitoring Setup', 'Monitoring configuration', 'service', 'ls', 385.00),
  ('SL605', 'Warranty Registration', 'Warranty processing', 'service', 'ls', 185.00),
  ('SL606', 'Production Guarantee', 'Performance guarantee', 'service', 'year', 285.00),
  ('SL607', 'Snow Removal', 'Panel snow clearing', 'service', 'visit', 385.00),
  ('SL608', 'Inverter Service', 'Inverter maintenance', 'service', 'ea', 285.00),
  ('SL609', 'System Upgrade', 'System expansion service', 'service', 'kw', 885.00),
  ('SL610', 'Troubleshooting', 'Diagnostic service call', 'service', 'hour', 125.00),
  ('SL611', 'Arc Fault Testing', 'AFCI compliance test', 'service', 'ls', 450.00),
  ('SL612', 'Thermal Imaging', 'IR inspection service', 'service', 'ls', 650.00),

  -- Permits and Compliance (SL700-SL749)
  ('SL700', 'Building Permit', 'Local building permit', 'service', 'ls', 485.00),
  ('SL701', 'Electrical Permit', 'Electrical permit fee', 'service', 'ls', 385.00),
  ('SL702', 'Inspection Fee', 'AHJ inspection fee', 'service', 'ls', 285.00),
  ('SL703', 'PE Stamp', 'Engineering stamp', 'service', 'ls', 850.00),
  ('SL704', 'Interconnection Fee', 'Utility connection fee', 'service', 'ls', 350.00),
  ('SL705', 'Net Meter', 'Net metering application', 'service', 'ls', 185.00),
  ('SL706', 'HOA Approval', 'HOA application support', 'service', 'ls', 285.00),

  -- Incentive Processing (SL750-SL799)
  ('SL750', 'Rebate Processing', 'Utility rebate application', 'service', 'ls', 385.00),
  ('SL751', 'Tax Credit Docs', 'ITC documentation', 'service', 'ls', 285.00),
  ('SL752', 'SREC Registration', 'SREC program enrollment', 'service', 'ls', 485.00),
  ('SL753', 'Grant Application', 'Grant writing service', 'service', 'ls', 1250.00),
  ('SL754', 'Financing Package', 'Loan documentation', 'service', 'ls', 385.00),

  -- Additional Components (SL800-SL849)
  ('SL800', 'Squirrel Guard', 'Critter guard mesh', 'material', 'lf', 12.00),
  ('SL801', 'Bird Deterrent', 'Bird spike strips', 'material', 'lf', 8.50),
  ('SL802', 'Lightning Arrestor', 'Surge protection device', 'material', 'ea', 285.00),
  ('SL803', 'Label Kit', 'NEC compliant labels', 'material', 'set', 85.00),
  ('SL804', 'Placards', 'Safety placards', 'material', 'set', 125.00),
  ('SL805', 'Sealants', 'Roof sealant kit', 'material', 'kit', 65.00),
  ('SL806', 'Fasteners', 'Stainless hardware kit', 'material', 'kit', 185.00),

  -- EV Charging Integration (SL850-SL899)
  ('SL850', 'EV Charger Bundle', 'Solar + EV charger package', 'material', 'ea', 2850.00),
  ('SL851', 'Load Management', 'Smart load controller', 'material', 'ea', 685.00),
  ('SL852', 'DC Fast Charger', 'Commercial DC charger', 'material', 'ea', 45000.00),
  ('SL853', 'Charging Station', 'Level 2 charging station', 'material', 'ea', 1850.00),

  -- Miscellaneous (SL900-SL999)
  ('SL900', 'Delivery Fee', 'Equipment delivery', 'service', 'ls', 285.00),
  ('SL901', 'Crane Service', 'Crane for commercial', 'equipment', 'day', 1850.00),
  ('SL902', 'Waste Disposal', 'Packaging disposal', 'service', 'ls', 185.00),
  ('SL903', 'Training', 'Customer training session', 'service', 'hour', 125.00),
  ('SL904', 'Marketing Fee', 'Lead generation fee', 'service', 'ls', 485.00),
  ('SL905', 'Referral Fee', 'Customer referral bonus', 'service', 'ls', 500.00),
  ('SL906', 'Rush Service', 'Expedited installation', 'service', 'ls', 850.00),
  ('SL907', 'Remote Support', 'Technical support', 'service', 'hour', 95.00),
  ('SL908', 'Consultation', 'Additional consultation', 'service', 'hour', 125.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_solar ON cost_codes(code) WHERE code LIKE 'SL%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for the solar industry including panels, inverters, installation, and energy storage systems';