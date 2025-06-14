# Work Hub Implementation Plan

## Quick Visual:
```
Sidebar:
├── Profit Tracker
├── Work ← (Combines Projects + Estimates + Invoices)
├── People 
├── Products
├── Expenses
└── Reports
```

## Inside "Work" Page:
```
[All] [Estimates(12)] [Projects(8)] [Invoices(15)] [Pipeline]
                                                    
+New Estimate  +New Project  +Quick Invoice

[List showing all work items with type badges]
```

## Why "Work" is the Best Name:
1. **Contractors say**: "I've got 3 jobs/work going on"
2. **Simple & Clear**: Everyone understands "work"
3. **Not Corporate**: Avoids terms like "Operations" or "Revenue"
4. **Action-Oriented**: Work = what you do

## Implementation Steps:

### Phase 1: Basic Combination (1-2 days)
```typescript
// New routes structure
/work (shows all)
/work/estimates
/work/projects  
/work/invoices
/work/pipeline
```

### Phase 2: Unified List View
Show everything in one list with badges:
- 🟣 Estimate: "Kitchen Remodel" - $5,000 - Sarah Johnson
- 🟢 Project: "Bathroom Addition" - $12,000 - Active
- 🔵 Invoice: "Deck Repair" - $3,500 - Due in 5 days

### Phase 3: Smart Features
- **Pipeline View**: Visual flow showing estimate → project → paid
- **Quick Convert**: Turn estimates into projects with one click
- **Relationship Badges**: Show which estimates have projects, which projects have invoices

## Key Benefits:
1. **Reduces sidebar from 8 to 6 items** (25% reduction)
2. **Matches mental model**: All revenue-generating work in one place
3. **Preserves quick access**: Sub-nav tabs = one click to any section
4. **Sets up for growth**: Easy to add quotes, change orders, etc. later

## Alternative Approaches (if you prefer):

### Option A: Keep Separate but Add Visual Connection
- Keep sidebar items but add connecting lines/arrows
- Show badges like "3 estimates need follow-up"
- Not as clean but less change

### Option B: "Projects" Expands to Include All
- Keep "Projects" name but make it the hub
- Might be confusing since estimates aren't always projects
- But familiar name = less learning curve

## My Strong Recommendation:
Go with "Work" - it's the simplest, clearest improvement that will make the app feel more focused and professional while actually making it easier to use.