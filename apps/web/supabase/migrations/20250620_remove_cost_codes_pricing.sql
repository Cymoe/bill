-- Remove base_price and unit fields from cost_codes table
-- Cost codes should be pure categories, not priced items
-- This fixes the confusion where cost codes were showing prices

ALTER TABLE cost_codes DROP COLUMN IF EXISTS base_price;
ALTER TABLE cost_codes DROP COLUMN IF EXISTS unit;

-- Update the database types comment
COMMENT ON TABLE cost_codes IS 'Cost code categories for organizing line items - contains no pricing information';