// "العقل المركزي": the admin-only AI orb. Idle in the corner; tap it and it flies to the centre,
// grows and talks. When it acts on the screen it shrinks to the left corner and keeps listening.
// It knows the platform's data (admin-brain Edge Function), runs scientific experiments and shows
// the results. Risky clicks wait for the admin's confirmation.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { X, Check, Mic, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CORE_SECTIONS } from '@/config/platformSections';
import { VoiceBrain, type BrainStatus } from './voiceBrain';
import { runExperiment, type ExperimentResult } from './experiments';
import ExperimentPanel from './ExperimentPanel';
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
  const level = useMotionValue(0);
  const pulse = useSpring(level, { stiffness: 300, damping: 18 });
  const auraScale = useTransform(pulse, (v) => 1 + v * 0.35);
  const coreScale = useTransform(pulse, (v) => 1 + Math.min(0.12, v * 0.12));

  // geometry for each mode
  const size = mode === 'center' ? Math.min(260, vp.w * 0.62) : mode === 'docked' ? 76 : 58;
  const pos = mode === 'center'
    ? { left: (vp.w - size) / 2, top: Math.max(24, (vp.h - size) / 2 - 60) }
    : { left: 20, top: vp.h - size - 20 };

  // the orb breathes with whoever is talking
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const b = brainRef.current;
      level.set(b ? b.level() : 0);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [level]);

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

  return (
    <div data-brain-ui dir="rtl">
      <AnimatePresence>
        {experiment && <ExperimentPanel key={experiment.id + experiment.params.map((p) => p.value).join()} res={experiment} onClose={() => setExperiment(null)} />}
      </AnimatePresence>

      {/* dim the page while she is in the centre */}
      <AnimatePresence>
        {mode === 'center' && (
          <motion.div
            key="veil"
            className="fixed inset-0 z-[9998] bg-background/55 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMode(live ? 'docked' : 'corner')}
          />
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="العقل المركزي"
        onClick={onOrbClick}
        className="fixed z-[9999] rounded-full outline-none"
        initial={false}
        animate={{ left: pos.left, top: pos.top, width: size, height: size }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.9 }}
      >
        {/* outer aura */}
        <motion.span
          className="absolute -inset-[18%] rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--brand-to) / .55), transparent 70%)', scale: auraScale }}
          animate={{ opacity: live ? [0.55, 0.9, 0.55] : 0.35 }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {/* rotating ring */}
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: 'conic-gradient(from 0deg, hsl(var(--brand-from)), hsl(var(--brand-to)), transparent 55%, hsl(var(--brand-from)))', padding: 3 }}
          animate={{ rotate: 360 }}
          transition={{ duration: status === 'thinking' || status === 'connecting' ? 1.4 : 6, repeat: Infinity, ease: 'linear' }}
        />
        {/* core */}
        <motion.span
          className="absolute inset-[6%] rounded-full shadow-2xl"
          style={{
            background: 'radial-gradient(circle at 35% 30%, hsl(0 0% 100% / .9), hsl(var(--brand-from)) 28%, hsl(var(--brand-to)) 62%, hsl(var(--brand-to) / .7))',
            scale: coreScale,
          }}
        />
        {/* swirling highlight */}
        <motion.span
          className="absolute inset-[18%] rounded-full mix-blend-screen opacity-60"
          style={{ background: 'conic-gradient(from 90deg, transparent, hsl(0 0% 100% / .55), transparent 40%)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        {mode === 'corner' && <Mic className="absolute inset-0 m-auto h-6 w-6 text-primary-foreground drop-shadow" />}
      </motion.button>

      {/* captions + controls under the orb */}
      <AnimatePresence>
        {mode === 'center' && (
          <motion.div
            key="panel"
            className="fixed z-[9999] left-1/2 w-[min(92vw,560px)] -translate-x-1/2 text-center"
            style={{ top: pos.top + size + 28 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
          >
            <p className="text-sm text-muted-foreground min-h-5">{error ?? (status === 'speaking' ? '' : label)}</p>
            {userLine && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">«{userLine}»</p>}
            {aiLine && <p className="mt-2 text-lg font-medium text-foreground leading-relaxed line-clamp-4">{aiLine}</p>}

            {pending && (
              <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-xl">
                <p className="text-sm text-foreground">تأكيد العملية: <b>{pending.label}</b></p>
                <p className="mt-1 text-xs text-muted-foreground">قل «نعم» أو «لا»، أو اضغط</p>
                <div className="mt-3 flex justify-center gap-3">
                  <button onClick={() => confirmPending(false)} className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                    <Check className="h-4 w-4" /> نفّذ
                  </button>
                  <button onClick={() => cancelPending(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-foreground">
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            <form
              className="mt-4 flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5"
              onSubmit={(e) => { e.preventDefault(); sendTyped(); }}
            >
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="أو اكتب طلبك هون…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button type="submit" aria-label="إرسال" className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>

            <button onClick={stop} className="mt-4 inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs text-muted-foreground">
              <X className="h-3.5 w-3.5" /> إنهاء
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* docked: what she is saying, beside the orb */}
      <AnimatePresence>
        {mode === 'docked' && aiLine && (status === 'speaking' || status === 'thinking') && (
          <motion.p
            key="docked-caption"
            className="fixed z-[9999] max-w-[min(70vw,360px)] rounded-2xl border border-border bg-card/95 px-3 py-2 text-sm text-foreground shadow-lg line-clamp-3"
            style={{ left: 20 + size + 12, bottom: 24 }}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
          >
            {status === 'thinking' ? 'أفكر…' : aiLine}
          </motion.p>
        )}
      </AnimatePresence>

      {/* docked: a small end button beside the orb */}
      {mode === 'docked' && live && (
        <button
          onClick={stop}
          aria-label="إنهاء"
          className="fixed z-[9999] grid h-6 w-6 place-items-center rounded-full border border-border bg-card text-muted-foreground"
          style={{ left: 20 + size - 14, top: vp.h - size - 26 }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
