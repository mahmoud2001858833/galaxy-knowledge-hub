/**
 * Per-agent allowance in the web terminal (migration 20261104100000_terminal_agent_quotas).
 * Each agent has a daily message limit and a daily token limit (null = no token limit), enforced by
 * terminal_agent_begin() before every message and counted from the tokens the bridge reports.
 * The task sizes below are rough averages used only to explain an allowance to the principal.
 */

export type AgentKey = 'claude' | 'antigravity';

export const AGENT_LABEL: Record<AgentKey, string> = { claude: 'Claude Code', antigravity: 'Antigravity' };

/** What one agent may do for a user who is not the principal (shown when granting access). */
export const AGENT_SCOPE: Record<AgentKey, { can: string[]; cannot: string[]; note?: string }> = {
  claude: {
    can: ['يقرأ ملفات المشروع ويشرحها', 'يعدّل الملفات وينشئ ملفات جديدة', 'كل تعديل يصلك كطلب موافقة قبل رفعه'],
    cannot: ['تنفيذ أوامر على جهازك (Bash ممنوع لغيرك)', 'commit أو push أو نشر', 'تعديل .git أو إعدادات .claude'],
  },
  antigravity: {
    can: ['يقرأ الملفات ويعدّلها', 'ينفّذ أوامر على جهازك', 'يولّد صوراً تظهر تحت الطرفية'],
    cannot: ['commit أو push (محجوب بخطّافات git)'],
    note: 'وكيل Antigravity ينفّذ أي أمر على جهازك بلا قيود، لذلك لا يعمل لغيرك إلا إذا فعّلت antigravity.allowOthers في ~/.zarwa-bridge/config.json.',
  },
};

/** Rough tokens per kind of task, counting everything the model reads (cached context included). */
export const TASK_SIZES: Record<AgentKey, { label: string; tokens: number }[]> = {
  claude: [
    { label: 'سؤال أو شرح لملف', tokens: 30_000 },
    { label: 'تعديل صغير على ملف', tokens: 120_000 },
    { label: 'ميزة متوسطة (عدة ملفات)', tokens: 500_000 },
  ],
  antigravity: [
    { label: 'سؤال أو شرح لملف', tokens: 20_000 },
    { label: 'تعديل صغير على ملف', tokens: 80_000 },
    { label: 'ميزة متوسطة (عدة ملفات)', tokens: 350_000 },
  ],
};

export interface AgentAllowance {
  enabled: boolean;
  messages: number;
  tokens: number | null;
}

export interface Allowance {
  claude: AgentAllowance;
  antigravity: AgentAllowance;
  shell: boolean;
  dailyCommands: number;
  sessionMinutes: number;
  /** Antigravity minutes per Amman day from the first message; null = no limit */
  antigravityMinutes: number | null;
  /** Antigravity allowed hours (Amman, end exclusive, may wrap past midnight); null = any time */
  antigravityHours: { start: number; end: number } | null;
}

export const PRESETS: { id: string; label: string; hint: string; claude: Omit<AgentAllowance, 'enabled'>; antigravity: Omit<AgentAllowance, 'enabled'>; sessionMinutes: number }[] = [
  { id: 'light', label: 'خفيف', hint: 'أسئلة وتعديلات بسيطة', claude: { messages: 10, tokens: 300_000 }, antigravity: { messages: 10, tokens: 200_000 }, sessionMinutes: 30 },
  { id: 'medium', label: 'متوسط', hint: 'عمل يومي على صفحات', claude: { messages: 30, tokens: 1_500_000 }, antigravity: { messages: 30, tokens: 1_000_000 }, sessionMinutes: 60 },
  { id: 'heavy', label: 'مكثّف', hint: 'تطوير ميزات كاملة', claude: { messages: 80, tokens: 5_000_000 }, antigravity: { messages: 80, tokens: 4_000_000 }, sessionMinutes: 120 },
];

export const DEFAULT_ALLOWANCE: Allowance = {
  claude: { enabled: true, ...PRESETS[1].claude },
  antigravity: { enabled: false, ...PRESETS[1].antigravity },
  shell: false,
  dailyCommands: 100,
  sessionMinutes: PRESETS[1].sessionMinutes,
  antigravityMinutes: null,
  antigravityHours: null,
};

export const fmtTokens = (n: number | null | undefined) => {
  if (n == null) return '∞';
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
};

/** "1.5M" / "300k" / "250000" → tokens; empty → null (no limit). */
export const parseTokens = (text: string): number | null | undefined => {
  const t = text.trim().toLowerCase().replace(/[, ]/g, '');
  if (!t || t === '∞') return null;
  const m = t.match(/^(\d+(?:\.\d+)?)([km]?)$/);
  if (!m) return undefined;
  return Math.round(Number(m[1]) * (m[2] === 'm' ? 1_000_000 : m[2] === 'k' ? 1000 : 1));
};

/** How many tasks of each size fit in a day, limited by both the messages and the tokens. */
export const whatFits = (agent: AgentKey, a: AgentAllowance) =>
  TASK_SIZES[agent].map((t) => {
    const byTokens = a.tokens == null ? Infinity : Math.floor(a.tokens / t.tokens);
    const n = Math.min(a.messages, byTokens);
    return { ...t, n, limitedBy: byTokens < a.messages ? ('tokens' as const) : ('messages' as const) };
  });

/** The usage row columns this allowance writes. */
export const allowanceColumns = (a: Allowance) => ({
  allow_claude: a.claude.enabled,
  allow_antigravity: a.antigravity.enabled,
  agent: a.claude.enabled || !a.antigravity.enabled ? 'claude' : 'antigravity',
  claude_daily_messages: a.claude.messages,
  claude_daily_tokens: a.claude.tokens,
  antigravity_daily_messages: a.antigravity.messages,
  antigravity_daily_tokens: a.antigravity.tokens,
  allow_shell: a.shell,
  daily_limit: a.dailyCommands,
  session_minutes: a.sessionMinutes,
  antigravity_minutes: a.antigravityMinutes,
  antigravity_hours_start: a.antigravityHours?.start ?? null,
  antigravity_hours_end: a.antigravityHours?.end ?? null,
});

export interface AgentUsageRow {
  allow_claude: boolean;
  allow_antigravity: boolean;
  claude_daily_messages: number;
  claude_daily_tokens: number | null;
  antigravity_daily_messages: number;
  antigravity_daily_tokens: number | null;
  claude_used_messages: number;
  claude_used_tokens: number;
  antigravity_used_messages: number;
  antigravity_used_tokens: number;
  agent_usage_day: string;
}

/** Today's usage of one agent (counters from an earlier Amman day count as zero). */
export const usageToday = (row: AgentUsageRow, agent: AgentKey) => {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Amman' });
  const fresh = row.agent_usage_day === today;
  return {
    allowed: agent === 'claude' ? row.allow_claude : row.allow_antigravity,
    messages: fresh ? row[`${agent}_used_messages`] : 0,
    messagesLimit: row[`${agent}_daily_messages`],
    tokens: fresh ? Number(row[`${agent}_used_tokens`]) : 0,
    tokensLimit: row[`${agent}_daily_tokens`] == null ? null : Number(row[`${agent}_daily_tokens`]),
  };
};

export const allowanceFromRow = (
  row: AgentUsageRow & {
    allow_shell: boolean;
    daily_limit: number;
    session_minutes: number;
    antigravity_minutes?: number | null;
    antigravity_hours_start?: number | null;
    antigravity_hours_end?: number | null;
  },
): Allowance => ({
  claude: { enabled: row.allow_claude, messages: row.claude_daily_messages, tokens: row.claude_daily_tokens == null ? null : Number(row.claude_daily_tokens) },
  antigravity: {
    enabled: row.allow_antigravity,
    messages: row.antigravity_daily_messages,
    tokens: row.antigravity_daily_tokens == null ? null : Number(row.antigravity_daily_tokens),
  },
  shell: row.allow_shell,
  dailyCommands: row.daily_limit,
  sessionMinutes: row.session_minutes,
  antigravityMinutes: row.antigravity_minutes ?? null,
  antigravityHours:
    row.antigravity_hours_start != null && row.antigravity_hours_end != null ? { start: row.antigravity_hours_start, end: row.antigravity_hours_end } : null,
});

/** "09:00–17:00" (Amman) */
export const fmtHours = (h: { start: number; end: number }) =>
  `${String(h.start).padStart(2, '0')}:00–${String(h.end % 24).padStart(2, '0')}:00`;

/** Minutes of Antigravity left today for a quota row (null = no minute limit, 0 = over or not started yet → full). */
export const antigravityMinutesLeft = (row: { antigravity_minutes?: number | null; antigravity_window_started_at?: string | null }) => {
  if (row.antigravity_minutes == null) return null;
  const started = row.antigravity_window_started_at;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Amman' });
  if (!started || new Date(started).toLocaleDateString('en-CA', { timeZone: 'Asia/Amman' }) !== today) return row.antigravity_minutes;
  return Math.max(0, Math.round((Date.parse(started) + row.antigravity_minutes * 60000 - Date.now()) / 60000));
};
