#!/usr/bin/env node
// Zarwa local bridge — connects the web terminal (/terminal) to this computer.
//
//   npm run bridge -- pair <code>      save the pairing code from /admin?tab=terminal ("ربط جهازي")
//   npm run bridge                     run (keep the window open)
//   npm run bridge -- check            check config, connection and local tools (changes nothing)
//   npm run bridge -- install-service  macOS: run in the background and start at login
//   npm run bridge -- uninstall-service
//
// How it is protected
// * Outbound only: listens to a Supabase Realtime "doorbell" and calls RPCs; nothing listens here.
// * The platform checks access, quota, ban and session before a job exists (web-terminal-exec).
// * Every job is HMAC-signed by the Edge Function with this device's key; unsigned, wrongly signed or
//   stale jobs are refused, so database access alone cannot run anything here.
// * Kill switch: a cancelled job kills the whole process group immediately.
// * Other users (not the principal) only get what the principal enabled for them on the platform AND
//   what this file allows: shell is off for them unless shell.allowOthers is true; Claude runs in
//   read-only "plan" mode for them unless claude.othersPermissionMode is changed.

import { spawn, execFileSync } from 'node:child_process';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir, hostname, platform } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const VERSION = '2.0.0';
const DIR = join(homedir(), '.zarwa-bridge');
const CONFIG = join(DIR, 'config.json');
const PLIST = join(homedir(), 'Library', 'LaunchAgents', 'com.zarwa.bridge.plist');
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_AGE_MS = 5 * 60 * 1000;

const log = (...a) => console.log(new Date().toLocaleTimeString('en-GB'), ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hmacHex = (key, msg) => createHmac('sha256', Buffer.from(key, 'utf8')).update(Buffer.from(msg, 'utf8')).digest('hex');

// ---------------------------------------------------------------- config
function findBin(names) {
  for (const n of names) {
    if (n.startsWith('/') && existsSync(n)) return n;
    try {
      const p = execFileSync('/bin/sh', ['-lc', `command -v ${n}`], { encoding: 'utf8' }).trim();
      if (p) return p;
    } catch {}
  }
  return null;
}

function loadConfig() {
  if (!existsSync(CONFIG)) {
    console.error('Not paired yet. In /admin?tab=terminal press "ربط جهازي", then run:\n  npm run bridge -- pair <code>');
    process.exit(1);
  }
  return JSON.parse(readFileSync(CONFIG, 'utf8'));
}

function pair(code) {
  let p;
  try {
    p = JSON.parse(Buffer.from(code, 'base64url').toString('utf8'));
  } catch {
    console.error('Invalid pairing code');
    process.exit(1);
  }
  if (!p.u || !p.k || !p.d || !p.s || !p.g) {
    console.error('Incomplete pairing code');
    process.exit(1);
  }
  const old = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, 'utf8')) : {};
  const cfg = {
    supabaseUrl: p.u,
    anonKey: p.k,
    deviceId: p.d,
    deviceSecret: p.s,
    deviceKey: p.g,
    workdir: old.workdir ?? REPO,
    claude: old.claude ?? {
      bin: findBin(['claude', join(homedir(), '.local/bin/claude'), join(homedir(), '.claude/local/claude')]),
      // principal: may read and edit files in workdir. Others: read-only planning.
      permissionMode: 'acceptEdits',
      othersPermissionMode: 'plan',
      model: null,
    },
    shell: old.shell ?? { bin: process.env.SHELL || '/bin/zsh', allowOthers: false },
    maxMinutes: old.maxMinutes ?? { principal: 30, others: 5 },
  };
  mkdirSync(DIR, { recursive: true, mode: 0o700 });
  writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
  chmodSync(CONFIG, 0o600);
  console.log(`Paired. Config: ${CONFIG}`);
  console.log(`Working directory: ${cfg.workdir}`);
  console.log(`Claude Code: ${cfg.claude.bin ?? 'not found'}`);
  console.log('Start it with: npm run bridge');
}

// ---------------------------------------------------------------- platform API
const makeApi = (cfg) => {
  const client = createClient(cfg.supabaseUrl, cfg.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const authKey = hmacHex(cfg.deviceSecret, 'zarwa-bridge-auth');
  const rpc = async (fn, args) => {
    const { data, error } = await client.rpc(fn, { p_device_id: cfg.deviceId, p_auth_key: authKey, ...args });
    if (error) {
      const e = new Error(`${fn}: ${error.message}`);
      e.unauthorized = /not authorized/.test(error.message);
      throw e;
    }
    return data;
  };
  return { client, rpc };
};

const payloadOf = (job, deviceId) =>
  [job.id, deviceId, job.kind, job.input, job.resume_session ?? '', job.is_principal ? '1' : '0', String(job.issued_at), job.user_email ?? ''].join('\n');

function verify(job, cfg) {
  const expected = Buffer.from(hmacHex(cfg.deviceKey, payloadOf(job, cfg.deviceId)), 'hex');
  const given = Buffer.from(String(job.signature || ''), 'hex');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return 'bad signature';
  if (Math.abs(Date.now() - Number(job.issued_at)) > MAX_AGE_MS) return 'job is too old';
  if (job.kind === 'shell' && !job.is_principal && !cfg.shell.allowOthers) return 'shell is disabled for other users on this computer';
  return null;
}

// ---------------------------------------------------------------- running a job
class Output {
  constructor(rpc, jobId) {
    this.rpc = rpc;
    this.jobId = jobId;
    this.queue = [];
    this.preview = '';
    this.status = 'running';
    this.chain = Promise.resolve();
    this.timer = setInterval(() => this.flush(), 200);
  }
  push(stream, data) {
    if (!data) return;
    const last = this.queue[this.queue.length - 1];
    if (last && last.stream === stream && last.data.length < 8000) last.data += data;
    else this.queue.push({ stream, data: String(data) });
    if (this.preview.length < 2000) this.preview += String(data).replace(/\x1b\[[0-9;]*m/g, '').slice(0, 2000 - this.preview.length);
  }
  flush() {
    this.chain = this.chain.then(async () => {
      const chunks = this.queue.splice(0, 200).map((c) => ({ stream: c.stream, data: c.data.slice(0, 20000) }));
      try {
        this.status = await this.rpc('bridge_output', { p_job_id: this.jobId, p_chunks: chunks });
        if (this.status === 'cancelled') this.onCancel?.();
      } catch (e) {
        log('output error:', e.message);
        this.queue.unshift(...chunks);
      }
    });
    return this.chain;
  }
  async close() {
    clearInterval(this.timer);
    await this.flush();
  }
}

function runProcess(bin, args, { cwd, env, minutes, out, onStdoutLine }) {
  return new Promise((done) => {
    const child = spawn(bin, args, { cwd, env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let killed = null;
    let buf = '';
    const kill = (why) => {
      if (killed || child.exitCode !== null) return;
      killed = why;
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {}
      setTimeout(() => {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {}
      }, 2000).unref();
    };
    out.onCancel = () => kill('cancelled');
    const timer = setTimeout(() => kill('timeout'), minutes * 60 * 1000);
    child.stdout.on('data', (d) => {
      if (!onStdoutLine) return out.push('out', d.toString('utf8'));
      buf += d.toString('utf8');
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i);
        buf = buf.slice(i + 1);
        if (line.trim()) onStdoutLine(line);
      }
    });
    child.stderr.on('data', (d) => out.push('err', d.toString('utf8')));
    child.on('error', (e) => {
      clearTimeout(timer);
      done({ code: -1, killed, error: e.message });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (buf.trim() && onStdoutLine) onStdoutLine(buf);
      done({ code, killed });
    });
  });
}

const summarizeTool = (name, input = {}) => {
  const v = input.command ?? input.file_path ?? input.path ?? input.pattern ?? input.url ?? input.description ?? '';
  const s = typeof v === 'string' && v ? v : JSON.stringify(input);
  return `${name}: ${s.length > 200 ? s.slice(0, 200) + '…' : s}`;
};

async function runShell(cfg, job, out) {
  const env = { ...process.env, FORCE_COLOR: '1', CLICOLOR_FORCE: '1', TERM: 'xterm-256color' };
  const r = await runProcess(cfg.shell.bin, ['-lc', job.input], {
    cwd: cfg.workdir,
    env,
    minutes: job.is_principal ? cfg.maxMinutes.principal : cfg.maxMinutes.others,
    out,
  });
  return r;
}

async function runClaude(cfg, job, out) {
  if (!cfg.claude.bin) return { code: -1, error: 'Claude Code is not installed on this computer' };
  const mode = job.is_principal ? cfg.claude.permissionMode : cfg.claude.othersPermissionMode;
  const args = ['-p', job.input, '--output-format', 'stream-json', '--verbose', '--permission-mode', mode];
  if (cfg.claude.model) args.push('--model', cfg.claude.model);
  if (job.resume_session) args.push('--resume', job.resume_session);
  const meta = {};
  out.push('sys', `\x1b[2mClaude Code · ${mode}${job.resume_session ? ' · continuing' : ''}\x1b[0m\n`);
  const r = await runProcess(cfg.claude.bin, args, {
    cwd: cfg.workdir,
    env: process.env,
    minutes: job.is_principal ? cfg.maxMinutes.principal : cfg.maxMinutes.others,
    out,
    onStdoutLine: (line) => {
      let m;
      try {
        m = JSON.parse(line);
      } catch {
        return out.push('out', line + '\n');
      }
      if (m.session_id) meta.session = m.session_id;
      if (m.type === 'assistant') {
        for (const b of m.message?.content ?? []) {
          if (b.type === 'text' && b.text) out.push('out', b.text.replace(/\n*$/, '\n'));
          else if (b.type === 'tool_use') out.push('sys', `\x1b[36m⚙ ${summarizeTool(b.name, b.input)}\x1b[0m\n`);
        }
      } else if (m.type === 'user') {
        for (const b of m.message?.content ?? []) {
          if (b.type === 'tool_result' && b.is_error) {
            const t = Array.isArray(b.content) ? b.content.map((x) => x.text ?? '').join(' ') : String(b.content ?? '');
            out.push('err', `✗ ${t.slice(0, 400)}\n`);
          }
        }
      } else if (m.type === 'result') {
        meta.cost = m.total_cost_usd ?? null;
        meta.isError = !!m.is_error;
        if (m.is_error && m.result) out.push('err', `${m.result}\n`);
      }
    },
  });
  return { ...r, ...meta, code: meta.isError ? 1 : r.code };
}

async function handle(cfg, rpc, job, state) {
  log(`job ${job.id.slice(0, 8)} ${job.kind} from ${job.user_email}: ${job.input.slice(0, 80)}`);
  const problem = state.seen.has(job.id) ? 'job already ran' : verify(job, cfg);
  state.seen.add(job.id);
  if (problem) {
    log(`  refused: ${problem}`);
    await rpc('bridge_finish', { p_job_id: job.id, p_status: 'rejected', p_error: `Refused by the computer: ${problem}` }).catch(() => {});
    return;
  }
  const out = new Output(rpc, job.id);
  state.current = { id: job.id, out };
  let r;
  try {
    r = job.kind === 'claude' ? await runClaude(cfg, job, out) : await runShell(cfg, job, out);
  } catch (e) {
    r = { code: -1, error: e.message };
  }
  state.current = null;
  if (r.killed === 'timeout') out.push('err', '\nTime limit reached; process stopped.\n');
  await out.close();
  const status = r.error ? 'error' : 'done';
  await rpc('bridge_finish', {
    p_job_id: job.id,
    p_status: status,
    p_exit_code: r.code ?? null,
    p_claude_session: r.session ?? null,
    p_error: r.error ?? (r.killed ? (r.killed === 'cancelled' ? 'Stopped' : 'Time limit') : null),
    p_cost: r.cost ?? null,
    p_preview: out.preview,
  }).catch((e) => log('finish error:', e.message));
  log(`  ${r.killed ?? status} (exit ${r.code})`);
}

// ---------------------------------------------------------------- main loop
async function main() {
  const cfg = loadConfig();
  const { client, rpc } = makeApi(cfg);
  const state = { seen: new Set(), current: null, wake: null, first: true };
  const info = {
    version: VERSION,
    host: hostname(),
    platform: platform(),
    workdir: cfg.workdir,
    claude: cfg.claude.bin ? (() => { try { return execFileSync(cfg.claude.bin, ['--version'], { encoding: 'utf8' }).trim(); } catch { return 'installed'; } })() : null,
  };

  // Doorbell: new job → poll now; cancelled current job → kill now.
  client
    .channel(`bridge-${cfg.deviceId}`)
    .on('broadcast', { event: 'job' }, ({ payload }) => {
      if (payload?.status === 'cancelled' && state.current?.id === payload.job) state.current.out.onCancel?.();
      else state.wake?.();
    })
    .subscribe((s) => log(`realtime: ${s}`));

  log(`Zarwa bridge ${VERSION} · ${info.host} · ${cfg.workdir}`);
  let delay = 5000;
  for (;;) {
    try {
      const jobs = await rpc('bridge_poll', { p_info: info, p_reset: state.first });
      if (state.first) log('online — waiting for commands from /terminal');
      state.first = false;
      delay = 5000;
      if (jobs?.length) {
        await handle(cfg, rpc, jobs[0], state);
        continue; // there may be more queued
      }
    } catch (e) {
      if (e.unauthorized) {
        log('This computer is not authorized (unpaired or revoked). Pair again from /admin?tab=terminal.');
        delay = 30000;
      } else {
        log('connection error:', e.message);
        delay = Math.min(delay * 2, 30000);
      }
    }
    // wait for the heartbeat interval or the doorbell, whichever comes first
    await new Promise((r) => {
      const t = setTimeout(r, delay);
      state.wake = () => {
        clearTimeout(t);
        r();
      };
    });
    state.wake = null;
  }
}

async function check() {
  const cfg = loadConfig();
  console.log(`workdir      ${cfg.workdir} ${existsSync(cfg.workdir) ? '✓' : '✗ missing'}`);
  console.log(`shell        ${cfg.shell.bin} · others allowed: ${cfg.shell.allowOthers}`);
  try {
    console.log(`claude       ${execFileSync(cfg.claude.bin, ['--version'], { encoding: 'utf8' }).trim()} · ${cfg.claude.permissionMode} / others ${cfg.claude.othersPermissionMode}`);
  } catch {
    console.log('claude       ✗ not found');
  }
  const { rpc } = makeApi(cfg);
  try {
    // finishing a random job id authenticates the device without touching any job
    await rpc('bridge_finish', { p_job_id: crypto.randomUUID(), p_status: 'error' });
    console.log('platform     ✓ connected and authorized');
  } catch (e) {
    console.log(`platform     ✗ ${e.message}`);
  }
}

function installService() {
  if (platform() !== 'darwin') {
    console.error('macOS only');
    process.exit(1);
  }
  const cfg = loadConfig();
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  mkdirSync(dirname(PLIST), { recursive: true });
  writeFileSync(
    PLIST,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.zarwa.bridge</string>
  <key>ProgramArguments</key><array><string>${esc(process.execPath)}</string><string>${esc(fileURLToPath(import.meta.url))}</string></array>
  <key>WorkingDirectory</key><string>${esc(cfg.workdir)}</string>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>${esc(process.env.PATH || '/usr/bin:/bin')}</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${esc(join(DIR, 'bridge.log'))}</string>
  <key>StandardErrorPath</key><string>${esc(join(DIR, 'bridge.log'))}</string>
</dict></plist>
`,
  );
  try {
    execFileSync('launchctl', ['unload', PLIST], { stdio: 'ignore' });
  } catch {}
  execFileSync('launchctl', ['load', PLIST]);
  console.log(`Running in the background and at login. Log: ${join(DIR, 'bridge.log')}`);
}

function uninstallService() {
  if (existsSync(PLIST)) {
    try {
      execFileSync('launchctl', ['unload', PLIST]);
    } catch {}
    unlinkSync(PLIST);
  }
  console.log('Background service removed.');
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'pair') pair(arg ?? '');
else if (cmd === 'check') check();
else if (cmd === 'install-service') installService();
else if (cmd === 'uninstall-service') uninstallService();
else if (!cmd || cmd === 'run') main();
else console.log('usage: npm run bridge [-- pair <code> | check | install-service | uninstall-service]');

