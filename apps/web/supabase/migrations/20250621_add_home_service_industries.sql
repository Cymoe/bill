-- Add comprehensive home service industries
INSERT INTO industries (name, slug, description, icon, color, display_order, is_active)
VALUES 
  -- Repair & Maintenance Services
  ('Appliance Repair', 'appliance-repair', 'Appliance repair and maintenance services', '🔧', '#EF4444', 150, true),
  ('Handyman', 'handyman', 'General repair and maintenance services', '🔨', '#F59E0B', 160, true),
  ('Garage Door Services', 'garage-door', 'Garage door installation and repair', '🚪', '#6366F1', 170, true),
  ('Fence Services', 'fence-services', 'Fence installation and repair services', '🚧', '#8B5CF6', 180, true),
  ('Window Cleaning', 'window-cleaning', 'Professional window cleaning services', '🪟', '#06B6D4', 190, true),
  ('Pressure Washing', 'pressure-washing', 'Power washing and exterior cleaning services', '💦', '#10B981', 200, true),
  ('Gutter Services', 'gutter-services', 'Gutter installation, cleaning, and repair', '🏠', '#14B8A6', 210, true),
  
  -- Specialty Trade Services
  ('Carpentry', 'carpentry', 'Custom carpentry and woodworking services', '🪚', '#D97706', 220, true),
  ('Drywall', 'drywall', 'Drywall installation and finishing services', '📐', '#9CA3AF', 230, true),
  ('Painting', 'painting', 'Interior and exterior painting services', '🎨', '#EC4899', 240, true),
  ('Tiling', 'tiling', 'Tile installation and repair services', '🔲', '#F472B6', 250, true),
  ('Concrete', 'concrete', 'Concrete pouring, repair, and finishing', '🧱', '#6B7280', 260, true),
  ('Masonry', 'masonry', 'Brick, stone, and block work', '🧱', '#78716C', 270, true),
  ('Insulation', 'insulation', 'Insulation installation and energy efficiency services', '🏠', '#FCD34D', 280, true),
  ('Waterproofing', 'waterproofing', 'Basement and foundation waterproofing', '💧', '#0EA5E9', 290, true),
  ('Siding', 'siding', 'Siding installation and repair services', '🏘️', '#7C3AED', 300, true),
  
  -- Cleaning Services
  ('Cleaning Services', 'cleaning', 'Residential and commercial cleaning services', '🧹', '#10B981', 310, true),
  ('Carpet Cleaning', 'carpet-cleaning', 'Professional carpet and upholstery cleaning', '🧽', '#059669', 320, true),
  ('Janitorial Services', 'janitorial', 'Commercial janitorial and maintenance services', '🧹', '#047857', 330, true),
  ('Chimney Sweep', 'chimney-sweep', 'Chimney cleaning and inspection services', '🏚️', '#374151', 340, true),
  ('Junk Removal', 'junk-removal', 'Junk hauling and disposal services', '🗑️', '#7C2D12', 350, true),
  
  -- Outdoor Services
  ('Lawn Care', 'lawn-care', 'Lawn mowing and maintenance services', '🌱', '#84CC16', 360, true),
  ('Tree Care', 'tree-care', 'Tree trimming, removal, and health services', '🌲', '#15803D', 370, true),
  ('Snow Removal', 'snow-removal', 'Snow plowing and ice management services', '❄️', '#DBEAFE', 380, true),
  ('Irrigation Services', 'irrigation', 'Sprinkler system installation and repair', '💧', '#1E40AF', 390, true),
  ('Pool & Spa Services', 'pool-spa', 'Pool and spa maintenance and repair', '🏊', '#0891B2', 400, true),
  ('Paving', 'paving', 'Asphalt and concrete paving services', '🛣️', '#1F2937', 410, true),
  ('Excavation', 'excavation', 'Excavation and earth moving services', '🚜', '#92400E', 420, true),
  
  -- Specialized Services
  ('Pest Control', 'pest-control', 'Pest management and extermination services', '🐛', '#991B1B', 430, true),
  ('Locksmith Services', 'locksmith', 'Lock installation and emergency services', '🔐', '#1E293B', 440, true),
  ('Security Systems', 'security-systems', 'Security system installation and monitoring', '🔒', '#334155', 450, true),
  ('Home Automation', 'home-automation', 'Smart home installation and integration', '🏠', '#4F46E5', 460, true),
  ('Fire Protection', 'fire-protection', 'Fire alarm and sprinkler system services', '🚒', '#DC2626', 470, true),
  ('Elevator Services', 'elevator-services', 'Elevator installation and maintenance', '🛗', '#64748B', 480, true),
  ('Well Water Services', 'well-water', 'Well drilling and water system services', '💧', '#2563EB', 490, true),
  ('Septic Services', 'septic-services', 'Septic system installation and pumping', '🚽', '#7C3AED', 500, true),
  
  -- Restoration Services
  ('Restoration Services', 'restoration', 'Fire, water, and storm damage restoration', '🔄', '#F97316', 510, true),
  ('Demolition', 'demolition', 'Demolition and site clearing services', '🏗️', '#B91C1C', 520, true),
  ('Foundation Repair', 'foundation-repair', 'Foundation repair and stabilization services', '🏗️', '#6B7280', 530, true),
  
  -- Mechanical Services
  ('Mechanical Contracting', 'mechanical', 'Mechanical systems installation and service', '⚙️', '#475569', 540, true),
  
  -- Unique/Niche Services
  ('Auto Detailing', 'auto-detailing', 'Mobile auto detailing and cleaning services', '🚗', '#0F172A', 550, true),
  ('Dog Walking', 'dog-walking', 'Pet care and dog walking services', '🐕', '#F472B6', 560, true),
  ('Pet Waste Removal', 'pet-waste-removal', 'Pet waste removal and yard sanitization', '🐾', '#A78BFA', 570, true)
  
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Note: Some services from the list were already covered or consolidated:
-- Construction -> Already have General/Commercial/Residential Construction
-- Electrical Contracting -> Already have Electrical
-- General Contracting -> Already have General Construction
-- Remodeling -> Already have Kitchen/Bathroom Remodeling, plus we added general Handyman
-- Property Maintenance -> Already have Property Management
-- Flooring -> Already exists
-- HVAC -> Already exists
-- Landscaping -> Already exists
-- Plumbing -> Already exists
-- Roofing -> Already exists
-- Pooper Scooper -> Added as Pet Waste Removal with more professional name