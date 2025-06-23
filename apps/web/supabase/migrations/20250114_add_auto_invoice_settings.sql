-- Add settings for automated invoice creation
-- These settings can be at the organization level

-- Add settings to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS auto_create_invoice_on_estimate_accept BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_invoice_deposit_percentage INTEGER DEFAULT 50;

-- Add comments for documentation
COMMENT ON COLUMN organizations.auto_create_invoice_on_estimate_accept IS 'Automatically create invoice when estimate is accepted';
COMMENT ON COLUMN organizations.auto_invoice_deposit_percentage IS 'Percentage of total for deposit invoice (0 = full amount)';