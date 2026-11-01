#!/usr/bin/env node
// Zarwa local bridge — connects the web terminal (/terminal) to this computer.
//
//   npm run bridge -- pair <code>      save the pairing code from /admin?tab=terminal ("ربط جهازي")
//   npm run bridge                     run (keep the window open)
//   npm run bridge -- check            check config, connection and local tools (changes nothing)
//   npm run bridge -- submit [message] send the project's current changes for the principal's approval
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
//   what this file allows: shell is off for them unless shell.allowOthers is true;
//   Antigravity in "ask" mode for them unless the config says otherwise; their Claude may edit files
//   in workdir but gets no Bash and cannot touch .git or .claude.
// * Approval gate: nothing typed in /terminal can commit, push, switch branches or deploy. Jobs run
//   with a git shim on PATH and a reference-transaction hook that refuses every ref update, and
//   Claude is told so (and has those commands disallowed). Files a job changed are sent as a
//   terminal_deploy_requests row; when the principal approves in /admin?tab=terminal this bridge
//   commits and pushes exactly the reviewed files, and when they reject it restores them.

import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir, hostname, platform } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const VERSION = '2.1.0';
const DIR = process.env.ZARWA_BRIDGE_DIR || join(homedir(), '.zarwa-bridge');
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
      // Both may edit files in workdir; changes only leave this computer after the principal approves.
      permissionMode: 'acceptEdits',
      othersPermissionMode: 'acceptEdits',
      model: null,
    },
    antigravity: old.antigravity ?? {
      bin: findBin([
        'antigravity-ide',
        join(homedir(), '.antigravity-ide/antigravity-ide/bin/antigravity-ide'),
        '/Applications/Antigravity IDE.app/Contents/Resources/app/bin/antigravity-ide',
        'antigravity',
      ]),
      // chat modes: agent (can act), edit, ask (answers only). Others get ask.
      mode: 'agent',
      othersMode: 'ask',
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
  console.log(`Antigravity: ${cfg.antigravity.bin ?? 'not found'}`);
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

// ---------------------------------------------------------------- approval gate
const GUARD = join(DIR, 'guard');
const NO_HOOKS = join(GUARD, 'no-hooks'); // the bridge's own commit/push run no repository hooks
const REAL_GIT = findBin(['/usr/bin/git', 'git']) ?? 'git';
const BLOCKED_GIT = ['commit', 'push', 'pull', 'fetch', 'checkout', 'switch', 'branch', 'merge', 'rebase', 'reset', 'tag', 'stash',
  'cherry-pick', 'revert', 'am', 'update-ref', 'symbolic-ref', 'filter-branch', 'worktree', 'remote', 'config'];
const BLOCKED_TOOLS = ['vercel', 'netlify', 'supabase', 'gh'];
const GATE_NOTE =
  'You are running from the Zarwa web terminal. Do not run git commit, git push, git checkout/switch/branch or any deploy ' +
  'command (vercel, supabase, gh): they are blocked. Just edit the files; when you finish, your changes are sent ' +
  "automatically to the platform principal for approval and pushed only after they approve.";

// Writes the git/deploy shims and the hook that refuses ref updates; returns the env for a job.
function guardEnv(extra = {}) {
  const bin = join(GUARD, 'bin');
  const hooks = join(GUARD, 'hooks');
  for (const d of [bin, hooks, NO_HOOKS]) mkdirSync(d, { recursive: true, mode: 0o700 });
  const refuse = (what) => `echo "zarwa: ${what} is blocked from the web terminal; changes go to the principal for approval." >&2\nexit 1\n`;
  writeFileSync(
    join(bin, 'git'),
    `#!/bin/sh
# Zarwa approval gate: no commits, pushes, branch changes or config overrides from /terminal jobs
sub=""
while [ $# -gt 0 ]; do
  case "$1" in
    -c|--config-env) case "$2" in *[Hh][Oo][Oo][Kk][Ss]*) ${refuse('overriding git hooks').trim()};; esac; shift 2;;
    -c*|--config-env=*) case "$1" in *[Hh][Oo][Oo][Kk][Ss]*) ${refuse('overriding git hooks').trim()};; esac; shift;;
    -C|--git-dir|--work-tree|--namespace|--exec-path) shift 2;;
    --git-dir=*|--work-tree=*|--namespace=*|--exec-path=*) ${refuse('this git option').trim()};;
    -*) shift;;
    *) sub="$1"; break;;
  esac
done
case " ${BLOCKED_GIT.join(' ')} " in *" $sub "*)
  if [ "$sub" = branch ] && [ "$2" = --show-current ] && [ $# -eq 2 ]; then :; else ${refuse('git $sub').trim()}; fi;;
esac
exec ${JSON.stringify(REAL_GIT)} "$@"
`,
  );
  for (const t of BLOCKED_TOOLS) writeFileSync(join(bin, t), `#!/bin/sh\n${refuse(t)}`);
  const hook = `#!/bin/sh\n[ "$1" = prepared ] || exit 0\n${refuse('changing git history or branches')}`;
  for (const h of ['reference-transaction', 'pre-commit', 'pre-push', 'pre-merge-commit', 'pre-rebase']) writeFileSync(join(hooks, h), hook);
  for (const f of [join(bin, 'git'), ...BLOCKED_TOOLS.map((t) => join(bin, t)), ...['reference-transaction', 'pre-commit', 'pre-push', 'pre-merge-commit', 'pre-rebase'].map((h) => join(hooks, h))])
    chmodSync(f, 0o755);
  return {
    ...process.env,
    ...extra,
    PATH: `${bin}:${process.env.PATH ?? '/usr/bin:/bin'}`,
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'core.hooksPath',
    GIT_CONFIG_VALUE_0: hooks,
    ZARWA_TERMINAL_JOB: '1',
  };
}

// The bridge's own git (not shimmed). Throws with git's output on failure.
function git(cfg, args, { allowFail = false, timeout = 60000 } = {}) {
  const r = spawnSync(REAL_GIT, ['-c', 'core.quotepath=off', ...args], { cwd: cfg.workdir, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
  const output = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
  if (!allowFail && (r.status !== 0 || r.error)) {
    const e = new Error(`git ${args[0] === '-c' ? args[2] : args[0]}: ${r.error?.message ?? output}`);
    e.output = output;
    throw e;
  }
  return { code: r.status, stdout: r.stdout ?? '', output };
}

// path → status code (porcelain XY) for every changed or untracked path
function gitStatus(cfg) {
  const raw = git(cfg, ['status', '--porcelain=v1', '-z', '-uall']).stdout.split('\0');
  const map = new Map();
  for (let i = 0; i < raw.length; i++) {
    const e = raw[i];
    if (e.length < 4) continue;
    const xy = e.slice(0, 2);
    map.set(e.slice(3), xy);
    if (xy[0] === 'R' || xy[0] === 'C') map.set(raw[++i], 'D '); // -z: "R  new\0old\0"
  }
  return map;
}

function fingerprint(cfg, path) {
  const full = join(cfg.workdir, path);
  try {
    const st = lstatSync(full);
    if (st.isSymbolicLink()) return 'link:' + readlinkSync(full);
    if (!st.isFile()) return 'other';
    return createHash('sha256').update(readFileSync(full)).digest('hex') + (st.mode & 0o111 ? ':x' : '');
  } catch {
    return 'deleted';
  }
}

const snapshot = (cfg) => new Map([...gitStatus(cfg).keys()].map((p) => [p, fingerprint(cfg, p)]));
const changedSince = (cfg, before) => {
  const now = snapshot(cfg);
  return [...now.keys()].filter((p) => before.get(p) !== now.get(p));
};
const filesHash = (cfg, paths) =>
  createHash('sha256').update([...paths].sort().map((p) => `${p}\0${fingerprint(cfg, p)}`).join('\n')).digest('hex');
const currentBranch = (cfg) => git(cfg, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();

function describeChanges(cfg, paths) {
  const status = gitStatus(cfg);
  paths = [...new Set(paths)].filter((p) => status.has(p)).sort();
  if (!paths.length) return null;
  const untracked = paths.filter((p) => status.get(p) === '??');
  const tracked = paths.filter((p) => status.get(p) !== '??');
  const counts = new Map();
  if (tracked.length) {
    for (const line of git(cfg, ['diff', 'HEAD', '--numstat', '--', ...tracked]).stdout.split('\n')) {
      const [a, d, p] = line.split('\t');
      if (p) counts.set(p, { added: a === '-' ? null : Number(a), removed: d === '-' ? null : Number(d) });
    }
  }
  let preview = tracked.length ? git(cfg, ['diff', 'HEAD', '--no-color', '--', ...tracked]).stdout : '';
  for (const p of untracked) {
    const d = git(cfg, ['diff', '--no-index', '--no-color', '--', '/dev/null', p], { allowFail: true }).stdout;
    preview += d;
    counts.set(p, { added: (d.match(/^\+(?!\+\+)/gm) ?? []).length, removed: 0 });
  }
  const LIMIT = 500000;
  if (preview.length > LIMIT) preview = preview.slice(0, LIMIT) + `\n… (diff truncated: ${preview.length - LIMIT} more characters)\n`;
  const kind = (xy) => (xy === '??' || xy.includes('A') ? 'added' : xy.includes('D') ? 'deleted' : xy.includes('R') ? 'renamed' : 'modified');
  return {
    paths,
    changed_files: paths.map((p) => ({ path: p, change: kind(status.get(p)), ...(counts.get(p) ?? {}) })),
    diff_preview: preview,
    diff_hash: filesHash(cfg, paths),
    branch: currentBranch(cfg),
  };
}

const commitMessageFor = (prompt, paths) => {
  const first = String(prompt ?? '').split('\n').map((l) => l.trim()).find(Boolean);
  if (!first) return `Update ${paths.length === 1 ? paths[0] : `${paths.length} files`} from the web terminal`;
  return first.length > 72 ? first.slice(0, 71) + '…' : first;
};

// Sends paths (merged with this computer's pending request, if any) for approval.
async function submitChanges(cfg, rpc, { jobId = null, prompt = '', paths = null, message = null }) {
  let list = paths ?? [...gitStatus(cfg).keys()];
  const pending = await rpc('bridge_deploy_pending', {});
  if (pending?.changed_files) list = [...list, ...pending.changed_files.map((f) => f.path)];
  const d = describeChanges(cfg, list);
  if (!d) return null;
  const res = await rpc('bridge_deploy_submit', {
    p_job_id: jobId,
    p_prompt: prompt || null,
    p_commit_message: message || commitMessageFor(prompt, d.paths),
    p_changed_files: d.changed_files,
    p_diff_preview: d.diff_preview,
    p_diff_hash: d.diff_hash,
    p_branch: d.branch,
  });
  log(`  approval request ${String(res.id).slice(0, 8)}${res.merged ? ' (updated)' : ''}: ${d.paths.length} file(s)`);
  return { ...res, paths: d.paths };
}

function reportSubmitted(out, sub) {
  if (!sub) return;
  out.push('sys', `\n\x1b[33m● ${sub.paths.length} changed file(s): ${sub.paths.slice(0, 6).join(', ')}${sub.paths.length > 6 ? ', …' : ''}\x1b[0m\n`);
  out.push(
    'sys',
    `\x1b[33m● Changes are ready and ${sub.merged ? 'were added to the pending approval request' : 'an approval request was sent to the admin'}. They will be pushed as soon as the admin approves.\x1b[0m\n`,
  );
}

// Carries out the principal's decisions: approved → commit + push the reviewed files; rejected → restore them.
async function processDecisions(cfg, rpc) {
  for (;;) {
    const [req] = (await rpc('bridge_deploy_claim', {})) ?? [];
    if (!req) return;
    const files = (req.changed_files ?? []).map((f) => f.path);
    const finish = (status, logText, sha = null) =>
      rpc('bridge_deploy_finish', { p_id: req.id, p_status: status, p_log: logText, p_commit_sha: sha }).catch((e) => log('deploy finish error:', e.message));
    const unchanged = files.length > 0 && filesHash(cfg, files) === req.diff_hash;

    if (req.status === 'rejected') {
      if (!unchanged) {
        log(`  deploy ${req.id.slice(0, 8)} rejected; files changed since the request, left untouched`);
        await finish('rejected', 'The files changed after the request, so they were left untouched on the computer.');
        continue;
      }
      try {
        git(cfg, ['reset', '-q', 'HEAD', '--', ...files], { allowFail: true });
        const inHead = new Set(git(cfg, ['ls-tree', '-r', '--name-only', '-z', 'HEAD', '--', ...files]).stdout.split('\0').filter(Boolean));
        const restore = files.filter((p) => inHead.has(p));
        const remove = files.filter((p) => !inHead.has(p));
        if (restore.length) git(cfg, ['checkout', 'HEAD', '--', ...restore]);
        if (remove.length) {
          git(cfg, ['clean', '-fdq', '--', ...remove]);
          // and the folders that held only those files
          for (const p of remove) {
            for (let d = dirname(p); d && d !== '.'; d = dirname(d)) {
              try {
                rmdirSync(join(cfg.workdir, d));
              } catch {
                break;
              }
            }
          }
        }
        log(`  deploy ${req.id.slice(0, 8)} rejected; restored ${files.length} file(s)`);
        await finish('rejected', `Reverted on the computer: ${files.join(', ')}`);
      } catch (e) {
        log(`  deploy ${req.id.slice(0, 8)} revert failed: ${e.message}`);
        await finish('rejected', `Revert failed: ${e.message}`);
      }
      continue;
    }

    // approved (claimed as "pushing")
    const steps = [];
    try {
      if (!unchanged) throw new Error('The files changed after the request was made. Send a new request (submit) and review it again.');
      const branch = currentBranch(cfg);
      if (req.branch && branch !== req.branch) throw new Error(`The computer is on branch ${branch}, the request was made on ${req.branch}.`);
      const ahead = git(cfg, ['rev-list', '--count', '@{u}..HEAD'], { allowFail: true });
      if (ahead.code === 0 && Number(ahead.stdout.trim()) > 0)
        throw new Error(`${ahead.stdout.trim()} local commit(s) are not pushed yet; push or remove them on the computer first, so only the approved change is pushed.`);
      const g = (args, opts) => {
        const r = git(cfg, ['-c', `core.hooksPath=${NO_HOOKS}`, ...args], opts);
        steps.push(`$ git ${args[0]}\n${r.output}`.trim());
        return r;
      };
      g(['add', '-A', '--', ...files]);
      const trailers = [`Requested-by: ${req.user_email ?? 'unknown'} via the web terminal`, `Approved-in: /admin?tab=terminal (request ${req.id})`].join('\n');
      g(['commit', '-q', '-m', req.commit_message, '-m', trailers, '--', ...files]);
      const sha = git(cfg, ['rev-parse', 'HEAD']).stdout.trim();
      try {
        g(['push'], { timeout: 180000 });
      } catch (e) {
        steps.push(e.output ?? e.message);
        git(cfg, ['reset', '-q', '--soft', 'HEAD~1'], { allowFail: true });
        git(cfg, ['reset', '-q', 'HEAD', '--', ...files], { allowFail: true });
        throw new Error('git push failed; the commit was undone and the changes are still on the computer.');
      }
      log(`  deploy ${req.id.slice(0, 8)} pushed ${sha.slice(0, 7)} to ${branch}`);
      await finish('deployed', [`Pushed ${sha.slice(0, 7)} to ${branch}.`, ...steps].join('\n\n'), sha);
    } catch (e) {
      log(`  deploy ${req.id.slice(0, 8)} failed: ${e.message}`);
      await finish('failed', [e.message, ...steps].join('\n\n'));
    }
  }
}

async function runShell(cfg, job, out) {
  const env = guardEnv({ FORCE_COLOR: '1', CLICOLOR_FORCE: '1', TERM: 'xterm-256color' });
  // the login profile (macOS path_helper) reorders PATH: put the gate's shims first again
  const r = await runProcess(cfg.shell.bin, ['-lc', `PATH=${JSON.stringify(join(GUARD, 'bin'))}:"$PATH"; export PATH\n${job.input}`], {
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
  const args = ['-p', job.input, '--output-format', 'stream-json', '--verbose', '--permission-mode', mode, '--append-system-prompt', GATE_NOTE];
  const deny = [
    ...BLOCKED_GIT.filter((c) => c !== 'config').map((c) => `Bash(git ${c}:*)`),
    ...BLOCKED_TOOLS.map((t) => `Bash(${t}:*)`),
    'Edit(.git/**)',
  ];
  // others: files only, no commands, and no project settings/hooks that could widen that
  if (!job.is_principal) deny.push('Bash', 'Edit(.claude/**)', 'Edit(.vscode/**)');
  args.push('--disallowedTools', ...deny);
  if (!job.is_principal) args.push('--setting-sources', 'user');
  if (cfg.claude.model) args.push('--model', cfg.claude.model);
  if (job.resume_session) args.push('--resume', job.resume_session);
  const meta = {};
  out.push('sys', `\x1b[2mClaude Code · ${mode}${job.resume_session ? ' · continuing' : ''}\x1b[0m\n`);
  const r = await runProcess(cfg.claude.bin, args, {
    cwd: cfg.workdir,
    env: guardEnv(),
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


// Antigravity has no headless mode: the task is opened in its agent panel on this computer and the
// agent works (and answers) inside the app. We report that it was delivered.
async function runAntigravity(cfg, job, out) {
  const ag = cfg.antigravity ?? {};
  if (!ag.bin) return { code: -1, error: 'Antigravity is not installed on this computer' };
  const mode = job.is_principal ? ag.mode ?? 'agent' : ag.othersMode ?? 'ask';
  out.push('sys', `\x1b[2mAntigravity · ${mode} · ${cfg.workdir}\x1b[0m\n`);
  const r = await runProcess(ag.bin, ['chat', '--mode', mode, '--reuse-window', `${job.input}\n\n(${GATE_NOTE.replace('automatically', 'when the user types submit')})`], {
    cwd: cfg.workdir,
    env: process.env,
    minutes: 2,
    out,
  });
  if (r.code === 0) {
    out.push('out', `Sent to the Antigravity agent on ${hostname()} (${mode} mode).\nThe agent works inside the Antigravity app; its reply appears there, not here.\nWhen it has finished editing, type: submit  (sends the changes to the admin for approval)\n`);
  }
  return r;
}

// `submit [message]` / `request-push` in /terminal: send everything changed in the project for approval
async function runSubmit(cfg, rpc, job, out) {
  const message = job.input === '-' ? null : job.input;
  const sub = await submitChanges(cfg, rpc, { jobId: job.id, prompt: message ?? '', message });
  if (!sub) out.push('out', 'No changes in the project; nothing to send for approval.\n');
  else reportSubmitted(out, sub);
  return { code: 0 };
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
  // files the job changes are sent for approval afterwards
  let before = null;
  if (job.kind === 'claude' || job.kind === 'shell') {
    try {
      before = snapshot(cfg);
    } catch (e) {
      log('  snapshot failed:', e.message);
    }
  }
  try {
    if (job.kind === 'submit') r = await runSubmit(cfg, rpc, job, out);
    else if (job.kind === 'claude') r = await runClaude(cfg, job, out);
    else if (job.kind === 'antigravity') r = await runAntigravity(cfg, job, out);
    else r = await runShell(cfg, job, out);
  } catch (e) {
    r = { code: -1, error: e.message };
  }
  state.current = null;
  if (r.killed === 'timeout') out.push('err', '\nTime limit reached; process stopped.\n');
  if (before) {
    try {
      const changed = changedSince(cfg, before);
      if (changed.length) {
        const message = job.kind === 'shell' ? commitMessageFor('', changed) : null;
        reportSubmitted(out, await submitChanges(cfg, rpc, { jobId: job.id, prompt: job.input, paths: changed, message }));
      }
    } catch (e) {
      log('  approval request failed:', e.message);
      out.push('err', `Could not create the approval request: ${e.message}\n`);
    }
  }
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
    antigravity: cfg.antigravity?.bin ? (() => { try { return 'Antigravity ' + execFileSync(cfg.antigravity.bin, ['--version'], { encoding: 'utf8' }).split('\n')[0].trim(); } catch { return 'installed'; } })() : null,
  };

  // Doorbell: new job → poll now; cancelled current job → kill now.
  client
    .channel(`bridge-${cfg.deviceId}`)
    .on('broadcast', { event: 'job' }, ({ payload }) => {
      if (payload?.status === 'cancelled' && state.current?.id === payload.job) state.current.out.onCancel?.();
      else state.wake?.();
    })
    .on('broadcast', { event: 'deploy' }, () => state.wake?.())
    .subscribe((s) => log(`realtime: ${s}`));

  log(`Zarwa bridge ${VERSION} · ${info.host} · ${cfg.workdir}`);
  let delay = 5000;
  for (;;) {
    try {
      const jobs = await rpc('bridge_poll', { p_info: info, p_reset: state.first });
      if (state.first) log('online — waiting for commands from /terminal');
      state.first = false;
      delay = 5000;
      await processDecisions(cfg, rpc);
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
  try {
    console.log(`antigravity  ${cfg.antigravity?.bin ? execFileSync(cfg.antigravity.bin, ['--version'], { encoding: 'utf8' }).split('\n')[0] : '✗ not found'} · ${cfg.antigravity?.mode} / others ${cfg.antigravity?.othersMode}`);
  } catch {
    console.log('antigravity  ✗ not working');
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

// `npm run bridge -- submit [message]`: approval request for the current changes, made on the computer itself
async function submitCli(message) {
  const cfg = loadConfig();
  const { rpc } = makeApi(cfg);
  const sub = await submitChanges(cfg, rpc, { prompt: message ?? '', message });
  if (!sub) console.log('No changes in the project.');
  else console.log(`Approval request ${sub.merged ? 'updated' : 'sent'} (${sub.paths.length} file(s): ${sub.paths.join(', ')}). Approve it in /admin?tab=terminal.`);
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'pair') pair(arg ?? '');
else if (cmd === 'submit') submitCli(process.argv.slice(3).join(' ').trim() || null).catch((e) => (console.error(e.message), process.exit(1)));
else if (cmd === 'check') check();
else if (cmd === 'install-service') installService();
else if (cmd === 'uninstall-service') uninstallService();
else if (!cmd || cmd === 'run') main();
else console.log('usage: npm run bridge [-- pair <code> | check | submit [message] | install-service | uninstall-service]');

