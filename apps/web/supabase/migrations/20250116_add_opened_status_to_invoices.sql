-- Add 'opened' to the invoice status enum
-- First, we need to check if the status is an enum or just text with a constraint

-- If using enum type (PostgreSQL), we need to alter the enum
DO $$ 
BEGIN
    -- Check if the status column uses an enum type
    IF EXISTS (
        SELECT 1 
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' 
        AND t.typname = 'invoice_status'
    ) THEN
        -- Add the new value to the enum if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumlabel = 'opened' 
            AND enumtypid = (
                SELECT oid 
                FROM pg_type 
                WHERE typname = 'invoice_status'
            )
        ) THEN
            ALTER TYPE invoice_status ADD VALUE 'opened' AFTER 'sent';
        END IF;
    ELSE
        -- If using CHECK constraint, we need to drop and recreate it
        -- First drop the existing constraint
        ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
        
        -- Add the new constraint with 'opened' included
        ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
        CHECK (status IN ('draft', 'sent', 'opened', 'paid', 'overdue', 'signed'));
    END IF;
END $$;

-- Add a column to track when the invoice was first opened
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS first_opened_at timestamptz;

-- Add an index on the status column for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Add a comment explaining the new status
COMMENT ON COLUMN invoices.status IS 'Status of the invoice: draft (created but not sent), sent (sent to client), opened (client viewed it), paid, overdue, or signed';
COMMENT ON COLUMN invoices.first_opened_at IS 'Timestamp when the client first opened/viewed the invoice';