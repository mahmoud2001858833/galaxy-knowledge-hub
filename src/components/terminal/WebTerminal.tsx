import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Browser terminal (xterm.js). Commands go to the web-terminal-exec Edge Function, which checks the
 * session, quota and ban in the database before running anything, and streams output back as NDJSON.
 * The session row is watched through realtime, so a kill switch from the admin panel locks this
 * screen immediately. Approval requests for changes made from here are watched too: the user sees
 * when the principal approves (and the bridge pushes) or rejects them.
 */

export interface QuotaInfo {
  used_today: number;
  daily_limit: number;
  used_total: number;
  total_limit: number | null;
  per_minute_limit: number;
  session_minutes?: number;
}

export interface SessionInfo {
  session_id: string;
  email: string;
  is_principal: boolean;
  expires_at: string | null;
  started_at: string;
}

export type Mode = 'cloud' | 'claude' | 'antigravity' | 'shell';

export type SessionEnd = { kind: 'terminated' | 'expired' | 'closed' | 'denied'; reason?: string | null };

interface Props {
  session: SessionInfo;
  onEnded: (end: SessionEnd) => void;
  onQuota: (q: QuotaInfo | null) => void;
  /** A dedicated terminal: every line goes straight to this agent (no "claude"/"antigravity" prefix). */
  fixedMode?: Exclude<Mode, 'cloud'>;
  /**
   * Several terminals share one session (one per tab). Only the primary one closes the session when
   * the page goes away, shows the approval toasts and is the one the admin's central AI types into.
   */
  primary?: boolean;
  /** The tab is visible: refit and focus. */
  active?: boolean;
  /** Project on the principal's computer: 'main' (ذروة العلم) or a bridge_projects slug. */
  project?: string;
}

const FIXED_INTRO: Record<Exclude<Mode, 'cloud'>, string> = {
  claude: "\x1b[1;35mClaude Code\x1b[0m \x1b[2m— on the principal's computer. Type your request and press Enter; every line is a message. /new starts a new conversation.\x1b[0m",
  antigravity: "\x1b[1;34mAntigravity agent\x1b[0m \x1b[2m— on the principal's computer. Type your request and press Enter; every line is a message. /new starts a new conversation.\x1b[0m",
  shell: "\x1b[1;33mShell\x1b[0m \x1b[2m— on the principal's computer, in the project folder. Non-interactive commands only.\x1b[0m",
};

const FN = 'web-terminal-exec';
const pendingClose = new Map<string, number>();

const endpoint = () => {
  const client = supabase as unknown as { supabaseUrl: string | URL; supabaseKey: string };
  return { url: `${String(client.supabaseUrl).replace(/\/$/, '')}/functions/v1/${FN}`, key: client.supabaseKey };
};

export const callTerminal = async (body: Record<string, unknown>, signal?: AbortSignal, keepalive = false) => {
  const { data } = await supabase.auth.getSession();
  const { url, key } = endpoint();
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${data.session?.access_token ?? ''}` },
    body: JSON.stringify(body),
    signal,
    keepalive,
  });
};

/** Converts a design token like "222 47% 11%" into a colour xterm understands. */
const tokenColor = (name: string, fallback: string) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const probe = document.createElement('span');
  probe.style.color = `hsl(${raw})`;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return rgb || fallback;
};

const themeFromTokens = () => ({
  background: tokenColor('--card', '#0b1020'),
  foreground: tokenColor('--card-foreground', '#e2e8f0'),
  cursor: tokenColor('--primary', '#38bdf8'),
  cursorAccent: tokenColor('--card', '#0b1020'),
  selectionBackground: tokenColor('--accent', '#1e3a5f'),
});

const editDistance = (a: string, b: string) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

/** A line that switches mode: any letter case, short aliases, and small typos ("antigrafity"). */
const modeFor = (word: string): Exclude<Mode, 'cloud'> | null => {
  if (word === 'agy' || word === 'ag') return 'antigravity';
  if (word === 'sh') return 'shell';
  if (!/^[a-z]+$/.test(word)) return null;
  for (const m of ['antigravity', 'claude', 'shell'] as const) if (word === m || (word.length >= 5 && editDistance(word, m) <= (m === 'antigravity' ? 2 : 1))) return m;
  return null;
};

export const WebTerminal: React.FC<Props> = ({ session, onEnded, onQuota, fixedMode, primary = true, active = true, project = 'main' }) => {
  const projectRef = useRef(project);
  const hostRef = useRef<HTMLDivElement>(null);
  // Phones/tablets: the on-screen keyboard (suggestions, composition) re-sends words to xterm and the
  // line repeats, and xterm shows Arabic left-to-right. There, typing goes through a normal input below.
  const touch = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches, []);
  const composerRef = useRef<HTMLInputElement>(null);
  const [composer, setComposer] = useState('');
  const termRef = useRef<Terminal | null>(null);
  const state = useRef({
    line: '',
    cursor: 0,
    busy: false,
    ended: false,
    history: [] as string[],
    histIndex: -1,
    abort: null as AbortController | null,
    pending: [] as string[],
    // 'cloud' = platform commands; 'claude' / 'shell' = every line goes to the principal's computer
    mode: (fixedMode ?? 'cloud') as Mode,
    claudeSession: null as string | null,
    agentSession: null as string | null, // Antigravity conversation id
    asking: false, // the running job's agent asked a question: Enter sends the line as the answer
    job: null as { id: string; stop: () => void } | null,
  });
  const feedRef = useRef<(data: string) => void>(() => {});
  // prints a line above the input line without disturbing what the user is typing
  const noticeRef = useRef<(text: string) => void>(() => {});
  // another project: agent conversations belong to the old one, so start fresh
  useEffect(() => {
    if (projectRef.current === project) return;
    projectRef.current = project;
    state.current.claudeSession = null;
    state.current.agentSession = null;
    noticeRef.current(`\x1b[2mProject: ${project === 'main' ? 'zarwa (main)' : project}. New conversation.\x1b[0m`);
  }, [project]);
  const [ready, setReady] = useState(false);
  const fitRef = useRef<FitAddon | null>(null);
  // images an agent made on the principal's computer (uploaded by the bridge to terminal-media)
  const [images, setImages] = useState<{ path: string; url: string | null }[]>([]);
  // a question from the agent (Antigravity ask_question), rendered properly (RTL, buttons) above the terminal
  const [question, setQuestion] = useState<{ question: string; options: string[]; multi: boolean; n: number; of: number } | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [writeIn, setWriteIn] = useState('');
  const answerRef = useRef<(text: string) => void>(() => {});

  const promptText = useCallback(() => {
    const mode = state.current.mode;
    if (state.current.asking) return '\x1b[1;33manswer\x1b[0m \x1b[2m›\x1b[0m ';
    if (mode === 'claude') return '\x1b[1;35mclaude\x1b[0m \x1b[2m›\x1b[0m ';
    if (mode === 'antigravity') return '\x1b[1;34mantigravity\x1b[0m \x1b[2m›\x1b[0m ';
    if (mode === 'shell') return '\x1b[1;33mmac\x1b[0m:\x1b[1;34mproject\x1b[0m$ ';
    return `\x1b[1;32m${session.email.split('@')[0]}@zarwa\x1b[0m:\x1b[1;34m~\x1b[0m$ `;
  }, [session.email]);
  const promptTextRef = useRef(promptText);
  promptTextRef.current = promptText;

  // rows between the prompt's first row and the cursor: a long line wraps, and redraw must clear every row
  const editRow = useRef(0);
  const prompt = useCallback(() => {
    editRow.current = 0;
    termRef.current?.write(`\r\n${promptText()}`);
  }, [promptText]);

  const lockWith = useCallback(
    (end: SessionEnd, message: string) => {
      const s = state.current;
      if (s.ended) return;
      s.ended = true;
      s.abort?.abort();
      s.job?.stop();
      termRef.current?.write(`\r\n\r\n\x1b[1;31m■ ${message}\x1b[0m\r\n`);
      termRef.current?.options && (termRef.current.options.cursorBlink = false);
      onEnded(end);
    },
    [onEnded],
  );


  /**
   * Streams a job running on the principal's computer: output chunks and the final status arrive
   * through realtime. Resolves when the job is finished, stopped or the session is locked.
   */
  const followJob = useCallback(
    (jobId: string, kind: 'claude' | 'antigravity' | 'shell' | 'submit') =>
      new Promise<void>((resolveJob) => {
        const term = termRef.current!;
        const s = state.current;
        let lastId = 0;
        let finished = false;
        let wroteAny = false;
        const write = (chunk: { id: number; stream: string; data: string }) => {
          if (chunk.id <= lastId) return;
          lastId = chunk.id;
          let data = chunk.data.replace(/\r?\n/g, '\r\n');
          if (chunk.stream === 'err' && !data.includes('\x1b[')) data = `\x1b[31m${data}\x1b[0m`;
          if (!wroteAny) {
            term.write('\r\n');
            wroteAny = true;
          }
          term.write(data);
        };
        const finish = (job: { status: string; exit_code: number | null; error: string | null; claude_session: string | null; cost_usd: number | null }) => {
          if (finished) return;
          finished = true;
          window.clearTimeout(waitHint);
          if (kind === 'claude' && job.claude_session) s.claudeSession = job.claude_session;
          if (kind === 'antigravity' && job.claude_session) s.agentSession = job.claude_session;
          const latin = (t: string | null) => (t && !/[\u0600-\u06FF]/.test(t) ? t : '');
          if (job.status === 'cancelled') term.write(`\r\n\x1b[33m■ stopped${latin(job.error) ? ': ' + latin(job.error) : ''}\x1b[0m`);
          else if (job.status === 'rejected') term.write(`\r\n\x1b[31m${latin(job.error) || 'Refused by the computer.'}\x1b[0m`);
          else if (job.status === 'error') term.write(`\r\n\x1b[31m${latin(job.error) || 'The job failed.'}\x1b[0m`);
          else if (job.exit_code) term.write(`\r\n\x1b[2;31mexit ${job.exit_code}\x1b[0m`);
          if (job.cost_usd != null) term.write(`\r\n\x1b[2m$${Number(job.cost_usd).toFixed(4)}\x1b[0m`);
          supabase.removeChannel(channel);
          s.job = null;
          resolveJob();
        };
        const waitHint = window.setTimeout(() => {
          if (!wroteAny && !finished) term.write("\r\n\x1b[2mwaiting for the principal's computer…\x1b[0m");
        }, 4000);
        s.job = {
          id: jobId,
          stop: () => {
            callTerminal({ action: 'cancel', job_id: jobId }).catch(() => {});
            if (s.ended) finish({ status: 'cancelled', exit_code: null, error: null, claude_session: null, cost_usd: null });
          },
        };
        const channel = supabase
          .channel(`bridge-job-${jobId}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bridge_job_chunks', filter: `job_id=eq.${jobId}` }, (p) =>
            write(p.new as { id: number; stream: string; data: string }),
          )
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bridge_jobs', filter: `id=eq.${jobId}` }, async (p) => {
            const job = p.new as { status: string };
            if (['done', 'error', 'cancelled', 'rejected'].includes(job.status)) {
              // pick up any chunk that raced the status change
              const { data } = await supabase.from('bridge_job_chunks').select('id, stream, data').eq('job_id', jobId).gt('id', lastId).order('id');
              (data ?? []).forEach(write);
              finish(p.new as never);
            }
          })
          .subscribe(async (st) => {
            if (st !== 'SUBSCRIBED') return;
            // catch up on anything written before the subscription was live
            const [{ data: chunks }, { data: job }] = await Promise.all([
              supabase.from('bridge_job_chunks').select('id, stream, data').eq('job_id', jobId).order('id'),
              supabase.from('bridge_jobs').select('status, exit_code, error, claude_session, cost_usd').eq('id', jobId).maybeSingle(),
            ]);
            (chunks ?? []).forEach(write);
            if (job && ['done', 'error', 'cancelled', 'rejected'].includes(job.status)) finish(job as never);
          });
      }),
    [],
  );

  const run = useCallback(
    async (line: string) => {
      const term = termRef.current!;
      const s = state.current;
      const cmd = line.trim();
      if (!cmd) return prompt();
      if (s.history[s.history.length - 1] !== cmd) s.history.push(cmd);
      s.histIndex = -1;

      if (cmd === 'clear') {
        term.clear();
        term.write('\x1b[2K\r');
        return prompt();
      }
      const word = cmd.toLowerCase();
      if (fixedMode && (word === 'exit' || word === 'quit')) {
        term.write(`\r\n\x1b[2mThis terminal is only for ${fixedMode === 'claude' ? 'Claude' : fixedMode === 'antigravity' ? 'Antigravity' : 'the shell'}. Use the tabs above to switch.\x1b[0m`);
        return prompt();
      }
      if (s.mode !== 'cloud' && (word === 'exit' || word === 'quit')) {
        s.mode = 'cloud';
        term.write('\r\n\x1b[2mBack to platform commands.\x1b[0m');
        return prompt();
      }
      if (cmd === 'exit') {
        await callTerminal({ action: 'end', session_id: session.session_id }).catch(() => {});
        lockWith({ kind: 'closed' }, 'Session closed.');
        return;
      }
      const modeWord = s.mode === 'cloud' ? modeFor(word) : null;
      if (modeWord) {
        s.mode = modeWord;
        term.write(
          s.mode === 'claude'
            ? `\r\n\x1b[35mClaude Code on the principal's computer.\x1b[0m \x1b[2mEvery line is a message${s.claudeSession ? ' (continuing the last conversation)' : ''}. /new starts over, exit leaves.\x1b[0m`
            : s.mode === 'antigravity'
              ? `\r\n\x1b[34mAntigravity agent on the principal's computer.\x1b[0m \x1b[2mEvery line is a message${s.agentSession ? ' (continuing the last conversation)' : ''}. /new starts over, exit leaves.\x1b[0m`
              : "\r\n\x1b[33mShell on the principal's computer, in the project folder.\x1b[0m \x1b[2mNon-interactive commands only. exit leaves.\x1b[0m",
        );
        return prompt();
      }
      if ((s.mode === 'claude' || s.mode === 'antigravity') && cmd === '/new') {
        if (s.mode === 'claude') s.claudeSession = null;
        else s.agentSession = null;
        term.write(`\r\n\x1b[2mNew ${s.mode === 'claude' ? 'Claude' : 'Antigravity'} conversation.\x1b[0m`);
        return prompt();
      }
      const wire = /^(submit|request-push)(\s|$)/i.test(cmd) ? cmd : s.mode === 'claude' ? `claude ${cmd}` : s.mode === 'antigravity' ? `antigravity ${cmd}` : s.mode === 'shell' ? `sh ${cmd}` : cmd;
      const resume = s.mode === 'claude' ? s.claudeSession : s.mode === 'antigravity' ? s.agentSession : null;

      s.busy = true;
      const abort = new AbortController();
      s.abort = abort;
      term.write('\r\n');
      let first = true;
      try {
        const res = await callTerminal({ action: 'exec', session_id: session.session_id, command: wire, resume_session: resume, project: projectRef.current }, abort.signal);
        if (!res.ok || !res.body) {
          const text = await res.text();
          term.write(`\x1b[31merror: ${res.status} ${text.slice(0, 200)}\x1b[0m`);
        } else {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buf = '';
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let i;
            while ((i = buf.indexOf('\n')) >= 0) {
              const raw = buf.slice(0, i);
              buf = buf.slice(i + 1);
              if (!raw) continue;
              const msg = JSON.parse(raw);
              if (msg.t === 'out') {
                term.write((first ? '' : '\r\n') + String(msg.d).replace(/\n/g, '\r\n'));
                first = false;
              } else if (msg.t === 'bridge') {
                if (msg.quota !== undefined) onQuota(msg.quota);
                s.abort = null;
                await followJob(msg.job_id, msg.kind);
              } else if (msg.t === 'end') {
                if (msg.quota !== undefined) onQuota(msg.quota);
                if (msg.session_ended) {
                  s.busy = false;
                  lockWith({ kind: msg.reason === 'session_expired' ? 'expired' : 'terminated', reason: msg.detail ?? null }, 'Session ended.');
                  return;
                }
              }
            }
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') term.write('\x1b[2m^C\x1b[0m');
        else term.write(`\x1b[31mnetwork error: ${(e as Error).message}\x1b[0m`);
      } finally {
        s.busy = false;
        s.abort = null;
      }
      if (!s.ended) {
        prompt();
        const queued = s.pending.splice(0);
        for (const d of queued) feedRef.current(d);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lockWith, onQuota, prompt, session.session_id],
  );

  // Create the terminal once per session
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
      fontSize: 14,
      lineHeight: 1.25,
      scrollback: 5000,
      convertEol: false,
      allowProposedApi: false,
      theme: themeFromTokens(),
      disableStdin: touch,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(host);
    try {
      fit.fit();
    } catch {
      /* host hidden (inactive tab) */
    }
    fitRef.current = fit;
    termRef.current = term;
    // OSC 1337 "ZarwaImage=<storage path>" from the bridge: show the image under the terminal
    term.parser.registerOscHandler(1337, (data) => {
      const s = state.current;
      if (data.startsWith('ZarwaAsk=')) {
        try {
          const bytes = Uint8Array.from(atob(data.slice(9).replace(/-/g, '+').replace(/_/g, '/')), (ch) => ch.charCodeAt(0));
          const q = JSON.parse(new TextDecoder().decode(bytes));
          setQuestion({ question: String(q.question ?? ''), options: (q.options ?? []).map(String), multi: !!q.multi, n: q.n ?? 1, of: q.of ?? 1 });
          setPicked([]);
          setWriteIn('');
        } catch {
          /* the question is printed in the terminal anyway */
        }
        s.asking = true;
        s.pending = [];
        window.setTimeout(() => {
          term.write('\r\n');
          editRow.current = 0;
          redraw();
        }, 0);
        return true;
      }
      if (data === 'ZarwaAskDone') {
        s.asking = false;
        s.line = '';
        s.cursor = 0;
        setQuestion(null);
        return true;
      }
      const path = data.startsWith('ZarwaImage=') ? data.slice('ZarwaImage='.length) : null;
      if (!path || !/^[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/.test(path)) return false;
      setImages((list) => (list.some((i) => i.path === path) ? list : [...list, { path, url: null }]));
      supabase.storage
        .from('terminal-media')
        .createSignedUrl(path, 60 * 60)
        .then(({ data: signed }) => setImages((list) => list.map((i) => (i.path === path ? { ...i, url: signed?.signedUrl ?? null } : i))));
      return true;
    });

    if (fixedMode) {
      term.writeln(FIXED_INTRO[fixedMode]);
      term.writeln(`\x1b[2mSigned in as ${session.email}${session.is_principal ? ' (principal, unlimited)' : ''}. Changes are sent to the admin for approval.\x1b[0m`);
    } else {
      term.writeln('\x1b[1;36mZarwa web terminal\x1b[0m \x1b[2m— commands run in the cloud, nothing touches your computer\x1b[0m');
      term.writeln(`\x1b[2mSigned in as ${session.email}${session.is_principal ? ' (principal, unlimited)' : ''}. Type \x1b[0m\x1b[36mhelp\x1b[0m\x1b[2m to start.\x1b[0m`);
    }
    prompt();
    if (active) term.focus();
    setReady(true);

    // terminal cells a string takes: Arabic marks take none, CJK takes two
    const cells = (str: string) => {
      let n = 0;
      for (const ch of str) {
        const c = ch.codePointAt(0)!;
        if ((c >= 0x300 && c <= 0x36f) || (c >= 0x610 && c <= 0x61a) || (c >= 0x64b && c <= 0x65f) || c === 0x670 || (c >= 0x6d6 && c <= 0x6ed) || c === 0x200c || c === 0x200d) continue;
        n += (c >= 0x1100 && c <= 0x115f) || (c >= 0x2e80 && c <= 0xa4cf) || (c >= 0xac00 && c <= 0xd7a3) || (c >= 0xf900 && c <= 0xfaff) || (c >= 0xff00 && c <= 0xff60) || c >= 0x20000 ? 2 : 1;
      }
      return n;
    };
    // eslint-disable-next-line no-control-regex
    const promptCells = () => cells(promptTextRef.current().replace(/\x1b\[[0-9;]*m/g, ''));
    const upToStart = () => (editRow.current > 0 ? `\x1b[${editRow.current}A` : '') + '\r\x1b[J';

    const redraw = () => {
      const s = state.current;
      // rewrite the whole input (every wrapped row) and put the cursor in place
      const cols = term.cols || 80;
      const pw = promptCells();
      let out = upToStart() + promptTextRef.current() + s.line;
      const total = pw + cells(s.line);
      const endRow = total > 0 && total % cols === 0 ? total / cols - 1 : Math.floor(total / cols);
      const target = pw + cells(s.line.slice(0, s.cursor));
      let row = endRow;
      if (target < total) {
        const tr = Math.floor(target / cols);
        const tc = target % cols;
        if (endRow > tr) out += `\x1b[${endRow - tr}A`;
        out += '\r' + (tc ? `\x1b[${tc}C` : '');
        row = tr;
      }
      editRow.current = row;
      term.write(out);
    };
    // before Enter / Ctrl+C: cursor to the end of the input so output starts below it
    const toEnd = () => {
      const s = state.current;
      if (s.cursor === s.line.length) return;
      s.cursor = s.line.length;
      redraw();
    };

    noticeRef.current = (text: string) => {
      const s = state.current;
      if (s.ended) return;
      if (s.busy) return void term.write(`\r\n${text}`);
      term.write(`${upToStart()}${text}\r\n`);
      editRow.current = 0;
      redraw();
    };

    // the answer goes to the running job; the bridge hands it to the agent
    answerRef.current = (text: string) => {
      const s = state.current;
      const job = s.job;
      if (!job || !text.trim()) return;
      term.write('\r\n');
      supabase.rpc('bridge_job_reply', { p_job_id: job.id, p_text: text.slice(0, 4000) }).then(({ error }) => {
        if (error) term.write(`\x1b[31m${/[\u0600-\u06FF]/.test(error.message) ? 'Could not send the answer.' : error.message}\x1b[0m\r\n`);
      });
    };

    const feed = (data: string) => {
      const s = state.current;
      if (s.ended) return;
      if (s.busy && s.asking && data === '\r') {
        toEnd();
        const line = s.line;
        s.line = '';
        s.cursor = 0;
        answerRef.current(line);
        return;
      }
      if (s.busy && !s.asking) {
        // Ctrl+C stops the running command; anything else is typed ahead and replayed afterwards
        if (data === '\x03') {
          s.pending = [];
          if (s.job) {
            term.write('\x1b[2m^C\x1b[0m');
            s.job.stop();
          } else s.abort?.abort();
        } else s.pending.push(data);
        return;
      }
      if (data === '\r') {
        toEnd();
        const line = s.line;
        s.line = '';
        s.cursor = 0;
        run(line);
        return;
      }
      if (data === '\x7f') {
        if (s.cursor > 0) {
          s.line = s.line.slice(0, s.cursor - 1) + s.line.slice(s.cursor);
          s.cursor--;
          redraw();
        }
        return;
      }
      if (data === '\x03') {
        toEnd();
        term.write('^C');
        s.line = '';
        s.cursor = 0;
        prompt();
        return;
      }
      if (data === '\x0c') {
        term.clear();
        editRow.current = 0;
        redraw();
        return;
      }
      if (data === '\x1b[A' || data === '\x1b[B') {
        if (!s.history.length) return;
        if (data === '\x1b[A') s.histIndex = s.histIndex === -1 ? s.history.length - 1 : Math.max(0, s.histIndex - 1);
        else s.histIndex = s.histIndex === -1 ? -1 : s.histIndex + 1 >= s.history.length ? -1 : s.histIndex + 1;
        s.line = s.histIndex === -1 ? '' : s.history[s.histIndex];
        s.cursor = s.line.length;
        redraw();
        return;
      }
      if (data === '\x1b[D') {
        if (s.cursor > 0) {
          s.cursor--;
          redraw();
        }
        return;
      }
      if (data === '\x1b[C') {
        if (s.cursor < s.line.length) {
          s.cursor++;
          redraw();
        }
        return;
      }
      if (data.startsWith('\x1b')) return; // other escape sequences
      // printable text, including paste (first line only)
      const text = data.split(/\r?\n/)[0].replace(/[\x00-\x1f]/g, '');
      if (!text) return;
      s.line = (s.line.slice(0, s.cursor) + text + s.line.slice(s.cursor)).slice(0, 1000);
      s.cursor = Math.min(s.cursor + text.length, s.line.length);
      redraw();
    };
    feedRef.current = feed;
    const sub = term.onData(feed);

    // The admin's central AI (العقل المركزي) types here exactly like a person would: the line shows in
    // this terminal and runs with the signed-in user's own terminal permissions (checked server side).
    const brainHook = {
      type: (line: string) => { feed(line); feed('\r'); },
      busy: () => state.current.busy,
      mode: () => state.current.mode,
      read: (n = 40) => {
        const b = term.buffer.active;
        const lines: string[] = [];
        for (let i = Math.max(0, b.length - n); i < b.length; i++) lines.push(b.getLine(i)?.translateToString(true) ?? '');
        return lines.join('\n').trim();
      },
    };
    if (primary) (window as unknown as { __brainTerminal?: typeof brainHook }).__brainTerminal = brainHook;

    const ro = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch {
        /* host hidden */
      }
      // the width changed, so the input wraps differently: recount the cursor's row
      const s = state.current;
      if (!s.busy || s.asking) editRow.current = Math.floor((promptCells() + cells(s.line.slice(0, s.cursor))) / (term.cols || 80));
    });
    ro.observe(host);

    // theme follows light/dark switches
    const mo = new MutationObserver(() => (term.options.theme = themeFromTokens()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    return () => {
      const w = window as unknown as { __brainTerminal?: typeof brainHook };
      if (w.__brainTerminal === brainHook) delete w.__brainTerminal;
      sub.dispose();
      ro.disconnect();
      mo.disconnect();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.session_id]);

  // Tab switch: the host was hidden, so fit it to its real size and put the cursor here
  useEffect(() => {
    if (!active || !ready) return;
    const id = window.requestAnimationFrame(() => {
      try {
        fitRef.current?.fit();
      } catch {
        /* still hidden */
      }
      if (touch) composerRef.current?.focus({ preventScroll: true });
      else termRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [active, ready]);

  // Kill switch: react to the session row changing (terminated / expired) in real time
  useEffect(() => {
    const channel = supabase
      .channel(`terminal-session-${session.session_id}-${fixedMode ?? 'cloud'}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_terminal_sessions', filter: `id=eq.${session.session_id}` },
        (payload) => {
          const row = payload.new as { status: string; ended_reason: string | null };
          // the (often Arabic) reason is shown in the page banner; xterm cannot render right-to-left text
          if (row.status === 'terminated') lockWith({ kind: 'terminated', reason: row.ended_reason }, 'Session terminated by the principal.');
          else if (row.status === 'expired') lockWith({ kind: 'expired' }, 'Session time is over.');
          else if (row.status === 'closed') lockWith({ kind: 'closed' }, 'Session closed.');
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lockWith, session.session_id, fixedMode]);

  // Approval gate: changes are pushed only when the principal approves them in /admin?tab=terminal.
  // RLS limits the rows to the user's own requests (the principal sees all).
  useEffect(() => {
    const seen = new Map<string, string>();
    const channel = supabase
      .channel(`terminal-deploys-${session.session_id}-${fixedMode ?? 'cloud'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'terminal_deploy_requests' }, (payload) => {
        if (payload.eventType === 'DELETE') return;
        const r = payload.new as { id: string; status: string; commit_sha: string | null; changed_files: unknown[]; user_email: string | null };
        if (seen.get(r.id) === r.status) return;
        seen.set(r.id, r.status);
        const n = Array.isArray(r.changed_files) ? r.changed_files.length : 0;
        const who = session.is_principal && r.user_email && r.user_email !== session.email ? ` (${r.user_email})` : '';
        const say = noticeRef.current;
        if (r.status === 'pending' && payload.eventType === 'INSERT') {
          if (primary) toast.info('تم تجهيز التعديلات وإرسال طلب موافقة للأدمن. سيتم الرفع فور موافقة الأدمن.');
        } else if (r.status === 'pushing') {
          say(`\x1b[2m● Approved by the admin${who}; pushing ${n} file(s)…\x1b[0m`);
        } else if (r.status === 'deployed') {
          say(`\x1b[1;32m✓ Approved and pushed${who}: ${r.commit_sha?.slice(0, 7) ?? ''}. The site deploys automatically.\x1b[0m`);
          if (primary) toast.success('وافق الأدمن على التعديلات ورُفعت بنجاح. سيُنشر الموقع تلقائياً.');
        } else if (r.status === 'rejected') {
          say(`\x1b[1;31m✗ The admin rejected the changes${who}; they will be reverted on the computer.\x1b[0m`);
          if (primary) toast.error('رفض الأدمن التعديلات وأُلغيت.');
        } else if (r.status === 'failed') {
          say(`\x1b[1;31m✗ The push failed${who}; the admin can see the details.\x1b[0m`);
          if (primary) toast.error('تعذّر رفع التعديلات. التفاصيل في لوحة الأدمن.');
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.session_id, session.is_principal, session.email, primary, fixedMode]);

  // Close the session when the page goes away. The unmount close is deferred so React StrictMode's
  // simulated unmount/remount in development does not end a fresh session.
  useEffect(() => {
    if (!primary) return;
    const id = session.session_id;
    window.clearTimeout(pendingClose.get(id));
    const end = () => {
      if (!state.current.ended) callTerminal({ action: 'end', session_id: id }, undefined, true).catch(() => {});
    };
    window.addEventListener('pagehide', end);
    return () => {
      window.removeEventListener('pagehide', end);
      pendingClose.set(id, window.setTimeout(end, 500));
    };
  }, [session.session_id, primary]);

  const sendAnswer = (text: string) => {
    if (!text.trim()) return;
    answerRef.current(text);
  };

  return (
    <>
      {question && (
        <div className="space-y-3 border-b border-border bg-warning/5 p-4" dir="rtl">
          <div className="flex items-start gap-2 text-sm font-bold">
            <span className="rounded-full bg-warning px-2 text-white">?</span>
            <span dir="auto" className="whitespace-pre-wrap">
              {question.of > 1 && `(${question.n}/${question.of}) `}
              {question.question}
            </span>
          </div>
          {question.options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {question.options.map((o, i) => {
                const on = picked.includes(i + 1);
                return (
                  <button
                    key={i}
                    type="button"
                    dir="auto"
                    onClick={() => (question.multi ? setPicked((p) => (on ? p.filter((x) => x !== i + 1) : [...p, i + 1])) : sendAnswer(String(i + 1)))}
                    className={`rounded-xl border px-3 py-2 text-start text-sm transition ${on ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary'}`}
                  >
                    <span className="ms-0 me-1 font-mono text-xs text-muted-foreground">{i + 1}</span> {o}
                  </button>
                );
              })}
            </div>
          )}
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendAnswer(writeIn.trim() || picked.join(','));
            }}
          >
            <input
              value={writeIn}
              onChange={(e) => setWriteIn(e.target.value)}
              placeholder="أو اكتب إجابتك الخاصة…"
              dir="auto"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button type="submit" disabled={!writeIn.trim() && !picked.length} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
              إرسال
            </button>
            <button type="button" onClick={() => sendAnswer('skip')} className="rounded-lg border border-border px-3 py-2 text-sm">
              تخطي
            </button>
          </form>
        </div>
      )}
      <div
        ref={hostRef}
        dir="ltr"
        data-ready={ready}
        className={`h-[60vh] min-h-[360px] w-full overflow-hidden bg-card px-3 py-2 text-left ${images.length || touch ? '' : 'rounded-b-3xl'}`}
        onClick={() => (touch ? composerRef.current?.focus() : termRef.current?.focus())}
      />
      <form
        dir="rtl"
        className={`flex gap-2 border-t border-border bg-card p-2 ${touch ? (images.length ? '' : 'rounded-b-3xl') : 'hidden'}`}
        onSubmit={(e) => {
          e.preventDefault();
          const text = composer.replace(/[\r\n]+/g, ' ').slice(0, 1000);
          setComposer('');
          if (text) feedRef.current(text);
          feedRef.current('\r');
          composerRef.current?.focus();
        }}
      >
        <input
          ref={composerRef}
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          dir="auto"
          enterKeyHint="send"
          autoComplete="off"
          placeholder="اكتب طلبك هنا واضغط إرسال…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          إرسال
        </button>
        <button type="button" title="إيقاف (Ctrl+C)" onClick={() => feedRef.current('\x03')} className="rounded-lg border border-border px-3 py-2 text-sm">
          إيقاف
        </button>
      </form>
      {images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto rounded-b-3xl border-t border-border bg-muted/30 p-3" dir="ltr">
          {images.map((img) => (
            <a
              key={img.path}
              href={img.url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="block h-40 shrink-0 overflow-hidden rounded-xl border border-border bg-background"
              title={img.path.split('/').pop()}
            >
              {img.url ? (
                <img src={img.url} alt={img.path.split('/').pop()} className="h-full w-auto object-contain" />
              ) : (
                <div className="flex h-full w-40 items-center justify-center text-xs text-muted-foreground">…</div>
              )}
            </a>
          ))}
        </div>
      )}
    </>
  );
};
