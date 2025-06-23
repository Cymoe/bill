-- Verification Script for Cost Code Standardization
-- Run this after the migration to verify results

-- Check 1: Show code distribution by industry after migration
SELECT 
    i.name as industry_name,
    COUNT(DISTINCT cc.code) as total_codes,
    STRING_AGG(DISTINCT LEFT(cc.code, 2), ', ' ORDER BY LEFT(cc.code, 2)) as prefixes_used,
    COUNT(DISTINCT CASE WHEN cc.code ~ '^[0-9]' THEN cc.code END) as remaining_numeric,
    COUNT(DISTINCT CASE WHEN cc.code ~ '^[A-Z]' THEN cc.code END) as alpha_codes
FROM cost_codes cc
JOIN industries i ON cc.industry_id = i.id
WHERE cc.organization_id IS NULL
GROUP BY i.name
ORDER BY i.name;

-- Check 2: Verify no duplicate codes within each industry
SELECT 
    i.name as industry_name,
    cc.code,
    COUNT(*) as duplicate_count
FROM cost_codes cc
JOIN industries i ON cc.industry_id = i.id
WHERE cc.organization_id IS NULL
GROUP BY i.name, cc.code
HAVING COUNT(*) > 1
ORDER BY i.name, cc.code;

-- Check 3: Show sample of converted codes
SELECT 
    i.name as industry_name,
    cc.code as new_code,
    cc.name as code_name,
    cc.category
FROM cost_codes cc
JOIN industries i ON cc.industry_id = i.id
WHERE cc.organization_id IS NULL
  AND cc.code LIKE 'GC%'  -- Show some General Construction conversions
ORDER BY cc.code
LIMIT 20;

-- Check 4: Verify line_items still have valid cost_code references
SELECT 
    COUNT(*) as orphaned_line_items
FROM line_items li
LEFT JOIN cost_codes cc ON li.cost_code_id = cc.id
WHERE li.cost_code_id IS NOT NULL
  AND cc.id IS NULL;

-- Check 5: Summary statistics
SELECT 
    'Total Industries' as metric,
    COUNT(DISTINCT i.id)::TEXT as value
FROM industries i
JOIN cost_codes cc ON cc.industry_id = i.id
WHERE cc.organization_id IS NULL

UNION ALL

SELECT 
    'Total Cost Codes' as metric,
    COUNT(*)::TEXT as value
FROM cost_codes
WHERE organization_id IS NULL

UNION ALL

SELECT 
    'Alpha Codes' as metric,
    COUNT(*)::TEXT as value
FROM cost_codes
WHERE organization_id IS NULL
  AND code ~ '^[A-Z]'

UNION ALL

SELECT 
    'Remaining Numeric Codes' as metric,
    COUNT(*)::TEXT as value
FROM cost_codes
WHERE organization_id IS NULL
  AND code ~ '^[0-9]';