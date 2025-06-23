-- This script populates the industries table with all required industries
-- Run this using: supabase db push or through the Supabase SQL editor

-- First, check if industries table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM industries LIMIT 1) THEN
        -- Insert all industries from the migration files
        INSERT INTO industries (name, slug, description, icon, color, display_order, is_active)
        VALUES 
          -- Construction Industries
          ('General Construction', 'general-construction', 'General contracting and construction services', '🏗️', '#6B7280', 10, true),
          ('Electrical', 'electrical', 'Electrical contracting and services', '⚡', '#F59E0B', 20, true),
          ('Plumbing', 'plumbing', 'Plumbing contracting and services', '🚿', '#3B82F6', 30, true),
          ('HVAC', 'hvac', 'Heating, ventilation, and air conditioning services', '❄️', '#06B6D4', 40, true),
          ('Roofing', 'roofing', 'Roofing installation and repair services', '🏠', '#DC2626', 50, true),
          ('Flooring', 'flooring', 'Flooring installation and refinishing services', '🪵', '#7C3AED', 60, true),
          ('Landscaping', 'landscaping', 'Landscaping and outdoor design services', '🌳', '#10B981', 70, true),
          
          -- Specialized Construction
          ('Commercial Construction', 'commercial-construction', 'Commercial building and tenant improvements', '🏢', '#1F2937', 80, true),
          ('Residential Construction', 'residential-construction', 'Specialized residential remodeling and renovation', '🏠', '#84CC16', 90, true),
          ('Kitchen Remodeling', 'kitchen-remodeling', 'Kitchen design and renovation services', '🍳', '#F97316', 100, true),
          ('Bathroom Remodeling', 'bathroom-remodeling', 'Bathroom design and renovation services', '🚿', '#8B5CF6', 110, true),
          
          -- Renewable Energy
          ('Solar', 'solar', 'Solar panel installation and renewable energy services', '☀️', '#FDE047', 120, true),
          
          -- Real Estate
          ('Property Management', 'property-management', 'Property management and maintenance services', '🔑', '#4B5563', 130, true),
          ('Real Estate Investment', 'real-estate-investment', 'Real estate investment and development', '🏡', '#059669', 140, true),
          
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
          ('Junk Removal', 'junk-removal', 'Junk hauling and disposal services', '🗑️', '#7C2D12', 350, true)
        ON CONFLICT (slug) DO NOTHING;
        
        RAISE NOTICE 'Industries table has been populated';
    ELSE
        RAISE NOTICE 'Industries table already contains data';
    END IF;
END $$;

-- Verify the data was inserted
SELECT COUNT(*) as total_industries FROM industries;
SELECT name, slug FROM industries ORDER BY display_order LIMIT 10;