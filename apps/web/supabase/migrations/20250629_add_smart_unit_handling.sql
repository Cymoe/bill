-- Add smart unit handling for service option items
-- This ensures proper calculations when mixing units (labor hours vs material quantities)

-- Add a field to indicate how this line item should be calculated
ALTER TABLE service_option_items 
ADD COLUMN IF NOT EXISTS calculation_type TEXT DEFAULT 'multiply' 
CHECK (calculation_type IN ('multiply', 'fixed', 'per_unit'));

-- Add comments to explain the calculation types
COMMENT ON COLUMN service_option_items.calculation_type IS 
'multiply: quantity × service_option_quantity (default for materials)
fixed: always use the exact quantity regardless of service_option_quantity
per_unit: smart calculation based on unit compatibility';

-- Create a function to determine the correct calculation type
CREATE OR REPLACE FUNCTION determine_calculation_type(
    service_option_unit TEXT,
    line_item_unit TEXT
) RETURNS TEXT AS $$
BEGIN
    -- Labor (hours) should use per_unit calculation
    IF line_item_unit = 'hour' THEN
        RETURN 'per_unit';
    -- Same units multiply normally
    ELSIF service_option_unit = line_item_unit THEN
        RETURN 'multiply';
    -- Different units need smart handling
    ELSE
        RETURN 'per_unit';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update existing service_option_items to use smart calculation
UPDATE service_option_items soi
SET calculation_type = determine_calculation_type(
    (SELECT unit FROM service_options WHERE id = soi.service_option_id),
    (SELECT unit FROM line_items WHERE id = soi.line_item_id)
)
WHERE calculation_type = 'multiply';

-- Create a view for easy calculation
CREATE OR REPLACE VIEW service_option_calculations AS
SELECT 
    so.id as service_option_id,
    so.name as service_option_name,
    so.unit as service_option_unit,
    li.id as line_item_id,
    li.name as line_item_name,
    li.unit as line_item_unit,
    li.price as unit_price,
    soi.quantity as base_quantity,
    soi.calculation_type,
    CASE 
        WHEN li.unit = 'hour' THEN 'Labor'
        ELSE 'Material'
    END as item_category,
    -- Show the calculation formula
    CASE 
        WHEN soi.calculation_type = 'multiply' THEN 
            'Qty × ' || soi.quantity::text
        WHEN soi.calculation_type = 'fixed' THEN 
            'Fixed: ' || soi.quantity::text
        WHEN soi.calculation_type = 'per_unit' THEN 
            CASE 
                WHEN li.unit = 'hour' THEN 
                    soi.quantity::text || ' hours per ' || so.unit
                ELSE 
                    soi.quantity::text || ' ' || li.unit || ' per ' || so.unit
            END
    END as calculation_formula
FROM service_options so
JOIN service_option_items soi ON so.id = soi.service_option_id
JOIN line_items li ON soi.line_item_id = li.id;

-- Add RLS policies
ALTER TABLE service_option_items ENABLE ROW LEVEL SECURITY;

-- Update the service option price calculation to be unit-aware
CREATE OR REPLACE FUNCTION calculate_service_option_price(
    p_service_option_id UUID,
    p_quantity DECIMAL DEFAULT 1
) RETURNS DECIMAL AS $$
DECLARE
    v_total_price DECIMAL := 0;
    v_item RECORD;
BEGIN
    FOR v_item IN 
        SELECT 
            li.price,
            soi.quantity,
            soi.calculation_type,
            li.unit as line_item_unit
        FROM service_option_items soi
        JOIN line_items li ON soi.line_item_id = li.id
        WHERE soi.service_option_id = p_service_option_id
    LOOP
        IF v_item.calculation_type = 'multiply' THEN
            v_total_price := v_total_price + (v_item.price * v_item.quantity * p_quantity);
        ELSIF v_item.calculation_type = 'fixed' THEN
            v_total_price := v_total_price + (v_item.price * v_item.quantity);
        ELSIF v_item.calculation_type = 'per_unit' THEN
            -- For per_unit, the quantity represents the amount per service unit
            v_total_price := v_total_price + (v_item.price * v_item.quantity * p_quantity);
        END IF;
    END LOOP;
    
    RETURN v_total_price;
END;
$$ LANGUAGE plpgsql;

-- Example: Update Crown Molding Install to show proper calculation
-- Labor should show as "0.1 hours per linear_foot"
-- Materials should show as "1.05 × quantity" for crown molding