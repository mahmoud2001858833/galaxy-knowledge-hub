## Goal

Rebuild **تشخيص نوع التوحد** (`/damij/autism/diagnosis`) into a professional, two-pronged screening experience:

1. **Questionnaire screening** based on caregiver-reported items aligned with **DSM-5** social-communication & restricted/repetitive behavior domains and the **M-CHAT-R/F** style scoring (validated for 16–30 months) plus an SRS-2 inspired path for older children.
2. **Play-based observation** — a set of mini-games that passively measure response to name, joint attention, eye-tracking-style gaze targets, repetitive pattern preference, sensory tolerance, social reciprocity, and pragmatic language — then feed the metrics to AI for analysis.

The output is an AI-generated, source-grounded report in Arabic with: domain scores, risk band (low / monitor / refer for evaluation), specific observations, recommended next steps, and citations to **CDC, AAP, NICE CG170, WHO**. The report makes it explicit that this is a **screening aid, not a diagnosis** — final diagnosis requires a qualified clinician (per CDC).

---

## What to build

### 1. New autism feature module — `src/features/autism/`

- `screeningItems.ts` — Arabic questionnaire bank, three age tracks:
  - **Toddler (16–30 mo)** — 20 items modeled on M-CHAT-R structure (yes/no, weighted; loss-of-skills critical items).
  - **Child (3–11 y)** — 25 items covering social communication, repetitive behaviors, sensory, and play.
  - **Adolescent/Adult (12+)** — 20 items inspired by AQ-style self/parent report.
  Each item: `{ id, ageTrack, domain, text, scale: 'yesno' | '4pt', critical?, scoreMap }`.
- `playGames.ts` — Registry of 6 mini-games with deterministic metrics:
  1. **Response to Name** — audio cue at random intervals; measures reaction time + miss rate (proxy for joint attention).
  2. **Joint Attention** — animated character looks at a target; user must tap where it's looking. Measures gaze-following accuracy.
  3. **Pattern vs. Social** — split-screen choice between a spinning geometric pattern and a smiling face video loop; measures dwell-time ratio.
  4. **Repetitive Match** — matching game where one option always rewards a fixed repetitive motion; tracks tendency to repeat preferred pattern after rule change.
  5. **Emotion Recognition** — 8 facial expression cards; measures accuracy + reaction time.
  6. **Sensory Tolerance** — gradually intensifying sound/animation; user taps to "stop"; measures tolerance threshold.
  Each game returns `{ gameId, metrics: Record<string,number>, durationMs }`.
- `scoringEngine.ts` — Local pre-AI scoring:
  - M-CHAT-R-style cutoffs for toddler track (low <3, medium 3–7, high ≥8; criticals upweighted).
  - Domain rollups for child/adult tracks.
  - Game-metric normalization to z-scores against built-in reference ranges (documented in code comments with source).
- `sources.ts` — Canonical citation list (CDC pages, AAP guideline, NICE CG170, WHO fact sheet & caregiver training) used by both UI and prompt.

### 2. Edge function `supabase/functions/autism-screen-analyze/index.ts`

- Input: `{ ageTrack, demographics, questionnaireScore, questionnaireAnswers, gameResults, locale }`.
- Uses Gemini 2.5 Flash via the **new dedicated key** (see step 5).
- System prompt:
  - Grounds analysis in DSM-5 ASD criteria + CDC/AAP/NICE/WHO guidance (full source URLs embedded).
  - Forbids language that claims a diagnosis; must use risk-band + recommendation phrasing.
  - Returns strict JSON: `{ risk_band, summary_ar, domain_scores: { social_communication, restricted_repetitive, sensory, language, play }, observations: string[], red_flags: string[], strengths: string[], recommendations: string[], next_steps: string[], citations: { title, url }[] }`.
- Lovable AI Gateway fallback on 429/quota errors (per project memory rule).
- CORS, input validation, error surfacing.

### 3. Page rewrite `src/pages/damij/autism/AutismDiagnosis.tsx`

Multi-step wizard (no external nav, all in one route):

```
Step 1 — Intro & Consent
  - Explain it is a screening aid, not a diagnosis (CDC source link).
  - Caregiver/self toggle, child age input → selects ageTrack.
  - Privacy note: data stays local unless user saves.

Step 2 — Path picker
  - "تقييم بالأسئلة" (questionnaire only)
  - "تقييم باللعب" (play games only)
  - "تقييم شامل" (both — recommended)

Step 3 — Questionnaire (if selected)
  - One question at a time, progress bar, domain chip, ability to go back.
  - Critical-item flagging shown subtly to clinician-mode toggle.

Step 4 — Play games (if selected)
  - Game launcher grid; each game opens in a focused modal/overlay.
  - Each game self-contained component under src/features/autism/games/.
  - Persists per-game metrics in component state.
  - Skip option per game (reported in metrics).

Step 5 — AI analysis
  - Loading screen with reassuring copy + cited sources list.
  - Calls edge function; handles 429/402/timeout with friendly Arabic toast.

Step 6 — Report
  - Risk-band hero (color-coded: green/amber/red) with bold disclaimer.
  - Domain radar chart (using existing recharts in repo if present, else simple SVG).
  - Sections: Observations, Red flags, Strengths, Recommendations, Next steps.
  - "اطبع التقرير" → window.print with print stylesheet.
  - Source citations footer with clickable links.
  - Reset button to start over.
```

### 4. Game components — `src/features/autism/games/`

- `ResponseToName.tsx`, `JointAttention.tsx`, `PatternVsSocial.tsx`, `RepetitiveMatch.tsx`, `EmotionRecognition.tsx`, `SensoryTolerance.tsx`.
- Each: ~150–250 LoC, accessible (ARIA labels, large hit targets), 60–120 second sessions, returns metrics via `onComplete`.
- All visuals built from CSS/SVG/Lottie-free shapes — no copyrighted faces. The Emotion Recognition game uses neutral emoji-style SVG faces drawn in code.

### 5. Secret

The user supplied a Gemini key. Add a **new** runtime secret `AUTISM_GEMINI_API_KEY` (so it stays isolated from Braille/other modules). Edge function reads it first, falls back to `LOVABLE_API_KEY` via gateway.

### 6. `supabase/config.toml`

Register `[functions.autism-screen-analyze] verify_jwt = false`.

### 7. Update `AutismHome.tsx`

Refresh the Diagnosis card description to mention the new questionnaire + play-based + AI-report features.

---

## Files

**New**
- `src/features/autism/screeningItems.ts`
- `src/features/autism/playGames.ts`
- `src/features/autism/scoringEngine.ts`
- `src/features/autism/sources.ts`
- `src/features/autism/games/ResponseToName.tsx`
- `src/features/autism/games/JointAttention.tsx`
- `src/features/autism/games/PatternVsSocial.tsx`
- `src/features/autism/games/RepetitiveMatch.tsx`
- `src/features/autism/games/EmotionRecognition.tsx`
- `src/features/autism/games/SensoryTolerance.tsx`
- `src/features/autism/ReportView.tsx`
- `supabase/functions/autism-screen-analyze/index.ts`

**Edited**
- `src/pages/damij/autism/AutismDiagnosis.tsx` — full rewrite as wizard
- `src/pages/damij/autism/AutismHome.tsx` — card description tweak
- `supabase/config.toml` — register new function

**Secret**
- Add `AUTISM_GEMINI_API_KEY` (one prompt to user during the build).

---

## Technical notes

- **Disclaimer is non-negotiable**: every page step and the AI report itself state that this is a screening aid; final diagnosis requires DSM-5-trained clinician evaluation per CDC.
- **No medical claims** in code or AI output beyond what the source guidelines support.
- **Sources file** is a single source of truth used by (a) UI footer, (b) edge-function prompt, (c) AI report citations, ensuring consistency.
- Game metrics are normalized in `scoringEngine.ts` against documented reference ranges; ranges are conservative defaults sourced from open-access screening literature, with comments pointing to the relevant CDC/AAP/NICE pages. The AI is instructed to treat these as non-diagnostic indicators.
- AI temperature kept low (0.2) and JSON-mode enforced for consistent reports.
- All UI strings in Arabic (RTL); page reuses `--damij-primary` tokens.
- Charts: prefer existing `recharts` if installed; otherwise lightweight inline SVG radar (≤80 LoC).
- Print stylesheet hides nav and renders the report at A4-friendly width.

---

## Out of scope

- Persisting reports to Supabase (can be added later — the current rewrite stores in component state and lets the user print/save).
- Multi-session longitudinal tracking.
- Voice-based screening (would require speech recognition setup).
- Editing the existing `AutismTherapy` and `AutismProfile` pages.
