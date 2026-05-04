## Goal

Upgrade the Text → Sign mode in `SignTranslatorPro.tsx` so that:
1. Signs appear **immediately under the translated (English/target) sentence** as an inline strip — no need to scroll.
2. Symbols are **realistic hand illustrations** (SVG line-art handshapes) instead of plain emojis.
3. Playback is more effective: synchronized word highlight + motion arrows + smoother sequencing.

---

## What to build

### 1. Realistic handshape library (local SVGs)
Create `src/features/sign-language/handshapes/` with curated SVG hand illustrations:
- **Fingerspelling A–Z** (26 SVGs, ASL alphabet style — usable as universal fingerspelling base).
- **Common sign primitives** (~30 SVGs): open_palm, fist, point, victory, thumbs_up/down, ok, love (ILY), call_me, prayer, wave, flat_hand, pinch, claw, bent_hand, spread_hand, etc.
- Each SVG: monochrome line-art on transparent background, ~120×120, designed to match across the set (uniform stroke, same hand orientation).
- Index file `handshapes/index.ts` exporting `HANDSHAPES: Record<HandshapeId, { svg: string; label: string }>` plus a `getHandshape(id)` helper with fallback.

Source: Generate via Lovable AI image gen with strict prompt ("clean black line-art right hand, white background, ASL letter X, no text, centered") then trace/clean. (Done at build-time by the agent and committed as static assets — no runtime calls.)

### 2. AI returns handshape IDs (not just emojis)
Update `supabase/functions/damij-sign-translate/index.ts` `text2sign` mode to also return:
```json
{
  "words": [{
    "word": "...",
    "handshape_id": "open_palm",          // primary handshape from library
    "movement": "wave_horizontal",        // one of: none|tap|wave_h|wave_v|circle|push|pull|up|down
    "two_handed": false,
    "sign_emoji": "✋",                   // kept as fallback
    "description": "...",
    "fingerspelling": [{ "letter": "H", "handshape_id": "asl_h" }, ...]
  }],
  "alphabet_chart": [{ "letter": "...", "handshape_id": "asl_x", "sign": "..." }]
}
```
Prompt enumerates the allowed `handshape_id` values so the model picks from the library.

### 3. New `<HandSignCard>` component
`src/features/sign-language/HandSignCard.tsx`:
- Renders the SVG handshape inline (`dangerouslySetInnerHTML` from the indexed SVG string, colored via `currentColor`).
- Overlays a small motion arrow (↔ ↕ ↻ → ←) based on `movement`, animated with framer-motion when the card is "active".
- Shows the word + phonetic transliteration underneath.
- Active state: scale 1.1, ring, subtle shadow, animated motion arrow loop.

### 4. Inline strip under the English translation
In `SignTranslatorPro.tsx` text2sign tab:
- Right under the translated text box, render a **horizontally scrollable strip** of `HandSignCard`s (one per word) — visible immediately, no separate section needed.
- Keep the existing detailed grid + alphabet chart **below** the strip for deeper inspection.
- `playWordSequence` highlights the matching card in the strip and auto-scrolls it into view, synced with TTS per word; configurable speed (slow/normal/fast).
- Two-handed signs render two SVGs side-by-side with a small connector.

### 5. Fingerspelling row
For words flagged as fingerspelling (proper nouns, numbers), render letter-by-letter using the same `HandSignCard` with `asl_*` handshapes — same realistic style — replacing the current text-only chips.

---

## Files

**New**
- `src/features/sign-language/handshapes/index.ts`
- `src/features/sign-language/handshapes/*.svg` (~55 files: 26 alphabet + ~30 primitives)
- `src/features/sign-language/HandSignCard.tsx`

**Edited**
- `supabase/functions/damij-sign-translate/index.ts` — extend `text2sign` schema with `handshape_id`, `movement`, `two_handed`; provide enum list in the prompt.
- `src/features/sign-language/SignTranslatorPro.tsx` — add inline strip under translated text, wire `playWordSequence` to scroll/highlight strip, replace emoji-only cards with `HandSignCard`, add playback speed selector.

No DB or routing changes.

---

## Technical notes

- SVGs are static assets imported as raw strings (`?raw` Vite import) so they can be inlined and themed via CSS `currentColor`.
- Motion arrows are pure framer-motion overlays — no extra deps.
- AI prompt change is additive; old fields (`sign_emoji`, `description`, `fingerspelling`) remain so legacy UI keeps working during rollout.
- Fallback chain per word: `handshape_id` SVG → `sign_emoji` → first-letter alphabet SVG.
- Generation of the SVG asset library is a one-time agent step using Lovable AI image gen with consistent prompts; output cleaned and committed.

---

## Out of scope
- 3D avatar hands (too heavy, deferred).
- Real video clips per sign (storage/licensing).
- Editing existing Sign → Text camera flow.
