-- Add predefined services for more industries
-- Flooring, Painting, Carpentry, Landscaping

-- Flooring Services
INSERT INTO services (
  name,
  description,
  category,
  industry_id,
  is_active,
  display_order
) VALUES
  -- Installation Services
  ('Hardwood Installation', 'Installation of solid and engineered hardwood flooring', 'installation',
   (SELECT id FROM industries WHERE slug = 'flooring'), true, 10),
  
  ('Tile Installation', 'Installation of ceramic, porcelain, and natural stone tiles', 'installation',
   (SELECT id FROM industries WHERE slug = 'flooring'), true, 20),
  
  ('Carpet Installation', 'Installation of carpet and padding', 'installation',
   (SELECT id FROM industries WHERE slug = 'flooring'), true, 30),
  
  ('Vinyl/LVP Installation', 'Installation of vinyl, luxury vinyl plank, and laminate flooring', 'installation',
   (SELECT id FROM industries WHERE slug = 'flooring'), true, 40),
  
  -- Repair Services
  ('Floor Repair', 'Repair of damaged flooring sections', 'repair',
   (SELECT id FROM industries WHERE slug = 'flooring'), true, 50),
  
  ('Floor Refinishing', 'Sanding and refinishing of hardwood floors', 'finishing',
   (SELECT id FROM industries WHERE slug = 'flooring'), true, 60),
  
  -- Preparation Services
  ('Subfloor Preparation', 'Leveling and preparing subfloors for new flooring', 'preparation',
   (SELECT id FROM industries WHERE slug = 'flooring'), true, 70);

-- Painting Services
INSERT INTO services (
  name,
  description,
  category,
  industry_id,
  is_active,
  display_order
) VALUES
  -- Painting Services
  ('Interior Painting', 'Painting of interior walls, ceilings, and trim', 'finishing',
   (SELECT id FROM industries WHERE slug = 'painting'), true, 10),
  
  ('Exterior Painting', 'Painting of exterior siding, trim, and surfaces', 'finishing',
   (SELECT id FROM industries WHERE slug = 'painting'), true, 20),
  
  ('Cabinet Painting', 'Professional painting and refinishing of cabinets', 'finishing',
   (SELECT id FROM industries WHERE slug = 'painting'), true, 30),
  
  ('Commercial Painting', 'Large-scale painting for commercial properties', 'finishing',
   (SELECT id FROM industries WHERE slug = 'painting'), true, 40),
  
  -- Preparation Services
  ('Surface Preparation', 'Patching, sanding, and priming surfaces', 'preparation',
   (SELECT id FROM industries WHERE slug = 'painting'), true, 50),
  
  ('Wallpaper Removal', 'Removal of existing wallpaper and wall preparation', 'preparation',
   (SELECT id FROM industries WHERE slug = 'painting'), true, 60),
  
  -- Specialty Services
  ('Decorative Finishes', 'Faux finishes, textures, and specialty coatings', 'finishing',
   (SELECT id FROM industries WHERE slug = 'painting'), true, 70);

-- Carpentry Services
INSERT INTO services (
  name,
  description,
  category,
  industry_id,
  is_active,
  display_order
) VALUES
  -- Installation Services
  ('Trim & Molding', 'Installation of baseboards, crown molding, and trim', 'installation',
   (SELECT id FROM industries WHERE slug = 'carpentry'), true, 10),
  
  ('Door Installation', 'Installation of interior and exterior doors', 'installation',
   (SELECT id FROM industries WHERE slug = 'carpentry'), true, 20),
  
  ('Cabinet Installation', 'Installation of kitchen and bathroom cabinets', 'installation',
   (SELECT id FROM industries WHERE slug = 'carpentry'), true, 30),
  
  ('Deck Building', 'Construction of outdoor decks and railings', 'installation',
   (SELECT id FROM industries WHERE slug = 'carpentry'), true, 40),
  
  ('Custom Built-ins', 'Design and construction of custom shelving and storage', 'installation',
   (SELECT id FROM industries WHERE slug = 'carpentry'), true, 50),
  
  -- Repair Services
  ('Wood Repair', 'Repair of damaged wood structures and surfaces', 'repair',
   (SELECT id FROM industries WHERE slug = 'carpentry'), true, 60),
  
  ('Window Repair', 'Repair and adjustment of windows and frames', 'repair',
   (SELECT id FROM industries WHERE slug = 'carpentry'), true, 70);

-- Landscaping Services
INSERT INTO services (
  name,
  description,
  category,
  industry_id,
  is_active,
  display_order
) VALUES
  -- Installation Services
  ('Lawn Installation', 'Sod installation and lawn seeding', 'installation',
   (SELECT id FROM industries WHERE slug = 'landscaping'), true, 10),
  
  ('Planting Services', 'Installation of trees, shrubs, and flower beds', 'installation',
   (SELECT id FROM industries WHERE slug = 'landscaping'), true, 20),
  
  ('Irrigation Installation', 'Installation of sprinkler and drip irrigation systems', 'installation',
   (SELECT id FROM industries WHERE slug = 'landscaping'), true, 30),
  
  ('Hardscape Installation', 'Installation of patios, walkways, and retaining walls', 'installation',
   (SELECT id FROM industries WHERE slug = 'landscaping'), true, 40),
  
  -- Maintenance Services
  ('Lawn Maintenance', 'Regular mowing, edging, and lawn care', 'maintenance',
   (SELECT id FROM industries WHERE slug = 'landscaping'), true, 50),
  
  ('Garden Maintenance', 'Weeding, pruning, and general garden upkeep', 'maintenance',
   (SELECT id FROM industries WHERE slug = 'landscaping'), true, 60),
  
  ('Seasonal Cleanup', 'Spring and fall cleanup services', 'maintenance',
   (SELECT id FROM industries WHERE slug = 'landscaping'), true, 70),
  
  -- Consultation Services
  ('Landscape Design', 'Professional landscape design and planning', 'consultation',
   (SELECT id FROM industries WHERE slug = 'landscaping'), true, 80);