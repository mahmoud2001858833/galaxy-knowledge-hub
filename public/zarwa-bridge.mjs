#!/usr/bin/env node
// Zarwa bridge: connects the platform terminal (/terminal) to Claude Code or Antigravity on this computer.
//
//   node zarwa-bridge.mjs pair <code>        save the pairing code shown on the platform
//   node zarwa-bridge.mjs                    run (keep this window open)
//   node zarwa-bridge.mjs check              verify config, device key and the local tools
//   node zarwa-bridge.mjs install-service    macOS: start automatically at login (launchd)
//   node zarwa-bridge.mjs uninstall-service
//
// Security: the bridge only makes outgoing HTTPS requests (nothing listens on this computer).
// It runs a request only if its HMAC signature was made with this device's secret, which only
// your browser and this computer hold, and only if the request is less than 10 minutes old.
// Requires Node 18+. No dependencies.

import { spawn, execFileSync } from 'node:child_process';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, unlinkSync } from 'node:fs';
import { homedir, hostname, platform } from 'node:os';
import { join, resolve } from 'node:path';

const VERSION = '1.0.0';
const DIR = join(homedir(), '.zarwa-bridge');
const CONFIG = join(DIR, 'config.json');
const SEEN = join(DIR, 'seen-jobs.json');
const PLIST = join(homedir(), 'Library', 'LaunchAgents', 'com.zarwa.bridge.plist');
const MAX_AGE_MS = 10 * 60 * 1000;

const log = (...a) => console.log(new Date().toLocaleTimeString(), ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- crypto (must match src/components/terminal/terminalCrypto.ts)
const hmacHex = (secret, msg) => createHmac('sha256', Buffer.from(secret, 'utf8')).update(Buffer.from(msg, 'utf8')).digest('hex');
const authKeyFor = (secret) => hmacHex(secret, 'zarwa-bridge-auth');
const signedPayload = (job, deviceId) =>
  [job.id, deviceId, job.target, job.resume_session ?? '', String(job.issued_at), job.prompt].join('\n');

function verify(job, cfg) {
  const expected = Buffer.from(hmacHex(cfg.deviceSecret, signedPayload(job, cfg.deviceId)), 'hex');
  const given = Buffer.from(String(job.signature || ''), 'hex');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return 'توقيع الطلب غير صحيح';
  if (Math.abs(Date.now() - Number(job.issued_at)) > MAX_AGE_MS) return 'الطلب قديم (أكثر من 10 دقائق)';
  return null;
}

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
    console.error('لا يوجد إعداد. افتح /terminal في المنصة، أضف جهازاً، ثم شغّل:\n  node zarwa-bridge.mjs pair <الرمز>');
    process.exit(1);
  }
  return JSON.parse(readFileSync(CONFIG, 'utf8'));
}

function pair(code) {
  let p;
  try {
    p = JSON.parse(Buffer.from(code, 'base64url').toString('utf8'));
  } catch {
    console.error('رمز الربط غير صالح');
    process.exit(1);
  }
  if (!p.u || !p.k || !p.d || !p.s) {
    console.error('رمز الربط ناقص');
    process.exit(1);
  }
  const cfg = {
    supabaseUrl: p.u,
    anonKey: p.k,
    deviceId: p.d,
    deviceSecret: p.s,
    workdir: process.cwd(),
    claudeBin: findBin(['claude', join(homedir(), '.local/bin/claude'), join(homedir(), '.claude/local/claude')]),
    antigravityBin: findBin([
      'antigravity-ide',
      'antigravity',
      '/Applications/Antigravity IDE.app/Contents/Resources/app/bin/antigravity-ide',
      '/Applications/Antigravity.app/Contents/Resources/app/bin/antigravity',
    ]),
    // acceptEdits: Claude may read and edit files in workdir; shell commands need allowedTools.
    // Other values: plan (read-only), auto, dontAsk, bypassPermissions (runs anything, use with care).
    permissionMode: 'acceptEdits',
    allowedTools: [],
    maxMinutes: 30,
  };
  mkdirSync(DIR, { recursive: true, mode: 0o700 });
  writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
  chmodSync(CONFIG, 0o600);
  console.log(`تم الربط. الإعداد محفوظ في ${CONFIG}`);
  console.log(`مجلد العمل: ${cfg.workdir}`);
  console.log(`Claude Code: ${cfg.claudeBin ?? 'غير موجود'}`);
  console.log(`Antigravity: ${cfg.antigravityBin ?? 'غير موجود'}`);
  console.log('شغّل الآن: node zarwa-bridge.mjs');
}

// ---------------------------------------------------------------- API
async function rpc(cfg, fn, args) {
  const res = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_device_id: cfg.deviceId, p_auth_key: authKeyFor(cfg.deviceSecret), ...args }),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      msg = JSON.parse(text).message || text;
    } catch {}
    const err = new Error(`${fn}: ${msg}`);
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

function loadSeen() {
  try {
    return new Set(JSON.parse(readFileSync(SEEN, 'utf8')));
  } catch {
    return new Set();
  }
}
function saveSeen(seen) {
  writeFileSync(SEEN, JSON.stringify([...seen].slice(-500)));
}

// ---------------------------------------------------------------- output streaming
class Output {
  constructor(cfg, jobId, onCancel) {
    this.cfg = cfg;
    this.jobId = jobId;
    this.onCancel = onCancel;
    this.queue = [];
    this.timer = setInterval(() => this.flush(), 700);
    this.flushing = Promise.resolve();
  }
  push(kind, content) {
    if (content) this.queue.push({ kind, content: String(content).slice(0, 20000) });
  }
  flush() {
    this.flushing = this.flushing.then(async () => {
      const chunks = this.queue.splice(0, 200);
      try {
        const status = await rpc(this.cfg, 'remote_bridge_output', { p_job_id: this.jobId, p_chunks: chunks });
        if (status === 'cancelled') this.onCancel();
      } catch (e) {
        log('تعذّر إرسال المخرجات:', e.message);
        this.queue.unshift(...chunks);
      }
    });
    return this.flushing;
  }
  async close() {
    clearInterval(this.timer);
    await this.flush();
  }
}

const summarizeTool = (name, input = {}) => {
  const v = input.command ?? input.file_path ?? input.path ?? input.pattern ?? input.url ?? input.description ?? '';
  const s = typeof v === 'string' && v ? v : JSON.stringify(input);
  return `${name}: ${s.length > 300 ? s.slice(0, 300) + '…' : s}`;
};

function runProcess(bin, args, cwd, maxMinutes, out, onLine) {
  return new Promise((resolveRun) => {
    const child = spawn(bin, args, { cwd, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    let stderr = '';
    let killed = null;
    const kill = (why) => {
      if (killed) return;
      killed = why;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 3000).unref();
    };
    out.onCancel = () => kill('cancelled');
    const timeout = setTimeout(() => kill('timeout'), maxMinutes * 60 * 1000);
    child.stdout.on('data', (d) => {
      buf += d.toString('utf8');
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (line) onLine(line);
      }
    });
    child.stderr.on('data', (d) => (stderr += d.toString('utf8')));
    child.on('error', (e) => {
      clearTimeout(timeout);
      resolveRun({ code: -1, stderr: e.message, killed });
    });
    child.on('close', (code) => {
      clearTimeout(timeout);
      if (buf.trim()) onLine(buf.trim());
      resolveRun({ code, stderr, killed });
    });
  });
}

async function runClaude(cfg, job, out) {
  if (!cfg.claudeBin) return { status: 'error', error: 'Claude Code غير مثبت على هذا الجهاز' };
  const args = ['-p', job.prompt, '--output-format', 'stream-json', '--verbose', '--permission-mode', cfg.permissionMode || 'acceptEdits'];
  if (cfg.allowedTools?.length) args.push('--allowedTools', ...cfg.allowedTools);
  if (cfg.model) args.push('--model', cfg.model);
  if (job.resume_session) args.push('--resume', job.resume_session);

  let sessionId = null;
  let result = null;
  let cost = null;
  let isError = false;
  out.push('system', `Claude Code · ${cfg.workdir}${job.resume_session ? ' · متابعة الجلسة' : ''}`);

  const run = await runProcess(cfg.claudeBin, args, cfg.workdir, cfg.maxMinutes || 30, out, (line) => {
    let m;
    try {
      m = JSON.parse(line);
    } catch {
      out.push('text', line);
      return;
    }
    if (m.session_id) sessionId = m.session_id;
    if (m.type === 'assistant') {
      for (const block of m.message?.content ?? []) {
        if (block.type === 'text') out.push('text', block.text);
        else if (block.type === 'tool_use') out.push('tool', summarizeTool(block.name, block.input));
      }
    } else if (m.type === 'user') {
      for (const block of m.message?.content ?? []) {
        if (block.type === 'tool_result' && block.is_error) {
          const c = Array.isArray(block.content) ? block.content.map((x) => x.text ?? '').join(' ') : String(block.content ?? '');
          out.push('system', `✗ ${c.slice(0, 500)}`);
        }
      }
    } else if (m.type === 'result') {
      result = m.result ?? null;
      cost = m.total_cost_usd ?? null;
      isError = !!m.is_error;
    }
  });

  if (run.killed === 'cancelled') return { status: 'done', sessionId, result: 'أُلغي الطلب' };
  if (run.killed === 'timeout') return { status: 'error', sessionId, error: `تجاوز الحد الأقصى (${cfg.maxMinutes} دقيقة)` };
  if (run.code !== 0 || isError) {
    return { status: 'error', sessionId, result, cost, error: (run.stderr || result || `انتهى Claude برمز ${run.code}`).slice(0, 4000) };
  }
  return { status: 'done', sessionId, result, cost };
}

async function runAntigravity(cfg, job, out) {
  if (!cfg.antigravityBin) return { status: 'error', error: 'Antigravity غير مثبت على هذا الجهاز' };
  out.push('system', `Antigravity · ${cfg.workdir}`);
  const run = await runProcess(cfg.antigravityBin, ['chat', '--mode', 'agent', job.prompt], cfg.workdir, 2, out, (line) => out.push('text', line));
  if (run.code !== 0) return { status: 'error', error: (run.stderr || `انتهى برمز ${run.code}`).slice(0, 4000) };
  const msg = 'فُتح الطلب في وكيل Antigravity على الجهاز. يعمل الوكيل داخل التطبيق، وردّه يظهر هناك وليس هنا.';
  out.push('text', msg);
  return { status: 'done', result: msg };
}

async function handle(cfg, job, seen) {
  log(`طلب ${job.id.slice(0, 8)} → ${job.target}`);
  const finish = (r) =>
    rpc(cfg, 'remote_bridge_finish', {
      p_job_id: job.id,
      p_status: r.status,
      p_session_id: r.sessionId ?? null,
      p_result: r.result ?? null,
      p_error: r.error ?? null,
      p_cost: r.cost ?? null,
    });

  const problem = seen.has(job.id) ? 'نُفّذ هذا الطلب سابقاً' : verify(job, cfg);
  seen.add(job.id);
  saveSeen(seen);
  if (problem) {
    log(`رُفض: ${problem}`);
    await finish({ status: 'rejected', error: problem });
    return;
  }

  const out = new Output(cfg, job.id, () => {});
  let r;
  try {
    r = job.target === 'antigravity' ? await runAntigravity(cfg, job, out) : await runClaude(cfg, job, out);
  } catch (e) {
    r = { status: 'error', error: e.message };
  }
  await out.close();
  await finish(r);
  log(`انتهى ${job.id.slice(0, 8)}: ${r.status}${r.error ? ' · ' + r.error.split('\n')[0] : ''}`);
}

async function main() {
  const cfg = loadConfig();
  const seen = loadSeen();
  const info = { version: VERSION, host: hostname(), platform: platform(), workdir: cfg.workdir, claude: !!cfg.claudeBin, antigravity: !!cfg.antigravityBin };
  log(`جسر ذروة العلم ${VERSION} يعمل. مجلد العمل: ${cfg.workdir}`);
  let first = true;
  let delay = 2000;
  for (;;) {
    try {
      const jobs = await rpc(cfg, 'remote_bridge_poll', { p_info: info, p_reset: first });
      if (first) log('متصل بالمنصة، بانتظار الطلبات…');
      first = false;
      delay = 2000;
      if (jobs?.length) {
        await handle(cfg, jobs[0], seen);
        continue;
      }
    } catch (e) {
      if (e.status === 401 || /not authorized/.test(e.message)) {
        log('الجهاز غير مصرّح (أُلغي أو الرمز خاطئ). أعد الربط من صفحة الطرفية.');
        delay = 30000;
      } else {
        log('خطأ اتصال:', e.message);
        delay = Math.min(delay * 2, 30000);
      }
    }
    await sleep(delay);
  }
}

async function check() {
  const cfg = loadConfig();
  console.log(`مجلد العمل: ${cfg.workdir} ${existsSync(cfg.workdir) ? '✓' : '✗ غير موجود'}`);
  for (const [name, bin, args] of [
    ['Claude Code', cfg.claudeBin, ['--version']],
    ['Antigravity', cfg.antigravityBin, ['--version']],
  ]) {
    if (!bin) {
      console.log(`${name}: غير موجود`);
      continue;
    }
    try {
      console.log(`${name}: ${execFileSync(bin, args, { encoding: 'utf8' }).split('\n')[0]} ✓`);
    } catch (e) {
      console.log(`${name}: ✗ ${e.message}`);
    }
  }
  try {
    // finish() on a random id authenticates the device without claiming or changing any job
    await rpc(cfg, 'remote_bridge_finish', { p_job_id: crypto.randomUUID(), p_status: 'error' });
    console.log('الاتصال بالمنصة والمصادقة ✓');
  } catch (e) {
    console.log(`الاتصال بالمنصة ✗ ${e.message}`);
  }
}

function installService() {
  if (platform() !== 'darwin') {
    console.error('هذا الأمر لنظام macOS فقط');
    process.exit(1);
  }
  loadConfig();
  const script = resolve(process.argv[1]);
  mkdirSync(join(homedir(), 'Library', 'LaunchAgents'), { recursive: true });
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  writeFileSync(
    PLIST,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.zarwa.bridge</string>
  <key>ProgramArguments</key><array><string>${esc(process.execPath)}</string><string>${esc(script)}</string></array>
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
  console.log(`يعمل الجسر الآن في الخلفية ويبدأ تلقائياً عند تسجيل الدخول. السجل: ${join(DIR, 'bridge.log')}`);
}

function uninstallService() {
  if (existsSync(PLIST)) {
    try {
      execFileSync('launchctl', ['unload', PLIST]);
    } catch {}
    unlinkSync(PLIST);
  }
  console.log('أُوقف الجسر وأُزيل من بدء التشغيل.');
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'pair') pair(arg ?? '');
else if (cmd === 'check') check();
else if (cmd === 'install-service') installService();
else if (cmd === 'uninstall-service') uninstallService();
else if (!cmd || cmd === 'run') main();
else {
  console.log('الأوامر: pair <code> | run | check | install-service | uninstall-service');
}

