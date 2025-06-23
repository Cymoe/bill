-- Specialty Trades Cost Codes Migration
-- Implements a trade-centric cost code system for businesses that span construction and service

-- This migration adds cost codes for specialty trades using the XX.XX format:
-- 30-49: Specialty trades that often operate as standalone businesses
-- Within each trade range:
--   .00-.29: New installation/construction
--   .30-.59: Repairs and restoration  
--   .60-.79: Maintenance and service
--   .80-.99: Specialty/premium services

BEGIN;

-- PAINTING (30-32)
-- Professional painting services for residential and commercial
INSERT INTO cost_codes (code, name, description, category, unit, base_price) VALUES
-- New Installation (30.00-30.29)
('30.00', 'Interior Painting - New Construction', 'Paint new interior walls and ceilings', 'labor', 'sf', 2.50),
('30.01', 'Interior Paint Materials - Standard', 'Standard grade interior paint and supplies', 'material', 'gal', 35.00),
('30.02', 'Interior Paint Materials - Premium', 'Premium grade interior paint and supplies', 'material', 'gal', 55.00),
('30.03', 'Exterior Painting - New Construction', 'Paint new exterior surfaces', 'labor', 'sf', 3.50),
('30.04', 'Exterior Paint Materials - Standard', 'Standard grade exterior paint and supplies', 'material', 'gal', 40.00),
('30.05', 'Exterior Paint Materials - Premium', 'Premium grade exterior paint and supplies', 'material', 'gal', 65.00),
('30.06', 'Trim & Detail Painting', 'Paint doors, windows, baseboards, crown molding', 'labor', 'lf', 4.00),
('30.07', 'Cabinet Painting - New', 'Paint or stain new cabinets', 'labor', 'lf', 45.00),
('30.08', 'Specialty Coating Application', 'Epoxy, textured, or specialty coatings', 'labor', 'sf', 5.00),
('30.09', 'Spray Equipment Rental', 'Airless sprayer and equipment', 'equipment', 'day', 125.00),
('30.10', 'Drywall Priming', 'Prime new drywall surfaces', 'labor', 'sf', 1.25),
('30.11', 'Wood Staining - New', 'Stain new wood surfaces', 'labor', 'sf', 3.00),
('30.12', 'Concrete Staining', 'Decorative concrete staining', 'labor', 'sf', 4.50),
('30.13', 'Wallpaper Installation', 'Install wallpaper or wall coverings', 'labor', 'sf', 3.50),
('30.14', 'Acoustic Ceiling Painting', 'Paint acoustic/popcorn ceilings', 'labor', 'sf', 2.00),
('30.15', 'Garage Floor Coating', 'Epoxy garage floor system', 'labor', 'sf', 6.00),

-- Repairs & Restoration (30.30-30.59)
('30.30', 'Interior Painting - Repaint', 'Repaint existing interior surfaces', 'labor', 'sf', 2.00),
('30.31', 'Exterior Painting - Repaint', 'Repaint existing exterior surfaces', 'labor', 'sf', 3.00),
('30.32', 'Drywall Repair & Paint', 'Patch, repair and paint drywall', 'labor', 'sf', 8.00),
('30.33', 'Cabinet Refinishing', 'Sand and refinish existing cabinets', 'labor', 'lf', 55.00),
('30.34', 'Deck Staining - Restoration', 'Strip and restain deck surfaces', 'labor', 'sf', 4.50),
('30.35', 'Lead Paint Remediation', 'Safe removal/encapsulation of lead paint', 'service', 'sf', 12.00),
('30.36', 'Wallpaper Removal', 'Remove existing wallpaper', 'labor', 'sf', 2.50),
('30.37', 'Ceiling Repair & Paint', 'Repair and paint damaged ceilings', 'labor', 'sf', 5.00),
('30.38', 'Stucco Repair & Paint', 'Repair cracks and repaint stucco', 'labor', 'sf', 6.00),
('30.39', 'Trim Restoration', 'Strip, repair and repaint trim', 'labor', 'lf', 6.00),

-- Maintenance & Service (30.60-30.79)
('30.60', 'Annual Exterior Touch-up', 'Annual exterior paint maintenance', 'service', 'visit', 350.00),
('30.61', 'Pressure Washing Service', 'Power wash surfaces before painting', 'service', 'hour', 125.00),
('30.62', 'Caulking & Sealing Service', 'Maintenance caulking and sealing', 'service', 'hour', 85.00),
('30.63', 'Wood Preservation Treatment', 'Apply wood preservatives', 'service', 'sf', 1.50),
('30.64', 'Graffiti Removal', 'Remove graffiti from surfaces', 'service', 'hour', 95.00),

-- Specialty/Premium (30.80-30.99)
('30.80', 'Faux Finish Application', 'Decorative faux painting techniques', 'labor', 'sf', 12.00),
('30.81', 'Mural Painting', 'Custom mural artwork', 'labor', 'sf', 25.00),
('30.82', 'Venetian Plaster', 'Venetian plaster application', 'labor', 'sf', 15.00),
('30.83', 'Metallic Paint Finish', 'Specialty metallic paint finishes', 'labor', 'sf', 8.00),
('30.84', 'Color Consultation', 'Professional color consulting service', 'service', 'hour', 150.00),

-- FLOORING (33-35)
-- Professional flooring installation and services
-- New Installation (33.00-33.29)
('33.00', 'Hardwood Flooring - Install', 'Install hardwood flooring', 'labor', 'sf', 4.50),
('33.01', 'Hardwood Flooring - Materials', 'Hardwood flooring materials', 'material', 'sf', 5.00),
('33.02', 'Laminate Flooring - Install', 'Install laminate flooring', 'labor', 'sf', 2.50),
('33.03', 'Laminate Flooring - Materials', 'Laminate flooring materials', 'material', 'sf', 2.00),
('33.04', 'Vinyl/LVP Flooring - Install', 'Install vinyl or LVP flooring', 'labor', 'sf', 2.00),
('33.05', 'Vinyl/LVP Flooring - Materials', 'Vinyl or LVP flooring materials', 'material', 'sf', 3.00),
('33.06', 'Carpet Installation', 'Install carpet and padding', 'labor', 'sf', 1.50),
('33.07', 'Carpet Materials', 'Carpet and padding materials', 'material', 'sf', 2.50),
('33.08', 'Tile Flooring - Install', 'Install ceramic or porcelain tile', 'labor', 'sf', 5.00),
('33.09', 'Tile Flooring - Materials', 'Tile, thinset, and grout', 'material', 'sf', 4.00),
('33.10', 'Subfloor Preparation', 'Level and prepare subfloor', 'labor', 'sf', 2.00),
('33.11', 'Moisture Barrier Installation', 'Install moisture barrier', 'labor', 'sf', 0.75),
('33.12', 'Floor Transitions/Trim', 'Install transitions and trim', 'labor', 'lf', 8.00),
('33.13', 'Radiant Floor Heating', 'Install in-floor heating system', 'labor', 'sf', 6.00),
('33.14', 'Natural Stone Flooring', 'Install marble, granite, slate', 'labor', 'sf', 8.00),
('33.15', 'Epoxy Floor Coating', 'Commercial epoxy floor system', 'labor', 'sf', 4.50),

-- Repairs & Restoration (33.30-33.59)
('33.30', 'Hardwood Floor Refinishing', 'Sand and refinish hardwood floors', 'labor', 'sf', 3.50),
('33.31', 'Floor Board Replacement', 'Replace damaged floor boards', 'labor', 'sf', 12.00),
('33.32', 'Carpet Repair/Patching', 'Repair damaged carpet areas', 'labor', 'hour', 95.00),
('33.33', 'Tile Repair/Replacement', 'Replace cracked or damaged tiles', 'labor', 'hour', 85.00),
('33.34', 'Subfloor Repair', 'Repair damaged subfloor', 'labor', 'sf', 8.00),
('33.35', 'Floor Leveling', 'Level uneven floors', 'labor', 'sf', 4.00),
('33.36', 'Grout Restoration', 'Clean and reseal grout lines', 'labor', 'sf', 2.50),
('33.37', 'Vinyl Floor Repair', 'Repair tears or damage in vinyl', 'labor', 'hour', 75.00),
('33.38', 'Squeaky Floor Repair', 'Fix squeaky floors', 'labor', 'hour', 95.00),
('33.39', 'Water Damage Restoration', 'Restore water damaged flooring', 'labor', 'sf', 6.00),

-- Maintenance & Service (33.60-33.79)
('33.60', 'Professional Floor Cleaning', 'Deep clean all floor types', 'service', 'sf', 0.50),
('33.61', 'Hardwood Floor Maintenance', 'Screen and recoat hardwood', 'service', 'sf', 1.50),
('33.62', 'Carpet Cleaning Service', 'Professional carpet cleaning', 'service', 'room', 75.00),
('33.63', 'Floor Waxing/Buffing', 'Commercial floor maintenance', 'service', 'sf', 0.75),
('33.64', 'Grout Sealing Service', 'Apply grout sealer', 'service', 'sf', 1.00),

-- Specialty/Premium (33.80-33.99)
('33.80', 'Custom Inlay Work', 'Decorative wood or tile inlays', 'labor', 'sf', 25.00),
('33.81', 'Antique Floor Restoration', 'Restore historic flooring', 'labor', 'sf', 12.00),
('33.82', 'Sports Floor Installation', 'Gymnasium or sports flooring', 'labor', 'sf', 8.00),
('33.83', 'Heated Floor Repair', 'Repair radiant floor systems', 'service', 'hour', 125.00),

-- ROOFING (36-38)
-- Professional roofing services
-- New Installation (36.00-36.29)
('36.00', 'Asphalt Shingle Roofing', 'Install asphalt shingle roof', 'labor', 'sq', 250.00),
('36.01', 'Asphalt Shingles - Materials', 'Asphalt shingles and underlayment', 'material', 'sq', 100.00),
('36.02', 'Metal Roofing - Install', 'Install metal roof system', 'labor', 'sq', 350.00),
('36.03', 'Metal Roofing - Materials', 'Metal roofing panels and trim', 'material', 'sq', 300.00),
('36.04', 'Tile Roofing - Install', 'Install clay or concrete tile', 'labor', 'sq', 450.00),
('36.05', 'Tile Roofing - Materials', 'Clay or concrete roof tiles', 'material', 'sq', 250.00),
('36.06', 'Flat Roof Installation', 'TPO, EPDM, or modified bitumen', 'labor', 'sq', 400.00),
('36.07', 'Roof Decking Installation', 'Install roof sheathing', 'labor', 'sf', 2.50),
('36.08', 'Roof Ventilation System', 'Install ridge vents, soffit vents', 'labor', 'lf', 12.00),
('36.09', 'Gutter Installation', 'Install gutters and downspouts', 'labor', 'lf', 8.00),
('36.10', 'Roof Flashing Installation', 'Install chimney, valley, drip edge flashing', 'labor', 'lf', 15.00),
('36.11', 'Skylight Installation', 'Install new skylight', 'labor', 'each', 450.00),
('36.12', 'Roof Safety Equipment', 'Safety harnesses and equipment', 'equipment', 'day', 75.00),
('36.13', 'Solar Panel Mounting', 'Install solar panel mounting system', 'labor', 'kw', 200.00),
('36.14', 'Green Roof System', 'Vegetative roof installation', 'labor', 'sf', 15.00),

-- Repairs & Restoration (36.30-36.59)
('36.30', 'Roof Leak Repair', 'Locate and repair roof leaks', 'service', 'hour', 125.00),
('36.31', 'Shingle Replacement', 'Replace damaged shingles', 'labor', 'hour', 95.00),
('36.32', 'Flashing Repair', 'Repair or replace flashing', 'labor', 'lf', 18.00),
('36.33', 'Gutter Repair', 'Repair gutters and downspouts', 'labor', 'hour', 85.00),
('36.34', 'Roof Decking Repair', 'Replace damaged decking', 'labor', 'sf', 5.00),
('36.35', 'Chimney Cap Repair', 'Repair or replace chimney cap', 'labor', 'each', 350.00),
('36.36', 'Roof Coating Application', 'Apply reflective roof coating', 'labor', 'sq', 150.00),
('36.37', 'Storm Damage Repair', 'Emergency storm damage repairs', 'service', 'hour', 150.00),
('36.38', 'Ice Dam Removal', 'Remove ice dams safely', 'service', 'hour', 125.00),
('36.39', 'Skylight Repair', 'Repair leaking skylights', 'labor', 'each', 250.00),

-- Maintenance & Service (36.60-36.79)
('36.60', 'Roof Inspection Service', 'Annual roof inspection', 'service', 'each', 200.00),
('36.61', 'Gutter Cleaning Service', 'Clean gutters and downspouts', 'service', 'lf', 2.00),
('36.62', 'Roof Debris Removal', 'Remove leaves and debris', 'service', 'hour', 85.00),
('36.63', 'Gutter Guard Installation', 'Install gutter protection', 'labor', 'lf', 10.00),
('36.64', 'Roof Tune-up Service', 'Minor repairs and maintenance', 'service', 'each', 350.00),

-- Specialty/Premium (36.80-36.99)
('36.80', 'Cedar Shake Roofing', 'Install wood shake roofing', 'labor', 'sq', 650.00),
('36.81', 'Slate Roofing', 'Install natural slate roofing', 'labor', 'sq', 850.00),
('36.82', 'Copper Roofing', 'Install copper roof system', 'labor', 'sq', 950.00),
('36.83', 'Historic Roof Restoration', 'Restore historic roofing', 'labor', 'sq', 750.00),
('36.84', 'Roof Certification', 'Provide roof certification', 'service', 'each', 300.00),

-- SOLAR & RENEWABLE ENERGY (39-41)
-- Solar and renewable energy systems
-- New Installation (39.00-39.29)
('39.00', 'Solar Panel Installation', 'Install rooftop solar panels', 'labor', 'kw', 500.00),
('39.01', 'Solar Panels - Equipment', 'Solar panels and mounting hardware', 'equipment', 'kw', 2500.00),
('39.02', 'Solar Inverter Installation', 'Install solar inverter system', 'labor', 'each', 800.00),
('39.03', 'Solar Inverter - Equipment', 'Solar inverter and components', 'equipment', 'each', 2000.00),
('39.04', 'Battery Storage Installation', 'Install battery backup system', 'labor', 'kwh', 200.00),
('39.05', 'Battery Storage - Equipment', 'Battery storage units', 'equipment', 'kwh', 700.00),
('39.06', 'Solar Electrical Work', 'DC and AC electrical connections', 'labor', 'hour', 125.00),
('39.07', 'Solar Monitoring System', 'Install monitoring equipment', 'labor', 'each', 350.00),
('39.08', 'Ground Mount Installation', 'Install ground-mounted solar', 'labor', 'kw', 600.00),
('39.09', 'Solar Permit Processing', 'Handle permits and utility paperwork', 'service', 'project', 500.00),
('39.10', 'Solar Water Heater Install', 'Install solar hot water system', 'labor', 'each', 1200.00),
('39.11', 'Wind Turbine Installation', 'Small wind turbine install', 'labor', 'kw', 1500.00),
('39.12', 'EV Charger Installation', 'Install electric vehicle charger', 'labor', 'each', 800.00),
('39.13', 'Solar Pool Heater', 'Install solar pool heating', 'labor', 'each', 2500.00),
('39.14', 'Solar Attic Fan', 'Install solar powered attic fan', 'labor', 'each', 450.00),

-- Repairs & Service (39.30-39.59)
('39.30', 'Solar Panel Repair', 'Repair damaged solar panels', 'service', 'hour', 125.00),
('39.31', 'Inverter Troubleshooting', 'Diagnose and repair inverters', 'service', 'hour', 150.00),
('39.32', 'Solar Wire Replacement', 'Replace damaged solar wiring', 'labor', 'hour', 125.00),
('39.33', 'Battery System Repair', 'Repair battery storage systems', 'service', 'hour', 150.00),
('39.34', 'Monitoring System Repair', 'Fix monitoring equipment', 'service', 'hour', 125.00),
('39.35', 'Ground Fault Repair', 'Locate and repair ground faults', 'service', 'hour', 150.00),

-- Maintenance & Service (39.60-39.79)
('39.60', 'Solar Panel Cleaning', 'Professional panel cleaning', 'service', 'kw', 50.00),
('39.61', 'System Performance Check', 'Annual system inspection', 'service', 'kw', 75.00),
('39.62', 'Inverter Maintenance', 'Preventive inverter service', 'service', 'each', 200.00),
('39.63', 'Battery Maintenance', 'Battery system maintenance', 'service', 'kwh', 25.00),
('39.64', 'Solar Monitoring Service', 'Remote monitoring service', 'service', 'month', 50.00),

-- Specialty/Premium (39.80-39.99)
('39.80', 'Solar Canopy System', 'Solar parking canopy install', 'labor', 'kw', 800.00),
('39.81', 'Agrivoltaic System', 'Agricultural solar installation', 'labor', 'kw', 700.00),
('39.82', 'Solar Facade System', 'Building integrated solar', 'labor', 'sf', 45.00),
('39.83', 'Microgrid Installation', 'Complete microgrid system', 'labor', 'kw', 1200.00),

-- LANDSCAPING & HARDSCAPING (42-44)
-- Outdoor living and landscape services
-- New Installation (42.00-42.29)
('42.00', 'Sod Installation', 'Install new sod lawn', 'labor', 'sf', 0.60),
('42.01', 'Sod Materials', 'Sod and soil amendments', 'material', 'sf', 0.40),
('42.02', 'Landscape Planting', 'Plant trees, shrubs, flowers', 'labor', 'hour', 65.00),
('42.03', 'Plant Materials - Small', 'Small plants and flowers', 'material', 'each', 15.00),
('42.04', 'Plant Materials - Large', 'Trees and large shrubs', 'material', 'each', 150.00),
('42.05', 'Irrigation System Install', 'Install sprinkler system', 'labor', 'zone', 800.00),
('42.06', 'Irrigation Materials', 'Sprinkler heads, pipes, controller', 'material', 'zone', 400.00),
('42.07', 'Paver Patio Installation', 'Install paver patio', 'labor', 'sf', 8.00),
('42.08', 'Paver Materials', 'Pavers, sand, and base', 'material', 'sf', 5.00),
('42.09', 'Retaining Wall Install', 'Build retaining wall', 'labor', 'sf', 25.00),
('42.10', 'Retaining Wall Materials', 'Blocks, gravel, and drainage', 'material', 'sf', 15.00),
('42.11', 'Concrete Patio Pour', 'Pour concrete patio', 'labor', 'sf', 6.00),
('42.12', 'Decorative Concrete', 'Stamped or stained concrete', 'labor', 'sf', 10.00),
('42.13', 'Landscape Lighting Install', 'Install outdoor lighting', 'labor', 'fixture', 125.00),
('42.14', 'Landscape Lighting Materials', 'Fixtures, wire, transformer', 'material', 'fixture', 85.00),
('42.15', 'Drainage System Install', 'Install French drains', 'labor', 'lf', 35.00),
('42.16', 'Artificial Turf Install', 'Install synthetic grass', 'labor', 'sf', 6.00),
('42.17', 'Mulch Installation', 'Spread mulch in beds', 'labor', 'cy', 65.00),
('42.18', 'Gravel/Rock Installation', 'Install decorative rock', 'labor', 'ton', 85.00),
('42.19', 'Edging Installation', 'Install landscape edging', 'labor', 'lf', 8.00),
('42.20', 'Water Feature Install', 'Install fountain or waterfall', 'labor', 'each', 1500.00),

-- Repairs & Maintenance (42.30-42.59)
('42.30', 'Lawn Repair/Reseed', 'Repair damaged lawn areas', 'labor', 'sf', 1.50),
('42.31', 'Irrigation Repair', 'Repair sprinkler system', 'service', 'hour', 95.00),
('42.32', 'Paver Repair/Relevel', 'Fix sunken or damaged pavers', 'labor', 'sf', 12.00),
('42.33', 'Retaining Wall Repair', 'Repair failing wall sections', 'labor', 'lf', 45.00),
('42.34', 'Drainage Problem Solving', 'Fix drainage issues', 'service', 'hour', 125.00),
('42.35', 'Tree/Shrub Pruning', 'Professional pruning service', 'labor', 'hour', 85.00),
('42.36', 'Stump Grinding', 'Remove tree stumps', 'service', 'each', 200.00),
('42.37', 'Concrete Repair', 'Fix cracks and damage', 'labor', 'sf', 15.00),
('42.38', 'Landscape Lighting Repair', 'Fix outdoor lighting', 'service', 'hour', 95.00),

-- Maintenance Services (42.60-42.79)
('42.60', 'Lawn Mowing Service', 'Weekly lawn mowing', 'service', 'visit', 50.00),
('42.61', 'Lawn Treatment Program', 'Fertilizer and weed control', 'service', 'application', 75.00),
('42.62', 'Seasonal Cleanup', 'Spring/fall yard cleanup', 'service', 'visit', 350.00),
('42.63', 'Mulch Refresh', 'Annual mulch top-up', 'service', 'cy', 85.00),
('42.64', 'Irrigation Winterization', 'Winterize sprinkler system', 'service', 'each', 125.00),
('42.65', 'Snow Removal Service', 'Snow plowing/shoveling', 'service', 'visit', 150.00),
('42.66', 'Hedge Trimming Service', 'Regular hedge maintenance', 'service', 'hour', 65.00),

-- Specialty/Premium (42.80-42.99)
('42.80', 'Outdoor Kitchen Install', 'Build outdoor kitchen', 'labor', 'lf', 450.00),
('42.81', 'Fire Pit/Fireplace Install', 'Build outdoor fire feature', 'labor', 'each', 2500.00),
('42.82', 'Pergola Construction', 'Build pergola or gazebo', 'labor', 'sf', 35.00),
('42.83', 'Living Wall Installation', 'Vertical garden system', 'labor', 'sf', 85.00),
('42.84', 'Landscape Design Service', 'Professional design plans', 'service', 'hour', 150.00),
('42.85', 'Xeriscape Installation', 'Drought-tolerant landscaping', 'labor', 'sf', 8.00),

-- POOL & SPA (45-47)
-- Pool and spa services
-- New Installation (45.00-45.29)
('45.00', 'Inground Pool Install', 'Install concrete pool', 'labor', 'each', 35000.00),
('45.01', 'Above Ground Pool Install', 'Install above ground pool', 'labor', 'each', 3500.00),
('45.02', 'Hot Tub Installation', 'Install and connect hot tub', 'labor', 'each', 1500.00),
('45.03', 'Pool Equipment Install', 'Pump, filter, heater installation', 'labor', 'each', 2500.00),
('45.04', 'Pool Deck Installation', 'Install pool decking', 'labor', 'sf', 15.00),
('45.05', 'Pool Fence Installation', 'Safety fence installation', 'labor', 'lf', 25.00),
('45.06', 'Pool Cover Install', 'Automatic cover system', 'labor', 'each', 3500.00),
('45.07', 'Pool Lighting Install', 'LED pool lights', 'labor', 'each', 450.00),
('45.08', 'Water Feature Addition', 'Add waterfall or fountain', 'labor', 'each', 2500.00),

-- Repairs & Service (45.30-45.59)
('45.30', 'Pool Leak Detection', 'Find and locate leaks', 'service', 'hour', 150.00),
('45.31', 'Pool Surface Repair', 'Patch plaster or liner', 'labor', 'sf', 25.00),
('45.32', 'Equipment Repair', 'Repair pumps, filters, heaters', 'service', 'hour', 125.00),
('45.33', 'Tile/Coping Repair', 'Fix pool tile and coping', 'labor', 'lf', 45.00),
('45.34', 'Pool Deck Repair', 'Repair cracks and damage', 'labor', 'sf', 18.00),

-- Maintenance Services (45.60-45.79)
('45.60', 'Weekly Pool Service', 'Chemical balance and cleaning', 'service', 'visit', 125.00),
('45.61', 'Pool Opening Service', 'Seasonal pool opening', 'service', 'each', 350.00),
('45.62', 'Pool Closing Service', 'Winterize pool', 'service', 'each', 450.00),
('45.63', 'Filter Cleaning Service', 'Clean or backwash filter', 'service', 'each', 150.00),
('45.64', 'Acid Wash Service', 'Pool surface acid wash', 'service', 'each', 800.00),

-- Specialty/Premium (45.80-45.99)
('45.80', 'Pool Resurfacing', 'Complete pool replaster', 'labor', 'sf', 12.00),
('45.81', 'Salt System Conversion', 'Convert to salt water', 'labor', 'each', 2000.00),
('45.82', 'Pool Automation System', 'Smart pool controls', 'labor', 'each', 3500.00),
('45.83', 'Infinity Edge Addition', 'Add vanishing edge', 'labor', 'lf', 850.00),

-- SECURITY & AUTOMATION (48-49)
-- Home security and automation
-- New Installation (48.00-48.29)
('48.00', 'Security System Install', 'Basic alarm system', 'labor', 'each', 800.00),
('48.01', 'Security Equipment', 'Panels, sensors, keypads', 'equipment', 'each', 1200.00),
('48.02', 'Camera System Install', 'Security camera installation', 'labor', 'camera', 250.00),
('48.03', 'Camera Equipment', 'Cameras and recording equipment', 'equipment', 'camera', 300.00),
('48.04', 'Smart Lock Installation', 'Install smart door locks', 'labor', 'each', 150.00),
('48.05', 'Access Control System', 'Card/fob access system', 'labor', 'door', 450.00),
('48.06', 'Video Doorbell Install', 'Install video doorbell', 'labor', 'each', 125.00),
('48.07', 'Motion Lighting Install', 'Security lighting installation', 'labor', 'each', 185.00),
('48.08', 'Smart Home Hub Setup', 'Configure automation hub', 'labor', 'each', 350.00),
('48.09', 'Smart Thermostat Install', 'Install programmable thermostat', 'labor', 'each', 225.00),
('48.10', 'Whole Home Audio Install', 'Multi-room audio system', 'labor', 'room', 650.00),
('48.11', 'Home Theater Install', 'Complete theater setup', 'labor', 'each', 3500.00),
('48.12', 'Network Infrastructure', 'Install ethernet and wifi', 'labor', 'drop', 185.00),
('48.13', 'Smart Lighting Install', 'Automated lighting controls', 'labor', 'switch', 125.00),
('48.14', 'Motorized Blinds Install', 'Automatic window treatments', 'labor', 'window', 350.00),

-- Repairs & Service (48.30-48.59)
('48.30', 'Security System Repair', 'Troubleshoot and repair', 'service', 'hour', 125.00),
('48.31', 'Camera System Repair', 'Fix camera issues', 'service', 'hour', 125.00),
('48.32', 'Smart Device Troubleshooting', 'Fix automation problems', 'service', 'hour', 125.00),
('48.33', 'Network Troubleshooting', 'Fix connectivity issues', 'service', 'hour', 150.00),

-- Maintenance Services (48.60-48.79)
('48.60', 'Security Monitoring', 'Monthly monitoring service', 'service', 'month', 35.00),
('48.61', 'System Inspection', 'Annual system check', 'service', 'each', 200.00),
('48.62', 'Software Updates', 'Update system software', 'service', 'hour', 125.00),
('48.63', 'Battery Replacement', 'Replace backup batteries', 'service', 'each', 85.00),

-- Specialty/Premium (48.80-48.99)
('48.80', 'Biometric Access System', 'Fingerprint/facial recognition', 'labor', 'each', 1500.00),
('48.81', 'Vehicle Detection System', 'License plate recognition', 'labor', 'each', 3500.00),
('48.82', 'Perimeter Detection', 'Fence or beam detection', 'labor', 'lf', 45.00),
('48.83', 'Integration Service', 'Integrate multiple systems', 'service', 'hour', 185.00);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_trade_range ON cost_codes(SUBSTRING(code FROM 1 FOR 2));
CREATE INDEX IF NOT EXISTS idx_cost_codes_operation_type ON cost_codes(SUBSTRING(code FROM 4 FOR 2));

COMMIT;