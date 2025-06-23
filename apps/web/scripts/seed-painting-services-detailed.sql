-- Seed detailed service options for Painting industry
-- Industry ID: f21253bb-9996-4118-a6e7-4dc243d0ff85

-- Interior Painting Service Options
-- Service ID: d317408a-f28f-4ab9-944b-a7a7e85db5f4
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order, materials_list)
VALUES
  -- Door Painting Options
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Interior Door - Basic', 'Door only, no casing or frame', 65.00, 'door', 1.0, 'standard', 12, true, true, 1, ARRAY['Primer:1:coat', 'Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Interior Door - With Casing', 'Door, frame, and casing complete', 95.00, 'door', 1.5, 'standard', 12, true, true, 2, ARRAY['Primer:1:coat', 'Paint:2:coats', 'Casing Paint:1:set']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Interior Door - One Side', 'Single side only', 45.00, 'door', 0.75, 'standard', 12, true, false, 3, ARRAY['Primer:1:coat', 'Paint:1:coat']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Interior Door - Premium', 'Both sides, premium paint & finish', 125.00, 'door', 2.0, 'premium', 24, true, false, 4, ARRAY['Premium Primer:1:coat', 'Premium Paint:3:coats', 'Clear Finish:1:coat']),
  
  -- Trim & Molding Options
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Baseboards - Standard', 'Prep, prime, and paint', 3.50, 'linear ft', 0.05, 'standard', 12, true, true, 5, ARRAY['Primer:1:coat', 'Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Crown Molding - Simple', 'Basic crown molding', 4.50, 'linear ft', 0.08, 'standard', 12, true, false, 6, ARRAY['Primer:1:coat', 'Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Crown Molding - Complex', 'Detailed or multi-piece crown', 6.50, 'linear ft', 0.12, 'premium', 12, true, false, 7, ARRAY['Primer:1:coat', 'Paint:2:coats', 'Detail Work:1:set']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Window Trim', 'Complete window casing', 45.00, 'window', 0.75, 'standard', 12, true, false, 8, ARRAY['Primer:1:coat', 'Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Chair Rail', 'Chair rail molding', 3.00, 'linear ft', 0.04, 'standard', 12, true, false, 9, ARRAY['Primer:1:coat', 'Paint:2:coats']),
  
  -- Wall Painting Options
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Prime Walls - 1 Coat', 'Single primer coat', 0.85, 'sqft', 0.01, 'standard', 6, true, true, 10, ARRAY['Primer:1:coat']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Prime Walls - 2 Coats', 'Double primer for stain blocking', 1.35, 'sqft', 0.015, 'standard', 6, true, false, 11, ARRAY['Primer:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Walls - 1 Coat', 'Single coat paint application', 1.25, 'sqft', 0.012, 'standard', 12, true, false, 12, ARRAY['Paint:1:coat']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Walls - 2 Coats', 'Standard two coat application', 1.85, 'sqft', 0.02, 'standard', 12, true, true, 13, ARRAY['Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Walls - Premium 3 Coats', 'Premium paint with 3 coats', 2.85, 'sqft', 0.03, 'premium', 24, true, false, 14, ARRAY['Premium Paint:3:coats']),
  
  -- Ceiling Painting Options
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Prime Ceiling - 1 Coat', 'Ceiling primer application', 0.95, 'sqft', 0.012, 'standard', 6, true, false, 15, ARRAY['Ceiling Primer:1:coat']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Ceiling - Flat White', 'Standard ceiling paint', 1.45, 'sqft', 0.018, 'standard', 12, true, true, 16, ARRAY['Ceiling Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Ceiling - Custom Color', 'Colored ceiling paint', 1.85, 'sqft', 0.022, 'standard', 12, true, false, 17, ARRAY['Primer:1:coat', 'Custom Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Textured Ceiling', 'Popcorn or textured ceiling', 2.25, 'sqft', 0.03, 'standard', 12, true, false, 18, ARRAY['Primer:1:coat', 'Paint:2:coats', 'Texture Spray:1:coat']),
  
  -- Specialty Areas
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Closet Interior', 'Walls, ceiling, and shelves', 185.00, 'closet', 3.0, 'standard', 12, true, false, 19, ARRAY['Primer:1:coat', 'Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Bathroom - Small', 'Complete bathroom under 50 sqft', 385.00, 'room', 6.0, 'premium', 24, true, false, 20, ARRAY['Moisture Primer:1:coat', 'Bathroom Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Kitchen Cabinets', 'Cabinet boxes and doors', 125.00, 'linear ft', 2.0, 'premium', 24, true, true, 21, ARRAY['Deglosser:1:application', 'Bonding Primer:1:coat', 'Cabinet Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Paint Stairway', 'Walls, ceiling, and handrail', 485.00, 'stairway', 8.0, 'standard', 12, true, false, 22, ARRAY['Primer:1:coat', 'Paint:2:coats', 'Handrail Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Accent Wall - Standard', 'Single accent wall', 285.00, 'wall', 4.0, 'standard', 12, true, true, 23, ARRAY['Primer:1:coat', 'Accent Paint:2:coats']),
  (gen_random_uuid(), 'd317408a-f28f-4ab9-944b-a7a7e85db5f4', NULL, 'Accent Wall - Designer', 'Special technique or pattern', 485.00, 'wall', 6.0, 'premium', 24, true, false, 24, ARRAY['Base Coat:1:coat', 'Designer Paint:2:coats', 'Glaze:1:coat']);

-- Exterior Painting Service Options
-- Service ID: d80b8e4e-559b-41d2-806c-82032428fa14
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order, materials_list)
VALUES
  -- Exterior Doors
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Entry Door - Basic', 'Front door only, one color', 185.00, 'door', 3.0, 'standard', 24, true, true, 1, ARRAY['Primer:1:coat', 'Exterior Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Entry Door - Complete', 'Door, frame, and trim', 285.00, 'door', 4.0, 'standard', 24, true, false, 2, ARRAY['Primer:1:coat', 'Exterior Paint:2:coats', 'Trim Paint:1:set']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Garage Door - Single', 'Single car garage door', 285.00, 'door', 4.0, 'standard', 24, true, false, 3, ARRAY['Primer:1:coat', 'Exterior Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Garage Door - Double', 'Double car garage door', 485.00, 'door', 6.0, 'standard', 24, true, true, 4, ARRAY['Primer:1:coat', 'Exterior Paint:2:coats']),
  
  -- Siding Options
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Wood Siding', 'Prep and paint wood siding', 3.25, 'sqft', 0.04, 'standard', 36, true, true, 5, ARRAY['Primer:1:coat', 'Exterior Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Vinyl Siding', 'Special vinyl-safe paint', 2.85, 'sqft', 0.035, 'premium', 24, true, false, 6, ARRAY['Vinyl Primer:1:coat', 'Vinyl Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Stucco', 'Elastomeric coating for stucco', 2.45, 'sqft', 0.03, 'premium', 36, true, false, 7, ARRAY['Masonry Primer:1:coat', 'Elastomeric Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Hardy Board', 'Fiber cement siding', 2.65, 'sqft', 0.032, 'standard', 36, true, false, 8, ARRAY['Primer:1:coat', 'Exterior Paint:2:coats']),
  
  -- Trim & Detail Work
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Exterior Trim', 'Window and door trim', 5.50, 'linear ft', 0.08, 'standard', 24, true, true, 9, ARRAY['Primer:1:coat', 'Trim Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Fascia Board', 'Roof fascia boards', 6.50, 'linear ft', 0.1, 'standard', 24, true, false, 10, ARRAY['Primer:1:coat', 'Exterior Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Soffit', 'Under-eave soffit areas', 4.50, 'linear ft', 0.06, 'standard', 24, true, false, 11, ARRAY['Primer:1:coat', 'Exterior Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Shutters', 'Window shutters per pair', 85.00, 'pair', 1.5, 'standard', 24, true, false, 12, ARRAY['Primer:1:coat', 'Shutter Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Gutters & Downspouts', 'Complete gutter system', 4.25, 'linear ft', 0.05, 'standard', 24, true, false, 13, ARRAY['Metal Primer:1:coat', 'Gutter Paint:2:coats']),
  
  -- Fence & Deck
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Wood Fence - One Side', 'Single side application', 2.25, 'sqft', 0.025, 'standard', 24, true, false, 14, ARRAY['Exterior Stain:1:coat']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Wood Fence - Both Sides', 'Complete fence painting', 3.85, 'sqft', 0.045, 'standard', 24, true, true, 15, ARRAY['Exterior Stain:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Stain Deck - Basic', 'Deck surface only', 2.85, 'sqft', 0.03, 'standard', 18, true, true, 16, ARRAY['Deck Cleaner:1:application', 'Deck Stain:1:coat']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Stain Deck - Complete', 'Deck, rails, and stairs', 3.85, 'sqft', 0.04, 'premium', 24, true, false, 17, ARRAY['Deck Cleaner:1:application', 'Deck Stain:2:coats']),
  
  -- Specialty Exterior
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Porch Ceiling', 'Covered porch ceiling', 2.25, 'sqft', 0.025, 'standard', 24, true, false, 18, ARRAY['Primer:1:coat', 'Porch Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Paint Brick - Small Area', 'Accent brick or chimney', 4.85, 'sqft', 0.06, 'premium', 36, true, false, 19, ARRAY['Masonry Primer:1:coat', 'Masonry Paint:2:coats']),
  (gen_random_uuid(), 'd80b8e4e-559b-41d2-806c-82032428fa14', NULL, 'Power Wash - Prep Only', 'Pressure wash before painting', 0.45, 'sqft', 0.005, 'standard', 0, true, true, 20, ARRAY['Cleaning Solution:1:application']);

-- Cabinet Refinishing Service Options
-- Service ID: cbfd4fe7-67ee-4c33-aec8-6c36b5eb94b3
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order, materials_list)
VALUES
  (gen_random_uuid(), 'cbfd4fe7-67ee-4c33-aec8-6c36b5eb94b3', NULL, 'Cabinet Doors Only', 'Paint cabinet doors, not boxes', 85.00, 'door', 1.5, 'standard', 24, true, true, 1, ARRAY['Deglosser:1:application', 'Primer:1:coat', 'Paint:2:coats']),
  (gen_random_uuid(), 'cbfd4fe7-67ee-4c33-aec8-6c36b5eb94b3', NULL, 'Complete Cabinet Refinish', 'Doors, drawers, and boxes', 145.00, 'linear ft', 2.5, 'premium', 36, true, false, 2, ARRAY['Deglosser:1:application', 'Bonding Primer:1:coat', 'Cabinet Paint:2:coats', 'Clear Coat:1:coat']),
  (gen_random_uuid(), 'cbfd4fe7-67ee-4c33-aec8-6c36b5eb94b3', NULL, 'Cabinet Staining', 'Stain grade wood cabinets', 185.00, 'linear ft', 3.0, 'premium', 36, true, false, 3, ARRAY['Strip Finish:1:application', 'Wood Stain:1:coat', 'Clear Finish:3:coats']),
  (gen_random_uuid(), 'cbfd4fe7-67ee-4c33-aec8-6c36b5eb94b3', NULL, 'Cabinet Touch-Up', 'Minor repairs and touch-ups', 65.00, 'hour', 1.0, 'standard', 12, true, false, 4, ARRAY['Touch-up Paint:1:set', 'Clear Coat:1:application']);

-- Staining & Sealing Service Options
-- Service ID: 362bfe19-1fe8-4997-8ad7-f30cdecc0b8a
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order, materials_list)
VALUES
  (gen_random_uuid(), '362bfe19-1fe8-4997-8ad7-f30cdecc0b8a', NULL, 'Deck Stain & Seal', 'Complete deck treatment', 3.85, 'sqft', 0.04, 'premium', 24, true, true, 1, ARRAY['Deck Cleaner:1:application', 'Stain:1:coat', 'Sealer:1:coat']),
  (gen_random_uuid(), '362bfe19-1fe8-4997-8ad7-f30cdecc0b8a', NULL, 'Fence Stain - Natural', 'Semi-transparent stain', 2.85, 'sqft', 0.03, 'standard', 18, true, false, 2, ARRAY['Wood Cleaner:1:application', 'Stain:1:coat']),
  (gen_random_uuid(), '362bfe19-1fe8-4997-8ad7-f30cdecc0b8a', NULL, 'Concrete Stain', 'Decorative concrete staining', 4.25, 'sqft', 0.05, 'premium', 36, true, false, 3, ARRAY['Concrete Prep:1:application', 'Acid Stain:1:coat', 'Sealer:2:coats']),
  (gen_random_uuid(), '362bfe19-1fe8-4997-8ad7-f30cdecc0b8a', NULL, 'Wood Door Stain', 'Exterior door staining', 285.00, 'door', 4.0, 'premium', 24, true, false, 4, ARRAY['Strip Old Finish:1:application', 'Wood Stain:1:coat', 'Exterior Varnish:3:coats']),
  (gen_random_uuid(), '362bfe19-1fe8-4997-8ad7-f30cdecc0b8a', NULL, 'Log Home Stain', 'Log siding treatment', 5.85, 'sqft', 0.07, 'premium', 36, true, false, 5, ARRAY['Log Cleaner:1:application', 'Log Stain:2:coats', 'UV Protectant:1:coat']);

-- Drywall Repair & Texture Service Options  
-- Service ID: 11977d9e-048f-45e9-ac95-d10effc6a63b
INSERT INTO service_options (id, service_id, organization_id, name, description, price, unit, estimated_hours, material_quality, warranty_months, is_active, is_popular, display_order, materials_list)
VALUES
  (gen_random_uuid(), '11977d9e-048f-45e9-ac95-d10effc6a63b', NULL, 'Small Hole Repair', 'Nail holes and small dents', 85.00, 'repair', 1.0, 'standard', 12, true, true, 1, ARRAY['Spackle:1:application', 'Primer:1:coat', 'Paint:2:coats']),
  (gen_random_uuid(), '11977d9e-048f-45e9-ac95-d10effc6a63b', NULL, 'Large Hole Patch', 'Holes up to 8 inches', 185.00, 'repair', 2.5, 'standard', 12, true, false, 2, ARRAY['Drywall Patch:1:piece', 'Joint Compound:3:coats', 'Primer:1:coat', 'Paint:2:coats']),
  (gen_random_uuid(), '11977d9e-048f-45e9-ac95-d10effc6a63b', NULL, 'Texture Matching', 'Match existing wall texture', 4.85, 'sqft', 0.06, 'premium', 12, true, false, 3, ARRAY['Joint Compound:1:coat', 'Texture Material:1:application', 'Primer:1:coat', 'Paint:2:coats']),
  (gen_random_uuid(), '11977d9e-048f-45e9-ac95-d10effc6a63b', NULL, 'Skim Coat Walls', 'Smooth damaged walls', 2.85, 'sqft', 0.035, 'standard', 12, true, false, 4, ARRAY['Joint Compound:2:coats', 'Primer:1:coat']),
  (gen_random_uuid(), '11977d9e-048f-45e9-ac95-d10effc6a63b', NULL, 'Popcorn Ceiling Repair', 'Patch popcorn texture', 6.85, 'sqft', 0.08, 'standard', 12, true, false, 5, ARRAY['Patch Material:1:application', 'Texture Spray:1:coat', 'Ceiling Paint:1:coat']);