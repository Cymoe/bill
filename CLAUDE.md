# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Personal Preferences

- Always refer to me as eeeeeefhan

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