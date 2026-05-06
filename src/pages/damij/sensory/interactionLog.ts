// Sensory Bridge - Interaction Log (Continuous Learning)
// Tracks: tools used, fatigue events, shortcuts. Stored locally per user.

export type InteractionToolKey =
  | 'tts' | 'stt' | 'braille' | 'sign' | 'haptic'
  | 'tactile_print' | 'image_analyze' | 'simplify' | 'zoom' | 'pause' | 'replay';

export interface ToolUsageEntry { tool: InteractionToolKey; count: number; lastUsedAt: string; }
export interface FatigueEvent { at: string; signal: 'misclicks' | 'rapid_back' | 'long_idle' | 'manual'; details?: string; }
export interface ShortcutEntry { key: string; action: string; usedAt: string; }

export interface InteractionLog {
  toolUsage: Record<string, ToolUsageEntry>;
  fatigueEvents: FatigueEvent[];
  shortcuts: ShortcutEntry[];
  totalSessions: number;
  lastSessionAt: string;
}

const LOG_KEY = 'damij_interaction_log_v1';
const SESSION_KEY = 'damij_interaction_session_v1';

const empty = (): InteractionLog => ({
  toolUsage: {}, fatigueEvents: [], shortcuts: [],
  totalSessions: 0, lastSessionAt: new Date().toISOString(),
});

export const readLog = (): InteractionLog => {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch { return empty(); }
};

const writeLog = (log: InteractionLog) => {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); } catch {}
};

export const logToolUse = (tool: InteractionToolKey) => {
  const log = readLog();
  const cur = log.toolUsage[tool] || { tool, count: 0, lastUsedAt: '' };
  cur.count += 1; cur.lastUsedAt = new Date().toISOString();
  log.toolUsage[tool] = cur as ToolUsageEntry;
  writeLog(log);
};

export const logShortcut = (key: string, action: string) => {
  const log = readLog();
  log.shortcuts.unshift({ key, action, usedAt: new Date().toISOString() });
  log.shortcuts = log.shortcuts.slice(0, 100);
  writeLog(log);
};

export const logFatigue = (signal: FatigueEvent['signal'], details?: string) => {
  const log = readLog();
  log.fatigueEvents.unshift({ at: new Date().toISOString(), signal, details });
  log.fatigueEvents = log.fatigueEvents.slice(0, 200);
  writeLog(log);
};

export const resetLog = () => { try { localStorage.removeItem(LOG_KEY); } catch {} };

export const startSession = () => {
  const last = sessionStorage.getItem(SESSION_KEY);
  if (last) return;
  sessionStorage.setItem(SESSION_KEY, '1');
  const log = readLog();
  log.totalSessions += 1;
  log.lastSessionAt = new Date().toISOString();
  writeLog(log);
};

// ----- Auto-tracking attached at app root inside Damij -----
let installed = false;
export const installInteractionTracking = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  startSession();

  // Misclicks: rapid clicks on non-interactive areas
  let recentClicks: number[] = [];
  document.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest('button, a, input, textarea, select, [role="button"], label');
    if (!interactive) {
      const now = Date.now();
      recentClicks.push(now);
      recentClicks = recentClicks.filter(t => now - t < 4000);
      if (recentClicks.length >= 5) {
        logFatigue('misclicks', `${recentClicks.length} نقرات على فراغ خلال 4 ثوانٍ`);
        recentClicks = [];
      }
    }
  });

  // Rapid back navigation
  let backHits: number[] = [];
  window.addEventListener('popstate', () => {
    const now = Date.now();
    backHits.push(now);
    backHits = backHits.filter(t => now - t < 6000);
    if (backHits.length >= 3) {
      logFatigue('rapid_back', 'تنقّل متكرر للخلف');
      backHits = [];
    }
  });

  // Long idle (5+ minutes without interaction)
  let lastAct = Date.now();
  ['pointerdown','keydown','touchstart'].forEach(ev =>
    window.addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true })
  );
  setInterval(() => {
    if (Date.now() - lastAct > 5 * 60 * 1000) {
      logFatigue('long_idle', 'خمول لأكثر من 5 دقائق');
      lastAct = Date.now();
    }
  }, 60 * 1000);

  // Keyboard shortcuts (Ctrl/Alt/Cmd combos)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey || e.altKey) && e.key.length === 1) {
      const combo = `${e.ctrlKey ? 'Ctrl+' : ''}${e.metaKey ? 'Cmd+' : ''}${e.altKey ? 'Alt+' : ''}${e.key.toUpperCase()}`;
      logShortcut(combo, document.title || 'app');
    }
  });
};

export const getTopTools = (n = 5): ToolUsageEntry[] =>
  Object.values(readLog().toolUsage).sort((a, b) => b.count - a.count).slice(0, n);

export const getFatigueScore = (): number => {
  const log = readLog();
  const last24h = log.fatigueEvents.filter(e => Date.now() - new Date(e.at).getTime() < 86400000);
  return last24h.length;
};
