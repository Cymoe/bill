-- Complete Service Options Framework
-- This migration creates a comprehensive template for what EVERY service option should include
-- Real contractors need COMPLETE job costing, not partial lists

-- =====================================================================
-- FRAMEWORK: What Every Service Option Must Include
-- =====================================================================
/*
1. LABOR (Multiple Types)
   - Lead technician/installer
   - Helper/assistant 
   - Cleanup crew
   - Specialized trades when needed

2. PRIMARY MATERIALS
   - Main materials with waste factors (5-15%)
   - Quality options (standard/premium)

3. FASTENERS & ADHESIVES
   - All screws, nails, bolts
   - Adhesives, glues, caulks
   - Proper quantities per unit

4. PREP MATERIALS
   - Surface preparation
   - Protection (drop cloths, plastic, tape)
   - Primers, fillers, compounds

5. SAFETY EQUIPMENT
   - PPE (glasses, masks, gloves)
   - Safety supplies
   - First aid items

6. TOOLS & CONSUMABLES
   - Tool wear items (blades, bits, sandpaper)
   - Small tools that get consumed
   - Measuring and marking supplies

7. CLEANUP & DISPOSAL
   - Debris removal
   - Hazardous waste disposal
   - Final cleaning supplies
   - Vacuum/equipment rental

8. PERMITS & INSPECTIONS (where required)
   - Permit fees
   - Inspection fees
   - Documentation time

9. OPTIONAL UPGRADES
   - Premium material options
   - Enhanced finishes
   - Extended warranties
*/

-- =====================================================================
-- EXAMPLE: Complete Drywall Installation Service Option
-- =====================================================================

WITH drywall_template AS (
  SELECT 
    'Standard Drywall Installation' as name,
    'sqft' as unit,
    jsonb_build_object(
      'labor', jsonb_build_array(
        jsonb_build_object('name', 'Drywall Hanger', 'hours_per_unit', 0.02, 'purpose', 'Installation'),
        jsonb_build_object('name', 'Drywall Finisher', 'hours_per_unit', 0.025, 'purpose', 'Taping and mudding'),
        jsonb_build_object('name', 'Helper/Laborer', 'hours_per_unit', 0.015, 'purpose', 'Material handling'),
        jsonb_build_object('name', 'Texture Specialist', 'hours_per_unit', 0.01, 'purpose', 'Texture application')
      ),
      'materials', jsonb_build_array(
        -- Primary materials
        jsonb_build_object('name', 'Drywall 1/2" x 4x8', 'quantity_per_unit', 0.034, 'purpose', '32 sqft/sheet + 10% waste'),
        jsonb_build_object('name', 'Joint Compound', 'quantity_per_unit', 0.0037, 'purpose', '1 bucket per 270 sqft'),
        jsonb_build_object('name', 'Mesh Tape', 'quantity_per_unit', 0.125, 'purpose', '8 linear ft per sheet'),
        jsonb_build_object('name', 'Corner Bead', 'quantity_per_unit', 0.025, 'purpose', 'Per corner/edge'),
        
        -- Fasteners
        jsonb_build_object('name', 'Drywall Screws 1-1/4"', 'quantity_per_unit', 0.01, 'purpose', '1 box per 100 sqft'),
        jsonb_build_object('name', 'Adhesive', 'quantity_per_unit', 0.002, 'purpose', 'For ceiling/special areas'),
        
        -- Prep materials
        jsonb_build_object('name', 'Primer - Drywall', 'quantity_per_unit', 0.0025, 'purpose', '1 gallon per 400 sqft'),
        jsonb_build_object('name', 'Drop Cloths', 'quantity_per_unit', 0.001, 'purpose', 'Floor protection'),
        jsonb_build_object('name', 'Plastic Sheeting', 'quantity_per_unit', 0.002, 'purpose', 'Dust containment'),
        
        -- Finishing supplies
        jsonb_build_object('name', 'Sandpaper', 'quantity_per_unit', 0.01, 'purpose', 'Surface smoothing'),
        jsonb_build_object('name', 'Sanding Sponges', 'quantity_per_unit', 0.005, 'purpose', 'Detail work'),
        
        -- Safety
        jsonb_build_object('name', 'Dust Masks', 'quantity_per_unit', 0.01, 'purpose', 'Worker protection'),
        jsonb_build_object('name', 'Safety Glasses', 'quantity_per_unit', 0.002, 'purpose', 'Eye protection')
      ),
      'equipment', jsonb_build_array(
        jsonb_build_object('name', 'Drywall Lift Rental', 'quantity_per_unit', 0.001, 'purpose', 'Ceiling installation'),
        jsonb_build_object('name', 'Texture Sprayer Rental', 'quantity_per_unit', 0.0005, 'purpose', 'Texture application'),
        jsonb_build_object('name', 'Shop Vacuum Rental', 'quantity_per_unit', 0.001, 'purpose', 'Dust control')
      ),
      'disposal', jsonb_build_array(
        jsonb_build_object('name', 'Debris Removal', 'quantity_per_unit', 0.0001, 'purpose', 'Cutoff disposal'),
        jsonb_build_object('name', 'Cleanup Service', 'quantity_per_unit', 0.005, 'purpose', 'Final cleaning')
      )
    ) as components
)
SELECT * FROM drywall_template;

-- =====================================================================
-- EXAMPLE: Complete Interior Painting Service Option
-- =====================================================================

WITH painting_template AS (
  SELECT 
    'Professional Interior Wall Painting' as name,
    'sqft' as unit,
    jsonb_build_object(
      'labor', jsonb_build_array(
        jsonb_build_object('name', 'Lead Painter', 'hours_per_unit', 0.02, 'purpose', 'Primary painting'),
        jsonb_build_object('name', 'Painter Helper', 'hours_per_unit', 0.015, 'purpose', 'Prep and assist'),
        jsonb_build_object('name', 'Surface Prep Labor', 'hours_per_unit', 0.01, 'purpose', 'Patching and sanding')
      ),
      'paint_materials', jsonb_build_array(
        jsonb_build_object('name', 'Primer - Interior', 'quantity_per_unit', 0.0029, 'purpose', '350 sqft/gallon'),
        jsonb_build_object('name', 'Interior Paint - Standard', 'quantity_per_unit', 0.0057, 'purpose', '2 coats @ 350 sqft/gallon'),
        jsonb_build_object('name', 'Interior Paint - Premium', 'quantity_per_unit', 0.0057, 'purpose', 'Optional upgrade', 'optional', true)
      ),
      'prep_materials', jsonb_build_array(
        jsonb_build_object('name', 'Spackling Compound', 'quantity_per_unit', 0.001, 'purpose', 'Hole patching'),
        jsonb_build_object('name', 'Caulk', 'quantity_per_unit', 0.0005, 'purpose', 'Gap filling'),
        jsonb_build_object('name', 'Sandpaper', 'quantity_per_unit', 0.002, 'purpose', 'Surface prep'),
        jsonb_build_object('name', 'Painters Tape', 'quantity_per_unit', 0.02, 'purpose', 'Edge protection'),
        jsonb_build_object('name', 'Plastic Sheeting', 'quantity_per_unit', 0.005, 'purpose', 'Furniture protection'),
        jsonb_build_object('name', 'Drop Cloths', 'quantity_per_unit', 0.01, 'purpose', 'Floor protection')
      ),
      'application_supplies', jsonb_build_array(
        jsonb_build_object('name', 'Roller Covers - 3/8" nap', 'quantity_per_unit', 0.002, 'purpose', 'Replace every 500 sqft'),
        jsonb_build_object('name', 'Roller Covers - 1/2" nap', 'quantity_per_unit', 0.001, 'purpose', 'Textured surfaces'),
        jsonb_build_object('name', 'Paint Brushes - 2"', 'quantity_per_unit', 0.0005, 'purpose', 'Cut-in work'),
        jsonb_build_object('name', 'Paint Brushes - 3"', 'quantity_per_unit', 0.0005, 'purpose', 'Trim work'),
        jsonb_build_object('name', 'Paint Tray Liners', 'quantity_per_unit', 0.002, 'purpose', 'Quick cleanup'),
        jsonb_build_object('name', 'Extension Pole', 'quantity_per_unit', 0.0001, 'purpose', 'High areas')
      ),
      'cleanup_supplies', jsonb_build_array(
        jsonb_build_object('name', 'Tack Cloths', 'quantity_per_unit', 0.002, 'purpose', 'Dust removal'),
        jsonb_build_object('name', 'Cotton Rags', 'quantity_per_unit', 0.003, 'purpose', 'Cleanup'),
        jsonb_build_object('name', 'Paint Thinner', 'quantity_per_unit', 0.0001, 'purpose', 'Cleanup solvent'),
        jsonb_build_object('name', 'Soap', 'quantity_per_unit', 0.0001, 'purpose', 'Hand cleaning')
      ),
      'safety_disposal', jsonb_build_array(
        jsonb_build_object('name', 'Respirator Masks', 'quantity_per_unit', 0.001, 'purpose', 'VOC protection'),
        jsonb_build_object('name', 'Safety Glasses', 'quantity_per_unit', 0.0005, 'purpose', 'Eye protection'),
        jsonb_build_object('name', 'Hazardous Waste Disposal', 'quantity_per_unit', 0.0001, 'purpose', 'Paint disposal')
      )
    ) as components
)
SELECT * FROM painting_template;

-- =====================================================================
-- EXAMPLE: Complete Bathroom Remodel Service Option
-- =====================================================================

WITH bathroom_template AS (
  SELECT 
    'Complete Bathroom Remodel' as name,
    'bathroom' as unit,
    jsonb_build_object(
      'demolition', jsonb_build_array(
        jsonb_build_object('name', 'Demolition Labor', 'quantity', 8, 'unit', 'hour', 'type', 'fixed'),
        jsonb_build_object('name', 'Dumpster Rental', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Plastic Sheeting - Heavy', 'quantity', 2, 'unit', 'roll', 'type', 'fixed')
      ),
      'plumbing', jsonb_build_array(
        jsonb_build_object('name', 'Master Plumber', 'quantity', 16, 'unit', 'hour', 'type', 'fixed'),
        jsonb_build_object('name', 'Journeyman Plumber', 'quantity', 8, 'unit', 'hour', 'type', 'fixed'),
        jsonb_build_object('name', 'Rough-in Plumbing Kit', 'quantity', 1, 'unit', 'set', 'type', 'fixed'),
        jsonb_build_object('name', 'Supply Lines', 'quantity', 6, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Shut-off Valves', 'quantity', 4, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'P-Traps', 'quantity', 2, 'unit', 'each', 'type', 'fixed')
      ),
      'electrical', jsonb_build_array(
        jsonb_build_object('name', 'Master Electrician', 'quantity', 8, 'unit', 'hour', 'type', 'fixed'),
        jsonb_build_object('name', 'GFCI Outlets', 'quantity', 2, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Vanity Light', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Exhaust Fan', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Electrical Wire', 'quantity', 50, 'unit', 'feet', 'type', 'fixed')
      ),
      'framing_drywall', jsonb_build_array(
        jsonb_build_object('name', 'Framing Carpenter', 'quantity', 8, 'unit', 'hour', 'type', 'fixed'),
        jsonb_build_object('name', 'Moisture Resistant Drywall', 'quantity', 12, 'unit', 'sheet', 'type', 'fixed'),
        jsonb_build_object('name', 'Cement Board', 'quantity', 8, 'unit', 'sheet', 'type', 'fixed'),
        jsonb_build_object('name', 'Waterproofing Membrane', 'quantity', 100, 'unit', 'sqft', 'type', 'fixed')
      ),
      'tile_work', jsonb_build_array(
        jsonb_build_object('name', 'Tile Installer', 'quantity', 24, 'unit', 'hour', 'type', 'fixed'),
        jsonb_build_object('name', 'Floor Tile', 'quantity', 80, 'unit', 'sqft', 'type', 'fixed'),
        jsonb_build_object('name', 'Wall Tile', 'quantity', 120, 'unit', 'sqft', 'type', 'fixed'),
        jsonb_build_object('name', 'Tile Adhesive', 'quantity', 10, 'unit', 'bag', 'type', 'fixed'),
        jsonb_build_object('name', 'Grout', 'quantity', 6, 'unit', 'bag', 'type', 'fixed'),
        jsonb_build_object('name', 'Tile Spacers', 'quantity', 2, 'unit', 'bag', 'type', 'fixed'),
        jsonb_build_object('name', 'Grout Sealer', 'quantity', 1, 'unit', 'gallon', 'type', 'fixed')
      ),
      'fixtures', jsonb_build_array(
        jsonb_build_object('name', 'Toilet - Standard', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Vanity Cabinet', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Vanity Top', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Faucet', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Shower/Tub Unit', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Shower Door', 'quantity', 1, 'unit', 'each', 'type', 'fixed')
      ),
      'finishing', jsonb_build_array(
        jsonb_build_object('name', 'Painter', 'quantity', 8, 'unit', 'hour', 'type', 'fixed'),
        jsonb_build_object('name', 'Bathroom Paint', 'quantity', 2, 'unit', 'gallon', 'type', 'fixed'),
        jsonb_build_object('name', 'Primer', 'quantity', 1, 'unit', 'gallon', 'type', 'fixed'),
        jsonb_build_object('name', 'Towel Bars', 'quantity', 3, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Mirror', 'quantity', 1, 'unit', 'each', 'type', 'fixed')
      ),
      'permits_inspections', jsonb_build_array(
        jsonb_build_object('name', 'Building Permit', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Plumbing Permit', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Electrical Permit', 'quantity', 1, 'unit', 'each', 'type', 'fixed'),
        jsonb_build_object('name', 'Inspection Fees', 'quantity', 3, 'unit', 'each', 'type', 'fixed')
      ),
      'cleanup', jsonb_build_array(
        jsonb_build_object('name', 'Final Cleanup', 'quantity', 4, 'unit', 'hour', 'type', 'fixed'),
        jsonb_build_object('name', 'Construction Cleanup', 'quantity', 1, 'unit', 'service', 'type', 'fixed')
      )
    ) as components
)
SELECT * FROM bathroom_template;

-- =====================================================================
-- MIGRATION STRATEGY
-- =====================================================================

/*
1. Identify all service options with < 15 items (incomplete)
2. For each service option, determine missing categories:
   - Does it have multiple labor types?
   - Does it include prep materials?
   - Does it have safety equipment?
   - Does it include cleanup/disposal?
   - Are fasteners and consumables included?
   
3. Add missing components based on service type:
   - Installation services need permits/inspections
   - Painting needs multiple brush/roller sizes
   - Carpentry needs various fasteners
   - All need safety equipment

4. Set proper calculation types:
   - Labor: 'per_unit' with hours per unit
   - Materials: 'multiply' or 'per_unit' based on usage
   - Fixed items: 'fixed' for permits, one-time fees

5. Include optional upgrades:
   - Premium materials
   - Enhanced warranties
   - Additional services
*/

-- Query to identify incomplete service options
WITH service_option_analysis AS (
  SELECT 
    so.id,
    so.name,
    s.name as service_name,
    i.name as industry_name,
    COUNT(soi.id) as item_count,
    COUNT(CASE WHEN li.unit = 'hour' THEN 1 END) as labor_count,
    COUNT(CASE WHEN li.category = 'material' THEN 1 END) as material_count,
    COUNT(CASE WHEN soi.is_optional = true THEN 1 END) as optional_count,
    ARRAY_AGG(DISTINCT 
      CASE 
        WHEN li.name LIKE '%Safety%' OR li.name LIKE '%Mask%' OR li.name LIKE '%Glasses%' THEN 'safety'
        WHEN li.name LIKE '%Cleanup%' OR li.name LIKE '%Removal%' OR li.name LIKE '%Disposal%' THEN 'cleanup'
        WHEN li.name LIKE '%Tape%' OR li.name LIKE '%Drop%' OR li.name LIKE '%Plastic%' THEN 'prep'
        WHEN li.name LIKE '%Nail%' OR li.name LIKE '%Screw%' OR li.name LIKE '%Adhesive%' THEN 'fasteners'
        WHEN li.unit = 'hour' THEN 'labor'
        ELSE 'other'
      END
    ) as categories_covered
  FROM service_options so
  JOIN services s ON so.service_id = s.id
  JOIN industries i ON s.industry_id = i.id
  LEFT JOIN service_option_items soi ON so.id = soi.service_option_id
  LEFT JOIN line_items li ON soi.line_item_id = li.id
  WHERE so.organization_id IS NULL
  GROUP BY so.id, so.name, s.name, i.name
)
SELECT 
  industry_name,
  service_name,
  name as option_name,
  item_count,
  labor_count,
  material_count,
  optional_count,
  categories_covered,
  CASE 
    WHEN item_count < 10 THEN 'SEVERELY INCOMPLETE'
    WHEN item_count < 15 THEN 'INCOMPLETE'
    WHEN item_count < 20 THEN 'NEEDS IMPROVEMENT'
    ELSE 'ACCEPTABLE'
  END as completeness_status
FROM service_option_analysis
WHERE item_count < 15
ORDER BY item_count ASC, industry_name, service_name;