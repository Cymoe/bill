-- Add cost_code_id to expenses table for hierarchical categorization
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS cost_code_id UUID REFERENCES cost_codes(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_expenses_cost_code_id ON expenses(cost_code_id);

-- Add comment for documentation
COMMENT ON COLUMN expenses.cost_code_id IS 'Reference to cost code for hierarchical expense categorization';

-- Update RLS policies to include cost_code_id in selects
DROP POLICY IF EXISTS "select_expenses" ON expenses;
CREATE POLICY "select_expenses"
  ON expenses FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = expenses.project_id
      AND (
        p.user_id = auth.uid()
        OR
        p.organization_id IN (
          SELECT organization_id 
          FROM user_organizations 
          WHERE user_id = auth.uid()
        )
      )
    )
  ); 