-- Flooring Industry Cost Codes Migration
-- Comprehensive cost codes for flooring contractors covering all flooring types and services

-- Insert Flooring Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'flooring'),
  NULL
FROM (VALUES
  -- Service and Consultation Codes (FL001-FL099)
  ('FL001', 'In-Home Consultation', 'Free flooring consultation and measurement', 'service', 'ls', 0.00),
  ('FL002', 'Floor Inspection', 'Subfloor and existing floor evaluation', 'service', 'ls', 150.00),
  ('FL003', 'Moisture Testing', 'Concrete moisture testing', 'service', 'ls', 250.00),
  ('FL004', 'Laser Measurement', 'Precision laser room measurement', 'service', 'room', 75.00),
  ('FL005', 'Sample Delivery', 'Bring samples to customer', 'service', 'trip', 95.00),
  ('FL006', 'Design Consultation', 'Professional design services', 'service', 'hour', 125.00),
  ('FL007', 'Insurance Estimate', 'Insurance claim documentation', 'service', 'ls', 350.00),
  ('FL008', 'Asbestos Testing', 'Asbestos testing for old flooring', 'service', 'ls', 450.00),
  ('FL009', 'Floor Plan Drawing', 'Detailed installation plan', 'service', 'ls', 285.00),
  ('FL010', 'Rush Service', 'Expedited installation fee', 'service', 'ls', 500.00),

  -- Labor Codes (FL100-FL199)
  ('FL100', 'Installer - Lead', 'Lead installer hourly rate', 'labor', 'hour', 75.00),
  ('FL101', 'Installer - Helper', 'Assistant installer hourly rate', 'labor', 'hour', 45.00),
  ('FL102', 'Hardwood Install', 'Hardwood installation labor', 'labor', 'sf', 4.50),
  ('FL103', 'Laminate Install', 'Laminate installation labor', 'labor', 'sf', 2.50),
  ('FL104', 'Vinyl Plank Install', 'LVP/LVT installation labor', 'labor', 'sf', 2.75),
  ('FL105', 'Tile Install - Basic', 'Basic tile installation labor', 'labor', 'sf', 5.50),
  ('FL106', 'Tile Install - Pattern', 'Pattern tile installation labor', 'labor', 'sf', 8.50),
  ('FL107', 'Carpet Install', 'Carpet installation labor', 'labor', 'sy', 6.00),
  ('FL108', 'Sheet Vinyl Install', 'Sheet vinyl installation labor', 'labor', 'sf', 2.25),
  ('FL109', 'Stair Installation', 'Stairway flooring labor', 'labor', 'step', 85.00),
  ('FL110', 'Transition Install', 'Transition strip installation', 'labor', 'lf', 12.00),
  ('FL111', 'Baseboard Install', 'Baseboard installation labor', 'labor', 'lf', 4.50),
  ('FL112', 'Quarter Round Install', 'Quarter round installation', 'labor', 'lf', 3.50),
  ('FL113', 'Floor Prep Labor', 'Floor preparation hourly rate', 'labor', 'hour', 65.00),
  ('FL114', 'Demo Labor', 'Flooring removal labor', 'labor', 'sf', 1.50),
  ('FL115', 'Furniture Moving', 'Furniture moving service', 'labor', 'room', 125.00),

  -- Hardwood Materials (FL200-FL249)
  ('FL200', 'Oak - Red', 'Red oak solid hardwood', 'material', 'sf', 5.50),
  ('FL201', 'Oak - White', 'White oak solid hardwood', 'material', 'sf', 6.50),
  ('FL202', 'Maple', 'Maple solid hardwood', 'material', 'sf', 6.00),
  ('FL203', 'Hickory', 'Hickory solid hardwood', 'material', 'sf', 7.50),
  ('FL204', 'Cherry', 'Cherry solid hardwood', 'material', 'sf', 8.50),
  ('FL205', 'Walnut', 'Walnut solid hardwood', 'material', 'sf', 12.00),
  ('FL206', 'Bamboo', 'Bamboo flooring', 'material', 'sf', 4.50),
  ('FL207', 'Cork', 'Cork flooring', 'material', 'sf', 5.50),
  ('FL208', 'Engineered Wood', 'Engineered hardwood', 'material', 'sf', 4.75),
  ('FL209', 'Exotic Hardwood', 'Brazilian cherry/teak', 'material', 'sf', 9.50),
  ('FL210', 'Reclaimed Wood', 'Reclaimed hardwood', 'material', 'sf', 8.50),
  ('FL211', 'Hardwood Stain', 'Wood stain per coat', 'material', 'sf', 1.25),
  ('FL212', 'Hardwood Finish', 'Polyurethane finish', 'material', 'sf', 1.50),
  ('FL213', 'Wood Filler', 'Wood filler/putty', 'material', 'lb', 22.00),
  ('FL214', 'Hardwood Cleats', 'Flooring cleats/staples', 'material', 'box', 45.00),

  -- Laminate Materials (FL250-FL299)
  ('FL250', 'Laminate - Basic', 'Basic laminate flooring', 'material', 'sf', 1.50),
  ('FL251', 'Laminate - Premium', 'Premium laminate flooring', 'material', 'sf', 3.50),
  ('FL252', 'Laminate - Waterproof', 'Waterproof laminate', 'material', 'sf', 4.25),
  ('FL253', 'Laminate Underlayment', 'Foam underlayment', 'material', 'sf', 0.45),
  ('FL254', 'Laminate Transitions', 'T-molding and reducers', 'material', 'lf', 8.50),
  ('FL255', 'Laminate Adhesive', 'Laminate glue', 'material', 'tube', 8.50),
  ('FL256', 'Expansion Spacers', 'Installation spacers', 'material', 'set', 12.00),

  -- Vinyl/LVP Materials (FL300-FL349)
  ('FL300', 'Vinyl Plank - Basic', 'Basic luxury vinyl plank', 'material', 'sf', 2.50),
  ('FL301', 'Vinyl Plank - Premium', 'Premium LVP with pad', 'material', 'sf', 4.50),
  ('FL302', 'Vinyl Tile - Basic', 'Basic luxury vinyl tile', 'material', 'sf', 2.25),
  ('FL303', 'Vinyl Tile - Premium', 'Premium LVT', 'material', 'sf', 4.25),
  ('FL304', 'Sheet Vinyl', 'Sheet vinyl flooring', 'material', 'sy', 18.00),
  ('FL305', 'Vinyl Adhesive', 'Vinyl flooring adhesive', 'material', 'gal', 35.00),
  ('FL306', 'Vinyl Seam Sealer', 'Seam sealing compound', 'material', 'tube', 12.00),
  ('FL307', 'Vinyl Transitions', 'Vinyl transition strips', 'material', 'lf', 7.50),
  ('FL308', 'Click Lock Vinyl', 'Click-together vinyl', 'material', 'sf', 3.75),
  ('FL309', 'Rigid Core Vinyl', 'SPC/WPC vinyl plank', 'material', 'sf', 5.25),

  -- Tile Materials (FL350-FL399)
  ('FL350', 'Ceramic Tile - Basic', 'Basic ceramic floor tile', 'material', 'sf', 2.50),
  ('FL351', 'Ceramic Tile - Premium', 'Designer ceramic tile', 'material', 'sf', 5.50),
  ('FL352', 'Porcelain Tile - Basic', 'Basic porcelain tile', 'material', 'sf', 3.50),
  ('FL353', 'Porcelain Tile - Premium', 'Premium porcelain tile', 'material', 'sf', 8.50),
  ('FL354', 'Natural Stone - Marble', 'Marble floor tile', 'material', 'sf', 15.00),
  ('FL355', 'Natural Stone - Granite', 'Granite floor tile', 'material', 'sf', 12.00),
  ('FL356', 'Natural Stone - Slate', 'Slate floor tile', 'material', 'sf', 8.50),
  ('FL357', 'Natural Stone - Travertine', 'Travertine tile', 'material', 'sf', 9.50),
  ('FL358', 'Mosaic Tile', 'Decorative mosaic tile', 'material', 'sf', 18.00),
  ('FL359', 'Large Format Tile', 'Tiles over 15"x15"', 'material', 'sf', 6.50),
  ('FL360', 'Thinset Mortar', 'Modified thinset', 'material', 'bag', 18.00),
  ('FL361', 'Tile Spacers', 'Tile spacing system', 'material', 'bag', 8.50),
  ('FL362', 'Grout - Sanded', 'Sanded tile grout', 'material', 'bag', 15.00),
  ('FL363', 'Grout - Unsanded', 'Unsanded tile grout', 'material', 'bag', 18.00),
  ('FL364', 'Grout Sealer', 'Penetrating grout sealer', 'material', 'qt', 35.00),
  ('FL365', 'Tile Edge Trim', 'Metal edge trim', 'material', 'lf', 12.00),
  ('FL366', 'Crack Isolation', 'Crack isolation membrane', 'material', 'sf', 2.50),
  ('FL367', 'Waterproof Membrane', 'Waterproofing system', 'material', 'sf', 3.50),

  -- Carpet Materials (FL400-FL449)
  ('FL400', 'Carpet - Builder', 'Builder grade carpet', 'material', 'sy', 12.00),
  ('FL401', 'Carpet - Mid-Grade', 'Mid-grade carpet', 'material', 'sy', 22.00),
  ('FL402', 'Carpet - Premium', 'Premium carpet', 'material', 'sy', 38.00),
  ('FL403', 'Carpet - Commercial', 'Commercial grade carpet', 'material', 'sy', 28.00),
  ('FL404', 'Carpet Pad - Basic', 'Basic carpet padding', 'material', 'sy', 4.50),
  ('FL405', 'Carpet Pad - Premium', 'Premium memory foam pad', 'material', 'sy', 8.50),
  ('FL406', 'Carpet Tack Strip', 'Tack strip installation', 'material', 'lf', 2.50),
  ('FL407', 'Carpet Seaming Tape', 'Hot melt seaming tape', 'material', 'lf', 3.50),
  ('FL408', 'Carpet Adhesive', 'Carpet adhesive', 'material', 'gal', 28.00),
  ('FL409', 'Stair Nose', 'Carpet stair nosing', 'material', 'lf', 18.00),

  -- Subfloor and Prep Materials (FL450-FL499)
  ('FL450', 'Plywood Subfloor', '3/4" plywood subfloor', 'material', 'sf', 2.85),
  ('FL451', 'OSB Subfloor', '3/4" OSB subfloor', 'material', 'sf', 1.95),
  ('FL452', 'Cement Board', 'Cement backer board', 'material', 'sf', 1.65),
  ('FL453', 'Self-Leveling Compound', 'Self-leveling underlayment', 'material', 'bag', 32.00),
  ('FL454', 'Floor Patch', 'Floor patching compound', 'material', 'bag', 18.00),
  ('FL455', 'Moisture Barrier', '6 mil plastic sheeting', 'material', 'sf', 0.25),
  ('FL456', 'Sound Barrier', 'Sound dampening mat', 'material', 'sf', 1.85),
  ('FL457', 'Radiant Heat Mat', 'Electric floor heating', 'material', 'sf', 12.00),
  ('FL458', 'Subfloor Adhesive', 'Subfloor adhesive', 'material', 'tube', 6.50),
  ('FL459', 'Floor Screws', 'Subfloor screws', 'material', 'lb', 4.50),

  -- Equipment Rental (FL500-FL549)
  ('FL500', 'Floor Sander', 'Drum sander rental', 'equipment', 'day', 185.00),
  ('FL501', 'Edge Sander', 'Edge sander rental', 'equipment', 'day', 125.00),
  ('FL502', 'Floor Buffer', 'Buffer rental', 'equipment', 'day', 95.00),
  ('FL503', 'Tile Saw', 'Wet tile saw rental', 'equipment', 'day', 85.00),
  ('FL504', 'Demo Tools', 'Floor removal tools', 'equipment', 'day', 125.00),
  ('FL505', 'Carpet Stretcher', 'Power stretcher rental', 'equipment', 'day', 65.00),
  ('FL506', 'Nailer - Hardwood', 'Flooring nailer rental', 'equipment', 'day', 75.00),
  ('FL507', 'Moisture Meter', 'Digital moisture meter', 'equipment', 'day', 45.00),
  ('FL508', 'Floor Scraper', 'Ride-on scraper rental', 'equipment', 'day', 285.00),
  ('FL509', 'HEPA Vacuum', 'HEPA vacuum rental', 'equipment', 'day', 85.00),

  -- Specialty Services (FL600-FL699)
  ('FL600', 'Hardwood Refinishing', 'Sand and refinish hardwood', 'labor', 'sf', 3.50),
  ('FL601', 'Floor Repair', 'Hardwood floor repair', 'labor', 'sf', 8.50),
  ('FL602', 'Water Damage Repair', 'Water damaged floor repair', 'labor', 'sf', 12.00),
  ('FL603', 'Pet Stain Treatment', 'Pet odor and stain treatment', 'service', 'sf', 2.50),
  ('FL604', 'Radiant Heat Install', 'Radiant floor heating', 'subcontractor', 'sf', 18.00),
  ('FL605', 'Custom Inlay', 'Custom floor medallion/border', 'labor', 'sf', 45.00),
  ('FL606', 'Gym Floor Marking', 'Sports floor line marking', 'service', 'court', 2850.00),
  ('FL607', 'Epoxy Coating', 'Epoxy floor coating', 'material', 'sf', 4.50),
  ('FL608', 'Polished Concrete', 'Concrete polishing', 'labor', 'sf', 6.50),
  ('FL609', 'Floor Leveling', 'Major floor leveling', 'labor', 'sf', 4.50),

  -- Maintenance and Cleaning (FL700-FL799)
  ('FL700', 'Hardwood Cleaning', 'Professional hardwood cleaning', 'service', 'sf', 0.75),
  ('FL701', 'Carpet Cleaning', 'Hot water extraction', 'service', 'sf', 0.35),
  ('FL702', 'Tile & Grout Cleaning', 'Professional tile cleaning', 'service', 'sf', 0.85),
  ('FL703', 'Recoating Service', 'Hardwood recoating', 'service', 'sf', 1.85),
  ('FL704', 'Carpet Protection', 'Scotchgard application', 'service', 'sy', 3.50),
  ('FL705', 'Grout Recoloring', 'Grout color sealing', 'service', 'sf', 2.50),
  ('FL706', 'Maintenance Kit', 'Floor care product kit', 'material', 'kit', 85.00),
  ('FL707', 'Annual Maintenance', 'Annual maintenance contract', 'service', 'year', 450.00),

  -- Accessories and Trim (FL800-FL849)
  ('FL800', 'Baseboard - MDF', 'MDF baseboard', 'material', 'lf', 3.50),
  ('FL801', 'Baseboard - Wood', 'Solid wood baseboard', 'material', 'lf', 6.50),
  ('FL802', 'Quarter Round', 'Quarter round molding', 'material', 'lf', 2.50),
  ('FL803', 'Shoe Molding', 'Shoe molding', 'material', 'lf', 2.25),
  ('FL804', 'Threshold - Wood', 'Wood threshold', 'material', 'ea', 35.00),
  ('FL805', 'Threshold - Metal', 'Metal threshold', 'material', 'ea', 28.00),
  ('FL806', 'Stair Nosing', 'Stair nose molding', 'material', 'lf', 22.00),
  ('FL807', 'Reducer Strip', 'Height reducer', 'material', 'lf', 18.00),
  ('FL808', 'T-Molding', 'T-molding transition', 'material', 'lf', 16.00),
  ('FL809', 'Floor Registers', 'HVAC floor vents', 'material', 'ea', 45.00),

  -- Warranties and Protection (FL850-FL899)
  ('FL850', 'Installation Warranty', '1-year labor warranty', 'service', 'year', 0.00),
  ('FL851', 'Extended Warranty', '5-year extended warranty', 'service', 'ls', 385.00),
  ('FL852', 'Lifetime Warranty', 'Lifetime installation warranty', 'service', 'ls', 850.00),
  ('FL853', 'Damage Protection', 'Accidental damage coverage', 'service', 'year', 185.00),

  -- Miscellaneous (FL900-FL999)
  ('FL900', 'Disposal Fee', 'Old flooring disposal', 'service', 'sy', 2.50),
  ('FL901', 'Delivery Charge', 'Material delivery fee', 'service', 'ls', 125.00),
  ('FL902', 'Stairs - Residential', 'Stair installation surcharge', 'labor', 'flight', 450.00),
  ('FL903', 'After Hours Install', 'Evening/weekend surcharge', 'service', 'hour', 45.00),
  ('FL904', 'Small Room Fee', 'Minimum room charge', 'service', 'room', 285.00),
  ('FL905', 'Pattern Layout', 'Complex pattern layout', 'labor', 'room', 385.00),
  ('FL906', 'Asbestos Abatement', 'Asbestos removal', 'subcontractor', 'sf', 8.50),
  ('FL907', 'Lead Paint Removal', 'Lead paint abatement', 'subcontractor', 'sf', 6.50),
  ('FL908', 'Commercial Upcharge', 'Commercial project premium', 'service', 'sf', 0.50)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_flooring ON cost_codes(code) WHERE code LIKE 'FL%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for the flooring industry including all flooring types, installation methods, and services';