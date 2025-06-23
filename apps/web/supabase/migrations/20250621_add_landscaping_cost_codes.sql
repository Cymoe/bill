-- Landscaping Industry Cost Codes Migration
-- Comprehensive cost codes for landscaping contractors covering design, installation, and maintenance

-- Insert Landscaping Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'landscaping'),
  NULL
FROM (VALUES
  -- Design and Consultation (LS001-LS099)
  ('LS001', 'Landscape Design', 'Professional landscape design service', 'service', 'hour', 125.00),
  ('LS002', 'Site Analysis', 'Property evaluation and soil testing', 'service', 'ls', 450.00),
  ('LS003', '3D Design Rendering', 'Computer-generated landscape design', 'service', 'ls', 850.00),
  ('LS004', 'Consultation', 'On-site landscape consultation', 'service', 'hour', 95.00),
  ('LS005', 'Master Plan', 'Comprehensive landscape master plan', 'service', 'ls', 2500.00),
  ('LS006', 'Hardscape Design', 'Patio and walkway design', 'service', 'ls', 650.00),
  ('LS007', 'Irrigation Design', 'Sprinkler system design', 'service', 'zone', 185.00),
  ('LS008', 'Lighting Design', 'Landscape lighting plan', 'service', 'ls', 450.00),
  ('LS009', 'Plant Selection', 'Custom plant selection service', 'service', 'hour', 85.00),
  ('LS010', 'Permit Assistance', 'Permit application help', 'service', 'ls', 350.00),

  -- Labor Codes (LS100-LS199)
  ('LS100', 'Crew Leader', 'Landscape crew leader', 'labor', 'hour', 65.00),
  ('LS101', 'Landscaper', 'General landscaper', 'labor', 'hour', 45.00),
  ('LS102', 'Equipment Operator', 'Heavy equipment operator', 'labor', 'hour', 75.00),
  ('LS103', 'Irrigation Tech', 'Irrigation specialist', 'labor', 'hour', 65.00),
  ('LS104', 'Tree Climber', 'Certified tree climber', 'labor', 'hour', 85.00),
  ('LS105', 'Mason', 'Hardscape mason', 'labor', 'hour', 75.00),
  ('LS106', 'Horticulturist', 'Plant specialist', 'labor', 'hour', 70.00),
  ('LS107', 'Overtime Labor', 'Overtime hourly rate', 'labor', 'hour', 67.50),
  ('LS108', 'Weekend Labor', 'Weekend premium rate', 'labor', 'hour', 58.50),
  ('LS109', 'Helper', 'General helper', 'labor', 'hour', 35.00),

  -- Lawn Installation (LS200-LS249)
  ('LS200', 'Sod - Standard', 'Standard turf grass sod', 'material', 'sf', 0.65),
  ('LS201', 'Sod - Premium', 'Premium drought-tolerant sod', 'material', 'sf', 0.95),
  ('LS202', 'Sod Installation', 'Sod installation labor', 'labor', 'sf', 0.35),
  ('LS203', 'Seed - Sun', 'Full sun grass seed', 'material', 'lb', 8.50),
  ('LS204', 'Seed - Shade', 'Shade grass seed', 'material', 'lb', 12.00),
  ('LS205', 'Hydroseeding', 'Hydroseed application', 'service', 'sf', 0.18),
  ('LS206', 'Artificial Turf', 'Synthetic grass installation', 'material', 'sf', 8.50),
  ('LS207', 'Soil Amendment', 'Soil improvement additives', 'material', 'cy', 45.00),
  ('LS208', 'Starter Fertilizer', 'New lawn starter fertilizer', 'material', 'bag', 38.00),
  ('LS209', 'Erosion Control', 'Erosion control blanket', 'material', 'sf', 0.85),
  ('LS210', 'Lawn Edging', 'Steel lawn edging', 'material', 'lf', 4.50),

  -- Trees and Shrubs (LS250-LS299)
  ('LS250', 'Tree - Small', '1-2" caliper tree', 'material', 'ea', 285.00),
  ('LS251', 'Tree - Medium', '2-3" caliper tree', 'material', 'ea', 485.00),
  ('LS252', 'Tree - Large', '3-4" caliper tree', 'material', 'ea', 850.00),
  ('LS253', 'Tree Installation', 'Tree planting labor', 'labor', 'ea', 125.00),
  ('LS254', 'Shrub - Small', '1 gallon shrub', 'material', 'ea', 18.00),
  ('LS255', 'Shrub - Medium', '5 gallon shrub', 'material', 'ea', 45.00),
  ('LS256', 'Shrub - Large', '15 gallon shrub', 'material', 'ea', 125.00),
  ('LS257', 'Shrub Installation', 'Shrub planting labor', 'labor', 'ea', 35.00),
  ('LS258', 'Tree Stake Kit', 'Tree staking system', 'material', 'set', 65.00),
  ('LS259', 'Root Barrier', 'Root control barrier', 'material', 'lf', 12.00),
  ('LS260', 'Tree Warranty', '1-year tree warranty', 'service', 'ea', 85.00),

  -- Plants and Flowers (LS300-LS349)
  ('LS300', 'Perennials - 4"', '4" perennial plants', 'material', 'ea', 8.50),
  ('LS301', 'Perennials - 1 gal', '1 gallon perennials', 'material', 'ea', 14.00),
  ('LS302', 'Annuals - Flat', 'Annual flower flat', 'material', 'flat', 28.00),
  ('LS303', 'Ground Cover', 'Ground cover plants', 'material', 'flat', 85.00),
  ('LS304', 'Ornamental Grass', 'Decorative grasses', 'material', 'ea', 22.00),
  ('LS305', 'Bulbs - Spring', 'Spring flowering bulbs', 'material', 'ea', 1.25),
  ('LS306', 'Bulbs - Summer', 'Summer flowering bulbs', 'material', 'ea', 2.50),
  ('LS307', 'Plant Installation', 'Planting labor per plant', 'labor', 'ea', 12.00),
  ('LS308', 'Flower Bed Prep', 'Bed preparation', 'labor', 'sf', 2.50),
  ('LS309', 'Native Plants', 'Native species plants', 'material', 'ea', 18.00),

  -- Mulch and Ground Cover (LS350-LS399)
  ('LS350', 'Mulch - Hardwood', 'Shredded hardwood mulch', 'material', 'cy', 38.00),
  ('LS351', 'Mulch - Cedar', 'Cedar mulch', 'material', 'cy', 48.00),
  ('LS352', 'Mulch - Pine Bark', 'Pine bark mulch', 'material', 'cy', 35.00),
  ('LS353', 'Mulch - Rubber', 'Recycled rubber mulch', 'material', 'cy', 85.00),
  ('LS354', 'Rock - Pea Gravel', 'Pea gravel', 'material', 'ton', 45.00),
  ('LS355', 'Rock - River Rock', 'Decorative river rock', 'material', 'ton', 85.00),
  ('LS356', 'Rock - Lava Rock', 'Lava rock', 'material', 'cy', 125.00),
  ('LS357', 'Rock - Decomposed Granite', 'DG pathway material', 'material', 'ton', 38.00),
  ('LS358', 'Mulch Installation', 'Mulch spreading labor', 'labor', 'cy', 45.00),
  ('LS359', 'Landscape Fabric', 'Weed barrier fabric', 'material', 'sf', 0.35),
  ('LS360', 'Edging - Plastic', 'Plastic bed edging', 'material', 'lf', 2.50),
  ('LS361', 'Edging - Metal', 'Metal bed edging', 'material', 'lf', 6.50),

  -- Hardscaping (LS400-LS449)
  ('LS400', 'Paver - Basic', 'Concrete pavers', 'material', 'sf', 3.50),
  ('LS401', 'Paver - Premium', 'Natural stone pavers', 'material', 'sf', 8.50),
  ('LS402', 'Paver Installation', 'Paver installation labor', 'labor', 'sf', 8.50),
  ('LS403', 'Retaining Wall Block', 'Segmental wall blocks', 'material', 'sf', 12.00),
  ('LS404', 'Wall Installation', 'Retaining wall labor', 'labor', 'sf', 18.00),
  ('LS405', 'Flagstone', 'Natural flagstone', 'material', 'sf', 6.50),
  ('LS406', 'Gravel - Base', 'Compacted base gravel', 'material', 'ton', 32.00),
  ('LS407', 'Sand - Bedding', 'Paver bedding sand', 'material', 'ton', 35.00),
  ('LS408', 'Concrete Work', 'Decorative concrete', 'subcontractor', 'sf', 12.00),
  ('LS409', 'Steps - Natural', 'Natural stone steps', 'material', 'lf', 125.00),
  ('LS410', 'Patio Construction', 'Complete patio install', 'labor', 'sf', 15.00),

  -- Irrigation Systems (LS450-LS499)
  ('LS450', 'Sprinkler Head - Popup', 'Pop-up spray head', 'material', 'ea', 18.00),
  ('LS451', 'Sprinkler Head - Rotor', 'Rotor sprinkler head', 'material', 'ea', 35.00),
  ('LS452', 'Drip Irrigation', 'Drip line installation', 'material', 'lf', 1.85),
  ('LS453', 'Controller - Basic', 'Basic irrigation timer', 'material', 'ea', 185.00),
  ('LS454', 'Controller - Smart', 'WiFi smart controller', 'material', 'ea', 385.00),
  ('LS455', 'Valve', 'Irrigation control valve', 'material', 'ea', 85.00),
  ('LS456', 'Backflow Preventer', 'RPZ backflow device', 'material', 'ea', 485.00),
  ('LS457', 'Pipe - PVC', 'Schedule 40 PVC pipe', 'material', 'lf', 2.85),
  ('LS458', 'Irrigation Install', 'Complete system install', 'labor', 'zone', 650.00),
  ('LS459', 'System Winterization', 'Sprinkler winterization', 'service', 'ls', 125.00),
  ('LS460', 'Spring Startup', 'System activation', 'service', 'ls', 95.00),

  -- Landscape Lighting (LS500-LS549)
  ('LS500', 'Path Light', 'LED path light fixture', 'material', 'ea', 125.00),
  ('LS501', 'Spot Light', 'LED landscape spotlight', 'material', 'ea', 95.00),
  ('LS502', 'Well Light', 'In-ground well light', 'material', 'ea', 165.00),
  ('LS503', 'Deck Light', 'Deck/step light', 'material', 'ea', 65.00),
  ('LS504', 'Transformer', 'Low voltage transformer', 'material', 'ea', 285.00),
  ('LS505', 'Wire - 12ga', '12 gauge landscape wire', 'material', 'lf', 1.85),
  ('LS506', 'Wire - 10ga', '10 gauge landscape wire', 'material', 'lf', 2.50),
  ('LS507', 'Light Installation', 'Lighting installation labor', 'labor', 'fixture', 85.00),
  ('LS508', 'Timer/Photocell', 'Automatic controls', 'material', 'ea', 65.00),
  ('LS509', 'Lighting Design', 'Professional lighting design', 'service', 'ls', 450.00),

  -- Water Features (LS550-LS599)
  ('LS550', 'Pond Liner', 'EPDM pond liner', 'material', 'sf', 1.85),
  ('LS551', 'Pond Pump', 'Submersible pond pump', 'material', 'ea', 285.00),
  ('LS552', 'Waterfall Kit', 'Pondless waterfall kit', 'material', 'set', 1850.00),
  ('LS553', 'Fountain', 'Decorative fountain', 'material', 'ea', 850.00),
  ('LS554', 'Pond Installation', 'Complete pond install', 'labor', 'sf', 35.00),
  ('LS555', 'Stream Construction', 'Natural stream install', 'labor', 'lf', 125.00),
  ('LS556', 'Pond Plants', 'Aquatic plants', 'material', 'ea', 22.00),
  ('LS557', 'Pond Filter', 'Biological filter system', 'material', 'ea', 485.00),
  ('LS558', 'Pond Lighting', 'Underwater LED lights', 'material', 'ea', 185.00),

  -- Maintenance Services (LS600-LS699)
  ('LS600', 'Lawn Mowing', 'Weekly mowing service', 'service', 'visit', 45.00),
  ('LS601', 'Edging & Trimming', 'Edge and trim service', 'service', 'visit', 25.00),
  ('LS602', 'Leaf Removal', 'Fall leaf cleanup', 'service', 'hour', 65.00),
  ('LS603', 'Spring Cleanup', 'Spring yard cleanup', 'service', 'ls', 385.00),
  ('LS604', 'Fall Cleanup', 'Fall yard cleanup', 'service', 'ls', 425.00),
  ('LS605', 'Fertilization', 'Lawn fertilizer application', 'service', 'app', 85.00),
  ('LS606', 'Weed Control', 'Pre/post emergent application', 'service', 'app', 95.00),
  ('LS607', 'Aeration', 'Core aeration service', 'service', 'ksf', 85.00),
  ('LS608', 'Overseeding', 'Lawn overseeding', 'service', 'ksf', 125.00),
  ('LS609', 'Dethatching', 'Power rake dethatching', 'service', 'ksf', 95.00),
  ('LS610', 'Tree Trimming', 'Tree pruning service', 'labor', 'hour', 125.00),
  ('LS611', 'Shrub Pruning', 'Shrub trimming service', 'labor', 'hour', 65.00),
  ('LS612', 'Mulch Refresh', 'Annual mulch top-up', 'service', 'cy', 65.00),
  ('LS613', 'Pest Control', 'Landscape pest treatment', 'service', 'app', 125.00),
  ('LS614', 'Disease Treatment', 'Plant disease treatment', 'service', 'app', 145.00),

  -- Equipment Rental (LS700-LS749)
  ('LS700', 'Skid Steer', 'Skid steer loader rental', 'equipment', 'day', 385.00),
  ('LS701', 'Mini Excavator', 'Mini excavator rental', 'equipment', 'day', 425.00),
  ('LS702', 'Dump Truck', 'Dump truck rental', 'equipment', 'day', 485.00),
  ('LS703', 'Sod Cutter', 'Sod cutter rental', 'equipment', 'day', 125.00),
  ('LS704', 'Aerator', 'Core aerator rental', 'equipment', 'day', 185.00),
  ('LS705', 'Tiller', 'Rototiller rental', 'equipment', 'day', 85.00),
  ('LS706', 'Trencher', 'Trenching machine rental', 'equipment', 'day', 225.00),
  ('LS707', 'Stump Grinder', 'Stump grinder rental', 'equipment', 'day', 285.00),
  ('LS708', 'Chipper', 'Wood chipper rental', 'equipment', 'day', 325.00),
  ('LS709', 'Compactor', 'Plate compactor rental', 'equipment', 'day', 85.00),

  -- Specialty Services (LS750-LS799)
  ('LS750', 'Mosquito Control', 'Mosquito treatment system', 'service', 'month', 85.00),
  ('LS751', 'Outdoor Kitchen', 'Outdoor kitchen construction', 'subcontractor', 'ls', 8500.00),
  ('LS752', 'Fire Pit', 'Fire pit installation', 'material', 'ea', 1850.00),
  ('LS753', 'Pergola', 'Pergola construction', 'subcontractor', 'sf', 45.00),
  ('LS754', 'Fence Installation', 'Privacy fence install', 'subcontractor', 'lf', 35.00),
  ('LS755', 'Drainage Solution', 'French drain system', 'labor', 'lf', 45.00),
  ('LS756', 'Rain Garden', 'Rain garden installation', 'labor', 'sf', 12.00),
  ('LS757', 'Synthetic Putting Green', 'Artificial putting green', 'material', 'sf', 18.00),
  ('LS758', 'Bocce Court', 'Bocce ball court install', 'subcontractor', 'ls', 4500.00),

  -- Commercial Services (LS800-LS849)
  ('LS800', 'Commercial Mowing', 'Large area mowing', 'service', 'acre', 125.00),
  ('LS801', 'Athletic Field Maint', 'Sports field maintenance', 'service', 'visit', 850.00),
  ('LS802', 'Snow Removal', 'Snow plowing service', 'service', 'hour', 185.00),
  ('LS803', 'Salt Application', 'Ice melt application', 'service', 'bag', 28.00),
  ('LS804', 'HOA Contract', 'HOA maintenance contract', 'service', 'month', 2850.00),
  ('LS805', 'Commercial Install', 'Large scale installation', 'labor', 'sf', 3.50),

  -- Soil and Materials (LS850-LS899)
  ('LS850', 'Topsoil - Screened', 'Premium screened topsoil', 'material', 'cy', 38.00),
  ('LS851', 'Topsoil - Bulk', 'Bulk topsoil', 'material', 'cy', 28.00),
  ('LS852', 'Compost', 'Organic compost', 'material', 'cy', 45.00),
  ('LS853', 'Sand - Fill', 'Fill sand', 'material', 'ton', 25.00),
  ('LS854', 'Peat Moss', 'Sphagnum peat moss', 'material', 'bale', 12.00),
  ('LS855', 'Lime', 'Pelletized lime', 'material', 'bag', 8.50),
  ('LS856', 'Gypsum', 'Soil conditioner', 'material', 'bag', 12.00),

  -- Miscellaneous (LS900-LS999)
  ('LS900', 'Delivery Fee', 'Material delivery charge', 'service', 'ls', 125.00),
  ('LS901', 'Dump Fee', 'Debris disposal fee', 'service', 'ton', 85.00),
  ('LS902', 'Consultation Fee', 'Professional consultation', 'service', 'hour', 125.00),
  ('LS903', 'Travel Charge', 'Out of area travel', 'service', 'mile', 1.50),
  ('LS904', 'Emergency Service', 'Emergency response fee', 'service', 'ls', 285.00),
  ('LS905', 'Warranty - Annual', 'Annual plant warranty', 'service', 'year', 15.00),
  ('LS906', 'Project Management', 'Large project coordination', 'service', 'hour', 95.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_landscaping ON cost_codes(code) WHERE code LIKE 'LS%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for the landscaping industry including design, installation, maintenance, and specialty services';