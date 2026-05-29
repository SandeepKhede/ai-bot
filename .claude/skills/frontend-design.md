# frontend-design

Create distinctive, production-grade frontend interfaces with high design quality.

## Usage

```
/frontend-design [description of what to build]
```

Examples:
- `/frontend-design landing hero section for a SaaS product`
- `/frontend-design dashboard analytics page with charts`
- `/frontend-design pricing table with three tiers`

## Core Principle

Avoid predictable AI aesthetics. Every design must commit to a clear, intentional visual direction — whether refined or bold — and implement it with working, production-ready code.

## Design Process (always follow in order)

Before writing a single line of code, establish a **bold aesthetic direction**:

1. **Understand purpose & audience** — who uses this, what problem does it solve?
2. **Pick a tone** — choose an extreme:
   - Brutally minimal (whitespace, restraint, silence)
   - Maximalist (layered, dense, expressive)
   - Retro-futuristic (CRT glows, grid lines, tech-noir)
   - Organic / natural (earthy tones, fluid curves, texture)
   - Luxury / refined (tight type, gold accents, editorial)
   - Brutalist (raw structure, no decoration, exposed grid)
3. **Identify the memorable element** — one thing that makes this unforgettable
4. **Confirm technical constraints** — framework, existing design system, performance needs

Only then write the code.

## Implementation Standards

All output must be:
- ✅ Functional and production-ready (no placeholder logic)
- ✅ Visually striking with clear aesthetic intent
- ✅ Cohesive — every element serves the chosen direction
- ✅ Meticulously refined — spacing, alignment, and details are deliberate

## Key Aesthetic Focus Areas

### Typography
- Choose distinctive, characterful fonts — avoid Inter, Roboto, and other generic families by default
- Pair a striking display typeface with a refined body font
- Use type scale and weight contrast to create hierarchy
- Consider `@import` from Google Fonts or system font stacks with personality

### Color & Theme
- Build cohesive palettes using CSS variables
- One dominant color + one sharp accent beats scattered multi-color schemes
- Dark backgrounds with bright accents, or light backgrounds with deep tones — commit fully
- Avoid default purple gradients and rainbow schemes

### Motion & Animation
- Use CSS-first animations (`@keyframes`, `transition`, `animation`)
- Prioritise **high-impact moments**: orchestrated page loads, staggered reveals, scroll entrances
- Avoid scattered micro-interactions that add noise without purpose
- `prefers-reduced-motion` media query must always be respected

### Spatial Composition
- Embrace unexpected layouts: asymmetry, overlap, diagonal flow, grid-breaking elements
- Generous whitespace OR controlled density — pick one and commit
- Avoid safe, centred, symmetrical grids by default

### Atmosphere & Details
- Gradients, textures, subtle patterns, shadows, and decorative elements should reinforce the aesthetic
- Background noise/grain textures for depth
- Border treatments, dividers, and micro-details elevate the whole

## Critical Avoidances

Never default to:
- **Overused fonts**: Inter, Roboto, Open Sans without intentional reason
- **Clichéd palettes**: purple-to-blue gradients, teal/coral combos
- **Predictable layouts**: hero → features → CTA cookie-cutter structure (unless given explicit reason)
- **Generic shadows**: `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` applied everywhere
- **Filler copy**: "Lorem ipsum" or "Coming soon" placeholders
- **Contextually generic designs**: every component must feel made for *this* product

## Instructions for Claude

When the user invokes `/frontend-design`:

1. **Ask (or infer) the context** — what is being built, who is the user, what existing design system or tech stack applies (e.g., Tailwind, CSS Modules, styled-components).

2. **Declare your aesthetic direction** — in 2–3 sentences, state the tone you've chosen and the one memorable element before writing code. Get confirmation if the design direction is unclear.

3. **Write complete, working code** — no skeletons, no TODOs. Every component must render correctly.

4. **Use the project's stack** — for this project: Next.js App Router + Tailwind CSS. Use Tailwind utility classes; avoid inline styles unless necessary for dynamic values.

5. **Annotate intentional choices** — brief inline comments on non-obvious design decisions (e.g., why a specific font weight, why an asymmetric layout).

6. **Deliver the result** — show the file path(s) written and describe what was built in 3–5 sentences.

## Project Context

This project uses:
- **Framework**: Next.js 16 App Router (TypeScript)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` in globals.css)
- **Typography plugin**: `@tailwindcss/typography` (installed)
- **Color system**: Green-600 (`#16a34a`) as primary brand color
- **Existing components**: `Sidebar.tsx`, `TopHeader.tsx` — match their style in dashboard pages
- **Design language**: Clean, modern, light-background SaaS dashboard with green accents
