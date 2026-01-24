# Frontend Overhaul: Digital Heritage Brutalism

## Goal
Transform the Brandão Contabilidade website into an unforgettable "Digital Heritage Brutalism" experience, merging 30 years of rustic security with high-tech digital precision.

## Design Commitment
- **Style:** Digital Heritage Brutalism (Sharp edges, massive typography, high contrast).
- **Palette:** Raw Obsidian (#0A0A0B), Electric Amber (#FFB000), Deep Bronze.
- **Typography:** Imposing Serif (Titles) + Technical Monospace (Details) + Sans (Body).
- **Geometry:** 0px border-radius (Sharp/Technical).

## Tasks
- [ ] **Task 1: Design System Foundation** → Update `globals.css` with new variables, 0px radius defaults, and base brutalist utilities. Verify: CSS variables match palette.
- [ ] **Task 2: Typography Setup** → Update `app/layout.tsx` to import and configure a Serif font (e.g., Playfair Display) and a Mono font (e.g., JetBrains Mono). Verify: Fonts load in DevTools.
- [ ] **Task 3: Tailwind Configuration** → Update `tailwind.config.js` with the new color tokens and font families. Verify: Tailwind classes like `bg-obsidian` work.
- [ ] **Task 4: Brutalist Header** → Refactor `app/components/Header.tsx` with sharp edges, high-contrast borders, and technical mono labels. Verify: Nav looks "High-Tech".
- [ ] **Task 5: Massive Typography Hero** → Overhaul Hero in `app/page.tsx` using massive Serif headlines and asymmetric layout. Verify: Visual impact is "Unforgettable".
- [ ] **Task 6: Digital Office Section** → Refactor services/features into a "Digital Dashboard" aesthetic using technical mono fonts and glow effects. Verify: UX feels "Digital/Fast".
- [ ] **Task 7: Interactions & Depth** → Add scroll-reveal animations and "Glow Pulse" micro-interactions to all CTAs. Verify: Site feels "Alive".
- [ ] **Task 8: Final Audit** → Run `python .agent/skills/frontend-design/scripts/ux_audit.py .`. Verify: All accessibility and UX checks pass.

## Done When
- [ ] The site has absolutely no rounded corners (0px radius).
- [ ] The palette is dominated by Raw Obsidian and Electric Amber.
- [ ] Every section has a scroll-triggered reveal animation.
- [ ] The Hero section uses a non-standard, asymmetric layout.
