-- Add 'opened' to the estimate status enum
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
        AND t.typname = 'estimate_status'
    ) THEN
        -- Add the new value to the enum if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumlabel = 'opened' 
            AND enumtypid = (
                SELECT oid 
                FROM pg_type 
                WHERE typname = 'estimate_status'
            )
        ) THEN
            ALTER TYPE estimate_status ADD VALUE 'opened' AFTER 'sent';
        END IF;
    ELSE
        -- If using CHECK constraint, we need to drop and recreate it
        -- First drop the existing constraint
        ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_status_check;
        
        -- Add the new constraint with 'opened' included
        ALTER TABLE estimates ADD CONSTRAINT estimates_status_check 
        CHECK (status IN ('draft', 'sent', 'opened', 'accepted', 'rejected', 'expired'));
    END IF;
END $$;

-- Add a column to track when the estimate was first opened
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS first_opened_at timestamptz;

-- Add an index on the status column for better query performance
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);

-- Add a comment explaining the new status
COMMENT ON COLUMN estimates.status IS 'Status of the estimate: draft (created but not sent), sent (sent to client), opened (client viewed it), accepted, rejected, or expired';
COMMENT ON COLUMN estimates.first_opened_at IS 'Timestamp when the client first opened/viewed the estimate';