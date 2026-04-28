# UofT Branding Overhaul — Design Spec
**Date:** 2026-04-28
**Project:** Toronto Neighbourhoods (Draw Your Toronto Neighbourhood)

---

## Overview

Overhaul the site's visual design to meet University of Toronto web branding guidelines. The site is an official UofT project, co-created with School of Cities and Carte.

Chosen direction: **Option B — Full UofT Look with Dark Header**. Strong institutional feel with a prominent UofT Blue header, teal accents, and a dedicated logo strip for all three partner organizations.

---

## Colour Palette

| Token | Hex | Usage |
|---|---|---|
| UofT Blue | `#1E3765` | Header background, primary buttons, active step border, step number circles, heading text |
| Teal (secondary) | `#007894` | Done-step indicators, step labels, secondary button text/borders, links, teal tint backgrounds |
| Sky Blue (accent) | `#6FC7EA` | Done-step left border, teal gradient rule, header gradient overlay |
| Light teal tint | `#e8f6fa` | Done-step background, progress tab done-state background |
| Light blue tint | `#f0f4fa` | Progress bar background, step-done background, footer background |
| Body tint | `#f4f7fb` | Collapsed done-step rows |
| White | `#ffffff` | Sidebar body, card backgrounds, active step area, logo strip |

All colour combinations must pass WCAG AA. White on `#1E3765` passes (8.6:1). `#007894` on white passes. `#6FC7EA` is accent-only, not used for text on white.

---

## Typography

- **Primary font:** Arial (system font, no external dependency)
- **Heading weight:** 900 (heaviest available in Arial — approximates UofT Heavy)
- **Body weight:** 400 (Regular)
- **Minimum body font size:** 16px (sidebar body copy)
- **Step labels / secondary labels:** 11–12px, weight 700, sentence case
- **No ALL CAPS** anywhere in the UI

Remove the existing Google Fonts imports (Inter, Playfair Display). Update `--font-sans` in `index.css` to `Arial, ui-sans-serif, system-ui, sans-serif`. Remove `--font-serif`.

---

## Sidebar Layout

### Header
- Background: `#1E3765`
- Subtle teal diagonal gradient overlay: `linear-gradient(135deg, rgba(0,120,148,0.25) 0%, transparent 60%)`
- Title: "Toronto Neighbourhoods" in white, Arial 900, ~26px, no eyebrow / sub-brand text
- Bottom rule: 4px bar with gradient `linear-gradient(90deg, #007894, #6FC7EA)`

### Progress Tabs
- Four tabs: Pin / Name / Draw / Submit
- Active: white background, 3px `#1E3765` bottom border, bold `#1E3765` text
- Done: `#e8f6fa` background, `#007894` text, checkmark number
- Upcoming: `#f0f4fa` background, `#9aaccb` text

### Completed Steps (collapsed)
- Background: `#f4f7fb`
- Left border: 4px `#6FC7EA`
- Teal circle checkmark, step label in `#007894` (sentence case), value in `#1E3765` bold
- "Edit" link in `#007894` with underline

### Active Step Panel
- White background
- Left border: 4px `#1E3765`
- Step label (e.g. "Step 3 of 4"): 12px, bold, `#007894`, sentence case
- Heading: Arial 900, 17–18px, `#1E3765`
- Body: 14px, `#3a4a60`, 1.55 line-height

### Upcoming Step (collapsed)
- White background, left border `#e0e8f4`, opacity 0.45
- Gray circle number, gray text

### Step 4 Form
- No separate card/panel — form fields flow directly in the active panel
- Textarea borders: `#c5d4e8`, 2px
- Focus state: `#1E3765` border + ring

### Submit Bar (step 4)
- Full-width strip, background `#1E3765`
- Outlined white button ("Submit my map →"), bold Arial
- Supporting note text in `#6FC7EA`
- Rendered only when `step === 4`, replacing the current inline submit button inside the form

### Primary Buttons
- Background: `#1E3765`, white text, Arial 700, no border-radius (square corners match UofT official style)

### Secondary Buttons / Actions
- Text with 2px bottom-border underline in `#007894`, no filled background
- Used for: "Undo last point", "Redrop pin", "Redraw shape", "Edit name"

### Success State (already submitted)
- Replace green-50/green-200 with teal tint (`#e8f6fa` / `#007894`)
- Icon: teal circle, teal check
- "Edit my submission" button: teal tint background, `#007894` text

---

## Logo Strip

Placed between the sidebar body and the text footer, always visible.

- Background: white (`#ffffff`)
- Top border: 1px `#dce4f0`
- Three logos displayed side-by-side with equal flex, separated by 1px `#dce4f0` vertical dividers
- Logos (left to right): University of Toronto → School of Cities → Carte
- Files are already at `logos/` in the project root. Reference them by importing as React components (via `?react` Vite SVG plugin) or as static assets via Vite's `?url` import. Use the same import pattern as any existing asset in the project.
- **UofT and School of Cities:** `max-height: 28px` (wide horizontal wordmarks)
- **Carte:** `max-height: 44px` (compact square logomark — needs more height for equivalent visual weight)
- Strip `min-height: 56px`, logos vertically centred

---

## Footer (text)

- Background: `#f0f4fa`
- Top border: 1px `#dce4f0`
- Font: 11px, `#7a8fa8`
- Links in `#007894`, bold, underlined
- Contains: "Inspired by NYT's 'Draw Your NYC Neighborhood'" + "What data do we store?" link

---

## Modals (Welcome + Data)

Apply the same design language:
- White background, `box-shadow: 0 8px 32px rgba(30,55,101,0.18)`
- No border-radius (square corners)
- Heading: Arial 900, `#1E3765`
- Close button: light teal tint background (`#e8f6fa`), `#007894` icon
- Primary button ("Let's go", "Got it"): `#1E3765` background, white text, square corners
- Links within modal body: `#007894`, underlined

---

## Map Elements

- Home pin (CircleMarker): fill `#1E3765`
- In-progress polygon drawing (Polyline): `#1E3765`, weight 3, dashed
- Ghost line: `#1E3765`, opacity 0.5
- Completed polygon: fill `#1E3765`, fillOpacity 0.15, stroke `#1E3765`
- Vertex points: `#1E3765` stroke, white fill
- Toronto boundary overlay: stroke `#007894`, fillColor `#e8f4f8`, fillOpacity 0.4 (lighter teal tint)

---

## Animation

- Steps appearing: `fade-in` + `translate-up` (element moves from 8px below to 0 as it fades in)
- Duration: 200–250ms, ease-out
- No aggressive animations — subtle entrance only
- Existing `animate-in fade-in` Tailwind classes stay; add `slide-in-from-bottom-2` or a custom translate

---

## Corners

- All buttons, inputs, progress tabs, and sidebar elements: **0px border-radius** (square corners). This matches official UofT web properties. Remove all existing `rounded-md`, `rounded-xl`, `rounded-lg` Tailwind classes from Sidebar and modal elements.
- Exception: checkmark circles and step-number circles remain circular (`rounded-full`)
- Modals: 0px border-radius (remove `rounded-xl` from modal container)

---

## Responsive (Mobile)

Existing layout (sidebar stacks below map on mobile) is unchanged. Apply all colour and typography changes at all breakpoints. Logo strip and footer remain visible on mobile — check that the three logos don't overflow the narrow viewport; reduce logo max-heights to 22px / 34px on mobile if needed.

---

## Files to Change

| File | Changes |
|---|---|
| `src/index.css` | Remove Google Fonts import, update `--font-sans` to Arial |
| `src/components/Sidebar.tsx` | Full styling overhaul per this spec |
| `src/components/MapEditor.tsx` | Update polygon/marker colours to UofT Blue and teal |
| `src/App.tsx` | Minor — ensure `font-sans` propagates correctly |
| `public/` or `src/assets/` | Add `logos/` directory (or reference from project root) |

---

## Out of Scope

- Content changes (copy stays the same)
- UofT caret device (not applicable — site does not include the "Defy Gravity" logo)
- Trade Gothic Next font (not licensed — Arial used instead)
- Photography / headboard images (site has no photography)
