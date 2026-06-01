// Linguistic correction & post-processing filter for detected sign-language gestures.
// Reduces noise, prevents duplicate spam, fixes common misclassifications, and
// produces a more natural Arabic sentence from a stream of raw gesture tokens.

export interface DetectedToken {
  gesture: string;       // raw gesture key (e.g. "open_palm")
  text: string;          // raw arabic text (may contain "/" alternatives)
  confidence: number;    // 0..1
  timestamp: number;     // Date.now()
}

// Common gesture confusions: if the previous gesture was X and the new one is Y,
// treat Y as a likely re-detection of X (don't add a new token).
const CONFUSION_PAIRS: Record<string, string[]> = {
  open_palm: ['four_fingers', 'three_fingers'],
  four_fingers: ['open_palm', 'three_fingers'],
  three_fingers: ['four_fingers', 'victory'],
  victory: ['pointing_up', 'three_fingers'],
  pointing_up: ['victory'],
  thumbs_up: ['call_me'],
  call_me: ['thumbs_up', 'rock'],
  rock: ['love', 'call_me'],
  love: ['rock'],
};

// Pick the cleanest single word from a "yes / okay" or "نعم / موافق" style label.
// Works for ANY language — we only strip ASCII punctuation/symbols and keep
// letters from every script (Arabic, Latin, CJK, Cyrillic, Devanagari, etc.).
export const cleanGestureText = (raw: string): string => {
  if (!raw) return '';
  // Take the first variant before "/" or "|"
  const first = raw.split(/[\/|]/)[0].trim();
  // Strip bidi marks and ASCII punctuation; keep letters/numbers from every script.
  return first
    .replace(/[\u200E\u200F\u202A-\u202E]/g, '')
    .replace(/[!-/:-@[-`{-~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Decide whether a newly detected gesture should be APPENDED to the sentence,
// IGNORED (duplicate / confusion / low confidence), or REPLACE the last token
// (when the new detection is clearly a more confident correction).
export type FilterDecision =
  | { action: 'append'; text: string }
  | { action: 'replace'; text: string }
  | { action: 'ignore'; reason: string };

const MIN_CONFIDENCE = 0.6;
const REPEAT_COOLDOWN_MS = 2000;
const CORRECTION_WINDOW_MS = 600; // within this window, a higher-confidence
                                  // confusable gesture replaces the previous one

export const filterGesture = (
  incoming: DetectedToken,
  history: DetectedToken[],
): FilterDecision => {
  if (incoming.confidence < MIN_CONFIDENCE) {
    return { action: 'ignore', reason: 'low-confidence' };
  }
  const cleanText = cleanGestureText(incoming.text);
  if (!cleanText) return { action: 'ignore', reason: 'empty-text' };

  const last = history[history.length - 1];
  if (!last) return { action: 'append', text: cleanText };

  const sameGesture = last.gesture === incoming.gesture;
  const dt = incoming.timestamp - last.timestamp;

  // Same gesture re-fired too quickly → spam, ignore.
  if (sameGesture && dt < REPEAT_COOLDOWN_MS) {
    return { action: 'ignore', reason: 'duplicate' };
  }

  // Confusion correction: previous gesture was a known confusable of the new one,
  // it happened very recently, and the new detection is more confident → REPLACE.
  const confusedWith = CONFUSION_PAIRS[last.gesture] ?? [];
  if (
    confusedWith.includes(incoming.gesture) &&
    dt < CORRECTION_WINDOW_MS &&
    incoming.confidence > last.confidence + 0.05
  ) {
    return { action: 'replace', text: cleanText };
  }

  // Confusion suppression: very recent confusable detection with lower confidence → ignore.
  if (
    confusedWith.includes(incoming.gesture) &&
    dt < CORRECTION_WINDOW_MS &&
    incoming.confidence < last.confidence
  ) {
    return { action: 'ignore', reason: 'confusion-suppressed' };
  }

  return { action: 'append', text: cleanText };
};

// Build a clean Arabic sentence from the accepted token list,
// merging adjacent identical words and adding sentence punctuation.
export const buildSentence = (tokens: DetectedToken[]): string => {
  const words: string[] = [];
  for (const t of tokens) {
    const w = cleanGestureText(t.text);
    if (!w) continue;
    if (words.length === 0 || words[words.length - 1] !== w) {
      words.push(w);
    }
  }
  return words.join(' ');
};
