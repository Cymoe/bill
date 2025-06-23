-- Add missing fields to invoices table to match estimates table structure
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS terms TEXT,
ADD COLUMN IF NOT EXISTS issue_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN invoices.subtotal IS 'Subtotal before tax';
COMMENT ON COLUMN invoices.tax_rate IS 'Tax rate as percentage';
COMMENT ON COLUMN invoices.tax_amount IS 'Calculated tax amount';
COMMENT ON COLUMN invoices.notes IS 'Invoice notes';
COMMENT ON COLUMN invoices.terms IS 'Payment terms and conditions';
COMMENT ON COLUMN invoices.issue_date IS 'Date invoice was issued';