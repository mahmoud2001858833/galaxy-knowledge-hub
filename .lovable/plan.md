# Interactive Braille Learning (تعلم بريل التفاعلي)

A new module added to the Universal Braille system, offering graded lessons, a virtual 6-key braille keyboard, a simulated braille display panel (for sighted + screen-reader users), and continuous reading speed/accuracy measurement.

## Where it lives

- New route: `/damij/braille/interactive-learn`
- New card on `BrailleHome` (and a quick link on `UniversalBrailleConverter`) titled **"تعلم بريل التفاعلي 🎓"**
- All existing braille pages remain unchanged.

## Architecture

```
src/pages/damij/braille/
  InteractiveBrailleLearn.tsx          ← main page (tabs: lessons / write / read / test)
src/features/braille/learn/
  brailleAlphabet.ts                   ← Arabic letters + dot patterns (1-6) + name
  lessons.ts                           ← graded curriculum (3 levels)
  testWords.ts                         ← 100 random Arabic test words
  useBrailleKeyboard.ts                ← hook: maps F D S / J K L → dots 3 2 1 / 4 5 6
  BrailleCellDisplay.tsx               ← visual + ARIA description of a cell
  BrailleKeyboardPad.tsx               ← on-screen visual of the 6 keys + state
  ReadingPanel.tsx                     ← simulated braille display (multiple cells)
  SpeedAccuracyMeter.tsx               ← live WPM + accuracy + timer
supabase/functions/
  braille-tutor-ai/index.ts            ← Gemini-powered hints, lesson explanations, tips
```

## 1. Graded lessons (الدروس المتدرجة)

Three levels with sequential lessons. Each lesson has: title, objective, theory text, interactive exercises (write the letter, read the cell, match), and an AI-generated explanation/tip on demand.

- **Level 1 — مبتدئ**: braille cell anatomy (6 dots), dot numbering, simple letters (ا ب ت ث ج), how a letter is formed.
- **Level 2 — متوسط**: remaining alphabet, numbers, forming short words, reading simple sentences.
- **Level 3 — متقدم**: Grade 2 contractions (الاختزالي), punctuation, complex rules.

Progress (current lesson + completion) is stored in `localStorage` to keep it isolated and offline-friendly.

## 2. Virtual 6-key keyboard (لوحة المفاتيح الافتراضية)

- Keys mapped exactly as the user requested:
  - Left hand: `S → dot 3`, `D → dot 2`, `F → dot 1`
  - Right hand: `J → dot 4`, `K → dot 5`, `L → dot 6`
- Chord detection: dots pressed simultaneously (released together) form one cell.
- Immediate feedback after each chord:
  - Correct → toast "أحسنت، كتبت حرف (X)" + success sound.
  - Wrong → toast "خطأ — الحرف الصحيح هو (X)" + soft buzz (Web Audio short tone) + visual highlight of the missing/extra dots.
- On-screen `BrailleKeyboardPad` shows the 6 keys lighting up live so users can also click/tap them on touch devices.

## 3. Simulated braille display (لوحة محاكاة لشاشة بريل)

A reading panel that renders a row of braille cells.

- **Sighted users**: large visual cells with raised/empty dots, color-highlighted active cell.
- **Blind users / screen readers**: every cell has an `aria-label` like "النقاط 1 و2 و4 بارزة — حرف ن"; a "نطق التشكيل" button reads the active cell out loud via the existing `useTextToSpeech` hook.
- Auto-advance with adjustable speed; arrow keys to navigate cells manually.

## 4. Continuous speed & accuracy (قياس مستمر)

- Live metrics while typing/reading: characters per minute, accuracy %, error count.
- **Auto-correction**: as soon as a wrong chord is pressed, immediate audio + vibration (`navigator.vibrate`) feedback — no waiting for end of word.
- **Timed test**:
  - 100 random Arabic words bundled in `testWords.ts`.
  - "ابدأ الاختبار" picks 5 random words, starts a 30-second timer.
  - At end: score = weighted (speed × accuracy), with AI-generated personalized feedback from `braille-tutor-ai` ("ركّز على النقاط 4 و5"...).

## 5. Gemini AI integration

- Edge function `braille-tutor-ai` calls Gemini with the provided key.
- Used for: lesson explanations on demand, hints when the learner is stuck, and end-of-test personalized feedback.
- The provided Gemini key is stored as a new Supabase secret named **`BRAILLE_LEARN_GEMINI_KEY`** (added via the secret tool, not committed to code). Function reads it via `Deno.env.get`.

## Accessibility

- Full RTL Arabic UI matching the existing damij theme.
- All interactive elements have ARIA labels.
- Works with the existing `AccessibilityPanel` (TTS, high contrast, reduce motion).
- Keyboard-only navigation supported throughout.

## Out of scope

- No database tables — progress is local only (no auth requirement).
- Does not modify any existing braille page logic; only adds a card link in `BrailleHome` and a small CTA in `UniversalBrailleConverter`.
