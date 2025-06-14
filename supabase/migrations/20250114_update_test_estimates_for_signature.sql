-- Update a few estimates to have future expiry dates and 'sent' status for testing signature functionality
-- This will update the 3 most recent estimates that are currently expired or in draft status

UPDATE estimates
SET 
  expiry_date = CURRENT_DATE + INTERVAL '30 days',
  status = 'sent',
  updated_at = NOW()
WHERE id IN (
  SELECT id 
  FROM estimates
  WHERE (
    status IN ('draft', 'expired') 
    OR expiry_date < CURRENT_DATE
  )
  ORDER BY created_at DESC
  LIMIT 3
);

-- Also ensure issue_date is reasonable if needed
UPDATE estimates
SET issue_date = CURRENT_DATE
WHERE id IN (
  SELECT id 
  FROM estimates
  WHERE issue_date > CURRENT_DATE
    AND expiry_date = CURRENT_DATE + INTERVAL '30 days'
);