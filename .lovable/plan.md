## Goal

Add a **Tactile Graphics** module to نظام بريل العالمي that lets users:

1. **Generate** printable tactile diagrams from a description (geometric shapes, function graphs, geographic outlines, chemical molecules, biology figures, anything else) — output as high-contrast **SVG** + a **print-ready PDF** with bold raised-line outlines, large braille-labeled legend, and a textual key page. The output is designed for swell-paper / embosser printing where black ink raises on heating.
2. **Upload** an existing diagram image (textbook figure, map, chemistry molecule, math graph) and convert it into the same tactile-ready SVG + PDF, with all visible labels OCR'd, translated to the chosen language, and rendered in **braille** alongside the simplified outline.
3. **Reverse mode**: upload a photo of a **tactile/braille diagram** and have the AI describe the figure (what shape/map/molecule it represents) plus extract any braille labels back into readable text + audio.

---

## What to build

### 1. New page — `src/pages/damij/braille/TactileGraphics.tsx`

Single-page module with three tabs:

```
┌──────────────────────────────────────────────────────┐
│  توليد رسم تكتيلي  │  تحويل ملف  │  وصف رسم تكتيلي    │
└──────────────────────────────────────────────────────┘
```

**Tab 1 — Generate**
- Category picker (chips): شكل هندسي / رسم بياني / خريطة جغرافية / جزيء كيميائي / رسم بيولوجي / أخرى
- Prompt textarea (Arabic): "مثلث متساوي الأضلاع طول ضلعه 5 سم مع زواياه" / "خريطة الأردن مع المحافظات" / "جزيء الماء H₂O".
- Language for braille labels (reuse `SPOKEN_LANGUAGES`).
- Grade 1 / Grade 2 toggle.
- Paper size (A4 / A3 / Letter) + label size.
- "Generate" → calls `braille-tactile-generate` edge function.
- Result panel: SVG preview (high-contrast B/W), legend table (label → braille), and buttons: "تنزيل SVG", "تنزيل PDF للطباعة", "نسخ النص بالبريل".

**Tab 2 — Convert file**
- Drag-and-drop or pick: PNG/JPG/PDF (use existing `extractFromFile` for PDF text + send rendered page image for vector trace).
- Same options panel as Tab 1.
- Pipeline: image → AI (Gemini Vision) returns `{ description, labels[], simplified_svg, suggested_braille_labels }` → render tactile SVG + PDF.

**Tab 3 — Describe tactile diagram (reverse)**
- Upload a photo of a printed tactile/braille graphic.
- AI returns: figure type, plain-language description (Arabic), any braille labels decoded into text, recommended audio narration. TTS button to read it aloud.

### 2. New feature folder — `src/features/braille/tactile/`

- `unicodeBraille.ts` — Map characters (Latin, Arabic, digits, punctuation) to Unicode braille dot patterns (`⠀`–`⡿`). Reuse mapping logic if present in existing `extractText`/`brailleExport`; otherwise implement standard Grade 1 mappings (UEB English; Arabic per Unified Arabic Braille).
- `tactileSvg.ts` — Helpers that take an AI-returned structured figure (shapes, polylines, points + label anchors) and produce a clean black-outline SVG sized for the chosen paper. Stroke width ≥ 1.2mm equivalent at print resolution. Labels rendered as Unicode braille text with sufficient spacing per BANA tactile graphics guidelines.
- `tactilePdf.ts` — Uses existing `pdf-lib` (already used by `brailleExport`) to embed the SVG (via `svg2pdf.js` if installed, else rasterize through canvas) onto an A4 page plus a second page with a numbered legend (printed text + braille). Also outputs `.brf` companion for the legend so an embosser can render labels.
- `tactileTypes.ts` — TypeScript types for the AI contract.

### 3. Edge function — `supabase/functions/braille-tactile-generate/index.ts`

- Modes: `generate` (text → figure), `convert_image` (image → tactile figure), `describe` (image → description + decode labels).
- Uses dedicated **new** secret `BRAILLE_TACTILE_GEMINI_API_KEY` (the key the user just supplied), Gemini 2.5 Flash (vision-capable). Lovable AI Gateway fallback on quota/429.
- Strict JSON schema via tool-calling:
  ```
  {
    title, description, paper: "A4|A3|Letter",
    elements: [
      { kind: "circle"|"polygon"|"polyline"|"path"|"line"|"point",
        coords: number[], label_id?: string, stroke_mm?: number, dashed?: boolean }
    ],
    labels: [{ id, text, braille, position: [x,y], leader_to: [x,y] }],
    legend: [{ id, text, braille, notes? }],
    safety_notes
  }
  ```
- System prompt enforces: BANA-style simplification (no shading, no fine detail, max ~7 labels per page, leader lines straight, labels never overlap shapes), Arabic-first, and "no diagnosis/medical claims" guardrail not relevant here.

### 4. Add Tactile card to `BrailleHome.tsx`

Add a fifth `SystemCard` linking to `/damij/braille/tactile` with icon `Shapes` and Arabic copy: "رسومات تكتيلية للطباعة — أشكال هندسية وخرائط وجزيئات قابلة للمس".

### 5. Routing

Register route `/damij/braille/tactile` in `src/App.tsx` next to the other braille routes.

### 6. `supabase/config.toml`

Add `[functions.braille-tactile-generate] verify_jwt = false`.

### 7. Secret

Add new runtime secret `BRAILLE_TACTILE_GEMINI_API_KEY` (one prompt to user during build).

---

## Files

**New**
- `src/pages/damij/braille/TactileGraphics.tsx`
- `src/features/braille/tactile/unicodeBraille.ts`
- `src/features/braille/tactile/tactileSvg.ts`
- `src/features/braille/tactile/tactilePdf.ts`
- `src/features/braille/tactile/tactileTypes.ts`
- `supabase/functions/braille-tactile-generate/index.ts`

**Edited**
- `src/pages/damij/braille/BrailleHome.tsx` — add the new card
- `src/App.tsx` — register the new route
- `supabase/config.toml` — register the function

**Secret**
- `BRAILLE_TACTILE_GEMINI_API_KEY`

---

## Technical notes

- **SVG → PDF**: prefer `svg-to-pdfkit`/`svg2pdf.js` if already installed. Otherwise rasterize the SVG to a canvas at 300 DPI and embed as PNG via `pdf-lib`. Inspect `package.json` first.
- **Stroke**: 2px @ 300 DPI = ~0.17 mm; for embossing/swell-paper use 4–6 px (≈ 0.34–0.5 mm) and ensure black-on-white only.
- **Braille labels**: Unicode braille glyphs render correctly on screen but may not on printers; therefore the PDF also includes the legend as separate plain-text + braille blocks so users can also produce a `.brf` companion for an embosser.
- **Paper sizes**: A4 default. The PDF page split: figure on page 1 (centered, 80% area), legend on page 2 (text + braille two-column).
- **Reverse mode** uses Gemini Vision to recognize the figure plus run a braille decode pass (re-using prompt patterns from `braille-ocr` function).
- Rate-limit handling: surface 402/429 toasts in Arabic.
- All UI Arabic, RTL, uses existing `--damij-*` tokens.

---

## Out of scope

- Actually driving an embosser/printer over USB (requires native bridge).
- 3D printing of tactile models.
- Real-time editing of generated SVG (user can re-prompt instead).
- Persisting generated diagrams to Supabase (initial version is in-memory + downloads).
