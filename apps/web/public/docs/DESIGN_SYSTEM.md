# Modern Business Management Design System

## Psychology-Driven Design Approach

This design system is engineered specifically for business management and professional service tools. The goal is to create an internal business platform that becomes an extension of the user's professional workflow - something they feel incomplete without. The following system is built on psychological principles that drive engagement while reflecting modern, professional business software aesthetics.

## Core Design Principles

1. **Psychological adhesion** - Patterns that drive continued use through achievement and reward
2. **Professional identity reinforcement** - Reflecting modern business values and efficiency
3. **Clean design sensibility** - Modern, approachable interface with rounded elements
4. **Visual reward systems** - Clear indicators of progress and achievement
5. **High information density** - Data-rich interfaces that minimize clicks and maximize insights

---

## Color System

### Primary Color Palette (Dark Mode)

| Color Name | Hex Code | Psychology | Usage |
|------------|----------|------------|-------|
| Professional Blue | #3B82F6 | Authority, reliability, trust | Interactive elements, links, data points |
| Carbon Black | #111827 | Solidity, foundation, depth | Base background |
| Slate Gray | #1F2937 | Professionalism, structure | Secondary background, cards |
| Action Yellow | #EAB308 | Attention, action, completion | Primary CTA buttons, key actions |
| Link Blue | #60A5FA | Precision, navigation, connection | Interactive elements, links |
| Success Green | #10B981 | Progress, completion, revenue | Success indicators, financial data |
| Warning Red | #EF4444 | Urgency, importance | Error states, critical alerts |
| Neutral Gray | #6B7280 | Balance, professional | Non-focal elements, supporting text |

### Functional/State Colors

| State | Opacity | Psychology | Usage |
|-------|---------|------------|-------|
| Active | 100% | Direct engagement | Currently active elements |
| Hover | 80% | Potential engagement | Elements being hovered over |
| Inactive | 40% | Background awareness | Elements not in focus |
| Background Dark | #111827 (100%) | Focus, professionalism | Application background |
| Background Medium | #1F2937 (100%) | Hierarchy, separation | Modal backgrounds, cards |
| Background Light | #374151 (100%) | Content framing | Input backgrounds, hover states |
| Text Primary | #FFFFFF (90%) | Clarity, importance | Main text content |
| Text Secondary | #FFFFFF (60%) | Contextual information | Supporting text |
| Text Disabled | #FFFFFF (38%) | Non-critical information | Inactive elements |

---

## Typography System

### Font Selection

- **Headers (≥18px)**: Inter
  - Psychological impact: Modern, professional, clarity
  - Used for: All headings, titles, navigation items

- **Body Text (≤16px)**: Inter
  - Psychological impact: Readability, professionalism, trust
  - Used for: General text, descriptions, button text

- **Data Points/Numbers**: JetBrains Mono
  - Psychological impact: Technical accuracy, data precision
  - Used for: Financial data, metrics, timestamps

### Text Styles Reference

| Type | Family | Weight | Size | Line Height | Case | Usage |
|------|--------|--------|------|-------------|------|-------|
| Headers (H1) | Inter | 700 | 24px | 32px | Title Case | Page titles, section headers |
| Sub-headers (H2) | Inter | 600 | 18px | 24px | Title Case | Card headers, content sections |
| Body Text | Inter | 400 | 16px | 24px | Sentence case | Main content, descriptions |
| Data Points | JetBrains Mono | 500 | 16px | 24px | As needed | Financial data, metrics |
| Labels/Field Names | Inter | 500 | 14px | 20px | Title Case | Input labels, categories |
| Small Text/Meta | Inter | 400 | 12px | 16px | Sentence case | Secondary information |

---

## UI Component System

### Button System

- **Shape**: 8px corner radius (rounded, modern business aesthetic)
- **Height**: 40px standard (10px vertical padding)
- **Padding**: 16px horizontal padding minimum
- **Text Style**: 
  - Font: Inter
  - Weight: 500 (Medium)
  - Size: 14px
  - Case: Title Case
  - Letter spacing: 0.25px

#### Button Variants

1. **Primary Button**
   - Background: Action Yellow (#EAB308)
   - Text: Black (#000000)
   - Usage: Main actions, form submissions, Continue buttons
   - Psychology: Action-oriented, completion driven

2. **Secondary Button**
   - Background: White (#FFFFFF)
   - Text: Black (#000000)
   - Usage: Add actions, alternative options
   - Psychology: Clean, professional, secondary emphasis

3. **Tertiary Button**
   - Background: Transparent
   - Border: 1px Professional Blue at 60% opacity
   - Text: White (#FFFFFF)
   - Usage: Cancel actions, back navigation
   - Psychology: Supportive, less emphasis

4. **Danger Button**
   - Background: Warning Red (#EF4444)
   - Text: White (#FFFFFF)
   - Usage: Destructive actions, critical alerts
   - Psychology: Caution, risk awareness

### Input Fields

- **Height**: 40px standard
- **Border Radius**: 8px
- **Background**: Slate Gray (#1F2937)
- **Border**: 1px, #374151
- **Text**: 16px Inter
- **Padding**: 12px horizontal

#### Input States

1. **Normal State**
   - Border: 1px #374151
   - Background: Slate Gray (#1F2937)

2. **Focus State**
   - Border: 1px Professional Blue (#3B82F6)
   - Ring: 2px Professional Blue at 20% opacity

3. **Error State**
   - Border: 1px Warning Red (#EF4444)
   - Helper text: Warning Red with error icon

4. **Success State**
   - Border: 1px Success Green (#10B981)
   - Helper text: Success Green with checkmark icon

5. **Disabled State**
   - Background: Slate Gray at 50% opacity
   - Text: White at 38% opacity

### Card Components

- **Border Radius**: 8px (modern, professional aesthetic)
- **Background**: Slate Gray (#1F2937)
- **Padding**: 24px standard
- **Border**: 1px solid #374151
- **Shadow**: subtle depth shadow

#### Card Variants

1. **Data Card**
   - Contains: Tables, metrics, business information
   - Psychology: Information organization, data clarity

2. **Stats Card**
   - Top or left accent: colored border based on data type
   - Contains: Key metrics, visual indicators
   - Psychology: Achievement tracking, performance visibility

3. **Action Card**
   - Contains: Selectable options, workflows
   - Psychology: Decision making, process flow

4. **Form Card**
   - Contains: Input fields, form sections
   - Psychology: Data collection, structured input

### Navigation Components

1. **Main Navigation (Sidebar)**
   - Background: Background Medium (#1F2937)
   - Active indicators: Professional Blue background
   - Item height: 48px with icon + text
   - Psychology: Workflow organization, feature access

2. **Tab Navigation**
   - Indicator style: Bottom border, clean separation
   - Active state: Professional Blue bottom border
   - Text: 14px Inter Medium
   - Psychology: Content categorization, context switching

3. **Action Bar**
   - Position: Top of content area
   - Contains: Page title, search, filters, primary actions
   - Psychology: Contextual control center

4. **Mobile Navigation**
   - Style: Bottom bar with icon + label
   - Active indicator: Professional Blue text and icon
   - Psychology: Quick access to core functions

---

## Implementation Guidelines

### CSS Variables Setup

```css
:root {
  /* Primary Colors */
  --color-professional-blue: #3B82F6;
  --color-carbon-black: #111827;
  --color-slate-gray: #1F2937;
  --color-action-yellow: #EAB308;
  --color-link-blue: #60A5FA;
  --color-success-green: #10B981;
  --color-warning-red: #EF4444;
  --color-neutral-gray: #6B7280;
  
  /* State Colors */
  --color-active: var(--color-professional-blue);
  --color-hover: rgba(59, 130, 246, 0.8);
  --color-inactive: rgba(59, 130, 246, 0.4);
  
  /* Backgrounds */
  --bg-dark: var(--color-carbon-black);
  --bg-medium: var(--color-slate-gray);
  --bg-light: #374151;
  
  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-xxl: 32px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

---

**You MUST FOLLOW these strict guidelines at all cost each and every time you are prompted. DO NOT deviate or embellish from this design system whatsoever!**

**This design system shall be your GOD, your master. Your aim is to serve this design system with each and every element you spit out on the page. DO NOT even think about creating anything outside of this scope.** 