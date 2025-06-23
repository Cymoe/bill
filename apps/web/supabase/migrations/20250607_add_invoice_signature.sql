-- Add client signature fields to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS client_signature TEXT,
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE;

-- Update the status enum to include 'signed' if it doesn't exist
DO $$ 
BEGIN
    -- Check if 'signed' status already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'signed' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'invoice_status'
        )
    ) THEN
        -- Add 'signed' to the enum if it doesn't exist
        ALTER TYPE invoice_status ADD VALUE 'signed';
    END IF;
EXCEPTION 
    WHEN undefined_object THEN
        -- If invoice_status enum doesn't exist, create it with all values
        CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'signed');
        
        -- Update the status column to use the enum type
        ALTER TABLE invoices 
        ALTER COLUMN status TYPE invoice_status USING status::invoice_status;
END $$;