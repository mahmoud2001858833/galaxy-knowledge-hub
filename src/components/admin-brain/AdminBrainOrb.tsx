// "العقل المركزي": the admin-only AI orb. Idle in the corner; tap it and it flies to the centre,
// grows and talks. When it acts on the screen it shrinks to the left corner and keeps listening.
// It knows the platform's data (admin-brain Edge Function), runs scientific experiments and shows
// the results. Risky clicks wait for the admin's confirmation.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, Send, Sparkles, Activity, MessagesSquare, FlaskConical, Compass, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CORE_SECTIONS } from '@/config/platformSections';
import { VoiceBrain, type BrainStatus } from './voiceBrain';
import { runExperiment, type ExperimentResult } from './experiments';
import ExperimentPanel from './ExperimentPanel';
import BrainVisual from './BrainVisual';
import { RISKY, click, findClickable, isNo, isYes, readScreen, scrollPage, typeInto } from './screenControl';

type Mode = 'corner' | 'center' | 'docked';

const ADMIN_PAGES = [
  { title: 'لوحة الإدارة', path: '/admin' },
  { title: 'مركز التحكم الأعلى', path: '/super-admin-control-hub' },
  { title: 'الطرفية (Terminal)', path: '/admin?tab=terminal' },
];

const allPages = () => [
  { title: 'الصفحة الرئيسية', path: '/' },
  ...CORE_SECTIONS.flatMap((s) => [{ title: s.title, path: s.path }, ...s.pages.map((p) => ({ title: p.title, path: p.path }))]),
  ...ADMIN_PAGES,
];

const STATUS_AR: Record<BrainStatus, string> = {
  connecting: 'لحظة…',
  listening: 'أسمعك… احكي',
  thinking: 'أفكر…',
  speaking: '',
  error: 'انقطع الاتصال',
  closed: '',
};

function useIsAdmin() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    const check = async (uid?: string) => {
      if (!uid) { if (alive) setOk(false); return; }
      const { data, error } = await supabase.rpc('is_platform_admin', { _user_id: uid });
      if (alive) setOk(!error && data === true);
    };
    supabase.auth.getSession().then(({ data }) => check(data.session?.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => check(s?.user?.id));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);
  return ok;
}

function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}

export default function AdminBrainOrb() {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  return <Orb />;
}

function Orb() {
  const navigate = useNavigate();
  const vp = useViewport();
  const [mode, setMode] = useState<Mode>('corner');
  const [status, setStatus] = useState<BrainStatus>('closed');
  const [userLine, setUserLine] = useState('');
  const [aiLine, setAiLine] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ label: string } | null>(null);
  const pendingRef = useRef<{ label: string; run: () => void } | null>(null);
  const brainRef = useRef<VoiceBrain | null>(null);
  const [experiment, setExperiment] = useState<ExperimentResult | null>(null);
  const [typed, setTyped] = useState('');
  const [arrivals, setArrivals] = useState(0); // bumps each time she lands in the centre (shockwave)
  const getLevel = useCallback(() => brainRef.current?.level() ?? 0, []);

  // geometry for each mode
  const size = mode === 'center' ? Math.min(230, vp.w * 0.5) : mode === 'docked' ? 72 : 58;
  const pos = mode === 'center'
    ? { left: (vp.w - size) / 2, top: Math.max(24, (vp.h - size) / 2 - 60) }
    : { left: 20, top: vp.h - size - 20 };

  useEffect(() => { if (mode === 'center') setArrivals((n) => n + 1); }, [mode]);

  const setPendingAction = (p: { label: string; run: () => void } | null) => {
    pendingRef.current = p;
    setPending(p ? { label: p.label } : null);
  };

  const confirmPending = useCallback((viaVoice: boolean) => {
    const p = pendingRef.current;
    if (!p) return;
    setPendingAction(null);
    setMode('docked');
    p.run();
    void brainRef.current?.ask(`[النظام] المدير أكّد${viaVoice ? ' بصوته' : ''}، وتم تنفيذ: ${p.label}. أخبريه باختصار.`);
  }, []);

  const cancelPending = useCallback((viaVoice: boolean) => {
    const p = pendingRef.current;
    if (!p) return;
    setPendingAction(null);
    void brainRef.current?.ask(`[النظام] المدير ألغى${viaVoice ? ' بصوته' : ''}: ${p.label}. لم يُنفّذ شيء.`);
  }, []);

  const onTool = useCallback(async (name: string, args: Record<string, unknown>) => {
    switch (name) {
      case 'navigate_to': {
        const path = String(args.path ?? '');
        if (!path.startsWith('/')) return { ok: false, error: 'invalid path' };
        setMode('docked');
        navigate(path);
        await new Promise((r) => setTimeout(r, 900));
        return { ok: true, now_on: window.location.pathname, screen: readScreen() };
      }
      case 'go_back':
        setMode('docked');
        navigate(-1);
        return { ok: true };
      case 'scroll_page':
        return scrollPage(String(args.direction ?? 'down'));
      case 'read_screen':
        return readScreen();
      case 'click_element': {
        const el = findClickable(String(args.text ?? ''));
        if (!el) return { ok: false, error: 'not found', available: readScreen().actions.slice(0, 40) };
        const label = ((el as HTMLElement).innerText || String(args.text)).replace(/\s+/g, ' ').trim().slice(0, 60);
        if (RISKY.test(label) || RISKY.test(String(args.text))) {
          setMode('center');
          setPendingAction({ label, run: () => { if (document.contains(el)) click(el); } });
          return { needs_confirmation: true, action: label };
        }
        setMode('docked');
        click(el);
        return { ok: true, clicked: label };
      }
      case 'type_into':
        setMode('docked');
        return typeInto(String(args.field ?? ''), String(args.text ?? ''), Boolean(args.submit));
      case 'run_experiment': {
        const res = runExperiment(String(args.experiment ?? ''), (args.params ?? {}) as Record<string, unknown>);
        if (!res) return { ok: false, error: 'unknown experiment' };
        setExperiment(res);
        setMode('docked');
        return { ok: true, shown_to_admin: true, title: res.title, equation: res.equation, params: res.params, results: res.metrics };
      }
      default:
        return { ok: false, error: `unknown tool ${name}` };
    }
  }, [navigate]);

  const start = useCallback(async () => {
    setError(null);
    setUserLine('');
    setAiLine('');
    const brain = new VoiceBrain({
      pages: allPages,
      onStatus: setStatus,
      onCaption: (who, text) => (who === 'user' ? setUserLine(text) : setAiLine(text)),
      onUserSaid: (t) => {
        if (!pendingRef.current) return false;
        if (isYes(t)) { confirmPending(true); return true; }
        if (isNo(t)) { cancelPending(true); return true; }
        return false;
      },
      onTool: (n, a) => onTool(n, a),
      onError: setError,
    });
    brainRef.current = brain;
    if (!brain.supported) setError('متصفحك ما بيدعم التعرف على الصوت؛ استعمل Chrome، أو اكتب تحت.');
    try {
      await brain.start();
    } catch (e) {
      console.warn('admin brain', e);
      setError('تعذّر تشغيل العقل المركزي. تأكد من الميكروفون وجرّب مرة ثانية.');
      setStatus('error');
    }
  }, [onTool, confirmPending, cancelPending]);

  const sendTyped = () => {
    const t = typed.trim();
    if (!t || !brainRef.current) return;
    setTyped('');
    setUserLine(t);
    if (pendingRef.current && isYes(t)) return confirmPending(false);
    if (pendingRef.current && isNo(t)) return cancelPending(false);
    void brainRef.current.ask(t);
  };

  const stop = useCallback(() => {
    brainRef.current?.close();
    brainRef.current = null;
    setPendingAction(null);
    setExperiment(null);
    setStatus('closed');
    setMode('corner');
  }, []);

  useEffect(() => () => { brainRef.current?.close(); }, []);

  const onOrbClick = () => {
    if (status === 'speaking') brainRef.current?.interrupt(); // tap to cut her off
    if (mode === 'corner') { setMode('center'); start(); }
    else if (mode === 'docked') setMode('center');
    else setMode('docked');
  };

  const live = status !== 'closed' && status !== 'error';
  const label = status === 'speaking' ? aiLine : STATUS_AR[status];

  // seconds spent thinking, so a slow answer never looks frozen
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    setSecs(0);
    if (status !== 'thinking') return;
    const t0 = Date.now();
    const id = window.setInterval(() => setSecs(Math.round((Date.now() - t0) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [status]);


  const suggest = (t: string) => {
    if (!brainRef.current) return;
    setUserLine(t);
    void brainRef.current.ask(t);
  };

  return (
    <div data-brain-ui dir="rtl">
      <AnimatePresence>
        {experiment && <ExperimentPanel key={experiment.id + experiment.params.map((p) => p.value).join()} res={experiment} onClose={() => setExperiment(null)} />}
      </AnimatePresence>

      {/* the stage: blurred page, a soft light behind her and drifting motes */}
      <AnimatePresence>
        {mode === 'center' && (
          <motion.div
            key="veil"
            className="fixed inset-0 z-[9998] overflow-hidden bg-background/60 backdrop-blur-xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.35 } }}
            onClick={() => setMode(live ? 'docked' : 'corner')}
          >
            <motion.div
              className="absolute rounded-full blur-3xl"
              style={{
                width: size * 3.2, height: size * 3.2, left: pos.left + size / 2 - size * 1.6, top: pos.top + size / 2 - size * 1.6,
                background: 'radial-gradient(circle, hsl(var(--brand-to) / .30), hsl(var(--brand-from) / .12) 45%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {MOTES.map((m, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.s, height: m.s, background: `hsl(var(${i % 2 ? '--brand-from' : '--brand-to'}) / .55)` }}
                animate={{ y: [0, -40 - m.s * 6, 0], opacity: [0, 0.9, 0] }}
                transition={{ duration: m.d, delay: m.delay, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* shockwave when she lands in the centre */}
      <AnimatePresence>
        {mode === 'center' && (
          <motion.span key={`wave-${arrivals}`} className="pointer-events-none fixed z-[9998] rounded-full border-2" aria-hidden
            style={{ left: pos.left, top: pos.top, width: size, height: size, borderColor: 'hsl(var(--brand-to) / .6)' }}
            initial={{ scale: 0.6, opacity: 0.9 }} animate={{ scale: 2.6, opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.1, delay: 0.45, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* the orb */}
      <motion.button
        type="button"
        aria-label="العقل المركزي"
        onClick={onOrbClick}
        className="group fixed z-[9999] rounded-full outline-none"
        initial={false}
        animate={{ left: pos.left, top: pos.top, width: size, height: size }}
        transition={{ type: 'spring', stiffness: 110, damping: 17, mass: 1 }}
        whileHover={{ scale: mode === 'center' ? 1.03 : 1.12 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* idle invitation: a ping every few seconds while she sleeps in the corner */}
        {mode === 'corner' && (
          <>
            <motion.span className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'hsl(var(--brand-to) / .7)' }}
              animate={{ scale: [1, 1.9], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.4, ease: 'easeOut' }} />
            <span className="pointer-events-none absolute bottom-full left-0 mb-3 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              العقل المركزي
            </span>
          </>
        )}
        <BrainVisual status={status} getLevel={getLevel} calm={mode === 'corner'} />
      </motion.button>

      {/* centre: status, captions, suggestions, input */}
      <AnimatePresence>
        {mode === 'center' && (
          <motion.div
            key="panel"
            className="fixed z-[9999] left-1/2 w-[min(92vw,600px)] -translate-x-1/2 text-center"
            style={{ top: pos.top + size + Math.min(110, size * 0.55) }}
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 0.35, duration: 0.5 } }}
            exit={{ opacity: 0, y: 16, filter: 'blur(6px)', transition: { duration: 0.25 } }}
          >
            <StatusChip status={status} secs={secs} />
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-destructive break-words">{error}</motion.p>}

            <AnimatePresence mode="popLayout">
              {userLine && (
                <motion.p key={`u-${userLine}`} className="mx-auto mt-4 w-fit max-w-full rounded-2xl rounded-bl-md border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground line-clamp-2"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}>
                  {userLine}
                </motion.p>
              )}
            </AnimatePresence>
            {aiLine && <Words key={aiLine} text={aiLine} />}

            {!userLine && live && status !== 'connecting' && (
              <motion.div className="mt-5 flex flex-wrap justify-center gap-2" initial="h" animate="s"
                variants={{ s: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}>
                {SUGGESTIONS.map(({ icon: Icon, text }) => (
                  <motion.button key={text} type="button" onClick={() => suggest(text)}
                    variants={{ h: { opacity: 0, y: 10, scale: 0.9 }, s: { opacity: 1, y: 0, scale: 1 } }}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-foreground shadow-sm hover:border-primary/50">
                    <Icon className="h-3.5 w-3.5 text-primary" /> {text}
                  </motion.button>
                ))}
              </motion.div>
            )}

            <AnimatePresence>
              {pending && (
                <motion.div className="mt-5 overflow-hidden rounded-3xl border border-destructive/40 bg-card p-4 shadow-2xl"
                  initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                    <motion.span animate={{ rotate: [0, -12, 12, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}>
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                    </motion.span>
                    تأكيد العملية: <b>{pending.label}</b>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">قل «نعم» أو «لا»، أو اضغط</p>
                  <div className="mt-3 flex justify-center gap-3">
                    <button onClick={() => confirmPending(false)} className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                      <Check className="h-4 w-4" /> نفّذ
                    </button>
                    <button onClick={() => cancelPending(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-foreground">إلغاء</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              className="relative mt-5 flex items-center gap-2 rounded-full border border-border bg-card/80 p-1.5 pr-4 shadow-lg backdrop-blur focus-within:border-primary/60"
              onSubmit={(e) => { e.preventDefault(); sendTyped(); }}
            >
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="أو اكتب طلبك هون…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
              <motion.button type="submit" aria-label="إرسال" whileTap={{ scale: 0.85 }} whileHover={{ rotate: -15 }}
                className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground">
                <Send className="h-3.5 w-3.5" />
              </motion.button>
            </form>

            <button onClick={stop} className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
              <X className="h-3.5 w-3.5" /> إنهاء
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* docked: what she is saying, beside the orb */}
      <AnimatePresence>
        {mode === 'docked' && live && (aiLine || status === 'thinking') && (status === 'speaking' || status === 'thinking') && (
          <motion.div key="docked-caption"
            className="fixed z-[9999] max-w-[min(70vw,380px)] rounded-2xl rounded-bl-md border border-border bg-card/95 px-3 py-2 text-sm text-foreground shadow-xl backdrop-blur"
            style={{ left: 20 + size + 14, bottom: 26 }}
            initial={{ opacity: 0, x: -12, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -12, scale: 0.9 }}>
            {status === 'thinking' ? <ThinkingDots /> : <span className="line-clamp-3">{aiLine}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'docked' && live && (
        <motion.button onClick={stop} aria-label="إنهاء" initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="fixed z-[9999] grid h-6 w-6 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow"
          style={{ left: 20 + size - 12, top: vp.h - size - 26 }}>
          <X className="h-3.5 w-3.5" />
        </motion.button>
      )}
    </div>
  );
}

const SUGGESTIONS = [
  { icon: Activity, text: 'شو صار بالمنصة اليوم؟' },
  { icon: MessagesSquare, text: 'شو آخر المحادثات؟' },
  { icon: FlaskConical, text: 'اعمليلي تجربة خلية خارصين ونحاس' },
  { icon: Compass, text: 'وديني على التجارب' },
  { icon: Sparkles, text: 'مين سجّل جديد هالأسبوع؟' },
];

// fixed pseudo-random motes so they don't jump on re-render
const MOTES = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 91.7 + n * 13.3) + 1) / 2);
  return { x: r(1) * 100, y: 20 + r(2) * 75, s: 2 + r(3) * 4, d: 5 + r(4) * 6, delay: r(5) * 5 };
});

/** her words appear one by one, like she is saying them */
function Words({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <motion.p className="mt-4 text-lg font-medium leading-relaxed text-foreground sm:text-xl" initial="h" animate="s"
      variants={{ s: { transition: { staggerChildren: Math.min(0.09, 2.4 / Math.max(1, words.length)) } } }}>
      {words.map((w, i) => (
        <motion.span key={i} className="inline-block"
          variants={{ h: { opacity: 0, y: 6, filter: 'blur(4px)' }, s: { opacity: 1, y: 0, filter: 'blur(0px)' } }}>
          {w}&nbsp;
        </motion.span>
      ))}
    </motion.p>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1" aria-label="أفكر">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }} />
      ))}
    </span>
  );
}

/** a small pill that shows what she is doing, each state with its own little animation */
function StatusChip({ status, secs }: { status: BrainStatus; secs: number }) {
  if (status === 'closed') return null;
  const text = status === 'thinking' && secs > 1 ? `${STATUS_AR.thinking} ${secs}ث` : status === 'speaking' ? 'أحكي…' : STATUS_AR[status];
  return (
    <motion.div layout className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
      {status === 'listening' && (
        <span className="relative flex h-2.5 w-2.5">
          <motion.span className="absolute inset-0 rounded-full bg-primary" animate={{ scale: [1, 2.2], opacity: [0.6, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <span className="relative h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
      )}
      {(status === 'thinking' || status === 'connecting') && (
        <motion.span className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
      )}
      {status === 'speaking' && (
        <span className="flex h-3 items-end gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.span key={i} className="w-0.5 rounded-full bg-primary" animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }} transition={{ duration: 0.9, delay: i * 0.12, repeat: Infinity }} />
          ))}
        </span>
      )}
      {status === 'error' && <span className="h-2.5 w-2.5 rounded-full bg-destructive" />}
      <AnimatePresence mode="wait">
        <motion.span key={text} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>{text}</motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
