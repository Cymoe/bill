-- Add tracking columns to link estimates and invoices
-- This allows us to track which invoice was created from which estimate

-- Add column to invoices table to track source estimate
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS source_estimate_id UUID REFERENCES estimates(id);

-- Add column to estimates table to track resulting invoice
ALTER TABLE estimates
ADD COLUMN IF NOT EXISTS converted_to_invoice_id UUID REFERENCES invoices(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_source_estimate ON invoices(source_estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimates_converted_invoice ON estimates(converted_to_invoice_id);

-- Add comments for documentation
COMMENT ON COLUMN invoices.source_estimate_id IS 'The estimate this invoice was created from';
COMMENT ON COLUMN estimates.converted_to_invoice_id IS 'The invoice created from this estimate';