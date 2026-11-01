// web-terminal-exec — executes commands typed in the platform's web terminal (/terminal).
//
// Every request: verify the caller's JWT → (exec) terminal_begin_command() checks the session,
// quota, rate limit and ban atomically in the database and logs the command → run the command
// from the fixed registry below → stream output as NDJSON → terminal_finish_command().
// There is no shell: only the commands defined here exist. Admin commands need the principal.
//
// Request:  POST { action: 'start' } | { action: 'exec', session_id, command } | { action: 'end', session_id }
// Response: start/end → JSON. exec → NDJSON lines: {"t":"out","d":"…"} … then {"t":"end",…}

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// ---------------------------------------------------------------- ANSI helpers
const c = {
  bold: (s: string) => `\x1b[1m${s}\x1b[22m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
  red: (s: string) => `\x1b[31m${s}\x1b[39m`,
  green: (s: string) => `\x1b[32m${s}\x1b[39m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[39m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[39m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[39m`,
};
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');
const pad = (s: string | number, n: number) => {
  const str = String(s);
  return str.length >= n ? str : str + ' '.repeat(n - str.length);
};
const ammanTime = (d: Date | string = new Date()) =>
  new Date(d).toLocaleString('en-GB', { timeZone: 'Asia/Amman', dateStyle: 'medium', timeStyle: 'medium' });
const bytes = (n: number) => (n > 1e9 ? `${(n / 1e9).toFixed(2)} GB` : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} kB`);
const duration = (ms: number) => {
  const m = Math.floor(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m ${Math.floor((ms % 60000) / 1000)}s`;
};

/** Splits a command line into words, honouring "double" and 'single' quotes. */
const tokenize = (line: string) => {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
};

// ---------------------------------------------------------------- command registry
interface Ctx {
  service: SupabaseClient;
  userId: string;
  email: string;
  isPrincipal: boolean;
  sessionId: string;
  begin: Record<string, any>;
  args: string[];
  out: (line?: string) => void;
}

interface Command {
  usage: string;
  help: string;
  admin?: boolean;
  run: (ctx: Ctx) => Promise<void>;
}

const SECTIONS = [
  ['learn', '/learn', 'Learning & curriculum'],
  ['exams', '/exams', 'Exams & assessment'],
  ['labs', '/labs', 'Labs & simulations'],
  ['tools', '/tools', 'Student tools'],
  ['school', '/school', 'School community'],
  ['future', '/future-projects', 'Future projects'],
];

const COUNTED_TABLES = [
  'profiles',
  'subject_puzzles',
  'user_solved_puzzles',
  'community_forum_messages',
  'exam_library_files',
  'team_members',
  'team_tasks',
  'team_messages',
  'contact_messages',
  'institutional_partnerships',
];

const findUserByEmail = async (service: SupabaseClient, email: string) => {
  const { data } = await service.from('usage_quotas').select('user_id, email').eq('email', email.toLowerCase()).maybeSingle();
  return data;
};

const quotaLine = (q: Record<string, any> | null) =>
  q
    ? `${q.used_today}/${q.daily_limit} today · ${q.used_total}${q.total_limit != null ? '/' + q.total_limit : ''} total · ${q.per_minute_limit}/min`
    : 'unlimited';

const COMMANDS: Record<string, Command> = {
  help: {
    usage: 'help',
    help: 'List the commands you can run',
    run: async ({ isPrincipal, out }) => {
      out(c.bold('Commands'));
      for (const [name, cmd] of Object.entries(COMMANDS)) {
        if (cmd.admin) continue;
        out(`  ${c.cyan(pad(cmd.usage, 28))} ${cmd.help}`);
      }
      out(`  ${c.cyan(pad('claude <prompt>', 28))} Ask Claude Code on the principal's computer`);
      out(`  ${c.cyan(pad('claude', 28))} Chat mode with Claude (exit to leave)`);
      out(`  ${c.cyan(pad('antigravity <prompt>', 28))} Ask the Antigravity agent there (also: agy)`);
      out(`  ${c.cyan(pad('antigravity', 28))} Chat mode with Antigravity (exit to leave)`);
      out(`  ${c.cyan(pad('ai <prompt>', 28))} Your assigned agent (Claude or Antigravity)`);
      out(`  ${c.cyan(pad('sh <command>', 28))} Run a shell command there (also: $ <command>)`);
      out(`  ${c.cyan(pad('shell', 28))} Shell mode (exit to leave)`);
      out(`  ${c.cyan(pad('submit [message]', 28))} Send the changes for the admin's approval (also: request-push)`);
      out(c.dim('  No commit, push or deploy from here: changed files go to the admin, who approves and pushes them.'));
      out(`  ${c.cyan(pad('clear', 28))} Clear the screen (local, not counted)`);
      out(`  ${c.cyan(pad('exit', 28))} End this session`);
      if (isPrincipal) {
        out();
        out(c.bold('Admin commands') + c.dim(' (principal only)'));
        for (const cmd of Object.values(COMMANDS)) if (cmd.admin) out(`  ${c.yellow(pad(cmd.usage, 28))} ${cmd.help}`);
      }
    },
  },
  whoami: {
    usage: 'whoami',
    help: 'Your account, roles and session',
    run: async ({ service, userId, email, isPrincipal, begin, out }) => {
      const { data: roles } = await service.from('team_members').select('role').eq('user_id', userId);
      out(`${c.bold('user')}      ${email}`);
      out(`${c.bold('access')}    ${isPrincipal ? c.green('principal (unlimited)') : 'terminal user'}`);
      out(`${c.bold('team')}      ${(roles ?? []).map((r) => r.role).join(', ') || '-'}`);
      out(`${c.bold('session')}   started ${ammanTime(begin.session.started_at)} · ${begin.session.commands} commands`);
      if (begin.session.expires_at) {
        const left = new Date(begin.session.expires_at).getTime() - Date.now();
        out(`${c.bold('expires')}   in ${duration(Math.max(0, left))}`);
      }
    },
  },
  status: {
    usage: 'status',
    help: 'Platform and service health check',
    run: async ({ service, isPrincipal, begin, out }) => {
      out(c.bold('Platform status') + c.dim(`  ${ammanTime()} (Amman)`));
      const t0 = performance.now();
      const { error, count } = await service.from('profiles').select('id', { count: 'exact', head: true });
      const ms = Math.round(performance.now() - t0);
      out(`  ${pad('database', 14)} ${error ? c.red('✗ ' + error.message) : c.green('✓ online') + c.dim(` ${ms} ms`)}`);
      out(`  ${pad('accounts', 14)} ${count ?? '?'} profiles`);
      const t1 = performance.now();
      const { error: aerr } = await service.auth.admin.listUsers({ page: 1, perPage: 1 });
      out(`  ${pad('auth', 14)} ${aerr ? c.red('✗ ' + aerr.message) : c.green('✓ online') + c.dim(` ${Math.round(performance.now() - t1)} ms`)}`);
      const t2 = performance.now();
      const { error: serr } = await service.storage.listBuckets();
      out(`  ${pad('storage', 14)} ${serr ? c.red('✗ ' + serr.message) : c.green('✓ online') + c.dim(` ${Math.round(performance.now() - t2)} ms`)}`);
      out(`  ${pad('edge function', 14)} ${c.green('✓ web-terminal-exec')}${c.dim(` ${Deno.env.get('SB_REGION') ?? Deno.env.get('DENO_REGION') ?? ''}`)}`);
      if (isPrincipal) {
        const { data: health } = await service.rpc('terminal_db_health');
        if (health) {
          out(`  ${pad('postgres', 14)} ${health.version} · ${bytes(health.database_bytes)} · ${health.connections} connections`);
          out(`  ${pad('tables', 14)} ${health.public_tables} public · ${health.archived_tables} archived · ${health.users} auth users`);
        }
      }
      out(`  ${pad('your quota', 14)} ${quotaLine(begin.quota)}`);
    },
  },
  quota: {
    usage: 'quota',
    help: 'Your command quota and usage',
    run: async ({ begin, isPrincipal, out }) => {
      if (isPrincipal) {
        out(c.green('Unlimited (principal).'));
        return;
      }
      const q = begin.quota;
      out(`${pad('today', 12)} ${q.used_today} / ${q.daily_limit}`);
      out(`${pad('total', 12)} ${q.used_total}${q.total_limit != null ? ' / ' + q.total_limit : ' (no total limit)'}`);
      out(`${pad('rate', 12)} ${q.per_minute_limit} commands per minute`);
      out(`${pad('session', 12)} ${q.session_minutes} minutes per session`);
    },
  },
  history: {
    usage: 'history [n]',
    help: 'Your last commands (default 15)',
    run: async ({ service, userId, args, out }) => {
      const n = Math.min(Math.max(parseInt(args[0] ?? '15', 10) || 15, 1), 100);
      const { data } = await service
        .from('terminal_command_logs')
        .select('command, status, created_at')
        .eq('user_id', userId)
        .order('id', { ascending: false })
        .limit(n + 1);
      for (const row of (data ?? []).slice(1).reverse()) {
        const st = row.status === 'ok' ? c.green('ok ') : row.status === 'denied' ? c.red('den') : c.yellow(row.status.slice(0, 3));
        out(`${c.dim(ammanTime(row.created_at))}  ${st}  ${row.command}`);
      }
    },
  },
  date: {
    usage: 'date',
    help: 'Server time (Amman)',
    run: async ({ out }) => out(ammanTime()),
  },
  echo: {
    usage: 'echo <text>',
    help: 'Print text',
    run: async ({ args, out }) => out(args.join(' ')),
  },
  sections: {
    usage: 'sections',
    help: 'The platform sections and their paths',
    run: async ({ out }) => {
      for (const [id, path, title] of SECTIONS) out(`  ${c.cyan(pad(id, 10))} ${pad(path, 18)} ${title}`);
    },
  },

  // ---------------------------------------------------------------- principal only
  stats: {
    usage: 'stats',
    help: 'Row counts of the main platform tables',
    admin: true,
    run: async ({ service, out }) => {
      for (const t of COUNTED_TABLES) {
        const { count, error } = await service.from(t).select('*', { count: 'exact', head: true });
        out(`  ${pad(t, 30)} ${error ? c.red(error.message) : c.bold(String(count))}`);
      }
    },
  },
  db: {
    usage: 'db <health|tables [n]|migrations>',
    help: 'Database health, largest tables, latest migrations',
    admin: true,
    run: async ({ service, args, out }) => {
      const sub = args[0] ?? 'health';
      if (sub === 'tables') {
        const n = Math.min(Math.max(parseInt(args[1] ?? '15', 10) || 15, 1), 200);
        const { data, error } = await service.rpc('terminal_db_tables');
        if (error) throw error;
        out(c.dim(`${pad('table', 40)} ${pad('rows (est.)', 14)} size`));
        for (const r of (data ?? []).slice(0, n)) out(`${pad(r.table_name, 40)} ${pad(r.est_rows, 14)} ${bytes(r.total_bytes)}`);
        return;
      }
      const { data: h, error } = await service.rpc('terminal_db_health');
      if (error) throw error;
      if (sub === 'migrations') {
        for (const m of h.latest_migrations ?? []) out(`  ${m}`);
        return;
      }
      out(`${pad('version', 16)} ${h.version}`);
      out(`${pad('size', 16)} ${bytes(h.database_bytes)}`);
      out(`${pad('connections', 16)} ${h.connections}`);
      out(`${pad('public tables', 16)} ${h.public_tables}`);
      out(`${pad('archived', 16)} ${h.archived_tables}`);
      out(`${pad('auth users', 16)} ${h.users}`);
      out(`${pad('last migration', 16)} ${(h.latest_migrations ?? [])[0] ?? '-'}`);
    },
  },
  sessions: {
    usage: 'sessions',
    help: 'Active terminal sessions',
    admin: true,
    run: async ({ service, out }) => {
      const { data } = await service
        .from('user_terminal_sessions')
        .select('id, email, started_at, commands_count, expires_at, is_principal')
        .eq('status', 'active')
        .order('started_at', { ascending: false });
      if (!data?.length) return out(c.dim('No active sessions.'));
      for (const s of data) {
        const left = s.expires_at ? duration(Math.max(0, new Date(s.expires_at).getTime() - Date.now())) + ' left' : 'no limit';
        out(`${c.cyan(s.id.slice(0, 8))}  ${pad(s.email, 34)} ${pad(s.commands_count + ' cmds', 10)} ${c.dim(left)}`);
      }
    },
  },
  users: {
    usage: 'users',
    help: 'Who has terminal access, with usage',
    admin: true,
    run: async ({ service, out }) => {
      const { data } = await service.from('usage_quotas').select('*').order('email');
      if (!data?.length) return out(c.dim('No users have access yet. Use: grant <email>'));
      for (const q of data) {
        const state = q.banned ? c.red('banned ') : q.enabled ? c.green('enabled') : c.yellow('off    ');
        out(`${state}  ${pad(q.email, 34)} ${quotaLine(q)}`);
      }
    },
  },
  grant: {
    usage: 'grant <email> [daily]',
    help: 'Give an account terminal access',
    admin: true,
    run: async ({ service, args, out }) => {
      const [email, daily] = args;
      if (!email?.includes('@')) return out(c.red('usage: grant <email> [daily]'));
      const row: Record<string, unknown> = { email };
      if (daily) row.daily_limit = Math.max(0, parseInt(daily, 10) || 0);
      const { error } = await service.from('usage_quotas').insert(row);
      if (error) throw new Error(error.code === '23505' ? 'already has access' : error.message);
      out(c.green(`✓ ${email} can now use the terminal`));
    },
  },
  revoke: {
    usage: 'revoke <email>',
    help: 'Remove access and end their sessions',
    admin: true,
    run: async ({ service, args, out }) => {
      const { data, error } = await service.from('usage_quotas').delete().eq('email', (args[0] ?? '').toLowerCase()).select('email');
      if (error) throw error;
      out(data?.length ? c.green(`✓ access removed for ${args[0]}`) : c.yellow('no such user'));
    },
  },
  limit: {
    usage: 'limit <email> <daily> [total]',
    help: 'Change daily (and optional total) limit',
    admin: true,
    run: async ({ service, args, out }) => {
      const [email, daily, total] = args;
      const d = parseInt(daily ?? '', 10);
      if (!email || Number.isNaN(d)) return out(c.red('usage: limit <email> <daily> [total]'));
      const patch: Record<string, unknown> = { daily_limit: Math.max(0, d) };
      if (total !== undefined) patch.total_limit = total === 'none' ? null : Math.max(0, parseInt(total, 10) || 0);
      const { data, error } = await service.from('usage_quotas').update(patch).eq('email', email.toLowerCase()).select('email');
      if (error) throw error;
      out(data?.length ? c.green(`✓ limits updated for ${email}`) : c.yellow('no such user'));
    },
  },
  kill: {
    usage: 'kill <email|session> [--ban] [reason]',
    help: 'End sessions now; --ban also blocks the account',
    admin: true,
    run: async ({ service, userId, args, out }) => {
      const ban = args.includes('--ban');
      const rest = args.filter((a) => a !== '--ban');
      const target = rest.shift();
      const reason = rest.join(' ') || 'Ended by the principal';
      if (!target) return out(c.red('usage: kill <email|session> [--ban] [reason]'));
      let q = service.from('user_terminal_sessions').update({ status: 'terminated', ended_at: new Date().toISOString(), terminated_by: userId, ended_reason: reason }).eq('status', 'active');
      let victim: string | null = null;
      if (target.includes('@')) {
        const u = await findUserByEmail(service, target);
        if (!u) return out(c.yellow('no such user'));
        victim = u.user_id;
        q = q.eq('user_id', u.user_id);
      } else {
        const { data: s } = await service.from('user_terminal_sessions').select('id, user_id').eq('status', 'active');
        const match = (s ?? []).filter((x) => x.id.startsWith(target));
        if (match.length !== 1) return out(c.yellow(match.length ? 'ambiguous session id' : 'no such active session'));
        victim = match[0].user_id;
        q = q.eq('id', match[0].id);
      }
      if (victim === userId && ban) return out(c.red('you cannot ban yourself'));
      const { data, error } = await q.select('id');
      if (error) throw error;
      out(c.green(`✓ ${data?.length ?? 0} session(s) terminated`));
      if (ban && victim) {
        const { error: berr } = await service.from('usage_quotas').update({ banned: true, ban_reason: reason }).eq('user_id', victim);
        if (berr) throw berr;
        out(c.red('✓ account banned from the terminal'));
      }
    },
  },
  unban: {
    usage: 'unban <email>',
    help: 'Lift a terminal ban',
    admin: true,
    run: async ({ service, args, out }) => {
      const { data, error } = await service
        .from('usage_quotas')
        .update({ banned: false, ban_reason: null })
        .eq('email', (args[0] ?? '').toLowerCase())
        .select('email');
      if (error) throw error;
      out(data?.length ? c.green(`✓ ${args[0]} unbanned`) : c.yellow('no such user'));
    },
  },
  logs: {
    usage: 'logs [email] [n]',
    help: 'Recent commands of everyone or one user',
    admin: true,
    run: async ({ service, args, out }) => {
      let email: string | undefined;
      let n = 20;
      for (const a of args) {
        if (a.includes('@')) email = a.toLowerCase();
        else if (/^\d+$/.test(a)) n = Math.min(parseInt(a, 10), 200);
      }
      let q = service.from('terminal_command_logs').select('command, status, created_at, user_id, user_terminal_sessions(email)').order('id', { ascending: false }).limit(n);
      if (email) {
        const u = await findUserByEmail(service, email);
        const { data: s } = u ? { data: u } : await service.from('user_terminal_sessions').select('user_id').eq('email', email).limit(1).maybeSingle();
        if (!s) return out(c.yellow('no such user'));
        q = q.eq('user_id', s.user_id);
      }
      const { data, error } = await q;
      if (error) throw error;
      for (const row of (data ?? []).reverse()) {
        const who = (row as any).user_terminal_sessions?.email ?? row.user_id.slice(0, 8);
        const st = row.status === 'ok' ? c.green('ok ') : row.status === 'denied' ? c.red('den') : c.yellow(row.status.slice(0, 3));
        out(`${c.dim(ammanTime(row.created_at))}  ${st}  ${pad(who, 28)} ${row.command}`);
      }
    },
  },
};

// ---------------------------------------------------------------- local bridge (scripts/local-bridge.mjs)
// Jobs for the principal's computer are signed with HMAC(deviceKey) where
// deviceKey = HMAC(BRIDGE_MASTER_KEY, 'bridge-device:' + device_id). The master key exists only in the
// Edge Function secrets, so rows written by anyone else (even with database access) are refused by the bridge.
const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const hmacHex = async (key: string, msg: string) => {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
};
const sha256Hex = async (text: string) => toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const masterKey = () => Deno.env.get('BRIDGE_MASTER_KEY') ?? '';
const deviceKeyFor = (deviceId: string) => hmacHex(masterKey(), `bridge-device:${deviceId}`);
export const jobPayload = (j: { id: string; device_id: string; kind: string; input: string; resume_session: string | null; is_principal: boolean; issued_at: number; user_email: string }) =>
  [j.id, j.device_id, j.kind, j.input, j.resume_session ?? '', j.is_principal ? '1' : '0', String(j.issued_at), j.user_email].join('\n');

const onlineDevice = async (service: SupabaseClient) => {
  const { data } = await service
    .from('bridge_devices')
    .select('id, name, last_seen_at, info')
    .eq('revoked', false)
    .gt('last_seen_at', new Date(Date.now() - 20000).toISOString())
    .order('last_seen_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
};

COMMANDS.bridge = {
  usage: 'bridge',
  help: 'Status of the bridge to the principal\'s computer',
  run: async ({ service, isPrincipal, begin, out }) => {
    if (!isPrincipal) out(`${pad('your agent', 10)} ${begin.allow_claude ? begin.agent : 'none'}`);
    const { data } = await service.from('bridge_devices').select('name, last_seen_at, info, revoked').eq('revoked', false).order('last_seen_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
    if (!masterKey()) out(c.yellow('Bridge signing key is not configured on the server (BRIDGE_MASTER_KEY).'));
    if (!data) return out(c.yellow('No computer is paired. The principal pairs one from /admin?tab=terminal.'));
    const online = !!data.last_seen_at && Date.now() - new Date(data.last_seen_at).getTime() < 20000;
    out(`${pad('status', 10)} ${online ? c.green('● online') : c.red('● offline')}`);
    out(`${pad('device', 10)} ${data.name}${data.info?.host ? ' · ' + data.info.host : ''}`);
    if (isPrincipal && data.info?.workdir) out(`${pad('workdir', 10)} ${data.info.workdir}`);
    if (data.info?.claude) out(`${pad('claude', 10)} ${data.info.claude}`);
    if (data.info?.antigravity) out(`${pad('antigrav.', 10)} ${data.info.antigravity}`);
    out(`${pad('seen', 10)} ${data.last_seen_at ? ammanTime(data.last_seen_at) : 'never'}`);
  },
};

const DENIED: Record<string, string> = {
  no_access: 'You do not have terminal access.',
  banned: 'Your account is banned from the terminal.',
  daily_limit: 'Daily command limit reached. Try again tomorrow.',
  total_limit: 'Total command limit reached.',
  rate_limit: 'Too many commands per minute. Wait a moment.',
  no_session: 'Session not found. Reload the page.',
  session_terminated: 'This session was terminated by the principal.',
  session_expired: 'Session time is over. Reload the page to start a new one.',
  session_closed: 'This session is closed.',
};

// ---------------------------------------------------------------- handler
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const service = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: auth, error: authError } = await service.auth.getUser(token);
  if (authError || !auth?.user) return json({ error: 'unauthorized' }, 401);
  const user = auth.user;

  let body: { action?: string; session_id?: string; command?: string; resume_session?: string; job_id?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  if (body.action === 'start') {
    const { data, error } = await service.rpc('terminal_start_session', {
      p_user_id: user.id,
      p_user_agent: req.headers.get('user-agent'),
    });
    if (error) return json({ error: error.message }, 500);
    return json(data, data?.ok ? 200 : 403);
  }

  if (body.action === 'cancel') {
    if (!body.job_id) return json({ error: 'bad request' }, 400);
    const principal = (await service.rpc('terminal_is_principal', { p_user_id: user.id })).data === true;
    let q = service.from('bridge_jobs').update({ status: 'cancelled', finished_at: new Date().toISOString(), error: 'Ctrl+C' }).eq('id', body.job_id).in('status', ['queued', 'running']);
    if (!principal) q = q.eq('user_id', user.id);
    await q;
    return json({ ok: true });
  }

  if (body.action === 'pair') {
    // Principal only: register this computer and return the one-time pairing code for local-bridge.mjs
    const principal = (await service.rpc('terminal_is_principal', { p_user_id: user.id })).data === true;
    if (!principal) return json({ error: 'principal only' }, 403);
    if (!masterKey()) return json({ error: 'BRIDGE_MASTER_KEY is not set in the Edge Function secrets' }, 412);
    const secret = b64url(crypto.getRandomValues(new Uint8Array(32)));
    const authHash = await sha256Hex(await hmacHex(secret, 'zarwa-bridge-auth'));
    await service.from('bridge_devices').update({ revoked: true }).eq('revoked', false);
    const { data: dev, error } = await service
      .from('bridge_devices')
      .insert({ name: (body.name ?? 'Mac').slice(0, 60) || 'Mac', auth_hash: authHash })
      .select('id')
      .single();
    if (error) return json({ error: error.message }, 500);
    const code = b64url(
      enc.encode(JSON.stringify({ u: supabaseUrl, k: Deno.env.get('SUPABASE_ANON_KEY'), d: dev.id, s: secret, g: await deviceKeyFor(dev.id) })),
    );
    return json({ ok: true, device_id: dev.id, code });
  }

  if (body.action === 'end') {
    if (body.session_id) await service.rpc('terminal_end_session', { p_user_id: user.id, p_session_id: body.session_id });
    return json({ ok: true });
  }

  if (body.action !== 'exec' || !body.session_id || typeof body.command !== 'string') return json({ error: 'bad request' }, 400);
  const line = body.command.trim().slice(0, 1000);
  if (!line) return json({ error: 'empty command' }, 400);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      const transcript: string[] = [];
      const out = (l = '') => {
        transcript.push(l);
        send({ t: 'out', d: l });
      };
      const started = performance.now();

      const { data: begin, error: beginError } = await service.rpc('terminal_begin_command', {
        p_user_id: user.id,
        p_session_id: body.session_id,
        p_command: line,
      });
      if (beginError || !begin) {
        out(c.red(`error: ${beginError?.message ?? 'could not start command'}`));
        send({ t: 'end', status: 'error' });
        controller.close();
        return;
      }
      if (!begin.ok) {
        // reasons are often Arabic, which a terminal renders reversed: the page shows them instead
        const latin = begin.detail && !/[\u0600-\u06FF]/.test(begin.detail) ? c.dim(` (${begin.detail})`) : '';
        out(c.red(DENIED[begin.reason] ?? `Denied: ${begin.reason}`) + latin);
        send({ t: 'end', status: 'denied', reason: begin.reason, detail: begin.detail ?? null, session_ended: !!begin.session_ended, quota: begin.quota ?? null });
        controller.close();
        return;
      }

      // ---- commands for the principal's computer
      // `submit [message]` / `request-push`: send the project's changes for the principal's approval
      const submitMatch = line.match(/^(submit|request-push)(?:\s+([\s\S]+))?$/i);
      const bridgeMatch = submitMatch
        ? ['', 'submit', submitMatch[2]?.trim() || '-']
        : line.match(/^(claude|antigravity|agy|ai|sh)\s+([\s\S]+)$/i) ?? (line.startsWith('$') ? ['', 'sh', line.slice(1).trim()] : null);
      if (bridgeMatch && bridgeMatch[2]) {
        const word = bridgeMatch[1].toLowerCase();
        // `ai` goes to the user's assigned agent (Claude for the principal)
        const kind =
          word === 'submit' ? 'submit'
          : word === 'sh' ? 'shell'
          : word === 'claude' ? 'claude'
          : word === 'ai' ? (begin.is_principal ? 'claude' : begin.agent)
          : 'antigravity';
        const input = bridgeMatch[2];
        const fail = async (msg: string) => {
          out(c.red(msg));
          await service.rpc('terminal_finish_command', { p_log_id: begin.log_id, p_status: 'error', p_preview: msg, p_duration_ms: 0 });
          send({ t: 'end', status: 'error', quota: begin.quota ?? null });
          controller.close();
        };
        if (kind === 'submit') {
          if (!begin.allow_claude && !begin.allow_shell) return fail('submit: not allowed for your account. Ask the principal.');
        } else if (kind !== 'shell' && !begin.is_principal) {
          const agentName = begin.agent === 'antigravity' ? 'Antigravity' : 'Claude';
          if (!begin.allow_claude) return fail('AI agent: not allowed for your account. Ask the principal.');
          if (begin.agent !== kind) return fail(`Your AI agent is ${agentName}. Use: ai <prompt>  (or: ${begin.agent} <prompt>)`);
        }
        if (kind === 'shell' && !begin.allow_shell) return fail('sh: not allowed for your account. Ask the principal.');
        if (!masterKey()) return fail('Bridge is not configured on the server (BRIDGE_MASTER_KEY missing).');
        const device = await onlineDevice(service);
        if (!device) return fail("Bridge offline: the principal's computer is not connected.");
        const resume = (kind === 'claude' || kind === 'antigravity') && typeof body.resume_session === 'string' && /^[A-Za-z0-9-]{8,80}$/.test(body.resume_session) ? body.resume_session : null;
        const job = {
          id: crypto.randomUUID(),
          device_id: device.id,
          kind,
          input,
          resume_session: resume,
          is_principal: !!begin.is_principal,
          issued_at: Date.now(),
          user_email: begin.email as string,
        };
        const signature = await hmacHex(await deviceKeyFor(device.id), jobPayload(job));
        const { user_email: _e, ...row } = job;
        const { error: jobError } = await service
          .from('bridge_jobs')
          .insert({ ...row, session_id: body.session_id, user_id: user.id, log_id: begin.log_id, signature });
        if (jobError) return fail(`bridge: ${jobError.message}`);
        // The browser follows the job through realtime; bridge_finish() closes the command log.
        send({ t: 'bridge', job_id: job.id, kind, quota: begin.quota ?? null });
        controller.close();
        return;
      }

      const [name, ...args] = tokenize(line);
      const cmd = COMMANDS[name?.toLowerCase()];
      let status: 'ok' | 'error' = 'ok';
      try {
        if (!cmd) {
          status = 'error';
          out(`${c.red('command not found:')} ${name}. Type ${c.cyan('help')}.`);
        } else if (cmd.admin && !begin.is_principal) {
          status = 'error';
          out(c.red(`${name}: principal only`));
        } else {
          await cmd.run({ service, userId: user.id, email: begin.email, isPrincipal: begin.is_principal, sessionId: body.session_id!, begin, args, out });
        }
      } catch (e) {
        status = 'error';
        out(c.red(`error: ${(e as Error).message}`));
      }

      const ms = Math.round(performance.now() - started);
      await service.rpc('terminal_finish_command', {
        p_log_id: begin.log_id,
        p_status: status,
        p_preview: stripAnsi(transcript.join('\n')).slice(0, 2000),
        p_duration_ms: ms,
      });
      send({ t: 'end', status, ms, quota: begin.quota ?? null });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
});
