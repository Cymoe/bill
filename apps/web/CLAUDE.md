# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Personal Preferences

- Always refer to me as eeeeeefhan

## Repositroy Information

Project Repository: https://github.com/Cymoe/bill


## Development Commands

- **Start development server**: `npm run dev` (runs on port 3000)
- **Build for production**: `npm run build` (includes docs copy step)
- **Lint code**: `npm run lint`
- **Run tests**: `npm test`
- **Database seeding**: `npm run seed`
- **Watch docs changes**: `npm run watch-docs`

## Architecture Overview

This is a construction/invoicing SaaS application built with React, TypeScript, Vite, and Supabase.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth with PKCE flow
- **Charts**: Chart.js and Recharts
- **State Management**: React Context (AuthContext, ThemeContext, ProductDrawerContext)
- **PDF Generation**: jsPDF + html2canvas
- **Testing**: Jest + Testing Library

### Key Architecture Patterns

**Layout System**: All authenticated pages use `DashboardLayout` which provides sidebar navigation and responsive mobile/desktop views.

**Authentication Flow**: 
- Protected routes require authentication via `ProtectedRoute` wrapper
- Auth state managed through `AuthContext` 
- Supabase client configured in `src/lib/supabase.ts`
- Auth storage key: `billbreeze-auth`

**Routing Structure**:
- Root (`/`) serves landing page or redirects to `/profit-tracker` if authenticated
- Main dashboard at `/profit-tracker` 
- Feature modules: `/projects`, `/invoices`, `/estimates`, `/people`, `/products`, etc.
- Public shareable routes: `/share/invoice/:id`, `/share/estimate/:id`

**Database Entities**: Users, Clients, Products, Invoices, Estimates, Projects, Templates, Work Packs, Expenses, Vendors, Subcontractors, Team Members

**Global Components**:
- `GlobalProductDrawer`: Product creation/editing available app-wide via `ProductDrawerContext`
- Modals and drawers follow responsive patterns (mobile drawers, desktop modals)

**Data Patterns**:
- Services layer in `src/services/` for API calls
- Types defined in `src/types/` and `src/lib/database.types.ts`
- Mock data and seeding in `src/data/`

### Environment Setup
Requires `.env` file with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Testing
- Jest configured for TypeScript and React components
- Setup file: `jest.setup.js`
- Test files follow `*.test.ts(x)` or `*.spec.ts(x)` patterns

## Supabase MCP Tool Usage

### Project Information
- **Bill Breeze Project ID**: `wnwatjwcjptwehagqiwf`
- Always use this project ID when accessing Supabase MCP tools

### Correct Usage Examples

**List all projects:**
```
mcp__supabase__list_projects
```

**Execute SQL queries:**
```
mcp__supabase__execute_sql
- project_id: wnwatjwcjptwehagqiwf
- query: SELECT * FROM cost_codes LIMIT 10;
```

### Common Gotchas
1. **Use the full project ID** (`wnwatjwcjptwehagqiwf`), not partial references from URLs
2. **UUID columns**: Use `IS NULL` or proper UUID format, not string comparisons
3. **Organization ID**: Use `WHERE organization_id IS NULL` for system-level data

### Useful MCP Commands
- `mcp__supabase__list_tables` - View all database tables
- `mcp__supabase__apply_migration` - Apply SQL migrations
- `mcp__supabase__list_migrations` - View migration history
- `mcp__supabase__get_logs` - Debug with service logs
- `mcp__supabase__execute_sql` - Run SQL queries

### Example Query for Cost Codes
```sql
SELECT 
    i.name as industry_name,
    cc.code,
    cc.name,
    cc.category
FROM cost_codes cc
JOIN industries i ON cc.industry_id = i.id
WHERE cc.organization_id IS NULL
ORDER BY i.name, cc.code;
```

## Cost Code System

### Core Philosophy & Design Principles

#### The Fundamental Rule
**Cost codes are organizational buckets, not detailed descriptions.**

This principle drives every decision in the system. Cost codes are like filing cabinet drawers - broad categories that organize related items. The specific details live in the line items within those drawers.

#### Key Design Principles

1. **Broad Categories, Specific Items**
   - Cost codes group similar types of work (e.g., "Carpentry Labor", "Flooring Materials")
   - Line items contain the actual details (e.g., "Master Carpenter $75/hr", "Oak Hardwood $8.50/sqft")
   - This separation allows infinite customization without code proliferation

2. **Industry-Specific Flexibility**
   - Each industry only has the cost codes it actually needs
   - No forced standardization - Electrical has 2 codes, Carpentry has 6, both are correct
   - Industries can have different philosophies while using the same system

3. **Smart Number Ranges**
   - Numbers indicate work type, not specific tasks:
     - 001-099: General services & consultations
     - 100-199: Labor rates
     - 200-299: Primary installation/construction
     - 300-399: Repair & maintenance
     - 400-499: Specialty/premium services
     - 500-599: Materials & equipment
     - 600-699: Recurring services
   - Enables powerful filtering without rigid categorization

4. **No Redundant Categories**
   - Line items do NOT have separate category fields (material, labor, etc.)
   - The cost code number itself indicates the category
   - Example: CP100 = Carpentry Labor, CP500 = Carpentry Materials
   - This eliminates confusion and maintains single source of truth

#### Why This Philosophy Works

- **Matches Mental Models**: Contractors think "I need carpentry work" not "I need code CP-200-B-7.2.1"
- **Scalable**: Works for solo contractors and large companies equally well
- **Flexible**: New items can be added without creating new codes
- **Clear Hierarchy**: Industry → Cost Code → Line Item mirrors how work is organized
- **Efficient**: Quick filters leverage the numbering for instant categorization

#### Practical Example

Instead of having hundreds of specific cost codes like:
- CP-201: Interior Door Installation
- CP-202: Exterior Door Installation  
- CP-203: French Door Installation
- CP-204: Sliding Door Installation

We have ONE code:
- CP200: Framing/Structural

With line items:
- Interior Door Install ($325)
- Exterior Door Install ($485)
- French Door Install ($850)
- Sliding Door Install ($625)

This is cleaner, more flexible, and easier to manage.

#### Visual Hierarchy Example

Here's how the three-level hierarchy works in practice:

```
CARPENTRY (Industry)
├── CP100 — Carpentry Labor (Cost Code)
│   ├── Apprentice Carpenter.............$35.00/hour
│   ├── Journeyman Carpenter.............$55.00/hour
│   ├── Master Carpenter.................$75.00/hour
│   └── Framing Carpenter................$50.00/hour
│
├── CP200 — Framing/Structural (Cost Code)
│   ├── Interior Wall Framing............$125.00/wall
│   ├── Exterior Wall Framing............$175.00/wall
│   ├── Door Opening....................$325.00/each
│   ├── Window Opening..................$385.00/each
│   └── Stair Framing...................$850.00/each
│
├── CP300 — Finish Carpentry (Cost Code)
│   ├── Baseboard Installation...........$3.50/linear ft
│   ├── Crown Molding...................$5.75/linear ft
│   ├── Window Trim.....................$125.00/window
│   └── Door Trim.......................$95.00/door
│
└── CP500 — Carpentry Materials (Cost Code)
    ├── 2x4 Framing Lumber..............$4.25/8ft
    ├── 2x6 Framing Lumber..............$6.50/8ft
    ├── Plywood 1/2"....................$32.00/sheet
    └── OSB Sheathing...................$28.00/sheet
```

This hierarchy provides:
1. **Industry Level**: Groups all related trades together
2. **Cost Code Level**: Organizes by work type (labor, installation, materials)
3. **Line Item Level**: Contains specific prices and units

### Simplified Cost Code Structure
Each industry has 1-7 core codes covering major work categories:

| Industry | # Codes | Core Categories |
|----------|---------|-----------------|
| **General Construction** | 7 | Permits, Labor, Site Prep, Concrete, Framing, Materials, Equipment |
| **Painting** | 5 | Labor, Interior, Exterior, Specialty Finishes, Materials |
| **Roofing** | 6 | Labor, Installation, Repair, Accessories, Materials, Gutters |
| **Carpentry** | 6 | Labor, Framing, Finish Work, Cabinetry, Materials, Equipment |
| **Flooring** | 5 | Labor, Installation, Repair/Refinish, Preparation, Materials |
| **HVAC** | 5 | Labor, Installation, Repair, Materials, Maintenance |
| **Landscaping** | 5 | Design, Labor, Installation, Materials, Maintenance |
| **Pest Control** | 5 | Labor, Treatment Services, Wildlife, Specialty, Materials |
| **Solar** | 4 | Services, Installation, Materials, Maintenance |
| **Electrical** | 2 | Services, Installation |
| **Plumbing** | 2 | Services, Installation |
| **Pool & Spa** | 1 | Services |

### Industry Prefix System
All cost codes use a 2-letter alpha prefix:

| Industry | Prefix | Example |
|----------|--------|---------|
| General Construction | GC | GC100 (General Labor) |
| Carpentry | CP | CP200 (Framing/Structural) |
| Electrical | EL | EL001 (Electrical Services) |
| Flooring | FL | FL200 (Floor Installation) |
| HVAC | HV | HV200 (HVAC Installation) |
| Landscaping | LS | LS200 (Landscape Installation) |
| Painting | PT | PT200 (Interior Painting) |
| Pest Control | PC | PC200 (Pest Treatment Services) |
| Plumbing | PL | PL200 (Plumbing Installation) |
| Pool & Spa | PS | PS001 (Pool & Spa Services) |
| Roofing | RF | RF200 (Roof Installation) |
| Solar | SL | SL200 (Solar Installation) |

### Common Code Patterns
Most industries follow these patterns:
- **x00**: General services or consultations
- **100**: Labor rates
- **200**: Primary installation/construction work
- **300**: Repair and maintenance
- **400**: Specialty or premium services
- **500**: Materials and supplies
- **600**: Recurring maintenance services
- **700**: Equipment and tool rental

## Service Options System

### Architecture Overview
The service options system implements a sophisticated shared-to-custom pricing model perfect for SaaS scale:

**Shared Foundation (organization_id = NULL)**:
- Pre-loaded industry-standard pricing for immediate value
- New contractors get working estimates from day one
- Reduces onboarding friction significantly

**Custom Pricing (organization_id = specific org)**:
- Contractors customize based on their market/strategy
- Regional cost variations and competitive positioning
- Falls back to shared pricing for unchanged items

### Current Status
✅ **Painting**: 5 services, 58 detailed options with task-based pricing  
✅ **Window & Door Contractors**: 4 services, 72 detailed options  
✅ **Concrete**: 4 services, 72 detailed options  
✅ **Multi-tenancy**: Excellent organization_id scoping  
✅ **JSONB Attributes**: Industry-specific requirements (VOC, PSI, electrical specs)  
✅ **Pricing Snapshots**: Historical accuracy for estimates/invoices  

### Key Enhancements
- **JSONB attributes** field for regional/market variations
- **Copy-to-customize** workflow infrastructure  
- **Pricing snapshot** system for quote accuracy
- **Advanced filtering** by industry-specific attributes

## Development Roadmap

📋 **Next Steps**: See [NEXT_STEPS.md](./NEXT_STEPS.md) for detailed implementation plan

**Current Priority**: Complete service options for all industries
- Immediate: Flooring & Roofing industries
- Next: HVAC & Plumbing remaining services  
- Then: Enhance existing industries with limited options