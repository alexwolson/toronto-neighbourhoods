# UofT Branding Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Toronto Neighbourhoods app to meet University of Toronto web branding guidelines — UofT Blue colour palette, Arial typography, dark header, logo strip with three partner logos.

**Architecture:** Pure styling overhaul — no logic changes. Define UofT colour tokens in Tailwind v4 `@theme`, then systematically replace all gray palette classes in `Sidebar.tsx` and `MapEditor.tsx`. Add a logo strip component inline in `Sidebar.tsx`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Vite 6, Framer Motion (`motion` package, already installed), Lucide React icons.

**Spec:** `docs/superpowers/specs/2026-04-28-uoft-branding-design.md`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/index.css` | Modify | Remove Google Fonts import, replace font variables, add UofT colour tokens to `@theme` |
| `src/assets/logos/` | Create dir | Copy 3 logo SVGs here with URL-safe filenames |
| `src/components/Sidebar.tsx` | Modify | Full className overhaul: header, progress tabs, step states, buttons, inputs, logo strip, modals, success state |
| `src/components/MapEditor.tsx` | Modify | Update polygon/marker/line colours to UofT Blue and teal |
| `src/App.tsx` | Modify | Remove `font-sans` override (now set globally via CSS) |

---

## Task 1: CSS tokens — remove Google Fonts, add UofT colour palette

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the entire contents of `src/index.css`**

```css
@import "tailwindcss";
@import "leaflet/dist/leaflet.css";

@theme {
  --font-sans: Arial, ui-sans-serif, system-ui, sans-serif;

  /* UofT brand colours */
  --color-uoft-blue:       #1E3765;
  --color-uoft-teal:       #007894;
  --color-uoft-sky:        #6FC7EA;
  --color-uoft-tint-light: #e8f6fa;
  --color-uoft-tint-bg:    #f0f4fa;
  --color-uoft-tint-step:  #f4f7fb;
  --color-uoft-border:     #dce4f0;
  --color-uoft-body:       #3a4a60;
  --color-uoft-muted:      #7a8fa8;
  --color-uoft-label:      #9aaccb;
}

/* Reset leaflet z-index to stay under overlays */
.leaflet-container {
  font-family: inherit;
  z-index: 10;
}

.leaflet-control-container {
  z-index: 10;
}
```

- [ ] **Step 2: Verify Tailwind tokens work**

Run: `npm run dev`

Open http://localhost:3000 — the app should load without errors. The font will already switch to Arial. No visual regression expected beyond font change.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add UofT colour tokens, remove Google Fonts"
```

---

## Task 2: Copy logos to src/assets with clean filenames

**Files:**
- Create: `src/assets/logos/logo-uoft.svg`
- Create: `src/assets/logos/logo-school-of-cities.svg`
- Create: `src/assets/logos/logo-carte.svg`

- [ ] **Step 1: Create the logos directory and copy files**

```bash
mkdir -p src/assets/logos
cp "logos/LOGO-UofT-RGB (1).svg" src/assets/logos/logo-uoft.svg
cp logos/school-of-cities.svg    src/assets/logos/logo-school-of-cities.svg
cp logos/Carte-logomark.svg      src/assets/logos/logo-carte.svg
```

- [ ] **Step 2: Verify all three files copied correctly**

```bash
ls -la src/assets/logos/
```

Expected output: three `.svg` files, each > 0 bytes.

- [ ] **Step 3: Commit**

```bash
git add src/assets/logos/
git commit -m "feat: add partner logo assets"
```

---

## Task 3: Sidebar header, progress tabs, and shell

**Files:**
- Modify: `src/components/Sidebar.tsx`

This task replaces the outer sidebar shell, the `<h1>` header, and adds the new progress tab bar. The step content (Tasks 4–7) is added in subsequent tasks.

- [ ] **Step 1: Add logo imports at the top of Sidebar.tsx**

After the existing imports, add:

```tsx
import logoUofT          from '../assets/logos/logo-uoft.svg?url';
import logoSchoolCities  from '../assets/logos/logo-school-of-cities.svg?url';
import logoCarte         from '../assets/logos/logo-carte.svg?url';
```

- [ ] **Step 2: Replace the outer sidebar `<div>` and header**

Find the return statement's opening `<div>` and `<h1>` block (currently lines 142–146) and replace with:

```tsx
return (
  <div className="w-full h-[45dvh] md:h-[100dvh] md:w-[24rem] bg-white shrink-0 overflow-y-auto border-t md:border-t-0 md:border-r border-uoft-border flex flex-col font-sans relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-[0_8px_32px_rgba(30,55,101,0.18)]">

    {/* Dark UofT Blue header */}
    <div className="bg-uoft-blue relative overflow-hidden shrink-0">
      {/* Subtle teal gradient overlay for depth */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(0,120,148,0.25) 0%, transparent 60%)' }} />
      <div className="relative z-10 px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-5">
        <h1 className="text-2xl md:text-[1.65rem] font-black text-white leading-tight tracking-tight">
          Toronto<br />Neighbourhoods
        </h1>
      </div>
      {/* Teal gradient rule */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #007894 0%, #6FC7EA 100%)' }} />
    </div>

    {/* Progress tabs */}
    <div className="flex bg-uoft-tint-bg border-b border-uoft-border shrink-0">
      {([
        { n: 1, label: 'Pin' },
        { n: 2, label: 'Name' },
        { n: 3, label: 'Draw' },
        { n: 4, label: 'Submit' },
      ] as const).map(({ n, label }) => {
        const isDone   = step > n || (isAppSubmitted && n <= 4);
        const isActive = step === n && !isAppSubmitted;
        return (
          <div
            key={n}
            className={[
              'flex-1 text-center py-2 text-[11px] font-bold border-r border-uoft-border last:border-r-0',
              isDone   ? 'text-uoft-teal bg-uoft-tint-light' : '',
              isActive ? 'text-uoft-blue bg-white border-b-2 border-b-uoft-blue -mb-px' : '',
              !isDone && !isActive ? 'text-uoft-label' : '',
            ].join(' ')}
          >
            <span className="block text-sm font-black leading-none mb-0.5">
              {isDone ? '✓' : n}
            </span>
            {label}
          </div>
        );
      })}
    </div>
```

- [ ] **Step 3: Run dev server and check header renders**

Run: `npm run dev`

Open http://localhost:3000. Verify:
- Dark UofT Blue header with "Toronto Neighbourhoods" in white bold text
- Teal gradient rule below header
- Four progress tabs (Pin / Name / Draw / Submit) in light blue bar

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: UofT header and progress tabs"
```

---

## Task 4: Step states — done, active, upcoming

**Files:**
- Modify: `src/components/Sidebar.tsx`

Replace the existing step rendering inside the `<div className="flex-1 flex flex-col ...">` body. The four steps currently render as flex rows with circular step numbers. Replace them with the collapsed done / active / upcoming pattern.

- [ ] **Step 1: Replace the step rendering block**

Remove the existing `<div className="flex flex-col space-y-8">` and its contents (the four step `<div className="flex items-start space-x-4">` blocks) and replace with:

```tsx
    <div className="flex-1 flex flex-col overflow-y-auto">

      {/* ── Non-submitted flow ── */}
      {!isAppSubmitted && (
        <>
          {/* Step 1 — done (collapsed) */}
          {step > 1 && homeLocation && (
            <div className="bg-uoft-tint-step border-b border-uoft-border px-5 py-3 flex items-center gap-3 border-l-4 border-l-uoft-sky">
              <div className="w-5 h-5 bg-uoft-teal rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">✓</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-uoft-teal">Step 1 · Location pinned</div>
                <div className="text-sm font-bold text-uoft-blue truncate">Pin dropped</div>
              </div>
              <button
                onClick={() => { setStep(1); setHomeLocation(null); setPolygonPoints([]); setIsFinished(false); }}
                className="text-[11px] font-bold text-uoft-teal underline shrink-0"
              >
                Edit
              </button>
            </div>
          )}

          {/* Step 1 — active */}
          {step === 1 && (
            <div className="border-l-4 border-l-uoft-blue px-5 py-5 md:px-6">
              <div className="text-[12px] font-bold text-uoft-teal mb-1.5">Step 1 of 4</div>
              <h2 className="text-[17px] font-black text-uoft-blue leading-snug mb-2">Find your area</h2>
              <p className="text-[14px] text-uoft-body leading-relaxed">Pan and zoom the map to find where you live. Click the map to drop a pin.</p>
              <p className="text-[12px] text-uoft-muted mt-1.5 leading-relaxed">You don't need to pin your exact home — a nearby intersection or general area is fine.</p>
            </div>
          )}

          {/* Step 2 — done (collapsed) */}
          {step > 2 && neighborhoodName && (
            <div className="bg-uoft-tint-step border-b border-uoft-border px-5 py-3 flex items-center gap-3 border-l-4 border-l-uoft-sky">
              <div className="w-5 h-5 bg-uoft-teal rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">✓</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-uoft-teal">Step 2 · Neighbourhood name</div>
                <div className="text-sm font-bold text-uoft-blue truncate">{neighborhoodName}</div>
              </div>
              <button onClick={() => setStep(2)} className="text-[11px] font-bold text-uoft-teal underline shrink-0">Edit</button>
            </div>
          )}

          {/* Step 2 — active */}
          {step === 2 && (
            <div className="border-l-4 border-l-uoft-blue px-5 py-5 md:px-6">
              <div className="text-[12px] font-bold text-uoft-teal mb-1.5">Step 2 of 4</div>
              <h2 className="text-[17px] font-black text-uoft-blue leading-snug mb-3">What is this neighbourhood called?</h2>
              <form onSubmit={(e) => { e.preventDefault(); if (neighborhoodName.trim()) setStep(3); }} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  name="neighborhood_name_input"
                  value={neighborhoodName}
                  onChange={(e) => setNeighborhoodName(e.target.value)}
                  maxLength={150}
                  placeholder="e.g. The Annex, Leslieville…"
                  className="border-2 border-uoft-border px-3 py-2.5 text-[15px] text-uoft-blue bg-[#fafdff] focus:outline-none focus:border-uoft-blue w-full"
                  autoComplete="off"
                  data-1p-ignore="true"
                />
                <button
                  type="submit"
                  disabled={!neighborhoodName.trim()}
                  className="bg-uoft-blue text-white text-[13px] font-bold py-2.5 px-5 hover:bg-[#162d55] transition-colors w-max disabled:opacity-50"
                >
                  Next
                </button>
              </form>
            </div>
          )}

          {/* Step 3 — done (collapsed) */}
          {step > 3 && isFinished && (
            <div className="bg-uoft-tint-step border-b border-uoft-border px-5 py-3 flex items-center gap-3 border-l-4 border-l-uoft-sky">
              <div className="w-5 h-5 bg-uoft-teal rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">✓</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-uoft-teal">Step 3 · Boundary drawn</div>
                <div className="text-sm font-bold text-uoft-blue">{polygonPoints.length} points</div>
              </div>
              <button
                onClick={() => { setStep(3); setPolygonPoints([]); setIsFinished(false); }}
                className="text-[11px] font-bold text-uoft-teal underline shrink-0"
              >
                Redraw
              </button>
            </div>
          )}

          {/* Step 3 — active */}
          {step === 3 && (
            <div className="border-l-4 border-l-uoft-blue px-5 py-5 md:px-6">
              <div className="text-[12px] font-bold text-uoft-teal mb-1.5">Step 3 of 4</div>
              <h2 className="text-[17px] font-black text-uoft-blue leading-snug mb-2">Draw the boundary</h2>
              <p className="text-[14px] text-uoft-body leading-relaxed">Click around the edges of what you consider your neighbourhood. Connect back to the start point to close the shape.</p>
              {polygonPoints.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-1.5 text-[13px] font-bold text-uoft-teal border-b-2 border-uoft-teal mt-4 pb-0.5 hover:text-uoft-blue hover:border-uoft-blue transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Undo last point
                </button>
              )}
            </div>
          )}

          {/* Step 4 — upcoming placeholder */}
          {step < 4 && (
            <div className="border-l-4 border-l-[#e0e8f4] px-5 py-3 flex items-center gap-3 opacity-40 border-b border-uoft-border">
              <div className="w-5 h-5 bg-[#e0e8f4] rounded-full flex items-center justify-center text-uoft-label text-[10px] font-black shrink-0">4</div>
              <div className="text-[13px] font-bold text-uoft-label">Tell us more (optional)</div>
            </div>
          )}

          {/* Step 4 — active (form) */}
          {step === 4 && (
            <div className="border-l-4 border-l-uoft-blue px-5 py-5 md:px-6 flex flex-col gap-5">
              <div>
                <div className="text-[12px] font-bold text-uoft-teal mb-1.5">Step 4 of 4</div>
                <h2 className="text-[17px] font-black text-uoft-blue leading-snug">Tell us more</h2>
              </div>
              <form id="submit-form" className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-bold text-uoft-blue leading-snug">
                    How would you say these boundaries changed over the years?{' '}
                    <span className="font-normal text-uoft-muted">(optional)</span>
                  </label>
                  <p className="text-[12px] text-uoft-muted">For example, has the neighbourhood stretched in one direction?</p>
                  <textarea
                    name="changes_text"
                    rows={3}
                    maxLength={5000}
                    className="border-2 border-uoft-border p-3 text-[14px] text-uoft-blue focus:outline-none focus:border-uoft-blue resize-y bg-white"
                    value={changesText}
                    onChange={(e) => setChangesText(e.target.value)}
                    autoComplete="off"
                    data-1p-ignore="true"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-bold text-uoft-blue leading-snug">
                    Does this neighbourhood go by any other names?{' '}
                    <span className="font-normal text-uoft-muted">(optional)</span>
                  </label>
                  <p className="text-[12px] text-uoft-muted">For example, parts of The Danforth are also called Greektown.</p>
                  <textarea
                    name="other_names_text"
                    rows={3}
                    maxLength={1000}
                    className="border-2 border-uoft-border p-3 text-[14px] text-uoft-blue focus:outline-none focus:border-uoft-blue resize-y bg-white"
                    value={otherNamesText}
                    onChange={(e) => setOtherNamesText(e.target.value)}
                    autoComplete="off"
                    data-1p-ignore="true"
                  />
                </div>
                {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
              </form>
            </div>
          )}

        </>
      )}

      {/* ── Already-submitted state ── */}
      {isAppSubmitted && (
        <div className="bg-uoft-tint-light border border-uoft-border text-center p-6 m-4">
          <div className="w-12 h-12 bg-uoft-tint-light border-2 border-uoft-teal text-uoft-teal flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="font-black text-uoft-blue text-lg mb-2">Submission Received</h4>
          <p className="text-uoft-body text-sm mb-4">You have already submitted a neighbourhood map. Thank you!</p>
          <button
            onClick={() => setIsAppSubmitted(false)}
            className="text-sm font-bold text-uoft-teal border-2 border-uoft-teal py-2.5 px-4 hover:bg-uoft-tint-light transition-colors w-full"
          >
            Edit my submission
          </button>
        </div>
      )}

    </div>
```

- [ ] **Step 2: Run dev server and walk through all four steps**

Run: `npm run dev`

Check each step:
1. Step 1 active: dark left border, teal step label, white bg, Arial black heading
2. Drop pin → Step 1 collapses to done row (sky blue left border, teal check, "Edit" link)
3. Step 2 active: input has square corners, UofT Blue focus border
4. Enter name → Step 2 collapses, Step 3 becomes active
5. Step 4: form with square-cornered textareas
6. Already-submitted state: teal border box with edit button

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: UofT step states and form elements"
```

---

## Task 5: Submit bar and footer

**Files:**
- Modify: `src/components/Sidebar.tsx`

Replace the existing footer section (currently the `<div className="p-6 text-xs text-gray-500 border-t ...">`) with the submit bar (step 4 only) + logo strip + text footer.

- [ ] **Step 1: Replace the footer block**

Find the closing footer `<div className="p-6 text-xs text-gray-500 border-t border-gray-200 bg-gray-50 mt-auto ...">` at the bottom of the return statement (before the portal modals) and replace it with:

```tsx
    {/* Submit bar — step 4 only */}
    {step === 4 && !isAppSubmitted && (
      <div className="bg-uoft-blue px-5 py-4 flex items-center justify-between gap-4 shrink-0">
        <p className="text-uoft-sky text-[11px] leading-snug max-w-[140px]">Your map will be added to our dataset</p>
        <button
          type="submit"
          form="submit-form"
          disabled={isSubmitting}
          className="text-white text-[13px] font-bold border-2 border-white py-2.5 px-5 hover:bg-[#162d55] transition-colors disabled:opacity-50 shrink-0"
        >
          {isSubmitting ? 'Submitting…' : 'Submit my map →'}
        </button>
      </div>
    )}

    {/* Logo strip */}
    <div className="bg-white border-t border-uoft-border px-4 py-3 flex items-center justify-between gap-2 shrink-0" style={{ minHeight: '56px' }}>
      <div className="flex-1 flex items-center justify-center">
        <img src={logoUofT} alt="University of Toronto" style={{ maxHeight: '28px', width: 'auto', maxWidth: '100%' }} />
      </div>
      <div className="w-px h-8 bg-uoft-border shrink-0" />
      <div className="flex-1 flex items-center justify-center">
        <img src={logoSchoolCities} alt="School of Cities" style={{ maxHeight: '28px', width: 'auto', maxWidth: '100%' }} />
      </div>
      <div className="w-px h-8 bg-uoft-border shrink-0" />
      <div className="flex-1 flex items-center justify-center">
        <img src={logoCarte} alt="Carte" style={{ maxHeight: '44px', width: 'auto', maxWidth: '100%' }} />
      </div>
    </div>

    {/* Text footer */}
    <div className="px-5 py-2.5 text-[11px] text-uoft-muted bg-uoft-tint-bg border-t border-uoft-border shrink-0 flex justify-between gap-3 leading-relaxed">
      <p>Inspired by the NYT's <a href="https://www.nytimes.com/interactive/2022/12/02/upshot/draw-your-nyc-neighborhood.html" target="_blank" rel="noopener noreferrer" className="text-uoft-teal font-bold underline hover:text-uoft-blue">"Draw Your NYC Neighborhood"</a></p>
      <button
        onClick={() => setIsDataModalOpen(true)}
        className="text-uoft-teal font-bold underline hover:text-uoft-blue shrink-0"
      >
        Data info
      </button>
    </div>
```

- [ ] **Step 2: Verify submit bar and logos**

Run: `npm run dev`

Walk to step 4 and check:
- Dark blue submit bar appears at the bottom with outlined white button
- Below the bar: three logos side by side (UofT, School of Cities, Carte) on white background
- Carte logo is visibly taller (44px) than the wordmarks (28px)
- Light blue text footer below logos with "Inspired by…" and "Data info" links

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: submit bar, logo strip, and footer"
```

---

## Task 6: Modals — welcome and data

**Files:**
- Modify: `src/components/Sidebar.tsx`

Update both modal portals to use UofT styling — square corners, UofT Blue headings, teal close button, UofT Blue primary button.

- [ ] **Step 1: Replace the data modal**

Find the `{isDataModalOpen && typeof document !== 'undefined' && createPortal(` block and replace the inner modal `<div>` with:

```tsx
{isDataModalOpen && typeof document !== 'undefined' && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
    <div className="bg-white shadow-[0_8px_32px_rgba(30,55,101,0.2)] max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
      <button
        onClick={() => setIsDataModalOpen(false)}
        className="absolute top-4 right-4 text-uoft-teal bg-uoft-tint-light hover:bg-uoft-tint-bg p-1.5 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <h3 className="text-xl font-black text-uoft-blue mb-4">What data we store</h3>
      <div className="space-y-4 text-sm text-uoft-body leading-relaxed">
        <p>When you submit your map, we store the following data in our database securely:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-uoft-blue">Your neighbourhood's name</strong> (including alternate names you might suggest).</li>
          <li><strong className="text-uoft-blue">The pinned location</strong> (a single latitude/longitude coordinate representing the area you selected, not necessarily your home).</li>
          <li><strong className="text-uoft-blue">The boundary polygon</strong> (the shape of the neighbourhood you drew).</li>
          <li><strong className="text-uoft-blue">Optional feedback</strong> on how the neighbourhood is changing.</li>
          <li><strong className="text-uoft-blue">A timestamp</strong> of when the submission was made.</li>
        </ul>
        <p>We <strong>do not</strong> collect your name, email address, IP address, or any personally identifiable information (PII). No authentication is required to participate.</p>
        <div className="pt-2 border-t border-uoft-border">
          <p>This is a project created by members of the <a href="https://civictech.ca" target="_blank" rel="noopener noreferrer" className="text-uoft-teal font-bold underline hover:text-uoft-blue">Civic Tech Toronto</a> community.</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setIsDataModalOpen(false)}
          className="px-5 py-2.5 bg-uoft-blue text-white font-bold hover:bg-[#162d55] transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  </div>,
  document.body
)}
```

- [ ] **Step 2: Replace the welcome modal**

Find the `{isWelcomeModalOpen && typeof document !== 'undefined' && createPortal(` block and replace the inner modal `<div>` with:

```tsx
{isWelcomeModalOpen && typeof document !== 'undefined' && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
    <div className="bg-white shadow-[0_8px_32px_rgba(30,55,101,0.2)] max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
      <button
        onClick={handleCloseWelcomeModal}
        className="absolute top-4 right-4 text-uoft-teal bg-uoft-tint-light hover:bg-uoft-tint-bg p-1.5 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <h3 className="text-2xl font-black text-uoft-blue mb-4 pr-6 leading-tight">Draw Your Toronto Neighbourhood</h3>
      <div className="space-y-4 text-[15px] text-uoft-body leading-relaxed">
        <p>Official city boundaries don't always match how we actually define our neighbourhoods. This community project aims to map Toronto's neighbourhoods based on how the people who live here define them.</p>
        <p>Help us crowdsource a new map of the city by drawing where you think your neighbourhood begins and ends.</p>
        <div className="pt-2 border-t border-uoft-border text-sm">
          <p>This is a volunteer project created by members of the <a href="https://civictech.ca" target="_blank" rel="noopener noreferrer" className="text-uoft-teal font-bold underline hover:text-uoft-blue">Civic Tech Toronto</a> community.</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleCloseWelcomeModal}
          className="px-6 py-2.5 bg-uoft-blue text-white font-bold hover:bg-[#162d55] transition-colors"
        >
          Let's go
        </button>
      </div>
    </div>
  </div>,
  document.body
)}
```

- [ ] **Step 3: Verify both modals**

Run: `npm run dev`

- On first load: welcome modal appears with UofT Blue heading, square corners, teal close button, UofT Blue "Let's go" button
- Click "Data info" in footer: data modal appears with same treatment

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: UofT modal styling"
```

---

## Task 7: MapEditor — UofT colour palette for map elements

**Files:**
- Modify: `src/components/MapEditor.tsx`

Update all hardcoded `#111827` (gray-900) colours to UofT Blue `#1E3765`, and the Toronto boundary overlay to teal tint.

- [ ] **Step 1: Update the Toronto boundary overlay polygon**

Find the `<Polygon` with `color: "#64748b"` and `fillColor: "#e2e8f0"` and replace its `pathOptions`:

```tsx
<Polygon
  positions={[WORLD_BOUNDS, TORONTO_POLYGON_LAT_LNG]}
  pathOptions={{
    color: "#007894",
    fillColor: "#e8f4f8",
    fillOpacity: 0.4,
    weight: 1.5,
    dashArray: "4, 8",
    interactive: false
  }}
/>
```

- [ ] **Step 2: Update the home location CircleMarker**

Find `pathOptions={{ color: "#111827", fillColor: "#111827", fillOpacity: 1 }}` and replace with:

```tsx
pathOptions={{ color: "#1E3765", fillColor: "#1E3765", fillOpacity: 1 }}
```

- [ ] **Step 3: Update the in-progress polyline**

Find `<Polyline positions={polygonPoints} color="#111827"` and replace with:

```tsx
<Polyline positions={polygonPoints} color="#1E3765" weight={3} dashArray="5, 10" />
```

- [ ] **Step 4: Update the ghost line**

Find `<Polyline positions={ghostLineParams} color="#111827"` and replace with:

```tsx
<Polyline positions={ghostLineParams} color="#1E3765" weight={3} dashArray="5, 10" opacity={0.5} />
```

- [ ] **Step 5: Update the finished polygon**

Find `pathOptions={{ color: "#111827", fillColor: "#111827", fillOpacity: 0.15, weight: 3 }}` and replace with:

```tsx
pathOptions={{ color: "#1E3765", fillColor: "#1E3765", fillOpacity: 0.15, weight: 3 }}
```

- [ ] **Step 6: Update the vertex CircleMarkers**

Find the `pathOptions` inside `polygonPoints.map(...)`:

```tsx
pathOptions={{
  color: "#111827",
  fillColor: "white",
  fillOpacity: 1,
  weight: 2,
}}
```

Replace with:

```tsx
pathOptions={{
  color: "#1E3765",
  fillColor: "white",
  fillOpacity: 1,
  weight: 2,
}}
```

- [ ] **Step 7: Verify map element colours**

Run: `npm run dev`

Walk to step 3 and draw a few points. Verify:
- Toronto boundary mask: lighter teal tint overlay
- Home pin: UofT Blue dot
- Drawing line: UofT Blue dashed polyline
- Ghost line: UofT Blue, 50% opacity
- Closed polygon: UofT Blue with light fill
- Vertex points: UofT Blue border, white fill

- [ ] **Step 8: Commit**

```bash
git add src/components/MapEditor.tsx
git commit -m "feat: UofT Blue map element colours"
```

---

## Task 8: App.tsx cleanup and type-check

**Files:**
- Modify: `src/App.tsx`

The `font-sans` class on the root `<div>` is now redundant since `--font-sans` is set globally in CSS. Also remove the `text-gray-900` root colour (now handled by UofT Blue in component styles).

- [ ] **Step 1: Update the root div in App.tsx**

Find:
```tsx
<div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full bg-white text-gray-900 overflow-hidden font-sans">
```

Replace with:
```tsx
<div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full bg-white overflow-hidden">
```

- [ ] **Step 2: Run type-check and lint**

```bash
npm run lint
```

Expected: no TypeScript errors. Fix any errors before proceeding.

- [ ] **Step 3: Full walkthrough**

Run: `npm run dev`

Complete the full user journey:
1. Welcome modal appears → "Let's go"
2. Click map to drop pin (step 1 → 2)
3. Step 1 collapses to done row
4. Enter neighbourhood name → "Next"
5. Step 2 collapses
6. Draw polygon (at least 3 points), close it
7. Step 3 collapses, step 4 form appears
8. Submit bar visible at bottom
9. Fill optional fields, submit
10. Success state appears in teal

Also verify on mobile viewport (375px wide): logos remain visible and don't overflow.

- [ ] **Step 4: Final commit**

```bash
git add src/App.tsx
git commit -m "feat: remove redundant root font/colour classes"
```

---

## Self-Review Notes

- **Logo import:** Vite `?url` suffix returns a URL string at build time; used in `<img src={...}>` — correct pattern for this stack.
- **Submit button wiring:** `type="submit" form="submit-form"` connects the button in the submit bar to the `<form id="submit-form">` in the step 4 panel — they are separate DOM siblings.
- **Tailwind arbitrary colour fallback:** If `text-uoft-blue` doesn't resolve (e.g. purge config issue), use `text-[#1E3765]` as fallback — but with `@theme` tokens in v4 this should not be needed.
- **Square corners:** Every `rounded-*` class is removed from buttons, inputs, and modals. Circles (`rounded-full`) are kept on step-number and checkmark elements only.
- **`font-black` = weight 900:** This is the closest Arial equivalent to UofT Heavy. Tailwind's `font-black` maps to `font-weight: 900`.
