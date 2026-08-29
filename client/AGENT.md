Update the UI theme of my **Vortex** job application tracker to a polished, light-first, technical productivity SaaS aesthetic.

### Design direction

The visual style should feel like a combination of **Linear, Vercel, and modern developer tools**:

* Light-first UI
* Clean and minimal
* Technical and sophisticated
* High information density without feeling cluttered
* Subtle borders instead of heavy shadows
* Strong typography hierarchy
* Small, purposeful use of color
* Professional enough for a production SaaS product
* Avoid the generic "corporate blue dashboard" look

### Color system

Use these colors consistently throughout the application:

**Surfaces**

* App background: `#F8FAFC`
* Cards/surfaces: `#FFFFFF`
* Borders: `#E2E8F0`

**Brand**

* Primary: `#4F46E5`
* Primary hover: `#4338CA`
* Primary soft/background: `#EEF2FF`

**Accent**

* Cyan: `#0891B2`
* Cyan soft: `#ECFEFF`

**Typography**

* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`

**Semantic colors**

* Success: `#059669`
* Success soft: `#ECFDF5`
* Warning: `#D97706`
* Warning soft: `#FFFBEB`
* Error: `#E11D48`
* Error soft: `#FFF1F2`

### Typography

Use **Geist Sans** as the primary UI font and **Geist Mono** selectively for technical/data-heavy content.

Use Geist Sans for:

* Navigation
* Headings
* Buttons
* Labels
* Body text

Use Geist Mono for:

* Metrics
* Application IDs
* Dates
* Numeric statistics
* Technical metadata
* Tables where appropriate

Keep typography compact and professional.

Suggested hierarchy:

* Page title: 28–32px, 700
* Section heading: 20–24px, 600
* Card heading: 15–16px, 600
* Body: 14px, 400
* Secondary text: 13px
* Metadata: 12px
* Dashboard metrics: 24–32px, 600

### Component styling

Use:

* Border radius around `8px–12px`
* Thin `1px` borders
* Very subtle `shadow-sm` only where useful
* Avoid large shadows
* Avoid excessive gradients
* Avoid glassmorphism
* Avoid excessive rounded/pill-shaped elements
* Avoid overly saturated backgrounds

Buttons should use the Indigo primary color.

Inputs should have:

* White background
* Slate border
* Clear focus state using Indigo
* Subtle transition

Cards should generally use:

* White background
* `#E2E8F0` border
* Minimal or no shadow
* 10–12px radius

### Navigation

Create a clean white sidebar/navigation.

Default navigation:

* White background
* Slate text
* Subtle hover background

Active navigation item:

* `#EEF2FF` background
* `#4F46E5` text
* Avoid a large filled Indigo block

### Job application statuses

Use semantic colors consistently:

* Saved → Slate
* Applied → Indigo
* Screening → Cyan
* Interview → Violet
* Offer → Emerald
* Rejected → Rose
* Withdrawn → Amber

Status badges should be subtle with light tinted backgrounds rather than saturated backgrounds.

### Data visualization

For charts and analytics:

* Primary data → Indigo
* Secondary data → Cyan
* Positive trend → Emerald
* Negative trend → Rose

Keep charts clean and minimal with subtle grid lines.

### Important implementation constraints

* Do NOT change the application's business logic.
* Do NOT change API calls, state management, routing, or data models.
* Do NOT introduce unnecessary dependencies.
* Do NOT rewrite components unless required for styling.
* Preserve existing functionality.
* Reuse existing Tailwind utilities/components where possible.
* If Tailwind CSS v4 is already configured, use the existing v4 setup.
* Centralize theme tokens rather than scattering arbitrary colors throughout components.
* Prefer semantic theme variables such as `vortex-primary`, `vortex-surface`, `vortex-muted`, etc.
* Ensure the UI is responsive.
* Ensure accessible contrast ratios.
* Add consistent hover, focus, active, disabled, and loading states.

### Overall goal

The final result should look like a **real, polished job-search command center**, not a generic CRUD dashboard.

Think:

**Linear × Vercel × Developer Tool**

with a distinctive **Vortex Indigo + Cyan** visual identity.

Before making changes, inspect the existing project structure and styling approach and adapt the theme to the current architecture rather than unnecessarily restructuring the application.
