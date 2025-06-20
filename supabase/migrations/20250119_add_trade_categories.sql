-- Trade Categories Migration
-- Creates a categorization system for organizing cost codes by trade and operation type

BEGIN;

-- Create trade_categories table to define trade ranges
CREATE TABLE IF NOT EXISTS trade_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  code_range_start VARCHAR(5) NOT NULL,
  code_range_end VARCHAR(5) NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(20),
  category_type VARCHAR(50) NOT NULL CHECK (category_type IN ('construction', 'specialty_trade', 'service', 'home_service', 'business_ops')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert trade categories based on our XX.XX system
INSERT INTO trade_categories (name, slug, description, code_range_start, code_range_end, icon, color, category_type) VALUES
-- Traditional Construction (01-29)
('General Requirements', 'general-requirements', 'Project management, permits, and temporary facilities', '01', '01', '📋', 'gray', 'construction'),
('Site Work', 'site-work', 'Excavation, grading, and site preparation', '02', '02', '🚜', 'brown', 'construction'),
('Concrete', 'concrete', 'Foundations, slabs, and concrete work', '03', '03', '🏗️', 'gray', 'construction'),
('Masonry', 'masonry', 'Brick, block, and stone work', '04', '04', '🧱', 'red', 'construction'),
('Metals', 'metals', 'Structural steel and metal work', '05', '05', '🔩', 'gray', 'construction'),
('Wood & Plastics', 'wood-plastics', 'Framing, millwork, and composites', '06', '06', '🪵', 'brown', 'construction'),
('Thermal & Moisture', 'thermal-moisture', 'Insulation, roofing, and waterproofing', '07', '07', '🛡️', 'blue', 'construction'),
('Openings', 'openings', 'Doors, windows, and glazing', '08', '08', '🚪', 'blue', 'construction'),
('Finishes', 'finishes', 'Drywall, flooring, and painting', '09', '09', '🎨', 'purple', 'construction'),
('Specialties', 'specialties', 'Toilet partitions, signage, and accessories', '10', '10', '🏷️', 'orange', 'construction'),
('Equipment', 'equipment', 'Built-in equipment and appliances', '11', '11', '🔧', 'gray', 'construction'),
('Furnishings', 'furnishings', 'Furniture and window treatments', '12', '12', '🪑', 'brown', 'construction'),
('Special Construction', 'special-construction', 'Pools, vaults, and special structures', '13', '13', '🏊', 'blue', 'construction'),
('Conveying Systems', 'conveying-systems', 'Elevators, escalators, and lifts', '14', '14', '🛗', 'gray', 'construction'),
('Fire Suppression', 'fire-suppression', 'Sprinkler systems and fire protection', '21', '21', '🚒', 'red', 'construction'),
('Plumbing', 'plumbing', 'Plumbing fixtures and piping', '22', '22', '🚿', 'blue', 'construction'),
('HVAC', 'hvac', 'Heating, ventilation, and air conditioning', '23', '23', '❄️', 'blue', 'construction'),
('Electrical', 'electrical', 'Power, lighting, and electrical systems', '26', '26', '⚡', 'yellow', 'construction'),
('Communications', 'communications', 'Data, telephone, and AV systems', '27', '27', '📡', 'green', 'construction'),
('Security', 'security', 'Electronic safety and security systems', '28', '28', '🔒', 'red', 'construction'),

-- Specialty Trades (30-49)
('Painting', 'painting', 'Interior/exterior painting and coatings', '30', '32', '🎨', 'blue', 'specialty_trade'),
('Flooring', 'flooring', 'All types of flooring installation and repair', '33', '35', '🏠', 'brown', 'specialty_trade'),
('Roofing', 'roofing', 'Roof installation and repair', '36', '38', '🏠', 'gray', 'specialty_trade'),
('Solar & Renewable', 'solar-renewable', 'Solar panels and renewable energy', '39', '41', '☀️', 'yellow', 'specialty_trade'),
('Landscaping', 'landscaping', 'Landscaping and hardscaping', '42', '44', '🌳', 'green', 'specialty_trade'),
('Pool & Spa', 'pool-spa', 'Pool and spa installation/service', '45', '47', '🏊', 'blue', 'specialty_trade'),
('Security & Automation', 'security-automation', 'Home security and smart home', '48', '49', '🏠', 'purple', 'specialty_trade'),

-- Service/Maintenance (50-69) - Reserved for future use
('Maintenance Services', 'maintenance-services', 'Regular maintenance and service contracts', '50', '59', '🔧', 'gray', 'service'),
('Repair Services', 'repair-services', 'General repair services', '60', '69', '🛠️', 'orange', 'service'),

-- Home Services (70-89)
('HVAC Services', 'hvac-services', 'HVAC installation and service', '70', '72', '❄️', 'blue', 'home_service'),
('Appliance Services', 'appliance-services', 'Appliance repair and installation', '73', '74', '🔌', 'gray', 'home_service'),
('Cleaning Services', 'cleaning-services', 'Professional cleaning', '75', '76', '🧹', 'green', 'home_service'),
('Pest Control', 'pest-control', 'Pest management services', '77', '78', '🐛', 'brown', 'home_service'),
('Property Management', 'property-management', 'Property maintenance services', '79', '80', '🏢', 'blue', 'home_service'),
('Home Inspection', 'home-inspection', 'Professional inspection services', '81', '82', '🔍', 'purple', 'home_service'),
('Moving Services', 'moving-services', 'Moving and storage', '83', '84', '📦', 'orange', 'home_service'),
('Window & Door Services', 'window-door-services', 'Window and door installation/repair', '85', '86', '🚪', 'blue', 'home_service'),
('Handyman Services', 'handyman', 'General handyman services', '87', '89', '🔨', 'gray', 'home_service'),

-- Business Operations (90-99)
('General Business', 'general-business', 'Business overhead and operations', '90', '99', '💼', 'gray', 'business_ops');

-- Create operation_types table to define decimal ranges
CREATE TABLE IF NOT EXISTS operation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  decimal_range_start VARCHAR(2) NOT NULL,
  decimal_range_end VARCHAR(2) NOT NULL,
  applies_to VARCHAR(50) NOT NULL CHECK (applies_to IN ('specialty_trades', 'all')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert operation types for the decimal portion of codes
INSERT INTO operation_types (name, slug, description, decimal_range_start, decimal_range_end, applies_to) VALUES
('New Installation', 'new-installation', 'New construction and installation work', '00', '29', 'specialty_trades'),
('Repairs & Restoration', 'repairs-restoration', 'Repair and restoration services', '30', '59', 'specialty_trades'),
('Maintenance & Service', 'maintenance-service', 'Ongoing maintenance and service contracts', '60', '79', 'specialty_trades'),
('Specialty & Premium', 'specialty-premium', 'Specialty and premium services', '80', '99', 'specialty_trades');

-- Create function to categorize cost codes
CREATE OR REPLACE FUNCTION get_cost_code_category(code VARCHAR)
RETURNS TABLE (
  trade_category VARCHAR,
  operation_type VARCHAR,
  is_specialty_trade BOOLEAN
) AS $$
DECLARE
  v_major VARCHAR(2);
  v_minor VARCHAR(2);
  v_trade_name VARCHAR;
  v_operation_name VARCHAR;
  v_is_specialty BOOLEAN;
BEGIN
  -- Extract major and minor parts
  v_major := SUBSTRING(code FROM 1 FOR 2);
  v_minor := SUBSTRING(code FROM 4 FOR 2);
  
  -- Get trade category
  SELECT name, category_type = 'specialty_trade' 
  INTO v_trade_name, v_is_specialty
  FROM trade_categories
  WHERE v_major >= code_range_start 
    AND v_major <= code_range_end
    AND is_active = true
  LIMIT 1;
  
  -- Get operation type for specialty trades
  IF v_is_specialty THEN
    SELECT name INTO v_operation_name
    FROM operation_types
    WHERE v_minor >= decimal_range_start 
      AND v_minor <= decimal_range_end
      AND applies_to IN ('specialty_trades', 'all')
      AND is_active = true
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT v_trade_name, v_operation_name, v_is_specialty;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for performance
CREATE INDEX idx_trade_categories_ranges ON trade_categories(code_range_start, code_range_end);
CREATE INDEX idx_operation_types_ranges ON operation_types(decimal_range_start, decimal_range_end);

-- Enable RLS
ALTER TABLE trade_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for all authenticated users)
CREATE POLICY "Users can view trade categories" ON trade_categories
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can view operation types" ON operation_types
  FOR SELECT TO authenticated
  USING (true);

-- Add helpful comments
COMMENT ON TABLE trade_categories IS 'Defines trade categories for organizing cost codes by industry/trade';
COMMENT ON TABLE operation_types IS 'Defines operation types based on decimal portion of specialty trade codes';
COMMENT ON FUNCTION get_cost_code_category IS 'Returns the trade category and operation type for a given cost code';

COMMIT;