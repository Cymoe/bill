# Cost Code System Documentation

## Overview

The Bill Breeze cost code system is a custom implementation designed specifically for home services businesses, providing a more flexible alternative to traditional CSI (Construction Specifications Institute) codes. The system supports multi-industry organizations while maintaining a clean, hierarchical structure.

## System Architecture

### 1. Code Format
- **Structure**: XX.XX (e.g., 01.00, 26.15)
- **Major Code (XX)**: First two digits indicate the trade category
- **Minor Code (.XX)**: Last two digits specify the item within that category

### 2. Trade Category Ranges
```
01-29: Traditional Construction (CSI-style)
  01-01: General Requirements
  02-02: Site Work
  03-03: Concrete
  04-04: Masonry
  05-05: Metals
  06-06: Wood & Plastics
  07-07: Thermal & Moisture
  08-08: Openings
  09-09: Finishes
  10-10: Specialties
  11-11: Equipment
  12-12: Furnishings
  13-13: Special Construction
  14-14: Conveying Systems
  21-21: Fire Suppression
  22-22: Plumbing
  23-23: HVAC
  26-26: Electrical
  27-27: Communications
  28-28: Security

30-49: Specialty Trades
  30-32: Painting
  33-35: Flooring
  36-38: Roofing
  39-41: Solar & Renewable
  42-44: Landscaping
  45-47: Pool & Spa
  48-49: Security & Automation

50-69: Service
  50-59: Maintenance Services
  60-69: Repair Services

70-89: Home Services
  70-72: HVAC Services
  73-74: Appliance Services
  75-76: Cleaning Services
  77-78: Pest Control
  79-80: Property Management
  81-82: Home Inspection
  83-84: Moving Services
  85-86: Window & Door Services
  87-89: Handyman Services

90-99: Business Operations
  90-99: General Business
```

## Database Schema

### Core Tables

#### `cost_codes`
- `id` (UUID): Primary key
- `code` (VARCHAR): The XX.XX code
- `name` (TEXT): Display name
- `description` (TEXT): Optional description
- `category` (VARCHAR): labor | material | equipment | subcontractor | service
- `organization_id` (UUID): NULL for templates, org ID for custom codes
- `industry_id` (UUID): Links to specific industry
- `is_active` (BOOLEAN): Soft delete flag

#### `industries`
- `id` (UUID): Primary key
- `name` (TEXT): Industry name (e.g., "Electrical", "Plumbing")
- `slug` (TEXT): URL-friendly identifier
- `description` (TEXT): Industry description
- `icon` (TEXT): Display icon
- `is_active` (BOOLEAN): Active flag

#### `organizations`
- `id` (UUID): Primary key
- `industry_id` (UUID): Primary industry
- Other organizational fields...

#### `organization_industries`
- `id` (UUID): Primary key
- `organization_id` (UUID): Link to organization
- `industry_id` (UUID): Link to industry
- Enables many-to-many relationship for multi-industry support

## Multi-Tenant Architecture

### Template System
- **Template Cost Codes**: `organization_id = NULL`
- Serve as the base system for all organizations
- Cannot be modified by organizations
- Filtered by industry to show relevant codes

### Organization-Specific Codes
- **Custom Cost Codes**: `organization_id = [org_uuid]`
- Override templates with same code
- Can add entirely new codes
- Not restricted by industry selection

### Merge Logic
1. Load template codes for organization's industries
2. Load all organization-specific codes
3. Override templates where codes match
4. Add new custom codes to the list
5. Sort by code for consistent display

## Industry Support

### Current Industries (12 total)
- General Construction (50 codes)
- Electrical (2 codes)
- Plumbing (2 codes)
- HVAC (11 codes)
- Painting (19 codes)
- Flooring (17 codes)
- Roofing (10 codes)
- Landscaping (9 codes)
- Solar (5 codes)
- Pool & Spa (1 code)
- Property Management (0 codes)
- Real Estate Investment (0 codes)

### Multi-Industry Organizations
Organizations can:
1. Have one primary industry (organizations.industry_id)
2. Add multiple additional industries (organization_industries table)
3. See cost codes from ALL selected industries
4. Create custom codes outside their selected industries

## Implementation Details

### CostCodeService
Located at: `/src/services/CostCodeService.ts`

Key methods:
- `list(organizationId)`: Returns merged template + custom codes
- `create()`: Creates organization-specific codes
- `update()`: Updates existing codes
- `search()`: Searches within organization's visible codes

### Industry Filtering
1. Gets organization's primary industry
2. Gets additional industries from organization_industries
3. Loads template codes matching those industries
4. Loads all organization custom codes
5. Merges with custom codes overriding templates

### UI Indicators
- Template codes: No special marking
- Custom codes: Display "Custom" badge
- Item counts: Show number of line items per code

## Best Practices

### For Organizations
1. Use template codes when possible
2. Create custom codes for unique needs
3. Override templates to customize names/descriptions
4. Add industry associations for broader code access

### For Developers
1. Always use CostCodeService for consistency
2. Respect the merge logic (custom overrides template)
3. Don't filter org codes by industry (allows flexibility)
4. Maintain the XX.XX format for new codes

## Future Enhancements

### Potential Improvements
1. Add "is_universal" flag for codes used across all industries
2. Implement code inheritance/variations
3. Add code templates for quick custom code creation
4. Enable bulk import/export of custom codes
5. Add versioning for code changes

### Scalability Considerations
- Current system supports unlimited industries
- Organizations can have unlimited custom codes
- Template system ensures consistency
- Industry filtering keeps relevant codes visible