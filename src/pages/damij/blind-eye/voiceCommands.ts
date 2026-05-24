// Centralized voice command parser (English + Arabic)
import type { BELang } from './i18n';

export type CommandId =
  | 'STOP' | 'START' | 'REPEAT' | 'SCAN_AREA' | 'WHATS_AROUND'
  | 'READ_TEXT' | 'SWITCH_LANG_AR' | 'SWITCH_LANG_EN'
  | 'SLOWER' | 'FASTER' | 'QUIETER' | 'LOUDER' | 'HELP' | 'CHAT';

const PATTERNS: { id: CommandId; en: RegExp[]; ar: RegExp[] }[] = [
  { id: 'STOP',
    en: [/\b(stop|halt|pause|cancel)\b/i],
    ar: [/^(توقف|أوقف|اوقف|قف الآن|كفى|بس)/] },
  { id: 'START',
    en: [/\b(start|resume|continue|go|begin)\b/i],
    ar: [/(أكمل|اكمل|تابع|كمل|ابدأ|ابدا|استمر)/] },
  { id: 'REPEAT',
    en: [/\b(repeat|again|say again)\b/i],
    ar: [/(أعد|اعد|كرر|قل مرة أخرى)/] },
  { id: 'SCAN_AREA',
    en: [/\b(scan|scan area|scan the area|look around)\b/i],
    ar: [/(امسح|إمسح|مسح المنطقه|مسح المنطقة|إفحص)/] },
  { id: 'WHATS_AROUND',
    en: [/\b(what'?s? (around|in front|ahead|there)|describe|what do you see)\b/i],
    ar: [/(ماذا حولي|ماذا أمامي|ماذا امامي|صف|وصف ما)/] },
  { id: 'READ_TEXT',
    en: [/\b(read (the )?(text|sign)|read it)\b/i],
    ar: [/(اقرأ|إقرأ).*(نص|لافت|كتاب|إشار)/] },
  { id: 'SWITCH_LANG_AR',
    en: [/\b(switch|change|go) to arabic\b/i, /\barabic please\b/i],
    ar: [/(حوّل|حول|بدّل|بدل).*(عرب)/, /(تكلم|إحكي|احكي).*(عرب)/] },
  { id: 'SWITCH_LANG_EN',
    en: [/\b(switch|change|go) to english\b/i, /\benglish please\b/i],
    ar: [/(حوّل|حول|بدّل|بدل).*(إنجلي|انجلي|إنكلي|انكلي|english)/i, /(تكلم|إحكي|احكي).*(إنجلي|انجلي|english)/i] },
  { id: 'SLOWER',
    en: [/\b(slower|slow down|speak slower)\b/i],
    ar: [/(أبطأ|ابطأ|تكلم ببطء)/] },
  { id: 'FASTER',
    en: [/\b(faster|speed up|speak faster)\b/i],
    ar: [/(أسرع|اسرع|تكلم بسرعة)/] },
  { id: 'QUIETER',
    en: [/\b(quieter|lower volume|softer)\b/i],
    ar: [/(اخفض الصوت|أهدأ|أخفض)/] },
  { id: 'LOUDER',
    en: [/\b(louder|raise volume)\b/i],
    ar: [/(ارفع الصوت|أعلى|اعلى الصوت)/] },
  { id: 'HELP',
    en: [/\b(help|what can you do|commands)\b/i],
    ar: [/(ساعدني|مساعدة|ماذا تستطيع|الأوامر)/] },
];

export function parseCommand(rawText: string, lang: BELang): CommandId {
  const t = (rawText || '').trim();
  if (!t) return 'CHAT';
  // Try BOTH language patterns so the user can switch language mid-sentence.
  const order: BELang[] = lang === 'ar' ? ['ar', 'en'] : ['en', 'ar'];
  for (const l of order) {
    for (const p of PATTERNS) {
      const list = l === 'en' ? p.en : p.ar;
      if (list.some(rx => rx.test(t))) return p.id;
    }
  }
  return 'CHAT';
}

// Per-command debounce so the same recognized utterance isn't fired twice in a row.
const lastFired = new Map<CommandId, number>();
export function commandAllowed(id: CommandId, windowMs = 1200): boolean {
  if (id === 'CHAT') return true; // chat handler has its own logic
  const now = Date.now();
  const prev = lastFired.get(id) ?? 0;
  if (now - prev < windowMs) return false;
  lastFired.set(id, now);
  return true;
}
