-- Property Management Cost Codes Migration
-- Comprehensive cost codes for property management companies

-- Insert Property Management Cost Codes
INSERT INTO cost_codes (code, name, description, category, unit, base_price, industry_id, organization_id) 
SELECT 
  code, name, description, category, unit, base_price,
  (SELECT id FROM industries WHERE slug = 'property-management'),
  NULL
FROM (VALUES
  -- Management Services (PM001-PM099)
  ('PM001', 'Property Management Fee', 'Monthly management fee', 'service', 'month', 0.08),
  ('PM002', 'Leasing Fee', 'Tenant placement fee', 'service', 'month', 1.00),
  ('PM003', 'Renewal Fee', 'Lease renewal processing', 'service', 'ls', 250.00),
  ('PM004', 'Setup Fee', 'New property onboarding', 'service', 'ls', 350.00),
  ('PM005', 'Marketing Fee', 'Property advertising', 'service', 'month', 185.00),
  ('PM006', 'Showing Fee', 'Property showing service', 'service', 'showing', 45.00),
  ('PM007', 'Application Processing', 'Tenant application review', 'service', 'app', 45.00),
  ('PM008', 'Background Check', 'Tenant screening service', 'service', 'ea', 65.00),
  ('PM009', 'Credit Check', 'Credit report and analysis', 'service', 'ea', 35.00),
  ('PM010', 'Eviction Processing', 'Eviction coordination', 'service', 'ls', 850.00),
  ('PM011', 'Court Appearance', 'Legal representation', 'service', 'hour', 185.00),
  ('PM012', 'Property Inspection', 'Routine property inspection', 'service', 'ea', 125.00),
  ('PM013', 'Move-In Inspection', 'Initial condition report', 'service', 'ea', 185.00),
  ('PM014', 'Move-Out Inspection', 'Final condition assessment', 'service', 'ea', 185.00),
  ('PM015', '24/7 Emergency', 'Emergency response service', 'service', 'month', 85.00),

  -- Administrative Services (PM100-PM199)
  ('PM100', 'Rent Collection', 'Monthly rent processing', 'service', 'month', 25.00),
  ('PM101', 'Late Fee Collection', 'Late payment processing', 'service', 'ea', 35.00),
  ('PM102', 'Financial Reporting', 'Monthly financial statements', 'service', 'month', 65.00),
  ('PM103', 'Tax Document Prep', 'Annual 1099 preparation', 'service', 'year', 125.00),
  ('PM104', 'Budget Planning', 'Annual budget creation', 'service', 'year', 285.00),
  ('PM105', 'Insurance Coordination', 'Insurance claim handling', 'service', 'claim', 185.00),
  ('PM106', 'HOA Liaison', 'HOA communication service', 'service', 'month', 45.00),
  ('PM107', 'Utility Management', 'Utility account management', 'service', 'month', 35.00),
  ('PM108', 'Vendor Management', 'Contractor coordination', 'service', 'month', 85.00),
  ('PM109', 'Document Storage', 'Digital document management', 'service', 'month', 25.00),

  -- Maintenance Coordination (PM200-PM299)
  ('PM200', 'Maintenance Call', 'Maintenance request handling', 'service', 'call', 35.00),
  ('PM201', 'Emergency Call', 'After-hours emergency', 'service', 'call', 125.00),
  ('PM202', 'Vendor Dispatch', 'Contractor scheduling', 'service', 'dispatch', 45.00),
  ('PM203', 'Work Order Mgmt', 'Work order tracking', 'service', 'order', 25.00),
  ('PM204', 'Quality Control', 'Repair quality inspection', 'service', 'inspection', 65.00),
  ('PM205', 'Preventive Maint', 'Scheduled maintenance program', 'service', 'month', 125.00),
  ('PM206', 'Seasonal Prep', 'Seasonal maintenance', 'service', 'season', 285.00),
  ('PM207', 'Warranty Tracking', 'Warranty management', 'service', 'month', 35.00),

  -- Turnover Services (PM300-PM349)
  ('PM300', 'Turnover Coordination', 'Full turnover management', 'service', 'unit', 485.00),
  ('PM301', 'Make-Ready Inspection', 'Pre-rental inspection', 'service', 'ea', 185.00),
  ('PM302', 'Cleaning Coordination', 'Cleaning service scheduling', 'service', 'ea', 65.00),
  ('PM303', 'Paint Touch-Up', 'Minor paint coordination', 'service', 'room', 45.00),
  ('PM304', 'Carpet Cleaning', 'Carpet cleaning arrangement', 'service', 'unit', 85.00),
  ('PM305', 'Key Management', 'Key/lock service', 'service', 'set', 125.00),
  ('PM306', 'Utility Transfer', 'Utility account changes', 'service', 'ea', 45.00),

  -- Property Services (PM350-PM399)
  ('PM350', 'Lawn Service', 'Lawn maintenance program', 'service', 'month', 125.00),
  ('PM351', 'Snow Removal', 'Snow removal coordination', 'service', 'event', 185.00),
  ('PM352', 'Pool Service', 'Pool maintenance program', 'service', 'month', 285.00),
  ('PM353', 'Pest Control', 'Pest management program', 'service', 'quarter', 125.00),
  ('PM354', 'HVAC Service', 'HVAC maintenance contract', 'service', 'year', 385.00),
  ('PM355', 'Gutter Cleaning', 'Gutter service coordination', 'service', 'ea', 185.00),
  ('PM356', 'Window Cleaning', 'Window cleaning service', 'service', 'ea', 125.00),
  ('PM357', 'Pressure Washing', 'Exterior cleaning service', 'service', 'ea', 285.00),

  -- Compliance and Legal (PM400-PM449)
  ('PM400', 'Fair Housing Compliance', 'FHA compliance monitoring', 'service', 'month', 85.00),
  ('PM401', 'Safety Inspections', 'Safety compliance checks', 'service', 'year', 285.00),
  ('PM402', 'Code Compliance', 'Building code monitoring', 'service', 'month', 65.00),
  ('PM403', 'License Renewal', 'Business license handling', 'service', 'year', 185.00),
  ('PM404', 'Legal Notices', 'Legal notice preparation', 'service', 'ea', 85.00),
  ('PM405', 'Lease Preparation', 'Custom lease drafting', 'service', 'ea', 285.00),
  ('PM406', 'Addendum Creation', 'Lease addendum drafting', 'service', 'ea', 125.00),

  -- Marketing Services (PM450-PM499)
  ('PM450', 'Photography', 'Professional property photos', 'service', 'session', 285.00),
  ('PM451', 'Virtual Tour', '3D virtual tour creation', 'service', 'ea', 485.00),
  ('PM452', 'Drone Photography', 'Aerial property photos', 'service', 'session', 385.00),
  ('PM453', 'Listing Creation', 'MLS and online listings', 'service', 'ea', 125.00),
  ('PM454', 'Social Media', 'Social media marketing', 'service', 'month', 185.00),
  ('PM455', 'Print Advertising', 'Traditional advertising', 'service', 'ad', 285.00),
  ('PM456', 'Yard Sign', 'For rent sign placement', 'service', 'ea', 85.00),
  ('PM457', 'Flyer Creation', 'Property flyer design', 'service', 'ea', 125.00),

  -- Technology Services (PM500-PM549)
  ('PM500', 'Owner Portal', 'Online owner access', 'service', 'month', 25.00),
  ('PM501', 'Tenant Portal', 'Online tenant access', 'service', 'month', 15.00),
  ('PM502', 'Online Payments', 'Electronic payment processing', 'service', 'trans', 3.50),
  ('PM503', 'Mobile App Access', 'Mobile app service', 'service', 'month', 10.00),
  ('PM504', 'Smart Lock Service', 'Smart lock management', 'service', 'month', 35.00),
  ('PM505', 'Security Monitoring', 'Security system monitoring', 'service', 'month', 45.00),

  -- Specialty Properties (PM550-PM599)
  ('PM550', 'Vacation Rental Mgmt', 'Short-term rental management', 'service', 'month', 0.25),
  ('PM551', 'HOA Management', 'Homeowners association mgmt', 'service', 'month', 8.50),
  ('PM552', 'Commercial Mgmt', 'Commercial property mgmt', 'service', 'month', 0.06),
  ('PM553', 'Multi-Family Mgmt', 'Apartment complex mgmt', 'service', 'unit', 85.00),
  ('PM554', 'Senior Housing Mgmt', 'Senior living management', 'service', 'unit', 125.00),
  ('PM555', 'Student Housing Mgmt', 'Student rental management', 'service', 'bed', 65.00),

  -- Financial Services (PM600-PM649)
  ('PM600', 'Security Deposit Mgmt', 'Deposit handling', 'service', 'ea', 45.00),
  ('PM601', 'Rent Increase Analysis', 'Market rate analysis', 'service', 'ea', 185.00),
  ('PM602', 'CAM Reconciliation', 'Common area maintenance', 'service', 'year', 850.00),
  ('PM603', 'Budget Analysis', 'Financial performance review', 'service', 'quarter', 285.00),
  ('PM604', 'Cash Flow Report', 'Cash flow analysis', 'service', 'month', 85.00),
  ('PM605', 'Reserve Study', 'Reserve fund analysis', 'service', 'ea', 1850.00),

  -- Tenant Services (PM650-PM699)
  ('PM650', 'Tenant Relations', 'Tenant communication service', 'service', 'month', 45.00),
  ('PM651', 'Renewal Negotiation', 'Lease renewal talks', 'service', 'ea', 185.00),
  ('PM652', 'Tenant Retention', 'Retention program', 'service', 'month', 65.00),
  ('PM653', 'Welcome Package', 'New tenant welcome', 'service', 'ea', 85.00),
  ('PM654', 'Tenant Events', 'Community event planning', 'service', 'event', 485.00),

  -- Emergency Services (PM700-PM749)
  ('PM700', 'Flood Response', 'Water damage response', 'service', 'ea', 485.00),
  ('PM701', 'Fire Response', 'Fire damage coordination', 'service', 'ea', 685.00),
  ('PM702', 'Storm Damage', 'Storm damage response', 'service', 'ea', 585.00),
  ('PM703', 'Security Breach', 'Break-in response', 'service', 'ea', 385.00),
  ('PM704', 'HVAC Emergency', 'Heating/cooling emergency', 'service', 'ea', 285.00),
  ('PM705', 'Plumbing Emergency', 'Major leak response', 'service', 'ea', 285.00),

  -- Consulting Services (PM750-PM799)
  ('PM750', 'Property Analysis', 'Investment property analysis', 'service', 'ea', 850.00),
  ('PM751', 'Acquisition Support', 'Purchase evaluation', 'service', 'hour', 185.00),
  ('PM752', 'Disposition Support', 'Sales preparation', 'service', 'hour', 185.00),
  ('PM753', 'Renovation Planning', 'Renovation consultation', 'service', 'hour', 125.00),
  ('PM754', 'Market Analysis', 'Rental market study', 'service', 'ea', 485.00),

  -- Additional Fees (PM800-PM849)
  ('PM800', 'NSF Fee', 'Returned check fee', 'service', 'ea', 45.00),
  ('PM801', 'Pet Screening', 'Pet application review', 'service', 'pet', 35.00),
  ('PM802', 'Extra Occupant', 'Additional tenant fee', 'service', 'month', 50.00),
  ('PM803', 'Storage Access', 'Storage unit management', 'service', 'month', 25.00),
  ('PM804', 'Parking Management', 'Parking space allocation', 'service', 'space', 85.00),

  -- Project Management (PM850-PM899)
  ('PM850', 'Renovation Mgmt', 'Major renovation oversight', 'service', 'hour', 125.00),
  ('PM851', 'Capital Improvement', 'Capital project management', 'service', 'project', 0.10),
  ('PM852', 'Vendor Bidding', 'Bid solicitation service', 'service', 'bid', 285.00),
  ('PM853', 'Project Inspection', 'Construction inspection', 'service', 'visit', 185.00),
  ('PM854', 'Permit Coordination', 'Permit application handling', 'service', 'permit', 385.00),

  -- Miscellaneous (PM900-PM999)
  ('PM900', 'Travel Fee', 'Property visit travel', 'service', 'mile', 0.65),
  ('PM901', 'After Hours Fee', 'After hours service', 'service', 'hour', 125.00),
  ('PM902', 'Holiday Fee', 'Holiday service premium', 'service', 'ea', 185.00),
  ('PM903', 'Rush Service', 'Expedited service fee', 'service', 'ea', 125.00),
  ('PM904', 'Termination Fee', 'Early termination charge', 'service', 'ls', 485.00),
  ('PM905', 'Reinstatement Fee', 'Service reinstatement', 'service', 'ls', 285.00),
  ('PM906', 'Training Fee', 'Owner training session', 'service', 'hour', 125.00),
  ('PM907', 'Consulting Fee', 'General consulting', 'service', 'hour', 185.00)
) AS codes(code, name, description, category, unit, base_price)
WHERE NOT EXISTS (
  SELECT 1 FROM cost_codes 
  WHERE cost_codes.code = codes.code 
  AND cost_codes.organization_id IS NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cost_codes_property_mgmt ON cost_codes(code) WHERE code LIKE 'PM%';

-- Add comment for documentation
COMMENT ON TABLE cost_codes IS 'Comprehensive cost codes for property management including residential, commercial, and specialty property services';