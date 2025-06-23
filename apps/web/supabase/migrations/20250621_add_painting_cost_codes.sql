-- Painting Services Cost Codes Migration
-- Comprehensive cost codes for painting contractors

-- Insert Painting Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'painting'),
  NULL
FROM (VALUES
  -- Estimates and Consultations (PT001-PT099)
  ('PT001', 'Color Consultation', 'Professional color selection', 'service', 'hour', 95.00),
  ('PT002', 'Detailed Estimate', 'Written detailed estimate', 'service', 'ls', 185.00),
  ('PT003', 'Sample Application', 'Paint sample on walls', 'service', 'ea', 45.00),
  ('PT004', 'Surface Assessment', 'Condition evaluation', 'service', 'ls', 125.00),
  ('PT005', 'Project Planning', 'Schedule and planning', 'service', 'hour', 85.00),
  ('PT006', 'Design Consultation', 'Designer consultation', 'service', 'hour', 125.00),
  ('PT007', 'Historic Match', 'Historical color matching', 'service', 'ls', 285.00),
  ('PT008', 'Specification Writing', 'Detailed spec creation', 'service', 'ls', 385.00),

  -- Labor Rates (PT100-PT199)
  ('PT100', 'Master Painter', 'Lead painter rate', 'labor', 'hour', 65.00),
  ('PT101', 'Journeyman Painter', 'Experienced painter', 'labor', 'hour', 55.00),
  ('PT102', 'Apprentice Painter', 'Helper/apprentice rate', 'labor', 'hour', 35.00),
  ('PT103', 'Spray Specialist', 'Spray application expert', 'labor', 'hour', 75.00),
  ('PT104', 'Faux Specialist', 'Decorative painter', 'labor', 'hour', 95.00),
  ('PT105', 'Crew Rate - Small', '2-person crew', 'labor', 'hour', 110.00),
  ('PT106', 'Crew Rate - Large', '4-person crew', 'labor', 'hour', 220.00),
  ('PT107', 'Overtime Rate', 'After hours premium', 'labor', 'hour', 82.50),
  ('PT108', 'Weekend Rate', 'Weekend premium', 'labor', 'hour', 71.50),
  ('PT109', 'Night Work', 'Night shift premium', 'labor', 'hour', 78.00),

  -- Interior Painting (PT200-PT299)
  ('PT200', 'Walls - 1 Coat', 'Single coat application', 'labor', 'sf', 0.85),
  ('PT201', 'Walls - 2 Coats', 'Prime and paint', 'labor', 'sf', 1.45),
  ('PT202', 'Walls - 3 Coats', 'Prime and 2 finish coats', 'labor', 'sf', 2.15),
  ('PT203', 'Ceiling - Flat', 'Flat ceiling paint', 'labor', 'sf', 1.25),
  ('PT204', 'Ceiling - Textured', 'Textured ceiling paint', 'labor', 'sf', 1.65),
  ('PT205', 'Ceiling - Vaulted', 'High ceiling premium', 'labor', 'sf', 1.85),
  ('PT206', 'Trim - Brush', 'Brush painted trim', 'labor', 'lf', 2.50),
  ('PT207', 'Trim - Spray', 'Sprayed trim work', 'labor', 'lf', 1.85),
  ('PT208', 'Doors - Flush', 'Flat door painting', 'labor', 'side', 45.00),
  ('PT209', 'Doors - Panel', 'Panel door painting', 'labor', 'side', 65.00),
  ('PT210', 'Windows - Simple', 'Basic window painting', 'labor', 'ea', 85.00),
  ('PT211', 'Windows - Multi-pane', 'Detailed window work', 'labor', 'ea', 145.00),
  ('PT212', 'Closet Interior', 'Closet painting', 'labor', 'ea', 125.00),
  ('PT213', 'Stairwell', 'Stairway painting', 'labor', 'flight', 285.00),
  ('PT214', 'Crown Molding', 'Crown molding paint', 'labor', 'lf', 3.50),
  ('PT215', 'Wainscoting', 'Wainscot painting', 'labor', 'sf', 2.85),
  ('PT216', 'Accent Wall', 'Feature wall painting', 'labor', 'wall', 185.00),

  -- Exterior Painting (PT250-PT299)
  ('PT250', 'Siding - Wood', 'Wood siding painting', 'labor', 'sf', 2.25),
  ('PT251', 'Siding - Vinyl Prep', 'Vinyl siding painting', 'labor', 'sf', 1.85),
  ('PT252', 'Siding - Stucco', 'Stucco painting', 'labor', 'sf', 1.65),
  ('PT253', 'Siding - Brick', 'Brick painting', 'labor', 'sf', 2.85),
  ('PT254', 'Siding - Cedar', 'Cedar siding stain/paint', 'labor', 'sf', 2.45),
  ('PT255', 'Trim - Exterior', 'Exterior trim painting', 'labor', 'lf', 3.50),
  ('PT256', 'Shutters', 'Shutter painting', 'labor', 'pr', 85.00),
  ('PT257', 'Doors - Entry', 'Front door painting', 'labor', 'side', 125.00),
  ('PT258', 'Garage Door', 'Garage door painting', 'labor', 'ea', 285.00),
  ('PT259', 'Fence - Wood', 'Wood fence staining', 'labor', 'sf', 1.45),
  ('PT260', 'Deck - Floor', 'Deck floor staining', 'labor', 'sf', 1.85),
  ('PT261', 'Deck - Rails', 'Deck railing painting', 'labor', 'lf', 4.50),
  ('PT262', 'Pergola/Gazebo', 'Structure staining', 'labor', 'sf', 2.85),
  ('PT263', 'Soffit/Fascia', 'Eave painting', 'labor', 'lf', 4.50),
  ('PT264', 'Foundation', 'Foundation coating', 'labor', 'lf', 3.50),
  ('PT265', 'Metal Roof', 'Metal roof coating', 'labor', 'sf', 2.25),

  -- Surface Preparation (PT300-PT349)
  ('PT300', 'Pressure Washing', 'Power wash surfaces', 'labor', 'sf', 0.35),
  ('PT301', 'Scraping - Light', 'Minor scraping', 'labor', 'sf', 0.65),
  ('PT302', 'Scraping - Heavy', 'Extensive scraping', 'labor', 'sf', 1.45),
  ('PT303', 'Sanding - Hand', 'Hand sanding', 'labor', 'sf', 0.85),
  ('PT304', 'Sanding - Power', 'Power sanding', 'labor', 'sf', 0.55),
  ('PT305', 'Caulking', 'Gap filling and caulking', 'labor', 'lf', 2.50),
  ('PT306', 'Patching - Minor', 'Small hole repairs', 'labor', 'ea', 25.00),
  ('PT307', 'Patching - Major', 'Large repairs', 'labor', 'sf', 8.50),
  ('PT308', 'Primer Application', 'Primer coat', 'labor', 'sf', 0.65),
  ('PT309', 'Stain Blocking', 'Stain blocker application', 'labor', 'sf', 0.85),
  ('PT310', 'Lead Paint Encap', 'Lead paint encapsulation', 'labor', 'sf', 1.85),
  ('PT311', 'Mold Treatment', 'Mold/mildew treatment', 'labor', 'sf', 1.25),
  ('PT312', 'Wood Filler', 'Wood repair and filling', 'labor', 'lf', 4.50),
  ('PT313', 'TSP Cleaning', 'Heavy duty cleaning', 'labor', 'sf', 0.45),
  ('PT314', 'Deglossing', 'Surface deglossing', 'labor', 'sf', 0.35),
  ('PT315', 'Wallpaper Removal', 'Strip wallpaper', 'labor', 'sf', 2.85),

  -- Specialty Finishes (PT350-PT399)
  ('PT350', 'Faux - Sponging', 'Sponge texture finish', 'labor', 'sf', 4.50),
  ('PT351', 'Faux - Rag Rolling', 'Rag rolled texture', 'labor', 'sf', 5.50),
  ('PT352', 'Faux - Marble', 'Marbleizing finish', 'labor', 'sf', 12.00),
  ('PT353', 'Faux - Wood Grain', 'Wood graining', 'labor', 'sf', 8.50),
  ('PT354', 'Venetian Plaster', 'Venetian plaster finish', 'labor', 'sf', 15.00),
  ('PT355', 'Metallic Finish', 'Metallic paint effects', 'labor', 'sf', 6.50),
  ('PT356', 'Textured Paint', 'Textured application', 'labor', 'sf', 3.50),
  ('PT357', 'Distressing', 'Distressed/aged finish', 'labor', 'sf', 5.50),
  ('PT358', 'Stenciling', 'Stencil work', 'labor', 'lf', 18.00),
  ('PT359', 'Mural Work', 'Custom mural painting', 'labor', 'sf', 45.00),
  ('PT360', 'Trompe l\'oeil', 'Illusionary painting', 'labor', 'sf', 65.00),
  ('PT361', 'Glazing', 'Glaze coat application', 'labor', 'sf', 3.50),
  ('PT362', 'Color Washing', 'Color wash technique', 'labor', 'sf', 4.50),
  ('PT363', 'Strié Finish', 'Dragged finish', 'labor', 'sf', 5.50),

  -- Cabinet Painting (PT400-PT449)
  ('PT400', 'Cabinet Doors', 'Door painting only', 'labor', 'door', 85.00),
  ('PT401', 'Cabinet Boxes', 'Cabinet box painting', 'labor', 'lf', 65.00),
  ('PT402', 'Cabinet Interior', 'Inside cabinet painting', 'labor', 'lf', 45.00),
  ('PT403', 'Cabinet Prep', 'Cleaning and sanding', 'labor', 'door', 35.00),
  ('PT404', 'Cabinet Priming', 'Primer application', 'labor', 'door', 25.00),
  ('PT405', 'Cabinet Glazing', 'Glaze finish', 'labor', 'door', 45.00),
  ('PT406', 'Cabinet Removal', 'Remove for spray', 'labor', 'door', 15.00),
  ('PT407', 'Cabinet Reinstall', 'Rehang cabinets', 'labor', 'door', 25.00),
  ('PT408', 'Hardware Removal', 'Remove/label hardware', 'labor', 'set', 85.00),
  ('PT409', 'Hardware Install', 'Reinstall hardware', 'labor', 'set', 65.00),

  -- Commercial Painting (PT450-PT499)
  ('PT450', 'Office - Standard', 'Standard office painting', 'labor', 'sf', 0.85),
  ('PT451', 'Retail Space', 'Retail store painting', 'labor', 'sf', 0.95),
  ('PT452', 'Warehouse', 'Warehouse painting', 'labor', 'sf', 0.65),
  ('PT453', 'Restaurant', 'Restaurant painting', 'labor', 'sf', 1.25),
  ('PT454', 'Medical Facility', 'Healthcare painting', 'labor', 'sf', 1.45),
  ('PT455', 'School/Education', 'Educational facility', 'labor', 'sf', 0.95),
  ('PT456', 'High Rise', 'High rise premium', 'labor', 'sf', 1.85),
  ('PT457', 'Parking Garage', 'Garage painting', 'labor', 'sf', 0.85),
  ('PT458', 'Industrial', 'Industrial coating', 'labor', 'sf', 1.65),

  -- Paint Materials (PT500-PT549)
  ('PT500', 'Paint - Interior Flat', 'Flat wall paint', 'material', 'gal', 35.00),
  ('PT501', 'Paint - Interior Eggshell', 'Eggshell finish', 'material', 'gal', 38.00),
  ('PT502', 'Paint - Interior Satin', 'Satin finish', 'material', 'gal', 42.00),
  ('PT503', 'Paint - Interior Semi-Gloss', 'Semi-gloss finish', 'material', 'gal', 45.00),
  ('PT504', 'Paint - Exterior Flat', 'Exterior flat', 'material', 'gal', 45.00),
  ('PT505', 'Paint - Exterior Satin', 'Exterior satin', 'material', 'gal', 48.00),
  ('PT506', 'Paint - Exterior Gloss', 'Exterior gloss', 'material', 'gal', 52.00),
  ('PT507', 'Primer - Interior', 'Interior primer', 'material', 'gal', 28.00),
  ('PT508', 'Primer - Exterior', 'Exterior primer', 'material', 'gal', 35.00),
  ('PT509', 'Primer - Stain Block', 'Stain blocking primer', 'material', 'gal', 45.00),
  ('PT510', 'Stain - Transparent', 'Clear wood stain', 'material', 'gal', 42.00),
  ('PT511', 'Stain - Semi-Trans', 'Semi-transparent stain', 'material', 'gal', 45.00),
  ('PT512', 'Stain - Solid', 'Solid color stain', 'material', 'gal', 48.00),
  ('PT513', 'Specialty Coating', 'Special purpose paint', 'material', 'gal', 85.00),

  -- Equipment and Supplies (PT550-PT599)
  ('PT550', 'Drop Cloths', 'Canvas drop cloths', 'material', 'ea', 45.00),
  ('PT551', 'Plastic Sheeting', 'Plastic protection', 'material', 'roll', 35.00),
  ('PT552', 'Masking Tape', 'Painter\'s tape', 'material', 'roll', 8.50),
  ('PT553', 'Brushes - Set', 'Professional brush set', 'material', 'set', 85.00),
  ('PT554', 'Rollers - Set', 'Roller and covers', 'material', 'set', 45.00),
  ('PT555', 'Spray Equipment', 'Airless sprayer rental', 'equipment', 'day', 185.00),
  ('PT556', 'Ladder Rental', 'Extension ladder', 'equipment', 'day', 85.00),
  ('PT557', 'Scaffolding', 'Scaffold rental', 'equipment', 'day', 125.00),
  ('PT558', 'Lift Rental', 'Boom lift rental', 'equipment', 'day', 485.00),

  -- Wallcovering (PT600-PT649)
  ('PT600', 'Wallpaper Install', 'Standard wallpaper', 'labor', 'roll', 85.00),
  ('PT601', 'Vinyl Install', 'Commercial vinyl', 'labor', 'sy', 12.00),
  ('PT602', 'Fabric Install', 'Fabric wallcovering', 'labor', 'sy', 18.00),
  ('PT603', 'Mural Install', 'Wall mural installation', 'labor', 'sf', 8.50),
  ('PT604', 'Border Install', 'Wallpaper border', 'labor', 'lf', 4.50),
  ('PT605', 'Removal - Easy', 'Strippable removal', 'labor', 'sf', 1.85),
  ('PT606', 'Removal - Difficult', 'Difficult removal', 'labor', 'sf', 3.85),

  -- Floor Coatings (PT650-PT699)
  ('PT650', 'Epoxy - 1 Coat', 'Single coat epoxy', 'labor', 'sf', 2.85),
  ('PT651', 'Epoxy - 2 Coat', 'Two coat system', 'labor', 'sf', 4.50),
  ('PT652', 'Epoxy - Decorative', 'Decorative chips', 'labor', 'sf', 5.50),
  ('PT653', 'Concrete Stain', 'Concrete staining', 'labor', 'sf', 3.50),
  ('PT654', 'Concrete Seal', 'Concrete sealer', 'labor', 'sf', 1.85),
  ('PT655', 'Line Striping', 'Parking line striping', 'labor', 'lf', 2.50),
  ('PT656', 'Safety Markings', 'Safety floor markings', 'labor', 'sf', 4.50),

  -- Protective Services (PT700-PT749)
  ('PT700', 'Lead Testing', 'Lead paint testing', 'service', 'sample', 45.00),
  ('PT701', 'Lead Abatement', 'Lead paint removal', 'subcontractor', 'sf', 12.00),
  ('PT702', 'Asbestos Testing', 'Asbestos testing', 'service', 'sample', 125.00),
  ('PT703', 'Surface Protection', 'Protective covering', 'labor', 'sf', 0.45),
  ('PT704', 'Furniture Moving', 'Move/cover furniture', 'labor', 'room', 85.00),
  ('PT705', 'Dust Control', 'Dust containment system', 'service', 'day', 125.00),

  -- Restoration Services (PT750-PT799)
  ('PT750', 'Historic Restoration', 'Historical paint restoration', 'labor', 'sf', 8.50),
  ('PT751', 'Window Restoration', 'Window glazing/painting', 'labor', 'window', 385.00),
  ('PT752', 'Trim Restoration', 'Detailed trim restoration', 'labor', 'lf', 12.00),
  ('PT753', 'Plaster Repair', 'Plaster patching', 'labor', 'sf', 18.00),

  -- Warranties and Cleanup (PT800-PT849)
  ('PT800', 'Labor Warranty', '2-year labor warranty', 'service', 'job', 0.00),
  ('PT801', 'Material Warranty', 'Paint warranty', 'service', 'job', 0.00),
  ('PT802', 'Touch-up Kit', 'Touch-up paint kit', 'material', 'kit', 45.00),
  ('PT803', 'Annual Touch-up', 'Annual touch-up service', 'service', 'visit', 285.00),
  ('PT804', 'Daily Cleanup', 'Daily site cleanup', 'labor', 'day', 85.00),
  ('PT805', 'Final Cleanup', 'Project completion cleanup', 'service', 'ls', 285.00),

  -- Project Management (PT850-PT899)
  ('PT850', 'Supervision', 'Project supervision', 'labor', 'day', 485.00),
  ('PT851', 'Coordination', 'Multi-trade coordination', 'service', 'week', 850.00),
  ('PT852', 'Quality Control', 'QC inspection', 'service', 'inspection', 285.00),
  ('PT853', 'Progress Photos', 'Documentation photos', 'service', 'set', 125.00),

  -- Miscellaneous (PT900-PT999)
  ('PT900', 'Mobilization', 'Job setup/breakdown', 'service', 'ls', 385.00),
  ('PT901', 'Travel Charge', 'Extended area travel', 'service', 'mile', 1.25),
  ('PT902', 'Permit Fee', 'Painting permit', 'service', 'ls', 185.00),
  ('PT903', 'Rush Service', 'Expedited service', 'service', 'job', 0.25),
  ('PT904', 'Night Premium', 'Night work premium', 'service', 'hour', 35.00),
  ('PT905', 'Weekend Premium', 'Weekend work premium', 'service', 'day', 285.00),
  ('PT906', 'Small Job Fee', 'Minimum job charge', 'service', 'ls', 485.00),
  ('PT907', 'Color Match', 'Custom color matching', 'service', 'ea', 85.00),
  ('PT908', 'Paint Disposal', 'Old paint disposal', 'service', 'gal', 8.50)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_painting ON cost_codes(code) WHERE code LIKE 'PT%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for painting contractors including interior, exterior, specialty finishes, and commercial work';