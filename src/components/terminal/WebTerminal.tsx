import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { supabase } from '@/integrations/supabase/client';

/**
 * Browser terminal (xterm.js). Commands go to the web-terminal-exec Edge Function, which checks the
 * session, quota and ban in the database before running anything, and streams output back as NDJSON.
 * The session row is watched through realtime, so a kill switch from the admin panel locks this
 * screen immediately.
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
}

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

export const WebTerminal: React.FC<Props> = ({ session, onEnded, onQuota }) => {
  const hostRef = useRef<HTMLDivElement>(null);
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
    mode: 'cloud' as Mode,
    claudeSession: null as string | null,
    job: null as { id: string; stop: () => void } | null,
  });
  const feedRef = useRef<(data: string) => void>(() => {});
  const [ready, setReady] = useState(false);

  const promptText = useCallback(() => {
    const mode = state.current.mode;
    if (mode === 'claude') return '\x1b[1;35mclaude\x1b[0m \x1b[2m›\x1b[0m ';
    if (mode === 'antigravity') return '\x1b[1;34mantigravity\x1b[0m \x1b[2m›\x1b[0m ';
    if (mode === 'shell') return '\x1b[1;33mmac\x1b[0m:\x1b[1;34mproject\x1b[0m$ ';
    return `\x1b[1;32m${session.email.split('@')[0]}@zarwa\x1b[0m:\x1b[1;34m~\x1b[0m$ `;
  }, [session.email]);
  const promptTextRef = useRef(promptText);
  promptTextRef.current = promptText;

  const prompt = useCallback(() => {
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
    (jobId: string, kind: 'claude' | 'antigravity' | 'shell') =>
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
      if (s.mode !== 'cloud' && (cmd === 'exit' || cmd === 'quit')) {
        s.mode = 'cloud';
        term.write('\r\n\x1b[2mBack to platform commands.\x1b[0m');
        return prompt();
      }
      if (cmd === 'exit') {
        await callTerminal({ action: 'end', session_id: session.session_id }).catch(() => {});
        lockWith({ kind: 'closed' }, 'Session closed.');
        return;
      }
      if (s.mode === 'cloud' && (cmd === 'claude' || cmd === 'shell' || cmd === 'antigravity' || cmd === 'agy')) {
        s.mode = cmd === 'agy' ? 'antigravity' : cmd;
        term.write(
          s.mode === 'claude'
            ? `\r\n\x1b[35mClaude Code on the principal's computer.\x1b[0m \x1b[2mEvery line is a message${s.claudeSession ? ' (continuing the last conversation)' : ''}. /new starts over, exit leaves.\x1b[0m`
            : s.mode === 'antigravity'
              ? "\r\n\x1b[34mAntigravity agent on the principal's computer.\x1b[0m \x1b[2mEach line is sent as a task; the agent answers inside the Antigravity app. exit leaves.\x1b[0m"
              : "\r\n\x1b[33mShell on the principal's computer, in the project folder.\x1b[0m \x1b[2mNon-interactive commands only. exit leaves.\x1b[0m",
        );
        return prompt();
      }
      if (s.mode === 'claude' && cmd === '/new') {
        s.claudeSession = null;
        term.write('\r\n\x1b[2mNew Claude conversation.\x1b[0m');
        return prompt();
      }
      const wire = s.mode === 'claude' ? `claude ${cmd}` : s.mode === 'antigravity' ? `antigravity ${cmd}` : s.mode === 'shell' ? `sh ${cmd}` : cmd;
      const resume = s.mode === 'claude' ? s.claudeSession : null;

      s.busy = true;
      const abort = new AbortController();
      s.abort = abort;
      term.write('\r\n');
      let first = true;
      try {
        const res = await callTerminal({ action: 'exec', session_id: session.session_id, command: wire, resume_session: resume }, abort.signal);
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
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(host);
    fit.fit();
    termRef.current = term;

    term.writeln('\x1b[1;36mZarwa web terminal\x1b[0m \x1b[2m— commands run in the cloud, nothing touches your computer\x1b[0m');
    term.writeln(`\x1b[2mSigned in as ${session.email}${session.is_principal ? ' (principal, unlimited)' : ''}. Type \x1b[0m\x1b[36mhelp\x1b[0m\x1b[2m to start.\x1b[0m`);
    prompt();
    term.focus();
    setReady(true);

    const redraw = () => {
      const s = state.current;
      // rewrite the current input line and put the cursor in place
      term.write('\x1b[2K\r');
      term.write(`${promptTextRef.current()}${s.line}`);
      const back = s.line.length - s.cursor;
      if (back > 0) term.write(`\x1b[${back}D`);
    };

    const feed = (data: string) => {
      const s = state.current;
      if (s.ended) return;
      if (s.busy) {
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
        term.write('^C');
        s.line = '';
        s.cursor = 0;
        prompt();
        return;
      }
      if (data === '\x0c') {
        term.clear();
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
          term.write(data);
        }
        return;
      }
      if (data === '\x1b[C') {
        if (s.cursor < s.line.length) {
          s.cursor++;
          term.write(data);
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

    const ro = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch {
        /* host hidden */
      }
    });
    ro.observe(host);

    // theme follows light/dark switches
    const mo = new MutationObserver(() => (term.options.theme = themeFromTokens()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    return () => {
      sub.dispose();
      ro.disconnect();
      mo.disconnect();
      term.dispose();
      termRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.session_id]);

  // Kill switch: react to the session row changing (terminated / expired) in real time
  useEffect(() => {
    const channel = supabase
      .channel(`terminal-session-${session.session_id}`)
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
  }, [lockWith, session.session_id]);

  // Close the session when the page goes away. The unmount close is deferred so React StrictMode's
  // simulated unmount/remount in development does not end a fresh session.
  useEffect(() => {
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
  }, [session.session_id]);

  return (
    <div
      ref={hostRef}
      dir="ltr"
      data-ready={ready}
      className="h-[60vh] min-h-[360px] w-full overflow-hidden rounded-b-3xl bg-card px-3 py-2 text-left"
      onClick={() => termRef.current?.focus()}
    />
  );
};
