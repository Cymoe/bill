-- Add template line items for Roofing industry
-- These are pre-configured items that all roofing organizations will have access to

-- Materials for Asphalt Shingle Roofing (36.01)
INSERT INTO line_items (name, description, price, unit, category, cost_code_id, industry_id, organization_id, created_at, updated_at)
VALUES 
  -- Shingles
  ('3-Tab Asphalt Shingles', 'Standard 3-tab asphalt shingles, 33.3 sq ft per bundle', 28.00, 'bundle', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Architectural Shingles', 'Dimensional architectural shingles, 33.3 sq ft per bundle', 35.00, 'bundle', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Premium Designer Shingles', 'High-end designer shingles, 25 sq ft per bundle', 65.00, 'bundle', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Underlayment
  ('15lb Roofing Felt', 'Standard 15lb felt underlayment, 400 sq ft roll', 25.00, 'roll', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('30lb Roofing Felt', 'Heavy duty 30lb felt underlayment, 200 sq ft roll', 28.00, 'roll', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Synthetic Underlayment', 'Synthetic roof underlayment, 1000 sq ft roll', 120.00, 'roll', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Ice & Water Shield', 'Self-adhering ice and water barrier, 200 sq ft roll', 95.00, 'roll', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Flashing and Accessories
  ('Drip Edge - Aluminum', 'Aluminum drip edge, 10 ft length', 8.50, 'piece', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Step Flashing', 'Pre-bent step flashing, 100 pieces per box', 45.00, 'box', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Ridge Cap Shingles', 'Pre-cut ridge cap shingles, 25 lin ft per bundle', 42.00, 'bundle', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Starter Strip Shingles', 'Starter strip shingles, 100 lin ft per bundle', 38.00, 'bundle', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Ventilation
  ('Ridge Vent - 4ft Section', 'Ridge vent with baffle, 4 ft section', 22.00, 'piece', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Roof Louver Vent', 'Aluminum roof louver vent', 35.00, 'each', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Soffit Vent - Continuous', 'Continuous soffit vent, 8 ft length', 18.00, 'piece', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Fasteners
  ('Roofing Nails - 1.25"', 'Galvanized roofing nails, 1.25 inch, 50lb box', 65.00, 'box', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Roofing Nails - 1.75"', 'Galvanized roofing nails, 1.75 inch, 50lb box', 68.00, 'box', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Cap Nails', 'Plastic cap nails for felt, 1000 count', 42.00, 'box', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Sealants
  ('Roofing Cement', 'Plastic roofing cement, 1 gallon', 18.00, 'gallon', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Roofing Caulk', 'Polyurethane roofing caulk', 6.50, 'tube', 'material', '4397ad9e-5ac2-4b3b-ae8c-f1c5f745fc8a', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Materials for Metal Roofing (36.03)
  ('Standing Seam Panel - 24"', '24" standing seam metal panel, 12 ft length', 85.00, 'panel', 'material', '251bf717-54f8-4e9a-834d-ec66ca0933e7', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Corrugated Metal Panel', 'Corrugated metal roofing panel, 8 ft length', 32.00, 'panel', 'material', '251bf717-54f8-4e9a-834d-ec66ca0933e7', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Metal Ridge Cap', 'Pre-formed metal ridge cap, 10 ft length', 45.00, 'piece', 'material', '251bf717-54f8-4e9a-834d-ec66ca0933e7', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Metal Roofing Screws', 'Self-drilling metal roofing screws, 250 count', 35.00, 'bag', 'material', '251bf717-54f8-4e9a-834d-ec66ca0933e7', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Gutter Materials (26.00)
  ('K-Style Gutter - 5"', '5 inch K-style aluminum gutter, 10 ft section', 12.00, 'section', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('K-Style Gutter - 6"', '6 inch K-style aluminum gutter, 10 ft section', 15.00, 'section', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Downspout - 2x3"', '2x3 inch aluminum downspout, 10 ft', 8.00, 'piece', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Downspout - 3x4"', '3x4 inch aluminum downspout, 10 ft', 10.00, 'piece', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter End Cap', 'K-style gutter end cap', 3.50, 'each', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter Inside Corner', 'K-style inside corner', 8.00, 'each', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter Outside Corner', 'K-style outside corner', 8.00, 'each', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter Outlet', 'Gutter outlet/drop', 6.00, 'each', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter Hanger', 'Hidden gutter hanger with screw', 2.50, 'each', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Downspout Bracket', 'Aluminum downspout bracket', 2.00, 'each', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Downspout Elbow', 'Aluminum downspout elbow', 4.50, 'each', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter Guard - 3ft', 'Aluminum gutter guard, 3 ft section', 12.00, 'section', 'material', '908b311f-e962-42ef-af0a-ce4668e34bad', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Labor for Asphalt Shingle Roofing (36.00)
  ('Roofer - Lead', 'Lead roofer/foreman hourly rate', 85.00, 'hour', 'labor', '5801934e-dbc3-4c2c-b151-a6d1aef2725f', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Roofer - Journeyman', 'Experienced roofer hourly rate', 65.00, 'hour', 'labor', '5801934e-dbc3-4c2c-b151-a6d1aef2725f', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Roofer - Apprentice', 'Apprentice roofer hourly rate', 45.00, 'hour', 'labor', '5801934e-dbc3-4c2c-b151-a6d1aef2725f', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Shingle Installation', 'Labor to install asphalt shingles', 75.00, 'square', 'labor', '5801934e-dbc3-4c2c-b151-a6d1aef2725f', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Tear-off Existing Shingles', 'Labor to remove existing shingles', 35.00, 'square', 'labor', '5801934e-dbc3-4c2c-b151-a6d1aef2725f', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Ridge Cap Installation', 'Labor to install ridge caps', 5.00, 'lin ft', 'labor', '5801934e-dbc3-4c2c-b151-a6d1aef2725f', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Labor for Metal Roofing (36.02)
  ('Metal Roof Installation', 'Labor to install standing seam metal roof', 125.00, 'square', 'labor', 'e993f94e-b200-4c22-8026-8bd8e3317bca', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Metal Trim Installation', 'Labor to install metal trim and flashing', 8.00, 'lin ft', 'labor', 'e993f94e-b200-4c22-8026-8bd8e3317bca', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Labor for Gutter Installation (36.09)
  ('Gutter Installation', 'Labor to install gutters', 4.50, 'lin ft', 'labor', 'f3bfe9b6-ee8d-4639-b005-c7e8523cc56b', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Downspout Installation', 'Labor to install downspouts', 3.50, 'lin ft', 'labor', 'f3bfe9b6-ee8d-4639-b005-c7e8523cc56b', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter Guard Installation', 'Labor to install gutter guards', 3.00, 'lin ft', 'labor', 'f3bfe9b6-ee8d-4639-b005-c7e8523cc56b', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Labor for Repairs (36.31)
  ('Shingle Repair - Small', 'Repair up to 10 shingles', 150.00, 'job', 'labor', '2eeef00b-35eb-435b-acad-19c713eac969', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Shingle Repair - Medium', 'Repair 10-50 shingles', 350.00, 'job', 'labor', '2eeef00b-35eb-435b-acad-19c713eac969', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Flashing Repair', 'Repair flashing around penetrations', 225.00, 'each', 'labor', '2eeef00b-35eb-435b-acad-19c713eac969', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Emergency Tarp Installation', 'Emergency roof tarp installation', 450.00, 'job', 'labor', '2eeef00b-35eb-435b-acad-19c713eac969', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Services (36.60, 36.61)
  ('Annual Roof Inspection', 'Comprehensive annual roof inspection', 250.00, 'each', 'service', 'f3212b80-2ecf-44f2-836e-355087ee567c', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Drone Roof Inspection', 'Roof inspection using drone technology', 350.00, 'each', 'service', 'f3212b80-2ecf-44f2-836e-355087ee567c', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Post-Storm Inspection', 'Emergency post-storm roof inspection', 175.00, 'each', 'service', 'f3212b80-2ecf-44f2-836e-355087ee567c', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter Cleaning - Single Story', 'Clean gutters on single story home', 150.00, 'job', 'service', '69fa208a-45fd-49eb-b85b-ee633a7bd2b7', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter Cleaning - Two Story', 'Clean gutters on two story home', 225.00, 'job', 'service', '69fa208a-45fd-49eb-b85b-ee633a7bd2b7', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Gutter Flush & Test', 'Flush downspouts and test water flow', 75.00, 'job', 'service', '69fa208a-45fd-49eb-b85b-ee633a7bd2b7', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Equipment Rental
  ('Roofing Nailer Rental', 'Pneumatic roofing nailer daily rental', 45.00, 'day', 'equipment', 'ac4764b3-a404-4987-847c-8279efbed069', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Compressor Rental', 'Air compressor daily rental', 65.00, 'day', 'equipment', 'ac4764b3-a404-4987-847c-8279efbed069', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Shingle Lift Rental', 'Conveyor/shingle lift daily rental', 185.00, 'day', 'equipment', 'ac4764b3-a404-4987-847c-8279efbed069', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Safety Harness Kit', 'OSHA-compliant safety harness kit rental', 35.00, 'day', 'equipment', 'ac4764b3-a404-4987-847c-8279efbed069', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  
  -- Disposal
  ('Dumpster - 10 Yard', '10 yard dumpster for shingle disposal', 325.00, 'each', 'service', 'ac4764b3-a404-4987-847c-8279efbed069', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Dumpster - 20 Yard', '20 yard dumpster for shingle disposal', 425.00, 'each', 'service', 'ac4764b3-a404-4987-847c-8279efbed069', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW()),
  ('Debris Haul Away', 'Manual debris removal and disposal', 85.00, 'hour', 'service', 'ac4764b3-a404-4987-847c-8279efbed069', '3f8d6863-f220-4c9e-b82a-57de8ab0428f', NULL, NOW(), NOW());