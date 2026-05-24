# Blind Eye — Major upgrade plan

Goal: make Blind Eye feel professional and bilingual — English by default with Arabic toggle, sub-3-second initial and on-motion scene analysis with grid points on everything, cleaner voice commands without repetition, and a smarter chat that suggests next actions and switches language on demand with high-quality pronunciation.

---

## 1. Bilingual language system (English default + Arabic)

- Add a `BlindEyeLangContext` (`'en' | 'ar'`) stored in `localStorage`, default `'en'`.
- Build a single strings table `src/pages/damij/blind-eye/i18n.ts` covering: UI labels (Back, Stop, Eyes off, Companion, Listening…), system messages ("Camera ready", "Aligning…", "Stopped"…), spoken phrases (`scanning area now`, `stop!`, `clear path`), and chat suggestions.
- Header gets a clean `EN | AR` toggle (large, single tap). Toggling:
  - Updates UI text instantly.
  - Switches the SpeechRecognition lang (`en-US` ↔ `ar-SA`).
  - Switches TTS voice (best `en-US`/`en-GB` voice with `Google`/`Microsoft Natural` preference for English, best `ar-SA`/`ar-EG` voice for Arabic — see §4).
  - Sends `lang` in every edge-function call so AI replies in that language.
- Voice command "switch to Arabic" / "حوّل للعربية" toggles the language in one step and the next sentence is spoken in the new language.

## 2. Sub-3s initial scan + grid points on everything

- Calibration is now optional and capped at 1 quick attempt (was 3). The phase becomes `guiding` within ~700 ms if usable.
- On `guiding` start, immediately fire one `points` AI call AND show a 3×3 + 4×4 hybrid HUD grid driven by the local-vision motion/edge cells so the user sees feedback before AI replies.
- Reduce first AI tick latency:
  - Smaller first frame (256 px wide, JPEG 0.45) to shave network time.
  - Run local vision and AI request in parallel, render local points immediately, replace with AI labels when they land.
- HUD: every active cell gets a labeled dot; when AI returns objects, dots upgrade to bounding boxes with name + hazard color. Dots fade after 1.2 s of inactivity so the overlay stays "alive".

## 3. Fast re-detection on camera movement (<3s)

- Lower the scene-change threshold from `0.45` → `0.28` and add a second trigger from gyroscope/`devicemotion` (camera rotation > ~15°/s) so we react to panning, not just pixel motion.
- When a scene change fires:
  - Cancel in-flight `descriptive` AI calls.
  - Force a `points` tick with `minGap` 250 ms.
  - Re-render HUD points from local cells instantly while AI catches up.
- AI tick gap during motion: 350 ms (was 700 ms for medium proximity).
- Add a small "scanning…" earcon + a short spoken cue ("scanning"/"أمسح") only once per scene change, not per tick.

## 4. Better speech: organized, non-repeating, richer voices

- **Voice command parser** (new file `voiceCommands.ts`) replaces the regex chain. It returns an enum:
  - `STOP`, `START`, `REPEAT`, `SCAN_AREA`, `WHATS_AROUND`, `READ_TEXT`, `SWITCH_LANG`, `SLOWER`, `FASTER`, `QUIETER`, `LOUDER`, `HELP`, `CHAT` (fallback).
  - Each entry has both English and Arabic phrasings.
  - Includes a 1.2 s debounce per command id so the same recognized utterance isn't acted on twice.
- **Speech queue improvements** (`speechQueue.ts`):
  - Stronger dedup window for `descriptive` (3.5 s) and `directional` (2 s).
  - Coalesce same-direction guidance ("clear path ahead" repeated → spoken only every 6 s if unchanged).
  - "Heartbeat" suppression: if nothing meaningful has changed for 8 s, stay silent (earcons only).
  - Drop the redundant scan/earcon sound when TTS is about to speak.
- **Voice quality**:
  - Pick best available voice: prefer `Microsoft … Online (Natural)`, `Google …`, then platform default; cache per language.
  - Tune `rate` per language (English 1.05, Arabic 0.98) and add a slight pitch bump on hazards for clarity.
  - Optional upgrade: route critical/long sentences through the existing `accessibility-text-to-speech` ElevenLabs function (using `Sarah` for English, `Brian`/multilingual for Arabic) while keeping browser TTS as instant fallback — same pattern just used in `SensoryUpload`.

## 5. Smarter chat with suggestions

- `blind-eye-chat` edge function gets:
  - A `lang` param ('en' | 'ar') and a system prompt instructing it to answer in that language, concisely (≤ 2 short sentences), and to always include 2–3 short `suggestions` (next things the user could ask — "describe the wall ahead", "read the sign", "is the door open?").
  - Tool-call response so we get structured `{ spoken, suggestions[] }`.
- HUD shows the last 3 suggestions as small chips at the bottom; tapping a chip (or saying it) runs it. They auto-refresh after each scene change.
- Chat history is trimmed to the last 4 turns and includes the current `obstacles_summary` + `best_path` so replies stay grounded in what the camera actually sees.

---

## Technical notes

- Files touched: `BlindEyeNavigator.tsx`, `speechQueue.ts`, `HudOverlay.tsx`, `localVision.ts`, new `i18n.ts`, new `voiceCommands.ts`, new `BlindEyeLangContext.tsx`, edge function `blind-eye-vision/index.ts` (accept `lang`, return `spoken` in chosen language), edge function `blind-eye-chat/index.ts` (accept `lang`, return suggestions via tool call).
- No DB or schema changes.
- Lovable AI Gateway remains the only AI backend for Blind Eye (per the existing exception).
- Keeps all current safety behaviors: hazard earcons, vibration, critical-priority preemption, rate-limit/credit error toasts.

## Out of scope

- Offline on-device object detection (would need a separate WebGPU/ONNX integration).
- Persisting user language/voice preference to the backend (kept in `localStorage` only).
